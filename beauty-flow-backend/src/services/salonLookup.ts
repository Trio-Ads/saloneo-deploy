import { User } from '../models/User';
import { salonBaseSlug } from '../utils/slug';

/** Resolve a public salon by its stored slug; falls back to legacy name-derived slugs for users not yet backfilled. */
export async function findSalonBySlug(slug: string, select = 'firstName lastName establishmentName') {
  const user = await User.findOne({ slug, isActive: true }).select(select);
  if (user) return user;
  const legacy = await User.find({ isActive: true, slug: { $exists: false } }).select(select);
  return legacy.find(u => salonBaseSlug(u) === slug) || null;
}
