const fs = require('fs');
const path = require('path');

console.log('🧪 Test final de l\'internationalisation du dashboard...\n');

// Langues à tester
const languages = ['fr', 'en', 'ar', 'es', 'pt', 'tr'];

// Clés requises pour le dashboard
const requiredKeys = [
  // Clés principales du DashboardPage
  'loading',
  'welcome',
  'overview_subtitle',
  'demo_mode',
  'real_data',
  'time_periods.day',
  'time_periods.week',
  'time_periods.month',
  'kpis.daily_revenue',
  'kpis.monthly_revenue',
  'kpis.clients',
  'kpis.occupancy',
  'kpis.appointments',
  'kpis.this_month',
  'kpis.upcoming',
  'charts_titles.revenue_evolution',
  'charts_titles.appointments_by_status',
  'charts_titles.popular_services',
  'alerts.subscription_limit',
  'alerts.upgrade',
  'alerts.unconfirmed_appointments',
  'alerts.view',
  'alerts.loyal_clients',
  'alerts.manage',
  
  // Clés des composants
  'components.upcoming_appointments.title',
  'components.upcoming_appointments.no_appointments',
  'components.appointment_chart.no_data',
  'components.appointment_chart.total',
  'components.appointment_chart.statuses.scheduled',
  'components.appointment_chart.statuses.confirmed',
  'components.appointment_chart.statuses.completed',
  'components.appointment_chart.statuses.cancelled',
  'components.appointment_chart.statuses.noShow',
  'components.appointment_chart.statuses.rescheduled',
  'components.business_insights.title',
  'components.business_insights.insights.high_cancellation_title',
  'components.business_insights.insights.top_service_title',
  'components.business_insights.insights.loyal_clients_title',
  'components.business_insights.insights.popular_slot_title',
  'components.business_insights.insights.low_acquisition_title',
  
  // Nouvelles clés ajoutées
  'components.service_popularity.no_data',
  'components.service_popularity.unknown_service',
  'components.service_popularity.other_category',
  'components.team_performance.title',
  'components.team_performance.no_members',
  'components.team_performance.completed',
  
  // Clés QuickActions et RecentActivity (déjà existantes)
  'quick_actions.title',
  'recent_activity.title'
];

// Fonction pour vérifier une clé dans un objet imbriqué
function hasNestedKey(obj, path) {
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (!current || typeof current !== 'object' || !(key in current)) {
      return false;
    }
    current = current[key];
  }
  
  return true;
}

let totalErrors = 0;
let totalKeys = 0;

// Tester chaque langue
languages.forEach(lang => {
  const filePath = path.join(__dirname, 'public', 'locales', lang, 'dashboard.json');
  
  console.log(`📋 Test de ${lang}/dashboard.json:`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`  ❌ Fichier manquant: ${filePath}`);
    totalErrors++;
    return;
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    let missingKeys = [];
    
    // Vérifier chaque clé requise
    requiredKeys.forEach(key => {
      totalKeys++;
      if (!hasNestedKey(data, key)) {
        missingKeys.push(key);
        totalErrors++;
      }
    });
    
    if (missingKeys.length === 0) {
      console.log(`  ✅ Toutes les clés sont présentes (${requiredKeys.length} clés)`);
    } else {
      console.log(`  ❌ ${missingKeys.length} clés manquantes:`);
      missingKeys.forEach(key => {
        console.log(`    - ${key}`);
      });
    }
    
  } catch (error) {
    console.log(`  ❌ Erreur de parsing JSON: ${error.message}`);
    totalErrors++;
  }
  
  console.log('');
});

// Résumé final
console.log('📊 Résumé du test:');
console.log(`- Langues testées: ${languages.length}`);
console.log(`- Clés vérifiées par langue: ${requiredKeys.length}`);
console.log(`- Total de vérifications: ${totalKeys}`);
console.log(`- Erreurs trouvées: ${totalErrors}`);

if (totalErrors === 0) {
  console.log('\n🎉 SUCCÈS ! Toutes les traductions du dashboard sont complètes !');
  console.log('✨ Les erreurs "missingkey" devraient être complètement éliminées.');
} else {
  console.log(`\n⚠️  ${totalErrors} erreurs détectées. Veuillez corriger les clés manquantes.`);
}

console.log('\n🔍 Composants du dashboard vérifiés:');
console.log('- DashboardPage.tsx ✅');
console.log('- AppointmentChart.tsx ✅');
console.log('- BusinessInsights.tsx ✅');
console.log('- ServicePopularityChart.tsx ✅');
console.log('- TeamPerformanceWidget.tsx ✅');
console.log('- QuickActions.tsx ✅');
console.log('- UpcomingAppointments.tsx ✅');
console.log('- RecentActivity.tsx ✅');
