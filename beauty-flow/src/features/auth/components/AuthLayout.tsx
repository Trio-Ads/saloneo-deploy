import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthLanguageSelector from '../../../components/AuthLanguageSelector';
import { SaloneoLogo } from '../../../components/SaloneoLogo';
import { BrowserFrame } from '../../marketing/components/site';

interface AuthLayoutProps {
  children: React.ReactNode;
  /** i18n keys (auth namespace) */
  title: string;
  subtitle?: string;
}

/** Split auth layout: form on white, brand panel with the product on large screens. */
export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  const { t } = useTranslation('auth');

  return (
    <div className="grid min-h-dvh bg-white lg:grid-cols-2 dark:bg-[#0F1419]">
      <div className="flex flex-col px-4 py-4 sm:px-8 sm:py-6">
        <header className="flex items-center justify-between gap-4">
          <Link to="/" aria-label="Saloneo"><SaloneoLogo size="sm" /></Link>
          <AuthLanguageSelector />
        </header>

        <main className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[400px]">
            <h1 className="font-display text-[1.75rem] font-semibold leading-tight tracking-tight text-gray-900 dark:text-gray-50">{t(title)}</h1>
            {subtitle && <p className="mt-2 text-[0.9375rem] text-gray-500 dark:text-gray-400">{t(subtitle)}</p>}
            <div className="mt-8">{children}</div>
          </div>
        </main>

        <footer className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span>© {new Date().getFullYear()} Saloneo</span>
          <Link to="/" className="hover:text-gray-900 dark:hover:text-gray-50">{t('layout.backHome')}</Link>
        </footer>
      </div>

      <aside className="relative hidden flex-col overflow-hidden bg-orange-500 ps-12 pt-16 xl:ps-16 xl:pt-20 lg:flex">
        <p className="max-w-md pe-12 font-display text-4xl font-semibold leading-[1.1] tracking-[-0.03em] text-gray-900 xl:text-5xl">{t('layout.brandTitle')}</p>
        <p className="mt-5 max-w-md pe-12 text-lg leading-relaxed text-gray-900">{t('layout.brandBody')}</p>
        <div className="mt-auto translate-y-6 pt-12">
          <BrowserFrame src="/images/marketing/app-agenda.webp" alt="" className="w-[760px] max-w-none rounded-b-none" />
        </div>
      </aside>
    </div>
  );
};
