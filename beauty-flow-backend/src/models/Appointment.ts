import { Schema, model, Document, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show'
}

export interface IAppointment extends Document {
  userId: Types.ObjectId;
  clientId: Types.ObjectId;
  serviceId: string; // UUID string for local store services
  stylistId: string; // UUID string for local store team members
  date: Date;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  status: AppointmentStatus;
  price: number;
  currency: string;
  deposit: {
    required: boolean;
    amount: number;
    paid: boolean;
    paidAt?: Date;
  };
  tokens: {
    public: string;
    modification: string;
  };
  clientInfo: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
  };
  notes?: string;
  internalNotes?: string;
  modifications: Array<{
    date: Date;
    modifiedBy: 'client' | 'staff';
    changes: Record<string, any>;
    reason?: string;
  }>;
  reminders: Array<{
    type: 'sms' | 'email';
    sentAt: Date;
    status: 'sent' | 'failed';
  }>;
  cancellation?: {
    reason?: string;
    cancelledBy: 'client' | 'staff';
    cancelledAt: Date;
  };
  rating?: {
    score: number;
    comment?: string;
    ratedAt: Date;
  };
  confirmationToken?: string;
  source?: string;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
      index: true,
    },
    serviceId: {
      type: String,
      required: true,
      // Accept UUID format for local store services
    },
    stylistId: {
      type: String,
      required: true,
      index: true,
      // Accept UUID format for local store team members
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    startTime: {
      type: String,
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'],
    },
    endTime: {
      type: String,
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'],
    },
    duration: {
      type: Number,
      required: true,
      min: [15, 'Duration must be at least 15 minutes'],
    },
    status: {
      type: String,
      enum: Object.values(AppointmentStatus),
      default: AppointmentStatus.SCHEDULED,
      index: true,
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative'],
    },
    currency: {
      type: String,
      default: 'DZD',
      uppercase: true,
    },
    deposit: {
      required: {
        type: Boolean,
        default: false,
      },
      amount: {
        type: Number,
        default: 0,
        min: [0, 'Deposit amount cannot be negative'],
      },
      paid: {
        type: Boolean,
        default: false,
      },
      paidAt: Date,
    },
    tokens: {
      public: {
        type: String,
        required: true,
        unique: true,
        default: () => uuidv4(),
      },
      modification: {
        type: String,
        required: true,
        unique: true,
        default: () => uuidv4(),
      },
    },
    clientInfo: {
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
      phone: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
      },
    },
    notes: {
      type: String,
      maxlength: 500,
    },
    internalNotes: {
      type: String,
      maxlength: 1000,
    },
    modifications: [{
      date: {
        type: Date,
        default: Date.now,
      },
      modifiedBy: {
        type: String,
        enum: ['client', 'staff'],
        required: true,
      },
      changes: {
        type: Schema.Types.Mixed,
        required: true,
      },
      reason: String,
    }],
    reminders: [{
      type: {
        type: String,
        enum: ['sms', 'email'],
        required: true,
      },
      sentAt: {
        type: Date,
        required: true,
      },
      status: {
        type: String,
        enum: ['sent', 'failed'],
        required: true,
      },
    }],
    cancellation: {
      reason: String,
      cancelledBy: {
        type: String,
        enum: ['client', 'staff'],
      },
      cancelledAt: Date,
    },
    rating: {
      score: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: {
        type: String,
        maxlength: 500,
      },
      ratedAt: Date,
    },
    confirmationToken: {
      type: String,
      unique: true,
      sparse: true,
    },
    source: {
      type: String,
      enum: ['online', 'phone', 'walk-in', 'admin'],
      default: 'admin',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
appointmentSchema.index({ userId: 1, date: 1, status: 1 });
appointmentSchema.index({ userId: 1, stylistId: 1, date: 1 });
appointmentSchema.index({ userId: 1, clientId: 1, date: -1 });
appointmentSchema.index({ 'tokens.public': 1 });
appointmentSchema.index({ 'tokens.modification': 1 });
appointmentSchema.index({ date: 1, startTime: 1, stylistId: 1 });

// Virtual for formatted date
appointmentSchema.virtual('formattedDate').get(function () {
  return this.date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
});

// Method to check if appointment can be modified
appointmentSchema.methods.canBeModified = function (): boolean {
  if (this.status === AppointmentStatus.COMPLETED || 
      this.status === AppointmentStatus.CANCELLED) {
    return false;
  }
  
  // Check if appointment is in the past
  const appointmentDateTime = new Date(this.date);
  const [hours, minutes] = this.startTime.split(':');
  appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));
  
  return appointmentDateTime > new Date();
};

// Method to cancel appointment
appointmentSchema.methods.cancel = function (cancelledBy: 'client' | 'staff', reason?: string) {
  this.status = AppointmentStatus.CANCELLED;
  this.cancellation = {
    reason,
    cancelledBy,
    cancelledAt: new Date(),
  };
  return this.save();
};

// Method to confirm appointment
appointmentSchema.methods.confirm = function () {
  if (this.status === AppointmentStatus.SCHEDULED) {
    this.status = AppointmentStatus.CONFIRMED;
    return this.save();
  }
  throw new Error('Only scheduled appointments can be confirmed');
};

// Method to mark as completed
appointmentSchema.methods.complete = function () {
  if (this.status === AppointmentStatus.CONFIRMED || 
      this.status === AppointmentStatus.IN_PROGRESS) {
    this.status = AppointmentStatus.COMPLETED;
    return this.save();
  }
  throw new Error('Only confirmed or in-progress appointments can be completed');
};

// Method to mark as no-show
appointmentSchema.methods.markAsNoShow = function () {
  if (this.status === AppointmentStatus.SCHEDULED || 
      this.status === AppointmentStatus.CONFIRMED) {
    this.status = AppointmentStatus.NO_SHOW;
    return this.save();
  }
  throw new Error('Only scheduled or confirmed appointments can be marked as no-show');
};

export const Appointment = model<IAppointment>('Appointment', appointmentSchema);
