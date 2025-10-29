import React from 'react';
import { useTranslation } from 'react-i18next';
import { Service } from '../types';
import { useInterfaceStore } from '../../interface/store';
import ServiceImageUpload from './ServiceImageUpload';

interface ServiceOnlineSettingsProps {
  service: Service;
}

const ServiceOnlineSettings: React.FC<ServiceOnlineSettingsProps> = ({ service }) => {
  const { t } = useTranslation('services');
  const { serviceSettings, updateServiceSettings, initializeServiceSettings } = useInterfaceStore();

  // Initialiser les paramètres si nécessaire
  React.useEffect(() => {
    initializeServiceSettings(service.id);
  }, [service.id, initializeServiceSettings]);

  const settings = serviceSettings.find(s => s.id === service.id);

  if (!settings) return null;

  const handleOnlineToggle = () => {
    updateServiceSettings(service.id, {
      isOnline: !settings.isOnline
    });
  };

  const handleBookingTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateServiceSettings(service.id, {
      minimumBookingTime: parseInt(e.target.value)
    });
  };

  return (
    <div className="mt-4 space-y-6 border-t pt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <label htmlFor={`online-toggle-${service.id}`} className="text-sm font-medium text-gray-700 mr-3">
            {t('form.online_settings.available_online')}
          </label>
          <button
            type="button"
            id={`online-toggle-${service.id}`}
            onClick={handleOnlineToggle}
            className={`${
              settings.isOnline ? 'bg-purple-600' : 'bg-gray-200'
            } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2`}
          >
            <span
              className={`${
                settings.isOnline ? 'translate-x-5' : 'translate-x-0'
              } pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
            >
              <span
                className={`${
                  settings.isOnline ? 'opacity-0 duration-100 ease-out' : 'opacity-100 duration-200 ease-in'
                } absolute inset-0 flex h-full w-full items-center justify-center transition-opacity`}
              >
                <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 12 12">
                  <path
                    d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span
                className={`${
                  settings.isOnline ? 'opacity-100 duration-200 ease-in' : 'opacity-0 duration-100 ease-out'
                } absolute inset-0 flex h-full w-full items-center justify-center transition-opacity`}
              >
                <svg className="h-3 w-3 text-purple-600" fill="currentColor" viewBox="0 0 12 12">
                  <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                </svg>
              </span>
            </span>
          </button>
        </div>

        {settings.isOnline && (
          <div className="flex items-center space-x-2">
            <label htmlFor={`booking-time-${service.id}`} className="text-sm font-medium text-gray-700">
              {t('form.online_settings.minimum_booking_time')} :
            </label>
            <select
              id={`booking-time-${service.id}`}
              value={settings.minimumBookingTime}
              onChange={handleBookingTimeChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
            >
              <option value={1}>{t('form.online_settings.booking_times.1')}</option>
              <option value={2}>{t('form.online_settings.booking_times.2')}</option>
              <option value={4}>{t('form.online_settings.booking_times.4')}</option>
              <option value={12}>{t('form.online_settings.booking_times.12')}</option>
              <option value={24}>{t('form.online_settings.booking_times.24')}</option>
              <option value={48}>{t('form.online_settings.booking_times.48')}</option>
            </select>
          </div>
        )}
      </div>

      {/* Section upload d'images */}
      {settings.isOnline && (
        <ServiceImageUpload serviceId={service.id} />
      )}
    </div>
  );
};

export default ServiceOnlineSettings;
