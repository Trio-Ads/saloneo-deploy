import { Request, Response } from 'express';
import { Review } from '../models/Review';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';

const VALID_RATINGS = [1, 2, 3, 4, 5];

import { findSalonBySlug } from '../services/salonLookup';

// GET /api/reviews — list own reviews (authenticated)
export async function listReviews(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as AuthRequest).userId;
    const reviews = await Review.find({ userId }).sort({ order: 1, createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

// POST /api/reviews — create review (authenticated)
export async function createReview(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as AuthRequest).userId;
    const { author, rating, comment, date } = req.body;

    if (!author || !rating || !comment) {
      res.status(400).json({ message: 'author, rating et comment sont requis' });
      return;
    }
    if (!VALID_RATINGS.includes(Number(rating))) {
      res.status(400).json({ message: 'rating doit être entre 1 et 5' });
      return;
    }

    const review = await Review.create({
      userId,
      author: String(author).trim(),
      rating: Number(rating),
      comment: String(comment).trim(),
      date: date ? new Date(date) : new Date(),
      isVisible: true,
      order: 0,
    });
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

// PATCH /api/reviews/:id — update (authenticated, own review)
export async function updateReview(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as AuthRequest).userId;
    const review = await Review.findOne({ _id: req.params.id, userId });
    if (!review) {
      res.status(404).json({ message: 'Avis introuvable' });
      return;
    }

    const { author, rating, comment, date, isVisible, order } = req.body;
    if (author !== undefined) review.author = String(author).trim();
    if (rating !== undefined) {
      if (!VALID_RATINGS.includes(Number(rating))) {
        res.status(400).json({ message: 'rating doit être entre 1 et 5' });
        return;
      }
      review.rating = Number(rating) as 1 | 2 | 3 | 4 | 5;
    }
    if (comment !== undefined) review.comment = String(comment).trim();
    if (date !== undefined) review.date = new Date(date);
    if (isVisible !== undefined) review.isVisible = Boolean(isVisible);
    if (order !== undefined) review.order = Number(order);

    await review.save();
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

// DELETE /api/reviews/:id — delete (authenticated, own review)
export async function deleteReview(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as AuthRequest).userId;
    const result = await Review.deleteOne({ _id: req.params.id, userId });
    if (result.deletedCount === 0) {
      res.status(404).json({ message: 'Avis introuvable' });
      return;
    }
    res.json({ message: 'Avis supprimé' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

// GET /api/public/reviews/:slug — public endpoint
export async function getPublicReviews(req: Request, res: Response): Promise<void> {
  try {
    const { slug } = req.params;

    const matchingUser = await findSalonBySlug(slug, '_id');

    if (!matchingUser) {
      res.status(404).json({ message: 'Salon introuvable' });
      return;
    }

    const reviews = await Review.find({ userId: matchingUser._id, isVisible: true })
      .sort({ order: 1, createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
}
