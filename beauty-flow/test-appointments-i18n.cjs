// Script de test pour vérifier l'internationalisation d'AppointmentsPage
const fs = require('fs');
const path = require('path');

// Clés utilisées dans AppointmentsPage.tsx
const requiredKeys = [
  'page_title',
  'page_subtitle',
  'new_appointment',
  'loading.planning',
  'loading.interface_preparation',
  'stats.total_appointments_badge',
  'stats.pending_badge',
  'stats.total',
  'stats.all_appointments',
  'stats.scheduled',
  'stats.awaiting_confirmation',
  'stats.confirmed',
  'stats.ready_to_perform',
  'stats.completed',
  'stats.services_performed',
  'past_appointments.complete_action',
  'past_appointments.no_show_action',
  'past_appointments.none_to_process',
  'past_appointments.found_message',
  'past_appointments.completed_status',
  'past_appointments.no_show_status',
  'past_appointments.processed_message',
  'past_appointments.processing_error',
  'calendar.agenda_view',
  'limits.title',
  'search.placeholder',
  'filters.all_status',
  'view_modes.list',
  'view_modes.calendar',
  'empty_state.no_appointments',
  'empty_state.modify_filters',
  'empty_state.create_first',
  'empty_state.create_appointment',
  'success_messages.appointment_created',
  'errors.form_submission',
  'messages.confirm_cancel',
  'messages.confirm_delete'
];

const languages = ['fr', 'en', 'ar'];

function checkKeys(obj, keyPath) {
  const keys = keyPath.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return false;
    }
  }
  
  return current !== undefined && current !== null && current !== '';
}

console.log('🔍 Vérification de l\'internationalisation d\'AppointmentsPage...\n');

let allValid = true;

for (const lang of languages) {
  const filePath = path.join(__dirname, 'public', 'locales', lang, 'appointments.json');
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const translations = JSON.parse(content);
    
    console.log(`📋 Langue: ${lang.toUpperCase()}`);
    
    const missingKeys = [];
    
    for (const key of requiredKeys) {
      if (!checkKeys(translations, key)) {
        missingKeys.push(key);
        allValid = false;
      }
    }
    
    if (missingKeys.length === 0) {
      console.log(`✅ Toutes les clés sont présentes (${requiredKeys.length})`);
    } else {
      console.log(`❌ Clés manquantes (${missingKeys.length}):`);
      missingKeys.forEach(key => console.log(`   - ${key}`));
    }
    
    console.log('');
    
  } catch (error) {
    console.log(`❌ Erreur lors de la lecture de ${filePath}:`, error.message);
    allValid = false;
  }
}

if (allValid) {
  console.log('🎉 SUCCÈS: Toutes les clés d\'internationalisation sont présentes !');
  console.log('✨ AppointmentsPage.tsx est maintenant entièrement internationalisé.');
} else {
  console.log('⚠️  ATTENTION: Certaines clés sont manquantes.');
}

console.log('\n📊 Résumé:');
console.log(`- Langues testées: ${languages.length}`);
console.log(`- Clés vérifiées: ${requiredKeys.length}`);
console.log(`- Statut: ${allValid ? 'RÉUSSI' : 'ÉCHEC'}`);
