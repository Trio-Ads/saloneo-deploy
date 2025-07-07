import React, { useMemo } from 'react';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AppointmentWithPrice } from '../types';
import { useProfileStore } from '../../profile/store';
import { formatPrice } from '../../../utils/currency';

interface RevenueChartProps {
  appointments: AppointmentWithPrice[];
  timeRange: 'day' | 'week' | 'month';
}

const RevenueChart: React.FC<RevenueChartProps> = ({ appointments, timeRange }) => {
  const { profile } = useProfileStore();
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
        // 7 derniers jours
        interval = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(now);
          date.setDate(now.getDate() - (6 - i));
          return startOfDay(date);
        });
        groupBy = (date) => format(date, 'yyyy-MM-dd');
        formatLabel = (date) => format(date, 'EEE', { locale: fr });
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
  }, [appointments, timeRange]);

  const maxValue = Math.max(...chartData.map(d => d.value), 100);
  const yAxisSteps = 5;
  const yAxisValues = Array.from({ length: yAxisSteps + 1 }, (_, i) => 
    Math.round((maxValue / yAxisSteps) * i)
  );

  return (
    <div className="h-64 relative">
      {/* Axe Y */}
      <div className="absolute left-0 top-0 bottom-6 w-12 flex flex-col justify-between text-xs text-gray-500">
        {yAxisValues.reverse().map((value, index) => (
          <div key={index} className="text-right pr-2">
            {formatPrice(value, profile.currency)}
          </div>
        ))}
      </div>

      {/* Zone du graphique */}
      <div className="ml-14 h-full pr-4">
        <div className="relative h-full">
          {/* Lignes de grille horizontales */}
          {yAxisValues.map((_, index) => (
            <div
              key={index}
              className="absolute w-full border-t border-gray-100"
              style={{ top: `${(index / yAxisSteps) * 100}%` }}
            />
          ))}

          {/* Barres */}
          <div className="absolute inset-0 flex items-end justify-between pb-6">
            {chartData.map((data, index) => {
              const height = maxValue > 0 ? (data.value / maxValue) * 100 : 0;
              return (
                <div
                  key={index}
                  className="relative flex-1 mx-0.5 group"
                >
                  <div
                    className="absolute bottom-0 w-full bg-gradient-to-t from-indigo-600 to-purple-600 rounded-t-lg transition-all duration-300 hover:from-indigo-700 hover:to-purple-700"
                    style={{ height: `${height}%` }}
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                      {formatPrice(data.value, profile.currency)}
                    </div>
                  </div>
                  {/* Label */}
                  <div className="absolute -bottom-6 w-full text-center text-xs text-gray-500 transform rotate-0">
                    {data.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;
