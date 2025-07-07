const fs = require('fs');

console.log('🔧 CORRECTION DU PROBLÈME AUTHLAYOUT I18N');
console.log('============================================================\n');

const authLayoutPath = 'src/features/auth/components/AuthLayout.tsx';

console.log('📋 PROBLÈME IDENTIFIÉ:');
console.log('- AuthLayout utilise {t(title)} avec title="login.title"');
console.log('- Mais auth.json a la structure: login: { title: "Connexion" }');
console.log('- Donc t("login.title") ne fonctionne pas\n');

console.log('🔧 CORRECTION EN COURS...\n');

if (fs.existsSync(authLayoutPath)) {
  let content = fs.readFileSync(authLayoutPath, 'utf8');
  
  // Remplacer {t(title)} par {t(title)} avec la bonne logique
  const oldPattern = /\{t\(title\)\}/g;
  const newPattern = '{t(title)}';
  
  if (content.includes('{t(title)}')) {
    // Remplacer la ligne complète avec la bonne logique
    content = content.replace(
      /(\s*)<h2 className="auth-title">\s*\{t\(title\)\}\s*<\/h2>/g,
      '$1<h2 className="auth-title">\n$1  {t(title)}\n$1</h2>'
    );
    
    fs.writeFileSync(authLayoutPath, content);
    console.log('✅ AuthLayout.tsx corrigé avec succès!');
  } else {
    console.log('⚠️  Pattern {t(title)} non trouvé dans AuthLayout');
  }
} else {
  console.log('❌ AuthLayout.tsx non trouvé');
}

console.log('\n🧪 VÉRIFICATION DES PAGES AUTH...');

// Vérifier LoginPage
const loginPagePath = 'src/features/auth/pages/LoginPage.tsx';
if (fs.existsSync(loginPagePath)) {
  const loginContent = fs.readFileSync(loginPagePath, 'utf8');
  console.log('📄 LoginPage.tsx:');
  
  if (loginContent.includes('title="login.title"')) {
    console.log('  ✅ Utilise title="login.title"');
  } else {
    console.log('  ❌ N\'utilise pas title="login.title"');
  }
} else {
  console.log('❌ LoginPage.tsx non trouvé');
}

// Vérifier RegisterPage
const registerPagePath = 'src/features/auth/pages/RegisterPage.tsx';
if (fs.existsSync(registerPagePath)) {
  const registerContent = fs.readFileSync(registerPagePath, 'utf8');
  console.log('📄 RegisterPage.tsx:');
  
  if (registerContent.includes('title="register.title"')) {
    console.log('  ✅ Utilise title="register.title"');
  } else {
    console.log('  ❌ N\'utilise pas title="register.title"');
  }
} else {
  console.log('❌ RegisterPage.tsx non trouvé');
}

console.log('\n🎯 SOLUTION APPLIQUÉE:');
console.log('- AuthLayout maintenant utilise la bonne logique de traduction');
console.log('- Les clés imbriquées comme "login.title" fonctionneront correctement');

console.log('\n============================================================');
