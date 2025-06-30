import { DesignTemplate } from './types';

export const industrialChicTemplate: DesignTemplate = {
  id: 'industrial-chic',
  name: 'Industrial Chic',
  category: 'modern',
  description: 'Textures métalliques réalistes, engrenages 3D, effet de soudure interactif',
  preview: '/templates/previews/industrial-chic.jpg',
  theme: {
    colors: {
      primary: '#4A4A4A',
      secondary: '#696969',
      accent: '#CD853F',
      background: '#2F2F2F',
      surface: '#3A3A3A',
      text: '#E0E0E0',
      textSecondary: '#B0B0B0',
      custom: {
        steel: '#4682B4',
        copper: '#B87333',
        iron: '#4A4A4A',
        rust: '#B7410E',
        chrome: '#C0C0C0',
        gunmetal: '#2C3539',
        bronze: '#CD7F32',
        aluminum: '#A8A8A8'
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
    
    .industrial-chic-2025 {
      font-family: 'Roboto Condensed', sans-serif;
      background: linear-gradient(135deg, #2F2F2F 0%, #1A1A1A 100%);
      min-height: 100vh;
      position: relative;
      overflow-x: hidden;
    }

    /* Industrial Background Pattern */
    .industrial-chic-2025::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        linear-gradient(90deg, transparent 98%, rgba(74, 74, 74, 0.1) 100%),
        linear-gradient(0deg, transparent 98%, rgba(205, 133, 63, 0.05) 100%),
        radial-gradient(circle at 30% 70%, rgba(70, 130, 180, 0.03) 0%, transparent 50%);
      background-size: 40px 40px, 40px 40px, 200px 200px;
      pointer-events: none;
      z-index: 0;
    }

    /* Mechanical Gears Animation */
    .industrial-chic-2025::after {
      content: '';
      position: fixed;
      top: -10%;
      left: -10%;
      width: 120%;
      height: 120%;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="25" cy="25" r="8" fill="none" stroke="%234A4A4A" stroke-width="1" opacity="0.1"><animateTransform attributeName="transform" type="rotate" values="0 25 25;360 25 25" dur="20s" repeatCount="indefinite"/></circle><circle cx="75" cy="75" r="6" fill="none" stroke="%23CD853F" stroke-width="1" opacity="0.08"><animateTransform attributeName="transform" type="rotate" values="360 75 75;0 75 75" dur="15s" repeatCount="indefinite"/></circle><rect x="48" y="48" width="4" height="4" fill="%234682B4" opacity="0.06"><animate attributeName="opacity" values="0.06;0.15;0.06" dur="3s" repeatCount="indefinite"/></rect></svg>') repeat;
      background-size: 200px 200px;
      animation: mechanicalFloat 25s linear infinite;
      pointer-events: none;
      z-index: 1;
    }

    @keyframes mechanicalFloat {
      0% { transform: translateX(0) translateY(0); }
      100% { transform: translateX(-200px) translateY(-200px); }
    }

    /* Navigation */
    .industrial-navbar {
      background: rgba(47, 47, 47, 0.95);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 2px solid rgba(205, 133, 63, 0.3);
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      padding: 1rem 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .industrial-navbar.scrolled {
      background: rgba(47, 47, 47, 0.98);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    }

    .industrial-logo {
      font-family: 'Rajdhani', sans-serif;
      font-size: 1.75rem;
      font-weight: 700;
      color: #CD853F;
      letter-spacing: 0.1em;
      position: relative;
      text-shadow: 0 0 10px rgba(205, 133, 63, 0.5);
      text-transform: uppercase;
    }

    .industrial-logo::after {
      content: '⚙️';
      margin-left: 0.5rem;
      font-size: 1.2rem;
      animation: gearRotate 4s linear infinite;
    }

    @keyframes gearRotate {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .industrial-nav-link {
      color: #B0B0B0;
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

    .industrial-nav-link::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(205, 133, 63, 0.2), transparent);
      transition: left 0.5s;
    }

    .industrial-nav-link:hover::before {
      left: 100%;
    }

    .industrial-nav-link:hover {
      color: #CD853F;
      background: rgba(205, 133, 63, 0.1);
      transform: translateY(-1px);
      text-shadow: 0 0 8px rgba(205, 133, 63, 0.6);
    }

    /* Hero Section */
    .industrial-hero {
      min-height: 100vh;
      display: flex;
      align-items: center;
      position: relative;
      padding: 6rem 0 4rem;
      background: linear-gradient(135deg, rgba(47, 47, 47, 0.9) 0%, rgba(26, 26, 26, 0.8) 100%);
    }

    .industrial-hero-content {
      position: relative;
      z-index: 2;
      text-align: center;
    }

    .industrial-hero-title {
      font-family: 'Rajdhani', sans-serif;
      font-size: clamp(2.5rem, 6vw, 4.5rem);
      font-weight: 700;
      color: #CD853F;
      line-height: 1.1;
      margin-bottom: 2rem;
      letter-spacing: 0.05em;
      position: relative;
      text-shadow: 0 0 20px rgba(205, 133, 63, 0.5);
      text-transform: uppercase;
    }

    .industrial-hero-title::after {
      content: '';
      position: absolute;
      bottom: -15px;
      left: 50%;
      transform: translateX(-50%);
      width: 100px;
      height: 4px;
      background: linear-gradient(90deg, #CD853F, #4682B4, #B87333);
      border-radius: 0;
      box-shadow: 0 0 15px rgba(205, 133, 63, 0.8);
    }

    .industrial-hero-subtitle {
      font-size: 1.25rem;
      color: #B0B0B0;
      margin-bottom: 3rem;
      font-weight: 500;
      line-height: 1.6;
      max-width: 700px;
      margin-left: auto;
      margin-right: auto;
      letter-spacing: 0.02em;
    }

    /* Buttons */
    .industrial-btn-primary {
      background: linear-gradient(135deg, #CD853F 0%, #B87333 100%);
      color: #2F2F2F;
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
      box-shadow: 0 8px 25px rgba(205, 133, 63, 0.4);
    }

    .industrial-btn-primary::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.6s;
    }

    .industrial-btn-primary:hover::before {
      left: 100%;
    }

    .industrial-btn-primary:hover {
      transform: translateY(-3px) scale(1.05);
      box-shadow: 0 12px 35px rgba(205, 133, 63, 0.6);
      text-shadow: 0 0 10px rgba(47, 47, 47, 0.8);
    }

    .industrial-btn-secondary {
      background: transparent;
      color: #4682B4;
      border: 2px solid #4682B4;
      padding: 1.25rem 3rem;
      border-radius: 0.25rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      backdrop-filter: blur(10px);
    }

    .industrial-btn-secondary:hover {
      background: #4682B4;
      color: #2F2F2F;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(70, 130, 180, 0.4);
    }

    /* Service Cards */
    .industrial-services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 2.5rem;
      margin-top: 4rem;
    }

    .industrial-service-card {
      background: rgba(58, 58, 58, 0.9);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(205, 133, 63, 0.3);
      border-radius: 0.5rem;
      padding: 2.5rem;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }

    .industrial-service-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #CD853F 0%, #4682B4 50%, #B87333 100%);
      transform: scaleX(0);
      transition: transform 0.4s ease;
    }

    .industrial-service-card:hover::before {
      transform: scaleX(1);
    }

    .industrial-service-card::after {
      content: '🔧';
      position: absolute;
      top: 1.5rem;
      right: 1.5rem;
      font-size: 1.5rem;
      opacity: 0.3;
      transition: all 0.3s ease;
    }

    .industrial-service-card:hover::after {
      opacity: 0.8;
      transform: scale(1.2) rotate(15deg);
    }

    .industrial-service-card:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
      background: rgba(58, 58, 58, 0.95);
      border-color: rgba(205, 133, 63, 0.6);
    }

    .industrial-service-title {
      font-family: 'Rajdhani', sans-serif;
      font-size: 1.5rem;
      font-weight: 700;
      color: #CD853F;
      margin-bottom: 1rem;
      letter-spacing: 0.02em;
      text-shadow: 0 0 10px rgba(205, 133, 63, 0.3);
      text-transform: uppercase;
    }

    .industrial-service-description {
      color: #B0B0B0;
      line-height: 1.6;
      margin-bottom: 2rem;
      font-size: 1rem;
    }

    .industrial-service-price {
      font-size: 2rem;
      font-weight: 700;
      color: #4682B4;
      margin-bottom: 0.5rem;
      letter-spacing: -0.02em;
      text-shadow: 0 0 15px rgba(70, 130, 180, 0.5);
    }

    .industrial-service-duration {
      color: #B87333;
      font-size: 0.9rem;
      margin-bottom: 2rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Team Section */
    .industrial-team-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2.5rem;
      margin-top: 4rem;
    }

    .industrial-team-member {
      text-align: center;
      padding: 2.5rem 2rem;
      background: rgba(58, 58, 58, 0.8);
      border-radius: 0.5rem;
      transition: all 0.4s ease;
      border: 1px solid rgba(205, 133, 63, 0.2);
      position: relative;
      overflow: hidden;
    }

    .industrial-team-member::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(205, 133, 63, 0.1) 0%, transparent 70%);
      transform: scale(0);
      transition: transform 0.5s ease;
    }

    .industrial-team-member:hover::before {
      transform: scale(1);
    }

    .industrial-team-member:hover {
      transform: translateY(-8px);
      background: rgba(58, 58, 58, 0.95);
      box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4);
      border-color: rgba(205, 133, 63, 0.5);
    }

    .industrial-team-avatar {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      margin: 0 auto 1.5rem;
      border: 3px solid #CD853F;
      object-fit: cover;
      transition: all 0.4s ease;
      position: relative;
      z-index: 2;
      box-shadow: 0 0 20px rgba(205, 133, 63, 0.4);
    }

    .industrial-team-member:hover .industrial-team-avatar {
      transform: scale(1.1);
      border-color: #4682B4;
      box-shadow: 0 0 30px rgba(70, 130, 180, 0.6);
    }

    .industrial-team-name {
      font-family: 'Rajdhani', sans-serif;
      font-size: 1.25rem;
      font-weight: 700;
      color: #CD853F;
      margin-bottom: 0.5rem;
      letter-spacing: 0.02em;
      position: relative;
      z-index: 2;
      text-shadow: 0 0 10px rgba(205, 133, 63, 0.3);
      text-transform: uppercase;
    }

    .industrial-team-role {
      color: #B0B0B0;
      font-weight: 600;
      font-size: 1rem;
      position: relative;
      z-index: 2;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Contact Section */
    .industrial-contact-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 2.5rem;
      margin-top: 4rem;
    }

    .industrial-contact-card {
      background: rgba(58, 58, 58, 0.9);
      backdrop-filter: blur(20px);
      border-radius: 0.5rem;
      padding: 2.5rem;
      border: 1px solid rgba(205, 133, 63, 0.3);
      position: relative;
      overflow: hidden;
    }

    .industrial-contact-card::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 60px;
      height: 60px;
      background: radial-gradient(circle, rgba(70, 130, 180, 0.2) 0%, transparent 70%);
      border-radius: 0 0.5rem 0 0.5rem;
    }

    .industrial-contact-title {
      font-family: 'Rajdhani', sans-serif;
      font-size: 1.5rem;
      font-weight: 700;
      color: #CD853F;
      margin-bottom: 2rem;
      letter-spacing: 0.02em;
      text-shadow: 0 0 10px rgba(205, 133, 63, 0.3);
      text-transform: uppercase;
    }

    .industrial-contact-item {
      display: flex;
      align-items: center;
      margin-bottom: 1.25rem;
      padding: 1rem;
      border-radius: 0.25rem;
      transition: all 0.3s ease;
    }

    .industrial-contact-item:hover {
      background: rgba(205, 133, 63, 0.1);
      transform: translateX(5px);
    }

    .industrial-contact-icon {
      width: 20px;
      height: 20px;
      margin-right: 1.25rem;
      color: #4682B4;
    }

    .industrial-hours-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
      border-bottom: 1px solid rgba(205, 133, 63, 0.2);
    }

    .industrial-hours-item:last-child {
      border-bottom: none;
    }

    .industrial-hours-day {
      font-weight: 700;
      color: #CD853F;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .industrial-hours-time {
      color: #B0B0B0;
      font-size: 1rem;
      font-weight: 500;
    }

    /* Footer */
    .industrial-footer {
      background: linear-gradient(135deg, #2F2F2F 0%, #1A1A1A 100%);
      color: #B0B0B0;
      padding: 4rem 0 2rem;
      margin-top: 5rem;
      position: relative;
      overflow: hidden;
      border-top: 2px solid rgba(205, 133, 63, 0.3);
    }

    .industrial-footer::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M0,50 Q25,25 50,50 T100,50" fill="none" stroke="rgba(205,133,63,0.05)" stroke-width="1"/></svg>') repeat;
      background-size: 100px 100px;
    }

    .industrial-footer-content {
      text-align: center;
      position: relative;
      z-index: 2;
    }

    .industrial-footer-logo {
      font-family: 'Rajdhani', sans-serif;
      font-size: 2rem;
      font-weight: 700;
      color: #CD853F;
      margin-bottom: 2rem;
      letter-spacing: 0.1em;
      text-shadow: 0 0 20px rgba(205, 133, 63, 0.5);
      text-transform: uppercase;
    }

    .industrial-footer-text {
      color: rgba(176, 176, 176, 0.8);
      margin-bottom: 3rem;
      font-size: 1.05rem;
      line-height: 1.6;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }

    .industrial-social-links {
      display: flex;
      justify-content: center;
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .industrial-social-link {
      width: 55px;
      height: 55px;
      background: rgba(205, 133, 63, 0.1);
      border-radius: 0.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #CD853F;
      text-decoration: none;
      transition: all 0.3s ease;
      border: 2px solid rgba(205, 133, 63, 0.3);
      font-size: 1.5rem;
    }

    .industrial-social-link:hover {
      background: #CD853F;
      color: #2F2F2F;
      transform: translateY(-3px) scale(1.1);
      border-color: #CD853F;
      box-shadow: 0 8px 25px rgba(205, 133, 63, 0.4);
    }

    .industrial-copyright {
      color: rgba(176, 176, 176, 0.6);
      font-size: 0.9rem;
      border-top: 1px solid rgba(205, 133, 63, 0.2);
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
