import { Response } from 'express';
import { validationResult } from 'express-validator';
import { TeamMember } from '../models/Team';
import { Service } from '../models/Service';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export const getAllTeamMembers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, isActive } = req.query;
    const userId = req.userId;

    const query: any = { userId };
    
    // Active filter
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const [teamMembers, total] = await Promise.all([
      TeamMember.find(query)
        .populate('services', 'name category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      TeamMember.countDocuments(query),
    ]);

    res.json({
      teamMembers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    logger.error('Get all team members error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getTeamMemberById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const teamMember = await TeamMember.findOne({ _id: id, userId })
      .populate('services');
    
    if (!teamMember) {
      res.status(404).json({ error: 'Team member not found' });
      return;
    }

    res.json({ teamMember });
  } catch (error) {
    logger.error('Get team member by id error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const createTeamMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const userId = req.userId;
    const { services: serviceIds, ...teamMemberData } = req.body;

    // Verify services belong to the user
    if (serviceIds && serviceIds.length > 0) {
      const validServices = await Service.find({
        _id: { $in: serviceIds },
        userId,
      });

      if (validServices.length !== serviceIds.length) {
        res.status(400).json({ error: 'Invalid services' });
        return;
      }
    }

    const teamMember = new TeamMember({
      ...teamMemberData,
      userId,
      services: serviceIds || [],
    });

    await teamMember.save();
    await teamMember.populate('services', 'name category');

    res.status(201).json({ teamMember });
  } catch (error) {
    logger.error('Create team member error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateTeamMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { id } = req.params;
    const userId = req.userId;
    const { services: serviceIds, ...updates } = req.body;

    // Verify services if provided
    if (serviceIds) {
      const validServices = await Service.find({
        _id: { $in: serviceIds },
        userId,
      });

      if (validServices.length !== serviceIds.length) {
        res.status(400).json({ error: 'Invalid services' });
        return;
      }
      updates.services = serviceIds;
    }

    const teamMember = await TeamMember.findOneAndUpdate(
      { _id: id, userId },
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('services', 'name category');

    if (!teamMember) {
      res.status(404).json({ error: 'Team member not found' });
      return;
    }

    res.json({ teamMember });
  } catch (error) {
    logger.error('Update team member error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteTeamMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const teamMember = await TeamMember.findOneAndDelete({ _id: id, userId });

    if (!teamMember) {
      res.status(404).json({ error: 'Team member not found' });
      return;
    }

    res.json({ message: 'Team member deleted successfully' });
  } catch (error) {
    logger.error('Delete team member error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const toggleTeamMemberStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const teamMember = await TeamMember.findOne({ _id: id, userId });

    if (!teamMember) {
      res.status(404).json({ error: 'Team member not found' });
      return;
    }

    teamMember.isActive = !teamMember.isActive;
    await teamMember.save();
    await teamMember.populate('services', 'name category');

    res.json({ teamMember });
  } catch (error) {
    logger.error('Toggle team member status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateWorkingHours = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { id } = req.params;
    const userId = req.userId;
    const { workingHours } = req.body;

    const teamMember = await TeamMember.findOne({ _id: id, userId });

    if (!teamMember) {
      res.status(404).json({ error: 'Team member not found' });
      return;
    }

    // Update working hours
    Object.keys(workingHours).forEach(day => {
      (teamMember.workingHours as any)[day] = workingHours[day];
    });

    await teamMember.save();
    await teamMember.populate('services', 'name category');

    res.json({ teamMember });
  } catch (error) {
    logger.error('Update working hours error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updatePermissions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { id } = req.params;
    const userId = req.userId;
    const { permissions } = req.body;

    const teamMember = await TeamMember.findOneAndUpdate(
      { _id: id, userId },
      { $set: { permissions } },
      { new: true, runValidators: true }
    ).populate('services', 'name category');

    if (!teamMember) {
      res.status(404).json({ error: 'Team member not found' });
      return;
    }

    res.json({ teamMember });
  } catch (error) {
    logger.error('Update permissions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getTeamStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    const [total, active, byRole] = await Promise.all([
      TeamMember.countDocuments({ userId }),
      TeamMember.countDocuments({ userId, isActive: true }),
      TeamMember.aggregate([
        { $match: { userId } },
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]),
    ]);

    res.json({
      stats: {
        total,
        active,
        inactive: total - active,
        byRole: byRole.map(role => ({
          role: role._id,
          count: role.count,
        })),
      },
    });
  } catch (error) {
    logger.error('Get team stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
