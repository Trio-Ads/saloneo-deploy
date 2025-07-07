// Script de test pour vérifier l'internationalisation des composants Core
const fs = require('fs');
const path = require('path');

// Clés utilisées dans les composants Core
const requiredKeys = {
  // Modal.tsx
  modal: [
    'modal.close'
  ],
  
  // Toast.tsx  
  toast: [
    'toast.close'
  ],
  
  // UserMenu.tsx
  userMenu: [
    'user_menu.user_name',
    'user_menu.user_email',
    'user_menu.plan_prefix',
    'user_menu.plans.FREE',
    'user_menu.plans.STARTER',
    'user_menu.plans.PRO',
    'user_menu.plans.ENTERPRISE',
    'user_menu.menu_items.profile.description',
    'user_menu.menu_items.interface.description',
    'user_menu.menu_items.subscription.description',
    'user_menu.language_section.title',
    'user_menu.language_section.current',
    'user_menu.version',
    'actions.logout',
    'actions.logging_out'
  ],
  
  // ServiceForm.tsx
  serviceForm: [
    'service_form.titles.new',
    'service_form.titles.edit',
    'service_form.subtitle',
    'service_form.sections.basic_info',
    'service_form.sections.products',
    'service_form.sections.photos',
    'service_form.placeholders.name',
    'service_form.placeholders.description',
    'service_form.labels.product',
    'service_form.labels.quantity',
    'service_form.messages.no_products',
    'service_form.units.min',
    'actions.add_product'
  ],
  
  // ProfileForm.tsx
  profileForm: [
    'profile_form.tabs.profile',
    'profile_form.tabs.affiliation',
    'profile_form.sections.login_info',
    'profile_form.sections.personal_info',
    'profile_form.sections.salon_info',
    'profile_form.sections.preferences',
    'profile_form.sections.public_link',
    'profile_form.fields.email',
    'profile_form.fields.current_password',
    'profile_form.fields.new_password',
    'profile_form.fields.confirm_password',
    'profile_form.fields.first_name',
    'profile_form.fields.last_name',
    'profile_form.fields.establishment_name',
    'profile_form.fields.address',
    'profile_form.fields.language',
    'profile_form.fields.currency',
    'profile_form.buttons.change_password',
    'profile_form.buttons.cancel_password',
    'profile_form.messages.password_required',
    'profile_form.messages.password_min_length',
    'profile_form.messages.passwords_not_match',
    'profile_form.messages.password_updated',
    'profile_form.messages.currency_updated',
    'profile_form.messages.currency_error',
    'profile_form.messages.public_link_description',
    'profile_form.messages.public_link_label',
    'firstName',
    'lastName',
    'establishmentName',
    'address',
    'language',
    'currency',
    'publicLinkCopied',
    'success.save',
    'error.save',
    'actions.saving'
  ]
};

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

function loadTranslations(lang, namespace) {
  const filePath = path.join(__dirname, 'public', 'locales', lang, `${namespace}.json`);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.log(`❌ Erreur lors de la lecture de ${filePath}:`, error.message);
    return null;
  }
}

console.log('🔍 Vérification de l\'internationalisation des composants Core...\n');

let allValid = true;
let totalKeys = 0;
let totalMissing = 0;

for (const lang of languages) {
  console.log(`📋 Langue: ${lang.toUpperCase()}`);
  
  // Charger les fichiers de traduction
  const commonTranslations = loadTranslations(lang, 'common');
  const profileTranslations = loadTranslations(lang, 'profile');
  const servicesTranslations = loadTranslations(lang, 'services');
  
  if (!commonTranslations || !profileTranslations || !servicesTranslations) {
    allValid = false;
    continue;
  }
  
  let langMissing = 0;
  
  // Vérifier les clés dans common.json
  const commonKeys = [...requiredKeys.modal, ...requiredKeys.toast, ...requiredKeys.userMenu, ...requiredKeys.serviceForm];
  for (const key of commonKeys) {
    totalKeys++;
    if (!checkKeys(commonTranslations, key)) {
      console.log(`   ❌ common.json: ${key}`);
      langMissing++;
      allValid = false;
    }
  }
  
  // Vérifier les clés dans profile.json
  for (const key of requiredKeys.profileForm) {
    totalKeys++;
    if (!checkKeys(profileTranslations, key)) {
      console.log(`   ❌ profile.json: ${key}`);
      langMissing++;
      allValid = false;
    }
  }
  
  if (langMissing === 0) {
    console.log(`✅ Toutes les clés sont présentes`);
  } else {
    console.log(`❌ ${langMissing} clés manquantes`);
    totalMissing += langMissing;
  }
  
  console.log('');
}

console.log('📊 Résumé final:');
console.log(`- Langues testées: ${languages.length}`);
console.log(`- Clés vérifiées: ${totalKeys / languages.length}`);
console.log(`- Clés manquantes: ${totalMissing}`);
console.log(`- Statut: ${allValid ? '✅ RÉUSSI' : '❌ ÉCHEC'}`);

if (allValid) {
  console.log('\n🎉 SUCCÈS: Tous les composants Core sont internationalisés !');
  console.log('✨ Modal, Toast, UserMenu, ServiceForm et ProfileForm sont prêts.');
} else {
  console.log('\n⚠️  ATTENTION: Certaines clés sont manquantes.');
  console.log('🔧 Veuillez ajouter les clés manquantes dans les fichiers JSON correspondants.');
}

console.log('\n🎯 Composants Core testés:');
console.log('- Modal.tsx (minimal)');
console.log('- Toast.tsx (minimal)');
console.log('- UserMenu.tsx (partiellement internationalisé)');
console.log('- ServiceForm.tsx (partiellement internationalisé)');
console.log('- ProfileForm.tsx (partiellement internationalisé)');
