const fs = require('fs');
const path = require('path');

console.log('🔍 DIAGNOSTIC COMPLET DU SÉLECTEUR DE LANGUE');
console.log('============================================================\n');

// 1. Vérifier la configuration i18n
console.log('📋 1. VÉRIFICATION DE LA CONFIGURATION I18N');
console.log('------------------------------------------------------------');

const i18nPath = 'src/i18n.ts';
if (fs.existsSync(i18nPath)) {
  const i18nContent = fs.readFileSync(i18nPath, 'utf8');
  
  console.log('✅ Fichier i18n.ts trouvé');
  
  // Vérifier fallbackLng
  if (i18nContent.includes("fallbackLng: 'fr'")) {
    console.log('✅ fallbackLng configuré sur "fr"');
  } else {
    console.log('❌ fallbackLng non configuré ou incorrect');
  }
  
  // Vérifier supportedLngs
  if (i18nContent.includes("supportedLngs: ['fr', 'en', 'ar', 'es', 'tr', 'pt']")) {
    console.log('✅ supportedLngs configuré avec toutes les langues');
  } else {
    console.log('❌ supportedLngs incomplet ou incorrect');
  }
  
  // Vérifier useSuspense
  if (i18nContent.includes('useSuspense: true')) {
    console.log('⚠️  useSuspense: true (peut causer des problèmes de re-render)');
  } else {
    console.log('✅ useSuspense: false ou non défini');
  }
  
  // Vérifier detection order
  if (i18nContent.includes("order: ['localStorage', 'navigator']")) {
    console.log('✅ Ordre de détection: localStorage puis navigator');
  } else {
    console.log('❌ Ordre de détection non configuré correctement');
  }
  
  // Vérifier localStorage key
  if (i18nContent.includes("lookupLocalStorage: 'beauty-flow-language'")) {
    console.log('✅ Clé localStorage configurée: beauty-flow-language');
  } else {
    console.log('❌ Clé localStorage non configurée');
  }
  
  // Vérifier namespace auth
  if (i18nContent.includes("'auth'")) {
    console.log('✅ Namespace "auth" inclus dans la configuration');
  } else {
    console.log('❌ Namespace "auth" manquant');
  }
  
} else {
  console.log('❌ Fichier i18n.ts non trouvé');
}

console.log('\n📋 2. VÉRIFICATION DU COMPOSANT LANGUAGESELECTOR');
console.log('------------------------------------------------------------');

const languageSelectorPath = 'src/components/LanguageSelector.tsx';
if (fs.existsSync(languageSelectorPath)) {
  const selectorContent = fs.readFileSync(languageSelectorPath, 'utf8');
  
  console.log('✅ Composant LanguageSelector trouvé');
  
  // Vérifier useTranslation
  if (selectorContent.includes('useTranslation')) {
    console.log('✅ Hook useTranslation utilisé');
  } else {
    console.log('❌ Hook useTranslation manquant');
  }
  
  // Vérifier i18n.changeLanguage
  if (selectorContent.includes('i18n.changeLanguage')) {
    console.log('✅ Fonction i18n.changeLanguage utilisée');
  } else {
    console.log('❌ Fonction i18n.changeLanguage manquante');
  }
  
  // Vérifier les langues supportées
  const languages = ['fr', 'en', 'ar', 'es', 'pt', 'tr'];
  let allLanguagesFound = true;
  languages.forEach(lang => {
    if (!selectorContent.includes(`'${lang}'`)) {
      console.log(`❌ Langue ${lang} manquante dans le sélecteur`);
      allLanguagesFound = false;
    }
  });
  if (allLanguagesFound) {
    console.log('✅ Toutes les langues présentes dans le sélecteur');
  }
  
  // Vérifier les événements
  if (selectorContent.includes('onClick') || selectorContent.includes('handleLanguageChange')) {
    console.log('✅ Gestionnaires d\'événements présents');
  } else {
    console.log('❌ Gestionnaires d\'événements manquants');
  }
  
} else {
  console.log('❌ Composant LanguageSelector non trouvé');
}

