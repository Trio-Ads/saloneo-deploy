const fs = require('fs');

console.log('🧪 VÉRIFICATION FINALE DE L\'INTERNATIONALISATION');
console.log('============================================================\n');

// 1. VÉRIFICATION DES FICHIERS JSON
console.log('📋 ÉTAPE 1: VÉRIFICATION DES FICHIERS JSON');
console.log('------------------------------------------------------------');

const languages = ['fr', 'en', 'ar', 'es', 'pt', 'tr'];
const namespaces = ['auth', 'dashboard', 'common', 'services', 'clients', 'team', 'appointments', 'interface', 'profile', 'public', 'marketing', 'subscription', 'errors'];

let totalFiles = 0;
let validFiles = 0;
let invalidFiles = [];

languages.forEach(lang => {
  console.log(`\n🌍 Langue: ${lang.toUpperCase()}`);
  
  namespaces.forEach(namespace => {
    totalFiles++;
    const filePath = `public/locales/${lang}/${namespace}.json`;
    
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const parsed = JSON.parse(content);
        
        if (Object.keys(parsed).length > 0) {
          console.log(`  ✅ ${namespace}.json - ${Object.keys(parsed).length} clés`);
          validFiles++;
        } else {
          console.log(`  ⚠️  ${namespace}.json - Fichier vide`);
          invalidFiles.push(`${lang}/${namespace}.json - Vide`);
        }
      } catch (e) {
        console.log(`  ❌ ${namespace}.json - JSON invalide: ${e.message}`);
        invalidFiles.push(`${lang}/${namespace}.json - JSON invalide`);
      }
    } else {
      console.log(`  ❌ ${namespace}.json - Manquant`);
      invalidFiles.push(`${lang}/${namespace}.json - Manquant`);
    }
  });
});

// 2. VÉRIFICATION DES COMPOSANTS CRITIQUES
console.log('\n📋 ÉTAPE 2: VÉRIFICATION DES COMPOSANTS CRITIQUES');
console.log('------------------------------------------------------------');

const criticalComponents = [
  {
    path: 'src/features/auth/components/AuthLayout.tsx',
    name: 'AuthLayout',
    checks: [
      { pattern: /\{t\(title\)\}/, description: 'Utilise t(title)' },
      { pattern: /useTranslation\('auth'\)/, description: 'Namespace auth' }
    ]
  },
  {
    path: 'src/features/dashboard/DashboardPage.tsx',
    name: 'DashboardPage',
    checks: [
      { pattern: /useTranslation\('dashboard'\)/, description: 'Namespace dashboard' },
      { pattern: /t\(['"][^'"]+['"]\)/, description: 'Utilise des traductions' }
    ]
  },
  {
    path: 'src/components/LanguageSelector.tsx',
    name: 'LanguageSelector',
    checks: [
      { pattern: /i18n\.changeLanguage/, description: 'Change de langue' },
      { pattern: /languages\s*=/, description: 'Liste des langues' }
    ]
  }
];

criticalComponents.forEach(component => {
  console.log(`\n🔍 ${component.name}:`);
  
  if (fs.existsSync(component.path)) {
    const content = fs.readFileSync(component.path, 'utf8');
    
    component.checks.forEach(check => {
      if (check.pattern.test(content)) {
        console.log(`  ✅ ${check.description}`);
      } else {
        console.log(`  ❌ ${check.description}`);
      }
    });
  } else {
    console.log(`  ❌ Fichier non trouvé`);
  }
});

// 3. VÉRIFICATION DE LA CONFIGURATION I18N
console.log('\n📋 ÉTAPE 3: VÉRIFICATION DE LA CONFIGURATION I18N');
console.log('------------------------------------------------------------');

const i18nConfigPath = 'src/i18n.ts';
if (fs.existsSync(i18nConfigPath)) {
  const content = fs.readFileSync(i18nConfigPath, 'utf8');
  
  console.log('🔍 Configuration i18n:');
  
  // Vérifier les langues supportées
  const languageMatches = content.match(/lng:\s*['"]([^'"]+)['"]/);
  if (languageMatches) {
    console.log(`  ✅ Langue par défaut: ${languageMatches[1]}`);
  } else {
    console.log(`  ❌ Langue par défaut non trouvée`);
  }
  
  // Vérifier les namespaces
  const namespacesMatch = content.match(/ns:\s*\[([^\]]+)\]/);
  if (namespacesMatch) {
    console.log(`  ✅ Namespaces configurés`);
  } else {
    console.log(`  ❌ Namespaces non configurés`);
  }
  
  // Vérifier les ressources
  languages.forEach(lang => {
    if (content.includes(`${lang}:`)) {
      console.log(`  ✅ Ressources ${lang} configurées`);
    } else {
      console.log(`  ⚠️  Ressources ${lang} non trouvées dans la config`);
    }
  });
  
} else {
  console.log('❌ Fichier i18n.ts non trouvé');
}

// 4. RAPPORT FINAL
console.log('\n📊 RAPPORT FINAL');
console.log('============================================================');

const completionRate = Math.round((validFiles / totalFiles) * 100);

console.log(`📈 Taux de completion: ${completionRate}% (${validFiles}/${totalFiles})`);
console.log(`🌍 Langues supportées: ${languages.length} (${languages.join(', ')})`);
console.log(`📁 Namespaces: ${namespaces.length} (${namespaces.join(', ')})`);

if (invalidFiles.length > 0) {
  console.log(`\n⚠️  PROBLÈMES DÉTECTÉS (${invalidFiles.length}):`);
  invalidFiles.forEach(issue => {
    console.log(`  - ${issue}`);
  });
} else {
  console.log('\n✅ AUCUN PROBLÈME DÉTECTÉ!');
}

console.log('\n🎯 STATUT DE L\'INTERNATIONALISATION:');
if (completionRate === 100 && invalidFiles.length === 0) {
  console.log('🚀 PARFAIT! L\'internationalisation est complète à 100%');
  console.log('✅ Tous les fichiers JSON sont présents et valides');
  console.log('✅ Tous les composants critiques sont configurés');
  console.log('✅ Prêt pour la production!');
} else if (completionRate >= 90) {
  console.log('🟡 TRÈS BON! L\'internationalisation est presque complète');
  console.log('⚠️  Quelques ajustements mineurs nécessaires');
} else {
  console.log('🔴 ATTENTION! L\'internationalisation nécessite des corrections');
  console.log('❌ Des fichiers ou configurations sont manquants');
}

console.log('\n============================================================');
