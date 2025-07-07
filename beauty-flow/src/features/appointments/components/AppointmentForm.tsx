import React, { useReducer, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format, addMinutes, parse } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  SparklesIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { AppointmentFormData, TimeSlot } from '../types';
import { Service } from '../../services/types';
import { useAppointmentForm } from '../hooks/useAppointmentForm';

interface AppointmentFormProps {
  initialData?: Partial<AppointmentFormData>;
  onSubmit: (data: AppointmentFormData) => void;
  onCancel: () => void;
}

type FormAction = 
  | { type: 'SET_FIELD'; field: keyof AppointmentFormData; value: string | number }
  | { type: 'SET_TIME_SLOTS'; slots: TimeSlot[] }
  | { type: 'SET_SERVICE'; service: Service };

type FormState = {
  formData: AppointmentFormData;
  availableTimeSlots: TimeSlot[];
};

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.field]: action.value
        }
      };
    case 'SET_TIME_SLOTS':
      return {
        ...state,
        availableTimeSlots: action.slots
      };
    case 'SET_SERVICE':
      return {
        ...state,
        formData: {
          ...state.formData,
          serviceId: action.service.id,
          serviceDuration: action.service.duration
        }
      };
    default:
      return state;
  }
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const { t } = useTranslation('appointments');
  const {
    clients,
    services,
    stylists,
    getDaySchedule,
    addPreBooking,
    removePreBooking,
    cleanupExpiredPreBookings
  } = useAppointmentForm();

  const initialState: FormState = {
    formData: {
      clientId: initialData?.clientId || '',
      serviceId: initialData?.serviceId || '',
      stylistId: initialData?.stylistId || '',
      date: initialData?.date || format(new Date(), 'yyyy-MM-dd'),
      startTime: initialData?.startTime || '09:00',
      serviceDuration: initialData?.serviceDuration || 0,
      notes: initialData?.notes || '',
    },
    availableTimeSlots: []
  };

  const [state, dispatch] = useReducer(formReducer, initialState);
  const { formData, availableTimeSlots } = state;
  const [preBookingId, setPreBookingId] = React.useState<string | null>(null);

  const selectedService = useMemo(() => 
    services.find((s: Service) => s.id === formData.serviceId),
    [services, formData.serviceId]
  );

  const selectedClient = useMemo(() => 
    clients.find((c) => c.id === formData.clientId),
    [clients, formData.clientId]
  );

  const selectedStylist = useMemo(() => 
    stylists.find((s) => s.id === formData.stylistId),
    [stylists, formData.stylistId]
  );

  // Nettoyer les pré-réservations expirées toutes les minutes
  useEffect(() => {
    const interval = setInterval(cleanupExpiredPreBookings, 60000);
    return () => clearInterval(interval);
  }, [cleanupExpiredPreBookings]);

  // Gérer la pré-réservation
  useEffect(() => {
    if (formData.date && formData.startTime && formData.stylistId && selectedService) {
      // Supprimer l'ancienne pré-réservation si elle existe
      if (preBookingId) {
        removePreBooking(preBookingId);
      }

      // Calculer l'heure de fin basée sur la durée du service
      const endTime = format(
        addMinutes(
          new Date(`2000-01-01 ${formData.startTime}`),
          selectedService.duration
        ),
        'HH:mm'
      );

      // Créer une nouvelle pré-réservation
      const newPreBookingId = addPreBooking({
        date: formData.date,
        startTime: formData.startTime,
        endTime,
        stylistId: formData.stylistId,
      });

      setPreBookingId(newPreBookingId);
    }

    return () => {
      if (preBookingId) {
        removePreBooking(preBookingId);
      }
    };
  }, [formData.date, formData.startTime, formData.stylistId, selectedService, addPreBooking, removePreBooking, preBookingId]);

  // Mettre à jour les créneaux disponibles
  useEffect(() => {
    if (!formData.serviceId || !formData.stylistId || !formData.date || !selectedService) {
      dispatch({ type: 'SET_TIME_SLOTS', slots: [] });
      return;
    }

    const schedule = getDaySchedule(formData.date, formData.stylistId);
    const slots = schedule.timeSlots.filter(slot => {
      // Vérifier si le créneau est assez long pour le service
      const slotStart = parse(slot.startTime, 'HH:mm', new Date());
      const slotEnd = addMinutes(slotStart, selectedService.duration);
      const nextSlotIndex = schedule.timeSlots.findIndex(
        s => s.startTime === format(slotEnd, 'HH:mm')
      );

      // Vérifier que tous les créneaux nécessaires sont disponibles
      for (let i = schedule.timeSlots.indexOf(slot); i < nextSlotIndex; i++) {
        if (!schedule.timeSlots[i]?.available) {
          return false;
        }
      }

      return true;
    });

    dispatch({ type: 'SET_TIME_SLOTS', slots });
  }, [formData.date, formData.serviceId, formData.stylistId, selectedService, getDaySchedule]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'serviceId') {
      const service = services.find(s => s.id === value);
      if (service) {
        dispatch({ type: 'SET_SERVICE', service });
        return;
      }
    }
    dispatch({ type: 'SET_FIELD', field: name as keyof AppointmentFormData, value });
  };

  const isFormComplete = formData.clientId && formData.serviceId && formData.stylistId && formData.date && formData.startTime;

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="relative p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/25 transform hover:scale-105 transition-all duration-300">
              <CalendarDaysIcon className="h-8 w-8 text-white" />
              <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {initialData ? t('appointment_form.title_edit') : t('appointment_form.title_new')}
            </h2>
          </div>
          <p className="text-gray-600">{t('appointment_form.subtitle')}</p>
        </div>

        {/* Sélection du client */}
        <div className="glass-card p-6">
          <div className="flex items-center space-x-3 mb-6">
            <UserIcon className="h-6 w-6 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">{t('appointment_form.sections.client')}</h3>
          </div>
          
          <div>
            <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-2">
              <UserIcon className="h-4 w-4 inline mr-2 text-indigo-600" />
              {t('appointment_form.labels.select_client')}
            </label>
            <select
              id="clientId"
              name="clientId"
              value={formData.clientId}
              onChange={handleChange}
              required
              className="glass-input w-full rounded-xl border-0 bg-white/70 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200"
            >
              <option value="">{t('appointment_form.labels.choose_client')}</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.firstName} {client.lastName}
                </option>
              ))}
            </select>
            {selectedClient && (
              <div className="mt-3 glass-card bg-indigo-50/50 p-3 rounded-lg">
                <p className="text-sm text-indigo-700 font-medium">
                  ✅ Client sélectionné: {selectedClient.firstName} {selectedClient.lastName}
                </p>
                {selectedClient.phone && (
                  <p className="text-xs text-indigo-600">📞 {selectedClient.phone}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sélection du service */}
        <div className="glass-card p-6">
          <div className="flex items-center space-x-3 mb-6">
            <SparklesIcon className="h-6 w-6 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">{t('appointment_form.sections.service')}</h3>
          </div>
          
          <div>
            <label htmlFor="serviceId" className="block text-sm font-medium text-gray-700 mb-2">
              <SparklesIcon className="h-4 w-4 inline mr-2 text-indigo-600" />
              {t('appointment_form.labels.select_service')}
            </label>
            <select
              id="serviceId"
              name="serviceId"
              value={formData.serviceId}
              onChange={handleChange}
              required
              className="glass-input w-full rounded-xl border-0 bg-white/70 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200"
            >
              <option value="">{t('appointment_form.labels.choose_service')}</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} ({service.duration} min - {service.price}€)
                </option>
              ))}
            </select>
            {selectedService && (
              <div className="mt-3 glass-card bg-purple-50/50 p-3 rounded-lg">
                <p className="text-sm text-purple-700 font-medium">
                  ✨ Service: {selectedService.name}
                </p>
                <div className="flex items-center space-x-4 text-xs text-purple-600 mt-1">
                  <span>⏱️ {selectedService.duration} minutes</span>
                  <span>💰 {selectedService.price}€</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sélection du coiffeur */}
        <div className="glass-card p-6">
          <div className="flex items-center space-x-3 mb-6">
            <UserIcon className="h-6 w-6 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">{t('appointment_form.sections.stylist')}</h3>
          </div>
          
          <div>
            <label htmlFor="stylistId" className="block text-sm font-medium text-gray-700 mb-2">
              <UserIcon className="h-4 w-4 inline mr-2 text-indigo-600" />
              Sélectionner un coiffeur *
            </label>
            <select
              id="stylistId"
              name="stylistId"
              value={formData.stylistId}
              onChange={handleChange}
              required
              className="glass-input w-full rounded-xl border-0 bg-white/70 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200"
            >
              <option value="">Choisir un coiffeur...</option>
              {stylists.map((stylist) => (
                <option key={stylist.id} value={stylist.id}>
                  {stylist.firstName} {stylist.lastName}
                </option>
              ))}
            </select>
            {selectedStylist && (
              <div className="mt-3 glass-card bg-green-50/50 p-3 rounded-lg">
                <p className="text-sm text-green-700 font-medium">
                  👨‍💼 Coiffeur: {selectedStylist.firstName} {selectedStylist.lastName}
                </p>
                <p className="text-xs text-green-600">🎯 {selectedStylist.role}</p>
              </div>
            )}
          </div>
        </div>

        {/* Planification */}
        <div className="glass-card p-6">
          <div className="flex items-center space-x-3 mb-6">
            <CalendarDaysIcon className="h-6 w-6 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">{t('appointment_form.sections.scheduling')}</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                <CalendarDaysIcon className="h-4 w-4 inline mr-2 text-indigo-600" />
                Date *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={format(new Date(), 'yyyy-MM-dd')}
                required
                className="glass-input w-full rounded-xl border-0 bg-white/70 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                <ClockIcon className="h-4 w-4 inline mr-2 text-indigo-600" />
                Heure *
              </label>
              <select
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
                className="glass-input w-full rounded-xl border-0 bg-white/70 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200"
                disabled={!formData.serviceId || !formData.stylistId || !formData.date}
              >
                <option value="">Sélectionner une heure...</option>
                {availableTimeSlots
                  .filter((slot) => slot.available)
                  .map((slot) => (
                    <option key={slot.startTime} value={slot.startTime}>
                      {slot.startTime}
                    </option>
                  ))}
              </select>
              {!formData.serviceId || !formData.stylistId || !formData.date ? (
                <p className="mt-2 text-xs text-gray-500 flex items-center">
                  <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                  Sélectionnez d'abord un service et un coiffeur
                </p>
              ) : availableTimeSlots.filter(slot => slot.available).length === 0 ? (
                <p className="mt-2 text-xs text-red-600 flex items-center">
                  <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                  Aucun créneau disponible pour cette date
                </p>
              ) : (
                <p className="mt-2 text-xs text-green-600 flex items-center">
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  {availableTimeSlots.filter(slot => slot.available).length} créneaux disponibles
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="glass-card p-6">
          <div className="flex items-center space-x-3 mb-6">
            <DocumentTextIcon className="h-6 w-6 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">{t('appointment_form.sections.notes')}</h3>
          </div>
          
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              <DocumentTextIcon className="h-4 w-4 inline mr-2 text-indigo-600" />
              Notes supplémentaires
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="glass-input w-full rounded-xl border-0 bg-white/70 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200"
              placeholder="Ajoutez des notes sur le rendez-vous, les préférences du client..."
            />
          </div>
        </div>

        {/* Résumé du rendez-vous */}
        {isFormComplete && (
          <div className="glass-card p-6 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 border border-indigo-200/50">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Résumé du Rendez-vous</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p><span className="font-medium text-gray-700">Client:</span> {selectedClient?.firstName} {selectedClient?.lastName}</p>
                <p><span className="font-medium text-gray-700">Service:</span> {selectedService?.name}</p>
                <p><span className="font-medium text-gray-700">Coiffeur:</span> {selectedStylist?.firstName} {selectedStylist?.lastName}</p>
              </div>
              <div className="space-y-2">
                <p><span className="font-medium text-gray-700">Date:</span> {format(new Date(formData.date), 'dd/MM/yyyy', { locale: fr })}</p>
                <p><span className="font-medium text-gray-700">Heure:</span> {formData.startTime}</p>
                <p><span className="font-medium text-gray-700">Durée:</span> {selectedService?.duration} minutes</p>
                <p><span className="font-medium text-gray-700">Prix:</span> {selectedService?.price}€</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="glass-button bg-white/70 hover:bg-white/90 text-gray-700 border border-gray-300 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={!isFormComplete}
            className="glass-button bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {initialData ? 'Modifier' : 'Créer le Rendez-vous'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm;
