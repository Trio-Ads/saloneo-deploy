const fs = require('fs');
const path = require('path');

// Fonction pour lire un fichier JSON
function readJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Erreur lors de la lecture de ${filePath}:`, error.message);
    return null;
  }
}

// Fonction pour vérifier si une clé existe dans un objet imbriqué
function hasNestedKey(obj, keyPath) {
  const keys = keyPath.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return false;
    }
  }
  
  return true;
}

// Clés de traduction requises pour les composants d'affiliation
const requiredKeys = [
  // AffiliationTab
  'affiliation_tab.title',
  'affiliation_tab.description',
  'affiliation_tab.tabs.dashboard',
  'affiliation_tab.tabs.commissions',
  'affiliation_tab.tabs.marketing',
  'affiliation_tab.tabs.settings',

  // AffiliationActivation
  'affiliation_components.activation.title',
  'affiliation_components.activation.description',
  'affiliation_components.activation.benefits.title',
  'affiliation_components.activation.benefits.items.earn_commissions',
  'affiliation_components.activation.benefits.items.marketing_tools',
  'affiliation_components.activation.benefits.items.real_time_tracking',
  'affiliation_components.activation.benefits.items.monthly_payments',
  'affiliation_components.activation.how_it_works.title',
  'affiliation_components.activation.how_it_works.steps.share_link',
  'affiliation_components.activation.how_it_works.steps.client_subscribes',
  'affiliation_components.activation.how_it_works.steps.earn_commission',
  'affiliation_components.activation.commission_rates.title',
  'affiliation_components.activation.commission_rates.new_subscription',
  'affiliation_components.activation.commission_rates.renewal',
  'affiliation_components.activation.commission_rates.upgrade',
  'affiliation_components.activation.terms.title',
  'affiliation_components.activation.terms.items.minimum_payout',
  'affiliation_components.activation.terms.items.payment_schedule',
  'affiliation_components.activation.terms.items.tracking_period',
  'affiliation_components.activation.terms.items.compliance',
  'affiliation_components.activation.activate_button',
  'affiliation_components.activation.messages.activation_success',
  'affiliation_components.activation.messages.activation_error',

  // AffiliationDashboard
  'affiliation_components.dashboard.affiliate_link',
  'affiliation_components.dashboard.share_buttons.whatsapp',
  'affiliation_components.dashboard.share_buttons.facebook',
  'affiliation_components.dashboard.share_buttons.twitter',
  'affiliation_components.dashboard.share_buttons.linkedin',
  'affiliation_components.dashboard.share_buttons.email',
  'affiliation_components.dashboard.monthly_stats',
  'affiliation_components.dashboard.table_headers.month',
  'affiliation_components.dashboard.table_headers.clicks',
  'affiliation_components.dashboard.table_headers.conversions',
  'affiliation_components.dashboard.table_headers.conversion_rate',
  'affiliation_components.dashboard.table_headers.revenue',
  'affiliation_components.dashboard.current_month.clicks',
  'affiliation_components.dashboard.current_month.conversions',
  'affiliation_components.dashboard.current_month.revenue',
  'affiliation_components.dashboard.vs_last_month',
  'affiliation_components.dashboard.tips.title',
  'affiliation_components.dashboard.tips.social_share',
  'affiliation_components.dashboard.tips.quality_content',
  'affiliation_components.dashboard.tips.target_audience',
  'affiliation_components.dashboard.tips.use_tools',
  'affiliation_components.dashboard.messages.link_copied',
  'affiliation_components.dashboard.messages.qr_downloaded',

  // MarketingTools
  'affiliation_components.marketing.title',
  'affiliation_components.marketing.description',
  'affiliation_components.marketing.qr_code.title',
  'affiliation_components.marketing.qr_code.description',
  'affiliation_components.marketing.qr_code.generate',
  'affiliation_components.marketing.qr_code.download',
  'affiliation_components.marketing.qr_code.modal_title',
  'affiliation_components.marketing.qr_code.modal_description',
  'affiliation_components.marketing.banners.title',
  'affiliation_components.marketing.banners.description',
  'affiliation_components.marketing.banners.download',
  'affiliation_components.marketing.social_posts.title',
  'affiliation_components.marketing.social_posts.description',
  'affiliation_components.marketing.social_posts.copy',
  'affiliation_components.marketing.email_templates.title',
  'affiliation_components.marketing.email_templates.description',
  'affiliation_components.marketing.email_templates.copy',

  // CommissionTable
  'affiliation_components.commissions.status.pending',
  'affiliation_components.commissions.status.approved',
  'affiliation_components.commissions.status.paid',
  'affiliation_components.commissions.status.cancelled',
  'affiliation_components.commissions.types.subscription',
  'affiliation_components.commissions.types.renewal',
  'affiliation_components.commissions.types.upgrade',
  'affiliation_components.commissions.filters.all',
  'affiliation_components.commissions.filters.pending',
  'affiliation_components.commissions.filters.approved',
  'affiliation_components.commissions.filters.paid',
  'affiliation_components.commissions.export',
  'affiliation_components.commissions.table.date',
  'affiliation_components.commissions.table.referred_client',
  'affiliation_components.commissions.table.type',
  'affiliation_components.commissions.table.original_amount',
  'affiliation_components.commissions.table.commission',
  'affiliation_components.commissions.table.status',
  'affiliation_components.commissions.table.payment_date',
  'affiliation_components.commissions.empty_state.title',
  'affiliation_components.commissions.empty_state.subtitle',
  'affiliation_components.commissions.payment_note.title',
  'affiliation_components.commissions.payment_note.description',

  // PayoutSettings
  'affiliation_components.payout.title',
  'affiliation_components.payout.description',
  'affiliation_components.payout.method.title',
  'affiliation_components.payout.method.bank_transfer',
  'affiliation_components.payout.method.paypal',
  'affiliation_components.payout.method.crypto',
  'affiliation_components.payout.bank_details.title',
  'affiliation_components.payout.bank_details.account_holder',
  'affiliation_components.payout.bank_details.iban',
  'affiliation_components.payout.bank_details.bic',
  'affiliation_components.payout.bank_details.bank_name',
  'affiliation_components.payout.paypal_details.title',
  'affiliation_components.payout.paypal_details.email',
  'affiliation_components.payout.crypto_details.title',
  'affiliation_components.payout.crypto_details.wallet_address',
  'affiliation_components.payout.crypto_details.currency',
  'affiliation_components.payout.minimum_payout.title',
  'affiliation_components.payout.minimum_payout.description',
  'affiliation_components.payout.save_button',
  'affiliation_components.payout.messages.save_success',
  'affiliation_components.payout.messages.save_error'
];

// Langues à vérifier
const languages = ['fr', 'en', 'ar'];

console.log('🔍 Vérification de l\'internationalisation des composants d\'affiliation...\n');

let allValid = true;

languages.forEach(lang => {
  console.log(`📋 Vérification pour la langue: ${lang.toUpperCase()}`);
  
  const filePath = path.join(__dirname, 'public', 'locales', lang, 'profile.json');
  const translations = readJsonFile(filePath);
  
  if (!translations) {
    console.log(`❌ Impossible de lire le fichier de traduction pour ${lang}`);
    allValid = false;
    return;
  }
  
  const missingKeys = [];
  
  requiredKeys.forEach(key => {
    if (!hasNestedKey(translations, key)) {
      missingKeys.push(key);
    }
  });
  
  if (missingKeys.length === 0) {
    console.log(`✅ Toutes les clés d'affiliation sont présentes (${requiredKeys.length} clés)`);
  } else {
    console.log(`❌ ${missingKeys.length} clés manquantes:`);
    missingKeys.forEach(key => {
      console.log(`   - ${key}`);
    });
    allValid = false;
  }
  
  console.log('');
});

if (allValid) {
  console.log('🎉 Tous les composants d\'affiliation sont correctement internationalisés !');
} else {
  console.log('⚠️  Certaines traductions d\'affiliation sont manquantes.');
  process.exit(1);
}
