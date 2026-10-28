import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { addDays, format, parseISO, startOfWeek } from 'date-fns';
import { CalendarDaysIcon, CheckIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon, UserMinusIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';
import { useAppointmentStore } from '../appointments/store';
import { Appointment, AppointmentFormData } from '../appointments/types';
import AppointmentForm from '../appointments/components/AppointmentForm';
import { dayKey, getDateLocale, sortKey, statusKey } from '../appointments/utils';
import { useServiceStore } from '../services/store';
import { useStaffName } from '../team/staff';
import { useProfileStore } from '../profile/store';
import { formatPrice } from '../../utils/currency';
import { staffAPI } from '../../services/api';
import { Badge, EmptyState, IconButton, PageHeader, Panel, Segmented, StatGroup, statusTone } from '../../components/ui';
import { useToastStore } from '../../components/Toast';
import { useAccess } from './access';

const ACTIVE = ['scheduled', 'confirmed', 'pending_payment'];
const todayKey = () => format(new Date(), 'yyyy-MM-dd');
const nowTime = () => format(new Date(), 'HH:mm');

/** "Mon planning": the staff member's day or week (the API already limits it to their own appointments unless planning = all). */
const MyPlanningPage: React.FC = () => {
  const { t, i18n } = useTranslation(['team', 'appointments']);
  const locale = getDateLocale(i18n.language);
  const access = useAccess();
  const { appointments, loadAppointments, addAppointment, confirmAppointment, completeAppointment, markAsNoShow } = useAppointmentStore();
  const services = useServiceStore((s) => s.services);
  const staffName = useStaffName();
  const currency = useProfileStore((s) => s.profile.currency);
  const showToast = useToastStore((s) => s.showToast);
  const [view, setView] = useState<'day' | 'week'>('week');
  const [anchor, setAnchor] = useState(todayKey());
  const [who, setWho] = useState<'me' | 'all'>('me');
  const [showForm, setShowForm] = useState(false);
  const [stats, setStats] = useState<{ done: number; upcoming: number; revenue: number } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => { loadAppointments(); }, [loadAppointments]);
  useEffect(() => {
    if (access.can('viewRevenue')) staffAPI.stats().then(({ data }) => setStats(data)).catch(() => setStats(null));
  }, [appointments.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const seesAll = access.isStaff && !access.scope;
  const mine = useMemo(() => appointments.filter((a) => !access.isStaff || who === 'all' || a.stylistId === access.user?.teamMemberId),
    [appointments, access.isStaff, access.user?.teamMemberId, who]);

  const days = useMemo(() => {
    if (view === 'day') return [anchor];
    const start = startOfWeek(parseISO(anchor), { weekStartsOn: 6 }); // Algerian week: Saturday first
    return Array.from({ length: 7 }, (_, i) => format(addDays(start, i), 'yyyy-MM-dd'));
  }, [view, anchor]);

  const byDay = useMemo(() => {
    const map = new Map<string, Appointment[]>(days.map((d) => [d, []]));
    for (const a of mine) map.get(dayKey(a.date))?.push(a);
    for (const list of map.values()) list.sort((x, y) => sortKey(x).localeCompare(sortKey(y)));
    return map;
  }, [mine, days]);

  const today = todayKey();
  const next = useMemo(() => mine
    .filter((a) => ACTIVE.includes(a.status) && (dayKey(a.date) > today || (dayKey(a.date) === today && (a.endTime || a.startTime) >= nowTime())))
    .sort((x, y) => sortKey(x).localeCompare(sortKey(y)))[0], [mine, today]);

  const todayCount = mine.filter((a) => dayKey(a.date) === today && statusKey(a.status) !== 'cancelled').length;
  // This calendar week (Saturday first), whatever is on screen
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 6 }), 'yyyy-MM-dd');
  const weekEnd = format(addDays(parseISO(weekStart), 6), 'yyyy-MM-dd');
  const weekCount = mine.filter((a) => dayKey(a.date) >= weekStart && dayKey(a.date) <= weekEnd && statusKey(a.status) !== 'cancelled').length;
  const serviceName = (a: Appointment) => a.serviceName || services.find((s) => s.id === a.serviceId)?.name || '';
  const clientName = (a: Appointment) => `${a.clientInfo?.firstName || ''} ${a.clientInfo?.lastName || ''}`.trim() || t('staff.planning.client_unknown');

  const act = async (a: Appointment, action: 'confirm' | 'complete' | 'noShow') => {
    setBusy(a.id);
    try {
      await ({ confirm: confirmAppointment, complete: completeAppointment, noShow: markAsNoShow }[action])(a.id);
      showToast(t(`staff.planning.done_${action}`), 'success');
    } finally {
      setBusy(null);
    }
  };

  const create = async (data: AppointmentFormData) => {
    await addAppointment(data);
    setShowForm(false);
    showToast(t('staff.planning.created'), 'success');
  };

  const shift = (n: number) => setAnchor(format(addDays(parseISO(anchor), view === 'day' ? n : 7 * n), 'yyyy-MM-dd'));
  const dayTitle = (d: string) => format(parseISO(d), view === 'day' ? 'EEEE d MMMM' : 'EEEE d MMM', { locale });

  const actions = (a: Appointment) => {
    const s = statusKey(a.status);
    if (!access.canEdit(a.stylistId) || !ACTIVE.includes(s)) return null;
    return (
      <div className="flex shrink-0 items-center gap-1">
        {s === 'scheduled' && (
          <IconButton label={t('staff.planning.confirm')} disabled={busy === a.id} onClick={() => act(a, 'confirm')}><CheckIcon className="size-5" /></IconButton>
        )}
        <IconButton label={t('staff.planning.complete')} disabled={busy === a.id} onClick={() => act(a, 'complete')}><CheckBadgeIcon className="size-5" /></IconButton>
        <IconButton label={t('staff.planning.no_show')} tone="danger" disabled={busy === a.id} onClick={() => act(a, 'noShow')}><UserMinusIcon className="size-5" /></IconButton>
      </div>
    );
  };

  return (
    <div className="py-6 sm:py-8">
      <PageHeader
        title={t('staff.planning.title')}
        subtitle={<span className="inline-block first-letter:uppercase">{format(new Date(), 'EEEE d MMMM yyyy', { locale })}</span>}
        actions={!showForm && access.can('createAppointments') && (
          <button type="button" className="btn-primary" onClick={() => setShowForm(true)}>
            <PlusIcon className="size-4" />
            {t('staff.planning.new')}
          </button>
        )}
      />

      {showForm ? (
        <AppointmentForm onSubmit={create} onCancel={() => setShowForm(false)} />
      ) : (
        <>
          <StatGroup items={[
            { label: t('staff.planning.stat_today'), value: todayCount },
            { label: t('staff.planning.stat_week'), value: weekCount },
            ...(stats ? [
              { label: t('staff.planning.stat_done'), value: stats.done, hint: t('staff.planning.this_month') },
              { label: t('staff.planning.stat_revenue'), value: formatPrice(stats.revenue, currency), hint: t('staff.planning.this_month'), accent: true },
            ] : []),
          ]} />

          {next && (
            <Panel title={t('staff.planning.next_client')} className="mb-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <p className="font-display text-xl font-semibold text-gray-900 dark:text-gray-50">{clientName(next)}</p>
                  <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                    <span className="first-letter:uppercase inline-block tabular-nums">
                      {dayKey(next.date) === today ? t('staff.planning.today') : format(parseISO(dayKey(next.date)), 'EEEE d MMM', { locale })} · {next.startTime}–{next.endTime}
                    </span>
                    {' · '}{serviceName(next)}
                  </p>
                  {next.clientInfo?.phone && <p dir="ltr" className="mt-1 text-sm tabular-nums text-gray-500 text-start dark:text-gray-400">{next.clientInfo.phone}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={statusTone(statusKey(next.status))}>{t(`appointments:status.${statusKey(next.status)}`)}</Badge>
                  {actions(next)}
                </div>
              </div>
            </Panel>
          )}

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Segmented value={view} onChange={setView} options={[
              { value: 'day', label: t('staff.planning.day') },
              { value: 'week', label: t('staff.planning.week') },
            ]} />
            {seesAll && (
              <Segmented value={who} onChange={setWho} options={[
                { value: 'me', label: t('staff.planning.only_me') },
                { value: 'all', label: t('staff.planning.whole_salon') },
              ]} />
            )}
            <div className="ms-auto flex items-center gap-1">
              <IconButton label={t('staff.planning.previous')} onClick={() => shift(-1)}><ChevronLeftIcon className="size-5 rtl:rotate-180" /></IconButton>
              <button type="button" className="btn-ghost" onClick={() => setAnchor(todayKey())}>{t('staff.planning.today')}</button>
              <IconButton label={t('staff.planning.next')} onClick={() => shift(1)}><ChevronRightIcon className="size-5 rtl:rotate-180" /></IconButton>
            </div>
          </div>

          <Panel flush bodyClassName="divide-y divide-gray-100 dark:divide-gray-800">
            {days.map((d) => {
              const list = byDay.get(d) || [];
              if (view === 'week' && !list.length) return null;
              return (
                <section key={d}>
                  <h2 className="bg-gray-50 px-5 py-2 text-sm font-medium text-gray-500 first-letter:uppercase dark:bg-gray-800/40 dark:text-gray-400">
                    {dayTitle(d)}{d === today && <span className="text-orange-600 dark:text-orange-400"> · {t('staff.planning.today')}</span>}
                  </h2>
                  {list.length === 0 ? (
                    <EmptyState icon={CalendarDaysIcon} title={t('staff.planning.empty_day')} body={t('staff.planning.empty_day_body')} />
                  ) : (
                    <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                      {list.map((a) => (
                        <li key={a.id} className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:gap-4">
                          <p className="w-24 shrink-0 font-display text-[0.9375rem] font-semibold tabular-nums text-gray-900 dark:text-gray-50">{a.startTime}<span className="font-normal text-gray-400">–{a.endTime}</span></p>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-gray-900 dark:text-gray-50">{clientName(a)}</p>
                            <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                              {serviceName(a)}
                              {who === 'all' && ` · ${staffName(a.stylistId)}`}
                            </p>
                          </div>
                          <div className="flex items-center justify-between gap-2 sm:justify-end">
                            <Badge tone={statusTone(statusKey(a.status))}>{t(`appointments:status.${statusKey(a.status)}`)}</Badge>
                            {actions(a)}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              );
            })}
            {view === 'week' && days.every((d) => !(byDay.get(d) || []).length) && (
              <EmptyState icon={CalendarDaysIcon} title={t('staff.planning.empty_week')} body={t('staff.planning.empty_day_body')} />
            )}
          </Panel>
        </>
      )}
    </div>
  );
};

export default MyPlanningPage;
