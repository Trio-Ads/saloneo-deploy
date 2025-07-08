import { Response } from 'express';
import { validationResult } from 'express-validator';
import { Types } from 'mongoose';
import { Client } from '../models/Client';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

// Helper function to validate and convert ObjectIds
const validateObjectIds = (ids: string[]): Types.ObjectId[] => {
  return ids
    .filter(id => Types.ObjectId.isValid(id))
    .map(id => new Types.ObjectId(id));
};

export const getAllClients = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const userId = req.userId;

    const query: any = { userId };
    
    // Search filter
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const [clients, total] = await Promise.all([
      Client.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Client.countDocuments(query),
    ]);

    res.json({
      clients,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    logger.error('Get all clients error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getClientById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const client = await Client.findOne({ _id: id, userId });
    
    if (!client) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }

    res.json({ client });
  } catch (error) {
    logger.error('Get client by id error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const createClient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error('Validation errors:', errors.array());
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const userId = req.userId;
    logger.info('Creating client with data:', { ...req.body, userId });
    
    // Process and validate ObjectIds for preferences
    const clientData = {
      ...req.body,
      userId,
    };

    // Validate and filter ObjectIds for favoriteServices and preferredStylists
    if (clientData.preferences) {
      if (clientData.preferences.favoriteServices) {
        clientData.preferences.favoriteServices = validateObjectIds(clientData.preferences.favoriteServices);
      }
      if (clientData.preferences.preferredStylists) {
        clientData.preferences.preferredStylists = validateObjectIds(clientData.preferences.preferredStylists);
      }
    }

    logger.info('Processed client data:', JSON.stringify(clientData, null, 2));

    const client = new Client(clientData);
    await client.save();

    logger.info('Client created successfully:', client._id);
    res.status(201).json({ client });

    // Emit socket event (disabled for deployment)
    try {
    } catch (socketError) {
      logger.error('Socket emit error:', socketError);
      // Don't fail the request if socket fails
    }
  } catch (error: any) {
    logger.error('Create client error:', {
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
    } else if (error.code === 11000) {
      res.status(409).json({ 
        error: 'Duplicate entry', 
        details: 'A client with this information already exists' 
      });
    } else {
      res.status(500).json({ 
        error: 'Server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

export const updateClient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { id } = req.params;
    const userId = req.userId;

    const client = await Client.findOneAndUpdate(
      { _id: id, userId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!client) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }

    res.json({ client });

    // Emit socket event (disabled for deployment)
  } catch (error) {
    logger.error('Update client error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteClient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const client = await Client.findOneAndDelete({ _id: id, userId });

    if (!client) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }

    res.json({ message: 'Client deleted successfully' });

    // Emit socket event (disabled for deployment)
  } catch (error) {
    logger.error('Delete client error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const searchClients = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { q } = req.query;
    const userId = req.userId;

    if (!q) {
      res.json({ clients: [] });
      return;
    }

    const clients = await Client.find({
      userId,
      $or: [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
      ],
    })
      .limit(10)
      .select('firstName lastName email phone');

    res.json({ clients });
  } catch (error) {
    logger.error('Search clients error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getClientStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    const [total, active, inactive, newThisMonth] = await Promise.all([
      Client.countDocuments({ userId }),
      Client.countDocuments({ userId, status: 'active' }),
      Client.countDocuments({ userId, status: 'inactive' }),
      Client.countDocuments({
        userId,
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      }),
    ]);

    res.json({
      stats: {
        total,
        active,
        inactive,
        newThisMonth,
      },
    });
  } catch (error) {
    logger.error('Get client stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
