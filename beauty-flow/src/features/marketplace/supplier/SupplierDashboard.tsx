import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRightIcon, ClipboardDocumentCheckIcon, PlusIcon } from '@heroicons/react/24/outline';
import { EmptyState, PageHeader, Panel, StatGroup } from '../../../components/ui';
import { Ledger, OrderStatus, supplierAPI } from '../api';
import { Notice, OrderStatusBadge, Spinner, money, useDates } from '../shared';
import { useSupplier } from './SupplierLayout';

interface Dash {
  toAccept: number; toShip: number; disputed: number; monthNet: number; balance: Ledger; products: number; lowStock: number;
  orders: { id: string; number: string; status: OrderStatus; salonName: string; wilaya?: string; total: number; createdAt: string; itemCount: number; shipBy?: string }[];
}

const SupplierDashboard: React.FC = () => {
  const { t } = useTranslation('marketplace');
  const { profile } = useSupplier();
  const { day } = useDates();
  const [d, setD] = useState<Dash | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => { supplierAPI.dashboard().then((r) => setD(r.data)).catch(() => setError(true)); }, []);

  const missing = [
    !profile.payoutInfo && 'rib',
    !profile.shipping.zones.length && 'zones',
    d && d.products === 0 && 'products',
  ].filter(Boolean) as string[];

  return (
    <div className="py-6 sm:py-8">
      <PageHeader
        title={t('dashboard.title', { name: profile.companyName })}
        subtitle={t('dashboard.subtitle')}
        actions={<Link to="/fournisseur/catalogue?new=1" className="btn-primary"><PlusIcon className="size-4" />{t('catalogue.add')}</Link>}
      />
      {error && <Notice tone="red">{t('common.load_error')}</Notice>}
      {!d && !error && <Spinner />}
      {d && (
        <div className="space-y-6">
          <StatGroup
            className="!mb-0"
            items={[
              { label: t('dashboard.to_ship'), value: d.toAccept + d.toShip, accent: d.toAccept + d.toShip > 0, hint: t('dashboard.to_ship_hint', { accept: d.toAccept, ship: d.toShip }) },
              { label: t('dashboard.month_revenue'), value: money(d.monthNet), hint: t('dashboard.month_revenue_hint') },
              { label: t('balance.pending'), value: money(d.balance.pending), hint: t('balance.pending_hint') },
              { label: t('balance.available'), value: money(d.balance.available), hint: t('balance.paid_out_hint', { amount: money(d.balance.paidOut) }) },
            ]}
          />

          {missing.length > 0 && (
            <Panel title={t('dashboard.setup_title')} description={t('dashboard.setup_body')}>
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {missing.map((m) => (
                  <li key={m}>
                    <Link to={m === 'rib' ? '/fournisseur/paiements' : m === 'zones' ? '/fournisseur/entreprise' : '/fournisseur/catalogue'} className="flex items-center justify-between gap-3 py-3 text-sm font-medium text-gray-900 hover:text-orange-700 dark:text-gray-50 dark:hover:text-orange-400">
                      {t(`dashboard.setup.${m}`)}
                      <ChevronRightIcon className="size-4 text-gray-400 rtl:-scale-x-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          {d.disputed > 0 && <Notice tone="red">{t('dashboard.disputed', { count: d.disputed })}</Notice>}

          <Panel flush title={t('dashboard.orders_title')} actions={<Link to="/fournisseur/commandes" className="btn-ghost">{t('dashboard.all_orders')}</Link>}>
            {d.orders.length === 0 ? (
              <EmptyState icon={ClipboardDocumentCheckIcon} title={t('dashboard.no_orders')} body={t('dashboard.no_orders_body')} />
            ) : (
              <ul className="divide-y divide-gray-100 border-t border-gray-100 dark:divide-gray-800 dark:border-gray-800">
                {d.orders.map((o) => (
                  <li key={o.id}>
                    <Link to={`/fournisseur/commandes/${o.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <div className="min-w-0 flex-1 basis-56">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-gray-900 dark:text-gray-50">{o.salonName}</p>
                          <OrderStatusBadge status={o.status} />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {[o.number, o.wilaya, t('order.items_count', { count: o.itemCount }), o.shipBy && o.status !== 'disputed' && t('dashboard.ship_by', { date: day(o.shipBy) })].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                      <span className="font-display font-semibold tabular-nums text-gray-900 dark:text-gray-50">{money(o.total)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('dashboard.rules', { commission: profile.commissionPercent, ship: profile.settings.shipDeadlineDays, release: profile.settings.autoReleaseDays })}
            {d.lowStock > 0 && <> {t('dashboard.low_stock', { count: d.lowStock })}</>}
          </p>
        </div>
      )}
    </div>
  );
};

export default SupplierDashboard;
