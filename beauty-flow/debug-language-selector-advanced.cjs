const fs = require('fs');

console.log('🔍 DIAGNOSTIC AVANCÉ DU SÉLECTEUR DE LANGUE');
console.log('============================================================\n');

console.log('📋 1. VÉRIFICATION DU COMPOSANT LANGUAGESELECTOR');
console.log('------------------------------------------------------------');

const languageSelectorPath = 'src/components/LanguageSelector.tsx';
if (fs.existsSync(languageSelectorPath)) {
  const selectorContent = fs.readFileSync(languageSelectorPath, 'utf8');
  
  console.log('✅ Composant LanguageSelector trouvé');
  
  // Vérifier la fonction handleLanguageChange
  if (selectorContent.includes('handleLanguageChange')) {
    console.log('✅ Fonction handleLanguageChange présente');
    
    // Vérifier si elle appelle i18n.changeLanguage
    if (selectorContent.includes('i18n.changeLanguage(languageCode)')) {
      console.log('✅ Appel à i18n.changeLanguage(languageCode)');
    } else if (selectorContent.includes('i18n.changeLanguage')) {
      console.log('⚠️  Appel à i18n.changeLanguage présent mais syntaxe différente');
    } else {
      console.log('❌ Pas d\'appel à i18n.changeLanguage');
    }
  } else {
    console.log('❌ Fonction handleLanguageChange manquante');
  }
  
  // Vérifier les événements onClick
  if (selectorContent.includes('onClick={() => handleLanguageChange(')) {
    console.log('✅ Événement onClick configuré avec handleLanguageChange');
  } else if (selectorContent.includes('onClick={')) {
    console.log('⚠️  Événement onClick présent mais syntaxe différente');
  } else {
    console.log('❌ Événement onClick manquant');
  }
  
  // Vérifier la détection de la langue courante
  if (selectorContent.includes('i18n.language')) {
    console.log('✅ Détection de la langue courante via i18n.language');
  } else {
    console.log('❌ Détection de la langue courante manquante');
  }
  
  // Vérifier la fermeture du dropdown
  if (selectorContent.includes('setIsOpen(false)')) {
    console.log('✅ Fermeture du dropdown configurée');
  } else {
    console.log('❌ Fermeture du dropdown manquante');
  }
  
} else {
  console.log('❌ Composant LanguageSelector non trouvé');
}

console.log('\n📋 2. VÉRIFICATION DE L\'INITIALISATION I18N');
console.log('------------------------------------------------------------');

// Vérifier App.tsx pour l'initialisation
const appPath = 'src/App.tsx';
if (fs.existsSync(appPath)) {
  const appContent = fs.readFileSync(appPath, 'utf8');
  
  if (appContent.includes('import i18n') || appContent.includes('import \'./i18n\'')) {
    console.log('✅ i18n importé dans App.tsx');
  } else {
    console.log('❌ i18n non importé dans App.tsx');
  }
} else {
  console.log('❌ App.tsx non trouvé');
}

// Vérifier main.tsx pour l'initialisation
const mainPath = 'src/main.tsx';
if (fs.existsSync(mainPath)) {
  const mainContent = fs.readFileSync(mainPath, 'utf8');
  
  if (mainContent.includes('import i18n') || mainContent.includes('import \'./i18n\'')) {
    console.log('✅ i18n importé dans main.tsx');
  } else {
    console.log('❌ i18n non importé dans main.tsx');
  }
} else {
  console.log('❌ main.tsx non trouvé');
}

console.log('\n📋 3. VÉRIFICATION DES FICHIERS DE TRADUCTION AUTH');
console.log('------------------------------------------------------------');

const languages = ['fr', 'en', 'ar', 'es', 'pt', 'tr'];
languages.forEach(lang => {
  const authFilePath = `public/locales/${lang}/auth.json`;
  if (fs.existsSync(authFilePath)) {
    try {
      const authContent = JSON.parse(fs.readFileSync(authFilePath, 'utf8'));
      console.log(`✅ ${lang}/auth.json - ${Object.keys(authContent).length} clés`);
      
      // Vérifier quelques clés spécifiques
      if (authContent.login) {
        console.log(`   ✅ Clé "login": "${authContent.login}"`);
      }
      if (authContent.register) {
        console.log(`   ✅ Clé "register": "${authContent.register}"`);
      }
    } catch (e) {
      console.log(`❌ ${lang}/auth.json - Erreur JSON: ${e.message}`);
    }
  } else {
    console.log(`❌ ${lang}/auth.json manquant`);
  }
});

console.log('\n📋 4. ANALYSE DU PROBLÈME POTENTIEL');
console.log('------------------------------------------------------------');

