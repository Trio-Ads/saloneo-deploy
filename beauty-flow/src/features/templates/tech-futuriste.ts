import { DesignTemplate } from './types';

export const techFuturisteTemplate: DesignTemplate = {
  id: 'tech-futuriste',
  name: 'Tech Futuriste',
  category: 'modern',
  description: 'Néons digitaux, interfaces holographiques, animations cyberpunk',
  preview: '/templates/previews/tech-futuriste.jpg',
  theme: {
    colors: {
      primary: '#00D4FF',
      secondary: '#7B68EE',
      accent: '#FF1493',
      background: '#0B0C10',
      surface: '#1F2833',
      text: '#C5C6C7',
      textSecondary: '#66FCF1',
      custom: {
        cyan: '#00D4FF',
        purple: '#7B68EE',
        magenta: '#FF1493',
        electric: '#66FCF1',
        dark: '#0B0C10',
        steel: '#45A29E',
        neonGreen: '#39FF14',
        hologram: '#00FFFF'
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
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Exo+2:wght@300;400;500;600;700&display=swap');
    
    .tech-futuriste-2025 {
      font-family: 'Exo 2', sans-serif;
      background: linear-gradient(135deg, #0B0C10 0%, #1F2833 100%);
      min-height: 100vh;
      position: relative;
      overflow-x: hidden;
    }

    /* Cyberpunk Grid Background */
    .tech-futuriste-2025::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        linear-gradient(90deg, transparent 98%, rgba(0, 212, 255, 0.1) 100%),
        linear-gradient(0deg, transparent 98%, rgba(123, 104, 238, 0.05) 100%),
        radial-gradient(circle at 25% 75%, rgba(255, 20, 147, 0.03) 0%, transparent 50%);
      background-size: 30px 30px, 30px 30px, 200px 200px;
      pointer-events: none;
      z-index: 0;
    }

    /* Holographic Data Stream */
    .tech-futuriste-2025::after {
      content: '';
      position: fixed;
      top: -10%;
      left: -10%;
      width: 120%;
      height: 120%;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="10" y="10" width="2" height="80" fill="%2300D4FF" opacity="0.1"><animate attributeName="opacity" values="0.1;0.8;0.1" dur="2s" repeatCount="indefinite"/></rect><rect x="30" y="20" width="1" height="60" fill="%237B68EE" opacity="0.08"><animate attributeName="opacity" values="0.08;0.6;0.08" dur="1.5s" repeatCount="indefinite"/></rect><rect x="50" y="5" width="3" height="90" fill="%23FF1493" opacity="0.06"><animate attributeName="opacity" values="0.06;0.4;0.06" dur="3s" repeatCount="indefinite"/></rect><circle cx="70" cy="30" r="1" fill="%2366FCF1" opacity="0.5"><animate attributeName="opacity" values="0.5;1;0.5" dur="1s" repeatCount="indefinite"/></circle></svg>') repeat;
      background-size: 150px 150px;
      animation: dataStream 8s linear infinite;
      pointer-events: none;
      z-index: 1;
    }

    @keyframes dataStream {
      0% { transform: translateX(0) translateY(0); }
      100% { transform: translateX(-150px) translateY(-150px); }
    }

    /* Navigation */
    .cyber-navbar {
      background: rgba(11, 12, 16, 0.95);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 2px solid rgba(0, 212, 255, 0.3);
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      padding: 1rem 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .cyber-navbar.scrolled {
      background: rgba(11, 12, 16, 0.98);
      box-shadow: 0 4px 20px rgba(0, 212, 255, 0.3);
    }

    .cyber-logo {
      font-family: 'Orbitron', monospace;
      font-size: 1.75rem;
      font-weight: 800;
      color: #00D4FF;
      letter-spacing: 0.1em;
      position: relative;
      text-shadow: 0 0 10px rgba(0, 212, 255, 0.8);
      text-transform: uppercase;
    }

    .cyber-logo::after {
      content: '◉';
      margin-left: 0.5rem;
      font-size: 1.2rem;
      animation: hologramPulse 2s ease-in-out infinite;
      color: #FF1493;
    }

    @keyframes hologramPulse {
      0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.8; }
      50% { transform: scale(1.2) rotate(180deg); opacity: 1; }
    }

    .cyber-nav-link {
      color: #C5C6C7;
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

    .cyber-nav-link::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.2), transparent);
      transition: left 0.5s;
    }

    .cyber-nav-link:hover::before {
      left: 100%;
    }

    .cyber-nav-link:hover {
      color: #00D4FF;
      background: rgba(0, 212, 255, 0.1);
      transform: translateY(-1px);
      text-shadow: 0 0 8px rgba(0, 212, 255, 0.6);
      box-shadow: 0 0 15px rgba(0, 212, 255, 0.3);
    }

    /* Hero Section */
    .cyber-hero {
      min-height: 100vh;
      display: flex;
      align-items: center;
      position: relative;
      padding: 6rem 0 4rem;
      background: linear-gradient(135deg, rgba(11, 12, 16, 0.9) 0%, rgba(31, 40, 51, 0.8) 100%);
    }

    .cyber-hero-content {
      position: relative;
      z-index: 2;
      text-align: center;
    }

    .cyber-hero-title {
      font-family: 'Orbitron', monospace;
      font-size: clamp(2.5rem, 6vw, 4.5rem);
      font-weight: 900;
      color: #00D4FF;
      line-height: 1.1;
      margin-bottom: 2rem;
      letter-spacing: 0.05em;
      position: relative;
      text-shadow: 0 0 20px rgba(0, 212, 255, 0.8);
      text-transform: uppercase;
    }

    .cyber-hero-title::after {
      content: '';
      position: absolute;
      bottom: -15px;
      left: 50%;
      transform: translateX(-50%);
      width: 120px;
      height: 4px;
      background: linear-gradient(90deg, #00D4FF, #7B68EE, #FF1493);
      border-radius: 0;
      box-shadow: 0 0 15px rgba(0, 212, 255, 0.8);
      animation: cyberpunkGlow 2s ease-in-out infinite;
    }

    @keyframes cyberpunkGlow {
      0%, 100% { box-shadow: 0 0 15px rgba(0, 212, 255, 0.8); }
      50% { box-shadow: 0 0 30px rgba(255, 20, 147, 0.8); }
    }

    .cyber-hero-subtitle {
      font-size: 1.25rem;
      color: #C5C6C7;
      margin-bottom: 3rem;
      font-weight: 500;
      line-height: 1.6;
      max-width: 700px;
      margin-left: auto;
      margin-right: auto;
      letter-spacing: 0.02em;
    }

    /* Buttons */
    .cyber-btn-primary {
      background: linear-gradient(135deg, #00D4FF 0%, #7B68EE 100%);
      color: #0B0C10;
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
      box-shadow: 0 8px 25px rgba(0, 212, 255, 0.4);
    }

    .cyber-btn-primary::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.6s;
    }

    .cyber-btn-primary:hover::before {
      left: 100%;
    }

    .cyber-btn-primary:hover {
      transform: translateY(-3px) scale(1.05);
      box-shadow: 0 12px 35px rgba(0, 212, 255, 0.6);
      text-shadow: 0 0 10px rgba(11, 12, 16, 0.8);
    }

    .cyber-btn-secondary {
      background: transparent;
      color: #FF1493;
      border: 2px solid #FF1493;
      padding: 1.25rem 3rem;
      border-radius: 0.25rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      backdrop-filter: blur(10px);
    }

    .cyber-btn-secondary:hover {
      background: #FF1493;
      color: #0B0C10;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(255, 20, 147, 0.4);
    }

    /* Service Cards */
    .cyber-services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 2.5rem;
      margin-top: 4rem;
    }

    .cyber-service-card {
      background: rgba(31, 40, 51, 0.9);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(0, 212, 255, 0.3);
      border-radius: 0.5rem;
      padding: 2.5rem;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }

    .cyber-service-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #00D4FF 0%, #7B68EE 50%, #FF1493 100%);
      transform: scaleX(0);
      transition: transform 0.4s ease;
    }

    .cyber-service-card:hover::before {
      transform: scaleX(1);
    }

    .cyber-service-card::after {
      content: '⚡';
      position: absolute;
      top: 1.5rem;
      right: 1.5rem;
      font-size: 1.5rem;
      opacity: 0.3;
      transition: all 0.3s ease;
    }

    .cyber-service-card:hover::after {
      opacity: 0.8;
      transform: scale(1.2) rotate(15deg);
      animation: electricPulse 1s ease-in-out infinite;
    }

    @keyframes electricPulse {
      0%, 100% { transform: scale(1.2) rotate(15deg); filter: hue-rotate(0deg); }
      50% { transform: scale(1.4) rotate(25deg); filter: hue-rotate(180deg); }
    }

    .cyber-service-card:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 20px 40px rgba(0, 212, 255, 0.3);
      background: rgba(31, 40, 51, 0.95);
      border-color: rgba(0, 212, 255, 0.6);
    }

    .cyber-service-title {
      font-family: 'Orbitron', monospace;
      font-size: 1.5rem;
      font-weight: 700;
      color: #00D4FF;
      margin-bottom: 1rem;
      letter-spacing: 0.02em;
      text-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
      text-transform: uppercase;
    }

    .cyber-service-description {
      color: #C5C6C7;
      line-height: 1.6;
      margin-bottom: 2rem;
      font-size: 1rem;
    }

    .cyber-service-price {
      font-size: 2rem;
      font-weight: 700;
      color: #7B68EE;
      margin-bottom: 0.5rem;
      letter-spacing: -0.02em;
      text-shadow: 0 0 15px rgba(123, 104, 238, 0.5);
    }

    .cyber-service-duration {
      color: #FF1493;
      font-size: 0.9rem;
      margin-bottom: 2rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Team Section */
    .cyber-team-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2.5rem;
      margin-top: 4rem;
    }

    .cyber-team-member {
      text-align: center;
      padding: 2.5rem 2rem;
      background: rgba(31, 40, 51, 0.8);
      border-radius: 0.5rem;
      transition: all 0.4s ease;
      border: 1px solid rgba(0, 212, 255, 0.2);
      position: relative;
      overflow: hidden;
    }

    .cyber-team-member::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(0, 212, 255, 0.1) 0%, transparent 70%);
      transform: scale(0);
      transition: transform 0.5s ease;
    }

    .cyber-team-member:hover::before {
      transform: scale(1);
    }

    .cyber-team-member:hover {
      transform: translateY(-8px);
      background: rgba(31, 40, 51, 0.95);
      box-shadow: 0 15px 30px rgba(0, 212, 255, 0.2);
      border-color: rgba(0, 212, 255, 0.5);
    }

    .cyber-team-avatar {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      margin: 0 auto 1.5rem;
      border: 3px solid #00D4FF;
      object-fit: cover;
      transition: all 0.4s ease;
      position: relative;
      z-index: 2;
      box-shadow: 0 0 20px rgba(0, 212, 255, 0.4);
    }

    .cyber-team-member:hover .cyber-team-avatar {
      transform: scale(1.1);
      border-color: #7B68EE;
      box-shadow: 0 0 30px rgba(123, 104, 238, 0.6);
    }

    .cyber-team-name {
      font-family: 'Orbitron', monospace;
      font-size: 1.25rem;
      font-weight: 700;
      color: #00D4FF;
      margin-bottom: 0.5rem;
      letter-spacing: 0.02em;
      position: relative;
      z-index: 2;
      text-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
      text-transform: uppercase;
    }

    .cyber-team-role {
      color: #C5C6C7;
      font-weight: 600;
      font-size: 1rem;
      position: relative;
      z-index: 2;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Contact Section */
    .cyber-contact-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 2.5rem;
      margin-top: 4rem;
    }

    .cyber-contact-card {
      background: rgba(31, 40, 51, 0.9);
      backdrop-filter: blur(20px);
      border-radius: 0.5rem;
      padding: 2.5rem;
      border: 1px solid rgba(0, 212, 255, 0.3);
      position: relative;
      overflow: hidden;
    }

    .cyber-contact-card::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 60px;
      height: 60px;
      background: radial-gradient(circle, rgba(123, 104, 238, 0.2) 0%, transparent 70%);
      border-radius: 0 0.5rem 0 0.5rem;
    }

    .cyber-contact-title {
      font-family: 'Orbitron', monospace;
      font-size: 1.5rem;
      font-weight: 700;
      color: #00D4FF;
      margin-bottom: 2rem;
      letter-spacing: 0.02em;
      text-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
      text-transform: uppercase;
    }

    .cyber-contact-item {
      display: flex;
      align-items: center;
      margin-bottom: 1.25rem;
      padding: 1rem;
      border-radius: 0.25rem;
      transition: all 0.3s ease;
    }

    .cyber-contact-item:hover {
      background: rgba(0, 212, 255, 0.1);
      transform: translateX(5px);
    }

    .cyber-contact-icon {
      width: 20px;
      height: 20px;
      margin-right: 1.25rem;
      color: #7B68EE;
    }

    .cyber-hours-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
      border-bottom: 1px solid rgba(0, 212, 255, 0.2);
    }

    .cyber-hours-item:last-child {
      border-bottom: none;
    }

    .cyber-hours-day {
      font-weight: 700;
      color: #00D4FF;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .cyber-hours-time {
      color: #C5C6C7;
      font-size: 1rem;
      font-weight: 500;
    }

    /* Footer */
    .cyber-footer {
      background: linear-gradient(135deg, #0B0C10 0%, #000000 100%);
      color: #C5C6C7;
      padding: 4rem 0 2rem;
      margin-top: 5rem;
      position: relative;
      overflow: hidden;
      border-top: 2px solid rgba(0, 212, 255, 0.3);
    }

    .cyber-footer::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M0,50 Q25,25 50,50 T100,50" fill="none" stroke="rgba(0,212,255,0.05)" stroke-width="1"/></svg>') repeat;
      background-size: 100px 100px;
    }

    .cyber-footer-content {
      text-align: center;
      position: relative;
      z-index: 2;
    }

    .cyber-footer-logo {
      font-family: 'Orbitron', monospace;
      font-size: 2rem;
      font-weight: 900;
      color: #00D4FF;
      margin-bottom: 2rem;
      letter-spacing: 0.1em;
      text-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
      text-transform: uppercase;
    }

    .cyber-footer-text {
      color: rgba(197, 198, 199, 0.8);
      margin-bottom: 3rem;
      font-size: 1.05rem;
      line-height: 1.6;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }

    .cyber-social-links {
      display: flex;
      justify-content: center;
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .cyber-social-link {
      width: 55px;
      height: 55px;
      background: rgba(0, 212, 255, 0.1);
      border-radius: 0.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #00D4FF;
      text-decoration: none;
      transition: all 0.3s ease;
      border: 2px solid rgba(0, 212, 255, 0.3);
      font-size: 1.5rem;
    }

    .cyber-social-link:hover {
      background: #00D4FF;
      color: #0B0C10;
      transform: translateY(-3px) scale(1.1);
      border-color: #00D4FF;
      box-shadow: 0 8px 25px rgba(0, 212, 255, 0.4);
    }

    .cyber-copyright {
      color: rgba(197, 198, 199, 0.6);
      font-size: 0.9rem;
      border-top: 1px solid rgba(0, 212, 255, 0.2);
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
