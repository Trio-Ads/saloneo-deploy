import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { format, parseISO, addMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAppointmentStore } from '../../appointments/store';
import { useServiceStore } from '../../services/store';
import { useTemplateStyles } from '../../../hooks/useTemplateStyles';
import { Appointment, AppointmentFormData } from '../../appointments/types';
import { Service } from '../../services/types';
import LoadingSpinner from './LoadingSpinner';
import Modal from './Modal';
import DateTimeSelection from './DateTimeSelection';

const PublicAppointmentList: React.FC = () => {
  const { t } = useTranslation(['appointments', 'common']);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { colors } = useTemplateStyles();

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
        const slug = searchUrl.pathname.split('/')[2] || 'default-salon';
        
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
        <h2 
          className="text-xl font-semibold mb-4"
          style={{ color: colors.error }}
        >
          {error}
        </h2>
        <button
          onClick={() => navigate('/')}
          className="font-medium transition-colors duration-300 hover:opacity-80"
          style={{ 
            color: colors.primary
          }}
        >
          {t('common:backToHome')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 
        className="text-2xl font-bold mb-6 bg-clip-text text-transparent"
        style={{
          backgroundImage: `linear-gradient(to right, ${colors.primary}, ${colors.primaryDark})`
        }}
      >
        {t('appointments:yourAppointments')}
      </h1>

      {appointments.length === 0 ? (
        <div className="text-center py-8">
          <p style={{ color: colors.textSecondary }}>
            {t('appointments:noAppointments')}
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 font-medium transition-all duration-300 transform hover:scale-105"
            style={{ color: colors.primary }}
          >
            {t('appointments:bookNew')}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map(appointment => (
            <div
              key={appointment.id}
              className="p-6 rounded-lg transition-all duration-300 hover:scale-[1.02]"
              style={{
                backgroundColor: `${colors.surface}`,
                border: `2px solid ${colors.primary}20`,
                boxShadow: `0 4px 15px ${colors.primary}10`
              }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 
                    className="text-lg font-semibold mb-2"
                    style={{ color: colors.textPrimary }}
                  >
                    {appointment.serviceName}
                  </h3>
                  <p style={{ color: colors.textSecondary }}>
                    {format(parseISO(appointment.date), 'EEEE d MMMM yyyy', { locale: fr })}
                  </p>
                  <p 
                    className="font-medium"
                    style={{ color: colors.primary }}
                  >
                    {appointment.startTime}
                  </p>
                </div>
                
                {canModifyAppointment(appointment.id) && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setShowModifyModal(true);
                      }}
                      className="px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
                      style={{
                        background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
                        color: '#FFFFFF',
                        boxShadow: `0 4px 15px ${colors.primary}40`
                      }}
                    >
                      {t('appointments:modify')}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setShowCancelModal(true);
                      }}
                      className="px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
                      style={{
                        backgroundColor: `${colors.surface}`,
                        color: colors.error,
                        border: `2px solid ${colors.error}`,
                        boxShadow: `0 4px 15px ${colors.error}20`
                      }}
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
                className="px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
                style={{
                  backgroundColor: `${colors.surface}`,
                  color: colors.textSecondary,
                  border: `2px solid ${colors.primary}40`
                }}
              >
                {t('common:cancel')}
              </button>
              <button
                onClick={handleModify}
                disabled={loading}
                className="px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                style={{
                  background: loading 
                    ? '#9CA3AF'
                    : `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
                  color: '#FFFFFF',
                  boxShadow: loading ? 'none' : `0 4px 15px ${colors.primary}40`
                }}
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
          <p style={{ color: colors.textSecondary }}>
            {t('appointments:cancelConfirmation')}
          </p>
          <textarea
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            placeholder={t('appointments:cancelReasonPlaceholder')}
            className="w-full p-3 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2"
            style={{
              backgroundColor: `${colors.surface}`,
              color: colors.textPrimary,
              borderWidth: '2px',
              borderStyle: 'solid',
              borderColor: `${colors.primary}40`,
              '--tw-ring-color': colors.primary
            } as any}
            rows={3}
          />
          <div className="flex justify-end gap-4">
            <button
              onClick={() => setShowCancelModal(false)}
              className="px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
              style={{
                backgroundColor: `${colors.surface}`,
                color: colors.textSecondary,
                border: `2px solid ${colors.primary}40`
              }}
            >
              {t('common:back')}
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              style={{
                backgroundColor: loading ? '#9CA3AF' : `${colors.surface}`,
                color: colors.error,
                border: `2px solid ${colors.error}`,
                boxShadow: loading ? 'none' : `0 4px 15px ${colors.error}20`
              }}
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
