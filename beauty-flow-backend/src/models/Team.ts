import mongoose, { Document, Schema } from 'mongoose';

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
  avatar?: string;
  color: string;
  isActive: boolean;
  permissions: {
    canManageAppointments: boolean;
    canManageClients: boolean;
    canManageServices: boolean;
    canViewReports: boolean;
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
      canManageAppointments: {
        type: Boolean,
        default: true,
      },
      canManageClients: {
        type: Boolean,
        default: false,
      },
      canManageServices: {
        type: Boolean,
        default: false,
      },
      canViewReports: {
        type: Boolean,
        default: false,
      },
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
