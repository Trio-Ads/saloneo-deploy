const fs = require('fs');
const path = require('path');

console.log('🔧 Correction des derniers problèmes d\'internationalisation...\n');

// 1. Corriger ProductsPage - remplacer le texte hardcodé par les traductions
console.log('📝 1. Correction du ProductsPage...');

const productsPagePath = path.join(__dirname, 'src', 'features', 'services', 'ProductsPage.tsx');
let productsContent = fs.readFileSync(productsPagePath, 'utf8');

// Remplacements pour ProductsPage
const productsReplacements = [
  // Titre principal
  { from: 'Gestion des Stocks', to: '{t("products.title")}' },
  { from: 'Gérez vos produits et leurs quantités en stock', to: '{t("products.subtitle")}' },
  
  // Boutons
  { from: 'Ajouter un Produit', to: '{t("products.add_product")}' },
  { from: 'Rapport de Stock', to: '{t("products.stock_report")}' },
  
  // Statistiques
  { from: 'Total Produits', to: '{t("products.stats.total")}' },
  { from: 'Tous les produits', to: '{t("products.stats.all_products")}' },
  { from: 'Unités', to: '{t("products.stats.units")}' },
  { from: 'Types d\'unités', to: '{t("products.stats.unit_types")}' },
  { from: 'Stock Faible', to: '{t("products.stats.low_stock")}' },
  { from: 'Alertes de stock', to: '{t("products.stats.stock_alerts")}' },
  { from: 'Rupture', to: '{t("products.stats.out_of_stock")}' },
  { from: 'Stock épuisé', to: '{t("products.stats.stock_depleted")}' },
  
  // Filtres
  { from: 'Rechercher un produit, description ou unité...', to: '{t("products.search_placeholder")}' },
  { from: 'Masquer', to: '{t("common.hide")}' },
  { from: 'Afficher', to: '{t("common.show")}' },
  { from: 'les filtres', to: '{t("products.filters")}' },
  { from: 'Unité', to: '{t("products.unit")}' },
  { from: 'Toutes les unités', to: '{t("products.all_units")}' },
  { from: 'État du Stock', to: '{t("products.stock_status")}' },
  { from: 'Tous les stocks', to: '{t("products.all_stocks")}' },
  { from: 'Stock disponible', to: '{t("products.available_stock")}' },
  { from: 'Stock faible', to: '{t("products.low_stock")}' },
  { from: 'Rupture de stock', to: '{t("products.out_of_stock")}' },
  { from: 'Réinitialiser', to: '{t("common.reset")}' },
  
  // Messages
  { from: 'Aucun produit trouvé', to: '{t("products.no_products_found")}' },
  { from: 'Aucun produit en stock', to: '{t("products.no_products")}' },
  { from: 'Essayez de modifier vos critères de recherche', to: '{t("products.modify_search")}' },
  { from: 'Commencez par ajouter vos premiers produits', to: '{t("products.add_first_products")}' },
  
  // Alertes
  { from: 'Alertes de Stock', to: '{t("products.stock_alerts")}' },
  { from: 'produit(s) en rupture de stock', to: '{t("products.products_out_of_stock")}' },
  { from: 'produit(s) avec un stock faible', to: '{t("products.products_low_stock")}' },
  
  // Autres
  { from: 'produit(s) trouvé(s)', to: '{t("products.products_found")}' },
  { from: 'pour', to: '{t("common.for")}' },
  { from: 'avec l\'unité', to: '{t("products.with_unit")}' },
  { from: 'avec le filtre', to: '{t("products.with_filter")}' },
  
  // Confirmations
  { from: 'Êtes-vous sûr de vouloir supprimer ce produit ?', to: '{t("products.confirm_delete")}' }
];

// Appliquer les remplacements
productsReplacements.forEach(replacement => {
  // Échapper les caractères spéciaux pour regex
  const escapedFrom = replacement.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`"${escapedFrom}"`, 'g');
  productsContent = productsContent.replace(regex, replacement.to);
});

fs.writeFileSync(productsPagePath, productsContent);
console.log('✅ ProductsPage corrigé');

// 2. Corriger AppointmentList - locale dynamique pour les dates
console.log('\n📝 2. Correction des dates dans AppointmentList...');

