import React, { useState } from 'react';
import { 
  SparklesIcon, 
  RocketLaunchIcon, 
  BuildingOfficeIcon,
  StarIcon,
  CheckCircleIcon,
  FireIcon,
  BoltIcon,
  ClockIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { Plan, PlanType, SubscriptionDuration, DURATION_PRICES, DURATION_DISCOUNTS, DurationPrice, DurationDiscount } from '../types';

interface PlanCardWithDurationProps {
  plan: Plan;
  isCurrentPlan: boolean;
  onSelect: (planType: PlanType, duration: SubscriptionDuration) => void;
}

export const PlanCardWithDuration: React.FC<PlanCardWithDurationProps> = ({ plan, isCurrentPlan, onSelect }) => {
  const { type, price, limits } = plan;
  const [selectedDuration, setSelectedDuration] = useState<SubscriptionDuration>(SubscriptionDuration.MONTHLY);

  const durationPrices = DURATION_PRICES[type];
  const canSelectDuration = type === PlanType.STARTER || type === PlanType.PRO;

  const getDurationLabel = (duration: SubscriptionDuration) => {
    switch (duration) {
      case SubscriptionDuration.MONTHLY:
        return 'Mensuel';
      case SubscriptionDuration.YEARLY:
        return '1 an';
      case SubscriptionDuration.BIENNIAL:
        return '2 ans';
      case SubscriptionDuration.TRIENNIAL:
        return '3 ans';
    }
  };

  const getDisplayPrice = () => {
    if (!canSelectDuration || !durationPrices) {
      return price;
    }

    const durationKey = selectedDuration.toLowerCase() as 'monthly' | 'yearly' | 'biennial' | 'triennial';
    const selectedPrice = durationPrices[durationKey];
    const monthlyEquivalent = selectedPrice / {
      [SubscriptionDuration.MONTHLY]: 1,
      [SubscriptionDuration.YEARLY]: 12,
      [SubscriptionDuration.BIENNIAL]: 24,
      [SubscriptionDuration.TRIENNIAL]: 36
    }[selectedDuration];

    return {
      amount: selectedPrice,
      monthlyEquivalent: Math.round(monthlyEquivalent),
      currency: durationPrices.currency,
      isPromo: price.isPromo,
      regularAmount: price.regularAmount
    };
  };

  const getSavings = () => {
    if (!canSelectDuration || !durationPrices || selectedDuration === SubscriptionDuration.MONTHLY) {
      return null;
    }

    const monthlyPrice = durationPrices.monthly;
    const selectedPriceKey = selectedDuration.toLowerCase() as 'yearly' | 'biennial' | 'triennial';
    const selectedPrice = durationPrices[selectedPriceKey];
    const months = {
      [SubscriptionDuration.YEARLY]: 12,
      [SubscriptionDuration.BIENNIAL]: 24,
      [SubscriptionDuration.TRIENNIAL]: 36
    }[selectedDuration as Exclude<SubscriptionDuration, 'MONTHLY'>];

    const totalWithoutDiscount = monthlyPrice * months;
    const savings = totalWithoutDiscount - selectedPrice;
    const discountKey = selectedDuration.toLowerCase() as 'yearly' | 'biennial' | 'triennial';
    const discount = DURATION_DISCOUNTS[discountKey];

    return { savings, discount, months };
  };

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
  const displayPrice = getDisplayPrice();
  const savings = getSavings();

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
        <div className="text-center mb-6">
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
        </div>

        {/* Sélecteur de durée */}
        {canSelectDuration && (
          <div className="mb-6">
            <div className="flex items-center justify-center mb-3">
              <ClockIcon className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm text-gray-600 font-medium">Choisissez votre engagement</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(SubscriptionDuration).map((duration) => (
                <button
                  key={duration}
                  onClick={() => setSelectedDuration(duration)}
                  className={`
                    relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${selectedDuration === duration
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {getDurationLabel(duration)}
                  {duration !== SubscriptionDuration.MONTHLY && (
                    <span className={`
                      absolute -top-2 -right-2 text-xs font-bold px-2 py-0.5 rounded-full
                      ${selectedDuration === duration
                        ? 'bg-yellow-400 text-gray-900'
                        : 'bg-red-500 text-white'
                      }
                    `}>
                      -{DURATION_DISCOUNTS[duration.toLowerCase() as keyof DurationDiscount] || 0}%
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Prix */}
        <div className="mb-6">
          {price.customQuote ? (
            <div className="text-2xl font-bold text-gray-900 text-center">
              Consultez-nous
            </div>
          ) : (
            <div className="space-y-2">
              {canSelectDuration && selectedDuration !== SubscriptionDuration.MONTHLY ? (
                <>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">
                      {displayPrice.amount} {displayPrice.currency}
                    </div>
                    <div className="text-sm text-gray-600">
                      soit {'monthlyEquivalent' in displayPrice ? displayPrice.monthlyEquivalent : displayPrice.amount} {'currency' in displayPrice ? displayPrice.currency : 'DZD'}/mois
                    </div>
                  </div>
                  {savings && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                      <div className="flex items-center justify-center">
                        <TagIcon className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-green-700 font-medium">
                          Économisez {savings.savings} {'currency' in displayPrice ? displayPrice.currency : 'DZD'}
                        </span>
                      </div>
                      <div className="text-xs text-green-600 text-center mt-1">
                        {Math.round(savings.months * (1 - savings.discount / 100))} mois payés pour {savings.months}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900">
                    {displayPrice.amount} {displayPrice.currency}
                    <span className="text-lg text-gray-500 font-normal">/mois</span>
                  </div>
                  {displayPrice.isPromo && displayPrice.regularAmount && (
                    <div className="flex items-center justify-center space-x-2 mt-2">
                      <span className="text-lg text-gray-500 line-through">
                        {displayPrice.regularAmount} {displayPrice.currency}
                      </span>
                      <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white text-sm font-bold px-3 py-1 rounded-full animate-pulse">
                        <FireIcon className="h-3 w-3 inline mr-1" />
                        PROMO
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Liste des fonctionnalités */}
        <div className="space-y-3 mb-6">
          {[
            { value: limits.appointments, label: 'Rendez-vous' },
            { value: limits.clients, label: 'Clients' },
            { value: limits.services, label: 'Services' },
            { value: limits.teamMembers, label: 'Membres d\'équipe' },
            { value: limits.stock, label: 'Gestion de stock' },
            { value: limits.onlineBooking, label: 'Réservation en ligne' },
            { value: limits.customInterface, label: 'Interface personnalisable' }
          ].map((item, index) => (
            <React.Fragment key={item.label}>
              {renderLimit(item.value, item.label, index)}
            </React.Fragment>
          ))}
        </div>

        {/* Bouton d'action */}
        <button
          onClick={() => onSelect(type, selectedDuration)}
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
