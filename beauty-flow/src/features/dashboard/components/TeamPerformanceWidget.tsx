import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { UserGroupIcon, StarIcon } from '@heroicons/react/24/outline';
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
      
      return {
        id: member.id,
        name: `${member.firstName} ${member.lastName}`,
        avatar: member.avatar,
        role: member.role,
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
  }, [appointments, members]);

  if (teamStats.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <UserGroupIcon className="h-5 w-5 mr-2 text-purple-600" />
          {t('components.team_performance.title')}
        </h3>
        <div className="h-48 flex items-center justify-center">
          <p className="text-gray-500 text-sm">{t('components.team_performance.no_members')}</p>
        </div>
      </div>
    );
  }

  const maxRevenue = Math.max(...teamStats.map(s => s.revenue), 1);

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <UserGroupIcon className="h-5 w-5 mr-2 text-purple-600" />
        {t('components.team_performance.title')}
      </h3>
      
      <div className="space-y-4">
        {teamStats.map((member, index) => {
          const revenuePercentage = (member.revenue / maxRevenue) * 100;
          
          return (
            <div key={member.id} className="group">
              <div className="flex items-center space-x-3">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {member.avatar ? (
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-white"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {member.name.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {member.name}
                      </p>
                      <p className="text-xs text-gray-500">{member.role}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatPrice(member.revenue, profile.currency)}
                      </p>
                      <div className="flex items-center justify-end space-x-1 text-xs text-gray-500">
                        <span>{member.completedCount} {t('components.team_performance.completed')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Barre de progression */}
                  <div className="mt-2 relative h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${revenuePercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeamPerformanceWidget;
