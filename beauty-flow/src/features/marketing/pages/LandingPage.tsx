import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { CheckIcon, ArrowRightIcon } from '@heroicons/react/20/solid';
import api from '../../../services/api';
import { usePublicStats } from '../hooks/usePublicStats';
import { formatPrice } from '../../../utils/currency';
import { PlanType, DURATION_PRICES } from '../../subscription/types';
import { allTemplates } from '../../templates';
import DirectoryShowcase from '../../directory/DirectoryShowcase';
import { SiteNav, SiteFooter, BrowserFrame, PhoneFrame, PlanCards, BillingToggle, Billing, CONTACT_EMAIL, container } from '../components/site';

const IMG = '/images/marketing';

const LandingPage: React.FC = () => {
  const { t } = useTranslation('marketing', { keyPrefix: 'site' });
  const navigate = useNavigate();
  const { stats } = usePublicStats();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [billing, setBilling] = useState<Billing>('monthly');
  const [avgPrice, setAvgPrice] = useState(1500);

  // Track page visit
  useEffect(() => {
    api.post('/marketing/stats/visit').catch(() => {});
  }, []);

  // Capture lead, then continue to sign-up with the email pre-filled
  const handleLeadCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await api.post('/marketing/lead/capture', { email, name: 'Lead Landing Page', source: 'landing-hero' });
    } catch (error) {
      console.error('Erreur capture lead:', error);
    } finally {
      setLoading(false);
      navigate('/auth/register', { state: { email } });
    }
  };

  // Real usage numbers only once they mean something
  const showStats = !!stats && stats.salonsCount >= 50 && stats.appointmentsCount >= 1000;
  const list = (key: string) => { const v = t(key, { returnObjects: true, templates: allTemplates.length }); return Array.isArray(v) ? (v as string[]) : []; };
  const breakEven = (plan: PlanType) => Math.max(1, Math.ceil(DURATION_PRICES[plan]!.monthly / Math.max(avgPrice, 1)));

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-[#0F1419] dark:text-gray-50">
      <SiteNav />

      <main>
        {/* Hero: what the salon sees + what its clients see */}
        <section className="pt-28 sm:pt-36">
          <div className={clsx(container, 'grid gap-8 lg:grid-cols-12 lg:items-end')}>
            <h1 className="lg:col-span-7 font-display text-[2.5rem] leading-[1.05] sm:text-6xl lg:text-[4.25rem] font-semibold tracking-[-0.035em] text-gray-900 dark:text-gray-50">
              {t('hero.title')}
            </h1>
            <div className="lg:col-span-5 lg:pb-2">
              <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">{t('hero.subtitle')}</p>
              <form onSubmit={handleLeadCapture} className="mt-6 flex flex-col gap-2 sm:flex-row">
                <label htmlFor="hero-email" className="sr-only">{t('hero.emailLabel')}</label>
                <input
                  id="hero-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('hero.emailPlaceholder')}
                  className="field h-12 flex-1 dark:bg-gray-900 dark:border-gray-700"
                />
                <button type="submit" disabled={loading} className="btn-primary h-12 px-5 text-[0.9375rem]">
                  {loading ? t('hero.loading') : t('hero.cta')}
                </button>
              </form>
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                {t('hero.note')} · <Link to="/pricing" className="font-medium text-gray-900 underline decoration-gray-300 underline-offset-4 hover:decoration-gray-900 dark:text-gray-50">{t('hero.secondary')}</Link>
              </p>
            </div>
          </div>

          <div className="relative mt-14 sm:mt-20">
            <div aria-hidden className="absolute inset-x-0 bottom-0 top-16 sm:top-32 bg-orange-500" />
            <div className={clsx(container, 'relative pb-10 sm:pb-16')}>
              <div className="relative pe-[18%] sm:pe-[22%]">
                <BrowserFrame eager src={`${IMG}/app-dashboard.webp`} alt={t('hero.altDashboard')} />
                <PhoneFrame eager src={`${IMG}/salon-mobile.webp`} alt={t('hero.altSalon')} className="absolute bottom-[-1.5rem] end-0 w-[34%] sm:w-[27%] lg:w-[22%] max-w-[270px]" />
              </div>
              <div className="mt-10 sm:mt-14 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <p className="max-w-2xl font-display text-xl sm:text-2xl font-semibold leading-snug text-gray-900">
                  {t('trades.lead')} {list('trades.items').join(' · ')}.
                </p>
                <p className="text-sm font-medium text-gray-900 sm:text-end">
                  {t('hero.captionAdmin')}<br />{t('hero.captionSalon')}
                </p>
              </div>
              {showStats && (
                <p className="mt-6 border-t border-gray-900/15 pt-4 text-sm font-medium text-gray-900 tabular-nums">
                  {t('stats.line', { salons: stats!.salonsCount.toLocaleString('fr-FR'), appointments: stats!.appointmentsCount.toLocaleString('fr-FR') })}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Features: two showcases, then the rest of the day-to-day */}
        <section id="features" className="scroll-mt-16 py-20 sm:py-28">
          <div className={container}>
            <div className="max-w-2xl">
              <h2 className="font-display text-3xl sm:text-[2.75rem] leading-tight font-semibold tracking-[-0.025em]">{t('features.title')}</h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">{t('features.subtitle')}</p>
            </div>

            <div className="mt-14 grid gap-10 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-4">
                <h3 className="text-2xl font-semibold tracking-tight">{t('features.agenda.title')}</h3>
                <p className="mt-3 text-gray-600 dark:text-gray-300 leading-relaxed">{t('features.agenda.body')}</p>
                <Points items={list('features.agenda.points')} />
              </div>
              <BrowserFrame src={`${IMG}/app-agenda.webp`} alt={t('features.agenda.alt')} className="lg:col-span-8" />
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-20 sm:py-28 dark:bg-gray-900/40">
          <div className={clsx(container, 'grid gap-12 lg:grid-cols-12 lg:items-center')}>
            <div className="order-2 lg:order-1 lg:col-span-5 flex justify-center">
              <PhoneFrame src={`${IMG}/salon-mobile.webp`} alt={t('features.booking.alt')} className="w-full max-w-[300px]" />
            </div>
            <div className="order-1 lg:order-2 lg:col-span-6 lg:col-start-7">
              <h3 className="font-display text-3xl sm:text-4xl font-semibold leading-tight tracking-[-0.025em]">{t('features.booking.title')}</h3>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 leading-relaxed">{t('features.booking.body')}</p>
              <Points items={list('features.booking.points')} />
              <p dir="ltr" className="mt-8 inline-flex rounded-lg border border-gray-200 bg-white px-3 py-2 font-mono text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                saloneo.app/salon/<span className="text-orange-600 dark:text-orange-400">{t('features.booking.slug')}</span>
              </p>
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-28">
          <div className={clsx(container, 'grid gap-12 lg:grid-cols-12')}>
            <div className="lg:col-span-5">
              <h3 className="font-display text-3xl font-semibold tracking-[-0.025em]">{t('features.rest.title')}</h3>
              <dl className="mt-8 divide-y divide-gray-200 border-y border-gray-200 dark:divide-gray-800 dark:border-gray-800">
                {(['clients', 'team', 'stock', 'dashboard', 'mobile', 'payment'] as const).map((k) => (
                  <div key={k} className="py-4">
                    <dt className="font-semibold">{t(`features.rest.${k}.title`)}</dt>
                    <dd className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{t(`features.rest.${k}.body`)}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="lg:col-span-7 lg:pt-16">
              <BrowserFrame src={`${IMG}/app-clients.webp`} alt={t('features.rest.alt')} />
            </div>
          </div>
        </section>

        <DirectoryShowcase />

        {/* Break-even calculator: plain arithmetic, no promised growth */}
        <section className="border-y border-gray-200 bg-gray-50 py-20 dark:border-gray-800 dark:bg-gray-900/40">
          <div className={clsx(container, 'grid gap-10 lg:grid-cols-2 lg:items-center')}>
            <div>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold leading-tight tracking-[-0.025em]">{t('roi.title')}</h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">{t('roi.body')}</p>
            </div>
            <div className="panel p-6 sm:p-8 dark:bg-gray-900 dark:border-gray-800">
              <label htmlFor="avg-price" className="flex items-baseline justify-between gap-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('roi.label')}
                <span className="font-display text-xl font-semibold tabular-nums text-gray-900 dark:text-gray-50">{formatPrice(avgPrice, 'DZD')}</span>
              </label>
              <input
                id="avg-price"
                type="range"
                min={500}
                max={10000}
                step={100}
                value={avgPrice}
                onChange={(e) => setAvgPrice(Number(e.target.value))}
                className="mt-4 h-10 w-full cursor-pointer accent-orange-500"
              />
              <div className="mt-6 grid grid-cols-2 divide-x divide-gray-200 rtl:divide-x-reverse border-t border-gray-200 pt-6 dark:divide-gray-800 dark:border-gray-800">
                {[PlanType.STARTER, PlanType.PRO].map((p, i) => (
                  <div key={p} className={i ? 'ps-6' : 'pe-6'}>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t(`pricing.plans.${p.toLowerCase()}.name`)} · {formatPrice(DURATION_PRICES[p]!.monthly, 'DZD')}{t('pricing.perMonth')}</p>
                    <p className="mt-1 font-display text-4xl font-semibold tabular-nums text-orange-600 dark:text-orange-400">{breakEven(p)}</p>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{t('roi.result')}</p>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-xs text-gray-500 dark:text-gray-400">{t('roi.note')}</p>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="scroll-mt-16 py-20 sm:py-28">
          <div className={container}>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <h2 className="font-display text-3xl sm:text-[2.75rem] leading-tight font-semibold tracking-[-0.025em]">{t('pricing.title')}</h2>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">{t('pricing.subtitle')}</p>
              </div>
              <BillingToggle value={billing} onChange={setBilling} />
            </div>
            <div className="mt-10"><PlanCards billing={billing} /></div>
            <div className="mt-8 flex flex-col gap-3 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between dark:text-gray-400">
              <p>{t('pricing.startFree')} {t('pricing.payment')}</p>
              <Link to="/pricing" className="inline-flex items-center gap-1 font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400">
                {t('pricing.compare')} <ArrowRightIcon className="size-4 rtl:rotate-180" />
              </Link>
            </div>
          </div>
        </section>

        {/* An honest note instead of invented testimonials */}
        <section className="border-t border-gray-200 py-20 sm:py-28 dark:border-gray-800">
          <div className={clsx(container, 'max-w-3xl')}>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold leading-tight tracking-[-0.025em]">{t('founder.title')}</h2>
            <p className="mt-6 text-lg leading-relaxed text-gray-600 dark:text-gray-300">{t('founder.body')}</p>
            <p className="mt-4 text-lg leading-relaxed text-gray-600 dark:text-gray-300">{t('founder.body2')}</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a href={`mailto:${CONTACT_EMAIL}`} className="btn-secondary py-3">{t('founder.cta')}</a>
              <span className="text-sm text-gray-500 dark:text-gray-400">{t('founder.signature')}</span>
            </div>
          </div>
        </section>

        {/* Closing call to action */}
        <section className="bg-orange-500">
          <div className={clsx(container, 'py-16 sm:py-24')}>
            <h2 className="max-w-3xl font-display text-3xl sm:text-5xl font-semibold leading-[1.1] tracking-[-0.03em] text-gray-900">{t('cta.title')}</h2>
            <p className="mt-4 max-w-xl text-lg text-gray-900">{t('cta.body')}</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Link to="/auth/register" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 py-3.5 text-[0.9375rem] font-semibold text-white transition-[background-color,transform] duration-150 ease-out hover:bg-black active:scale-[0.98]">
                {t('cta.button')} <ArrowRightIcon className="size-4 rtl:rotate-180" />
              </Link>
              <Link to="/auth/login" className="text-[0.9375rem] font-semibold text-gray-900 underline decoration-gray-900/40 underline-offset-4 hover:decoration-gray-900">{t('cta.login')}</Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
};

function Points({ items }: { items: string[] }) {
  return (
    <ul className="mt-6 space-y-2.5">
      {items.map((p) => (
        <li key={p} className="flex items-start gap-2.5 text-[0.9375rem] text-gray-900 dark:text-gray-100">
          <CheckIcon className="mt-0.5 size-5 shrink-0 text-orange-600 dark:text-orange-400" />{p}
        </li>
      ))}
    </ul>
  );
}

export default LandingPage;
