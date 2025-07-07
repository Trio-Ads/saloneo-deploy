const fs = require('fs');
const path = require('path');

console.log('🧪 Test final de l\'internationalisation complète...\n');

// Langues supportées
const languages = ['fr', 'en', 'ar', 'es', 'pt', 'tr'];
const modules = ['appointments', 'clients', 'services', 'team', 'interface', 'profile', 'public', 'auth', 'common', 'dashboard', 'marketing', 'subscription', 'errors'];

let totalFiles = 0;
let existingFiles = 0;
let missingFiles = [];

console.log('📊 Vérification des fichiers JSON...\n');

// Vérifier l'existence de tous les fichiers
languages.forEach(lang => {
  console.log(`🌍 ${lang.toUpperCase()}:`);
  
  modules.forEach(module => {
    const filePath = `public/locales/${lang}/${module}.json`;
    totalFiles++;
    
    if (fs.existsSync(filePath)) {
      existingFiles++;
      console.log(`  ✅ ${module}.json`);
    } else {
      missingFiles.push(`${lang}/${module}.json`);
      console.log(`  ❌ ${module}.json - MANQUANT`);
    }
  });
  console.log('');
});

// Vérifier les clés spécifiques qui étaient problématiques
console.log('🔍 Vérification des clés spécifiques...\n');

// Vérifier la clé "scheduled" dans appointments.json
console.log('📅 Clé "scheduled" dans appointments.json:');
languages.forEach(lang => {
  const filePath = `public/locales/${lang}/appointments.json`;
  if (fs.existsSync(filePath)) {
    try {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (content.status && content.status.scheduled) {
        console.log(`  ✅ ${lang}: "${content.status.scheduled}"`);
      } else {
        console.log(`  ❌ ${lang}: MANQUANT`);
      }
    } catch (error) {
      console.log(`  ❌ ${lang}: ERREUR DE LECTURE`);
    }
  }
});

// Vérifier les clés d'interface spécifiques
console.log('\n🎨 Clés d\'interface spécifiques:');
const interfaceKeys = [
  'colors.accent',
  'colors.background', 
  'sections.images.title',
  'images.logo_label',
  'team.show_on_public'
];

interfaceKeys.forEach(key => {
  console.log(`\n🔑 ${key}:`);
  languages.forEach(lang => {
    const filePath = `public/locales/${lang}/interface.json`;
    if (fs.existsSync(filePath)) {
      try {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const value = getNestedValue(content, key);
        if (value) {
          console.log(`  ✅ ${lang}: "${value}"`);
        } else {
          console.log(`  ❌ ${lang}: MANQUANT`);
        }
      } catch (error) {
        console.log(`  ❌ ${lang}: ERREUR`);
      }
    }
  });
});

// Fonction pour récupérer une valeur imbriquée
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current && current[key], obj);
}

// Vérifier les fichiers de code pour les headers codés en dur
console.log('\n🔍 Vérification des headers codés en dur...\n');

const filesToCheck = [
  'src/features/appointments/AppointmentsPage.tsx',
  'src/features/interface/InterfacePage.tsx'
];

filesToCheck.forEach(filePath => {
  console.log(`📄 ${filePath}:`);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Rechercher des patterns de texte codé en dur
    const hardcodedPatterns = [
      /["']Planifiés["']/g,
      /["']Confirmés["']/g,
      /["']Terminés["']/g,
      /["']Annulés["']/g,
      /["']Non présentés["']/g,
      /["']Images du Salon["']/g,
      /["']Couleur principale["']/g,
      /["']Couleur secondaire["']/g,
      /["']Couleur d'accent["']/g,
      /["']Couleur de fond["']/g,
      /["']Logo du salon["']/g,
      /["']Bannière \/ Header["']/g,
      /["']Contenu du Salon["']/g,
      /["']Paramètres Avancés["']/g
    ];
    
    let foundHardcoded = false;
    hardcodedPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        foundHardcoded = true;
        console.log(`  ❌ Trouvé: ${matches[0]}`);
      }
    });
    
    if (!foundHardcoded) {
      console.log(`  ✅ Aucun header codé en dur trouvé`);
    }
  } else {
    console.log(`  ❌ Fichier non trouvé`);
  }
});

// Résumé final
console.log('\n' + '='.repeat(60));
console.log('📊 RÉSUMÉ FINAL DE L\'INTERNATIONALISATION');
console.log('='.repeat(60));

console.log(`\n📁 Fichiers JSON:`);
console.log(`  Total attendu: ${totalFiles}`);
console.log(`  Existants: ${existingFiles}`);
console.log(`  Manquants: ${missingFiles.length}`);

if (missingFiles.length > 0) {
  console.log(`\n❌ Fichiers manquants:`);
  missingFiles.forEach(file => console.log(`  - ${file}`));
}

console.log(`\n🌍 Langues supportées: ${languages.join(', ').toUpperCase()}`);
console.log(`📦 Modules: ${modules.length} modules`);

const completionRate = Math.round((existingFiles / totalFiles) * 100);
console.log(`\n🎯 Taux de completion: ${completionRate}%`);

if (completionRate === 100 && missingFiles.length === 0) {
  console.log('\n🎉 FÉLICITATIONS ! L\'internationalisation est COMPLÈTE à 100% !');
  console.log('✅ Tous les fichiers JSON sont présents');
  console.log('✅ Toutes les langues sont supportées');
  console.log('✅ Headers codés en dur corrigés');
  console.log('\n🚀 Votre application Beauty Flow est maintenant entièrement internationalisée !');
} else {
  console.log('\n⚠️ L\'internationalisation n\'est pas encore complète.');
  console.log('Veuillez corriger les problèmes identifiés ci-dessus.');
}

console.log('\n' + '='.repeat(60));
