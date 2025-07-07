import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  UserGroupIcon, 
  PlusIcon, 
  MagnifyingGlassIcon,
  StarIcon,
  ClockIcon,
  UserIcon,
  SparklesIcon,
  BriefcaseIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { TeamMember, TeamMemberFormData } from './types';
import { useTeamStore } from './store';
import TeamList from './components/TeamList';
import { TeamMemberFormWithLimits } from '../subscription/components/LimitedForms';
import { useLimitedForm } from '../subscription/components/LimitedForms';
import { useSocket } from '../../hooks/useSocket';
import { useSubscriptionLimits } from '../subscription/hooks/useSubscriptionLimits';
import { SubscriptionLimitWidget } from '../subscription/components/SubscriptionLimitWidget';

const TeamPage: React.FC = () => {
  const { t } = useTranslation('team');
  const { members, addMember, updateMember, deleteMember } = useTeamStore();
  const { handleLimitExceeded } = useLimitedForm();
  const { checkTeamMemberLimit, currentPlan } = useSubscriptionLimits();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  
  // Enable real-time updates
  useSocket();

  // Filtrer les membres et calculer les statistiques
  const filteredMembers = useMemo(() => {
    let filtered = members;
    
    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedRole !== 'all') {
      filtered = filtered.filter(member => member.role === selectedRole);
    }
    
    return filtered;
  }, [members, searchTerm, selectedRole]);

  const teamStats = useMemo(() => {
    const roles = new Set(members.map(m => m.role));
    const activeMembers = members.filter(m => m.isActive !== false);
    const totalSpecialties = members.reduce((sum, member) => sum + member.specialties.length, 0);
    const avgSpecialties = members.length > 0 ? totalSpecialties / members.length : 0;

    return {
      total: members.length,
      active: activeMembers.length,
      roles: roles.size,
      avgSpecialties: Math.round(avgSpecialties * 10) / 10
    };
  }, [members]);

  // Obtenir les rôles uniques pour le filtre
  const uniqueRoles = useMemo(() => {
    return Array.from(new Set(members.map(m => m.role))).sort();
  }, [members]);

  const handleAddClick = () => {
    const teamLimit = checkTeamMemberLimit();
    if (!teamLimit.canAdd) {
      // Au lieu d'ouvrir le formulaire, on redirige directement vers les plans
      handleLimitExceeded();
      return;
    }
    setEditingMember(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (member: TeamMember) => {
    setEditingMember(member);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: TeamMemberFormData) => {
    try {
      if (editingMember) {
        await updateMember(editingMember.id, data);
      } else {
        await addMember(data);
      }
      setIsFormOpen(false);
      setEditingMember(null);
    } catch (error: any) {
      if (error.message === 'SUBSCRIPTION_LIMIT') {
        // Gérer l'erreur de limite avec une notification élégante
        handleLimitExceeded();
      } else {
        // Autres erreurs
        console.error(t('errors.save_error'), error);
      }
    }
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingMember(null);
  };

  const handleDeleteClick = (memberId: string) => {
    if (window.confirm(t('messages.delete_confirmation'))) {
      deleteMember(memberId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* HERO HEADER - Design spectaculaire */}
        <div className="relative mb-12">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              
              {/* Titre avec icône spectaculaire */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur-lg opacity-30 animate-pulse"></div>
                  <div className="relative bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-2xl shadow-xl transform hover:scale-110 transition-all duration-300">
                    <UserGroupIcon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {t('title')}
                  </h1>
                  <p className="text-gray-600 mt-2 text-lg">{t('subtitle')}</p>
                  <div className="flex items-center mt-3 space-x-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                      👥 {teamStats.total} {t('badges.members')}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      ✨ {teamStats.active} {t('badges.active')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions principales */}
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={handleAddClick}
                  className={`px-8 py-3 ${
                    checkTeamMemberLimit().canAdd 
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' 
                      : 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed'
                  } text-white rounded-xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden group`}
                  disabled={!checkTeamMemberLimit().canAdd}
                >
                  <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                  <PlusIcon className="h-5 w-5 mr-2 inline relative z-10" />
                  <span className="relative z-10">
                    {checkTeamMemberLimit().canAdd ? t('actions.add_member') : t('limits.reached')}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* WIDGET DE LIMITE D'ABONNEMENT */}
        <div className="mb-8">
          <SubscriptionLimitWidget
            title={t('limits.title')}
            icon={
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <UserGroupIcon className="h-5 w-5 text-white" />
              </div>
            }
            limitCheck={checkTeamMemberLimit()}
            planName={currentPlan}
            resourceType="membres"
          />
        </div>

        {/* STATISTIQUES - Design premium avec couleurs cohérentes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">{t('stats.total_team')}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{teamStats.total}</p>
                  <p className="text-xs text-gray-500 mt-1">{t('stats.all_members')}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl shadow-lg">
                  <UserIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Actifs */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">{t('stats.active')}</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{teamStats.active}</p>
                  <p className="text-xs text-gray-500 mt-1">{t('stats.available_members')}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
                  <SparklesIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Rôles */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">{t('stats.roles')}</p>
                  <p className="text-3xl font-bold text-purple-600 mt-1">{teamStats.roles}</p>
                  <p className="text-xs text-gray-500 mt-1">{t('stats.position_types')}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-lg">
                  <BriefcaseIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Spécialités Moyennes */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">{t('stats.avg_specialties')}</p>
                  <p className="text-3xl font-bold text-orange-600 mt-1">{teamStats.avgSpecialties}</p>
                  <p className="text-xs text-gray-500 mt-1">{t('stats.per_member')}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl shadow-lg">
                  <AcademicCapIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FILTRES ET CONTRÔLES - Design sophistiqué */}
        {!isFormOpen && (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              
              {/* Recherche et filtres */}
              <div className="flex flex-wrap items-center gap-4">
                {/* Barre de recherche */}
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('search.placeholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-3 w-64 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm"
                  />
                </div>

                {/* Filtre par rôle */}
                <div className="relative">
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="pl-4 pr-8 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm appearance-none cursor-pointer"
                  >
                    <option value="all">{t('filters.all_roles')}</option>
                    {uniqueRoles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            {(searchTerm || selectedRole !== 'all') && (
              <p className="mt-2 text-sm text-gray-600">
                {filteredMembers.length} {t('search.results')}
                {searchTerm && ` ${t('search.for')} "${searchTerm}"`}
                {selectedRole !== 'all' && ` ${t('search.with_role')} "${selectedRole}"`}
              </p>
            )}
          </div>
        )}

        {/* Contenu principal */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 min-h-[600px]">
          {isFormOpen ? (
            <div className="animate-fadeIn">
              <TeamMemberFormWithLimits
                initialData={editingMember || undefined}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
                onLimitExceeded={handleLimitExceeded}
              />
            </div>
          ) : (
            <div className="animate-fadeIn">
              <TeamList
                members={filteredMembers}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamPage;
