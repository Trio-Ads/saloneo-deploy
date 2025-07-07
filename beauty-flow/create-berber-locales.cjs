const fs = require('fs');
const path = require('path');

console.log('🏴 CRÉATION DES TRADUCTIONS BERBÈRES (KABYLE) POUR SALONEO');
console.log('============================================================\n');

// Créer le dossier ber s'il n'existe pas
const berberDir = 'public/locales/ber';
if (!fs.existsSync(berberDir)) {
  fs.mkdirSync(berberDir, { recursive: true });
  console.log('✅ Dossier public/locales/ber créé');
}

// 1. AUTH.JSON - Authentification
console.log('\n📋 CRÉATION DES FICHIERS JSON BERBÈRES');
console.log('------------------------------------------------------------');

const authTranslations = {
  "login": {
    "title": "Kcem",
    "email": "Imayl",
    "password": "Awal uffir",
    "submit": "Kcem",
    "forgotPassword": "Tettuḍ awal uffir?",
    "noAccount": "Ur tesɛiḍ ara amiḍan?",
    "createAccount": "Rnu amiḍan"
  },
  "register": {
    "title": "Rnu amiḍan",
    "firstName": "Isem amezwaru",
    "lastName": "Isem n tawacult",
    "email": "Imayl",
    "password": "Awal uffir",
    "confirmPassword": "Sentem awal uffir",
    "submit": "Rnu amiḍan",
    "hasAccount": "Tesɛiḍ yakan amiḍan?",
    "signIn": "Kcem"
  },
  "forgotPassword": {
    "title": "Ales awal uffir",
    "email": "Imayl",
    "submit": "Azen tabrat",
    "backToLogin": "Uɣal ɣer ukcem"
  },
  "resetPassword": {
    "title": "Sbedd awal uffir",
    "password": "Awal uffir amaynut",
    "confirmPassword": "Sentem awal uffir",
    "submit": "Sbedd"
  }
};

fs.writeFileSync(path.join(berberDir, 'auth.json'), JSON.stringify(authTranslations, null, 2));
console.log('✅ auth.json créé');

// 2. COMMON.JSON - Éléments communs
const commonTranslations = {
  "save": "Sekles",
  "cancel": "Sefsex",
  "delete": "Kkes",
  "edit": "Ẓreg",
  "add": "Rnu",
  "search": "Nadi",
  "loading": "Asali...",
  "error": "Tuccḍa",
  "success": "Yedda",
  "confirm": "Sentem",
  "close": "Mdel",
  "open": "Ldi",
  "yes": "Ih",
  "no": "Uhu",
  "next": "Ameḍfir",
  "previous": "Azwir",
  "finish": "Fakk",
  "continue": "Kemmel",
  "back": "Uɣal",
  "select": "Fren",
  "upload": "Sali",
  "download": "Sader",
  "print": "Siggez",
  "export": "Sifeḍ",
  "import": "Kter",
  "refresh": "Smiren",
  "clear": "Sfeḍ",
  "reset": "Ales asbeddi",
  "apply": "Snes",
  "remove": "Kkes",
  "view": "Ẓer",
  "details": "Talqayt",
  "settings": "Iɣewwaṛen",
  "help": "Tallalt",
  "about": "Ɣef",
  "contact": "Nermes",
  "home": "Agejdan",
  "dashboard": "Tafelwit n usenqed",
  "profile": "Amaɣnu",
  "logout": "Ffeɣ"
};

fs.writeFileSync(path.join(berberDir, 'common.json'), JSON.stringify(commonTranslations, null, 2));
console.log('✅ common.json créé');

