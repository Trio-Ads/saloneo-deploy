const fs = require('fs');

console.log('🔍 DIAGNOSTIC SPÉCIFIQUE DES TRADUCTIONS AUTH');
console.log('============================================================\n');

console.log('📋 PROBLÈME IDENTIFIÉ');
console.log('------------------------------------------------------------');
console.log('❌ LoginPage passe title="login.title"');
console.log('❌ AuthLayout utilise t(title) = t("login.title")');
console.log('❌ Mais auth.json a la structure: login: { title: "Connexion" }');
console.log('❌ Donc t("login.title") cherche login.title au lieu de login.title\n');

console.log('📋 VÉRIFICATION DE LA STRUCTURE AUTH.JSON');
console.log('------------------------------------------------------------');

const languages = ['fr', 'en', 'ar'];
languages.forEach(lang => {
  const authFilePath = `public/locales/${lang}/auth.json`;
  if (fs.existsSync(authFilePath)) {
    try {
      const authContent = JSON.parse(fs.readFileSync(authFilePath, 'utf8'));
      
      console.log(`\n🔍 ${lang.toUpperCase()}/auth.json:`);
      console.log(`   Structure login:`, !!authContent.login);
      console.log(`   login.title:`, authContent.login?.title || 'MANQUANT');
      console.log(`   Structure register:`, !!authContent.register);
      console.log(`   register.title:`, authContent.register?.title || 'MANQUANT');
      
      // Test des clés exactes
      console.log(`\n   🧪 Test des clés:`);
      console.log(`   - authContent["login.title"]:`, authContent["login.title"] || 'UNDEFINED');
      console.log(`   - authContent.login.title:`, authContent.login?.title || 'UNDEFINED');
      
    } catch (e) {
      console.log(`❌ ${lang}/auth.json - Erreur: ${e.message}`);
    }
  } else {
    console.log(`❌ ${lang}/auth.json manquant`);
  }
});

console.log('\n📋 VÉRIFICATION DES PAGES AUTH');
console.log('------------------------------------------------------------');

// Vérifier LoginPage
const loginPagePath = 'src/features/auth/pages/LoginPage.tsx';
if (fs.existsSync(loginPagePath)) {
  const loginContent = fs.readFileSync(loginPagePath, 'utf8');
  
  if (loginContent.includes('title="login.title"')) {
    console.log('✅ LoginPage utilise title="login.title"');
  } else {
    console.log('❌ LoginPage n\'utilise pas title="login.title"');
  }
} else {
  console.log('❌ LoginPage.tsx non trouvé');
}

// Vérifier RegisterPage
const registerPagePath = 'src/features/auth/pages/RegisterPage.tsx';
if (fs.existsSync(registerPagePath)) {
  const registerContent = fs.readFileSync(registerPagePath, 'utf8');
  
  if (registerContent.includes('title="register.title"')) {
    console.log('✅ RegisterPage utilise title="register.title"');
  } else {
    console.log('❌ RegisterPage n\'utilise pas title="register.title"');
  }
} else {
  console.log('❌ RegisterPage.tsx non trouvé');
}

console.log('\n📋 VÉRIFICATION AUTHLAYOUT');
console.log('------------------------------------------------------------');

const authLayoutPath = 'src/features/auth/components/AuthLayout.tsx';
if (fs.existsSync(authLayoutPath)) {
  const authLayoutContent = fs.readFileSync(authLayoutPath, 'utf8');
  
  if (authLayoutContent.includes('{t(title)}')) {
    console.log('✅ AuthLayout utilise {t(title)}');
    console.log('⚠️  Cela signifie que t("login.title") est appelé');
  } else {
    console.log('❌ AuthLayout n\'utilise pas {t(title)}');
  }
  
  if (authLayoutContent.includes('useTranslation(\'auth\')')) {
    console.log('✅ AuthLayout utilise le namespace "auth"');
  } else {
    console.log('❌ AuthLayout n\'utilise pas le namespace "auth"');
  }
} else {
  console.log('❌ AuthLayout.tsx non trouvé');
}

console.log('\n🎯 SOLUTIONS POSSIBLES');
console.log('------------------------------------------------------------');

console.log('SOLUTION 1: Modifier AuthLayout pour utiliser la bonne clé');
console.log('   - Changer {t(title)} en {t(title)} mais adapter la logique');
console.log('   - Exemple: si title="login.title", extraire "login" et "title"');
console.log('');

console.log('SOLUTION 2: Modifier les pages pour passer la bonne clé');
console.log('   - LoginPage: title="login.title" → title="login.title"');
console.log('   - RegisterPage: title="register.title" → title="register.title"');
console.log('');

console.log('SOLUTION 3: Restructurer auth.json (plus complexe)');
console.log('   - Changer la structure pour avoir des clés plates');
console.log('   - Exemple: "login.title": "Connexion" au lieu de login: { title: "Connexion" }');

console.log('\n🚀 RECOMMANDATION');
console.log('------------------------------------------------------------');
console.log('✅ SOLUTION 1 est la meilleure:');
console.log('   - Modifier AuthLayout pour gérer correctement les clés imbriquées');
console.log('   - Garder la structure JSON actuelle qui est logique');
console.log('   - Adapter la logique de traduction dans AuthLayout');

console.log('\n🧪 TEST MANUEL DANS LE NAVIGATEUR');
console.log('------------------------------------------------------------');
console.log('Testez dans la console du navigateur:');
console.log('');
console.log('// Vérifier la structure');
console.log('console.log("i18n store:", window.i18n?.store?.data);');
console.log('console.log("Auth FR:", window.i18n?.store?.data?.fr?.auth);');
console.log('');
console.log('// Tester les traductions');
console.log('console.log("t(login.title):", window.i18n?.t("auth:login.title"));');
console.log('console.log("t(login):", window.i18n?.t("auth:login"));');
console.log('');
console.log('// Changer de langue et retester');
console.log('window.i18n?.changeLanguage("en");');
console.log('setTimeout(() => {');
console.log('  console.log("EN t(login.title):", window.i18n?.t("auth:login.title"));');
console.log('}, 500);');

console.log('\n============================================================');
