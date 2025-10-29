import { DesignTemplate } from './types';

export const industrialChicTemplate: DesignTemplate = {
  id: 'industrial-chic',
  name: 'Industrial Chic',
  category: 'modern',
  description: 'Design industriel moderne avec textures métalliques, effets de soudure et esthétique urbaine contemporaine',
  preview: '/templates/previews/industrial-chic.jpg',
  theme: {
    colors: {
      primary: '#E67E22', // Orange industriel moderne
      secondary: '#34495E', // Bleu acier foncé
      accent: '#F39C12', // Ambre industriel
      background: '#2C3E50', // Bleu foncé industriel
      surface: '#34495E', // Gris acier
      text: '#ECF0F1', // Blanc cassé
      textSecondary: '#BDC3C7', // Gris clair
      custom: {
        steel: '#5D6D7E', // Acier moderne
        copper: '#D68910', // Cuivre brillant
        iron: '#566573', // Fer moderne
        rust: '#E74C3C', // Rouge rouille
        chrome: '#AEB6BF', // Chrome moderne
        gunmetal: '#2C3E50', // Métal canon
        bronze: '#D68910', // Bronze moderne
        aluminum: '#85929E' // Aluminium
      }
    },
    typography: {
      headingFont: 'Rajdhani Variable, sans-serif',
      bodyFont: 'Roboto Condensed Variable, sans-serif',
      sizes: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem'
      },
      weights: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      }
    },
    effects: {
      glassmorphism: {
        enabled: true,
        blur: '10px',
        opacity: '0.15',
        border: '1px solid rgba(205, 133, 63, 0.3)'
      },
      animations: ['metalShine', 'gearRotate', 'weldSpark'],
      transitions: ['mechanical', 'industrial'],
      specialEffects: ['steamParticles', 'sparkEffect', 'gearMechanism'],
      shadows: {
        sm: '0 2px 4px rgba(0, 0, 0, 0.3)',
        md: '0 4px 8px rgba(0, 0, 0, 0.4)',
        lg: '0 8px 16px rgba(0, 0, 0, 0.5)',
        xl: '0 16px 32px rgba(0, 0, 0, 0.6)',
        neon: '0 0 20px rgba(205, 133, 63, 0.5)'
      }
    },
    layout: {
      borderRadius: {
        sm: '0.125rem',
        md: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '0'
      },
      spacing: {
        xs: '0.5rem',
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
        xl: '3rem'
      },
      containers: {
        maxWidth: '1300px',
        padding: '2rem'
      }
    }
  },
  assets: {
    patterns: ['metal-texture', 'rivets', 'industrial-grid'],
    particles: [
      {
        type: 'sparkle',
        count: 20,
        size: { min: 1, max: 3 },
        speed: { min: 1, max: 2 },
        color: '#CD853F',
        opacity: { min: 0.4, max: 0.8 }
      },
      {
        type: 'floating',
        count: 15,
        size: { min: 2, max: 5 },
        speed: { min: 0.5, max: 1.5 },
        color: '#4682B4',
        opacity: { min: 0.3, max: 0.6 }
      }
    ]
  },
  customCSS: `
    @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&family=Roboto+Condensed:wght@300;400;500;600;700&display=swap');
    
    .industrial-chic {
      font-family: 'Roboto Condensed', sans-serif;
      background: linear-gradient(135deg, #2C3E50 0%, #1A252F 100%);
      min-height: 100vh;
      position: relative;
      overflow-x: hidden;
    }

    .industrial-chic h1, 
    .industrial-chic h2, 
    .industrial-chic h3 {
      font-family: 'Rajdhani', sans-serif;
    }

    /* Background industriel moderne */
    .industrial-chic::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        linear-gradient(90deg, transparent 98%, rgba(230, 126, 34, 0.08) 100%),
        linear-gradient(0deg, transparent 98%, rgba(52, 73, 94, 0.05) 100%),
        radial-gradient(circle at 30% 70%, rgba(93, 109, 126, 0.03) 0%, transparent 50%);
      background-size: 50px 50px, 50px 50px, 250px 250px;
      pointer-events: none;
      z-index: 0;
    }

    /* Engrenages mécaniques animés */
    .industrial-chic::after {
      content: '';
      position: fixed;
      top: -10%;
      left: -10%;
      width: 120%;
      height: 120%;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="25" cy="25" r="6" fill="none" stroke="%23E67E22" stroke-width="0.8" opacity="0.06"><animateTransform attributeName="transform" type="rotate" values="0 25 25;360 25 25" dur="25s" repeatCount="indefinite"/></circle><circle cx="75" cy="75" r="4" fill="none" stroke="%2334495E" stroke-width="0.6" opacity="0.04"><animateTransform attributeName="transform" type="rotate" values="360 75 75;0 75 75" dur="20s" repeatCount="indefinite"/></circle><rect x="48" y="48" width="3" height="3" fill="%235D6D7E" opacity="0.03"><animate attributeName="opacity" values="0.03;0.08;0.03" dur="4s" repeatCount="indefinite"/></rect></svg>') repeat;
      background-size: 250px 250px;
      animation: mechanicalFloat 30s linear infinite;
      pointer-events: none;
      z-index: 1;
    }

    @keyframes mechanicalFloat {
      0% { transform: translateX(0) translateY(0); }
      100% { transform: translateX(-250px) translateY(-250px); }
    }

    /* Navigation industrielle moderne */
    .navbar {
      background: rgba(44, 62, 80, 0.95);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 2px solid rgba(230, 126, 34, 0.3);
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      padding: 1rem 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 2px 15px rgba(0, 0, 0, 0.3);
    }

    .navbar.scrolled {
      background: rgba(44, 62, 80, 0.98);
      box-shadow: 0 4px 25px rgba(0, 0, 0, 0.4);
    }

    .nav-logo {
      font-family: 'Rajdhani', sans-serif;
      font-size: 1.75rem;
      font-weight: 700;
      color: #E67E22;
      letter-spacing: 0.1em;
      position: relative;
      text-transform: uppercase;
    }

    .nav-logo::after {
      content: '⚙️';
      margin-left: 0.5rem;
      font-size: 1.2rem;
      animation: gearRotate 6s linear infinite;
    }

    @keyframes gearRotate {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .nav-link {
      color: #BDC3C7;
      text-decoration: none;
      font-weight: 600;
      padding: 0.75rem 1.5rem;
      border-radius: 0.25rem;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-size: 0.9rem;
    }

    .nav-link::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(230, 126, 34, 0.2), transparent);
      transition: left 0.5s;
    }

    .nav-link:hover::before {
      left: 100%;
    }

    .nav-link:hover {
      color: #E67E22;
      background: rgba(230, 126, 34, 0.1);
      transform: translateY(-1px);
    }

    /* Hero Section industrielle moderne */
    .hero-section {
      min-height: 100vh;
      display: flex;
      align-items: center;
      position: relative;
      padding: 6rem 0 4rem;
      background: linear-gradient(135deg, rgba(44, 62, 80, 0.95) 0%, rgba(26, 37, 47, 0.9) 100%);
      overflow: hidden;
    }

    .hero-content {
      position: relative;
      z-index: 2;
      text-align: center;
    }

    .hero-title {
      font-family: 'Rajdhani', sans-serif;
      font-size: clamp(2.5rem, 6vw, 4.5rem);
      font-weight: 700;
      color: #E67E22;
      line-height: 1.1;
      margin-bottom: 2rem;
      letter-spacing: 0.05em;
      position: relative;
      text-transform: uppercase;
    }

    .hero-title::after {
      content: '';
      position: absolute;
      bottom: -15px;
      left: 50%;
      transform: translateX(-50%);
      width: 120px;
      height: 4px;
      background: linear-gradient(90deg, #E67E22, #34495E, #F39C12);
      border-radius: 0;
      animation: industrialGlow 3s ease-in-out infinite;
    }

    @keyframes industrialGlow {
      0%, 100% { opacity: 0.8; }
      50% { opacity: 1; }
    }

    .hero-subtitle {
      font-size: 1.25rem;
      color: #BDC3C7;
      margin-bottom: 3rem;
      font-weight: 500;
      line-height: 1.6;
      max-width: 700px;
      margin-left: auto;
      margin-right: auto;
      letter-spacing: 0.02em;
    }

    /* Boutons industriels modernes */
    .btn-primary {
      background: linear-gradient(135deg, #E67E22 0%, #D68910 100%);
      color: #2C3E50;
      border: none;
      padding: 1.25rem 3rem;
      border-radius: 0.25rem;
      font-weight: 700;
      font-size: 1.1rem;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      box-shadow: 0 8px 25px rgba(230, 126, 34, 0.4);
      font-family: 'Rajdhani', sans-serif;
    }

    .btn-primary::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.6s;
    }

    .btn-primary:hover::before {
      left: 100%;
    }

    .btn-primary:hover {
      transform: translateY(-3px) scale(1.05);
      box-shadow: 0 12px 35px rgba(230, 126, 34, 0.6);
    }

    .btn-secondary {
      background: transparent;
      color: #34495E;
      border: 2px solid #34495E;
      padding: 1.25rem 3rem;
      border-radius: 0.25rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      backdrop-filter: blur(10px);
      font-family: 'Rajdhani', sans-serif;
    }

    .btn-secondary:hover {
      background: #34495E;
      color: #ECF0F1;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(52, 73, 94, 0.4);
    }

    /* Service Cards industrielles modernes */
    .service-card {
      background: rgba(52, 73, 94, 0.9);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(230, 126, 34, 0.3);
      border-radius: 0.5rem;
      padding: 2.5rem;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
    }

    .service-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #E67E22 0%, #34495E 50%, #F39C12 100%);
      transform: scaleX(0);
      transition: transform 0.4s ease;
    }

    .service-card:hover::before {
      transform: scaleX(1);
    }

    .service-card::after {
      content: '⚙️';
      position: absolute;
      top: 1.5rem;
      right: 1.5rem;
      font-size: 1.5rem;
      opacity: 0.3;
      transition: all 0.3s ease;
    }

    .service-card:hover::after {
      opacity: 0.8;
      transform: scale(1.2) rotate(45deg);
      animation: gearSpin 2s linear infinite;
    }

    @keyframes gearSpin {
      0% { transform: scale(1.2) rotate(45deg); }
      100% { transform: scale(1.2) rotate(405deg); }
    }

    .service-card:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
      background: rgba(52, 73, 94, 0.95);
      border-color: rgba(230, 126, 34, 0.6);
    }

    .service-title {
      font-family: 'Rajdhani', sans-serif;
      font-size: 1.5rem;
      font-weight: 700;
      color: #E67E22;
      margin-bottom: 1rem;
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }

    .service-description {
      color: #BDC3C7;
      line-height: 1.6;
      margin-bottom: 2rem;
      font-size: 1rem;
    }

    .service-price {
      font-size: 2rem;
      font-weight: 700;
      color: #34495E;
      margin-bottom: 0.5rem;
      letter-spacing: -0.02em;
      font-family: 'Rajdhani', sans-serif;
    }

    .service-duration {
      color: #F39C12;
      font-size: 0.9rem;
      margin-bottom: 2rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Team Section industrielle moderne */
    .team-member {
      text-align: center;
      padding: 2.5rem 2rem;
      background: rgba(52, 73, 94, 0.8);
      border-radius: 0.5rem;
      transition: all 0.4s ease;
      border: 1px solid rgba(230, 126, 34, 0.2);
      position: relative;
      overflow: hidden;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
    }

    .team-member::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(230, 126, 34, 0.08) 0%, transparent 70%);
      transform: scale(0);
      transition: transform 0.5s ease;
    }

    .team-member:hover::before {
      transform: scale(1);
    }

    .team-member:hover {
      transform: translateY(-8px) scale(1.02);
      background: rgba(52, 73, 94, 0.95);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
      border-color: rgba(230, 126, 34, 0.5);
    }

    .team-avatar {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      margin: 0 auto 1.5rem;
      border: 3px solid #E67E22;
      object-fit: cover;
      transition: all 0.4s ease;
      position: relative;
      z-index: 2;
      box-shadow: 0 0 20px rgba(230, 126, 34, 0.3);
    }

    .team-member:hover .team-avatar {
      transform: scale(1.1);
      border-color: #34495E;
      box-shadow: 0 0 30px rgba(52, 73, 94, 0.5);
    }

    .team-name {
      font-family: 'Rajdhani', sans-serif;
      font-size: 1.25rem;
      font-weight: 700;
      color: #E67E22;
      margin-bottom: 0.5rem;
      letter-spacing: 0.02em;
      position: relative;
      z-index: 2;
      text-transform: uppercase;
    }

    .team-role {
      color: #BDC3C7;
      font-weight: 600;
      font-size: 1rem;
      position: relative;
      z-index: 2;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Contact Section industrielle moderne */
    .contact-info {
      background: rgba(52, 73, 94, 0.9);
      backdrop-filter: blur(20px);
      border-radius: 0.5rem;
      padding: 2.5rem;
      border: 1px solid rgba(230, 126, 34, 0.3);
      position: relative;
      overflow: hidden;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
      transition: all 0.3s ease;
    }

    .contact-info:hover {
      transform: translateY(-4px);
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
    }

    .contact-info::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 60px;
      height: 60px;
      background: radial-gradient(circle, rgba(52, 73, 94, 0.3) 0%, transparent 70%);
      border-radius: 0 0.5rem 0 0.5rem;
    }

    .contact-title {
      font-family: 'Rajdhani', sans-serif;
      font-size: 1.5rem;
      font-weight: 700;
      color: #E67E22;
      margin-bottom: 2rem;
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }

    .contact-item {
      display: flex;
      align-items: center;
      margin-bottom: 1.25rem;
      padding: 1rem;
      border-radius: 0.25rem;
      transition: all 0.3s ease;
      color: #ECF0F1;
    }

    .contact-item:hover {
      background: rgba(230, 126, 34, 0.1);
      transform: translateX(5px);
    }

    .contact-icon {
      width: 20px;
      height: 20px;
      margin-right: 1.25rem;
      color: #34495E;
      font-size: 1.125rem;
    }

    .hours-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
      border-bottom: 1px solid rgba(230, 126, 34, 0.2);
      transition: all 0.3s ease;
    }

    .hours-item:last-child {
      border-bottom: none;
    }

    .hours-item:hover {
      background: rgba(230, 126, 34, 0.05);
      padding-left: 0.5rem;
      padding-right: 0.5rem;
      border-radius: 0.25rem;
    }

    .hours-day {
      font-weight: 700;
      color: #E67E22;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-family: 'Rajdhani', sans-serif;
    }

    .hours-time {
      color: #BDC3C7;
      font-size: 1rem;
      font-weight: 500;
    }

    /* Footer industriel moderne */
    .footer {
      background: linear-gradient(135deg, #2C3E50 0%, #1A252F 100%);
      color: #BDC3C7;
      padding: 4rem 0 2rem;
      margin-top: 5rem;
      position: relative;
      overflow: hidden;
      border-top: 2px solid rgba(230, 126, 34, 0.3);
    }

    .footer::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M0,50 Q25,25 50,50 T100,50" fill="none" stroke="rgba(230,126,34,0.05)" stroke-width="1"/></svg>') repeat;
      background-size: 120px 120px;
    }

    .footer-content {
      text-align: center;
      position: relative;
      z-index: 2;
    }

    .footer-logo {
      font-family: 'Rajdhani', sans-serif;
      font-size: 2rem;
      font-weight: 700;
      color: #E67E22;
      margin-bottom: 2rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }

    .footer-text {
      color: rgba(189, 195, 199, 0.8);
      margin-bottom: 3rem;
      font-size: 1.05rem;
      line-height: 1.6;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }

    .social-links {
      display: flex;
      justify-content: center;
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .social-link {
      width: 55px;
      height: 55px;
      background: rgba(230, 126, 34, 0.1);
      border-radius: 0.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #E67E22;
      text-decoration: none;
      transition: all 0.3s ease;
      border: 2px solid rgba(230, 126, 34, 0.3);
      font-size: 1.5rem;
    }

    .social-link:hover {
      background: #E67E22;
      color: #2C3E50;
      transform: translateY(-3px) scale(1.1);
      border-color: #E67E22;
      box-shadow: 0 8px 25px rgba(230, 126, 34, 0.4);
    }

    .copyright {
      color: rgba(189, 195, 199, 0.6);
      font-size: 0.9rem;
      border-top: 1px solid rgba(230, 126, 34, 0.2);
      padding-top: 2rem;
    }

    /* Animations */
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes metalShine {
      0%, 100% { 
        background-position: 0% 50%;
      }
      50% { 
        background-position: 100% 50%;
      }
    }

    @keyframes industrialPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    .fade-in-up {
      animation: fadeInUp 0.8s ease-out;
    }

    .metal-shine {
      background: linear-gradient(45deg, 
        #4A4A4A 0%, 
        #C0C0C0 25%, 
        #4A4A4A 50%, 
        #C0C0C0 75%, 
        #4A4A4A 100%);
      background-size: 200% 200%;
      animation: metalShine 4s ease-in-out infinite;
    }

    .industrial-pulse {
      animation: industrialPulse 3s ease-in-out infinite;
    }

    .stagger-1 { animation-delay: 0.1s; }
    .stagger-2 { animation-delay: 0.2s; }
    .stagger-3 { animation-delay: 0.3s; }
    .stagger-4 { animation-delay: 0.4s; }

    /* Responsive */
    @media (max-width: 768px) {
      .industrial-hero-title {
        font-size: 2.5rem;
      }
      
      .industrial-service-card {
        padding: 2rem;
      }
      
      .industrial-btn-primary, .industrial-btn-secondary {
        padding: 1rem 2rem;
        font-size: 1rem;
      }

      .industrial-services-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .industrial-team-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .industrial-contact-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
    }

    /* Scroll Animations */
    @media (prefers-reduced-motion: no-preference) {
      .industrial-service-card {
        opacity: 0;
        transform: translateY(30px);
        animation: fadeInUp 0.8s ease-out forwards;
      }

      .industrial-team-member {
        opacity: 0;
        transform: translateY(30px);
        animation: fadeInUp 0.8s ease-out forwards;
      }
    }

    /* Weld Effect */
    .weld-effect {
      position: relative;
      overflow: hidden;
    }
    
    .weld-effect::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: linear-gradient(45deg, 
        transparent 30%, 
        rgba(205, 133, 63, 0.3) 50%, 
        transparent 70%);
      animation: weldSpark 3s ease-in-out infinite;
    }
    
    @keyframes weldSpark {
      0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
      100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
    }
  `
};