// 3. DASHBOARD.JSON - Tableau de bord
const dashboardTranslations = {
  "title": "Tafelwit n usenqed",
  "welcome": "Ansuf",
  "overview": "Taskant",
  "stats": {
    "appointments": "Isuraf",
    "clients": "Imsaɣen",
    "revenue": "Aɣaras",
    "services": "Imeẓla",
    "team": "Tarbaɛt",
    "growth": "Akker",
    "today": "Ass-a",
    "thisWeek": "Imalas-a",
    "thisMonth": "Aggur-a",
    "thisYear": "Aseggas-a"
  },
  "quickActions": {
    "title": "Tigawin tiruḥin",
    "newAppointment": "Asuref amaynut",
    "newClient": "Amsaɣ amaynut",
    "newService": "Ameẓlu amaynut",
    "viewCalendar": "Ẓer awitay",
    "viewReports": "Ẓer ineqqisen"
  },
  "recentActivity": {
    "title": "Armud n melmi kan",
    "noActivity": "Ulac armud",
    "viewAll": "Ẓer akk"
  },
  "upcomingAppointments": {
    "title": "Isuraf i d-iteddun",
    "noAppointments": "Ulac isuraf",
    "viewAll": "Ẓer akk isuraf"
  },
  "charts": {
    "revenue": "Aɣaras",
    "appointments": "Isuraf",
    "clients": "Imsaɣen",
    "services": "Imeẓla"
  }
};

fs.writeFileSync(path.join(berberDir, 'dashboard.json'), JSON.stringify(dashboardTranslations, null, 2));
console.log('✅ dashboard.json créé');

// 4. SERVICES.JSON - Services
const servicesTranslations = {
  "title": "Imeẓla",
  "addService": "Rnu ameẓlu",
  "editService": "Ẓreg ameẓlu",
  "deleteService": "Kkes ameẓlu",
  "serviceName": "Isem n umeẓlu",
  "description": "Aglam",
  "price": "Ssuma",
  "duration": "Tanzagt",
  "category": "Taggayt",
  "image": "Tugna",
  "active": "Urmid",
  "inactive": "Ur urmid ara",
  "noServices": "Ulac imeẓla",
  "searchServices": "Nadi imeẓla",
  "filterByCategory": "Sizdeg s tggayt",
  "allCategories": "Akk tiggayin",
  "categories": {
    "haircut": "Tuqqsa n uzar",
    "coloring": "Asemli",
    "styling": "Asbeddi",
    "treatment": "Asaḥ",
    "manicure": "Manikir",
    "pedicure": "Pedikir",
    "facial": "Asaḥ n wudem",
    "massage": "Amekṛaḍ",
    "waxing": "Akkes n uzar",
    "eyebrows": "Timiṭin",
    "makeup": "Asebter",
    "other": "Wayeḍ"
  },
  "form": {
    "name": "Isem",
    "description": "Aglam",
    "price": "Ssuma",
    "duration": "Tanzagt",
    "category": "Taggayt",
    "image": "Tugna",
    "status": "Addad",
    "save": "Sekles",
    "cancel": "Sefsex"
  }
};

fs.writeFileSync(path.join(berberDir, 'services.json'), JSON.stringify(servicesTranslations, null, 2));
console.log('✅ services.json créé');

// 5. CLIENTS.JSON - Clients
const clientsTranslations = {
  "title": "Imsaɣen",
  "addClient": "Rnu amsaɣ",
  "editClient": "Ẓreg amsaɣ",
  "deleteClient": "Kkes amsaɣ",
  "clientName": "Isem n umsaɣ",
  "firstName": "Isem amezwaru",
  "lastName": "Isem n tawacult",
  "email": "Imayl",
  "phone": "Tiliɣri",
  "address": "Tansa",
  "birthDate": "Azemz n tlalit",
  "gender": "Tuzuft",
  "notes": "Tizmilin",
  "noClients": "Ulac imsaɣen",
  "searchClients": "Nadi imsaɣen",
  "totalClients": "Amḍan n imsaɣen",
  "newClients": "Imsaɣen imaynuten",
  "activeClients": "Imsaɣen urmiden",
  "clientHistory": "Amazray n umsaɣ",
  "appointments": "Isuraf",
  "lastVisit": "Tirza taneggarut",
  "totalSpent": "Amḍan yettwaxelṣen",
  "form": {
    "personalInfo": "Talɣut tudmawant",
    "contactInfo": "Talɣut n unermis",
    "additionalInfo": "Talɣut-nniḍen",
    "save": "Sekles",
    "cancel": "Sefsex"
  },
  "gender": {
    "male": "Argaz",
    "female": "Tameṭṭut",
    "other": "Wayeḍ"
  }
};

