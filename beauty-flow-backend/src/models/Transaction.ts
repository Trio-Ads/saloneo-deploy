import { Schema, model, Document, Types } from 'mongoose';
import { PlanType, SubscriptionDuration } from '../utils/priceCalculator';

export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled'
}

export enum PaymentMethod {
  SATIM = 'satim',
  CASH = 'cash',
  TRANSFER = 'transfer'
}

export interface ITransaction extends Document {
  userId: Types.ObjectId;
  planType: PlanType;
  duration: SubscriptionDuration;
  amount: number; // Montant en centimes
  displayAmount: number; // Montant affiché en DZD
  currency: string;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  environment: 'test' | 'production';
  
  // SATIM specific fields
  satim?: {
    orderId: string;
    orderNumber: string;
    formUrl?: string;
    actionCode?: number;
    actionCodeDescription?: string;
    approvalCode?: string;
    pan?: string; // Masked card number
    cardholderName?: string;
    errorCode?: string;
    errorMessage?: string;
    rawResponse?: any;
  };
  
  // Timestamps
  initiatedAt: Date;
  completedAt?: Date;
  failedAt?: Date;
  refundedAt?: Date;
  
  // Refund information
  refund?: {
    amount: number;
    reason?: string;
    refundedBy?: Types.ObjectId;
    refundedAt: Date;
  };
  
  // Metadata
  metadata?: {
    ip?: string;
    userAgent?: string;
    referrer?: string;
  };
  
  notes?: string;
  createdAt: Date;
  updatedAt: Date;

  // Methods
  canBeRefunded(): boolean;
  markAsCompleted(satimDetails?: any): Promise<ITransaction>;
  markAsFailed(error?: { code?: string; message?: string }): Promise<ITransaction>;
  markAsRefunded(refundDetails: {
    amount: number;
    reason?: string;
    refundedBy?: Types.ObjectId;
  }): Promise<ITransaction>;
}

const transactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    planType: {
      type: String,
      enum: Object.values(PlanType),
      required: true
    },
    duration: {
      type: String,
      enum: Object.values(SubscriptionDuration),
      required: true,
      default: SubscriptionDuration.MONTHLY
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    displayAmount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'DZD',
      uppercase: true
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: true,
      default: PaymentMethod.SATIM
    },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      default: TransactionStatus.PENDING,
      index: true
    },
    environment: {
      type: String,
      enum: ['test', 'production'],
      required: true,
      default: 'test'
    },
    satim: {
      orderId: {
        type: String,
        index: true,
        sparse: true
      },
      orderNumber: {
        type: String,
        index: true,
        sparse: true
      },
      formUrl: String,
      actionCode: Number,
      actionCodeDescription: String,
      approvalCode: String,
      pan: String,
      cardholderName: String,
      errorCode: String,
      errorMessage: String,
      rawResponse: Schema.Types.Mixed
    },
    initiatedAt: {
      type: Date,
      default: Date.now,
      required: true
    },
    completedAt: Date,
    failedAt: Date,
    refundedAt: Date,
    refund: {
      amount: Number,
      reason: String,
      refundedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      refundedAt: Date
    },
    metadata: {
      ip: String,
      userAgent: String,
      referrer: String
    },
    notes: {
      type: String,
      maxlength: 1000
    }
  },
  {
    timestamps: true
  }
);

// Indexes for performance
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ status: 1, createdAt: -1 });
transactionSchema.index({ 'satim.orderId': 1 });
transactionSchema.index({ 'satim.orderNumber': 1 });
transactionSchema.index({ paymentMethod: 1, status: 1 });

// Virtual for amount in DZD
transactionSchema.virtual('amountInDZD').get(function() {
  return this.amount / 100;
});

// Method to check if transaction can be refunded
transactionSchema.methods.canBeRefunded = function(): boolean {
  return (
    this.status === TransactionStatus.COMPLETED &&
    this.paymentMethod === PaymentMethod.SATIM &&
    !this.refundedAt
  );
};

// Method to mark as completed
transactionSchema.methods.markAsCompleted = function(satimDetails?: any) {
  this.status = TransactionStatus.COMPLETED;
  this.completedAt = new Date();
  
  if (satimDetails && this.satim) {
    this.satim = { ...this.satim, ...satimDetails };
  }
  
  return this.save();
};

// Method to mark as failed
transactionSchema.methods.markAsFailed = function(error?: { code?: string; message?: string }) {
  this.status = TransactionStatus.FAILED;
  this.failedAt = new Date();
  
  if (error && this.satim) {
    this.satim.errorCode = error.code;
    this.satim.errorMessage = error.message;
  }
  
  return this.save();
};

// Method to mark as refunded
transactionSchema.methods.markAsRefunded = function(refundDetails: {
  amount: number;
  reason?: string;
  refundedBy?: Types.ObjectId;
}) {
  this.status = TransactionStatus.REFUNDED;
  this.refundedAt = new Date();
  this.refund = {
    ...refundDetails,
    refundedAt: new Date()
  };
  
  return this.save();
};

// Static method to find by SATIM order ID
transactionSchema.statics.findBySatimOrderId = function(orderId: string) {
  return this.findOne({ 'satim.orderId': orderId });
};

// Static method to get user transaction history
transactionSchema.statics.getUserTransactions = function(
  userId: Types.ObjectId,
  options?: {
    status?: TransactionStatus;
    limit?: number;
    skip?: number;
  }
) {
  const query: any = { userId };
  
  if (options?.status) {
    query.status = options.status;
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(options?.limit || 50)
    .skip(options?.skip || 0);
};

export const Transaction = model<ITransaction>('Transaction', transactionSchema);
