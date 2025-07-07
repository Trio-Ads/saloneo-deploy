const fs = require('fs');
const path = require('path');

console.log('🔧 Correction finale des traductions du dashboard...\n');

// Langues à traiter
const languages = ['en', 'ar', 'es', 'pt', 'tr'];

// Nouvelles clés à ajouter avec leurs traductions
const newKeys = {
  en: {
    "components.service_popularity.no_data": "No data available",
    "components.service_popularity.unknown_service": "Unknown service",
    "components.service_popularity.other_category": "Other",
    "components.team_performance.title": "Team Performance",
    "components.team_performance.no_members": "No team members",
    "components.team_performance.completed": "completed"
  },
  ar: {
    "components.service_popularity.no_data": "لا توجد بيانات متاحة",
    "components.service_popularity.unknown_service": "خدمة غير معروفة",
    "components.service_popularity.other_category": "أخرى",
    "components.team_performance.title": "أداء الفريق",
    "components.team_performance.no_members": "لا يوجد أعضاء فريق",
    "components.team_performance.completed": "مكتمل"
  },
  es: {
    "components.service_popularity.no_data": "No hay datos disponibles",
    "components.service_popularity.unknown_service": "Servicio desconocido",
    "components.service_popularity.other_category": "Otro",
    "components.team_performance.title": "Rendimiento del equipo",
    "components.team_performance.no_members": "No hay miembros del equipo",
    "components.team_performance.completed": "completados"
  },
  pt: {
    "components.service_popularity.no_data": "Nenhum dado disponível",
    "components.service_popularity.unknown_service": "Serviço desconhecido",
    "components.service_popularity.other_category": "Outro",
    "components.team_performance.title": "Desempenho da equipe",
    "components.team_performance.no_members": "Nenhum membro da equipe",
    "components.team_performance.completed": "concluídos"
  },
  tr: {
    "components.service_popularity.no_data": "Veri mevcut değil",
    "components.service_popularity.unknown_service": "Bilinmeyen hizmet",
    "components.service_popularity.other_category": "Diğer",
    "components.team_performance.title": "Takım Performansı",
    "components.team_performance.no_members": "Takım üyesi yok",
    "components.team_performance.completed": "tamamlandı"
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

// Traiter chaque langue
languages.forEach(lang => {
  const filePath = path.join(__dirname, 'public', 'locales', lang, 'dashboard.json');
  
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
    console.log(`✅ Mis à jour: ${lang}/dashboard.json`);
    
  } catch (error) {
    console.error(`❌ Erreur pour ${lang}:`, error.message);
  }
});

console.log('\n✨ Correction finale des traductions du dashboard terminée !');
console.log('\n📊 Résumé:');
console.log(`- ${languages.length} langues mises à jour`);
console.log('- Nouvelles clés ajoutées pour ServicePopularityChart et TeamPerformanceWidget');
console.log('- Les erreurs "missingkey" devraient maintenant être complètement corrigées');
