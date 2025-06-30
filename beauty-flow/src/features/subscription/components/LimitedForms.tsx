import { withSubscriptionLimits } from './withSubscriptionLimits';
import { useToastStore } from '../../../components/Toast';
import AppointmentForm from '../../appointments/components/AppointmentForm';
import ClientForm from '../../clients/components/ClientForm';
import ServiceForm from '../../services/components/ServiceForm';
import TeamMemberForm from '../../team/components/TeamMemberForm';

// Créer des versions avec limites des formulaires
export const AppointmentFormWithLimits = withSubscriptionLimits(
  AppointmentForm,
  'appointments',
  1
);

export const ClientFormWithLimits = withSubscriptionLimits(
  ClientForm,
  'clients',
  1
);

export const ServiceFormWithLimits = withSubscriptionLimits(
  ServiceForm,
  'services',
  1
);

export const TeamMemberFormWithLimits = withSubscriptionLimits(
  TeamMemberForm,
  'teamMembers',
  1
);

// Hook pour gérer les limites avec toast
export const useLimitedForm = () => {
  const showToast = useToastStore((state) => state.showToast);

  const handleLimitExceeded = (message: string) => {
    showToast(message);
  };

  return { handleLimitExceeded };
};
