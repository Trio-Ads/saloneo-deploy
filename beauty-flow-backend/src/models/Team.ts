import mongoose, { Document, Schema } from 'mongoose';

export interface StaffPermissions {
  /** own: sees and acts only on their own appointments */
  planning: 'own' | 'all';
  canCreateAppointments: boolean;
  /** none | own appointments only | all (within what planning shows) */
  canEditAppointments: 'none' | 'own' | 'all';
  canViewClients: boolean;
  canViewClientContacts: boolean;
  canViewRevenue: boolean;
  canManageServices: boolean;
  canManageProducts: boolean;
}

export const DEFAULT_STAFF_PERMISSIONS: StaffPermissions = {
  planning: 'own',
  canCreateAppointments: true,
  canEditAppointments: 'own',
  canViewClients: true,
  canViewClientContacts: false,
  canViewRevenue: false,
  canManageServices: false,
  canManageProducts: false,
};

export interface ITeamMember extends Document {
  userId: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  specialties: string[];
  services: mongoose.Types.ObjectId[];
  workingHours: {
    [key: string]: {
      isWorking: boolean;
      start?: string;
      end?: string;
      breaks?: Array<{
        start: string;
        end: string;
      }>;
    };
  };
  /** Days off (congés, maladie): inclusive 'YYYY-MM-DD' days. leaveId = the approved LeaveRequest it comes from. */
  absences: Array<{ from: string; to: string; start?: string; end?: string; reason?: string; leaveId?: mongoose.Types.ObjectId }>;
  avatar?: string;
  color: string;
  isActive: boolean;
  /** What this member's login may do (see middleware/permissions.ts). */
  permissions: StaffPermissions;
  /** Paid leave per year in jours ouvrables (French default 30). */
  leaveAllowance: number;
  /** Fiche employé: owner-only, never sent to staff logins. */
  hr: {
    startDate?: string;
    contractType?: 'cdi' | 'cdd' | 'apprentissage' | 'freelance';
    emergencyContact?: { name?: string; phone?: string };
    notes?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const teamMemberSchema = new Schema<ITeamMember>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    specialties: [{
      type: String,
      trim: true,
    }],
    services: [{
      type: Schema.Types.ObjectId,
      ref: 'Service',
    }],
    workingHours: {
      type: Map,
      of: {
        isWorking: {
          type: Boolean,
          default: false,
        },
        start: String,
        end: String,
        breaks: [{
          start: String,
          end: String,
        }],
      },
      default: () => {
        const defaultHours: any = {};
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        days.forEach(day => {
          defaultHours[day] = {
            isWorking: day !== 'sunday',
            start: '09:00',
            end: '18:00',
            breaks: [{
              start: '12:00',
              end: '13:00',
            }],
          };
        });
        return defaultHours;
      },
    },
    absences: [{
      _id: false,
      from: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
      to: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
      // Optional time window (partial-day absence); none = whole days
      start: { type: String, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
      end: { type: String, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
      reason: { type: String, trim: true, maxlength: 120 },
      leaveId: { type: Schema.Types.ObjectId, ref: 'LeaveRequest' },
    }],
    avatar: {
      type: String,
    },
    color: {
      type: String,
      default: '#3B82F6',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    permissions: {
      planning: { type: String, enum: ['own', 'all'], default: DEFAULT_STAFF_PERMISSIONS.planning },
      canCreateAppointments: { type: Boolean, default: DEFAULT_STAFF_PERMISSIONS.canCreateAppointments },
      canEditAppointments: { type: String, enum: ['none', 'own', 'all'], default: DEFAULT_STAFF_PERMISSIONS.canEditAppointments },
      canViewClients: { type: Boolean, default: DEFAULT_STAFF_PERMISSIONS.canViewClients },
      canViewClientContacts: { type: Boolean, default: DEFAULT_STAFF_PERMISSIONS.canViewClientContacts },
      canViewRevenue: { type: Boolean, default: DEFAULT_STAFF_PERMISSIONS.canViewRevenue },
      canManageServices: { type: Boolean, default: DEFAULT_STAFF_PERMISSIONS.canManageServices },
      canManageProducts: { type: Boolean, default: DEFAULT_STAFF_PERMISSIONS.canManageProducts },
    },
    leaveAllowance: { type: Number, min: 0, max: 366, default: 30 },
    hr: {
      startDate: { type: String, match: /^\d{4}-\d{2}-\d{2}$/ },
      contractType: { type: String, enum: ['cdi', 'cdd', 'apprentissage', 'freelance'] },
      emergencyContact: {
        name: { type: String, trim: true, maxlength: 80 },
        phone: { type: String, trim: true, maxlength: 30 },
      },
      notes: { type: String, trim: true, maxlength: 2000 },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
teamMemberSchema.index({ userId: 1, email: 1 });
teamMemberSchema.index({ userId: 1, isActive: 1 });
teamMemberSchema.index({ services: 1 });

// Virtual for full name
teamMemberSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure JSON output includes virtuals
teamMemberSchema.set('toJSON', {
  virtuals: true,
  transform: function(_doc, ret: any) {
    delete ret.__v;
    return ret;
  },
});

export const TeamMember = mongoose.model<ITeamMember>('TeamMember', teamMemberSchema);
