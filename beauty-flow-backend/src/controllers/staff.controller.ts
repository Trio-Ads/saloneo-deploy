import { Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';
import { User, UserRole, SALON_ACCOUNT_FILTER } from '../models/User';
import { TeamMember } from '../models/Team';
import { Appointment } from '../models/Appointment';
import { LeaveAttachment, LeaveRequest, LEAVE_TYPES } from '../models/LeaveRequest';
import { AuthRequest, generateToken, generateRefreshToken } from '../middleware/auth';
import { can, normalizePermissions } from '../middleware/permissions';
import { emailService } from '../services/emailService';
import { pushTo } from '../services/push';
import { leaveBalance, leaveDays, plainHours, plannedMinutes, hitsLeave, validLeaveWindow, Window } from '../services/leave';
import { dateKey, nowIn } from '../services/availability';
import { logger } from '../utils/logger';

const INVITE_HOURS = 72;
const ACTIVE_STATUSES = ['scheduled', 'confirmed', 'in_progress', 'pending_payment', 'rescheduled'];
const LEAVE_LABELS: Record<string, string> = { annual: 'Congé annuel', sick: 'Maladie', personal: 'Personnel', other: 'Autre' };
const hash = (token: string) => crypto.createHash('sha256').update(token).digest('hex');
const frontend = () => process.env.FRONTEND_URL || 'http://localhost:3000';
const isId = (id: unknown): id is string => typeof id === 'string' && Types.ObjectId.isValid(id);
const fail = (res: Response, where: string, error: unknown) => {
  logger.error(`${where} error:`, error);
  res.status(500).json({ error: 'Server error' });
};
const fmtDay = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const period = (w: Window) =>
  (w.from === w.to ? fmtDay(w.from) : `du ${fmtDay(w.from)} au ${fmtDay(w.to)}`) + (w.start && w.end ? `, ${w.start}–${w.end}` : '');

/* ── access status (owner) ──────────────────────────────────── */

export type AccessStatus = 'none' | 'invited' | 'expired' | 'active' | 'revoked';
export function accessOf(u: any): { status: AccessStatus; email?: string; expiresAt?: Date; lastLogin?: Date } {
  if (!u) return { status: 'none' };
  const status: AccessStatus = u.isActive ? 'active'
    : u.invitation ? (new Date(u.invitation.expiresAt) > new Date() ? 'invited' : 'expired')
    : 'revoked';
  return { status, email: u.email, ...(u.invitation ? { expiresAt: u.invitation.expiresAt } : {}), ...(u.lastLogin ? { lastLogin: u.lastLogin } : {}) };
}

/** Staff logins of a salon by team member id. */
export async function accessByMember(salonId: string) {
  const users: any[] = await User.find({ salonId, role: UserRole.STAFF }).select('teamMemberId email isActive lastLogin +invitation').lean();
  return new Map(users.map((u) => [String(u.teamMemberId), accessOf(u)]));
}

/** What login/me return: for staff, the salon's name and settings plus their own identity and permissions. */
export async function accountPayload(user: any) {
  const base = {
    id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName,
    role: user.role || UserRole.OWNER, isAdmin: user.isAdmin, createdAt: user.createdAt,
  };
  if (user.role !== UserRole.STAFF) {
    return { ...base, establishmentName: user.establishmentName, address: user.address, phone: user.phone, settings: user.settings, subscription: user.subscription };
  }
  const [owner, member]: any[] = await Promise.all([
    User.findById(user.salonId).select('establishmentName settings subscription.plan slug logo').lean(),
    TeamMember.findById(user.teamMemberId).select('firstName lastName phone avatar color permissions').lean(),
  ]);
  return {
    ...base,
    establishmentName: owner?.establishmentName, settings: owner?.settings, subscription: { plan: owner?.subscription?.plan },
    salonId: user.salonId, teamMemberId: user.teamMemberId,
    phone: member?.phone, avatar: member?.avatar, color: member?.color,
    permissions: normalizePermissions(member?.permissions),
  };
}

/** POST /team/:id/access — invite (or re-invite) a team member to log in. Body: { email? } */
export const inviteMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const salonId = req.userId!;
    if (!isId(req.params.id)) { res.status(400).json({ error: 'Invalid id' }); return; }
    const member = await TeamMember.findOne({ _id: req.params.id, userId: salonId });
    if (!member) { res.status(404).json({ error: 'Team member not found' }); return; }
    if (!member.isActive) { res.status(400).json({ error: 'Member inactive', code: 'MEMBER_INACTIVE' }); return; }
    const email = String(req.body?.email || member.email || '').trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) { res.status(400).json({ error: 'Invalid email', code: 'INVALID_EMAIL' }); return; }

    let user: any = await User.findOne({ teamMemberId: member._id, salonId, role: UserRole.STAFF });
    const taken = await User.findOne({ email, ...(user ? { _id: { $ne: user._id } } : {}) }).select('_id').lean();
    if (taken) { res.status(409).json({ error: 'Email already used by another account', code: 'EMAIL_TAKEN' }); return; }

    const token = crypto.randomBytes(32).toString('hex');
    const invitation = { tokenHash: hash(token), expiresAt: new Date(Date.now() + INVITE_HOURS * 3600e3) };
    const owner: any = req.user;
    if (!user) {
      user = new User({
        role: UserRole.STAFF, email, salonId, teamMemberId: member._id,
        firstName: member.firstName, lastName: member.lastName,
        establishmentName: owner.establishmentName,
        // Unusable until the invitation sets a real one
        password: crypto.randomBytes(24).toString('hex'),
        isActive: false, isEmailVerified: false,
        settings: owner.settings,
        // No subscription of its own: keeps the login out of subscription crons and stats
        subscription: { isActive: false },
      });
    }
    // Re-inviting a revoked or expired login asks for a new password too
    user.email = email;
    user.isActive = false;
    user.invitation = invitation;
    user.refreshToken = undefined;
    await user.save();
    if (member.email !== email) await TeamMember.updateOne({ _id: member._id }, { $set: { email } });

    const link = `${frontend()}/invitation/${token}`;
    emailService.sendTemplateEmail('staff-invitation', email, {
      userName: member.firstName, salonName: owner.establishmentName, link, expires: `${INVITE_HOURS} heures`,
    } as any).catch((e) => logger.error('Staff invitation email failed', e));

    res.json({ access: accessOf({ ...user.toObject(), invitation }), link, phone: member.phone || null });
  } catch (error) { fail(res, 'Invite member', error); }
};

