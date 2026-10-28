import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { CheckIcon, MinusIcon, ChevronDownIcon } from '@heroicons/react/20/solid';
import { PlanType, PLAN_LIMITS, DURATION_DISCOUNTS } from '../../subscription/types';
import { formatPrice } from '../../../utils/currency';
import { SiteNav, SiteFooter, PlanCards, BillingToggle, Billing, CONTACT_EMAIL, container, planKey, planPrice, formatLimit } from '../components/site';

const TABLE_PLANS = [PlanType.FREE, PlanType.STARTER, PlanType.PRO, PlanType.ENTERPRISE];
const LIMIT_ROWS = ['appointments', 'clients', 'services', 'teamMembers'] as const;
const FEATURE_ROWS = ['onlineBooking', 'customInterface', 'stock'] as const;
const FAQ = ['free', 'payment', 'change', 'limit', 'yearly', 'data'];

const PricingPage: React.FC = () => {
  const { t } = useTranslation('marketing', { keyPrefix: 'site' });
  const [billing, setBilling] = useState<Billing>('monthly');

  const planHead = (plan: PlanType) =>
    plan === PlanType.ENTERPRISE ? t('pricing.onQuote') : `${formatPrice(planPrice(plan, billing).perMonth, 'DZD')}${t('pricing.perMonth')}`;

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-[#0F1419] dark:text-gray-50">
      <SiteNav />

      <main>
        <section className="bg-gray-50 pt-28 pb-20 sm:pt-36 dark:bg-gray-900/40">
          <div className={container}>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <h1 className="font-display text-[2.5rem] sm:text-6xl font-semibold leading-[1.05] tracking-[-0.035em]">{t('pricing.title')}</h1>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">{t('pricing.subtitle')}</p>
              </div>
              <BillingToggle value={billing} onChange={setBilling} />
            </div>
            <div className="mt-10"><PlanCards billing={billing} /></div>
            <p className="mt-6 text-sm text-gray-600 dark:text-gray-400">{t('pricing.startFree')} {t('pricing.payment')}</p>
          </div>
        </section>

        {/* Plan comparison */}
        <section className="py-20 sm:py-24">
          <div className={container}>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-[-0.025em]">{t('pricing.compareTitle')}</h2>
            <div className="mt-8 overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                    <th scope="col" className="px-5 py-4 text-start font-medium text-gray-500 dark:text-gray-400">{t('pricing.feature')}</th>
                    {TABLE_PLANS.map((plan) => (
                      <th key={plan} scope="col" className={clsx('px-5 py-4 text-start', plan === PlanType.STARTER && 'bg-orange-50 dark:bg-orange-500/10')}>
                        <span className="block text-base font-semibold text-gray-900 dark:text-gray-50">{t(`pricing.plans.${planKey(plan)}.name`)}</span>
                        <span className="block font-normal tabular-nums text-gray-500 dark:text-gray-400">{planHead(plan)}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {LIMIT_ROWS.map((k) => (
                    <tr key={k}>
                      <th scope="row" className="px-5 py-3.5 text-start font-medium text-gray-700 dark:text-gray-300">{t(`pricing.limits.${k}`)}</th>
                      {TABLE_PLANS.map((plan) => (
                        <td key={plan} className={clsx('px-5 py-3.5 font-semibold tabular-nums', plan === PlanType.STARTER && 'bg-orange-50/60 dark:bg-orange-500/5')}>
                          {formatLimit(PLAN_LIMITS[plan][k], t('pricing.unlimited'))}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {FEATURE_ROWS.map((k) => (
                    <tr key={k}>
                      <th scope="row" className="px-5 py-3.5 text-start font-medium text-gray-700 dark:text-gray-300">{t(`pricing.features.${k}`)}</th>
                      {TABLE_PLANS.map((plan) => (
                        <td key={plan} className={clsx('px-5 py-3.5', plan === PlanType.STARTER && 'bg-orange-50/60 dark:bg-orange-500/5')}>
                          {PLAN_LIMITS[plan][k]
                            ? <CheckIcon className="size-5 text-orange-600 dark:text-orange-400" aria-label={t('pricing.included')} />
                            : <MinusIcon className="size-5 text-gray-300 dark:text-gray-600" aria-label={t('pricing.notIncluded')} />}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              {t('pricing.enterprise')}{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400">{t('pricing.contactUs')}</a>
            </p>
          </div>
        </section>

        {/* FAQ — native disclosure */}
        <section id="faq" className="scroll-mt-16 border-t border-gray-200 py-20 sm:py-24 dark:border-gray-800">
          <div className={clsx(container, 'grid gap-10 lg:grid-cols-12')}>
            <div className="lg:col-span-4">
              <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-[-0.025em]">{t('faq.title')}</h2>
              <p className="mt-4 text-gray-600 dark:text-gray-300">
                {t('faq.more')}{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400">{CONTACT_EMAIL}</a>
              </p>
            </div>
            <div className="lg:col-span-8 divide-y divide-gray-200 border-y border-gray-200 dark:divide-gray-800 dark:border-gray-800">
              {FAQ.map((k, i) => (
                <details key={k} className="group" open={i === 0}>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-base font-semibold text-gray-900 dark:text-gray-50 [&::-webkit-details-marker]:hidden">
                    {t(`faq.items.${k}.q`, { discount: DURATION_DISCOUNTS.yearly })}
                    <ChevronDownIcon className="size-5 shrink-0 text-gray-400 transition-transform duration-150 ease-out group-open:rotate-180" />
                  </summary>
                  <p className="pb-5 pe-8 leading-relaxed text-gray-600 dark:text-gray-300">{t(`faq.items.${k}.a`, { discount: DURATION_DISCOUNTS.yearly })}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-orange-500">
          <div className={clsx(container, 'flex flex-col gap-6 py-14 sm:flex-row sm:items-center sm:justify-between')}>
            <h2 className="max-w-2xl font-display text-2xl sm:text-4xl font-semibold leading-tight tracking-[-0.025em] text-gray-900">{t('cta.title')}</h2>
            <Link to="/auth/register" className="inline-flex shrink-0 items-center justify-center rounded-xl bg-gray-900 px-6 py-3.5 text-[0.9375rem] font-semibold text-white transition-[background-color,transform] duration-150 ease-out hover:bg-black active:scale-[0.98]">
              {t('cta.button')}
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
};

export default PricingPage;