const appointmentListPath = path.join(__dirname, 'src', 'features', 'appointments', 'components', 'AppointmentList.tsx');
let appointmentContent = fs.readFileSync(appointmentListPath, 'utf8');

// Ajouter les imports nécessaires pour les locales
const localeImports = `import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { fr, enUS, es, pt, tr } from 'date-fns/locale';`;

// Remplacer l'import existant
appointmentContent = appointmentContent.replace(
  /import { format } from 'date-fns';\nimport { fr } from 'date-fns\/locale';/,
  `import { format } from 'date-fns';
import { fr, enUS, es, pt, tr } from 'date-fns/locale';`
);

// Ajouter la fonction pour obtenir la locale
const getLocaleFunction = `
  // Fonction pour obtenir la locale date-fns basée sur la langue actuelle
  const getDateLocale = () => {
    switch (i18n.language) {
      case 'fr': return fr;
      case 'en': return enUS;
      case 'es': return es;
      case 'pt': return pt;
      case 'tr': return tr;
      case 'ar': return enUS; // Fallback pour l'arabe
      default: return fr; // Fallback par défaut
    }
  };`;

// Ajouter la fonction après la déclaration de useTranslation
appointmentContent = appointmentContent.replace(
  /const { t } = useTranslation\('appointments'\);/,
  `const { t, i18n } = useTranslation('appointments');
${getLocaleFunction}`
);

// Remplacer l'utilisation de la locale fixe
appointmentContent = appointmentContent.replace(
  /return format\(dateObj, 'EEEE d MMMM yyyy', { locale: fr }\);/,
  `return format(dateObj, 'EEEE d MMMM yyyy', { locale: getDateLocale() });`
);

// Corriger le texte hardcodé "Date passée"
appointmentContent = appointmentContent.replace(
  /"Date passée"/g,
  '{t("appointment_list.overdue")}'
);

fs.writeFileSync(appointmentListPath, appointmentContent);
console.log('✅ AppointmentList corrigé');

// 3. Ajouter les traductions manquantes dans les fichiers JSON
console.log('\n📝 3. Ajout des traductions manquantes...');

// Traductions pour products
const productTranslations = {
  fr: {
    products: {
      title: "Gestion des Stocks",
      subtitle: "Gérez vos produits et leurs quantités en stock",
      add_product: "Ajouter un Produit",
      stock_report: "Rapport de Stock",
      stats: {
        total: "Total Produits",
        all_products: "Tous les produits",
        units: "Unités",
        unit_types: "Types d'unités",
        low_stock: "Stock Faible",
        stock_alerts: "Alertes de stock",
        out_of_stock: "Rupture",
        stock_depleted: "Stock épuisé"
      },
      search_placeholder: "Rechercher un produit, description ou unité...",
      filters: "les filtres",
      unit: "Unité",
      all_units: "Toutes les unités",
      stock_status: "État du Stock",
      all_stocks: "Tous les stocks",
      available_stock: "Stock disponible",
      low_stock: "Stock faible",
      no_products_found: "Aucun produit trouvé",
      no_products: "Aucun produit en stock",
      modify_search: "Essayez de modifier vos critères de recherche",
      add_first_products: "Commencez par ajouter vos premiers produits",
      stock_alerts: "Alertes de Stock",
      products_out_of_stock: "produit(s) en rupture de stock",
      products_low_stock: "produit(s) avec un stock faible",
      products_found: "produit(s) trouvé(s)",
      with_unit: "avec l'unité",
      with_filter: "avec le filtre",
      confirm_delete: "Êtes-vous sûr de vouloir supprimer ce produit ?"
    }
  },
  en: {
    products: {
      title: "Stock Management",
      subtitle: "Manage your products and their stock quantities",
      add_product: "Add Product",
      stock_report: "Stock Report",
      stats: {
        total: "Total Products",
        all_products: "All products",
        units: "Units",
        unit_types: "Unit types",
        low_stock: "Low Stock",
        stock_alerts: "Stock alerts",
        out_of_stock: "Out of Stock",
        stock_depleted: "Stock depleted"
      },
      search_placeholder: "Search for a product, description or unit...",
      filters: "filters",
      unit: "Unit",
      all_units: "All units",
      stock_status: "Stock Status",
      all_stocks: "All stocks",
      available_stock: "Available stock",
      low_stock: "Low stock",
      no_products_found: "No products found",
      no_products: "No products in stock",
      modify_search: "Try modifying your search criteria",
      add_first_products: "Start by adding your first products",
      stock_alerts: "Stock Alerts",
      products_out_of_stock: "product(s) out of stock",
      products_low_stock: "product(s) with low stock",
      products_found: "product(s) found",
      with_unit: "with unit",
      with_filter: "with filter",
      confirm_delete: "Are you sure you want to delete this product?"
    }
  },
  ar: {
    products: {
      title: "إدارة المخزون",
      subtitle: "إدارة منتجاتك وكمياتها في المخزون",
      add_product: "إضافة منتج",
      stock_report: "تقرير المخزون",
      stats: {
        total: "إجمالي المنتجات",
        all_products: "جميع المنتجات",
        units: "الوحدات",
        unit_types: "أنواع الوحدات",
        low_stock: "مخزون منخفض",
        stock_alerts: "تنبيهات المخزون",
        out_of_stock: "نفاد المخزون",
        stock_depleted: "المخزون منتهي"
      },
      search_placeholder: "البحث عن منتج أو وصف أو وحدة...",
      filters: "المرشحات",
      unit: "الوحدة",
      all_units: "جميع الوحدات",
      stock_status: "حالة المخزون",
      all_stocks: "جميع المخزونات",
      available_stock: "مخزون متاح",
      low_stock: "مخزون منخفض",
      no_products_found: "لم يتم العثور على منتجات",
      no_products: "لا توجد منتجات في المخزون",
      modify_search: "حاول تعديل معايير البحث",
      add_first_products: "ابدأ بإضافة منتجاتك الأولى",
      stock_alerts: "تنبيهات المخزون",
      products_out_of_stock: "منتج(منتجات) نفد مخزونها",
      products_low_stock: "منتج(منتجات) بمخزون منخفض",
      products_found: "منتج(منتجات) موجود",
      with_unit: "بالوحدة",
      with_filter: "بالمرشح",
      confirm_delete: "هل أنت متأكد من حذف هذا المنتج؟"
    }
  }
};

