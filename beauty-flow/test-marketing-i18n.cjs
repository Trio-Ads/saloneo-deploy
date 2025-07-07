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
      const filePath = path.join(__dirname, 'public', 'locales', lang, 'marketing.json');
      translations[lang] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
      log(`❌ Erreur lors du chargement de ${lang}/marketing.json: ${error.message}`, 'red');
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

// Clés requises pour le Marketing
const requiredKeys = [
  // Header
  'header.nav.features',
  'header.nav.pricing',
  'header.nav.testimonials',
  'header.nav.blog',
  'header.nav.contact',
  'header.cta.login',
  'header.cta.trial',
  'header.cta.trial_free',
  'header.stats.active_salons',
  'header.stats.ca_increase',
  
  // Hero
  'hero.badge',
  'hero.title',
  'hero.title_static',
  'hero.title_gradient',
  'hero.subtitle',
  'hero.subtitle_static',
  'hero.loading_3d',
  'hero.form.placeholder',
  'hero.form.button',
  'hero.form.button_static',
  'hero.form.loading',
  'hero.form.note',
  'hero.stats.salons_count',
  'hero.stats.salons_active',
  'hero.stats.growth',
  'hero.stats.time_saved',
  'hero.stats.appointments',
  'hero.stats.satisfaction',
  'hero.stats.support',
  'hero.buttons.demo',
  'hero.buttons.toggle_3d',
  'hero.buttons.toggle_2d',
  'hero.clients.rating',
  
  // Problem/Solution
  'problem_solution.title',
  'problem_solution.title_static',
  'problem_solution.subtitle',
  'problem_solution.subtitle_static',
  'problem_solution.before.title',
  'problem_solution.before.title_static',
  'problem_solution.after.title',
  
  // Features
  'features.title',
  'features.title_static',
  'features.subtitle',
  'features.subtitle_static',
  'features.items.calendar.title',
  'features.items.calendar.title_static',
  'features.items.calendar.description',
  'features.items.calendar.description_static',
  'features.items.clients.title',
  'features.items.clients.title_static',
  'features.items.clients.description',
  'features.items.clients.description_static',
  'features.items.digital.title',
  'features.items.digital.title_static',
  'features.items.digital.description',
  'features.items.digital.description_static',
  'features.items.payments.title',
  'features.items.payments.description',
  'features.items.payments.description_static',
  'features.items.analytics.title',
  'features.items.analytics.title_static',
  'features.items.analytics.description',
  'features.items.analytics.description_static',
  'features.items.mobile.title',
  'features.items.mobile.description',
  'features.items.mobile.description_static',
  
  // Targets
  'targets.title',
  'targets.subtitle',
  'targets.items.salon.title',
  'targets.items.salon.description',
  'targets.items.barbershop.title',
  'targets.items.barbershop.description',
  'targets.items.beauty.title',
  'targets.items.beauty.description',
  'targets.items.spa.title',
  'targets.items.spa.description',
  'targets.discover',
  
  // ROI
  'roi.title',
  'roi.title_static',
  'roi.subtitle',
  'roi.subtitle_static',
  'roi.calculator.appointments_label',
  'roi.calculator.price_label',
  'roi.calculator.current_revenue',
  'roi.calculator.revenue_with_saloneo',
  'roi.calculator.monthly_gain',
  'roi.stats.roi_average',
  'roi.stats.revenue_increase',
  'roi.stats.revenue_increase_note',
  'roi.stats.no_show_reduction',
  'roi.stats.no_show_note',
  'roi.stats.time_saved',
  'roi.stats.time_saved_note',
  
  // Pricing
  'pricing.title',
  'pricing.title_detailed',
  'pricing.title_static',
  'pricing.subtitle',
  'pricing.subtitle_detailed',
  'pricing.subtitle_static',
  'pricing.toggle.monthly',
  'pricing.toggle.yearly',
  'pricing.toggle.save',
  'pricing.toggle.save_40',
  'pricing.plans.free.name',
  'pricing.plans.free.name_simple',
  'pricing.plans.free.price',
  'pricing.plans.free.period',
  'pricing.plans.free.description',
  'pricing.plans.free.button',
  'pricing.plans.starter.name',
  'pricing.plans.starter.name_simple',
  'pricing.plans.starter.price',
  'pricing.plans.starter.original_price',
  'pricing.plans.starter.period',
  'pricing.plans.starter.description',
  'pricing.plans.starter.popular',
  'pricing.plans.starter.popular_alt',
  'pricing.plans.starter.save_note',
  'pricing.plans.starter.save_amount',
  'pricing.plans.starter.button',
  'pricing.plans.pro.name',
  'pricing.plans.pro.name_simple',
  'pricing.plans.pro.price',
  'pricing.plans.pro.original_price',
  'pricing.plans.pro.period',
  'pricing.plans.pro.description',
  'pricing.plans.pro.description_alt',
  'pricing.plans.pro.save_note',
  'pricing.plans.pro.save_amount',
  'pricing.plans.pro.button',
  'pricing.plans.enterprise.name',
  'pricing.plans.enterprise.name_simple',
  'pricing.plans.enterprise.price',
  'pricing.plans.enterprise.price_alt',
  'pricing.plans.enterprise.description',
  'pricing.plans.enterprise.button',
  'pricing.comparison.title',
  'pricing.comparison.subtitle',
  'pricing.comparison.values.unlimited',
  'pricing.note',
  'pricing.note_static',
  'pricing.view_all',
  
  // FAQ
  'faq.title',
  
  // Testimonials
  'testimonials.title',
  'testimonials.title_static',
  'testimonials.subtitle',
  'testimonials.subtitle_static',
  
  // Security
  'security.title',
  'security.subtitle',
  
  // CTA
  'cta.title',
  'cta.title_static',
  'cta.subtitle',
  'cta.subtitle_static',
  'cta.buttons.start',
  'cta.buttons.start_now',
  'cta.buttons.demo',
  'cta.buttons.contact',
  'cta.note',
  
  // Footer
  'footer.description',
  'footer.description_static',
  'footer.sections.product',
  'footer.sections.company',
  'footer.sections.support',
  'footer.sections.contact',
  'footer.links.features',
  'footer.links.pricing',
  'footer.links.security',
  'footer.links.about',
  'footer.links.blog',
  'footer.links.help',
  'footer.links.docs',
  'footer.links.privacy',
  'footer.links.terms',
  'footer.contact.email',
  'footer.contact.phone',
  'footer.contact.address',
  'footer.copyright',
  
  // Video
  'video.close',
  'video.demo',
  
  // Social Proof
  'social_proof.appointments_managed',
  'social_proof.satisfaction',
  'social_proof.support',
  
  // Floating Cards
  'floating_cards.clients_month',
  'floating_cards.appointments_today',
  'floating_cards.satisfaction_rate'
];

