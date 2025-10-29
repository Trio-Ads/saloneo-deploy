import { DesignTemplate } from './types';

export const minimalScandinavianTemplate: DesignTemplate = {
  id: 'minimal-scandinavian',
  name: 'Minimaliste Scandinave',
  category: 'minimal',
  description: 'Design épuré nordique avec espaces blancs généreux, typographie raffinée et micro-interactions subtiles',
  preview: '/templates/previews/minimal-scandinavian.jpg',
  theme: {
    colors: {
      primary: '#2E3440', // Gris nordique profond
      secondary: '#5E81AC', // Bleu nordique
      accent: '#88C0D0', // Bleu glacier
      background: '#FEFEFE', // Blanc neige
      surface: '#FFFFFF', // Blanc pur
      text: '#2E3440', // Gris foncé nordique
      textSecondary: '#4C566A', // Gris moyen nordique
      custom: {
        ice: '#ECEFF4', // Glace claire
        snow: '#E5E9F0', // Neige
        frost: '#D8DEE9', // Givre
        aurora: '#8FBCBB', // Aurore boréale
        pine: '#A3BE8C', // Pin nordique
        warm: '#EBCB8B', // Chaleur nordique
        gradient1: '#5E81AC',
        gradient2: '#88C0D0',
        gradient3: '#8FBCBB'
      }
    },
    typography: {
      headingFont: 'Inter Variable, system-ui, sans-serif',
      bodyFont: 'Inter, system-ui, sans-serif',
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
        blur: '20px',
        opacity: '0.05',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      },
      animations: ['fadeInUp', 'breathe', 'parallaxScroll'],
      transitions: ['smooth', 'elastic'],
      specialEffects: ['nordicAurora', 'snowParticles'],
      shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        neon: '0 0 20px rgba(173, 181, 189, 0.3)'
      }
    },
    layout: {
      borderRadius: {
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        full: '9999px'
      },
      spacing: {
        xs: '0.5rem',
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
        xl: '3rem'
      },
      containers: {
        maxWidth: '1200px',
        padding: '2rem'
      }
    }
  },
  assets: {
    patterns: ['nordic-lines', 'minimal-grid'],
    particles: [{
      type: 'floating',
      count: 15,
      size: { min: 2, max: 4 },
      speed: { min: 0.5, max: 1 },
      color: '#ADB5BD',
      opacity: { min: 0.1, max: 0.3 }
    }]
  },
  customCSS: `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    .minimal-scandinavian {
      font-family: 'Inter', system-ui, sans-serif;
      background: linear-gradient(135deg, #FEFEFE 0%, #ECEFF4 100%);
      min-height: 100vh;
      position: relative;
    }

    .minimal-scandinavian h1, 
    .minimal-scandinavian h2, 
    .minimal-scandinavian h3 {
      font-family: 'Inter', sans-serif;
    }

    /* Background Pattern nordique */
    .minimal-scandinavian::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        radial-gradient(circle at 20% 80%, rgba(94, 129, 172, 0.03) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(136, 192, 208, 0.02) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(143, 188, 187, 0.02) 0%, transparent 50%);
      pointer-events: none;
      z-index: 0;
    }

    /* Navigation nordique */
    .navbar {
      background: rgba(254, 254, 254, 0.95);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(94, 129, 172, 0.08);
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      padding: 1rem 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 1px 3px 0 rgba(46, 52, 64, 0.05);
    }

    .navbar.scrolled {
      background: rgba(254, 254, 254, 0.98);
      box-shadow: 0 4px 20px rgba(46, 52, 64, 0.08);
    }

    .nav-logo {
      font-family: 'Inter', sans-serif;
      font-size: 1.5rem;
      font-weight: 600;
      color: #2E3440;
      letter-spacing: -0.02em;
    }

    .nav-link {
      color: #4C566A;
      text-decoration: none;
      font-weight: 400;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      transition: all 0.3s ease;
      position: relative;
    }

    .nav-link:hover {
      color: #2E3440;
      background: rgba(94, 129, 172, 0.05);
      transform: translateY(-1px);
    }

    .nav-link::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      width: 0;
      height: 2px;
      background: linear-gradient(90deg, #5E81AC 0%, #88C0D0 100%);
      transition: all 0.3s ease;
      transform: translateX(-50%);
    }

    .nav-link:hover::after {
      width: 80%;
    }

    /* Hero Section nordique */
    .hero-section {
      min-height: 100vh;
      display: flex;
      align-items: center;
      position: relative;
      padding: 6rem 0 4rem;
      background: linear-gradient(135deg, rgba(254, 254, 254, 0.9) 0%, rgba(236, 239, 244, 0.8) 100%);
      overflow: hidden;
    }

    .hero-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><defs><radialGradient id="a" cx="50%" cy="50%"><stop offset="0%" stop-color="%235E81AC" stop-opacity="0.05"/><stop offset="100%" stop-color="%235E81AC" stop-opacity="0"/></radialGradient><radialGradient id="b" cx="50%" cy="50%"><stop offset="0%" stop-color="%2388C0D0" stop-opacity="0.03"/><stop offset="100%" stop-color="%2388C0D0" stop-opacity="0"/></radialGradient></defs><circle cx="200" cy="200" r="150" fill="url(%23a)"/><circle cx="800" cy="300" r="100" fill="url(%23b)"/><circle cx="600" cy="700" r="120" fill="url(%23a)"/></svg>') no-repeat center center;
      background-size: cover;
      opacity: 0.4;
    }

    .hero-content {
      position: relative;
      z-index: 2;
      text-align: center;
    }

    .hero-title {
      font-family: 'Inter', sans-serif;
      font-size: clamp(2.5rem, 5vw, 4rem);
      font-weight: 300;
      color: #2E3440;
      line-height: 1.1;
      margin-bottom: 1.5rem;
      letter-spacing: -0.03em;
    }

    .hero-subtitle {
      font-size: 1.125rem;
      color: #4C566A;
      margin-bottom: 3rem;
      font-weight: 400;
      line-height: 1.6;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }

    /* Boutons nordiques */
    .btn-primary {
      background: linear-gradient(135deg, #2E3440 0%, #5E81AC 100%);
      color: white;
      border: none;
      padding: 1rem 2.5rem;
      border-radius: 0.5rem;
      font-weight: 500;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      letter-spacing: 0.01em;
      font-family: 'Inter', sans-serif;
      box-shadow: 0 4px 15px rgba(46, 52, 64, 0.2);
    }

    .btn-primary::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
      transition: left 0.5s;
    }

    .btn-primary:hover::before {
      left: 100%;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(46, 52, 64, 0.3);
      background: linear-gradient(135deg, #5E81AC 0%, #88C0D0 100%);
    }

    .btn-secondary {
      background: transparent;
      color: #4C566A;
      border: 1px solid #D8DEE9;
      padding: 1rem 2.5rem;
      border-radius: 0.5rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      letter-spacing: 0.01em;
      font-family: 'Inter', sans-serif;
    }

    .btn-secondary:hover {
      background: #ECEFF4;
      color: #2E3440;
      border-color: #5E81AC;
      transform: translateY(-1px);
      box-shadow: 0 4px 15px rgba(94, 129, 172, 0.15);
    }

    /* Service Cards nordiques */
    .service-card {
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(216, 222, 233, 0.5);
      border-radius: 1rem;
      padding: 2rem;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(46, 52, 64, 0.05);
    }

    .service-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #5E81AC 0%, #88C0D0 100%);
      transform: scaleX(0);
      transition: transform 0.3s ease;
    }

    .service-card:hover::before {
      transform: scaleX(1);
    }

    .service-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 40px rgba(94, 129, 172, 0.15);
      background: rgba(255, 255, 255, 0.95);
      border-color: rgba(94, 129, 172, 0.3);
    }

    .service-title {
      font-family: 'Inter', sans-serif;
      font-size: 1.25rem;
      font-weight: 600;
      color: #2E3440;
      margin-bottom: 0.75rem;
      letter-spacing: -0.01em;
    }

    .service-description {
      color: #4C566A;
      line-height: 1.6;
      margin-bottom: 1.5rem;
      font-size: 0.95rem;
    }

    .service-price {
      font-size: 1.75rem;
      font-weight: 300;
      color: #5E81AC;
      margin-bottom: 0.5rem;
      letter-spacing: -0.02em;
      font-family: 'Inter', sans-serif;
    }

    .service-duration {
      color: #88C0D0;
      font-size: 0.875rem;
      margin-bottom: 1.5rem;
      font-weight: 500;
    }

    /* Team Section nordique */
    .team-member {
      text-align: center;
      padding: 2rem 1.5rem;
      background: rgba(255, 255, 255, 0.6);
      border-radius: 1rem;
      transition: all 0.3s ease;
      border: 1px solid rgba(216, 222, 233, 0.3);
      backdrop-filter: blur(10px);
    }

    .team-member:hover {
      transform: translateY(-5px);
      background: rgba(255, 255, 255, 0.9);
      box-shadow: 0 15px 30px rgba(94, 129, 172, 0.1);
      border-color: rgba(94, 129, 172, 0.2);
    }

    .team-avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      margin: 0 auto 1.5rem;
      border: 3px solid #ECEFF4;
      object-fit: cover;
      transition: all 0.3s ease;
      box-shadow: 0 8px 25px rgba(94, 129, 172, 0.15);
    }

    .team-member:hover .team-avatar {
      transform: scale(1.05);
      border-color: #5E81AC;
      box-shadow: 0 12px 35px rgba(94, 129, 172, 0.25);
    }

    .team-name {
      font-family: 'Inter', sans-serif;
      font-size: 1.125rem;
      font-weight: 600;
      color: #2E3440;
      margin-bottom: 0.5rem;
      letter-spacing: -0.01em;
    }

    .team-role {
      color: #5E81AC;
      font-weight: 400;
      font-size: 0.875rem;
    }

    /* Contact Section nordique */
    .contact-info {
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(20px);
      border-radius: 1rem;
      padding: 2rem;
      border: 1px solid rgba(216, 222, 233, 0.5);
      transition: all 0.3s ease;
    }

    .contact-info:hover {
      transform: translateY(-4px);
      box-shadow: 0 15px 35px rgba(94, 129, 172, 0.1);
    }

    .contact-title {
      font-family: 'Inter', sans-serif;
      font-size: 1.25rem;
      font-weight: 600;
      color: #2E3440;
      margin-bottom: 1.5rem;
      letter-spacing: -0.01em;
    }

    .contact-item {
      display: flex;
      align-items: center;
      margin-bottom: 1rem;
      padding: 0.75rem;
      border-radius: 0.5rem;
      transition: all 0.3s ease;
    }

    .contact-item:hover {
      background: rgba(94, 129, 172, 0.05);
      transform: translateX(4px);
    }

    .contact-icon {
      width: 18px;
      height: 18px;
      margin-right: 1rem;
      color: #88C0D0;
      font-size: 1.125rem;
    }

    /* Horaires nordiques */
    .hours-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0;
      border-bottom: 1px solid rgba(216, 222, 233, 0.3);
      transition: all 0.3s ease;
    }

    .hours-item:last-child {
      border-bottom: none;
    }

    .hours-item:hover {
      background: rgba(94, 129, 172, 0.05);
      padding-left: 0.5rem;
      padding-right: 0.5rem;
      border-radius: 0.5rem;
    }

    .hours-day {
      font-weight: 500;
      color: #2E3440;
      font-family: 'Inter', sans-serif;
    }

    .hours-time {
      color: #4C566A;
      font-size: 0.9rem;
    }

    /* Footer nordique */
    .footer {
      background: linear-gradient(135deg, #ECEFF4 0%, #E5E9F0 100%);
      color: #4C566A;
      padding: 3rem 0 2rem;
      margin-top: 4rem;
      border-top: 1px solid rgba(216, 222, 233, 0.5);
    }

    .footer-content {
      text-align: center;
    }

    .footer-logo {
      font-family: 'Inter', sans-serif;
      font-size: 1.5rem;
      font-weight: 600;
      color: #2E3440;
      margin-bottom: 1rem;
      letter-spacing: -0.02em;
    }

    .footer-text {
      color: #4C566A;
      margin-bottom: 2rem;
      font-size: 0.95rem;
    }

    .social-links {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .social-link {
      width: 45px;
      height: 45px;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #4C566A;
      text-decoration: none;
      transition: all 0.3s ease;
      border: 1px solid rgba(216, 222, 233, 0.5);
      font-size: 1.125rem;
    }

    .social-link:hover {
      background: #5E81AC;
      color: white;
      transform: translateY(-2px);
      border-color: #5E81AC;
      box-shadow: 0 8px 25px rgba(94, 129, 172, 0.25);
    }

    .copyright {
      color: #88C0D0;
      font-size: 0.875rem;
      border-top: 1px solid rgba(216, 222, 233, 0.3);
      padding-top: 2rem;
    }

    /* Animations nordiques */
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

    @keyframes breathe {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.01); }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }

    @keyframes nordicAurora {
      0%, 100% { 
        background-position: 0% 50%;
      }
      50% { 
        background-position: 100% 50%;
      }
    }

    /* Utility Classes */
    .fade-in-up {
      animation: fadeInUp 0.8s ease-out;
    }

    .breathe {
      animation: breathe 6s ease-in-out infinite;
    }

    .float {
      animation: float 3s ease-in-out infinite;
    }

    .stagger-1 { animation-delay: 0.1s; }
    .stagger-2 { animation-delay: 0.2s; }
    .stagger-3 { animation-delay: 0.3s; }
    .stagger-4 { animation-delay: 0.4s; }

    /* Responsive Design */
    @media (max-width: 768px) {
      .hero-title {
        font-size: 2.5rem;
      }
      
      .service-card {
        padding: 1.5rem;
        margin-bottom: 1rem;
      }
      
      .btn-primary, .btn-secondary {
        padding: 0.875rem 2rem;
        font-size: 0.95rem;
        width: 100%;
      }

      .team-member {
        padding: 1.5rem;
      }

      .contact-info {
        padding: 1.5rem;
      }
    }

    /* Grid Layout for Services */
    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 2rem;
      padding: 2rem 0;
    }

    @media (max-width: 640px) {
      .services-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
        padding: 1rem 0;
      }
    }

    /* Scroll Animations */
    @media (prefers-reduced-motion: no-preference) {
      .service-card {
        opacity: 0;
        transform: translateY(20px);
        animation: fadeInUp 0.6s ease-out forwards;
      }

      .team-member {
        opacity: 0;
        transform: translateY(20px);
        animation: fadeInUp 0.6s ease-out forwards;
      }
    }
  `,
  customAnimations: [
    {
      name: 'fadeInUp',
      keyframes: `
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      `,
      duration: '0.8s',
      timing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    },
    {
      name: 'breathe',
      keyframes: `
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.01); }
      `,
      duration: '6s',
      timing: 'ease-in-out'
    },
    {
      name: 'nordicAurora',
      keyframes: `
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      `,
      duration: '8s',
      timing: 'ease-in-out'
    }
  ]
};
