import { DesignTemplate } from './types';

export const vintageParisienTemplate: DesignTemplate = {
  id: 'vintage-parisien',
  name: 'Vintage Parisien',
  category: 'classic',
  description: 'Élégance parisienne authentique avec ornements Belle Époque, typographies raffinées et palette bordeaux-or sophistiquée',
  preview: '/templates/previews/vintage-parisien.jpg',
  theme: {
    colors: {
      primary: '#722F37', // Bordeaux parisien raffiné
      secondary: '#D4AF37', // Or français authentique
      accent: '#B8860B', // Bronze doré
      background: '#FAF7F2', // Crème parisienne
      surface: '#FFFFFF', // Blanc pur
      text: '#2C1810', // Brun foncé élégant
      textSecondary: '#6B4423', // Sépia raffiné
      custom: {
        bordeaux: '#722F37', // Bordeaux parisien
        champagne: '#F7E7CE', // Champagne doré
        ivoire: '#FFFFF0', // Ivoire précieux
        sepia: '#8B7355', // Sépia vintage
        bronze: '#CD7F32', // Bronze antique
        mahogany: '#C04000', // Acajou précieux
        pearl: '#F8F6F0', // Perle nacrée
        velvet: '#4A1C40' // Velours profond
      }
    },
    typography: {
      headingFont: 'Playfair Display Variable, serif',
      bodyFont: 'Crimson Text Variable, serif',
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
        blur: '15px',
        opacity: '0.1',
        border: '1px solid rgba(218, 165, 32, 0.2)'
      },
      animations: ['vintageGlow', 'ornamentFloat', 'sepiaFade'],
      transitions: ['elegant', 'classic'],
      specialEffects: ['dustParticles', 'vintagePaper', 'ornaments'],
      shadows: {
        sm: '0 2px 4px rgba(139, 0, 0, 0.1)',
        md: '0 4px 8px rgba(139, 0, 0, 0.15)',
        lg: '0 8px 16px rgba(139, 0, 0, 0.2)',
        xl: '0 16px 32px rgba(139, 0, 0, 0.25)',
        neon: '0 0 15px rgba(218, 165, 32, 0.4)'
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
    patterns: ['belle-epoque', 'ornamental', 'vintage-border'],
    particles: [
      {
        type: 'floating',
        count: 25,
        size: { min: 3, max: 8 },
        speed: { min: 0.3, max: 0.8 },
        color: '#DAA520',
        opacity: { min: 0.2, max: 0.5 }
      },
      {
        type: 'sparkle',
        count: 15,
        size: { min: 1, max: 3 },
        speed: { min: 0.5, max: 1.2 },
        color: '#CD853F',
        opacity: { min: 0.3, max: 0.7 }
      }
    ]
  },
  customCSS: `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800;1,900&family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&display=swap');
    
    .vintage-parisien {
      font-family: 'Crimson Text', serif;
      background: linear-gradient(135deg, #FAF7F2 0%, #F8F6F0 100%);
      min-height: 100vh;
      position: relative;
      overflow-x: hidden;
    }

    .vintage-parisien h1, 
    .vintage-parisien h2, 
    .vintage-parisien h3 {
      font-family: 'Playfair Display', serif;
    }

    /* Texture papier vintage parisien */
    .vintage-parisien::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        radial-gradient(circle at 25% 25%, rgba(212, 175, 55, 0.03) 0%, transparent 50%),
        radial-gradient(circle at 75% 75%, rgba(114, 47, 55, 0.02) 0%, transparent 50%),
        linear-gradient(45deg, transparent 49%, rgba(184, 134, 11, 0.01) 50%, transparent 51%);
      background-size: 400px 400px, 350px 350px, 30px 30px;
      pointer-events: none;
      z-index: 0;
      filter: sepia(5%) contrast(102%);
    }

    /* Ornements Belle Époque flottants */
    .vintage-parisien::after {
      content: '';
      position: fixed;
      top: -10%;
      left: -10%;
      width: 120%;
      height: 120%;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M20,50 Q35,25 50,50 Q65,75 80,50" fill="none" stroke="%23D4AF37" stroke-width="0.3" opacity="0.04"><animate attributeName="opacity" values="0.04;0.08;0.04" dur="8s" repeatCount="indefinite"/></path><circle cx="30" cy="30" r="1.5" fill="%23722F37" opacity="0.03"><animate attributeName="opacity" values="0.03;0.06;0.03" dur="6s" repeatCount="indefinite"/></circle><path d="M70,25 Q75,30 70,35 Q65,30 70,25" fill="%23B8860B" opacity="0.02"><animate attributeName="opacity" values="0.02;0.05;0.02" dur="7s" repeatCount="indefinite"/></path></svg>') repeat;
      background-size: 250px 250px;
      animation: ornementParisien 25s linear infinite;
      pointer-events: none;
      z-index: 1;
    }

    @keyframes ornementParisien {
      0% { transform: translateX(0) translateY(0) rotate(0deg); }
      100% { transform: translateX(-250px) translateY(-250px) rotate(360deg); }
    }

    /* Navigation parisienne raffinée */
    .navbar {
      background: rgba(250, 247, 242, 0.97);
      backdrop-filter: blur(25px);
      -webkit-backdrop-filter: blur(25px);
      border-bottom: 1px solid rgba(212, 175, 55, 0.2);
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      padding: 1.25rem 0;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 2px 20px rgba(114, 47, 55, 0.08);
    }

    .navbar.scrolled {
      background: rgba(250, 247, 242, 0.99);
      box-shadow: 0 4px 30px rgba(114, 47, 55, 0.12);
      border-bottom-color: rgba(212, 175, 55, 0.3);
    }

    .nav-logo {
      font-family: 'Playfair Display', serif;
      font-size: 1.875rem;
      font-weight: 700;
      color: #722F37;
      letter-spacing: 0.02em;
      position: relative;
      font-style: italic;
    }

    .nav-logo::after {
      content: '🌹';
      margin-left: 0.75rem;
      font-size: 1.25rem;
      animation: roseParisienne 4s ease-in-out infinite;
      filter: sepia(30%) hue-rotate(320deg) saturate(150%);
    }

    @keyframes roseParisienne {
      0%, 100% { transform: scale(1) rotate(-2deg); filter: sepia(30%) hue-rotate(320deg) saturate(150%); }
      50% { transform: scale(1.08) rotate(2deg); filter: sepia(50%) hue-rotate(320deg) saturate(180%); }
    }

    .nav-link {
      color: #2C1810;
      text-decoration: none;
      font-weight: 600;
      padding: 0.875rem 1.75rem;
      border-radius: 0.75rem;
      transition: all 0.4s ease;
      position: relative;
      overflow: hidden;
      font-size: 0.95rem;
      letter-spacing: 0.025em;
      font-style: italic;
    }

    .nav-link::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.15), transparent);
      transition: left 0.6s ease;
    }

    .nav-link:hover::before {
      left: 100%;
    }

    .nav-link:hover {
      color: #722F37;
      background: rgba(212, 175, 55, 0.08);
      transform: translateY(-1px);
    }

    /* Hero Section parisienne raffinée */
    .hero-section {
      min-height: 100vh;
      display: flex;
      align-items: center;
      position: relative;
      padding: 6rem 0 4rem;
      background: linear-gradient(135deg, rgba(250, 247, 242, 0.95) 0%, rgba(248, 246, 240, 0.9) 100%);
      overflow: hidden;
    }

    .hero-content {
      position: relative;
      z-index: 2;
      text-align: center;
    }

    .hero-title {
      font-family: 'Playfair Display', serif;
      font-size: clamp(2.75rem, 5.5vw, 4.5rem);
      font-weight: 800;
      color: #722F37;
      line-height: 1.15;
      margin-bottom: 2rem;
      letter-spacing: 0.02em;
      position: relative;
      font-style: italic;
    }

    .hero-title::after {
      content: '';
      position: absolute;
      bottom: -20px;
      left: 50%;
      transform: translateX(-50%);
      width: 140px;
      height: 4px;
      background: linear-gradient(90deg, #722F37, #D4AF37, #B8860B);
      border-radius: 2px;
      animation: parisienneGlow 4s ease-in-out infinite;
    }

    @keyframes parisienneGlow {
      0%, 100% { opacity: 0.8; box-shadow: 0 0 10px rgba(212, 175, 55, 0.3); }
      50% { opacity: 1; box-shadow: 0 0 20px rgba(212, 175, 55, 0.6); }
    }

    .hero-subtitle {
      font-size: 1.375rem;
      color: #2C1810;
      margin-bottom: 3.5rem;
      font-weight: 500;
      line-height: 1.7;
      max-width: 700px;
      margin-left: auto;
      margin-right: auto;
      letter-spacing: 0.015em;
      font-style: italic;
    }

    /* Boutons parisiens raffinés */
    .btn-primary {
      background: linear-gradient(135deg, #722F37 0%, #4A1C40 100%);
      color: #FAF7F2;
      border: none;
      padding: 1.375rem 3.5rem;
      border-radius: 0.75rem;
      font-weight: 700;
      font-size: 1.125rem;
      cursor: pointer;
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      letter-spacing: 0.05em;
      box-shadow: 0 10px 30px rgba(114, 47, 55, 0.3);
      border: 2px solid rgba(212, 175, 55, 0.3);
      font-family: 'Playfair Display', serif;
      font-style: italic;
    }

    .btn-primary::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.3), transparent);
      transition: left 0.7s ease;
    }

    .btn-primary:hover::before {
      left: 100%;
    }

    .btn-primary:hover {
      transform: translateY(-4px) scale(1.05);
      box-shadow: 0 15px 40px rgba(114, 47, 55, 0.5);
      border-color: rgba(212, 175, 55, 0.6);
    }

    .btn-secondary {
      background: rgba(250, 247, 242, 0.95);
      color: #722F37;
      border: 2px solid #D4AF37;
      padding: 1.375rem 3.5rem;
      border-radius: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.4s ease;
      letter-spacing: 0.05em;
      backdrop-filter: blur(15px);
      font-family: 'Playfair Display', serif;
      font-style: italic;
    }

    .btn-secondary:hover {
      background: #D4AF37;
      color: #FAF7F2;
      transform: translateY(-3px);
      box-shadow: 0 10px 30px rgba(212, 175, 55, 0.4);
    }

    /* Service Cards parisiennes raffinées */
    .service-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(25px);
      -webkit-backdrop-filter: blur(25px);
      border: 1px solid rgba(212, 175, 55, 0.25);
      border-radius: 1rem;
      padding: 3rem;
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(114, 47, 55, 0.08);
    }

    .service-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #722F37 0%, #D4AF37 50%, #B8860B 100%);
      transform: scaleX(0);
      transition: transform 0.5s ease;
      border-radius: 1rem 1rem 0 0;
    }

    .service-card:hover::before {
      transform: scaleX(1);
    }

    .service-card::after {
      content: '✨';
      position: absolute;
      top: 2rem;
      right: 2rem;
      font-size: 1.5rem;
      opacity: 0.4;
      transition: all 0.4s ease;
      filter: sepia(30%) hue-rotate(15deg);
    }

    .service-card:hover::after {
      opacity: 0.9;
      transform: scale(1.4) rotate(20deg);
      animation: parisienneSparkle 2s ease-in-out infinite;
    }

    @keyframes parisienneSparkle {
      0%, 100% { transform: scale(1.4) rotate(20deg); filter: sepia(30%) hue-rotate(15deg); }
      50% { transform: scale(1.6) rotate(30deg); filter: sepia(60%) hue-rotate(25deg); }
    }

    .service-card:hover {
      transform: translateY(-12px) scale(1.02);
      box-shadow: 0 25px 50px rgba(114, 47, 55, 0.15);
      background: rgba(255, 255, 255, 0.98);
      border-color: rgba(212, 175, 55, 0.5);
    }

    .service-title {
      font-family: 'Playfair Display', serif;
      font-size: 1.625rem;
      font-weight: 700;
      color: #722F37;
      margin-bottom: 1.25rem;
      letter-spacing: 0.015em;
      font-style: italic;
    }

    .service-description {
      color: #2C1810;
      line-height: 1.75;
      margin-bottom: 2.25rem;
      font-size: 1.0625rem;
      font-style: italic;
    }

    .service-price {
      font-size: 2.5rem;
      font-weight: 800;
      color: #D4AF37;
      margin-bottom: 0.75rem;
      letter-spacing: -0.02em;
      font-family: 'Playfair Display', serif;
      font-style: italic;
    }

    .service-duration {
      color: #B8860B;
      font-size: 1rem;
      margin-bottom: 2rem;
      font-weight: 600;
      letter-spacing: 0.025em;
      font-style: italic;
      text-transform: capitalize;
    }

    /* Team Section parisienne raffinée */
    .team-member {
      text-align: center;
      padding: 3rem 2.5rem;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 1rem;
      transition: all 0.5s ease;
      border: 1px solid rgba(212, 175, 55, 0.25);
      position: relative;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(114, 47, 55, 0.08);
    }

    .team-member::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, transparent 70%);
      transform: scale(0);
      transition: transform 0.6s ease;
    }

    .team-member:hover::before {
      transform: scale(1);
    }

    .team-member:hover {
      transform: translateY(-10px) scale(1.02);
      background: rgba(255, 255, 255, 0.98);
      box-shadow: 0 20px 50px rgba(114, 47, 55, 0.12);
      border-color: rgba(212, 175, 55, 0.5);
    }

    .team-avatar {
      width: 130px;
      height: 130px;
      border-radius: 50%;
      margin: 0 auto 1.75rem;
      border: 4px solid #D4AF37;
      object-fit: cover;
      transition: all 0.5s ease;
      position: relative;
      z-index: 2;
      box-shadow: 0 0 25px rgba(212, 175, 55, 0.3);
      filter: sepia(8%) contrast(105%);
    }

    .team-member:hover .team-avatar {
      transform: scale(1.08);
      border-color: #722F37;
      box-shadow: 0 0 35px rgba(114, 47, 55, 0.4);
      filter: sepia(15%) contrast(110%);
    }

    .team-name {
      font-family: 'Playfair Display', serif;
      font-size: 1.375rem;
      font-weight: 700;
      color: #722F37;
      margin-bottom: 0.75rem;
      letter-spacing: 0.015em;
      position: relative;
      z-index: 2;
      font-style: italic;
    }

    .team-role {
      color: #2C1810;
      font-weight: 600;
      font-size: 1.0625rem;
      position: relative;
      z-index: 2;
      letter-spacing: 0.025em;
      font-style: italic;
    }

    /* Contact Section parisienne raffinée */
    .contact-info {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(25px);
      border-radius: 1rem;
      padding: 3rem;
      border: 1px solid rgba(212, 175, 55, 0.25);
      position: relative;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(114, 47, 55, 0.08);
      transition: all 0.4s ease;
    }

    .contact-info:hover {
      transform: translateY(-6px);
      box-shadow: 0 20px 40px rgba(114, 47, 55, 0.12);
    }

    .contact-info::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 80px;
      height: 80px;
      background: radial-gradient(circle, rgba(184, 134, 11, 0.15) 0%, transparent 70%);
      border-radius: 0 1rem 0 1rem;
    }

    .contact-title {
      font-family: 'Playfair Display', serif;
      font-size: 1.625rem;
      font-weight: 700;
      color: #722F37;
      margin-bottom: 2.25rem;
      letter-spacing: 0.015em;
      font-style: italic;
    }

    .contact-item {
      display: flex;
      align-items: center;
      margin-bottom: 1.5rem;
      padding: 1.25rem;
      border-radius: 0.75rem;
      transition: all 0.4s ease;
      color: #2C1810;
    }

    .contact-item:hover {
      background: rgba(212, 175, 55, 0.08);
      transform: translateX(8px);
    }

    .contact-icon {
      width: 22px;
      height: 22px;
      margin-right: 1.5rem;
      color: #D4AF37;
      font-size: 1.25rem;
    }

    .hours-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 0;
      border-bottom: 1px solid rgba(212, 175, 55, 0.2);
      transition: all 0.3s ease;
    }

    .hours-item:last-child {
      border-bottom: none;
    }

    .hours-item:hover {
      background: rgba(212, 175, 55, 0.05);
      padding-left: 0.75rem;
      padding-right: 0.75rem;
      border-radius: 0.75rem;
    }

    .hours-day {
      font-weight: 700;
      color: #722F37;
      letter-spacing: 0.025em;
      font-style: italic;
      font-family: 'Playfair Display', serif;
    }

    .hours-time {
      color: #2C1810;
      font-size: 1.0625rem;
      font-weight: 500;
      font-style: italic;
    }

    /* Footer parisien raffiné */
    .footer {
      background: linear-gradient(135deg, #722F37 0%, #4A1C40 100%);
      color: #FAF7F2;
      padding: 5rem 0 2.5rem;
      margin-top: 6rem;
      position: relative;
      overflow: hidden;
    }

    .footer::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M20,50 Q40,25 60,50 Q80,75 100,50" fill="none" stroke="rgba(212,175,55,0.08)" stroke-width="0.8"/><circle cx="25" cy="25" r="1.5" fill="rgba(212,175,55,0.06)"/><circle cx="75" cy="75" r="1" fill="rgba(184,134,11,0.04)"/><path d="M30,70 Q35,65 40,70 Q45,75 50,70" fill="none" stroke="rgba(212,175,55,0.05)" stroke-width="0.6"/></svg>') repeat;
      background-size: 150px 150px;
    }

    .footer-content {
      text-align: center;
      position: relative;
      z-index: 2;
    }

    .footer-logo {
      font-family: 'Playfair Display', serif;
      font-size: 2.25rem;
      font-weight: 800;
      color: #FAF7F2;
      margin-bottom: 2.5rem;
      letter-spacing: 0.025em;
      font-style: italic;
    }

    .footer-text {
      color: rgba(250, 247, 242, 0.9);
      margin-bottom: 3.5rem;
      font-size: 1.125rem;
      line-height: 1.75;
      max-width: 650px;
      margin-left: auto;
      margin-right: auto;
      font-style: italic;
    }

    .social-links {
      display: flex;
      justify-content: center;
      gap: 2.5rem;
      margin-bottom: 3.5rem;
    }

    .social-link {
      width: 60px;
      height: 60px;
      background: rgba(212, 175, 55, 0.15);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FAF7F2;
      text-decoration: none;
      transition: all 0.4s ease;
      border: 2px solid rgba(212, 175, 55, 0.3);
      font-size: 1.625rem;
    }

    .social-link:hover {
      background: #D4AF37;
      color: #722F37;
      transform: translateY(-4px) scale(1.1);
      border-color: #D4AF37;
      box-shadow: 0 10px 30px rgba(212, 175, 55, 0.4);
    }

    .copyright {
      color: rgba(250, 247, 242, 0.8);
      font-size: 0.9375rem;
      border-top: 1px solid rgba(212, 175, 55, 0.2);
      padding-top: 2.5rem;
      font-style: italic;
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

    @keyframes sepiaFade {
      0%, 100% { filter: sepia(10%) saturate(110%); }
      50% { filter: sepia(30%) saturate(130%); }
    }

    @keyframes vintagePulse {
      0%, 100% { transform: scale(1); filter: sepia(10%); }
      50% { transform: scale(1.05); filter: sepia(25%); }
    }

    .fade-in-up {
      animation: fadeInUp 0.8s ease-out;
    }

    .vintage-glow {
      filter: sepia(20%) saturate(120%) hue-rotate(15deg);
      animation: vintageGlow 5s ease-in-out infinite;
    }

    .vintage-pulse {
      animation: vintagePulse 4s ease-in-out infinite;
    }

    .stagger-1 { animation-delay: 0.1s; }
    .stagger-2 { animation-delay: 0.2s; }
    .stagger-3 { animation-delay: 0.3s; }
    .stagger-4 { animation-delay: 0.4s; }

    /* Ornamental Dividers */
    .ornamental-divider {
      text-align: center;
      margin: 3rem 0;
      position: relative;
    }
    
    .ornamental-divider::before {
      content: '❦';
      font-size: 2rem;
      color: #DAA520;
      background: #FFF8DC;
      padding: 0 1rem;
      position: relative;
      z-index: 2;
    }
    
    .ornamental-divider::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, #DAA520, transparent);
      z-index: 1;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .vintage-hero-title {
        font-size: 2.5rem;
      }
      
      .vintage-service-card {
        padding: 2rem;
      }
      
      .vintage-btn-primary, .vintage-btn-secondary {
        padding: 1rem 2rem;
        font-size: 1rem;
      }

      .vintage-services-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .vintage-team-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .vintage-contact-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
    }

    /* Scroll Animations */
    @media (prefers-reduced-motion: no-preference) {
      .vintage-service-card {
        opacity: 0;
        transform: translateY(30px);
        animation: fadeInUp 0.8s ease-out forwards;
      }

      .vintage-team-member {
        opacity: 0;
        transform: translateY(30px);
        animation: fadeInUp 0.8s ease-out forwards;
      }
    }
  `
};
