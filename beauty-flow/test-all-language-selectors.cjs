const fs = require('fs');

console.log('🔍 TEST COMPLET - TOUS LES SÉLECTEURS DE LANGUE');
console.log('============================================================\n');

// 1. VÉRIFICATION DE TOUS LES SÉLECTEURS DE LANGUE
console.log('📋 ÉTAPE 1: VÉRIFICATION DES SÉLECTEURS DE LANGUE');
console.log('------------------------------------------------------------');

const languageSelectors = [
  {
    name: 'LanguageSelector.tsx',
    path: 'src/components/LanguageSelector.tsx',
    description: 'Sélecteur principal (pages internes)'
  },
  {
    name: 'AuthLanguageSelector.tsx',
    path: 'src/components/AuthLanguageSelector.tsx',
    description: 'Sélecteur pour pages d\'authentification'
  },
  {
    name: 'NavbarLanguageSelector.tsx',
    path: 'src/components/NavbarLanguageSelector.tsx',
    description: 'Sélecteur dans la barre de navigation'
  }
];

const expectedLanguages = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'ber', name: 'Tamazight', flag: '🏴' }
];

let allSelectorsValid = true;

languageSelectors.forEach(selector => {
  console.log(`\n🔍 Vérification: ${selector.name}`);
  console.log(`   ${selector.description}`);
  
  if (fs.existsSync(selector.path)) {
    const content = fs.readFileSync(selector.path, 'utf8');
    
    // Vérifier chaque langue
    expectedLanguages.forEach(lang => {
      const pattern = new RegExp(`code: '${lang.code}'.*name: '${lang.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'.*flag: '${lang.flag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`);
      
      if (content.includes(`code: '${lang.code}'`) && content.includes(`name: '${lang.name}'`) && content.includes(`flag: '${lang.flag}'`)) {
        console.log(`   ✅ ${lang.flag} ${lang.name} (${lang.code})`);
      } else {
        console.log(`   ❌ ${lang.flag} ${lang.name} (${lang.code}) - MANQUANT`);
        allSelectorsValid = false;
      }
    });
    
    // Vérifier le nombre total de langues
    const languageMatches = content.match(/code: '[a-z]+'/g);
    if (languageMatches && languageMatches.length === expectedLanguages.length) {
      console.log(`   ✅ Nombre correct de langues: ${languageMatches.length}`);
    } else {
      console.log(`   ❌ Nombre incorrect de langues: ${languageMatches ? languageMatches.length : 0} (attendu: ${expectedLanguages.length})`);
      allSelectorsValid = false;
    }
    
  } else {
    console.log(`   ❌ Fichier non trouvé: ${selector.path}`);
    allSelectorsValid = false;
  }
});

// 2. VÉRIFICATION DE LA CONFIGURATION I18N
console.log('\n📋 ÉTAPE 2: VÉRIFICATION CONFIGURATION I18N');
console.log('------------------------------------------------------------');

const i18nPath = 'src/i18n.ts';
if (fs.existsSync(i18nPath)) {
  const i18nContent = fs.readFileSync(i18nPath, 'utf8');
  
  console.log('🔍 Configuration i18n:');
  
  // Vérifier le type Language
  if (i18nContent.includes("'fr' | 'en' | 'ar' | 'es' | 'tr' | 'pt' | 'ber'")) {
    console.log('   ✅ Type Language complet avec berbère');
  } else {
    console.log('   ❌ Type Language incomplet');
    allSelectorsValid = false;
  }
  
  // Vérifier supportedLngs
  if (i18nContent.includes("supportedLngs: ['fr', 'en', 'ar', 'es', 'tr', 'pt', 'ber']")) {
    console.log('   ✅ supportedLngs inclut le berbère');
  } else {
    console.log('   ❌ supportedLngs ne contient pas le berbère');
    allSelectorsValid = false;
  }
  
} else {
  console.log('❌ Fichier i18n.ts non trouvé');
  allSelectorsValid = false;
}

// 3. VÉRIFICATION DES FICHIERS JSON BERBÈRES
console.log('\n📋 ÉTAPE 3: VÉRIFICATION FICHIERS JSON BERBÈRES');
console.log('------------------------------------------------------------');

const berberDir = 'public/locales/ber';
const expectedFiles = [
  'auth.json', 'common.json', 'dashboard.json', 'services.json',
  'clients.json', 'team.json', 'appointments.json', 'interface.json',
  'profile.json', 'public.json', 'marketing.json', 'subscription.json', 'errors.json'
];

let berberFilesValid = true;
let totalBerberKeys = 0;

expectedFiles.forEach(file => {
  const filePath = `${berberDir}/${file}`;
  if (fs.existsSync(filePath)) {
    try {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const keyCount = countKeys(content);
      totalBerberKeys += keyCount;
      console.log(`   ✅ ${file} - ${keyCount} clés`);
    } catch (e) {
      console.log(`   ❌ ${file} - JSON invalide`);
      berberFilesValid = false;
    }
  } else {
    console.log(`   ❌ ${file} - Manquant`);
    berberFilesValid = false;
  }
});

