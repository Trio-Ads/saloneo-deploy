import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth';
import { WaitlistEntry, IWaitlistEntry } from '../models/Waitlist';
import { Service } from '../models/Service';
import { User } from '../models/User';
import { findSalonBySlug } from '../services/salonLookup';
import {
  PUBLIC_SERVICE, REASON_MESSAGES, canDo, dayNum, isDateKey, keyOf, loadContext, nowIn, resolveStylistId, staffName,
} from '../services/availability';
import {
  MAX_DAYS, MAX_ENTRIES, OPEN, currentOffer, findDuplicate, freeTimes, manageLink, normalizeWaitlistSettings,
  offerLink, offerSlot, offerStillFree, onCapacityFreed, phoneKey, recheckSalon, removeEntry, salonSlug,
} from '../services/waitlist';
import { logger } from '../utils/logger';

const fail = (res: Response, status: number, code: string, error: string) => res.status(status).json({ code, error });

/** What a client sees of their entry (manage page) — no other client's data. */
async function publicView(entry: IWaitlistEntry, salon?: any) {
  salon = salon || await User.findById(entry.userId).select('establishmentName firstName lastName slug theme').lean();
  const [service, stylist]: any[] = await Promise.all([
    Service.findById(entry.serviceId).select('name duration').lean(),
    entry.stylistId ? staffName(entry.userId, entry.stylistId) : undefined,
  ]);
  const o = currentOffer(entry);
  return {
    status: entry.status,
    salonName: salon?.establishmentName,
    slug: salon ? salonSlug(salon) : undefined,
    theme: salon?.theme,
    serviceId: entry.serviceId,
    serviceName: service?.name,
    stylistName: stylist,
    from: entry.from,
    to: entry.to,
    timeOfDay: entry.timeOfDay,
    client: { firstName: entry.client.firstName },
    offer: o && +o.expiresAt > Date.now() ? { date: o.slot.date, time: o.slot.time, expiresAt: o.expiresAt, url: offerLink(salon, o.token) } : undefined,
  };
}

/* ── public ──────────────────────────────────────────────────── */

