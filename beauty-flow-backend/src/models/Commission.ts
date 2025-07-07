import { Schema, model, Document } from 'mongoose';

export enum CommissionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED'
}

export enum CommissionType {
  SUBSCRIPTION = 'SUBSCRIPTION',
  RENEWAL = 'RENEWAL',
  UPGRADE = 'UPGRADE'
}

export interface ICommission extends Document {
  affiliateId: Schema.Types.ObjectId;
  referredUserId: Schema.Types.ObjectId;
  subscriptionId: Schema.Types.ObjectId;
  transactionId?: Schema.Types.ObjectId;
  amount: number;
  currency: string;
  status: CommissionStatus;
  type: CommissionType;
  commissionRate: number;
  originalAmount: number; // Montant de la transaction originale
  paymentDate?: Date;
  paymentMethod?: string;
  paymentReference?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const commissionSchema = new Schema<ICommission>(
  {
    affiliateId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    referredUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: 'Transaction',
      required: true,
    },
    transactionId: {
      type: Schema.Types.ObjectId,
      ref: 'Transaction',
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: 'EUR',
    },
    status: {
      type: String,
      enum: Object.values(CommissionStatus),
      default: CommissionStatus.PENDING,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(CommissionType),
      required: true,
    },
    commissionRate: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    originalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentDate: Date,
    paymentMethod: String,
    paymentReference: String,
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
commissionSchema.index({ affiliateId: 1, status: 1 });
commissionSchema.index({ createdAt: -1 });
commissionSchema.index({ paymentDate: -1 });

// Virtual pour calculer le montant en attente
commissionSchema.virtual('isPending').get(function() {
  return this.status === CommissionStatus.PENDING;
});

// Virtual pour calculer si la commission est payable
commissionSchema.virtual('isPayable').get(function() {
  return this.status === CommissionStatus.APPROVED;
});

// Méthode pour approuver une commission
commissionSchema.methods.approve = async function(): Promise<void> {
  if (this.status !== CommissionStatus.PENDING) {
    throw new Error('Only pending commissions can be approved');
  }
  this.status = CommissionStatus.APPROVED;
  await this.save();
};

// Méthode pour marquer comme payée
commissionSchema.methods.markAsPaid = async function(
  paymentMethod: string,
  paymentReference: string
): Promise<void> {
  if (this.status !== CommissionStatus.APPROVED) {
    throw new Error('Only approved commissions can be marked as paid');
  }
  this.status = CommissionStatus.PAID;
  this.paymentDate = new Date();
  this.paymentMethod = paymentMethod;
  this.paymentReference = paymentReference;
  await this.save();
};

// Méthode pour annuler une commission
commissionSchema.methods.cancel = async function(reason?: string): Promise<void> {
  if (this.status === CommissionStatus.PAID) {
    throw new Error('Paid commissions cannot be cancelled');
  }
  this.status = CommissionStatus.CANCELLED;
  if (reason) {
    this.notes = reason;
  }
  await this.save();
};

export const Commission = model<ICommission>('Commission', commissionSchema);
