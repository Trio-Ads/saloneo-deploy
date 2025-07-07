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

    return [
      { 
        label: t('components.appointment_chart.statuses.scheduled'), 
        value: statusCount.scheduled, 
        color: 'from-orange-400 to-amber-500' 
      },
      { 
        label: t('components.appointment_chart.statuses.confirmed'), 
        value: statusCount.confirmed, 
        color: 'from-blue-400 to-indigo-500' 
      },
      { 
        label: t('components.appointment_chart.statuses.completed'), 
        value: statusCount.completed, 
        color: 'from-green-400 to-emerald-500' 
      },
      { 
        label: t('components.appointment_chart.statuses.cancelled'), 
        value: statusCount.cancelled, 
        color: 'from-red-400 to-rose-500' 
      },
      { 
        label: t('components.appointment_chart.statuses.noShow'), 
        value: statusCount.noShow, 
        color: 'from-gray-400 to-gray-500' 
      },
      { 
        label: t('components.appointment_chart.statuses.rescheduled'), 
        value: statusCount.rescheduled, 
        color: 'from-purple-400 to-violet-500' 
      }
    ].filter(item => item.value > 0);
  }, [appointments, t]);

  const total = statusData.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="text-gray-500">{t('components.appointment_chart.no_data')}</p>
      </div>
    );
  }

  // Calculer les angles pour le graphique en donut
  let currentAngle = -90; // Commencer en haut
  const donutData = statusData.map(item => {
    const percentage = (item.value / total) * 100;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;
    return { ...item, percentage, startAngle, angle };
  });

  return (
    <div className="h-64 flex items-center justify-between">
      {/* Graphique en donut */}
      <div className="relative w-48 h-48">
        <svg className="w-full h-full transform -rotate-90">
          {donutData.map((item, index) => {
            const radius = 70;
            const innerRadius = 45;
            const centerX = 96;
            const centerY = 96;
            
            // Calculer les points de l'arc
            const startAngleRad = (item.startAngle * Math.PI) / 180;
            const endAngleRad = ((item.startAngle + item.angle) * Math.PI) / 180;
            
            const x1 = centerX + radius * Math.cos(startAngleRad);
            const y1 = centerY + radius * Math.sin(startAngleRad);
            const x2 = centerX + radius * Math.cos(endAngleRad);
            const y2 = centerY + radius * Math.sin(endAngleRad);
            
            const x3 = centerX + innerRadius * Math.cos(startAngleRad);
            const y3 = centerY + innerRadius * Math.sin(startAngleRad);
            const x4 = centerX + innerRadius * Math.cos(endAngleRad);
            const y4 = centerY + innerRadius * Math.sin(endAngleRad);
            
            const largeArcFlag = item.angle > 180 ? 1 : 0;
            
            const pathData = [
              `M ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              `L ${x4} ${y4}`,
              `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x3} ${y3}`,
              'Z'
            ].join(' ');
            
            return (
              <path
                key={index}
                d={pathData}
                className={`fill-current bg-gradient-to-r ${item.color}`}
                style={{
                  fill: `url(#gradient-${index})`,
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                }}
              />
            );
          })}
          
          {/* Définir les gradients */}
          <defs>
            {donutData.map((item, index) => {
              // Extraire les couleurs de manière sécurisée
              const colorMatch = item.color.match(/from-(\S+)\s+to-(\S+)/);
              const fromColor = colorMatch ? colorMatch[1] : 'gray-400';
              const toColor = colorMatch ? colorMatch[2] : 'gray-600';
              
              return (
                <linearGradient key={index} id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" className={`text-${fromColor}`} stopColor="currentColor" />
                  <stop offset="100%" className={`text-${toColor}`} stopColor="currentColor" />
                </linearGradient>
              );
            })}
          </defs>
        </svg>
        
        {/* Texte central */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">{total}</p>
            <p className="text-xs text-gray-500">{t('components.appointment_chart.total')}</p>
          </div>
        </div>
      </div>

      {/* Légende */}
      <div className="flex-1 ml-8">
        <div className="space-y-2">
          {donutData.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${item.color} mr-2`}></div>
                <span className="text-sm text-gray-700">{item.label}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">{item.value}</span>
                <span className="text-xs text-gray-500">({item.percentage.toFixed(1)}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AppointmentChart;
