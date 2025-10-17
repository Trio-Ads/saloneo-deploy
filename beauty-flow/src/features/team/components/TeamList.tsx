import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  StarIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  BriefcaseIcon,
  SparklesIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { TeamMember, Specialty } from '../types';
import { useServiceStore } from '../../services/store';

interface TeamListProps {
  members: TeamMember[];
  onEdit: (member: TeamMember) => void;
  onDelete: (memberId: string) => void;
}

const TeamList: React.FC<TeamListProps> = ({ members, onEdit, onDelete }) => {
  const { t } = useTranslation('team');
  const services = useServiceStore((state) => state.services);
  const activeMembers = members.filter((member) => member.isActive);

  const getServiceDetails = (specialties: Specialty[] | string[]) => {
    // Gérer les anciennes données qui sont des strings
    if (!Array.isArray(specialties)) return [];
    
    return specialties.map((specialty) => {
      // Si c'est une string (ancienne structure), on ne peut pas afficher les détails
      if (typeof specialty === 'string') {
        return {
          name: specialty,
          level: 0,
          stars: 0
        };
      }
      
      // Nouvelle structure avec serviceId
      const service = services.find((s) => s.id === specialty.serviceId);
      if (!service) return null;
      return {
        name: service.name,
        level: specialty.proficiencyLevel,
        stars: Math.floor(specialty.proficiencyLevel)
      };
    }).filter((item): item is NonNullable<typeof item> => item !== null);
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      'Coiffeur': 'from-orange-500 to-orange-600',
      'Coloriste': 'from-orange-400 to-orange-500',
      'Manager': 'from-orange-600 to-orange-700',
      'Esthéticienne': 'from-orange-500 to-red-500',
      'Réceptionniste': 'from-orange-400 to-orange-600'
    };
    return colors[role] || 'from-gray-500 to-slate-500';
  };

  const getRoleIcon = (role: string) => {
    const icons: Record<string, React.ReactNode> = {
      'Coiffeur': <SparklesIcon className="h-5 w-5" />,
      'Coloriste': <SparklesIcon className="h-5 w-5" />,
      'Manager': <BriefcaseIcon className="h-5 w-5" />,
      'Esthéticienne': <StarIcon className="h-5 w-5" />,
      'Réceptionniste': <UserIcon className="h-5 w-5" />
    };
    return icons[role] || <UserIcon className="h-5 w-5" />;
  };

  const getWorkingDays = (member: TeamMember) => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    // Vérifier si workingHours existe, sinon utiliser schedule pour compatibilité
    const schedule = member.workingHours || (member as any).schedule;
    if (!schedule) return 0;
    
    const workingDays = days.filter(day => schedule[day as keyof typeof schedule]?.isWorking);
    return workingDays.length;
  };

  const getAverageRating = (specialties: Specialty[] | string[]) => {
    if (!Array.isArray(specialties) || specialties.length === 0) return 0;
    
    // Si ce sont des strings (anciennes données), on ne peut pas calculer la moyenne
    if (typeof specialties[0] === 'string') return 0;
    
    const validSpecialties = specialties.filter((s): s is Specialty => typeof s === 'object' && 'proficiencyLevel' in s);
    if (validSpecialties.length === 0) return 0;
    
    const total = validSpecialties.reduce((sum, specialty) => sum + specialty.proficiencyLevel, 0);
    return total / validSpecialties.length;
  };

  const dayNames = {
    monday: t('team_list.days_short.monday'),
    tuesday: t('team_list.days_short.tuesday'),
    wednesday: t('team_list.days_short.wednesday'),
    thursday: t('team_list.days_short.thursday'),
    friday: t('team_list.days_short.friday'),
    saturday: t('team_list.days_short.saturday'),
    sunday: t('team_list.days_short.sunday')
  };

  if (activeMembers.length === 0) {
    return (
      <div className="glass-card p-12 text-center bg-white/90 dark:bg-gray-800/70 backdrop-blur-xl border border-orange-500/20">
        <div className="mx-auto w-24 h-24 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-6 shadow-orange-lg animate-pulse">
          <UserIcon className="h-12 w-12 text-white" />
        </div>
        <h3 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent mb-3">
          {t('team_list.empty_state.title')}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-lg">{t('team_list.empty_state.subtitle')}</p>
        <div className="mt-6 inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-full text-orange-700 dark:text-orange-300 text-sm font-medium">
          👥 {t('team_list.empty_state.cta')}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {activeMembers.map((member) => {
        const specialtyDetails = getServiceDetails(member.specialties);
        const workingDays = getWorkingDays(member);
        const averageRating = getAverageRating(member.specialties);
        
        return (
          <div
            key={member.id}
            className="glass-card p-6 bg-white/90 dark:bg-gray-800/70 backdrop-blur-xl hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] animate-fadeIn border border-orange-500/20"
          >
            {/* Header avec photo et informations principales */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-16 bg-gradient-to-r ${getRoleColor(member.role)} rounded-full flex items-center justify-center shadow-lg`}>
                  <div className="text-white">
                    {getRoleIcon(member.role)}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                    {member.firstName} {member.lastName}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getRoleColor(member.role)} text-white shadow-lg`}>
                      {getRoleIcon(member.role)}
                      <span className="ml-1">{member.role}</span>
                    </span>
                    {averageRating > 0 && (
                      <div className="flex items-center space-x-1">
                        <StarIcon className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {averageRating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onEdit(member)}
                  className="glass-button p-3 text-orange-600 dark:text-orange-500 hover:text-orange-800 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200 transform hover:scale-110 shadow-lg hover:shadow-xl"
                  title={t('team_list.tooltips.edit_member')}
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onDelete(member.id)}
                  className="glass-button p-3 text-red-600 dark:text-red-500 hover:text-red-800 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 transform hover:scale-110 shadow-lg hover:shadow-xl"
                  title={t('team_list.tooltips.delete_member')}
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Informations de contact */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 glass-card bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl border border-orange-200 dark:border-orange-700">
                  <EnvelopeIcon className="h-5 w-5 text-orange-600 dark:text-orange-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('team_list.info_labels.email')}</p>
                    <p className="text-sm text-gray-900 dark:text-gray-100">{member.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 glass-card bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-700">
                  <PhoneIcon className="h-5 w-5 text-green-600 dark:text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('team_list.info_labels.phone')}</p>
                    <p className="text-sm text-gray-900 dark:text-gray-100">{member.phone}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 glass-card bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-600/50 rounded-xl border border-gray-200 dark:border-gray-600">
                  <CalendarDaysIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('team_list.info_labels.working_days')}</p>
                    <p className="text-sm text-gray-900 dark:text-gray-100">{workingDays}/7 {t('team_list.stats.days_per_week')}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 glass-card bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl border border-orange-200 dark:border-orange-700">
                  <SparklesIcon className="h-5 w-5 text-orange-600 dark:text-orange-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('team_list.info_labels.specialties')}</p>
                    <p className="text-sm text-gray-900 dark:text-gray-100">{member.specialties.length} {t('team_list.stats.services')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Spécialités détaillées */}
            {specialtyDetails.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-4">
                  <SparklesIcon className="h-5 w-5 text-orange-600 dark:text-orange-500" />
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('team_list.sections.specialties')}</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {specialtyDetails.map((specialty, index) => (
                    <div key={index} className="p-4 glass-card bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl border border-orange-200 dark:border-orange-700">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-900 dark:text-gray-100">{specialty.name}</h5>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`h-4 w-4 ${
                                i < specialty.stars ? 'text-yellow-500' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(specialty.level / 5) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {t('team_list.stats.level_of', { level: specialty.level.toFixed(1) })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Planning de la semaine */}
            <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
              <div className="flex items-center space-x-2 mb-4">
                <ClockIcon className="h-5 w-5 text-orange-600 dark:text-orange-500" />
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('team_list.sections.weekly_schedule')}</h4>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                  // Utiliser workingHours ou schedule pour compatibilité
                  const schedule = member.workingHours || (member as any).schedule;
                  const daySchedule = schedule?.[day as keyof typeof schedule];
                  
                  return (
                    <div
                      key={day}
                      className={`p-3 rounded-xl text-center transition-all duration-200 ${
                        daySchedule?.isWorking
                          ? 'glass-card bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-700'
                          : 'glass-card bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-600/50 border border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-center mb-1">
                        {daySchedule?.isWorking ? (
                          <CheckCircleIcon className="h-4 w-4 text-green-600 dark:text-green-500" />
                        ) : (
                          <XCircleIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        )}
                      </div>
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {dayNames[day as keyof typeof dayNames]}
                      </p>
                      {daySchedule?.isWorking && daySchedule.start && daySchedule.end && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {daySchedule.start}-{daySchedule.end}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Statistiques rapides */}
            <div className="mt-6 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1">
                  <CalendarDaysIcon className="h-4 w-4" />
                  <span>{workingDays} {t('team_list.stats.days_per_week')}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <SparklesIcon className="h-4 w-4" />
                  <span>{member.specialties.length} {t('team_list.stats.specialties_count')}</span>
                </span>
                {averageRating > 0 && (
                  <span className="flex items-center space-x-1">
                    <StarIcon className="h-4 w-4 text-yellow-500" />
                    <span>{t('team_list.stats.average')} {averageRating.toFixed(1)}/5</span>
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
                  {t('team_list.stats.active')}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TeamList;
