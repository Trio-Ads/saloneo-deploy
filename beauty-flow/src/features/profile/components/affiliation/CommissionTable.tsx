import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BanknotesIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { useAffiliationStore } from '../../store/affiliationStore';
import { Commission } from '../../types/affiliation';

const CommissionTable: React.FC = () => {
  const { t } = useTranslation('profile');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'paid'>('all');
  const { commissions, loadCommissions, isLoading } = useAffiliationStore();

  useEffect(() => {
    loadCommissions();
  }, [loadCommissions]);

  const getStatusBadge = (status: Commission['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="h-3 w-3 mr-1" />
            {t('affiliation_components.commissions.status.pending')}
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <CheckCircleIcon className="h-3 w-3 mr-1" />
            {t('affiliation_components.commissions.status.approved')}
          </span>
        );
      case 'paid':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CurrencyDollarIcon className="h-3 w-3 mr-1" />
            {t('affiliation_components.commissions.status.paid')}
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircleIcon className="h-3 w-3 mr-1" />
            {t('affiliation_components.commissions.status.cancelled')}
          </span>
        );
    }
  };

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
      ['Date', 'Client référé', 'Type', 'Montant original', 'Commission', 'Taux', 'Statut', 'Date paiement'],
      ...filteredCommissions.map(c => [
        new Date(c.createdAt).toLocaleDateString('fr-FR'),
        c.referredUserName,
        getCommissionType(c.type),
        c.originalAmount.toFixed(2),
        c.amount.toFixed(2),
        `${(c.commissionRate * 100).toFixed(0)}%`,
        c.status,
        c.paymentDate ? new Date(c.paymentDate).toLocaleDateString('fr-FR') : ''
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

  return (
    <div className="space-y-6">
      {/* Résumé des commissions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-800">{t('affiliation_components.commissions.status.pending')}</p>
              <p className="text-2xl font-bold text-yellow-900">{totalPending.toFixed(2)} €</p>
            </div>
            <ClockIcon className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">{t('affiliation_components.commissions.status.approved')}</p>
              <p className="text-2xl font-bold text-blue-900">{totalApproved.toFixed(2)} €</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">{t('affiliation_components.commissions.status.paid')}</p>
              <p className="text-2xl font-bold text-green-900">{totalPaid.toFixed(2)} €</p>
            </div>
            <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filtres et actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 text-sm focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">{t('affiliation_components.commissions.filters.all')}</option>
              <option value="pending">{t('affiliation_components.commissions.filters.pending')}</option>
              <option value="approved">{t('affiliation_components.commissions.filters.approved')}</option>
              <option value="paid">{t('affiliation_components.commissions.filters.paid')}</option>
            </select>
          </div>

          <button 
            onClick={handleExportCSV}
            disabled={filteredCommissions.length === 0}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            {t('affiliation_components.commissions.export')}
          </button>
        </div>
      </div>

      {/* Tableau des commissions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('affiliation_components.commissions.table.date')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('affiliation_components.commissions.table.referred_client')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('affiliation_components.commissions.table.type')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('affiliation_components.commissions.table.original_amount')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('affiliation_components.commissions.table.commission')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('affiliation_components.commissions.table.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('affiliation_components.commissions.table.payment_date')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCommissions.map((commission) => (
                <tr key={commission.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {new Date(commission.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {commission.referredUserName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {getCommissionType(commission.type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {commission.originalAmount.toFixed(2)} €
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {commission.amount.toFixed(2)} €
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {(commission.commissionRate * 100).toFixed(0)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(commission.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {commission.paymentDate 
                      ? new Date(commission.paymentDate).toLocaleDateString('fr-FR')
                      : '-'
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCommissions.length === 0 && (
          <div className="text-center py-12">
            <BanknotesIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">{t('affiliation_components.commissions.empty_state.title')}</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t('affiliation_components.commissions.empty_state.subtitle')}
            </p>
          </div>
        )}
      </div>

      {/* Note sur les paiements */}
      <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-700">
        <p className="text-sm text-orange-800 dark:text-orange-200">
          <strong>{t('affiliation_components.commissions.payment_note.title')}</strong> {t('affiliation_components.commissions.payment_note.description')}
        </p>
      </div>
    </div>
  );
};

export default CommissionTable;
