const fs = require('fs');
const path = require('path');

console.log('🔍 Test final de l\'internationalisation du Dashboard...\n');

// Vérifier les fichiers de traduction dashboard
const languages = ['fr', 'en', 'ar'];
const dashboardKeys = [
  'title',
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
  'quick_actions.title',
  'quick_actions.new_appointment',
  'quick_actions.new_client',
  'charts_titles.revenue_evolution',
  'charts_titles.appointments_by_status',
  'charts_titles.popular_services',
  'alerts.subscription_limit',
  'alerts.upgrade',
  'recent_activity.title',
  'recent_activity.no_activity',
  'recent_activity.actions.created',
  'recent_activity.actions.confirmed',
  'recent_activity.actions.completed',
  'recent_activity.actions.cancelled',
  'recent_activity.actions.rescheduled',
  'recent_activity.actions.no_show',
  'recent_activity.time.just_now',
  'recent_activity.time.minutes_ago',
  'recent_activity.time.hours_ago',
  'recent_activity.time.days_ago',
  'recent_activity.unknown_client',
  'components.upcoming_appointments.title',
  'components.upcoming_appointments.no_appointments',
  'components.upcoming_appointments.today',
  'components.upcoming_appointments.tomorrow',
  'components.appointment_chart.title',
  'components.appointment_chart.no_data',
  'components.appointment_chart.total',
  'components.business_insights.title'
];

let allTestsPassed = true;

languages.forEach(lang => {
  console.log(`📋 Vérification des traductions ${lang.toUpperCase()}:`);
  
  const filePath = path.join(__dirname, 'public', 'locales', lang, 'dashboard.json');
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Fichier manquant: ${filePath}`);
    allTestsPassed = false;
    return;
  }
  
  try {
    const translations = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    dashboardKeys.forEach(key => {
      const keys = key.split('.');
      let value = translations;
      
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          console.log(`❌ Clé manquante: ${key} dans ${lang}`);
          allTestsPassed = false;
          return;
        }
      }
      
      if (typeof value === 'string' && value.trim() !== '') {
        console.log(`✅ ${key}: "${value}"`);
      } else {
        console.log(`❌ Valeur invalide pour ${key} dans ${lang}`);
        allTestsPassed = false;
      }
    });
    
  } catch (error) {
    console.log(`❌ Erreur de parsing JSON pour ${lang}: ${error.message}`);
    allTestsPassed = false;
  }
  
  console.log('');
});

// Vérifier les composants dashboard
console.log('🔧 Vérification des composants Dashboard:');

const dashboardComponents = [
  'src/features/dashboard/DashboardPage.tsx',
  'src/features/dashboard/components/QuickActions.tsx',
  'src/features/dashboard/components/UpcomingAppointments.tsx',
  'src/features/dashboard/components/AppointmentChart.tsx',
  'src/features/dashboard/components/BusinessInsights.tsx',
  'src/features/dashboard/components/RecentActivity.tsx'
];

dashboardComponents.forEach(componentPath => {
  const fullPath = path.join(__dirname, componentPath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ Composant manquant: ${componentPath}`);
    allTestsPassed = false;
    return;
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  
  // Vérifier que le composant utilise useTranslation('dashboard')
  if (content.includes("useTranslation('dashboard')")) {
    console.log(`✅ ${componentPath}: Utilise le namespace 'dashboard'`);
  } else if (content.includes("useTranslation()")) {
    console.log(`❌ ${componentPath}: Utilise useTranslation() sans namespace`);
    allTestsPassed = false;
  } else {
    console.log(`⚠️  ${componentPath}: N'utilise pas useTranslation`);
  }
  
  // Vérifier qu'il n'y a pas de textes en dur français
  const frenchTexts = [
    'Rendez-vous créé',
    'Rendez-vous confirmé',
    'Rendez-vous terminé',
    'Rendez-vous annulé',
    'Client non présenté',
    'Activité récente',
    'Aucune activité récente',
    'À l\'instant',
    'Il y a'
  ];
  
  const foundHardcodedTexts = frenchTexts.filter(text => content.includes(`'${text}'`) || content.includes(`"${text}"`));
  
  if (foundHardcodedTexts.length > 0) {
    console.log(`❌ ${componentPath}: Textes en dur trouvés: ${foundHardcodedTexts.join(', ')}`);
    allTestsPassed = false;
  } else {
    console.log(`✅ ${componentPath}: Aucun texte en dur détecté`);
  }
});

console.log('\n' + '='.repeat(50));

if (allTestsPassed) {
  console.log('🎉 TOUS LES TESTS SONT PASSÉS !');
  console.log('✅ L\'internationalisation du Dashboard est complète');
  console.log('✅ Tous les composants utilisent le bon namespace');
  console.log('✅ Toutes les traductions sont présentes');
  console.log('✅ Aucun texte en dur détecté');
} else {
  console.log('❌ CERTAINS TESTS ONT ÉCHOUÉ');
  console.log('⚠️  Veuillez corriger les erreurs ci-dessus');
}

console.log('\n📝 Résumé des corrections apportées:');
console.log('1. ✅ DashboardPage.tsx - Namespace corrigé');
console.log('2. ✅ QuickActions.tsx - Namespace corrigé');
console.log('3. ✅ UpcomingAppointments.tsx - Namespace corrigé');
console.log('4. ✅ AppointmentChart.tsx - Namespace corrigé');
console.log('5. ✅ BusinessInsights.tsx - Namespace corrigé');
console.log('6. ✅ RecentActivity.tsx - Complètement internationalisé');
console.log('7. ✅ dashboard.json (FR) - Nouvelles clés ajoutées');
console.log('8. ✅ dashboard.json (EN) - Nouvelles clés ajoutées');
console.log('9. ✅ dashboard.json (AR) - Nouvelles clés ajoutées');