/** DELETE /team/:id/access — revoke the login: it can no longer log in, open sessions stop at their next request. */
export const revokeMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!isId(req.params.id)) { res.status(400).json({ error: 'Invalid id' }); return; }
    const user = await User.findOneAndUpdate(
      { teamMemberId: req.params.id, salonId: req.userId, role: UserRole.STAFF },
      { $set: { isActive: false }, $unset: { invitation: 1, refreshToken: 1 } },
      { new: true }
    ).lean();
    if (!user) { res.status(404).json({ error: 'No access to revoke' }); return; }
    res.json({ access: accessOf(user) });
  } catch (error) { fail(res, 'Revoke member', error); }
};

/* ── invitation (public) ────────────────────────────────────── */

async function findInvited(token: string) {
  if (!/^[a-f0-9]{64}$/.test(token)) return null;
  return User.findOne({ 'invitation.tokenHash': hash(token), 'invitation.expiresAt': { $gt: new Date() }, role: UserRole.STAFF }).select('+invitation');
}

/** GET /auth/invitation/:token */
export const getInvitation = async (req: Request, res: Response): Promise<void> => {
  try {
    const user: any = await findInvited(req.params.token);
    if (!user) { res.status(404).json({ error: 'Invalid or expired invitation', code: 'INVITATION_INVALID' }); return; }
    const owner: any = await User.findOne({ _id: user.salonId, isActive: true, ...SALON_ACCOUNT_FILTER }).select('establishmentName logo').lean();
    if (!owner) { res.status(404).json({ error: 'Invalid or expired invitation', code: 'INVITATION_INVALID' }); return; }
    res.json({ email: user.email, firstName: user.firstName, lastName: user.lastName, salonName: owner.establishmentName, logo: owner.logo || null });
  } catch (error) { fail(res, 'Get invitation', error); }
};