fs.writeFileSync(path.join(berberDir, 'clients.json'), JSON.stringify(clientsTranslations, null, 2));
console.log('✅ clients.json créé');

// 6. TEAM.JSON - Équipe
const teamTranslations = {
  "title": "Tarbaɛt",
  "addMember": "Rnu aɛeggal",
  "editMember": "Ẓreg aɛeggal",
  "deleteMember": "Kkes aɛeggal",
  "memberName": "Isem n uɛeggal",
  "firstName": "Isem amezwaru",
  "lastName": "Isem n tawacult",
  "email": "Imayl",
  "phone": "Tiliɣri",
  "role": "Tamlilt",
  "specialties": "Tiɣaṛa",
  "schedule": "Ahil",
  "salary": "Aɣaras",
  "commission": "Taɛkkumt",
  "hireDate": "Azemz n uxeddim",
  "status": "Addad",
  "noMembers": "Ulac iɛeggalen",
  "searchMembers": "Nadi iɛeggalen",
  "totalMembers": "Amḍan n iɛeggalen",
  "activeMembers": "Iɛeggalen urmiden",
  "performance": "Tamellit",
  "workingHours": "Isragen n uxeddim",
  "availability": "Tiwejda",
  "roles": {
    "owner": "Bab",
    "manager": "Amsefrak",
    "stylist": "Asbedday",
    "colorist": "Asemlay",
    "barber": "Amqess",
    "esthetician": "Asaḥay",
    "receptionist": "Amseɣbel",
    "assistant": "Aɛiwen",
    "other": "Wayeḍ"
  },
  "form": {
    "personalInfo": "Talɣut tudmawant",
    "contactInfo": "Talɣut n unermis",
    "workInfo": "Talɣut n uxeddim",
    "save": "Sekles",
    "cancel": "Sefsex"
  }
};

fs.writeFileSync(path.join(berberDir, 'team.json'), JSON.stringify(teamTranslations, null, 2));
console.log('✅ team.json créé');

// 7. APPOINTMENTS.JSON - Rendez-vous
const appointmentsTranslations = {
  "title": "Isuraf",
  "addAppointment": "Rnu asuref",
  "editAppointment": "Ẓreg asuref",
  "deleteAppointment": "Kkes asuref",
  "appointmentDetails": "Talqayt n usuref",
  "client": "Amsaɣ",
  "service": "Ameẓlu",
  "staff": "Axeddim",
  "date": "Azemz",
  "time": "Akud",
  "duration": "Tanzagt",
  "price": "Ssuma",
  "status": "Addad",
  "notes": "Tizmilin",
  "noAppointments": "Ulac isuraf",
  "searchAppointments": "Nadi isuraf",
  "filterByStatus": "Sizdeg s waddad",
  "filterByDate": "Sizdeg s wzemz",
  "filterByStaff": "Sizdeg s uxeddim",
  "todayAppointments": "Isuraf n wass-a",
  "upcomingAppointments": "Isuraf i d-iteddun",
  "pastAppointments": "Isuraf iɛeddan",
  "calendar": "Awitay",
  "dayView": "Taskant n wass",
  "weekView": "Taskant n dduṛt",
  "monthView": "Taskant n waggur",
  "status": {
    "scheduled": "Yettusbedd",
    "confirmed": "Yettusentem",
    "inProgress": "Iteddu",
    "completed": "Yekfa",
    "cancelled": "Yettusefsex",
    "noShow": "Ur d-yusi ara"
  },
  "form": {
    "clientInfo": "Talɣut n umsaɣ",
    "serviceInfo": "Talɣut n umeẓlu",
    "dateTime": "Azemz d wakud",
    "additionalInfo": "Talɣut-nniḍen",
    "save": "Sekles",
    "cancel": "Sefsex"
  }
};

