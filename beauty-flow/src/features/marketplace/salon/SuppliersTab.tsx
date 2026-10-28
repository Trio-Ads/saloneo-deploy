import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import {
  ArrowLeftIcon, BuildingStorefrontIcon, MagnifyingGlassIcon, MinusIcon, PlusIcon, ShoppingCartIcon, TrashIcon, TruckIcon,
} from '@heroicons/react/24/outline';
import Modal from '../../../components/Modal';
import { Badge, EmptyState, IconButton, Panel, Segmented } from '../../../components/ui';
import { useAuthStore } from '../../auth/store';
import { CATEGORIES, Category, MarketContext, MarketProduct, Quote, ShipTo, SupplierCard, errorCode, marketAPI } from '../api';
import { Notice, ProductVisual, Spinner, labelClass, money, useZonesLabel } from '../shared';
import { useCart } from './cart';
import { SalonOrderDetail, SalonOrders } from './SalonOrders';

type View = 'catalogue' | 'cart' | 'orders';

function Qty({ value, min, onChange, label }: { value: number; min: number; onChange: (n: number) => void; label: string }) {
  const { t } = useTranslation('marketplace');
  return (
    <div className="inline-flex items-center rounded-xl border border-gray-200 dark:border-gray-700">
      <IconButton label={t('cart.less')} onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} className="disabled:opacity-40"><MinusIcon className="size-4" /></IconButton>
      <input type="number" inputMode="numeric" min={min} value={value} aria-label={label} onChange={(e) => onChange(Math.max(1, Number(e.target.value) || min))}
        className="w-14 border-0 bg-transparent p-0 text-center text-sm font-medium tabular-nums focus:ring-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" />
      <IconButton label={t('cart.more')} onClick={() => onChange(value + 1)}><PlusIcon className="size-4" /></IconButton>
    </div>
  );
}

/** Product card with quick add (quantity starts at the minimum order). */
function ProductCard({ p, onOpen, onAdd, showSupplier = true }: { p: MarketProduct; onOpen: () => void; onAdd: (qty: number) => void; showSupplier?: boolean }) {
  const { t } = useTranslation('marketplace');
  const out = p.stock < p.minOrderQty;
  // Without a photo the typographic card already shows brand, name and unit: the text below does not repeat them
  const photo = p.photos.length > 0;
  const meta = [photo ? p.unit : null, p.minOrderQty > 1 ? t('product.min', { count: p.minOrderQty }) : null, showSupplier ? p.supplier?.companyName : null].filter(Boolean).join(' · ');
  return (
    <li className="flex flex-col rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
      <button type="button" onClick={onOpen} className="text-start" aria-label={t('product.details', { name: p.name })}>
        <ProductVisual product={p} />
        {photo && <p className="mt-3 truncate text-xs font-medium text-gray-500 dark:text-gray-400">{p.brand}</p>}
        <p className={photo ? 'mt-0.5 line-clamp-2 text-sm font-medium text-gray-900 dark:text-gray-50' : 'sr-only'}>{p.name}</p>
        {meta && <p className="mt-2 truncate text-xs text-gray-500 dark:text-gray-400">{meta}</p>}
      </button>
      <div className="mt-auto flex items-center justify-between gap-2 pt-3">
        <span className="font-display font-semibold tabular-nums text-gray-900 dark:text-gray-50">{money(p.price)}</span>
        {p.deliverable === false ? (
          <Badge>{t('product.not_delivered')}</Badge>
        ) : out ? (
          <Badge tone="red">{t('product.out_of_stock')}</Badge>
        ) : (
          <button type="button" className="btn-secondary !px-3 !py-1.5 text-sm" onClick={() => onAdd(p.minOrderQty)}>
            <PlusIcon className="size-4" />{t('product.add')}
          </button>
        )}
      </div>
    </li>
  );
}

