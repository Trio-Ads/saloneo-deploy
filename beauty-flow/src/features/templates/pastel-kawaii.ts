import { DesignTemplate } from './types';

export const pastelKawaiiTemplate: DesignTemplate = {
  id: 'pastel-kawaii',
  name: 'Pastel Kawaii',
  category: 'creative',
  description: 'Design kawaii moderne avec couleurs pastel douces, animations mignonnes et esthétique japonaise contemporaine',
  preview: '/templates/previews/pastel-kawaii.jpg',
  theme: {
    colors: {
      primary: '#FF9EC7', // Rose kawaii moderne
      secondary: '#B8A9FF', // Lavande douce
      accent: '#A8E6CF', // Menthe pastel
      background: '#FEFEFE', // Blanc très doux
      surface: '#FFFFFF', // Blanc pur
      text: '#6B4C7A', // Violet doux
      textSecondary: '#9B8AA3', // Gris lavande
      custom: {
        sakura: '#FFB7C5', // Rose sakura
        lavender: '#C8B2DB', // Lavande pastel
        mint: '#B8F2CC', // Menthe kawaii
        peach: '#FFD3A5', // Pêche douce
        sky: '#A8D8EA', // Bleu ciel pastel
        cream: '#FFF8DC', // Crème vanille
        coral: '#FFB3BA', // Corail doux
        lilac: '#E6E6FA' // Lilas tendre
      }
    },
    typography: {
      headingFont: 'Comfortaa Variable, cursive',
      bodyFont: 'Nunito Variable, sans-serif',
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
        opacity: '0.1',
        border: '1px solid rgba(255, 182, 193, 0.3)'
      },
      animations: ['bounce', 'wiggle', 'heartbeat'],
      transitions: ['bouncy', 'playful'],
      specialEffects: ['floatingBubbles', 'confetti', 'starSparkles'],
      shadows: {
        sm: '0 2px 4px rgba(255, 182, 193, 0.2)',
        md: '0 4px 8px rgba(255, 182, 193, 0.3)',
        lg: '0 8px 16px rgba(255, 182, 193, 0.4)',
        xl: '0 16px 32px rgba(255, 182, 193, 0.5)',
        neon: '0 0 20px rgba(255, 182, 193, 0.6)'
      }
    },
    layout: {
      borderRadius: {
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
        xl: '2.5rem',
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
        maxWidth: '1100px',
        padding: '2rem'
      }
    }
  },
  assets: {
    patterns: ['polka-dots', 'hearts', 'stars'],
    particles: [
      {
        type: 'floating',
        count: 35,
        size: { min: 10, max: 25 },
        speed: { min: 0.5, max: 1.5 },
        color: '#FFB6C1',
        opacity: { min: 0.3, max: 0.7 }
      },
      {
        type: 'sparkle',
        count: 25,
        size: { min: 3, max: 8 },
        speed: { min: 1, max: 2.5 },
        color: '#E6E6FA',
        opacity: { min: 0.4, max: 0.8 }
      }
    ]
  },
  customCSS: `
    @import url('https://fonts.googleapis.com/css2?family=Comfortaa:wght@300;400;500;600;700&family=Nunito:wght@300;400;500;600;700&display=swap');
    
    .pastel-kawaii {
      font-family: 'Nunito', sans-serif;
      background: linear-gradient(135deg, #FEFEFE 0%, #F8F9FA 100%);
      min-height: 100vh;
      position: relative;
      overflow-x: hidden;
    }

    .pastel-kawaii h1, 
    .pastel-kawaii h2, 
    .pastel-kawaii h3 {
      font-family: 'Comfortaa', cursive;
    }

    /* Background kawaii moderne */
    .pastel-kawaii::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        radial-gradient(circle at 20% 30%, rgba(255, 158, 199, 0.04) 0%, transparent 50%),
        radial-gradient(circle at 80% 70%, rgba(184, 169, 255, 0.03) 0%, transparent 50%),
        radial-gradient(circle at 50% 50%, rgba(168, 230, 207, 0.02) 0%, transparent 50%);
      pointer-events: none;
      z-index: 0;
    }

    /* Particules kawaii flottantes */
    .pastel-kawaii::after {
      content: '';
      position: fixed;
      top: -10%;
      left: -10%;
      width: 120%;
      height: 120%;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50,85 C50,85 20,60 20,40 C20,25 30,15 45,20 C50,10 50,10 55,20 C70,15 80,25 80,40 C80,60 50,85 50,85 Z" fill="%23FF9EC7" opacity="0.06"><animateTransform attributeName="transform" type="scale" values="0.8;1.1;0.8" dur="5s" repeatCount="indefinite"/></path><circle cx="25" cy="25" r="1.5" fill="%23B8A9FF" opacity="0.04"><animate attributeName="opacity" values="0.04;0.1;0.04" dur="4s" repeatCount="indefinite"/></circle><circle cx="75" cy="75" r="1" fill="%23A8E6CF" opacity="0.05"><animate attributeName="opacity" values="0.05;0.12;0.05" dur="3s" repeatCount="indefinite"/></circle></svg>') repeat;
      background-size: 200px 200px;
      animation: floatingKawaii 15s linear infinite;
      pointer-events: none;
      z-index: 1;
    }

    @keyframes floatingKawaii {
      0% { transform: translateX(0) translateY(0) rotate(0deg); }
      100% { transform: translateX(-200px) translateY(-200px) rotate(360deg); }
    }

    /* Navigation kawaii moderne */
    .navbar {
      background: rgba(254, 254, 254, 0.95);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(255, 158, 199, 0.15);
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      padding: 1rem 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 2px 15px rgba(255, 158, 199, 0.08);
    }

    .navbar.scrolled {
      background: rgba(254, 254, 254, 0.98);
      box-shadow: 0 4px 25px rgba(255, 158, 199, 0.12);
    }

    .nav-logo {
      font-family: 'Comfortaa', cursive;
      font-size: 1.75rem;
      font-weight: 700;
      color: #FF9EC7;
      letter-spacing: 0.02em;
      position: relative;
    }

    .nav-logo::after {
      content: '🌸';
      margin-left: 0.5rem;
      font-size: 1.2rem;
      animation: kawaiiBounce 3s ease-in-out infinite;
    }

    @keyframes kawaiiBounce {
      0%, 100% { transform: translateY(0px) scale(1) rotate(0deg); }
      25% { transform: translateY(-6px) scale(1.05) rotate(-3deg); }
      50% { transform: translateY(-3px) scale(1.02) rotate(0deg); }
      75% { transform: translateY(-9px) scale(1.08) rotate(3deg); }
    }

    .nav-link {
      color: #6B4C7A;
      text-decoration: none;
      font-weight: 600;
      padding: 0.75rem 1.5rem;
      border-radius: 2rem;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      font-size: 0.95rem;
    }

    .nav-link::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 158, 199, 0.15), transparent);
      transition: left 0.5s;
    }

    .nav-link:hover::before {
      left: 100%;
    }

    .nav-link:hover {
      color: #FF9EC7;
      background: rgba(255, 158, 199, 0.1);
      transform: translateY(-1px) scale(1.02);
    }

    /* Hero Section kawaii moderne */
    .hero-section {
      min-height: 100vh;
      display: flex;
      align-items: center;
      position: relative;
      padding: 6rem 0 4rem;
      background: linear-gradient(135deg, rgba(254, 254, 254, 0.95) 0%, rgba(248, 249, 250, 0.9) 100%);
      overflow: hidden;
    }

    .hero-content {
      position: relative;
      z-index: 2;
      text-align: center;
    }

    .hero-title {
      font-family: 'Comfortaa', cursive;
      font-size: clamp(2.5rem, 5vw, 4rem);
      font-weight: 700;
      color: #FF9EC7;
      line-height: 1.2;
      margin-bottom: 2rem;
      letter-spacing: 0.02em;
      position: relative;
    }

    .hero-title::after {
      content: '';
      position: absolute;
      bottom: -15px;
      left: 50%;
      transform: translateX(-50%);
      width: 80px;
      height: 4px;
      background: linear-gradient(90deg, #FF9EC7, #B8A9FF, #A8E6CF);
      border-radius: 2rem;
      animation: kawaiiGlow 3s ease-in-out infinite;
    }

    @keyframes kawaiiGlow {
      0%, 100% { opacity: 0.7; }
      50% { opacity: 1; }
    }

    .hero-subtitle {
      font-size: 1.25rem;
      color: #6B4C7A;
      margin-bottom: 3rem;
      font-weight: 500;
      line-height: 1.6;
      max-width: 650px;
      margin-left: auto;
      margin-right: auto;
      letter-spacing: 0.01em;
    }

    /* Boutons kawaii modernes */
    .btn-primary {
      background: linear-gradient(135deg, #FF9EC7 0%, #FFB7C5 100%);
      color: #6B4C7A;
      border: none;
      padding: 1.25rem 3rem;
      border-radius: 2rem;
      font-weight: 700;
      font-size: 1.1rem;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      box-shadow: 0 8px 25px rgba(255, 158, 199, 0.3);
      font-family: 'Nunito', sans-serif;
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
      box-shadow: 0 12px 35px rgba(255, 158, 199, 0.5);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.9);
      color: #FF9EC7;
      border: 2px solid rgba(255, 158, 199, 0.4);
      padding: 1.25rem 3rem;
      border-radius: 2rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      font-family: 'Nunito', sans-serif;
    }

    .btn-secondary:hover {
      background: #FF9EC7;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(255, 158, 199, 0.3);
    }

    /* Service Cards kawaii modernes */
    .service-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 158, 199, 0.2);
      border-radius: 2rem;
      padding: 2.5rem;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      box-shadow: 0 8px 30px rgba(255, 158, 199, 0.1);
    }

    .service-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #FF9EC7 0%, #B8A9FF 50%, #A8E6CF 100%);
      transform: scaleX(0);
      transition: transform 0.4s ease;
      border-radius: 2rem 2rem 0 0;
    }

    .service-card:hover::before {
      transform: scaleX(1);
    }

    .service-card::after {
      content: '🌸';
      position: absolute;
      top: 1.5rem;
      right: 1.5rem;
      font-size: 1.5rem;
      opacity: 0.4;
      transition: all 0.3s ease;
    }

    .service-card:hover::after {
      opacity: 0.8;
      transform: scale(1.2) rotate(15deg);
      animation: kawaiiFloat 2s ease-in-out infinite;
    }

    @keyframes kawaiiFloat {
      0%, 100% { transform: scale(1.2) rotate(15deg) translateY(0px); }
      50% { transform: scale(1.3) rotate(15deg) translateY(-5px); }
    }

    .service-card:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 20px 40px rgba(255, 158, 199, 0.2);
      background: rgba(255, 255, 255, 0.98);
      border-color: rgba(255, 158, 199, 0.4);
    }

    .service-title {
      font-family: 'Comfortaa', cursive;
      font-size: 1.5rem;
      font-weight: 700;
      color: #FF9EC7;
      margin-bottom: 1rem;
      letter-spacing: 0.01em;
    }

    .service-description {
      color: #6B4C7A;
      line-height: 1.7;
      margin-bottom: 2rem;
      font-size: 1rem;
    }

    .service-price {
      font-size: 2.25rem;
      font-weight: 700;
      color: #B8A9FF;
      margin-bottom: 0.5rem;
      letter-spacing: -0.02em;
      font-family: 'Comfortaa', cursive;
    }

    .service-duration {
      color: #A8E6CF;
      font-size: 0.95rem;
      margin-bottom: 2rem;
      font-weight: 600;
      letter-spacing: 0.02em;
    }

    /* Team Section kawaii moderne */
    .team-member {
      text-align: center;
      padding: 2.5rem 2rem;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 2rem;
      transition: all 0.4s ease;
      border: 1px solid rgba(255, 158, 199, 0.2);
      position: relative;
      overflow: hidden;
      box-shadow: 0 8px 30px rgba(255, 158, 199, 0.1);
    }

    .team-member::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255, 158, 199, 0.08) 0%, transparent 70%);
      transform: scale(0);
      transition: transform 0.5s ease;
    }

    .team-member:hover::before {
      transform: scale(1);
    }

    .team-member:hover {
      transform: translateY(-8px) scale(1.02);
      background: rgba(255, 255, 255, 0.98);
      box-shadow: 0 20px 40px rgba(255, 158, 199, 0.2);
      border-color: rgba(255, 158, 199, 0.4);
    }

    .team-avatar {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      margin: 0 auto 1.5rem;
      border: 3px solid #FF9EC7;
      object-fit: cover;
      transition: all 0.4s ease;
      position: relative;
      z-index: 2;
      box-shadow: 0 0 20px rgba(255, 158, 199, 0.3);
    }

    .team-member:hover .team-avatar {
      transform: scale(1.1);
      border-color: #B8A9FF;
      box-shadow: 0 0 30px rgba(184, 169, 255, 0.5);
    }

    .team-name {
      font-family: 'Comfortaa', cursive;
      font-size: 1.25rem;
      font-weight: 700;
      color: #FF9EC7;
      margin-bottom: 0.5rem;
      letter-spacing: 0.01em;
      position: relative;
      z-index: 2;
    }

    .team-role {
      color: #6B4C7A;
      font-weight: 600;
      font-size: 1rem;
      position: relative;
      z-index: 2;
      letter-spacing: 0.02em;
    }

    /* Contact Section kawaii moderne */
    .contact-info {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 2rem;
      padding: 2.5rem;
      border: 1px solid rgba(255, 158, 199, 0.2);
      position: relative;
      overflow: hidden;
      box-shadow: 0 8px 30px rgba(255, 158, 199, 0.1);
      transition: all 0.3s ease;
    }

    .contact-info:hover {
      transform: translateY(-4px);
      box-shadow: 0 15px 40px rgba(255, 158, 199, 0.15);
    }

    .contact-info::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 60px;
      height: 60px;
      background: radial-gradient(circle, rgba(184, 169, 255, 0.2) 0%, transparent 70%);
      border-radius: 0 2rem 0 2rem;
    }

    .contact-title {
      font-family: 'Comfortaa', cursive;
      font-size: 1.5rem;
      font-weight: 700;
      color: #FF9EC7;
      margin-bottom: 2rem;
      letter-spacing: 0.01em;
    }

    .contact-item {
      display: flex;
      align-items: center;
      margin-bottom: 1.25rem;
      padding: 1rem;
      border-radius: 1rem;
      transition: all 0.3s ease;
      color: #6B4C7A;
    }

    .contact-item:hover {
      background: rgba(255, 158, 199, 0.08);
      transform: translateX(5px);
    }

    .contact-icon {
      width: 20px;
      height: 20px;
      margin-right: 1.25rem;
      color: #B8A9FF;
      font-size: 1.125rem;
    }

    .hours-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
      border-bottom: 1px solid rgba(255, 158, 199, 0.15);
      transition: all 0.3s ease;
    }

    .hours-item:last-child {
      border-bottom: none;
    }

    .hours-item:hover {
      background: rgba(255, 158, 199, 0.05);
      padding-left: 0.5rem;
      padding-right: 0.5rem;
      border-radius: 1rem;
    }

    .hours-day {
      font-weight: 700;
      color: #FF9EC7;
      letter-spacing: 0.02em;
      font-family: 'Comfortaa', cursive;
    }

    .hours-time {
      color: #6B4C7A;
      font-size: 1rem;
      font-weight: 500;
    }

    /* Footer kawaii moderne */
    .footer {
      background: linear-gradient(135deg, #FF9EC7 0%, #B8A9FF 100%);
      color: white;
      padding: 4rem 0 2rem;
      margin-top: 5rem;
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
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="30" r="2" fill="rgba(255,255,255,0.08)"/><circle cx="80" cy="70" r="1.5" fill="rgba(255,255,255,0.06)"/><circle cx="50" cy="20" r="1" fill="rgba(255,255,255,0.1)"/></svg>') repeat;
      background-size: 120px 120px;
    }

    .footer-content {
      text-align: center;
      position: relative;
      z-index: 2;
    }

    .footer-logo {
      font-family: 'Comfortaa', cursive;
      font-size: 2rem;
      font-weight: 700;
      color: white;
      margin-bottom: 2rem;
      letter-spacing: 0.02em;
    }

    .footer-text {
      color: rgba(255, 255, 255, 0.9);
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
      background: rgba(255, 255, 255, 0.15);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      text-decoration: none;
      transition: all 0.3s ease;
      border: 2px solid rgba(255, 255, 255, 0.2);
      font-size: 1.5rem;
    }

    .social-link:hover {
      background: white;
      color: #FF9EC7;
      transform: translateY(-3px) scale(1.1);
      border-color: white;
      box-shadow: 0 8px 25px rgba(255, 255, 255, 0.3);
    }

    .copyright {
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.9rem;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
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

    @keyframes wiggle {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(3deg); }
      75% { transform: rotate(-3deg); }
    }

    @keyframes kawaiiBubble {
      0%, 100% { transform: translateY(0px) scale(1); }
      50% { transform: translateY(-20px) scale(1.1); }
    }

    .fade-in-up {
      animation: fadeInUp 0.8s ease-out;
    }

    .kawaii-wiggle {
      animation: wiggle 2s ease-in-out infinite;
    }

    .kawaii-bubble {
      animation: kawaiiBubble 3s ease-in-out infinite;
    }

    .stagger-1 { animation-delay: 0.1s; }
    .stagger-2 { animation-delay: 0.2s; }
    .stagger-3 { animation-delay: 0.3s; }
    .stagger-4 { animation-delay: 0.4s; }

    /* Responsive */
    @media (max-width: 768px) {
      .kawaii-hero-title {
        font-size: 2.5rem;
      }
      
      .kawaii-service-card {
        padding: 2rem;
      }
      
      .kawaii-btn-primary, .kawaii-btn-secondary {
        padding: 1rem 2rem;
        font-size: 1rem;
      }

      .kawaii-services-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .kawaii-team-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .kawaii-contact-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
    }

    /* Scroll Animations */
    @media (prefers-reduced-motion: no-preference) {
      .kawaii-service-card {
        opacity: 0;
        transform: translateY(30px);
        animation: fadeInUp 0.8s ease-out forwards;
      }

      .kawaii-team-member {
        opacity: 0;
        transform: translateY(30px);
        animation: fadeInUp 0.8s ease-out forwards;
      }
    }

    /* Bubble Effect */
    .bubble-effect {
      position: relative;
      overflow: hidden;
    }
    
    .bubble-effect::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, 
        rgba(255, 255, 255, 0.3) 0%, 
        rgba(255, 182, 193, 0.1) 50%, 
        transparent 70%);
      animation: bubbleFloat 6s ease-in-out infinite;
    }
    
    @keyframes bubbleFloat {
      0% { transform: translateX(-100%) translateY(-100%) scale(0.5); }
      50% { transform: translateX(0%) translateY(0%) scale(1); }
      100% { transform: translateX(100%) translateY(100%) scale(0.5); }
    }
  `
};
