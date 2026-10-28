import { Router } from 'express';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';
import * as waitlist from '../controllers/waitlist.controller';
import { authenticate } from '../middleware/auth';
import { TIMES_OF_DAY } from '../models/Waitlist';

const router = Router();

// Public (salon page / emailed links)
const joinLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false,
  message: { code: 'RATE_LIMITED', error: 'Trop de demandes, réessayez dans quelques minutes' } });
router.post(
  '/public/:slug',
  joinLimiter,
  [
    body('serviceId').isString().notEmpty(),
    body('stylistId').optional({ values: 'falsy' }).isString().trim(),
    body('from').isISO8601(),
    body('to').isISO8601(),
    body('timeOfDay').isIn(TIMES_OF_DAY as unknown as string[]),
    body('client.firstName').trim().notEmpty().isLength({ max: 60 }),
    body('client.lastName').optional().trim().isLength({ max: 60 }),
    body('client.phone').trim().notEmpty().isLength({ max: 30 }),
    body('client.email').optional({ values: 'falsy' }).isEmail().normalizeEmail(),
    body('consent').equals('true'),
    body('lang').optional().isString().isLength({ max: 5 }),
  ],
  waitlist.joinWaitlist
);
router.get('/public/entry/:token', waitlist.getEntryByToken);
router.post('/public/entry/:token/cancel', waitlist.leaveByToken);
router.get('/public/offer/:token', waitlist.getOffer);

// Dashboard
router.use(authenticate);
router.get('/', waitlist.listEntries);
router.get('/settings', waitlist.getSettings);
router.put('/settings', waitlist.updateSettings);
router.get('/:id/slots', waitlist.entrySlots);
router.post('/:id/offer', waitlist.offerManually);
router.delete('/:id', waitlist.removeById);

export default router;