fs.writeFileSync(path.join(berberDir, 'appointments.json'), JSON.stringify(appointmentsTranslations, null, 2));
console.log('✅ appointments.json créé');

// 8. INTERFACE.JSON - Interface
const interfaceTranslations = {
  "title": "Agrudem",
  "theme": "Asentel",
  "language": "Tutlayt",
  "currency": "Tadrimt",
  "timezone": "Izḍi n wakud",
  "dateFormat": "Amasal n wzemz",
  "timeFormat": "Amasal n wakud",
  "notifications": "Ilɣa",
  "emailNotifications": "Ilɣa s imayl",
  "smsNotifications": "Ilɣa s SMS",
  "pushNotifications": "Ilɣa n turrigin",
  "appearance": "Arwes",
  "darkMode": "Askar aberkan",
  "lightMode": "Askar aceɛlal",
  "autoMode": "Askar awurman",
  "layout": "Asbeddi",
  "sidebar": "Agalis",
  "header": "Aqeṛṛu",
  "footer": "Aḍaṛ",
  "colors": "Initen",
  "fonts": "Tisefsay",
  "logo": "Alugu",
  "branding": "Tacreḍt",
  "customization": "Asagen",
  "backup": "Asekles",
  "restore": "Ales asbeddi",
  "export": "Sifeḍ",
  "import": "Kter",
  "reset": "Ales asbeddi",
  "save": "Sekles",
  "cancel": "Sefsex",
  "apply": "Snes"
};

fs.writeFileSync(path.join(berberDir, 'interface.json'), JSON.stringify(interfaceTranslations, null, 2));
console.log('✅ interface.json créé');

// 9. PROFILE.JSON - Profil
const profileTranslations = {
  "title": "Amaɣnu",
  "personalInfo": "Talɣut tudmawant",
  "businessInfo": "Talɣut n uxeddim",
  "contactInfo": "Talɣut n unermis",
  "security": "Taɣellist",
  "preferences": "Ismenyifen",
  "firstName": "Isem amezwaru",
  "lastName": "Isem n tawacult",
  "email": "Imayl",
  "phone": "Tiliɣri",
  "address": "Tansa",
  "city": "Tamdint",
  "country": "Tamurt",
  "postalCode": "Tangalt n lpusṭa",
  "businessName": "Isem n uxeddim",
  "businessType": "Anaw n uxeddim",
  "description": "Aglam",
  "website": "Asmel web",
  "socialMedia": "Iẓeḍwa inmettiyen",
  "currentPassword": "Awal uffir amiran",
  "newPassword": "Awal uffir amaynut",
  "confirmPassword": "Sentem awal uffir",
  "changePassword": "Beddel awal uffir",
  "twoFactorAuth": "Asentem s sin iferdisen",
  "loginHistory": "Amazray n ukcem",
  "sessions": "Tiɣimiyin",
  "privacy": "Tudert tusligt",
  "notifications": "Ilɣa",
  "language": "Tutlayt",
  "timezone": "Izḍi n wakud",
  "currency": "Tadrimt",
  "save": "Sekles",
  "cancel": "Sefsex",
  "update": "Leqqem",
  "delete": "Kkes",
  "deactivate": "Seḥbes"
};

fs.writeFileSync(path.join(berberDir, 'profile.json'), JSON.stringify(profileTranslations, null, 2));
console.log('✅ profile.json créé');

