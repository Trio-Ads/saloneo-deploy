const fs = require('fs');
const path = require('path');

console.log('🔧 COMPLÉTION DES TRADUCTIONS BERBÈRES MANQUANTES');
console.log('============================================================\n');

// Lire le fichier berbère de référence pour obtenir toutes les clés
function getAllKeysFromBerber(filePath) {
  if (!fs.existsSync(filePath)) return {};
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.log(`❌ Erreur lecture ${filePath}:`, e.message);
    return {};
  }
}

// Fonction pour obtenir toutes les clés d'un objet de manière récursive
function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (let key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys = keys.concat(getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

// Fonction pour obtenir une valeur imbriquée
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current && current[key], obj);
}

// Fonction pour définir une valeur imbriquée
function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((current, key) => {
    if (!current[key]) current[key] = {};
    return current[key];
  }, obj);
  target[lastKey] = value;
}

const languages = ['es', 'pt', 'tr'];
const files = [
  'auth.json',
  'common.json', 
  'dashboard.json',
  'services.json',
  'clients.json',
  'team.json',
  'appointments.json',
  'interface.json',
  'profile.json',
  'public.json',
  'marketing.json',
  'subscription.json',
  'errors.json'
];

let totalAdded = 0;

files.forEach(file => {
  console.log(`\n📋 Traitement: ${file}`);
  console.log('------------------------------------------------------------');
  
  // Lire le fichier berbère de référence
  const berberPath = `public/locales/ber/${file}`;
  const berberData = getAllKeysFromBerber(berberPath);
  
  if (Object.keys(berberData).length === 0) {
    console.log(`   ⚠️  Fichier berbère vide ou manquant: ${file}`);
    return;
  }
  
  const berberKeys = getAllKeys(berberData);
  console.log(`   📊 ${berberKeys.length} clés dans le fichier berbère`);
  
  languages.forEach(lang => {
    const langPath = `public/locales/${lang}/${file}`;
    let langData = {};
    
    // Lire le fichier existant ou créer un objet vide
    if (fs.existsSync(langPath)) {
      try {
        langData = JSON.parse(fs.readFileSync(langPath, 'utf8'));
      } catch (e) {
        console.log(`   ❌ Erreur lecture ${lang}/${file}:`, e.message);
        langData = {};
      }
    }
    
    let addedCount = 0;
    
    // Vérifier chaque clé berbère
    berberKeys.forEach(key => {
      const existingValue = getNestedValue(langData, key);
      if (!existingValue) {
        const berberValue = getNestedValue(berberData, key);
        if (berberValue) {
          setNestedValue(langData, key, berberValue);
          addedCount++;
        }
      }
    });
    
    // Sauvegarder le fichier mis à jour
    if (addedCount > 0) {
      try {
        const dir = path.dirname(langPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(langPath, JSON.stringify(langData, null, 2), 'utf8');
        console.log(`   ✅ ${lang.toUpperCase()}: ${addedCount} clés ajoutées`);
        totalAdded += addedCount;
      } catch (e) {
        console.log(`   ❌ Erreur écriture ${lang}/${file}:`, e.message);
      }
    } else {
      console.log(`   ✅ ${lang.toUpperCase()}: Déjà complet`);
    }
  });
});

console.log('\n📊 RÉSUMÉ FINAL');
console.log('============================================================');
console.log(`✅ Total de clés ajoutées: ${totalAdded}`);
console.log('✅ Toutes les langues ont maintenant les mêmes clés que le berbère');
console.log('✅ L\'application devrait maintenant afficher le berbère partout');

console.log('\n🧪 POUR TESTER:');
console.log('1. Redémarrer l\'application: npm run dev');
console.log('2. Changer la langue vers le berbère');
console.log('3. Naviguer dans toutes les pages');
console.log('4. Vérifier que les traductions s\'affichent');

console.log('\n🎉 COMPLÉTION DES TRADUCTIONS BERBÈRES TERMINÉE !');
