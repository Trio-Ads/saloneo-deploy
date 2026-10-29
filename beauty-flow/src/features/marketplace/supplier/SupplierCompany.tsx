import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { PageHeader, Panel } from '../../../components/ui';
import { WILAYAS } from '../../directory/api';
import { CATEGORIES, Category, supplierAPI } from '../api';
import { Notice, labelClass, money } from '../shared';
import { useSupplier } from './SupplierLayout';
import AppPanel from '../../pwa/AppPanel';
import DeleteAccountPanel from '../../auth/components/DeleteAccountPanel';
import ZonePicker from './ZonePicker';

/** Fiche entreprise (shown to salons, NIF/RC for Saloneo) + delivery rules applied to every order. */
const SupplierCompany: React.FC = () => {
  const { t } = useTranslation('marketplace');
  const { profile, reload } = useSupplier();
  const [f, setF] = useState({
    companyName: profile.companyName, contactName: profile.contactName || '', phone: profile.phone || '', wilaya: profile.wilaya || '',
    address: profile.address || '', nif: profile.nif || '', rc: profile.rc || '', description: profile.description || '', categories: profile.categories,
  });
  const [ship, setShip] = useState({ zones: profile.shipping.zones, fee: String(profile.shipping.fee), freeAbove: String(profile.shipping.freeAbove), leadTimeDays: String(profile.shipping.leadTimeDays) });
  const [state, setState] = useState<{ which: 'company' | 'shipping'; tone: 'green' | 'red'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const save = async (which: 'company' | 'shipping') => {
    setSaving(true);
    setState(null);
    try {
      await supplierAPI.updateMe(which === 'company' ? f : { shipping: { zones: ship.zones, fee: Number(ship.fee || 0), freeAbove: Number(ship.freeAbove || 0), leadTimeDays: Number(ship.leadTimeDays || 0) } });
      await reload();
      setState({ which, tone: 'green', text: t('company.saved') });
    } catch (e: any) {
      setState({ which, tone: 'red', text: e?.response?.data?.error || t('common.action_error') });
    } finally {
      setSaving(false);
    }
  };
  const field = (k: keyof typeof f, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label htmlFor={`c-${k}`} className={labelClass}>{label}</label>
      <input id={`c-${k}`} value={f[k] as string} onChange={(e) => setF({ ...f, [k]: e.target.value })} className="field" {...props} />
    </div>
  );
  const toggleCat = (c: Category) => setF({ ...f, categories: f.categories.includes(c) ? f.categories.filter((x) => x !== c) : [...f.categories, c] });
  const fee = Number(ship.fee || 0), free = Number(ship.freeAbove || 0);

  return (
    <div className="py-6 sm:py-8">
      <PageHeader title={t('company.title')} subtitle={t('company.subtitle')} />
      <div className="space-y-6">
        <Panel title={t('company.card_title')} description={t('company.card_description')}>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); save('company'); }}>
            <div className="grid gap-4 sm:grid-cols-2">
              {field('companyName', t('apply.company'), { required: true, maxLength: 120 })}
              {field('contactName', t('apply.contact'), { maxLength: 120 })}
              {field('phone', t('apply.phone'), { type: 'tel', maxLength: 20 })}
              <div>
                <label htmlFor="c-wilaya" className={labelClass}>{t('apply.wilaya')}</label>
                <select id="c-wilaya" value={f.wilaya} onChange={(e) => setF({ ...f, wilaya: e.target.value })} className="field">
                  {WILAYAS.map((w, i) => <option key={w} value={w}>{`${String(i + 1).padStart(2, '0')} · ${w}`}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">{field('address', t('apply.address'), { maxLength: 300 })}</div>
              {field('nif', t('apply.nif'), { inputMode: 'numeric', maxLength: 20, className: 'field font-mono tabular-nums' })}
              {field('rc', t('apply.rc'), { maxLength: 30, className: 'field font-mono' })}
            </div>
            <div>
              <label htmlFor="c-desc" className={labelClass}>{t('apply.description')}</label>
              <textarea id="c-desc" rows={3} maxLength={1000} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} className="field" />
            </div>
            <div>
              <p className={labelClass}>{t('apply.categories')}</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button key={c} type="button" aria-pressed={f.categories.includes(c)} onClick={() => toggleCat(c)}
                    className={clsx('rounded-full border px-3 py-1.5 text-sm font-medium transition-colors duration-150', f.categories.includes(c) ? 'border-orange-500 bg-orange-50 text-orange-800 dark:bg-orange-500/10 dark:text-orange-300' : 'border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800')}>
                    {t(`categories.${c}`)}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('company.email_note', { email: profile.email })}</p>
            {state?.which === 'company' && <Notice tone={state.tone}>{state.text}</Notice>}
            <button type="submit" className="btn-primary" disabled={saving}>{t('common.save')}</button>
          </form>
        </Panel>

        <Panel title={t('company.shipping_title')} description={t('company.shipping_description')}>
          <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); save('shipping'); }}>
            <div>
              <p className={labelClass}>{t('company.zones')}</p>
              <ZonePicker value={ship.zones} onChange={(zones) => setShip({ ...ship, zones })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {(['fee', 'freeAbove', 'leadTimeDays'] as const).map((k) => (
                <div key={k}>
                  <label htmlFor={`s-${k}`} className={labelClass}>{t(`company.${k}`)}</label>
                  <div className="relative">
                    <input id={`s-${k}`} type="number" min={0} step={1} inputMode="numeric" value={ship[k]} onChange={(e) => setShip({ ...ship, [k]: e.target.value })} className="field tabular-nums" />
                    <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">{k === 'leadTimeDays' ? t('catalogue.form.days') : 'DA'}</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t(`company.${k}_help`)}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {fee === 0 ? t('company.rule_free') : free > 0 ? t('company.rule_fee_free', { fee: money(fee), free: money(free) }) : t('company.rule_fee', { fee: money(fee) })}
            </p>
            {state?.which === 'shipping' && <Notice tone={state.tone}>{state.text}</Notice>}
            <button type="submit" className="btn-primary" disabled={saving || !ship.zones.length}>{t('common.save')}</button>
          </form>
        </Panel>
        <AppPanel audience="supplier" />
        <DeleteAccountPanel audience="supplier" />
      </div>
    </div>
  );
};

export default SupplierCompany;
