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
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-2xl p-8 text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 dark:text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-800 dark:text-red-300 mb-4">
            Limite de clients atteinte
          </h2>
          <p className="text-red-700 dark:text-red-400 mb-6">
            {clientLimit.message}
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-8">
            {getUpgradeMessage()}
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Retour
            </button>
            <button
              onClick={onLimitExceeded}
              className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Voir les plans
            </button>
          </div>
        </div>
      </div>
    );
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
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-800 mb-4">
            Limite de membres d'équipe atteinte
          </h2>
          <p className="text-red-700 mb-6">
            {teamLimit.message}
          </p>
          <p className="text-gray-700 mb-8">
            {getUpgradeMessage()}
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-white text-gray-700 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Retour
            </button>
            <button
              onClick={onLimitExceeded}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Voir les plans
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Afficher l'alerte si proche de la limite et le formulaire
  return (
    <div>
      <LimitAlert 
        limitCheck={teamLimit} 
        resourceType="membres d'équipe"
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
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-800 mb-4">
            Limite de services atteinte
          </h2>
          <p className="text-red-700 mb-6">
            {serviceLimit.message}
          </p>
          <p className="text-gray-700 mb-8">
            {getUpgradeMessage()}
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-white text-gray-700 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Retour
            </button>
            <button
              onClick={onLimitExceeded}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Voir les plans
            </button>
          </div>
        </div>
      </div>
    );
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
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-800 mb-4">
            Limite de produits atteinte
          </h2>
          <p className="text-red-700 mb-6">
            {productLimit.message}
          </p>
          <p className="text-gray-700 mb-8">
            {getUpgradeMessage()}
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-white text-gray-700 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Retour
            </button>
            <button
              onClick={onLimitExceeded}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Voir les plans
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Afficher l'alerte si proche de la limite et le formulaire
  return (
    <div>
      <LimitAlert 
        limitCheck={productLimit} 
        resourceType="produits"
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