// 10. PUBLIC.JSON - Pages publiques
const publicTranslations = {
  "welcome": "Ansuf ɣer Saloneo",
  "bookAppointment": "Ɛeggen asuref",
  "ourServices": "Imeẓla-nneɣ",
  "ourTeam": "Tarbaɛt-nneɣ",
  "contact": "Nermes",
  "about": "Ɣef-nneɣ",
  "hours": "Isragen",
  "location": "Adeg",
  "phone": "Tiliɣri",
  "email": "Imayl",
  "followUs": "Ḍfer-aɣ",
  "gallery": "Tugniwin",
  "testimonials": "Icehden",
  "pricing": "Ssuma",
  "faq": "Isteqsiyen",
  "blog": "Ablug",
  "news": "Isallen",
  "events": "Tidyanin",
  "promotions": "Ibeṛṛaniyen",
  "gift": "Asefk",
  "loyalty": "Taflayt",
  "membership": "Taɛeḍḍawt",
  "reviews": "Tiwelhiyin",
  "booking": {
    "selectService": "Fren ameẓlu",
    "selectStaff": "Fren axeddim",
    "selectDate": "Fren azemz",
    "selectTime": "Fren akud",
    "confirmBooking": "Sentem aɛeggen",
    "bookingConfirmed": "Aɛeggen yettusentem",
    "bookingFailed": "Aɛeggen ur yeddi ara"
  }
};

fs.writeFileSync(path.join(berberDir, 'public.json'), JSON.stringify(publicTranslations, null, 2));
console.log('✅ public.json créé');

// 11. MARKETING.JSON - Marketing
const marketingTranslations = {
  "title": "Asuq",
  "campaigns": "Tiɣaṛa",
  "promotions": "Ibeṛṛaniyen",
  "discounts": "Iḥeṛṛiyen",
  "coupons": "Tikubunat",
  "loyalty": "Taflayt",
  "referrals": "Ibeṛṛaniyen",
  "newsletter": "Tabratt n isallen",
  "socialMedia": "Iẓeḍwa inmettiyen",
  "advertising": "Asɣel",
  "analytics": "Tasleḍt",
  "reports": "Ineqqisen",
  "roi": "Tuɣalin n usekcem",
  "conversion": "Abeddel",
  "engagement": "Armud",
  "reach": "Taɣzi",
  "impressions": "Tiwelhiyin",
  "clicks": "Isiten",
  "leads": "Imsaɣen izemlen",
  "customers": "Imsaɣen",
  "revenue": "Aɣaras",
  "growth": "Akker",
  "trends": "Tanila",
  "insights": "Tifrat",
  "optimization": "Asbeddi",
  "targeting": "Asaḍas",
  "segmentation": "Abeṭṭu",
  "personalization": "Asagen",
  "automation": "Awurman",
  "integration": "Asdukel",
  "tracking": "Aḍfar",
  "measurement": "Aktazal"
};

fs.writeFileSync(path.join(berberDir, 'marketing.json'), JSON.stringify(marketingTranslations, null, 2));
console.log('✅ marketing.json créé');

// 12. SUBSCRIPTION.JSON - Abonnements
const subscriptionTranslations = {
  "title": "Ijerriḍen",
  "plans": "Iɣawasen",
  "billing": "After",
  "payment": "Axelleṣ",
  "invoice": "Tafaturt",
  "subscription": "Ajerriḍ",
  "upgrade": "Ɛli",
  "downgrade": "Ader",
  "cancel": "Sefsex",
  "renew": "Smiren",
  "trial": "Aɛeṛṛu",
  "free": "Baṭel",
  "premium": "Aɣalay",
  "pro": "Aɣerfan",
  "enterprise": "Takebbanit",
  "monthly": "Aggur",
  "yearly": "Aseggas",
  "lifetime": "Tudert",
  "features": "Timahilin",
  "limits": "Tilisa",
  "usage": "Aseqdec",
  "quota": "Azal",
  "overage": "Azal n ufella",
  "discount": "Aḥeṛṛi",
  "coupon": "Takubunt",
  "promo": "Abeṛṛani",
  "refund": "Tuɣalin",
  "chargeback": "Tuɣalin n uxelleṣ",
  "dispute": "Anmegla",
  "fraud": "Akukel",
  "security": "Taɣellist",
  "compliance": "Aḍfar",
  "terms": "Tiwtilin",
  "privacy": "Tudert tusligt",
  "support": "Tallalt",
  "contact": "Nermes"
};

