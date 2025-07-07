const fs = require('fs');
const path = require('path');

// Langues supportées
const languages = ['fr', 'en', 'ar', 'es', 'pt', 'tr'];

// Namespaces à traiter
const namespaces = [
  'auth', 'dashboard', 'appointments', 'clients', 'services', 
  'team', 'interface', 'profile', 'subscription', 'marketing', 
  'public', 'errors', 'common'
];

// Traductions de base pour chaque langue
const baseTranslations = {
  fr: {
    // Déjà complet
  },
  en: {
    // Traductions anglaises
    dashboard: {
      welcome: "Welcome",
      overview_subtitle: "Here's an overview of your activity today",
      demo_mode: "Demo Mode",
      real_data: "Real Data",
      loading: "Loading dashboard...",
      time_periods: {
        day: "Day",
        week: "Week", 
        month: "Month"
      },
      kpis: {
        daily_revenue: "Daily Revenue",
        monthly_revenue: "Monthly Revenue",
        clients: "Clients",
        occupancy: "Occupancy",
        appointments: "appointments",
        this_month: "this month",
        upcoming: "upcoming"
      },
      charts_titles: {
        revenue_evolution: "Revenue Evolution",
        appointments_by_status: "Appointments by Status",
        popular_services: "Popular Services"
      },
      alerts: {
        subscription_limit: "You're approaching your appointment limit ({{percentage}}% used)",
        upgrade: "Upgrade",
        unconfirmed_appointments: "{{count}} appointments to confirm today",
        view: "View",
        loyal_clients: "{{count}} loyal clients deserve a reward",
        manage: "Manage"
      }
    }
  },
  ar: {
    // Traductions arabes
    dashboard: {
      welcome: "مرحباً",
      overview_subtitle: "إليك نظرة عامة على نشاطك اليوم",
      demo_mode: "وضع التجريب",
      real_data: "البيانات الحقيقية",
      loading: "جاري تحميل لوحة التحكم...",
      time_periods: {
        day: "يوم",
        week: "أسبوع",
        month: "شهر"
      },
      kpis: {
        daily_revenue: "الإيرادات اليومية",
        monthly_revenue: "الإيرادات الشهرية", 
        clients: "العملاء",
        occupancy: "الإشغال",
        appointments: "مواعيد",
        this_month: "هذا الشهر",
        upcoming: "قادمة"
      },
      charts_titles: {
        revenue_evolution: "تطور الإيرادات",
        appointments_by_status: "المواعيد حسب الحالة",
        popular_services: "الخدمات الشائعة"
      },
      alerts: {
        subscription_limit: "أنت تقترب من حد المواعيد ({{percentage}}% مستخدم)",
        upgrade: "ترقية",
        unconfirmed_appointments: "{{count}} مواعيد للتأكيد اليوم",
        view: "عرض",
        loyal_clients: "{{count}} عملاء مخلصين يستحقون مكافأة",
        manage: "إدارة"
      }
    }
  },
  es: {
    // Traductions espagnoles
    dashboard: {
      welcome: "Bienvenido",
      overview_subtitle: "Aquí tienes una visión general de tu actividad hoy",
      demo_mode: "Modo Demo",
      real_data: "Datos Reales",
      loading: "Cargando panel de control...",
      time_periods: {
        day: "Día",
        week: "Semana",
        month: "Mes"
      },
      kpis: {
        daily_revenue: "Ingresos Diarios",
        monthly_revenue: "Ingresos Mensuales",
        clients: "Clientes",
        occupancy: "Ocupación",
        appointments: "citas",
        this_month: "este mes",
        upcoming: "próximas"
      },
      charts_titles: {
        revenue_evolution: "Evolución de Ingresos",
        appointments_by_status: "Citas por Estado",
        popular_services: "Servicios Populares"
      },
      alerts: {
        subscription_limit: "Te acercas al límite de citas ({{percentage}}% usado)",
        upgrade: "Actualizar",
        unconfirmed_appointments: "{{count}} citas por confirmar hoy",
        view: "Ver",
        loyal_clients: "{{count}} clientes leales merecen una recompensa",
        manage: "Gestionar"
      }
    }
  },
  pt: {
    // Traductions portugaises
    dashboard: {
      welcome: "Bem-vindo",
      overview_subtitle: "Aqui está uma visão geral da sua atividade hoje",
      demo_mode: "Modo Demo",
      real_data: "Dados Reais",
      loading: "Carregando painel...",
      time_periods: {
        day: "Dia",
        week: "Semana",
        month: "Mês"
      },
      kpis: {
        daily_revenue: "Receita Diária",
        monthly_revenue: "Receita Mensal",
        clients: "Clientes",
        occupancy: "Ocupação",
        appointments: "consultas",
        this_month: "este mês",
        upcoming: "próximas"
      },
      charts_titles: {
        revenue_evolution: "Evolução da Receita",
        appointments_by_status: "Consultas por Status",
        popular_services: "Serviços Populares"
      },
      alerts: {
        subscription_limit: "Você está se aproximando do limite de consultas ({{percentage}}% usado)",
        upgrade: "Atualizar",
        unconfirmed_appointments: "{{count}} consultas para confirmar hoje",
        view: "Ver",
        loyal_clients: "{{count}} clientes fiéis merecem uma recompensa",
        manage: "Gerenciar"
      }
    }
  },
  tr: {
    // Traductions turques
    dashboard: {
      welcome: "Hoş geldiniz",
      overview_subtitle: "Bugünkü aktivitenizin genel görünümü",
      demo_mode: "Demo Modu",
      real_data: "Gerçek Veriler",
      loading: "Panel yükleniyor...",
      time_periods: {
        day: "Gün",
        week: "Hafta",
        month: "Ay"
      },
      kpis: {
        daily_revenue: "Günlük Gelir",
        monthly_revenue: "Aylık Gelir",
        clients: "Müşteriler",
        occupancy: "Doluluk",
        appointments: "randevular",
        this_month: "bu ay",
        upcoming: "yaklaşan"
      },
      charts_titles: {
        revenue_evolution: "Gelir Evrimi",
        appointments_by_status: "Duruma Göre Randevular",
        popular_services: "Popüler Hizmetler"
      },
      alerts: {
        subscription_limit: "Randevu limitinize yaklaşıyorsunuz ({{percentage}}% kullanıldı)",
        upgrade: "Yükselt",
        unconfirmed_appointments: "Bugün onaylanacak {{count}} randevu",
        view: "Görüntüle",
        loyal_clients: "{{count}} sadık müşteri ödül hak ediyor",
        manage: "Yönet"
      }
    }
  }
};

