import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ShieldCheckIcon, 
  UsersIcon, 
  ChartBarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilSquareIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { useAdminStore } from './store';
import { useAuthStore } from '../auth/store';
import { AdminUser, PlanType } from './types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const AdminPage: React.FC = () => {
  const { t } = useTranslation('admin');
  const { user } = useAuthStore();
  const {
    users,
    platformStats,
    pagination,
    filters,
    loading,
    error,
    fetchUsers,
    fetchPlatformStats,
    setFilters
  } = useAdminStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchPlatformStats();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ search: searchTerm });
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ [key]: value });
  };

  const handlePageChange = (page: number) => {
    fetchUsers(page);
  };

  const getPlanBadgeColor = (plan: PlanType) => {
    switch (plan) {
      case 'FREE':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      case 'STARTER':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'PRO':
        return 'bg-orange-200 text-orange-900 dark:bg-orange-800/40 dark:text-orange-200';
      case 'ENTERPRISE':
        return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getStatusBadge = (isActive: boolean, expiresAt?: string) => {
    if (!isActive) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
          {t('status.inactive')}
        </span>
      );
    }

    if (expiresAt) {
      const expiry = new Date(expiresAt);
      const now = new Date();
      const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysLeft < 0) {
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
            {t('status.expired')}
          </span>
        );
      } else if (daysLeft <= 7) {
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
            {t('status.expiring_soon')}
          </span>
        );
      }
    }

    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
        {t('status.active')}
      </span>
    );
  };

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-orange-lg p-8 max-w-md w-full text-center border border-orange-500/20 dark:border-orange-500/20">
          <ShieldCheckIcon className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {t('access_denied.title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('access_denied.message')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-orange-500/20 dark:border-orange-500/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-orange-md">
                <ShieldCheckIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 bg-clip-text text-transparent">
                  {t('title')}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {t('subtitle')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {platformStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Users */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/20 dark:border-orange-500/20 shadow-orange-md hover:shadow-orange-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t('stats.total_users')}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                    {platformStats.users.total}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl">
                  <UsersIcon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            {/* Active Users */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/20 dark:border-orange-500/20 shadow-orange-md hover:shadow-orange-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t('stats.active_users')}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                    {platformStats.users.active}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl">
                  <ChartBarIcon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            {/* Recent Users */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/20 dark:border-orange-500/20 shadow-orange-md hover:shadow-orange-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t('stats.recent_users')}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                    {platformStats.users.recent}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {t('stats.last_30_days')}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-r from-orange-400 to-orange-500 rounded-xl">
                  <UsersIcon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            {/* Plans Distribution */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/20 dark:border-orange-500/20 shadow-orange-md hover:shadow-orange-lg transition-all duration-300">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                {t('stats.by_plan')}
              </p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600 dark:text-gray-400">FREE</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {platformStats.users.byPlan.free}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600 dark:text-gray-400">STARTER</span>
                  <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                    {platformStats.users.byPlan.starter}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600 dark:text-gray-400">PRO</span>
                  <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                    {platformStats.users.byPlan.pro}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600 dark:text-gray-400">ENTERPRISE</span>
                  <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                    {platformStats.users.byPlan.enterprise}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-orange-500/20 dark:border-orange-500/20 shadow-orange-md">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('search.placeholder')}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                />
              </div>
            </form>

            {/* Plan Filter */}
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              <select
                value={filters.planFilter}
                onChange={(e) => handleFilterChange('planFilter', e.target.value)}
                className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 dark:text-gray-100 transition-all"
              >
                <option value="">{t('filters.all_plans')}</option>
                <option value="FREE">FREE</option>
                <option value="STARTER">STARTER</option>
                <option value="PRO">PRO</option>
                <option value="ENTERPRISE">ENTERPRISE</option>
              </select>
            </div>

            {/* Status Filter */}
            <select
              value={filters.statusFilter}
              onChange={(e) => handleFilterChange('statusFilter', e.target.value)}
              className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 dark:text-gray-100 transition-all"
            >
              <option value="">{t('filters.all_status')}</option>
              <option value="active">{t('filters.active')}</option>
              <option value="expired">{t('filters.expired')}</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl border border-orange-500/20 dark:border-orange-500/20 shadow-orange-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 dark:border-orange-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <UsersIcon className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">{t('no_users')}</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('table.salon')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('table.email')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('table.plan')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('table.status')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('table.expiry')}
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('table.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {users.map((user) => (
                      <tr
                        key={user._id}
                        className="hover:bg-orange-50/50 dark:hover:bg-gray-700/30 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {user.establishmentName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {user.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getPlanBadgeColor(user.subscription.plan)}`}>
                            {user.subscription.plan}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(user.subscription.isActive, user.subscription.expiresAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {user.subscription.expiresAt
                              ? format(new Date(user.subscription.expiresAt), 'dd MMM yyyy', { locale: fr })
                              : t('table.no_expiry')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowEditModal(true);
                              }}
                              className="p-2 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                              title={t('actions.edit')}
                            >
                              <PencilSquareIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => {
                                // TODO: Implement view details
                              }}
                              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                              title={t('actions.view')}
                            >
                              <EyeIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {t('pagination.showing', {
                        from: (pagination.page - 1) * pagination.limit + 1,
                        to: Math.min(pagination.page * pagination.limit, pagination.total),
                        total: pagination.total
                      })}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {t('pagination.previous')}
                      </button>
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {t('pagination.next')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Edit Modal - TODO: Create SubscriptionEditor component */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-900/75 dark:bg-black/80 backdrop-blur-sm"
              onClick={() => setShowEditModal(false)}
            />
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-orange-500/20">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
                <h3 className="text-lg font-semibold text-white">
                  {t('edit_modal.title')}
                </h3>
              </div>
              <div className="px-6 py-4">
                <p className="text-gray-600 dark:text-gray-400">
                  {t('edit_modal.coming_soon')}
                </p>
              </div>
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {t('edit_modal.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
