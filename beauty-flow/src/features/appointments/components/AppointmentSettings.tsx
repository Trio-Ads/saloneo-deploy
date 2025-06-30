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
      alert('Paramètres de rendez-vous sauvegardés avec succès !');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des paramètres:', error);
      alert('Erreur lors de la sauvegarde des paramètres');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Temps de battement entre rendez-vous */}
      <div className="glass-card p-6 hover:bg-white/5 transition-all duration-300">
        <label htmlFor="bufferTime" className="block text-lg font-medium text-gray-800 mb-3">
          Temps de battement entre rendez-vous
        </label>
        <div className="flex items-center space-x-4">
          <input
            type="number"
            id="bufferTime"
            min="0"
            max="60"
            step="5"
            value={bufferTime}
            onChange={handleBufferTimeChange}
            className="glass-input px-4 py-3 text-gray-800 w-32"
          />
          <span className="text-gray-600 font-medium">minutes</span>
        </div>
        <p className="mt-3 text-sm text-gray-500">
          Temps minimum entre deux rendez-vous pour permettre le nettoyage et la préparation
        </p>
      </div>

      {/* Délai minimum de réservation */}
      <div className="glass-card p-6 hover:bg-white/5 transition-all duration-300">
        <label htmlFor="minBookingTime" className="block text-lg font-medium text-gray-800 mb-3">
          Délai minimum de réservation
        </label>
        <div className="flex items-center space-x-4">
          <input
            type="number"
            id="minBookingTime"
            min="1"
            max="168"
            value={minBookingTime}
            onChange={handleMinBookingTimeChange}
            className="glass-input px-4 py-3 text-gray-800 w-32"
          />
          <span className="text-gray-600 font-medium">heures à l'avance</span>
        </div>
        <p className="mt-3 text-sm text-gray-500">
          Temps minimum requis entre la réservation et le rendez-vous
        </p>
      </div>

      {/* Réservation maximale à l'avance */}
      <div className="glass-card p-6 hover:bg-white/5 transition-all duration-300">
        <label htmlFor="maxAdvanceBooking" className="block text-lg font-medium text-gray-800 mb-3">
          Réservation maximale à l'avance
        </label>
        <div className="flex items-center space-x-4">
          <input
            type="number"
            id="maxAdvanceBooking"
            min="1"
            max="365"
            value={maxAdvanceBooking}
            onChange={handleMaxAdvanceBookingChange}
            className="glass-input px-4 py-3 text-gray-800 w-32"
          />
          <span className="text-gray-600 font-medium">jours</span>
        </div>
        <p className="mt-3 text-sm text-gray-500">
          Nombre maximum de jours à l'avance pour réserver un rendez-vous
        </p>
      </div>

      {/* Politique d'annulation */}
      <div className="glass-card p-6 hover:bg-white/5 transition-all duration-300">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Politique d'annulation</h3>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="allowCancellation"
              checked={allowCancellation}
              onChange={(e) => setAllowCancellation(e.target.checked)}
              className="w-5 h-5 text-primary bg-white/10 border-white/20 rounded focus:ring-primary"
            />
            <label htmlFor="allowCancellation" className="text-gray-800 font-medium">
              Autoriser l'annulation en ligne
            </label>
          </div>

          {allowCancellation && (
            <div>
              <label htmlFor="cancellationDeadline" className="block text-sm font-medium text-gray-700 mb-2">
                Délai limite d'annulation
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="number"
                  id="cancellationDeadline"
                  min="1"
                  max="168"
                  value={cancellationDeadline}
                  onChange={handleCancellationDeadlineChange}
                  className="glass-input px-4 py-3 text-gray-800 w-32"
                />
                <span className="text-gray-600">heures avant le rendez-vous</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Horaires d'ouverture */}
      <div className="glass-card p-6 hover:bg-white/5 transition-all duration-300">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Horaires d'ouverture</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
              Heure d'ouverture
            </label>
            <input
              type="time"
              id="startTime"
              value={businessHours.start}
              onChange={(e) => setBusinessHours(prev => ({ ...prev, start: e.target.value }))}
              className="glass-input px-4 py-3 text-gray-800 w-full"
            />
          </div>
          
          <div>
            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
              Heure de fermeture
            </label>
            <input
              type="time"
              id="endTime"
              value={businessHours.end}
              onChange={(e) => setBusinessHours(prev => ({ ...prev, end: e.target.value }))}
              className="glass-input px-4 py-3 text-gray-800 w-full"
            />
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center space-x-3 mb-3">
            <input
              type="checkbox"
              id="lunchBreak"
              checked={businessHours.lunchBreak.enabled}
              onChange={(e) => setBusinessHours(prev => ({ 
                ...prev, 
                lunchBreak: { ...prev.lunchBreak, enabled: e.target.checked }
              }))}
              className="w-5 h-5 text-primary bg-white/10 border-white/20 rounded focus:ring-primary"
            />
            <label htmlFor="lunchBreak" className="text-gray-800 font-medium">
              Pause déjeuner
            </label>
          </div>

          {businessHours.lunchBreak.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-8">
              <div>
                <label htmlFor="lunchStart" className="block text-sm font-medium text-gray-700 mb-2">
                  Début de pause
                </label>
                <input
                  type="time"
                  id="lunchStart"
                  value={businessHours.lunchBreak.start}
                  onChange={(e) => setBusinessHours(prev => ({ 
                    ...prev, 
                    lunchBreak: { ...prev.lunchBreak, start: e.target.value }
                  }))}
                  className="glass-input px-4 py-3 text-gray-800 w-full"
                />
              </div>
              
              <div>
                <label htmlFor="lunchEnd" className="block text-sm font-medium text-gray-700 mb-2">
                  Fin de pause
                </label>
                <input
                  type="time"
                  id="lunchEnd"
                  value={businessHours.lunchBreak.end}
                  onChange={(e) => setBusinessHours(prev => ({ 
                    ...prev, 
                    lunchBreak: { ...prev.lunchBreak, end: e.target.value }
                  }))}
                  className="glass-input px-4 py-3 text-gray-800 w-full"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bouton de sauvegarde */}
      <div className="flex justify-end pt-6">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="glass-button px-8 py-3 text-white font-medium
                   bg-gradient-to-r from-indigo-600 to-purple-600
                   hover:from-indigo-700 hover:to-purple-700
                   transform transition-all duration-300 hover:scale-[1.02]
                   shadow-lg hover:shadow-xl disabled:opacity-50
                   disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              <span>Enregistrement...</span>
            </div>
          ) : (
            'Enregistrer les paramètres'
          )}
        </button>
      </div>
    </div>
  );
};

export default AppointmentSettings;
