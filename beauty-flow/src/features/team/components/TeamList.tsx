import React from 'react';
import { useTranslation } from 'react-i18next';
import { PencilIcon, PlusIcon, TrashIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { TeamMember, Specialty } from '../types';
import { useServiceStore } from '../../services/store';
import { StaffAvatar } from '../StaffAvatar';
import { Badge, EmptyState, IconButton } from '../../../components/ui';

interface TeamListProps {
  members: TeamMember[];
  onEdit: (member: TeamMember) => void;
  onDelete: (memberId: string) => void;
  /** Shown as the empty-state action when provided. */
  onAdd?: () => void;
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const MAX_SPECIALTIES = 3;

const TeamList: React.FC<TeamListProps> = ({ members, onEdit, onDelete, onAdd }) => {
  const { t } = useTranslation('team');
  const services = useServiceStore((state) => state.services);
  const activeMembers = members.filter((member) => member.isActive);

  // Specialties are service ids (legacy data: { serviceId, proficiencyLevel } objects).
  const getSpecialtyNames = (specialties: Specialty[] | string[]) => {
    if (!Array.isArray(specialties)) return [];
    return specialties
      .map((specialty) => {
        const id = typeof specialty === 'string' ? specialty : specialty.serviceId;
        return services.find((s) => s.id === id)?.name;
      })
      .filter((name): name is string => !!name);
  };

  if (activeMembers.length === 0) {
    return (
      <EmptyState
        icon={UserGroupIcon}
        title={t('team_list.empty_state.title')}
        body={t('team_list.empty_state.subtitle')}
        action={onAdd && (
          <button onClick={onAdd} className="btn-primary">
            <PlusIcon className="size-4" />
            {t('actions.add_member')}
          </button>
        )}
      />
    );
  }

  return (
    <ul className="divide-y divide-gray-100 dark:divide-gray-800">
      {activeMembers.map((member) => {
        const names = getSpecialtyNames(member.specialties);
        // Vérifier si workingHours existe, sinon utiliser schedule pour compatibilité
        const schedule = member.workingHours || (member as any).schedule || {};
        const workedDays = DAYS.filter((day) => schedule[day]?.isWorking);
        const hours = Array.from(new Set(workedDays.map((day) => `${schedule[day].start || '09:00'}–${schedule[day].end || '18:00'}`)));

        return (
          <li key={member.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <StaffAvatar member={member} />
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="truncate font-medium text-gray-900 dark:text-gray-50">{member.firstName} {member.lastName}</span>
                  <Badge>{t(`role_values.${member.role}`, member.role)}</Badge>
                </p>
                <p className="mt-0.5 truncate text-sm text-gray-500 dark:text-gray-400">
                  {[member.email, member.phone].filter(Boolean).join(' · ')}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 sm:w-64 sm:justify-end">
              {names.slice(0, MAX_SPECIALTIES).map((name) => (
                <Badge key={name} className="max-w-[10rem] truncate">{name}</Badge>
              ))}
              {names.length > MAX_SPECIALTIES && <Badge>+{names.length - MAX_SPECIALTIES}</Badge>}
            </div>

            <div className="flex items-center justify-between gap-4 sm:justify-end">
              <div title={hours.join(', ')}>
                <div className="flex gap-0.5" aria-label={`${workedDays.length}/7 ${t('team_list.stats.days_per_week')}`}>
                  {DAYS.map((day) => (
                    <span
                      key={day}
                      className={clsx(
                        'grid h-6 w-7 place-items-center rounded-md text-[0.6875rem] font-medium',
                        schedule[day]?.isWorking
                          ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                          : 'text-gray-300 dark:text-gray-600'
                      )}
                    >
                      {t(`team_list.days_short.${day}`)}
                    </span>
                  ))}
                </div>
                {hours.length > 0 && (
                  <p className="mt-1 text-xs tabular-nums text-gray-500 dark:text-gray-400">{hours.length === 1 ? hours[0] : t('team_list.stats.variable_hours')}</p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <IconButton label={t('team_list.tooltips.edit_member')} onClick={() => onEdit(member)} className="size-10">
                  <PencilIcon className="size-5" />
                </IconButton>
                <IconButton label={t('team_list.tooltips.delete_member')} tone="danger" onClick={() => onDelete(member.id)} className="size-10">
                  <TrashIcon className="size-5" />
                </IconButton>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default TeamList;
