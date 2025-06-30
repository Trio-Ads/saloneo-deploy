import { DesignTemplate } from './types';

export const glamourHollywoodTemplate: DesignTemplate = {
  id: 'glamour-hollywood',
  name: 'Glamour Hollywood',
  category: 'classic',
  description: 'Effet miroir dynamique, particules dorées 3D, spotlight interactif',
  preview: '/templates/previews/glamour-hollywood.jpg',
  theme: {
    colors: {
      primary: '#FFD700',
      secondary: '#B8860B',
      accent: '#FF69B4',
      background: '#1A1A1A',
      surface: '#2D2D2D',
      text: '#FFFFFF',
      textSecondary: '#D4AF37',
      custom: {
        gold: '#FFD700',
        champagne: '#F7E7CE',
        rose: '#FF69B4',
        platinum: '#E5E4E2',
        bronze: '#CD7F32',
        pearl: '#F0EAD6'
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
    
    .glamour-hollywood-2025 {
      font-family: 'Montserrat', sans-serif;
      background: linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%);
      min-height: 100vh;
      position: relative;
      overflow-x: hidden;
    }

    /* Luxury Background Pattern */
    .glamour-hollywood-2025::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        radial-gradient(circle at 20% 20%, rgba(255, 215, 0, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(255, 105, 180, 0.05) 0%, transparent 50%),
        radial-gradient(circle at 50% 50%, rgba(229, 228, 226, 0.03) 0%, transparent 50%);
      pointer-events: none;
      z-index: 0;
    }

    /* Golden Particles Animation */
    .glamour-hollywood-2025::after {
      content: '';
      position: fixed;
      top: -10%;
      left: -10%;
      width: 120%;
      height: 120%;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="30" r="1" fill="%23FFD700" opacity="0.6"><animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite"/></circle><circle cx="80" cy="70" r="1.5" fill="%23F7E7CE" opacity="0.4"><animate attributeName="opacity" values="0.4;0.8;0.4" dur="4s" repeatCount="indefinite"/></circle><circle cx="50" cy="20" r="0.8" fill="%23FF69B4" opacity="0.5"><animate attributeName="opacity" values="0.5;0.9;0.5" dur="2.5s" repeatCount="indefinite"/></circle></svg>') repeat;
      background-size: 300px 300px;
      animation: sparkleFloat 15s linear infinite;
      pointer-events: none;
      z-index: 1;
    }

    @keyframes sparkleFloat {
      0% { transform: translateX(0) translateY(0) rotate(0deg); }
      100% { transform: translateX(-300px) translateY(-300px) rotate(360deg); }
    }

    /* Navigation */
    .glamour-navbar {
      background: rgba(26, 26, 26, 0.95);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(255, 215, 0, 0.3);
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      padding: 1rem 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .glamour-navbar.scrolled {
      background: rgba(26, 26, 26, 0.98);
      box-shadow: 0 4px 20px rgba(255, 215, 0, 0.2);
    }

    .glamour-logo {
      font-family: 'Cinzel', serif;
      font-size: 2rem;
      font-weight: 700;
      color: #FFD700;
      letter-spacing: 0.05em;
      position: relative;
      text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
    }

    .glamour-logo::after {
      content: '✨';
      margin-left: 0.5rem;
      font-size: 1.2rem;
      animation: sparkle 2s ease-in-out infinite;
    }

    @keyframes sparkle {
      0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.7; }
      50% { transform: scale(1.2) rotate(180deg); opacity: 1; }
    }

    .glamour-nav-link {
      color: #E5E4E2;
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

    .glamour-nav-link::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.2), transparent);
      transition: left 0.5s;
    }

    .glamour-nav-link:hover::before {
      left: 100%;
    }

    .glamour-nav-link:hover {
      color: #FFD700;
      background: rgba(255, 215, 0, 0.1);
      transform: translateY(-1px);
      text-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
    }

    /* Hero Section */
    .glamour-hero {
      min-height: 100vh;
      display: flex;
      align-items: center;
      position: relative;
      padding: 6rem 0 4rem;
      background: linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(45, 45, 45, 0.8) 100%);
    }

    .glamour-hero-content {
      position: relative;
      z-index: 2;
      text-align: center;
    }

    .glamour-hero-title {
      font-family: 'Cinzel', serif;
      font-size: clamp(3rem, 6vw, 5rem);
      font-weight: 700;
      color: #FFD700;
      line-height: 1.1;
      margin-bottom: 2rem;
      letter-spacing: 0.02em;
      position: relative;
      text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
    }

    .glamour-hero-title::after {
      content: '';
      position: absolute;
      bottom: -15px;
      left: 50%;
      transform: translateX(-50%);
      width: 100px;
      height: 4px;
      background: linear-gradient(90deg, #FFD700, #FF69B4, #FFD700);
      border-radius: 2px;
      box-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
    }

    .glamour-hero-subtitle {
      font-size: 1.5rem;
      color: #E5E4E2;
      margin-bottom: 3rem;
      font-weight: 300;
      line-height: 1.6;
      max-width: 700px;
      margin-left: auto;
      margin-right: auto;
      letter-spacing: 0.02em;
    }

    /* Buttons */
    .glamour-btn-primary {
      background: linear-gradient(135deg, #FFD700 0%, #B8860B 100%);
      color: #1A1A1A;
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
      box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4);
    }

    .glamour-btn-primary::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
      transition: left 0.6s;
    }

    .glamour-btn-primary:hover::before {
      left: 100%;
    }

    .glamour-btn-primary:hover {
      transform: translateY(-3px) scale(1.05);
      box-shadow: 0 12px 35px rgba(255, 215, 0, 0.6);
      text-shadow: 0 0 10px rgba(26, 26, 26, 0.8);
    }

    .glamour-btn-secondary {
      background: transparent;
      color: #FFD700;
      border: 2px solid #FFD700;
      padding: 1.5rem 3.5rem;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      backdrop-filter: blur(10px);
    }

    .glamour-btn-secondary:hover {
      background: #FFD700;
      color: #1A1A1A;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4);
    }

    /* Service Cards */
    .glamour-services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
      gap: 3rem;
      margin-top: 4rem;
    }

    .glamour-service-card {
      background: rgba(45, 45, 45, 0.9);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 215, 0, 0.3);
      border-radius: 1rem;
      padding: 3rem;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }

    .glamour-service-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #FFD700 0%, #FF69B4 50%, #FFD700 100%);
      transform: scaleX(0);
      transition: transform 0.4s ease;
    }

    .glamour-service-card:hover::before {
      transform: scaleX(1);
    }

    .glamour-service-card::after {
      content: '💎';
      position: absolute;
      top: 2rem;
      right: 2rem;
      font-size: 2rem;
      opacity: 0.3;
      transition: all 0.3s ease;
    }

    .glamour-service-card:hover::after {
      opacity: 0.8;
      transform: scale(1.2) rotate(15deg);
    }

    .glamour-service-card:hover {
      transform: translateY(-10px) scale(1.02);
      box-shadow: 0 25px 50px rgba(255, 215, 0, 0.3);
      background: rgba(45, 45, 45, 0.95);
      border-color: rgba(255, 215, 0, 0.6);
    }

    .glamour-service-title {
      font-family: 'Cinzel', serif;
      font-size: 1.75rem;
      font-weight: 600;
      color: #FFD700;
      margin-bottom: 1rem;
      letter-spacing: 0.02em;
      text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
    }

    .glamour-service-description {
      color: #E5E4E2;
      line-height: 1.7;
      margin-bottom: 2rem;
      font-size: 1.05rem;
    }

    .glamour-service-price {
      font-size: 2.5rem;
      font-weight: 700;
      color: #FFD700;
      margin-bottom: 0.5rem;
      letter-spacing: -0.02em;
      text-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
    }

    .glamour-service-duration {
      color: #D4AF37;
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
