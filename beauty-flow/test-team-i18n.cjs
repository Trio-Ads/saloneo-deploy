// Script de test pour vérifier l'internationalisation de TeamPage
const fs = require('fs');
const path = require('path');

// Clés utilisées dans TeamPage.tsx
const requiredKeys = [
  'title',
  'subtitle',
  'badges.members',
  'badges.active',
  'actions.add_member',
  'limits.reached',
  'limits.title',
  'stats.total_team',
  'stats.all_members',
  'stats.active',
  'stats.available_members',
  'stats.roles',
  'stats.position_types',
  'stats.avg_specialties',
  'stats.per_member',
  'search.placeholder',
  'filters.all_roles',
  'search.results',
  'search.for',
  'search.with_role',
  'errors.save_error',
  'messages.delete_confirmation'
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

console.log('🔍 Vérification de l\'internationalisation de TeamPage...\n');

let allValid = true;

for (const lang of languages) {
  const filePath = path.join(__dirname, 'public', 'locales', lang, 'team.json');
  
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
  console.log('✨ TeamPage.tsx est maintenant entièrement internationalisé.');
} else {
  console.log('⚠️  ATTENTION: Certaines clés sont manquantes.');
}

console.log('\n📊 Résumé:');
console.log(`- Langues testées: ${languages.length}`);
console.log(`- Clés vérifiées: ${requiredKeys.length}`);
console.log(`- Statut: ${allValid ? 'RÉUSSI' : 'ÉCHEC'}`);
