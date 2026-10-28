import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import { Panel, EmptyState } from '../../../components/ui';
import { AppointmentWithPrice } from '../types';
import { TeamMember } from '../../team/types';
import { useProfileStore } from '../../profile/store';
import { formatPrice } from '../../../utils/currency';

interface TeamPerformanceWidgetProps {
  appointments: AppointmentWithPrice[];
  members: TeamMember[];
}

const TeamPerformanceWidget: React.FC<TeamPerformanceWidgetProps> = ({ appointments, members }) => {
  const { t } = useTranslation('dashboard');
  const { profile } = useProfileStore();
  const teamStats = useMemo(() => {
    // Calculer les statistiques par membre de l'équipe
    const stats = members.map(member => {
      const memberAppointments = appointments.filter(apt => apt.stylistId === member.id);
      const completedAppointments = memberAppointments.filter(apt => apt.status === 'completed');
      const revenue = completedAppointments.reduce((sum, apt) => sum + (apt.price || 0), 0);
      
      // Construire le nom avec fallback pour éviter "undefined undefined"
      const firstName = member.firstName || '';
      const lastName = member.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim() || t('components.team_performance.unknown_member');
      
      return {
        id: member.id,
        name: fullName,
        avatar: member.avatar,
        role: member.role ? t(`team:role_values.${member.role}`, member.role) : t('components.team_performance.no_role'),
        appointmentsCount: memberAppointments.length,
        completedCount: completedAppointments.length,
        revenue,
        completionRate: memberAppointments.length > 0 
          ? (completedAppointments.length / memberAppointments.length) * 100 
          : 0
      };
    });

    // Trier par revenu décroissant
    return stats.sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [appointments, members, t]);

  const maxRevenue = Math.max(...teamStats.map(s => s.revenue), 1);

  return (
    <Panel title={t('components.team_performance.title')}>
      {teamStats.length === 0 ? (
        <EmptyState icon={UserGroupIcon} title={t('components.team_performance.no_members')} />
      ) : (
        <ul className="space-y-4">
          {teamStats.map((member) => (
            <li key={member.id} className="flex items-center gap-3">
              {member.avatar ? (
                <img src={member.avatar} alt="" className="size-9 shrink-0 rounded-full object-cover" />
              ) : (
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                  {member.name.charAt(0)}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-50">{member.name}</p>
                  <p className="shrink-0 text-sm font-medium tabular-nums text-gray-900 dark:text-gray-50">{formatPrice(member.revenue, profile.currency)}</p>
                </div>
                <div className="flex items-baseline justify-between gap-3 text-xs text-gray-500 dark:text-gray-400">
                  <span className="truncate">{member.role}</span>
                  <span className="shrink-0">{t('components.team_performance.completed', { count: member.completedCount })}</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                  <div className="h-full rounded-full bg-orange-500 dark:bg-orange-400" style={{ width: `${(member.revenue / maxRevenue) * 100}%` }} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
};

export default TeamPerformanceWidget;
