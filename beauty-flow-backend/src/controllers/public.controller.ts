import { Request, Response } from 'express';
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
const generateSalonSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Get salon info by slug
export const getSalonBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    // Récupérer TOUS les utilisateurs actifs
    const users = await User.find({ 
      isActive: true 
    }).select('firstName lastName establishmentName address phone email businessHours theme settings logo banner presentation serviceDisplay showTeamOnPublicPage');

    if (!users || users.length === 0) {
      res.status(404).json({ error: 'No active salons found' });
      return;
    }

    // Chercher l'utilisateur dont le slug correspond
    let matchingUser = null;
    for (const user of users) {
      const userSlug = generateSalonSlug(user.establishmentName || `${user.firstName} ${user.lastName}`);
      if (userSlug === slug) {
        matchingUser = user;
        break;
      }
    }

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

// Get services by slug
export const getServicesBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    // Récupérer TOUS les utilisateurs actifs
    const users = await User.find({ 
      isActive: true 
    }).select('firstName lastName establishmentName');

    if (!users || users.length === 0) {
      res.status(404).json({ error: 'No active salons found' });
      return;
    }

    // Chercher l'utilisateur dont le slug correspond
    let matchingUser = null;
    for (const user of users) {
      const userSlug = generateSalonSlug(user.establishmentName || `${user.firstName} ${user.lastName}`);
      if (userSlug === slug) {
        matchingUser = user;
        break;
      }
    }

    if (!matchingUser) {
      res.status(404).json({ error: 'Salon not found' });
      return;
    }

    const services = await Service.find({ 
      userId: matchingUser._id,
      isActive: true
    }).select('name description category duration price images currency');

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

    // Récupérer TOUS les utilisateurs actifs
    const users = await User.find({ 
      isActive: true 
    }).select('firstName lastName establishmentName');

    if (!users || users.length === 0) {
      res.status(404).json({ error: 'No active salons found' });
      return;
    }

    // Chercher l'utilisateur dont le slug correspond
    let matchingUser = null;
    for (const user of users) {
      const userSlug = generateSalonSlug(user.establishmentName || `${user.firstName} ${user.lastName}`);
      if (userSlug === slug) {
        matchingUser = user;
        break;
      }
    }

    if (!matchingUser) {
      res.status(404).json({ error: 'Salon not found' });
      return;
    }

    const teamMembers = await TeamMember.find({ 
      userId: matchingUser._id,
      isActive: true 
    }).select('firstName lastName specialties avatar role');

    // Formater les données pour correspondre à l'interface frontend
    const formattedTeam = teamMembers.map(member => ({
      id: member._id,
      name: `${member.firstName} ${member.lastName}`,
      role: member.role || member.specialties?.join(', ') || 'Membre de l\'équipe',
      image: member.avatar
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
    const { category, isOnline } = req.query;

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
      isActive: true,
      isPublic: true
    };

    if (category) query.category = category;
    if (isOnline !== undefined) query.isOnline = isOnline === 'true';

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

// Get available slots
export const getPublicAvailableSlots = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;
    const { date, serviceId, teamMemberId } = req.query;

    if (!date || !serviceId) {
      res.status(400).json({ error: 'Date and service ID are required' });
      return;
    }

    const user = await User.findOne({ 
      'tokens.public': token,
      isActive: true 
    });

    if (!user) {
      res.status(404).json({ error: 'Salon not found' });
      return;
    }

    const service = await Service.findOne({ 
      _id: serviceId,
      userId: user._id,
      isActive: true,
      isPublic: true
    });

    if (!service) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }

    // Get team member working hours
    let workingHours = {
      start: '09:00',
      end: '18:00',
      breaks: [{ start: '12:00', end: '13:00' }],
    };

    if (teamMemberId) {
      const teamMember = await TeamMember.findOne({ 
        _id: teamMemberId, 
        userId: user._id,
        isActive: true
      });
      
      if (teamMember) {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayOfWeek = days[new Date(date as string).getDay()];
        const daySchedule = (teamMember.workingHours as any)[dayOfWeek];
        
        if (daySchedule && daySchedule.isWorking) {
          workingHours = {
            start: daySchedule.start || '09:00',
            end: daySchedule.end || '18:00',
            breaks: (daySchedule.breaks as any[]) || [],
          };
        }
      }
    }

    // Get existing appointments
    const appointments = await Appointment.find({
      userId: user._id,
      date: new Date(date as string),
      stylistId: teamMemberId,
      status: { $ne: 'cancelled' },
    });

    // Generate available slots (reuse logic from appointments controller)
    const slots = generateAvailableSlots(
      workingHours,
      appointments,
      service.duration,
      service.buffer
    );

    res.json({ slots });
  } catch (error) {
    logger.error('Get public available slots error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create appointment
export const createPublicAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { token } = req.params;
    const { 
      serviceId, 
      teamMemberId, 
      date, 
      startTime,
      clientInfo,
      notes 
    } = req.body;

    // Vérifier que teamMemberId est présent
    if (!teamMemberId) {
      logger.error('Tentative de création de rendez-vous sans coiffeur');
      res.status(400).json({ error: 'Un coiffeur doit être sélectionné pour créer un rendez-vous' });
      return;
    }

    const user = await User.findOne({ 
      'tokens.public': token,
      isActive: true 
    });

    if (!user) {
      res.status(404).json({ error: 'Salon not found' });
      return;
    }

    // Verify service
    const service = await Service.findOne({ 
      _id: serviceId,
      userId: user._id,
      isActive: true,
      isPublic: true
    });

    if (!service) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }

    // Create or find client
    let client = await Client.findOne({
      userId: user._id,
      email: clientInfo.email
    });

    if (!client) {
      client = new Client({
        userId: user._id,
        ...clientInfo,
        source: 'online',
        preferences: {
          language: 'fr',
          currency: 'EUR',
          notifications: {
            email: true,
            sms: true,
            whatsapp: false,
          },
        },
      });
      await client.save();
    }

    // Calculate end time
    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(startDateTime.getTime() + service.duration * 60000);
    const endTime = endDateTime.toTimeString().slice(0, 5);

    // Create appointment
    const appointment = new Appointment({
      userId: user._id,
      clientId: client._id,
      serviceId,
      stylistId: teamMemberId,
      date: new Date(date),
      startTime,
      endTime,
      duration: service.duration,
      price: service.price,
      status: 'scheduled',
      notes,
      source: 'online',
      confirmationToken: crypto.randomBytes(16).toString('hex'),
      clientInfo: {
        firstName: client.firstName,
        lastName: client.lastName,
        phone: client.phone,
        email: client.email,
      },
    });

    await appointment.save();

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
    .populate('userId', 'firstName lastName establishmentName');

    if (!appointment) {
      logger.warn('Appointment not found for modification token:', token);
      res.status(404).json({ error: 'Lien de modification invalide ou expiré' });
      return;
    }

    logger.info('Appointment found:', appointment._id);

    // Format the response for the frontend
    const response = {
      id: appointment._id,
      date: appointment.date,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      duration: appointment.duration,
      price: appointment.price,
      status: appointment.status,
      notes: appointment.notes,
      serviceId: appointment.serviceId,
      stylistId: appointment.stylistId,
      clientInfo: appointment.clientInfo,
      client: appointment.clientId,
      salon: appointment.userId,
      canModify: appointment.status === 'scheduled' || appointment.status === 'confirmed',
      modificationToken: appointment.tokens.modification,
      confirmationToken: appointment.confirmationToken
    };

    res.json({ appointment: response });
  } catch (error) {
    logger.error('Get appointment by modification token error:', error);
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

    // Vérifier que stylistId est présent
    if (!stylistId) {
      logger.error('Tentative de création de rendez-vous sans coiffeur');
      res.status(400).json({ error: 'Un coiffeur doit être sélectionné pour créer un rendez-vous' });
      return;
    }

    logger.info('Creating public booking:', { slug, serviceId, stylistId, date, startTime, clientData: { ...clientData, phone: '***' } });

    // Find salon by slug
    const users = await User.find({ isActive: true }).select('firstName lastName establishmentName');
    let matchingUser = null;
    
    for (const user of users) {
      const userSlug = generateSalonSlug(user.establishmentName || `${user.firstName} ${user.lastName}`);
      if (userSlug === slug) {
        matchingUser = user;
        break;
      }
    }

    if (!matchingUser) {
      res.status(404).json({ error: 'Salon not found' });
      return;
    }

    // Verify service exists and get its details
    const service = await Service.findOne({
      _id: serviceId,
      userId: matchingUser._id,
      isActive: true
    });

    if (!service) {
      logger.error('Service not found:', serviceId);
      res.status(404).json({ error: 'Service non trouvé' });
      return;
    }

    // Handle owner vs team member
    let actualStylistId = stylistId;
    let stylistName = '';
    
    // Check if stylistId has "owner-" prefix
    if (stylistId.startsWith('owner-')) {
      // Extract the actual user ID
      const ownerId = stylistId.replace('owner-', '');
      
      // Verify it matches the salon owner
      if (ownerId !== (matchingUser._id as any).toString()) {
        logger.error('Owner ID mismatch:', { provided: ownerId, expected: matchingUser._id });
        res.status(400).json({ error: 'ID propriétaire invalide' });
        return;
      }
      
      // Use the owner's ID directly
      actualStylistId = (matchingUser._id as any).toString();
      stylistName = `${matchingUser.firstName} ${matchingUser.lastName}`;
      
      logger.info('Using salon owner as stylist:', {
        ownerId: actualStylistId,
        ownerName: stylistName
      });
    } else {
      // Verify team member exists
      const teamMember = await TeamMember.findOne({
        _id: stylistId,
        userId: matchingUser._id,
        isActive: true
      });

      if (!teamMember) {
        logger.error('Team member not found:', stylistId);
        res.status(404).json({ error: 'Coiffeur non trouvé' });
        return;
      }
      
      stylistName = `${teamMember.firstName} ${teamMember.lastName}`;
    }

    logger.info('Service and stylist verified:', {
      serviceName: service.name,
      duration: service.duration,
      price: service.price,
      stylistName: stylistName
    });

    // Calculate end time using service duration
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const totalMinutes = startHours * 60 + startMinutes + service.duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;

    // Check for appointment conflicts
    const existingAppointments = await Appointment.find({
      userId: matchingUser._id,
      date: new Date(date),
      stylistId: actualStylistId,
      status: { $ne: 'cancelled' },
      $or: [
        {
          $and: [
            { startTime: { $lte: startTime } },
            { endTime: { $gt: startTime } }
          ]
        },
        {
          $and: [
            { startTime: { $lt: endTime } },
            { endTime: { $gte: endTime } }
          ]
        },
        {
          $and: [
            { startTime: { $gte: startTime } },
            { endTime: { $lte: endTime } }
          ]
        }
      ]
    });

    if (existingAppointments.length > 0) {
      res.status(400).json({ error: 'Ce créneau n\'est plus disponible' });
      return;
    }

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
      date: new Date(date),
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

    // Find salon by slug
    const users = await User.find({ isActive: true }).select('firstName lastName establishmentName');
    let matchingUser = null;
    
    for (const user of users) {
      const userSlug = generateSalonSlug(user.establishmentName || `${user.firstName} ${user.lastName}`);
      if (userSlug === slug) {
        matchingUser = user;
        break;
      }
    }

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
      canModify: appointment.status === 'scheduled' || appointment.status === 'confirmed'
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

// Helper function (reused from appointments controller)
function generateAvailableSlots(
  workingHours: any,
  appointments: any[],
  duration: number,
  buffer?: { before?: number; after?: number }
): string[] {
  const slots: string[] = [];
  const slotDuration = duration + (buffer?.before || 0) + (buffer?.after || 0);
  
  const startMinutes = timeToMinutes(workingHours.start);
  const endMinutes = timeToMinutes(workingHours.end);
  
  for (let time = startMinutes; time + slotDuration <= endMinutes; time += 15) {
    const slotStart = minutesToTime(time + (buffer?.before || 0));
    
    const inBreak = workingHours.breaks.some((breakTime: any) => {
      const breakStart = timeToMinutes(breakTime.start);
      const breakEnd = timeToMinutes(breakTime.end);
      return (
        (time >= breakStart && time < breakEnd) ||
        (time + slotDuration > breakStart && time + slotDuration <= breakEnd)
      );
    });
    
    if (inBreak) continue;
    
    const hasConflict = appointments.some(appointment => {
      const apptStart = timeToMinutes(appointment.startTime) - (buffer?.before || 0);
      const apptEnd = timeToMinutes(appointment.endTime) + (buffer?.after || 0);
      return (
        (time >= apptStart && time < apptEnd) ||
        (time + slotDuration > apptStart && time + slotDuration <= apptEnd)
      );
    });
    
    if (!hasConflict) {
      slots.push(slotStart);
    }
  }
  
  return slots;
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}
