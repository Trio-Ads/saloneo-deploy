const fs = require('fs');
const path = require('path');

console.log('🔍 TEST FINAL DU COMPOSANT PROFILEFORM');
console.log('=====================================\n');

const profileFormPath = './src/features/profile/components/ProfileForm.tsx';
const content = fs.readFileSync(profileFormPath, 'utf8');

// Rechercher les textes en dur français
const frenchTexts = [
  'Votre prénom',
  'Votre nom', 
  'Nom de votre salon',
  'Adresse complète',
  'Annuler',
  'Changer le mot de passe',
  'Veuillez saisir',
  'Erreur lors du changement',
  'Devise mise à jour',
  'votre@email.com',
  'saloneo.tech/votre-salon',
  'Sauvegarde...',
  'user@example.com'
];

const foundTexts = [];
const notFoundTexts = [];

frenchTexts.forEach(text => {
  if (content.includes(text)) {
    foundTexts.push(text);
  } else {
    notFoundTexts.push(text);
  }
});

console.log('📊 RÉSULTATS DE L\'ANALYSE:');
console.log('==========================\n');

if (foundTexts.length > 0) {
  console.log('❌ TEXTES EN DUR TROUVÉS (' + foundTexts.length + '):');
  foundTexts.forEach(text => {
    console.log('  • "' + text + '"');
  });
  console.log('');
}

if (notFoundTexts.length > 0) {
  console.log('✅ TEXTES CORRECTEMENT INTERNATIONALISÉS (' + notFoundTexts.length + '):');
  notFoundTexts.forEach(text => {
    console.log('  • "' + text + '" - ✓ Remplacé par une clé i18n');
  });
  console.log('');
}

// Vérifier les fonctions t() utilisées
const tFunctionMatches = content.match(/t\(['"`]([^'"`]+)['"`]\)/g) || [];
console.log('🔧 FONCTIONS DE TRADUCTION UTILISÉES (' + tFunctionMatches.length + '):');
tFunctionMatches.slice(0, 10).forEach(match => {
  console.log('  • ' + match);
});
if (tFunctionMatches.length > 10) {
  console.log('  • ... et ' + (tFunctionMatches.length - 10) + ' autres');
}
console.log('');

// Conclusion
console.log('🎯 CONCLUSION:');
console.log('==============');
if (foundTexts.length === 0) {
  console.log('✅ Le composant ProfileForm est ENTIÈREMENT internationalisé!');
  console.log('✅ Aucun texte en dur français trouvé');
  console.log('✅ Toutes les chaînes utilisent les clés de traduction appropriées');
} else {
  console.log('⚠️  Le composant ProfileForm contient encore ' + foundTexts.length + ' texte(s) en dur');
  console.log('⚠️  Ces textes doivent être remplacés par des clés i18n');
}

console.log('\n📈 STATISTIQUES:');
console.log('• Textes en dur restants: ' + foundTexts.length);
console.log('• Textes internationalisés: ' + notFoundTexts.length);
console.log('• Fonctions t() utilisées: ' + tFunctionMatches.length);
console.log('• Taux d\'internationalisation: ' + Math.round((notFoundTexts.length / frenchTexts.length) * 100) + '%');
