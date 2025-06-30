import { Schema, model, Document, Types } from 'mongoose';

export interface IService extends Document {
  userId: Types.ObjectId;
  name: string;
  description?: string;
  category: string;
  duration: number; // in minutes
  price: number;
  currency: string;
  isActive: boolean;
  isPublic?: boolean;
  buffer?: {
    before?: number;
    after?: number;
  };
  products: Array<{
    productId: Types.ObjectId;
    quantity: number;
  }>;
  settings: {
    isOnline: boolean;
    minimumBookingTime: number; // hours before appointment
    maximumBookingAdvance: number; // days in advance
    requiresDeposit: boolean;
    depositAmount?: number;
    depositPercentage?: number;
  };
  images: Array<{
    url: string;
    alt: string;
    isPrimary: boolean;
  }>;
  displayOrder: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema<IService>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
      maxlength: [100, 'Service name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [15, 'Duration must be at least 15 minutes'],
      max: [480, 'Duration cannot exceed 8 hours'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    currency: {
      type: String,
      default: 'DZD',
      uppercase: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    buffer: {
      before: {
        type: Number,
        default: 0,
        min: [0, 'Buffer time cannot be negative'],
      },
      after: {
        type: Number,
        default: 0,
        min: [0, 'Buffer time cannot be negative'],
      },
    },
    products: [{
      productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: [0, 'Quantity cannot be negative'],
      },
    }],
    settings: {
      isOnline: {
        type: Boolean,
        default: false,
      },
      minimumBookingTime: {
        type: Number,
        default: 24, // 24 hours
        min: [0, 'Minimum booking time cannot be negative'],
      },
      maximumBookingAdvance: {
        type: Number,
        default: 30, // 30 days
        min: [1, 'Maximum booking advance must be at least 1 day'],
      },
      requiresDeposit: {
        type: Boolean,
        default: false,
      },
      depositAmount: {
        type: Number,
        min: [0, 'Deposit amount cannot be negative'],
      },
      depositPercentage: {
        type: Number,
        min: [0, 'Deposit percentage cannot be negative'],
        max: [100, 'Deposit percentage cannot exceed 100'],
      },
    },
    images: [{
      url: {
        type: String,
        required: true,
      },
      alt: {
        type: String,
        default: '',
      },
      isPrimary: {
        type: Boolean,
        default: false,
      },
    }],
    displayOrder: {
      type: Number,
      default: 0,
    },
    tags: [String],
  },
  {
    timestamps: true,
  }
);

// Indexes
serviceSchema.index({ userId: 1, category: 1, isActive: 1 });
serviceSchema.index({ userId: 1, name: 'text' });
serviceSchema.index({ userId: 1, displayOrder: 1 });
serviceSchema.index({ 'settings.isOnline': 1, isActive: 1 });

// Virtual for formatted price
serviceSchema.virtual('formattedPrice').get(function () {
  return new Intl.NumberFormat('fr-DZ', {
    style: 'currency',
    currency: this.currency,
  }).format(this.price);
});

// Virtual for duration in hours
serviceSchema.virtual('durationInHours').get(function () {
  const hours = Math.floor(this.duration / 60);
  const minutes = this.duration % 60;
  if (hours === 0) return `${minutes}min`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h${minutes}min`;
});

// Method to check if service can be booked at a specific time
serviceSchema.methods.canBeBookedAt = function (bookingTime: Date): boolean {
  if (!this.isActive || !this.settings.isOnline) return false;
  
  const now = new Date();
  const hoursUntilBooking = (bookingTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  // Check minimum booking time
  if (hoursUntilBooking < this.settings.minimumBookingTime) return false;
  
  // Check maximum booking advance
  const daysUntilBooking = hoursUntilBooking / 24;
  if (daysUntilBooking > this.settings.maximumBookingAdvance) return false;
  
  return true;
};

export const Service = model<IService>('Service', serviceSchema);
