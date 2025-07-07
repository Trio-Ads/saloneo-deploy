import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { format, parseISO, addMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAppointmentStore } from '../../appointments/store';
import { useServiceStore } from '../../services/store';
import { Appointment, AppointmentFormData } from '../../appointments/types';
import { Service } from '../../services/types';
import LoadingSpinner from './LoadingSpinner';
import Modal from './Modal';
import DateTimeSelection from './DateTimeSelection';

const PublicAppointmentList: React.FC = () => {
  const { t } = useTranslation(['appointments', 'common']);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [newDate, setNewDate] = useState<string | null>(null);
  const [newTime, setNewTime] = useState<string | null>(null);

  const {
    getAppointmentsByClientInfo,
    modifyAppointment,
    cancelAppointmentPublic,
    canModifyAppointment
  } = useAppointmentStore();

  useEffect(() => {
    const email = searchParams.get('email');
    const phone = searchParams.get('phone');
    const firstName = searchParams.get('firstName');
    const lastName = searchParams.get('lastName');

    // Vérifier qu'au moins un mode de recherche est fourni
    if (!email && !phone && (!firstName || !lastName)) {
      setError('Paramètres de recherche invalides');
      setLoading(false);
      return;
    }

    const fetchAppointments = async () => {
      try {
        // Construire l'URL de recherche avec les paramètres
        const searchUrl = new URL(window.location.href);
        const slug = searchUrl.pathname.split('/')[2] || 'default-salon'; // Extraire le slug de l'URL
        
        const queryParams = new URLSearchParams();
        if (email) queryParams.set('email', email);
        if (phone) queryParams.set('phone', phone);
        if (firstName) queryParams.set('firstName', firstName);
        if (lastName) queryParams.set('lastName', lastName);

        const response = await fetch(`/api/public/appointments/search/${slug}?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error('Erreur lors de la recherche des rendez-vous');
        }
        
        const result = await response.json();
        setAppointments(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors de la recherche');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [searchParams, t]);

  const handleModify = async () => {
    if (!selectedAppointment || !newDate || !newTime) {
      setError(t('appointments:errors.selectDateTime'));
      return;
    }

    try {
      setLoading(true);
      if (!selectedAppointment.modificationToken) {
        throw new Error(t('appointments:errors.modificationNotAllowed'));
      }

      // Récupérer le service
      const service = useServiceStore.getState().services.find(
        (s: Service) => s.id === selectedAppointment.serviceId
      );

      if (!service) {
        throw new Error("Service non trouvé");
      }

      // Calculer l'heure de fin
      const endTime = format(
        addMinutes(
          new Date(`2000-01-01 ${newTime}`),
          service.duration
        ),
        'HH:mm'
      );

      const changes: Partial<AppointmentFormData> = {
        date: newDate,
        startTime: newTime,
        serviceDuration: service.duration
      };
      await modifyAppointment(selectedAppointment.modificationToken, changes);
      
      // Rafraîchir la liste
      const updatedAppointments = appointments.map(apt =>
        apt.id === selectedAppointment.id
          ? { 
              ...apt, 
              date: newDate, 
              startTime: newTime,
              endTime: format(
                addMinutes(
                  new Date(`2000-01-01 ${newTime}`),
                  service.duration
                ),
                'HH:mm'
              )
            }
          : apt
      );
      setAppointments(updatedAppointments);
      setShowModifyModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('appointments:errors.modificationFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedAppointment || !cancellationReason) {
      setError(t('appointments:errors.reasonRequired'));
      return;
    }

    try {
      setLoading(true);
      if (!selectedAppointment.modificationToken) {
        throw new Error(t('appointments:errors.modificationNotAllowed'));
      }
      await cancelAppointmentPublic(selectedAppointment.modificationToken, cancellationReason);
      
      // Retirer le rendez-vous annulé de la liste
      setAppointments(appointments.filter(apt => apt.id !== selectedAppointment.id));
      setShowCancelModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('appointments:errors.cancellationFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-4">
          {error}
        </h2>
        <button
          onClick={() => navigate('/')}
          className="text-purple-600 hover:text-purple-800"
        >
          {t('common:backToHome')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-white">
        {t('appointments:yourAppointments')}
      </h1>

      {appointments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-white/80">{t('appointments:noAppointments')}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 text-purple-400 hover:text-purple-300"
          >
            {t('appointments:bookNew')}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map(appointment => (
            <div
              key={appointment.id}
              className="glass-card p-6 rounded-lg hover:bg-white/5 transition-colors"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {appointment.serviceName}
                  </h3>
                  <p className="text-white/80">
                    {format(parseISO(appointment.date), 'EEEE d MMMM yyyy', { locale: fr })}
                  </p>
                  <p className="text-white/80">{appointment.startTime}</p>
                </div>
                
                {canModifyAppointment(appointment.id) && (
                  <div className="flex gap-3 z-10">
                    <button
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setShowModifyModal(true);
                      }}
                      className="glass-button"
                    >
                      {t('appointments:modify')}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setShowCancelModal(true);
                      }}
                      className="glass-button border-red-500 text-red-500 hover:bg-red-500/10"
                    >
                      {t('appointments:cancel')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de modification */}
      <Modal
        isOpen={showModifyModal}
        onClose={() => setShowModifyModal(false)}
        title={t('appointments:modifyAppointment')}
      >
        {selectedAppointment && (
          <div className="space-y-6">
            <DateTimeSelection
              serviceId={selectedAppointment.serviceId}
              selectedDate={newDate || undefined}
              selectedTime={newTime || undefined}
              stylistId={selectedAppointment.stylistId}
              onSelect={(date, time, stylistId) => {
                setNewDate(date);
                setNewTime(time);
              }}
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowModifyModal(false)}
                className="glass-button"
              >
                {t('common:cancel')}
              </button>
              <button
                onClick={handleModify}
                className="glass-button"
                disabled={loading}
              >
                {t('appointments:confirmModification')}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal d'annulation */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title={t('appointments:cancelAppointment')}
      >
        <div className="space-y-4">
          <p className="text-white/80">{t('appointments:cancelConfirmation')}</p>
          <textarea
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            placeholder={t('appointments:cancelReasonPlaceholder')}
            className="glass-input w-full p-3 rounded"
            rows={3}
          />
          <div className="flex justify-end gap-4">
            <button
              onClick={() => setShowCancelModal(false)}
              className="glass-button"
            >
              {t('common:back')}
            </button>
            <button
              onClick={handleCancel}
              className="glass-button border-red-500 text-red-500 hover:bg-red-500/10"
              disabled={loading}
            >
              {t('appointments:confirmCancellation')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PublicAppointmentList;
