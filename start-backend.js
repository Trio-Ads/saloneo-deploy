#!/usr/bin/env node

const path = require('path');
const fs = require('fs');

console.log('🚀 === DÉMARRAGE BACKEND SALONEO ===');

// Vérifier que le backend est compilé
const backendPath = path.join(__dirname, 'beauty-flow-backend/dist/app.js');

if (!fs.existsSync(backendPath)) {
  console.error('❌ ERREUR: Backend non compilé !');
  console.error('💡 Exécutez: cd beauty-flow-backend && npm run build');
  process.exit(1);
}

// Vérifier que le frontend est buildé
const frontendPath = path.join(__dirname, 'beauty-flow-backend/dist/public');
if (!fs.existsSync(frontendPath)) {
  console.log('⚠️  Frontend non trouvé dans beauty-flow-backend/dist/public');
  console.log('💡 Le backend servira les routes API uniquement');
}

// Configurer l'environnement
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

console.log('📍 Environment:', process.env.NODE_ENV);
console.log('🔌 Port:', process.env.PORT || 5000);
console.log('🔗 MongoDB:', process.env.MONGODB_URI ? 'Configuré' : 'Non configuré');

// Démarrer le backend
console.log('🚀 Démarrage du backend compilé...');
require(backendPath);

// Le backend va démarrer son propre serveur
console.log('✅ Backend démarré avec succès');
