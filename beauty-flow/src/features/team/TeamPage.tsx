import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import { TeamMember, TeamMemberFormData } from './types';
import { useTeamStore } from './store';
import TeamList from './components/TeamList';
import { TeamMemberFormWithLimits } from '../subscription/components/LimitedForms';
import { useLimitedForm } from '../subscription/components/LimitedForms';
import { useSocket } from '../../hooks/useSocket';
import { useSubscriptionLimits } from '../subscription/hooks/useSubscriptionLimits';
import { SubscriptionLimitWidget } from '../subscription/components/SubscriptionLimitWidget';
import { EmptyState, PageHeader, Panel, StatGroup } from '../../components/ui';

const TeamPage: React.FC = () => {
  const { t } = useTranslation('team');
  const { members, addMember, updateMember, deleteMember } = useTeamStore();
  const { handleLimitExceeded } = useLimitedForm();
  const { checkTeamMemberLimit, currentPlan } = useSubscriptionLimits();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const formRef = React.useRef<HTMLDivElement>(null);
  const teamLimit = checkTeamMemberLimit();

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
    if (!checkTeamMemberLimit().canAdd) {
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

  // Auto-scroll vers le formulaire quand il s'ouvre
  React.useEffect(() => {
    if (isFormOpen && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isFormOpen]);

  const handleDeleteClick = (memberId: string) => {
    if (window.confirm(t('messages.delete_confirmation'))) {
      deleteMember(memberId);
    }
  };

  const isFiltering = !!searchTerm || selectedRole !== 'all';

  return (
    <div className="py-6 sm:py-8">
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        meta={
          <SubscriptionLimitWidget
            title={t('limits.title')}
            limitCheck={teamLimit}
            planName={currentPlan}
            resourceType={t('resources.team', { ns: 'subscription' })}
          />
        }
        actions={
          !isFormOpen && (
            <button onClick={handleAddClick} disabled={!teamLimit.canAdd} className="btn-primary">
              <PlusIcon className="size-4" />
              {teamLimit.canAdd ? t('actions.add_member') : t('limits.reached')}
            </button>
          )
        }
      />

      {isFormOpen ? (
        <div ref={formRef} className="scroll-mt-28">
          <TeamMemberFormWithLimits
            initialData={editingMember || undefined}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            onLimitExceeded={handleLimitExceeded}
          />
        </div>
      ) : (
        <>
          <StatGroup
            items={[
              { label: t('stats.total_team'), value: teamStats.total },
              { label: t('stats.active'), value: teamStats.active },
              { label: t('stats.roles'), value: teamStats.roles },
              { label: t('stats.avg_specialties'), value: teamStats.avgSpecialties, hint: t('stats.per_member') }
            ]}
          />

          {members.length > 0 && (
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative sm:w-72">
                <MagnifyingGlassIcon className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  placeholder={t('search.placeholder')}
                  aria-label={t('search.placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="field ps-9"
                />
              </div>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                aria-label={t('filters.all_roles')}
                className="field sm:w-48"
              >
                <option value="all">{t('filters.all_roles')}</option>
                {uniqueRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              {isFiltering && (
                <p className="text-sm text-gray-500 dark:text-gray-400 sm:ms-auto tabular-nums">
                  {filteredMembers.length} {t('search.results')}
                </p>
              )}
            </div>
          )}

          <Panel flush>
            {isFiltering && filteredMembers.length === 0 ? (
              <EmptyState icon={MagnifyingGlassIcon} title={t('messages.no_members')} />
            ) : (
              <TeamList
                members={filteredMembers}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                onAdd={teamLimit.canAdd ? handleAddClick : undefined}
              />
            )}
          </Panel>
        </>
      )}
    </div>
  );
};

export default TeamPage;
