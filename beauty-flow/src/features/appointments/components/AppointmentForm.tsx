import React, { useReducer, useMemo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format, addMinutes, parse } from 'date-fns';
import { PlusIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { Panel } from '../../../components/ui';
import { formatPrice } from '../../../utils/currency';
import { useProfileStore } from '../../profile/store';
import { dayKey, getDateLocale } from '../utils';
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

const labelClass = 'text-sm font-medium text-gray-700 dark:text-gray-300';
const helpClass = 'mt-1.5 text-xs text-gray-500 dark:text-gray-400';

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
  const { t, i18n } = useTranslation('appointments');
  const { profile } = useProfileStore();
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
      date: initialData?.date ? dayKey(initialData.date) : format(new Date(), 'yyyy-MM-dd'),
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
  const summaryDate = formData.date ? format(new Date(`${dayKey(formData.date)}T00:00:00`), 'EEEE d MMMM yyyy', { locale: getDateLocale(i18n.language) }) : '';
  const openSlots = availableTimeSlots.filter((slot) => slot.available);
  const price = (value?: number) => formatPrice(value || 0, profile.currency);

  const newButton = (onClick: () => void) => (
    <button type="button" onClick={onClick} className="-my-2 inline-flex items-center gap-1 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300">
      <PlusIcon className="size-4" />
      {t('appointment_form.labels.new')}
    </button>
  );

  return (
    <div className="max-w-3xl">
      <form onSubmit={handleSubmit}>
        <Panel
          title={initialData ? t('appointment_form.title_edit') : t('appointment_form.title_new')}
          description={t('appointment_form.subtitle')}
        >
          <div className="grid grid-cols-1 gap-5 pt-2 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="clientId" className={labelClass}>{t('appointment_form.labels.select_client')}</label>
                {newButton(() => setShowClientModal(true))}
              </div>
              <select id="clientId" name="clientId" value={formData.clientId} onChange={handleChange} required className="field">
                <option value="">{t('appointment_form.labels.choose_client')}</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.firstName} {client.lastName}
                  </option>
                ))}
              </select>
              {selectedClient?.phone && <p className={helpClass}>{selectedClient.phone}</p>}
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="serviceId" className={labelClass}>{t('appointment_form.labels.select_service')}</label>
                {newButton(() => setShowServiceModal(true))}
              </div>
              <select id="serviceId" name="serviceId" value={formData.serviceId} onChange={handleChange} required className="field">
                <option value="">{t('appointment_form.labels.choose_service')}</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} ({service.duration} min · {price(service.price)})
                  </option>
                ))}
              </select>
              {selectedService && <p className={helpClass}>{selectedService.duration} min · {price(selectedService.price)}</p>}
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="stylistId" className={labelClass}>{t('appointment_form.labels.select_stylist')}</label>
                {newButton(() => setShowTeamModal(true))}
              </div>
              <select id="stylistId" name="stylistId" value={formData.stylistId} onChange={handleChange} required className="field">
                <option value="">{t('appointment_form.labels.choose_stylist')}</option>
                {stylists.map((stylist) => (
                  <option key={stylist.id} value={stylist.id}>
                    {stylist.firstName} {stylist.lastName}
                  </option>
                ))}
              </select>
              {selectedStylist?.role && <p className={helpClass}>{selectedStylist.role}</p>}
            </div>

            <div>
              <label htmlFor="date" className={clsx(labelClass, 'mb-1.5 block')}>{t('appointment_form.labels.date')}</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={format(new Date(), 'yyyy-MM-dd')}
                required
                className="field"
              />
            </div>

            <div>
              <label htmlFor="startTime" className={clsx(labelClass, 'mb-1.5 block')}>{t('appointment_form.labels.time')}</label>
              <select
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
                className="field disabled:opacity-60"
                disabled={!formData.serviceId || !formData.stylistId || !formData.date}
              >
                <option value="">{t('appointment_form.labels.select_time')}</option>
                {openSlots.map((slot) => (
                  <option key={slot.startTime} value={slot.startTime}>
                    {slot.startTime}
                  </option>
                ))}
              </select>
              {!formData.serviceId || !formData.stylistId || !formData.date ? (
                <p className={helpClass}>{t('appointment_form.messages.select_service_stylist_first')}</p>
              ) : openSlots.length === 0 ? (
                <p className={clsx(helpClass, 'text-red-600 dark:text-red-400')}>{t('appointment_form.messages.no_slots_available')}</p>
              ) : (
                <p className={helpClass}>{openSlots.length} {t('appointment_form.messages.slots_available')}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="notes" className={clsx(labelClass, 'mb-1.5 block')}>{t('appointment_form.labels.additional_notes')}</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="field"
                placeholder={t('appointment_form.labels.notes_placeholder')}
              />
            </div>
          </div>

          {isFormComplete && (
            <div className="mt-6 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/60">
              <p className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-50">{t('appointment_form.sections.summary')}</p>
              <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-sm sm:grid-cols-[auto_1fr_auto_1fr]">
                {[
                  [t('appointment_form.summary_labels.client'), `${selectedClient?.firstName ?? ''} ${selectedClient?.lastName ?? ''}`],
                  [t('appointment_form.summary_labels.date'), summaryDate],
                  [t('appointment_form.summary_labels.service'), selectedService?.name],
                  [t('appointment_form.summary_labels.time'), formData.startTime],
                  [t('appointment_form.summary_labels.stylist'), `${selectedStylist?.firstName ?? ''} ${selectedStylist?.lastName ?? ''}`],
                  [t('appointment_form.summary_labels.duration'), `${selectedService?.duration ?? 0} min`],
                  [t('appointment_form.summary_labels.price'), price(selectedService?.price)],
                ].map(([label, value]) => (
                  <React.Fragment key={label}>
                    <dt className="text-gray-500 dark:text-gray-400">{label}</dt>
                    <dd className="font-medium tabular-nums text-gray-900 dark:text-gray-50">{value}</dd>
                  </React.Fragment>
                ))}
              </dl>
            </div>
          )}

          <div className="mt-6 flex flex-col-reverse gap-2 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end dark:border-gray-800">
            <button type="button" onClick={onCancel} className="btn-secondary">
              {t('appointment_form.buttons.cancel')}
            </button>
            <button type="submit" disabled={!isFormComplete} className="btn-primary">
              {initialData ? t('appointment_form.buttons.modify') : t('appointment_form.buttons.create')}
            </button>
          </div>
        </Panel>
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
