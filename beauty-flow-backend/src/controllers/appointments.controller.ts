import { Response } from 'express';
import { validationResult } from 'express-validator';
import { Types } from 'mongoose';
import { Appointment } from '../models/Appointment';
import { Service } from '../models/Service';
import { Client } from '../models/Client';
import { TeamMember } from '../models/Team';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';
import { subscriptionEmailService } from '../services/subscriptionEmailService';

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

    const skip = (Number(page) - 1) * Number(limit);
    
    const [appointments, total] = await Promise.all([
      Appointment.find(query)
        .populate('clientId', 'firstName lastName email phone')
        .populate('serviceId', 'name duration price color')
        .populate('stylistId', 'firstName lastName')
        .sort({ date: -1, startTime: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Appointment.countDocuments(query),
    ]);

    res.json({
      appointments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
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

    // For now, we'll use default values for service duration and price
    // In a full implementation, these would come from the Service model
    const defaultDuration = 30; // 30 minutes default
    const defaultPrice = 50; // 50€ default

    // Calculate end time based on default service duration
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const totalMinutes = startHours * 60 + startMinutes + defaultDuration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;

    // Check for conflicts (simplified - using teamMemberId as string)
    const conflict = await checkAppointmentConflict(
      userId!,
      date,
      startTime,
      endTime,
      teamMemberId
    );

    if (conflict) {
      res.status(400).json({ error: 'Time slot is not available' });
      return;
    }

    const appointmentData = {
      userId,
      clientId: validClientId,
      serviceId: serviceId, // Store as UUID string
      stylistId: teamMemberId, // Store as UUID string
      date: new Date(date),
      startTime,
      endTime,
      duration: defaultDuration,
      price: defaultPrice,
      status: 'scheduled',
      notes,
      clientInfo: {
        firstName: client.firstName,
        lastName: client.lastName,
        phone: client.phone,
        email: client.email,
      },
    };

    logger.info('Processed appointment data:', JSON.stringify(appointmentData, null, 2));

    const appointment = new Appointment(appointmentData);
    await appointment.save();

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

    // If changing time/date/team member, check for conflicts
    if (updates.date || updates.startTime || updates.teamMemberId) {
      const service = await Service.findById(appointment.serviceId);
      if (!service) {
        res.status(400).json({ error: 'Service not found' });
        return;
      }

      const date = updates.date || appointment.date;
      const startTime = updates.startTime || appointment.startTime;
      const teamMemberId = updates.teamMemberId || appointment.stylistId;
      
      const startDateTime = new Date(`${date}T${startTime}`);
      const endDateTime = new Date(startDateTime.getTime() + service.duration * 60000);
      const endTime = endDateTime.toTimeString().slice(0, 5);

      const conflict = await checkAppointmentConflict(
        userId!,
        date,
        startTime,
        endTime,
        teamMemberId?.toString(),
        id
      );

      if (conflict) {
        res.status(400).json({ error: 'Time slot is not available' });
        return;
      }

      updates.endTime = endTime;
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate([
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
    logger.error('Update appointment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateAppointmentStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.userId;

    const appointment = await Appointment.findOneAndUpdate(
      { _id: id, userId },
      { status },
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

export const getAvailableSlots = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { date, serviceId, teamMemberId } = req.query;
    const userId = req.userId;

    if (!date || !serviceId) {
      res.status(400).json({ error: 'Date and service ID are required' });
      return;
    }

    const service = await Service.findOne({ _id: serviceId, userId });
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
      const teamMember = await TeamMember.findOne({ _id: teamMemberId, userId });
      if (teamMember) {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayOfWeek = days[new Date(date as string).getDay()];
        // Access workingHours as a plain object
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

    // Get existing appointments for the day
    const appointments = await Appointment.find({
      userId,
      date: new Date(date as string),
      stylistId: teamMemberId,
      status: { $ne: 'cancelled' },
    });

    // Generate available slots
    const slots = generateAvailableSlots(
      workingHours,
      appointments,
      service.duration,
      undefined // buffer will be added later when we update the Service model
    );

    res.json({ slots });
  } catch (error) {
    logger.error('Get available slots error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Helper functions
async function checkAppointmentConflict(
  userId: string,
  date: Date | string,
  startTime: string,
  endTime: string,
  teamMemberId?: string,
  excludeId?: string
): Promise<boolean> {
  const query: any = {
    userId,
    date: new Date(date),
    status: { $ne: 'cancelled' },
  };

  if (teamMemberId) {
    query.stylistId = teamMemberId;
  }

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const conflicts = await Appointment.find(query);

  return conflicts.some(appointment => {
    const existingStart = appointment.startTime;
    const existingEnd = appointment.endTime;
    
    return (
      (startTime >= existingStart && startTime < existingEnd) ||
      (endTime > existingStart && endTime <= existingEnd) ||
      (startTime <= existingStart && endTime >= existingEnd)
    );
  });
}

function generateAvailableSlots(
  workingHours: any,
  appointments: any[],
  duration: number,
  buffer?: { before?: number; after?: number }
): string[] {
  const slots: string[] = [];
  const slotDuration = duration + (buffer?.before || 0) + (buffer?.after || 0);
  
  // Convert time to minutes for easier calculation
  const startMinutes = timeToMinutes(workingHours.start);
  const endMinutes = timeToMinutes(workingHours.end);
  
  // Generate all possible slots
  for (let time = startMinutes; time + slotDuration <= endMinutes; time += 15) {
    const slotStart = minutesToTime(time + (buffer?.before || 0));
    // const slotEnd = minutesToTime(time + (buffer?.before || 0) + duration);
    
    // Check if slot overlaps with breaks
    const inBreak = workingHours.breaks.some((breakTime: any) => {
      const breakStart = timeToMinutes(breakTime.start);
      const breakEnd = timeToMinutes(breakTime.end);
      return (
        (time >= breakStart && time < breakEnd) ||
        (time + slotDuration > breakStart && time + slotDuration <= breakEnd)
      );
    });
    
    if (inBreak) continue;
    
    // Check if slot overlaps with existing appointments
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
