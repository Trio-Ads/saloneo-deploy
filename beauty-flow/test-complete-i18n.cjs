const fs = require('fs');
const path = require('path');

// Couleurs pour la console
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Charger les fichiers de traduction
function loadTranslations(namespace) {
  const translations = {};
  const languages = ['fr', 'en', 'ar'];
  
  languages.forEach(lang => {
    try {
      const filePath = path.join(__dirname, 'public', 'locales', lang, `${namespace}.json`);
      if (fs.existsSync(filePath)) {
        translations[lang] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      } else {
        translations[lang] = {};
      }
    } catch (error) {
      log(`❌ Erreur lors du chargement de ${lang}/${namespace}.json: ${error.message}`, 'red');
      translations[lang] = {};
    }
  });
  
  return translations;
}

// Compter les clés dans un objet de manière récursive
function countKeys(obj, prefix = '') {
  let count = 0;
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      count += countKeys(obj[key], prefix ? `${prefix}.${key}` : key);
    } else {
      count++;
    }
  }
  return count;
}

// Vérifier qu'une clé existe dans toutes les langues
function checkKey(translations, keyPath, languages) {
  const results = {};
  
  languages.forEach(lang => {
    const keys = keyPath.split('.');
    let current = translations[lang];
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        current = undefined;
        break;
      }
    }
    
    results[lang] = current !== undefined;
  });
  
  return results;
}

// Vérifier les composants pour l'internationalisation
function checkComponents() {
  const components = [
    // Core Components
    { path: 'src/components/Modal.tsx', name: 'Modal' },
    { path: 'src/components/Toast.tsx', name: 'Toast' },
    { path: 'src/components/UserMenu.tsx', name: 'UserMenu' },
    { path: 'src/layouts/MainLayout.tsx', name: 'MainLayout' },
    { path: 'src/App.tsx', name: 'App' },
    
    // Dashboard
    { path: 'src/features/dashboard/DashboardPage.tsx', name: 'DashboardPage' },
    { path: 'src/features/dashboard/components/QuickActions.tsx', name: 'QuickActions' },
    { path: 'src/features/dashboard/components/UpcomingAppointments.tsx', name: 'UpcomingAppointments' },
    { path: 'src/features/dashboard/components/AppointmentChart.tsx', name: 'AppointmentChart' },
    { path: 'src/features/dashboard/components/BusinessInsights.tsx', name: 'BusinessInsights' },
    
    // Appointments
    { path: 'src/features/appointments/AppointmentsPage.tsx', name: 'AppointmentsPage' },
    { path: 'src/features/appointments/components/AppointmentForm.tsx', name: 'AppointmentForm' },
    { path: 'src/features/appointments/components/AppointmentList.tsx', name: 'AppointmentList' },
    { path: 'src/features/appointments/components/AppointmentSettings.tsx', name: 'AppointmentSettings' },
    { path: 'src/features/appointments/components/CalendarView.tsx', name: 'CalendarView' },
    
    // Clients
    { path: 'src/features/clients/ClientsPage.tsx', name: 'ClientsPage' },
    { path: 'src/features/clients/components/ClientForm.tsx', name: 'ClientForm' },
    { path: 'src/features/clients/components/ClientList.tsx', name: 'ClientList' },
    
    // Services
    { path: 'src/features/services/ServicesPage.tsx', name: 'ServicesPage' },
    { path: 'src/features/services/components/ServiceForm.tsx', name: 'ServiceForm' },
    
    // Team
    { path: 'src/features/team/TeamPage.tsx', name: 'TeamPage' },
    { path: 'src/features/team/components/TeamMemberForm.tsx', name: 'TeamMemberForm' },
    { path: 'src/features/team/components/TeamList.tsx', name: 'TeamList' },
    
    // Interface
    { path: 'src/features/interface/InterfacePage.tsx', name: 'InterfacePage' },
    
    // Profile & Affiliation
    { path: 'src/features/profile/components/ProfileForm.tsx', name: 'ProfileForm' },
    { path: 'src/features/profile/components/affiliation/AffiliationDashboard.tsx', name: 'AffiliationDashboard' },
    { path: 'src/features/profile/components/affiliation/CommissionTable.tsx', name: 'CommissionTable' },
    
    // Public
    { path: 'src/features/public/SalonPage.tsx', name: 'SalonPage' },
    { path: 'src/features/public/components/PublicBookingFlow.tsx', name: 'PublicBookingFlow' },
    { path: 'src/features/public/components/DateTimeSelection.tsx', name: 'DateTimeSelection' },
    
    // Marketing
    { path: 'src/features/marketing/components/AwwwardsHeader.tsx', name: 'AwwwardsHeader' },
    { path: 'src/features/marketing/pages/LandingPage.tsx', name: 'LandingPage' },
    { path: 'src/features/marketing/pages/PricingPage.tsx', name: 'PricingPage' },
    { path: 'src/features/marketing/pages/LandingPageStatic.tsx', name: 'LandingPageStatic' },
    
    // Subscription
    { path: 'src/features/subscription/SubscriptionPage.tsx', name: 'SubscriptionPage' },
    { path: 'src/features/subscription/components/PaymentModal.tsx', name: 'PaymentModal' },
    { path: 'src/features/subscription/components/PaymentSuccess.tsx', name: 'PaymentSuccess' },
    { path: 'src/features/subscription/components/PaymentFailed.tsx', name: 'PaymentFailed' }
  ];
  
  const results = {
    internationalized: [],
    partiallyInternationalized: [],
    notInternationalized: [],
    notFound: []
  };
  
  components.forEach(component => {
    const fullPath = path.join(__dirname, component.path);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Vérifier l'import useTranslation
      const hasUseTranslation = content.includes("import { useTranslation }") || 
                               content.includes("from 'react-i18next'");
      
      // Vérifier l'utilisation de t()
      const hasTranslationUsage = content.includes('const { t }') && content.includes('t(');
      
      if (hasUseTranslation && hasTranslationUsage) {
        results.internationalized.push(component.name);
      } else if (hasUseTranslation) {
        results.partiallyInternationalized.push(component.name);
      } else {
        results.notInternationalized.push(component.name);
      }
    } else {
      results.notFound.push(component.name);
    }
  });
  
  return results;
}

