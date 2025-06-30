import { DesignTemplate } from './types';

export const urbanStreetArtTemplate: DesignTemplate = {
  id: 'urban-street-art',
  name: 'Urban Barbershop',
  category: 'creative',
  description: 'Design masculin moderne avec effets néon, graffitis urbains et esthétique barbershop',
  preview: '/templates/previews/urban-street-art.jpg',
  theme: {
    colors: {
      primary: '#FF6B35',
      secondary: '#00D4FF',
      accent: '#FFD23F',
      background: '#0F0F0F',
      surface: '#1C1C1C',
      text: '#FFFFFF',
      textSecondary: '#B8B8B8',
      custom: {
        neonOrange: '#FF6B35',
        electricBlue: '#00D4FF',
        goldYellow: '#FFD23F',
        neonGreen: '#39FF14',
        darkCharcoal: '#1C1C1C',
        steelGray: '#2A2A2A',
        crimsonRed: '#DC143C'
      }
    },
    typography: {
      headingFont: 'Orbitron Variable, monospace',
      bodyFont: 'Rajdhani Variable, sans-serif',
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
        blur: '15px',
        opacity: '0.1',
        border: '1px solid rgba(255, 107, 53, 0.3)'
      },
      animations: ['glitchEffect', 'neonPulse', 'urbanFade'],
      transitions: ['cyberpunk', 'street'],
      specialEffects: ['neonSigns', 'urbanGlow', 'streetLights'],
      shadows: {
        sm: '0 0 5px rgba(255, 107, 53, 0.3)',
        md: '0 0 10px rgba(255, 107, 53, 0.5)',
        lg: '0 0 20px rgba(255, 107, 53, 0.7)',
        xl: '0 0 30px rgba(255, 107, 53, 0.9)',
        neon: '0 0 40px rgba(255, 107, 53, 1), 0 0 80px rgba(0, 212, 255, 0.5)'
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
        maxWidth: '1400px',
        padding: '1.5rem'
      }
    }
  },
  assets: {
    patterns: ['urban-grid', 'neon-lines', 'barbershop-stripes'],
    particles: [
      {
        type: 'glitch',
        count: 30,
        size: { min: 2, max: 4 },
        speed: { min: 1, max: 3 },
        color: '#FF6B35',
        opacity: { min: 0.4, max: 0.8 }
      },
      {
        type: 'sparkle',
        count: 20,
        size: { min: 1, max: 3 },
        speed: { min: 2, max: 4 },
        color: '#00D4FF',
        opacity: { min: 0.5, max: 1 }
      }
    ]
  },
  customCSS: `
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Rajdhani:wght@300;400;500;600;700&display=swap');
    
    .urban-barbershop-2025 {
      font-family: 'Rajdhani', sans-serif;
      background: linear-gradient(135deg, #0F0F0F 0%, #1C1C1C 100%);
      min-height: 100vh;
      position: relative;
      overflow-x: hidden;
    }

    /* Urban Background Pattern */
    .urban-barbershop-2025::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        linear-gradient(90deg, transparent 98%, rgba(255, 107, 53, 0.1) 100%),
        linear-gradient(0deg, transparent 98%, rgba(0, 212, 255, 0.05) 100%),
        radial-gradient(circle at 20% 80%, rgba(255, 210, 63, 0.03) 0%, transparent 50%);
      background-size: 50px 50px, 50px 50px, 300px 300px;
      pointer-events: none;
      z-index: 0;
    }

    /* Neon Grid Animation */
    .urban-barbershop-2025::after {
      content: '';
      position: fixed;
      top: -10%;
      left: -10%;
      width: 120%;
      height: 120%;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><line x1="0" y1="50" x2="100" y2="50" stroke="%23FF6B35" stroke-width="0.5" opacity="0.2"><animate attributeName="opacity" values="0.2;0.8;0.2" dur="4s" repeatCount="indefinite"/></line><line x1="50" y1="0" x2="50" y2="100" stroke="%2300D4FF" stroke-width="0.5" opacity="0.15"><animate attributeName="opacity" values="0.15;0.6;0.15" dur="3s" repeatCount="indefinite"/></line></svg>') repeat;
      background-size: 100px 100px;
      animation: gridPulse 8s linear infinite;
      pointer-events: none;
      z-index: 1;
    }

    @keyframes gridPulse {
      0% { transform: translateX(0) translateY(0); }
      100% { transform: translateX(-100px) translateY(-100px); }
    }

    /* Navigation */
    .urban-navbar {
      background: rgba(15, 15, 15, 0.95);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 2px solid rgba(255, 107, 53, 0.3);
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      padding: 1rem 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .urban-navbar.scrolled {
      background: rgba(15, 15, 15, 0.98);
      box-shadow: 0 4px 20px rgba(255, 107, 53, 0.3);
    }

    .urban-logo {
      font-family: 'Orbitron', monospace;
      font-size: 1.75rem;
      font-weight: 800;
      color: #FF6B35;
      letter-spacing: 0.1em;
      position: relative;
      text-shadow: 0 0 10px rgba(255, 107, 53, 0.8);
      text-transform: uppercase;
    }

    .urban-logo::after {
      content: '⚡';
      margin-left: 0.5rem;
      font-size: 1.2rem;
      animation: electricPulse 1.5s ease-in-out infinite;
    }

    @keyframes electricPulse {
      0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.8; }
      50% { transform: scale(1.3) rotate(180deg); opacity: 1; }
    }

    .urban-nav-link {
      color: #B8B8B8;
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

    .urban-nav-link::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 107, 53, 0.2), transparent);
      transition: left 0.5s;
    }

    .urban-nav-link:hover::before {
      left: 100%;
    }

    .urban-nav-link:hover {
      color: #FF6B35;
      background: rgba(255, 107, 53, 0.1);
      transform: translateY(-1px);
      text-shadow: 0 0 8px rgba(255, 107, 53, 0.6);
    }

    /* Hero Section */
    .urban-hero {
      min-height: 100vh;
      display: flex;
      align-items: center;
      position: relative;
      padding: 6rem 0 4rem;
      background: linear-gradient(135deg, rgba(15, 15, 15, 0.9) 0%, rgba(28, 28, 28, 0.8) 100%);
    }

    .urban-hero-content {
      position: relative;
      z-index: 2;
      text-align: center;
    }

    .urban-hero-title {
      font-family: 'Orbitron', monospace;
      font-size: clamp(2.5rem, 6vw, 4.5rem);
      font-weight: 900;
      color: #FF6B35;
      line-height: 1.1;
      margin-bottom: 2rem;
      letter-spacing: 0.05em;
      position: relative;
      text-shadow: 0 0 20px rgba(255, 107, 53, 0.8);
      text-transform: uppercase;
    }

    .urban-hero-title::after {
      content: '';
      position: absolute;
      bottom: -15px;
      left: 50%;
      transform: translateX(-50%);
      width: 120px;
      height: 4px;
      background: linear-gradient(90deg, #FF6B35, #00D4FF, #FFD23F);
      border-radius: 2px;
      box-shadow: 0 0 15px rgba(255, 107, 53, 0.8);
    }

    .urban-hero-subtitle {
      font-size: 1.25rem;
      color: #B8B8B8;
      margin-bottom: 3rem;
      font-weight: 500;
      line-height: 1.6;
      max-width: 700px;
      margin-left: auto;
      margin-right: auto;
      letter-spacing: 0.02em;
    }

    /* Buttons */
    .urban-btn-primary {
      background: linear-gradient(135deg, #FF6B35 0%, #DC143C 100%);
      color: #FFFFFF;
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
      box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4);
    }

    .urban-btn-primary::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.6s;
    }

    .urban-btn-primary:hover::before {
      left: 100%;
    }

    .urban-btn-primary:hover {
      transform: translateY(-3px) scale(1.05);
      box-shadow: 0 12px 35px rgba(255, 107, 53, 0.6);
      text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
    }

    .urban-btn-secondary {
      background: transparent;
      color: #00D4FF;
      border: 2px solid #00D4FF;
      padding: 1.25rem 3rem;
      border-radius: 0.25rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      backdrop-filter: blur(10px);
    }

    .urban-btn-secondary:hover {
      background: #00D4FF;
      color: #0F0F0F;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 212, 255, 0.4);
    }

    /* Service Cards */
    .urban-services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 2.5rem;
      margin-top: 4rem;
    }

    .urban-service-card {
      background: rgba(28, 28, 28, 0.9);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 107, 53, 0.3);
      border-radius: 0.5rem;
      padding: 2.5rem;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }

    .urban-service-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #FF6B35 0%, #00D4FF 50%, #FFD23F 100%);
      transform: scaleX(0);
      transition: transform 0.4s ease;
    }

    .urban-service-card:hover::before {
      transform: scaleX(1);
    }

    .urban-service-card::after {
      content: '✂️';
      position: absolute;
      top: 1.5rem;
      right: 1.5rem;
      font-size: 1.5rem;
      opacity: 0.3;
      transition: all 0.3s ease;
    }

    .urban-service-card:hover::after {
      opacity: 0.8;
      transform: scale(1.2) rotate(15deg);
    }

    .urban-service-card:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 20px 40px rgba(255, 107, 53, 0.3);
      background: rgba(28, 28, 28, 0.95);
      border-color: rgba(255, 107, 53, 0.6);
    }

    .urban-service-title {
      font-family: 'Orbitron', monospace;
      font-size: 1.5rem;
      font-weight: 700;
      color: #FF6B35;
      margin-bottom: 1rem;
      letter-spacing: 0.02em;
      text-shadow: 0 0 10px rgba(255, 107, 53, 0.3);
      text-transform: uppercase;
    }

    .urban-service-description {
      color: #B8B8B8;
      line-height: 1.6;
      margin-bottom: 2rem;
      font-size: 1rem;
    }

    .urban-service-price {
      font-size: 2rem;
      font-weight: 700;
      color: #00D4FF;
      margin-bottom: 0.5rem;
      letter-spacing: -0.02em;
      text-shadow: 0 0 15px rgba(0, 212, 255, 0.5);
    }

    .urban-service-duration {
      color: #FFD23F;
      font-size: 0.9rem;
      margin-bottom: 2rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Team Section */
    .urban-team-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2.5rem;
      margin-top: 4rem;
    }

    .urban-team-member {
      text-align: center;
      padding: 2.5rem 2rem;
      background: rgba(28, 28, 28, 0.8);
      border-radius: 0.5rem;
      transition: all 0.4s ease;
      border: 1px solid rgba(255, 107, 53, 0.2);
      position: relative;
      overflow: hidden;
    }

    .urban-team-member::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255, 107, 53, 0.1) 0%, transparent 70%);
      transform: scale(0);
      transition: transform 0.5s ease;
    }

    .urban-team-member:hover::before {
      transform: scale(1);
    }

    .urban-team-member:hover {
      transform: translateY(-8px);
      background: rgba(28, 28, 28, 0.95);
      box-shadow: 0 15px 30px rgba(255, 107, 53, 0.2);
      border-color: rgba(255, 107, 53, 0.5);
    }

    .urban-team-avatar {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      margin: 0 auto 1.5rem;
      border: 3px solid #FF6B35;
      object-fit: cover;
      transition: all 0.4s ease;
      position: relative;
      z-index: 2;
      box-shadow: 0 0 20px rgba(255, 107, 53, 0.4);
    }

    .urban-team-member:hover .urban-team-avatar {
      transform: scale(1.1);
      border-color: #00D4FF;
      box-shadow: 0 0 30px rgba(0, 212, 255, 0.6);
    }

    .urban-team-name {
      font-family: 'Orbitron', monospace;
      font-size: 1.25rem;
      font-weight: 700;
      color: #FF6B35;
      margin-bottom: 0.5rem;
      letter-spacing: 0.02em;
      position: relative;
      z-index: 2;
      text-shadow: 0 0 10px rgba(255, 107, 53, 0.3);
      text-transform: uppercase;
    }

    .urban-team-role {
      color: #B8B8B8;
      font-weight: 600;
      font-size: 1rem;
      position: relative;
      z-index: 2;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Contact Section */
    .urban-contact-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 2.5rem;
      margin-top: 4rem;
    }

    .urban-contact-card {
      background: rgba(28, 28, 28, 0.9);
      backdrop-filter: blur(20px);
      border-radius: 0.5rem;
      padding: 2.5rem;
      border: 1px solid rgba(255, 107, 53, 0.3);
      position: relative;
      overflow: hidden;
    }

    .urban-contact-card::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 60px;
      height: 60px;
      background: radial-gradient(circle, rgba(0, 212, 255, 0.2) 0%, transparent 70%);
      border-radius: 0 0.5rem 0 0.5rem;
    }

    .urban-contact-title {
      font-family: 'Orbitron', monospace;
      font-size: 1.5rem;
      font-weight: 700;
      color: #FF6B35;
      margin-bottom: 2rem;
      letter-spacing: 0.02em;
      text-shadow: 0 0 10px rgba(255, 107, 53, 0.3);
      text-transform: uppercase;
    }

    .urban-contact-item {
      display: flex;
      align-items: center;
      margin-bottom: 1.25rem;
      padding: 1rem;
      border-radius: 0.25rem;
      transition: all 0.3s ease;
    }

    .urban-contact-item:hover {
      background: rgba(255, 107, 53, 0.1);
      transform: translateX(5px);
    }

    .urban-contact-icon {
      width: 20px;
      height: 20px;
      margin-right: 1.25rem;
      color: #00D4FF;
    }

    .urban-hours-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
      border-bottom: 1px solid rgba(255, 107, 53, 0.2);
    }

    .urban-hours-item:last-child {
      border-bottom: none;
    }

    .urban-hours-day {
      font-weight: 700;
      color: #FF6B35;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .urban-hours-time {
      color: #B8B8B8;
      font-size: 1rem;
      font-weight: 500;
    }

    /* Footer */
    .urban-footer {
      background: linear-gradient(135deg, #0F0F0F 0%, #000000 100%);
      color: #B8B8B8;
      padding: 4rem 0 2rem;
      margin-top: 5rem;
      position: relative;
      overflow: hidden;
      border-top: 2px solid rgba(255, 107, 53, 0.3);
    }

    .urban-footer::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M0,50 Q25,25 50,50 T100,50" fill="none" stroke="rgba(255,107,53,0.05)" stroke-width="1"/></svg>') repeat;
      background-size: 100px 100px;
    }

    .urban-footer-content {
      text-align: center;
      position: relative;
      z-index: 2;
    }

    .urban-footer-logo {
      font-family: 'Orbitron', monospace;
      font-size: 2rem;
      font-weight: 900;
      color: #FF6B35;
      margin-bottom: 2rem;
      letter-spacing: 0.1em;
      text-shadow: 0 0 20px rgba(255, 107, 53, 0.5);
      text-transform: uppercase;
    }

    .urban-footer-text {
      color: rgba(184, 184, 184, 0.8);
      margin-bottom: 3rem;
      font-size: 1.05rem;
      line-height: 1.6;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }

    .urban-social-links {
      display: flex;
      justify-content: center;
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .urban-social-link {
      width: 55px;
      height: 55px;
      background: rgba(255, 107, 53, 0.1);
      border-radius: 0.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FF6B35;
      text-decoration: none;
      transition: all 0.3s ease;
      border: 2px solid rgba(255, 107, 53, 0.3);
      font-size: 1.5rem;
    }

    .urban-social-link:hover {
      background: #FF6B35;
      color: #0F0F0F;
      transform: translateY(-3px) scale(1.1);
      border-color: #FF6B35;
      box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4);
    }

    .urban-copyright {
      color: rgba(184, 184, 184, 0.6);
      font-size: 0.9rem;
      border-top: 1px solid rgba(255, 107, 53, 0.2);
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

    @keyframes neonGlow {
      0%, 100% { 
        text-shadow: 0 0 5px #FF6B35, 0 0 10px #FF6B35, 0 0 15px #FF6B35;
      }
      50% { 
        text-shadow: 0 0 10px #FF6B35, 0 0 20px #FF6B35, 0 0 30px #FF6B35;
      }
    }

    @keyframes urbanPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    .fade-in-up {
      animation: fadeInUp 0.8s ease-out;
    }

    .neon-glow {
      animation: neonGlow 2s ease-in-out infinite;
    }

    .urban-pulse {
      animation: urbanPulse 3s ease-in-out infinite;
    }

    .stagger-1 { animation-delay: 0.1s; }
    .stagger-2 { animation-delay: 0.2s; }
    .stagger-3 { animation-delay: 0.3s; }
    .stagger-4 { animation-delay: 0.4s; }

    /* Glitch Effect */
    .glitch-effect {
      position: relative;
      animation: glitch 2s infinite;
    }
    
    .glitch-effect::before,
    .glitch-effect::after {
      content: attr(data-text);
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
    
    .glitch-effect::before {
      animation: glitch-1 0.5s infinite;
      color: #FF6B35;
      z-index: -1;
    }
    
    .glitch-effect::after {
      animation: glitch-2 0.5s infinite;
      color: #00D4FF;
      z-index: -2;
    }
    
    @keyframes glitch {
      0%, 100% { transform: translate(0); }
      20% { transform: translate(-2px, 2px); }
      40% { transform: translate(-2px, -2px); }
      60% { transform: translate(2px, 2px); }
      80% { transform: translate(2px, -2px); }
    }
    
    @keyframes glitch-1 {
      0%, 100% { transform: translate(0); }
      20% { transform: translate(2px, -2px); }
      40% { transform: translate(-2px, 2px); }
      60% { transform: translate(-2px, -2px); }
      80% { transform: translate(2px, 2px); }
    }
    
    @keyframes glitch-2 {
      0%, 100% { transform: translate(0); }
      20% { transform: translate(-2px, -2px); }
      40% { transform: translate(2px, -2px); }
      60% { transform: translate(2px, 2px); }
      80% { transform: translate(-2px, 2px); }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .urban-hero-title {
        font-size: 2.5rem;
      }
      
      .urban-service-card {
        padding: 2rem;
      }
      
      .urban-btn-primary, .urban-btn-secondary {
        padding: 1rem 2rem;
        font-size: 0.95rem;
      }

      .urban-services-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .urban-team-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .urban-contact-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
    }

    /* Scroll Animations */
    @media (prefers-reduced-motion: no-preference) {
      .urban-service-card {
        opacity: 0;
        transform: translateY(30px);
        animation: fadeInUp 0.8s ease-out forwards;
      }

      .urban-team-member {
        opacity: 0;
        transform: translateY(30px);
        animation: fadeInUp 0.8s ease-out forwards;
      }
    }
  `
};
