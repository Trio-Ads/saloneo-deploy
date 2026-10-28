import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTeamStore } from './store';
import { useAuthStore } from '../auth/store';
import { useProfileStore } from '../profile/store';
import { TeamMember } from './types';

/**
 * Who can hold an appointment: the team, plus the owner when they take appointments
 * (shown as a team member, or working alone) — same rule as the server's availability engine.
 * The owner's id is their user id, which is what appointments store as stylistId.
 */
export function useStaff(): TeamMember[] {
  const { t } = useTranslation('appointments');
  const members = useTeamStore((s) => s.members);
  const ownerId = useAuthStore((s) => s.user?.id);
  const profile = useProfileStore((s) => s.profile);
  return useMemo(() => {
    if (!ownerId || !(profile.showAsTeamMember || !members.some((m) => m.isActive))) return members;
    const owner: TeamMember = {
      id: ownerId,
      firstName: profile.firstName || profile.establishmentName || t('appointment_form.labels.owner'),
      lastName: profile.firstName ? profile.lastName || '' : '',
      email: '',
      phone: '',
      role: t('appointment_form.labels.owner'),
      specialties: [],
      workingHours: {},
      isActive: true,
    };
    return [owner, ...members];
  }, [members, ownerId, profile.showAsTeamMember, profile.firstName, profile.lastName, profile.establishmentName, t]);
}

/** Display name of whoever holds an appointment; the owner is known even when no longer shown as staff. */
export function useStaffName(fallback?: string) {
  const { t } = useTranslation('appointments');
  const staff = useStaff();
  const ownerId = useAuthStore((s) => s.user?.id);
  const profile = useProfileStore((s) => s.profile);
  return useCallback((id?: string) => {
    const m = staff.find((s) => s.id === id);
    if (m) return `${m.firstName} ${m.lastName || ''}`.trim();
    if (id && id === ownerId) return `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.establishmentName || t('appointment_form.labels.owner');
    return fallback ?? t('appointment_form.unknown.stylist');
  }, [staff, ownerId, profile.firstName, profile.lastName, profile.establishmentName, fallback, t]);
}
