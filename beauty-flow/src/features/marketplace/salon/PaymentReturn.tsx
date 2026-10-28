import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { Panel } from '../../../components/ui';
import { Order, marketAPI } from '../api';
import { Facts, Notice, Spinner, money, useDates } from '../shared';

/** SATIM sends the salon back here (?o=<order id>): the server asks SATIM, never trusts the URL. */
const PaymentReturn: React.FC = () => {
  const { t, i18n } = useTranslation('marketplace');
  const [params] = useSearchParams();
  const { dayTime } = useDates();
  const id = params.get('o') || '';
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) { setError(t('return.not_found')); return; }
    marketAPI.confirmPayment(id).then((r) => setOrder(r.data.order)).catch((e) => setError(e?.response?.data?.code === 'VERIFY_FAILED' ? t('return.verify_failed') : t('return.not_found')));
  }, [id, t]);

  const retry = async () => {
    setBusy(true);
    try {
      window.location.assign((await marketAPI.retry(id, i18n.language.slice(0, 2))).data.formUrl);
    } catch (e: any) {
      setError(e?.response?.data?.error || t('common.action_error'));
      setBusy(false);
    }
  };

  const link = `/products?tab=suppliers&view=orders&order=${id}`;
  const paid = order && !['pending_payment', 'cancelled', 'expired'].includes(order.status);

  return (
    <div className="mx-auto max-w-lg py-10">
      {!order && !error && <Spinner />}
      {error && <Notice tone="red">{error}</Notice>}
      {order && (
        <Panel>
          <div className="flex flex-col items-center py-4 text-center">
            {paid ? <CheckCircleIcon className="size-12 text-emerald-600" /> : <XCircleIcon className="size-12 text-red-600" />}
            <h1 className="mt-3 font-display text-xl font-semibold text-gray-900 dark:text-gray-50">{paid ? t('return.paid_title') : t('return.failed_title')}</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {paid ? t('return.paid_body', { supplier: order.supplierName }) : order.message || t('return.failed_body')}
            </p>
          </div>
          <Facts rows={[
            [t('order.number'), order.number],
            [t('order.total'), money(order.total)],
            [t('order.transaction'), order.orderNumber],
            [t('order.card'), order.cardLast4 ? `•••• ${order.cardLast4}` : ''],
            [t('order.approval'), order.approvalCode],
            [t('order.paid_on'), order.paidAt ? dayTime(order.paidAt) : ''],
          ]} />
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
            {!paid && order.canRetry && <button type="button" className="btn-primary" disabled={busy} onClick={retry}>{t('return.retry')}</button>}
            <Link to={link} className={paid ? 'btn-primary' : 'btn-secondary'}>{t('return.see_order')}</Link>
          </div>
          {!paid && <p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">{t('return.support')}</p>}
        </Panel>
      )}
    </div>
  );
};

export default PaymentReturn;
