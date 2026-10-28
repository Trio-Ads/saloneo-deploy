import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { format, startOfDay, startOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { dateLocale } from '../dateLocale';
import { AppointmentWithPrice } from '../types';
import { useProfileStore } from '../../profile/store';
import { formatPrice } from '../../../utils/currency';

interface RevenueChartProps {
  appointments: AppointmentWithPrice[];
  timeRange: 'day' | 'week' | 'month';
}

const RevenueChart: React.FC<RevenueChartProps> = ({ appointments, timeRange }) => {
  const { profile } = useProfileStore();
  const { i18n } = useTranslation();
  const chartData = useMemo(() => {
    const now = new Date();
    let interval: Date[];
    let groupBy: (date: Date) => string;
    let formatLabel: (date: Date) => string;

    switch (timeRange) {
      case 'day':
        // Dernières 24 heures par heure
        interval = Array.from({ length: 24 }, (_, i) => {
          const date = new Date(now);
          date.setHours(now.getHours() - (23 - i), 0, 0, 0);
          return date;
        });
        groupBy = (date) => format(date, 'yyyy-MM-dd-HH');
        formatLabel = (date) => format(date, 'HH:mm');
        break;
      
      case 'week':
        // 8 dernières semaines
        interval = Array.from({ length: 8 }, (_, i) => {
          const date = new Date(now);
          date.setDate(now.getDate() - (7 - i) * 7); // Reculer de 7 semaines, puis avancer semaine par semaine
          return startOfWeek(date, { locale: fr });
        });
        groupBy = (date) => format(startOfWeek(date, { locale: fr }), 'yyyy-MM-dd');
        formatLabel = (date) => {
          const weekStart = startOfWeek(date, { locale: fr });
          return format(weekStart, 'd MMM', { locale: dateLocale(i18n.language) });
        };
        break;
      
      case 'month':
        // 30 derniers jours
        interval = Array.from({ length: 30 }, (_, i) => {
          const date = new Date(now);
          date.setDate(now.getDate() - (29 - i));
          return startOfDay(date);
        });
        groupBy = (date) => format(date, 'yyyy-MM-dd');
        formatLabel = (date) => format(date, 'd', { locale: fr });
        break;
    }

    // Grouper les revenus par période
    const revenueByPeriod = new Map<string, number>();
    
    appointments
      .filter(apt => apt.status === 'completed')
      .forEach(apt => {
        const key = groupBy(new Date(apt.date));
        const currentRevenue = revenueByPeriod.get(key) || 0;
        // Utiliser le prix du rendez-vous
        const serviceRevenue = apt.price || 0;
        revenueByPeriod.set(key, currentRevenue + serviceRevenue);
      });

    // Créer les données du graphique
    return interval.map(date => ({
      label: formatLabel(date),
      value: revenueByPeriod.get(groupBy(date)) || 0
    }));
  }, [appointments, timeRange, i18n.language]);

  const maxValue = Math.max(...chartData.map(d => d.value), 100);
  const gridValues = [maxValue, maxValue / 2, 0];
  const compact = new Intl.NumberFormat(i18n.language, { notation: 'compact', maximumFractionDigits: 1 });
  const labelStep = Math.ceil(chartData.length / 8);

  return (
    <div className="flex h-60 gap-3">
      {/* Axe Y */}
      <div className="flex w-9 shrink-0 flex-col justify-between pb-6 text-end text-xs tabular-nums text-gray-400">
        {gridValues.map((value, index) => <span key={index} className="-translate-y-1/2 first:translate-y-0 last:translate-y-0">{compact.format(value)}</span>)}
      </div>

      <div className="relative min-w-0 flex-1">
        {/* Lignes de grille */}
        <div className="absolute inset-x-0 top-0 bottom-6 flex flex-col justify-between">
          {gridValues.map((_, index) => <div key={index} className="border-t border-gray-100 dark:border-gray-800" />)}
        </div>

        {/* Barres */}
        <div className="absolute inset-x-0 top-0 bottom-6 flex items-end gap-0.5 sm:gap-1">
          {chartData.map((data, index) => (
            <div key={index} className="group relative flex h-full flex-1 items-end">
              <div
                className="w-full rounded-t-[3px] bg-orange-500 transition-colors duration-150 ease-out group-hover:bg-orange-600 dark:bg-orange-400"
                style={{ height: `${maxValue > 0 ? (data.value / maxValue) * 100 : 0}%`, minHeight: data.value > 0 ? 2 : 0 }}
              />
              <div className="pointer-events-none absolute bottom-full start-1/2 z-10 mb-1 -translate-x-1/2 rtl:translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100 dark:bg-gray-700">
                {data.label} · {formatPrice(data.value, profile.currency)}
              </div>
              {index % labelStep === 0 && (
                <span className={`absolute -bottom-6 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 whitespace-nowrap text-xs text-gray-400 ${index % (labelStep * 2) ? 'hidden sm:block' : ''}`}>{data.label}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;