console.log('\n📋 3. VÉRIFICATION DU COMPOSANT AUTHLAYOUT');
console.log('------------------------------------------------------------');

const authLayoutPath = 'src/features/auth/components/AuthLayout.tsx';
if (fs.existsSync(authLayoutPath)) {
  const authContent = fs.readFileSync(authLayoutPath, 'utf8');
  
  console.log('✅ Composant AuthLayout trouvé');
  
  // Vérifier import LanguageSelector
  if (authContent.includes("import LanguageSelector")) {
    console.log('✅ LanguageSelector importé dans AuthLayout');
  } else {
    console.log('❌ LanguageSelector non importé dans AuthLayout');
  }
  
  // Vérifier utilisation LanguageSelector
  if (authContent.includes('<LanguageSelector')) {
    console.log('✅ LanguageSelector utilisé dans AuthLayout');
  } else {
    console.log('❌ LanguageSelector non utilisé dans AuthLayout');
  }
  
  // Vérifier useTranslation avec namespace auth
  if (authContent.includes("useTranslation('auth')")) {
    console.log('✅ useTranslation avec namespace "auth"');
  } else {
    console.log('❌ useTranslation sans namespace "auth" ou manquant');
  }
  
  // Vérifier si il y a un useEffect pour écouter les changements
  if (authContent.includes('useEffect') && authContent.includes('i18n')) {
    console.log('✅ useEffect pour écouter les changements de langue');
  } else {
    console.log('⚠️  Pas de useEffect pour écouter les changements (peut causer le problème)');
  }
  
} else {
  console.log('❌ Composant AuthLayout non trouvé');
}

console.log('\n📋 4. VÉRIFICATION DES FICHIERS DE TRADUCTION AUTH');
console.log('------------------------------------------------------------');

const languages = ['fr', 'en', 'ar', 'es', 'pt', 'tr'];
let authFilesOk = true;

languages.forEach(lang => {
  const authFilePath = `public/locales/${lang}/auth.json`;
  if (fs.existsSync(authFilePath)) {
    try {
      const authContent = JSON.parse(fs.readFileSync(authFilePath, 'utf8'));
      const keys = Object.keys(authContent);
      console.log(`✅ ${lang}/auth.json - ${keys.length} clés de traduction`);
      
      // Vérifier quelques clés importantes
      if (authContent.login || authContent.register || authContent.email) {
        console.log(`   ✅ Clés de base présentes`);
      } else {
        console.log(`   ⚠️  Clés de base manquantes`);
      }
    } catch (e) {
      console.log(`❌ ${lang}/auth.json - Erreur de parsing JSON`);
      authFilesOk = false;
    }
  } else {
    console.log(`❌ ${lang}/auth.json manquant`);
    authFilesOk = false;
  }
});

console.log('\n📋 5. VÉRIFICATION DES PAGES D\'AUTHENTIFICATION');
console.log('------------------------------------------------------------');

// Vérifier LoginPage
const loginPagePath = 'src/features/auth/pages/LoginPage.tsx';
if (fs.existsSync(loginPagePath)) {
  const loginContent = fs.readFileSync(loginPagePath, 'utf8');
  if (loginContent.includes('<AuthLayout')) {
    console.log('✅ LoginPage utilise AuthLayout');
  } else {
    console.log('❌ LoginPage n\'utilise pas AuthLayout');
  }
} else {
  console.log('⚠️  LoginPage.tsx non trouvé');
}

// Vérifier RegisterPage
const registerPagePath = 'src/features/auth/pages/RegisterPage.tsx';
if (fs.existsSync(registerPagePath)) {
  const registerContent = fs.readFileSync(registerPagePath, 'utf8');
  if (registerContent.includes('<AuthLayout')) {
    console.log('✅ RegisterPage utilise AuthLayout');
  } else {
    console.log('❌ RegisterPage n\'utilise pas AuthLayout');
  }
} else {
  console.log('⚠️  RegisterPage.tsx non trouvé');
}

