const fs = require('fs');
const path = require('path');

console.log('🔧 Finalisation complète des traductions du dashboard...\n');

// Langues à traiter
const languages = ['es', 'pt', 'tr'];

// Toutes les clés manquantes avec leurs traductions
const allMissingKeys = {
  es: {
    // Clés des composants existantes
    "components.upcoming_appointments.title": "Próximas citas",
    "components.upcoming_appointments.no_appointments": "No hay citas próximas",
    "components.appointment_chart.no_data": "No hay citas para este período",
    "components.appointment_chart.total": "Total",
    "components.appointment_chart.statuses.scheduled": "Programadas",
    "components.appointment_chart.statuses.confirmed": "Confirmadas",
    "components.appointment_chart.statuses.completed": "Completadas",
    "components.appointment_chart.statuses.cancelled": "Canceladas",
    "components.appointment_chart.statuses.noShow": "No se presentaron",
    "components.appointment_chart.statuses.rescheduled": "Reprogramadas",
    "components.business_insights.title": "Insights de Negocio",
    "components.business_insights.insights.high_cancellation_title": "Alta tasa de cancelación",
    "components.business_insights.insights.high_cancellation_desc": "{{rate}}% de cancelaciones este mes. Considere enviar recordatorios SMS.",
    "components.business_insights.insights.top_service_title": "Servicio más rentable",
    "components.business_insights.insights.top_service_desc": "\"{{service}}\" genera {{revenue}}€ de ingresos. Considere promocionarlo.",
    "components.business_insights.insights.loyal_clients_title": "Clientes leales",
    "components.business_insights.insights.loyal_clients_desc": "{{rate}}% de sus clientes tienen más de 50 puntos de fidelidad. Cree un programa de recompensas.",
    "components.business_insights.insights.popular_slot_title": "Horario más solicitado",
    "components.business_insights.insights.popular_slot_desc": "{{slot}} es su horario más popular. Optimice su programación en consecuencia.",
    "components.business_insights.insights.low_acquisition_title": "Baja adquisición de clientes",
    "components.business_insights.insights.low_acquisition_desc": "Ningún cliente nuevo esta semana. Lance una campaña promocional.",
    "quick_actions.title": "Acciones rápidas",
    "recent_activity.title": "Actividad reciente"
  },
  pt: {
    // Clés des composants existantes
    "components.upcoming_appointments.title": "Próximos agendamentos",
    "components.upcoming_appointments.no_appointments": "Nenhum agendamento próximo",
    "components.appointment_chart.no_data": "Nenhum agendamento para este período",
    "components.appointment_chart.total": "Total",
    "components.appointment_chart.statuses.scheduled": "Agendados",
    "components.appointment_chart.statuses.confirmed": "Confirmados",
    "components.appointment_chart.statuses.completed": "Concluídos",
    "components.appointment_chart.statuses.cancelled": "Cancelados",
    "components.appointment_chart.statuses.noShow": "Não compareceram",
    "components.appointment_chart.statuses.rescheduled": "Reagendados",
    "components.business_insights.title": "Insights de Negócio",
    "components.business_insights.insights.high_cancellation_title": "Alta taxa de cancelamento",
    "components.business_insights.insights.high_cancellation_desc": "{{rate}}% de cancelamentos este mês. Considere enviar lembretes SMS.",
    "components.business_insights.insights.top_service_title": "Serviço mais rentável",
    "components.business_insights.insights.top_service_desc": "\"{{service}}\" gera {{revenue}}€ de receita. Considere promovê-lo.",
    "components.business_insights.insights.loyal_clients_title": "Clientes fiéis",
    "components.business_insights.insights.loyal_clients_desc": "{{rate}}% dos seus clientes têm mais de 50 pontos de fidelidade. Crie um programa de recompensas.",
    "components.business_insights.insights.popular_slot_title": "Horário mais solicitado",
    "components.business_insights.insights.popular_slot_desc": "{{slot}} é seu horário mais popular. Otimize sua programação adequadamente.",
    "components.business_insights.insights.low_acquisition_title": "Baixa aquisição de clientes",
    "components.business_insights.insights.low_acquisition_desc": "Nenhum cliente novo esta semana. Lance uma campanha promocional.",
    "quick_actions.title": "Ações rápidas",
    "recent_activity.title": "Atividade recente"
  },
  tr: {
    // Clés des composants existantes
    "components.upcoming_appointments.title": "Yaklaşan randevular",
    "components.upcoming_appointments.no_appointments": "Yaklaşan randevu yok",
    "components.appointment_chart.no_data": "Bu dönem için randevu yok",
    "components.appointment_chart.total": "Toplam",
    "components.appointment_chart.statuses.scheduled": "Planlanmış",
    "components.appointment_chart.statuses.confirmed": "Onaylanmış",
    "components.appointment_chart.statuses.completed": "Tamamlanmış",
    "components.appointment_chart.statuses.cancelled": "İptal edilmiş",
    "components.appointment_chart.statuses.noShow": "Gelmedi",
    "components.appointment_chart.statuses.rescheduled": "Yeniden planlandı",
    "components.business_insights.title": "İş Öngörüleri",
    "components.business_insights.insights.high_cancellation_title": "Yüksek iptal oranı",
    "components.business_insights.insights.high_cancellation_desc": "Bu ay {{rate}}% iptal. SMS hatırlatıcıları göndermeyi düşünün.",
    "components.business_insights.insights.top_service_title": "En karlı hizmet",
    "components.business_insights.insights.top_service_desc": "\"{{service}}\" {{revenue}}€ gelir sağlıyor. Tanıtmayı düşünün.",
    "components.business_insights.insights.loyal_clients_title": "Sadık müşteriler",
    "components.business_insights.insights.loyal_clients_desc": "Müşterilerinizin {{rate}}%'ının 50'den fazla sadakat puanı var. Ödül programı oluşturun.",
    "components.business_insights.insights.popular_slot_title": "En popüler zaman dilimi",
    "components.business_insights.insights.popular_slot_desc": "{{slot}} en popüler zaman diliminiz. Programınızı buna göre optimize edin.",
    "components.business_insights.insights.low_acquisition_title": "Düşük müşteri kazanımı",
    "components.business_insights.insights.low_acquisition_desc": "Bu hafta yeni müşteri yok. Promosyon kampanyası başlatın.",
    "quick_actions.title": "Hızlı işlemler",
    "recent_activity.title": "Son aktivite"
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
    const translations = allMissingKeys[lang];
    for (const [key, value] of Object.entries(translations)) {
      setNestedValue(data, key, value);
    }
    
    // Écrire le fichier mis à jour
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`✅ Complété: ${lang}/dashboard.json (${Object.keys(translations).length} clés ajoutées)`);
    
  } catch (error) {
    console.error(`❌ Erreur pour ${lang}:`, error.message);
  }
});

console.log('\n✨ Finalisation complète des traductions du dashboard terminée !');
console.log('\n📊 Résumé:');
console.log(`- ${languages.length} langues finalisées`);
console.log('- Toutes les clés manquantes ont été ajoutées');
console.log('- Les erreurs "missingkey" devraient maintenant être complètement éliminées');
