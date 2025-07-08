#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Mise à jour de l\'URI MongoDB...\n');

// Nouvelle URI avec le bon cluster
const newMongoURI = 'mongodb+srv://trioadsmain:qw9Wl1bNwodxv3Ra@cluster0.es8njbw.mongodb.net/saloneo?retryWrites=true&w=majority';

// Fichiers à mettre à jour
const filesToUpdate = [
  'beauty-flow-backend/.env',
  'beauty-flow-backend/.env.production',
  '.env'
];

let updatedFiles = 0;

filesToUpdate.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Remplacer l'ancienne URI par la nouvelle
      const oldPattern = /MONGODB_URI=mongodb\+srv:\/\/trioadsmain:qw9Wl1bNwodxv3Ra@cluster\.mongodb\.net\/saloneo/g;
      const newPattern = `MONGODB_URI=${newMongoURI}`;
      
      if (content.match(oldPattern)) {
        content = content.replace(oldPattern, newPattern);
        fs.writeFileSync(filePath, content);
        console.log(`✅ ${filePath} - URI mise à jour`);
        updatedFiles++;
      } else if (content.includes('MONGODB_URI=')) {
        // Si l'URI existe mais est différente, la remplacer quand même
        content = content.replace(/MONGODB_URI=.*/g, newPattern);
        fs.writeFileSync(filePath, content);
        console.log(`✅ ${filePath} - URI remplacée`);
        updatedFiles++;
      } else {
        // Ajouter l'URI si elle n'existe pas
        content += `\n${newPattern}\n`;
        fs.writeFileSync(filePath, content);
        console.log(`✅ ${filePath} - URI ajoutée`);
        updatedFiles++;
      }
    } catch (error) {
      console.error(`❌ Erreur lors de la mise à jour de ${filePath}:`, error.message);
    }
  } else {
    console.log(`⚠️  ${filePath} - Fichier non trouvé`);
  }
});

console.log(`\n📊 Résumé: ${updatedFiles} fichier(s) mis à jour`);
console.log('\n🎯 Nouvelle URI MongoDB:');
console.log(newMongoURI);

console.log('\n📝 Prochaines étapes:');
console.log('1. Mettre à jour la variable MONGODB_URI sur Render.com');
console.log('2. Redéployer l\'application');
console.log('3. Tester la connexion');
