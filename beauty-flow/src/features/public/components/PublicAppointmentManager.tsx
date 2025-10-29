import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { publicAPI } from '../../../services/api';
import DateTimeSelection from './DateTimeSelection';
import Modal from './Modal';
import LoadingSpinner from './LoadingSpinner';

export const PublicAppointmentManager: React.FC = () => {
  const { t } = useTranslation(['appointments', 'common']);
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appointment, setAppointment] = useState<any>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [isModifying, setIsModifying] = useState(false);
  const [newDate, setNewDate] = useState<string | null>(null);
  const [newTime, setNewTime] = useState<string | null>(null);

  useEffect(() => {
    const loadAppointment = async () => {
      if (!token) {
        setError('Token de modification manquant');
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 Chargement du rendez-vous avec le token:', token);
        const response = await publicAPI.getAppointmentByModificationToken(token);
        console.log('✅ Rendez-vous trouvé:', response.data);
        setAppointment(response.data.appointment);
        setError(null);
      } catch (err: any) {
        console.error('❌ Erreur lors du chargement:', err);
        const errorMessage = err.response?.data?.error || 'Lien de modification invalide ou expiré';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadAppointment();
  }, [token]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !appointment) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-4">
          {error || t('appointments:errors.appointmentNotFound')}
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

  const handleModify = async () => {
    if (!newDate || !newTime || !token) {
      setError('Veuillez sélectionner une date et une heure');
      return;
    }

    try {
      setLoading(true);
      // TODO: Implémenter l'API de modification
      console.log('🔄 Modification du rendez-vous:', { newDate, newTime });
      
      // Pour l'instant, on simule une modification réussie
      setAppointment({
        ...appointment,
        date: newDate,
        startTime: newTime
      });
      
      setIsModifying(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la modification');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!cancellationReason || !token) {
      setError('Veuillez indiquer une raison d\'annulation');
      return;
    }

    try {
      setLoading(true);
      // TODO: Implémenter l'API d'annulation
      console.log('❌ Annulation du rendez-vous:', { cancellationReason });
      
      // Pour l'instant, on simule une annulation réussie
      setAppointment({
        ...appointment,
        status: 'cancelled'
      });
      
      setShowCancelModal(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'annulation');
    } finally {
      setLoading(false);
    }
  };

  // Vérifier si le rendez-vous peut être modifié
  const canModify = appointment?.canModify || (appointment?.status === 'scheduled' || appointment?.status === 'confirmed');

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">{t('appointments:manageYourAppointment')}</h1>

      {/* Détails du rendez-vous */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">{t('appointments:currentAppointment')}</h2>
        <div className="space-y-2">
          <p>
            <span className="font-medium">{t('appointments:date')}:</span>{' '}
            {format(parseISO(appointment.date), 'EEEE d MMMM yyyy', { locale: fr })}
          </p>
          <p>
            <span className="font-medium">{t('appointments:time')}:</span>{' '}
            {appointment.startTime}
          </p>
          {appointment.notes && (
            <p>
              <span className="font-medium">{t('appointments:notes')}:</span>{' '}
              {appointment.notes}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      {canModify ? (
        <div className="space-y-4">
          {isModifying ? (
            <>
              <DateTimeSelection
                serviceId={appointment.serviceId}
                selectedDate={newDate || undefined}
                selectedTime={newTime || undefined}
                stylistId={appointment.stylistId}
                onSelect={(date, time, stylistId) => {
                  setNewDate(date);
                  setNewTime(time);
                }}
              />
              <div className="flex gap-4">
                <button
                  onClick={handleModify}
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                  disabled={loading}
                >
                  {t('appointments:confirmModification')}
                </button>
                <button
                  onClick={() => setIsModifying(false)}
                  className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-100"
                >
                  {t('common:cancel')}
                </button>
              </div>
            </>
          ) : (
            <div className="flex gap-4">
              <button
                onClick={() => setIsModifying(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                {t('appointments:modifyAppointment')}
              </button>
              <button
                onClick={() => setShowCancelModal(true)}
                className="border border-red-500 text-red-500 px-4 py-2 rounded hover:bg-red-50"
              >
                {t('appointments:cancelAppointment')}
              </button>
            </div>
          )}
        </div>
      ) : (
        <p className="text-red-600">
          {t('appointments:modificationNotAllowed')}
        </p>
      )}

      {/* Modal d'annulation */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title={t('appointments:cancelAppointment')}
      >
        <div className="space-y-4">
          <p>{t('appointments:cancelConfirmation')}</p>
          <textarea
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            placeholder={t('appointments:cancelReasonPlaceholder')}
            className="w-full p-2 border rounded"
            rows={3}
          />
          <div className="flex justify-end gap-4">
            <button
              onClick={() => setShowCancelModal(false)}
              className="px-4 py-2 border rounded"
            >
              {t('common:back')}
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              disabled={loading}
            >
              {t('appointments:confirmCancellation')}
            </button>
          </div>
        </div>
      </Modal>

      {/* Messages d'erreur */}
      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
    </div>
  );
};