// POST /waitlist/public/:slug — join (or update the same request)
export const joinWaitlist = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return; }
    const salon: any = await findSalonBySlug(req.params.slug, 'establishmentName firstName lastName slug settings waitlist');
    if (!salon) { fail(res, 404, 'NOT_FOUND', 'Salon not found'); return; }
    if (!normalizeWaitlistSettings(salon.waitlist).enabled) { fail(res, 403, 'WAITLIST_DISABLED', "Ce salon n'utilise pas la liste d'attente"); return; }

    const { serviceId, from, to, timeOfDay, client, lang } = req.body;
    const service = Types.ObjectId.isValid(serviceId) ? await Service.findOne({ _id: serviceId, userId: salon._id, ...PUBLIC_SERVICE }).lean() : null;
    if (!service) { fail(res, 404, 'SERVICE_UNAVAILABLE', REASON_MESSAGES.SERVICE_UNAVAILABLE); return; }

    const today = nowIn(salon.settings?.timezone || 'Africa/Algiers').date;
    const loaded = await loadContext(salon._id, String(service._id), { from: today, to: today });
    const horizon = keyOf(dayNum(today) + (loaded?.ctx.service.horizonDays ?? 60));
    if (!isDateKey(from) || !isDateKey(to) || from < today || to < from || dayNum(to) - dayNum(from) + 1 > MAX_DAYS || to > horizon) {
      fail(res, 400, 'INVALID_RANGE', 'Période invalide');
      return;
    }
    const stylistId = resolveStylistId(req.body.stylistId);
    if (stylistId && !loaded?.ctx.staff.some((m) => m.id === stylistId && canDo(m, String(service._id)))) {
      fail(res, 400, 'STAFF_UNAVAILABLE', REASON_MESSAGES.STAFF_UNAVAILABLE);
      return;
    }
    const key = phoneKey(client.phone);
    if (key.length < 9) { fail(res, 400, 'INVALID_PHONE', 'Numéro de téléphone invalide'); return; }

    const open = await WaitlistEntry.find({ userId: salon._id, phoneKey: key, status: { $in: OPEN } });
    const fields = {
      serviceId: String(service._id), stylistId, from, to, timeOfDay, phoneKey: key, lang,
      client: { firstName: client.firstName, lastName: client.lastName || '', phone: client.phone, email: client.email || undefined },
    };
    let entry = findDuplicate(open, fields);
    const merged = !!entry;
    if (entry) {
      // Same request again: updated in place, keeps its place in the queue (and a running offer)
      entry.set(fields);
      await entry.save();
    } else {
      if (open.length >= MAX_ENTRIES) { fail(res, 429, 'WAITLIST_LIMIT', "Vous êtes déjà sur 3 listes d'attente de ce salon"); return; }
      entry = await WaitlistEntry.create({ ...fields, userId: salon._id });
    }

    // A matching slot may already be free: earlier entries first, then this one
    for (let d = dayNum(from); d <= dayNum(to) && entry.status === 'active'; d++) {
      await onCapacityFreed(salon._id, keyOf(d));
      entry = (await WaitlistEntry.findById(entry._id))!;
    }

    res.status(merged ? 200 : 201).json({ merged, token: entry.token, manageUrl: manageLink(entry.token), entry: await publicView(entry, salon) });
  } catch (error) {
    logger.error('Join waitlist error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /waitlist/public/entry/:token — manage page
export const getEntryByToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const entry = await WaitlistEntry.findOne({ token: String(req.params.token) });
    if (!entry) { fail(res, 404, 'NOT_FOUND', 'Lien invalide'); return; }
    res.json({ entry: await publicView(entry) });
  } catch (error) {
    logger.error('Get waitlist entry error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /waitlist/public/entry/:token/cancel — leave the list
export const leaveByToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const entry = await WaitlistEntry.findOne({ token: String(req.params.token) });
    if (!entry) { fail(res, 404, 'NOT_FOUND', 'Lien invalide'); return; }
    if (OPEN.includes(entry.status)) await removeEntry(entry);
    res.json({ entry: await publicView(entry) });
  } catch (error) {
    logger.error('Leave waitlist error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /waitlist/public/offer/:token — the booking modal opens on this slot when it is still valid
export const getOffer = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = String(req.params.token);
    const entry = await WaitlistEntry.findOne({ 'offers.token': token });
    const offer = entry?.offers.find((o) => o.token === token);
    if (!entry || !offer) { fail(res, 404, 'NOT_FOUND', 'Lien invalide'); return; }
    const live = currentOffer(entry)?.token === token && +offer.expiresAt > Date.now();
    const reason = live
      ? ((await offerStillFree(entry, offer)) ? null : 'taken')
      : entry.status === 'booked' ? 'booked' : offer.outcome === 'taken' ? 'taken' : entry.status === 'cancelled' ? 'cancelled' : 'expired';
    res.json({
      valid: !reason,
      reason,
      serviceId: entry.serviceId,
      stylistId: offer.slot.stylistId,
      date: offer.slot.date,
      time: offer.slot.time,
      expiresAt: offer.expiresAt,
      held: offer.held,
      manageToken: entry.token,
      client: reason ? undefined : entry.client,
    });
  } catch (error) {
    logger.error('Get waitlist offer error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/* ── dashboard ───────────────────────────────────────────────── */

const SETTINGS_FIELDS = 'waitlist';

// GET /waitlist — open entries + the last 30 days of closed ones, with names resolved
export const listEntries = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const since = new Date(Date.now() - 30 * 864e5);
    const entries = await WaitlistEntry.find({ userId: req.userId, $or: [{ status: { $in: OPEN } }, { updatedAt: { $gte: since } }] })
      .sort({ createdAt: 1 }).limit(300).lean();
    const services: any[] = await Service.find({ _id: { $in: [...new Set(entries.map((e) => e.serviceId))].filter((id) => Types.ObjectId.isValid(id)) } }).select('name duration').lean();
    const names = new Map<string, string | undefined>();
    for (const id of new Set(entries.flatMap((e) => [e.stylistId, ...e.offers.map((o) => o.slot.stylistId)]).filter(Boolean) as string[])) {
      names.set(id, await staffName(req.userId, id));
    }
    const serviceOf = new Map(services.map((s) => [String(s._id), s]));
    res.json({
      count: entries.filter((e) => OPEN.includes(e.status)).length,
      entries: entries.map((e) => ({
        id: e._id,
        status: e.status,
        serviceId: e.serviceId,
        serviceName: serviceOf.get(e.serviceId)?.name,
        stylistId: e.stylistId,
        stylistName: e.stylistId ? names.get(e.stylistId) : undefined,
        from: e.from,
        to: e.to,
        timeOfDay: e.timeOfDay,
        client: e.client,
        createdAt: e.createdAt,
        offers: e.offers.map((o) => ({
          date: o.slot.date, time: o.slot.time, stylistName: names.get(o.slot.stylistId),
          sentAt: o.sentAt, expiresAt: o.expiresAt, outcome: o.outcome, manual: o.manual, channels: o.channels,
        })),
      })),
    });
  } catch (error) {
    logger.error('List waitlist error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const ownEntry = (req: AuthRequest) => (Types.ObjectId.isValid(req.params.id) ? WaitlistEntry.findOne({ _id: req.params.id, userId: req.userId }) : null);

// GET /waitlist/:id/slots?date= — free times to offer by hand
export const entrySlots = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const entry = await ownEntry(req);
    const date = String(req.query.date || '');
    if (!entry || !isDateKey(date)) { fail(res, 404, 'NOT_FOUND', 'Entry not found'); return; }
    res.json({ date, times: await freeTimes(entry, date) });
  } catch (error) {
    logger.error('Waitlist slots error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /waitlist/:id/offer { date, time, stylistId? } — offer this exact slot now
export const offerManually = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const entry = await ownEntry(req);
    if (!entry || !OPEN.includes(entry.status)) { fail(res, 404, 'NOT_FOUND', 'Entry not found'); return; }
    const { date, time } = req.body || {};
    if (!isDateKey(date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(String(time))) { fail(res, 400, 'OUTSIDE_HOURS', REASON_MESSAGES.OUTSIDE_HOURS); return; }
    const { offer, reason } = await offerSlot(entry, date, time, resolveStylistId(req.body.stylistId));
    if (reason) { res.status(409).json({ code: reason, error: (REASON_MESSAGES as any)[reason] || reason }); return; }
    res.json({ offer: { date: offer!.slot.date, time: offer!.slot.time, expiresAt: offer!.expiresAt, channels: offer!.channels } });
  } catch (error) {
    logger.error('Waitlist manual offer error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE /waitlist/:id — remove from the list
export const removeById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const entry = await ownEntry(req);
    if (!entry) { fail(res, 404, 'NOT_FOUND', 'Entry not found'); return; }
    if (OPEN.includes(entry.status)) await removeEntry(entry);
    res.json({ ok: true });
  } catch (error) {
    logger.error('Remove waitlist entry error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET / PUT /waitlist/settings { enabled, offerMinutes, holdSlot }
export const getSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user: any = await User.findById(req.userId).select(SETTINGS_FIELDS).lean();
    res.json(normalizeWaitlistSettings(user?.waitlist));
  } catch (error) {
    logger.error('Get waitlist settings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const waitlist = normalizeWaitlistSettings(req.body);
    const user: any = await User.findByIdAndUpdate(req.userId, { $set: { waitlist } }, { new: true }).select(SETTINGS_FIELDS).lean();
    if (waitlist.enabled) void recheckSalon(req.userId!);
    res.json(normalizeWaitlistSettings(user?.waitlist));
  } catch (error) {
    logger.error('Update waitlist settings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
