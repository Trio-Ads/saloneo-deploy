// Pieces shared by the supplier space, the salon "Fournisseurs" tab and Admin → Marketplace.
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import clsx from 'clsx';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { Badge, BadgeTone } from '../../components/ui';
import { formatPrice } from '../../utils/currency';
import { dateLocale } from '../dashboard/dateLocale';
import { ALL_ZONES, Category, Order, OrderEvent, OrderMessage, OrderStatus } from './api';

export const money = (n: number) => formatPrice(Math.round(n || 0), 'DZD');
export const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300';

export function useDates() {
  const { i18n } = useTranslation();
  const locale = dateLocale(i18n.language);
  return {
    day: (d?: string | Date) => (d ? format(new Date(d), 'd MMM yyyy', { locale }) : ''),
    dayTime: (d?: string | Date) => (d ? format(new Date(d), 'd MMM yyyy, HH:mm', { locale }) : ''),
  };
}

const tones: Record<OrderStatus, BadgeTone> = {
  pending_payment: 'neutral', paid: 'orange', accepted: 'blue', shipped: 'blue', delivered: 'green', released: 'green',
  disputed: 'red', refund_pending: 'amber', refunded: 'neutral', partially_refunded: 'amber', cancelled: 'neutral', expired: 'neutral',
};
export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { t } = useTranslation('marketplace');
  return <Badge tone={tones[status]}>{t(`status.${status}`)}</Badge>;
}

/* Product art: the supplier's photo, else a typographic card (no fake packshots, no brand logos). */
const tints: Record<Category, string> = {
  coloration: 'bg-rose-50 text-rose-900 dark:bg-rose-500/10 dark:text-rose-100',
  hair_care: 'bg-amber-50 text-amber-950 dark:bg-amber-500/10 dark:text-amber-100',
  styling: 'bg-sky-50 text-sky-950 dark:bg-sky-500/10 dark:text-sky-100',
  nails: 'bg-pink-50 text-pink-950 dark:bg-pink-500/10 dark:text-pink-100',
  lashes_brows: 'bg-violet-50 text-violet-950 dark:bg-violet-500/10 dark:text-violet-100',
  face_care: 'bg-emerald-50 text-emerald-950 dark:bg-emerald-500/10 dark:text-emerald-100',
  body_care: 'bg-orange-50 text-orange-950 dark:bg-orange-500/10 dark:text-orange-100',
  waxing: 'bg-yellow-50 text-yellow-950 dark:bg-yellow-500/10 dark:text-yellow-100',
  hygiene: 'bg-cyan-50 text-cyan-950 dark:bg-cyan-500/10 dark:text-cyan-100',
  equipment: 'bg-stone-100 text-stone-900 dark:bg-stone-500/15 dark:text-stone-100',
  spa: 'bg-teal-50 text-teal-950 dark:bg-teal-500/10 dark:text-teal-100',
};

