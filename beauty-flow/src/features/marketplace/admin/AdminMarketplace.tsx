import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ArrowDownTrayIcon, BanknotesIcon, BuildingStorefrontIcon, ClipboardDocumentListIcon, EnvelopeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Modal from '../../../components/Modal';
import { Badge, BadgeTone, EmptyState, Panel, Segmented, StatGroup } from '../../../components/ui';
import { WILAYAS } from '../../directory/api';
import { AdminStats, AdminSupplier, MarketSettings, Order, OrderPage, SupplierBalance, adminMarketAPI, errorCode } from '../api';
import { Facts, MessageThread, Notice, OrderLines, OrderStatusBadge, Spinner, Timeline, labelClass, money, saveBlob, useDates, useZonesLabel } from '../shared';

type Section = 'overview' | 'suppliers' | 'orders' | 'payouts';
const supplierTone: Record<AdminSupplier['status'], BadgeTone> = { pending: 'amber', approved: 'green', rejected: 'red', suspended: 'red' };

/* ── Overview: GMV, commission, escrow + settings ── */
function Overview() {
  const { t } = useTranslation('marketplace');
  const [data, setData] = useState<{ paymentsEnabled: boolean; stats: AdminStats; settings: MarketSettings } | null>(null);
  const [draft, setDraft] = useState({ commissionPercent: '', autoReleaseDays: '', shipDeadlineDays: '' });
  const [msg, setMsg] = useState<{ tone: 'green' | 'red'; text: string } | null>(null);
  useEffect(() => {
    adminMarketAPI.overview().then((r) => {
      setData(r.data);
      const s = r.data.settings;
      setDraft({ commissionPercent: String(s.commissionPercent), autoReleaseDays: String(s.autoReleaseDays), shipDeadlineDays: String(s.shipDeadlineDays) });
    }).catch(() => setMsg({ tone: 'red', text: t('common.load_error') }));
  }, [t]);
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: r } = await adminMarketAPI.saveSettings({ commissionPercent: Number(draft.commissionPercent), autoReleaseDays: Number(draft.autoReleaseDays), shipDeadlineDays: Number(draft.shipDeadlineDays) });
      setData((d) => d && { ...d, settings: r.settings });
      setMsg({ tone: 'green', text: t('admin.settings_saved') });
    } catch {
      setMsg({ tone: 'red', text: t('admin.settings_error') });
    }
  };
  if (!data) return msg ? <Notice tone={msg.tone}>{msg.text}</Notice> : <Spinner />;
  const s = data.stats;
  return (
    <div className="space-y-6">
      {!data.paymentsEnabled && <Notice>{t('admin.payments_disabled')}</Notice>}
      <StatGroup className="!mb-0" items={[
        { label: t('admin.gmv'), value: money(s.gmv), hint: t('admin.gmv_hint', { count: s.paidOrders }) },
        { label: t('admin.gmv_month'), value: money(s.gmvMonth), hint: t('admin.orders_month', { count: s.ordersMonth }) },
        { label: t('admin.commission'), value: money(s.commission), accent: true, hint: t('admin.commission_month', { amount: money(s.commissionMonth) }) },
        { label: t('admin.escrow'), value: money(s.escrow), hint: t('admin.escrow_hint') },
      ]} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title={t('admin.activity')}>
          <Facts rows={[
            [t('admin.disputes_open'), s.disputes ? <Badge tone="red">{s.disputes}</Badge> : 0],
            [t('admin.refunds_pending'), s.refundsPending ? <Badge tone="amber">{s.refundsPending}</Badge> : 0],
            [t('admin.suppliers_pending'), s.suppliers.pending || 0],
            [t('admin.suppliers_approved'), s.suppliers.approved || 0],
            ...Object.entries(s.byStatus).map(([k, v]) => [t(`status.${k}`), v] as [string, number]),
          ]} />
        </Panel>
        <Panel title={t('admin.settings_title')} description={t('admin.settings_description')}>
          <form onSubmit={save} className="space-y-4">
            {(['commissionPercent', 'shipDeadlineDays', 'autoReleaseDays'] as const).map((k) => (
              <div key={k}>
                <label htmlFor={`set-${k}`} className={labelClass}>{t(`admin.${k}`)}</label>
                <div className="flex items-center gap-2">
                  <input id={`set-${k}`} type="number" min={k === 'commissionPercent' ? 0 : 1} max={k === 'commissionPercent' ? 100 : 60} step={k === 'commissionPercent' ? 0.5 : 1}
                    value={draft[k]} onChange={(e) => setDraft({ ...draft, [k]: e.target.value })} className="field w-28 tabular-nums" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">{k === 'commissionPercent' ? '%' : t('catalogue.form.days')}</span>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t(`admin.${k}_help`)}</p>
              </div>
            ))}
            {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
            <button type="submit" className="btn-primary">{t('common.save')}</button>
          </form>
        </Panel>
      </div>
    </div>
  );
}

