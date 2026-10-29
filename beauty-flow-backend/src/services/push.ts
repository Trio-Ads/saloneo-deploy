/**
 * Web push for the installed app (PWA): new bookings, cancellations, leave requests, marketplace orders.
 * VAPID keys come from VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY, or are generated once and kept in Mongo
 * (`appsecrets`), so a deploy without env changes still works and subscriptions survive restarts.
 */
import mongoose, { Schema, Types } from 'mongoose';
import webpush from 'web-push';
import { User, UserRole } from '../models/User';
import { logger } from '../utils/logger';

export interface PushPayload { title: string; body: string; url: string; tag?: string }

const PushSubscription = mongoose.model('PushSubscription', new Schema({
  accountId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true }, // the account that logged in (owner, staff or supplier)
  endpoint: { type: String, required: true, unique: true },
  keys: { p256dh: { type: String, required: true }, auth: { type: String, required: true } },
}, { timestamps: true }));

let keys: Promise<{ publicKey: string; privateKey: string }> | null = null;
export function vapidKeys() {
  keys ??= (async () => {
    if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
      return { publicKey: process.env.VAPID_PUBLIC_KEY, privateKey: process.env.VAPID_PRIVATE_KEY };
    }
    const col = mongoose.connection.collection<{ _id: string; publicKey: string; privateKey: string }>('appsecrets');
    const found = await col.findOne({ _id: 'vapid' });
    if (found) return found;
    try {
      await col.insertOne({ _id: 'vapid', ...webpush.generateVAPIDKeys() });
    } catch (e: any) {
      if (e?.code !== 11000) throw e; // another process generated them first
    }
    return (await col.findOne({ _id: 'vapid' }))!;
  })().then((k) => {
    webpush.setVapidDetails(`mailto:${process.env.SUPPORT_EMAIL || 'contact@saloneo.app'}`, k.publicKey, k.privateKey);
    return { publicKey: k.publicKey, privateKey: k.privateKey };
  }).catch((e) => { keys = null; throw e; });
  return keys;
}

export const isPushSubscription = (s: any): s is { endpoint: string; keys: { p256dh: string; auth: string } } =>
  typeof s?.endpoint === 'string' && /^https:\/\//.test(s.endpoint) && s.endpoint.length < 1000
  && typeof s.keys?.p256dh === 'string' && typeof s.keys?.auth === 'string';

export async function subscribe(accountId: string, sub: { endpoint: string; keys: { p256dh: string; auth: string } }) {
  // One device = one endpoint: re-subscribing from another account on the same phone moves it
  await PushSubscription.updateOne(
    { endpoint: sub.endpoint },
    { $set: { accountId, keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth } } },
    { upsert: true }
  );
}

export const unsubscribe = (accountId: string, endpoint: string) => PushSubscription.deleteOne({ accountId, endpoint });

/** Fire and forget: never throws, drops subscriptions the browser has revoked. */
export async function pushTo(accountIds: (string | Types.ObjectId | undefined | null)[], payload: PushPayload): Promise<void> {
  try {
    const ids = [...new Set(accountIds.filter(Boolean).map(String))];
    if (!ids.length) return;
    const subs = await PushSubscription.find({ accountId: { $in: ids } }).lean();
    if (!subs.length) return;
    await vapidKeys();
    const body = JSON.stringify(payload);
    await Promise.all(subs.map((s: any) => webpush.sendNotification({ endpoint: s.endpoint, keys: s.keys }, body, { TTL: 24 * 3600 })
      .catch(async (e: any) => {
        if (e?.statusCode === 404 || e?.statusCode === 410) await PushSubscription.deleteOne({ _id: s._id });
        else logger.warn(`Push failed (${e?.statusCode || e?.message})`);
      })));
  } catch (e) {
    logger.error('Push error', e);
  }
}

/** An appointment event: the salon owner, plus the staff account of the member concerned, sent to their own planning. */
export async function pushSalon(ownerId: unknown, teamMemberId: unknown, payload: PushPayload): Promise<void> {
  const staff: any = teamMemberId
    ? await User.findOne({ salonId: ownerId, teamMemberId, role: UserRole.STAFF, isActive: true }).select('_id').lean().catch(() => null)
    : null;
  await Promise.all([
    pushTo([String(ownerId)], payload),
    staff ? pushTo([staff._id], { ...payload, url: '/my-planning' }) : null,
  ]);
}

const when = (a: any) =>
  `${new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(a.date))} à ${a.startTime}`;

/** A client cancelled or moved her appointment from her link. */
export const pushClientChange = (a: any, kind: 'cancelled' | 'moved') => pushSalon(a.userId, a.stylistId, {
  title: kind === 'cancelled' ? 'Rendez-vous annulé' : 'Rendez-vous déplacé',
  body: `${`${a.clientInfo?.firstName || ''} ${a.clientInfo?.lastName || ''}`.trim()} ${kind === 'cancelled' ? 'a annulé le rendez-vous du' : 'a déplacé son rendez-vous au'} ${when(a)}`,
  url: '/appointments', tag: `appt-${a._id}`,
});
