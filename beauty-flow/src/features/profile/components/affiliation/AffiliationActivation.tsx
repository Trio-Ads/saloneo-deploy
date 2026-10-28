import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckIcon } from '@heroicons/react/24/outline';
import { useAffiliationStore } from '../../store/affiliationStore';
import { useToastStore } from '../../../../components/Toast';
import { Panel } from '../../../../components/ui';

const BENEFITS = ['earn_commissions', 'marketing_tools', 'real_time_tracking', 'monthly_payments'];
const STEPS = ['share_link', 'client_subscribes', 'earn_commission'];
const TERMS = ['rate', 'payout', 'cookie', 'self_referral', 'changes', 'fraud'];

const AffiliationActivation: React.FC = () => {
  const { t } = useTranslation('profile');
  const [isActivating, setIsActivating] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { activateAffiliation } = useAffiliationStore();
  const { showToast } = useToastStore();
  const k = 'affiliation_components.activation';

  const handleActivate = async () => {
    if (!acceptedTerms) {
      showToast(t(`${k}.messages.accept_required`), 'error');
      return;
    }

    setIsActivating(true);
    try {
      await activateAffiliation();
      showToast(t(`${k}.messages.activation_success`), 'success');
    } catch (error) {
      showToast(t(`${k}.messages.activation_error`), 'error');
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <Panel flush className="max-w-3xl" bodyClassName="divide-y divide-gray-100 dark:divide-gray-800">
      <div className="p-5 sm:p-6">
        <h2 className="font-display text-xl font-semibold text-gray-900 dark:text-gray-50">{t(`${k}.title`)}</h2>
        <p className="mt-1 text-[0.9375rem] text-gray-500 dark:text-gray-400">{t(`${k}.subtitle`)}</p>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {BENEFITS.map((b) => (
            <li key={b} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
              <CheckIcon className="mt-0.5 size-4 shrink-0 text-orange-500" />
              {t(`${k}.benefits.items.${b}`)}
            </li>
          ))}
        </ul>
      </div>

      <div className="p-5 sm:p-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50">{t(`${k}.how_it_works.title`)}</h3>
        <ol className="mt-4 space-y-3">
          {STEPS.map((s, i) => (
            <li key={s} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-gray-100 text-xs font-semibold tabular-nums text-gray-700 dark:bg-gray-800 dark:text-gray-300">{i + 1}</span>
              {t(`${k}.how_it_works.steps.${s}`)}
            </li>
          ))}
        </ol>
      </div>

      <div className="p-5 sm:p-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50">{t(`${k}.terms.title`)}</h3>
        <div className="mt-3 max-h-48 overflow-y-auto rounded-xl bg-gray-50 p-4 text-sm text-gray-600 dark:bg-gray-800/60 dark:text-gray-300">
          <p className="mb-2">{t(`${k}.terms.intro`)}</p>
          <ul className="list-disc space-y-1.5 ps-5">
            {TERMS.map((term) => <li key={term}>{t(`${k}.terms.list.${term}`)}</li>)}
          </ul>
        </div>

        <label htmlFor="accept-terms" className="mt-4 flex cursor-pointer items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
          <input
            id="accept-terms"
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-0.5 size-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-800"
          />
          {t(`${k}.accept_terms`)}
        </label>

        <button onClick={handleActivate} disabled={!acceptedTerms || isActivating} className="btn-primary mt-5 w-full sm:w-auto">
          {isActivating ? t(`${k}.activating`) : t(`${k}.activate_button`)}
        </button>
      </div>
    </Panel>
  );
};

export default AffiliationActivation;
