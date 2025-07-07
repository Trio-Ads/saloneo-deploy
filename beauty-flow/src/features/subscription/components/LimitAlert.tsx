import React from 'react';
import { ExclamationTriangleIcon, ArrowUpIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { LimitCheck } from '../hooks/useSubscriptionLimits';

interface LimitAlertProps {
  limitCheck: LimitCheck;
  resourceType: string;
  upgradeMessage?: string;
}

export const LimitAlert: React.FC<LimitAlertProps> = ({ 
  limitCheck, 
  resourceType,
  upgradeMessage 
}) => {
  if (limitCheck.limit === -1) {
    return null; // Pas de limite pour ce plan
  }

  const percentageUsed = (limitCheck.current / limitCheck.limit) * 100;
  const isNearLimit = percentageUsed >= 80;
  const isAtLimit = !limitCheck.canAdd;

  if (percentageUsed < 50) {
    return null; // Ne pas afficher d'alerte si utilisation < 50%
  }

  return (
    <div className={`
      rounded-lg p-4 mb-4 border
      ${isAtLimit 
        ? 'bg-red-50 border-red-200' 
        : isNearLimit 
          ? 'bg-yellow-50 border-yellow-200' 
          : 'bg-blue-50 border-blue-200'
      }
    `}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {isAtLimit ? (
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
          ) : isNearLimit ? (
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
          ) : (
            <CheckCircleIcon className="h-5 w-5 text-blue-600" />
          )}
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${
            isAtLimit ? 'text-red-800' : isNearLimit ? 'text-yellow-800' : 'text-blue-800'
          }`}>
            {isAtLimit 
              ? `Limite de ${resourceType} atteinte`
              : isNearLimit 
                ? `Attention : Limite de ${resourceType} bientôt atteinte`
                : `Utilisation des ${resourceType}`
            }
          </h3>
          <div className="mt-2 text-sm">
            <p className={isAtLimit ? 'text-red-700' : isNearLimit ? 'text-yellow-700' : 'text-blue-700'}>
              {limitCheck.current} / {limitCheck.limit} utilisés
              {limitCheck.remaining > 0 && ` (${limitCheck.remaining} restants)`}
            </p>
            
            {/* Barre de progression */}
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  isAtLimit 
                    ? 'bg-red-600' 
                    : isNearLimit 
                      ? 'bg-yellow-500' 
                      : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(percentageUsed, 100)}%` }}
              />
            </div>

            {limitCheck.message && (
              <p className={`mt-2 ${
                isAtLimit ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-blue-600'
              }`}>
                {limitCheck.message}
              </p>
            )}

            {(isAtLimit || isNearLimit) && upgradeMessage && (
              <div className="mt-3">
                <Link
                  to="/subscription"
                  className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium ${
                    isAtLimit
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-yellow-600 text-white hover:bg-yellow-700'
                  } transition-colors duration-200`}
                >
                  <ArrowUpIcon className="h-4 w-4 mr-1" />
                  Mettre à niveau
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant pour afficher un résumé des limites
export const LimitsSummary: React.FC<{
  appointments: LimitCheck;
  clients: LimitCheck;
  services: LimitCheck;
  teamMembers: LimitCheck;
}> = ({ appointments, clients, services, teamMembers }) => {
  const limits = [
    { name: 'Rendez-vous', check: appointments, icon: '📅' },
    { name: 'Clients', check: clients, icon: '👥' },
    { name: 'Services', check: services, icon: '✨' },
    { name: 'Équipe', check: teamMembers, icon: '👨‍💼' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {limits.map((limit) => {
        const percentage = limit.check.limit === -1 
          ? 0 
          : (limit.check.current / limit.check.limit) * 100;
        
        return (
          <div key={limit.name} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{limit.icon}</span>
              <span className="text-sm font-medium text-gray-600">{limit.name}</span>
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {limit.check.current}
              {limit.check.limit !== -1 && (
                <span className="text-sm font-normal text-gray-500"> / {limit.check.limit}</span>
              )}
            </div>
            {limit.check.limit !== -1 && (
              <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    percentage >= 100 ? 'bg-red-500' : 
                    percentage >= 80 ? 'bg-yellow-500' : 
                    'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            )}
            {limit.check.limit === -1 && (
              <div className="text-xs text-green-600 mt-1">Illimité</div>
            )}
          </div>
        );
      })}
    </div>
  );
};
