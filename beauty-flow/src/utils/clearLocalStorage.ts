/**
 * Utilitaire pour nettoyer les données en cache du localStorage
 * et forcer la synchronisation avec l'API backend
 */

import { useAppointmentStore } from '../features/appointments/store';
import { useServiceStore } from '../features/services/store';
import { useClientStore } from '../features/clients/store';
import { useTeamStore } from '../features/team/store';

export const clearAllLocalData = () => {
  // Nettoyer le localStorage
  const keysToRemove = [
    'beauty-flow-appointments',
    'beauty-flow-services', 
    'beauty-flow-clients',
    'beauty-flow-team',
    'beauty-flow-interface',
    'beauty-flow-profile'
  ];

  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });

  // Nettoyer les stores Zustand
  useAppointmentStore.getState().clearLocalData();
  
  console.log('✅ Données locales nettoyées avec succès');
  console.log('🔄 L\'application va maintenant utiliser l\'API backend');
  
  // Recharger la page pour forcer la re-initialisation
  window.location.reload();
};

export const syncAllStores = async () => {
  try {
    console.log('🔄 Synchronisation avec le backend...');
    
    // Synchroniser tous les stores
    await useAppointmentStore.getState().syncWithBackend();
    
    console.log('✅ Synchronisation terminée');
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation:', error);
  }
};

// Fonction pour diagnostiquer les données
export const diagnoseData = () => {
  const appointmentStore = useAppointmentStore.getState();
  
  console.log('📊 DIAGNOSTIC DES DONNÉES:');
  console.log('Rendez-vous en mémoire:', appointmentStore.appointments.length);
  console.log('Données localStorage:', {
    appointments: localStorage.getItem('beauty-flow-appointments') ? 'Présent' : 'Absent',
    services: localStorage.getItem('beauty-flow-services') ? 'Présent' : 'Absent',
    clients: localStorage.getItem('beauty-flow-clients') ? 'Présent' : 'Absent',
    team: localStorage.getItem('beauty-flow-team') ? 'Présent' : 'Absent'
  });
  
  if (appointmentStore.appointments.length > 0) {
    console.log('⚠️  Des données sont présentes en cache local');
    console.log('💡 Utilisez clearAllLocalData() pour les nettoyer');
  } else {
    console.log('✅ Aucune donnée en cache, l\'API sera utilisée');
  }
};

// Exposer les fonctions globalement pour le debug
if (typeof window !== 'undefined') {
  (window as any).beautyFlowDebug = {
    clearAllLocalData,
    syncAllStores,
    diagnoseData
  };
}