/* ── Suppliers: applications to validate, list, invite ── */
function SupplierModal({ s, onClose, onDone }: { s: AdminSupplier; onClose: () => void; onDone: (text: string) => void }) {
  const { t } = useTranslation('marketplace');
  const { day } = useDates();
  const zones = useZonesLabel();
  const [reason, setReason] = useState('');
  const [commission, setCommission] = useState(s.commissionPercent === null ? '' : String(s.commissionPercent));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const run = async (data: { status?: string; reason?: string; commissionPercent?: number | null }, text: string) => {
    setBusy(true);
    setError(false);
    try {
      await adminMarketAPI.updateSupplier(s.id, data);
      onDone(text);
    } catch {
      setError(true);
      setBusy(false);
    }
  };
  return (
    <Modal isOpen onClose={onClose} title={s.companyName} size="lg">
      <div className="space-y-5 text-sm">
        <div className="flex flex-wrap items-center gap-2"><Badge tone={supplierTone[s.status]}>{t(`supplier_status.${s.status}`)}</Badge>{s.invited && <Badge>{t('admin.invited')}</Badge>}<span className="text-gray-500">{t('admin.since', { date: day(s.createdAt) })}</span></div>
        <Facts rows={[
          [t('apply.contact'), s.contactName], [t('apply.email'), s.email], [t('apply.phone'), s.phone], [t('apply.wilaya'), s.wilaya], [t('apply.address'), s.address],
          [t('apply.nif'), s.nif && <span className="select-all font-mono">{s.nif}</span>], [t('apply.rc'), s.rc && <span className="select-all font-mono">{s.rc}</span>],
          [t('apply.categories'), s.categories.map((c) => t(`categories.${c}`)).join(', ')],
          [t('company.zones'), zones(s.shipping?.zones, 6)],
          [t('payments.rib'), s.payout ? <span className="select-all font-mono">{`${s.payout.method === 'ccp' ? 'CCP' : t('payments.method_bank')} ${s.payout.rib} · ${s.payout.legalName}`}</span> : t('admin.rib_missing')],
          [t('admin.products'), s.products], [t('admin.orders'), s.orders], [t('admin.gmv'), money(s.gmv)],
        ]} />
        {s.description && <p className="text-gray-600 dark:text-gray-300">{s.description}</p>}
        <div>
          <label htmlFor="sup-commission" className={labelClass}>{t('admin.commission_override')}</label>
          <div className="flex flex-wrap items-center gap-2">
            <input id="sup-commission" type="number" min={0} max={100} step={0.5} value={commission} placeholder={t('admin.default')} onChange={(e) => setCommission(e.target.value)} className="field w-28 tabular-nums" />
            <span className="text-gray-500">%</span>
            <button type="button" className="btn-secondary" disabled={busy} onClick={() => run({ commissionPercent: commission === '' ? null : Number(commission) }, t('admin.commission_saved'))}>{t('common.save')}</button>
          </div>
          <p className="mt-1 text-xs text-gray-500">{t('admin.commission_override_help', { value: s.effectiveCommission })}</p>
        </div>
        <div>
          <label htmlFor="sup-reason" className={labelClass}>{t('admin.reason')}</label>
          <textarea id="sup-reason" rows={2} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} className="field" placeholder={t('admin.reason_placeholder')} />
        </div>
        {error && <Notice tone="red">{t('common.action_error')}</Notice>}
        <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end dark:border-gray-800">
          {s.status === 'pending' && <button type="button" className="btn-secondary" disabled={busy} onClick={() => run({ status: 'rejected', reason }, t('admin.rejected', { name: s.companyName }))}>{t('admin.reject')}</button>}
          {s.status === 'approved' && <button type="button" className="btn-secondary" disabled={busy} onClick={() => run({ status: 'suspended', reason }, t('admin.suspended', { name: s.companyName }))}>{t('admin.suspend')}</button>}
          {s.status !== 'approved' && <button type="button" className="btn-primary" disabled={busy} onClick={() => run({ status: 'approved', reason }, t('admin.approved', { name: s.companyName }))}>{s.status === 'pending' ? t('admin.approve') : t('admin.reactivate')}</button>}
        </div>
      </div>
    </Modal>
  );
}

