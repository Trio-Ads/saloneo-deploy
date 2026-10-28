/**
 * One-time data migrations, run at startup (no shell access on the VPS).
 * Each id runs once: inserting { _id: id } into `migrations` is the lock (unique _id), so two processes
 * starting together cannot both run it. A failed run removes its record and is retried on next start.
 */
import mongoose from 'mongoose';
import { Service } from '../models/Service';
import { logger } from './logger';

export async function runOnce(id: string, fn: () => Promise<string | void>): Promise<boolean> {
  const col = mongoose.connection.collection<{ _id: string; startedAt: Date; doneAt?: Date; result?: string }>('migrations');
  try {
    await col.insertOne({ _id: id, startedAt: new Date() });
  } catch (e: any) {
    if (e?.code === 11000) return false; // already done, or running in another process
    throw e;
  }
  try {
    const result = (await fn()) || '';
    await col.updateOne({ _id: id }, { $set: { doneAt: new Date(), result } });
    logger.info(`Migration ${id} done ${result}`);
    return true;
  } catch (e) {
    await col.deleteOne({ _id: id });
    throw e;
  }
}

// The "Disponible en ligne" toggle never saved before this fix shipped: every service then had isOnline=false
// without the owner choosing it. Switch those on; leave alone services edited since (a deliberate "off").
export const ONLINE_FIX_CUTOFF = new Date('2026-10-28T15:20:00Z');
export const ONLINE_FIX_FILTER = {
  'settings.isOnline': { $ne: true },
  $or: [{ updatedAt: { $exists: false } }, { updatedAt: { $lt: ONLINE_FIX_CUTOFF } }],
};
/** Same rule as ONLINE_FIX_FILTER, for tests. */
export const needsOnlineFix = (s: { settings?: { isOnline?: boolean }; updatedAt?: Date }) =>
  s.settings?.isOnline !== true && (!s.updatedAt || s.updatedAt < ONLINE_FIX_CUTOFF);

export async function runMigrations(): Promise<void> {
  try {
    await runOnce('2026-10-28-services-online', async () => {
      // timestamps: false — the fix must not look like an owner edit
      const r = await Service.updateMany(ONLINE_FIX_FILTER, { $set: { 'settings.isOnline': true } }, { timestamps: false });
      return `services switched online: ${r.modifiedCount}`;
    });
  } catch (error) {
    logger.error('Migrations failed (will retry on next start):', error);
  }
}
