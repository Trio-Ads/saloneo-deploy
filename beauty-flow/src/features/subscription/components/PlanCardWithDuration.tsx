import React from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { CheckIcon, MinusIcon } from '@heroicons/react/24/outline';
import { Plan, PlanType, SubscriptionDuration, DURATION_PRICES, DURATION_DISCOUNTS } from '../types';
import { Badge } from '../../../components/ui';
import { formatPrice } from '../../../utils/currency';

interface PlanCardWithDurationProps {
  plan: Plan;
  isCurrentPlan: boolean;
  /** Commitment chosen on the page; only Starter and Pro have duration pricing. */
  duration: SubscriptionDuration;
  recommended?: boolean;
  onSelect: (planType: PlanType, duration: SubscriptionDuration) => void;
}

export const DURATION_MONTHS: Record<SubscriptionDuration, number> = {
  [SubscriptionDuration.MONTHLY]: 1,
  [SubscriptionDuration.YEARLY]: 12,
  [SubscriptionDuration.BIENNIAL]: 24,
  [SubscriptionDuration.TRIENNIAL]: 36
};

export const PLAN_KEY: Record<PlanType, string> = {
  [PlanType.FREE]: 'free',
  [PlanType.STARTER]: 'starter',
  [PlanType.PRO]: 'professional',
  [PlanType.ENTERPRISE]: 'enterprise'
};

export const PlanCardWithDuration: React.FC<PlanCardWithDurationProps> = ({ plan, isCurrentPlan, duration, recommended, onSelect }) => {
  const { t } = useTranslation('subscription');
  const { type, price, limits } = plan;
  const durationPrices = DURATION_PRICES[type];
  const effectiveDuration = durationPrices ? duration : SubscriptionDuration.MONTHLY;
  const months = DURATION_MONTHS[effectiveDuration];
  const total = durationPrices ? durationPrices[effectiveDuration.toLowerCase() as 'monthly' | 'yearly' | 'biennial' | 'triennial'] : price.amount;
  const currency = durationPrices?.currency || price.currency;
  const savings = durationPrices && months > 1 ? durationPrices.monthly * months - total : 0;
  const discount = months > 1 ? DURATION_DISCOUNTS[effectiveDuration.toLowerCase() as 'yearly' | 'biennial' | 'triennial'] : 0;
  const promoPercent = price.isPromo && price.regularAmount ? Math.round((1 - price.amount / price.regularAmount) * 100) : 0;

  const features = [
    { value: limits.appointments, label: t('plan_card.limits.appointments') },
    { value: limits.clients, label: t('plan_card.limits.clients') },
    { value: limits.services, label: t('plan_card.limits.services') },
    { value: limits.teamMembers, label: t('plan_card.limits.team_members', { count: limits.teamMembers === 1 ? 1 : 2 }) },
    { value: limits.stock, label: t('plan_card.limits.stock') },
    { value: limits.onlineBooking, label: t('plan_card.limits.online_booking') },
    { value: limits.customInterface, label: t('plan_card.limits.custom_interface') }
  ];

  const isEnterprise = type === PlanType.ENTERPRISE;

  return (
    <div
      className={clsx(
        'panel flex h-full flex-col p-5 dark:bg-gray-900',
        recommended ? 'border-orange-500 dark:border-orange-400' : 'dark:border-gray-800'
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50">{t(`plans.${PLAN_KEY[type]}.name`)}</h3>
        {isCurrentPlan ? (
          <Badge tone="green">{t('plan_card.current')}</Badge>
        ) : recommended ? (
          <Badge tone="orange">{t('plan_card.recommended')}</Badge>
        ) : null}
      </div>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t(`plans.${PLAN_KEY[type]}.description`)}</p>

      <div className="mt-5 md:min-h-[5.5rem]">
        {price.customQuote ? (
          <p className="font-display text-2xl font-semibold text-gray-900 dark:text-gray-50">{t('plan_card.on_quote')}</p>
        ) : type === PlanType.FREE ? (
          <p className="font-display text-3xl font-semibold text-gray-900 dark:text-gray-50">{t('plans.free.price')}</p>
        ) : months === 1 ? (
          <>
            <p className="font-display text-3xl font-semibold tabular-nums text-gray-900 dark:text-gray-50">
              {formatPrice(total, currency)}
              <span className="ms-1 text-sm font-normal text-gray-500 dark:text-gray-400">{t('plan_card.per_month')}</span>
            </p>
            {promoPercent > 0 && (
              <p className="mt-1 flex items-center gap-2 text-sm">
                <span className="tabular-nums text-gray-400 line-through">{formatPrice(price.regularAmount!, currency)}</span>
                <Badge tone="green">−{promoPercent} %</Badge>
              </p>
            )}
          </>
        ) : (
          <>
            <p className="font-display text-3xl font-semibold tabular-nums text-gray-900 dark:text-gray-50">{formatPrice(total, currency)}</p>
            <p className="mt-0.5 text-sm tabular-nums text-gray-500 dark:text-gray-400">
              {t('plan_card.equivalent', { amount: formatPrice(Math.round(total / months), currency) })}
            </p>
            {savings > 0 && (
              <p className="mt-1 text-sm font-medium tabular-nums text-emerald-700 dark:text-emerald-400">
                {t('plan_card.savings', { amount: formatPrice(savings, currency), percent: discount })}
              </p>
            )}
          </>
        )}
      </div>

      <ul className="mt-5 flex-1 space-y-2.5 border-t border-gray-100 pt-5 dark:border-gray-800">
        {features.map(({ value, label }) => {
          const included = value !== false;
          return (
            <li key={label} className={clsx('flex items-start gap-2.5 text-sm', included ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500')}>
              {included
                ? <CheckIcon className="mt-0.5 size-4 shrink-0 text-orange-500" />
                : <MinusIcon className="mt-0.5 size-4 shrink-0 text-gray-300 dark:text-gray-600" />}
              <span className="inline-block tabular-nums first-letter:uppercase">
                {typeof value === 'boolean'
                  ? label
                  : value === -1
                    ? t('plan_card.unlimited', { label })
                    : t('plan_card.count', { value, label })}
              </span>
            </li>
          );
        })}
      </ul>

      <button
        onClick={() => onSelect(type, effectiveDuration)}
        disabled={isCurrentPlan}
        className={clsx('mt-6 w-full', recommended && !isCurrentPlan ? 'btn-primary' : 'btn-secondary')}
      >
        {isCurrentPlan ? t('plan_card.current') : isEnterprise ? t('plan_card.contact') : t('plan_card.choose')}
      </button>
    </div>
  );
};