/** POST /auth/invitation/:token { firstName, lastName, password } → logged in */
export const acceptInvitation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, password } = req.body || {};
    if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
      res.status(400).json({ error: 'Password must be at least 8 characters', code: 'WEAK_PASSWORD' });
      return;
    }
    const user: any = await findInvited(req.params.token);
    if (!user) { res.status(404).json({ error: 'Invalid or expired invitation', code: 'INVITATION_INVALID' }); return; }
    const member = await TeamMember.findOne({ _id: user.teamMemberId, userId: user.salonId, isActive: true }).select('_id').lean();
    if (!member) { res.status(404).json({ error: 'Invalid or expired invitation', code: 'INVITATION_INVALID' }); return; }
    if (typeof firstName === 'string' && firstName.trim()) user.firstName = firstName.trim().slice(0, 60);
    if (typeof lastName === 'string' && lastName.trim()) user.lastName = lastName.trim().slice(0, 60);
    user.password = password;
    user.isActive = true;
    user.isEmailVerified = true;
    user.invitation = undefined;
    const id = user._id.toString();
    const token = generateToken(id);
    user.refreshToken = generateRefreshToken(id);
    user.lastLogin = new Date();
    await user.save();
    res.json({ token, refreshToken: user.refreshToken, user: await accountPayload(user) });
  } catch (error) { fail(res, 'Accept invitation', error); }
};

/* ── staff space ────────────────────────────────────────────── */

/** GET /staff/me */
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [user, unreadDecisions] = await Promise.all([
      accountPayload(req.account),
      LeaveRequest.countDocuments({ teamMemberId: req.actor!.teamMemberId, seenByStaff: false }),
    ]);
    res.json({ user, unreadDecisions });
  } catch (error) { fail(res, 'Staff me', error); }
};

/** PUT /staff/me { firstName?, lastName?, phone? } — the photo goes through /upload/team/:ownId/avatar */
export const updateMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, phone } = req.body || {};
    const set: Record<string, string> = {};
    if (typeof firstName === 'string' && firstName.trim()) set.firstName = firstName.trim().slice(0, 60);
    if (typeof lastName === 'string' && lastName.trim()) set.lastName = lastName.trim().slice(0, 60);
    if (typeof phone === 'string') {
      if (phone.trim() && !/^[+\d][\d\s.-]{5,24}$/.test(phone.trim())) { res.status(400).json({ error: 'Invalid phone', code: 'INVALID_PHONE' }); return; }
      set.phone = phone.trim();
    }
    await User.updateOne({ _id: req.actor!.id }, { $set: set });
    if (set.phone !== undefined) await TeamMember.updateOne({ _id: req.actor!.teamMemberId, userId: req.userId }, { $set: { phone: set.phone } });
    const account = await User.findById(req.actor!.id).select('-password');
    res.json({ user: await accountPayload(account) });
  } catch (error) { fail(res, 'Staff update me', error); }
};

/** PUT /staff/me/password { currentPassword, newPassword } */
export const updateMyPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (typeof newPassword !== 'string' || newPassword.length < 8 || newPassword.length > 128) {
      res.status(400).json({ error: 'Password must be at least 8 characters', code: 'WEAK_PASSWORD' });
      return;
    }
    const user = await User.findById(req.actor!.id).select('+password');
    if (!user || typeof currentPassword !== 'string' || !(await bcrypt.compare(currentPassword, user.password))) {
      res.status(400).json({ error: 'Current password is incorrect', code: 'WRONG_PASSWORD' });
      return;
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (error) { fail(res, 'Staff password', error); }
};

/** GET /staff/me/stats — this month, own appointments (needs canViewRevenue) */
export const getMyStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!can(req, 'viewRevenue')) { res.status(403).json({ error: 'Forbidden', code: 'STAFF_FORBIDDEN' }); return; }
    const owner: any = req.user;
    const today = nowIn(owner?.settings?.timezone || 'Africa/Algiers').date;
    const month = today.slice(0, 7);
    const from = new Date(`${month}-01T00:00:00.000Z`);
    const to = new Date(Date.UTC(+month.slice(0, 4), +month.slice(5, 7), 1));
    const [row] = await Appointment.aggregate([
      { $match: { userId: new Types.ObjectId(req.userId), stylistId: req.actor!.teamMemberId, date: { $gte: from, $lt: to } } },
      { $group: {
        _id: null,
        done: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        upcoming: { $sum: { $cond: [{ $in: ['$status', ACTIVE_STATUSES] }, 1, 0] } },
        revenue: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, { $ifNull: ['$price', 0] }, 0] } },
      } },
    ]);
    res.json({ month, done: row?.done || 0, upcoming: row?.upcoming || 0, revenue: row?.revenue || 0 });
  } catch (error) { fail(res, 'Staff stats', error); }
};

