import React, { useReducer, useMemo, useEffect, useState } from 'react';
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
  ExclamationTriangleIcon,
  PlusCircleIcon
} from '@heroicons/react/24/outline';
import { AppointmentFormData, TimeSlot } from '../types';
import { Service } from '../../services/types';
import { useAppointmentForm } from '../hooks/useAppointmentForm';
import { useClientStore } from '../../clients/store';
import { useServiceStore } from '../../services/store';
import { useTeamStore } from '../../team/store';
import { ClientFormData } from '../../clients/types';
import { ServiceFormData } from '../../services/types';
import { TeamMemberFormData } from '../../team/types';
import { 
  QuickCreateClientModal, 
  QuickCreateServiceModal, 
  QuickCreateTeamModal 
} from './QuickCreateModals';

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

  // États pour les modales de création rapide
  const [showClientModal, setShowClientModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  
  // Stores pour la création rapide
  const { addClient, fetchClients } = useClientStore();
  const { addService, fetchServices, categories } = useServiceStore();
  const { addMember, fetchMembers } = useTeamStore();

  // Handlers pour la création rapide
  const handleQuickCreateClient = async (clientData: ClientFormData) => {
    try {
      const newClient = await addClient(clientData);
      await fetchClients(); // Rafraîchir la liste
      dispatch({ type: 'SET_FIELD', field: 'clientId', value: newClient.id }); // Sélectionner automatiquement
      setShowClientModal(false);
    } catch (error) {
      console.error('Error creating client:', error);
    }
  };

  const handleQuickCreateService = async (serviceData: ServiceFormData) => {
    try {
      const newService = await addService(serviceData);
      await fetchServices(); // Rafraîchir la liste
      dispatch({ type: 'SET_SERVICE', service: newService }); // Sélectionner automatiquement
      setShowServiceModal(false);
    } catch (error) {
      console.error('Error creating service:', error);
    }
  };

  const handleQuickCreateTeam = async (teamData: TeamMemberFormData) => {
    try {
      const newMember = await addMember(teamData);
      await fetchMembers(); // Rafraîchir la liste
      dispatch({ type: 'SET_FIELD', field: 'stylistId', value: newMember.id }); // Sélectionner automatiquement
      setShowTeamModal(false);
    } catch (error) {
      console.error('Error creating team member:', error);
    }
  };

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
            <div className="relative p-3 bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-500 rounded-xl shadow-orange-lg transform hover:scale-105 transition-all duration-300">
              <CalendarDaysIcon className="h-8 w-8 text-white dark:text-gray-900" />
              <div className="absolute inset-0 bg-white/20 dark:bg-white/10 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-500 bg-clip-text text-transparent">
              {initialData ? t('appointment_form.title_edit') : t('appointment_form.title_new')}
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400">{t('appointment_form.subtitle')}</p>
        </div>

        {/* Sélection du client */}
        <div className="bg-white/90 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-orange-md dark:shadow-gray-md border border-orange-500/20 dark:border-orange-500/20 p-6 transition-colors duration-300">
          <div className="flex items-center space-x-3 mb-6">
            <UserIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('appointment_form.sections.client')}</h3>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                <UserIcon className="h-4 w-4 inline mr-2 text-orange-600 dark:text-orange-400" />
                {t('appointment_form.labels.select_client')}
              </label>
              <button
                type="button"
                onClick={() => setShowClientModal(true)}
                className="flex items-center space-x-1 px-3 py-1 text-xs font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-lg transition-colors"
              >
                <PlusCircleIcon className="h-4 w-4" />
                <span>Nouveau</span>
              </button>
            </div>
            <select
              id="clientId"
              name="clientId"
              value={formData.clientId}
              onChange={handleChange}
              required
              className="w-full rounded-xl border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:bg-white dark:focus:bg-gray-800 transition-all duration-200 text-gray-900 dark:text-gray-100 px-4 py-3"
            >
              <option value="">{t('appointment_form.labels.choose_client')}</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.firstName} {client.lastName}
                </option>
              ))}
            </select>
            {selectedClient && (
              <div className="mt-3 bg-orange-50 dark:bg-orange-900/20 backdrop-blur-sm p-3 rounded-lg border border-orange-500/20">
                <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">
                  ✅ Client sélectionné: {selectedClient.firstName} {selectedClient.lastName}
                </p>
                {selectedClient.phone && (
                  <p className="text-xs text-orange-600 dark:text-orange-400">📞 {selectedClient.phone}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sélection du service */}
        <div className="bg-white/90 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-orange-md dark:shadow-gray-md border border-orange-500/20 dark:border-orange-500/20 p-6 transition-colors duration-300">
          <div className="flex items-center space-x-3 mb-6">
            <SparklesIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('appointment_form.sections.service')}</h3>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="serviceId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                <SparklesIcon className="h-4 w-4 inline mr-2 text-orange-600 dark:text-orange-400" />
                {t('appointment_form.labels.select_service')}
              </label>
              <button
                type="button"
                onClick={() => setShowServiceModal(true)}
                className="flex items-center space-x-1 px-3 py-1 text-xs font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-lg transition-colors"
              >
                <PlusCircleIcon className="h-4 w-4" />
                <span>Nouveau</span>
              </button>
            </div>
            <select
              id="serviceId"
              name="serviceId"
              value={formData.serviceId}
              onChange={handleChange}
              required
              className="w-full rounded-xl border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:bg-white dark:focus:bg-gray-800 transition-all duration-200 text-gray-900 dark:text-gray-100 px-4 py-3"
            >
              <option value="">{t('appointment_form.labels.choose_service')}</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} ({service.duration} min - {service.price}€)
                </option>
              ))}
            </select>
            {selectedService && (
              <div className="mt-3 bg-orange-50 dark:bg-orange-900/20 backdrop-blur-sm p-3 rounded-lg border border-orange-500/20">
                <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">
                  ✨ Service: {selectedService.name}
                </p>
                <div className="flex items-center space-x-4 text-xs text-orange-600 dark:text-orange-400 mt-1">
                  <span>⏱️ {selectedService.duration} minutes</span>
                  <span>💰 {selectedService.price}€</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sélection du coiffeur */}
        <div className="bg-white/90 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-orange-md dark:shadow-gray-md border border-orange-500/20 dark:border-orange-500/20 p-6 transition-colors duration-300">
          <div className="flex items-center space-x-3 mb-6">
            <UserIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('appointment_form.sections.stylist')}</h3>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="stylistId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                <UserIcon className="h-4 w-4 inline mr-2 text-orange-600 dark:text-orange-400" />
                Sélectionner un coiffeur *
              </label>
              <button
                type="button"
                onClick={() => setShowTeamModal(true)}
                className="flex items-center space-x-1 px-3 py-1 text-xs font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-lg transition-colors"
              >
                <PlusCircleIcon className="h-4 w-4" />
                <span>Nouveau</span>
              </button>
            </div>
            <select
              id="stylistId"
              name="stylistId"
              value={formData.stylistId}
              onChange={handleChange}
              required
              className="w-full rounded-xl border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:bg-white dark:focus:bg-gray-800 transition-all duration-200 text-gray-900 dark:text-gray-100 px-4 py-3"
            >
              <option value="">Choisir un coiffeur...</option>
              {stylists.map((stylist) => (
                <option key={stylist.id} value={stylist.id}>
                  {stylist.firstName} {stylist.lastName}
                </option>
              ))}
            </select>
            {selectedStylist && (
              <div className="mt-3 bg-green-50 dark:bg-green-900/20 backdrop-blur-sm p-3 rounded-lg border border-green-500/20">
                <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                  👨‍💼 Coiffeur: {selectedStylist.firstName} {selectedStylist.lastName}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">🎯 {selectedStylist.role}</p>
              </div>
            )}
          </div>
        </div>

        {/* Planification */}
        <div className="bg-white/90 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-orange-md dark:shadow-gray-md border border-orange-500/20 dark:border-orange-500/20 p-6 transition-colors duration-300">
          <div className="flex items-center space-x-3 mb-6">
            <CalendarDaysIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('appointment_form.sections.scheduling')}</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <CalendarDaysIcon className="h-4 w-4 inline mr-2 text-orange-600 dark:text-orange-400" />
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
                className="w-full rounded-xl border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:bg-white dark:focus:bg-gray-800 transition-all duration-200 text-gray-900 dark:text-gray-100 px-4 py-3"
              />
            </div>

            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <ClockIcon className="h-4 w-4 inline mr-2 text-orange-600 dark:text-orange-400" />
                Heure *
              </label>
              <select
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
                className="w-full rounded-xl border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:bg-white dark:focus:bg-gray-800 transition-all duration-200 text-gray-900 dark:text-gray-100 px-4 py-3"
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
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                  <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                  Sélectionnez d'abord un service et un coiffeur
                </p>
              ) : availableTimeSlots.filter(slot => slot.available).length === 0 ? (
                <p className="mt-2 text-xs text-red-600 dark:text-red-400 flex items-center">
                  <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                  Aucun créneau disponible pour cette date
                </p>
              ) : (
                <p className="mt-2 text-xs text-green-600 dark:text-green-400 flex items-center">
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  {availableTimeSlots.filter(slot => slot.available).length} créneaux disponibles
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white/90 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-orange-md dark:shadow-gray-md border border-orange-500/20 dark:border-orange-500/20 p-6 transition-colors duration-300">
          <div className="flex items-center space-x-3 mb-6">
            <DocumentTextIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('appointment_form.sections.notes')}</h3>
          </div>
          
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <DocumentTextIcon className="h-4 w-4 inline mr-2 text-orange-600 dark:text-orange-400" />
              Notes supplémentaires
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-xl border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:bg-white dark:focus:bg-gray-800 transition-all duration-200 text-gray-900 dark:text-gray-100 px-4 py-3"
              placeholder="Ajoutez des notes sur le rendez-vous, les préférences du client..."
            />
          </div>
        </div>

        {/* Résumé du rendez-vous */}
        {isFormComplete && (
          <div className="bg-white/90 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-orange-md dark:shadow-gray-md border border-orange-500/20 dark:border-orange-500/20 p-6 bg-gradient-to-r from-orange-50/50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/20 transition-colors duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Résumé du Rendez-vous</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p><span className="font-medium text-gray-700 dark:text-gray-300">Client:</span> <span className="text-gray-900 dark:text-gray-100">{selectedClient?.firstName} {selectedClient?.lastName}</span></p>
                <p><span className="font-medium text-gray-700 dark:text-gray-300">Service:</span> <span className="text-gray-900 dark:text-gray-100">{selectedService?.name}</span></p>
                <p><span className="font-medium text-gray-700 dark:text-gray-300">Coiffeur:</span> <span className="text-gray-900 dark:text-gray-100">{selectedStylist?.firstName} {selectedStylist?.lastName}</span></p>
              </div>
              <div className="space-y-2">
                <p><span className="font-medium text-gray-700 dark:text-gray-300">Date:</span> <span className="text-gray-900 dark:text-gray-100">{format(new Date(formData.date), 'dd/MM/yyyy', { locale: fr })}</span></p>
                <p><span className="font-medium text-gray-700 dark:text-gray-300">Heure:</span> <span className="text-gray-900 dark:text-gray-100">{formData.startTime}</span></p>
                <p><span className="font-medium text-gray-700 dark:text-gray-300">Durée:</span> <span className="text-gray-900 dark:text-gray-100">{selectedService?.duration} minutes</span></p>
                <p><span className="font-medium text-gray-700 dark:text-gray-300">Prix:</span> <span className="text-gray-900 dark:text-gray-100">{selectedService?.price}€</span></p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 rounded-xl bg-white/70 dark:bg-gray-800/70 hover:bg-white/90 dark:hover:bg-gray-800/90 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={!isFormComplete}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-500 hover:from-orange-600 hover:to-orange-700 dark:hover:from-orange-500 dark:hover:to-orange-600 text-white dark:text-gray-900 border-0 shadow-orange-lg hover:shadow-orange-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold"
          >
            {initialData ? 'Modifier' : 'Créer le Rendez-vous'}
          </button>
        </div>
      </form>

      {/* Modales de création rapide */}
      <QuickCreateClientModal
        isOpen={showClientModal}
        onClose={() => setShowClientModal(false)}
        onCreate={handleQuickCreateClient}
      />
      
      <QuickCreateServiceModal
        isOpen={showServiceModal}
        onClose={() => setShowServiceModal(false)}
        onCreate={handleQuickCreateService}
        categories={categories}
      />
      
      <QuickCreateTeamModal
        isOpen={showTeamModal}
        onClose={() => setShowTeamModal(false)}
        onCreate={handleQuickCreateTeam}
      />
    </div>
  );
};

export default AppointmentForm;