function InviteModal({ onClose, onDone }: { onClose: () => void; onDone: (text: string) => void }) {
  const { t } = useTranslation('marketplace');
  const [f, setF] = useState({ companyName: '', email: '', contactName: '', phone: '', wilaya: '' });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await adminMarketAPI.invite(f);
      onDone(t('admin.invite_sent', { email: f.email }));
    } catch (err) {
      setError(errorCode(err) === 'EMAIL_TAKEN' ? t('apply.email_taken') : t('common.action_error'));
      setBusy(false);
    }
  };
  return (
    <Modal isOpen onClose={onClose} title={t('admin.invite_title')} size="md">
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">{t('admin.invite_body')}</p>
        {(['companyName', 'email', 'contactName', 'phone'] as const).map((k) => (
          <div key={k}>
            <label htmlFor={`inv-${k}`} className={labelClass}>{t(`apply.${k === 'companyName' ? 'company' : k === 'contactName' ? 'contact' : k}`)}</label>
            <input id={`inv-${k}`} type={k === 'email' ? 'email' : k === 'phone' ? 'tel' : 'text'} required={k === 'companyName' || k === 'email'} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} className="field" />
          </div>
        ))}
        <div>
          <label htmlFor="inv-wilaya" className={labelClass}>{t('apply.wilaya')}</label>
          <select id="inv-wilaya" value={f.wilaya} onChange={(e) => setF({ ...f, wilaya: e.target.value })} className="field">
            <option value="">—</option>
            {WILAYAS.map((w) => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>
        {error && <Notice tone="red">{error}</Notice>}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" className="btn-secondary" onClick={onClose}>{t('common.cancel')}</button>
          <button type="submit" className="btn-primary" disabled={busy}><EnvelopeIcon className="size-4" />{t('admin.invite_send')}</button>
        </div>
      </form>
    </Modal>
  );
}

