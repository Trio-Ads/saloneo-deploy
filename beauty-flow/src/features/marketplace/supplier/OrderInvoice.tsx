import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PrinterIcon } from '@heroicons/react/24/outline';
import { SaloneoLogo } from '../../../components/SaloneoLogo';
import { Order, supplierAPI } from '../api';
import { Notice, Spinner, money, useDates } from '../shared';

/** Printable sales statement for one order: lines, TTC total, Saloneo commission and net paid out. */
const OrderInvoice: React.FC = () => {
  const { t } = useTranslation('marketplace');
  const { id } = useParams();
  const { day } = useDates();
  const [data, setData] = useState<{ order: Order; supplier: Record<string, string> } | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => { supplierAPI.order(id!).then((r) => setData(r.data)).catch(() => setError(true)); }, [id]);

  if (error) return <div className="p-8"><Notice tone="red">{t('common.load_error')}</Notice></div>;
  if (!data) return <Spinner />;
  const { order: o, supplier: s } = data;
  const kept = o.total - (o.status === 'partially_refunded' ? o.refundAmount : 0);
  const cell = 'px-3 py-2';

  return (
    <div className="min-h-screen bg-gray-100 py-8 print:bg-white print:py-0">
      <div className="mx-auto mb-4 flex max-w-3xl justify-end px-4 print:hidden">
        <button type="button" className="btn-primary" onClick={() => window.print()}><PrinterIcon className="size-4" />{t('invoice.print')}</button>
      </div>
      <article className="mx-auto max-w-3xl bg-white p-8 text-sm text-gray-900 shadow-sm print:max-w-none print:p-0 print:shadow-none sm:p-12">
        <header className="flex flex-wrap items-start justify-between gap-6 border-b border-gray-200 pb-6">
          <div>
            <h1 className="font-display text-2xl font-semibold">{t('invoice.title')}</h1>
            <p className="mt-1 text-gray-500">{t('invoice.number', { number: o.number })} · {day(o.paidAt || o.createdAt)}</p>
          </div>
          <SaloneoLogo size="sm" />
        </header>
        <section className="grid gap-6 border-b border-gray-200 py-6 sm:grid-cols-2">
          <div>
            <h2 className="mb-1 text-xs font-medium text-gray-500">{t('invoice.seller')}</h2>
            <p className="font-semibold">{s.companyName}</p>
            <p>{s.address}{s.wilaya ? `, ${s.wilaya}` : ''}</p>
            <p>{s.phone} · {s.email}</p>
            {s.nif && <p>{t('apply.nif')} : <span className="font-mono">{s.nif}</span></p>}
            {s.rc && <p>{t('apply.rc')} : <span className="font-mono">{s.rc}</span></p>}
          </div>
          <div>
            <h2 className="mb-1 text-xs font-medium text-gray-500">{t('invoice.buyer')}</h2>
            <p className="font-semibold">{o.shipTo.name}</p>
            {o.shipTo.contact && <p>{o.shipTo.contact}</p>}
            <p>{o.shipTo.address}, {o.shipTo.wilaya}</p>
            <p>{o.shipTo.phone}</p>
          </div>
        </section>
        <table className="mt-6 w-full text-start">
          <thead>
            <tr className="border-b border-gray-200 text-xs text-gray-500">
              <th className={`${cell} text-start font-medium`}>{t('invoice.item')}</th>
              <th className={`${cell} text-end font-medium`}>{t('invoice.qty')}</th>
              <th className={`${cell} text-end font-medium`}>{t('invoice.unit_price')}</th>
              <th className={`${cell} text-end font-medium`}>{t('invoice.amount')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {o.items.map((it, i) => (
              <tr key={i}>
                <td className={cell}><p className="font-medium">{it.name}</p><p className="text-xs text-gray-500">{[it.brand, it.unit, it.sku].filter(Boolean).join(' · ')}</p></td>
                <td className={`${cell} text-end tabular-nums`}>{it.qty}</td>
                <td className={`${cell} text-end tabular-nums`}>{money(it.price)}</td>
                <td className={`${cell} text-end tabular-nums`}>{money(it.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <dl className="ms-auto mt-4 w-full max-w-xs space-y-1.5 tabular-nums">
          <div className="flex justify-between"><dt className="text-gray-500">{t('order.subtotal')}</dt><dd>{money(o.subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-gray-500">{t('order.delivery')}</dt><dd>{money(o.deliveryFee)}</dd></div>
          <div className="flex justify-between border-t border-gray-200 pt-1.5 font-semibold"><dt>{t('invoice.total_ttc')}</dt><dd>{money(o.total)}</dd></div>
          {o.refundAmount > 0 && <div className="flex justify-between text-red-700"><dt>{t('order.refunded')}</dt><dd>− {money(o.refundAmount)}</dd></div>}
        </dl>
        <section className="mt-8 rounded-xl border border-gray-200 p-4">
          <h2 className="mb-2 font-semibold">{t('invoice.settlement')}</h2>
          <dl className="space-y-1.5 tabular-nums">
            <div className="flex justify-between"><dt className="text-gray-500">{t('invoice.collected')}</dt><dd>{money(kept)}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">{t('order.commission', { percent: o.commissionPercent })}</dt><dd>− {money(o.commission || 0)}</dd></div>
            <div className="flex justify-between font-semibold"><dt>{t('invoice.net')}</dt><dd>{money(o.net || 0)}</dd></div>
          </dl>
          <p className="mt-3 text-xs text-gray-500">{t('invoice.note')}</p>
        </section>
      </article>
    </div>
  );
};

export default OrderInvoice;