function main() {
  log('🌍 TEST COMPLET D\'INTERNATIONALISATION BEAUTY FLOW', 'bold');
  log('=' .repeat(60), 'cyan');
  
  const namespaces = [
    'common', 'errors', 'appointments', 'clients', 'services', 
    'team', 'interface', 'profile', 'dashboard', 'public', 
    'marketing', 'subscription'
  ];
  
  const languages = ['fr', 'en', 'ar'];
  let totalKeys = 0;
  let totalMissingKeys = 0;
  const summaryByNamespace = {};
  
  // Vérification par namespace
  namespaces.forEach(namespace => {
    log(`\n📁 Namespace: ${namespace.toUpperCase()}`, 'blue');
    log('-'.repeat(40), 'blue');
    
    const translations = loadTranslations(namespace);
    
    // Compter les clés par langue
    const keyCounts = {};
    languages.forEach(lang => {
      keyCounts[lang] = countKeys(translations[lang]);
    });
    
    const maxKeys = Math.max(...Object.values(keyCounts));
    const minKeys = Math.min(...Object.values(keyCounts));
    
    summaryByNamespace[namespace] = {
      maxKeys,
      minKeys,
      complete: maxKeys === minKeys && maxKeys > 0,
      keyCounts
    };
    
    totalKeys += maxKeys;
    
    languages.forEach(lang => {
      const missing = maxKeys - keyCounts[lang];
      totalMissingKeys += missing;
      
      const status = missing === 0 ? '✅' : missing < 5 ? '⚠️' : '❌';
      const color = missing === 0 ? 'green' : missing < 5 ? 'yellow' : 'red';
      
      log(`  ${status} ${lang.toUpperCase()}: ${keyCounts[lang]} clés (${missing} manquantes)`, color);
    });
    
    if (summaryByNamespace[namespace].complete) {
      log(`  ✅ Namespace complet!`, 'green');
    } else {
      log(`  ⚠️  Namespace incomplet`, 'yellow');
    }
  });
  
  // Vérification des composants
  log('\n🔍 VÉRIFICATION DES COMPOSANTS', 'blue');
  log('-'.repeat(40), 'blue');
  
  const componentResults = checkComponents();
  
  log(`\n✅ Composants internationalisés (${componentResults.internationalized.length}):`, 'green');
  componentResults.internationalized.forEach(name => {
    log(`  • ${name}`, 'green');
  });
  
  if (componentResults.partiallyInternationalized.length > 0) {
    log(`\n⚠️  Composants partiellement internationalisés (${componentResults.partiallyInternationalized.length}):`, 'yellow');
    componentResults.partiallyInternationalized.forEach(name => {
      log(`  • ${name}`, 'yellow');
    });
  }
  
  if (componentResults.notInternationalized.length > 0) {
    log(`\n❌ Composants non internationalisés (${componentResults.notInternationalized.length}):`, 'red');
    componentResults.notInternationalized.forEach(name => {
      log(`  • ${name}`, 'red');
    });
  }
  
  if (componentResults.notFound.length > 0) {
    log(`\n🔍 Composants non trouvés (${componentResults.notFound.length}):`, 'magenta');
    componentResults.notFound.forEach(name => {
      log(`  • ${name}`, 'magenta');
    });
  }
  
  // Résumé global
  log('\n📊 RÉSUMÉ GLOBAL', 'cyan');
  log('=' .repeat(40), 'cyan');
  
  const completeNamespaces = Object.values(summaryByNamespace).filter(ns => ns.complete).length;
  const totalComponents = componentResults.internationalized.length + 
                         componentResults.partiallyInternationalized.length + 
                         componentResults.notInternationalized.length;
  
  log(`📁 Namespaces: ${completeNamespaces}/${namespaces.length} complets`, 
      completeNamespaces === namespaces.length ? 'green' : 'yellow');
  
  log(`🔧 Composants: ${componentResults.internationalized.length}/${totalComponents} internationalisés`, 
      componentResults.internationalized.length === totalComponents ? 'green' : 'yellow');
  
  log(`🔑 Clés totales: ${totalKeys}`, 'blue');
  log(`❌ Clés manquantes: ${totalMissingKeys}`, totalMissingKeys === 0 ? 'green' : 'red');
  
  const completionPercentage = totalKeys > 0 ? ((totalKeys - totalMissingKeys) / totalKeys * 100).toFixed(1) : 0;
  log(`📈 Taux de completion: ${completionPercentage}%`, 
      completionPercentage >= 95 ? 'green' : completionPercentage >= 80 ? 'yellow' : 'red');
  
  // Conclusion
  log('\n🎯 CONCLUSION', 'cyan');
  log('=' .repeat(40), 'cyan');
  
  if (totalMissingKeys === 0 && componentResults.notInternationalized.length === 0) {
    log('🎉 FÉLICITATIONS! L\'internationalisation est COMPLÈTE!', 'green');
    log('✅ Toutes les clés sont présentes dans toutes les langues', 'green');
    log('✅ Tous les composants sont internationalisés', 'green');
  } else if (totalMissingKeys < 10 && componentResults.notInternationalized.length === 0) {
    log('🎊 Excellent travail! L\'internationalisation est presque complète!', 'yellow');
    log(`⚠️  Il reste ${totalMissingKeys} clés à traduire`, 'yellow');
  } else {
    log('🔧 L\'internationalisation est en cours...', 'yellow');
    if (totalMissingKeys > 0) {
      log(`❌ ${totalMissingKeys} clés manquantes`, 'red');
    }
    if (componentResults.notInternationalized.length > 0) {
      log(`❌ ${componentResults.notInternationalized.length} composants non internationalisés`, 'red');
    }
  }
  
  log('\n📝 PROCHAINES ÉTAPES:', 'blue');
  if (totalMissingKeys > 0) {
    log('1. Compléter les traductions manquantes', 'blue');
  }
  if (componentResults.notInternationalized.length > 0) {
    log('2. Internationaliser les composants restants', 'blue');
  }
  if (componentResults.partiallyInternationalized.length > 0) {
    log('3. Finaliser les composants partiellement internationalisés', 'blue');
  }
  log('4. Tester l\'application dans toutes les langues', 'blue');
  log('5. Vérifier l\'affichage RTL pour l\'arabe', 'blue');
  log('6. Valider les interpolations et pluriels', 'blue');
}

main();
