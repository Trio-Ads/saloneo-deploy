import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeftIcon, CheckCircleIcon, ClipboardDocumentListIcon, ExclamationTriangleIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import Modal from '../../../components/Modal';
import { EmptyState, Panel, Segmented } from '../../../components/ui';
import { useServiceStore } from '../../services/store';
import { Order, OrderPage, marketAPI } from '../api';
import { Facts, MessageThread, Notice, OrderLines, OrderStatusBadge, Spinner, Timeline, labelClass, money, useDates } from '../shared';

type Filter = 'open' | 'done' | 'unpaid' | 'all';

export const SalonOrders: React.FC<{ onOpen: (id: string) => void }> = ({ onOpen }) => {
  const { t } = useTranslation('marketplace');
  const { day } = useDates();
  const [filter, setFilter] = useState<Filter>('all');
  const [data, setData] = useState<OrderPage | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(false);
  useEffect(() => {
    setData(null);
    marketAPI.orders({ status: filter === 'all' ? undefined : filter, page }).then((r) => setData(r.data)).catch(() => setError(true));
  }, [filter, page]);

  return (
    <div>
      <Segmented className="mb-4" value={filter} onChange={(v) => { setFilter(v); setPage(1); }}
        options={(['all', 'open', 'done', 'unpaid'] as Filter[]).map((v) => ({ value: v, label: t(`orders.filter.${v}`) }))} />
      {error && <Notice tone="red">{t('common.load_error')}</Notice>}
      {!data && !error && <Spinner />}
      {data && (data.orders.length === 0 ? (
        <Panel><EmptyState icon={ClipboardDocumentListIcon} title={t('orders.empty')} body={t('orders.empty_salon_body')} /></Panel>
      ) : (
        <Panel flush>
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {data.orders.map((o) => (
              <li key={o.id}>
                <button type="button" onClick={() => onOpen(o.id)} className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 text-start hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <div className="min-w-0 flex-1 basis-56">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-gray-900 dark:text-gray-50">{o.supplierName}</p>
                      <OrderStatusBadge status={o.status} />
                    </div>
                    <p className="truncate text-sm text-gray-500 dark:text-gray-400">{[o.number, day(o.createdAt), o.firstItems.join(', ') + (o.lines > 3 ? '…' : '')].join(' · ')}</p>
                  </div>
                  <span className="font-display font-semibold tabular-nums text-gray-900 dark:text-gray-50">{money(o.total)}</span>
                </button>
              </li>
            ))}
          </ul>
          {data.total > data.pageSize && (
            <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-3 dark:border-gray-800">
              <button type="button" className="btn-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>{t('common.previous')}</button>
              <button type="button" className="btn-secondary" disabled={page * data.pageSize >= data.total} onClick={() => setPage(page + 1)}>{t('common.next')}</button>
            </div>
          )}
        </Panel>
      ))}
    </div>
  );
};

type StockLine = { index: number; mode: 'skip' | 'existing' | 'new'; productId: string; name: string; unit: string; qty: string };

