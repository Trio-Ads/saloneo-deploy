import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowDownTrayIcon, ArrowUpTrayIcon, MagnifyingGlassIcon, PencilIcon, PhotoIcon, PlusIcon, Squares2X2Icon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Modal from '../../../components/Modal';
import { Badge, EmptyState, IconButton, PageHeader, Panel } from '../../../components/ui';
import { CATEGORIES, Category, SupplierProduct, supplierAPI } from '../api';
import { Notice, ProductVisual, Spinner, labelClass, money, saveBlob, useZonesLabel } from '../shared';
import { useSupplier } from './SupplierLayout';
import ZonePicker from './ZonePicker';

type Draft = {
  name: string; brand: string; category: Category | ''; unit: string; sku: string; price: string; minOrderQty: string; stock: string;
  leadTimeDays: string; ownZones: boolean; zones: string[]; description: string; photos: string[]; isActive: boolean;
};
const toDraft = (p?: SupplierProduct): Draft => ({
  name: p?.name || '', brand: p?.brand || '', category: p?.category || '', unit: p?.unit || '', sku: p?.sku || '',
  price: p ? String(p.price) : '', minOrderQty: String(p?.minOrderQty ?? 1), stock: String(p?.stock ?? 0),
  leadTimeDays: p?.leadTimeDays !== undefined && p?.leadTimeDays !== null ? String(p.leadTimeDays) : '',
  ownZones: !!p?.zones?.length, zones: p?.zones || [], description: p?.description || '', photos: p?.photos || [], isActive: p?.isActive ?? true,
});

