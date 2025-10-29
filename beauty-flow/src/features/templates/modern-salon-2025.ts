import { DesignTemplate } from './types';

export const modernSalon2025: DesignTemplate = {
  id: 'modern-salon-2025',
  name: 'Modern Salon 2025',
  description: 'Design moderne et sophistiqué pour salon de coiffure avec glassmorphism et animations fluides',
  category: 'modern',
  preview: '/templates/previews/modern-salon-2025.webp',
  theme: {
    colors: {
      primary: '#FF6B6B', // Rouge corail moderne
      secondary: '#4ECDC4', // Turquoise élégant
      accent: '#45B7D1', // Bleu ciel
      background: '#F8FAFC', // Blanc très doux
      surface: '#FFFFFF', // Blanc pur pour les cartes
      text: '#2D3748', // Gris foncé moderne
      textSecondary: '#718096', // Gris moyen
      custom: {
        glass: 'rgba(255, 255, 255, 0.25)', // Effet glassmorphism
        glassBorder: 'rgba(255, 255, 255, 0.18)',
        coral: '#FF8E8E',
        teal: '#81E6D9',
        lightBlue: '#E6FFFA',
        darkBlue: '#2C5282',
        gradient1: '#FF6B6B',
        gradient2: '#4ECDC4',
        gradient3: '#45B7D1'
      },
    },
    typography: {
      headingFont: "'Montserrat', sans-serif",
      bodyFont: "'Inter', sans-serif",
      sizes: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem'
      },
      weights: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800
      },
    },
    effects: {
      glassmorphism: {
        enabled: true,
        blur: '20px',
        opacity: '0.25',
        border: '1px solid rgba(255, 255, 255, 0.18)',
      },
      animations: ['fadeInUp', 'fadeInLeft', 'fadeInRight', 'shimmer'],
      transitions: ['all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'],
      specialEffects: ['gradient-text', 'hover-lift', 'glass-reflection'],
      shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        neon: '0 8px 32px 0 rgba(230, 177, 122, 0.37)',
      },
    },
    layout: {
      borderRadius: {
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        full: '9999px',
      },
      spacing: {
        xs: '0.5rem',
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
        xl: '3rem',
      },
      containers: {
        maxWidth: '1200px',
        padding: '1rem',
      },
    },
  },
  assets: {
    patterns: ['subtle-dots', 'organic-shapes'],
    illustrations: ['salon-hero', 'beauty-icons'],
    textures: ['glass-texture', 'gradient-mesh'],
  },
  customCSS: `
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');
    
    .modern-salon-2025 {
      font-family: 'Inter', sans-serif;
      background: linear-gradient(135deg, #F8FAFC 0%, #E6FFFA 100%);
      min-height: 100vh;
    }

    .modern-salon-2025 h1, 
    .modern-salon-2025 h2, 
    .modern-salon-2025 h3 {
      font-family: 'Montserrat', sans-serif;
    }

    /* Navigation moderne */
    .navbar {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(255, 107, 107, 0.1);
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      padding: 1rem 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    }

    .navbar.scrolled {
      background: rgba(255, 255, 255, 0.98);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }

    .nav-logo {
      font-family: 'Montserrat', sans-serif;
      font-size: 1.75rem;
      font-weight: 800;
      background: linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .nav-link {
      color: #2D3748;
      text-decoration: none;
      font-weight: 500;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      transition: all 0.3s ease;
      position: relative;
    }

    .nav-link:hover {
      background: rgba(255, 107, 107, 0.1);
      color: #FF6B6B;
      transform: translateY(-1px);
    }

    /* Hero Section moderne */
    .hero-section {
      background: linear-gradient(135deg, rgba(255, 107, 107, 0.05) 0%, rgba(78, 205, 196, 0.05) 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      position: relative;
      overflow: hidden;
      padding-top: 80px;
    }

    .hero-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><defs><radialGradient id="a" cx="50%" cy="50%"><stop offset="0%" stop-color="%23FF6B6B" stop-opacity="0.1"/><stop offset="100%" stop-color="%23FF6B6B" stop-opacity="0"/></radialGradient><radialGradient id="b" cx="50%" cy="50%"><stop offset="0%" stop-color="%234ECDC4" stop-opacity="0.1"/><stop offset="100%" stop-color="%234ECDC4" stop-opacity="0"/></radialGradient></defs><circle cx="200" cy="200" r="150" fill="url(%23a)"/><circle cx="800" cy="300" r="100" fill="url(%23b)"/><circle cx="600" cy="700" r="120" fill="url(%23a)"/></svg>') no-repeat center center;
      background-size: cover;
      opacity: 0.4;
    }

    .hero-content {
      position: relative;
      z-index: 2;
      text-align: center;
    }

    .hero-title {
      font-family: 'Montserrat', sans-serif;
      font-size: clamp(2.5rem, 5vw, 4rem);
      font-weight: 800;
      color: #2D3748;
      line-height: 1.2;
      margin-bottom: 1.5rem;
      background: linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero-subtitle {
      font-size: 1.25rem;
      color: #718096;
      margin-bottom: 2.5rem;
      font-weight: 400;
      line-height: 1.6;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }

    /* Service Cards modernes */
    .service-card {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 107, 107, 0.1);
      border-radius: 1.5rem;
      padding: 2rem;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }

    .service-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #FF6B6B 0%, #4ECDC4 100%);
      transform: scaleX(0);
      transition: transform 0.3s ease;
    }

    .service-card:hover::before {
      transform: scaleX(1);
    }

    .service-card:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      background: rgba(255, 255, 255, 0.95);
      border-color: rgba(255, 107, 107, 0.2);
    }

    .service-title {
      font-family: 'Montserrat', sans-serif;
      font-size: 1.5rem;
      font-weight: 600;
      color: #2D3748;
      margin-bottom: 0.75rem;
      line-height: 1.3;
    }

    .service-description {
      color: #718096;
      line-height: 1.6;
      margin-bottom: 1.5rem;
      font-size: 0.95rem;
    }

    .service-price {
      font-size: 2rem;
      font-weight: 700;
      color: #FF6B6B;
      margin-bottom: 0.5rem;
      font-family: 'Montserrat', sans-serif;
    }

    .service-duration {
      color: #9CA3AF;
      font-size: 0.875rem;
      margin-bottom: 1.5rem;
      font-weight: 500;
    }

    /* Boutons modernes */
    .btn-primary {
      background: linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%);
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 0.75rem;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
      font-family: 'Montserrat', sans-serif;
    }

    .btn-primary::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s;
    }

    .btn-primary:hover::before {
      left: 100%;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(255, 107, 107, 0.6);
      background: linear-gradient(135deg, #FF8E8E 0%, #81E6D9 100%);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.9);
      color: #FF6B6B;
      border: 2px solid #FF6B6B;
      padding: 1rem 2rem;
      border-radius: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      font-family: 'Montserrat', sans-serif;
    }

    .btn-secondary:hover {
      background: #FF6B6B;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
    }

    /* Team Section moderne */
    .team-member {
      text-align: center;
      padding: 2rem;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 1.5rem;
      transition: all 0.3s ease;
      border: 1px solid rgba(255, 107, 107, 0.1);
      backdrop-filter: blur(10px);
    }

    .team-member:hover {
      transform: translateY(-8px);
      background: rgba(255, 255, 255, 0.95);
      box-shadow: 0 15px 35px rgba(255, 107, 107, 0.2);
      border-color: rgba(255, 107, 107, 0.2);
    }

    .team-avatar {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      margin: 0 auto 1.5rem;
      border: 4px solid #FF6B6B;
      object-fit: cover;
      transition: all 0.3s ease;
      box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3);
    }

    .team-member:hover .team-avatar {
      transform: scale(1.1);
      box-shadow: 0 12px 35px rgba(255, 107, 107, 0.4);
      border-color: #4ECDC4;
    }

    .team-name {
      font-family: 'Montserrat', sans-serif;
      font-size: 1.25rem;
      font-weight: 600;
      color: #2D3748;
      margin-bottom: 0.5rem;
    }

    .team-role {
      color: #FF6B6B;
      font-weight: 500;
      font-size: 0.875rem;
    }

    /* Contact Section moderne */
    .contact-info {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(20px);
      border-radius: 1.5rem;
      padding: 2rem;
      border: 1px solid rgba(255, 107, 107, 0.1);
      transition: all 0.3s ease;
    }

    .contact-info:hover {
      transform: translateY(-4px);
      box-shadow: 0 15px 35px rgba(255, 107, 107, 0.15);
    }

    .contact-title {
      font-family: 'Montserrat', sans-serif;
      font-size: 1.5rem;
      font-weight: 600;
      color: #2D3748;
      margin-bottom: 1.5rem;
    }

    .contact-item {
      display: flex;
      align-items: center;
      margin-bottom: 1rem;
      padding: 0.75rem;
      border-radius: 0.75rem;
      transition: all 0.3s ease;
    }

    .contact-item:hover {
      background: rgba(255, 107, 107, 0.1);
      transform: translateX(4px);
    }

    .contact-icon {
      width: 24px;
      height: 24px;
      margin-right: 1rem;
      font-size: 1.25rem;
    }

    /* Horaires */
    .hours-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0;
      border-bottom: 1px solid rgba(255, 107, 107, 0.1);
      transition: all 0.3s ease;
    }

    .hours-item:last-child {
      border-bottom: none;
    }

    .hours-item:hover {
      background: rgba(255, 107, 107, 0.05);
      padding-left: 0.5rem;
      padding-right: 0.5rem;
      border-radius: 0.5rem;
    }

    .hours-day {
      font-weight: 600;
      color: #2D3748;
      font-family: 'Montserrat', sans-serif;
    }

    .hours-time {
      color: #718096;
      font-weight: 500;
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

    @keyframes fadeInLeft {
      from {
        opacity: 0;
        transform: translateX(-30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes fadeInRight {
      from {
        opacity: 0;
        transform: translateX(30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes shimmer {
      0% {
        background-position: -200px 0;
      }
      100% {
        background-position: calc(200px + 100%) 0;
      }
    }

    /* Utility Classes */
    .fade-in-up {
      animation: fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .fade-in-left {
      animation: fadeInLeft 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .fade-in-right {
      animation: fadeInRight 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .stagger-1 { animation-delay: 0.1s; }
    .stagger-2 { animation-delay: 0.2s; }
    .stagger-3 { animation-delay: 0.3s; }
    .stagger-4 { animation-delay: 0.4s; }

    /* Footer moderne */
    .footer {
      background: linear-gradient(135deg, #2D3748 0%, #1A202C 100%);
      color: white;
      padding: 3rem 0 2rem;
      margin-top: 4rem;
    }

    .footer-content {
      text-align: center;
    }

    .footer-logo {
      font-family: 'Montserrat', sans-serif;
      font-size: 2rem;
      font-weight: 700;
      color: #FF6B6B;
      margin-bottom: 1rem;
    }

    .footer-text {
      color: #D1D5DB;
      margin-bottom: 2rem;
    }

    .social-links {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .social-link {
      width: 50px;
      height: 50px;
      background: rgba(255, 107, 107, 0.1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FF6B6B;
      text-decoration: none;
      transition: all 0.3s ease;
      font-size: 1.25rem;
    }

    .social-link:hover {
      background: #FF6B6B;
      color: white;
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
    }

    .copyright {
      color: #9CA3AF;
      font-size: 0.875rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 2rem;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .hero-title {
        font-size: 2.5rem;
      }
      
      .service-card {
        padding: 1.5rem;
        margin-bottom: 1rem;
      }
      
      .btn-primary, .btn-secondary {
        padding: 0.875rem 1.5rem;
        font-size: 0.875rem;
        width: 100%;
      }

      .team-member {
        padding: 1.5rem;
      }

      .contact-info {
        padding: 1.5rem;
      }
    }

    /* Grid Layout for Services */
    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 2rem;
      padding: 2rem 0;
    }

    @media (max-width: 640px) {
      .services-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
        padding: 1rem 0;
      }
    }
  `,
};
