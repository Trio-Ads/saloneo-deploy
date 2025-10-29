import React from 'react';
import { 
  SparklesIcon, 
  RocketLaunchIcon, 
  BuildingOfficeIcon,
  StarIcon,
  CheckCircleIcon,
  FireIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { Plan, PlanType } from '../types';

interface PlanCardProps {
  plan: Plan;
  isCurrentPlan: boolean;
  onSelect: (planType: PlanType) => void;
}

export const PlanCard: React.FC<PlanCardProps> = ({ plan, isCurrentPlan, onSelect }) => {
  const { type, price, limits } = plan;

  const renderLimit = (value: number | boolean, label: string, index: number) => {
    const checkIcon = (
      <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 animate-bounce" style={{ animationDelay: `${index * 0.1}s` }} />
    );
    
    if (typeof value === 'boolean') {
      return (
        <div className="flex items-center text-sm text-gray-700 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
          {value ? checkIcon : <span className="text-red-500 mr-2">✗</span>}
          {label}
        </div>
      );
    }
    return (
      <div className="flex items-center text-sm text-gray-700 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
        {checkIcon}
        {value === -1 ? `${label} illimités` : `${label} (${value})`}
      </div>
    );
  };

  const getPlanConfig = () => {
    switch (type) {
      case PlanType.FREE:
        return {
          icon: SparklesIcon,
          badge: null,
          cardClass: "bg-white/90 backdrop-blur-xl border border-gray-200 hover:border-gray-300",
          glowClass: "",
          popular: false
        };
      case PlanType.STARTER:
        return {
          icon: RocketLaunchIcon,
          badge: { text: "POPULAIRE", class: "bg-gradient-to-r from-orange-500 to-red-500 animate-pulse" },
          cardClass: "bg-white/90 backdrop-blur-xl border-2 border-orange-300 hover:border-orange-400",
          glowClass: "shadow-orange-200 hover:shadow-orange-300",
          popular: true
        };
      case PlanType.PRO:
        return {
          icon: BoltIcon,
          badge: { text: "RECOMMANDÉ", class: "bg-gradient-to-r from-indigo-500 to-purple-600 animate-pulse" },
          cardClass: "bg-white/90 backdrop-blur-xl border-2 border-indigo-400 hover:border-indigo-500 transform hover:scale-105",
          glowClass: "shadow-indigo-200 hover:shadow-indigo-300 hover:shadow-2xl",
          popular: true
        };
      case PlanType.ENTERPRISE:
        return {
          icon: BuildingOfficeIcon,
          badge: { text: "PREMIUM", class: "bg-gradient-to-r from-yellow-400 to-yellow-600 animate-pulse" },
          cardClass: "bg-gradient-to-br from-white/95 to-yellow-50/90 backdrop-blur-xl border-2 border-yellow-400 hover:border-yellow-500",
          glowClass: "shadow-yellow-200 hover:shadow-yellow-300",
          popular: false
        };
      default:
        return {
          icon: SparklesIcon,
          badge: null,
          cardClass: "bg-white/90 backdrop-blur-xl border border-gray-200",
          glowClass: "",
          popular: false
        };
    }
  };

  const config = getPlanConfig();
  const IconComponent = config.icon;

  return (
    <div className="relative group">
      {/* Particules flottantes pour les plans populaires */}
      {config.popular && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-4 left-4 w-1 h-1 bg-yellow-400 rounded-full animate-ping"></div>
          <div className="absolute top-8 right-6 w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce"></div>
          <div className="absolute bottom-8 left-6 w-1 h-1 bg-pink-400 rounded-full animate-pulse"></div>
        </div>
      )}

      <div className={`
        relative rounded-3xl p-8 shadow-xl transition-all duration-500 hover:shadow-2xl
        ${config.cardClass} ${config.glowClass}
        ${isCurrentPlan ? 'ring-4 ring-indigo-500 ring-opacity-50' : ''}
        group-hover:transform group-hover:scale-105
      `}>
        
        {/* Badge en haut */}
        {config.badge && (
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <div className={`${config.badge.class} text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg`}>
              {config.badge.text}
            </div>
          </div>
        )}

        {/* Plan actuel badge */}
        {isCurrentPlan && (
          <div className="absolute -top-4 right-4">
            <div className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-bounce">
              ACTUEL
            </div>
          </div>
        )}

        {/* Header avec icône */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-2xl shadow-xl group-hover:scale-110 transition-transform duration-300">
                <IconComponent className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <h3 className="text-3xl font-bold mb-4 text-gray-900 group-hover:text-indigo-600 transition-colors duration-300">
            {type}
          </h3>
          
          <div className="mb-4">
            {price.customQuote ? (
              <div className="text-2xl font-bold text-gray-900">
                Consultez-nous
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-4xl font-bold text-gray-900">
                  {price.amount} {price.currency}
                  <span className="text-lg text-gray-500 font-normal">/mois</span>
                </div>
                {price.isPromo && (
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-lg text-gray-500 line-through">
                      {price.regularAmount} {price.currency}
                    </span>
                    <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white text-sm font-bold px-3 py-1 rounded-full animate-pulse">
                      <FireIcon className="h-3 w-3 inline mr-1" />
                      -40%
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Liste des fonctionnalités */}
        <div className="space-y-4 mb-8">
          {[
            { value: limits.appointments, label: 'Rendez-vous' },
            { value: limits.clients, label: 'Clients' },
            { value: limits.services, label: 'Services' },
            { value: limits.teamMembers, label: 'Membres d\'équipe' },
            { value: limits.stock, label: 'Gestion de stock' },
            { value: limits.onlineBooking, label: 'Réservation en ligne' },
            { value: limits.customInterface, label: 'Interface personnalisable' }
          ].map((item, index) => renderLimit(item.value, item.label, index))}
        </div>

        {/* Bouton d'action */}
        <button
          onClick={() => onSelect(type)}
          disabled={isCurrentPlan}
          className={`
            w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 transform
            ${isCurrentPlan
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white hover:scale-105 shadow-lg hover:shadow-xl'
            }
          `}
        >
          {isCurrentPlan ? (
            <div className="flex items-center justify-center">
              <StarIcon className="h-5 w-5 mr-2" />
              Plan actuel
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <RocketLaunchIcon className="h-5 w-5 mr-2" />
              Choisir ce plan
            </div>
          )}
        </button>

        {/* Garantie */}
        {!isCurrentPlan && (
          <div className="text-center mt-4">
            <p className="text-xs text-gray-500">
              ✓ Essai gratuit 14 jours • Sans engagement
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