function ProductForm({ product, onClose, onSaved }: { product?: SupplierProduct; onClose: () => void; onSaved: () => void }) {
  const { t } = useTranslation('marketplace');
  const { profile } = useSupplier();
  const [d, setD] = useState<Draft>(() => toDraft(product));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    try {
      const urls: string[] = [];
      for (const f of Array.from(files).slice(0, 6 - d.photos.length)) urls.push((await supplierAPI.upload(f)).data.url);
      set('photos', [...d.photos, ...urls]);
    } catch {
      setError(t('catalogue.form.upload_error'));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const body = {
      name: d.name, brand: d.brand, category: d.category as Category, unit: d.unit, sku: d.sku, price: Number(d.price),
      minOrderQty: Number(d.minOrderQty || 1), stock: Number(d.stock || 0), leadTimeDays: d.leadTimeDays === '' ? undefined : Number(d.leadTimeDays),
      zones: d.ownZones ? d.zones : [], description: d.description, photos: d.photos, isActive: d.isActive,
    };
    try {
      if (product) await supplierAPI.updateProduct(product.id, body);
      else await supplierAPI.createProduct(body);
      onSaved();
    } catch (err: any) {
      const field = err?.response?.data?.details?.[0];
      setError(field ? t(`catalogue.form.invalid.${field}`, { defaultValue: t('catalogue.form.save_error') }) : t('catalogue.form.save_error'));
      setSaving(false);
    }
  };

  const num = (k: 'price' | 'minOrderQty' | 'stock' | 'leadTimeDays', label: string, opts: { min?: number; placeholder?: string; suffix?: string; help?: string } = {}) => (
    <div>
      <label htmlFor={`p-${k}`} className={labelClass}>{label}</label>
      <div className="relative">
        <input id={`p-${k}`} type="number" inputMode="numeric" min={opts.min ?? 0} step={1} value={d[k]} placeholder={opts.placeholder}
          onChange={(e) => set(k, e.target.value)} className="field tabular-nums" required={k === 'price'} />
        {opts.suffix && <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">{opts.suffix}</span>}
      </div>
      {opts.help && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{opts.help}</p>}
    </div>
  );

  return (
    <Modal isOpen onClose={onClose} title={product ? t('catalogue.form.edit_title') : t('catalogue.form.new_title')} size="xl">
      <form onSubmit={submit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="p-name" className={labelClass}>{t('catalogue.form.name')}</label>
            <input id="p-name" required minLength={2} maxLength={140} value={d.name} onChange={(e) => set('name', e.target.value)} className="field" placeholder={t('catalogue.form.name_placeholder')} />
          </div>
          <div>
            <label htmlFor="p-brand" className={labelClass}>{t('catalogue.form.brand')}</label>
            <input id="p-brand" maxLength={80} value={d.brand} onChange={(e) => set('brand', e.target.value)} className="field" />
          </div>
          <div>
            <label htmlFor="p-cat" className={labelClass}>{t('catalogue.form.category')}</label>
            <select id="p-cat" required value={d.category} onChange={(e) => set('category', e.target.value as Category)} className="field">
              <option value="" disabled>{t('catalogue.form.choose')}</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{t(`categories.${c}`)}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="p-unit" className={labelClass}>{t('catalogue.form.unit')}</label>
            <input id="p-unit" maxLength={60} value={d.unit} onChange={(e) => set('unit', e.target.value)} className="field" placeholder={t('catalogue.form.unit_placeholder')} />
          </div>
          <div>
            <label htmlFor="p-sku" className={labelClass}>{t('catalogue.form.sku')}</label>
            <input id="p-sku" maxLength={60} value={d.sku} onChange={(e) => set('sku', e.target.value)} className="field" />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t('catalogue.form.sku_help')}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          {num('price', t('catalogue.form.price'), { min: 1, suffix: 'DA', help: t('catalogue.form.price_help') })}
          {num('minOrderQty', t('catalogue.form.min_qty'), { min: 1 })}
          {num('stock', t('catalogue.form.stock'))}
          {num('leadTimeDays', t('catalogue.form.lead_time'), { placeholder: String(profile.shipping.leadTimeDays), suffix: t('catalogue.form.days'), help: t('catalogue.form.lead_time_help') })}
        </div>

        <div>
          <label htmlFor="p-desc" className={labelClass}>{t('catalogue.form.description')}</label>
          <textarea id="p-desc" rows={3} maxLength={1500} value={d.description} onChange={(e) => set('description', e.target.value)} className="field" />
        </div>

        <div>
          <p className={labelClass}>{t('catalogue.form.photos')}</p>
          <div className="flex flex-wrap gap-3">
            {d.photos.map((u) => (
              <div key={u} className="relative size-20">
                <img src={u} alt="" className="size-20 rounded-xl border border-gray-200 object-cover dark:border-gray-700" />
                <button type="button" onClick={() => set('photos', d.photos.filter((x) => x !== u))} aria-label={t('catalogue.form.remove_photo')}
                  className="absolute -end-2 -top-2 grid size-6 place-items-center rounded-full bg-gray-900 text-white"><XMarkIcon className="size-3.5" /></button>
              </div>
            ))}
            {d.photos.length < 6 && (
              <label className="grid size-20 cursor-pointer place-items-center rounded-xl border border-dashed border-gray-300 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                {uploading ? <span className="size-5 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" /> : <PhotoIcon className="size-6" />}
                <span className="sr-only">{t('catalogue.form.add_photo')}</span>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={(e) => upload(e.target.files)} />
              </label>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t('catalogue.form.photos_help')}</p>
        </div>

        <div className="space-y-3">
          <label className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
            <input type="checkbox" checked={d.ownZones} onChange={(e) => set('ownZones', e.target.checked)} className="mt-0.5 size-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
            <span><span className="font-medium text-gray-900 dark:text-gray-50">{t('catalogue.form.own_zones')}</span><span className="block text-gray-500 dark:text-gray-400">{t('catalogue.form.own_zones_help')}</span></span>
          </label>
          {d.ownZones && <ZonePicker id="p-zones" value={d.zones} onChange={(z) => set('zones', z)} />}
          <label className="flex items-center gap-3 text-sm font-medium text-gray-900 dark:text-gray-50">
            <input type="checkbox" checked={d.isActive} onChange={(e) => set('isActive', e.target.checked)} className="size-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
            {t('catalogue.form.active')}
          </label>
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>}
        <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 dark:border-gray-800 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="btn-secondary">{t('common.cancel')}</button>
          <button type="submit" className="btn-primary" disabled={saving || uploading || (d.ownZones && !d.zones.length)}>{t('common.save')}</button>
        </div>
      </form>
    </Modal>
  );
}

const TEMPLATE = [
  'nom;marque;categorie;description;unite;reference;prix_ttc;quantite_min;stock;delai_jours;zones;photos',
  'Shampooing kératine;Ma Marque;Soins cheveux;Pour cheveux abîmés;Flacon 1 L;SK-1;1850;6;120;2;ALL;',
  'Gants nitrile taille M;;Hygiène & jetables;;Boîte de 100;GN-M;950;5;400;;Alger|Blida|Tipaza;',
].join('\r\n');

function CsvImport({ onClose, onDone }: { onClose: () => void; onDone: (n: { created: number; updated: number }) => void }) {
  const { t } = useTranslation('marketplace');
  const [csv, setCsv] = useState('');
  const [name, setName] = useState('');
  const [preview, setPreview] = useState<{ valid: number; errors: { line: number; field: string }[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = async (f?: File) => {
    if (!f) return;
    setError(null);
    const text = await f.text();
    setCsv(text);
    setName(f.name);
    setBusy(true);
    try {
      setPreview((await supplierAPI.importCsv(text, true)).data);
    } catch {
      setError(t('catalogue.import.error'));
      setPreview(null);
    } finally {
      setBusy(false);
    }
  };
  const run = async () => {
    setBusy(true);
    try {
      const { data } = await supplierAPI.importCsv(csv);
      onDone(data);
    } catch {
      setError(t('catalogue.import.error'));
      setBusy(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={t('catalogue.import.title')} size="lg">
      <div className="space-y-5 text-sm">
        <p className="text-gray-600 dark:text-gray-300">{t('catalogue.import.intro')}</p>
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="min-w-full text-start">
            <thead><tr className="bg-gray-50 dark:bg-gray-800/50">
              <th className="px-3 py-2 text-start font-medium text-gray-500 dark:text-gray-400">{t('catalogue.import.column')}</th>
              <th className="px-3 py-2 text-start font-medium text-gray-500 dark:text-gray-400">{t('catalogue.import.content')}</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {['nom', 'marque', 'categorie', 'description', 'unite', 'reference', 'prix_ttc', 'quantite_min', 'stock', 'delai_jours', 'zones', 'photos'].map((c) => (
                <tr key={c}><td className="whitespace-nowrap px-3 py-1.5 font-mono text-xs text-gray-900 dark:text-gray-50">{c}</td><td className="px-3 py-1.5 text-gray-600 dark:text-gray-300">{t(`catalogue.import.columns.${c}`)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-gray-500 dark:text-gray-400">{t('catalogue.import.categories', { list: CATEGORIES.map((c) => t(`categories.${c}`)).join(' · ') })}</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-secondary" onClick={() => saveBlob(new Blob(['﻿' + TEMPLATE], { type: 'text/csv;charset=utf-8' }), 'modele-catalogue-saloneo.csv')}>
            <ArrowDownTrayIcon className="size-4" />{t('catalogue.import.template')}
          </button>
          <label className="btn-secondary cursor-pointer">
            <ArrowUpTrayIcon className="size-4" />{name || t('catalogue.import.choose')}
            <input type="file" accept=".csv,text/csv" className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
          </label>
        </div>
        {busy && !preview && <Spinner />}
        {preview && (
          <Notice tone={preview.errors.length ? 'amber' : 'green'}>
            <p className="font-medium">{t('catalogue.import.ready', { count: preview.valid })}</p>
            {preview.errors.length > 0 && (
              <>
                <p className="mt-1">{t('catalogue.import.skipped', { count: preview.errors.length })}</p>
                <ul className="mt-1 list-disc ps-5">
                  {preview.errors.slice(0, 8).map((e) => <li key={e.line}>{t('catalogue.import.line_error', { line: e.line, field: t(`catalogue.import.fields.${e.field}`) })}</li>)}
                </ul>
              </>
            )}
          </Notice>
        )}
        {error && <p className="text-red-600 dark:text-red-400" role="alert">{error}</p>}
        <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 dark:border-gray-800 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="btn-secondary">{t('common.cancel')}</button>
          <button type="button" className="btn-primary" disabled={!preview?.valid || busy} onClick={run}>{t('catalogue.import.run', { count: preview?.valid || 0 })}</button>
        </div>
      </div>
    </Modal>
  );
}

const SupplierCatalogue: React.FC = () => {
  const { t } = useTranslation('marketplace');
  const { profile } = useSupplier();
  const zonesLabel = useZonesLabel();
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState<SupplierProduct[] | null>(null);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<string>('all');
  const [editing, setEditing] = useState<SupplierProduct | 'new' | null>(params.get('new') ? 'new' : null);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState(false);

  const load = () => supplierAPI.products().then((r) => setProducts(r.data.products)).catch(() => setError(true));
  useEffect(() => { load(); }, []);
  useEffect(() => { if (params.get('new')) { params.delete('new'); setParams(params, { replace: true }); } }, [params, setParams]);

  const shown = useMemo(() => {
    const f = q.trim().toLowerCase();
    return (products || []).filter((p) => (cat === 'all' || p.category === cat) && (!f || [p.name, p.brand, p.sku].some((x) => x?.toLowerCase().includes(f))));
  }, [products, q, cat]);

  const remove = async (p: SupplierProduct) => {
    if (!window.confirm(t('catalogue.confirm_delete', { name: p.name }))) return;
    await supplierAPI.deleteProduct(p.id);
    load();
  };
  const toggle = async (p: SupplierProduct) => {
    await supplierAPI.updateProduct(p.id, { ...p, isActive: !p.isActive });
    load();
  };

  return (
    <div className="py-6 sm:py-8">
      <PageHeader
        title={t('catalogue.title')}
        subtitle={t('catalogue.subtitle', { zones: zonesLabel(profile.shipping.zones) })}
        actions={<>
          <button type="button" className="btn-secondary" onClick={() => setImporting(true)}><ArrowUpTrayIcon className="size-4" />{t('catalogue.import_button')}</button>
          <button type="button" className="btn-primary" onClick={() => setEditing('new')}><PlusIcon className="size-4" />{t('catalogue.add')}</button>
        </>}
      />
      {message && <div className="mb-4"><Notice tone="green">{message}</Notice></div>}
      {error && <Notice tone="red">{t('common.load_error')}</Notice>}
      {!products && !error && <Spinner />}
      {products && (
        <>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative sm:w-80">
              <MagnifyingGlassIcon className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('catalogue.search')} aria-label={t('catalogue.search')} className="field ps-9" />
            </div>
            <select value={cat} onChange={(e) => setCat(e.target.value)} aria-label={t('catalogue.form.category')} className="field sm:w-56">
              <option value="all">{t('categories.all')}</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{t(`categories.${c}`)}</option>)}
            </select>
            <span className="text-sm text-gray-500 dark:text-gray-400 sm:ms-auto">{t('catalogue.count', { count: shown.length })}</span>
          </div>
          {shown.length === 0 ? (
            <Panel>
              <EmptyState icon={Squares2X2Icon} title={products.length ? t('catalogue.no_match') : t('catalogue.empty')} body={products.length ? undefined : t('catalogue.empty_body')}
                action={!products.length && <button type="button" className="btn-primary" onClick={() => setEditing('new')}><PlusIcon className="size-4" />{t('catalogue.add')}</button>} />
            </Panel>
          ) : (
            <Panel flush>
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {shown.map((p) => (
                  <li key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-5">
                    <ProductVisual product={p} compact className="!size-14 shrink-0" />
                    <div className="min-w-0 flex-1 basis-48">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-medium text-gray-900 dark:text-gray-50">{p.name}</p>
                        {!p.isActive && <Badge>{t('catalogue.inactive')}</Badge>}
                        {p.stock === 0 ? <Badge tone="red">{t('catalogue.out_of_stock')}</Badge> : p.stock < 5 && <Badge tone="amber">{t('catalogue.low_stock')}</Badge>}
                      </div>
                      <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                        {[p.brand, t(`categories.${p.category}`), p.unit, p.sku, p.zones.length ? zonesLabel(p.zones, 2) : null].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <div className="flex w-full items-center gap-4 sm:w-auto">
                      <div className="text-sm tabular-nums">
                        <p className="font-semibold text-gray-900 dark:text-gray-50">{money(p.price)}</p>
                        <p className="text-gray-500 dark:text-gray-400">{t('catalogue.stock_min', { stock: p.stock, min: p.minOrderQty })}</p>
                      </div>
                      <div className="ms-auto flex items-center gap-1">
                        <button type="button" className="btn-ghost text-sm" onClick={() => toggle(p)}>{p.isActive ? t('catalogue.deactivate') : t('catalogue.activate')}</button>
                        <IconButton label={t('catalogue.edit')} onClick={() => setEditing(p)}><PencilIcon className="size-[18px]" /></IconButton>
                        <IconButton label={t('catalogue.delete')} tone="danger" onClick={() => remove(p)}><TrashIcon className="size-[18px]" /></IconButton>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </>
      )}
      {editing && (
        <ProductForm product={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); setMessage(t('catalogue.saved')); load(); }} />
      )}
      {importing && (
        <CsvImport onClose={() => setImporting(false)}
          onDone={(n) => { setImporting(false); setMessage(t('catalogue.import.done', { created: n.created, updated: n.updated })); load(); }} />
      )}
    </div>
  );
};

export default SupplierCatalogue;
