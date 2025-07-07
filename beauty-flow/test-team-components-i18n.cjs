const fs = require('fs');
const path = require('path');

console.log('🧪 Test d\'internationalisation des Composants d\'Équipe');
console.log('============================================================');

// Charger les fichiers de traduction
const loadTranslations = (lang) => {
  try {
    const filePath = path.join(__dirname, 'public', 'locales', lang, 'team.json');
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`❌ Erreur lors du chargement de ${lang}/team.json:`, error.message);
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

console.log('✅ fr/team.json chargé');
console.log('✅ en/team.json chargé');
console.log('✅ ar/team.json chargé');

// Clés spécifiques aux nouveaux composants
const componentKeys = [
  // TeamMemberForm
  'team_member_form.title_new',
  'team_member_form.title_edit',
  'team_member_form.subtitle',
  'team_member_form.sections.personal_info',
  'team_member_form.sections.specialties',
  'team_member_form.sections.working_hours',
  'team_member_form.labels.first_name_required',
  'team_member_form.labels.last_name_required',
  'team_member_form.labels.email_required',
  'team_member_form.labels.phone_required',
  'team_member_form.labels.role_required',
  'team_member_form.placeholders.first_name',
  'team_member_form.placeholders.last_name',
  'team_member_form.placeholders.email_example',
  'team_member_form.placeholders.phone_example',
  'team_member_form.working_days.monday',
  'team_member_form.working_days.tuesday',
  'team_member_form.working_days.wednesday',
  'team_member_form.working_days.thursday',
  'team_member_form.working_days.friday',
  'team_member_form.working_days.saturday',
  'team_member_form.working_days.sunday',
  'team_member_form.schedule_labels.works',
  'team_member_form.schedule_labels.from',
  'team_member_form.schedule_labels.to',
  'team_member_form.help_messages.specialties_help',
  'team_member_form.help_messages.order_help',
  'team_member_form.buttons.cancel',
  'team_member_form.buttons.add',
  'team_member_form.buttons.modify',
  
  // TeamList
  'team_list.empty_state.title',
  'team_list.empty_state.subtitle',
  'team_list.empty_state.cta',
  'team_list.info_labels.email',
  'team_list.info_labels.phone',
  'team_list.info_labels.working_days',
  'team_list.info_labels.specialties',
  'team_list.sections.specialties',
  'team_list.sections.weekly_schedule',
  'team_list.stats.days_per_week',
  'team_list.stats.specialties_count',
  'team_list.stats.average',
  'team_list.stats.active',
  'team_list.stats.services',
  'team_list.stats.level_of',
  'team_list.tooltips.edit_member',
  'team_list.tooltips.delete_member',
  'team_list.days_short.monday',
  'team_list.days_short.tuesday',
  'team_list.days_short.wednesday',
  'team_list.days_short.thursday',
  'team_list.days_short.friday',
  'team_list.days_short.saturday',
  'team_list.days_short.sunday'
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

// Vérification spéciale pour les jours de la semaine
console.log('\n📅 Vérification des jours de la semaine:');
const daysKeys = [
  'team_member_form.working_days',
  'team_list.days_short'
];

let daysValid = true;
daysKeys.forEach(section => {
  const frDays = hasNestedKey(fr, section) ? Object.keys(fr[section.split('.')[0]][section.split('.')[1]]) : [];
  const enDays = hasNestedKey(en, section) ? Object.keys(en[section.split('.')[0]][section.split('.')[1]]) : [];
  const arDays = hasNestedKey(ar, section) ? Object.keys(ar[section.split('.')[0]][section.split('.')[1]]) : [];
  
  if (frDays.length === 7 && enDays.length === 7 && arDays.length === 7) {
    console.log(`  ✅ ${section}: 7 jours présents dans toutes les langues`);
  } else {
    console.log(`  ❌ ${section}: Jours manquants (FR:${frDays.length}, EN:${enDays.length}, AR:${arDays.length})`);
    daysValid = false;
  }
});

// Statistiques
console.log('\n📊 Statistiques:');
console.log(`  FR: ~${frKeys.length} clés`);
console.log(`  EN: ~${enKeys.length} clés`);
console.log(`  AR: ~${arKeys.length} clés`);
console.log(`  Clés de composants testées: ${componentKeys.length}`);

// Résultat final
console.log('\n============================================================');
if (frValid && enValid && arValid && structureConsistent && daysValid) {
  console.log('✅ SUCCÈS: Tous les composants d\'équipe sont parfaitement internationalisés!');
  console.log('🎉 TeamMemberForm et TeamList supportent maintenant 3 langues');
  console.log('🌍 Français, Anglais et Arabe entièrement pris en charge');
  console.log('📅 Jours de la semaine correctement traduits');
  console.log('⚡ Horaires de travail internationalisés');
} else {
  console.log('❌ ÉCHEC: Des problèmes ont été détectés dans l\'internationalisation');
  console.log('🔧 Veuillez corriger les clés manquantes avant de continuer');
}
console.log('============================================================');