/* ── leave: shared ──────────────────────────────────────────── */

const windowOf = (l: any): Window => ({ from: l.from, to: l.to, ...(l.start && l.end ? { start: l.start, end: l.end } : {}) });

async function balanceOf(member: any, year: number) {
  const approved = await LeaveRequest.find({ teamMemberId: member._id, type: 'annual', status: 'approved', from: { $lte: `${year}-12-31` }, to: { $gte: `${year}-01-01` } }).lean();
  return { year, ...leaveBalance(member.leaveAllowance ?? 30, plainHours(member.workingHours), approved.map(windowOf), year) };
}

const leaveView = (l: any, hours: any, member?: any) => ({
  id: l._id, teamMemberId: l.teamMemberId, from: l.from, to: l.to, start: l.start, end: l.end,
  type: l.type, reason: l.reason, attachment: l.attachment, status: l.status,
  decision: l.decision ? { comment: l.decision.comment, at: l.decision.at } : undefined,
  days: leaveDays(plainHours(hours), windowOf(l)),
  createdAt: l.createdAt, seenByStaff: l.seenByStaff,
  ...(member ? { member: { id: member._id, firstName: member.firstName, lastName: member.lastName, avatar: member.avatar, color: member.color } } : {}),
});

/** Appointments of the member that the leave lands on (to reschedule or reassign; never cancelled automatically). */
async function conflictsOf(salonId: string, leave: any) {
  const w = windowOf(leave);
  const appts: any[] = await Appointment.find({
    userId: salonId, stylistId: String(leave.teamMemberId), status: { $in: ACTIVE_STATUSES },
    date: { $gte: new Date(`${w.from}T00:00:00.000Z`), $lte: new Date(`${w.to}T00:00:00.000Z`) },
  }).populate('serviceId', 'name').sort({ date: 1, startTime: 1 }).lean();
  return appts
    .filter((a) => hitsLeave(w, { date: dateKey(a.date), startTime: a.startTime, endTime: a.endTime, duration: a.duration }))
    .map((a) => ({
      id: a._id, date: dateKey(a.date), startTime: a.startTime, endTime: a.endTime, status: a.status,
      client: `${a.clientInfo?.firstName || ''} ${a.clientInfo?.lastName || ''}`.trim(),
      service: a.serviceId?.name || '',
    }));
}

/* ── leave: staff ───────────────────────────────────────────── */

/** GET /staff/leaves → { leaves, balance } */
export const myLeaves = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const member: any = await TeamMember.findById(req.actor!.teamMemberId).select('workingHours leaveAllowance').lean();
    const year = +nowIn((req.user as any)?.settings?.timezone || 'Africa/Algiers').date.slice(0, 4);
    const [leaves, balance] = await Promise.all([
      LeaveRequest.find({ teamMemberId: req.actor!.teamMemberId }).sort({ from: -1 }).limit(200).lean(),
      balanceOf(member, year),
    ]);
    res.json({ leaves: leaves.map((l) => leaveView(l, member?.workingHours)), balance });
  } catch (error) { fail(res, 'My leaves', error); }
};