// Analyser le composant LanguageSelector en détail
if (fs.existsSync(languageSelectorPath)) {
  const selectorContent = fs.readFileSync(languageSelectorPath, 'utf8');
  
  console.log('🔍 Analyse détaillée du LanguageSelector:');
  
  // Vérifier si le composant utilise useTranslation correctement
  if (selectorContent.includes('const { i18n } = useTranslation()')) {
    console.log('✅ useTranslation() utilisé correctement');
  } else if (selectorContent.includes('useTranslation')) {
    console.log('⚠️  useTranslation utilisé mais syntaxe différente');
  } else {
    console.log('❌ useTranslation non utilisé');
  }
  
  // Vérifier la version compacte
  if (selectorContent.includes('compact')) {
    console.log('✅ Version compacte supportée');
  } else {
    console.log('❌ Version compacte non supportée');
  }
  
  // Vérifier les props
  if (selectorContent.includes('LanguageSelectorProps')) {
    console.log('✅ Interface LanguageSelectorProps définie');
  } else {
    console.log('❌ Interface LanguageSelectorProps manquante');
  }
}

console.log('\n📋 5. SCRIPT DE DÉBOGAGE POUR LE NAVIGATEUR');
console.log('------------------------------------------------------------');

console.log('Copiez ce script dans la console du navigateur pour déboguer:');
console.log('');
console.log('// === SCRIPT DE DÉBOGAGE COMPLET ===');
console.log('');
console.log('// 1. Vérifier l\'état de i18n');
console.log('console.log("=== ÉTAT I18N ===");');
console.log('console.log("i18n disponible:", !!window.i18n);');
console.log('console.log("Langue actuelle:", window.i18n?.language);');
console.log('console.log("Langues supportées:", window.i18n?.options?.supportedLngs);');
console.log('console.log("localStorage:", localStorage.getItem("beauty-flow-language"));');
console.log('');
console.log('// 2. Tester le changement de langue');
console.log('console.log("=== TEST CHANGEMENT ===");');
console.log('if (window.i18n) {');
console.log('  window.i18n.changeLanguage("en").then(() => {');
console.log('    console.log("Changement vers EN réussi:", window.i18n.language);');
console.log('    console.log("localStorage après:", localStorage.getItem("beauty-flow-language"));');
console.log('  }).catch(err => {');
console.log('    console.error("Erreur changement:", err);');
console.log('  });');
console.log('} else {');
console.log('  console.error("i18n non disponible!");');
console.log('}');
console.log('');
console.log('// 3. Vérifier les traductions');
console.log('console.log("=== TEST TRADUCTIONS ===");');
console.log('if (window.i18n) {');
console.log('  console.log("Traduction FR:", window.i18n.t("auth:login"));');
console.log('  window.i18n.changeLanguage("en");');
console.log('  setTimeout(() => {');
console.log('    console.log("Traduction EN:", window.i18n.t("auth:login"));');
console.log('  }, 100);');
console.log('}');
console.log('');
console.log('// 4. Vérifier les événements');
console.log('console.log("=== TEST ÉVÉNEMENTS ===");');
console.log('if (window.i18n) {');
console.log('  window.i18n.on("languageChanged", (lng) => {');
console.log('    console.log("Événement languageChanged déclenché:", lng);');
console.log('  });');
console.log('  window.i18n.changeLanguage("es");');
console.log('}');

console.log('\n📋 6. SOLUTIONS POSSIBLES');
console.log('------------------------------------------------------------');

console.log('Si le problème persiste, essayez ces solutions:');
console.log('');
console.log('1. 🔄 REDÉMARRER LE SERVEUR:');
console.log('   - Arrêter npm run dev (Ctrl+C)');
console.log('   - Relancer npm run dev');
console.log('   - Vider le cache du navigateur (Ctrl+Shift+R)');
console.log('');
console.log('2. 🧹 NETTOYER LE CACHE:');
console.log('   - localStorage.clear() dans la console');
console.log('   - Supprimer les cookies du site');
console.log('   - Mode navigation privée');
console.log('');
console.log('3. 🔧 VÉRIFICATIONS SUPPLÉMENTAIRES:');
console.log('   - Ouvrir les DevTools (F12)');
console.log('   - Onglet Console pour voir les erreurs');
console.log('   - Onglet Network pour voir si les fichiers JSON se chargent');
console.log('   - Onglet Application > Local Storage');

console.log('\n============================================================');
console.log('🎯 PROCHAINES ÉTAPES');
console.log('============================================================');

console.log('1. Exécuter le script de débogage dans le navigateur');
console.log('2. Vérifier les erreurs dans la console');
console.log('3. Tester le changement manuel via window.i18n.changeLanguage()');
console.log('4. Si ça ne marche toujours pas, il faut modifier le composant');
console.log('5. Redémarrer complètement le serveur de développement');

console.log('\n============================================================');
