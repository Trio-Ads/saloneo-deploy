import React from 'react';
import { useTranslation } from 'react-i18next';
import { PencilIcon, TrashIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { Client } from '../types';
import { useServiceStore } from '../../services/store';
import { useStaffName } from '../../team/staff';
import { Panel, Badge, IconButton, BadgeTone } from '../../../components/ui';

interface ClientListProps {
  clients: Client[];
  /** Omitted for staff logins (owner-only actions) */
  onEdit?: (client: Client) => void;
  onDelete?: (clientId: string) => void;
}

const ClientList: React.FC<ClientListProps> = ({ clients, onEdit, onDelete }) => {
  const { t, i18n } = useTranslation('clients');
  const services = useServiceStore((state) => state.services);
  const staffName = useStaffName('');
  const activeClients = clients.filter((client) => client.isActive);

  const getServiceNames = (serviceIds: string[]) =>
    serviceIds.map((id) => services.find((service) => service.id === id)?.name).filter(Boolean).join(', ');

  const getStylistNames = (stylistIds: string[]) =>
    stylistIds
      .map((id) => staffName(id))
      .filter(Boolean)
      .join(', ');

  const formatDate = (dateString?: string) =>
    dateString ? new Date(dateString).toLocaleDateString(i18n.language, { year: 'numeric', month: 'long', day: 'numeric' }) : '';

  const getLoyaltyLevel = (points: number): { level: string; tone: BadgeTone } => {
    if (points >= 1000) return { level: t('client_list.loyalty_levels.vip'), tone: 'orange' };
    if (points >= 500) return { level: t('client_list.loyalty_levels.gold'), tone: 'amber' };
    if (points >= 200) return { level: t('client_list.loyalty_levels.silver'), tone: 'neutral' };
    return { level: t('client_list.loyalty_levels.bronze'), tone: 'neutral' };
  };

  return (
    <Panel flush>
      <ul className="divide-y divide-gray-100 dark:divide-gray-800">
        {activeClients.map((client) => {
          const loyalty = getLoyaltyLevel(client.loyaltyPoints);
          const initials = `${client.firstName?.[0] ?? ''}${client.lastName?.[0] ?? ''}`.toUpperCase();
          const prefs = client.preferences;
          const comm = prefs?.communicationPreferences;
          const details: [string, React.ReactNode][] = [
            [t('client_list.info_labels.email'), client.email],
            [t('client_list.info_labels.birth_date'), formatDate(client.birthDate)],
            [t('client_list.info_labels.last_visit'), formatDate(client.lastVisit)],
            [t('client_list.profile_sections.hair_profile'), prefs?.hairQuestionnaire && [prefs.hairQuestionnaire.hairType, prefs.hairQuestionnaire.thickness].filter(Boolean).map((v) => t(`public:booking.questionnaire.values.${v}`, v)).join(' · ')],
            [t('client_list.profile_sections.favorite_services'), getServiceNames(prefs?.favoriteServices || [])],
            [t('client_list.profile_sections.preferred_stylists'), getStylistNames(prefs?.preferredStylists || [])],
            [t('client_list.profile_sections.communication'), comm && [
              comm.smsReminders && t('client_list.communication_badges.sms'),
              comm.emailMarketing && t('client_list.communication_badges.email'),
              comm.birthdayOffers && t('client_list.communication_badges.birthday'),
            ].filter(Boolean).join(' · ')],
            [t('client_list.profile_sections.notes'), client.notes],
          ];

          return (
            <li key={client.id}>
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 transition-colors duration-150 ease-out hover:bg-gray-50 sm:gap-4 sm:px-5 dark:hover:bg-gray-800/50 [&::-webkit-details-marker]:hidden">
                  <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    {initials}
                  </span>
                  <div className="min-w-0 flex-1 sm:grid sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1.3fr)_6rem] sm:items-center sm:gap-4">
                    <div className="flex min-w-0 items-center gap-2">
                      <p className="truncate font-medium text-gray-900 dark:text-gray-50">{client.firstName} {client.lastName}</p>
                      <Badge tone={loyalty.tone} className="hidden sm:inline-flex">{loyalty.level}</Badge>
                    </div>
                    <div className="flex min-w-0 items-center gap-2">
                      <p dir="ltr" className="truncate text-sm tabular-nums text-gray-500 dark:text-gray-400">{client.phone}</p>
                      <Badge tone={loyalty.tone} className="sm:hidden">{loyalty.level}</Badge>
                    </div>
                    <p className="hidden truncate text-sm text-gray-500 dark:text-gray-400 sm:block">{client.email}</p>
                    <p className="hidden text-end text-sm tabular-nums text-gray-700 dark:text-gray-300 sm:block">
                      {t('client_list.points', { count: client.loyaltyPoints || 0 })}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {onEdit && (
                      <IconButton label={t('client_list.tooltips.edit_client')} onClick={(e) => { e.preventDefault(); onEdit(client); }}>
                        <PencilIcon className="size-[18px]" />
                      </IconButton>
                    )}
                    {onDelete && (
                      <IconButton label={t('client_list.tooltips.delete_client')} tone="danger" onClick={(e) => { e.preventDefault(); onDelete(client.id); }}>
                        <TrashIcon className="size-[18px]" />
                      </IconButton>
                    )}
                    <ChevronDownIcon aria-hidden className="hidden size-4 text-gray-400 transition-transform duration-150 ease-out group-open:rotate-180 sm:block" />
                  </div>
                </summary>
                <dl className="grid gap-x-6 gap-y-3 px-4 pb-4 ps-[4.25rem] text-sm sm:grid-cols-2 sm:px-5 sm:ps-[4.5rem] lg:grid-cols-3">
                  <div className="sm:hidden">
                    <dt className="text-gray-500 dark:text-gray-400">{t('client_list.profile_sections.loyalty_points')}</dt>
                    <dd className="tabular-nums text-gray-900 dark:text-gray-100">{client.loyaltyPoints || 0}</dd>
                  </div>
                  {details.filter(([, v]) => v).map(([label, value]) => (
                    <div key={label} className="min-w-0">
                      <dt className="text-gray-500 dark:text-gray-400">{label}</dt>
                      <dd className="break-words text-gray-900 dark:text-gray-100">{value}</dd>
                    </div>
                  ))}
                </dl>
              </details>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
};

export default ClientList;