/** POST /staff/leaves { from, to, start?, end?, type, reason?, attachment? } */
export const requestLeave = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { from, to, start, end, type, reason, attachment } = req.body || {};
    const w = { from, to: to || from, ...(start || end ? { start, end } : {}) };
    if (!validLeaveWindow(w)) { res.status(400).json({ error: 'Invalid dates', code: 'INVALID_DATES' }); return; }
    if (!LEAVE_TYPES.includes(type)) { res.status(400).json({ error: 'Invalid type', code: 'INVALID_TYPE' }); return; }
    if (reason !== undefined && (typeof reason !== 'string' || reason.length > 500)) { res.status(400).json({ error: 'Invalid reason' }); return; }
    // A certificate this member uploaded through /leave-attachments, never an arbitrary link or someone else's file
    const file: any = attachment?.id === undefined ? null
      : isId(attachment.id) ? await LeaveAttachment.findOne({ _id: attachment.id, teamMemberId: req.actor!.teamMemberId, userId: req.userId }).select('name').lean() : null;
    if (attachment?.id !== undefined && !file) {
      res.status(400).json({ error: 'Invalid attachment', code: 'INVALID_ATTACHMENT' });
      return;
    }
    const today = nowIn((req.user as any)?.settings?.timezone || 'Africa/Algiers').date;
    // Sick leave may be declared after the fact (a week back); the rest is planned ahead
    const earliest = type === 'sick' ? new Date(Date.parse(today) - 7 * 864e5).toISOString().slice(0, 10) : today;
    if (w.from < earliest) { res.status(400).json({ error: 'Dates in the past', code: 'PAST_DATES' }); return; }
    const overlapping = await LeaveRequest.exists({ teamMemberId: req.actor!.teamMemberId, status: { $in: ['pending', 'approved'] }, from: { $lte: w.to }, to: { $gte: w.from } });
    if (overlapping) { res.status(409).json({ error: 'Overlaps another request', code: 'LEAVE_OVERLAP' }); return; }
    const leave = await LeaveRequest.create({
      userId: req.userId, teamMemberId: req.actor!.teamMemberId, ...w, type,
      ...(reason ? { reason: reason.trim() } : {}),
      ...(file ? { attachment: { id: file._id, name: file.name } } : {}),
    });
    const member: any = await TeamMember.findById(req.actor!.teamMemberId).select('workingHours firstName lastName').lean();
    void pushTo([req.userId], {
      title: 'Demande de congé',
      body: `${`${member?.firstName || ''} ${member?.lastName || ''}`.trim()} : ${LEAVE_LABELS[type] || ''}, ${period(windowOf(leave))}`,
      url: '/team', tag: `leave-${leave._id}`,
    });
    res.status(201).json({ leave: leaveView(leave.toObject(), member?.workingHours) });
  } catch (error) { fail(res, 'Request leave', error); }
};

/** DELETE /staff/leaves/:id — withdraw an own request still pending */
export const cancelMyLeave = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!isId(req.params.id)) { res.status(400).json({ error: 'Invalid id' }); return; }
    const leave = await LeaveRequest.findOneAndUpdate(
      { _id: req.params.id, teamMemberId: req.actor!.teamMemberId, status: 'pending' },
      { $set: { status: 'cancelled' } },
      { new: true }
    ).lean();
    if (!leave) { res.status(404).json({ error: 'Leave not found or already decided' }); return; }
    res.json({ leave: leaveView(leave, undefined) });
  } catch (error) { fail(res, 'Cancel leave', error); }
};

/** POST /staff/leaves/seen — the staff member has read the decisions */
export const markDecisionsSeen = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await LeaveRequest.updateMany({ teamMemberId: req.actor!.teamMemberId, seenByStaff: false }, { $set: { seenByStaff: true } });
    res.json({ ok: true });
  } catch (error) { fail(res, 'Leaves seen', error); }
};

/* ── leave: owner ───────────────────────────────────────────── */

/** GET /team/leaves?status=pending|approved|refused|all&teamMemberId= → { leaves, pending } */
export const salonLeaves = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const status = String(req.query.status || 'all');
    const q: any = { userId: req.userId };
    if (status !== 'all') q.status = status;
    if (isId(req.query.teamMemberId)) q.teamMemberId = req.query.teamMemberId;
    const [leaves, pending] = await Promise.all([
      LeaveRequest.find(q).sort({ status: 1, from: -1 }).limit(300).lean(),
      LeaveRequest.countDocuments({ userId: req.userId, status: 'pending' }),
    ]);
    const members: any[] = await TeamMember.find({ _id: { $in: [...new Set(leaves.map((l) => String(l.teamMemberId)))] }, userId: req.userId })
      .select('firstName lastName avatar color workingHours').lean();
    const byId = new Map(members.map((m) => [String(m._id), m]));
    res.json({
      leaves: leaves.map((l) => { const m = byId.get(String(l.teamMemberId)); return leaveView(l, m?.workingHours, m); }),
      pending,
    });
  } catch (error) { fail(res, 'Salon leaves', error); }
};

