import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { validationResult } from 'express-validator';
import { User } from '../models/User';
import { Service } from '../models/Service';
import { TeamMember } from '../models/Team';
import { Appointment, AppointmentStatus } from '../models/Appointment';
import { Client } from '../models/Client';
import { logger } from '../utils/logger';
import { emailService } from '../services/emailService';
import crypto from 'crypto';

// Helper function to generate slug
import { findSalonBySlug } from '../services/salonLookup';
import {
  availabilityDays, bookWithLock, canDo, dateKey, dayNum, fmt, isDateKey, keyOf, loadContext, nowIn,
  resolveStylistId, sendAvailabilityError, staffName, toMin, PUBLIC_SERVICE, isPublicService, REASON_MESSAGES,
} from '../services/availability';

// Get salon info by slug
export const getSalonBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    const matchingUser = await findSalonBySlug(slug, 'firstName lastName establishmentName address phone email businessHours theme settings logo banner presentation publicPhone serviceDisplay showTeamOnPublicPage slug');

    if (!matchingUser) {
      res.status(404).json({ error: 'Salon not found' });
      return;
    }

    logger.info('🔍 Public API returning user data:', {
      userId: matchingUser._id,
      serviceDisplay: matchingUser.serviceDisplay,
      showTeamOnPublicPage: matchingUser.showTeamOnPublicPage
    });

    res.json(matchingUser);
  } catch (error) {
    logger.error('Get salon by slug error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Bookable days and times for one service (optionally one staff member) — no client data.
// GET /public/availability/:slug?serviceId&stylistId?&from=YYYY-MM-DD&days=N(<=14)&token? (token = own appointment when rescheduling)
export const getAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const salon = await findSalonBySlug(req.params.slug, 'settings');
    if (!salon) {
      res.status(404).json({ error: 'Salon not found' });
      return;
    }
    const { serviceId, stylistId, from, days, token } = req.query as Record<string, string | undefined>;
    if (!serviceId) {
      res.status(400).json({ error: 'serviceId is required' });
      return;
    }
    const count = Math.min(14, Math.max(1, parseInt(days || '7', 10) || 7));
    const start = isDateKey(from) ? from : nowIn(salon.settings?.timezone || 'Africa/Algiers').date;
    const own = token
      ? await Appointment.findOne({ 'tokens.modification': String(token), userId: salon._id }).select('_id').lean()
      : null;
    const loaded = await loadContext(salon._id as any, serviceId, { from: start, to: keyOf(dayNum(start) + count - 1) }, { excludeAppointmentId: own?._id });
    if (!loaded || !isPublicService(loaded.service)) {
      res.status(404).json({ error: REASON_MESSAGES.SERVICE_UNAVAILABLE, code: 'SERVICE_UNAVAILABLE' });
      return;
    }
    const { ctx, staffViews } = loaded;
    const eligible = new Set(ctx.staff.filter((m) => canDo(m, ctx.service.id)).map((m) => m.id));
    res.json({
      days: availabilityDays(ctx, start, count, resolveStylistId(stylistId)),
      staff: staffViews.filter((m) => eligible.has(m.id)),
      today: ctx.now.date,
      horizon: keyOf(dayNum(ctx.now.date) + ctx.service.horizonDays),
      slotInterval: ctx.booking.slotInterval,
      allowAnyStaff: ctx.booking.allowAnyStaff,
      duration: ctx.service.duration,
    });
  } catch (error) {
    logger.error('Get availability error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get services by slug
export const getServicesBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    const matchingUser = await findSalonBySlug(slug);

    if (!matchingUser) {
      res.status(404).json({ error: 'Salon not found' });
      return;
    }

    // Only services bookable online are shown on the public page
    const services = await Service.find({ userId: matchingUser._id, ...PUBLIC_SERVICE })
      .select('name description category duration price images currency');

    res.json(services);
  } catch (error) {
    logger.error('Get services by slug error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get team by slug
export const getTeamBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    const matchingUser = await findSalonBySlug(slug);

    if (!matchingUser) {
      res.status(404).json({ error: 'Salon not found' });
      return;
    }

    const teamMembers = await TeamMember.find({
      userId: matchingUser._id,
      isActive: true
    }).select('firstName lastName specialties avatar role workingHours color');

    // Formater les données pour correspondre à l'interface frontend PublicTeamMember
    const formattedTeam = teamMembers.map(member => ({
      _id: (member._id as any).toString(),
      firstName: member.firstName,
      lastName: member.lastName,
      role: member.role || member.specialties?.join(', ') || 'Membre de l\'équipe',
      specialties: member.specialties || [],
      avatar: member.avatar,
      color: (member as any).color,
      workingHours: (member as any).workingHours,
    }));

    res.json(formattedTeam);
  } catch (error) {
    logger.error('Get team by slug error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get salon info by public token
export const getSalonInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ 
      'tokens.public': token,
      isActive: true 
    }).select('establishmentName address phone socialMedia businessHours logo theme');

    if (!user) {
      res.status(404).json({ error: 'Salon not found' });
      return;
    }

    res.json({ salon: user });
  } catch (error) {
    logger.error('Get salon info error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get available services
export const getPublicServices = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;
    const { category } = req.query;

    const user = await User.findOne({ 
      'tokens.public': token,
      isActive: true 
    });

    if (!user) {
      res.status(404).json({ error: 'Salon not found' });
      return;
    }

    const query: any = { userId: user._id, ...PUBLIC_SERVICE, isPublic: true };
    if (category) query.category = category;

    const services = await Service.find(query)
      .select('name description category duration price images isOnline')
      .sort('category name');

    res.json({ services });
  } catch (error) {
    logger.error('Get public services error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get team members
export const getPublicTeamMembers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;
    const { serviceId } = req.query;

    const user = await User.findOne({ 
      'tokens.public': token,
      isActive: true 
    });

    if (!user) {
      res.status(404).json({ error: 'Salon not found' });
      return;
    }

    const query: any = { 
      userId: user._id,
      isActive: true 
    };

    if (serviceId) {
      query.services = serviceId;
    }

    const teamMembers = await TeamMember.find(query)
      .select('firstName lastName specialties avatar color')
      .populate('services', 'name');

    res.json({ teamMembers });
  } catch (error) {
    logger.error('Get public team members error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get available slots (legacy token API) — same engine as everything else
export const getPublicAvailableSlots = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;
    const { date, serviceId, teamMemberId } = req.query;

    if (!date || !serviceId) {
      res.status(400).json({ error: 'Date and service ID are required' });
      return;
    }

    const user = await User.findOne({ 'tokens.public': token, isActive: true }).select('_id');
    if (!user) {
      res.status(404).json({ error: 'Salon not found' });
      return;
    }

    const day = dateKey(String(date));
    const loaded = isDateKey(day) ? await loadContext(user._id as any, String(serviceId), { from: day, to: day }) : null;
    if (!loaded || !isPublicService(loaded.service) || loaded.service.isPublic === false) {
      res.status(404).json({ error: REASON_MESSAGES.SERVICE_UNAVAILABLE, code: 'SERVICE_UNAVAILABLE' });
      return;
    }

    const [result] = availabilityDays(loaded.ctx, day, 1, resolveStylistId(teamMemberId));
    res.json({ slots: result.slots.map((s) => s.time) });
  } catch (error) {
    logger.error('Get public available slots error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create appointment (legacy token API)
export const createPublicAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { token } = req.params;
    const { serviceId, teamMemberId, date, startTime, clientInfo, notes } = req.body;

    const user = await User.findOne({ 'tokens.public': token, isActive: true });
    if (!user) {
      res.status(404).json({ error: 'Salon not found' });
      return;
    }

    const service = await Service.findOne({ _id: serviceId, userId: user._id, ...PUBLIC_SERVICE, isPublic: true });
    if (!service) {
      res.status(404).json({ error: REASON_MESSAGES.SERVICE_UNAVAILABLE, code: 'SERVICE_UNAVAILABLE' });
      return;
    }

    const day = dateKey(date);
    const appointment = await bookWithLock(user._id as any, String(service._id), day, startTime, resolveStylistId(teamMemberId), async (stylistId) => {
      let client = await Client.findOne({ userId: user._id, email: clientInfo.email });
      if (!client) {
        client = new Client({
          userId: user._id,
          ...clientInfo,
          source: 'online',
          preferences: {
            language: 'fr',
            currency: 'EUR',
            notifications: { email: true, sms: true, whatsapp: false },
          },
        });
        await client.save();
      }
      const appt = new Appointment({
        userId: user._id,
        clientId: client._id,
        serviceId: String(service._id),
        stylistId,
        date: new Date(`${day}T00:00:00.000Z`),
        startTime,
        endTime: fmt(toMin(startTime) + service.duration),
        duration: service.duration,
        price: service.price,
        status: 'scheduled',
        notes,
        source: 'online',
        confirmationToken: crypto.randomBytes(16).toString('hex'),
        clientInfo: { firstName: client.firstName, lastName: client.lastName, phone: client.phone, email: client.email },
      });
      await appt.save();
      return appt;
    });

    res.status(201).json({
      appointment: {
        id: appointment._id,
        confirmationToken: appointment.confirmationToken,
        date: appointment.date,
        startTime: appointment.startTime,
        service: service.name,
        price: appointment.price,
      },
      message: 'Appointment created successfully'
    });
  } catch (error) {
    if (sendAvailabilityError(res, error)) return;
    logger.error('Create public appointment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get appointment by confirmation token
export const getAppointmentByToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { confirmationToken } = req.params;

    const appointment = await Appointment.findOne({ confirmationToken })
      .populate('serviceId', 'name duration')
      .populate('stylistId', 'firstName lastName');

    if (!appointment) {
      res.status(404).json({ error: 'Appointment not found' });
      return;
    }

    res.json({ appointment });
  } catch (error) {
    logger.error('Get appointment by token error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Shape returned to the public "manage my appointment" page (GET/PATCH by modification token)
const MANAGED_SALON_FIELDS = 'establishmentName slug address publicPhone theme settings';
async function managedAppointmentView(appointment: any) {
  const [service, stylist] = await Promise.all([
    Service.findById(appointment.serviceId).select('name').lean(),
    staffName(appointment.userId, appointment.stylistId),
  ]);
  return {
    id: appointment._id,
    date: appointment.date,
    startTime: appointment.startTime,
    endTime: appointment.endTime,
    duration: appointment.duration,
    price: appointment.price,
    status: appointment.status,
    notes: appointment.notes,
    serviceId: appointment.serviceId,
    serviceName: (service as any)?.name,
    stylistId: appointment.stylistId,
    stylistName: stylist,
    clientInfo: appointment.clientInfo,
    salon: appointment.userId,
    canModify: appointment.status === 'scheduled' || appointment.status === 'confirmed' || appointment.status === 'rescheduled',
    modificationToken: appointment.tokens.modification,
    confirmationToken: appointment.confirmationToken
  };
}

// Get appointment by modification token
export const getAppointmentByModificationToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;

    logger.info('Looking for appointment with modification token:', token);

    const appointment = await Appointment.findOne({ 
      'tokens.modification': token,
      status: { $ne: 'cancelled' }
    })
    .populate('clientId', 'firstName lastName email phone')
    .populate('userId', MANAGED_SALON_FIELDS);

    if (!appointment) {
      logger.warn('Appointment not found for modification token:', token);
      res.status(404).json({ error: 'Lien de modification invalide ou expiré' });
      return;
    }

    logger.info('Appointment found:', appointment._id);

    const response = await managedAppointmentView(appointment);

    res.json({ appointment: response });
  } catch (error) {
    logger.error('Get appointment by modification token error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Modify appointment using modification token (public)
export const modifyAppointmentByModificationToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { token } = req.params;
    const { date, startTime, stylistId, reason } = req.body as {
      date?: string;
      startTime?: string;
      stylistId?: string;
      reason?: string;
    };

    const appointment = await Appointment.findOne({
      'tokens.modification': token,
      status: { $in: ['scheduled', 'confirmed', 'rescheduled'] }
    });

    if (!appointment) {
      res.status(404).json({ error: 'Lien de modification invalide ou expiré' });
      return;
    }

    // Re-check the new slot with the same engine as booking (own appointment excluded), under the day lock
    const day = date ? dateKey(date) : dateKey(appointment.date);
    const time = startTime || appointment.startTime;
    const wantedStylist = resolveStylistId(stylistId) ?? appointment.stylistId;
    await bookWithLock(appointment.userId, appointment.serviceId, day, time, wantedStylist, async (assigned) => {
      const changes: Record<string, any> = {};
      if (date) { appointment.date = new Date(`${day}T00:00:00.000Z`); changes.date = day; }
      if (startTime) { appointment.startTime = startTime; changes.startTime = startTime; }
      if (assigned !== appointment.stylistId) { appointment.stylistId = assigned; changes.stylistId = assigned; }
      appointment.endTime = fmt(toMin(time) + (appointment.duration || 30));
      changes.endTime = appointment.endTime;

      appointment.modifications = appointment.modifications || [];
      appointment.modifications.push({ date: new Date(), modifiedBy: 'client', changes, reason });
      // Mark as rescheduled when modified
      if (changes.date || changes.startTime || changes.stylistId) appointment.status = AppointmentStatus.RESCHEDULED;
      await appointment.save();
    }, { excludeAppointmentId: appointment._id, duration: appointment.duration, publicOnly: true });

    // Return updated appointment (reuse formatter)
    const populated = await Appointment.findById(appointment._id)
      .populate('clientId', 'firstName lastName email phone')
      .populate('userId', MANAGED_SALON_FIELDS);

    res.json({ success: true, appointment: await managedAppointmentView(populated) });
  } catch (error) {
    if (sendAvailabilityError(res, error)) return;
    logger.error('Modify appointment by modification token error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Cancel appointment using modification token (public)
export const cancelAppointmentByModificationToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { token } = req.params;
    const { reason } = req.body as { reason?: string };

    const appointment = await Appointment.findOne({
      'tokens.modification': token,
      status: { $in: ['scheduled', 'confirmed', 'rescheduled'] }
    });

    if (!appointment) {
      res.status(404).json({ error: 'Lien de modification invalide ou expiré' });
      return;
    }

    appointment.status = AppointmentStatus.CANCELLED;
    appointment.cancellation = {
      reason,
      cancelledBy: 'client',
      cancelledAt: new Date(),
    };
    await appointment.save();

    res.json({ success: true, message: 'Appointment cancelled successfully' });
  } catch (error) {
    logger.error('Cancel appointment by modification token error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create public booking with complete client management
export const createPublicBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error('Validation errors:', errors.array());
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { slug } = req.params;
    const { 
      serviceId, 
      stylistId, 
      date, 
      startTime,
      clientData,
      notes 
    } = req.body;

    logger.info('Creating public booking:', { slug, serviceId, stylistId, date, startTime, clientData: { ...clientData, phone: '***' } });

    const matchingUser = await findSalonBySlug(slug);

    if (!matchingUser) {
      res.status(404).json({ error: 'Salon not found' });
      return;
    }

    // Verify service exists and get its details
    const service = Types.ObjectId.isValid(serviceId)
      ? await Service.findOne({ _id: serviceId, userId: matchingUser._id, ...PUBLIC_SERVICE })
      : null;

    if (!service) {
      logger.error('Service not bookable online:', serviceId);
      res.status(404).json({ error: REASON_MESSAGES.SERVICE_UNAVAILABLE, code: 'SERVICE_UNAVAILABLE' });
      return;
    }

    // Slot decided by the availability engine under the salon-day lock; no stylist = "peu importe" (least busy free staff)
    const day = dateKey(date);
    let stylistName = '';
    const { appointment, client } = await bookWithLock(matchingUser._id as any, String(service._id), day, startTime, resolveStylistId(stylistId), async (actualStylistId, loaded) => {
      stylistName = loaded.ctx.staff.find((m) => m.id === actualStylistId)?.name || '';
      const endTime = fmt(toMin(startTime) + service.duration);

      // Create or find client
      let client = await Client.findOne({
        userId: matchingUser._id,
        $or: [
          { email: clientData.email },
          { 
            firstName: clientData.firstName,
            lastName: clientData.lastName,
            phone: clientData.phone
          }
        ]
      });

      if (!client) {
        // Create new client
        client = new Client({
          userId: matchingUser._id,
          firstName: clientData.firstName,
          lastName: clientData.lastName,
          email: clientData.email || '',
          phone: clientData.phone,
          birthDate: clientData.birthDate ? new Date(clientData.birthDate) : undefined,
          address: clientData.address || '',
          source: 'online',
          isActive: true,
          preferences: {
            favoriteServices: [],
            preferredStylists: [actualStylistId],
            communicationPreferences: clientData.preferences?.communicationPreferences || {
              smsReminders: true,
              emailMarketing: false,
              birthdayOffers: false
            },
            hairQuestionnaire: clientData.hairQuestionnaire,
            skinQuestionnaire: clientData.skinQuestionnaire,
          },
          loyaltyPoints: 10, // Points de bienvenue
          notes: clientData.notes || '',
          history: {
            lastVisit: new Date(),
            totalVisits: 1,
            totalSpent: 0,
            averageSpent: 0,
          },
        });

        await client.save();
        logger.info('New client created:', client._id);
      } else {
        // Update existing client
        client.email = clientData.email || client.email;
        client.address = clientData.address || client.address;
        if (clientData.birthDate) {
          client.dateOfBirth = new Date(clientData.birthDate);
        }
      
        // Update preferences
        if (clientData.preferences?.communicationPreferences) {
          client.preferences.communicationPreferences = {
            ...client.preferences.communicationPreferences,
            ...clientData.preferences.communicationPreferences
          };
        }
      
        if (clientData.hairQuestionnaire) {
          client.preferences.hairQuestionnaire = clientData.hairQuestionnaire;
        }
      
        if (clientData.skinQuestionnaire) {
          client.preferences.skinQuestionnaire = clientData.skinQuestionnaire;
        }

        // Add loyalty points for return visit
        client.loyaltyPoints = (client.loyaltyPoints || 0) + 5;
        client.history.lastVisit = new Date();
      
        await client.save();
        logger.info('Existing client updated:', client._id);
      }

      // Create appointment
      const appointment = new Appointment({
        userId: matchingUser._id,
        clientId: client._id,
        serviceId: service._id,
        stylistId: actualStylistId,
        date: new Date(`${day}T00:00:00.000Z`),
        startTime,
        endTime,
        duration: service.duration,
        price: service.price,
        status: 'scheduled',
        notes: notes || '',
        source: 'online',
        confirmationToken: crypto.randomBytes(16).toString('hex'),
        tokens: {
          public: crypto.randomBytes(16).toString('hex'),
          modification: crypto.randomBytes(16).toString('hex'),
        },
        clientInfo: {
          firstName: client.firstName,
          lastName: client.lastName,
          phone: client.phone,
          email: client.email,
        },
      });

      await appointment.save();
      return { appointment, client };
    });
    logger.info('Appointment created successfully:', appointment._id);

    // Envoyer les emails de confirmation
    try {
      // Préparer les données communes pour l'email
      const emailData = {
        clientName: `${client.firstName} ${client.lastName}`,
        salonName: matchingUser.establishmentName || `${matchingUser.firstName} ${matchingUser.lastName}`,
        serviceName: service.name,
        appointmentDate: new Date(date).toLocaleDateString('fr-FR', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        appointmentTime: startTime,
        serviceDuration: service.duration.toString(),
        servicePrice: service.price.toString(),
        currency: (service as any).currency || (matchingUser as any).currency || 'DZD',
        staffName: stylistName,
        salonAddress: matchingUser.address || '',
        salonPhone: matchingUser.phone || '',
        salonEmail: matchingUser.email || '',
        salonLogo: matchingUser.logo || '',
        bookingUrl: `${process.env.FRONTEND_URL || 'https://saloneo.com'}/modify-appointment/${appointment.tokens.modification}`,
        modificationLink: `${process.env.FRONTEND_URL || 'https://saloneo.com'}/modify-appointment/${appointment.tokens.modification}`,
        confirmationToken: appointment.confirmationToken
      };

      // Email au client (seulement si l'email existe)
      if (client.email) {
        await emailService.sendTemplateEmail(
          'appointment-confirmation',
          client.email,
          emailData
        );
        logger.info('Confirmation email sent to client:', client.email);
      }

      // Email au salon (notification de nouvelle réservation)
      if (matchingUser.email) {
        await emailService.sendTemplateEmail(
          'appointment-confirmation',
          matchingUser.email,
          {
            ...emailData,
            clientPhone: client.phone,
            clientEmail: client.email,
            notes: notes || 'Aucune note',
            appointmentId: (appointment._id as any).toString()
          }
        );
        logger.info('Notification email sent to salon:', matchingUser.email);
      }
    } catch (emailError) {
      // Ne pas bloquer la création du rendez-vous si l'email échoue
      logger.error('Failed to send confirmation emails:', emailError);
    }

    res.status(201).json({
      success: true,
      appointment: {
        id: appointment._id,
        confirmationToken: appointment.confirmationToken,
        modificationToken: appointment.tokens.modification,
        date: appointment.date,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        duration: appointment.duration,
        price: appointment.price,
        status: appointment.status,
        stylistId: appointment.stylistId,
        stylistName,
      },
      client: {
        id: client._id,
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        phone: client.phone,
        loyaltyPoints: client.loyaltyPoints,
      },
      message: 'Rendez-vous créé avec succès'
    });

  } catch (error: any) {
    if (sendAvailabilityError(res, error)) return;
    logger.error('Create public booking error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      requestBody: req.body
    });
    
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      res.status(400).json({ 
        error: 'Erreur de validation', 
        details: error.message 
      });
    } else if (error.name === 'CastError') {
      res.status(400).json({ 
        error: 'Format de données invalide', 
        details: `Format invalide pour le champ: ${error.path}`
      });
    } else if (error.code === 11000) {
      res.status(409).json({ 
        error: 'Données en double', 
        details: 'Un rendez-vous avec ces informations existe déjà' 
      });
    } else {
      res.status(500).json({ 
        error: 'Erreur serveur',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

// Search appointments by client info (email, phone, or name)
export const searchAppointmentsByClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const { email, phone, firstName, lastName } = req.query;

    const matchingUser = await findSalonBySlug(slug);

    if (!matchingUser) {
      res.status(404).json({ error: 'Salon not found' });
      return;
    }

    // Build search criteria
    let searchCriteria: any = {};

    if (email) {
      // Search by email
      const clients = await Client.find({
        userId: matchingUser._id,
        email: email as string
      });
      
      if (clients.length > 0) {
        searchCriteria.clientId = { $in: clients.map(c => c._id) };
      } else {
        res.json([]); // No clients found with this email
        return;
      }
    } else if (phone) {
      // Search by phone
      const clients = await Client.find({
        userId: matchingUser._id,
        phone: phone as string
      });
      
      if (clients.length > 0) {
        searchCriteria.clientId = { $in: clients.map(c => c._id) };
      } else {
        res.json([]); // No clients found with this phone
        return;
      }
    } else if (firstName && lastName) {
      // Search by name
      const clients = await Client.find({
        userId: matchingUser._id,
        firstName: new RegExp(firstName as string, 'i'),
        lastName: new RegExp(lastName as string, 'i')
      });
      
      if (clients.length > 0) {
        searchCriteria.clientId = { $in: clients.map(c => c._id) };
      } else {
        res.json([]); // No clients found with this name
        return;
      }
    } else {
      res.status(400).json({ error: 'Please provide email, phone, or both firstName and lastName' });
      return;
    }

    // Find appointments for the matching clients
    const appointments = await Appointment.find({
      userId: matchingUser._id,
      ...searchCriteria,
      status: { $ne: 'cancelled' }
    })
    .populate('clientId', 'firstName lastName email phone')
    .populate('serviceId', 'name duration price')
    .sort({ date: -1, startTime: -1 });

    // Format appointments for frontend
    const formattedAppointments = appointments.map(appointment => ({
      id: appointment._id,
      date: appointment.date,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      duration: appointment.duration,
      price: appointment.price,
      status: appointment.status,
      notes: appointment.notes,
      serviceId: appointment.serviceId,
      serviceName: (appointment.serviceId as any)?.name || 'Service',
      stylistId: appointment.stylistId,
      clientInfo: appointment.clientInfo,
      modificationToken: appointment.tokens?.modification,
      confirmationToken: appointment.confirmationToken,
      canModify: appointment.status === 'scheduled' || appointment.status === 'confirmed' || appointment.status === 'rescheduled'
    }));

    res.json(formattedAppointments);
  } catch (error) {
    logger.error('Search appointments by client error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Cancel appointment
export const cancelPublicAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { confirmationToken } = req.params;
    const { reason } = req.body;

    const appointment = await Appointment.findOne({ 
      confirmationToken,
      status: { $in: ['scheduled', 'confirmed'] }
    });

    if (!appointment) {
      res.status(404).json({ error: 'Appointment not found or already cancelled' });
      return;
    }

    appointment.status = AppointmentStatus.CANCELLED;
    appointment.cancellation = {
      reason,
      cancelledBy: 'client',
      cancelledAt: new Date(),
    };
    await appointment.save();

    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    logger.error('Cancel public appointment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
