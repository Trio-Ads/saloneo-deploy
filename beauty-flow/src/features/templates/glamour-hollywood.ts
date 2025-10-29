import { DesignTemplate } from './types';

export const glamourHollywoodTemplate: DesignTemplate = {
  id: 'glamour-hollywood',
  name: 'Glamour Hollywood',
  category: 'classic',
  description: 'Design luxueux avec effets dorés, particules scintillantes et animations glamour pour salons haut de gamme',
  preview: '/templates/previews/glamour-hollywood.jpg',
  theme: {
    colors: {
      primary: '#D4AF37', // Or antique raffiné
      secondary: '#8B4513', // Bronze profond
      accent: '#E6B8FF', // Violet glamour
      background: '#0A0A0A', // Noir profond
      surface: '#1C1C1C', // Charbon élégant
      text: '#F5F5DC', // Beige crème
      textSecondary: '#DAA520', // Or mat
      custom: {
        gold: '#FFD700', // Or brillant
        champagne: '#F7E7CE', // Champagne
        rose: '#E6B8FF', // Rose glamour
        platinum: '#E5E4E2', // Platine
        bronze: '#CD7F32', // Bronze
        pearl: '#F0EAD6', // Perle
        diamond: '#B9F2FF', // Diamant
        ruby: '#E0115F', // Rubis
        emerald: '#50C878', // Émeraude
        gradient1: '#D4AF37',
        gradient2: '#FFD700',
        gradient3: '#E6B8FF'
      }
    },
    typography: {
      headingFont: 'Cinzel Variable, serif',
      bodyFont: 'Montserrat Variable, sans-serif',
      sizes: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.5rem'
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
        blur: '30px',
        opacity: '0.15',
        border: '1px solid rgba(255, 215, 0, 0.3)'
      },
      animations: ['goldShimmer', 'mirrorReflect', 'sparkleTrail'],
      transitions: ['luxurious', 'elegant'],
      specialEffects: ['goldParticles', 'mirrorEffect', 'spotlight'],
      shadows: {
        sm: '0 2px 8px rgba(255, 215, 0, 0.2)',
        md: '0 4px 16px rgba(255, 215, 0, 0.3)',
        lg: '0 8px 32px rgba(255, 215, 0, 0.4)',
        xl: '0 16px 64px rgba(255, 215, 0, 0.5)',
        neon: '0 0 30px rgba(255, 215, 0, 0.8), 0 0 60px rgba(255, 105, 180, 0.4)'
      }
    },
    layout: {
      borderRadius: {
        sm: '0.25rem',
        md: '0.5rem',
        lg: '1rem',
        xl: '1.5rem',
        full: '9999px'
      },
      spacing: {
        xs: '0.75rem',
        sm: '1.25rem',
        md: '2rem',
        lg: '2.5rem',
        xl: '3.5rem'
      },
      containers: {
        maxWidth: '1300px',
        padding: '2.5rem'
      }
    }
  },
  assets: {
    patterns: ['art-deco', 'ornamental-border', 'luxury-texture'],
    particles: [
      {
        type: 'sparkle',
        count: 50,
        size: { min: 3, max: 8 },
        speed: { min: 0.5, max: 2 },
        color: '#FFD700',
        opacity: { min: 0.4, max: 0.9 }
      }
    ]
  },
  customCSS: `
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap');
    
    .glamour-hollywood {
      font-family: 'Montserrat', sans-serif;
      background: linear-gradient(135deg, #0A0A0A 0%, #1C1C1C 100%);
      min-height: 100vh;
      position: relative;
      overflow-x: hidden;
    }

    .glamour-hollywood h1, 
    .glamour-hollywood h2, 
    .glamour-hollywood h3 {
      font-family: 'Cinzel', serif;
    }

    /* Luxury Background Pattern */
    .glamour-hollywood::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        radial-gradient(circle at 20% 20%, rgba(212, 175, 55, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(230, 184, 255, 0.05) 0%, transparent 50%),
        radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.03) 0%, transparent 50%);
      pointer-events: none;
      z-index: 0;
    }

    /* Golden Particles Animation */
    .glamour-hollywood::after {
      content: '';
      position: fixed;
      top: -10%;
      left: -10%;
      width: 120%;
      height: 120%;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="30" r="1" fill="%23D4AF37" opacity="0.6"><animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite"/></circle><circle cx="80" cy="70" r="1.5" fill="%23FFD700" opacity="0.4"><animate attributeName="opacity" values="0.4;0.8;0.4" dur="4s" repeatCount="indefinite"/></circle><circle cx="50" cy="20" r="0.8" fill="%23E6B8FF" opacity="0.5"><animate attributeName="opacity" values="0.5;0.9;0.5" dur="2.5s" repeatCount="indefinite"/></circle><circle cx="30" cy="80" r="1.2" fill="%23B9F2FF" opacity="0.3"><animate attributeName="opacity" values="0.3;0.7;0.3" dur="3.5s" repeatCount="indefinite"/></circle></svg>') repeat;
      background-size: 300px 300px;
      animation: sparkleFloat 15s linear infinite;
      pointer-events: none;
      z-index: 1;
    }

    @keyframes sparkleFloat {
      0% { transform: translateX(0) translateY(0) rotate(0deg); }
      100% { transform: translateX(-300px) translateY(-300px) rotate(360deg); }
    }

    /* Navigation luxueuse */
    .navbar {
      background: rgba(10, 10, 10, 0.95);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(212, 175, 55, 0.3);
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      padding: 1rem 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 1px 3px 0 rgba(212, 175, 55, 0.1);
    }

    .navbar.scrolled {
      background: rgba(10, 10, 10, 0.98);
      box-shadow: 0 4px 20px rgba(212, 175, 55, 0.2);
    }

    .nav-logo {
      font-family: 'Cinzel', serif;
      font-size: 2rem;
      font-weight: 700;
      background: linear-gradient(135deg, #D4AF37 0%, #FFD700 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: 0.05em;
      position: relative;
      text-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
    }

    .nav-logo::after {
      content: '✨';
      margin-left: 0.5rem;
      font-size: 1.2rem;
      color: #FFD700;
      animation: sparkle 2s ease-in-out infinite;
    }

    @keyframes sparkle {
      0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.7; }
      50% { transform: scale(1.2) rotate(180deg); opacity: 1; }
    }

    .nav-link {
      color: #F5F5DC;
      text-decoration: none;
      font-weight: 500;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
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
      background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.2), transparent);
      transition: left 0.5s;
    }

    .nav-link:hover::before {
      left: 100%;
    }

    .nav-link:hover {
      color: #D4AF37;
      background: rgba(212, 175, 55, 0.1);
      transform: translateY(-1px);
      text-shadow: 0 0 8px rgba(212, 175, 55, 0.6);
    }

    /* Hero Section glamour */
    .hero-section {
      min-height: 100vh;
      display: flex;
      align-items: center;
      position: relative;
      padding: 6rem 0 4rem;
      background: linear-gradient(135deg, rgba(10, 10, 10, 0.9) 0%, rgba(28, 28, 28, 0.8) 100%);
      overflow: hidden;
    }

    .hero-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><defs><radialGradient id="a" cx="50%" cy="50%"><stop offset="0%" stop-color="%23D4AF37" stop-opacity="0.1"/><stop offset="100%" stop-color="%23D4AF37" stop-opacity="0"/></radialGradient><radialGradient id="b" cx="50%" cy="50%"><stop offset="0%" stop-color="%23E6B8FF" stop-opacity="0.05"/><stop offset="100%" stop-color="%23E6B8FF" stop-opacity="0"/></radialGradient></defs><circle cx="200" cy="200" r="150" fill="url(%23a)"/><circle cx="800" cy="300" r="100" fill="url(%23b)"/><circle cx="600" cy="700" r="120" fill="url(%23a)"/></svg>') no-repeat center center;
      background-size: cover;
      opacity: 0.4;
    }

    .hero-content {
      position: relative;
      z-index: 2;
      text-align: center;
    }

    .hero-title {
      font-family: 'Cinzel', serif;
      font-size: clamp(3rem, 6vw, 5rem);
      font-weight: 700;
      background: linear-gradient(135deg, #D4AF37 0%, #FFD700 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1.1;
      margin-bottom: 2rem;
      letter-spacing: 0.02em;
      position: relative;
      text-shadow: 0 0 20px rgba(212, 175, 55, 0.5);
    }

    .hero-title::after {
      content: '';
      position: absolute;
      bottom: -15px;
      left: 50%;
      transform: translateX(-50%);
      width: 100px;
      height: 4px;
      background: linear-gradient(90deg, #D4AF37, #E6B8FF, #FFD700);
      border-radius: 2px;
      box-shadow: 0 0 10px rgba(212, 175, 55, 0.8);
    }

    .hero-subtitle {
      font-size: 1.5rem;
      color: #F5F5DC;
      margin-bottom: 3rem;
      font-weight: 300;
      line-height: 1.6;
      max-width: 700px;
      margin-left: auto;
      margin-right: auto;
      letter-spacing: 0.02em;
    }

    /* Boutons glamour */
    .btn-primary {
      background: linear-gradient(135deg, #D4AF37 0%, #FFD700 100%);
      color: #0A0A0A;
      border: none;
      padding: 1.5rem 3.5rem;
      border-radius: 0.5rem;
      font-weight: 700;
      font-size: 1.1rem;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      box-shadow: 0 8px 25px rgba(212, 175, 55, 0.4);
      font-family: 'Cinzel', serif;
    }

    .btn-primary::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
      transition: left 0.6s;
    }

    .btn-primary:hover::before {
      left: 100%;
    }

    .btn-primary:hover {
      transform: translateY(-3px) scale(1.05);
      box-shadow: 0 12px 35px rgba(212, 175, 55, 0.6);
      text-shadow: 0 0 10px rgba(10, 10, 10, 0.8);
      background: linear-gradient(135deg, #FFD700 0%, #E6B8FF 100%);
    }

    .btn-secondary {
      background: transparent;
      color: #D4AF37;
      border: 2px solid #D4AF37;
      padding: 1.5rem 3.5rem;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      backdrop-filter: blur(10px);
      font-family: 'Cinzel', serif;
    }

    .btn-secondary:hover {
      background: #D4AF37;
      color: #0A0A0A;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(212, 175, 55, 0.4);
    }

    /* Service Cards glamour */
    .service-card {
      background: rgba(28, 28, 28, 0.9);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(212, 175, 55, 0.3);
      border-radius: 1rem;
      padding: 3rem;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(212, 175, 55, 0.1);
    }

    .service-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #D4AF37 0%, #E6B8FF 50%, #FFD700 100%);
      transform: scaleX(0);
      transition: transform 0.4s ease;
    }

    .service-card:hover::before {
      transform: scaleX(1);
    }

    .service-card::after {
      content: '💎';
      position: absolute;
      top: 2rem;
      right: 2rem;
      font-size: 2rem;
      opacity: 0.3;
      transition: all 0.3s ease;
    }

    .service-card:hover::after {
      opacity: 0.8;
      transform: scale(1.2) rotate(15deg);
    }

    .service-card:hover {
      transform: translateY(-10px) scale(1.02);
      box-shadow: 0 25px 50px rgba(212, 175, 55, 0.3);
      background: rgba(28, 28, 28, 0.95);
      border-color: rgba(212, 175, 55, 0.6);
    }

    .service-title {
      font-family: 'Cinzel', serif;
      font-size: 1.75rem;
      font-weight: 600;
      color: #D4AF37;
      margin-bottom: 1rem;
      letter-spacing: 0.02em;
      text-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
    }

    .service-description {
      color: #F5F5DC;
      line-height: 1.7;
      margin-bottom: 2rem;
      font-size: 1.05rem;
    }

    .service-price {
      font-size: 2.5rem;
      font-weight: 700;
      color: #FFD700;
      margin-bottom: 0.5rem;
      letter-spacing: -0.02em;
      text-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
      font-family: 'Cinzel', serif;
    }

    .service-duration {
      color: #DAA520;
      font-size: 1rem;
      margin-bottom: 2rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Team Section */
    .glamour-team-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 3rem;
      margin-top: 4rem;
    }

    .glamour-team-member {
      text-align: center;
      padding: 3rem 2rem;
      background: rgba(45, 45, 45, 0.8);
      border-radius: 1rem;
      transition: all 0.4s ease;
      border: 1px solid rgba(255, 215, 0, 0.2);
      position: relative;
      overflow: hidden;
    }

    .glamour-team-member::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%);
      transform: scale(0);
      transition: transform 0.5s ease;
    }

    .glamour-team-member:hover::before {
      transform: scale(1);
    }

    .glamour-team-member:hover {
      transform: translateY(-10px);
      background: rgba(45, 45, 45, 0.95);
      box-shadow: 0 20px 40px rgba(255, 215, 0, 0.2);
      border-color: rgba(255, 215, 0, 0.5);
    }

    .glamour-team-avatar {
      width: 140px;
      height: 140px;
      border-radius: 50%;
      margin: 0 auto 2rem;
      border: 4px solid #FFD700;
      object-fit: cover;
      transition: all 0.4s ease;
      position: relative;
      z-index: 2;
      box-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
    }

    .glamour-team-member:hover .glamour-team-avatar {
      transform: scale(1.1);
      border-color: #FF69B4;
      box-shadow: 0 0 30px rgba(255, 215, 0, 0.6);
    }

    .glamour-team-name {
      font-family: 'Cinzel', serif;
      font-size: 1.5rem;
      font-weight: 600;
      color: #FFD700;
      margin-bottom: 0.5rem;
      letter-spacing: 0.02em;
      position: relative;
      z-index: 2;
      text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
    }

    .glamour-team-role {
      color: #E5E4E2;
      font-weight: 500;
      font-size: 1rem;
      position: relative;
      z-index: 2;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Contact Section */
    .glamour-contact-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 3rem;
      margin-top: 4rem;
    }

    .glamour-contact-card {
      background: rgba(45, 45, 45, 0.9);
      backdrop-filter: blur(20px);
      border-radius: 1rem;
      padding: 3rem;
      border: 1px solid rgba(255, 215, 0, 0.3);
      position: relative;
      overflow: hidden;
    }

    .glamour-contact-card::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 80px;
      height: 80px;
      background: radial-gradient(circle, rgba(255, 215, 0, 0.2) 0%, transparent 70%);
      border-radius: 0 1rem 0 1rem;
    }

    .glamour-contact-title {
      font-family: 'Cinzel', serif;
      font-size: 1.75rem;
      font-weight: 600;
      color: #FFD700;
      margin-bottom: 2rem;
      letter-spacing: 0.02em;
      text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
    }

    .glamour-contact-item {
      display: flex;
      align-items: center;
      margin-bottom: 1.5rem;
      padding: 1.25rem;
      border-radius: 0.75rem;
      transition: all 0.3s ease;
    }

    .glamour-contact-item:hover {
      background: rgba(255, 215, 0, 0.1);
      transform: translateX(8px);
    }

    .glamour-contact-icon {
      width: 24px;
      height: 24px;
      margin-right: 1.5rem;
      color: #FFD700;
    }

    .glamour-hours-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 0;
      border-bottom: 1px solid rgba(255, 215, 0, 0.2);
    }

    .glamour-hours-item:last-child {
      border-bottom: none;
    }

    .glamour-hours-day {
      font-weight: 600;
      color: #FFD700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .glamour-hours-time {
      color: #E5E4E2;
      font-size: 1rem;
    }

    /* Footer */
    .glamour-footer {
      background: linear-gradient(135deg, #1A1A1A 0%, #000000 100%);
      color: #E5E4E2;
      padding: 4rem 0 2rem;
      margin-top: 5rem;
      position: relative;
      overflow: hidden;
      border-top: 1px solid rgba(255, 215, 0, 0.3);
    }

    .glamour-footer::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M0,50 Q25,25 50,50 T100,50" fill="none" stroke="rgba(255,215,0,0.05)" stroke-width="1"/></svg>') repeat;
      background-size: 150px 150px;
    }

    .glamour-footer-content {
      text-align: center;
      position: relative;
      z-index: 2;
    }

    .glamour-footer-logo {
      font-family: 'Cinzel', serif;
      font-size: 2.5rem;
      font-weight: 700;
      color: #FFD700;
      margin-bottom: 2rem;
      letter-spacing: 0.05em;
      text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
    }

    .glamour-footer-text {
      color: rgba(229, 228, 226, 0.8);
      margin-bottom: 3rem;
      font-size: 1.1rem;
      line-height: 1.6;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }

    .glamour-social-links {
      display: flex;
      justify-content: center;
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .glamour-social-link {
      width: 60px;
      height: 60px;
      background: rgba(255, 215, 0, 0.1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFD700;
      text-decoration: none;
      transition: all 0.3s ease;
      border: 2px solid rgba(255, 215, 0, 0.3);
      font-size: 1.5rem;
    }

    .glamour-social-link:hover {
      background: #FFD700;
      color: #1A1A1A;
      transform: translateY(-5px) scale(1.1);
      border-color: #FFD700;
      box-shadow: 0 10px 25px rgba(255, 215, 0, 0.4);
    }

    .glamour-copyright {
      color: rgba(229, 228, 226, 0.6);
      font-size: 0.95rem;
      border-top: 1px solid rgba(255, 215, 0, 0.2);
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

    @keyframes goldShimmer {
      0%, 100% { 
        background-position: 0% 50%;
      }
      50% { 
        background-position: 100% 50%;
      }
    }

    @keyframes luxuryPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    .fade-in-up {
      animation: fadeInUp 0.8s ease-out;
    }

    .gold-shimmer {
      background: linear-gradient(45deg, 
        #FFD700 0%, 
        #FFF8DC 25%, 
        #FFD700 50%, 
        #FFF8DC 75%, 
        #FFD700 100%);
      background-size: 200% 200%;
      animation: goldShimmer 3s ease-in-out infinite;
    }

    .luxury-pulse {
      animation: luxuryPulse 3s ease-in-out infinite;
    }

    .stagger-1 { animation-delay: 0.1s; }
    .stagger-2 { animation-delay: 0.2s; }
    .stagger-3 { animation-delay: 0.3s; }
    .stagger-4 { animation-delay: 0.4s; }

    /* Responsive */
    @media (max-width: 768px) {
      .glamour-hero-title {
        font-size: 3rem;
      }
      
      .glamour-service-card {
        padding: 2rem;
      }
      
      .glamour-btn-primary, .glamour-btn-secondary {
        padding: 1.25rem 2.5rem;
        font-size: 1rem;
      }

      .glamour-services-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .glamour-team-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .glamour-contact-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
    }

    /* Scroll Animations */
    @media (prefers-reduced-motion: no-preference) {
      .glamour-service-card {
        opacity: 0;
        transform: translateY(30px);
        animation: fadeInUp 0.8s ease-out forwards;
      }

      .glamour-team-member {
        opacity: 0;
        transform: translateY(30px);
        animation: fadeInUp 0.8s ease-out forwards;
      }
    }

    /* Mirror Effect */
    .mirror-effect {
      position: relative;
      overflow: hidden;
    }
    
    .mirror-effect::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: linear-gradient(45deg, 
        transparent 30%, 
        rgba(255, 255, 255, 0.1) 50%, 
        transparent 70%);
      animation: mirrorReflect 4s ease-in-out infinite;
    }
    
    @keyframes mirrorReflect {
      0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
      100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
    }
  `
};
