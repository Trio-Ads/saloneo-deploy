const fs = require('fs');
const path = require('path');

console.log('🧪 Test du NavbarLanguageSelector...\n');

// Vérifier que le composant existe
const navbarSelectorPath = path.join(__dirname, 'src/components/NavbarLanguageSelector.tsx');
if (!fs.existsSync(navbarSelectorPath)) {
  console.error('❌ NavbarLanguageSelector.tsx non trouvé');
  process.exit(1);
}

const navbarSelectorContent = fs.readFileSync(navbarSelectorPath, 'utf8');

// Tests du contenu
const tests = [
  {
    name: 'Import de createPortal',
    check: () => navbarSelectorContent.includes("import { createPortal } from 'react-dom';"),
    fix: 'Ajouter: import { createPortal } from \'react-dom\';'
  },
  {
    name: 'Import de useTranslation',
    check: () => navbarSelectorContent.includes("import { useTranslation } from 'react-i18next';"),
    fix: 'Ajouter: import { useTranslation } from \'react-i18next\';'
  },
  {
    name: 'Hook i18n',
    check: () => navbarSelectorContent.includes('const { i18n } = useTranslation();'),
    fix: 'Ajouter: const { i18n } = useTranslation();'
  },
  {
    name: 'Fonction handleLanguageChange',
    check: () => navbarSelectorContent.includes('const handleLanguageChange = (languageCode: string) => {'),
    fix: 'Ajouter la fonction handleLanguageChange'
  },
  {
    name: 'Appel i18n.changeLanguage',
    check: () => navbarSelectorContent.includes('i18n.changeLanguage(languageCode)'),
    fix: 'Ajouter l\'appel à i18n.changeLanguage'
  },
  {
    name: 'Listener languageChanged',
    check: () => navbarSelectorContent.includes("i18n.on('languageChanged', handleLanguageChanged);"),
    fix: 'Ajouter le listener pour languageChanged'
  },
  {
    name: 'createPortal utilisé',
    check: () => navbarSelectorContent.includes('createPortal('),
    fix: 'Utiliser createPortal pour le dropdown'
  },
  {
    name: 'Logs de debug',
    check: () => navbarSelectorContent.includes('console.log('),
    fix: 'Ajouter des logs de debug'
  },
  {
    name: '6 langues définies',
    check: () => {
      const matches = navbarSelectorContent.match(/code: '[a-z]{2}'/g);
      return matches && matches.length === 6;
    },
    fix: 'Définir les 6 langues: fr, en, ar, es, pt, tr'
  },
  {
    name: 'Bouton avec ref',
    check: () => navbarSelectorContent.includes('ref={buttonRef}'),
    fix: 'Ajouter ref={buttonRef} au bouton'
  }
];

let passed = 0;
let failed = 0;

tests.forEach(test => {
  if (test.check()) {
    console.log(`✅ ${test.name}`);
    passed++;
  } else {
    console.log(`❌ ${test.name}`);
    console.log(`   💡 ${test.fix}`);
    failed++;
  }
});

console.log(`\n📊 Résultats: ${passed} réussis, ${failed} échoués`);

// Vérifier l'intégration dans MainLayout
const mainLayoutPath = path.join(__dirname, 'src/layouts/MainLayout.tsx');
if (fs.existsSync(mainLayoutPath)) {
  const mainLayoutContent = fs.readFileSync(mainLayoutPath, 'utf8');
  
  console.log('\n🔍 Vérification de l\'intégration dans MainLayout:');
  
  if (mainLayoutContent.includes("import NavbarLanguageSelector from '../components/NavbarLanguageSelector';")) {
    console.log('✅ Import de NavbarLanguageSelector');
  } else {
    console.log('❌ Import de NavbarLanguageSelector manquant');
  }
  
  if (mainLayoutContent.includes('<NavbarLanguageSelector />')) {
    console.log('✅ Utilisation de NavbarLanguageSelector');
  } else {
    console.log('❌ NavbarLanguageSelector non utilisé');
  }
}

// Vérifier la configuration i18n
const i18nPath = path.join(__dirname, 'src/i18n.ts');
if (fs.existsSync(i18nPath)) {
  const i18nContent = fs.readFileSync(i18nPath, 'utf8');
  
  console.log('\n🔍 Vérification de la configuration i18n:');
  
  if (i18nContent.includes("supportedLngs: ['fr', 'en', 'ar', 'es', 'tr', 'pt']")) {
    console.log('✅ Langues supportées configurées');
  } else {
    console.log('❌ Configuration des langues supportées');
  }
  
  if (i18nContent.includes('debug: process.env.NODE_ENV === \'development\'')) {
    console.log('✅ Mode debug activé en développement');
  } else {
    console.log('❌ Mode debug non configuré');
  }
}

console.log('\n🎯 Instructions de test:');
console.log('1. Ouvrir la console du navigateur');
console.log('2. Cliquer sur le sélecteur de langue dans la navbar');
console.log('3. Choisir une langue différente');
console.log('4. Vérifier les logs dans la console');
console.log('5. Vérifier que l\'interface change de langue');

if (failed === 0) {
  console.log('\n🎉 Tous les tests sont passés ! Le NavbarLanguageSelector devrait fonctionner.');
} else {
  console.log(`\n⚠️  ${failed} test(s) échoué(s). Corriger les problèmes avant de tester.`);
}
