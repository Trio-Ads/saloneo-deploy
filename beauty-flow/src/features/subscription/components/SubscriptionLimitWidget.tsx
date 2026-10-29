import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { isIosApp } from '../../../native';
import { LimitCheck } from '../hooks/useSubscriptionLimits';

interface SubscriptionLimitWidgetProps {
  title: string;
  /** Conservé pour compatibilité ; plus affiché (pas de tuile d'icône). */
  icon?: React.ReactNode;
  limitCheck: LimitCheck;
  planName: string;
  resourceType: string;
}

/**
 * Usage d'une limite d'abonnement. Une ligne de méta discrète tant que l'usage
 * reste sous 80 % ; une notice visible avec l'appel à mettre à niveau au-delà.
 * Se place dans `PageHeader meta`.
 */
export const SubscriptionLimitWidget: React.FC<SubscriptionLimitWidgetProps> = ({
  title,
  limitCheck,
  planName,
  resourceType
}) => {
  const { t } = useTranslation('subscription');
  const { current, limit } = limitCheck;
  const isUnlimited = limit === -1;
  const percentage = isUnlimited || !limit ? 0 : (current / limit) * 100;
  const isAtLimit = !isUnlimited && (percentage >= 100 || !limitCheck.canAdd);
  const isNearLimit = !isUnlimited && percentage >= 80;
  const vars = { plan: planName, current, limit, resource: resourceType };

  if (!isNearLimit) {
    return (
      <span title={title} className="tabular-nums">
        {isUnlimited ? t('widget.usage_unlimited', vars) : t('widget.usage', vars)}
      </span>
    );
  }

  return (
    <span
      role="status"
      className={clsx(
        'inline-flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl px-3 py-2 text-sm',
        isAtLimit
          ? 'bg-red-50 text-red-800 dark:bg-red-500/10 dark:text-red-300'
          : 'bg-amber-50 text-amber-900 dark:bg-amber-500/10 dark:text-amber-200'
      )}
    >
      <span className="inline-flex items-center gap-1.5 tabular-nums">
        <ExclamationTriangleIcon className="size-4 shrink-0" />
        {isAtLimit ? t('widget.at_limit', vars) : t('widget.near_limit', vars)}
      </span>
      {!isIosApp && (
        <Link
          to="/subscription"
          className="font-semibold underline underline-offset-2 hover:no-underline"
        >
          {t('actions.upgrade')}
        </Link>
      )}
    </span>
  );
};
