import { Response } from 'express';
import { validationResult } from 'express-validator';
import { Types } from 'mongoose';
import { Appointment } from '../models/Appointment';
import { Client } from '../models/Client';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';
import { subscriptionEmailService } from '../services/subscriptionEmailService';
import {
  DAYS, availabilityDays, bookWithLock, canDo, checkSlot, dateKey, dayNum, fmt, isDateKey, keyOf, loadContext,
  normalizeBooking, normalizeBusinessHours, normalizeRanges, resolveStylistId, sendAvailabilityError, toMin, weekday,
} from '../services/availability';

// Helper function to validate and convert ObjectId
const validateObjectId = (id: string): Types.ObjectId | null => {
  return Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : null;
};

export const getAllAppointments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      startDate, 
      endDate,
      clientId,
      serviceId,
      teamMemberId 
    } = req.query;
    const userId = req.userId;

    const query: any = { userId };
    
    // Status filter
    if (status) {
      query.status = status;
    }

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate as string);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate as string);
      }
    }

    // Other filters
    if (clientId) query.clientId = clientId;
    if (serviceId) query.serviceId = serviceId;
    if (teamMemberId) query.stylistId = teamMemberId;

    const perPage = Math.min(500, Math.max(1, Number(limit) || 10));
    const skip = (Math.max(1, Number(page) || 1) - 1) * perPage;
    
    const [appointments, total] = await Promise.all([
      Appointment.find(query)
        .populate('clientId', 'firstName lastName email phone')
        .populate('serviceId', 'name duration price color')
        .populate('stylistId', 'firstName lastName')
        .sort({ date: -1, startTime: -1, _id: -1 }) // _id: stable order across pages
        .skip(skip)
        .limit(perPage),
      Appointment.countDocuments(query),
    ]);

    res.json({
      appointments,
      pagination: {
        page: Math.max(1, Number(page) || 1),
        limit: perPage,
        total,
        pages: Math.ceil(total / perPage),
      },
    });
  } catch (error) {
    logger.error('Get all appointments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAppointmentById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const appointment = await Appointment.findOne({ _id: id, userId })
      .populate('clientId')
      .populate('serviceId')
      .populate('stylistId');
    
    if (!appointment) {
      res.status(404).json({ error: 'Appointment not found' });
      return;
    }

    res.json({ appointment });
  } catch (error) {
    logger.error('Get appointment by id error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const createAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error('Validation errors:', errors.array());
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const userId = req.userId;
    logger.info('Creating appointment with data:', { ...req.body, userId });
    
    const { clientId, serviceId, teamMemberId, date, startTime, notes } = req.body;

    // Vérifier que teamMemberId est présent
    if (!teamMemberId) {
      logger.error('Tentative de création de rendez-vous sans coiffeur');
      res.status(400).json({ error: 'Un coiffeur doit être sélectionné pour créer un rendez-vous' });
      return;
    }

    // Validate client ID (must be ObjectId from API)
    const validClientId = validateObjectId(clientId);
    if (!validClientId) {
      logger.error('Invalid client ObjectId:', clientId);
      res.status(400).json({ 
        error: 'Invalid client ID format',
        details: 'Client ID must be a valid ObjectId'
      });
      return;
    }

    // Verify client exists
    const client = await Client.findOne({ _id: validClientId, userId });
    if (!client) {
      logger.error('Client not found:', { clientId: validClientId });
      res.status(400).json({ error: 'Invalid client' });
      return;
    }

    // For services and team members, we accept UUIDs from local stores
    // Note: In a full implementation, these should also be stored in the database
    logger.info('Using local store IDs for service and team member:', { serviceId, teamMemberId });

    // Duration and price come from the salon's service; fall back when the id is not a stored service.
    // The availability engine decides under the salon-day lock (force = "Ajouter quand même" from the owner).
    const day = dateKey(date);
    const appointment = await bookWithLock(userId!, String(serviceId), day, startTime, resolveStylistId(teamMemberId), async (stylistId, { service }) => {
      const duration = service?.duration || 30;
      const appt = new Appointment({
        userId,
        clientId: validClientId,
        serviceId: String(serviceId),
        stylistId,
        date: new Date(`${day}T00:00:00.000Z`),
        startTime,
        endTime: fmt(toMin(startTime) + duration),
        duration,
        price: service?.price ?? 0,
        status: 'scheduled',
        notes,
        clientInfo: {
          firstName: client.firstName,
          lastName: client.lastName,
          phone: client.phone,
          email: client.email,
        },
      });
      await appt.save();
      return appt;
    }, { staffMode: true, force: req.body.force === true, forceOverlap: req.body.forceOverlap === true });

    await appointment.populate([
      { path: 'clientId', select: 'firstName lastName email phone' },
      { path: 'serviceId', select: 'name duration price color' },
      { path: 'stylistId', select: 'firstName lastName' },
    ]);

    logger.info('Appointment created successfully:', appointment._id);
    
    // Send appointment confirmation email (async, don't wait for it)
    subscriptionEmailService.sendAppointmentConfirmation((appointment._id as any).toString()).catch(err => {
      logger.error('Failed to send appointment confirmation email:', err);
    });

    res.status(201).json({ appointment });

    // Emit socket event (disabled for deployment)
    try {
    } catch (socketError) {
      logger.error('Socket emit error:', socketError);
      // Don't fail the request if socket fails
    }
  } catch (error: any) {
    if (sendAvailabilityError(res, error)) return;
    logger.error('Create appointment error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      requestBody: req.body
    });
    
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      res.status(400).json({ 
        error: 'Validation error', 
        details: error.message 
      });
    } else if (error.name === 'CastError') {
      res.status(400).json({ 
        error: 'Invalid data format', 
        details: `Format invalide pour le champ: ${error.path}`
      });
    } else if (error.code === 11000) {
      res.status(409).json({ 
        error: 'Duplicate entry', 
        details: 'An appointment with this information already exists' 
      });
    } else {
      res.status(500).json({ 
        error: 'Server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

export const updateAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { id } = req.params;
    const userId = req.userId;
    const updates = req.body;

    const appointment = await Appointment.findOne({ _id: id, userId });
    if (!appointment) {
      res.status(404).json({ error: 'Appointment not found' });
      return;
    }

    // Only known fields are written; teamMemberId maps to stylistId
    const set: Record<string, any> = {};
    if (updates.clientId) set.clientId = updates.clientId;
    if (updates.notes !== undefined) set.notes = updates.notes;

    // Moving the appointment (date, time, staff or service) goes through the availability engine, own slot excluded
    const serviceChanged = !!updates.serviceId && String(updates.serviceId) !== String(appointment.serviceId);
    const day = dateKey(updates.date || appointment.date);
    const time = updates.startTime || appointment.startTime;
    const wanted = resolveStylistId(updates.teamMemberId) ?? appointment.stylistId;
    const moved = serviceChanged || wanted !== appointment.stylistId || day !== dateKey(appointment.date) || toMin(time) !== toMin(appointment.startTime);
    if (moved) {
      const serviceId = String(updates.serviceId || appointment.serviceId);
      await bookWithLock(userId!, serviceId, day, time, wanted, async (stylistId, { service }) => {
        const duration = serviceChanged ? service?.duration || 30 : appointment.duration || 30;
        Object.assign(set, {
          serviceId, stylistId, startTime: time, duration,
          date: new Date(`${day}T00:00:00.000Z`),
          endTime: fmt(toMin(time) + duration),
          ...(serviceChanged && service ? { price: service.price } : {}),
        });
        await Appointment.updateOne({ _id: id }, { $set: set }, { runValidators: true });
      }, {
        excludeAppointmentId: appointment._id,
        staffMode: true,
        duration: serviceChanged ? undefined : appointment.duration,
        force: updates.force === true,
        forceOverlap: updates.forceOverlap === true,
      });
    } else if (Object.keys(set).length) {
      await Appointment.updateOne({ _id: id }, { $set: set }, { runValidators: true });
    }

    const updatedAppointment = await Appointment.findById(id).populate([
      { path: 'clientId', select: 'firstName lastName email phone' },
      { path: 'serviceId', select: 'name duration price color' },
      { path: 'stylistId', select: 'firstName lastName' },
    ]);

    // Send appointment modification email (async, don't wait for it)
    // Note: We pass dummy old values since we don't track them in the current implementation
    const oldDate = appointment.date;
    const oldTime = appointment.startTime;
    subscriptionEmailService.sendAppointmentModification(
      (updatedAppointment!._id as any).toString(),
      oldDate,
      oldTime
    ).catch(err => {
      logger.error('Failed to send appointment modification email:', err);
    });

    res.json({ appointment: updatedAppointment });

    // Emit socket event (disabled for deployment)
  } catch (error) {
    if (sendAvailabilityError(res, error)) return;
    logger.error('Update appointment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateAppointmentStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status: string };
    const userId = req.userId;

    // Normalize legacy / UI-friendly statuses
    const normalizedStatus = (() => {
      if (!status) return status;
      if (status === 'noShow') return 'no_show';
      return status;
    })();

    const appointment = await Appointment.findOneAndUpdate(
      { _id: id, userId },
      { status: normalizedStatus },
      { new: true, runValidators: true }
    ).populate([
      { path: 'clientId', select: 'firstName lastName email phone' },
      { path: 'serviceId', select: 'name duration price color' },
      { path: 'stylistId', select: 'firstName lastName' },
    ]);

    if (!appointment) {
      res.status(404).json({ error: 'Appointment not found' });
      return;
    }

    res.json({ appointment });

    // Emit socket event (disabled for deployment)
  } catch (error) {
    logger.error('Update appointment status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const appointment = await Appointment.findOneAndDelete({ _id: id, userId });

    if (!appointment) {
      res.status(404).json({ error: 'Appointment not found' });
      return;
    }

    // Send appointment cancellation email (async, don't wait for it)
    subscriptionEmailService.sendAppointmentCancellation((appointment._id as any).toString()).catch(err => {
      logger.error('Failed to send appointment cancellation email:', err);
    });

    res.json({ message: 'Appointment deleted successfully' });

    // Emit socket event (disabled for deployment)
  } catch (error) {
    logger.error('Delete appointment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /appointments/available-slots?serviceId&teamMemberId?&date=YYYY-MM-DD | from&days(<=14) &includeBusy=1 &excludeId
// Same engine as the public page (staff mode: no minimum notice). includeBusy adds, for the day's opening range,
// every aligned time with the reason it cannot be booked (null = free) — the form offers "Ajouter quand même".
export const getAvailableSlots = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { serviceId, teamMemberId, includeBusy, excludeId } = req.query as Record<string, string | undefined>;
    const date = req.query.date ? dateKey(req.query.date as any) : undefined;
    const from = date || (isDateKey(req.query.from) ? (req.query.from as string) : undefined);
    if (!from || !serviceId) {
      res.status(400).json({ error: 'Date and service ID are required' });
      return;
    }
    const days = date ? 1 : Math.min(14, Math.max(1, parseInt(String(req.query.days || '7'), 10) || 7));
    const exclude = excludeId && Types.ObjectId.isValid(excludeId) ? new Types.ObjectId(excludeId) : undefined;
    const loaded = await loadContext(req.userId!, serviceId, { from, to: keyOf(dayNum(from) + days - 1) }, { staffMode: true, excludeAppointmentId: exclude });
    if (!loaded) {
      res.status(404).json({ error: 'Salon not found' });
      return;
    }
    const { ctx, staffViews, configured } = loaded;
    const stylistId = resolveStylistId(teamMemberId);
    const result = availabilityDays(ctx, from, days, stylistId);

    let busy: { time: string; reason: string | null; staff: string[] }[] | undefined;
    if (includeBusy === '1' || includeBusy === 'true') {
      const day = ctx.hours[weekday(from)];
      const pool = stylistId ? ctx.staff.filter((m) => m.id === stylistId) : ctx.staff.filter((m) => canDo(m, ctx.service.id));
      busy = [];
      for (let t = toMin(day.start); t < toMin(day.end); t += ctx.booking.slotInterval) {
        // An actual booking is reported before hours/notice (those can be forced, a double booking rarely should)
        const reasons = pool.map((m) => ({ id: m.id, reason: checkSlot(ctx, m, from, t, { ignoreHours: true }) || checkSlot(ctx, m, from, t) }));
        const free = reasons.filter((r) => !r.reason).map((r) => r.id);
        busy.push({
          time: fmt(t),
          reason: free.length ? null : reasons.some((r) => r.reason === 'SLOT_TAKEN') ? 'SLOT_TAKEN' : reasons[0]?.reason || 'STAFF_UNAVAILABLE',
          staff: free,
        });
      }
    }

    res.json({
      slots: result[0].slots.map((s) => s.time),
      days: result,
      ...(busy ? { busy } : {}),
      staff: staffViews,
      configured,
    });
  } catch (error) {
    logger.error('Get available slots error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Salon hours, booking rules and closures — normalized, with defaults filled in.
export const getBookingSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user: any = await User.findById(req.userId).select('businessHours bookingSettings closures').lean();
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const { hours, configured } = normalizeBusinessHours(user.businessHours);
    res.json({ hours, configured, bookingSettings: normalizeBooking(user.bookingSettings), closures: normalizeRanges(user.closures) });
  } catch (error) {
    logger.error('Get booking settings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateBookingSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { hours, bookingSettings, closures } = req.body || {};
    const set: Record<string, any> = {};
    if (hours && typeof hours === 'object') {
      const normalized = normalizeBusinessHours(hours);
      if (!normalized.configured) {
        res.status(400).json({ error: 'Invalid hours' });
        return;
      }
      // Stored per day; the legacy single-range shape is converted on first save
      set.businessHours = Object.fromEntries(DAYS.map((d) => [d, normalized.hours[d]]));
    }
    if (bookingSettings && typeof bookingSettings === 'object') set.bookingSettings = normalizeBooking(bookingSettings);
    if (Array.isArray(closures)) set.closures = normalizeRanges(closures).slice(0, 200);
    const user: any = await User.findByIdAndUpdate(req.userId, { $set: set }, { new: true, runValidators: true })
      .select('businessHours bookingSettings closures').lean();
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const n = normalizeBusinessHours(user.businessHours);
    res.json({ hours: n.hours, configured: n.configured, bookingSettings: normalizeBooking(user.bookingSettings), closures: normalizeRanges(user.closures) });
  } catch (error) {
    logger.error('Update booking settings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
