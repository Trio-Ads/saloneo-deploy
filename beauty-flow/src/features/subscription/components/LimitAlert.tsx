import React from 'react';
import { useTranslation } from 'react-i18next';
import { LimitCheck } from '../hooks/useSubscriptionLimits';
import { SubscriptionLimitWidget } from './SubscriptionLimitWidget';

interface LimitAlertProps {
  limitCheck: LimitCheck;
  resourceType: string;
  upgradeMessage?: string;
}

/** `resourceType` : clients | team | services | products. Notice au-dessus d'un formulaire, seulement à partir de 80 % d'usage. */
export const LimitAlert: React.FC<LimitAlertProps> = ({ limitCheck, resourceType }) => {
  const { t } = useTranslation('subscription');
  if (limitCheck.limit === -1 || limitCheck.current / limitCheck.limit < 0.8) return null;

  return (
    <div className="mb-4">
      <SubscriptionLimitWidget title="" planName="" limitCheck={limitCheck} resourceType={t(`resources.${resourceType}`, { defaultValue: resourceType })} />
    </div>
  );
};