fs.writeFileSync(path.join(berberDir, 'subscription.json'), JSON.stringify(subscriptionTranslations, null, 2));
console.log('✅ subscription.json créé');

// 13. ERRORS.JSON - Messages d'erreur
const errorsTranslations = {
  "general": {
    "unknown": "Tuccḍa ur nettwassen ara",
    "network": "Tuccḍa n uẓeḍḍa",
    "server": "Tuccḍa n uqeddac",
    "timeout": "Akud yezri",
    "unauthorized": "Ur tettalaseḍ ara",
    "forbidden": "Yegdel",
    "notFound": "Ur yettwaf ara",
    "conflict": "Anmegla",
    "validation": "Tuccḍa n usentem"
  },
  "auth": {
    "invalidCredentials": "Isefka n ukcem d iḥeqqiyen",
    "accountLocked": "Amiḍan yettwacekkel",
    "passwordExpired": "Awal uffir yezri",
    "sessionExpired": "Tiɣimit tezri",
    "emailNotVerified": "Imayl ur yettusentem ara",
    "accountNotFound": "Amiḍan ur yettwaf ara"
  },
  "validation": {
    "required": "Yettwasra",
    "email": "Imayl d aḥeqqi",
    "phone": "Uṭṭun n tiliɣri d aḥeqqi",
    "password": "Awal uffir d aḥeqqi",
    "minLength": "Teḥwaǧ {min} isekkilen",
    "maxLength": "Ur tezmireḍ ara ad tɛeddiḍ {max} isekkilen",
    "numeric": "Yessefk ad yili d uṭṭun",
    "alpha": "Yessefk ad yili d isekkilen kan"
  },
  "booking": {
    "timeSlotTaken": "Akud-a yettwafren yakan",
    "staffNotAvailable": "Axeddim ur yelli ara",
    "serviceNotAvailable": "Ameẓlu ur yelli ara",
    "pastDate": "Ur tezmireḍ ara ad tferneḍ azemz iɛeddan"
  }
};

fs.writeFileSync(path.join(berberDir, 'errors.json'), JSON.stringify(errorsTranslations, null, 2));
console.log('✅ errors.json créé');

console.log('\n📊 RÉSUMÉ DE LA CRÉATION');
console.log('============================================================');
console.log('✅ 13 fichiers JSON berbères créés avec succès');
console.log('✅ Traductions en Kabyle (Taqbaylit)');
console.log('✅ Alphabet Latin utilisé pour l\'accessibilité');
console.log('✅ Terminologie adaptée au domaine de la beauté');

console.log('\n🎯 FICHIERS CRÉÉS:');
const files = [
  'auth.json - Authentification',
  'common.json - Éléments communs',
  'dashboard.json - Tableau de bord',
  'services.json - Services',
  'clients.json - Clients',
  'team.json - Équipe',
  'appointments.json - Rendez-vous',
  'interface.json - Interface',
  'profile.json - Profil',
  'public.json - Pages publiques',
  'marketing.json - Marketing',
  'subscription.json - Abonnements',
  'errors.json - Messages d\'erreur'
];

files.forEach(file => console.log(`  ✅ ${file}`));

console.log('\n🌍 PROCHAINES ÉTAPES:');
console.log('1. Mettre à jour les sélecteurs de langue');
console.log('2. Ajouter le berbère à la configuration i18n');
console.log('3. Tester les traductions');
console.log('4. Valider avec des locuteurs natifs');

console.log('\n🏴 SALONEO SUPPORTE MAINTENANT LE BERBÈRE (KABYLE) !');
console.log('============================================================');