export function ProductVisual({ product, className, compact }: {
  product: { name: string; brand?: string; unit?: string; category: Category; photos?: string[] };
  className?: string;
  compact?: boolean;
}) {
  const photo = product.photos?.[0];
  if (photo) {
    return <img src={photo} alt="" loading="lazy" className={clsx('aspect-square w-full rounded-xl bg-gray-100 object-cover dark:bg-gray-800', className)} />;
  }
  const tint = tints[product.category] || tints.equipment;
  if (compact) {
    // Thumbnails: brand (or product) initials — a name does not fit in 56 px
    const initials = (product.brand || product.name).split(/[\s’'-]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
    return <div aria-hidden="true" className={clsx('grid aspect-square w-full place-items-center rounded-xl font-display text-base font-semibold', tint, className)}>{initials}</div>;
  }
  return (
    <div aria-hidden="true" className={clsx('flex aspect-square w-full flex-col justify-between overflow-hidden rounded-xl p-3', tint, className)}>
      <span className="truncate text-[11px] font-semibold opacity-70">{product.brand || ''}</span>
      <span className="line-clamp-4 font-display text-[15px] font-semibold leading-tight">{product.name}</span>
      <span className="truncate text-[11px] opacity-70">{product.unit}</span>
    </div>
  );
}

/** Zones as words: "Toute l'Algérie" or "Alger, Blida +3". */
export function useZonesLabel() {
  const { t } = useTranslation('marketplace');
  return (zones: string[] = [], max = 3) => {
    if (zones.includes(ALL_ZONES)) return t('zones.all');
    if (!zones.length) return t('zones.none');
    return zones.length > max ? `${zones.slice(0, max).join(', ')} +${zones.length - max}` : zones.join(', ');
  };
}

/** Lines + totals. Supplier/admin also see the Saloneo commission and their net. */
export function OrderLines({ order, side }: { order: Order; side: 'salon' | 'supplier' | 'admin' }) {
  const { t } = useTranslation('marketplace');
  const row = 'flex justify-between gap-4 py-1.5';
  return (
    <div>
      <ul className="divide-y divide-gray-100 dark:divide-gray-800">
        {order.items.map((it, i) => (
          <li key={i} className="flex items-start gap-3 py-3">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900 dark:text-gray-50">{it.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{[it.brand, it.unit, it.sku].filter(Boolean).join(' · ')}</p>
            </div>
            <p className="shrink-0 text-end text-sm tabular-nums text-gray-500 dark:text-gray-400">
              {it.qty} × {money(it.price)}
              <span className="block font-medium text-gray-900 dark:text-gray-50">{money(it.total)}</span>
            </p>
          </li>
        ))}
      </ul>
      <dl className="mt-2 border-t border-gray-100 pt-2 text-sm tabular-nums dark:border-gray-800">
        <div className={row}><dt className="text-gray-500 dark:text-gray-400">{t('order.subtotal')}</dt><dd>{money(order.subtotal)}</dd></div>
        <div className={row}><dt className="text-gray-500 dark:text-gray-400">{t('order.delivery')}</dt><dd>{order.deliveryFee ? money(order.deliveryFee) : t('order.free')}</dd></div>
        <div className={clsx(row, 'font-semibold text-gray-900 dark:text-gray-50')}><dt>{t('order.total')}</dt><dd>{money(order.total)}</dd></div>
        {order.refundAmount > 0 && (
          <div className={clsx(row, 'text-red-700 dark:text-red-400')}><dt>{t('order.refunded')}</dt><dd>− {money(order.refundAmount)}</dd></div>
        )}
        {side !== 'salon' && order.commission !== undefined && (
          <>
            <div className={row}><dt className="text-gray-500 dark:text-gray-400">{t('order.commission', { percent: order.commissionPercent })}</dt><dd>− {money(order.commission)}</dd></div>
            <div className={clsx(row, 'font-semibold text-gray-900 dark:text-gray-50')}><dt>{t('order.net')}</dt><dd>{money(order.net || 0)}</dd></div>
          </>
        )}
      </dl>
    </div>
  );
}

/** Status timeline from the append-only events. Automatic notes (French audit text) are for admins only. */
export function Timeline({ events, all }: { events?: OrderEvent[]; all?: boolean }) {
  const { t } = useTranslation('marketplace');
  const { dayTime } = useDates();
  if (!events?.length) return null;
  return (
    <ol className="space-y-4">
      {events.map((e, i) => (
        <li key={i} className="relative flex gap-3">
          <span className={clsx('mt-1.5 size-2 shrink-0 rounded-full', i === events.length - 1 ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600')} />
          {i < events.length - 1 && <span className="absolute start-[3px] top-4 h-[calc(100%+0.25rem)] w-px bg-gray-200 dark:bg-gray-800" />}
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-50">{t(`event.${e.to}`)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{dayTime(e.at)} · {t(`actor.${e.actor}`)}</p>
            {e.note && (all || e.actor !== 'system') && <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-300">{e.note}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Simple thread on the order. `me` is the side reading it. */
export function MessageThread({ messages, me, onSend, disabled }: {
  messages: OrderMessage[];
  me: 'salon' | 'supplier' | 'admin';
  onSend: (body: string) => Promise<void>;
  disabled?: boolean;
}) {
  const { t } = useTranslation('marketplace');
  const { dayTime } = useDates();
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);
  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    setError(false);
    try {
      await onSend(body.trim());
      setBody('');
    } catch {
      setError(true);
    } finally {
      setSending(false);
    }
  };
  return (
    <div>
      {messages.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('messages.empty')}</p>
      ) : (
        <ul className="space-y-3">
          {messages.map((m, i) => (
            <li key={i} className={clsx('flex', m.from === me ? 'justify-end' : 'justify-start')}>
              <div className={clsx('max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm',
                m.from === me ? 'bg-orange-50 text-gray-900 dark:bg-orange-500/10 dark:text-gray-50' : m.from === 'admin' ? 'bg-blue-50 text-gray-900 dark:bg-blue-500/10 dark:text-gray-50' : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50')}>
                <p className="whitespace-pre-line break-words">{m.body}</p>
                <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">{t(`actor.${m.from}`)} · {dayTime(m.at)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
      {!disabled && (
        <form onSubmit={send} className="mt-4 flex items-end gap-2">
          <label className="sr-only" htmlFor="order-message">{t('messages.placeholder')}</label>
          <textarea id="order-message" rows={2} maxLength={2000} value={body} onChange={(e) => setBody(e.target.value)} className="field min-h-[2.75rem] flex-1 resize-y" placeholder={t('messages.placeholder')} />
          <button type="submit" className="btn-primary shrink-0" disabled={sending || !body.trim()} aria-label={t('messages.send')}>
            <PaperAirplaneIcon className="size-4 rtl:-scale-x-100" />
            <span className="hidden sm:inline">{t('messages.send')}</span>
          </button>
        </form>
      )}
      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">{t('messages.error')}</p>}
    </div>
  );
}

/** Label + value rows inside a panel. */
export function Facts({ rows }: { rows: [React.ReactNode, React.ReactNode][] }) {
  return (
    <dl className="divide-y divide-gray-100 text-sm dark:divide-gray-800">
      {rows.filter(([, v]) => v !== undefined && v !== null && v !== '').map(([k, v], i) => (
        <div key={i} className="flex justify-between gap-4 py-2">
          <dt className="text-gray-500 dark:text-gray-400">{k}</dt>
          <dd className="min-w-0 text-end font-medium text-gray-900 dark:text-gray-50 break-words">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Spinner() {
  return <div className="flex justify-center py-14"><span className="size-6 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" /></div>;
}

export function Notice({ tone = 'amber', children }: { tone?: 'amber' | 'red' | 'green' | 'blue' | 'gray'; children: React.ReactNode }) {
  const c = {
    amber: 'bg-amber-50 text-amber-900 dark:bg-amber-500/10 dark:text-amber-200',
    red: 'bg-red-50 text-red-800 dark:bg-red-500/10 dark:text-red-300',
    green: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300',
    blue: 'bg-blue-50 text-blue-900 dark:bg-blue-500/10 dark:text-blue-200',
    gray: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  }[tone];
  return <div role="status" className={clsx('rounded-xl px-4 py-3 text-sm', c)}>{children}</div>;
}

/** RIB/RIP check, same rule as the server (20 digits; CCP starts 00799999). */
export const ribError = (method: 'ccp' | 'bank', rib: string) =>
  !/^\d{20}$/.test(rib) ? 'rib_length' : method === 'ccp' && !rib.startsWith('00799999') ? 'rib_ccp' : null;

/** Download a blob response as a file. */
export function saveBlob(data: Blob, name: string) {
  const url = URL.createObjectURL(data);
  Object.assign(document.createElement('a'), { href: url, download: name }).click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
