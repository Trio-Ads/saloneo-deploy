import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  minQuantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  unit: {
    type: String,
    required: true,
    enum: ['ml', 'g', 'unité', 'l', 'kg'],
    default: 'ml'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(_doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Index composé pour optimiser les requêtes
ProductSchema.index({ userId: 1, isActive: 1 });
ProductSchema.index({ userId: 1, name: 1 });

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
