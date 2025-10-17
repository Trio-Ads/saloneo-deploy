import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export enum PlanType {
  FREE = 'FREE',
  STARTER = 'STARTER',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE'
}

export enum SubscriptionDuration {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
  BIENNIAL = 'BIENNIAL',
  TRIENNIAL = 'TRIENNIAL'
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
      duration: SubscriptionDuration;
      startDate: Date;
      expiresAt?: Date;
      endDate?: Date;
      isActive: boolean;
      lastPaymentDate?: Date;
      lastTransactionId?: string;
      autoRenew?: boolean;
      notifications?: {
        expiry7d?: boolean;
        expiry3d?: boolean;
        expiry1d?: boolean;
        expired?: boolean;
        appointments80?: boolean;
        appointments100?: boolean;
        clients80?: boolean;
        clients100?: boolean;
        services80?: boolean;
        services100?: boolean;
      };
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
  lastLoginIp?: string;
  lastLoginUserAgent?: string;
  avatar?: string;
  tokens?: {
    public?: string;
    modification?: string;
  };
  businessHours?: any;
  logo?: string;
  banner?: string;
  presentation?: string;
  theme?: any;
  showTeamOnPublicPage?: boolean;
  showAsTeamMember?: boolean;
  serviceDisplay?: {
    defaultView: 'category' | 'price' | 'duration' | 'popularity';
    priceDisplay: 'fixed' | 'from' | 'range' | 'hidden';
  };
  affiliation?: {
    isAffiliate: boolean;
    affiliateCode: string;
    referralCode?: string;
    referredBy?: Schema.Types.ObjectId;
    totalReferrals: number;
    totalCommissions: number;
    commissionRate: number;
    payoutMethod?: 'bank' | 'paypal' | 'crypto';
    payoutDetails?: any;
    stats: {
      clicksCount: number;
      conversionsCount: number;
      conversionRate: number;
      lastActivity?: Date;
    };
    isActive: boolean;
    joinedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  generatePasswordResetToken(): string;
  generateAffiliateCode(): string;
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
      duration: {
        type: String,
        enum: Object.values(SubscriptionDuration),
        default: SubscriptionDuration.MONTHLY,
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
      lastPaymentDate: Date,
      lastTransactionId: {
        type: Schema.Types.ObjectId,
        ref: 'Transaction',
      },
      autoRenew: {
        type: Boolean,
        default: false,
      },
      endDate: Date,
      notifications: {
        expiry7d: { type: Boolean, default: false },
        expiry3d: { type: Boolean, default: false },
        expiry1d: { type: Boolean, default: false },
        expired: { type: Boolean, default: false },
        appointments80: { type: Boolean, default: false },
        appointments100: { type: Boolean, default: false },
        clients80: { type: Boolean, default: false },
        clients100: { type: Boolean, default: false },
        services80: { type: Boolean, default: false },
        services100: { type: Boolean, default: false },
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
    lastLoginIp: String,
    lastLoginUserAgent: String,
    avatar: String,
    tokens: {
      public: { type: String, index: true },
      modification: { type: String, index: true },
    },
    businessHours: Schema.Types.Mixed,
    logo: String,
    banner: String,
    presentation: String,
    theme: Schema.Types.Mixed,
    showTeamOnPublicPage: {
      type: Boolean,
      default: true,
    },
    showAsTeamMember: {
      type: Boolean,
      default: false,
    },
    serviceDisplay: {
      defaultView: {
        type: String,
        enum: ['category', 'price', 'duration', 'popularity'],
        default: 'category',
      },
      priceDisplay: {
        type: String,
        enum: ['fixed', 'from', 'range', 'hidden'],
        default: 'fixed',
      },
    },
    affiliation: {
      isAffiliate: {
        type: Boolean,
        default: false,
      },
      affiliateCode: {
        type: String,
        unique: true,
        sparse: true,
      },
      referralCode: String,
      referredBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      totalReferrals: {
        type: Number,
        default: 0,
      },
      totalCommissions: {
        type: Number,
        default: 0,
      },
      commissionRate: {
        type: Number,
        default: 0.20, // 20% par défaut
        min: 0,
        max: 1,
      },
      payoutMethod: {
        type: String,
        enum: ['bank', 'paypal', 'crypto'],
      },
      payoutDetails: Schema.Types.Mixed,
      stats: {
        clicksCount: {
          type: Number,
          default: 0,
        },
        conversionsCount: {
          type: Number,
          default: 0,
        },
        conversionRate: {
          type: Number,
          default: 0,
        },
        lastActivity: Date,
      },
      isActive: {
        type: Boolean,
        default: true,
      },
      joinedAt: {
        type: Date,
        default: Date.now,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ 'subscription.plan': 1, 'subscription.isActive': 1 });
userSchema.index({ 'affiliation.affiliateCode': 1 });
userSchema.index({ 'affiliation.referredBy': 1 });

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

// Generate affiliate code method
userSchema.methods.generateAffiliateCode = function (): string {
  const prefix = this.establishmentName
    .substring(0, 3)
    .toUpperCase()
    .replace(/[^A-Z]/g, '');
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${randomPart}`;
};

export const User = model<IUser>('User', userSchema);
