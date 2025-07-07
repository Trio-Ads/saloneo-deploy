import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChartBarIcon, 
  SparklesIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowUpIcon
} from '@heroicons/react/24/outline';
import { LimitCheck } from '../hooks/useSubscriptionLimits';

interface SubscriptionLimitWidgetProps {
  title: string;
  icon?: React.ReactNode;
  limitCheck: LimitCheck;
  planName: string;
  resourceType: string;
}

export const SubscriptionLimitWidget: React.FC<SubscriptionLimitWidgetProps> = ({
  title,
  icon,
  limitCheck,
  planName,
  resourceType
}) => {
  const navigate = useNavigate();
  const { current, limit, remaining } = limitCheck;
  const percentage = limit === -1 ? 0 : (current / limit) * 100;
  
  // Déterminer la couleur selon le pourcentage
  const getColorClasses = () => {
    if (limit === -1) return {
      bg: 'from-blue-500 to-cyan-600',
      text: 'text-blue-600',
      progressBg: 'bg-blue-100',
      progressBar: 'from-blue-500 to-cyan-600'
    };
    
    if (percentage >= 90) return {
      bg: 'from-red-500 to-pink-600',
      text: 'text-red-600',
      progressBg: 'bg-red-100',
      progressBar: 'from-red-500 to-pink-600'
    };
    
    if (percentage >= 70) return {
      bg: 'from-orange-500 to-amber-600',
      text: 'text-orange-600',
      progressBg: 'bg-orange-100',
      progressBar: 'from-orange-500 to-amber-600'
    };
    
    return {
      bg: 'from-green-500 to-emerald-600',
      text: 'text-green-600',
      progressBg: 'bg-green-100',
      progressBar: 'from-green-500 to-emerald-600'
    };
  };
  
  const colors = getColorClasses();
  const isUnlimited = limit === -1;
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;
  
  const handleUpgradeClick = () => {
    navigate('/subscription');
  };
  
  return (
    <div className="group relative">
      {/* Effet de brillance en arrière-plan */}
      <div className={`absolute inset-0 bg-gradient-to-r ${colors.bg} rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300`}></div>
      
      {/* Contenu principal */}
      <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {icon || (
              <div className={`p-2 bg-gradient-to-r ${colors.bg} rounded-xl shadow-lg`}>
                <ChartBarIcon className="h-5 w-5 text-white" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-xs text-gray-500">Plan {planName}</p>
            </div>
          </div>
          
          {/* Badge d'état */}
          {isUnlimited ? (
            <div className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
              <SparklesIcon className="h-3 w-3 mr-1" />
              Illimité
            </div>
          ) : isAtLimit ? (
            <div className="flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium animate-pulse">
              <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
              Limite atteinte
            </div>
          ) : isNearLimit ? (
            <div className="flex items-center px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
              <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
              Limite proche
            </div>
          ) : (
            <div className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              <CheckCircleIcon className="h-3 w-3 mr-1" />
              Disponible
            </div>
          )}
        </div>
        
        {/* Barre de progression */}
        {!isUnlimited && (
          <div className="mb-4">
            <div className={`h-3 ${colors.progressBg} rounded-full overflow-hidden`}>
              <div 
                className={`h-full bg-gradient-to-r ${colors.progressBar} rounded-full transition-all duration-500 ease-out relative overflow-hidden`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              >
                {/* Effet de brillance animé */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              </div>
            </div>
          </div>
        )}
        
        {/* Statistiques */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <p className={`text-2xl font-bold ${colors.text}`}>
                {current}
                {!isUnlimited && <span className="text-gray-400 text-lg">/{limit}</span>}
              </p>
              <p className="text-xs text-gray-500">
                {isUnlimited ? 'Utilisés' : `${remaining} ${resourceType} restants`}
              </p>
            </div>
            
            {!isUnlimited && (
              <div className="text-right">
                <p className={`text-lg font-semibold ${colors.text}`}>
                  {Math.round(percentage)}%
                </p>
                <p className="text-xs text-gray-500">Utilisé</p>
              </div>
            )}
          </div>
          
          {/* Bouton Upgrade si nécessaire */}
          {isNearLimit && !isUnlimited && (
            <button
              onClick={handleUpgradeClick}
              className={`px-4 py-2 bg-gradient-to-r ${colors.bg} text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-2`}
            >
              <ArrowUpIcon className="h-4 w-4" />
              <span>Upgrade</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Widget compact pour les tableaux de bord
export const SubscriptionLimitWidgetCompact: React.FC<SubscriptionLimitWidgetProps> = ({
  title,
  icon,
  limitCheck,
  planName,
  resourceType
}) => {
  const navigate = useNavigate();
  const { current, limit, remaining } = limitCheck;
  const percentage = limit === -1 ? 0 : (current / limit) * 100;
  const isUnlimited = limit === -1;
  const isNearLimit = percentage >= 80;
  
  const getProgressColor = () => {
    if (isUnlimited) return 'bg-blue-500';
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-orange-500';
    return 'bg-green-500';
  };
  
  return (
    <div 
      className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
      onClick={() => navigate('/subscription')}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {icon || <ChartBarIcon className="h-4 w-4 text-gray-600" />}
          <span className="text-sm font-medium text-gray-700">{title}</span>
        </div>
        {isNearLimit && !isUnlimited && (
          <ExclamationTriangleIcon className="h-4 w-4 text-orange-500 animate-pulse" />
        )}
      </div>
      
      {!isUnlimited && (
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
          <div 
            className={`h-full ${getProgressColor()} rounded-full transition-all duration-300`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-600">
          {isUnlimited ? 'Illimité' : `${current}/${limit}`}
        </span>
        {!isUnlimited && (
          <span className="text-xs text-gray-500">
            {remaining} restants
          </span>
        )}
      </div>
    </div>
  );
};

// Style pour l'animation shimmer
const shimmerStyle = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  .animate-shimmer {
    animation: shimmer 2s infinite;
  }
`;

// Ajouter le style au document
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = shimmerStyle;
  document.head.appendChild(style);
}
