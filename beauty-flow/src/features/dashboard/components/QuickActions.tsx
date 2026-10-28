import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  UserPlusIcon,
  CalendarIcon,
  CreditCardIcon,
  ChartBarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const QuickActions: React.FC = () => {
  const { t } = useTranslation('dashboard');

  const actions = [
    { title: t('quick_actions.new_client'), icon: UserPlusIcon, link: '/clients' },
    { title: t('quick_actions.calendar'), icon: CalendarIcon, link: '/appointments' },
    { title: t('quick_actions.statistics'), icon: ChartBarIcon, link: '/appointments/history' },
    { title: t('quick_actions.subscription'), icon: CreditCardIcon, link: '/subscription' },
    { title: t('quick_actions.settings'), icon: Cog6ToothIcon, link: '/interface' },
  ];

  return (
    <nav aria-label={t('quick_actions.title')} className="-mx-4 mb-6 flex gap-2 overflow-x-auto scrollbar-hide px-4 sm:mx-0 sm:flex-wrap sm:px-0">
      <Link to="/appointments" className="btn-primary shrink-0">
        <PlusIcon className="size-4" />
        {t('quick_actions.new_appointment')}
      </Link>
      {actions.map(({ title, icon: Icon, link }) => (
        <Link key={title} to={link} className="btn-secondary shrink-0 font-medium dark:bg-gray-900 dark:border-gray-800">
          <Icon className="size-4 text-gray-400" />
          {title}
        </Link>
      ))}
    </nav>
  );
};

export default QuickActions;
