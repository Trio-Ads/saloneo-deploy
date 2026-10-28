import { Response } from 'express';
import { validationResult } from 'express-validator';
import { TeamMember } from '../models/Team';
import { Service } from '../models/Service';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';
import { recheckSalon } from '../services/waitlist';
import { User, UserRole } from '../models/User';
import { LeaveAttachment, LeaveRequest } from '../models/LeaveRequest';
import { normalizePermissions } from '../middleware/permissions';
import { accessByMember } from './staff.controller';

/** What staff logins see of their colleagues: enough for the agenda, no contacts, HR file or permissions. */
const STAFF_VIEW = 'firstName lastName role color avatar isActive services specialties workingHours absences';

/** Owner-writable fields of the team form (never userId, hr through /hr). */
function memberUpdates(body: any) {
  const { userId: _u, _id: _i, id: _id, hr: _h, createdAt: _c, updatedAt: _up, ...rest } = body || {};
  if (rest.permissions !== undefined) rest.permissions = normalizePermissions(rest.permissions);
  return rest;
}

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
    
    const isStaff = req.actor?.role === UserRole.STAFF;
    const [teamMembers, total, access] = await Promise.all([
      TeamMember.find(query)
        .select(isStaff ? STAFF_VIEW : '')
        .populate('services', 'name category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      TeamMember.countDocuments(query),
      isStaff ? null : accessByMember(userId!),
    ]);

    res.json({
      teamMembers: teamMembers.map((m) => {
        const json: any = m.toJSON();
        // Absence reasons (maladie…) are between the member and the owner
        if (isStaff) json.absences = (json.absences || []).map(({ from, to, start, end }: any) => ({ from, to, start, end }));
        else {
          json.access = access!.get(String(m._id)) || { status: 'none' };
          json.permissions = normalizePermissions(json.permissions);
        }
        return json;
      }),
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
    const { services: serviceIds, ...teamMemberData } = memberUpdates(req.body);

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

    void recheckSalon(userId!);
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
    const { services: serviceIds, ...updates } = memberUpdates(req.body);

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

    // Absence removed, hours or services widened: the waitlist may get a slot
    void recheckSalon(userId!);
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
    // Their login and leave requests go with them
    await Promise.all([
      User.deleteOne({ teamMemberId: teamMember._id, salonId: userId, role: UserRole.STAFF }),
      LeaveRequest.deleteMany({ teamMemberId: teamMember._id, userId }),
      LeaveAttachment.deleteMany({ teamMemberId: teamMember._id, userId }),
    ]);

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

    if (teamMember.isActive) void recheckSalon(userId!);
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

    void recheckSalon(userId!);
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
    const current = await TeamMember.findOne({ _id: id, userId }).select('permissions').lean();
    const permissions = normalizePermissions({ ...normalizePermissions(current?.permissions), ...req.body.permissions });

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
