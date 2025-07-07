const fs = require('fs');
const path = require('path');

// Couleurs pour la console
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Charger les fichiers de traduction
function loadTranslations() {
  const translations = {};
  const languages = ['fr', 'en', 'ar'];
  
  languages.forEach(lang => {
    try {
      const filePath = path.join(__dirname, 'public', 'locales', lang, 'dashboard.json');
      translations[lang] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
      log(`❌ Erreur lors du chargement de ${lang}/dashboard.json: ${error.message}`, 'red');
      translations[lang] = {};
    }
  });
  
  return translations;
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

// Clés requises pour le Dashboard
const requiredKeys = [
  // Clés principales
  'title',
  'welcome',
  'loading',
  'overview_subtitle',
  'demo_mode',
  'real_data',
  
  // Périodes de temps
  'time_periods.day',
  'time_periods.week',
  'time_periods.month',
  
  // KPIs
  'kpis.daily_revenue',
  'kpis.monthly_revenue',
  'kpis.clients',
  'kpis.occupancy',
  'kpis.appointments',
  'kpis.this_month',
  'kpis.upcoming',
  
  // Titres des graphiques
  'charts_titles.revenue_evolution',
  'charts_titles.appointments_by_status',
  'charts_titles.popular_services',
  
  // Alertes
  'alerts.subscription_limit',
  'alerts.upgrade',
  'alerts.unconfirmed_appointments',
  'alerts.view',
  'alerts.loyal_clients',
  'alerts.manage',
  
  // Actions rapides
  'quick_actions.title',
  'quick_actions.new_appointment',
  'quick_actions.new_appointment_desc',
  'quick_actions.new_client',
  'quick_actions.new_client_desc',
  'quick_actions.calendar',
  'quick_actions.calendar_desc',
  'quick_actions.subscription',
  'quick_actions.subscription_desc',
  'quick_actions.statistics',
  'quick_actions.statistics_desc',
  'quick_actions.settings',
  'quick_actions.settings_desc',
  
  // Prochains rendez-vous
  'components.upcoming_appointments.title',
  'components.upcoming_appointments.no_appointments',
  'components.upcoming_appointments.today',
  'components.upcoming_appointments.tomorrow',
  'components.upcoming_appointments.statuses.scheduled',
  'components.upcoming_appointments.statuses.confirmed',
  'components.upcoming_appointments.statuses.rescheduled',
  
  // Graphique des rendez-vous
  'components.appointment_chart.title',
  'components.appointment_chart.no_data',
  'components.appointment_chart.total',
  'components.appointment_chart.statuses.scheduled',
  'components.appointment_chart.statuses.confirmed',
  'components.appointment_chart.statuses.completed',
  'components.appointment_chart.statuses.cancelled',
  'components.appointment_chart.statuses.noShow',
  'components.appointment_chart.statuses.rescheduled',
  
  // Business Insights
  'components.business_insights.title',
  'components.business_insights.insights.high_cancellation_title',
  'components.business_insights.insights.high_cancellation_desc',
  'components.business_insights.insights.top_service_title',
  'components.business_insights.insights.top_service_desc',
  'components.business_insights.insights.loyal_clients_title',
  'components.business_insights.insights.loyal_clients_desc',
  'components.business_insights.insights.popular_slot_title',
  'components.business_insights.insights.popular_slot_desc',
  'components.business_insights.insights.low_acquisition_title',
  'components.business_insights.insights.low_acquisition_desc',
  
  // Graphique des revenus
  'components.revenue_chart.title',
  'components.revenue_chart.tooltip'
];

function main() {
  log('🧪 Test d\'internationalisation Dashboard', 'bold');
  log('=' .repeat(50), 'blue');
  
  const translations = loadTranslations();
  const languages = ['fr', 'en', 'ar'];
  
  let totalKeys = 0;
  let missingKeys = 0;
  const missingByLanguage = { fr: [], en: [], ar: [] };
  
  log('\n📋 Vérification des clés requises:', 'blue');
  
  requiredKeys.forEach(keyPath => {
    totalKeys++;
    const results = checkKey(translations, keyPath, languages);
    
    const allPresent = Object.values(results).every(present => present);
    const somePresent = Object.values(results).some(present => present);
    
    if (allPresent) {
      log(`  ✅ ${keyPath}`, 'green');
    } else if (somePresent) {
      log(`  ⚠️  ${keyPath}`, 'yellow');
      languages.forEach(lang => {
        if (!results[lang]) {
          log(`     ❌ Manquant en ${lang}`, 'red');
          missingByLanguage[lang].push(keyPath);
          missingKeys++;
        }
      });
    } else {
      log(`  ❌ ${keyPath} (manquant dans toutes les langues)`, 'red');
      languages.forEach(lang => {
        missingByLanguage[lang].push(keyPath);
      });
      missingKeys += languages.length;
    }
  });
  
  // Résumé
  log('\n📊 Résumé:', 'blue');
  log(`Total des clés vérifiées: ${totalKeys}`, 'blue');
  log(`Clés manquantes: ${missingKeys}`, missingKeys > 0 ? 'red' : 'green');
  
  languages.forEach(lang => {
    const missing = missingByLanguage[lang].length;
    const color = missing === 0 ? 'green' : missing < 5 ? 'yellow' : 'red';
    log(`${lang.toUpperCase()}: ${missing} clés manquantes`, color);
  });
  
  // Vérification des fichiers de composants
  log('\n🔍 Vérification des composants Dashboard:', 'blue');
  
  const dashboardComponents = [
    'src/features/dashboard/DashboardPage.tsx',
    'src/features/dashboard/components/QuickActions.tsx',
    'src/features/dashboard/components/UpcomingAppointments.tsx',
    'src/features/dashboard/components/AppointmentChart.tsx',
    'src/features/dashboard/components/BusinessInsights.tsx'
  ];
  
  dashboardComponents.forEach(componentPath => {
    const fullPath = path.join(__dirname, componentPath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Vérifier l'import useTranslation
      const hasUseTranslation = content.includes("import { useTranslation }") || 
                               content.includes("from 'react-i18next'");
      
      // Vérifier l'utilisation de t()
      const hasTranslationUsage = content.includes('const { t }') && content.includes('t(');
      
      if (hasUseTranslation && hasTranslationUsage) {
        log(`  ✅ ${path.basename(componentPath)}`, 'green');
      } else if (hasUseTranslation) {
        log(`  ⚠️  ${path.basename(componentPath)} - useTranslation importé mais pas utilisé`, 'yellow');
      } else {
        log(`  ❌ ${path.basename(componentPath)} - Pas d'internationalisation`, 'red');
      }
    } else {
      log(`  ❌ ${path.basename(componentPath)} - Fichier non trouvé`, 'red');
    }
  });
  
  // Conclusion
  log('\n🎯 Conclusion:', 'blue');
  if (missingKeys === 0) {
    log('✅ Toutes les clés Dashboard sont présentes dans toutes les langues!', 'green');
    log('✅ L\'internationalisation Dashboard est complète!', 'green');
  } else {
    log(`❌ ${missingKeys} clés manquantes au total`, 'red');
    log('⚠️  Veuillez compléter les traductions manquantes', 'yellow');
  }
  
  log('\n📝 Prochaines étapes:', 'blue');
  log('1. Tester l\'application avec différentes langues', 'blue');
  log('2. Vérifier l\'affichage des composants Dashboard', 'blue');
  log('3. Valider les interpolations de variables', 'blue');
  log('4. Tester les changements de langue en temps réel', 'blue');
}

main();
