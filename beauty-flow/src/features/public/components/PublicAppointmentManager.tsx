import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { publicAPI } from '../../../services/api';
import { getTemplateById } from '../../templates';
import DateTimeSelection from './DateTimeSelection';
import LoadingSpinner from './LoadingSpinner';

export const PublicAppointmentManager: React.FC = () => {
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
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const loadAppointment = async () => {
      if (!token) {
        setError('Token de modification manquant');
        setLoading(false);
        return;
      }
      try {
        const response = await publicAPI.getAppointmentByModificationToken(token);
        setAppointment(response.data.appointment);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Lien de modification invalide ou expiré');
      } finally {
        setLoading(false);
      }
    };
    loadAppointment();
  }, [token]);

  const templateId = appointment?.salon?.theme?.selectedTemplateId || 'saloneo-classic';
  const template = getTemplateById(templateId) ?? getTemplateById('saloneo-classic');
  // Graceful guard: if the registry is ever missing the classic template entirely
  if (!template) return null;
  const { colors, typography } = template.theme;

  const handleModify = async () => {
    if (!newDate || !newTime || !token) {
      setError('Veuillez sélectionner une date et une heure');
      return;
    }
    try {
      setActionLoading(true);
      const response = await publicAPI.modifyAppointmentByModificationToken(token, {
        date: newDate,
        startTime: newTime,
      });
      setAppointment(response.data.appointment);
      setIsModifying(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la modification');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!cancellationReason || !token) {
      setError("Veuillez indiquer une raison d'annulation");
      return;
    }
    try {
      setActionLoading(true);
      await publicAPI.cancelAppointmentByModificationToken(token, { reason: cancellationReason });
      setAppointment({ ...appointment, status: 'cancelled' });
      setShowCancelModal(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'annulation");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  // Error / not found state
  if (error && !appointment) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-6"
        style={{ background: colors.background, fontFamily: typography.bodyFont }}
      >
        {template.customCSS && <style dangerouslySetInnerHTML={{ __html: template.customCSS }} />}
        <div className="text-center max-w-sm">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mx-auto mb-4"
            style={{ background: colors.surface }}
          >
            ✕
          </div>
          <h2 className="text-lg font-extrabold mb-2" style={{ color: colors.text, fontFamily: typography.headingFont }}>
            Lien invalide
          </h2>
          <p className="text-sm mb-6" style={{ color: colors.textSecondary }}>{error}</p>
          <button
            onClick={() => navigate('/')}
            className="text-sm font-bold underline"
            style={{ color: colors.primary }}
          >
            ← Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) =>
    format(parseISO(dateStr), 'EEEE d MMMM yyyy', { locale: fr });

  const statusConfig: Record<string, { label: string; dot: string; badge: string }> = {
    confirmed: { label: 'Confirmé',  dot: 'bg-green-500',  badge: 'bg-green-100 text-green-700' },
    cancelled: { label: 'Annulé',    dot: 'bg-red-500',    badge: 'bg-red-100 text-red-700' },
    scheduled: { label: 'Planifié',  dot: 'bg-yellow-500', badge: 'bg-yellow-100 text-yellow-700' },
  };
  const fallbackStatus = { label: 'Inconnu', dot: 'bg-gray-400', badge: 'bg-gray-100 text-gray-600' };
  const status = statusConfig[appointment?.status ?? ''] ?? fallbackStatus;

  // Respect the server-side modification permission flag
  const canModify = appointment?.canModify !== false
    && appointment?.status !== 'cancelled';

  return (
    <div
      style={{
        background: colors.background,
        color: colors.text,
        minHeight: '100vh',
        fontFamily: typography.bodyFont,
      }}
    >
      {template.customCSS && <style dangerouslySetInnerHTML={{ __html: template.customCSS }} />}

      {/* Header */}
      <div
        className="px-5 py-4 flex items-center justify-between"
        style={{
          background: colors.surface,
          borderBottom: `1px solid ${colors.background}`,
        }}
      >
        <div>
          <button
            onClick={() => navigate('/')}
            className="text-sm font-bold"
            style={{ color: colors.primary }}
          >
            ← Saloneo
          </button>
          <h1
            className="text-xl font-extrabold mt-0.5"
            style={{ color: colors.text, fontFamily: typography.headingFont }}
          >
            Mon rendez-vous
          </h1>
        </div>
      </div>

      {/* RDV card — boarding-pass style */}
      <div className="mx-4 mt-5 rounded-2xl overflow-hidden shadow-md">
        {/* Stub: primary-colored header */}
        <div className="px-5 py-4" style={{ background: colors.primary }}>
          <p className="text-white/80 text-sm font-medium">
            {appointment?.serviceName || 'Rendez-vous'}
          </p>
          <p
            className="text-white text-3xl font-extrabold mt-1 leading-none"
            style={{ fontFamily: typography.headingFont }}
          >
            {appointment?.date ? formatDate(appointment.date) : '—'}
            {' · '}
            {appointment?.startTime ?? '—'}
          </p>
          {(appointment?.stylistName || appointment?.salonName) && (
            <p className="text-white/70 text-sm mt-1">
              {appointment.stylistName && `avec ${appointment.stylistName}`}
              {appointment.stylistName && appointment.salonName && ' · '}
              {appointment.salonName}
            </p>
          )}
        </div>

        {/* Body: status badge */}
        <div className="px-5 py-3" style={{ background: colors.surface }}>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${status.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
        </div>
      </div>

      {/* Inline error */}
      {error && (
        <div className="mx-4 mt-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Modify mode: inline DateTimeSelection */}
      {isModifying && canModify && (
        <div className="mx-4 mt-4">
          <DateTimeSelection
            serviceId={appointment.serviceId}
            selectedDate={newDate || undefined}
            selectedTime={newTime || undefined}
            stylistId={appointment.stylistId}
            onSelect={(date, time) => {
              setNewDate(date);
              setNewTime(time);
            }}
          />
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleModify}
              disabled={actionLoading || !newDate || !newTime}
              className="flex-1 py-3 rounded-xl font-bold text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: colors.primary, color: '#fff' }}
            >
              {actionLoading ? '…' : 'Confirmer le nouveau créneau'}
            </button>
            <button
              onClick={() => { setIsModifying(false); setError(null); }}
              className="px-5 py-3 rounded-xl font-bold text-sm border"
              style={{ borderColor: colors.surface, color: colors.textSecondary }}
            >
              Retour
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      {!isModifying && canModify && (
        <div className="mx-4 mt-4 flex flex-col gap-3">
          <button
            onClick={() => setIsModifying(true)}
            className="w-full py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
            style={{ background: colors.text, color: colors.background }}
          >
            ✎ Modifier le créneau
          </button>
          <button
            onClick={() => setShowCancelModal(true)}
            className="w-full py-3 rounded-xl font-bold text-sm border border-red-400 text-red-500 hover:bg-red-50 transition-colors"
          >
            ✕ Annuler le rendez-vous
          </button>
        </div>
      )}

      {/* Cancel bottom-sheet overlay */}
      {showCancelModal && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.4)' }}
            onClick={() => setShowCancelModal(false)}
          />
          {/* Sheet */}
          <div
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl px-5 pt-5 pb-8"
            style={{ background: colors.background }}
          >
            <div
              className="w-10 h-1 rounded-full mx-auto mb-5"
              style={{ background: colors.surface }}
            />
            <h3
              className="text-base font-extrabold mb-1"
              style={{ color: colors.text, fontFamily: typography.headingFont }}
            >
              Annuler le rendez-vous
            </h3>
            <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>
              Indiquez la raison pour informer le salon.
            </p>
            <textarea
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="Ex : Empêchement de dernière minute…"
              rows={3}
              className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none border"
              style={{
                background: colors.surface,
                color: colors.text,
                borderColor: colors.surface,
              }}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-3 rounded-xl font-bold text-sm border"
                style={{ borderColor: colors.surface, color: colors.textSecondary }}
              >
                Retour
              </button>
              <button
                onClick={handleCancel}
                disabled={actionLoading || !cancellationReason}
                className="flex-1 py-3 rounded-xl font-bold text-sm transition-opacity hover:opacity-90 disabled:opacity-50 bg-red-500 text-white"
              >
                {actionLoading ? '…' : "Confirmer l'annulation"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
