import { DesignTemplate } from './types';

export const pastelKawaiiTemplate: DesignTemplate = {
  id: 'pastel-kawaii',
  name: 'Pastel Kawaii',
  category: 'creative',
  description: 'Bulles 3D soft avec physics, emojis animés réactifs, confettis interactifs',
  preview: '/templates/previews/pastel-kawaii.jpg',
  theme: {
    colors: {
      primary: '#FFB6C1',
      secondary: '#E6E6FA',
      accent: '#98FB98',
      background: '#FFF0F5',
      surface: '#FFFFFF',
      text: '#8B4B8B',
      textSecondary: '#DDA0DD',
      custom: {
        bubblegum: '#FFB6C1',
        lavender: '#E6E6FA',
        mint: '#98FB98',
        peach: '#FFCCCB',
        lemon: '#FFFACD',
        cotton: '#F8F8FF',
        rose: '#FFC0CB',
        sky: '#E0F6FF'
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
    
    .pastel-kawaii-2025 {
      font-family: 'Nunito', sans-serif;
      background: linear-gradient(135deg, #FFF0F5 0%, #F8F8FF 100%);
      min-height: 100vh;
      position: relative;
      overflow-x: hidden;
    }

    /* Kawaii Background Pattern */
    .pastel-kawaii-2025::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        radial-gradient(circle at 15% 25%, rgba(255, 182, 193, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 85% 75%, rgba(230, 230, 250, 0.06) 0%, transparent 50%),
        radial-gradient(circle at 50% 50%, rgba(152, 251, 152, 0.04) 0%, transparent 50%);
      pointer-events: none;
      z-index: 0;
    }

    /* Floating Hearts Animation */
    .pastel-kawaii-2025::after {
      content: '';
      position: fixed;
      top: -10%;
      left: -10%;
      width: 120%;
      height: 120%;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50,85 C50,85 20,60 20,40 C20,25 30,15 45,20 C50,10 50,10 55,20 C70,15 80,25 80,40 C80,60 50,85 50,85 Z" fill="%23FFB6C1" opacity="0.1"><animateTransform attributeName="transform" type="scale" values="0.8;1.2;0.8" dur="4s" repeatCount="indefinite"/></path><circle cx="25" cy="25" r="2" fill="%23E6E6FA" opacity="0.3"><animate attributeName="opacity" values="0.3;0.8;0.3" dur="3s" repeatCount="indefinite"/></circle><circle cx="75" cy="75" r="1.5" fill="%2398FB98" opacity="0.4"><animate attributeName="opacity" values="0.4;0.9;0.4" dur="2.5s" repeatCount="indefinite"/></circle></svg>') repeat;
      background-size: 150px 150px;
      animation: floatingHearts 12s linear infinite;
      pointer-events: none;
      z-index: 1;
    }

    @keyframes floatingHearts {
      0% { transform: translateX(0) translateY(0) rotate(0deg); }
      100% { transform: translateX(-150px) translateY(-150px) rotate(360deg); }
    }

    /* Navigation */
    .kawaii-navbar {
      background: rgba(255, 240, 245, 0.95);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 2px solid rgba(255, 182, 193, 0.3);
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      padding: 1rem 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .kawaii-navbar.scrolled {
      background: rgba(255, 240, 245, 0.98);
      box-shadow: 0 4px 20px rgba(255, 182, 193, 0.2);
    }

    .kawaii-logo {
      font-family: 'Comfortaa', cursive;
      font-size: 1.75rem;
      font-weight: 700;
      color: #FFB6C1;
      letter-spacing: 0.02em;
      position: relative;
      text-shadow: 0 0 10px rgba(255, 182, 193, 0.5);
    }

    .kawaii-logo::after {
      content: '🌸';
      margin-left: 0.5rem;
      font-size: 1.2rem;
      animation: kawaiiBounce 2s ease-in-out infinite;
    }

    @keyframes kawaiiBounce {
      0%, 100% { transform: translateY(0px) scale(1) rotate(0deg); }
      25% { transform: translateY(-8px) scale(1.1) rotate(-5deg); }
      50% { transform: translateY(-4px) scale(1.05) rotate(0deg); }
      75% { transform: translateY(-12px) scale(1.15) rotate(5deg); }
    }

    .kawaii-nav-link {
      color: #8B4B8B;
      text-decoration: none;
      font-weight: 600;
      padding: 0.75rem 1.5rem;
      border-radius: 2rem;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      font-size: 0.95rem;
    }

    .kawaii-nav-link::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 182, 193, 0.2), transparent);
      transition: left 0.5s;
    }

    .kawaii-nav-link:hover::before {
      left: 100%;
    }

    .kawaii-nav-link:hover {
      color: #FFB6C1;
      background: rgba(255, 182, 193, 0.15);
      transform: translateY(-2px) scale(1.05);
      text-shadow: 0 0 8px rgba(255, 182, 193, 0.6);
    }

    /* Hero Section */
    .kawaii-hero {
      min-height: 100vh;
      display: flex;
      align-items: center;
      position: relative;
      padding: 6rem 0 4rem;
      background: linear-gradient(135deg, rgba(255, 240, 245, 0.9) 0%, rgba(248, 248, 255, 0.8) 100%);
    }

    .kawaii-hero-content {
      position: relative;
      z-index: 2;
      text-align: center;
    }

    .kawaii-hero-title {
      font-family: 'Comfortaa', cursive;
      font-size: clamp(2.5rem, 5vw, 4rem);
      font-weight: 700;
      color: #FFB6C1;
      line-height: 1.2;
      margin-bottom: 2rem;
      letter-spacing: 0.02em;
      position: relative;
      text-shadow: 0 0 20px rgba(255, 182, 193, 0.5);
    }

    .kawaii-hero-title::after {
      content: '';
      position: absolute;
      bottom: -15px;
      left: 50%;
      transform: translateX(-50%);
      width: 80px;
      height: 4px;
      background: linear-gradient(90deg, #FFB6C1, #E6E6FA, #98FB98);
      border-radius: 2rem;
      box-shadow: 0 0 15px rgba(255, 182, 193, 0.6);
    }

    .kawaii-hero-subtitle {
      font-size: 1.25rem;
      color: #8B4B8B;
      margin-bottom: 3rem;
      font-weight: 500;
      line-height: 1.6;
      max-width: 650px;
      margin-left: auto;
      margin-right: auto;
      letter-spacing: 0.01em;
    }

    /* Buttons */
    .kawaii-btn-primary {
      background: linear-gradient(135deg, #FFB6C1 0%, #FFC0CB 100%);
      color: #8B4B8B;
      border: none;
      padding: 1.25rem 3rem;
      border-radius: 2rem;
      font-weight: 700;
      font-size: 1.1rem;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      box-shadow: 0 8px 25px rgba(255, 182, 193, 0.4);
    }

    .kawaii-btn-primary::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
      transition: left 0.6s;
    }

    .kawaii-btn-primary:hover::before {
      left: 100%;
    }

    .kawaii-btn-primary:hover {
      transform: translateY(-3px) scale(1.05);
      box-shadow: 0 12px 35px rgba(255, 182, 193, 0.6);
      text-shadow: 0 0 10px rgba(139, 75, 139, 0.8);
    }

    .kawaii-btn-secondary {
      background: rgba(255, 255, 255, 0.9);
      color: #FFB6C1;
      border: 2px solid #FFB6C1;
      padding: 1.25rem 3rem;
      border-radius: 2rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    }

    .kawaii-btn-secondary:hover {
      background: #FFB6C1;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(255, 182, 193, 0.4);
    }

    /* Service Cards */
    .kawaii-services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 2.5rem;
      margin-top: 4rem;
    }

    .kawaii-service-card {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 2px solid rgba(255, 182, 193, 0.3);
      border-radius: 2rem;
      padding: 2.5rem;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }

    .kawaii-service-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #FFB6C1 0%, #E6E6FA 50%, #98FB98 100%);
      transform: scaleX(0);
      transition: transform 0.4s ease;
    }

    .kawaii-service-card:hover::before {
      transform: scaleX(1);
    }

    .kawaii-service-card::after {
      content: '💖';
      position: absolute;
      top: 1.5rem;
      right: 1.5rem;
      font-size: 1.5rem;
      opacity: 0.3;
      transition: all 0.3s ease;
    }

    .kawaii-service-card:hover::after {
      opacity: 0.8;
      transform: scale(1.3) rotate(15deg);
      animation: heartbeat 1s ease-in-out infinite;
    }

    @keyframes heartbeat {
      0%, 100% { transform: scale(1.3) rotate(15deg); }
      50% { transform: scale(1.5) rotate(15deg); }
    }

    .kawaii-service-card:hover {
      transform: translateY(-10px) scale(1.02);
      box-shadow: 0 25px 50px rgba(255, 182, 193, 0.3);
      background: rgba(255, 255, 255, 0.95);
      border-color: rgba(255, 182, 193, 0.6);
    }

    .kawaii-service-title {
      font-family: 'Comfortaa', cursive;
      font-size: 1.5rem;
      font-weight: 700;
      color: #FFB6C1;
      margin-bottom: 1rem;
      letter-spacing: 0.01em;
      text-shadow: 0 0 10px rgba(255, 182, 193, 0.3);
    }

    .kawaii-service-description {
      color: #8B4B8B;
      line-height: 1.7;
      margin-bottom: 2rem;
      font-size: 1rem;
    }

    .kawaii-service-price {
      font-size: 2.25rem;
      font-weight: 700;
      color: #E6E6FA;
      margin-bottom: 0.5rem;
      letter-spacing: -0.02em;
      text-shadow: 0 0 15px rgba(230, 230, 250, 0.5);
    }

    .kawaii-service-duration {
      color: #98FB98;
      font-size: 0.95rem;
      margin-bottom: 2rem;
      font-weight: 600;
      letter-spacing: 0.02em;
    }

    /* Team Section */
    .kawaii-team-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2.5rem;
      margin-top: 4rem;
    }

    .kawaii-team-member {
      text-align: center;
      padding: 2.5rem 2rem;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 2rem;
      transition: all 0.4s ease;
      border: 2px solid rgba(255, 182, 193, 0.2);
      position: relative;
      overflow: hidden;
    }

    .kawaii-team-member::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255, 182, 193, 0.1) 0%, transparent 70%);
      transform: scale(0);
      transition: transform 0.5s ease;
    }

    .kawaii-team-member:hover::before {
      transform: scale(1);
    }

    .kawaii-team-member:hover {
      transform: translateY(-8px);
      background: rgba(255, 255, 255, 0.95);
      box-shadow: 0 20px 40px rgba(255, 182, 193, 0.2);
      border-color: rgba(255, 182, 193, 0.5);
    }

    .kawaii-team-avatar {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      margin: 0 auto 1.5rem;
      border: 4px solid #FFB6C1;
      object-fit: cover;
      transition: all 0.4s ease;
      position: relative;
      z-index: 2;
      box-shadow: 0 0 20px rgba(255, 182, 193, 0.4);
    }

    .kawaii-team-member:hover .kawaii-team-avatar {
      transform: scale(1.1);
      border-color: #E6E6FA;
      box-shadow: 0 0 30px rgba(230, 230, 250, 0.6);
    }

    .kawaii-team-name {
      font-family: 'Comfortaa', cursive;
      font-size: 1.25rem;
      font-weight: 700;
      color: #FFB6C1;
      margin-bottom: 0.5rem;
      letter-spacing: 0.01em;
      position: relative;
      z-index: 2;
      text-shadow: 0 0 10px rgba(255, 182, 193, 0.3);
    }

    .kawaii-team-role {
      color: #8B4B8B;
      font-weight: 600;
      font-size: 1rem;
      position: relative;
      z-index: 2;
      letter-spacing: 0.02em;
    }

    /* Contact Section */
    .kawaii-contact-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 2.5rem;
      margin-top: 4rem;
    }

    .kawaii-contact-card {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(20px);
      border-radius: 2rem;
      padding: 2.5rem;
      border: 2px solid rgba(255, 182, 193, 0.3);
      position: relative;
      overflow: hidden;
    }

    .kawaii-contact-card::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 60px;
      height: 60px;
      background: radial-gradient(circle, rgba(230, 230, 250, 0.3) 0%, transparent 70%);
      border-radius: 0 2rem 0 2rem;
    }

    .kawaii-contact-title {
      font-family: 'Comfortaa', cursive;
      font-size: 1.5rem;
      font-weight: 700;
      color: #FFB6C1;
      margin-bottom: 2rem;
      letter-spacing: 0.01em;
      text-shadow: 0 0 10px rgba(255, 182, 193, 0.3);
    }

    .kawaii-contact-item {
      display: flex;
      align-items: center;
      margin-bottom: 1.25rem;
      padding: 1rem;
      border-radius: 1rem;
      transition: all 0.3s ease;
    }

    .kawaii-contact-item:hover {
      background: rgba(255, 182, 193, 0.1);
      transform: translateX(5px);
    }

    .kawaii-contact-icon {
      width: 20px;
      height: 20px;
      margin-right: 1.25rem;
      color: #E6E6FA;
    }

    .kawaii-hours-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
      border-bottom: 1px solid rgba(255, 182, 193, 0.2);
    }

    .kawaii-hours-item:last-child {
      border-bottom: none;
    }

    .kawaii-hours-day {
      font-weight: 700;
      color: #FFB6C1;
      letter-spacing: 0.02em;
    }

    .kawaii-hours-time {
      color: #8B4B8B;
      font-size: 1rem;
      font-weight: 500;
    }

    /* Footer */
    .kawaii-footer {
      background: linear-gradient(135deg, #FFB6C1 0%, #E6E6FA 100%);
      color: white;
      padding: 4rem 0 2rem;
      margin-top: 5rem;
      position: relative;
      overflow: hidden;
    }

    .kawaii-footer::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="30" r="3" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="70" r="2" fill="rgba(255,255,255,0.08)"/><circle cx="50" cy="20" r="1.5" fill="rgba(255,255,255,0.12)"/></svg>') repeat;
      background-size: 100px 100px;
    }

    .kawaii-footer-content {
      text-align: center;
      position: relative;
      z-index: 2;
    }

    .kawaii-footer-logo {
      font-family: 'Comfortaa', cursive;
      font-size: 2rem;
      font-weight: 700;
      color: white;
      margin-bottom: 2rem;
      letter-spacing: 0.02em;
      text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
    }

    .kawaii-footer-text {
      color: rgba(255, 255, 255, 0.9);
      margin-bottom: 3rem;
      font-size: 1.05rem;
      line-height: 1.6;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }

    .kawaii-social-links {
      display: flex;
      justify-content: center;
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .kawaii-social-link {
      width: 55px;
      height: 55px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      text-decoration: none;
      transition: all 0.3s ease;
      border: 2px solid rgba(255, 255, 255, 0.3);
      font-size: 1.5rem;
    }

    .kawaii-social-link:hover {
      background: white;
      color: #FFB6C1;
      transform: translateY(-3px) scale(1.1);
      border-color: white;
      box-shadow: 0 8px 25px rgba(255, 255, 255, 0.3);
    }

    .kawaii-copyright {
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
