import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAffiliationStore } from '../../store/affiliationStore';
import { useToastStore } from '../../../../components/Toast';
import { Badge, Segmented, StatGroup } from '../../../../components/ui';
import { formatPrice } from '../../../../utils/currency';
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
      <div className="flex items-center justify-center gap-3 py-16 text-sm text-gray-500 dark:text-gray-400">
        <span className="size-5 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
        {t('affiliation_components.loading')}
      </div>
    );
  }

  if (!affiliation || !affiliation.isAffiliate) {
    return <AffiliationActivation />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">{t('affiliation_components.program_title')}</h2>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            {t('affiliation_components.affiliate_code')} <span className="font-medium text-gray-900 dark:text-gray-50">{affiliation.affiliateCode}</span>
          </p>
        </div>
        <Badge tone={affiliation.isActive ? 'green' : 'amber'}>
          {affiliation.isActive ? t('affiliation_components.status.active') : t('affiliation_components.status.inactive')}
        </Badge>
      </div>

      <StatGroup
        className="mb-0"
        items={[
          { label: t('affiliation_components.stats.total_referrals'), value: affiliation.totalReferrals },
          { label: t('affiliation_components.stats.total_commissions'), value: formatPrice(affiliation.totalCommissions, 'EUR'), accent: true },
          { label: t('affiliation_components.stats.commission_rate'), value: `${(affiliation.commissionRate * 100).toFixed(0)} %` },
          { label: t('affiliation_components.stats.conversion_rate'), value: `${affiliation.stats.conversionRate.toFixed(1)} %` }
        ]}
      />

      <Segmented
        value={activeTab}
        onChange={setActiveTab}
        options={[
          { value: 'dashboard', label: t('affiliation_components.tabs.dashboard') },
          { value: 'commissions', label: t('affiliation_components.tabs.commissions') },
          { value: 'settings', label: t('affiliation_components.tabs.settings') },
          { value: 'marketing', label: t('affiliation_components.tabs.marketing') }
        ]}
      />

      {activeTab === 'dashboard' && <AffiliationDashboard />}
      {activeTab === 'commissions' && <CommissionTable />}
      {activeTab === 'settings' && <PayoutSettings />}
      {activeTab === 'marketing' && <MarketingTools />}
    </div>
  );
};

export default AffiliationTab;
