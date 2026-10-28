import { Request, Response } from 'express';
import { User, UserRole } from '../models/User';
import { Service } from '../models/Service';
import { Review } from '../models/Review';
import { logger } from '../utils/logger';
import { WILAYAS, findWilaya, parseAddress, wilayaSlug } from '../utils/wilayas';
import { loadNextSlots, NextSlot } from '../services/availability';

/** Directory categories, matched in this order on each service's category then name (accents and case ignored). */
export const CATEGORIES: Array<[string, RegExp]> = [
  ['maquillage-mariee', /maquill|make ?up|mariee|mariage|bridal|henne|negafa/],
  ['barbier', /barb|rasage|beard|shave|homme/],
  ['ongles', /ongle|manucure|pedicure|nail|vernis|capsule|gel/],
  ['spa-hammam', /\bspa\b|hammam|massage|gommage|bien.?etre|relax|sauna/],
  ['coiffure', /coiff|cheveu|coupe|brushing|color|balayage|meche|kerat|lissage|tresse|chignon|hair|shampo|defris|boucl/],
  ['esthetique', /esthet|visage|soin|epil|cils|sourcil|peau|facial|wax|cire|beaute|laser|teint/],
];
const fold = (s = '') => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function categoryOf(category?: string, name?: string): string | undefined {
  for (const text of [category, name]) {
    const t = fold(text);
    const hit = CATEGORIES.find(([, re]) => re.test(t));
    if (hit) return hit[0];
  }
  return undefined;
}

export interface DirectoryCard {
  slug: string;
  name: string;
  logo?: string;
  banner?: string;
  city?: string;
  wilaya?: string;
  wilayaSlug?: string;
  categories: string[];
  ratingAvg: number | null;
  ratingCount: number;
  minPrice: number | null;
  currency: string;
  templateId?: string;
  theme?: { selectedTemplateId?: string; primary?: string; secondary?: string; accent?: string; background?: string };
  servicesCount: number;
  createdAt: Date;
  /** First bookable slot within 7 days (list endpoint only). */
  nextSlot?: NextSlot;
  /** Internal, not sent to the client. */
  _id: string;
  /** Search haystack (folded), not sent to the client. */
  _text: string;
  _score: number;
}

/** Accounts that may appear: real, active salons that did not opt out. */
const listedFilter = {
  isActive: true,
  'subscription.isActive': true,
  'directory.listed': { $ne: false },
  role: { $ne: UserRole.ADMIN },
  isAdmin: { $ne: true },
  slug: { $exists: true, $ne: '' },
  email: { $not: /(\.test|@saloneo\.app)$/i },
};

/** Bayesian average: a 5★ salon with one review does not outrank a 4.8★ salon with forty. */
const PRIOR_MEAN = 4, PRIOR_WEIGHT = 3;

