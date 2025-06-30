import { DesignTemplate } from './types';

export const minimalScandinavianTemplate: DesignTemplate = {
  id: 'minimal-scandinavian',
  name: 'Minimaliste Scandinave',
  category: 'minimal',
  description: 'Espaces blancs généreux, typographie fine, glassmorphism subtil avec reflets nordiques',
  preview: '/templates/previews/minimal-scandinavian.jpg',
  theme: {
    colors: {
      primary: '#F8F9FA',
      secondary: '#E9ECEF',
      accent: '#ADB5BD',
      background: '#FFFFFF',
      surface: '#FEFEFE',
      text: '#212529',
      textSecondary: '#6C757D',
      custom: {
        ice: '#F1F3F4',
        snow: '#FAFBFC',
        stone: '#DEE2E6',
        mist: '#F8F9FA'
      }
    },
    typography: {
      headingFont: 'Inter Variable, system-ui, sans-serif',
      bodyFont: 'Inter, system-ui, sans-serif',
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
        opacity: '0.05',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      },
      animations: ['fadeInUp', 'breathe', 'parallaxScroll'],
      transitions: ['smooth', 'elastic'],
      specialEffects: ['nordicAurora', 'snowParticles'],
      shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        neon: '0 0 20px rgba(173, 181, 189, 0.3)'
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
    patterns: ['nordic-lines', 'minimal-grid'],
    particles: [{
      type: 'floating',
      count: 15,
      size: { min: 2, max: 4 },
      speed: { min: 0.5, max: 1 },
      color: '#ADB5BD',
      opacity: { min: 0.1, max: 0.3 }
    }]
  },
  customCSS: `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    .minimal-scandinavian-2025 {
      font-family: 'Inter', system-ui, sans-serif;
      background: linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 100%);
      min-height: 100vh;
      position: relative;
    }

    /* Background Pattern */
    .minimal-scandinavian-2025::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        radial-gradient(circle at 20% 80%, rgba(173, 181, 189, 0.03) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(248, 249, 250, 0.05) 0%, transparent 50%);
      pointer-events: none;
      z-index: 0;
    }

    /* Navigation */
    .nordic-navbar {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(173, 181, 189, 0.1);
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      padding: 1rem 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .nordic-navbar.scrolled {
      background: rgba(255, 255, 255, 0.98);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    }

    .nordic-logo {
      font-family: 'Inter', sans-serif;
      font-size: 1.5rem;
      font-weight: 600;
      color: #212529;
      letter-spacing: -0.02em;
    }

    .nordic-nav-link {
      color: #6C757D;
      text-decoration: none;
      font-weight: 400;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      transition: all 0.3s ease;
      position: relative;
    }

    .nordic-nav-link:hover {
      color: #212529;
      background: rgba(173, 181, 189, 0.05);
    }

    .nordic-nav-link::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      width: 0;
      height: 2px;
      background: #ADB5BD;
      transition: all 0.3s ease;
      transform: translateX(-50%);
    }

    .nordic-nav-link:hover::after {
      width: 80%;
    }

    /* Hero Section */
    .nordic-hero {
      min-height: 100vh;
      display: flex;
      align-items: center;
      position: relative;
      padding: 6rem 0 4rem;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 249, 250, 0.8) 100%);
    }

    .nordic-hero-content {
      position: relative;
      z-index: 2;
      text-align: center;
    }

    .nordic-hero-title {
      font-family: 'Inter', sans-serif;
      font-size: clamp(2.5rem, 5vw, 4rem);
      font-weight: 300;
      color: #212529;
      line-height: 1.1;
      margin-bottom: 1.5rem;
      letter-spacing: -0.03em;
    }

    .nordic-hero-subtitle {
      font-size: 1.125rem;
      color: #6C757D;
      margin-bottom: 3rem;
      font-weight: 400;
      line-height: 1.6;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }

    /* Buttons */
    .nordic-btn-primary {
      background: #212529;
      color: white;
      border: none;
      padding: 1rem 2.5rem;
      border-radius: 0.5rem;
      font-weight: 500;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      letter-spacing: 0.01em;
    }

    .nordic-btn-primary::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
      transition: left 0.5s;
    }

    .nordic-btn-primary:hover::before {
      left: 100%;
    }

    .nordic-btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(33, 37, 41, 0.2);
    }

    .nordic-btn-secondary {
      background: transparent;
      color: #6C757D;
      border: 1px solid #DEE2E6;
      padding: 1rem 2.5rem;
      border-radius: 0.5rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      letter-spacing: 0.01em;
    }

    .nordic-btn-secondary:hover {
      background: #F8F9FA;
      color: #212529;
      border-color: #ADB5BD;
      transform: translateY(-1px);
    }

    /* Service Cards */
    .nordic-services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 2rem;
      margin-top: 3rem;
    }

    .nordic-service-card {
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(222, 226, 230, 0.5);
      border-radius: 1rem;
      padding: 2rem;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }

    .nordic-service-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #ADB5BD 0%, #DEE2E6 100%);
      transform: scaleX(0);
      transition: transform 0.3s ease;
    }

    .nordic-service-card:hover::before {
      transform: scaleX(1);
    }

    .nordic-service-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 40px rgba(173, 181, 189, 0.15);
      background: rgba(255, 255, 255, 0.95);
      border-color: rgba(173, 181, 189, 0.3);
    }

    .nordic-service-title {
      font-family: 'Inter', sans-serif;
      font-size: 1.25rem;
      font-weight: 600;
      color: #212529;
      margin-bottom: 0.75rem;
      letter-spacing: -0.01em;
    }

    .nordic-service-description {
      color: #6C757D;
      line-height: 1.6;
      margin-bottom: 1.5rem;
      font-size: 0.95rem;
    }

    .nordic-service-price {
      font-size: 1.75rem;
      font-weight: 300;
      color: #212529;
      margin-bottom: 0.5rem;
      letter-spacing: -0.02em;
    }

    .nordic-service-duration {
      color: #ADB5BD;
      font-size: 0.875rem;
      margin-bottom: 1.5rem;
      font-weight: 500;
    }

    /* Team Section */
    .nordic-team-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
      margin-top: 3rem;
    }

    .nordic-team-member {
      text-align: center;
      padding: 2rem 1.5rem;
      background: rgba(255, 255, 255, 0.6);
      border-radius: 1rem;
      transition: all 0.3s ease;
      border: 1px solid rgba(222, 226, 230, 0.3);
    }

    .nordic-team-member:hover {
      transform: translateY(-5px);
      background: rgba(255, 255, 255, 0.9);
      box-shadow: 0 15px 30px rgba(173, 181, 189, 0.1);
    }

    .nordic-team-avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      margin: 0 auto 1.5rem;
      border: 3px solid #F8F9FA;
      object-fit: cover;
      transition: all 0.3s ease;
    }

    .nordic-team-member:hover .nordic-team-avatar {
      transform: scale(1.05);
      border-color: #ADB5BD;
    }

    .nordic-team-name {
      font-family: 'Inter', sans-serif;
      font-size: 1.125rem;
      font-weight: 600;
      color: #212529;
      margin-bottom: 0.5rem;
      letter-spacing: -0.01em;
    }

    .nordic-team-role {
      color: #6C757D;
      font-weight: 400;
      font-size: 0.875rem;
    }

    /* Contact Section */
    .nordic-contact-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin-top: 3rem;
    }

    .nordic-contact-card {
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(20px);
      border-radius: 1rem;
      padding: 2rem;
      border: 1px solid rgba(222, 226, 230, 0.5);
    }

    .nordic-contact-title {
      font-family: 'Inter', sans-serif;
      font-size: 1.25rem;
      font-weight: 600;
      color: #212529;
      margin-bottom: 1.5rem;
      letter-spacing: -0.01em;
    }

    .nordic-contact-item {
      display: flex;
      align-items: center;
      margin-bottom: 1rem;
      padding: 0.75rem;
      border-radius: 0.5rem;
      transition: all 0.3s ease;
    }

    .nordic-contact-item:hover {
      background: rgba(173, 181, 189, 0.05);
    }

    .nordic-contact-icon {
      width: 18px;
      height: 18px;
      margin-right: 1rem;
      color: #ADB5BD;
    }

    .nordic-hours-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0;
      border-bottom: 1px solid rgba(222, 226, 230, 0.3);
    }

    .nordic-hours-item:last-child {
      border-bottom: none;
    }

    .nordic-hours-day {
      font-weight: 500;
      color: #212529;
    }

    .nordic-hours-time {
      color: #6C757D;
      font-size: 0.9rem;
    }

    /* Footer */
    .nordic-footer {
      background: linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%);
      color: #6C757D;
      padding: 3rem 0 2rem;
      margin-top: 4rem;
      border-top: 1px solid rgba(222, 226, 230, 0.5);
    }

    .nordic-footer-content {
      text-align: center;
    }

    .nordic-footer-logo {
      font-family: 'Inter', sans-serif;
      font-size: 1.5rem;
      font-weight: 600;
      color: #212529;
      margin-bottom: 1rem;
      letter-spacing: -0.02em;
    }

    .nordic-footer-text {
      color: #6C757D;
      margin-bottom: 2rem;
      font-size: 0.95rem;
    }

    .nordic-social-links {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .nordic-social-link {
      width: 45px;
      height: 45px;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6C757D;
      text-decoration: none;
      transition: all 0.3s ease;
      border: 1px solid rgba(222, 226, 230, 0.5);
    }

    .nordic-social-link:hover {
      background: #212529;
      color: white;
      transform: translateY(-2px);
      border-color: #212529;
    }

    .nordic-copyright {
      color: #ADB5BD;
      font-size: 0.875rem;
      border-top: 1px solid rgba(222, 226, 230, 0.3);
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

    @keyframes breathe {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.01); }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }

    .fade-in-up {
      animation: fadeInUp 0.8s ease-out;
    }

    .breathe {
      animation: breathe 6s ease-in-out infinite;
    }

    .float {
      animation: float 3s ease-in-out infinite;
    }

    .stagger-1 { animation-delay: 0.1s; }
    .stagger-2 { animation-delay: 0.2s; }
    .stagger-3 { animation-delay: 0.3s; }
    .stagger-4 { animation-delay: 0.4s; }

    /* Responsive */
    @media (max-width: 768px) {
      .nordic-hero-title {
        font-size: 2.5rem;
      }
      
      .nordic-service-card {
        padding: 1.5rem;
      }
      
      .nordic-btn-primary, .nordic-btn-secondary {
        padding: 0.875rem 2rem;
        font-size: 0.95rem;
      }

      .nordic-services-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .nordic-team-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .nordic-contact-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }
    }

    /* Scroll Animations */
    @media (prefers-reduced-motion: no-preference) {
      .nordic-service-card {
        opacity: 0;
        transform: translateY(20px);
        animation: fadeInUp 0.6s ease-out forwards;
      }

      .nordic-team-member {
        opacity: 0;
        transform: translateY(20px);
        animation: fadeInUp 0.6s ease-out forwards;
      }
    }
  `,
  customAnimations: [
    {
      name: 'fadeInUp',
      keyframes: `
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      `,
      duration: '0.8s',
      timing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  ]
};
