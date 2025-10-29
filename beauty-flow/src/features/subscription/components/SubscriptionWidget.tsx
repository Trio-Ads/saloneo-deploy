import React from 'react';
import { Link } from 'react-router-dom';
import { 
  SparklesIcon, 
  ArrowUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useSubscriptionLimits } from '../hooks/useSubscriptionLimits';
import { useSubscriptionStore } from '../store';
import { PlanType } from '../types';

export const SubscriptionWidget: React.FC = () => {
  const { subscription } = useSubscriptionStore();
  const {
    checkAppointmentLimit,
    checkClientLimit,
    checkServiceLimit,
    checkTeamMemberLimit,
    currentPlan
  } = useSubscriptionLimits();

  const limits = [
    { 
      name: 'Rendez-vous', 
      check: checkAppointmentLimit(), 
      icon: '📅',
      color: 'blue'
    },
    { 
      name: 'Clients', 
      check: checkClientLimit(), 
      icon: '👥',
      color: 'green'
    },
    { 
      name: 'Services', 
      check: checkServiceLimit(), 
      icon: '✨',
      color: 'purple'
    },
    { 
      name: 'Équipe', 
      check: checkTeamMemberLimit(), 
      icon: '👨‍💼',
      color: 'orange'
    }
  ];

  const getPlanBadgeColor = () => {
    switch (currentPlan) {
      case PlanType.FREE:
        return 'from-gray-500 to-gray-600';
      case PlanType.STARTER:
        return 'from-orange-500 to-red-500';
      case PlanType.PRO:
        return 'from-orange-500 to-orange-600';
      case PlanType.ENTERPRISE:
        return 'from-yellow-400 to-yellow-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const hasLimitWarning = limits.some(limit => {
    if (limit.check.limit === -1) return false;
    const percentage = (limit.check.current / limit.check.limit) * 100;
    return percentage >= 80;
  });

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg">
            <SparklesIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Votre Abonnement</h3>
            <div className="flex items-center mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${getPlanBadgeColor()} text-white`}>
                Plan {currentPlan}
              </span>
              {hasLimitWarning && (
                <ExclamationTriangleIcon className="h-4 w-4 text-orange-500 dark:text-orange-400 ml-2 animate-pulse" />
              )}
            </div>
          </div>
        </div>
        <Link
          to="/subscription"
          className="text-sm text-orange-600 dark:text-orange-500 hover:text-orange-700 dark:hover:text-orange-400 font-medium flex items-center"
        >
          Gérer
          <ArrowUpIcon className="h-3 w-3 ml-1" />
        </Link>
      </div>

      {/* Limites */}
      <div className="space-y-3">
        {limits.map((limit) => {
          const percentage = limit.check.limit === -1 
            ? 0 
            : (limit.check.current / limit.check.limit) * 100;
          const isNearLimit = percentage >= 80;
          const isAtLimit = percentage >= 100;
          
          return (
            <div key={limit.name} className="relative">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{limit.icon}</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{limit.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {limit.check.limit === -1 ? (
                    <>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{limit.check.current}</span>
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">Illimité</span>
                    </>
                  ) : (
                    <>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {limit.check.current} / {limit.check.limit}
                      </span>
                      {isAtLimit ? (
                        <ExclamationTriangleIcon className="h-4 w-4 text-red-500 dark:text-red-400" />
                      ) : isNearLimit ? (
                        <ExclamationTriangleIcon className="h-4 w-4 text-orange-500 dark:text-orange-400" />
                      ) : (
                        <CheckCircleIcon className="h-4 w-4 text-green-500 dark:text-green-400" />
                      )}
                    </>
                  )}
                </div>
              </div>
              
              {limit.check.limit !== -1 && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      isAtLimit ? 'bg-red-500 dark:bg-red-400' : 
                      isNearLimit ? 'bg-orange-500 dark:bg-orange-400' : 
                      'bg-green-500 dark:bg-green-400'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Call to action si limites proches */}
      {hasLimitWarning && currentPlan !== PlanType.ENTERPRISE && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            to="/subscription"
            className="w-full inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium text-sm hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
          >
            <ArrowUpIcon className="h-4 w-4 mr-2" />
            Augmenter mes limites
          </Link>
        </div>
      )}
    </div>
  );
};

// Mini widget pour la barre latérale
export const SubscriptionMiniWidget: React.FC = () => {
  const { subscription } = useSubscriptionStore();
  const { checkClientLimit, checkAppointmentLimit } = useSubscriptionLimits();
  
  const clientLimit = checkClientLimit();
  const appointmentLimit = checkAppointmentLimit();
  
  const clientPercentage = clientLimit.limit === -1 ? 0 : (clientLimit.current / clientLimit.limit) * 100;
  const appointmentPercentage = appointmentLimit.limit === -1 ? 0 : (appointmentLimit.current / appointmentLimit.limit) * 100;
  
  const hasWarning = clientPercentage >= 80 || appointmentPercentage >= 80;

  return (
    <Link
      to="/subscription"
      className="block p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Plan {subscription.currentPlan}</span>
        {hasWarning && (
          <ExclamationTriangleIcon className="h-4 w-4 text-orange-500 dark:text-orange-400 animate-pulse" />
        )}
      </div>
      
      <div className="space-y-2">
        <div>
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
            <span>Clients</span>
            <span>{clientLimit.current}/{clientLimit.limit === -1 ? '∞' : clientLimit.limit}</span>
          </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
              <div 
                className={`h-1 rounded-full ${
                  clientPercentage >= 100 ? 'bg-red-500 dark:bg-red-400' : 
                  clientPercentage >= 80 ? 'bg-orange-500 dark:bg-orange-400' : 
                  'bg-green-500 dark:bg-green-400'
                }`}
              style={{ width: `${Math.min(clientPercentage, 100)}%` }}
            />
          </div>
        </div>
        
        <div>
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Rendez-vous</span>
            <span>{appointmentLimit.current}/{appointmentLimit.limit === -1 ? '∞' : appointmentLimit.limit}</span>
          </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
              <div 
                className={`h-1 rounded-full ${
                  appointmentPercentage >= 100 ? 'bg-red-500 dark:bg-red-400' : 
                  appointmentPercentage >= 80 ? 'bg-orange-500 dark:bg-orange-400' : 
                  'bg-green-500 dark:bg-green-400'
                }`}
              style={{ width: `${Math.min(appointmentPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
};
