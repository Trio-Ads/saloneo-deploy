import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AppointmentWithPrice } from '../types';
import { AppointmentStatus } from '../../appointments/types';

interface AppointmentChartProps {
  appointments: AppointmentWithPrice[];
}

const AppointmentChart: React.FC<AppointmentChartProps> = ({ appointments }) => {
  const { t } = useTranslation('dashboard');

  const statusData = useMemo(() => {
    const statusCount: Record<AppointmentStatus, number> = {
      scheduled: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      noShow: 0,
      rescheduled: 0
    };

    appointments.forEach(apt => {
      if (apt.status in statusCount) {
        statusCount[apt.status]++;
      }
    });

    // Same hues as statusTone() badges
    return [
      { label: t('components.appointment_chart.statuses.scheduled'), value: statusCount.scheduled, color: '#F97316' },
      { label: t('components.appointment_chart.statuses.confirmed'), value: statusCount.confirmed, color: '#3B82F6' },
      { label: t('components.appointment_chart.statuses.completed'), value: statusCount.completed, color: '#10B981' },
      { label: t('components.appointment_chart.statuses.cancelled'), value: statusCount.cancelled, color: '#EF4444' },
      { label: t('components.appointment_chart.statuses.noShow'), value: statusCount.noShow, color: '#F59E0B' },
      { label: t('components.appointment_chart.statuses.rescheduled'), value: statusCount.rescheduled, color: '#A1A1AA' },
    ].filter(item => item.value > 0);
  }, [appointments, t]);

  const total = statusData.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div className="flex h-48 items-center justify-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('components.appointment_chart.no_data')}</p>
      </div>
    );
  }

  // Donut: one circle per status, offset by the running total (circumference normalised to 100)
  let offset = 0;
  const r = 15.915;

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row lg:flex-col xl:flex-row">
      <div className="relative size-36 shrink-0">
        <svg viewBox="0 0 36 36" className="size-full -rotate-90">
          <circle cx="18" cy="18" r={r} fill="none" strokeWidth="4" className="stroke-gray-100 dark:stroke-gray-800" />
          {statusData.map((item, index) => {
            const pct = (item.value / total) * 100;
            const el = (
              <circle key={index} cx="18" cy="18" r={r} fill="none" stroke={item.color} strokeWidth="4"
                strokeDasharray={`${pct} ${100 - pct}`} strokeDashoffset={-offset} />
            );
            offset += pct;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="font-display text-2xl font-semibold tabular-nums text-gray-900 dark:text-gray-50">{total}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('components.appointment_chart.total')}</p>
        </div>
      </div>

      <ul className="w-full min-w-0 flex-1 space-y-2">
        {statusData.map((item, index) => (
          <li key={index} className="flex items-center gap-2 text-sm">
            <span className="size-2.5 shrink-0 rounded-full" style={{ background: item.color }} />
            <span className="flex-1 truncate text-gray-700 dark:text-gray-300">{item.label}</span>
            <span className="font-medium tabular-nums text-gray-900 dark:text-gray-50">{item.value}</span>
            <span className="w-10 text-end text-xs tabular-nums text-gray-500 dark:text-gray-400">{Math.round((item.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AppointmentChart;