/** After delivery: add the received goods to the salon's stock (choice remembered for the next orders). */
function AddToStock({ order, suggestions, onClose, onDone }: {
  order: Order; suggestions: Record<string, { productId: string; perUnit: number }>; onClose: () => void; onDone: (o: Order) => void;
}) {
  const { t } = useTranslation(['marketplace', 'services']);
  const { products, fetchProducts } = useServiceStore();
  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  const [lines, setLines] = useState<StockLine[]>(() => order.items.map((it, index) => {
    const s = suggestions[it.productId];
    return { index, mode: s ? 'existing' : 'new', productId: s?.productId || '', name: it.name.slice(0, 100), unit: 'unité', qty: String(s ? Math.round(it.qty * s.perUnit * 100) / 100 : it.qty) };
  }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (i: number, patch: Partial<StockLine>) => setLines((ls) => ls.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  const valid = lines.some((l) => l.mode !== 'skip') && lines.every((l) => l.mode === 'skip' || (Number(l.qty) > 0 && (l.mode === 'new' ? l.name.trim() : l.productId)));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { data } = await marketAPI.addToStock(order.id, lines.filter((l) => l.mode !== 'skip').map((l) => ({
        index: l.index, qty: Number(l.qty), ...(l.mode === 'existing' ? { productId: l.productId } : { create: { name: l.name.trim(), unit: l.unit } }),
      })));
      fetchProducts();
      onDone(data.order);
    } catch (err: any) {
      setError(err?.response?.data?.error || t('common.action_error'));
      setBusy(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={t('stock.title')} size="lg">
      <form onSubmit={submit} className="space-y-5">
        <p className="text-sm text-gray-600 dark:text-gray-300">{t('stock.intro')}</p>
        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          {order.items.map((it, i) => {
            const l = lines[i];
            return (
              <li key={i} className="space-y-3 py-4">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-50">{it.qty} × {it.name} <span className="font-normal text-gray-500">· {it.unit}</span></p>
                <div className="grid gap-3 sm:grid-cols-[12rem_minmax(0,1fr)_8rem]">
                  <select aria-label={t('stock.action')} value={l.mode} onChange={(e) => set(i, { mode: e.target.value as StockLine['mode'] })} className="field">
                    <option value="existing" disabled={!products.length}>{t('stock.existing')}</option>
                    <option value="new">{t('stock.new')}</option>
                    <option value="skip">{t('stock.skip')}</option>
                  </select>
                  {l.mode === 'existing' && (
                    <select aria-label={t('stock.product')} value={l.productId} onChange={(e) => set(i, { productId: e.target.value })} className="field">
                      <option value="" disabled>{t('stock.choose')}</option>
                      {products.filter((p) => p.isActive).map((p) => <option key={p.id} value={p.id}>{p.name} ({p.quantity} {t(`services:product_form.unit_values.${p.unit}`, { count: p.quantity, defaultValue: p.unit })})</option>)}
                    </select>
                  )}
                  {l.mode === 'new' && (
                    <div className="grid grid-cols-[minmax(0,1fr)_6.5rem] gap-2">
                      <input aria-label={t('stock.new_name')} value={l.name} maxLength={100} onChange={(e) => set(i, { name: e.target.value })} className="field" />
                      <select aria-label={t('stock.unit')} value={l.unit} onChange={(e) => set(i, { unit: e.target.value })} className="field">
                        {['unité', 'ml', 'l', 'g', 'kg'].map((u) => <option key={u} value={u}>{t(`services:product_form.unit_values.${u}`, { count: 2, defaultValue: u })}</option>)}
                      </select>
                    </div>
                  )}
                  {l.mode === 'skip' && <span className="self-center text-sm text-gray-500 dark:text-gray-400">{t('stock.skipped')}</span>}
                  {l.mode !== 'skip' && (
                    <div>
                      <label htmlFor={`stock-qty-${i}`} className="sr-only">{t('stock.qty')}</label>
                      <input id={`stock-qty-${i}`} type="number" min={0} step="any" inputMode="decimal" value={l.qty} onChange={(e) => set(i, { qty: e.target.value })} className="field tabular-nums" />
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        <p className="text-xs text-gray-500 dark:text-gray-400">{t('stock.qty_help')}</p>
        {error && <p className="text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" className="btn-secondary" onClick={onClose}>{t('common.cancel')}</button>
          <button type="submit" className="btn-primary" disabled={!valid || busy}>{t('stock.submit')}</button>
        </div>
      </form>
    </Modal>
  );
}

export const SalonOrderDetail: React.FC<{ id: string; onBack: () => void }> = ({ id, onBack }) => {
  const { t, i18n } = useTranslation('marketplace');
  const { day, dayTime } = useDates();
  const [order, setOrder] = useState<Order | null>(null);
  const [suggestions, setSuggestions] = useState<Record<string, { productId: string; perUnit: number }>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dialog, setDialog] = useState<'dispute' | 'stock' | null>(null);
  const [reason, setReason] = useState('');

  const apply = (d: { order: Order; stockSuggestions: Record<string, { productId: string; perUnit: number }> }) => { setOrder(d.order); setSuggestions(d.stockSuggestions || {}); };
  const load = useCallback(() => marketAPI.order(id).then((r) => apply(r.data)).catch(() => setError(t('common.load_error'))), [id, t]);
  useEffect(() => { load(); }, [load]);

  const act = async (fn: () => Promise<{ data: any }>, confirm?: string) => {
    if (confirm && !window.confirm(confirm)) return;
    setBusy(true);
    setError(null);
    try {
      apply((await fn()).data);
      setDialog(null);
    } catch (e: any) {
      setError(e?.response?.data?.error || t('common.action_error'));
    } finally {
      setBusy(false);
    }
  };
  const retry = async () => {
    setBusy(true);
    try {
      window.location.assign((await marketAPI.retry(id, i18n.language.slice(0, 2))).data.formUrl);
    } catch (e: any) {
      setError(e?.response?.data?.error || t('common.action_error'));
      setBusy(false);
    }
  };

  if (!order) return error ? <Notice tone="red">{error}</Notice> : <Spinner />;
  const s = order.status;
  const received = ['delivered', 'released', 'partially_refunded'].includes(s);

  return (
    <div>
      <button type="button" onClick={onBack} className="btn-ghost mb-2 -ms-2"><ArrowLeftIcon className="size-4 rtl:-scale-x-100" />{t('orders.back')}</button>
      <div className="mb-5 flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-end sm:justify-between dark:border-gray-800">
        <div>
          <h2 className="font-display text-xl font-semibold text-gray-900 dark:text-gray-50">{t('order.title', { number: order.number })}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 dark:text-gray-400"><OrderStatusBadge status={s} /><span>{order.supplierName}</span><span>{dayTime(order.createdAt)}</span></div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap [&>*:only-child]:col-span-2">
          {s === 'pending_payment' && <>
            <button type="button" className="btn-secondary" disabled={busy} onClick={() => act(() => marketAPI.cancel(id), t('order.abandon_confirm'))}>{t('order.abandon')}</button>
            {order.canRetry && <button type="button" className="btn-primary" disabled={busy} onClick={retry}>{t('order.pay_now', { amount: money(order.total) })}</button>}
          </>}
          {s === 'paid' && <button type="button" className="btn-secondary" disabled={busy} onClick={() => act(() => marketAPI.cancel(id), t('order.cancel_confirm', { amount: money(order.total) }))}>{t('order.cancel')}</button>}
          {(s === 'accepted' || s === 'shipped') && <>
            <button type="button" className="btn-secondary" disabled={busy} onClick={() => setDialog('dispute')}><ExclamationTriangleIcon className="size-4" />{t('order.report')}</button>
            <button type="button" className="btn-primary" disabled={busy} onClick={() => act(() => marketAPI.received(id), t('order.received_confirm', { supplier: order.supplierName }))}><CheckCircleIcon className="size-4" />{t('order.received')}</button>
          </>}
          {received && !order.stockAddedAt && <button type="button" className="btn-primary" onClick={() => setDialog('stock')}><PlusCircleIcon className="size-4" />{t('order.add_to_stock')}</button>}
        </div>
      </div>
      {error && <div className="mb-4"><Notice tone="red">{error}</Notice></div>}
      <div className="mb-6 space-y-3">
        {s === 'pending_payment' && (order.message ? <Notice tone="red">{t('order.payment_failed', { message: order.message })}</Notice> : <Notice>{t('order.pending_payment', { date: dayTime(order.deadlines.payment) })}</Notice>)}
        {s === 'paid' && <Notice tone="blue">{t('order.paid_salon', { supplier: order.supplierName, date: day(order.deadlines.ship) })}</Notice>}
        {s === 'accepted' && <Notice tone="blue">{t('order.accepted_salon', { date: day(order.deadlines.ship) })}</Notice>}
        {s === 'shipped' && <Notice tone="blue">{t('order.shipped_salon', { date: day(order.deadlines.autoRelease) })}</Notice>}
        {s === 'disputed' && <Notice tone="red"><p className="font-medium">{t('order.disputed_title')}</p><p className="mt-0.5">{order.dispute?.reason}</p><p className="mt-1">{t('order.disputed_salon')}</p></Notice>}
        {s === 'refund_pending' && <Notice tone="amber">{t('order.refund_pending')}</Notice>}
        {s === 'refunded' && <Notice tone="green">{t('order.refunded_salon', { amount: money(order.refundAmount || order.total) })}</Notice>}
        {s === 'partially_refunded' && <Notice tone="green">{t('order.partial_salon', { amount: money(order.refundAmount) })}</Notice>}
        {order.dispute?.resolution && <Notice tone="gray">{t('order.resolution', { text: order.dispute.resolution })}</Notice>}
        {order.stockAddedAt && <Notice tone="green">{t('order.stock_added', { date: day(order.stockAddedAt) })}</Notice>}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <Panel title={t('order.items')}><OrderLines order={order} side="salon" /></Panel>
          {!['pending_payment', 'cancelled', 'expired'].includes(s) && (
            <Panel title={t('messages.title')} description={t('messages.salon_hint', { supplier: order.supplierName })}>
              <MessageThread messages={order.messages} me="salon" onSend={async (body) => { await marketAPI.message(id, body); await load(); }} />
            </Panel>
          )}
        </div>
        <div className="space-y-6">
          {order.shipment?.shippedAt && (
            <Panel title={t('order.shipment')}>
              <Facts rows={[[t('order.carrier'), order.shipment.carrier || '—'], [t('order.tracking'), order.shipment.tracking || '—'], [t('order.shipped_on'), dayTime(order.shipment.shippedAt)]]} />
            </Panel>
          )}
          <Panel title={t('order.payment')}>
            <Facts rows={[
              [t('order.paid_on'), order.paidAt ? dayTime(order.paidAt) : t('order.not_paid')],
              [t('order.card'), order.cardLast4 ? `•••• ${order.cardLast4}` : ''],
              [t('order.transaction'), order.orderNumber],
              [t('order.approval'), order.approvalCode],
            ]} />
          </Panel>
          <Panel title={t('order.ship_to')}>
            <Facts rows={[[t('checkout.name'), order.shipTo.name], [t('checkout.phone'), order.shipTo.phone], [t('checkout.address'), `${order.shipTo.address}, ${order.shipTo.wilaya}`]]} />
          </Panel>
          <Panel title={t('order.history')}><Timeline events={order.events} /></Panel>
        </div>
      </div>

      {dialog === 'dispute' && (
        <Modal isOpen onClose={() => setDialog(null)} title={t('order.report_title')} size="sm">
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); act(() => marketAPI.dispute(id, reason)); }}>
            <p className="text-sm text-gray-600 dark:text-gray-300">{t('order.report_body')}</p>
            <div>
              <label htmlFor="dispute" className={labelClass}>{t('order.report_reason')}</label>
              <textarea id="dispute" required minLength={5} maxLength={1000} rows={4} value={reason} onChange={(e) => setReason(e.target.value)} className="field" placeholder={t('order.report_placeholder')} />
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" className="btn-secondary" onClick={() => setDialog(null)}>{t('common.cancel')}</button>
              <button type="submit" className="btn-primary" disabled={busy || reason.trim().length < 5}>{t('order.report_submit')}</button>
            </div>
          </form>
        </Modal>
      )}
      {dialog === 'stock' && <AddToStock order={order} suggestions={suggestions} onClose={() => setDialog(null)} onDone={(o) => { setOrder(o); setDialog(null); }} />}
    </div>
  );
};
