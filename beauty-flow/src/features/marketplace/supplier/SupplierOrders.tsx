import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeftIcon, ClipboardDocumentListIcon, DocumentTextIcon, TruckIcon } from '@heroicons/react/24/outline';
import Modal from '../../../components/Modal';
import { EmptyState, PageHeader, Panel, Segmented } from '../../../components/ui';
import { Order, OrderPage, supplierAPI } from '../api';
import { Facts, MessageThread, Notice, OrderLines, OrderStatusBadge, Spinner, Timeline, labelClass, money, useDates } from '../shared';

type Filter = 'to_handle' | 'open' | 'done' | 'all';

export const SupplierOrders: React.FC = () => {
  const { t } = useTranslation('marketplace');
  const { day } = useDates();
  const [filter, setFilter] = useState<Filter>('to_handle');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<OrderPage | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    setData(null);
    supplierAPI.orders({ status: filter === 'all' ? undefined : filter, page }).then((r) => setData(r.data)).catch(() => setError(true));
  }, [filter, page]);

  return (
    <div className="py-6 sm:py-8">
      <PageHeader title={t('orders.title')} subtitle={t('orders.subtitle_supplier')} />
      <Segmented className="mb-4" value={filter} onChange={(v) => { setFilter(v); setPage(1); }}
        options={(['to_handle', 'open', 'done', 'all'] as Filter[]).map((v) => ({ value: v, label: t(`orders.filter.${v}`) }))} />
      {error && <Notice tone="red">{t('common.load_error')}</Notice>}
      {!data && !error && <Spinner />}
      {data && (data.orders.length === 0 ? (
        <Panel><EmptyState icon={ClipboardDocumentListIcon} title={t('orders.empty')} body={t('orders.empty_supplier_body')} /></Panel>
      ) : (
        <Panel flush>
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {data.orders.map((o) => (
              <li key={o.id}>
                <Link to={`/fournisseur/commandes/${o.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <div className="min-w-0 flex-1 basis-56">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-gray-900 dark:text-gray-50">{o.salonName}</p>
                      <OrderStatusBadge status={o.status} />
                    </div>
                    <p className="truncate text-sm text-gray-500 dark:text-gray-400">{[o.number, day(o.paidAt || o.createdAt), o.wilaya, o.firstItems.join(', ') + (o.lines > 3 ? '…' : '')].filter(Boolean).join(' · ')}</p>
                  </div>
                  <span className="font-display font-semibold tabular-nums text-gray-900 dark:text-gray-50">{money(o.total)}</span>
                </Link>
              </li>
            ))}
          </ul>
          {data.total > data.pageSize && (
            <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3 text-sm dark:border-gray-800">
              <span className="tabular-nums text-gray-500 dark:text-gray-400">{t('common.page', { page: data.page, pages: Math.ceil(data.total / data.pageSize) })}</span>
              <div className="flex gap-2">
                <button type="button" className="btn-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>{t('common.previous')}</button>
                <button type="button" className="btn-secondary" disabled={page * data.pageSize >= data.total} onClick={() => setPage(page + 1)}>{t('common.next')}</button>
              </div>
            </div>
          )}
        </Panel>
      ))}
    </div>
  );
};

/** One order: what to ship and where, actions by status, thread, timeline. */
export const SupplierOrderDetail: React.FC = () => {
  const { t } = useTranslation('marketplace');
  const { id } = useParams();
  const navigate = useNavigate();
  const { day, dayTime } = useDates();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dialog, setDialog] = useState<'ship' | 'refuse' | null>(null);
  const [form, setForm] = useState({ carrier: '', tracking: '', reason: '' });

  const load = useCallback(() => supplierAPI.order(id!).then((r) => setOrder(r.data.order)).catch(() => setError(t('common.load_error'))), [id, t]);
  useEffect(() => { load(); }, [load]);

  const act = async (fn: () => Promise<{ data: { order: Order } }>) => {
    setBusy(true);
    setError(null);
    try {
      setOrder((await fn()).data.order);
      setDialog(null);
    } catch (e: any) {
      setError(e?.response?.data?.error || t('common.action_error'));
    } finally {
      setBusy(false);
    }
  };

  if (!order) return <div className="py-8">{error ? <Notice tone="red">{error}</Notice> : <Spinner />}</div>;
  const s = order.status;
  const shipToPanel = (
    <Panel title={t('order.ship_to')}>
      <Facts rows={[
        [t('checkout.name'), order.shipTo.name],
        [t('checkout.contact'), order.shipTo.contact],
        [t('checkout.phone'), <a key="p" href={`tel:${order.shipTo.phone}`} className="text-orange-700 dark:text-orange-400">{order.shipTo.phone}</a>],
        [t('checkout.address'), order.shipTo.address],
        [t('checkout.wilaya'), order.shipTo.wilaya],
      ]} />
    </Panel>
  );

  return (
    <div className="py-6 sm:py-8">
      <button type="button" onClick={() => navigate('/fournisseur/commandes')} className="btn-ghost mb-2 -ms-2"><ArrowLeftIcon className="size-4 rtl:-scale-x-100" />{t('orders.back')}</button>
      <PageHeader
        title={t('order.title', { number: order.number })}
        meta={<><OrderStatusBadge status={s} /><span>{order.salonName}</span><span>{dayTime(order.paidAt || order.createdAt)}</span></>}
        actions={<div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto [&>*:only-child]:col-span-2">
          {['released', 'partially_refunded', 'delivered', 'shipped'].includes(s) && (
            <Link to={`/fournisseur/factures/${order.id}`} target="_blank" className="btn-secondary"><DocumentTextIcon className="size-4" />{t('order.invoice')}</Link>
          )}
          {s === 'paid' && <>
            <button type="button" className="btn-secondary" disabled={busy} onClick={() => setDialog('refuse')}>{t('order.refuse')}</button>
            <button type="button" className="btn-primary" disabled={busy} onClick={() => act(() => supplierAPI.accept(order.id))}>{t('order.accept')}</button>
          </>}
          {s === 'accepted' && <>
            <button type="button" className="btn-secondary" disabled={busy} onClick={() => setDialog('refuse')}>{t('order.cannot_fulfil')}</button>
            <button type="button" className="btn-primary" disabled={busy} onClick={() => setDialog('ship')}><TruckIcon className="size-4" />{t('order.mark_shipped')}</button>
          </>}
        </div>}
      />
      {error && <div className="mb-4"><Notice tone="red">{error}</Notice></div>}
      <div className="mb-6 space-y-3">
        {(s === 'paid' || s === 'accepted') && order.deadlines.ship && <Notice tone="amber">{t('order.ship_deadline_supplier', { date: dayTime(order.deadlines.ship) })}</Notice>}
        {s === 'shipped' && order.deadlines.autoRelease && <Notice tone="blue">{t('order.auto_release_supplier', { date: day(order.deadlines.autoRelease) })}</Notice>}
        {s === 'disputed' && <Notice tone="red"><p className="font-medium">{t('order.disputed_title')}</p><p className="mt-0.5">{order.dispute?.reason}</p><p className="mt-1">{t('order.disputed_supplier')}</p></Notice>}
        {s === 'refund_pending' && <Notice tone="amber">{t('order.refund_pending')}</Notice>}
        {(s === 'released' || s === 'partially_refunded') && <Notice tone="green">{order.paidOut ? t('order.paid_out') : t('order.released_supplier')}</Notice>}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <Panel title={t('order.items')}><OrderLines order={order} side="supplier" /></Panel>
          {/* Phones: where to ship comes right after what to ship */}
          <div className="lg:hidden">{shipToPanel}</div>
          <Panel title={t('messages.title')} description={t('messages.supplier_hint')}>
            <MessageThread messages={order.messages} me="supplier" disabled={['refunded'].includes(s)}
              onSend={async (body) => { await supplierAPI.message(order.id, body); await load(); }} />
          </Panel>
        </div>
        <div className="space-y-6">
          <div className="hidden lg:block">{shipToPanel}</div>
          {order.shipment?.shippedAt && (
            <Panel title={t('order.shipment')}>
              <Facts rows={[[t('order.carrier'), order.shipment.carrier || '—'], [t('order.tracking'), order.shipment.tracking || '—'], [t('order.shipped_on'), dayTime(order.shipment.shippedAt)]]} />
            </Panel>
          )}
          <Panel title={t('order.history')}><Timeline events={order.events} /></Panel>
        </div>
      </div>

      {dialog === 'ship' && (
        <Modal isOpen onClose={() => setDialog(null)} title={t('order.ship_title')} size="sm">
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); act(() => supplierAPI.ship(order.id, form.carrier, form.tracking)); }}>
            <p className="text-sm text-gray-600 dark:text-gray-300">{t('order.ship_body')}</p>
            <div>
              <label htmlFor="carrier" className={labelClass}>{t('order.carrier')}</label>
              <input id="carrier" maxLength={80} value={form.carrier} onChange={(e) => setForm({ ...form, carrier: e.target.value })} className="field" placeholder={t('order.carrier_placeholder')} />
            </div>
            <div>
              <label htmlFor="tracking" className={labelClass}>{t('order.tracking_optional')}</label>
              <input id="tracking" maxLength={80} value={form.tracking} onChange={(e) => setForm({ ...form, tracking: e.target.value })} className="field font-mono" />
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" className="btn-secondary" onClick={() => setDialog(null)}>{t('common.cancel')}</button>
              <button type="submit" className="btn-primary" disabled={busy}>{t('order.confirm_shipped')}</button>
            </div>
          </form>
        </Modal>
      )}
      {dialog === 'refuse' && (
        <Modal isOpen onClose={() => setDialog(null)} title={t('order.refuse_title')} size="sm">
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); act(() => supplierAPI.refuse(order.id, form.reason)); }}>
            <p className="text-sm text-gray-600 dark:text-gray-300">{t('order.refuse_body', { amount: money(order.total) })}</p>
            <div>
              <label htmlFor="reason" className={labelClass}>{t('order.refuse_reason')}</label>
              <textarea id="reason" required minLength={3} maxLength={500} rows={3} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="field" />
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" className="btn-secondary" onClick={() => setDialog(null)}>{t('common.cancel')}</button>
              <button type="submit" className="btn-primary !bg-red-600 hover:!bg-red-700" disabled={busy || form.reason.trim().length < 3}>{t('order.confirm_refuse')}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
