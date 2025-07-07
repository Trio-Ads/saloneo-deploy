const fs = require('fs');
const path = require('path');

// Lire le fichier français de référence
const frDashboardPath = path.join(__dirname, 'public', 'locales', 'fr', 'dashboard.json');
const frDashboard = JSON.parse(fs.readFileSync(frDashboardPath, 'utf8'));

// Traductions complètes pour chaque langue
const translations = {
  en: {
    "title": "Dashboard",
    "welcome": "Welcome",
    "overview": "Overview",
    "analytics": "Analytics",
    "reports": "Reports",
    "loading": "Loading dashboard...",
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
    "widgets": {
      "revenue": "الإيرادات",
      "appointments": "المواعيد",
      "clients": "العملاء",
      "services": "الخدمات",
      "team_performance": "أداء الفريق",
      "popular_services": "الخدمات الشائعة",
      "recent_activity": "النشاط الأخير",
      "upcoming_appointments": "المواعيد القادمة",
      "quick_actions": "الإجراءات السريعة",
      "business_insights": "رؤى الأعمال"
    },
    "metrics": {
      "today": "اليوم",
      "this_week": "هذا الأسبوع",
      "this_month": "هذا الشهر",
      "this_year": "هذا العام",
      "total": "المجموع",
      "growth": "النمو",
      "vs_last_period": "مقابل الفترة السابقة",
      "increase": "زيادة",
      "decrease": "انخفاض"
    },
    "charts": {
      "revenue_chart": "مخطط الإيرادات",
      "appointment_chart": "مخطط المواعيد",
      "service_popularity": "شعبية الخدمات",
      "client_retention": "الاحتفاظ بالعملاء",
      "daily": "يومي",
      "weekly": "أسبوعي",
      "monthly": "شهري",
      "yearly": "سنوي"
    },
    "quick_actions": {
      "title": "الإجراءات السريعة",
      "new_appointment": "موعد جديد",
      "new_appointment_desc": "جدولة موعد",
      "new_client": "عميل جديد",
      "new_client_desc": "إضافة عميل",
      "calendar": "التقويم",
      "calendar_desc": "عرض التقويم",
      "subscription": "الاشتراك",
      "subscription_desc": "إدارة خطتك",
      "statistics": "الإحصائيات",
      "statistics_desc": "عرض التاريخ",
      "settings": "الإعدادات",
      "settings_desc": "التكوين",
      "new_service": "خدمة جديدة",
      "view_calendar": "عرض التقويم",
      "manage_team": "إدارة الفريق",
      "reports": "التقارير"
    },
    "insights": {
      "peak_hours": "ساعات الذروة",
      "busiest_day": "أكثر الأيام ازدحاماً",
      "top_service": "أفضل خدمة",
      "best_performer": "أفضل أداء",
      "revenue_trend": "اتجاه الإيرادات",
      "client_satisfaction": "رضا العملاء"
    },
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
    },
    "recent_activity": {
      "title": "النشاط الأخير",
      "no_activity": "لا يوجد نشاط حديث",
      "actions": {
        "created": "تم إنشاء موعد",
        "confirmed": "تم تأكيد الموعد",
        "completed": "تم إكمال الموعد",
        "cancelled": "تم إلغاء الموعد",
        "rescheduled": "تم إعادة جدولة الموعد",
        "no_show": "لم يحضر العميل"
      },
      "time": {
        "just_now": "الآن",
        "minutes_ago": "منذ {{minutes}} دقيقة",
        "hours_ago": "منذ {{hours}} ساعة",
        "days_ago": "منذ {{days}} يوم"
      },
      "unknown_client": "عميل غير معروف"
    },
    "components": {
      "upcoming_appointments": {
        "title": "المواعيد القادمة",
        "no_appointments": "لا توجد مواعيد قادمة",
        "today": "اليوم",
        "tomorrow": "غداً",
        "statuses": {
          "scheduled": "مجدول",
          "confirmed": "مؤكد",
          "rescheduled": "معاد الجدولة"
        }
      },
      "appointment_chart": {
        "title": "المواعيد حسب الحالة",
        "no_data": "لا توجد مواعيد لهذه الفترة",
        "total": "المجموع",
        "statuses": {
          "scheduled": "مجدولة",
          "confirmed": "مؤكدة",
          "completed": "مكتملة",
          "cancelled": "ملغاة",
          "noShow": "لم يحضر",
          "rescheduled": "معادة الجدولة"
        }
      },
      "business_insights": {
        "title": "رؤى الأعمال",
        "insights": {
          "high_cancellation_title": "معدل إلغاء مرتفع",
          "high_cancellation_desc": "{{rate}}% إلغاءات هذا الشهر. فكر في إرسال تذكيرات SMS.",
          "top_service_title": "الخدمة الأكثر ربحية",
          "top_service_desc": "\"{{service}}\" تحقق {{revenue}}€ من الإيرادات. فكر في الترويج لها.",
          "loyal_clients_title": "العملاء المخلصون",
          "loyal_clients_desc": "{{rate}}% من عملائك لديهم أكثر من 50 نقطة ولاء. أنشئ برنامج مكافآت.",
          "popular_slot_title": "الفترة الزمنية الأكثر شعبية",
          "popular_slot_desc": "{{slot}} هي فترتك الزمنية الأكثر شعبية. حسن جدولك وفقاً لذلك.",
          "low_acquisition_title": "اكتساب عملاء منخفض",
          "low_acquisition_desc": "لا يوجد عملاء جدد هذا الأسبوع. أطلق حملة ترويجية."
        }
      },
      "revenue_chart": {
        "title": "تطور الإيرادات",
        "tooltip": "{{value}}€"
      }
    }
  },
  es: {
    "title": "Panel de Control",
    "welcome": "Bienvenido",
    "overview": "Resumen",
    "analytics": "Análisis",
    "reports": "Informes",
    "loading": "Cargando panel de control...",
    "widgets": {
      "revenue": "Ingresos",
      "appointments": "Citas",
      "clients": "Clientes",
      "services": "Servicios",
      "team_performance": "Rendimiento del Equipo",
      "popular_services": "Servicios Populares",
      "recent_activity": "Actividad Reciente",
      "upcoming_appointments": "Próximas Citas",
      "quick_actions": "Acciones Rápidas",
      "business_insights": "Insights de Negocio"
    },
    "metrics": {
      "today": "Hoy",
      "this_week": "Esta Semana",
      "this_month": "Este Mes",
      "this_year": "Este Año",
      "total": "Total",
      "growth": "Crecimiento",
      "vs_last_period": "vs período anterior",
      "increase": "Aumento",
      "decrease": "Disminución"
    },
    "charts": {
      "revenue_chart": "Gráfico de Ingresos",
      "appointment_chart": "Gráfico de Citas",
      "service_popularity": "Popularidad de Servicios",
      "client_retention": "Retención de Clientes",
      "daily": "Diario",
      "weekly": "Semanal",
      "monthly": "Mensual",
      "yearly": "Anual"
    },
    "quick_actions": {
      "title": "Acciones Rápidas",
      "new_appointment": "Nueva Cita",
      "new_appointment_desc": "Programar una cita",
      "new_client": "Nuevo Cliente",
      "new_client_desc": "Agregar un cliente",
      "calendar": "Calendario",
      "calendar_desc": "Ver calendario",
      "subscription": "Suscripción",
      "subscription_desc": "Gestionar tu plan",
      "statistics": "Estadísticas",
      "statistics_desc": "Ver historial",
      "settings": "Configuración",
      "settings_desc": "Configuración",
      "new_service": "Nuevo Servicio",
      "view_calendar": "Ver Calendario",
      "manage_team": "Gestionar Equipo",
      "reports": "Informes"
    },
    "insights": {
      "peak_hours": "Horas Pico",
      "busiest_day": "Día Más Ocupado",
      "top_service": "Servicio Principal",
      "best_performer": "Mejor Rendimiento",
      "revenue_trend": "Tendencia de Ingresos",
      "client_satisfaction": "Satisfacción del Cliente"
    },
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
    },
    "recent_activity": {
      "title": "Actividad Reciente",
      "no_activity": "Sin actividad reciente",
      "actions": {
        "created": "Cita creada",
        "confirmed": "Cita confirmada",
        "completed": "Cita completada",
        "cancelled": "Cita cancelada",
        "rescheduled": "Cita reprogramada",
        "no_show": "Cliente no se presentó"
      },
      "time": {
        "just_now": "Ahora mismo",
        "minutes_ago": "Hace {{minutes}} min",
        "hours_ago": "Hace {{hours}}h",
        "days_ago": "Hace {{days}}d"
      },
      "unknown_client": "Cliente desconocido"
    },
    "components": {
      "upcoming_appointments": {
        "title": "Próximas Citas",
        "no_appointments": "No hay citas próximas",
        "today": "Hoy",
        "tomorrow": "Mañana",
        "statuses": {
          "scheduled": "Programada",
          "confirmed": "Confirmada",
          "rescheduled": "Reprogramada"
        }
      },
      "appointment_chart": {
        "title": "Citas por Estado",
        "no_data": "No hay citas para este período",
        "total": "Total",
        "statuses": {
          "scheduled": "Programadas",
          "confirmed": "Confirmadas",
          "completed": "Completadas",
          "cancelled": "Canceladas",
          "noShow": "No se presentó",
          "rescheduled": "Reprogramadas"
        }
      },
      "business_insights": {
        "title": "Insights de Negocio",
        "insights": {
          "high_cancellation_title": "Alta Tasa de Cancelación",
          "high_cancellation_desc": "{{rate}}% cancelaciones este mes. Considera enviar recordatorios SMS.",
          "top_service_title": "Servicio Más Rentable",
          "top_service_desc": "\"{{service}}\" genera €{{revenue}} en ingresos. Considera promocionarlo.",
          "loyal_clients_title": "Clientes Leales",
          "loyal_clients_desc": "{{rate}}% de tus clientes tienen más de 50 puntos de lealtad. Crea un programa de recompensas.",
          "popular_slot_title": "Horario Más Popular",
          "popular_slot_desc": "{{slot}} es tu horario más popular. Optimiza tu horario en consecuencia.",
          "low_acquisition_title": "Baja Adquisición de Clientes",
          "low_acquisition_desc": "No hay nuevos clientes esta semana. Lanza una campaña promocional."
        }
      },
      "revenue_chart": {
        "title": "Evolución de Ingresos",
        "tooltip": "€{{value}}"
      }
    }
  },
  pt: {
    "title": "Painel de Controle",
    "welcome": "Bem-vindo",
    "overview": "Visão Geral",
    "analytics": "Análises",
    "reports": "Relatórios",
    "loading": "Carregando painel...",
    "widgets": {
      "revenue": "Receita",
      "appointments": "Consultas",
      "clients": "Clientes",
      "services": "Serviços",
      "team_performance": "Desempenho da Equipe",
      "popular_services": "Serviços Populares",
      "recent_activity": "Atividade Recente",
      "upcoming_appointments": "Próximas Consultas",
      "quick_actions": "Ações Rápidas",
      "business_insights": "Insights de Negócio"
    },
    "metrics": {
      "today": "Hoje",
      "this_week": "Esta Semana",
      "this_month": "Este Mês",
      "this_year": "Este Ano",
      "total": "Total",
      "growth": "Crescimento",
      "vs_last_period": "vs período anterior",
      "increase": "Aumento",
      "decrease": "Diminuição"
    },
    "charts": {
      "revenue_chart": "Gráfico de Receita",
      "appointment_chart": "Gráfico de Consultas",
      "service_popularity": "Popularidade dos Serviços",
      "client_retention": "Retenção de Clientes",
      "daily": "Diário",
      "weekly": "Semanal",
      "monthly": "Mensal",
      "yearly": "Anual"
    },
    "quick_actions": {
      "title": "Ações Rápidas",
      "new_appointment": "Nova Consulta",
      "new_appointment_desc": "Agendar uma consulta",
      "new_client": "Novo Cliente",
      "new_client_desc": "Adicionar um cliente",
      "calendar": "Calendário",
      "calendar_desc": "Ver calendário",
      "subscription": "Assinatura",
      "subscription_desc": "Gerenciar seu plano",
      "statistics": "Estatísticas",
      "statistics_desc": "Ver histórico",
      "settings": "Configurações",
      "settings_desc": "Configuração",
      "new_service": "Novo Serviço",
      "view_calendar": "Ver Calendário",
      "manage_team": "Gerenciar Equipe",
      "reports": "Relatórios"
    },
    "insights": {
      "peak_hours": "Horários de Pico",
      "busiest_day": "Dia Mais Movimentado",
      "top_service": "Serviço Principal",
      "best_performer": "Melhor Desempenho",
      "revenue_trend": "Tendência de Receita",
      "client_satisfaction": "Satisfação do Cliente"
    },
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
    },
    "recent_activity": {
      "title": "Atividade Recente",
      "no_activity": "Nenhuma atividade recente",
      "actions": {
        "created": "Consulta criada",
        "confirmed": "Consulta confirmada",
        "completed": "Consulta concluída",
        "cancelled": "Consulta cancelada",
        "rescheduled": "Consulta reagendada",
        "no_show": "Cliente não compareceu"
      },
      "time": {
        "just_now": "Agora mesmo",
        "minutes_ago": "{{minutes}} min atrás",
        "hours_ago": "{{hours}}h atrás",
        "days_ago": "{{days}}d atrás"
      },
      "unknown_client": "Cliente desconhecido"
    },
    "components": {
      "upcoming_appointments": {
        "title": "Próximas Consultas",
        "no_appointments": "Nenhuma consulta próxima",
        "today": "Hoje",
        "tomorrow": "Amanhã",
        "statuses": {
          "scheduled": "Agendada",
          "confirmed": "Confirmada",
          "rescheduled": "Reagendada"
        }
      },
      "appointment_chart": {
        "title": "Consultas por Status",
        "no_data": "Nenhuma consulta para este período",
        "total": "Total",
        "statuses": {
          "scheduled": "Agendadas",
          "confirmed": "Confirmadas",
          "completed": "Concluídas",
          "cancelled": "Canceladas",
          "noShow": "Não compareceu",
          "rescheduled": "Reagendadas"
        }
      },
      "business_insights": {
        "title": "Insights de Negócio",
        "insights": {
          "high_cancellation_title": "Alta Taxa de Cancelamento",
          "high_cancellation_desc": "{{rate}}% cancelamentos este mês. Considere enviar lembretes SMS.",
          "top_service_title": "Serviço Mais Rentável",
          "top_service_desc": "\"{{service}}\" gera €{{revenue}} em receita. Considere promovê-lo.",
          "loyal_clients_title": "Clientes Fiéis",
          "loyal_clients_desc": "{{rate}}% dos seus clientes têm mais de 50 pontos de fidelidade. Crie um programa de recompensas.",
          "popular_slot_title": "Horário Mais Popular",
          "popular_slot_desc": "{{slot}} é seu horário mais popular. Otimize sua agenda adequadamente.",
          "low_acquisition_title": "Baixa Aquisição de Clientes",
          "low_acquisition_desc": "Nenhum novo cliente esta semana. Lance uma campanha promocional."
        }
      },
      "revenue_chart": {
        "title": "Evolução da Receita",
        "tooltip": "€{{value}}"
      }
    }
  },
  tr: {
    "title": "Kontrol Paneli",
    "welcome": "Hoş geldiniz",
    "overview": "Genel Bakış",
    "analytics": "Analizler",
    "reports": "Raporlar",
    "loading": "Panel yükleniyor...",
    "widgets": {
      "revenue": "Gelir",
      "appointments": "Randevular",
      "clients": "Müşteriler",
      "services": "Hizmetler",
      "team_performance": "Takım Performansı",
      "popular_services": "Popüler Hizmetler",
      "recent_activity": "Son Aktivite",
      "upcoming_appointments": "Yaklaşan Randevular",
      "quick_actions": "Hızlı İşlemler",
      "business_insights": "İş Görüşleri