/** POST /team/leaves/:id/decision { decision: 'approve'|'refuse', comment? } → { leave, conflicts } */
export const decideLeave = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { decision, comment } = req.body || {};
    if (!isId(req.params.id) || !['approve', 'refuse'].includes(decision)) { res.status(400).json({ error: 'Invalid decision' }); return; }
    if (comment !== undefined && (typeof comment !== 'string' || comment.length > 500)) { res.status(400).json({ error: 'Invalid comment' }); return; }
    const status = decision === 'approve' ? 'approved' : 'refused';
    // Atomic on 'pending': two clicks or two owners' tabs cannot decide twice
    const leave: any = await LeaveRequest.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId, status: 'pending' },
      { $set: { status, seenByStaff: false, decision: { comment: comment?.trim() || undefined, at: new Date(), by: req.actor!.id } } },
      { new: true }
    ).lean();
    if (!leave) { res.status(404).json({ error: 'Leave not found or already decided' }); return; }

    const member: any = await TeamMember.findOne({ _id: leave.teamMemberId, userId: req.userId });
    if (status === 'approved' && member) {
      member.absences.push({ ...windowOf(leave), reason: LEAVE_LABELS[leave.type], leaveId: leave._id });
      await member.save();
    }
    const conflicts = status === 'approved' ? await conflictsOf(req.userId!, leave) : [];

    const staff: any = await User.findOne({ teamMemberId: leave.teamMemberId, role: UserRole.STAFF, isActive: true }).select('email firstName').lean();
    if (staff) {
      emailService.sendTemplateEmail('leave-decision', staff.email, {
        userName: staff.firstName || member?.firstName, salonName: (req.user as any)?.establishmentName,
        approved: status === 'approved', decisionLabel: status === 'approved' ? 'acceptée' : 'refusée',
        typeLabel: LEAVE_LABELS[leave.type], period: period(windowOf(leave)), comment: leave.decision?.comment || '',
        link: `${frontend()}/my-leaves`,
      } as any).catch((e) => logger.error('Leave decision email failed', e));
      void pushTo([staff._id], {
        title: status === 'approved' ? 'Congé accepté' : 'Congé refusé',
        body: `${LEAVE_LABELS[leave.type]}, ${period(windowOf(leave))}${leave.decision?.comment ? ` : ${leave.decision.comment}` : ''}`,
        url: '/my-leaves', tag: `leave-${leave._id}`,
      });
    }
    res.json({ leave: leaveView(leave, member?.workingHours, member), conflicts });
  } catch (error) { fail(res, 'Decide leave', error); }
};

/** GET /team/leaves/:id/conflicts */
export const leaveConflicts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!isId(req.params.id)) { res.status(400).json({ error: 'Invalid id' }); return; }
    const leave = await LeaveRequest.findOne({ _id: req.params.id, userId: req.userId }).lean();
    if (!leave) { res.status(404).json({ error: 'Leave not found' }); return; }
    res.json({ conflicts: leave.status === 'approved' ? await conflictsOf(req.userId!, leave) : [] });
  } catch (error) { fail(res, 'Leave conflicts', error); }
};

/** GET /team/:id/hr → fiche employé, balance, absences history, planned hours this month */
export const getHr = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!isId(req.params.id)) { res.status(400).json({ error: 'Invalid id' }); return; }
    const member: any = await TeamMember.findOne({ _id: req.params.id, userId: req.userId }).lean();
    if (!member) { res.status(404).json({ error: 'Team member not found' }); return; }
    const today = nowIn((req.user as any)?.settings?.timezone || 'Africa/Algiers').date;
    const month = today.slice(0, 7);
    const [balance, leaves, access] = await Promise.all([
      balanceOf(member, +today.slice(0, 4)),
      LeaveRequest.find({ teamMemberId: member._id, userId: req.userId }).sort({ from: -1 }).limit(200).lean(),
      accessByMember(req.userId!),
    ]);
    const hours = plainHours(member.workingHours);
    res.json({
      hr: member.hr || {},
      leaveAllowance: member.leaveAllowance ?? 30,
      balance,
      plannedMinutesThisMonth: plannedMinutes(hours, member.absences || [], month),
      scheduledMinutesThisMonth: plannedMinutes(hours, [], month),
      month,
      absences: (member.absences || []).slice().sort((a: any, b: any) => (a.from < b.from ? 1 : -1)),
      leaves: leaves.map((l) => leaveView(l, member.workingHours)),
      access: access.get(String(member._id)) || { status: 'none' },
      permissions: normalizePermissions(member.permissions),
    });
  } catch (error) { fail(res, 'Get HR', error); }
};

