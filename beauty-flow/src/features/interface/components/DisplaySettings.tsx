import React from 'react';
import { 
  EyeIcon,
  CurrencyDollarIcon,
  InformationCircleIcon,
  Squares2X2Icon,
  ClockIcon,
  ChartBarIcon,
  FireIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { InterfaceSettings } from '../types';

interface DisplaySettingsProps {
  settings: InterfaceSettings['serviceDisplay'];
  onChange: (settings: InterfaceSettings['serviceDisplay']) => void;
}

const DisplaySettings: React.FC<DisplaySettingsProps> = ({ settings, onChange }) => {
  const viewOptions = [
    { value: 'category', label: 'Par catégorie', icon: Squares2X2Icon, description: 'Organiser par type de service' },
    { value: 'price', label: 'Par prix', icon: CurrencyDollarIcon, description: 'Du moins cher au plus cher' },
    { value: 'duration', label: 'Par durée', icon: ClockIcon, description: 'Du plus court au plus long' },
    { value: 'popularity', label: 'Par popularité', icon: FireIcon, description: 'Les plus demandés en premier' }
  ];

  const priceOptions = [
    { value: 'fixed', label: 'Prix fixe', icon: CurrencyDollarIcon, description: 'Afficher le prix exact' },
    { value: 'from', label: 'Environ', icon: ChartBarIcon, description: 'Afficher "Environ X€"' },
    { value: 'range', label: 'Fourchette environ', icon: CurrencyDollarIcon, description: 'Afficher "Environ X€ - Y€"' },
    { value: 'hidden', label: 'Masquer les prix', icon: EyeSlashIcon, description: 'Ne pas afficher les prix' }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Vue par défaut des services */}
      <div className="glass-card p-6 border border-white/20">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg">
            <EyeIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              Vue par défaut des services
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Comment organiser l'affichage de vos services</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {viewOptions.map((option) => {
            const IconComponent = option.icon;
            const isSelected = settings.defaultView === option.value;
            
            return (
              <button
                key={option.value}
                onClick={() => onChange({ ...settings, defaultView: option.value as any })}
                className={`glass-card p-4 transition-all duration-300 transform hover:scale-105 border border-white/20 dark:border-gray-700/20 text-left ${
                  isSelected
                    ? 'bg-gradient-to-r from-orange-500/20 to-orange-600/20 shadow-lg ring-2 ring-orange-500/50'
                    : 'hover:bg-white/5 dark:hover:bg-gray-700/5 hover:shadow-lg'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${
                    isSelected 
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600' 
                      : 'bg-gradient-to-r from-gray-400 to-gray-600'
                  }`}>
                    <IconComponent className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-medium ${
                      isSelected ? 'text-orange-600 dark:text-orange-500' : 'text-gray-900 dark:text-gray-200'
                    }`}>
                      {option.label}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{option.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Affichage des prix */}
      <div className="glass-card p-6 border border-white/20">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg">
            <CurrencyDollarIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              Affichage des prix
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Comment présenter vos tarifs aux clients</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {priceOptions.map((option) => {
            const IconComponent = option.icon;
            const isSelected = settings.priceDisplay === option.value;
            
            return (
              <button
                key={option.value}
                onClick={() => onChange({ ...settings, priceDisplay: option.value as any })}
                className={`glass-card p-4 transition-all duration-300 transform hover:scale-105 border border-white/20 dark:border-gray-700/20 text-left ${
                  isSelected
                    ? 'bg-gradient-to-r from-orange-500/20 to-orange-600/20 shadow-lg ring-2 ring-orange-500/50'
                    : 'hover:bg-white/5 dark:hover:bg-gray-700/5 hover:shadow-lg'
                }`}
              >
                <div className="text-center">
                  <div className={`mx-auto p-3 rounded-lg mb-3 ${
                    isSelected 
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600' 
                      : 'bg-gradient-to-r from-gray-400 to-gray-600'
                  }`}>
                    <IconComponent className="h-6 w-6 text-white mx-auto" />
                  </div>
                  <h4 className={`font-medium mb-2 ${
                    isSelected ? 'text-orange-600 dark:text-orange-500' : 'text-gray-900 dark:text-gray-200'
                  }`}>
                    {option.label}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{option.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Aperçu des paramètres */}
      <div className="glass-card p-6 bg-gradient-to-r from-orange-50/50 to-orange-100/50 dark:from-orange-900/10 dark:to-orange-800/10 border border-orange-200/50 dark:border-orange-700/50">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg">
            <EyeIcon className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-bold text-orange-800 dark:text-orange-300">Aperçu de vos paramètres</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-card bg-white/70 dark:bg-gray-800/70 p-4 rounded-xl">
            <div className="flex items-center space-x-2 mb-2">
              <Squares2X2Icon className="h-4 w-4 text-orange-600 dark:text-orange-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Vue sélectionnée</span>
            </div>
            <p className="text-orange-800 dark:text-orange-300 font-bold">
              {viewOptions.find(opt => opt.value === settings.defaultView)?.label}
            </p>
          </div>
          
          <div className="glass-card bg-white/70 dark:bg-gray-800/70 p-4 rounded-xl">
            <div className="flex items-center space-x-2 mb-2">
              <CurrencyDollarIcon className="h-4 w-4 text-orange-600 dark:text-orange-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Affichage prix</span>
            </div>
            <p className="text-orange-800 dark:text-orange-300 font-bold">
              {priceOptions.find(opt => opt.value === settings.priceDisplay)?.label}
            </p>
          </div>
        </div>
      </div>

      {/* Information importante */}
      <div className="glass-card p-6 bg-gradient-to-r from-orange-50/50 to-orange-100/50 dark:from-orange-900/10 dark:to-orange-800/10 border border-orange-200/50 dark:border-orange-700/50">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg">
            <InformationCircleIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-orange-800 dark:text-orange-300 mb-2">Impact de ces paramètres</h4>
            <div className="space-y-2 text-sm text-orange-700 dark:text-orange-300">
              <p>• Ces paramètres affectent l'affichage de tous vos services sur votre page publique</p>
              <p>• Les clients verront vos services organisés selon la vue sélectionnée</p>
              <p>• L'affichage des prix influence la perception de vos tarifs</p>
              <p>• Vous pouvez modifier ces paramètres à tout moment</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisplaySettings;
