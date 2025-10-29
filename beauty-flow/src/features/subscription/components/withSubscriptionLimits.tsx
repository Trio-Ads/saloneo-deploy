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
    const { checkAppointmentLimit: checkLimit } = useSubscriptionLimits();
    const { onLimitExceeded, ...rest } = props;

    const handleAction = (callback: () => void) => {
      const limitCheck = checkLimit();
      if (!limitCheck.canAdd) {
        if (onLimitExceeded) {
          onLimitExceeded(limitCheck.message || 'Limite atteinte');
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
