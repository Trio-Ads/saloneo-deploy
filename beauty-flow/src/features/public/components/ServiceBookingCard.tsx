import React from 'react';
import { 
  ClockIcon,
  CurrencyDollarIcon,
  SparklesIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { Service } from '../../services/types';
import ServiceGallery from './ServiceGallery';
import { useInterfaceStore } from '../../interface/store';
import { useProfileStore } from '../../profile/store';
import { getCurrencySymbol } from '../../../utils/currency';

interface ServiceBookingCardProps {
  service: Service;
  onBookingClick: (serviceId: string) => void;
}

const ServiceBookingCard: React.FC<ServiceBookingCardProps> = ({ service, onBookingClick }) => {
  const settings = useInterfaceStore((state) => state.settings);
  const { profile } = useProfileStore();
  const currencySymbol = getCurrencySymbol(profile.currency);

  return (
    <div className="glass-card p-6 group relative overflow-hidden backdrop-blur-xl border border-white/20
                    transform transition-all duration-500 hover:scale-[1.02] hover:shadow-xl
                    before:absolute before:inset-0 before:bg-gradient-to-br 
                    before:from-white/5 before:to-transparent before:opacity-0 
                    before:transition-opacity before:duration-300
                    hover:before:opacity-100">
      
      {/* Service Gallery */}
      <div className="mb-6">
        <ServiceGallery serviceId={service.id} />
      </div>

      {/* Service Header */}
      <div className="mb-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-bold text-gray-900 group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
            {service.name}
          </h3>
          <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg group-hover:from-purple-200 group-hover:to-pink-200 transition-all duration-300">
            <SparklesIcon className="h-5 w-5 text-purple-600" />
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 group-hover:line-clamp-none 
                      transition-all duration-500 group-hover:text-gray-700">
          {service.description}
        </p>
      </div>

      {/* Service Details */}
      <div className="flex justify-between items-center mb-6 glass-card bg-gradient-to-r from-gray-50/50 to-white/50 p-4 rounded-xl
                      transition-all duration-300 group-hover:from-purple-50/50 group-hover:to-pink-50/50 border border-white/20">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-600 shadow-lg">
            <ClockIcon className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="text-xs font-medium text-gray-500 block">Durée</span>
            <span className="text-gray-900 font-bold">
              {service.duration} min
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg">
            <CurrencyDollarIcon className="h-4 w-4 text-white" />
          </div>
          <div className="text-right">
            <span className="text-xs font-medium text-gray-500 block">Prix</span>
            <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {service.price.toFixed(2)} {currencySymbol}
            </span>
          </div>
        </div>
      </div>

      {/* Booking Button */}
      <div className="relative">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent" />
        <button
          onClick={() => onBookingClick(service.id)}
          className="glass-button w-full py-4 px-6 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-medium relative
                   overflow-hidden shadow-lg hover:shadow-xl border-0
                   transform transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <div className="flex items-center justify-center space-x-2">
            <CalendarDaysIcon className="h-5 w-5" />
            <span>Réserver maintenant</span>
          </div>
          
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                         transform -skew-x-12 -translate-x-full group-hover:translate-x-full 
                         transition-transform duration-1000" />
        </button>
      </div>

      {/* Floating badge */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="glass-card bg-gradient-to-r from-purple-500/90 to-pink-600/90 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
          Populaire
        </div>
      </div>
    </div>
  );
};

export default ServiceBookingCard;