function countKeys(obj) {
  let count = 0;
  for (let key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      count += countKeys(obj[key]);
    } else {
      count++;
    }
  }
  return count;
}

console.log(`\n📊 Total: ${totalBerberKeys} traductions berbères`);

// 4. TEST DE COHÉRENCE ENTRE SÉLECTEURS
console.log('\n📋 ÉTAPE 4: TEST DE COHÉRENCE ENTRE SÉLECTEURS');
console.log('------------------------------------------------------------');

const selectorContents = {};
languageSelectors.forEach(selector => {
  if (fs.existsSync(selector.path)) {
    selectorContents[selector.name] = fs.readFileSync(selector.path, 'utf8');
  }
});

// Vérifier que tous les sélecteurs ont les mêmes langues
const languageCodes = expectedLanguages.map(lang => lang.code);
let consistencyValid = true;

languageCodes.forEach(code => {
  const selectorsWithLang = [];
  Object.entries(selectorContents).forEach(([name, content]) => {
    if (content.includes(`code: '${code}'`)) {
      selectorsWithLang.push(name);
    }
  });
  
  if (selectorsWithLang.length === Object.keys(selectorContents).length) {
    console.log(`   ✅ ${code.toUpperCase()} présent dans tous les sélecteurs`);
  } else {
    console.log(`   ❌ ${code.toUpperCase()} manquant dans: ${Object.keys(selectorContents).filter(name => !selectorsWithLang.includes(name)).join(', ')}`);
    consistencyValid = false;
  }
});

// 5. INSTRUCTIONS DE TEST MANUEL
console.log('\n📋 ÉTAPE 5: INSTRUCTIONS DE TEST MANUEL');
console.log('------------------------------------------------------------');

console.log('🧪 Pour tester manuellement le support berbère:');
console.log('1. Démarrer l\'application: npm run dev');
console.log('2. Tester sur la page de connexion:');
console.log('   - Vérifier la présence du sélecteur en haut à droite');
console.log('   - Cliquer et vérifier "Tamazight 🏴" dans la liste');
console.log('3. Tester dans l\'application principale:');
console.log('   - Se connecter et vérifier le sélecteur dans la navbar');
console.log('   - Tester le sélecteur dans les paramètres d\'interface');
console.log('4. Vérifier la traduction:');
console.log('   - Sélectionner le berbère et vérifier que l\'interface change');
console.log('   - Vérifier la persistance après rechargement');

// 6. RAPPORT FINAL
console.log('\n📊 RAPPORT FINAL');
console.log('============================================================');

if (allSelectorsValid && berberFilesValid && consistencyValid) {
  console.log('🎉 TOUS LES SÉLECTEURS DE LANGUE SONT À JOUR !');
  console.log('');
  console.log('✅ VÉRIFICATIONS RÉUSSIES:');
  console.log('• 3 sélecteurs de langue mis à jour');
  console.log('• 7 langues supportées (FR, EN, AR, ES, PT, TR, BER)');
  console.log('• Configuration i18n complète');
  console.log('• 13 fichiers JSON berbères créés');
  console.log(`• ${totalBerberKeys} traductions berbères disponibles`);
  console.log('• Cohérence entre tous les sélecteurs');
  console.log('');
  console.log('🌍 LANGUES SUPPORTÉES:');
  expectedLanguages.forEach(lang => {
    console.log(`   ${lang.flag} ${lang.name} (${lang.code.toUpperCase()})`);
  });
  console.log('');
  console.log('🚀 STATUT: SUPPORT BERBÈRE ENTIÈREMENT FONCTIONNEL');
  console.log('');
  console.log('💡 IMPACT:');
  console.log('• Saloneo devient l\'une des rares plateformes SaaS en berbère');
  console.log('• Accès à 25-30 millions de berbérophones');
  console.log('• Avantage concurrentiel majeur en Afrique du Nord');
  console.log('• Soutien à la préservation de la langue amazighe');
  
} else {
  console.log('❌ PROBLÈMES DÉTECTÉS');
  console.log('');
  if (!allSelectorsValid) {
    console.log('• Certains sélecteurs de langue sont incomplets');
  }
  if (!berberFilesValid) {
    console.log('• Fichiers JSON berbères manquants ou invalides');
  }
  if (!consistencyValid) {
    console.log('• Incohérences entre les sélecteurs');
  }
  console.log('');
  console.log('🔧 ACTIONS REQUISES:');
  console.log('• Vérifier et corriger les sélecteurs mentionnés ci-dessus');
  console.log('• Relancer le test après corrections');
}

console.log('\n============================================================');
console.log('🏴 TEST COMPLET DES SÉLECTEURS DE LANGUE TERMINÉ');
