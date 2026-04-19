import { Request, Response } from 'express';
import { Review } from '../models/Review';
import { User } from '../models/User';

// GET /api/reviews — list own reviews (authenticated)
export async function listReviews(req: Request, res: Response): Promise<void> {
  const userId = (req as any).user?.id;
  const reviews = await Review.find({ userId }).sort({ order: 1, createdAt: -1 });
  res.json(reviews);
}

// POST /api/reviews — create review (authenticated)
export async function createReview(req: Request, res: Response): Promise<void> {
  const userId = (req as any).user?.id;
  const { author, rating, comment, date } = req.body;

  if (!author || !rating || !comment) {
    res.status(400).json({ message: 'author, rating et comment sont requis' });
    return;
  }
  if (![1, 2, 3, 4, 5].includes(Number(rating))) {
    res.status(400).json({ message: 'rating doit être entre 1 et 5' });
    return;
  }

  const review = await Review.create({
    userId,
    author,
    rating: Number(rating),
    comment,
    date: date ? new Date(date) : new Date(),
    isVisible: true,
    order: 0,
  });
  res.status(201).json(review);
}

// PATCH /api/reviews/:id — update (authenticated, own review)
export async function updateReview(req: Request, res: Response): Promise<void> {
  const userId = (req as any).user?.id;
  const review = await Review.findOne({ _id: req.params.id, userId });
  if (!review) {
    res.status(404).json({ message: 'Avis introuvable' });
    return;
  }

  const { author, rating, comment, date, isVisible, order } = req.body;
  if (author !== undefined) review.author = author;
  if (rating !== undefined) review.rating = Number(rating) as 1 | 2 | 3 | 4 | 5;
  if (comment !== undefined) review.comment = comment;
  if (date !== undefined) review.date = new Date(date);
  if (isVisible !== undefined) review.isVisible = Boolean(isVisible);
  if (order !== undefined) review.order = Number(order);

  await review.save();
  res.json(review);
}

// DELETE /api/reviews/:id — delete (authenticated, own review)
export async function deleteReview(req: Request, res: Response): Promise<void> {
  const userId = (req as any).user?.id;
  const result = await Review.deleteOne({ _id: req.params.id, userId });
  if (result.deletedCount === 0) {
    res.status(404).json({ message: 'Avis introuvable' });
    return;
  }
  res.json({ message: 'Avis supprimé' });
}

// GET /api/public/reviews/:slug — public endpoint
export async function getPublicReviews(req: Request, res: Response): Promise<void> {
  const { slug } = req.params;
  const user = await User.findOne({ slug }).select('_id');
  if (!user) {
    res.status(404).json({ message: 'Salon introuvable' });
    return;
  }

  const reviews = await Review.find({ userId: user._id, isVisible: true }).sort({ order: 1, createdAt: -1 });
  res.json(reviews);
}
