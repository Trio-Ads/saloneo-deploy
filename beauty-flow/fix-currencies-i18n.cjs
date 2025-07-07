const fs = require('fs');
const path = require('path');

console.log('🔧 Correction des traductions des devises...\n');

// Langues à traiter
const languages = ['fr', 'en', 'ar', 'es', 'pt', 'tr'];

// Traductions des devises pour toutes les langues
const currencyTranslations = {
  fr: {
    'EUR': 'Euro',
    'USD': 'Dollar américain',
    'GBP': 'Livre sterling',
    'JPY': 'Yen japonais',
    'CAD': 'Dollar canadien',
    'AUD': 'Dollar australien',
    'CHF': 'Franc suisse',
    'CNY': 'Yuan chinois',
    'SEK': 'Couronne suédoise',
    'NOK': 'Couronne norvégienne',
    'DKK': 'Couronne danoise',
    'PLN': 'Zloty polonais',
    'CZK': 'Couronne tchèque',
    'HUF': 'Forint hongrois',
    'RUB': 'Rouble russe',
    'BRL': 'Réal brésilien',
    'INR': 'Roupie indienne',
    'KRW': 'Won sud-coréen',
    'SGD': 'Dollar de Singapour',
    'HKD': 'Dollar de Hong Kong',
    'NZD': 'Dollar néo-zélandais',
    'MXN': 'Peso mexicain',
    'ZAR': 'Rand sud-africain',
    'TRY': 'Livre turque',
    'AED': 'Dirham des Émirats',
    'SAR': 'Riyal saoudien',
    'QAR': 'Riyal qatarien',
    'KWD': 'Dinar koweïtien',
    'BHD': 'Dinar bahreïni',
    'OMR': 'Rial omanais',
    'JOD': 'Dinar jordanien',
    'LBP': 'Livre libanaise',
    'EGP': 'Livre égyptienne',
    'MAD': 'Dirham marocain',
    'TND': 'Dinar tunisien',
    'DZD': 'Dinar algérien',
    'LYD': 'Dinar libyen'
  },
  en: {
    'EUR': 'Euro',
    'USD': 'US Dollar',
    'GBP': 'British Pound',
    'JPY': 'Japanese Yen',
    'CAD': 'Canadian Dollar',
    'AUD': 'Australian Dollar',
    'CHF': 'Swiss Franc',
    'CNY': 'Chinese Yuan',
    'SEK': 'Swedish Krona',
    'NOK': 'Norwegian Krone',
    'DKK': 'Danish Krone',
    'PLN': 'Polish Zloty',
    'CZK': 'Czech Koruna',
    'HUF': 'Hungarian Forint',
    'RUB': 'Russian Ruble',
    'BRL': 'Brazilian Real',
    'INR': 'Indian Rupee',
    'KRW': 'South Korean Won',
    'SGD': 'Singapore Dollar',
    'HKD': 'Hong Kong Dollar',
    'NZD': 'New Zealand Dollar',
    'MXN': 'Mexican Peso',
    'ZAR': 'South African Rand',
    'TRY': 'Turkish Lira',
    'AED': 'UAE Dirham',
    'SAR': 'Saudi Riyal',
    'QAR': 'Qatari Riyal',
    'KWD': 'Kuwaiti Dinar',
    'BHD': 'Bahraini Dinar',
    'OMR': 'Omani Rial',
    'JOD': 'Jordanian Dinar',
    'LBP': 'Lebanese Pound',
    'EGP': 'Egyptian Pound',
    'MAD': 'Moroccan Dirham',
    'TND': 'Tunisian Dinar',
    'DZD': 'Algerian Dinar',
    'LYD': 'Libyan Dinar'
  },
  ar: {
    'EUR': 'يورو',
    'USD': 'دولار أمريكي',
    'GBP': 'جنيه إسترليني',
    'JPY': 'ين ياباني',
    'CAD': 'دولار كندي',
    'AUD': 'دولار أسترالي',
    'CHF': 'فرنك سويسري',
    'CNY': 'يوان صيني',
    'SEK': 'كرونة سويدية',
    'NOK': 'كرونة نرويجية',
    'DKK': 'كرونة دنماركية',
    'PLN': 'زلوتي بولندي',
    'CZK': 'كرونة تشيكية',
    'HUF': 'فورنت مجري',
    'RUB': 'روبل روسي',
    'BRL': 'ريال برازيلي',
    'INR': 'روبية هندية',
    'KRW': 'وون كوري جنوبي',
    'SGD': 'دولار سنغافوري',
    'HKD': 'دولار هونغ كونغ',
    'NZD': 'دولار نيوزيلندي',
    'MXN': 'بيزو مكسيكي',
    'ZAR': 'راند جنوب أفريقي',
    'TRY': 'ليرة تركية',
    'AED': 'درهم إماراتي',
    'SAR': 'ريال سعودي',
    'QAR': 'ريال قطري',
    'KWD': 'دينار كويتي',
    'BHD': 'دينار بحريني',
    'OMR': 'ريال عماني',
    'JOD': 'دينار أردني',
    'LBP': 'ليرة لبنانية',
    'EGP': 'جنيه مصري',
    'MAD': 'درهم مغربي',
    'TND': 'دينار تونسي',
    'DZD': 'دينار جزائري',
    'LYD': 'دينار ليبي'
  },
  es: {
    'EUR': 'Euro',
    'USD': 'Dólar estadounidense',
    'GBP': 'Libra esterlina',
    'JPY': 'Yen japonés',
    'CAD': 'Dólar canadiense',
    'AUD': 'Dólar australiano',
    'CHF': 'Franco suizo',
    'CNY': 'Yuan chino',
    'SEK': 'Corona sueca',
    'NOK': 'Corona noruega',
    'DKK': 'Corona danesa',
    'PLN': 'Zloty polaco',
    'CZK': 'Corona checa',
    'HUF': 'Florín húngaro',
    'RUB': 'Rublo ruso',
    'BRL': 'Real brasileño',
    'INR': 'Rupia india',
    'KRW': 'Won surcoreano',
    'SGD': 'Dólar de Singapur',
    'HKD': 'Dólar de Hong Kong',
    'NZD': 'Dólar neozelandés',
    'MXN': 'Peso mexicano',
    'ZAR': 'Rand sudafricano',
    'TRY': 'Lira turca',
    'AED': 'Dirham de los EAU',
    'SAR': 'Riyal saudí',
    'QAR': 'Riyal qatarí',
    'KWD': 'Dinar kuwaití',
    'BHD': 'Dinar bahreiní',
    'OMR': 'Rial omaní',
    'JOD': 'Dinar jordano',
    'LBP': 'Libra libanesa',
    'EGP': 'Libra egipcia',
    'MAD': 'Dirham marroquí',
    'TND': 'Dinar tunecino',
    'DZD': 'Dinar argelino',
    'LYD': 'Dinar libio'
  },
  pt: {
    'EUR': 'Euro',
    'USD': 'Dólar americano',
    'GBP': 'Libra esterlina',
    'JPY': 'Iene japonês',
    'CAD': 'Dólar canadense',
    'AUD': 'Dólar australiano',
    'CHF': 'Franco suíço',
    'CNY': 'Yuan chinês',
    'SEK': 'Coroa sueca',
    'NOK': 'Coroa norueguesa',
    'DKK': 'Coroa dinamarquesa',
    'PLN': 'Zloty polonês',
    'CZK': 'Coroa tcheca',
    'HUF': 'Forint húngaro',
    'RUB': 'Rublo russo',
    'BRL': 'Real brasileiro',
    'INR': 'Rupia indiana',
    'KRW': 'Won sul-coreano',
    'SGD': 'Dólar de Singapura',
    'HKD': 'Dólar de Hong Kong',
    'NZD': 'Dólar neozelandês',
    'MXN': 'Peso mexicano',
    'ZAR': 'Rand sul-africano',
    'TRY': 'Lira turca',
    'AED': 'Dirham dos EAU',
    'SAR': 'Riyal saudita',
    'QAR': 'Riyal do Qatar',
    'KWD': 'Dinar kuwaitiano',
    'BHD': 'Dinar do Bahrein',
    'OMR': 'Rial omanense',
    'JOD': 'Dinar jordaniano',
    'LBP': 'Libra libanesa',
    'EGP': 'Libra egípcia',
    'MAD': 'Dirham marroquino',
    'TND': 'Dinar tunisiano',
    'DZD': 'Dinar argelino',
    'LYD': 'Dinar líbio'
  },
  tr: {
    'EUR': 'Euro',
    'USD': 'ABD Doları',
    'GBP': 'İngiliz Sterlini',
    'JPY': 'Japon Yeni',
    'CAD': 'Kanada Doları',
    'AUD': 'Avustralya Doları',
    'CHF': 'İsviçre Frangı',
    'CNY': 'Çin Yuanı',
    'SEK': 'İsveç Kronu',
    'NOK': 'Norveç Kronu',
    'DKK': 'Danimarka Kronu',
    'PLN': 'Polonya Zlotisi',
    'CZK': 'Çek Korunası',
    'HUF': 'Macar Forinti',
    'RUB': 'Rus Rublesi',
    'BRL': 'Brezilya Reali',
    'INR': 'Hint Rupisi',
    'KRW': 'Güney Kore Wonu',
    'SGD': 'Singapur Doları',
    'HKD': 'Hong Kong Doları',
    'NZD': 'Yeni Zelanda Doları',
    'MXN': 'Meksika Pesosu',
    'ZAR': 'Güney Afrika Randı',
    'TRY': 'Türk Lirası',
    'AED': 'BAE Dirhemi',
    'SAR': 'Suudi Riyali',
    'QAR': 'Katar Riyali',
    'KWD': 'Kuveyt Dinarı',
    'BHD': 'Bahreyn Dinarı',
    'OMR': 'Umman Riyali',
    'JOD': 'Ürdün Dinarı',
    'LBP': 'Lübnan Lirası',
    'EGP': 'Mısır Lirası',
    'MAD': 'Fas Dirhemi',
    'TND': 'Tunus Dinarı',
    'DZD': 'Cezayir Dinarı',
    'LYD': 'Libya Dinarı'
  }
};

