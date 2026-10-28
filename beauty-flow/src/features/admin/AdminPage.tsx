import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  EnvelopeIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  ShieldCheckIcon,
  UsersIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import api from '../../services/api';
import { Badge, BadgeTone, EmptyState, IconButton, PageHeader, Panel, Segmented, StatGroup } from '../../components/ui';
import AdminDeposits from './AdminDeposits';
import AdminMarketplace from '../marketplace/admin/AdminMarketplace';

const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5';
import { useAdminStore } from './store';
import { useAuthStore } from '../auth/store';
import { AdminUser, PlanType, SubscriptionDuration } from './types';
import { format, addMonths, addYears } from 'date-fns';
import { dateLocale } from '../dashboard/dateLocale';

// SubscriptionEditor Component
interface SubscriptionEditorProps {
  user: AdminUser;
  onClose: () => void;
  onSuccess: () => void;
}

const SubscriptionEditor: React.FC<SubscriptionEditorProps> = ({ user, onClose, onSuccess }) => {
  const { t } = useTranslation('admin');
  const { updateUserSubscription } = useAdminStore();
  
  const [formData, setFormData] = useState({
    plan: user.subscription?.plan || PlanType.FREE,
    duration: user.subscription?.duration || SubscriptionDuration.MONTHLY,
    isActive: user.subscription?.isActive || false,
    expiresAt: user.subscription?.expiresAt ? format(new Date(user.subscription.expiresAt), 'yyyy-MM-dd') : ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Calculate expiry date based on duration if not manually set
      let expiresAt = formData.expiresAt;
      if (!expiresAt && formData.plan !== 'FREE') {
        const now = new Date();
        switch (formData.duration) {
          case 'MONTHLY':
            expiresAt = format(addMonths(now, 1), 'yyyy-MM-dd');
            break;
          case 'YEARLY':
            expiresAt = format(addYears(now, 1), 'yyyy-MM-dd');
            break;
          case 'BIENNIAL':
            expiresAt = format(addYears(now, 2), 'yyyy-MM-dd');
            break;
          case 'TRIENNIAL':
            expiresAt = format(addYears(now, 3), 'yyyy-MM-dd');
            break;
        }
      }

      await updateUserSubscription(user._id, {
        plan: formData.plan as PlanType,
        duration: formData.duration as SubscriptionDuration,
        isActive: formData.isActive,
        expiresAt: expiresAt || undefined
      });

      alert(t('edit_modal.success'));
      onSuccess();
    } catch (error) {
      alert(t('edit_modal.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-gray-900/50 sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sub-editor-title"
        onClick={(e) => e.stopPropagation()}
        className="animate-modal-in sheet-on-mobile w-full overflow-hidden rounded-t-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900 sm:max-w-lg sm:rounded-2xl"
      >
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
            <div className="min-w-0">
              <h3 id="sub-editor-title" className="text-base font-semibold text-gray-900 dark:text-gray-50">{t('edit_modal.title')}</h3>
              <p className="truncate text-sm text-gray-500 dark:text-gray-400">{user.establishmentName} · {user.email}</p>
            </div>
            <IconButton label={t('edit_modal.cancel')} onClick={onClose}>
              <XMarkIcon className="size-5" />
            </IconButton>
          </div>

          <div className="space-y-4 px-5 py-5">
            <div>
              <label htmlFor="sub-plan" className={labelClass}>{t('edit_modal.plan')}</label>
              <select
                id="sub-plan"
                value={formData.plan}
                onChange={(e) => setFormData({ ...formData, plan: e.target.value as PlanType })}
                className="field"
              >
                <option value="FREE">FREE</option>
                <option value="STARTER">STARTER</option>
                <option value="PRO">PRO</option>
                <option value="ENTERPRISE">ENTERPRISE</option>
              </select>
            </div>

            {formData.plan !== 'FREE' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="sub-duration" className={labelClass}>{t('edit_modal.duration')}</label>
                  <select
                    id="sub-duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value as SubscriptionDuration })}
                    className="field"
                  >
                    <option value="MONTHLY">{t('edit_modal.monthly')}</option>
                    <option value="YEARLY">{t('edit_modal.yearly')}</option>
                    <option value="BIENNIAL">{t('edit_modal.biennial')}</option>
                    <option value="TRIENNIAL">{t('edit_modal.triennial')}</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="sub-expiry" className={labelClass}>{t('edit_modal.expiry_date')}</label>
                  <input
                    id="sub-expiry"
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    className="field"
                  />
                </div>
                <p className="-mt-2 text-xs text-gray-500 dark:text-gray-400 sm:col-span-2">{t('edit_modal.expiry_help')}</p>
              </div>
            )}

            <label htmlFor="isActive" className="flex cursor-pointer items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="size-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-800"
              />
              {t('edit_modal.active')}
            </label>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-gray-100 px-5 py-4 dark:border-gray-800 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} disabled={loading} className="btn-secondary">
              {t('edit_modal.cancel')}
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? t('edit_modal.saving') : t('edit_modal.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminPage: React.FC = () => {
  const { t, i18n } = useTranslation('admin');
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
  const [sendingFeedback, setSendingFeedback] = useState<string | null>(null);
  // ?section=marketplace from the admin emails (disputes, applications, failed refunds)
  const [section, setSection] = useState<'salons' | 'deposits' | 'marketplace'>(() => (new URLSearchParams(window.location.search).get('section') === 'marketplace' ? 'marketplace' : 'salons'));

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

  const handleSendFeedbackToUser = async (userId: string, establishmentName: string) => {
    setSendingFeedback(userId);
    try {
      const { data } = await api.post(`/admin/feedback/send/${userId}`);

      if (data.success) {
        alert(t('feedback.sent', { name: establishmentName }));
      } else {
        alert(`${t('feedback.error')} ${data.message || ''}`);
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi de l\'email de feedback:', error);
      alert(`${t('feedback.error')} ${error.response?.data?.message || ''}`);
    } finally {
      setSendingFeedback(null);
    }
  };

  const getPlanBadge = (plan: PlanType | undefined) => (
    <Badge tone={!plan || plan === 'FREE' ? 'neutral' : 'orange'}>{plan || 'N/A'}</Badge>
  );

  const getStatusBadge = (isActive: boolean, expiresAt?: string) => {
    let tone: BadgeTone = 'green';
    let label = t('status.active');
    if (!isActive) {
      tone = 'neutral';
      label = t('status.inactive');
    } else if (expiresAt) {
      const daysLeft = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysLeft < 0) {
        tone = 'red';
        label = t('status.expired');
      } else if (daysLeft <= 7) {
        tone = 'amber';
        label = t('status.expiring_soon');
      }
    }
    return <Badge tone={tone}>{label}</Badge>;
  };

  if (!user?.isAdmin) {
    return (
      <div className="py-6 sm:py-8">
        <Panel>
          <EmptyState icon={ShieldCheckIcon} title={t('access_denied.title')} body={t('access_denied.message')} />
        </Panel>
      </div>
    );
  }

  const th = 'px-5 py-3 whitespace-nowrap text-[0.8125rem] font-medium text-gray-500 dark:text-gray-400';
  const td = 'px-5 py-3 whitespace-nowrap text-sm';

  return (
    <div className="py-6 sm:py-8">
      <PageHeader title={t('title')} subtitle={t('subtitle')} />

      <Segmented
        className="mb-6"
        value={section}
        onChange={setSection}
        options={[{ value: 'salons', label: t('sections.salons') }, { value: 'deposits', label: t('sections.deposits') }, { value: 'marketplace', label: t('sections.marketplace') }]}
      />

      {section === 'deposits' ? <AdminDeposits /> : section === 'marketplace' ? <AdminMarketplace /> : <>

      {platformStats && (
        <StatGroup
          items={[
            { label: t('stats.total_users'), value: platformStats.users.total },
            { label: t('stats.active_users'), value: platformStats.users.active },
            { label: t('stats.recent_users'), value: platformStats.users.recent, hint: t('stats.last_30_days') },
            {
              label: t('stats.by_plan'),
              value: [platformStats.users.byPlan.free, platformStats.users.byPlan.starter, platformStats.users.byPlan.pro, platformStats.users.byPlan.enterprise].join(' · '),
              hint: 'Free · Starter · Pro · Enterprise'
            }
          ]}
        />
      )}

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <form onSubmit={handleSearch} className="relative flex-1 lg:max-w-sm">
          <MagnifyingGlassIcon className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('search.placeholder')}
            aria-label={t('search.placeholder')}
            className="field ps-9"
          />
        </form>
        <div className="grid grid-cols-2 gap-3 sm:flex">
          <select
            value={filters.planFilter || ''}
            onChange={(e) => handleFilterChange('planFilter', e.target.value)}
            aria-label={t('filters.all_plans')}
            className="field sm:w-44"
          >
            <option value="">{t('filters.all_plans')}</option>
            <option value="FREE">FREE</option>
            <option value="STARTER">STARTER</option>
            <option value="PRO">PRO</option>
            <option value="ENTERPRISE">ENTERPRISE</option>
          </select>
          <select
            value={filters.statusFilter || ''}
            onChange={(e) => handleFilterChange('statusFilter', e.target.value)}
            aria-label={t('filters.all_status')}
            className="field sm:w-44"
          >
            <option value="">{t('filters.all_status')}</option>
            <option value="active">{t('filters.active')}</option>
            <option value="expired">{t('filters.expired')}</option>
          </select>
        </div>
      </div>

      <Panel flush>
        {loading ? (
          <div className="flex justify-center py-14">
            <span className="size-6 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
          </div>
        ) : error ? (
          <p className="py-14 text-center text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : users.length === 0 ? (
          <EmptyState icon={UsersIcon} title={t('no_users')} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="border-b border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                  <tr>
                    <th className={`${th} text-start`}>{t('table.salon')}</th>
                    <th className={`${th} text-start`}>{t('table.email')}</th>
                    <th className={`${th} text-start`}>{t('table.plan')}</th>
                    <th className={`${th} text-start`}>{t('table.status')}</th>
                    <th className={`${th} text-start`}>{t('table.expiry')}</th>
                    <th className={`${th} text-end`}><span className="sr-only">{t('table.actions')}</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className={`${td} font-medium text-gray-900 dark:text-gray-50`}>{user.establishmentName}</td>
                      <td className={`${td} text-gray-600 dark:text-gray-400`}>{user.email}</td>
                      <td className={td}>{getPlanBadge(user.subscription?.plan)}</td>
                      <td className={td}>{getStatusBadge(user.subscription?.isActive || false, user.subscription?.expiresAt)}</td>
                      <td className={`${td} tabular-nums text-gray-600 dark:text-gray-400`}>
                        {user.subscription?.expiresAt
                          ? format(new Date(user.subscription.expiresAt), 'dd MMM yyyy', { locale: dateLocale(i18n.language) })
                          : t('table.no_expiry')}
                      </td>
                      <td className={`${td} text-end`}>
                        <div className="flex items-center justify-end gap-1">
                          <IconButton
                            label={t('feedback.send')}
                            onClick={() => handleSendFeedbackToUser(user._id, user.establishmentName)}
                            disabled={sendingFeedback === user._id}
                            className="disabled:opacity-50"
                          >
                            {sendingFeedback === user._id
                              ? <span className="size-4 rounded-full border-2 border-gray-400 border-t-transparent animate-spin" />
                              : <EnvelopeIcon className="size-5" />}
                          </IconButton>
                          <IconButton
                            label={t('actions.edit')}
                            onClick={() => {
                              setSelectedUser(user);
                              setShowEditModal(true);
                            }}
                          >
                            <PencilSquareIcon className="size-5" />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm tabular-nums text-gray-500 dark:text-gray-400">
                  {t('pagination.showing', {
                    from: (pagination.page - 1) * pagination.limit + 1,
                    to: Math.min(pagination.page * pagination.limit, pagination.total),
                    total: pagination.total
                  })}
                </p>
                <div className="flex gap-2">
                  <button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1} className="btn-secondary">
                    {t('pagination.previous')}
                  </button>
                  <button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page === pagination.totalPages} className="btn-secondary">
                    {t('pagination.next')}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </Panel>

      </>}

      {showEditModal && selectedUser && (
        <SubscriptionEditor
          user={selectedUser}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedUser(null);
            fetchUsers();
          }}
        />
      )}
    </div>
  );
};

export default AdminPage;
