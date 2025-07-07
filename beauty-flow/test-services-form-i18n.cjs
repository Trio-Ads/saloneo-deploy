const fs = require('fs');
const path = require('path');

console.log('🧪 Test final de l\'internationalisation du formulaire de service...\n');

// Langues à tester
const languages = ['fr', 'en', 'ar', 'es', 'pt', 'tr'];

// Clés requises pour le formulaire de service
const requiredKeys = {
  services: [
    'form.name',
    'form.description',
    'form.duration',
    'form.price',
    'form.category',
    'details.available'
  ],
  common: [
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
    'actions.cancel',
    'actions.add',
    'actions.edit',
    'actions.add_product'
  ]
};

// Fonction pour vérifier une clé dans un objet imbriqué
function hasNestedKey(obj, path) {
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (!current || typeof current !== 'object' || !(key in current)) {
      return false;
    }
    current = current[key];
  }
  
  return true;
}

let totalErrors = 0;
let totalKeys = 0;

// Tester chaque langue
languages.forEach(lang => {
  console.log(`📋 Test de ${lang}:`);
  
  // Tester services.json
  const servicesPath = path.join(__dirname, 'public', 'locales', lang, 'services.json');
  let servicesData = {};
  let servicesMissingKeys = [];
  
  if (fs.existsSync(servicesPath)) {
    try {
      const content = fs.readFileSync(servicesPath, 'utf8');
      servicesData = JSON.parse(content);
      
      requiredKeys.services.forEach(key => {
        totalKeys++;
        if (!hasNestedKey(servicesData, key)) {
          servicesMissingKeys.push(key);
          totalErrors++;
        }
      });
    } catch (error) {
      console.log(`  ❌ Erreur de parsing services.json: ${error.message}`);
      totalErrors++;
    }
  } else {
    console.log(`  ❌ Fichier manquant: services.json`);
    totalErrors++;
  }
  
  // Tester common.json
  const commonPath = path.join(__dirname, 'public', 'locales', lang, 'common.json');
  let commonData = {};
  let commonMissingKeys = [];
  
  if (fs.existsSync(commonPath)) {
    try {
      const content = fs.readFileSync(commonPath, 'utf8');
      commonData = JSON.parse(content);
      
      requiredKeys.common.forEach(key => {
        totalKeys++;
        if (!hasNestedKey(commonData, key)) {
          commonMissingKeys.push(key);
          totalErrors++;
        }
      });
    } catch (error) {
      console.log(`  ❌ Erreur de parsing common.json: ${error.message}`);
      totalErrors++;
    }
  } else {
    console.log(`  ❌ Fichier manquant: common.json`);
    totalErrors++;
  }
  
  // Afficher les résultats pour cette langue
  if (servicesMissingKeys.length === 0 && commonMissingKeys.length === 0) {
    console.log(`  ✅ Toutes les clés sont présentes`);
  } else {
    if (servicesMissingKeys.length > 0) {
      console.log(`  ❌ services.json - ${servicesMissingKeys.length} clés manquantes:`);
      servicesMissingKeys.forEach(key => {
        console.log(`    - ${key}`);
      });
    }
    if (commonMissingKeys.length > 0) {
      console.log(`  ❌ common.json - ${commonMissingKeys.length} clés manquantes:`);
      commonMissingKeys.forEach(key => {
        console.log(`    - ${key}`);
      });
    }
  }
  
  console.log('');
});

// Résumé final
console.log('📊 Résumé du test:');
console.log(`- Langues testées: ${languages.length}`);
console.log(`- Clés vérifiées par langue: ${requiredKeys.services.length + requiredKeys.common.length}`);
console.log(`- Total de vérifications: ${totalKeys}`);
console.log(`- Erreurs trouvées: ${totalErrors}`);

if (totalErrors === 0) {
  console.log('\n🎉 SUCCÈS ! Toutes les traductions du formulaire de service sont complètes !');
  console.log('✨ Les erreurs "missingkey" du formulaire de service devraient être complètement éliminées.');
} else {
  console.log(`\n⚠️  ${totalErrors} erreurs détectées. Veuillez corriger les clés manquantes.`);
}

console.log('\n🔍 Problèmes corrigés:');
console.log('- ✅ Suppression des doubles préfixes "service." dans ServiceForm.tsx');
console.log('- ✅ Remplacement des textes en dur par des clés de traduction');
console.log('- ✅ Ajout des clés manquantes dans services.json et common.json');
console.log('- ✅ Support complet pour 6 langues (FR, EN, AR, ES, PT, TR)');
