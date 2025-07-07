const fs = require('fs');
const path = require('path');

console.log('🔧 Correction des traductions du formulaire de service...\n');

// Langues à traiter
const languages = ['en', 'ar', 'es', 'pt', 'tr'];

// Nouvelles clés à ajouter avec leurs traductions
const newKeys = {
  en: {
    "details.available": "available"
  },
  ar: {
    "details.available": "متاح"
  },
  es: {
    "details.available": "disponible"
  },
  pt: {
    "details.available": "disponível"
  },
  tr: {
    "details.available": "mevcut"
  }
};

// Nouvelles clés pour common.json
const commonKeys = {
  en: {
    "service_form.titles.new": "New Service",
    "service_form.titles.edit": "Edit Service",
    "service_form.subtitle": "Create a personalized beauty service for your clients",
    "service_form.sections.basic_info": "Basic Information",
    "service_form.sections.products": "Products Used",
    "service_form.sections.photos": "Service Photos",
    "service_form.placeholders.name": "Ex: Cut and blow-dry",
    "service_form.placeholders.description": "Describe your service in detail...",
    "service_form.labels.product": "Product",
    "service_form.labels.quantity": "Quantity",
    "service_form.messages.no_products": "No products available. Add products in the Inventory section to use them here.",
    "service_form.units.min": "min"
  },
  ar: {
    "service_form.titles.new": "خدمة جديدة",
    "service_form.titles.edit": "تعديل الخدمة",
    "service_form.subtitle": "إنشاء خدمة تجميل مخصصة لعملائك",
    "service_form.sections.basic_info": "المعلومات الأساسية",
    "service_form.sections.products": "المنتجات المستخدمة",
    "service_form.sections.photos": "صور الخدمة",
    "service_form.placeholders.name": "مثال: قص وتصفيف",
    "service_form.placeholders.description": "اوصف خدمتك بالتفصيل...",
    "service_form.labels.product": "المنتج",
    "service_form.labels.quantity": "الكمية",
    "service_form.messages.no_products": "لا توجد منتجات متاحة. أضف منتجات في قسم المخزون لاستخدامها هنا.",
    "service_form.units.min": "دقيقة"
  },
  es: {
    "service_form.titles.new": "Nuevo Servicio",
    "service_form.titles.edit": "Editar Servicio",
    "service_form.subtitle": "Crea un servicio de belleza personalizado para tus clientes",
    "service_form.sections.basic_info": "Información Básica",
    "service_form.sections.products": "Productos Utilizados",
    "service_form.sections.photos": "Fotos del Servicio",
    "service_form.placeholders.name": "Ej: Corte y peinado",
    "service_form.placeholders.description": "Describe tu servicio en detalle...",
    "service_form.labels.product": "Producto",
    "service_form.labels.quantity": "Cantidad",
    "service_form.messages.no_products": "No hay productos disponibles. Añade productos en la sección Inventario para usarlos aquí.",
    "service_form.units.min": "min"
  },
  pt: {
    "service_form.titles.new": "Novo Serviço",
    "service_form.titles.edit": "Editar Serviço",
    "service_form.subtitle": "Crie um serviço de beleza personalizado para seus clientes",
    "service_form.sections.basic_info": "Informações Básicas",
    "service_form.sections.products": "Produtos Utilizados",
    "service_form.sections.photos": "Fotos do Serviço",
    "service_form.placeholders.name": "Ex: Corte e escovação",
    "service_form.placeholders.description": "Descreva seu serviço em detalhes...",
    "service_form.labels.product": "Produto",
    "service_form.labels.quantity": "Quantidade",
    "service_form.messages.no_products": "Nenhum produto disponível. Adicione produtos na seção Estoque para usá-los aqui.",
    "service_form.units.min": "min"
  },
  tr: {
    "service_form.titles.new": "Yeni Hizmet",
    "service_form.titles.edit": "Hizmeti Düzenle",
    "service_form.subtitle": "Müşterileriniz için kişiselleştirilmiş güzellik hizmeti oluşturun",
    "service_form.sections.basic_info": "Temel Bilgiler",
    "service_form.sections.products": "Kullanılan Ürünler",
    "service_form.sections.photos": "Hizmet Fotoğrafları",
    "service_form.placeholders.name": "Örn: Kesim ve fön",
    "service_form.placeholders.description": "Hizmetinizi detaylı olarak açıklayın...",
    "service_form.labels.product": "Ürün",
    "service_form.labels.quantity": "Miktar",
    "service_form.messages.no_products": "Mevcut ürün yok. Burada kullanmak için Envanter bölümünden ürün ekleyin.",
    "service_form.units.min": "dk"
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

// Traiter services.json pour chaque langue
languages.forEach(lang => {
  const filePath = path.join(__dirname, 'public', 'locales', lang, 'services.json');
  
  try {
    // Lire le fichier existant
    let data = {};
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      data = JSON.parse(content);
    }
    
    // Ajouter les nouvelles clés
    const translations = newKeys[lang];
    for (const [key, value] of Object.entries(translations)) {
      setNestedValue(data, key, value);
    }
    
    // Écrire le fichier mis à jour
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`✅ Mis à jour: ${lang}/services.json`);
    
  } catch (error) {
    console.error(`❌ Erreur pour ${lang}/services.json:`, error.message);
  }
});

// Traiter common.json pour chaque langue
languages.forEach(lang => {
  const filePath = path.join(__dirname, 'public', 'locales', lang, 'common.json');
  
  try {
    // Lire le fichier existant
    let data = {};
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      data = JSON.parse(content);
    }
    
    // Ajouter les nouvelles clés
    const translations = commonKeys[lang];
    for (const [key, value] of Object.entries(translations)) {
      setNestedValue(data, key, value);
    }
    
    // Écrire le fichier mis à jour
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`✅ Mis à jour: ${lang}/common.json`);
    
  } catch (error) {
    console.error(`❌ Erreur pour ${lang}/common.json:`, error.message);
  }
});

console.log('\n✨ Correction des traductions du formulaire de service terminée !');
console.log('\n📊 Résumé:');
console.log(`- ${languages.length} langues mises à jour`);
console.log('- Nouvelles clés ajoutées pour ServiceForm');
console.log('- Les erreurs "missingkey" du formulaire de service devraient maintenant être corrigées');