// Fonction pour définir une valeur dans un objet imbriqué
function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[keys[keys.length - 1]] = value;
}

let totalUpdated = 0;
let totalErrors = 0;

// Traiter chaque langue
languages.forEach(lang => {
  const filePath = path.join(__dirname, 'public', 'locales', lang, 'profile.json');
  
  try {
    // Lire le fichier existant
    let data = {};
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      data = JSON.parse(content);
    }
    
    // Ajouter la section currencies
    const translations = currencyTranslations[lang];
    data.currencies = translations;
    
    // Écrire le fichier mis à jour
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`✅ Mis à jour: ${lang}/profile.json (${Object.keys(translations).length} devises)`);
    totalUpdated++;
    
  } catch (error) {
    console.error(`❌ Erreur pour ${lang}/profile.json:`, error.message);
    totalErrors++;
  }
});

console.log('\n✨ Correction des traductions des devises terminée !');
console.log('\n📊 Résumé:');
console.log(`- ${totalUpdated} fichiers mis à jour`);
console.log(`- ${totalErrors} erreurs`);
console.log(`- ${Object.keys(currencyTranslations.fr).length} devises traduites par langue`);
console.log('\n🔍 Problème corrigé:');
console.log('- Les clés "currencies.*" sont maintenant disponibles dans tous les fichiers profile.json');
console.log('- Le sélecteur de devises affichera maintenant les noms traduits au lieu de "currencies.EUR"');
