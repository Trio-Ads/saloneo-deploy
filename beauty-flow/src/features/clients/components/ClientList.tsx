import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarDaysIcon,
  HeartIcon,
  StarIcon,
  PencilIcon,
  TrashIcon,
  GiftIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { Client } from '../types';
import { useServiceStore } from '../../services/store';
import { useTeamStore } from '../../team/store';

interface ClientListProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (clientId: string) => void;
}

const ClientList: React.FC<ClientListProps> = ({ clients, onEdit, onDelete }) => {
  const { t } = useTranslation('clients');
  const services = useServiceStore((state) => state.services);
  const teamMembers = useTeamStore((state) => state.members);
  const activeClients = clients.filter((client) => client.isActive);

  const getServiceNames = (serviceIds: string[]) => {
    return serviceIds
      .map((id) => services.find((service) => service.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  const getStylistNames = (stylistIds: string[]) => {
    return stylistIds
      .map((id) => {
        const member = teamMembers.find((m) => m.id === id);
        return member ? `${member.firstName} ${member.lastName}` : null;
      })
      .filter(Boolean)
      .join(', ');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getClientStatusColor = (client: Client) => {
    const daysSinceLastVisit = client.lastVisit 
      ? Math.floor((Date.now() - new Date(client.lastVisit).getTime()) / (1000 * 60 * 60 * 24))
      : null;
    
    if (!daysSinceLastVisit) return 'text-gray-500';
    if (daysSinceLastVisit <= 30) return 'text-green-500';
    if (daysSinceLastVisit <= 90) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getLoyaltyLevel = (points: number) => {
    if (points >= 1000) return { level: t('client_list.loyalty_levels.vip'), color: 'text-indigo-600', bgColor: 'bg-indigo-100' };
    if (points >= 500) return { level: t('client_list.loyalty_levels.gold'), color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    if (points >= 200) return { level: t('client_list.loyalty_levels.silver'), color: 'text-gray-600', bgColor: 'bg-gray-100' };
    return { level: t('client_list.loyalty_levels.bronze'), color: 'text-orange-600', bgColor: 'bg-orange-100' };
  };

  if (activeClients.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <div className="mx-auto w-24 h-24 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full flex items-center justify-center mb-6 shadow-lg animate-pulse">
          <UserIcon className="h-12 w-12 text-white" />
        </div>
        <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-3">
          {t('client_list.empty_state.title')}
        </h3>
        <p className="text-gray-600 text-lg">{t('client_list.empty_state.subtitle')}</p>
        <div className="mt-6 inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-100 to-blue-100 rounded-full text-indigo-700 text-sm font-medium">
          ✨ {t('client_list.empty_state.cta')}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activeClients.map((client) => {
        const loyaltyInfo = getLoyaltyLevel(client.loyaltyPoints);
        const statusColor = getClientStatusColor(client);
        
        return (
          <div
            key={client.id}
            className="glass-card p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] animate-fadeIn border border-white/20"
          >
            {/* Header avec nom et actions */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <UserIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                    {client.firstName} {client.lastName}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${loyaltyInfo.bgColor} ${loyaltyInfo.color}`}>
                      <StarIcon className="h-3 w-3 mr-1" />
                      {loyaltyInfo.level}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${statusColor.replace('text-', 'bg-')}`}></span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onEdit(client)}
                  className="glass-button p-3 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition-all duration-200 transform hover:scale-110 shadow-lg hover:shadow-xl"
                  title={t('client_list.tooltips.edit_client')}
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onDelete(client.id)}
                  className="glass-button p-3 text-red-600 hover:text-red-800 hover:bg-red-50 transition-all duration-200 transform hover:scale-110 shadow-lg hover:shadow-xl"
                  title={t('client_list.tooltips.delete_client')}
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Informations principales */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Colonne gauche - Informations de contact */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 glass-card bg-white/30 rounded-xl">
                  <EnvelopeIcon className="h-5 w-5 text-indigo-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">{t('client_list.info_labels.email')}</p>
                    <p className="text-sm text-gray-900">{client.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 glass-card bg-white/30 rounded-xl">
                  <PhoneIcon className="h-5 w-5 text-indigo-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">{t('client_list.info_labels.phone')}</p>
                    <p className="text-sm text-gray-900">{client.phone}</p>
                  </div>
                </div>

                {client.birthDate && (
                  <div className="flex items-center space-x-3 p-3 glass-card bg-white/30 rounded-xl">
                    <GiftIcon className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">{t('client_list.info_labels.birth_date')}</p>
                      <p className="text-sm text-gray-900">{formatDate(client.birthDate)}</p>
                    </div>
                  </div>
                )}

                {client.lastVisit && (
                  <div className="flex items-center space-x-3 p-3 glass-card bg-white/30 rounded-xl">
                    <CalendarDaysIcon className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">{t('client_list.info_labels.last_visit')}</p>
                      <p className={`text-sm font-medium ${statusColor}`}>{formatDate(client.lastVisit)}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Colonne droite - Préférences et détails */}
              <div className="space-y-3">
                {client.preferences.hairQuestionnaire && (
                  <div className="p-3 glass-card bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl">
                    <div className="flex items-center space-x-2 mb-2">
                      <SparklesIcon className="h-5 w-5 text-indigo-600" />
                      <p className="text-sm font-medium text-gray-700">{t('client_list.profile_sections.hair_profile')}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{t('client_list.hair_info.type')}</span> {client.preferences.hairQuestionnaire.hairType}
                      </p>
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{t('client_list.hair_info.thickness')}</span> {client.preferences.hairQuestionnaire.thickness}
                      </p>
                    </div>
                  </div>
                )}

                <div className="p-3 glass-card bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <StarIcon className="h-5 w-5 text-yellow-600" />
                    <p className="text-sm font-medium text-gray-700">{t('client_list.profile_sections.loyalty_points')}</p>
                  </div>
                  <p className="text-2xl font-bold text-yellow-600">{client.loyaltyPoints}</p>
                </div>

                {/* Préférences de communication */}
                <div className="p-3 glass-card bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-600" />
                    <p className="text-sm font-medium text-gray-700">{t('client_list.profile_sections.communication')}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    {client.preferences.communicationPreferences.smsReminders && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        📱 {t('client_list.communication_badges.sms')}
                      </span>
                    )}
                    {client.preferences.communicationPreferences.emailMarketing && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        📧 {t('client_list.communication_badges.email')}
                      </span>
                    )}
                    {client.preferences.communicationPreferences.birthdayOffers && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        🎂 {t('client_list.communication_badges.birthday')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Services et coiffeurs préférés */}
            {(client.preferences.favoriteServices.length > 0 || client.preferences.preferredStylists.length > 0) && (
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                {client.preferences.favoriteServices.length > 0 && (
                  <div className="p-4 glass-card bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl">
                    <div className="flex items-center space-x-2 mb-3">
                      <HeartIcon className="h-5 w-5 text-indigo-600" />
                      <p className="text-sm font-medium text-gray-700">{t('client_list.profile_sections.favorite_services')}</p>
                    </div>
                    <p className="text-sm text-gray-900 leading-relaxed">
                      {getServiceNames(client.preferences.favoriteServices)}
                    </p>
                  </div>
                )}

                {client.preferences.preferredStylists.length > 0 && (
                  <div className="p-4 glass-card bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                    <div className="flex items-center space-x-2 mb-3">
                      <UserIcon className="h-5 w-5 text-blue-600" />
                      <p className="text-sm font-medium text-gray-700">{t('client_list.profile_sections.preferred_stylists')}</p>
                    </div>
                    <p className="text-sm text-gray-900 leading-relaxed">
                      {getStylistNames(client.preferences.preferredStylists)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            {client.notes && (
              <div className="mt-6 p-4 glass-card bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border-l-4 border-indigo-500">
                <div className="flex items-center space-x-2 mb-2">
                  <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-600" />
                  <p className="text-sm font-medium text-gray-700">{t('client_list.profile_sections.notes')}</p>
                </div>
                <p className="text-sm text-gray-900 leading-relaxed italic">"{client.notes}"</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ClientList;