console.log('\n📋 6. ANALYSE DES PROBLÈMES POTENTIELS');
console.log('------------------------------------------------------------');

// Analyser les problèmes potentiels
const problems = [];
const solutions = [];

// Vérifier useSuspense
const i18nContent = fs.existsSync(i18nPath) ? fs.readFileSync(i18nPath, 'utf8') : '';
if (i18nContent.includes('useSuspense: true')) {
  problems.push('useSuspense: true peut empêcher le re-render des composants');
  solutions.push('Désactiver useSuspense ou ajouter un useEffect dans AuthLayout');
}

// Vérifier si AuthLayout écoute les changements
const authContent = fs.existsSync(authLayoutPath) ? fs.readFileSync(authLayoutPath, 'utf8') : '';
if (!authContent.includes('useEffect') || !authContent.includes('i18n')) {
  problems.push('AuthLayout ne réécoute pas les changements de langue');
  solutions.push('Ajouter un useEffect qui écoute les événements languageChanged');
}

// Vérifier la configuration de détection
if (!i18nContent.includes("order: ['localStorage'")) {
  problems.push('Ordre de détection des langues peut être problématique');
  solutions.push('Prioriser localStorage dans l\'ordre de détection');
}

console.log('\n🔍 PROBLÈMES IDENTIFIÉS:');
if (problems.length === 0) {
  console.log('✅ Aucun problème évident détecté dans la configuration');
} else {
  problems.forEach((problem, index) => {
    console.log(`${index + 1}. ❌ ${problem}`);
  });
}

console.log('\n💡 SOLUTIONS RECOMMANDÉES:');
if (solutions.length === 0) {
  console.log('✅ Aucune solution spécifique nécessaire');
} else {
  solutions.forEach((solution, index) => {
    console.log(`${index + 1}. 🔧 ${solution}`);
  });
}

console.log('\n📋 7. SCRIPT DE TEST MANUEL');
console.log('------------------------------------------------------------');
console.log('Pour tester manuellement dans la console du navigateur:');
console.log('');
console.log('// 1. Vérifier l\'état actuel');
console.log('console.log("Langue actuelle:", window.i18n?.language);');
console.log('console.log("localStorage:", localStorage.getItem("beauty-flow-language"));');
console.log('');
console.log('// 2. Tester le changement de langue');
console.log('window.i18n?.changeLanguage("en").then(() => {');
console.log('  console.log("Changement vers EN:", window.i18n.language);');
console.log('});');
console.log('');
console.log('// 3. Vérifier les traductions');
console.log('console.log("Traduction test:", window.i18n?.t("auth:login"));');

console.log('\n============================================================');
console.log('🎯 DIAGNOSTIC TERMINÉ');
console.log('============================================================');

// Résumé final
const totalChecks = 10; // Nombre approximatif de vérifications
let passedChecks = 0;

if (fs.existsSync(i18nPath)) passedChecks++;
if (fs.existsSync(languageSelectorPath)) passedChecks++;
if (fs.existsSync(authLayoutPath)) passedChecks++;
if (authFilesOk) passedChecks += 2;

console.log(`\n📊 Score de santé: ${passedChecks}/${totalChecks} vérifications passées`);

if (problems.length > 0) {
  console.log('\n🚨 ACTION REQUISE: Des problèmes ont été identifiés et doivent être corrigés.');
  console.log('📝 Consultez les solutions recommandées ci-dessus.');
} else {
  console.log('\n✅ Configuration semble correcte. Le problème peut être plus subtil.');
  console.log('🔍 Utilisez le script de test manuel dans la console du navigateur.');
}

console.log('\n🔧 Prochaines étapes recommandées:');
console.log('1. Corriger les problèmes identifiés');
console.log('2. Tester dans le navigateur avec le script manuel');
console.log('3. Vérifier les logs de la console pour les erreurs');
console.log('4. Appliquer les corrections spécifiques si nécessaire');
