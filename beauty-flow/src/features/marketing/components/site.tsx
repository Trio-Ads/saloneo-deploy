// Shared building blocks of the public Saloneo site (landing + pricing). See DESIGN.md "Marketing site".
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { Bars3Icon, XMarkIcon, CheckIcon, MinusIcon } from '@heroicons/react/24/outline';
import SaloneoLogo from '../../../components/SaloneoLogo';
import AuthLanguageSelector from '../../../components/AuthLanguageSelector';
import { Badge, IconButton, Segmented } from '../../../components/ui';
import { formatPrice } from '../../../utils/currency';
import { PlanType, PLAN_LIMITS, DURATION_PRICES, DURATION_DISCOUNTS } from '../../subscription/types';

export const CONTACT_EMAIL = 'contact@saloneo.app';
export const container = 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8';

export function SiteNav() {
  const { t } = useTranslation('marketing', { keyPrefix: 'site' });
  const [open, setOpen] = useState(false);
  const loggedIn = !!localStorage.getItem('token');
  const links = [['/#features', t('nav.features')], ['/pricing', t('nav.pricing')]];

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-[#0F1419]">
      <nav className={clsx(container, 'flex h-16 items-center justify-between gap-4')}>
        <Link to="/" aria-label="Saloneo" className="shrink-0"><SaloneoLogo size="sm" /></Link>
        <div className="hidden md:flex items-center gap-1">
          {links.map(([href, label]) => (
            <a key={href} href={href} className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors duration-150 ease-out hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-50">{label}</a>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-2">
          <AuthLanguageSelector />
          {loggedIn ? (
            <Link to="/dashboard" className="btn-primary">{t('nav.dashboard')}</Link>
          ) : (
            <>
              <Link to="/auth/login" className="btn-ghost">{t('nav.login')}</Link>
              <Link to="/auth/register" className="btn-primary">{t('nav.signup')}</Link>
            </>
          )}
        </div>
        <IconButton label={t('nav.menu')} className="md:hidden size-10" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? <XMarkIcon className="size-6" /> : <Bars3Icon className="size-6" />}
        </IconButton>
      </nav>
      {open && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 pb-5 pt-2 dark:border-gray-800 dark:bg-[#0F1419]">
          {links.map(([href, label]) => (
            <a key={href} href={href} onClick={() => setOpen(false)} className="block rounded-lg px-2 py-3 text-base font-medium text-gray-900 dark:text-gray-50">{label}</a>
          ))}
          <AuthLanguageSelector className="mt-1" />
          <div className="mt-4 grid gap-2">
            {loggedIn ? (
              <Link to="/dashboard" className="btn-primary py-3">{t('nav.dashboard')}</Link>
            ) : (
              <>
                <Link to="/auth/register" className="btn-primary py-3">{t('nav.signup')}</Link>
                <Link to="/auth/login" className="btn-secondary py-3">{t('nav.login')}</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  const { t } = useTranslation('marketing', { keyPrefix: 'site' });
  const col = 'space-y-2 text-sm text-gray-600 dark:text-gray-400';
  const link = 'transition-colors duration-150 ease-out hover:text-gray-900 dark:hover:text-gray-50';
  return (
    <footer className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-[#0F1419]">
      <div className={clsx(container, 'grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-5')}>
        <div className="lg:col-span-2">
          <SaloneoLogo size="sm" />
          <p className="mt-3 max-w-xs text-sm text-gray-600 dark:text-gray-400">{t('footer.tagline')}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('footer.product')}</p>
          <ul className={clsx(col, 'mt-3')}>
            <li><a href="/#features" className={link}>{t('nav.features')}</a></li>
            <li><Link to="/pricing" className={link}>{t('nav.pricing')}</Link></li>
            <li><a href="/pricing#faq" className={link}>{t('footer.faq')}</a></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('footer.account')}</p>
          <ul className={clsx(col, 'mt-3')}>
            <li><Link to="/auth/login" className={link}>{t('nav.login')}</Link></li>
            <li><Link to="/auth/register" className={link}>{t('footer.register')}</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('footer.contact')}</p>
          <ul className={clsx(col, 'mt-3')}>
            <li><a href={`mailto:${CONTACT_EMAIL}`} className={link}>{CONTACT_EMAIL}</a></li>
          </ul>
        </div>
      </div>
      <div className={clsx(container, 'border-t border-gray-200 py-6 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400')}>
        © {new Date().getFullYear()} Saloneo. {t('footer.rights')}
      </div>
    </footer>
  );
}

/** Product screenshot inside a drawn browser window. */
export function BrowserFrame({ src, alt, url = 'saloneo.app', className, eager }: { src: string; alt: string; url?: string; className?: string; eager?: boolean }) {
  return (
    <div dir="ltr" className={clsx('overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_24px_48px_-16px_rgb(24_24_27/0.22)] dark:border-gray-700 dark:bg-gray-900', className)}>
      <div className="flex items-center gap-1.5 border-b border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
        <span className="size-2.5 rounded-full bg-gray-300 dark:bg-gray-600" />
        <span className="size-2.5 rounded-full bg-gray-300 dark:bg-gray-600" />
        <span className="size-2.5 rounded-full bg-gray-300 dark:bg-gray-600" />
        <span className="mx-auto hidden rounded-md bg-white px-3 py-0.5 text-[11px] text-gray-500 sm:block dark:bg-gray-900 dark:text-gray-400">{url}</span>
        <span className="hidden w-[42px] sm:block" />
      </div>
      <img src={src} alt={alt} width={1600} height={1000} loading={eager ? 'eager' : 'lazy'} className="block h-auto w-full" />
    </div>
  );
}

/** Product screenshot inside a drawn phone. */
export function PhoneFrame({ src, alt, className, eager }: { src: string; alt: string; className?: string; eager?: boolean }) {
  return (
    <div className={clsx('rounded-[2rem] bg-gray-900 p-[3.5%] shadow-[0_24px_48px_-12px_rgb(24_24_27/0.35)] ring-1 ring-gray-900/10', className)}>
      <img src={src} alt={alt} width={640} height={1385} loading={eager ? 'eager' : 'lazy'} className="block h-auto w-full rounded-[1.6rem]" />
    </div>
  );
}

export type Billing = 'monthly' | 'yearly';

export function BillingToggle({ value, onChange }: { value: Billing; onChange: (b: Billing) => void }) {
  const { t } = useTranslation('marketing', { keyPrefix: 'site' });
  return (
    <Segmented<Billing>
      value={value}
      onChange={onChange}
      options={[
        { value: 'monthly', label: t('pricing.monthly') },
        { value: 'yearly', label: <>{t('pricing.yearly')} <span className="text-orange-600 dark:text-orange-400">−{DURATION_DISCOUNTS.yearly} %</span></> },
      ]}
    />
  );
}

export const PUBLIC_PLANS = [PlanType.FREE, PlanType.STARTER, PlanType.PRO] as const;
export const planKey = (p: PlanType) => p.toLowerCase();

/** Monthly-equivalent price of a plan for a billing period, from the real price table. */
export function planPrice(plan: PlanType, billing: Billing) {
  const d = DURATION_PRICES[plan];
  if (!d) return { perMonth: 0, yearly: 0 };
  return { perMonth: billing === 'yearly' ? Math.round(d.yearly / 12) : d.monthly, yearly: d.yearly };
}

export const formatLimit = (n: number, unlimited: string) => (n < 0 ? unlimited : n.toLocaleString('fr-FR'));

export function PlanCards({ billing }: { billing: Billing }) {
  const { t } = useTranslation('marketing', { keyPrefix: 'site' });
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {PUBLIC_PLANS.map((plan) => {
        const key = planKey(plan);
        const limits = PLAN_LIMITS[plan];
        const { perMonth, yearly } = planPrice(plan, billing);
        const featured = plan === PlanType.STARTER;
        return (
          <article key={plan} className={clsx('flex flex-col rounded-2xl border bg-white p-6 dark:bg-gray-900', featured ? 'border-orange-500 ring-1 ring-orange-500 dark:border-orange-400 dark:ring-orange-400' : 'border-gray-200 dark:border-gray-800')}>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">{t(`pricing.plans.${key}.name`)}</h3>
              {featured && <Badge tone="orange">{t('pricing.recommended')}</Badge>}
            </div>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{t(`pricing.plans.${key}.description`)}</p>
            <p className="mt-6 flex items-baseline gap-1.5">
              <span className="font-display text-4xl font-semibold tracking-tight tabular-nums text-gray-900 dark:text-gray-50">{formatPrice(perMonth, 'DZD')}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">{t('pricing.perMonth')}</span>
            </p>
            <p className="mt-1 h-5 text-sm text-gray-500 dark:text-gray-400">
              {plan === PlanType.FREE ? t('pricing.noCard') : billing === 'yearly' ? t('pricing.billedYearly', { amount: formatPrice(yearly, 'DZD') }) : t('pricing.billedMonthly')}
            </p>
            <dl className="mt-6 divide-y divide-gray-100 border-y border-gray-100 text-sm dark:divide-gray-800 dark:border-gray-800">
              {(['appointments', 'clients', 'services', 'teamMembers'] as const).map((k) => (
                <div key={k} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-gray-600 dark:text-gray-400">{t(`pricing.limits.${k}`)}</dt>
                  <dd className="font-semibold tabular-nums text-gray-900 dark:text-gray-50">{formatLimit(limits[k], t('pricing.unlimited'))}</dd>
                </div>
              ))}
            </dl>
            <ul className="mt-5 mb-7 space-y-2.5 text-sm">
              {(['onlineBooking', 'customInterface', 'stock'] as const).map((k) => (
                <li key={k} className={clsx('flex items-start gap-2.5', limits[k] ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500')}>
                  {limits[k] ? <CheckIcon className="mt-0.5 size-4 shrink-0 text-orange-600 dark:text-orange-400" /> : <MinusIcon className="mt-0.5 size-4 shrink-0" />}
                  <span>{t(`pricing.features.${k}`)}{!limits[k] && <span className="sr-only"> — {t('pricing.notIncluded')}</span>}</span>
                </li>
              ))}
            </ul>
            <Link to="/auth/register" className={clsx('mt-auto w-full py-3', featured ? 'btn-primary' : 'btn-secondary')}>
              {t(`pricing.plans.${key}.cta`)}
            </Link>
          </article>
        );
      })}
    </div>
  );
}
