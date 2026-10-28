import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ArrowPathIcon, ArrowLeftIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useAppointmentStore } from './store';
import { AppointmentHistoryFilters, AppointmentStatus, Appointment } from './types';
import { useClientStore } from '../clients/store';
import { useTeamStore } from '../team/store';
import { useServiceStore } from '../services/store';
import { PageHeader, Panel, StatGroup, Badge, statusTone, EmptyState } from '../../components/ui';
import { getDateLocale, dayKey, sortKey, durationMinutes, statusKey } from './utils';

const STATUSES: AppointmentStatus[] = ['scheduled', 'confirmed', 'completed', 'cancelled', 'noShow', 'rescheduled'];

/** Most frequent value of a list, or '' when empty. */
const mostFrequent = (values: string[]) => {
  const counts = values.reduce((acc, v) => acc.set(v, (acc.get(v) || 0) + 1), new Map<string, number>());
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || '';
};

const AppointmentHistoryPage: React.FC = () => {
  const { t, i18n } = useTranslation('appointments');
  const locale = getDateLocale(i18n.language);
  const [filters, setFilters] = useState<AppointmentHistoryFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const { appointments: allAppointments, loadAppointments } = useAppointmentStore();
  const { clients, fetchClients } = useClientStore();
  const members = useTeamStore((state) => state.members);
  const { services } = useServiceStore();

  // Page can be opened directly: make sure appointments and client names are loaded.
  useEffect(() => {
    loadAppointments?.().catch(() => {});
    fetchClients().catch(() => {});
  }, [loadAppointments, fetchClients]);

  const appointments = useMemo(() => (allAppointments || [])
    .filter((apt) => {
      const day = dayKey(apt.date);
      if (filters.clientId && apt.clientId !== filters.clientId) return false;
      if (filters.stylistId && apt.stylistId !== filters.stylistId) return false;
      if (filters.serviceId && apt.serviceId !== filters.serviceId) return false;
      if (filters.status?.length && !filters.status.includes(apt.status)) return false;
      if (filters.startDate && day < filters.startDate) return false;
      if (filters.endDate && day > filters.endDate) return false;
      return true;
    })
    .sort((a, b) => sortKey(b).localeCompare(sortKey(a))), [allAppointments, filters]);

  const globalStats = useMemo(() => {
    const total = appointments.length;
    const completed = appointments.filter((apt) => apt.status === 'completed').length;
    return {
      total,
      completed,
      cancelled: appointments.filter((apt) => apt.status === 'cancelled').length,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [appointments]);

  const clientStats = useMemo(() => {
    if (!filters.clientId) return null;
    const list = (allAppointments || []).filter((apt) => apt.clientId === filters.clientId);
    const durations = list.map(durationMinutes).filter(Boolean);
    return {
      total: list.length,
      completed: list.filter((apt) => apt.status === 'completed').length,
      cancelled: list.filter((apt) => apt.status === 'cancelled').length,
      noShow: list.filter((apt) => apt.status === 'noShow').length,
      averageDuration: durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0,
      favoriteService: mostFrequent(list.map((apt) => apt.serviceId)),
      favoriteStylist: mostFrequent(list.map((apt) => apt.stylistId)),
    };
  }, [allAppointments, filters.clientId]);

  const handleFilterChange = (name: keyof AppointmentHistoryFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value || undefined }));
  };

  const handleStatusChange = (status: AppointmentStatus, checked: boolean) => {
    setFilters((prev) => {
      const current = prev.status || [];
      return { ...prev, status: checked ? [...current, status] : current.filter((s) => s !== status) };
    });
  };

  const getClientName = (apt: Pick<Appointment, 'clientId' | 'clientInfo'>) => {
    if (apt.clientInfo?.firstName) return `${apt.clientInfo.firstName} ${apt.clientInfo.lastName || ''}`.trim();
    const client = clients.find((c) => c.id === apt.clientId);
    return client ? `${client.firstName} ${client.lastName}` : t('history.unknown');
  };

  const getStylistName = (stylistId: string) => {
    const member = members.find((m) => m.id === stylistId);
    return member ? `${member.firstName} ${member.lastName}` : t('history.unknown');
  };

  const getServiceName = (apt: Pick<Appointment, 'serviceId' | 'serviceName'>) =>
    services.find((s) => s.id === apt.serviceId)?.name || apt.serviceName || t('history.unknown');

  const statusLabel = (status: string) => t(`status.${statusKey(status)}`, status);
  const fieldLabel = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300';
  const activeFilters = Object.values(filters).some((v) => (Array.isArray(v) ? v.length : v));

  return (
    <div className="py-6 sm:py-8">
      <PageHeader
        title={t('history.title')}
        subtitle={t('history.subtitle')}
        actions={
          <Link to="/appointments" className="btn-secondary">
            <ArrowLeftIcon className="size-4 rtl:rotate-180" />
            {t('history.back')}
          </Link>
        }
      />

      <StatGroup
        items={[
          { label: t('history.total'), value: globalStats.total },
          { label: t('history.completed'), value: globalStats.completed },
          { label: t('history.cancelled'), value: globalStats.cancelled },
          { label: t('history.completion_rate'), value: `${globalStats.completionRate} %`, accent: true },
        ]}
      />

      <Panel
        className="mb-6"
        title={t('history.filters')}
        actions={
          <>
            {activeFilters && (
              <button type="button" onClick={() => setFilters({})} className="btn-ghost">
                <ArrowPathIcon className="size-4" />
                {t('history.reset')}
              </button>
            )}
            <button type="button" onClick={() => setShowFilters(!showFilters)} className="btn-secondary" aria-expanded={showFilters}>
              {showFilters ? t('history.hide_filters') : t('history.show_filters')}
            </button>
          </>
        }
        bodyClassName={showFilters ? undefined : 'hidden'}
      >
        {showFilters && (
          <div className="space-y-5 pt-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label htmlFor="h-start" className={fieldLabel}>{t('history.startDate')}</label>
                <input id="h-start" type="date" className="field" value={filters.startDate || ''} onChange={(e) => handleFilterChange('startDate', e.target.value)} />
              </div>
              <div>
                <label htmlFor="h-end" className={fieldLabel}>{t('history.endDate')}</label>
                <input id="h-end" type="date" className="field" value={filters.endDate || ''} onChange={(e) => handleFilterChange('endDate', e.target.value)} />
              </div>
              <div>
                <label htmlFor="h-client" className={fieldLabel}>{t('history.client')}</label>
                <select id="h-client" className="field" value={filters.clientId || ''} onChange={(e) => handleFilterChange('clientId', e.target.value)}>
                  <option value="">{t('history.all')}</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>{client.firstName} {client.lastName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="h-stylist" className={fieldLabel}>{t('history.stylist')}</label>
                <select id="h-stylist" className="field" value={filters.stylistId || ''} onChange={(e) => handleFilterChange('stylistId', e.target.value)}>
                  <option value="">{t('history.all')}</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>{member.firstName} {member.lastName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="h-service" className={fieldLabel}>{t('history.service')}</label>
                <select id="h-service" className="field" value={filters.serviceId || ''} onChange={(e) => handleFilterChange('serviceId', e.target.value)}>
                  <option value="">{t('history.all')}</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>{service.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <fieldset>
              <legend className={fieldLabel}>{t('history.status')}</legend>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((status) => (
                  <label
                    key={status}
                    className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-gray-200 px-3 text-sm text-gray-700 transition-colors duration-150 ease-out hover:bg-gray-50 has-[:checked]:border-orange-300 has-[:checked]:bg-orange-50 has-[:checked]:text-orange-700 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:has-[:checked]:border-orange-500/40 dark:has-[:checked]:bg-orange-500/10 dark:has-[:checked]:text-orange-300"
                  >
                    <input
                      type="checkbox"
                      className="size-4 rounded border-gray-300 accent-orange-500"
                      checked={filters.status?.includes(status) || false}
                      onChange={(e) => handleStatusChange(status, e.target.checked)}
                    />
                    {statusLabel(status)}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        )}
      </Panel>

      {clientStats && filters.clientId && (
        <Panel className="mb-6" title={t('history.clientStats', { client: getClientName({ clientId: filters.clientId }) })}>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
            {[
              [t('history.totalAppointments'), clientStats.total],
              [t('history.completedAppointments'), clientStats.completed],
              [t('history.cancelledAppointments'), clientStats.cancelled],
              [t('history.noShowAppointments'), clientStats.noShow],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-[0.8125rem] font-medium text-gray-500 dark:text-gray-400">{label}</dt>
                <dd className="mt-1 font-display text-2xl font-semibold tabular-nums text-gray-900 dark:text-gray-50">{value}</dd>
              </div>
            ))}
          </dl>
          <dl className="mt-5 divide-y divide-gray-100 border-t border-gray-100 text-sm dark:divide-gray-800 dark:border-gray-800">
            {[
              [t('history.averageDuration'), clientStats.averageDuration ? `${clientStats.averageDuration} min` : t('history.notEnoughData')],
              [t('history.favoriteService'), clientStats.favoriteService ? getServiceName({ serviceId: clientStats.favoriteService, serviceName: '' }) : t('history.notEnoughData')],
              [t('history.favoriteStylist'), clientStats.favoriteStylist ? getStylistName(clientStats.favoriteStylist) : t('history.notEnoughData')],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 py-2.5">
                <dt className="text-gray-500 dark:text-gray-400">{label}</dt>
                <dd className="text-end font-medium text-gray-900 dark:text-gray-50">{value}</dd>
              </div>
            ))}
          </dl>
        </Panel>
      )}

      <Panel flush title={t('history.results', { count: appointments.length })}>
        {appointments.length === 0 ? (
          <EmptyState icon={MagnifyingGlassIcon} title={t('history.no_results_title')} body={t('history.noResults')} />
        ) : (
          <ul className="divide-y divide-gray-100 border-t border-gray-100 dark:divide-gray-800 dark:border-gray-800">
            {appointments.map((appointment) => (
              <li key={appointment.id} className="flex flex-col gap-1 px-5 py-3.5 sm:flex-row sm:items-center sm:gap-6">
                <div className="shrink-0 sm:w-56">
                  <p className="text-sm font-medium text-gray-900 first-letter:uppercase dark:text-gray-50">
                    {format(new Date(`${dayKey(appointment.date)}T00:00:00`), 'EEE d MMM yyyy', { locale })}
                  </p>
                  <p className="text-xs tabular-nums text-gray-500 dark:text-gray-400">
                    {appointment.startTime}{appointment.endTime && ` – ${appointment.endTime}`}
                  </p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-50">{getClientName(appointment)}</p>
                  <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                    {getServiceName(appointment)} · {t('appointment_list.with', { name: getStylistName(appointment.stylistId) })}
                  </p>
                </div>
                <Badge tone={statusTone(appointment.status)} className="self-start sm:self-center">{statusLabel(appointment.status)}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
};

export default AppointmentHistoryPage;
