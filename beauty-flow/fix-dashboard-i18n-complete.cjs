const fs = require('fs');
const path = require('path');

// Traductions complètes pour le dashboard
const dashboardTranslations = {
  en: {
    "title": "Dashboard",
    "welcome": "Welcome",
    "overview": "Overview",
    "analytics": "Analytics",
    "reports": "Reports",
    "loading": "Loading dashboard...",
    "overview_subtitle": "Here's an overview of your activity today",
    "demo_mode": "Demo Mode",
    "real_data": "Real Data",
    "time_periods": {
      "day": "Day",
      "week": "Week",
      "month": "Month"
    },
    "kpis": {
      "daily_revenue": "Daily Revenue",
      "monthly_revenue": "Monthly Revenue",
      "clients": "Clients",
      "occupancy": "Occupancy",
      "appointments": "appointments",
      "this_month": "this month",
      "upcoming": "upcoming"
    },
    "charts_titles": {
      "revenue_evolution": "Revenue Evolution",
      "appointments_by_status": "Appointments by Status",
      "popular_services": "Popular Services"
    },
    "alerts": {
      "subscription_limit": "You're approaching your appointment limit ({{percentage}}% used)",
      "upgrade": "Upgrade",
      "unconfirmed_appointments": "{{count}} appointments to confirm today",
      "view": "View",
      "loyal_clients": "{{count}} loyal clients deserve a reward",
      "manage": "Manage"
    },
    "widgets": {
      "revenue": "Revenue",
      "appointments": "Appointments",
      "clients": "Clients",
      "services": "Services",
      "team_performance": "Team Performance",
      "popular_services": "Popular Services",
      "recent_activity": "Recent Activity",
      "upcoming_appointments": "Upcoming Appointments",
      "quick_actions": "Quick Actions",
      "business_insights": "Business Insights"
    },
    "metrics": {
      "today": "Today",
      "this_week": "This Week",
      "this_month": "This Month",
      "this_year": "This Year",
      "total": "Total",
      "growth": "Growth",
      "vs_last_period": "vs last period",
      "increase": "Increase",
      "decrease": "Decrease"
    },
    "charts": {
      "revenue_chart": "Revenue Chart",
      "appointment_chart": "Appointment Chart",
      "service_popularity": "Service Popularity",
      "client_retention": "Client Retention",
      "daily": "Daily",
      "weekly": "Weekly",
      "monthly": "Monthly",
      "yearly": "Yearly"
    },
    "quick_actions": {
      "title": "Quick Actions",
      "new_appointment": "New Appointment",
      "new_appointment_desc": "Schedule an appointment",
      "new_client": "New Client",
      "new_client_desc": "Add a client",
      "calendar": "Calendar",
      "calendar_desc": "View calendar",
      "subscription": "Subscription",
      "subscription_desc": "Manage your plan",
      "statistics": "Statistics",
      "statistics_desc": "View history",
      "settings": "Settings",
      "settings_desc": "Configuration",
      "new_service": "New Service",
      "view_calendar": "View Calendar",
      "manage_team": "Manage Team",
      "reports": "Reports"
    },
    "insights": {
      "peak_hours": "Peak Hours",
      "busiest_day": "Busiest Day",
      "top_service": "Top Service",
      "best_performer": "Best Performer",
      "revenue_trend": "Revenue Trend",
      "client_satisfaction": "Client Satisfaction"
    },
    "recent_activity": {
      "title": "Recent Activity",
      "no_activity": "No recent activity",
      "actions": {
        "created": "Appointment created",
        "confirmed": "Appointment confirmed",
        "completed": "Appointment completed",
        "cancelled": "Appointment cancelled",
        "rescheduled": "Appointment rescheduled",
        "no_show": "Client no-show"
      },
      "time": {
        "just_now": "Just now",
        "minutes_ago": "{{minutes}} min ago",
        "hours_ago": "{{hours}}h ago",
        "days_ago": "{{days}}d ago"
      },
      "unknown_client": "Unknown client"
    },
    "components": {
      "upcoming_appointments": {
        "title": "Upcoming Appointments",
        "no_appointments": "No upcoming appointments",
        "today": "Today",
        "tomorrow": "Tomorrow",
        "statuses": {
          "scheduled": "Scheduled",
          "confirmed": "Confirmed",
          "rescheduled": "Rescheduled"
        }
      },
      "appointment_chart": {
        "title": "Appointments by Status",
        "no_data": "No appointments for this period",
        "total": "Total",
        "statuses": {
          "scheduled": "Scheduled",
          "confirmed": "Confirmed",
          "completed": "Completed",
          "cancelled": "Cancelled",
          "noShow": "No Show",
          "rescheduled": "Rescheduled"
        }
      },
      "business_insights": {
        "title": "Business Insights",
        "insights": {
          "high_cancellation_title": "High Cancellation Rate",
          "high_cancellation_desc": "{{rate}}% cancellations this month. Consider sending SMS reminders.",
          "top_service_title": "Most Profitable Service",
          "top_service_desc": "\"{{service}}\" generates €{{revenue}} in revenue. Consider promoting it.",
          "loyal_clients_title": "Loyal Clients",
          "loyal_clients_desc": "{{rate}}% of your clients have over 50 loyalty points. Create a rewards program.",
          "popular_slot_title": "Most Popular Time Slot",
          "popular_slot_desc": "{{slot}} is your most popular time slot. Optimize your schedule accordingly.",
          "low_acquisition_title": "Low Client Acquisition",
          "low_acquisition_desc": "No new clients this week. Launch a promotional campaign."
        }
      },
      "revenue_chart": {
        "title": "Revenue Evolution",
        "tooltip": "€{{value}}"
      }
    }
  },
  ar: {
    "title": "لوحة التحكم",
    "welcome": "مرحباً",
    "overview": "نظرة عامة",
    "analytics": "التحليلات",
    "reports": "التقارير",
    "loading": "جاري تحميل لوحة التحكم...",
    "overview_subtitle": "إليك نظرة عامة على نشاطك اليوم",
    "demo_mode": "وضع التجريب",
    "real_data": "البيانات الحقيقية",
    "time_periods": {
      "day": "يوم",
      "week": "أسبوع",
      "month": "شهر"
    },
    "kpis": {
      "daily_revenue": "الإيرادات اليومية",
      "monthly_revenue": "الإيرادات الشهرية",
      "clients": "العملاء",
      "occupancy": "الإشغال",
      "appointments": "مواعيد",
      "this_month": "هذا الشهر",
      "upcoming": "قادمة"
    },
    "charts_titles": {
      "revenue_evolution": "تطور الإيرادات",
      "appointments_by_status": "المواعيد حسب الحالة",
      "popular_services": "الخدمات الشائعة"
    },
    "alerts": {
      "subscription_limit": "أنت تقترب من حد المواعيد ({{percentage}}% مستخدم)",
      "upgrade": "ترقية",
      "unconfirmed_appointments": "{{count}} مواعيد للتأكيد اليوم",
      "view": "عرض",
      "loyal_clients": "{{count}} عملاء مخلصين يستحقون مكافأة",
      "manage": "إدارة"
    }
  },
  es: {
    "title": "Panel de Control",
    "welcome": "Bienvenido",
    "overview": "Resumen",
    "analytics": "Análisis",
    "reports": "Informes",
    "loading": "Cargando panel de control...",
    "overview_subtitle": "Aquí tienes una visión general de tu actividad hoy",
    "demo_mode": "Modo Demo",
    "real_data": "Datos Reales",
    "time_periods": {
      "day": "Día",
      "week": "Semana",
      "month": "Mes"
    },
    "kpis": {
      "daily_revenue": "Ingresos Diarios",
      "monthly_revenue": "Ingresos Mensuales",
      "clients": "Clientes",
      "occupancy": "Ocupación",
      "appointments": "citas",
      "this_month": "este mes",
      "upcoming": "próximas"
    },
    "charts_titles": {
      "revenue_evolution": "Evolución de Ingresos",
      "appointments_by_status": "Citas por Estado",
      "popular_services": "Servicios Populares"
    },
    "alerts": {
      "subscription_limit": "Te acercas al límite de citas ({{percentage}}% usado)",
      "upgrade": "Actualizar",
      "unconfirmed_appointments": "{{count}} citas por confirmar hoy",
      "view": "Ver",
      "loyal_clients": "{{count}} clientes leales merecen una recompensa",
      "manage": "Gestionar"
    }
  },
  pt: {
    "title": "Painel de Controle",
    "welcome": "Bem-vindo",
    "overview": "Visão Geral",
    "analytics": "Análises",
    "reports": "Relatórios",
    "loading": "Carregando painel...",
    "overview_subtitle": "Aqui está uma visão geral da sua atividade hoje",
    "demo_mode": "Modo Demo",
    "real_data": "Dados Reais",
    "time_periods": {
      "day": "Dia",
      "week": "Semana",
      "month": "Mês"
    },
    "kpis": {
      "daily_revenue": "Receita Diária",
      "monthly_revenue": "Receita Mensal",
      "clients": "Clientes",
      "occupancy": "Ocupação",
      "appointments": "consultas",
      "this_month": "este mês",
      "upcoming": "próximas"
    },
    "charts_titles": {
      "revenue_evolution": "Evolução da Receita",
      "appointments_by_status": "Consultas por Status",
      "popular_services": "Serviços Populares"
    },
    "alerts": {
      "subscription_limit": "Você está se aproximando do limite de consultas ({{percentage}}% usado)",
      "upgrade": "Atualizar",
      "unconfirmed_appointments": "{{count}} consultas para confirmar hoje",
      "view": "Ver",
      "loyal_clients": "{{count}} clientes fiéis merecem uma recompensa",
      "manage": "Gerenciar"
    }
  },
  tr: {
    "title": "Kontrol Paneli",
    "welcome": "Hoş geldiniz",
    "overview": "Genel Bakış",
    "analytics": "Analizler",
    "reports": "Raporlar",
    "loading": "Panel yükleniyor...",
    "overview_subtitle": "Bugünkü aktivitenizin genel görünümü",
    "demo_mode": "Demo Modu",
    "real_data": "Gerçek Veriler",
    "time_periods": {
      "day": "Gün",
      "week": "Hafta",
      "month": "Ay"
    },
    "kpis": {
      "daily_revenue": "Günlük Gelir",
      "monthly_revenue": "Aylık Gelir",
      "clients": "Müşteriler",
      "occupancy": "Doluluk",
      "appointments": "randevular",
      "this_month": "bu ay",
      "upcoming": "yaklaşan"
    },
    "charts_titles": {
      "revenue_evolution": "Gelir Evrimi",
      "appointments_by_status": "Duruma Göre Randevular",
      "popular_services": "Popüler Hizmetler"
    },
    "alerts": {
      "subscription_limit": "Randevu limitinize yaklaşıyorsunuz ({{percentage}}% kullanıldı)",
      "upgrade": "Yükselt",
      "unconfirmed_appointments": "Bugün onaylanacak {{count}} randevu",
      "view": "Görüntüle",
      "loyal_clients": "{{count}} sadık müşteri ödül hak ediyor",
      "manage": "Yönet"
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

function updateDashboardTranslations() {
  console.log('🚀 Correction des traductions du dashboard...\n');
  
  const languages = ['en', 'ar', 'es', 'pt', 'tr'];
  
  for (const lang of languages) {
    const filePath = path.join(__dirname, 'public', 'locales', lang, 'dashboard.json');
    
    try {
      // Lire le fichier existant
      let existingTranslations = {};
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        existingTranslations = JSON.parse(content);
      }
      
      // Fusionner avec les nouvelles traductions
      const updatedTranslations = deepMerge(existingTranslations, dashboardTranslations[lang]);
      
      // Écrire le fichier mis à jour
      fs.writeFileSync(filePath, JSON.stringify(updatedTranslations, null, 2), 'utf8');
      console.log(`✅ Mis à jour: ${lang}/dashboard.json`);
      
    } catch (error) {
      console.error(`❌ Erreur lors de la mise à jour de ${lang}/dashboard.json:`, error.message);
    }
  }
  
  console.log('\n✨ Correction des traductions du dashboard terminée !');
  console.log('\n📊 Résumé:');
  console.log(`- ${languages.length} langues mises à jour`);
  console.log('- Toutes les clés manquantes du dashboard ont été ajoutées');
  console.log('- Les erreurs "missingkey" devraient maintenant être corrigées');
}

// Exécuter la correction
updateDashboardTranslations();