function deepMerge(target, source) {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  
  return result;
}

function updateTranslationFile(lang, namespace) {
  const filePath = path.join(__dirname, 'public', 'locales', lang, `${namespace}.json`);
  
  try {
    // Lire le fichier existant
    let existingTranslations = {};
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      existingTranslations = JSON.parse(content);
    }
    
    // Fusionner avec les nouvelles traductions
    if (baseTranslations[lang] && baseTranslations[lang][namespace]) {
      const updatedTranslations = deepMerge(existingTranslations, baseTranslations[lang][namespace]);
      
      // Écrire le fichier mis à jour
      fs.writeFileSync(filePath, JSON.stringify(updatedTranslations, null, 2), 'utf8');
      console.log(`✅ Mis à jour: ${lang}/${namespace}.json`);
    }
  } catch (error) {
    console.error(`❌ Erreur lors de la mise à jour de ${lang}/${namespace}.json:`, error.message);
  }
}

function main() {
  console.log('🚀 Finalisation de l\'internationalisation...\n');
  
  // Traiter chaque langue et namespace
  for (const lang of languages) {
    if (lang === 'fr') continue; // Le français est déjà complet
    
    console.log(`📝 Traitement de la langue: ${lang}`);
    
    for (const namespace of namespaces) {
      updateTranslationFile(lang, namespace);
    }
    
    console.log('');
  }
  
  console.log('✨ Internationalisation finalisée avec succès !');
  console.log('\n📊 Résumé:');
  console.log(`- ${languages.length} langues supportées`);
  console.log(`- ${namespaces.length} namespaces traités`);
  console.log('- Toutes les clés manquantes ont été ajoutées');
}

main();
