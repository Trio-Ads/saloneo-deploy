import { DesignTemplate } from './types';

export const techFuturisteTemplate: DesignTemplate = {
  id: 'tech-futuriste',
  name: 'Tech Moderne',
  category: 'modern',
  description: 'Design tech élégant et moderne avec interfaces épurées et animations subtiles pour instituts de beauté contemporains',
  preview: '/templates/previews/tech-futuriste.jpg',
  theme: {
    colors: {
      primary: '#007AFF', // Bleu Apple moderne
      secondary: '#5856D6', // Violet doux
      accent: '#00C7BE', // Menthe doux et élégant
      background: '#FFFFFF', // Blanc pur
      surface: '#F2F2F7', // Gris très clair
      text: '#1C1C1E', // Noir moderne
      textSecondary: '#8E8E93', // Gris moyen
      custom: {
        blue: '#007AFF', // Bleu moderne
        purple: '#5856D6', // Violet doux
        mint: '#00C7BE', // Menthe élégant
        teal: '#30D158', // Vert tech
        gray: '#F2F2F7', // Gris clair
        darkGray: '#8E8E93', // Gris foncé
        lightBlue: '#5AC8FA', // Bleu clair
        indigo: '#5856D6', // Indigo
        sage: '#A8E6CF', // Vert sage doux
        gradient1: '#007AFF',
        gradient2: '#5856D6',
        gradient3: '#00C7BE'
      }
    },
    typography: {
      headingFont: 'Orbitron Variable, monospace',
      bodyFont: 'Exo 2 Variable, sans-serif',
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
        border: '1px solid rgba(0, 212, 255, 0.3)'
      },
      animations: ['hologram', 'dataStream', 'cyberpunkGlow'],
      transitions: ['futuristic', 'digital'],
      specialEffects: ['holographicUI', 'dataFlow', 'scanLines'],
      shadows: {
        sm: '0 0 5px rgba(0, 212, 255, 0.3)',
        md: '0 0 10px rgba(0, 212, 255, 0.5)',
        lg: '0 0 20px rgba(0, 212, 255, 0.7)',
        xl: '0 0 30px rgba(0, 212, 255, 0.9)',
        neon: '0 0 40px rgba(0, 212, 255, 1), 0 0 80px rgba(123, 104, 238, 0.5)'
      }
    },
    layout: {
      borderRadius: {
        sm: '0',
        md: '0.125rem',
        lg: '0.25rem',
        xl: '0.5rem',
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
        maxWidth: '1400px',
        padding: '2rem'
      }
    }
  },
  assets: {
    patterns: ['circuit-grid', 'holographic', 'data-matrix'],
    particles: [
      {
        type: 'floating',
        count: 40,
        size: { min: 1, max: 4 },
        speed: { min: 2, max: 5 },
        color: '#00D4FF',
        opacity: { min: 0.4, max: 0.9 }
      },
      {
        type: 'sparkle',
        count: 25,
        size: { min: 1, max: 3 },
        speed: { min: 3, max: 6 },
        color: '#FF1493',
        opacity: { min: 0.5, max: 1 }
      }
    ]
  },
  customCSS: `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=SF+Pro+Display:wght@300;400;500;600;700&display=swap');
    
    .tech-futuriste {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 100%);
      min-height: 100vh;
      position: relative;
      overflow-x: hidden;
    }

    .tech-futuriste h1, 
    .tech-futuriste h2, 
    .tech-futuriste h3 {
      font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    /* Background moderne et subtil */
    .tech-futuriste::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        radial-gradient(circle at 25% 25%, rgba(0, 122, 255, 0.02) 0%, transparent 50%),
        radial-gradient(circle at 75% 75%, rgba(88, 86, 214, 0.015) 0%, transparent 50%),
        radial-gradient(circle at 50% 100%, rgba(255, 45, 146, 0.01) 0%, transparent 50%);
      pointer-events: none;
      z-index: 0;
    }

    /* Particules flottantes subtiles */
    .tech-futuriste::after {
      content: '';
      position: fixed;
      top: -10%;
      left: -10%;
      width: 120%;
      height: 120%;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="0.5" fill="%23007AFF" opacity="0.1"><animate attributeName="opacity" values="0.1;0.3;0.1" dur="4s" repeatCount="indefinite"/></circle><circle cx="80" cy="30" r="0.3" fill="%235856D6" opacity="0.08"><animate attributeName="opacity" values="0.08;0.2;0.08" dur="3s" repeatCount="indefinite"/></circle><circle cx="50" cy="70" r="0.4" fill="%23FF2D92" opacity="0.06"><animate attributeName="opacity" values="0.06;0.15;0.06" dur="5s" repeatCount="indefinite"/></circle></svg>') repeat;
      background-size: 200px 200px;
      animation: floatParticles 15s linear infinite;
      pointer-events: none;
      z-index: 1;
    }

    @keyframes floatParticles {
      0% { transform: translateX(0) translateY(0); }
      100% { transform: translateX(-200px) translateY(-200px); }
    }

    /* Navigation moderne style Apple */
    .navbar {
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      padding: 1rem 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
    }

    .navbar.scrolled {
      background: rgba(255, 255, 255, 0.95);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }

    .nav-logo {
      font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 1.5rem;
      font-weight: 600;
      color: #1C1C1E;
      letter-spacing: -0.02em;
      position: relative;
    }

    .nav-logo::after {
      content: '●';
      margin-left: 0.5rem;
      font-size: 0.8rem;
      color: #007AFF;
      animation: subtlePulse 3s ease-in-out infinite;
    }

    @keyframes subtlePulse {
      0%, 100% { opacity: 0.6; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.1); }
    }

    .nav-link {
      color: #1C1C1E;
      text-decoration: none;
      font-weight: 500;
      padding: 0.75rem 1.25rem;
      border-radius: 1rem;
      transition: all 0.3s ease;
      position: relative;
      font-size: 0.95rem;
    }

    .nav-link:hover {
      color: #007AFF;
      background: rgba(0, 122, 255, 0.08);
      transform: translateY(-1px);
    }

    /* Hero Section moderne style Apple */
    .hero-section {
      min-height: 100vh;
      display: flex;
      align-items: center;
      position: relative;
      padding: 6rem 0 4rem;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 250, 0.9) 100%);
      overflow: hidden;
    }

    .hero-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><defs><radialGradient id="a" cx="50%" cy="50%"><stop offset="0%" stop-color="%23007AFF" stop-opacity="0.03"/><stop offset="100%" stop-color="%23007AFF" stop-opacity="0"/></radialGradient><radialGradient id="b" cx="50%" cy="50%"><stop offset="0%" stop-color="%235856D6" stop-opacity="0.02"/><stop offset="100%" stop-color="%235856D6" stop-opacity="0"/></radialGradient></defs><circle cx="200" cy="200" r="150" fill="url(%23a)"/><circle cx="800" cy="300" r="100" fill="url(%23b)"/><circle cx="600" cy="700" r="120" fill="url(%23a)"/></svg>') no-repeat center center;
      background-size: cover;
      opacity: 0.6;
    }

    .hero-content {
      position: relative;
      z-index: 2;
      text-align: center;
    }

    .hero-title {
      font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: clamp(2.5rem, 6vw, 4.5rem);
      font-weight: 700;
      color: #1C1C1E;
      line-height: 1.1;
      margin-bottom: 2rem;
      letter-spacing: -0.02em;
      position: relative;
    }

    .hero-title::after {
      content: '';
      position: absolute;
      bottom: -15px;
      left: 50%;
      transform: translateX(-50%);
      width: 80px;
      height: 3px;
      background: linear-gradient(90deg, #007AFF, #5856D6, #00C7BE);
      border-radius: 2px;
      animation: subtleGlow 3s ease-in-out infinite;
    }

    @keyframes subtleGlow {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
    }

    .hero-subtitle {
      font-size: 1.25rem;
      color: #8E8E93;
      margin-bottom: 3rem;
      font-weight: 400;
      line-height: 1.6;
      max-width: 700px;
      margin-left: auto;
      margin-right: auto;
      letter-spacing: -0.01em;
    }

    /* Boutons modernes style Apple */
    .btn-primary {
      background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
      color: white;
      border: none;
      padding: 1rem 2.5rem;
      border-radius: 1.5rem;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0, 122, 255, 0.3);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
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
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 122, 255, 0.4);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.9);
      color: #007AFF;
      border: 1px solid rgba(0, 122, 255, 0.3);
      padding: 1rem 2.5rem;
      border-radius: 1.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    .btn-secondary:hover {
      background: #007AFF;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 122, 255, 0.3);
    }

    /* Service Cards modernes style Apple */
    .service-card {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(0, 0, 0, 0.05);
      border-radius: 1.5rem;
      padding: 2.5rem;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }

    .service-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #007AFF 0%, #5856D6 50%, #00C7BE 100%);
      transform: scaleX(0);
      transition: transform 0.4s ease;
      border-radius: 1.5rem 1.5rem 0 0;
    }

    .service-card:hover::before {
      transform: scaleX(1);
    }

    .service-card::after {
      content: '✨';
      position: absolute;
      top: 1.5rem;
      right: 1.5rem;
      font-size: 1.2rem;
      opacity: 0.4;
      transition: all 0.3s ease;
    }

    .service-card:hover::after {
      opacity: 0.8;
      transform: scale(1.1);
    }

    .service-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(0, 122, 255, 0.15);
      background: rgba(255, 255, 255, 0.95);
      border-color: rgba(0, 122, 255, 0.2);
    }

    .service-title {
      font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 1.5rem;
      font-weight: 600;
      color: #1C1C1E;
      margin-bottom: 1rem;
      letter-spacing: -0.01em;
    }

    .service-description {
      color: #8E8E93;
      line-height: 1.6;
      margin-bottom: 2rem;
      font-size: 1rem;
    }

    .service-price {
      font-size: 2rem;
      font-weight: 700;
      color: #007AFF;
      margin-bottom: 0.5rem;
      letter-spacing: -0.02em;
      font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    .service-duration {
      color: #5856D6;
      font-size: 0.9rem;
      margin-bottom: 2rem;
      font-weight: 500;
    }

    /* Team Section moderne style Apple */
    .team-member {
      text-align: center;
      padding: 2.5rem 2rem;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 1.5rem;
      transition: all 0.3s ease;
      border: 1px solid rgba(0, 0, 0, 0.05);
      position: relative;
      overflow: hidden;
      backdrop-filter: blur(20px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }

    .team-member::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(0, 122, 255, 0.05) 0%, transparent 70%);
      transform: scale(0);
      transition: transform 0.5s ease;
    }

    .team-member:hover::before {
      transform: scale(1);
    }

    .team-member:hover {
      transform: translateY(-4px);
      background: rgba(255, 255, 255, 0.95);
      box-shadow: 0 12px 40px rgba(0, 122, 255, 0.15);
      border-color: rgba(0, 122, 255, 0.2);
    }

    .team-avatar {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      margin: 0 auto 1.5rem;
      border: 3px solid #007AFF;
      object-fit: cover;
      transition: all 0.3s ease;
      position: relative;
      z-index: 2;
      box-shadow: 0 4px 15px rgba(0, 122, 255, 0.2);
    }

    .team-member:hover .team-avatar {
      transform: scale(1.05);
      border-color: #5856D6;
      box-shadow: 0 8px 25px rgba(88, 86, 214, 0.3);
    }

    .team-name {
      font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1C1C1E;
      margin-bottom: 0.5rem;
      letter-spacing: -0.01em;
      position: relative;
      z-index: 2;
    }

    .team-role {
      color: #8E8E93;
      font-weight: 500;
      font-size: 1rem;
      position: relative;
      z-index: 2;
    }

    /* Contact Section moderne style Apple */
    .contact-info {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(20px);
      border-radius: 1.5rem;
      padding: 2.5rem;
      border: 1px solid rgba(0, 0, 0, 0.05);
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }

    .contact-info:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(0, 122, 255, 0.15);
      border-color: rgba(0, 122, 255, 0.2);
    }

    .contact-info::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 60px;
      height: 60px;
      background: radial-gradient(circle, rgba(0, 122, 255, 0.1) 0%, transparent 70%);
      border-radius: 0 1.5rem 0 1.5rem;
    }

    .contact-title {
      font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 1.5rem;
      font-weight: 600;
      color: #1C1C1E;
      margin-bottom: 2rem;
      letter-spacing: -0.01em;
    }

    .contact-item {
      display: flex;
      align-items: center;
      margin-bottom: 1.25rem;
      padding: 1rem;
      border-radius: 1rem;
      transition: all 0.3s ease;
      color: #1C1C1E;
    }

    .contact-item:hover {
      background: rgba(0, 122, 255, 0.08);
      transform: translateX(5px);
    }

    .contact-icon {
      width: 20px;
      height: 20px;
      margin-right: 1.25rem;
      color: #007AFF;
      font-size: 1.125rem;
    }

    .hours-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      transition: all 0.3s ease;
    }

    .hours-item:last-child {
      border-bottom: none;
    }

    .hours-item:hover {
      background: rgba(0, 122, 255, 0.05);
      padding-left: 0.5rem;
      padding-right: 0.5rem;
      border-radius: 0.5rem;
    }

    .hours-day {
      font-weight: 600;
      color: #1C1C1E;
      font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    .hours-time {
      color: #8E8E93;
      font-size: 1rem;
      font-weight: 500;
    }

    /* Footer moderne style Apple */
    .footer {
      background: linear-gradient(135deg, #F2F2F7 0%, #E5E5EA 100%);
      color: #1C1C1E;
      padding: 4rem 0 2rem;
      margin-top: 5rem;
      position: relative;
      overflow: hidden;
      border-top: 1px solid rgba(0, 0, 0, 0.05);
    }

    .footer::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M0,50 Q25,25 50,50 T100,50" fill="none" stroke="rgba(0,122,255,0.03)" stroke-width="1"/></svg>') repeat;
      background-size: 100px 100px;
    }

    .footer-content {
      text-align: center;
      position: relative;
      z-index: 2;
    }

    .footer-logo {
      font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 2rem;
      font-weight: 700;
      color: #1C1C1E;
      margin-bottom: 2rem;
      letter-spacing: -0.02em;
    }

    .footer-text {
      color: #8E8E93;
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
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .social-link {
      width: 50px;
      height: 50px;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #007AFF;
      text-decoration: none;
      transition: all 0.3s ease;
      border: 1px solid rgba(0, 0, 0, 0.05);
      font-size: 1.25rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
    }

    .social-link:hover {
      background: #007AFF;
      color: white;
      transform: translateY(-2px) scale(1.05);
      box-shadow: 0 6px 20px rgba(0, 122, 255, 0.3);
    }

    .copyright {
      color: #8E8E93;
      font-size: 0.9rem;
      border-top: 1px solid rgba(0, 0, 0, 0.05);
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

    @keyframes hologram {
      0%, 100% { 
        opacity: 0.8; 
        transform: translateZ(0) scale(1);
        filter: hue-rotate(0deg);
      }
      50% { 
        opacity: 1; 
        transform: translateZ(10px) scale(1.02);
        filter: hue-rotate(180deg);
      }
    }

    @keyframes cyberpunkPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    .fade-in-up {
      animation: fadeInUp 0.8s ease-out;
    }

    .hologram {
      background: linear-gradient(45deg, 
        rgba(0, 212, 255, 0.1) 0%, 
        rgba(123, 104, 238, 0.1) 50%, 
        rgba(255, 20, 147, 0.1) 100%);
      animation: hologram 3s ease-in-out infinite;
    }

    .cyberpunk-pulse {
      animation: cyberpunkPulse 3s ease-in-out infinite;
    }

    .stagger-1 { animation-delay: 0.1s; }
    .stagger-2 { animation-delay: 0.2s; }
    .stagger-3 { animation-delay: 0.3s; }
    .stagger-4 { animation-delay: 0.4s; }

    /* Scan Lines Effect */
    .scan-lines {
      position: relative;
      overflow: hidden;
    }
    
    .scan-lines::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        transparent 50%, 
        rgba(0, 212, 255, 0.03) 50%
      );
      background-size: 100% 4px;
      animation: scanLines 2s linear infinite;
      pointer-events: none;
    }
    
    @keyframes scanLines {
      0% { transform: translateY(-100%); }
      100% { transform: translateY(100vh); }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .cyber-hero-title {
        font-size: 2.5rem;
      }
      
      .cyber-service-card {
        padding: 2rem;
      }
      
      .cyber-btn-primary, .cyber-btn-secondary {
        padding: 1rem 2rem;
        font-size: 1rem;
      }

      .cyber-services-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .cyber-team-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .cyber-contact-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
    }

    /* Scroll Animations */
    @media (prefers-reduced-motion: no-preference) {
      .cyber-service-card {
        opacity: 0;
        transform: translateY(30px);
        animation: fadeInUp 0.8s ease-out forwards;
      }

      .cyber-team-member {
        opacity: 0;
        transform: translateY(30px);
        animation: fadeInUp 0.8s ease-out forwards;
      }
    }
  `
};
