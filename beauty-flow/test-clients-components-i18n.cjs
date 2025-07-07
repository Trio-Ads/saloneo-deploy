const fs = require('fs');
const path = require('path');

console.log('🧪 Test d\'internationalisation des Composants Clients');
console.log('============================================================');

// Charger les fichiers de traduction
const loadTranslations = (lang) => {
  try {
    const filePath = path.join(__dirname, 'public', 'locales', lang, 'clients.json');
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`❌ Erreur lors du chargement de ${lang}/clients.json:`, error.message);
    return null;
  }
};

// Charger les traductions
const fr = loadTranslations('fr');
const en = loadTranslations('en');
const ar = loadTranslations('ar');

if (!fr || !en || !ar) {
  console.log('❌ ÉCHEC: Impossible de charger tous les fichiers de traduction');
  process.exit(1);
}

console.log('✅ fr/clients.json chargé');
console.log('✅ en/clients.json chargé');
console.log('✅ ar/clients.json chargé');

// Clés spécifiques aux nouveaux composants
const componentKeys = [
  // ClientForm
  'client_form.title_new',
  'client_form.title_edit',
  'client_form.subtitle',
  'client_form.sections.personal_info',
  'client_form.sections.preferences',
  'client_form.sections.communication',
  'client_form.labels.first_name_required',
  'client_form.labels.last_name_required',
  'client_form.labels.phone_required',
  'client_form.labels.birth_date',
  'client_form.labels.favorite_services',
  'client_form.labels.preferred_stylists',
  'client_form.labels.sms_reminders',
  'client_form.labels.email_marketing',
  'client_form.labels.birthday_offers',
  'client_form.placeholders.enter_first_name',
  'client_form.placeholders.enter_last_name',
  'client_form.placeholders.phone_example',
  'client_form.placeholders.address_example',
  'client_form.placeholders.notes_placeholder',
  'client_form.buttons.cancel',
  'client_form.buttons.add',
  'client_form.buttons.modify',
  'client_form.error_message',
  
  // ClientList
  'client_list.empty_state.title',
  'client_list.empty_state.subtitle',
  'client_list.empty_state.cta',
  'client_list.loyalty_levels.vip',
  'client_list.loyalty_levels.gold',
  'client_list.loyalty_levels.silver',
  'client_list.loyalty_levels.bronze',
  'client_list.info_labels.email',
  'client_list.info_labels.phone',
  'client_list.info_labels.birth_date',
  'client_list.info_labels.last_visit',
  'client_list.profile_sections.hair_profile',
  'client_list.profile_sections.loyalty_points',
  'client_list.profile_sections.communication',
  'client_list.profile_sections.favorite_services',
  'client_list.profile_sections.preferred_stylists',
  'client_list.profile_sections.notes',
  'client_list.hair_info.type',
  'client_list.hair_info.thickness',
  'client_list.communication_badges.sms',
  'client_list.communication_badges.email',
  'client_list.communication_badges.birthday',
  'client_list.tooltips.edit_client',
  'client_list.tooltips.delete_client'
];

// Fonction pour vérifier si une clé existe dans un objet imbriqué
const hasNestedKey = (obj, keyPath) => {
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
};

// Vérifier chaque langue
const checkLanguage = (translations, langCode, langName) => {
  console.log(`\n🔍 Vérification de ${langName.toUpperCase()}:`);
  
  const missingKeys = [];
  const presentKeys = [];
  
  componentKeys.forEach(key => {
    if (hasNestedKey(translations, key)) {
      presentKeys.push(key);
    } else {
      missingKeys.push(key);
    }
  });
  
  if (missingKeys.length === 0) {
    console.log(`  ✅ Toutes les clés des composants sont présentes (${presentKeys.length})`);
    return true;
  } else {
    console.log(`  ❌ Clés manquantes (${missingKeys.length}):`);
    missingKeys.forEach(key => {
      console.log(`    - ${key}`);
    });
    console.log(`  ✅ Clés présentes: ${presentKeys.length}`);
    return false;
  }
};

console.log('\n📋 Vérification des clés spécifiques aux composants:');

const frValid = checkLanguage(fr, 'fr', 'français');
const enValid = checkLanguage(en, 'en', 'anglais');
const arValid = checkLanguage(ar, 'ar', 'arabe');

// Vérification de la cohérence des structures
console.log('\n🔄 Vérification de la cohérence des structures:');

const getStructureKeys = (obj, prefix = '') => {
  const keys = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys.push(...getStructureKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys.sort();
};

const frKeys = getStructureKeys(fr);
const enKeys = getStructureKeys(en);
const arKeys = getStructureKeys(ar);

const structureConsistent = JSON.stringify(frKeys) === JSON.stringify(enKeys) && 
                           JSON.stringify(enKeys) === JSON.stringify(arKeys);

if (structureConsistent) {
  console.log('  ✅ Structure parfaitement cohérente entre toutes les langues');
} else {
  console.log('  ⚠️  Différences de structure détectées');
}

// Statistiques
console.log('\n📊 Statistiques:');
console.log(`  FR: ~${frKeys.length} clés`);
console.log(`  EN: ~${enKeys.length} clés`);
console.log(`  AR: ~${arKeys.length} clés`);
console.log(`  Clés de composants testées: ${componentKeys.length}`);

// Résultat final
console.log('\n============================================================');
if (frValid && enValid && arValid && structureConsistent) {
  console.log('✅ SUCCÈS: Tous les composants clients sont parfaitement internationalisés!');
  console.log('🎉 ClientForm et ClientList supportent maintenant 3 langues');
  console.log('🌍 Français, Anglais et Arabe entièrement pris en charge');
} else {
  console.log('❌ ÉCHEC: Des problèmes ont été détectés dans l\'internationalisation');
  console.log('🔧 Veuillez corriger les clés manquantes avant de continuer');
}
console.log('============================================================');
