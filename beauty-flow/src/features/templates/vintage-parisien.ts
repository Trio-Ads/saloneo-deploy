import { DesignTemplate } from './types';

export const vintageParisienTemplate: DesignTemplate = {
  id: 'vintage-parisien',
  name: 'Vintage Parisien',
  category: 'classic',
  description: 'Ornements Belle Époque, typographies cursives, palette crème/bordeaux/or vieilli',
  preview: '/templates/previews/vintage-parisien.jpg',
  theme: {
    colors: {
      primary: '#8B0000',
      secondary: '#DAA520',
      accent: '#CD853F',
      background: '#FFF8DC',
      surface: '#FFFEF7',
      text: '#2F1B14',
      textSecondary: '#8B4513',
      custom: {
        bordeaux: '#8B0000',
        gold: '#DAA520',
        cream: '#FFF8DC',
        sepia: '#704214',
        antique: '#FAEBD7',
        bronze: '#CD7F32',
        champagne: '#F7E7CE',
        mahogany: '#C04000'
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
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&family=Crimson+Text:wght@400;600;700&display=swap');
    
    .vintage-parisien-2025 {
      font-family: 'Crimson Text', serif;
      background: linear-gradient(135deg, #FFF8DC 0%, #FAEBD7 100%);
      min-height: 100vh;
      position: relative;
      overflow-x: hidden;
    }

    /* Vintage Paper Texture */
    .vintage-parisien-2025::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        radial-gradient(circle at 20% 30%, rgba(218, 165, 32, 0.05) 0%, transparent 50%),
        radial-gradient(circle at 80% 70%, rgba(139, 0, 0, 0.03) 0%, transparent 50%),
        linear-gradient(45deg, transparent 48%, rgba(205, 133, 63, 0.02) 50%, transparent 52%);
      background-size: 300px 300px, 250px 250px, 20px 20px;
      pointer-events: none;
      z-index: 0;
      filter: sepia(10%);
    }

    /* Ornamental Flourishes */
    .vintage-parisien-2025::after {
      content: '';
      position: fixed;
      top: -10%;
      left: -10%;
      width: 120%;
      height: 120%;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M20,50 Q30,30 50,50 Q70,70 80,50" fill="none" stroke="%23DAA520" stroke-width="0.5" opacity="0.1"><animate attributeName="opacity" values="0.1;0.3;0.1" dur="6s" repeatCount="indefinite"/></path><circle cx="25" cy="25" r="2" fill="%238B0000" opacity="0.08"><animate attributeName="opacity" values="0.08;0.2;0.08" dur="4s" repeatCount="indefinite"/></circle><path d="M70,20 Q80,30 70,40 Q60,30 70,20" fill="%23CD853F" opacity="0.06"><animate attributeName="opacity" values="0.06;0.15;0.06" dur="5s" repeatCount="indefinite"/></path></svg>') repeat;
      background-size: 180px 180px;
      animation: ornamentFloat 20s linear infinite;
      pointer-events: none;
      z-index: 1;
    }

    @keyframes ornamentFloat {
      0% { transform: translateX(0) translateY(0) rotate(0deg); }
      100% { transform: translateX(-180px) translateY(-180px) rotate(360deg); }
    }

    /* Navigation */
    .vintage-navbar {
      background: rgba(255, 248, 220, 0.95);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 2px solid rgba(218, 165, 32, 0.3);
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      padding: 1rem 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 2px 10px rgba(139, 0, 0, 0.1);
    }

    .vintage-navbar.scrolled {
      background: rgba(255, 248, 220, 0.98);
      box-shadow: 0 4px 20px rgba(139, 0, 0, 0.15);
    }

    .vintage-logo {
      font-family: 'Playfair Display', serif;
      font-size: 1.75rem;
      font-weight: 700;
      color: #8B0000;
      letter-spacing: 0.02em;
      position: relative;
      text-shadow: 0 0 10px rgba(139, 0, 0, 0.3);
      font-style: italic;
    }

    .vintage-logo::after {
      content: '🌹';
      margin-left: 0.5rem;
      font-size: 1.2rem;
      animation: vintageGlow 3s ease-in-out infinite;
    }

    @keyframes vintageGlow {
      0%, 100% { transform: scale(1) rotate(0deg); filter: sepia(20%); }
      50% { transform: scale(1.1) rotate(5deg); filter: sepia(40%); }
    }

    .vintage-nav-link {
      color: #2F1B14;
      text-decoration: none;
      font-weight: 600;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      font-size: 0.95rem;
      letter-spacing: 0.02em;
    }

    .vintage-nav-link::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(218, 165, 32, 0.2), transparent);
      transition: left 0.5s;
    }

    .vintage-nav-link:hover::before {
      left: 100%;
    }

    .vintage-nav-link:hover {
      color: #8B0000;
      background: rgba(218, 165, 32, 0.1);
      transform: translateY(-2px);
      text-shadow: 0 0 8px rgba(139, 0, 0, 0.4);
    }

    /* Hero Section */
    .vintage-hero {
      min-height: 100vh;
      display: flex;
      align-items: center;
      position: relative;
      padding: 6rem 0 4rem;
      background: linear-gradient(135deg, rgba(255, 248, 220, 0.9) 0%, rgba(250, 235, 215, 0.8) 100%);
    }

    .vintage-hero-content {
      position: relative;
      z-index: 2;
      text-align: center;
    }

    .vintage-hero-title {
      font-family: 'Playfair Display', serif;
      font-size: clamp(2.5rem, 5vw, 4rem);
      font-weight: 700;
      color: #8B0000;
      line-height: 1.2;
      margin-bottom: 2rem;
      letter-spacing: 0.02em;
      position: relative;
      text-shadow: 0 0 20px rgba(139, 0, 0, 0.3);
      font-style: italic;
    }

    .vintage-hero-title::after {
      content: '';
      position: absolute;
      bottom: -15px;
      left: 50%;
      transform: translateX(-50%);
      width: 120px;
      height: 4px;
      background: linear-gradient(90deg, #8B0000, #DAA520, #CD853F);
      border-radius: 2px;
      box-shadow: 0 0 15px rgba(218, 165, 32, 0.6);
    }

    .vintage-hero-subtitle {
      font-size: 1.25rem;
      color: #2F1B14;
      margin-bottom: 3rem;
      font-weight: 500;
      line-height: 1.7;
      max-width: 650px;
      margin-left: auto;
      margin-right: auto;
      letter-spacing: 0.01em;
      font-style: italic;
    }

    /* Buttons */
    .vintage-btn-primary {
      background: linear-gradient(135deg, #8B0000 0%, #A0522D 100%);
      color: #FFF8DC;
      border: none;
      padding: 1.25rem 3rem;
      border-radius: 0.5rem;
      font-weight: 700;
      font-size: 1.1rem;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      letter-spacing: 0.05em;
      box-shadow: 0 8px 25px rgba(139, 0, 0, 0.3);
      border: 2px solid rgba(218, 165, 32, 0.3);
    }

    .vintage-btn-primary::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(218, 165, 32, 0.3), transparent);
      transition: left 0.6s;
    }

    .vintage-btn-primary:hover::before {
      left: 100%;
    }

    .vintage-btn-primary:hover {
      transform: translateY(-3px) scale(1.05);
      box-shadow: 0 12px 35px rgba(139, 0, 0, 0.5);
      text-shadow: 0 0 10px rgba(255, 248, 220, 0.8);
      border-color: rgba(218, 165, 32, 0.6);
    }

    .vintage-btn-secondary {
      background: rgba(255, 248, 220, 0.9);
      color: #8B0000;
      border: 2px solid #DAA520;
      padding: 1.25rem 3rem;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      letter-spacing: 0.05em;
      backdrop-filter: blur(10px);
    }

    .vintage-btn-secondary:hover {
      background: #DAA520;
      color: #FFF8DC;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(218, 165, 32, 0.4);
    }

    /* Service Cards */
    .vintage-services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 2.5rem;
      margin-top: 4rem;
    }

    .vintage-service-card {
      background: rgba(255, 254, 247, 0.9);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 2px solid rgba(218, 165, 32, 0.3);
      border-radius: 1rem;
      padding: 2.5rem;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      box-shadow: 0 8px 25px rgba(139, 0, 0, 0.1);
    }

    .vintage-service-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #8B0000 0%, #DAA520 50%, #CD853F 100%);
      transform: scaleX(0);
      transition: transform 0.4s ease;
    }

    .vintage-service-card:hover::before {
      transform: scaleX(1);
    }

    .vintage-service-card::after {
      content: '✨';
      position: absolute;
      top: 1.5rem;
      right: 1.5rem;
      font-size: 1.5rem;
      opacity: 0.3;
      transition: all 0.3s ease;
    }

    .vintage-service-card:hover::after {
      opacity: 0.8;
      transform: scale(1.3) rotate(15deg);
      animation: vintageSparkle 1.5s ease-in-out infinite;
    }

    @keyframes vintageSparkle {
      0%, 100% { transform: scale(1.3) rotate(15deg); filter: sepia(20%); }
      50% { transform: scale(1.5) rotate(25deg); filter: sepia(50%); }
    }

    .vintage-service-card:hover {
      transform: translateY(-10px) scale(1.02);
      box-shadow: 0 25px 50px rgba(139, 0, 0, 0.2);
      background: rgba(255, 254, 247, 0.95);
      border-color: rgba(218, 165, 32, 0.6);
    }

    .vintage-service-title {
      font-family: 'Playfair Display', serif;
      font-size: 1.5rem;
      font-weight: 700;
      color: #8B0000;
      margin-bottom: 1rem;
      letter-spacing: 0.01em;
      text-shadow: 0 0 10px rgba(139, 0, 0, 0.2);
      font-style: italic;
    }

    .vintage-service-description {
      color: #2F1B14;
      line-height: 1.7;
      margin-bottom: 2rem;
      font-size: 1rem;
      font-style: italic;
    }

    .vintage-service-price {
      font-size: 2.25rem;
      font-weight: 700;
      color: #DAA520;
      margin-bottom: 0.5rem;
      letter-spacing: -0.02em;
      text-shadow: 0 0 15px rgba(218, 165, 32, 0.4);
      font-family: 'Playfair Display', serif;
    }

    .vintage-service-duration {
      color: #CD853F;
      font-size: 0.95rem;
      margin-bottom: 2rem;
      font-weight: 600;
      letter-spacing: 0.02em;
      font-style: italic;
    }

    /* Team Section */
    .vintage-team-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2.5rem;
      margin-top: 4rem;
    }

    .vintage-team-member {
      text-align: center;
      padding: 2.5rem 2rem;
      background: rgba(255, 254, 247, 0.8);
      border-radius: 1rem;
      transition: all 0.4s ease;
      border: 2px solid rgba(218, 165, 32, 0.2);
      position: relative;
      overflow: hidden;
      box-shadow: 0 8px 25px rgba(139, 0, 0, 0.1);
    }

    .vintage-team-member::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(218, 165, 32, 0.1) 0%, transparent 70%);
      transform: scale(0);
      transition: transform 0.5s ease;
    }

    .vintage-team-member:hover::before {
      transform: scale(1);
    }

    .vintage-team-member:hover {
      transform: translateY(-8px);
      background: rgba(255, 254, 247, 0.95);
      box-shadow: 0 20px 40px rgba(139, 0, 0, 0.15);
      border-color: rgba(218, 165, 32, 0.5);
    }

    .vintage-team-avatar {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      margin: 0 auto 1.5rem;
      border: 4px solid #DAA520;
      object-fit: cover;
      transition: all 0.4s ease;
      position: relative;
      z-index: 2;
      box-shadow: 0 0 20px rgba(218, 165, 32, 0.3);
      filter: sepia(10%);
    }

    .vintage-team-member:hover .vintage-team-avatar {
      transform: scale(1.1);
      border-color: #8B0000;
      box-shadow: 0 0 30px rgba(139, 0, 0, 0.4);
      filter: sepia(20%);
    }

    .vintage-team-name {
      font-family: 'Playfair Display', serif;
      font-size: 1.25rem;
      font-weight: 700;
      color: #8B0000;
      margin-bottom: 0.5rem;
      letter-spacing: 0.01em;
      position: relative;
      z-index: 2;
      text-shadow: 0 0 10px rgba(139, 0, 0, 0.2);
      font-style: italic;
    }

    .vintage-team-role {
      color: #2F1B14;
      font-weight: 600;
      font-size: 1rem;
      position: relative;
      z-index: 2;
      letter-spacing: 0.02em;
      font-style: italic;
    }

    /* Contact Section */
    .vintage-contact-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 2.5rem;
      margin-top: 4rem;
    }

    .vintage-contact-card {
      background: rgba(255, 254, 247, 0.9);
      backdrop-filter: blur(20px);
      border-radius: 1rem;
      padding: 2.5rem;
      border: 2px solid rgba(218, 165, 32, 0.3);
      position: relative;
      overflow: hidden;
      box-shadow: 0 8px 25px rgba(139, 0, 0, 0.1);
    }

    .vintage-contact-card::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 60px;
      height: 60px;
      background: radial-gradient(circle, rgba(205, 133, 63, 0.2) 0%, transparent 70%);
      border-radius: 0 1rem 0 1rem;
    }

    .vintage-contact-title {
      font-family: 'Playfair Display', serif;
      font-size: 1.5rem;
      font-weight: 700;
      color: #8B0000;
      margin-bottom: 2rem;
      letter-spacing: 0.01em;
      text-shadow: 0 0 10px rgba(139, 0, 0, 0.2);
      font-style: italic;
    }

    .vintage-contact-item {
      display: flex;
      align-items: center;
      margin-bottom: 1.25rem;
      padding: 1rem;
      border-radius: 0.5rem;
      transition: all 0.3s ease;
    }

    .vintage-contact-item:hover {
      background: rgba(218, 165, 32, 0.1);
      transform: translateX(5px);
    }

    .vintage-contact-icon {
      width: 20px;
      height: 20px;
      margin-right: 1.25rem;
      color: #DAA520;
    }

    .vintage-hours-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
      border-bottom: 1px solid rgba(218, 165, 32, 0.2);
    }

    .vintage-hours-item:last-child {
      border-bottom: none;
    }

    .vintage-hours-day {
      font-weight: 700;
      color: #8B0000;
      letter-spacing: 0.02em;
      font-style: italic;
    }

    .vintage-hours-time {
      color: #2F1B14;
      font-size: 1rem;
      font-weight: 500;
      font-style: italic;
    }

    /* Footer */
    .vintage-footer {
      background: linear-gradient(135deg, #8B0000 0%, #A0522D 100%);
      color: #FFF8DC;
      padding: 4rem 0 2rem;
      margin-top: 5rem;
      position: relative;
      overflow: hidden;
    }

    .vintage-footer::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M20,50 Q40,30 60,50 Q80,70 100,50" fill="none" stroke="rgba(218,165,32,0.1)" stroke-width="1"/><circle cx="30" cy="30" r="2" fill="rgba(218,165,32,0.08)"/><circle cx="70" cy="70" r="1.5" fill="rgba(205,133,63,0.06)"/></svg>') repeat;
      background-size: 120px 120px;
    }

    .vintage-footer-content {
      text-align: center;
      position: relative;
      z-index: 2;
    }

    .vintage-footer-logo {
      font-family: 'Playfair Display', serif;
      font-size: 2rem;
      font-weight: 700;
      color: #FFF8DC;
      margin-bottom: 2rem;
      letter-spacing: 0.02em;
      text-shadow: 0 0 20px rgba(255, 248, 220, 0.5);
      font-style: italic;
    }

    .vintage-footer-text {
      color: rgba(255, 248, 220, 0.9);
      margin-bottom: 3rem;
      font-size: 1.05rem;
      line-height: 1.7;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
      font-style: italic;
    }

    .vintage-social-links {
      display: flex;
      justify-content: center;
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .vintage-social-link {
      width: 55px;
      height: 55px;
      background: rgba(218, 165, 32, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFF8DC;
      text-decoration: none;
      transition: all 0.3s ease;
      border: 2px solid rgba(218, 165, 32, 0.3);
      font-size: 1.5rem;
    }

    .vintage-social-link:hover {
      background: #DAA520;
      color: #8B0000;
      transform: translateY(-3px) scale(1.1);
      border-color: #DAA520;
      box-shadow: 0 8px 25px rgba(218, 165, 32, 0.4);
    }

    .vintage-copyright {
      color: rgba(255, 248, 220, 0.8);
      font-size: 0.9rem;
      border-top: 1px solid rgba(218, 165, 32, 0.2);
      padding-top: 2rem;
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
