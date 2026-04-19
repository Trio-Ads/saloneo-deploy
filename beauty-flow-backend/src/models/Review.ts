import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  userId: mongoose.Types.ObjectId;
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  date: Date;
  isVisible: boolean;
  order: number;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    userId:    { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    author:    { type: String, required: true, maxlength: 100 },
    rating:    { type: Number, required: true, min: 1, max: 5, enum: [1, 2, 3, 4, 5] },
    comment:   { type: String, required: true, maxlength: 500 },
    date:      { type: Date, default: Date.now },
    isVisible: { type: Boolean, default: true },
    order:     { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Review = mongoose.model<IReview>('Review', ReviewSchema);