// Traductions pour appointments (overdue)
const appointmentTranslations = {
  fr: { overdue: "Date passée" },
  en: { overdue: "Overdue" },
  ar: { overdue: "متأخر" },
  es: { overdue: "Vencido" },
  pt: { overdue: "Atrasado" },
  tr: { overdue: "Gecikmiş" }
};

// Ajouter les traductions aux fichiers services.json
['fr', 'en', 'ar'].forEach(lang => {
  const servicesPath = path.join(__dirname, 'public', 'locales', lang, 'services.json');
  if (fs.existsSync(servicesPath)) {
    const services = JSON.parse(fs.readFileSync(servicesPath, 'utf8'));
    services.products = productTranslations[lang].products;
    fs.writeFileSync(servicesPath, JSON.stringify(services, null, 2));
    console.log(`✅ Traductions products ajoutées pour ${lang}`);
  }
});

// Ajouter les traductions aux fichiers appointments.json
['fr', 'en', 'ar', 'es', 'pt', 'tr'].forEach(lang => {
  const appointmentsPath = path.join(__dirname, 'public', 'locales', lang, 'appointments.json');
  if (fs.existsSync(appointmentsPath)) {
    const appointments = JSON.parse(fs.readFileSync(appointmentsPath, 'utf8'));
    if (!appointments.appointment_list) {
      appointments.appointment_list = {};
    }
    appointments.appointment_list.overdue = appointmentTranslations[lang].overdue;
    fs.writeFileSync(appointmentsPath, JSON.stringify(appointments, null, 2));
    console.log(`✅ Traduction overdue ajoutée pour ${lang}`);
  }
});

console.log('\n🎉 Tous les problèmes d\'internationalisation ont été corrigés !');
console.log('\n📋 Résumé des corrections :');
console.log('  1. ✅ ProductsPage - Texte hardcodé remplacé par traductions');
console.log('  2. ✅ AppointmentList - Locale dynamique pour les dates');
console.log('  3. ✅ Traductions ajoutées dans tous les fichiers JSON');
console.log('\n🔧 Prochaine étape : Corriger le LanguageSelector UI/UX');
