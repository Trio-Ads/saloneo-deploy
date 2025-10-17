import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  UserPlusIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const QuickActions: React.FC = () => {
  const { t } = useTranslation('dashboard');

  const actions = [
    {
      title: t('quick_actions.new_appointment'),
      description: t('quick_actions.new_appointment_desc'),
      icon: PlusIcon,
      link: '/appointments',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    },
    {
      title: t('quick_actions.new_client'),
      description: t('quick_actions.new_client_desc'),
      icon: UserPlusIcon,
      link: '/clients',
      color: 'from-orange-600 to-orange-700',
      bgColor: 'bg-orange-100 dark:bg-orange-800/20'
    },
    {
      title: t('quick_actions.calendar'),
      description: t('quick_actions.calendar_desc'),
      icon: CalendarIcon,
      link: '/appointments',
      color: 'from-orange-400 to-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    },
    {
      title: t('quick_actions.subscription'),
      description: t('quick_actions.subscription_desc'),
      icon: CurrencyDollarIcon,
      link: '/subscription',
      color: 'from-gray-500 to-gray-600',
      bgColor: 'bg-gray-50 dark:bg-gray-800/50'
    },
    {
      title: t('quick_actions.statistics'),
      description: t('quick_actions.statistics_desc'),
      icon: ChartBarIcon,
      link: '/appointments/history',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    },
    {
      title: t('quick_actions.settings'),
      description: t('quick_actions.settings_desc'),
      icon: CogIcon,
      link: '/interface',
      color: 'from-gray-600 to-gray-700',
      bgColor: 'bg-gray-100 dark:bg-gray-800/50'
    }
  ];

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('quick_actions.title')}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Link
              key={index}
              to={action.link}
              className="group relative overflow-hidden"
            >
              <div className={`${action.bgColor} rounded-2xl p-4 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg border border-transparent group-hover:border-orange-500/20 dark:group-hover:border-orange-400/20`}>
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${action.color} shadow-lg mb-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{action.title}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">{action.description}</p>
                
                {/* Effet de hover */}
                <div className={`absolute inset-0 bg-gradient-to-r ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
