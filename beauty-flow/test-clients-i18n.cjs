// Script de test pour vérifier l'internationalisation de ClientsPage
const fs = require('fs');
const path = require('path');

// Clés utilisées dans ClientsPage.tsx
const requiredKeys = [
  'page_title',
  'page_subtitle',
  'new_client',
  'loading.clients',
  'loading.preparing',
  'stats.clients_total_badge',
  'stats.vip_clients_badge',
  'stats.total',
  'stats.all_clients',
  'stats.vip_title',
  'stats.vip_description',
  'stats.recent_title',
  'stats.recent_description',
  'stats.loyalty_title',
  'stats.loyalty_description',
  'search.placeholder',
  'search.results',
  'empty_state.no_clients',
  'empty_state.modify_filters',
  'empty_state.create_first',
  'empty_state.create_client',
  'errors.saving',
  'errors.deleting'
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

console.log('🔍 Vérification de l\'internationalisation de ClientsPage...\n');

let allValid = true;

for (const lang of languages) {
  const filePath = path.join(__dirname, 'public', 'locales', lang, 'clients.json');
  
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
  console.log('✨ ClientsPage.tsx est maintenant entièrement internationalisé.');
} else {
  console.log('⚠️  ATTENTION: Certaines clés sont manquantes.');
}

console.log('\n📊 Résumé:');
console.log(`- Langues testées: ${languages.length}`);
console.log(`- Clés vérifiées: ${requiredKeys.length}`);
console.log(`- Statut: ${allValid ? 'RÉUSSI' : 'ÉCHEC'}`);
