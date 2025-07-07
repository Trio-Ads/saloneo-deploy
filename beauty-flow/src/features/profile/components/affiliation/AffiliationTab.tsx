import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  UserGroupIcon,
  ChartBarIcon,
  BanknotesIcon,
  ShareIcon,
  CogIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { useAffiliationStore } from '../../store/affiliationStore';
import { useToastStore } from '../../../../components/Toast';
import { 
  AffiliationActivation,
  AffiliationDashboard,
  CommissionTable,
  PayoutSettings,
  MarketingTools
} from './index';

type TabType = 'dashboard' | 'commissions' | 'settings' | 'marketing';

const AffiliationTab: React.FC = () => {
  const { t } = useTranslation('profile');
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const { 
    affiliation, 
    isLoading, 
    error, 
    loadAffiliationData,
    resetError 
  } = useAffiliationStore();
  const { showToast } = useToastStore();

  useEffect(() => {
    loadAffiliationData();
  }, [loadAffiliationData]);

  useEffect(() => {
    if (error) {
      showToast(error, 'error');
      resetError();
    }
  }, [error, showToast, resetError]);

  if (isLoading && !affiliation) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-700">Chargement des données d'affiliation...</span>
        </div>
      </div>
    );
  }

  if (!affiliation || !affiliation.isAffiliate) {
    return <AffiliationActivation />;
  }

  const tabs = [
    { id: 'dashboard', label: 'Tableau de bord', icon: ChartBarIcon },
    { id: 'commissions', label: 'Commissions', icon: BanknotesIcon },
    { id: 'settings', label: 'Paramètres', icon: CogIcon },
    { id: 'marketing', label: 'Outils Marketing', icon: ShareIcon },
  ];

  return (
    <div className="space-y-6">
      {/* Header avec statistiques rapides */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl">
              <UserGroupIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Programme d'Affiliation</h2>
              <p className="text-gray-600">Code affilié: <span className="font-mono font-semibold">{affiliation.affiliateCode}</span></p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {affiliation.isActive ? (
              <>
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-green-700">Actif</span>
              </>
            ) : (
              <>
                <ExclamationCircleIcon className="h-5 w-5 text-yellow-500" />
                <span className="text-sm font-medium text-yellow-700">Inactif</span>
              </>
            )}
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4">
            <p className="text-sm text-gray-600">Total des parrainages</p>
            <p className="text-2xl font-bold text-gray-900">{affiliation.totalReferrals}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4">
            <p className="text-sm text-gray-600">Commissions totales</p>
            <p className="text-2xl font-bold text-gray-900">{affiliation.totalCommissions.toFixed(2)} €</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4">
            <p className="text-sm text-gray-600">Taux de commission</p>
            <p className="text-2xl font-bold text-gray-900">{(affiliation.commissionRate * 100).toFixed(0)}%</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4">
            <p className="text-sm text-gray-600">Taux de conversion</p>
            <p className="text-2xl font-bold text-gray-900">
              {affiliation.stats.conversionRate.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`
                    flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm
                    transition-colors duration-200
                    ${activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Contenu des onglets */}
        <div className="p-6">
          {activeTab === 'dashboard' && <AffiliationDashboard />}
          {activeTab === 'commissions' && <CommissionTable />}
          {activeTab === 'settings' && <PayoutSettings />}
          {activeTab === 'marketing' && <MarketingTools />}
        </div>
      </div>
    </div>
  );
};

export default AffiliationTab;
