import { DesignTemplate } from './types';

export const botanicalSpaTemplate: DesignTemplate = {
  id: 'botanical-spa',
  name: 'Botanical Spa',
  category: 'classic',
  description: 'Feuillages 3D réactifs, effet de rosée prismatique, transitions organiques',
  preview: '/templates/previews/botanical-spa.jpg',
  theme: {
    colors: {
      primary: '#2D5016',
      secondary: '#8FBC8F',
      accent: '#CD853F',
      background: '#F0F8F0',
      surface: '#FFFFFF',
      text: '#2F4F2F',
      textSecondary: '#556B2F',
      custom: {
        sage: '#9CAF88',
        moss: '#8FBC8F',
        terracotta: '#CD853F',
        cream: '#FFF8DC',
        forest: '#228B22',
        mint: '#98FB98'
      }
    },
    typography: {
      headingFont: 'Playfair Display Variable, serif',
      bodyFont: 'Source Sans Pro Variable, sans-serif',
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
        blur: '25px',
        opacity: '0.08',
        border: '1px solid rgba(143, 188, 143, 0.2)'
      },
      animations: ['leafFloat', 'dewDrop', 'organicGrow'],
      transitions: ['organic', 'flowing'],
      specialEffects: ['fallingLeaves', 'dewDrops', 'pollenParticles'],
      shadows: {
        sm: '0 2px 4px rgba(47, 79, 47, 0.1)',
        md: '0 4px 8px rgba(47, 79, 47, 0.15)',
        lg: '0 8px 16px rgba(47, 79, 47, 0.2)',
        xl: '0 16px 32px rgba(47, 79, 47, 0.25)',
        neon: '0 0 20px rgba(143, 188, 143, 0.4)'
      }
    },
    layout: {
      borderRadius: {
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
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
    patterns: ['leaf-pattern', 'organic-texture', 'botanical-mandala'],
    particles: [
      {
        type: 'falling',
        count: 20,
        size: { min: 8, max: 15 },
        speed: { min: 1, max: 2 },
        color: '#8FBC8F',
        opacity: { min: 0.3, max: 0.7 }
      },
      {
        type: 'floating',
        count: 30,
        size: { min: 2, max: 5 },
        speed: { min: 0.5, max: 1.5 },
        color: '#98FB98',
        opacity: { min: 0.2, max: 0.5 }
      }
    ]
  },
  customCSS: `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Source+Sans+Pro:wght@300;400;500;600;700&display=swap');
    
    .botanical-spa-2025 {
      font-family: 'Source Sans Pro', sans-serif;
      background: linear-gradient(135deg, #F0F8F0 0%, #FFF8DC 100%);
      min-height: 100vh;
      position: relative;
      overflow-x: hidden;
    }

    /* Organic Background Pattern */
    .botanical-spa-2025::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        radial-gradient(circle at 25% 25%, rgba(143, 188, 143, 0.05) 0%, transparent 50%),
        radial-gradient(circle at 75% 75%, rgba(152, 251, 152, 0.03) 0%, transparent 50%),
        radial-gradient(circle at 50% 100%, rgba(205, 133, 63, 0.02) 0%, transparent 50%);
      pointer-events: none;
      z-index: 0;
    }

    /* Floating Leaves Animation */
    .botanical-spa-2025::after {
      content: '';
      position: fixed;
      top: -10%;
      left: -10%;
      width: 120%;
      height: 120%;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M20,50 Q30,30 50,50 Q70,70 80,50" fill="none" stroke="%238FBC8F" stroke-width="0.5" opacity="0.1"/><circle cx="25" cy="25" r="1" fill="%2398FB98" opacity="0.2"/><circle cx="75" cy="75" r="1.5" fill="%239CAF88" opacity="0.15"/></svg>') repeat;
      background-size: 200px 200px;
      animation: floatingPattern 20s linear infinite;
      pointer-events: none;
      z-index: 1;
    }

    @keyframes floatingPattern {
      0% { transform: translateX(0) translateY(0); }
      100% { transform: translateX(-200px) translateY(-200px); }
    }

    /* Navigation */
    .botanical-navbar {
      background: rgba(255, 248, 220, 0.95);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(143, 188, 143, 0.2);
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      padding: 1rem 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .botanical-navbar.scrolled {
      background: rgba(255, 248, 220, 0.98);
      box-shadow: 0 4px 20px rgba(143, 188, 143, 0.15);
    }

    .botanical-logo {
      font-family: 'Playfair Display', serif;
      font-size: 1.75rem;
      font-weight: 600;
      color: #2D5016;
      letter-spacing: -0.02em;
      position: relative;
    }

    .botanical-logo::after {
      content: '🌿';
      margin-left: 0.5rem;
      font-size: 1.2rem;
      animation: leafSway 3s ease-in-out infinite;
    }

    @keyframes leafSway {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(5deg); }
    }

    .botanical-nav-link {
      color: #556B2F;
      text-decoration: none;
      font-weight: 500;
      padding: 0.75rem 1.25rem;
      border-radius: 2rem;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .botanical-nav-link::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(143, 188, 143, 0.1), transparent);
      transition: left 0.5s;
    }

    .botanical-nav-link:hover::before {
      left: 100%;
    }

    .botanical-nav-link:hover {
      color: #2D5016;
      background: rgba(143, 188, 143, 0.1);
      transform: translateY(-1px);
    }

    /* Hero Section */
    .botanical-hero {
      min-height: 100vh;
      display: flex;
      align-items: center;
      position: relative;
      padding: 6rem 0 4rem;
      background: linear-gradient(135deg, rgba(240, 248, 240, 0.9) 0%, rgba(255, 248, 220, 0.8) 100%);
    }

    .botanical-hero-content {
      position: relative;
      z-index: 2;
      text-align: center;
    }

    .botanical-hero-title {
      font-family: 'Playfair Display', serif;
      font-size: clamp(2.5rem, 5vw, 4.5rem);
      font-weight: 600;
      color: #2D5016;
      line-height: 1.1;
      margin-bottom: 1.5rem;
      letter-spacing: -0.02em;
      position: relative;
    }

    .botanical-hero-title::after {
      content: '';
      position: absolute;
      bottom: -10px;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 3px;
      background: linear-gradient(90deg, #8FBC8F, #98FB98);
      border-radius: 2px;
    }

    .botanical-hero-subtitle {
      font-size: 1.25rem;
      color: #556B2F;
      margin-bottom: 3rem;
      font-weight: 400;
      line-height: 1.6;
      max-width: 650px;
      margin-left: auto;
      margin-right: auto;
    }

    /* Buttons */
    .botanical-btn-primary {
      background: linear-gradient(135deg, #2D5016 0%, #228B22 100%);
      color: white;
      border: none;
      padding: 1.25rem 3rem;
      border-radius: 2rem;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(45, 80, 22, 0.3);
    }

    .botanical-btn-primary::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.6s;
    }

    .botanical-btn-primary:hover::before {
      left: 100%;
    }

    .botanical-btn-primary:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(45, 80, 22, 0.4);
    }

    .botanical-btn-secondary {
      background: rgba(255, 255, 255, 0.9);
      color: #2D5016;
      border: 2px solid #8FBC8F;
      padding: 1.25rem 3rem;
      border-radius: 2rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    }

    .botanical-btn-secondary:hover {
      background: #8FBC8F;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(143, 188, 143, 0.3);
    }

    /* Service Cards */
    .botanical-services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 2.5rem;
      margin-top: 4rem;
    }

    .botanical-service-card {
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(143, 188, 143, 0.3);
      border-radius: 2rem;
      padding: 2.5rem;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }

    .botanical-service-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #8FBC8F 0%, #98FB98 50%, #9CAF88 100%);
      transform: scaleX(0);
      transition: transform 0.4s ease;
    }

    .botanical-service-card:hover::before {
      transform: scaleX(1);
    }

    .botanical-service-card::after {
      content: '🌱';
      position: absolute;
      top: 1.5rem;
      right: 1.5rem;
      font-size: 1.5rem;
      opacity: 0.3;
      transition: all 0.3s ease;
    }

    .botanical-service-card:hover::after {
      opacity: 0.7;
      transform: scale(1.2) rotate(10deg);
    }

    .botanical-service-card:hover {
      transform: translateY(-10px) scale(1.02);
      box-shadow: 0 25px 50px rgba(143, 188, 143, 0.2);
      background: rgba(255, 255, 255, 0.95);
      border-color: rgba(143, 188, 143, 0.5);
    }

    .botanical-service-title {
      font-family: 'Playfair Display', serif;
      font-size: 1.5rem;
      font-weight: 600;
      color: #2D5016;
      margin-bottom: 1rem;
      letter-spacing: -0.01em;
    }

    .botanical-service-description {
      color: #556B2F;
      line-height: 1.7;
      margin-bottom: 2rem;
      font-size: 1rem;
    }

    .botanical-service-price {
      font-size: 2rem;
      font-weight: 700;
      color: #228B22;
      margin-bottom: 0.5rem;
      letter-spacing: -0.02em;
    }

    .botanical-service-duration {
      color: #8FBC8F;
      font-size: 0.9rem;
      margin-bottom: 2rem;
      font-weight: 500;
    }

    /* Team Section */
    .botanical-team-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2.5rem;
      margin-top: 4rem;
    }

    .botanical-team-member {
      text-align: center;
      padding: 2.5rem 2rem;
      background: rgba(255, 255, 255, 0.7);
      border-radius: 2rem;
      transition: all 0.4s ease;
      border: 1px solid rgba(143, 188, 143, 0.2);
      position: relative;
      overflow: hidden;
    }

    .botanical-team-member::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(152, 251, 152, 0.1) 0%, transparent 70%);
      transform: scale(0);
      transition: transform 0.5s ease;
    }

    .botanical-team-member:hover::before {
      transform: scale(1);
    }

    .botanical-team-member:hover {
      transform: translateY(-8px);
      background: rgba(255, 255, 255, 0.95);
      box-shadow: 0 20px 40px rgba(143, 188, 143, 0.15);
    }

    .botanical-team-avatar {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      margin: 0 auto 1.5rem;
      border: 4px solid #8FBC8F;
      object-fit: cover;
      transition: all 0.4s ease;
      position: relative;
      z-index: 2;
    }

    .botanical-team-member:hover .botanical-team-avatar {
      transform: scale(1.1);
      border-color: #228B22;
      box-shadow: 0 8px 25px rgba(143, 188, 143, 0.4);
    }

    .botanical-team-name {
      font-family: 'Playfair Display', serif;
      font-size: 1.25rem;
      font-weight: 600;
      color: #2D5016;
      margin-bottom: 0.5rem;
      letter-spacing: -0.01em;
      position: relative;
      z-index: 2;
    }

    .botanical-team-role {
      color: #556B2F;
      font-weight: 500;
      font-size: 0.95rem;
      position: relative;
      z-index: 2;
    }

    /* Contact Section */
    .botanical-contact-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 2.5rem;
      margin-top: 4rem;
    }

    .botanical-contact-card {
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(20px);
      border-radius: 2rem;
      padding: 2.5rem;
      border: 1px solid rgba(143, 188, 143, 0.3);
      position: relative;
      overflow: hidden;
    }

    .botanical-contact-card::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 60px;
      height: 60px;
      background: radial-gradient(circle, rgba(152, 251, 152, 0.2) 0%, transparent 70%);
      border-radius: 0 2rem 0 2rem;
    }

    .botanical-contact-title {
      font-family: 'Playfair Display', serif;
      font-size: 1.5rem;
      font-weight: 600;
      color: #2D5016;
      margin-bottom: 2rem;
      letter-spacing: -0.01em;
    }

    .botanical-contact-item {
      display: flex;
      align-items: center;
      margin-bottom: 1.25rem;
      padding: 1rem;
      border-radius: 1rem;
      transition: all 0.3s ease;
    }

    .botanical-contact-item:hover {
      background: rgba(143, 188, 143, 0.1);
      transform: translateX(5px);
    }

    .botanical-contact-icon {
      width: 20px;
      height: 20px;
      margin-right: 1.25rem;
      color: #8FBC8F;
    }

    .botanical-hours-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
      border-bottom: 1px solid rgba(143, 188, 143, 0.2);
    }

    .botanical-hours-item:last-child {
      border-bottom: none;
    }

    .botanical-hours-day {
      font-weight: 600;
      color: #2D5016;
    }

    .botanical-hours-time {
      color: #556B2F;
      font-size: 0.95rem;
    }

    /* Footer */
    .botanical-footer {
      background: linear-gradient(135deg, #2D5016 0%, #228B22 100%);
      color: white;
      padding: 4rem 0 2rem;
      margin-top: 5rem;
      position: relative;
      overflow: hidden;
    }

    .botanical-footer::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M0,50 Q25,25 50,50 T100,50" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/></svg>') repeat;
      background-size: 100px 100px;
    }

    .botanical-footer-content {
      text-align: center;
      position: relative;
      z-index: 2;
    }

    .botanical-footer-logo {
      font-family: 'Playfair Display', serif;
      font-size: 2rem;
      font-weight: 700;
      color: #98FB98;
      margin-bottom: 1.5rem;
      letter-spacing: -0.02em;
    }

    .botanical-footer-text {
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 2.5rem;
      font-size: 1.05rem;
      line-height: 1.6;
    }

    .botanical-social-links {
      display: flex;
      justify-content: center;
      gap: 1.5rem;
      margin-bottom: 2.5rem;
    }

    .botanical-social-link {
      width: 50px;
      height: 50px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #98FB98;
      text-decoration: none;
      transition: all 0.3s ease;
      border: 2px solid rgba(152, 251, 152, 0.3);
    }

    .botanical-social-link:hover {
      background: #98FB98;
      color: #2D5016;
      transform: translateY(-3px) scale(1.1);
      border-color: #98FB98;
    }

    .botanical-copyright {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.9rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
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

    @keyframes leafFloat {
      0%, 100% { 
        transform: translateY(0px) rotate(0deg);
      }
      25% { 
        transform: translateY(-15px) rotate(3deg);
      }
      50% { 
        transform: translateY(-8px) rotate(-2deg);
      }
      75% { 
        transform: translateY(-20px) rotate(2deg);
      }
    }

    @keyframes organicPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    .fade-in-up {
      animation: fadeInUp 0.8s ease-out;
    }

    .leaf-float {
      animation: leafFloat 8s ease-in-out infinite;
    }

    .organic-pulse {
      animation: organicPulse 4s ease-in-out infinite;
    }

    .stagger-1 { animation-delay: 0.1s; }
    .stagger-2 { animation-delay: 0.2s; }
    .stagger-3 { animation-delay: 0.3s; }
    .stagger-4 { animation-delay: 0.4s; }

    /* Responsive */
    @media (max-width: 768px) {
      .botanical-hero-title {
        font-size: 2.5rem;
      }
      
      .botanical-service-card {
        padding: 2rem;
      }
      
      .botanical-btn-primary, .botanical-btn-secondary {
        padding: 1rem 2rem;
        font-size: 0.95rem;
      }

      .botanical-services-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .botanical-team-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .botanical-contact-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
    }

    /* Scroll Animations */
    @media (prefers-reduced-motion: no-preference) {
      .botanical-service-card {
        opacity: 0;
        transform: translateY(30px);
        animation: fadeInUp 0.8s ease-out forwards;
      }

      .botanical-team-member {
        opacity: 0;
        transform: translateY(30px);
        animation: fadeInUp 0.8s ease-out forwards;
      }
    }

    /* Dew Drop Effect */
    .dew-drop {
      position: relative;
      overflow: hidden;
    }
    
    .dew-drop::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: linear-gradient(45deg, 
        transparent 30%, 
        rgba(255, 255, 255, 0.4) 50%, 
        transparent 70%);
      animation: dewShimmer 4s ease-in-out infinite;
    }
    
    @keyframes dewShimmer {
      0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
      100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
    }
  `
};
