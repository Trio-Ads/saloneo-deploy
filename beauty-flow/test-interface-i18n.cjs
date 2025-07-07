// Script de test pour vérifier l'internationalisation d'InterfacePage
const fs = require('fs');
const path = require('path');

// Clés utilisées dans InterfacePage.tsx
const requiredKeys = [
  'page.title',
  'page.subtitle',
  'page.loading_subtitle',
  'page.loading_interface',
  'tabs.templates',
  'tabs.colors',
  'tabs.images',
  'tabs.content',
  'tabs.settings',
  'sections.templates.title',
  'sections.templates.description',
  'sections.colors.title',
  'sections.colors.description',
  'sections.images.title',
  'sections.images.description',
  'sections.content.title',
  'sections.content.description',
  'sections.settings.title',
  'sections.settings.description',
  'forms.presentation.label',
  'forms.presentation.placeholder',
  'forms.services_display',
  'forms.appointments_settings',
  'forms.team_display',
  'forms.share_link',
  'team.show_on_public',
  'team.description',
  'team.visible_message',
  'team.hidden_message',
  'images.logo_label',
  'images.banner_label',
  'images.logo_tip',
  'images.banner_tip',
  'actions.save',
  'actions.saving',
  'errors.upload',
  'errors.save'
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

console.log('🔍 Vérification de l\'internationalisation d\'InterfacePage...\n');

let allValid = true;

for (const lang of languages) {
  const filePath = path.join(__dirname, 'public', 'locales', lang, 'interface.json');
  
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
  console.log('✨ InterfacePage.tsx est maintenant entièrement internationalisé.');
} else {
  console.log('⚠️  ATTENTION: Certaines clés sont manquantes.');
}

console.log('\n📊 Résumé:');
console.log(`- Langues testées: ${languages.length}`);
console.log(`- Clés vérifiées: ${requiredKeys.length}`);
console.log(`- Statut: ${allValid ? 'RÉUSSI' : 'ÉCHEC'}`);