/** Cards for the users matching `userFilter`; salons without an online service are dropped. Three indexed queries, no N+1. */
async function buildCards(userFilter: Record<string, unknown>): Promise<DirectoryCard[]> {
  const users = await User.find(userFilter)
    .select('establishmentName slug logo banner address directory settings.currency theme createdAt')
    .lean();
  if (!users.length) return [];
  const ids = users.map(u => u._id);
  const [services, reviews] = await Promise.all([
    Service.aggregate([
      { $match: { userId: { $in: ids }, isActive: true, 'settings.isOnline': true } },
      { $group: {
        _id: '$userId',
        items: { $push: { c: '$category', n: '$name' } },
        minPrice: { $min: { $cond: [{ $gt: ['$price', 0] }, '$price', null] } },
        count: { $sum: 1 },
      } },
    ]),
    Review.aggregate([
      { $match: { userId: { $in: ids }, isVisible: true } },
      { $group: { _id: '$userId', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]),
  ]);
  const svc = new Map(services.map(s => [String(s._id), s]));
  const rev = new Map(reviews.map(r => [String(r._id), r]));

  return users.flatMap((u: any): DirectoryCard[] => {
    const s = svc.get(String(u._id));
    if (!s) return [];
    const r = rev.get(String(u._id));
    const parsed = parseAddress(u.address);
    const city = u.directory?.city || parsed.city;
    const wilaya = findWilaya(u.directory?.wilaya) || parsed.wilaya;
    // Main trade first: most online services, then the CATEGORIES order.
    const tally = new Map<string, number>();
    for (const i of s.items) { const k = categoryOf(i.c, i.n); if (k) tally.set(k, (tally.get(k) || 0) + 1); }
    const order = CATEGORIES.map(([k]) => k);
    const categories = [...tally.keys()].sort((a, b) => tally.get(b)! - tally.get(a)! || order.indexOf(a) - order.indexOf(b));
    const count = r?.count || 0;
    const avg = count ? Math.round(r.avg * 10) / 10 : null;
    const t = u.theme || {};
    return [{
      _id: String(u._id),
      slug: u.slug,
      name: u.establishmentName,
      logo: u.logo || undefined,
      banner: u.banner || undefined,
      city,
      wilaya,
      wilayaSlug: wilaya && wilayaSlug(wilaya),
      categories,
      ratingAvg: avg,
      ratingCount: count,
      minPrice: s.minPrice ?? null,
      currency: u.settings?.currency || 'DZD',
      templateId: t.selectedTemplateId,
      theme: { selectedTemplateId: t.selectedTemplateId, primary: t.primary, secondary: t.secondary, accent: t.accent, background: t.background },
      servicesCount: s.count,
      createdAt: u.createdAt,
      _text: fold([u.establishmentName, city, wilaya, ...s.items.map((i: any) => i.n)].join(' ')),
      _score: (PRIOR_MEAN * PRIOR_WEIGHT + (r?.avg || 0) * count) / (PRIOR_WEIGHT + count),
    }];
  }).sort((a, b) => b._score - a._score || b.servicesCount - a.servicesCount || +new Date(b.createdAt) - +new Date(a.createdAt));
}

// ponytail: the whole listed set is built once per minute and filtered in memory (single pm2 process).
// Fine for a few thousand salons; past that, store the derived fields on the user and query them.
// In-process rather than cacheService: no Redis round-trip, and no slow failures where Redis is absent.
const TTL = 60_000;
let cache: { at: number; cards: Promise<DirectoryCard[]> } | null = null;
export const clearDirectoryCache = () => { cache = null; slotCache.clear(); };
function listedCards(): Promise<DirectoryCard[]> {
  if (!cache || Date.now() - cache.at > TTL) {
    const cards = buildCards(listedFilter);
    cache = { at: Date.now(), cards };
    cards.catch(() => { cache = null; });
  }
  return cache.cards;
}

const publicCard = ({ _id, _text, _score, createdAt, servicesCount, ...card }: DirectoryCard) => card;

// Next slot per salon, 60 s like the list; only the salons of the requested page are computed (one batch).
const slotCache = new Map<string, { at: number; slot?: NextSlot }>();
async function withNextSlots(cards: DirectoryCard[]): Promise<DirectoryCard[]> {
  const now = Date.now();
  const stale = cards.filter(c => !(now - (slotCache.get(c._id)?.at ?? 0) < TTL)).map(c => c._id);
  if (stale.length) {
    const found = await loadNextSlots(stale, 7).catch((e) => { logger.error('Directory next slots error:', e); return null; });
    if (found) for (const id of stale) slotCache.set(id, { at: now, slot: found.get(id) });
  }
  if (slotCache.size > 5000) for (const [id, v] of slotCache) if (now - v.at > TTL) slotCache.delete(id);
  return cards.map(c => ({ ...c, nextSlot: slotCache.get(c._id)?.slot }));
}
const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

/** GET /api/public/directory?q=&wilaya=&city=&category=&page=&limit= */
export const listDirectory = async (req: Request, res: Response): Promise<void> => {
  try {
    const q = fold(str(req.query.q)).split(/\s+/).filter(Boolean);
    const wilaya = wilayaSlug(str(req.query.wilaya));
    const city = fold(str(req.query.city));
    const category = str(req.query.category);
    const limit = Math.min(Math.max(parseInt(str(req.query.limit)) || 12, 1), 24);
    const page = Math.max(parseInt(str(req.query.page)) || 1, 1);

    const matches = (await listedCards()).filter(c =>
      (!wilaya || c.wilayaSlug === wilaya)
      && (!city || fold(c.city) === city)
      && (!category || c.categories.includes(category))
      && q.every(w => c._text.includes(w)));

    res.set('Cache-Control', 'public, max-age=60');
    res.json({
      salons: (await withNextSlots(matches.slice((page - 1) * limit, page * limit))).map(publicCard),
      total: matches.length,
      page,
      limit,
      hasMore: page * limit < matches.length,
    });
  } catch (error) {
    logger.error('Directory list error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/** GET /api/public/directory/facets?wilaya=&category= — wilayas (within the category) and categories (within the wilaya) that have salons. */
export const directoryFacets = async (req: Request, res: Response): Promise<void> => {
  try {
    const cards = await listedCards();
    const wilaya = wilayaSlug(str(req.query.wilaya));
    const category = str(req.query.category);
    const wilayas = new Map<string, number>();
    const categories = new Map<string, number>();
    for (const c of cards) {
      if (c.wilaya && (!category || c.categories.includes(category))) wilayas.set(c.wilaya, (wilayas.get(c.wilaya) || 0) + 1);
      if (!wilaya || c.wilayaSlug === wilaya) for (const k of c.categories) categories.set(k, (categories.get(k) || 0) + 1);
    }
    res.set('Cache-Control', 'public, max-age=60');
    res.json({
      total: cards.length,
      wilayas: WILAYAS.flatMap((name, i) => wilayas.has(name) ? [{ code: i + 1, slug: wilayaSlug(name), name, count: wilayas.get(name)! }] : []),
      categories: CATEGORIES.filter(([k]) => categories.has(k)).map(([slug]) => ({ slug, count: categories.get(slug)! })),
    });
  } catch (error) {
    logger.error('Directory facets error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/** GET /api/public/directory/salon/:slug — the card of one salon (listed or not), for its page's title and JSON-LD. */
export const directoryCard = async (req: Request, res: Response): Promise<void> => {
  try {
    const [card] = await buildCards({ slug: req.params.slug, isActive: true });
    if (!card) {
      res.status(404).json({ error: 'Salon not found' });
      return;
    }
    res.json(publicCard(card));
  } catch (error) {
    logger.error('Directory card error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const xml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** GET /sitemap.xml — marketing pages, directory filters and every listed salon. */
export const sitemap = async (_req: Request, res: Response): Promise<void> => {
  try {
    const base = (process.env.FRONTEND_URL || 'https://www.saloneo.app').replace(/\/$/, '');
    const cards = await listedCards();
    const paths = new Set(['/', '/pricing', '/salons']);
    for (const c of cards) {
      for (const k of c.categories) paths.add(`/salons/${k}`);
      if (!c.wilayaSlug) continue;
      paths.add(`/salons/${c.wilayaSlug}`);
      for (const k of c.categories) paths.add(`/salons/${c.wilayaSlug}/${k}`);
    }
    for (const c of cards) paths.add(`/salon/${encodeURIComponent(c.slug)}`);
    res.type('application/xml').set('Cache-Control', 'public, max-age=3600').send(
      '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
      + [...paths].map(p => `  <url><loc>${xml(base + p)}</loc></url>`).join('\n')
      + '\n</urlset>\n');
  } catch (error) {
    logger.error('Sitemap error:', error);
    res.status(500).send('');
  }
};
