import { StaffPermissions } from '../auth/types';

export interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  specialties: string[]; // Array of service IDs
  services?: string[]; // Array of service IDs for backend compatibility
  workingHours: WorkingHours;
  /** Days off (congés, maladie): inclusive 'YYYY-MM-DD' — no slot is offered with this member then */
  absences?: Absence[];
  isActive: boolean;
  avatar?: string;
  color?: string;
  /** What this member's login may do (owner view only) */
  permissions?: StaffPermissions;
  /** Their login: invited, active, revoked… (owner view only) */
  access?: StaffAccess;
}

export interface StaffAccess {
  status: 'none' | 'invited' | 'expired' | 'active' | 'revoked';
  email?: string;
  expiresAt?: string;
  lastLogin?: string;
}

export interface WorkingHours {
  [key: string]: {
    isWorking: boolean;
    start?: string; // Format "HH:mm"
    end?: string; // Format "HH:mm"
    breaks?: Break[];
  };
}

export interface Absence {
  from: string;
  to: string;
  /** Optional 'HH:mm' window (e.g. 14:00–16:00 médical); none = whole days */
  start?: string;
  end?: string;
  reason?: string;
  /** Set when the absence comes from an approved leave request */
  leaveId?: string;
}

export interface Break {
  start: string; // Format "HH:mm"
  end: string; // Format "HH:mm"
}

// Legacy interface for backward compatibility
export interface Specialty {
  serviceId: string;
  proficiencyLevel: number; // 1-5, 5 étant le plus élevé
}

export interface Schedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  isWorking: boolean;
  start?: string; // Format "HH:mm"
  end?: string; // Format "HH:mm"
  breaks?: Break[];
}

export interface TimeOff {
  id: string;
  memberId: string;
  startDate: string; // Format "YYYY-MM-DD"
  endDate: string; // Format "YYYY-MM-DD"
  type: TimeOffType;
  status: TimeOffStatus;
  notes?: string;
}

export enum TimeOffType {
  VACATION = 'VACATION',
  SICK_LEAVE = 'SICK_LEAVE',
  PERSONAL = 'PERSONAL',
  OTHER = 'OTHER'
}

export enum TimeOffStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export type TeamMemberFormData = Omit<TeamMember, 'id'>;
