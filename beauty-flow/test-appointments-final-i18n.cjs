const fs = require('fs');
const path = require('path');

// Couleurs pour la console
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Fonction pour charger un fichier JSON
function loadJSON(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    log(`❌ Erreur lors du chargement de ${filePath}: ${error.message}`, 'red');
    return null;
  }
}

// Fonction pour vérifier les clés manquantes
function checkMissingKeys(reference, target, targetLang, path = '') {
  const missing = [];
  
  for (const key in reference) {
    const currentPath = path ? `${path}.${key}` : key;
    
    if (!(key in target)) {
      missing.push(currentPath);
    } else if (typeof reference[key] === 'object' && reference[key] !== null && !Array.isArray(reference[key])) {
      if (typeof target[key] === 'object' && target[key] !== null) {
        missing.push(...checkMissingKeys(reference[key], target[key], targetLang, currentPath));
      } else {
        missing.push(currentPath);
      }
    }
  }
  
  return missing;
}

// Fonction pour vérifier les clés supplémentaires
function checkExtraKeys(reference, target, targetLang, path = '') {
  const extra = [];
  
  for (const key in target) {
    const currentPath = path ? `${path}.${key}` : key;
    
    if (!(key in reference)) {
      extra.push(currentPath);
    } else if (typeof reference[key] === 'object' && reference[key] !== null && !Array.isArray(reference[key])) {
      if (typeof target[key] === 'object' && target[key] !== null) {
        extra.push(...checkExtraKeys(reference[key], target[key], targetLang, currentPath));
      }
    }
  }
  
  return extra;
}

// Fonction principale de test
function testAppointmentsI18n() {
  log('\n🧪 Test d\'internationalisation des Rendez-vous', 'bold');
  log('='.repeat(60), 'blue');

  const localesDir = path.join(__dirname, 'public', 'locales');
  const languages = ['fr', 'en', 'ar'];
  
  // Charger tous les fichiers de traduction
  const translations = {};
  let allFilesLoaded = true;

  for (const lang of languages) {
    const filePath = path.join(localesDir, lang, 'appointments.json');
    translations[lang] = loadJSON(filePath);
    
    if (!translations[lang]) {
      allFilesLoaded = false;
      log(`❌ Impossible de charger ${lang}/appointments.json`, 'red');
    } else {
      log(`✅ ${lang}/appointments.json chargé`, 'green');
    }
  }

  if (!allFilesLoaded) {
    log('\n❌ Certains fichiers de traduction n\'ont pas pu être chargés.', 'red');
    return;
  }

  // Utiliser le français comme référence
  const reference = translations.fr;
  let hasErrors = false;

  log('\n📋 Vérification de la cohérence des traductions:', 'blue');

  // Vérifier chaque langue par rapport à la référence française
  for (const lang of languages) {
    if (lang === 'fr') continue; // Skip reference language
    
    log(`\n🔍 Vérification de ${lang.toUpperCase()}:`, 'yellow');
    
    const missing = checkMissingKeys(reference, translations[lang], lang);
    const extra = checkExtraKeys(reference, translations[lang], lang);
    
    if (missing.length > 0) {
      hasErrors = true;
      log(`  ❌ Clés manquantes (${missing.length}):`, 'red');
      missing.forEach(key => log(`    - ${key}`, 'red'));
    }
    
    if (extra.length > 0) {
      log(`  ⚠️  Clés supplémentaires (${extra.length}):`, 'yellow');
      extra.forEach(key => log(`    + ${key}`, 'yellow'));
    }
    
    if (missing.length === 0 && extra.length === 0) {
      log(`  ✅ Structure parfaitement cohérente`, 'green');
    }
  }

  // Vérifier les clés spécifiques importantes pour les rendez-vous
  log('\n🎯 Vérification des clés critiques des rendez-vous:', 'blue');
  
  const criticalKeys = [
    'appointment_form.title_new',
    'appointment_form.title_edit',
    'appointment_form.labels.select_client',
    'appointment_form.labels.select_service',
    'appointment_form.labels.select_stylist',
    'appointment_form.buttons.create',
    'appointment_list.status_labels.scheduled',
    'appointment_list.status_labels.confirmed',
    'appointment_list.status_labels.completed',
    'appointment_list.status_labels.cancelled',
    'appointment_list.status_labels.no_show',
    'appointment_list.tooltips.edit',
    'appointment_list.tooltips.cancel',
    'appointment_list.tooltips.complete',
    'calendar_view.today',
    'calendar_view.previous_week',
    'calendar_view.next_week',
    'calendar_view.stats.total',
    'calendar_view.stats.confirmed',
    'calendar_view.stats.completed',
    'appointment_settings.buffer_time',
    'appointment_settings.business_hours',
    'appointment_settings.save_settings'
  ];

  function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current && current[key], obj);
  }

  for (const lang of languages) {
    log(`\n🔍 Clés critiques pour ${lang.toUpperCase()}:`, 'yellow');
    let langHasErrors = false;
    
    for (const key of criticalKeys) {
      const value = getNestedValue(translations[lang], key);
      if (!value) {
        hasErrors = true;
        langHasErrors = true;
        log(`  ❌ Manquant: ${key}`, 'red');
      }
    }
    
    if (!langHasErrors) {
      log(`  ✅ Toutes les clés critiques présentes`, 'green');
    }
  }

  // Statistiques finales
  log('\n📊 Statistiques:', 'blue');
  for (const lang of languages) {
    const keyCount = JSON.stringify(translations[lang]).split('"').length / 2;
    log(`  ${lang.toUpperCase()}: ~${Math.floor(keyCount)} clés`, 'blue');
  }

  // Résultat final
  log('\n' + '='.repeat(60), 'blue');
  if (hasErrors) {
    log('❌ ÉCHEC: Des problèmes ont été détectés dans les traductions', 'red');
    log('🔧 Veuillez corriger les clés manquantes avant de continuer', 'yellow');
  } else {
    log('✅ SUCCÈS: Toutes les traductions des rendez-vous sont cohérentes!', 'green');
    log('🎉 L\'internationalisation des rendez-vous est complète', 'green');
  }
  log('='.repeat(60), 'blue');
}

// Exécuter le test
testAppointmentsI18n();
