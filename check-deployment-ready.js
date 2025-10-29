#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification de la préparation au déploiement Beauty Flow\n');

const checks = [];

// Vérifier les fichiers de configuration
function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  checks.push({
    name: description,
    status: exists ? '✅' : '❌',
    path: filePath
  });
  return exists;
}

// Vérifier les dépendances
function checkPackageJson(filePath, description) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const hasScripts = packageJson.scripts && packageJson.scripts.build && packageJson.scripts.start;
    checks.push({
      name: description,
      status: hasScripts ? '✅' : '❌',
      details: hasScripts ? 'Scripts build et start présents' : 'Scripts manquants'
    });
    return hasScripts;
  } catch (error) {
    checks.push({
      name: description,
      status: '❌',
      details: 'Fichier non trouvé ou invalide'
    });
    return false;
  }
}

console.log('📋 Vérification des fichiers de configuration...\n');

// Fichiers de configuration Render
checkFile('render.yaml', 'Configuration Render (render.yaml)');
checkFile('README.md', 'Documentation principale (README.md)');
checkFile('deploy-guide.md', 'Guide de déploiement');
checkFile('.gitignore', 'Fichier .gitignore');

// Configuration backend
checkFile('beauty-flow-backend/.env.production', 'Configuration backend production');
checkPackageJson('beauty-flow-backend/package.json', 'Package.json backend');

// Configuration frontend
checkFile('beauty-flow/.env.production', 'Configuration frontend production');
checkPackageJson('beauty-flow/package.json', 'Package.json frontend');

// Vérifier la structure des dossiers
const requiredDirs = [
  'beauty-flow/src',
  'beauty-flow-backend/src',
  'beauty-flow/public',
  'beauty-flow-backend/src/controllers',
  'beauty-flow-backend/src/routes',
  'beauty-flow-backend/src/models'
];

console.log('\n📁 Vérification de la structure des dossiers...\n');

requiredDirs.forEach(dir => {
  checkFile(dir, `Dossier ${dir}`);
});

// Vérifier les fichiers critiques
const criticalFiles = [
  'beauty-flow/src/App.tsx',
  'beauty-flow/src/features/public/SalonPage.tsx',
  'beauty-flow-backend/src/app.ts',
  'beauty-flow-backend/src/routes/public.routes.ts'
];

console.log('\n🔧 Vérification des fichiers critiques...\n');

criticalFiles.forEach(file => {
  checkFile(file, `Fichier critique ${file}`);
});

// Afficher les résultats
console.log('\n📊 Résultats de la vérification:\n');

checks.forEach(check => {
  console.log(`${check.status} ${check.name}`);
  if (check.details) {
    console.log(`   ${check.details}`);
  }
  if (check.path && check.status === '❌') {
    console.log(`   Chemin: ${check.path}`);
  }
});

const passedChecks = checks.filter(check => check.status === '✅').length;
const totalChecks = checks.length;

console.log(`\n📈 Score: ${passedChecks}/${totalChecks} vérifications réussies\n`);

if (passedChecks === totalChecks) {
  console.log('🎉 Félicitations ! Votre application est prête pour le déploiement sur Render !');
  console.log('\n📋 Prochaines étapes:');
  console.log('1. Créer un repository GitHub');
  console.log('2. Uploader votre code');
  console.log('3. Configurer MongoDB Atlas');
  console.log('4. Déployer sur Render');
  console.log('\n📖 Consultez deploy-guide.md pour les instructions détaillées.');
} else {
  console.log('⚠️  Certaines vérifications ont échoué. Veuillez corriger les problèmes avant de déployer.');
  console.log('\n🔧 Actions recommandées:');
  
  checks.filter(check => check.status === '❌').forEach(check => {
    console.log(`- Créer/corriger: ${check.name}`);
  });
}

console.log('\n' + '='.repeat(60));
console.log('Beauty Flow - Vérification de déploiement terminée');
console.log('='.repeat(60));
