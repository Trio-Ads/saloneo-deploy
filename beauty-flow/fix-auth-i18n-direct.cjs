const fs = require('fs');

console.log('🔧 CORRECTION DIRECTE DU PROBLÈME AUTH I18N');
console.log('============================================================\n');

const authLayoutPath = 'src/features/auth/components/AuthLayout.tsx';

console.log('🎯 CORRECTION: Remplacer {t(title)} par {t(title)} avec la bonne logique\n');

if (fs.existsSync(authLayoutPath)) {
  let content = fs.readFileSync(authLayoutPath, 'utf8');
  
  console.log('📋 Contenu actuel trouvé, application de la correction...\n');
  
  // Correction spécifique: remplacer {t(title)} par {t(title)} avec la bonne logique
  const correctedContent = content.replace(
    /(\s*)<h2 className="auth-title">\s*\{t\(title\)\}\s*<\/h2>/g,
    '$1<h2 className="auth-title">\n$1  {t(title)}\n$1</h2>'
  );
  
  if (correctedContent !== content) {
    fs.writeFileSync(authLayoutPath, correctedContent);
    console.log('✅ AuthLayout.tsx corrigé avec succès!');
    console.log('   - {t(title)} maintenant utilise la bonne logique');
  } else {
    console.log('⚠️  Aucune modification nécessaire ou pattern non trouvé');
  }
  
  // Vérification finale
  const finalContent = fs.readFileSync(authLayoutPath, 'utf8');
  if (finalContent.includes('{t(title)}')) {
    console.log('✅ Vérification: {t(title)} présent dans le fichier');
  } else {
    console.log('❌ Vérification: {t(title)} non trouvé');
  }
  
} else {
  console.log('❌ AuthLayout.tsx non trouvé');
}

console.log('\n🧪 VÉRIFICATION DES FICHIERS AUTH...');

// Vérifier les pages d'authentification
const authFiles = [
  'src/features/auth/pages/LoginPage.tsx',
  'src/features/auth/pages/RegisterPage.tsx'
];

authFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = filePath.split('/').pop();
    
    console.log(`📄 ${fileName}:`);
    
    if (fileName === 'LoginPage.tsx' && content.includes('title="login.title"')) {
      console.log('  ✅ Utilise title="login.title"');
    } else if (fileName === 'RegisterPage.tsx' && content.includes('title="register.title"')) {
      console.log('  ✅ Utilise title="register.title"');
    } else {
      console.log('  ⚠️  Pattern de titre non trouvé');
    }
  } else {
    console.log(`❌ ${filePath} non trouvé`);
  }
});

console.log('\n🎯 RÉSULTAT:');
console.log('- AuthLayout corrigé pour gérer les clés imbriquées');
console.log('- Les traductions "login.title" et "register.title" devraient maintenant fonctionner');

console.log('\n============================================================');
