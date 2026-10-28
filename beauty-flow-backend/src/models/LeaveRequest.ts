import { Schema, model, Document, Types } from 'mongoose';

export const LEAVE_TYPES = ['annual', 'sick', 'personal', 'other'] as const;
export type LeaveType = typeof LEAVE_TYPES[number];
export const LEAVE_STATUSES = ['pending', 'approved', 'refused', 'cancelled'] as const;
export type LeaveStatus = typeof LEAVE_STATUSES[number];

/** A staff member's leave request (congé). Approved → a TeamMember absence the availability engine honours. */
export interface ILeaveRequest extends Document {
  /** Salon (owner user id) */
  userId: Types.ObjectId;
  teamMemberId: Types.ObjectId;
  /** Inclusive 'YYYY-MM-DD' days; start/end = optional same-day-every-day hour window */
  from: string;
  to: string;
  start?: string;
  end?: string;
  type: LeaveType;
  reason?: string;
  /** Private certificate (LeaveAttachment), served only to the salon owner and this member */
  attachment?: { id: Types.ObjectId; name?: string };
  status: LeaveStatus;
  decision?: { comment?: string; at: Date; by: Types.ObjectId };
  /** Staff has seen the owner's decision (in-app notification) */
  seenByStaff: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const leaveRequestSchema = new Schema<ILeaveRequest>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    teamMemberId: { type: Schema.Types.ObjectId, ref: 'TeamMember', required: true },
    from: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    to: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    start: { type: String, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
    end: { type: String, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
    type: { type: String, enum: LEAVE_TYPES, required: true },
    reason: { type: String, trim: true, maxlength: 500 },
    attachment: {
      type: new Schema({ id: { type: Schema.Types.ObjectId, ref: 'LeaveAttachment', required: true }, name: { type: String, maxlength: 200 } }, { _id: false }),
    },
    status: { type: String, enum: LEAVE_STATUSES, default: 'pending' },
    decision: {
      type: new Schema({
        comment: { type: String, trim: true, maxlength: 500 },
        at: { type: Date, required: true },
        by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      }, { _id: false }),
    },
    seenByStaff: { type: Boolean, default: true },
  },
  { timestamps: true }
);

leaveRequestSchema.index({ userId: 1, status: 1, from: 1 });
leaveRequestSchema.index({ teamMemberId: 1, from: -1 });

export const LeaveRequest = model<ILeaveRequest>('LeaveRequest', leaveRequestSchema);

/**
 * A leave certificate (health data). Kept in the database, never in the public /uploads store or a CDN:
 * only GET /api/leave-attachments/:id serves it, to the salon owner and the member who uploaded it.
 */
export interface ILeaveAttachment extends Document {
  userId: Types.ObjectId;
  teamMemberId: Types.ObjectId;
  name: string;
  mimeType: string;
  size: number;
  data: Buffer;
  createdAt: Date;
}

const leaveAttachmentSchema = new Schema<ILeaveAttachment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    teamMemberId: { type: Schema.Types.ObjectId, ref: 'TeamMember', required: true, index: true },
    name: { type: String, maxlength: 200, default: 'certificat' },
    mimeType: { type: String, required: true, enum: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] },
    size: { type: Number, required: true, max: 5 * 1024 * 1024 },
    data: { type: Buffer, required: true, select: false },
  },
  { timestamps: true }
);

export const LeaveAttachment = model<ILeaveAttachment>('LeaveAttachment', leaveAttachmentSchema);