function Suppliers() {
  const { t } = useTranslation('marketplace');
  const { day } = useDates();
  const [list, setList] = useState<AdminSupplier[] | null>(null);
  const [open, setOpen] = useState<AdminSupplier | null>(null);
  const [inviting, setInviting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const load = useCallback(() => { adminMarketAPI.suppliers().then((r) => setList(r.data.suppliers)).catch(() => setList([])); }, []);
  useEffect(load, [load]);
  if (!list) return <Spinner />;
  const pending = list.filter((s) => s.status === 'pending');
  const others = list.filter((s) => s.status !== 'pending');
  const row = (s: AdminSupplier) => (
    <li key={s.id}>
      <button type="button" onClick={() => setOpen(s)} className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 text-start hover:bg-gray-50 dark:hover:bg-gray-800/50">
        <div className="min-w-0 flex-1 basis-56">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-gray-900 dark:text-gray-50">{s.companyName}</p>
            <Badge tone={supplierTone[s.status]}>{t(`supplier_status.${s.status}`)}</Badge>
            {!s.payout && <Badge tone="amber">{t('admin.rib_missing')}</Badge>}
            {s.commissionPercent !== null && <Badge>{`${s.commissionPercent} %`}</Badge>}
          </div>
          <p className="truncate text-sm text-gray-500 dark:text-gray-400">{[s.wilaya, s.email, s.status === 'pending' ? t('admin.applied_on', { date: day(s.createdAt) }) : t('admin.supplier_line', { products: s.products, orders: s.orders })].filter(Boolean).join(' · ')}</p>
        </div>
        <span className="font-display font-semibold tabular-nums text-gray-900 dark:text-gray-50">{money(s.gmv)}</span>
      </button>
    </li>
  );
  return (
    <div className="space-y-6">
      {msg && <Notice tone="green">{msg}</Notice>}
      <Panel flush title={t('admin.applications', { count: pending.length })} description={t('admin.applications_description')}
        actions={<button type="button" className="btn-secondary" onClick={() => setInviting(true)}><EnvelopeIcon className="size-4" />{t('admin.invite')}</button>}>
        {pending.length === 0 ? <EmptyState icon={BuildingStorefrontIcon} title={t('admin.no_applications')} /> : <ul className="divide-y divide-gray-100 border-t border-gray-100 dark:divide-gray-800 dark:border-gray-800">{pending.map(row)}</ul>}
      </Panel>
      <Panel flush title={t('admin.suppliers_title')}>
        {others.length === 0 ? <EmptyState icon={BuildingStorefrontIcon} title={t('admin.no_suppliers')} /> : <ul className="divide-y divide-gray-100 border-t border-gray-100 dark:divide-gray-800 dark:border-gray-800">{others.map(row)}</ul>}
      </Panel>
      {open && <SupplierModal s={open} onClose={() => setOpen(null)} onDone={(text) => { setOpen(null); setMsg(text); load(); }} />}
      {inviting && <InviteModal onClose={() => setInviting(false)} onDone={(text) => { setInviting(false); setMsg(text); load(); }} />}
    </div>
  );
}

/* ── Orders: filters, disputes (arbitration), failed refunds ── */
function OrderModal({ id, onClose, onChanged }: { id: string; onClose: () => void; onChanged: () => void }) {
  const { t } = useTranslation('marketplace');
  const { dayTime } = useDates();
  const [order, setOrder] = useState<Order | null>(null);
  const [decision, setDecision] = useState<'release' | 'refund' | 'partial'>('partial');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(() => adminMarketAPI.order(id).then((r) => setOrder(r.data.order)).catch(() => setError(t('common.load_error'))), [id, t]);
  useEffect(() => { load(); }, [load]);
  const act = async (fn: () => Promise<{ data: { order: Order } }>, confirm?: string) => {
    if (confirm && !window.confirm(confirm)) return;
    setBusy(true);
    setError(null);
    try {
      setOrder((await fn()).data.order);
      onChanged();
    } catch (e: any) {
      setError(e?.response?.data?.error || t('common.action_error'));
    } finally {
      setBusy(false);
    }
  };
  const a = Number(amount);
  const partialOk = decision !== 'partial' || (a >= 1 && order !== null && a < order.total);
  return (
    <Modal isOpen onClose={onClose} title={order ? t('order.title', { number: order.number }) : '…'} size="xl">
      {!order ? (error ? <Notice tone="red">{error}</Notice> : <Spinner />) : (
        <div className="space-y-6 text-sm">
          <div className="flex flex-wrap items-center gap-2"><OrderStatusBadge status={order.status} /><span className="text-gray-500">{order.salonName} → {order.supplierName} · {dayTime(order.paidAt || order.createdAt)}</span></div>
          {error && <Notice tone="red">{error}</Notice>}
          {order.status === 'disputed' && (
            <Panel title={t('admin.arbitration')} description={order.dispute?.reason}>
              <div className="space-y-4">
                <Segmented value={decision} onChange={setDecision} options={[
                  { value: 'partial', label: t('admin.decision.partial') }, { value: 'refund', label: t('admin.decision.refund') }, { value: 'release', label: t('admin.decision.release') },
                ]} />
                {decision === 'partial' && (
                  <div>
                    <label htmlFor="partial" className={labelClass}>{t('admin.partial_amount', { max: money(order.total - 1) })}</label>
                    <input id="partial" type="number" min={1} max={order.total - 1} value={amount} onChange={(e) => setAmount(e.target.value)} className="field w-40 tabular-nums" />
                    {a > 0 && partialOk && <p className="mt-1 text-xs text-gray-500">{t('admin.partial_split', { refund: money(a), kept: money(order.total - a) })}</p>}
                  </div>
                )}
                <div>
                  <label htmlFor="note" className={labelClass}>{t('admin.decision_note')}</label>
                  <input id="note" maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} className="field" />
                </div>
                <button type="button" className="btn-primary" disabled={busy || !partialOk}
                  onClick={() => act(() => adminMarketAPI.resolve(order.id, decision, a, note), t(`admin.decision_confirm.${decision}`, { amount: money(decision === 'partial' ? a : order.total) }))}>
                  {t('admin.decide')}
                </button>
              </div>
            </Panel>
          )}
          {order.status === 'refund_pending' && (
            <Notice tone="amber">
              <p>{t('admin.refund_failed', { error: order.refundError || '—', amount: money(order.refundAmount) })}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" className="btn-secondary" disabled={busy} onClick={() => act(() => adminMarketAPI.retryRefund(order.id))}>{t('admin.retry_refund')}</button>
                <button type="button" className="btn-ghost" disabled={busy} onClick={() => act(() => adminMarketAPI.markRefunded(order.id, t('admin.manual_note')), t('admin.mark_refunded_confirm'))}>{t('admin.mark_refunded')}</button>
              </div>
            </Notice>
          )}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <OrderLines order={order} side="admin" />
              <Facts rows={[
                [t('order.ship_to'), `${order.shipTo.name}, ${order.shipTo.address}, ${order.shipTo.wilaya} · ${order.shipTo.phone}`],
                [t('order.carrier'), order.shipment?.carrier], [t('order.tracking'), order.shipment?.tracking],
                [t('order.transaction'), order.satim?.orderNumber], [t('admin.attempts'), order.attempts],
                [t('order.paid_out_label'), order.paidOut ? t('common.yes') : t('common.no')],
              ]} />
            </div>
            <div className="space-y-6">
              <div><h3 className="mb-3 font-semibold text-gray-900 dark:text-gray-50">{t('messages.title')}</h3>
                <MessageThread messages={order.messages} me="admin" disabled={['pending_payment', 'cancelled', 'expired'].includes(order.status)} onSend={async (body) => { await adminMarketAPI.message(order.id, body); await load(); }} /></div>
              <div><h3 className="mb-3 font-semibold text-gray-900 dark:text-gray-50">{t('order.history')}</h3><Timeline events={order.events} all /></div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

function Orders() {
  const { t } = useTranslation('marketplace');
  const { day } = useDates();
  const [status, setStatus] = useState('disputed');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<OrderPage | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const load = useCallback(() => {
    adminMarketAPI.orders({ status: status === 'all' ? undefined : status, q: q || undefined, page }).then((r) => setData(r.data)).catch(() => setData({ total: 0, page: 1, pageSize: 30, orders: [] }));
  }, [status, q, page]);
  useEffect(load, [load]);
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} aria-label={t('admin.filter_status')} className="field sm:w-60">
          {['disputed', 'refund_pending', 'open', 'to_handle', 'done', 'unpaid', 'all'].map((s) => <option key={s} value={s}>{t(['open', 'to_handle', 'done', 'unpaid', 'all'].includes(s) ? `orders.filter.${s}` : `status.${s}`)}</option>)}
        </select>
        <form className="relative sm:w-64" onSubmit={(e) => { e.preventDefault(); setPage(1); load(); }}>
          <MagnifyingGlassIcon className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('admin.search_number')} aria-label={t('admin.search_number')} className="field ps-9" />
        </form>
        {data && <span className="text-sm text-gray-500 dark:text-gray-400 sm:ms-auto">{t('admin.orders_count', { count: data.total })}</span>}
      </div>
      {!data ? <Spinner /> : data.orders.length === 0 ? (
        <Panel><EmptyState icon={ClipboardDocumentListIcon} title={t('orders.empty')} /></Panel>
      ) : (
        <Panel flush>
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {data.orders.map((o) => (
              <li key={o.id}>
                <button type="button" onClick={() => setOpen(o.id)} className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 text-start hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <div className="min-w-0 flex-1 basis-56">
                    <div className="flex flex-wrap items-center gap-2"><p className="font-medium text-gray-900 dark:text-gray-50">{o.number}</p><OrderStatusBadge status={o.status} /></div>
                    <p className="truncate text-sm text-gray-500 dark:text-gray-400">{[`${o.salonName} → ${o.supplierName}`, day(o.createdAt), o.disputeReason, o.refundError].filter(Boolean).join(' · ')}</p>
                  </div>
                  <span className="text-end font-display font-semibold tabular-nums text-gray-900 dark:text-gray-50">{money(o.total)}{o.commission ? <span className="block text-xs font-normal text-gray-500">{t('admin.commission_short', { amount: money(o.commission) })}</span> : null}</span>
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
      )}
      {open && <OrderModal id={open} onClose={() => setOpen(null)} onChanged={load} />}
    </div>
  );
}

/* ── Payouts: escrow + available per supplier, transfer file, record a transfer ── */
function PayoutModal({ b, onClose, onDone }: { b: SupplierBalance; onClose: () => void; onDone: () => void }) {
  const { t } = useTranslation('marketplace');
  const [amount, setAmount] = useState(String(b.available));
  const [paidAt, setPaidAt] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [reference, setReference] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const v = Number(amount);
  const invalid = !(v > 0) || v > b.available;
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await adminMarketAPI.payout({ supplierId: b.supplierId, amount: v, paidAt, reference: reference.trim() });
      onDone();
    } catch (err) {
      setError(errorCode(err) === 'PAYOUT_EXCEEDS_BALANCE' ? t('admin.exceeds') : t('common.action_error'));
      setBusy(false);
    }
  };
  return (
    <Modal isOpen onClose={onClose} title={t('admin.payout_title', { name: b.companyName })} size="md">
      <form onSubmit={submit} className="space-y-4 text-sm">
        <Facts rows={[[t('payments.legal_name'), b.payout?.legalName || '—'], [b.payout?.method === 'ccp' ? t('payments.rip') : t('payments.rib'), b.payout?.rib ? <span className="select-all font-mono">{b.payout.rib}</span> : t('admin.rib_missing')], [t('balance.available'), money(b.available)]]} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="po-amount" className={labelClass}>{t('admin.amount')}</label>
            <input id="po-amount" type="number" min={1} max={b.available} value={amount} onChange={(e) => setAmount(e.target.value)} aria-invalid={invalid} className="field tabular-nums" />
          </div>
          <div>
            <label htmlFor="po-date" className={labelClass}>{t('admin.transfer_date')}</label>
            <input id="po-date" type="date" value={paidAt} max={format(new Date(), 'yyyy-MM-dd')} onChange={(e) => setPaidAt(e.target.value)} className="field" />
          </div>
        </div>
        <div>
          <label htmlFor="po-ref" className={labelClass}>{t('admin.reference')}</label>
          <input id="po-ref" maxLength={120} value={reference} onChange={(e) => setReference(e.target.value)} className="field" />
        </div>
        <p className="text-xs text-gray-500">{t('admin.payout_email_note')}</p>
        {error && <Notice tone="red">{error}</Notice>}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" className="btn-secondary" onClick={onClose}>{t('common.cancel')}</button>
          <button type="submit" className="btn-primary" disabled={invalid || busy}>{t('admin.record_payout')}</button>
        </div>
      </form>
    </Modal>
  );
}

function Payouts() {
  const { t } = useTranslation('marketplace');
  const { day } = useDates();
  const [list, setList] = useState<SupplierBalance[] | null>(null);
  const [paying, setPaying] = useState<SupplierBalance | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const load = useCallback(() => { adminMarketAPI.balances().then((r) => setList(r.data.balances)).catch(() => setList([])); }, []);
  useEffect(load, [load]);
  if (!list) return <Spinner />;
  const due = list.filter((b) => b.available > 0);
  return (
    <div className="space-y-6">
      <StatGroup className="!mb-0" items={[
        { label: t('admin.total_due'), value: money(due.reduce((s, b) => s + b.available, 0)), accent: true, hint: t('admin.suppliers_count', { count: due.length }) },
        { label: t('balance.pending'), value: money(list.reduce((s, b) => s + b.pending, 0)), hint: t('admin.escrow_hint') },
        { label: t('balance.paid_out'), value: money(list.reduce((s, b) => s + b.paidOut, 0)) },
        { label: t('admin.commission'), value: money(list.reduce((s, b) => s + b.commission, 0)) },
      ]} />
      {msg && <Notice tone="green">{msg}</Notice>}
      <Panel flush title={t('admin.balances_title')} description={t('admin.balances_description')}
        actions={<button type="button" className="btn-secondary" disabled={!due.length} onClick={async () => saveBlob((await adminMarketAPI.csv()).data, `saloneo-virements-fournisseurs-${format(new Date(), 'yyyy-MM-dd')}.csv`)}>
          <ArrowDownTrayIcon className="size-4" /><span className="hidden sm:inline">{t('admin.export_csv')}</span><span className="sm:hidden">CSV</span></button>}>
        {list.length === 0 ? <EmptyState icon={BanknotesIcon} title={t('admin.no_balances')} /> : (
          <ul className="divide-y divide-gray-100 border-t border-gray-100 dark:divide-gray-800 dark:border-gray-800">
            {list.map((b) => (
              <li key={b.supplierId} className="flex flex-col gap-3 px-5 py-3 sm:flex-row sm:items-center sm:gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><p className="font-medium text-gray-900 dark:text-gray-50">{b.companyName}</p>{!b.payout?.rib && <Badge tone="amber">{t('admin.rib_missing')}</Badge>}</div>
                  <p className="truncate text-sm text-gray-500 dark:text-gray-400">{[t('admin.escrow_short', { amount: money(b.pending) }), b.lastPayoutAt && t('admin.last_payout', { date: day(b.lastPayoutAt) })].filter(Boolean).join(' · ')}</p>
                </div>
                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <span className="font-display text-base font-semibold tabular-nums text-gray-900 dark:text-gray-50">{money(b.available)}</span>
                  <button type="button" className="btn-secondary" disabled={b.available <= 0} onClick={() => setPaying(b)}>{t('admin.record_payout')}</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
      {paying && <PayoutModal b={paying} onClose={() => setPaying(null)} onDone={() => { setMsg(t('admin.payout_done', { name: paying.companyName })); setPaying(null); load(); }} />}
    </div>
  );
}

/** Admin → Marketplace. */
const AdminMarketplace: React.FC = () => {
  const { t } = useTranslation('marketplace');
  const [section, setSection] = useState<Section>('overview');
  return (
    <div>
      <Segmented className="mb-6" value={section} onChange={setSection}
        options={(['overview', 'suppliers', 'orders', 'payouts'] as Section[]).map((v) => ({ value: v, label: t(`admin.sections.${v}`) }))} />
      {section === 'overview' && <Overview />}
      {section === 'suppliers' && <Suppliers />}
      {section === 'orders' && <Orders />}
      {section === 'payouts' && <Payouts />}
    </div>
  );
};

export default AdminMarketplace;
