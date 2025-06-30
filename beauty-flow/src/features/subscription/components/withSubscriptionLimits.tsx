import React from 'react';
import { useSubscriptionLimits } from '../hooks/useSubscriptionLimits';
import { PlanLimits } from '../types';

interface WithSubscriptionLimitsProps {
  onLimitExceeded?: (message: string) => void;
}

export const withSubscriptionLimits = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  limitType: keyof PlanLimits,
  count: number = 1
) => {
  return function WithSubscriptionLimitsComponent(
    props: P & WithSubscriptionLimitsProps
  ) {
    const { checkLimit } = useSubscriptionLimits();
    const { onLimitExceeded, ...rest } = props;

    const handleAction = (callback: () => void) => {
      const { allowed, message } = checkLimit(limitType, count);
      if (!allowed) {
        if (onLimitExceeded) {
          onLimitExceeded(message);
        }
        return;
      }
      callback();
    };

    return (
      <WrappedComponent
        {...(rest as P)}
        onAction={handleAction}
      />
    );
  };
};

// Exemple d'utilisation:
// const AppointmentFormWithLimits = withSubscriptionLimits(AppointmentForm, 'appointments');
// const ClientFormWithLimits = withSubscriptionLimits(ClientForm, 'clients');
// const ServiceFormWithLimits = withSubscriptionLimits(ServiceForm, 'services');
// const TeamMemberFormWithLimits = withSubscriptionLimits(TeamMemberForm, 'teamMembers');
