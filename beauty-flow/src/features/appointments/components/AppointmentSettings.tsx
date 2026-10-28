import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppointmentStore } from '../store';
import { useInterfaceStore } from '../../interface/store';
import api from '../../../services/api';

const AppointmentSettings: React.FC = () => {
  const { t } = useTranslation(['appointments', 'common']);
  const { appointmentSettings, updateAppointmentSettings } = useAppointmentStore();
  const { saveSettings } = useInterfaceStore();
  
  const [bufferTime, setBufferTime] = useState(appointmentSettings.bufferTimeBetweenAppointments);
  const [minBookingTime, setMinBookingTime] = useState(24); // heures
  const [maxAdvanceBooking, setMaxAdvanceBooking] = useState(30); // jours
  const [allowCancellation, setAllowCancellation] = useState(true);
  const [cancellationDeadline, setCancellationDeadline] = useState(24); // heures
  const [businessHours, setBusinessHours] = useState({
    start: '09:00',
    end: '19:00',
    lunchBreak: {
      enabled: false,
      start: '12:00',
      end: '14:00'
    }
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setBufferTime(appointmentSettings.bufferTimeBetweenAppointments);
  }, [appointmentSettings]);
  
  const handleBufferTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setBufferTime(isNaN(value) ? 0 : value);
  };

  const handleMinBookingTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setMinBookingTime(isNaN(value) ? 24 : value);
  };

  const handleMaxAdvanceBookingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setMaxAdvanceBooking(isNaN(value) ? 30 : value);
  };

  const handleCancellationDeadlineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setCancellationDeadline(isNaN(value) ? 24 : value);
  };
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Mettre à jour les paramètres de rendez-vous dans le store local
      updateAppointmentSettings({
        bufferTimeBetweenAppointments: bufferTime
      });

      // Sauvegarder dans le backend via l'API profile
      await api.put('/profile', {
        businessHours: {
          ...businessHours,
          minBookingTime,
          maxAdvanceBooking,
          allowCancellation,
          cancellationDeadline,
          bufferTime
        }
      });

      // Déclencher la sauvegarde globale des paramètres d'interface
      await saveSettings();
      
      // TODO: Remplacer par une notification toast
      alert(t('appointment_settings.success_message'));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des paramètres:', error);
      alert(t('appointment_settings.error_message'));
    } finally {
      setIsSaving(false);
    }
  };
  
  const label = 'block text-sm font-medium text-gray-900 dark:text-gray-50';
  const help = 'mt-1 text-xs text-gray-500 dark:text-gray-400';
  const unit = 'text-sm text-gray-500 dark:text-gray-400';
  const checkbox = 'size-4 rounded border-gray-300 text-orange-500 accent-orange-500 focus:ring-orange-500 dark:border-gray-600';

  const numberRow = (id: string, title: string, description: string, value: number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, unitLabel: string, props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <div className="grid gap-3 py-5 first:pt-0 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-6">
      <div>
        <label htmlFor={id} className={label}>{title}</label>
        <p className={help}>{description}</p>
      </div>
      <div className="flex items-center gap-3">
        <input type="number" id={id} value={value} onChange={onChange} className="field w-24 tabular-nums" {...props} />
        <span className={unit}>{unitLabel}</span>
      </div>
    </div>
  );

  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-800">
      {numberRow('bufferTime', t('appointment_settings.buffer_time'), t('appointment_settings.buffer_time_description'), bufferTime, handleBufferTimeChange, t('appointment_settings.units.minutes'), { min: 0, max: 60, step: 5 })}
      {numberRow('minBookingTime', t('appointment_settings.min_booking_time'), t('appointment_settings.min_booking_time_description'), minBookingTime, handleMinBookingTimeChange, t('appointment_settings.units.hours_advance'), { min: 1, max: 168 })}
      {numberRow('maxAdvanceBooking', t('appointment_settings.max_advance_booking'), t('appointment_settings.max_advance_booking_description'), maxAdvanceBooking, handleMaxAdvanceBookingChange, t('appointment_settings.units.days'), { min: 1, max: 365 })}

      {/* Politique d'annulation */}
      <div className="py-5">
        <p className={label}>{t('appointment_settings.cancellation_policy')}</p>
        <label htmlFor="allowCancellation" className="mt-3 flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            id="allowCancellation"
            checked={allowCancellation}
            onChange={(e) => setAllowCancellation(e.target.checked)}
            className={checkbox}
          />
          {t('appointment_settings.allow_cancellation')}
        </label>
        {allowCancellation && (
          <div className="mt-4 flex flex-wrap items-center gap-3 ps-7">
            <label htmlFor="cancellationDeadline" className="text-sm text-gray-700 dark:text-gray-300">
              {t('appointment_settings.cancellation_deadline')}
            </label>
            <input
              type="number"
              id="cancellationDeadline"
              min="1"
              max="168"
              value={cancellationDeadline}
              onChange={handleCancellationDeadlineChange}
              className="field w-24 tabular-nums"
            />
            <span className={unit}>{t('appointment_settings.units.hours_before')}</span>
          </div>
        )}
      </div>

      {/* Horaires d'ouverture */}
      <div className="py-5">
        <p className={label}>{t('appointment_settings.business_hours')}</p>
        <div className="mt-3 grid grid-cols-2 gap-4 sm:max-w-md">
          <div>
            <label htmlFor="startTime" className="mb-1.5 block text-sm text-gray-700 dark:text-gray-300">
              {t('appointment_settings.opening_time')}
            </label>
            <input
              type="time"
              id="startTime"
              value={businessHours.start}
              onChange={(e) => setBusinessHours(prev => ({ ...prev, start: e.target.value }))}
              className="field tabular-nums"
            />
          </div>
          <div>
            <label htmlFor="endTime" className="mb-1.5 block text-sm text-gray-700 dark:text-gray-300">
              {t('appointment_settings.closing_time')}
            </label>
            <input
              type="time"
              id="endTime"
              value={businessHours.end}
              onChange={(e) => setBusinessHours(prev => ({ ...prev, end: e.target.value }))}
              className="field tabular-nums"
            />
          </div>
        </div>

        <label htmlFor="lunchBreak" className="mt-4 flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            id="lunchBreak"
            checked={businessHours.lunchBreak.enabled}
            onChange={(e) => setBusinessHours(prev => ({
              ...prev,
              lunchBreak: { ...prev.lunchBreak, enabled: e.target.checked }
            }))}
            className={checkbox}
          />
          {t('appointment_settings.lunch_break')}
        </label>

        {businessHours.lunchBreak.enabled && (
          <div className="mt-3 grid grid-cols-2 gap-4 ps-7 sm:max-w-md">
            <div>
              <label htmlFor="lunchStart" className="mb-1.5 block text-sm text-gray-700 dark:text-gray-300">
                {t('appointment_settings.lunch_start')}
              </label>
              <input
                type="time"
                id="lunchStart"
                value={businessHours.lunchBreak.start}
                onChange={(e) => setBusinessHours(prev => ({
                  ...prev,
                  lunchBreak: { ...prev.lunchBreak, start: e.target.value }
                }))}
                className="field tabular-nums"
              />
            </div>
            <div>
              <label htmlFor="lunchEnd" className="mb-1.5 block text-sm text-gray-700 dark:text-gray-300">
                {t('appointment_settings.lunch_end')}
              </label>
              <input
                type="time"
                id="lunchEnd"
                value={businessHours.lunchBreak.end}
                onChange={(e) => setBusinessHours(prev => ({
                  ...prev,
                  lunchBreak: { ...prev.lunchBreak, end: e.target.value }
                }))}
                className="field tabular-nums"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-5">
        <button type="button" onClick={handleSave} disabled={isSaving} className="btn-primary">
          {isSaving && <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
          {isSaving ? t('appointment_settings.saving') : t('appointment_settings.save_settings')}
        </button>
      </div>
    </div>
  );
};

export default AppointmentSettings;
