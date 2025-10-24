import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { format, parseISO, addMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  CalendarDaysIcon, 
  ClockIcon, 
  UserIcon,
  PencilSquareIcon,
  XMarkIcon,
  SparklesIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
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
  const { slug } = useParams<{ slug: string }>();
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

    if (!email && !phone && (!firstName || !lastName)) {
      setError('Paramètres de recherche invalides');
      setLoading(false);
      return;
    }

    const fetchAppointments = async () => {
      try {
        const searchUrl = new URL(window.location.href);
        const currentSlug = searchUrl.pathname.split('/')[2] || slug || 'default-salon';
        
        const queryParams = new URLSearchParams();
        if (email) queryParams.set('email', email);
        if (phone) queryParams.set('phone', phone);
        if (firstName) queryParams.set('firstName', firstName);
        if (lastName) queryParams.set('lastName', lastName);

        const response = await fetch(`/api/public/appointments/search/${currentSlug}?${queryParams.toString()}`);
        
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
  }, [searchParams, slug, t]);

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

      const service = useServiceStore.getState().services.find(
        (s: Service) => s.id === selectedAppointment.serviceId
      );

      if (!service) {
        throw new Error("Service non trouvé");
      }

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
      
      setAppointments(appointments.filter(apt => apt.id !== selectedAppointment.id));
      setShowCancelModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('appointments:errors.cancellationFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleBookNew = () => {
    const searchUrl = new URL(window.location.href);
    const currentSlug = searchUrl.pathname.split('/')[2] || slug || 'default-salon';
    navigate(`/salon/${currentSlug}`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: colors.background }}>
        <div className="max-w-md w-full text-center glass-card p-8 rounded-2xl">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r rounded-full flex items-center justify-center mb-4" style={{ 
            backgroundImage: `linear-gradient(to right, ${colors.error}, ${colors.error}dd)` 
          }}>
            <XMarkIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold mb-4" style={{ color: colors.error }}>
            {error}
          </h2>
          <button
            onClick={handleBookNew}
            className="font-medium transition-all duration-300 transform hover:scale-105 px-6 py-3 rounded-lg"
            style={{ 
              background: `linear-gradient(to right, ${colors.primary}, ${colors.primaryDark})`,
              color: '#FFFFFF',
              boxShadow: `0 4px 15px ${colors.primary}40`
            }}
          >
            {t('common:backToHome')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4" style={{ backgroundColor: colors.background }}>
      <div className="max-w-4xl mx-auto">
        {/* Header avec gradient */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 shadow-lg" style={{
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`
          }}>
            <CalendarDaysIcon className="h-10 w-10 text-white" />
          </div>
          <h1 
            className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(to right, ${colors.primary}, ${colors.primaryDark})`
            }}
          >
            {t('appointments:yourAppointments')}
          </h1>
          <p className="text-lg" style={{ color: colors.textSecondary }}>
            Gérez vos rendez-vous en toute simplicité
          </p>
        </div>

        {appointments.length === 0 ? (
          <div className="text-center py-16 glass-card rounded-2xl animate-fade-in">
            <div className="mx-auto w-24 h-24 bg-gradient-to-r rounded-full flex items-center justify-center mb-6" style={{
              backgroundImage: `linear-gradient(to right, ${colors.primary}20, ${colors.primaryDark}20)`
            }}>
              <CalendarDaysIcon className="h-12 w-12" style={{ color: colors.primary }} />
            </div>
            <h3 className="text-2xl font-bold mb-4" style={{ color: colors.textPrimary }}>
              {t('appointments:noAppointments')}
            </h3>
            <p className="mb-8 text-lg" style={{ color: colors.textSecondary }}>
              Vous n'avez aucun rendez-vous à venir
            </p>
            <button
              onClick={handleBookNew}
              className="inline-flex items-center space-x-2 font-medium transition-all duration-300 transform hover:scale-105 px-8 py-4 rounded-xl text-lg"
              style={{ 
                background: `linear-gradient(to right, ${colors.primary}, ${colors.primaryDark})`,
                color: '#FFFFFF',
                boxShadow: `0 4px 20px ${colors.primary}40`
              }}
            >
              <SparklesIcon className="h-6 w-6" />
              <span>{t('appointments:bookNew')}</span>
            </button>
          </div>
        ) : (
          <>
            <div className="grid gap-6 mb-8">
              {appointments.map((appointment, index) => (
                <div
                  key={appointment.id}
                  className={`glass-card p-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] animate-fade-in`}
                  style={{
                    border: `2px solid ${colors.primary}20`,
                    boxShadow: `0 4px 20px ${colors.primary}10`,
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="flex-1 space-y-4">
                      {/* Service */}
                      <div className="flex items-start space-x-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: `${colors.primary}20` }}>
                          <SparklesIcon className="h-5 w-5" style={{ color: colors.primary }} />
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                            Service
                          </p>
                          <h3 className="text-xl font-bold" style={{ color: colors.textPrimary }}>
                            {appointment.serviceName}
                          </h3>
                        </div>
                      </div>

                      {/* Date et heure */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg" style={{ backgroundColor: `${colors.accent}20` }}>
                            <CalendarDaysIcon className="h-5 w-5" style={{ color: colors.accent }} />
                          </div>
                          <div>
                            <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                              Date
                            </p>
                            <p className="font-semibold" style={{ color: colors.textPrimary }}>
                              {format(parseISO(appointment.date), 'EEEE d MMMM', { locale: fr })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg" style={{ backgroundColor: `${colors.accent}20` }}>
                            <ClockIcon className="h-5 w-5" style={{ color: colors.accent }} />
                          </div>
                          <div>
                            <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                              Heure
                            </p>
                            <p className="font-semibold" style={{ color: colors.textPrimary }}>
                              {appointment.startTime}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {canModifyAppointment(appointment.id) && (
                      <div className="flex flex-col gap-3">
                        <button
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setShowModifyModal(true);
                          }}
                          className="flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
                          style={{
                            background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
                            color: '#FFFFFF',
                            boxShadow: `0 4px 15px ${colors.primary}40`
                          }}
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                          <span>{t('appointments:modify')}</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setShowCancelModal(true);
                          }}
                          className="flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
                          style={{
                            backgroundColor: `${colors.surface}`,
                            color: colors.error,
                            border: `2px solid ${colors.error}`,
                            boxShadow: `0 4px 15px ${colors.error}20`
                          }}
                        >
                          <XMarkIcon className="h-5 w-5" />
                          <span>{t('appointments:cancel')}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Bouton pour nouveau rendez-vous */}
            <div className="text-center glass-card p-8 rounded-2xl">
              <h3 className="text-xl font-bold mb-4" style={{ color: colors.textPrimary }}>
                Besoin d'un autre rendez-vous ?
              </h3>
              <button
                onClick={handleBookNew}
                className="inline-flex items-center space-x-2 font-medium transition-all duration-300 transform hover:scale-105 px-8 py-4 rounded-xl"
                style={{ 
                  background: `linear-gradient(to right, ${colors.primary}, ${colors.primaryDark})`,
                  color: '#FFFFFF',
                  boxShadow: `0 4px 20px ${colors.primary}40`
                }}
              >
                <SparklesIcon className="h-6 w-6" />
                <span>Prendre un nouveau rendez-vous</span>
              </button>
            </div>
          </>
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
    </div>
  );
};

export default PublicAppointmentList;
