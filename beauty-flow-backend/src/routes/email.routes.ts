import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { emailService } from '../services/emailService';
import { subscriptionEmailService } from '../services/subscriptionEmailService';
import { logger } from '../utils/logger';

const router = Router();

// Test email connection
router.get('/test-connection', authenticate, async (_req, res) => {
  try {
    const isConnected = await emailService.testConnection();
    res.json({ 
      success: isConnected,
      message: isConnected ? 'Email service is connected' : 'Email service connection failed'
    });
  } catch (error) {
    logger.error('Email connection test error:', error);
    res.status(500).json({ error: 'Failed to test email connection' });
  }
});

// Send test email
router.post('/test', authenticate, async (req: AuthRequest, res) => {
  try {
    const { to } = req.body;
    const { User } = await import('../models/User');
    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    await emailService.sendTestEmail(to || user.email);
    res.json({ message: 'Test email sent successfully' });
  } catch (error) {
    logger.error('Test email error:', error);
    res.status(500).json({ error: 'Failed to send test email' });
  }
});

// Get email logs
router.get('/logs', authenticate, async (req: AuthRequest, res) => {
  try {
    const { status, from, to } = req.query;
    const filters: any = { userId: req.userId };
    
    if (status) filters.status = status;
    if (from) filters.from = new Date(from as string);
    if (to) filters.to = new Date(to as string);
    
    const logs = await emailService.getEmailLogs(filters);
    res.json(logs);
  } catch (error) {
    logger.error('Get email logs error:', error);
    res.status(500).json({ error: 'Failed to get email logs' });
  }
});

// Get email statistics
router.get('/stats', authenticate, async (_req, res) => {
  try {
    const stats = await emailService.getEmailStats();
    res.json(stats);
  } catch (error) {
    logger.error('Get email stats error:', error);
    res.status(500).json({ error: 'Failed to get email statistics' });
  }
});

// Reset subscription notifications (for testing)
router.post('/reset-notifications', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    await subscriptionEmailService.resetNotifications(req.userId);
    res.json({ message: 'Notifications reset successfully' });
  } catch (error) {
    logger.error('Reset notifications error:', error);
    res.status(500).json({ error: 'Failed to reset notifications' });
  }
});

// Manually trigger subscription checks (for testing)
router.post('/check-subscriptions', authenticate, async (_req, res) => {
  try {
    await subscriptionEmailService.checkExpiringSubscriptions();
    await subscriptionEmailService.checkUsageLimits();
    res.json({ message: 'Subscription checks completed' });
  } catch (error) {
    logger.error('Subscription check error:', error);
    res.status(500).json({ error: 'Failed to check subscriptions' });
  }
});

// Manually send appointment reminders (for testing)
router.post('/send-reminders', authenticate, async (_req, res) => {
  try {
    await subscriptionEmailService.sendAppointmentReminders24h();
    await subscriptionEmailService.sendAppointmentReminders2h();
    res.json({ message: 'Reminders sent successfully' });
  } catch (error) {
    logger.error('Send reminders error:', error);
    res.status(500).json({ error: 'Failed to send reminders' });
  }
});

export default router;
