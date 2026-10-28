import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  addWeeks,
  subWeeks,
  isToday,
  isPast,
} from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { Appointment } from '../types';
import { useClientStore } from '../../clients/store';
import { useServiceStore } from '../../services/store';
import { Panel, Badge, BadgeTone, statusTone, IconButton } from '../../../components/ui';
import { getDateLocale, dayKey, sortKey, statusKey } from '../utils';

interface CalendarViewProps {
  appointments: Appointment[];
  onEdit: (appointment: Appointment) => void;
}

// Event tint per status tone (same hues as <Badge>).
const eventTone: Record<BadgeTone, string> = {
  neutral: 'bg-gray-100 hover:bg-gray-200/70 dark:bg-gray-800 dark:hover:bg-gray-700',
  orange: 'bg-orange-50 hover:bg-orange-100 dark:bg-orange-500/10 dark:hover:bg-orange-500/20',
  blue: 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20',
  green: 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20',
  amber: 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 dark:hover:bg-amber-500/20',
  red: 'bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20',
};

const LEGEND = ['scheduled', 'confirmed', 'completed', 'cancelled', 'noShow'];

const CalendarView: React.FC<CalendarViewProps> = ({ appointments, onEdit }) => {
  const { t, i18n } = useTranslation('appointments');
  const locale = getDateLocale(i18n.language);
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const clients = useClientStore((state) => state.clients);
  const services = useServiceStore((state) => state.services);

  const weekDays = useMemo(() => {
    // Salon week starts on Monday whatever the UI language.
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const getClientName = (appointment: Appointment) => {
    if (appointment.clientInfo?.firstName) {
      return `${appointment.clientInfo.firstName} ${appointment.clientInfo.lastName || ''}`.trim();
    }
    const client = clients.find((c) => c.id === appointment.clientId);
    return client ? `${client.firstName} ${client.lastName}` : t('appointment_form.unknown.client');
  };

  const getServiceName = (appointment: Appointment) =>
    services.find((s) => s.id === appointment.serviceId)?.name || appointment.serviceName || t('appointment_form.unknown.service');

  const getDayAppointments = (date: Date) => {
    const key = format(date, 'yyyy-MM-dd');
    return appointments
      .filter((a) => typeof a.date === 'string' && dayKey(a.date) === key)
      .sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
  };

  const weekTotal = weekDays.reduce((total, day) => total + getDayAppointments(day).length, 0);

  return (
    <Panel
      flush
      title={<span className="inline-block first-letter:uppercase">{format(weekDays[0], 'MMMM yyyy', { locale })}</span>}
      description={
        <>
          {t('calendar_view.week_range', { from: format(weekDays[0], 'd', { locale }), to: format(weekDays[6], 'd MMMM', { locale }) })}
          {' · '}
          {t('calendar_view.week_total', { count: weekTotal })}
        </>
      }
      actions={
        <>
          <button type="button" onClick={() => setCurrentDate(new Date())} className="btn-secondary hidden sm:inline-flex">
            {t('calendar_view.today')}
          </button>
          <IconButton label={t('calendar_view.previous_week')} onClick={() => setCurrentDate((d) => subWeeks(d, 1))}>
            <ChevronLeftIcon className="size-5 rtl:rotate-180" />
          </IconButton>
          <IconButton label={t('calendar_view.next_week')} onClick={() => setCurrentDate((d) => addWeeks(d, 1))}>
            <ChevronRightIcon className="size-5 rtl:rotate-180" />
          </IconButton>
        </>
      }
    >
      <div className="grid grid-cols-1 divide-y divide-gray-100 border-t border-gray-100 md:grid-cols-7 md:divide-y-0 md:divide-x md:rtl:divide-x-reverse dark:divide-gray-800 dark:border-gray-800">
        {weekDays.map((day) => {
          const dayAppointments = getDayAppointments(day);
          const isCurrentDay = isToday(day);
          const isPastDay = isPast(day) && !isCurrentDay;

          return (
            <div key={day.toISOString()} className={clsx('min-w-0 p-3 md:min-h-[16rem]', isCurrentDay && 'bg-orange-50/40 dark:bg-orange-500/5')}>
              <div className="mb-2 flex items-baseline gap-2 md:flex-col md:items-start md:gap-0">
                <span className={clsx('text-xs font-medium first-letter:uppercase', isCurrentDay ? 'text-orange-600 dark:text-orange-400' : 'text-gray-500 dark:text-gray-400')}>
                  {format(day, 'EEEE', { locale })}
                </span>
                <span className={clsx(
                  'font-display text-lg font-semibold tabular-nums',
                  isCurrentDay ? 'text-orange-600 dark:text-orange-400' : isPastDay ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-50',
                )}>
                  {format(day, 'd', { locale })}
                </span>
                {dayAppointments.length === 0 && (
                  <span className="text-xs text-gray-400 md:hidden dark:text-gray-500">
                    · {isPastDay ? t('calendar_view.no_appointments') : t('calendar_view.free')}
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                {dayAppointments.map((appointment, index) => {
                  const tone = statusTone(appointment.status);
                  const isOverdue = isPastDay && (appointment.status === 'scheduled' || appointment.status === 'confirmed');
                  return (
                    <button
                      type="button"
                      key={`${appointment.id}-${index}`}
                      onClick={() => onEdit(appointment)}
                      title={t(`status.${statusKey(appointment.status)}`, appointment.status)}
                      className={clsx('block w-full rounded-lg px-2.5 py-2 text-start transition-colors duration-150 ease-out', eventTone[tone])}
                    >
                      <span className="flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold tabular-nums text-gray-900 dark:text-gray-50">{appointment.startTime}</span>
                        {isOverdue && <Badge tone="amber" className="px-1.5">{t('calendar_view.overdue')}</Badge>}
                      </span>
                      <span className="mt-0.5 block truncate text-sm font-medium text-gray-900 dark:text-gray-50">{getClientName(appointment)}</span>
                      <span className="block truncate text-xs text-gray-600 dark:text-gray-400">{getServiceName(appointment)}</span>
                    </button>
                  );
                })}
                {dayAppointments.length === 0 && (
                  <p className="hidden text-xs text-gray-400 md:block dark:text-gray-500">
                    {isPastDay ? t('calendar_view.no_appointments') : t('calendar_view.free')}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 px-5 py-3 dark:border-gray-800">
        <span className="me-1 text-xs text-gray-500 dark:text-gray-400">{t('calendar_view.legend.title')}</span>
        {LEGEND.map((status) => (
          <Badge key={status} tone={statusTone(status)}>{t(`status.${statusKey(status)}`)}</Badge>
        ))}
      </div>
    </Panel>
  );
};

export default CalendarView;
