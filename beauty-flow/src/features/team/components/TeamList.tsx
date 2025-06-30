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
      'Coiffeur': 'from-purple-500 to-pink-500',
      'Coloriste': 'from-blue-500 to-cyan-500',
      'Manager': 'from-green-500 to-emerald-500',
      'Esthéticienne': 'from-orange-500 to-red-500',
      'Réceptionniste': 'from-indigo-500 to-purple-500'
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

  if (activeMembers.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <div className="mx-auto w-24 h-24 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full flex items-center justify-center mb-6 shadow-lg animate-pulse">
          <UserIcon className="h-12 w-12 text-white" />
        </div>
        <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-3">
          Aucun membre d'équipe
        </h3>
        <p className="text-gray-600 text-lg">Commencez par ajouter vos premiers collaborateurs</p>
        <div className="mt-6 inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-100 to-blue-100 rounded-full text-indigo-700 text-sm font-medium">
          👥 Constituez votre équipe
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
            className="glass-card p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] animate-fadeIn border border-white/20"
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
                  <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
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
                        <span className="text-sm font-medium text-gray-700">
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
                  className="glass-button p-3 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition-all duration-200 transform hover:scale-110 shadow-lg hover:shadow-xl"
                  title="Modifier le membre"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onDelete(member.id)}
                  className="glass-button p-3 text-red-600 hover:text-red-800 hover:bg-red-50 transition-all duration-200 transform hover:scale-110 shadow-lg hover:shadow-xl"
                  title="Supprimer le membre"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Informations de contact */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 glass-card bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                  <EnvelopeIcon className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Email</p>
                    <p className="text-sm text-gray-900">{member.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 glass-card bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                  <PhoneIcon className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Téléphone</p>
                    <p className="text-sm text-gray-900">{member.phone}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 glass-card bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                  <CalendarDaysIcon className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Jours travaillés</p>
                    <p className="text-sm text-gray-900">{workingDays}/7 jours</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 glass-card bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
                  <SparklesIcon className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Spécialités</p>
                    <p className="text-sm text-gray-900">{member.specialties.length} service(s)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Spécialités détaillées */}
            {specialtyDetails.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-4">
                  <SparklesIcon className="h-5 w-5 text-purple-600" />
                  <h4 className="text-lg font-semibold text-gray-900">Spécialités</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {specialtyDetails.map((specialty, index) => (
                    <div key={index} className="p-4 glass-card bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-900">{specialty.name}</h5>
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
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(specialty.level / 5) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Niveau {specialty.level.toFixed(1)}/5
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Planning de la semaine */}
            <div className="border-t border-gray-100 pt-6">
              <div className="flex items-center space-x-2 mb-4">
                <ClockIcon className="h-5 w-5 text-blue-600" />
                <h4 className="text-lg font-semibold text-gray-900">Planning de la semaine</h4>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                  // Utiliser workingHours ou schedule pour compatibilité
                  const schedule = member.workingHours || (member as any).schedule;
                  const daySchedule = schedule?.[day as keyof typeof schedule];
                  const dayNames = {
                    monday: 'Lun',
                    tuesday: 'Mar',
                    wednesday: 'Mer',
                    thursday: 'Jeu',
                    friday: 'Ven',
                    saturday: 'Sam',
                    sunday: 'Dim'
                  };
                  
                  return (
                    <div
                      key={day}
                      className={`p-3 rounded-xl text-center transition-all duration-200 ${
                        daySchedule?.isWorking
                          ? 'glass-card bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200'
                          : 'glass-card bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-center mb-1">
                        {daySchedule?.isWorking ? (
                          <CheckCircleIcon className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircleIcon className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <p className="text-xs font-medium text-gray-700">
                        {dayNames[day as keyof typeof dayNames]}
                      </p>
                      {daySchedule?.isWorking && daySchedule.start && daySchedule.end && (
                        <p className="text-xs text-gray-600 mt-1">
                          {daySchedule.start}-{daySchedule.end}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Statistiques rapides */}
            <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1">
                  <CalendarDaysIcon className="h-4 w-4" />
                  <span>{workingDays} jours/semaine</span>
                </span>
                <span className="flex items-center space-x-1">
                  <SparklesIcon className="h-4 w-4" />
                  <span>{member.specialties.length} spécialité(s)</span>
                </span>
                {averageRating > 0 && (
                  <span className="flex items-center space-x-1">
                    <StarIcon className="h-4 w-4 text-yellow-500" />
                    <span>Moyenne {averageRating.toFixed(1)}/5</span>
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
                  Actif
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
