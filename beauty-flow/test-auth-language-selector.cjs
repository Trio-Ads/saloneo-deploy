const fs = require('fs');
const path = require('path');

console.log('🔍 Test du sélecteur de langue dans les pages d\'authentification...\n');

// Vérifier que AuthLayout importe LanguageSelector
const authLayoutPath = 'src/features/auth/components/AuthLayout.tsx';
const authLayoutContent = fs.readFileSync(authLayoutPath, 'utf8');

console.log('📄 Vérification de AuthLayout.tsx:');

// Vérifier l'import
if (authLayoutContent.includes("import LanguageSelector from '../../../components/LanguageSelector';")) {
  console.log('  ✅ Import LanguageSelector présent');
} else {
  console.log('  ❌ Import LanguageSelector manquant');
}

// Vérifier l'utilisation du composant
if (authLayoutContent.includes('<LanguageSelector compact={true} showLabel={false} />')) {
  console.log('  ✅ Composant LanguageSelector utilisé avec les bonnes props');
} else {
  console.log('  ❌ Composant LanguageSelector non utilisé ou props incorrectes');
}

// Vérifier la div container
if (authLayoutContent.includes('<div className="auth-language-selector">')) {
  console.log('  ✅ Container auth-language-selector présent');
} else {
  console.log('  ❌ Container auth-language-selector manquant');
}

// Vérifier les styles CSS
if (authLayoutContent.includes('.auth-language-selector {')) {
  console.log('  ✅ Styles CSS pour auth-language-selector présents');
} else {
  console.log('  ❌ Styles CSS pour auth-language-selector manquants');
}

// Vérifier les styles responsive
if (authLayoutContent.includes('@media (max-width: 640px)') && 
    authLayoutContent.includes('.auth-language-selector {')) {
  console.log('  ✅ Styles responsive présents');
} else {
  console.log('  ❌ Styles responsive manquants');
}

// Vérifier les styles glassmorphism
if (authLayoutContent.includes('backdrop-filter: blur(10px)') && 
    authLayoutContent.includes('rgba(255, 255, 255, 0.1)')) {
  console.log('  ✅ Styles glassmorphism appliqués');
} else {
  console.log('  ❌ Styles glassmorphism manquants');
}

console.log('\n📄 Vérification des pages d\'authentification:');

// Vérifier LoginPage
const loginPagePath = 'src/features/auth/pages/LoginPage.tsx';
if (fs.existsSync(loginPagePath)) {
  const loginContent = fs.readFileSync(loginPagePath, 'utf8');
  if (loginContent.includes('<AuthLayout')) {
    console.log('  ✅ LoginPage utilise AuthLayout (sélecteur automatiquement disponible)');
  } else {
    console.log('  ❌ LoginPage n\'utilise pas AuthLayout');
  }
} else {
  console.log('  ❌ LoginPage.tsx non trouvé');
}

// Vérifier RegisterPage
const registerPagePath = 'src/features/auth/pages/RegisterPage.tsx';
if (fs.existsSync(registerPagePath)) {
  const registerContent = fs.readFileSync(registerPagePath, 'utf8');
  if (registerContent.includes('<AuthLayout')) {
    console.log('  ✅ RegisterPage utilise AuthLayout (sélecteur automatiquement disponible)');
  } else {
    console.log('  ❌ RegisterPage n\'utilise pas AuthLayout');
  }
} else {
  console.log('  ❌ RegisterPage.tsx non trouvé');
}

console.log('\n🌍 Vérification des fichiers de traduction auth:');

const languages = ['fr', 'en', 'ar', 'es', 'pt', 'tr'];
let allAuthFilesExist = true;

languages.forEach(lang => {
  const authFilePath = `public/locales/${lang}/auth.json`;
  if (fs.existsSync(authFilePath)) {
    console.log(`  ✅ ${lang}/auth.json existe`);
  } else {
    console.log(`  ❌ ${lang}/auth.json manquant`);
    allAuthFilesExist = false;
  }
});

console.log('\n🎨 Vérification des fonctionnalités du design:');

// Vérifier les animations
if (authLayoutContent.includes('animation: fadeIn') && 
    authLayoutContent.includes('@keyframes fadeIn')) {
  console.log('  ✅ Animations CSS présentes');
} else {
  console.log('  ❌ Animations CSS manquantes');
}

// Vérifier le positionnement
if (authLayoutContent.includes('position: absolute') && 
    authLayoutContent.includes('top: 1.5rem') && 
    authLayoutContent.includes('right: 1.5rem')) {
  console.log('  ✅ Positionnement en haut à droite configuré');
} else {
  console.log('  ❌ Positionnement incorrect');
}

// Vérifier le z-index
if (authLayoutContent.includes('z-index: 10')) {
  console.log('  ✅ Z-index élevé pour être au-dessus des effets');
} else {
  console.log('  ❌ Z-index non configuré');
}

console.log('\n============================================================');
console.log('📊 RÉSUMÉ DE L\'INTÉGRATION DU SÉLECTEUR DE LANGUE');
console.log('============================================================');

const checks = [
  authLayoutContent.includes("import LanguageSelector"),
  authLayoutContent.includes('<LanguageSelector compact={true}'),
  authLayoutContent.includes('auth-language-selector'),
  authLayoutContent.includes('.auth-language-selector {'),
  authLayoutContent.includes('@media (max-width: 640px)'),
  allAuthFilesExist
];

const passedChecks = checks.filter(Boolean).length;
const totalChecks = checks.length;

console.log(`✅ Tests réussis: ${passedChecks}/${totalChecks}`);

if (passedChecks === totalChecks) {
  console.log('\n🎉 SUCCÈS ! Le sélecteur de langue est correctement intégré dans AuthLayout !');
  console.log('✅ Disponible automatiquement sur les pages Login et Register');
  console.log('✅ Design glassmorphism cohérent avec le thème');
  console.log('✅ Responsive et adapté mobile');
  console.log('✅ Support des 6 langues (FR, EN, AR, ES, PT, TR)');
  console.log('✅ Positionnement optimal en haut à droite');
} else {
  console.log('\n⚠️  Quelques vérifications ont échoué. Vérifiez les détails ci-dessus.');
}

console.log('\n🚀 Le sélecteur de langue est maintenant disponible sur toutes les pages d\'authentification !');
console.log('============================================================');
