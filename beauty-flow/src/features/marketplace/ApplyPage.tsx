import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import AuthLanguageSelector from '../../components/AuthLanguageSelector';
import { SaloneoLogo } from '../../components/SaloneoLogo';
import { Segmented } from '../../components/ui';
import { useAuthStore } from '../auth/store';
import { WILAYAS } from '../directory/api';
import { CATEGORIES, Category, errorCode, supplierAPI } from './api';
import { Notice, labelClass, ribError } from './shared';

/** "Devenir fournisseur": public signup → account pending validation, signed in right away. */
const ApplyPage: React.FC = () => {
  const { t } = useTranslation('marketplace');
  const navigate = useNavigate();
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const [f, setF] = useState({
    companyName: '', contactName: '', email: '', phone: '', password: '', wilaya: '', address: '', nif: '', rc: '', description: '',
    categories: [] as Category[], legalName: '', method: 'bank' as 'bank' | 'ccp', rib: '', accept: false,
  });
  const [bad, setBad] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f, v: any) => { setF((x) => ({ ...x, [k]: v })); setBad((b) => b.filter((x) => x !== k)); };
  const rib = f.rib.replace(/\D/g, '');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const local = [
      !f.categories.length && 'categories',
      ribError(f.method, rib) && 'rib',
      f.password.length < 8 && 'password',
      !/^\d{15}(\d{5})?$/.test(f.nif.replace(/\s/g, '')) && 'nif',
    ].filter(Boolean) as string[];
    if (local.length) { setBad(local); setError(t('apply.fix_fields')); return; }
    setBusy(true);
    setError(null);
    try {
      const { data } = await supplierAPI.apply({
        ...f, nif: f.nif.replace(/\s/g, ''), payout: { legalName: f.legalName || f.companyName, method: f.method, rib },
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      await checkAuth();
      navigate('/fournisseur', { replace: true });
    } catch (err: any) {
      const code = errorCode(err);
      if (code === 'INVALID') setBad(err.response.data.details || []);
      setError(code === 'EMAIL_TAKEN' ? t('apply.email_taken') : code === 'INVALID' ? t('apply.fix_fields') : t('apply.error'));
      setBusy(false);
    }
  };

  const input = (k: keyof typeof f, label: string, { className, ...props }: React.InputHTMLAttributes<HTMLInputElement> = {}, help?: string) => (
    <div>
      <label htmlFor={`a-${k}`} className={labelClass}>{label}</label>
      <input id={`a-${k}`} value={f[k] as string} onChange={(e) => set(k, e.target.value)} aria-invalid={bad.includes(k)} className={clsx('field', className)} {...props} />
      {(help || bad.includes(k)) && <p className={clsx('mt-1 text-xs', bad.includes(k) ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400')}>{bad.includes(k) ? t(`apply.invalid.${k}`) : help}</p>}
    </div>
  );

  return (
    <div className="min-h-dvh bg-white dark:bg-[#0F1419]">
      <header className="container-2025 flex h-16 items-center justify-between gap-4">
        <Link to="/" aria-label="Saloneo"><SaloneoLogo size="sm" /></Link>
        <AuthLanguageSelector />
      </header>
      <main className="container-2025 grid gap-10 py-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,34rem)] lg:gap-16 lg:py-14">
        <section className="lg:pt-4">
          <h1 className="font-display text-[2rem] font-semibold leading-tight tracking-tight text-gray-900 sm:text-[2.5rem] dark:text-gray-50">{t('apply.title')}</h1>
          <p className="mt-3 max-w-xl text-lg text-gray-600 dark:text-gray-300">{t('apply.subtitle')}</p>
          <ol className="mt-8 max-w-xl space-y-5">
            {[1, 2, 3, 4].map((n) => (
              <li key={n} className="flex gap-4">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-orange-50 font-display text-sm font-semibold text-orange-700 dark:bg-orange-500/10 dark:text-orange-300">{n}</span>
                <div><p className="font-medium text-gray-900 dark:text-gray-50">{t(`apply.step${n}_title`)}</p><p className="text-sm text-gray-600 dark:text-gray-400">{t(`apply.step${n}_body`)}</p></div>
              </li>
            ))}
          </ol>
          <p className="mt-8 max-w-xl text-sm text-gray-500 dark:text-gray-400">{t('apply.fees')}</p>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">{t('apply.have_account')} <Link to="/auth/login" className="font-medium text-orange-700 hover:underline dark:text-orange-400">{t('apply.login')}</Link></p>
        </section>

        <form onSubmit={submit} className="space-y-6" noValidate>
          <fieldset className="space-y-4">
            <legend className="mb-1 text-base font-semibold text-gray-900 dark:text-gray-50">{t('apply.section_company')}</legend>
            {input('companyName', t('apply.company'), { required: true, maxLength: 120, autoComplete: 'organization' })}
            <div className="grid gap-4 sm:grid-cols-2">
              {input('nif', t('apply.nif'), { required: true, inputMode: 'numeric', maxLength: 24, className: 'font-mono tabular-nums' }, t('apply.nif_help'))}
              {input('rc', t('apply.rc'), { required: true, maxLength: 30, className: 'font-mono' }, t('apply.rc_help'))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="a-wilaya" className={labelClass}>{t('apply.wilaya')}</label>
                <select id="a-wilaya" required value={f.wilaya} onChange={(e) => set('wilaya', e.target.value)} aria-invalid={bad.includes('wilaya')} className="field">
                  <option value="" disabled>{t('checkout.choose_wilaya')}</option>
                  {WILAYAS.map((w, i) => <option key={w} value={w}>{`${String(i + 1).padStart(2, '0')} · ${w}`}</option>)}
                </select>
              </div>
              {input('address', t('apply.address'), { maxLength: 300, autoComplete: 'street-address' })}
            </div>
            <div>
              <p className={labelClass}>{t('apply.categories')}</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => {
                  const on = f.categories.includes(c);
                  return (
                    <button key={c} type="button" aria-pressed={on} onClick={() => set('categories', on ? f.categories.filter((x) => x !== c) : [...f.categories, c])}
                      className={clsx('rounded-full border px-3 py-1.5 text-sm font-medium transition-colors duration-150', on ? 'border-orange-500 bg-orange-50 text-orange-800 dark:bg-orange-500/10 dark:text-orange-300' : 'border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800')}>
                      {t(`categories.${c}`)}
                    </button>
                  );
                })}
              </div>
              {bad.includes('categories') && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{t('apply.invalid.categories')}</p>}
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="mb-1 text-base font-semibold text-gray-900 dark:text-gray-50">{t('apply.section_contact')}</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              {input('contactName', t('apply.contact'), { required: true, maxLength: 120, autoComplete: 'name' })}
              {input('phone', t('apply.phone'), { required: true, type: 'tel', maxLength: 20, autoComplete: 'tel' })}
            </div>
            {input('email', t('apply.email'), { required: true, type: 'email', autoComplete: 'email' })}
            {input('password', t('apply.password'), { required: true, type: 'password', minLength: 8, autoComplete: 'new-password' }, t('apply.password_help'))}
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="mb-1 text-base font-semibold text-gray-900 dark:text-gray-50">{t('apply.section_payout')}</legend>
            <p className="-mt-2 text-sm text-gray-500 dark:text-gray-400">{t('apply.payout_help')}</p>
            <Segmented value={f.method} onChange={(m) => set('method', m)} options={[{ value: 'bank', label: t('payments.method_bank') }, { value: 'ccp', label: t('payments.method_ccp') }]} />
            {input('legalName', t('payments.legal_name'), { maxLength: 120, placeholder: f.companyName })}
            {input('rib', f.method === 'ccp' ? t('payments.rip') : t('payments.rib'), { inputMode: 'numeric', maxLength: 26, className: 'font-mono tabular-nums', autoComplete: 'off' }, t('payments.rib_help'))}
          </fieldset>

          <label className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
            <input type="checkbox" checked={f.accept} onChange={(e) => set('accept', e.target.checked)} className="mt-0.5 size-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
            {t('apply.accept')}
          </label>
          {error && <Notice tone="red">{error}</Notice>}
          <button type="submit" className="btn-primary w-full" disabled={busy || !f.accept}>
            {busy && <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
            {t('apply.submit')}
          </button>
        </form>
      </main>
    </div>
  );
};

export default ApplyPage;