function ProductModal({ p, onClose, onAdd }: { p: MarketProduct; onClose: () => void; onAdd: (qty: number) => void }) {
  const { t } = useTranslation('marketplace');
  const [qty, setQty] = useState(p.minOrderQty);
  const [photo, setPhoto] = useState(0);
  const available = p.deliverable !== false && p.stock >= p.minOrderQty;
  return (
    <Modal isOpen onClose={onClose} title={p.name} size="lg">
      <div className="grid gap-6 sm:grid-cols-[14rem_minmax(0,1fr)]">
        <div>
          <ProductVisual product={{ ...p, photos: p.photos.slice(photo) }} />
          {p.photos.length > 1 && (
            <div className="mt-2 flex gap-2">
              {p.photos.map((u, i) => <button key={u} type="button" onClick={() => setPhoto(i)} className={clsx('size-12 overflow-hidden rounded-lg border', i === photo ? 'border-orange-500' : 'border-gray-200 dark:border-gray-700')}><img src={u} alt="" className="size-full object-cover" /></button>)}
            </div>
          )}
        </div>
        <div className="space-y-4 text-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400">{[p.brand, t(`categories.${p.category}`)].filter(Boolean).join(' · ')}</p>
            <p className="mt-2 font-display text-2xl font-semibold tabular-nums text-gray-900 dark:text-gray-50">{money(p.price)} <span className="text-sm font-normal text-gray-500">{t('product.ttc_per', { unit: p.unit })}</span></p>
          </div>
          {p.description && <p className="whitespace-pre-line text-gray-700 dark:text-gray-300">{p.description}</p>}
          <dl className="divide-y divide-gray-100 rounded-xl border border-gray-100 dark:divide-gray-800 dark:border-gray-800">
            {[
              [t('product.supplier'), p.supplier?.companyName],
              [t('product.min_order'), p.minOrderQty],
              [t('product.stock'), p.stock > 0 ? p.stock : t('product.out_of_stock')],
              [t('product.lead_time'), t('product.days', { count: p.leadTimeDays })],
              [t('product.sku'), p.sku],
            ].filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => (
              <div key={String(k)} className="flex justify-between gap-4 px-3.5 py-2"><dt className="text-gray-500 dark:text-gray-400">{k}</dt><dd className="text-end font-medium text-gray-900 dark:text-gray-50">{v}</dd></div>
            ))}
          </dl>
          {p.deliverable === false && <Notice>{t('product.not_delivered_body')}</Notice>}
          {available && (
            <div className="flex flex-wrap items-center gap-3">
              <Qty value={qty} min={p.minOrderQty} onChange={setQty} label={t('cart.qty')} />
              <button type="button" className="btn-primary" disabled={qty > p.stock} onClick={() => { onAdd(qty); onClose(); }}>
                <ShoppingCartIcon className="size-4" />{t('product.add_to_cart', { amount: money(qty * p.price) })}
              </button>
              {qty > p.stock && <p className="w-full text-xs text-red-600 dark:text-red-400">{t('product.max_stock', { count: p.stock })}</p>}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

function SupplierTile({ s, onOpen }: { s: SupplierCard; onOpen: () => void }) {
  const { t } = useTranslation('marketplace');
  const zones = useZonesLabel();
  return (
    <li>
      <button type="button" onClick={onOpen} className="flex h-full w-full flex-col rounded-2xl border border-gray-200 bg-white p-5 text-start transition-colors duration-150 hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700">
        <span className="grid size-11 place-items-center rounded-full bg-gray-100 font-display text-base font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-200">{s.companyName.slice(0, 1)}</span>
        <p className="mt-3 font-semibold text-gray-900 dark:text-gray-50">{s.companyName}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{[s.wilaya, t('supplier.products', { count: s.productCount || 0 })].filter(Boolean).join(' · ')}</p>
        {s.description && <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">{s.description}</p>}
        <div className="mt-3 flex flex-wrap gap-1.5">{(s.productCategories || s.categories).slice(0, 4).map((c) => <Badge key={c}>{t(`categories.${c}`)}</Badge>)}</div>
        <p className="mt-auto flex items-center gap-1.5 pt-4 text-xs text-gray-500 dark:text-gray-400"><TruckIcon className="size-4" />{t('supplier.ships_to', { zones: zones(s.shipping.zones, 2) })}</p>
      </button>
    </li>
  );
}

const deliveryRule = (t: (k: string, o?: any) => string, s: SupplierCard['shipping']) =>
  s.fee === 0 ? t('company.rule_free') : s.freeAbove > 0 ? t('company.rule_fee_free', { fee: money(s.fee), free: money(s.freeAbove) }) : t('company.rule_fee', { fee: money(s.fee) });

/* ── Checkout: ship-to + server-priced summary → SATIM ── */
function Checkout({ supplierId, ctx, onClose }: { supplierId: string; ctx: MarketContext; onClose: () => void }) {
  const { t, i18n } = useTranslation('marketplace');
  const cart = useCart((s) => s.carts[supplierId]);
  const clear = useCart((s) => s.clear);
  const [shipTo, setShipTo] = useState<ShipTo>(ctx.shipTo);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const items = useMemo(() => (cart?.lines || []).map((l) => ({ productId: l.productId, qty: l.qty })), [cart]);

  useEffect(() => {
    if (!shipTo.wilaya || !items.length) return;
    marketAPI.quote(supplierId, items, shipTo.wilaya).then((r) => setQuote(r.data)).catch(() => setError(t('common.load_error')));
  }, [supplierId, items, shipTo.wilaya, t]);

  const phoneOk = /^[\d +().-]{8,20}$/.test(shipTo.phone);
  const ready = quote?.valid && shipTo.name.trim() && shipTo.address.trim().length >= 5 && phoneOk && ctx.paymentsEnabled;

  const pay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready) return;
    setBusy(true);
    setError(null);
    try {
      const { data } = await marketAPI.checkout({ supplierId, items, shipTo, lang: i18n.language.slice(0, 2) });
      clear(supplierId); // the order now holds the lines; a failed payment is retried from "Mes commandes"
      window.location.assign(data.formUrl);
    } catch (err) {
      const code = errorCode(err);
      setError(code === 'CART_INVALID' ? t('checkout.cart_changed') : code === 'PAYMENT_UNAVAILABLE' ? t('checkout.payments_soon') : t('checkout.error'));
      if (code === 'CART_INVALID') marketAPI.quote(supplierId, items, shipTo.wilaya).then((r) => setQuote(r.data)).catch(() => undefined);
      setBusy(false);
    }
  };
  const input = (k: keyof ShipTo, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label htmlFor={`ship-${k}`} className={labelClass}>{label}</label>
      <input id={`ship-${k}`} value={shipTo[k] || ''} onChange={(e) => setShipTo({ ...shipTo, [k]: e.target.value })} className="field" {...props} />
    </div>
  );

  return (
    <Modal isOpen onClose={onClose} title={t('checkout.title', { supplier: cart?.supplier.companyName || '' })} size="xl">
      <form onSubmit={pay} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50">{t('checkout.ship_to')}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {input('name', t('checkout.name'), { required: true, maxLength: 120 })}
            {input('contact', t('checkout.contact'), { maxLength: 120 })}
            {input('phone', t('checkout.phone'), { required: true, type: 'tel', maxLength: 20, 'aria-invalid': !!shipTo.phone && !phoneOk })}
            <div>
              <label htmlFor="ship-wilaya" className={labelClass}>{t('checkout.wilaya')}</label>
              <select id="ship-wilaya" required value={shipTo.wilaya} onChange={(e) => setShipTo({ ...shipTo, wilaya: e.target.value })} className="field">
                <option value="" disabled>{t('checkout.choose_wilaya')}</option>
                {ctx.wilayas.map((w, i) => <option key={w} value={w}>{`${String(i + 1).padStart(2, '0')} · ${w}`}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">{input('address', t('checkout.address'), { required: true, minLength: 5, maxLength: 300 })}</div>
          </div>
          <Notice tone="blue">{t('checkout.escrow')}</Notice>
        </div>
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50">{t('checkout.summary')}</h3>
          {!quote ? <Spinner /> : (
            <>
              <ul className="divide-y divide-gray-100 text-sm dark:divide-gray-800">
                {quote.lines.map((l) => (
                  <li key={l.productId} className="flex justify-between gap-3 py-2">
                    <span className="min-w-0"><span className="block truncate text-gray-900 dark:text-gray-50">{l.qty} × {l.product?.name || '—'}</span>
                      {l.problem && <span className="text-xs text-red-600 dark:text-red-400">{t(`problem.${l.problem}`, { min: l.product?.minOrderQty, stock: l.product?.stock })}</span>}</span>
                    <span className="shrink-0 tabular-nums">{l.product ? money(l.product.price * l.qty) : ''}</span>
                  </li>
                ))}
              </ul>
              <dl className="space-y-1 border-t border-gray-100 pt-2 text-sm tabular-nums dark:border-gray-800">
                <div className="flex justify-between"><dt className="text-gray-500 dark:text-gray-400">{t('order.subtotal')}</dt><dd>{money(quote.totals.subtotal)}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500 dark:text-gray-400">{t('order.delivery')}</dt><dd>{quote.totals.deliveryFee ? money(quote.totals.deliveryFee) : t('order.free')}</dd></div>
                <div className="flex justify-between text-base font-semibold text-gray-900 dark:text-gray-50"><dt>{t('order.total')}</dt><dd>{money(quote.totals.total)}</dd></div>
              </dl>
              {!quote.valid && <Notice tone="red">{t('checkout.fix_cart')}</Notice>}
            </>
          )}
          {!ctx.paymentsEnabled && <Notice>{t('checkout.payments_soon')}</Notice>}
          {error && <p className="text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={!ready || busy}>
            {busy && <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
            {ctx.paymentsEnabled ? t('checkout.pay', { amount: quote ? money(quote.totals.total) : '' }) : t('checkout.pay_soon')}
          </button>
          <p className="text-center text-xs text-gray-500 dark:text-gray-400">{t('checkout.cards')}</p>
        </div>
      </form>
    </Modal>
  );
}

function CartView({ ctx, onBrowse }: { ctx: MarketContext; onBrowse: () => void }) {
  const { t } = useTranslation('marketplace');
  const { carts, setQty, remove } = useCart();
  const [checkout, setCheckout] = useState<string | null>(null);
  const list = Object.values(carts);
  if (!list.length) {
    return <Panel><EmptyState icon={ShoppingCartIcon} title={t('cart.empty')} body={t('cart.empty_body')} action={<button type="button" className="btn-primary" onClick={onBrowse}>{t('cart.browse')}</button>} /></Panel>;
  }
  return (
    <div className="space-y-6">
      {list.length > 1 && <p className="text-sm text-gray-500 dark:text-gray-400">{t('cart.one_order_per_supplier')}</p>}
      {list.map((c) => {
        const subtotal = c.lines.reduce((s, l) => s + l.qty * l.product.price, 0);
        return (
          <Panel key={c.supplier.id} flush title={c.supplier.companyName} description={t('cart.lines', { count: c.lines.length })}>
            <ul className="divide-y divide-gray-100 border-t border-gray-100 dark:divide-gray-800 dark:border-gray-800">
              {c.lines.map((l) => (
                <li key={l.productId} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-5">
                  <ProductVisual product={l.product} compact className="!size-14 shrink-0" />
                  <div className="min-w-0 flex-1 basis-40">
                    <p className="truncate font-medium text-gray-900 dark:text-gray-50">{l.product.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{l.product.unit} · {money(l.product.price)}</p>
                    {l.qty < l.product.minOrderQty && <p className="text-xs text-red-600 dark:text-red-400">{t('problem.MIN_QTY', { min: l.product.minOrderQty })}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <Qty value={l.qty} min={l.product.minOrderQty} onChange={(n) => setQty(c.supplier.id, l.productId, n)} label={t('cart.qty_of', { name: l.product.name })} />
                    <span className="w-24 text-end font-medium tabular-nums text-gray-900 dark:text-gray-50">{money(l.qty * l.product.price)}</span>
                    <IconButton label={t('cart.remove')} tone="danger" onClick={() => remove(c.supplier.id, l.productId)}><TrashIcon className="size-[18px]" /></IconButton>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('cart.subtotal_hint', { amount: money(subtotal) })}</p>
              <button type="button" className="btn-primary" onClick={() => setCheckout(c.supplier.id)}>{t('cart.order_from', { supplier: c.supplier.companyName })}</button>
            </div>
          </Panel>
        );
      })}
      {checkout && <Checkout supplierId={checkout} ctx={ctx} onClose={() => setCheckout(null)} />}
    </div>
  );
}

/** Products page → "Fournisseurs": browse approved suppliers delivering to the salon, cart per supplier, orders. */
const SuppliersTab: React.FC = () => {
  const { t } = useTranslation('marketplace');
  const userId = useAuthStore((s) => s.user?.id);
  const [params, setParams] = useSearchParams();
  const view = (params.get('view') as View) || (params.get('order') ? 'orders' : 'catalogue');
  const q = params.get('q') || '';
  const category = params.get('category') || '';
  const slug = params.get('supplier') || '';
  const orderId = params.get('order') || '';
  const { carts, add, bindTo } = useCart();
  const cartCount = Object.values(carts).reduce((n, c) => n + c.lines.length, 0);

  const [ctx, setCtx] = useState<MarketContext | null>(null);
  const [wilaya, setWilaya] = useState('');
  const [search, setSearch] = useState(q);
  const [suppliers, setSuppliers] = useState<SupplierCard[] | null>(null);
  const [results, setResults] = useState<{ total: number; items: MarketProduct[]; page: number; pageSize: number } | null>(null);
  const [store, setStore] = useState<{ supplier: SupplierCard; products: MarketProduct[] } | null>(null);
  const [open, setOpen] = useState<MarketProduct | null>(null);
  const [added, setAdded] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => { if (userId) bindTo(userId); }, [userId, bindTo]);
  useEffect(() => {
    marketAPI.context().then((r) => { setCtx(r.data); setWilaya(r.data.wilaya); }).catch(() => setError(true));
  }, []);
  useEffect(() => setSearch(q), [q]);

  const go = useCallback((next: Record<string, string | null>) => {
    const p = new URLSearchParams(params);
    p.set('tab', 'suppliers');
    for (const [k, v] of Object.entries(next)) { if (v) p.set(k, v); else p.delete(k); }
    setParams(p);
  }, [params, setParams]);

  // Data for the catalogue view
  useEffect(() => {
    if (!ctx || view !== 'catalogue') return;
    if (slug) {
      setStore(null);
      marketAPI.supplier(slug, wilaya || undefined).then((r) => setStore(r.data)).catch(() => setError(true));
    } else if (q || category) {
      setResults(null);
      marketAPI.products({ q, category: category || undefined, wilaya: wilaya || undefined, page }).then((r) => setResults(r.data)).catch(() => setError(true));
    } else {
      setSuppliers(null);
      marketAPI.suppliers({ wilaya: wilaya || undefined }).then((r) => setSuppliers(r.data.suppliers)).catch(() => setError(true));
    }
  }, [ctx, view, slug, q, category, wilaya, page]);

  const addToCart = (p: MarketProduct, qty: number) => {
    add(p, qty);
    setAdded(p.name);
    window.setTimeout(() => setAdded((a) => (a === p.name ? null : a)), 2500);
  };

  if (error && !ctx) return <Notice tone="red">{t('common.load_error')}</Notice>;
  if (!ctx) return <Spinner />;

  const storeCats = store ? CATEGORIES.filter((c) => store.products.some((p) => p.category === c)) : [];
  const storeProducts = store ? store.products.filter((p) => !category || p.category === category) : [];

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Segmented value={view} onChange={(v) => go({ view: v === 'catalogue' ? null : v, order: null })}
          options={[
            { value: 'catalogue', label: t('tabs.catalogue') },
            { value: 'cart', label: cartCount ? t('tabs.cart_count', { count: cartCount }) : t('tabs.cart') },
            { value: 'orders', label: t('tabs.orders') },
          ]} />
        {view === 'catalogue' && (
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <TruckIcon className="size-4 text-gray-400" />
            <span className="whitespace-nowrap">{t('browse.deliver_to')}</span>
            <select value={wilaya} onChange={(e) => setWilaya(e.target.value)} className="field !w-auto">
              <option value="">{t('browse.all_wilayas')}</option>
              {ctx.wilayas.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
          </label>
        )}
      </div>

      {added && <div className="fixed inset-x-4 bottom-24 z-50 mx-auto max-w-sm md:bottom-6"><Notice tone="green">{t('cart.added', { name: added })} <button type="button" className="ms-1 font-medium underline" onClick={() => go({ view: 'cart', supplier: null })}>{t('cart.see')}</button></Notice></div>}

      {view === 'cart' && <CartView ctx={ctx} onBrowse={() => go({ view: null })} />}
      {view === 'orders' && (orderId ? <SalonOrderDetail id={orderId} onBack={() => go({ order: null })} /> : <SalonOrders onOpen={(id) => go({ order: id })} />)}

      {view === 'catalogue' && (
        <>
          {!ctx.paymentsEnabled && <div className="mb-4"><Notice>{t('browse.payments_soon')}</Notice></div>}
          {!slug && (
            <form className="mb-4 flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); setPage(1); go({ q: search.trim() || null }); }}>
              <div className="relative">
                <MagnifyingGlassIcon className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('browse.search')} aria-label={t('browse.search')} className="field ps-9 sm:max-w-xl" />
              </div>
              <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 scrollbar-hide sm:flex-wrap">
                {['', ...CATEGORIES].map((c) => (
                  <button key={c || 'all'} type="button" aria-pressed={category === c} onClick={() => { setPage(1); go({ category: c || null }); }}
                    className={clsx('shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors duration-150', category === c ? 'border-gray-900 bg-gray-900 text-white dark:border-gray-50 dark:bg-gray-50 dark:text-gray-900' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300')}>
                    {c ? t(`categories.${c}`) : t('categories.all')}
                  </button>
                ))}
              </div>
            </form>
          )}

          {slug ? (
            !store ? <Spinner /> : (
              <div>
                <button type="button" onClick={() => go({ supplier: null, category: null })} className="btn-ghost mb-3 -ms-2"><ArrowLeftIcon className="size-4 rtl:-scale-x-100" />{t('supplier.back')}</button>
                <Panel className="mb-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h2 className="font-display text-xl font-semibold text-gray-900 dark:text-gray-50">{store.supplier.companyName}</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{[store.supplier.wilaya, t('supplier.products', { count: store.products.length })].join(' · ')}</p>
                      {store.supplier.description && <p className="mt-2 max-w-2xl text-sm text-gray-700 dark:text-gray-300">{store.supplier.description}</p>}
                    </div>
                    <div className="shrink-0 space-y-1 text-sm text-gray-600 dark:text-gray-300 sm:text-end">
                      <p>{deliveryRule(t, store.supplier.shipping)}</p>
                      <p>{t('supplier.lead_time', { count: store.supplier.shipping.leadTimeDays })}</p>
                      {store.supplier.deliverable === false && <Badge tone="amber">{t('supplier.not_your_wilaya')}</Badge>}
                    </div>
                  </div>
                </Panel>
                {storeCats.length > 1 && (
                  <div className="-mx-1 mb-4 flex gap-1.5 overflow-x-auto px-1 pb-1 scrollbar-hide">
                    {['', ...storeCats].map((c) => (
                      <button key={c || 'all'} type="button" aria-pressed={category === c} onClick={() => go({ category: c || null })}
                        className={clsx('shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium', category === c ? 'border-gray-900 bg-gray-900 text-white dark:border-gray-50 dark:bg-gray-50 dark:text-gray-900' : 'border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300')}>
                        {c ? t(`categories.${c as Category}`) : t('categories.all')}
                      </button>
                    ))}
                  </div>
                )}
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {storeProducts.map((p) => <ProductCard key={p.id} p={p} showSupplier={false} onOpen={() => setOpen(p)} onAdd={(n) => addToCart(p, n)} />)}
                </ul>
              </div>
            )
          ) : q || category ? (
            !results ? <Spinner /> : results.items.length === 0 ? (
              <Panel><EmptyState icon={MagnifyingGlassIcon} title={t('browse.no_results')} body={t('browse.no_results_body')} /></Panel>
            ) : (
              <>
                <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">{t('browse.results', { count: results.total })}</p>
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {results.items.map((p) => <ProductCard key={p.id} p={p} onOpen={() => setOpen(p)} onAdd={(n) => addToCart(p, n)} />)}
                </ul>
                {results.total > results.pageSize && (
                  <div className="mt-4 flex justify-center gap-2">
                    <button type="button" className="btn-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>{t('common.previous')}</button>
                    <button type="button" className="btn-secondary" disabled={page * results.pageSize >= results.total} onClick={() => setPage(page + 1)}>{t('common.next')}</button>
                  </div>
                )}
              </>
            )
          ) : !suppliers ? <Spinner /> : suppliers.length === 0 ? (
            <Panel><EmptyState icon={BuildingStorefrontIcon} title={t('browse.no_suppliers')} body={wilaya ? t('browse.no_suppliers_wilaya', { wilaya }) : t('browse.no_suppliers_body')} /></Panel>
          ) : (
            <>
              <h2 className="mb-3 text-base font-semibold text-gray-900 dark:text-gray-50">{wilaya ? t('browse.suppliers_for', { wilaya }) : t('browse.suppliers')}</h2>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {suppliers.map((s) => <SupplierTile key={s.id} s={s} onOpen={() => go({ supplier: s.slug, category: null, q: null })} />)}
              </ul>
              <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">{t('browse.how_it_works')}</p>
            </>
          )}
        </>
      )}
      {open && <ProductModal p={open} onClose={() => setOpen(null)} onAdd={(n) => addToCart(open, n)} />}
    </div>
  );
};

export default SuppliersTab;
