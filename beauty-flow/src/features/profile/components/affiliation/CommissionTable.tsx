import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowDownTrayIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import { useAffiliationStore } from '../../store/affiliationStore';
import { Commission } from '../../types/affiliation';
import { Badge, BadgeTone, EmptyState, Panel, StatGroup } from '../../../../components/ui';
import { formatPrice } from '../../../../utils/currency';

const STATUS_TONE: Record<Commission['status'], BadgeTone> = { pending: 'amber', approved: 'blue', paid: 'green', cancelled: 'red' };

const CommissionTable: React.FC = () => {
  const { t, i18n } = useTranslation('profile');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'paid'>('all');
  const { commissions, loadCommissions, isLoading } = useAffiliationStore();

  useEffect(() => {
    loadCommissions();
  }, [loadCommissions]);

  const getStatusBadge = (status: Commission['status']) => (
    <Badge tone={STATUS_TONE[status] || 'neutral'}>{t(`affiliation_components.commissions.status.${status}`)}</Badge>
  );

  const getCommissionType = (type: Commission['type']) => {
    switch (type) {
      case 'subscription':
        return t('affiliation_components.commissions.types.subscription');
      case 'renewal':
        return t('affiliation_components.commissions.types.renewal');
      case 'upgrade':
        return t('affiliation_components.commissions.types.upgrade');
      default:
        return type;
    }
  };

  const filteredCommissions = filter === 'all' 
    ? commissions 
    : commissions.filter(c => c.status === filter);

  const totalPending = commissions
    .filter(c => c.status === 'pending')
    .reduce((sum, c) => sum + c.amount, 0);

  const totalApproved = commissions
    .filter(c => c.status === 'approved')
    .reduce((sum, c) => sum + c.amount, 0);

  const totalPaid = commissions
    .filter(c => c.status === 'paid')
    .reduce((sum, c) => sum + c.amount, 0);

  const handleExportCSV = () => {
    const csvContent = [
      [t('affiliation_components.commissions.table.date'), t('affiliation_components.commissions.table.referred_client'), t('affiliation_components.commissions.table.type'), t('affiliation_components.commissions.table.original_amount'), t('affiliation_components.commissions.table.commission'), t('affiliation_components.commissions.table.rate'), t('affiliation_components.commissions.table.status'), t('affiliation_components.commissions.table.payment_date')],
      ...filteredCommissions.map(c => [
        new Date(c.createdAt).toLocaleDateString(i18n.language),
        c.referredUserName,
        getCommissionType(c.type),
        c.originalAmount.toFixed(2),
        c.amount.toFixed(2),
        `${(c.commissionRate * 100).toFixed(0)}%`,
        c.status,
        c.paymentDate ? new Date(c.paymentDate).toLocaleDateString(i18n.language) : ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `commissions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currency = commissions[0]?.currency || 'EUR';
  const th = 'px-5 py-3 whitespace-nowrap text-[0.8125rem] font-medium text-gray-500 dark:text-gray-400';
  const td = 'px-5 py-3 whitespace-nowrap text-sm tabular-nums';

  return (
    <div className="space-y-6">
      <StatGroup
        className="mb-0"
        items={[
          { label: t('affiliation_components.commissions.status.pending'), value: formatPrice(totalPending, currency) },
          { label: t('affiliation_components.commissions.status.approved'), value: formatPrice(totalApproved, currency) },
          { label: t('affiliation_components.commissions.status.paid'), value: formatPrice(totalPaid, currency), accent: true }
        ]}
      />

      <Panel
        flush
        actions={
          <>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              aria-label={t('affiliation_components.commissions.table.status')}
              className="field w-auto py-2"
            >
              <option value="all">{t('affiliation_components.commissions.filters.all')}</option>
              <option value="pending">{t('affiliation_components.commissions.filters.pending')}</option>
              <option value="approved">{t('affiliation_components.commissions.filters.approved')}</option>
              <option value="paid">{t('affiliation_components.commissions.filters.paid')}</option>
            </select>
            <button onClick={handleExportCSV} disabled={filteredCommissions.length === 0} className="btn-secondary">
              <ArrowDownTrayIcon className="size-4" />
              <span className="hidden sm:inline">{t('affiliation_components.commissions.export')}</span>
            </button>
          </>
        }
      >
        {filteredCommissions.length === 0 ? (
          <EmptyState
            icon={BanknotesIcon}
            title={t('affiliation_components.commissions.empty_state.title')}
            body={t('affiliation_components.commissions.empty_state.subtitle')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-y border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                <tr>
                  <th className={`${th} text-start`}>{t('affiliation_components.commissions.table.date')}</th>
                  <th className={`${th} text-start`}>{t('affiliation_components.commissions.table.referred_client')}</th>
                  <th className={`${th} text-start`}>{t('affiliation_components.commissions.table.type')}</th>
                  <th className={`${th} text-end`}>{t('affiliation_components.commissions.table.original_amount')}</th>
                  <th className={`${th} text-end`}>{t('affiliation_components.commissions.table.commission')}</th>
                  <th className={`${th} text-start`}>{t('affiliation_components.commissions.table.status')}</th>
                  <th className={`${th} text-start`}>{t('affiliation_components.commissions.table.payment_date')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredCommissions.map((commission) => (
                  <tr key={commission.id}>
                    <td className={`${td} text-gray-600 dark:text-gray-400`}>{new Date(commission.createdAt).toLocaleDateString(i18n.language)}</td>
                    <td className={`${td} font-medium text-gray-900 dark:text-gray-50`}>{commission.referredUserName}</td>
                    <td className={`${td} text-gray-600 dark:text-gray-400`}>{getCommissionType(commission.type)}</td>
                    <td className={`${td} text-end text-gray-600 dark:text-gray-400`}>{formatPrice(commission.originalAmount, commission.currency || currency)}</td>
                    <td className={`${td} text-end`}>
                      <span className="font-medium text-gray-900 dark:text-gray-50">{formatPrice(commission.amount, commission.currency || currency)}</span>
                      <span className="ms-1.5 text-xs text-gray-500 dark:text-gray-400">{(commission.commissionRate * 100).toFixed(0)} %</span>
                    </td>
                    <td className={td}>{getStatusBadge(commission.status)}</td>
                    <td className={`${td} text-gray-600 dark:text-gray-400`}>
                      {commission.paymentDate ? new Date(commission.paymentDate).toLocaleDateString(i18n.language) : '–'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <p className="text-sm text-gray-500 dark:text-gray-400">{t('affiliation_components.commissions.payment_note.description')}</p>
    </div>
  );
};

export default CommissionTable;