/** PUT /team/:id/hr { hr: { startDate, contractType, emergencyContact: { name, phone }, notes }, leaveAllowance } */
export const updateHr = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!isId(req.params.id)) { res.status(400).json({ error: 'Invalid id' }); return; }
    const { hr = {}, leaveAllowance } = req.body || {};
    const set: Record<string, any> = {};
    const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : undefined);
    if (hr.startDate !== undefined) set['hr.startDate'] = hr.startDate && /^\d{4}-\d{2}-\d{2}$/.test(hr.startDate) ? hr.startDate : undefined;
    if (hr.contractType !== undefined) set['hr.contractType'] = ['cdi', 'cdd', 'apprentissage', 'freelance'].includes(hr.contractType) ? hr.contractType : undefined;
    if (hr.emergencyContact !== undefined) {
      set['hr.emergencyContact.name'] = str(hr.emergencyContact?.name, 80);
      set['hr.emergencyContact.phone'] = str(hr.emergencyContact?.phone, 30);
    }
    if (hr.notes !== undefined) set['hr.notes'] = str(hr.notes, 2000);
    if (leaveAllowance !== undefined) {
      const n = Number(leaveAllowance);
      if (!Number.isFinite(n) || n < 0 || n > 366) { res.status(400).json({ error: 'Invalid allowance' }); return; }
      set.leaveAllowance = Math.round(n * 2) / 2;
    }
    const unset = Object.fromEntries(Object.entries(set).filter(([, v]) => v === undefined || v === '').map(([k]) => [k, 1]));
    const $set = Object.fromEntries(Object.entries(set).filter(([k]) => !(k in unset)));
    const member = await TeamMember.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { ...(Object.keys($set).length ? { $set } : {}), ...(Object.keys(unset).length ? { $unset: unset } : {}) },
      { new: true, runValidators: true }
    ).lean();
    if (!member) { res.status(404).json({ error: 'Team member not found' }); return; }
    res.json({ hr: (member as any).hr || {}, leaveAllowance: (member as any).leaveAllowance ?? 30 });
  } catch (error) { fail(res, 'Update HR', error); }
};

/* ── leave certificates (private) ───────────────────────────── */

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/** POST /leave-attachments (multipart "file") — a staff member's certificate, stored privately → { attachment: { id, name } } */
export const uploadLeaveAttachment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.actor?.role !== UserRole.STAFF) { res.status(403).json({ error: 'Forbidden', code: 'ROLE_FORBIDDEN' }); return; }
    const f = req.file;
    if (!f || !IMAGE_TYPES.includes(f.mimetype)) { res.status(400).json({ error: 'An image is required', code: 'INVALID_FILE' }); return; }
    const doc = await LeaveAttachment.create({
      userId: req.userId, teamMemberId: req.actor.teamMemberId,
      name: (f.originalname || 'certificat').slice(0, 200), mimeType: f.mimetype, size: f.size, data: f.buffer,
    });
    res.status(201).json({ attachment: { id: doc._id, name: doc.name } });
  } catch (error) { fail(res, 'Upload leave attachment', error); }
};

/** Who may open a certificate: the owner of its salon, or the staff member it belongs to. */
export const canOpenAttachment = (actor: { role: string; teamMemberId?: string } | undefined, salonId: string | undefined, file: { userId: unknown; teamMemberId: unknown }) =>
  !!actor && String(file.userId) === salonId &&
  (actor.role === UserRole.STAFF ? String(file.teamMemberId) === actor.teamMemberId : actor.role === UserRole.OWNER || actor.role === UserRole.ADMIN);

/** GET /leave-attachments/:id — streamed with no-store caching, never cached by a CDN or listed anywhere */
export const getLeaveAttachment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!isId(req.params.id)) { res.status(404).json({ error: 'Not found' }); return; }
    const file: any = await LeaveAttachment.findById(req.params.id).select('+data').lean();
    // Same 404 for "not yours" and "does not exist": ids are not probed
    if (!file || !canOpenAttachment(req.actor, req.userId, file)) { res.status(404).json({ error: 'Not found' }); return; }
    res.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': `inline; filename="certificat.${file.mimeType.split('/')[1]}"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    res.send(Buffer.from(file.data.buffer ?? file.data));
  } catch (error) { fail(res, 'Get leave attachment', error); }
};
