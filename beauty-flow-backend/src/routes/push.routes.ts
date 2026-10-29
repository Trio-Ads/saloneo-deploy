import { Router, Response } from 'express';
import { AuthRequest, authenticateAny } from '../middleware/auth';
import { isPushSubscription, subscribe, unsubscribe, vapidKeys } from '../services/push';
import { logger } from '../utils/logger';

const router = Router();

router.get('/key', async (_req, res) => {
  try {
    res.json({ publicKey: (await vapidKeys()).publicKey });
  } catch (e) {
    logger.error('VAPID key error', e);
    res.status(503).json({ error: 'Push unavailable' });
  }
});

router.post('/subscribe', authenticateAny, async (req: AuthRequest, res: Response) => {
  if (!isPushSubscription(req.body?.subscription)) { res.status(400).json({ error: 'Invalid subscription' }); return; }
  try {
    await subscribe(req.actor!.id, req.body.subscription);
    res.json({ ok: true });
  } catch (e) {
    logger.error('Push subscribe error', e);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/unsubscribe', authenticateAny, async (req: AuthRequest, res: Response) => {
  try {
    if (typeof req.body?.endpoint === 'string') await unsubscribe(req.actor!.id, req.body.endpoint);
    res.json({ ok: true });
  } catch (e) {
    logger.error('Push unsubscribe error', e);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
