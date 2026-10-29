import React from 'react';
import { useNavigate } from 'react-router-dom';
import ClientForm from '../../clients/components/ClientForm';
import { ClientFormData } from '../../clients/types';
import TeamMemberForm from '../../team/components/TeamMemberForm';
import { TeamMemberFormData } from '../../team/types';
import ServiceForm from '../../services/components/ServiceForm';
import { ServiceFormData } from '../../services/types';
import ProductForm from '../../services/components/ProductForm';
import { ProductFormData } from '../../services/types';
import { useSubscriptionLimits } from '../hooks/useSubscriptionLimits';
import { LimitAlert } from './LimitAlert';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { isIosApp } from '../../../native';
import { Panel, EmptyState } from '../../../components/ui';

const LimitReached: React.FC<{
  titleKey: string;
  message?: string;
  upgradeMessage: string;
  onCancel: () => void;
  onUpgrade?: () => void;
}> = ({ titleKey, message, upgradeMessage, onCancel, onUpgrade }) => {
  const { t } = useTranslation('subscription');
  return (
    <Panel className="max-w-2xl mx-auto">
      <EmptyState
        icon={ExclamationTriangleIcon}
        title={t(`limits.${titleKey}`)}
        body={<>{message}{!isIosApp && <> {upgradeMessage}</>}</>}
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <button type="button" onClick={onCancel} className="btn-secondary">{t('limits.back')}</button>
            {!isIosApp && <button type="button" onClick={onUpgrade} className="btn-primary">{t('limits.see_plans')}</button>}
          </div>
        }
      />
    </Panel>
  );
};

// Hook pour gérer les limites dépassées
export const useLimitedForm = () => {
  const navigate = useNavigate();
  
  const handleLimitExceeded = () => {
    navigate('/subscription');
  };
  
  return { handleLimitExceeded };
};

// Wrapper pour le formulaire client avec vérification des limites
interface ClientFormWithLimitsProps {
  initialData?: ClientFormData;
  onSubmit: (data: ClientFormData) => void;
  onCancel: () => void;
  onLimitExceeded?: () => void;
}

export const ClientFormWithLimits: React.FC<ClientFormWithLimitsProps> = ({
  initialData,
  onSubmit,
  onCancel,
  onLimitExceeded
}) => {
  const { checkClientLimit, getUpgradeMessage } = useSubscriptionLimits();
  const clientLimit = checkClientLimit();
  
  // Si on édite un client existant, pas de vérification de limite
  if (initialData) {
    return (
      <ClientForm
        initialData={initialData}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );
  }
  
  // Si limite atteinte pour un nouveau client
  if (!clientLimit.canAdd) {
    return <LimitReached titleKey="clients_reached" message={clientLimit.message} upgradeMessage={getUpgradeMessage()} onCancel={onCancel} onUpgrade={onLimitExceeded} />;
  }
  
  // Afficher l'alerte si proche de la limite
  return (
    <div>
      <LimitAlert 
        limitCheck={clientLimit} 
        resourceType="clients"
        upgradeMessage={getUpgradeMessage()}
      />
      <ClientForm
        initialData={initialData}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    </div>
  );
};

// Wrapper pour le formulaire de membre d'équipe avec vérification des limites
interface TeamMemberFormWithLimitsProps {
  initialData?: TeamMemberFormData;
  onSubmit: (data: TeamMemberFormData) => void;
  onCancel: () => void;
  onLimitExceeded?: () => void;
}

export const TeamMemberFormWithLimits: React.FC<TeamMemberFormWithLimitsProps> = ({
  initialData,
  onSubmit,
  onCancel,
  onLimitExceeded
}) => {
  const { checkTeamMemberLimit, getUpgradeMessage } = useSubscriptionLimits();
  const teamLimit = checkTeamMemberLimit();
  
  // Si on édite un membre existant, pas de vérification de limite
  if (initialData) {
    return (
      <TeamMemberForm
        initialData={initialData}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );
  }
  
  // Si limite atteinte pour un nouveau membre
  if (!teamLimit.canAdd) {
    return <LimitReached titleKey="team_reached" message={teamLimit.message} upgradeMessage={getUpgradeMessage()} onCancel={onCancel} onUpgrade={onLimitExceeded} />;
  }
  
  // Afficher l'alerte si proche de la limite et le formulaire
  return (
    <div>
      <LimitAlert 
        limitCheck={teamLimit} 
        resourceType="team"
        upgradeMessage={getUpgradeMessage()}
      />
      <TeamMemberForm
        initialData={initialData}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    </div>
  );
};

// Wrapper pour le formulaire de service avec vérification des limites
interface ServiceFormWithLimitsProps {
  initialData?: ServiceFormData;
  onSubmit: (data: ServiceFormData) => void;
  onCancel: () => void;
  onLimitExceeded?: () => void;
  categories: string[];
  products: Array<{
    id: string;
    name: string;
    quantity: number;
    unit: string;
  }>;
}

export const ServiceFormWithLimits: React.FC<ServiceFormWithLimitsProps> = ({
  initialData,
  onSubmit,
  onCancel,
  onLimitExceeded,
  categories,
  products
}) => {
  const { checkServiceLimit, getUpgradeMessage } = useSubscriptionLimits();
  const serviceLimit = checkServiceLimit();
  
  // Si on édite un service existant, pas de vérification de limite
  if (initialData) {
    return (
      <ServiceForm
        initialData={initialData}
        onSubmit={onSubmit}
        onCancel={onCancel}
        categories={categories}
        products={products}
      />
    );
  }
  
  // Si limite atteinte pour un nouveau service
  if (!serviceLimit.canAdd) {
    return <LimitReached titleKey="services_reached" message={serviceLimit.message} upgradeMessage={getUpgradeMessage()} onCancel={onCancel} onUpgrade={onLimitExceeded} />;
  }
  
  // Afficher l'alerte si proche de la limite et le formulaire
  return (
    <div>
      <LimitAlert 
        limitCheck={serviceLimit} 
        resourceType="services"
        upgradeMessage={getUpgradeMessage()}
      />
      <ServiceForm
        initialData={initialData}
        onSubmit={onSubmit}
        onCancel={onCancel}
        categories={categories}
        products={products}
      />
    </div>
  );
};

// Wrapper pour le formulaire de produit avec vérification des limites
interface ProductFormWithLimitsProps {
  initialData?: ProductFormData;
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
  onLimitExceeded?: () => void;
}

export const ProductFormWithLimits: React.FC<ProductFormWithLimitsProps> = ({
  initialData,
  onSubmit,
  onCancel,
  onLimitExceeded
}) => {
  const { checkProductLimit, getUpgradeMessage } = useSubscriptionLimits();
  const productLimit = checkProductLimit();
  
  // Si on édite un produit existant, pas de vérification de limite
  if (initialData) {
    return (
      <ProductForm
        initialData={initialData}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );
  }
  
  // Si limite atteinte pour un nouveau produit
  if (!productLimit.canAdd) {
    return <LimitReached titleKey="products_reached" message={productLimit.message} upgradeMessage={getUpgradeMessage()} onCancel={onCancel} onUpgrade={onLimitExceeded} />;
  }
  
  // Afficher l'alerte si proche de la limite et le formulaire
  return (
    <div>
      <LimitAlert 
        limitCheck={productLimit} 
        resourceType="products"
        upgradeMessage={getUpgradeMessage()}
      />
      <ProductForm
        initialData={initialData}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    </div>
  );
};

// Export des autres formulaires avec limites (à implémenter)
export const AppointmentFormWithLimits = () => null; // TODO