function main() {
  log('🧪 Test d\'internationalisation Marketing', 'bold');
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
    const color = missing === 0 ? 'green' : missing < 10 ? 'yellow' : 'red';
    log(`${lang.toUpperCase()}: ${missing} clés manquantes`, color);
  });
  
  // Vérification des fichiers de composants
  log('\n🔍 Vérification des composants Marketing:', 'blue');
  
  const marketingComponents = [
    'src/features/marketing/components/AwwwardsHeader.tsx',
    'src/features/marketing/pages/LandingPage.tsx',
    'src/features/marketing/pages/PricingPage.tsx',
    'src/features/marketing/pages/LandingPageStatic.tsx'
  ];
  
  marketingComponents.forEach(componentPath => {
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
  
  // Vérification des arrays dans les traductions
  log('\n🔍 Vérification des arrays de traduction:', 'blue');
  
  const arrayKeys = [
    'problem_solution.before.items',
    'problem_solution.after.items',
    'features.items.calendar.benefits',
    'features.items.clients.benefits',
    'features.items.digital.benefits',
    'features.items.payments.benefits',
    'features.items.analytics.benefits',
    'features.items.mobile.benefits',
    'pricing.plans.free.features',
    'pricing.plans.starter.features',
    'pricing.plans.pro.features',
    'pricing.plans.enterprise.features',
    'faq.items',
    'testimonials.items',
    'security.features',
    'cta.benefits'
  ];
  
  arrayKeys.forEach(keyPath => {
    const results = checkKey(translations, keyPath, languages);
    const allPresent = Object.values(results).every(present => present);
    
    if (allPresent) {
      log(`  ✅ ${keyPath}`, 'green');
    } else {
      log(`  ❌ ${keyPath}`, 'red');
    }
  });
  
  // Conclusion
  log('\n🎯 Conclusion:', 'blue');
  if (missingKeys === 0) {
    log('✅ Toutes les clés Marketing sont présentes dans toutes les langues!', 'green');
    log('✅ L\'internationalisation Marketing est complète!', 'green');
  } else {
    log(`❌ ${missingKeys} clés manquantes au total`, 'red');
    log('⚠️  Veuillez compléter les traductions manquantes', 'yellow');
  }
  
  log('\n📝 Prochaines étapes:', 'blue');
  log('1. Internationaliser les composants Marketing restants', 'blue');
  log('2. Tester l\'application avec différentes langues', 'blue');
  log('3. Vérifier l\'affichage des pages marketing', 'blue');
  log('4. Valider les interpolations de variables', 'blue');
  log('5. Tester les changements de langue en temps réel', 'blue');
}

main();
