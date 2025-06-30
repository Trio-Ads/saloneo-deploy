import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export enum PlanType {
  FREE = 'FREE',
  STARTER = 'STARTER',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE'
}

export interface IUser extends Document {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  establishmentName: string;
  phone?: string;
  address?: string;
  subscription: {
    plan: PlanType;
    startDate: Date;
    expiresAt?: Date;
    isActive: boolean;
  };
  settings: {
    language: string;
    currency: string;
    timezone: string;
  };
  isActive: boolean;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  refreshToken?: string;
  lastLogin?: Date;
  avatar?: string;
  tokens?: {
    public?: string;
    modification?: string;
  };
  businessHours?: any;
  logo?: string;
  theme?: any;
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  generatePasswordResetToken(): string;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't include password in queries by default
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    establishmentName: {
      type: String,
      required: [true, 'Establishment name is required'],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    subscription: {
      plan: {
        type: String,
        enum: Object.values(PlanType),
        default: PlanType.FREE,
      },
      startDate: {
        type: Date,
        default: Date.now,
      },
      expiresAt: Date,
      isActive: {
        type: Boolean,
        default: true,
      },
    },
    settings: {
      language: {
        type: String,
        default: 'fr',
        enum: ['fr', 'en', 'ar', 'es', 'tr', 'pt'],
      },
      currency: {
        type: String,
        default: 'EUR',
      },
      timezone: {
        type: String,
        default: 'Europe/Paris',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    refreshToken: String,
    lastLogin: Date,
    avatar: String,
    tokens: {
      public: { type: String, index: true },
      modification: { type: String, index: true },
    },
    businessHours: Schema.Types.Mixed,
    logo: String,
    theme: Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ 'subscription.plan': 1, 'subscription.isActive': 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function (): string {
  const resetToken = Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15);
  
  this.passwordResetToken = resetToken;
  this.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour
  
  return resetToken;
};

export const User = model<IUser>('User', userSchema);
