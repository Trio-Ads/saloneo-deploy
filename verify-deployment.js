#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 === VÉRIFICATION DU DÉPLOIEMENT SALONEO ===\n');

let errors = 0;
let warnings = 0;

// Fonction pour vérifier l'existence d'un fichier/dossier
function checkExists(filePath, type = 'file') {
  const exists = fs.existsSync(filePath);
  if (exists) {
    console.log(`✅ ${type === 'dir' ? 'Dossier' : 'Fichier'} trouvé: ${filePath}`);
  } else {
    console.log(`❌ ${type === 'dir' ? 'Dossier' : 'Fichier'} manquant: ${filePath}`);
    errors++;
  }
  return exists;
}

// Fonction pour vérifier le contenu d'un fichier
function checkFileContent(filePath, searchString, description) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(searchString)) {
      console.log(`✅ ${description}`);
      return true;
    } else {
      console.log(`⚠️ ${description} - non trouvé`);
      warnings++;
      return false;
    }
  }
  return false;
}

console.log('📁 VÉRIFICATION DES FICHIERS CRITIQUES\n');

// Vérifier les fichiers de configuration
checkExists('package.json');
checkExists('server.js');
checkExists('build-and-deploy.sh');
checkExists('render.yaml');

console.log('\n📦 VÉRIFICATION DU BUILD SCRIPT\n');

// Vérifier le contenu de build-and-deploy.sh
if (checkExists('build-and-deploy.sh')) {
  checkFileContent('build-and-deploy.sh', 'npm run build', 'Build frontend configuré');
  checkFileContent('build-and-deploy.sh', 'cp -r beauty-flow/dist ./', 'Copie du dist à la racine configurée');
  
  // Vérifier les permissions
  try {
    fs.accessSync('build-and-deploy.sh', fs.constants.X_OK);
    console.log('✅ Script build-and-deploy.sh est exécutable');
  } catch {
    console.log('❌ Script build-and-deploy.sh n\'est pas exécutable');
    console.log('💡 Exécutez: chmod +x build-and-deploy.sh');
    errors++;
  }
}

console.log('\n🚀 VÉRIFICATION DU SERVEUR\n');

// Vérifier server.js
if (checkExists('server.js')) {
  checkFileContent('server.js', 'const frontendPath = path.join(__dirname, \'dist\')', 'Chemin frontend configuré');
  checkFileContent('server.js', 'app.use(express.static(frontendPath', 'Service des fichiers statiques configuré');
  checkFileContent('server.js', 'PORT = process.env.PORT || 10000', 'Port configuré correctement');
}

console.log('\n🔧 VÉRIFICATION DE RENDER.YAML\n');

// Vérifier render.yaml
if (checkExists('render.yaml')) {
  const renderConfig = fs.readFileSync('render.yaml', 'utf8');
  
  checkFileContent('render.yaml', 'buildCommand:', 'Commande de build définie');
  checkFileContent('render.yaml', './build-and-deploy.sh', 'Script de build référencé');
  checkFileContent('render.yaml', 'startCommand: node server.js', 'Commande de démarrage définie');
  
  // Vérifier les variables d'environnement importantes
  const envVars = ['MONGODB_URI', 'JWT_SECRET', 'FRONTEND_URL', 'CORS_ORIGIN'];
  console.log('\n📋 Variables d\'environnement:');
  envVars.forEach(varName => {
    if (renderConfig.includes(`key: ${varName}`)) {
      console.log(`✅ ${varName} configuré`);
    } else {
      console.log(`⚠️ ${varName} non configuré`);
      warnings++;
    }
  });
}

console.log('\n📂 VÉRIFICATION DE LA STRUCTURE DU PROJET\n');

// Vérifier les dossiers importants
checkExists('beauty-flow', 'dir');
checkExists('beauty-flow-backend', 'dir');

// Vérifier si un build existe déjà
if (checkExists('dist', 'dir')) {
  console.log('ℹ️ Un dossier dist existe déjà à la racine');
  const files = fs.readdirSync('dist');
  console.log(`   Contient ${files.length} fichiers`);
  if (files.includes('index.html')) {
    console.log('   ✅ index.html trouvé');
  }
} else {
  console.log('ℹ️ Pas de dossier dist à la racine (sera créé pendant le build)');
}

// Vérifier le frontend
if (checkExists('beauty-flow/package.json')) {
  const frontendPackage = JSON.parse(fs.readFileSync('beauty-flow/package.json', 'utf8'));
  if (frontendPackage.scripts && frontendPackage.scripts.build) {
    console.log('✅ Script de build frontend trouvé:', frontendPackage.scripts.build);
  } else {
    console.log('❌ Script de build frontend manquant');
    errors++;
  }
}

console.log('\n📊 RÉSUMÉ DE LA VÉRIFICATION\n');

if (errors === 0 && warnings === 0) {
  console.log('✅ Tout est prêt pour le déploiement !');
  console.log('\n🚀 Prochaines étapes:');
  console.log('1. Committez tous les changements: git add . && git commit -m "Fix deployment"');
  console.log('2. Poussez sur GitHub: git push origin main');
  console.log('3. Render va automatiquement redéployer');
} else {
  console.log(`❌ ${errors} erreur(s) trouvée(s)`);
  console.log(`⚠️ ${warnings} avertissement(s)`);
  console.log('\n🔧 Corrigez les erreurs avant de déployer');
}

console.log('\n💡 CONSEILS DE DÉPLOIEMENT:');
console.log('- Surveillez les logs de build sur Render');
console.log('- Vérifiez que le build frontend se termine avec succès');
console.log('- Assurez-vous que le dossier dist est copié à la racine');
console.log('- Testez l\'endpoint /health après le déploiement');

process.exit(errors > 0 ? 1 : 0);
