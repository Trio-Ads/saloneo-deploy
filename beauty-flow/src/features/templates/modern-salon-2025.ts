import { DesignTemplate } from './types';

export const modernSalon2025: DesignTemplate = {
  id: 'modern-salon-2025',
  name: 'Modern Salon 2025',
  description: 'Design moderne et sophistiqué pour salon de coiffure avec glassmorphism et animations fluides',
  category: 'modern',
  preview: '/templates/previews/modern-salon-2025.webp',
  theme: {
    colors: {
      primary: '#E6B17A', // Or rose élégant
      secondary: '#2D3748', // Gris anthracite
      accent: '#F7FAFC', // Blanc cassé
      background: '#FAFAFA', // Blanc très doux
      surface: '#FFFFFF', // Blanc pur pour les cartes
      text: '#1A202C', // Charcoal foncé
      textSecondary: '#4A5568', // Gris moyen
      custom: {
        glass: 'rgba(255, 255, 255, 0.25)', // Effet glassmorphism
        glassBorder: 'rgba(255, 255, 255, 0.18)',
        gold: '#D69E2E',
        lightGray: '#718096',
      },
    },
    typography: {
      headingFont: "'Playfair Display', serif",
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
      },
      weights: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
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
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
    
    .modern-salon-2025 {
      font-family: 'Inter', sans-serif;
      background: linear-gradient(135deg, #FAFAFA 0%, #F7FAFC 100%);
      min-height: 100vh;
    }

    /* Hero Section */
    .hero-section {
      background: linear-gradient(135deg, rgba(230, 177, 122, 0.1) 0%, rgba(45, 55, 72, 0.05) 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      position: relative;
      overflow: hidden;
    }

    .hero-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><defs><radialGradient id="a" cx="50%" cy="50%"><stop offset="0%" stop-color="%23E6B17A" stop-opacity="0.1"/><stop offset="100%" stop-color="%23E6B17A" stop-opacity="0"/></radialGradient></defs><circle cx="200" cy="200" r="150" fill="url(%23a)"/><circle cx="800" cy="300" r="100" fill="url(%23a)"/><circle cx="600" cy="700" r="120" fill="url(%23a)"/></svg>') no-repeat center center;
      background-size: cover;
      opacity: 0.3;
    }

    .hero-content {
      position: relative;
      z-index: 2;
    }

    .hero-title {
      font-family: 'Playfair Display', serif;
      font-size: clamp(2.5rem, 5vw, 4rem);
      font-weight: 700;
      color: #1A202C;
      line-height: 1.2;
      margin-bottom: 1.5rem;
      background: linear-gradient(135deg, #1A202C 0%, #2D3748 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero-subtitle {
      font-size: 1.25rem;
      color: #4A5568;
      margin-bottom: 2rem;
      font-weight: 400;
      line-height: 1.6;
    }

    /* Glass Cards */
    .glass-card {
      background: rgba(255, 255, 255, 0.25);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 1rem;
      box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .glass-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 40px 0 rgba(31, 38, 135, 0.2);
      background: rgba(255, 255, 255, 0.35);
    }

    /* Service Cards */
    .service-card {
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(230, 177, 122, 0.2);
      border-radius: 1.5rem;
      padding: 2rem;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }

    .service-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #E6B17A 0%, #D69E2E 100%);
      transform: scaleX(0);
      transition: transform 0.3s ease;
    }

    .service-card:hover::before {
      transform: scaleX(1);
    }

    .service-card:hover {
      transform: translateY(-12px) scale(1.02);
      box-shadow: 0 25px 50px rgba(230, 177, 122, 0.25);
      background: rgba(255, 255, 255, 0.95);
    }

    .service-title {
      font-family: 'Playfair Display', serif;
      font-size: 1.5rem;
      font-weight: 600;
      color: #1A202C;
      margin-bottom: 0.75rem;
    }

    .service-description {
      color: #4A5568;
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }

    .service-price {
      font-size: 2rem;
      font-weight: 700;
      color: #E6B17A;
      margin-bottom: 0.5rem;
    }

    .service-duration {
      color: #718096;
      font-size: 0.875rem;
      margin-bottom: 1.5rem;
    }

    /* Buttons */
    .btn-primary {
      background: linear-gradient(135deg, #E6B17A 0%, #D69E2E 100%);
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
      box-shadow: 0 4px 15px rgba(230, 177, 122, 0.4);
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
      box-shadow: 0 8px 25px rgba(230, 177, 122, 0.6);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.9);
      color: #2D3748;
      border: 2px solid #E6B17A;
      padding: 1rem 2rem;
      border-radius: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-secondary:hover {
      background: #E6B17A;
      color: white;
      transform: translateY(-2px);
    }

    /* Navigation */
    .navbar {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(230, 177, 122, 0.1);
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      padding: 1rem 0;
      transition: all 0.3s ease;
    }

    .navbar.scrolled {
      background: rgba(255, 255, 255, 0.98);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .nav-logo {
      font-family: 'Playfair Display', serif;
      font-size: 1.75rem;
      font-weight: 700;
      color: #E6B17A;
    }

    .nav-link {
      color: #2D3748;
      text-decoration: none;
      font-weight: 500;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      transition: all 0.3s ease;
    }

    .nav-link:hover {
      background: rgba(230, 177, 122, 0.1);
      color: #E6B17A;
    }

    /* Team Section */
    .team-member {
      text-align: center;
      padding: 1.5rem;
      background: rgba(255, 255, 255, 0.6);
      border-radius: 1.5rem;
      transition: all 0.3s ease;
      border: 1px solid rgba(230, 177, 122, 0.1);
    }

    .team-member:hover {
      transform: translateY(-8px);
      background: rgba(255, 255, 255, 0.9);
      box-shadow: 0 15px 35px rgba(230, 177, 122, 0.2);
    }

    .team-avatar {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      margin: 0 auto 1rem;
      border: 4px solid #E6B17A;
      object-fit: cover;
      transition: all 0.3s ease;
    }

    .team-member:hover .team-avatar {
      transform: scale(1.1);
      box-shadow: 0 8px 25px rgba(230, 177, 122, 0.4);
    }

    .team-name {
      font-family: 'Playfair Display', serif;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1A202C;
      margin-bottom: 0.5rem;
    }

    .team-role {
      color: #E6B17A;
      font-weight: 500;
      font-size: 0.875rem;
    }

    /* Contact Section */
    .contact-info {
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(20px);
      border-radius: 1.5rem;
      padding: 2rem;
      border: 1px solid rgba(230, 177, 122, 0.2);
    }

    .contact-title {
      font-family: 'Playfair Display', serif;
      font-size: 1.5rem;
      font-weight: 600;
      color: #1A202C;
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
      background: rgba(230, 177, 122, 0.1);
    }

    .contact-icon {
      width: 20px;
      height: 20px;
      margin-right: 1rem;
      color: #E6B17A;
    }

    /* Hours */
    .hours-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0;
      border-bottom: 1px solid rgba(230, 177, 122, 0.1);
    }

    .hours-item:last-child {
      border-bottom: none;
    }

    .hours-day {
      font-weight: 500;
      color: #2D3748;
    }

    .hours-time {
      color: #4A5568;
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

    .fade-in-up {
      animation: fadeInUp 0.8s ease-out;
    }

    .fade-in-left {
      animation: fadeInLeft 0.8s ease-out;
    }

    .fade-in-right {
      animation: fadeInRight 0.8s ease-out;
    }

    .stagger-1 { animation-delay: 0.1s; }
    .stagger-2 { animation-delay: 0.2s; }
    .stagger-3 { animation-delay: 0.3s; }
    .stagger-4 { animation-delay: 0.4s; }

    /* Responsive */
    @media (max-width: 768px) {
      .hero-title {
        font-size: 2.5rem;
      }
      
      .service-card {
        padding: 1.5rem;
      }
      
      .btn-primary, .btn-secondary {
        padding: 0.875rem 1.5rem;
        font-size: 0.875rem;
      }
    }

    /* Footer */
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
      font-family: 'Playfair Display', serif;
      font-size: 2rem;
      font-weight: 700;
      color: #E6B17A;
      margin-bottom: 1rem;
    }

    .footer-text {
      color: #A0AEC0;
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
      background: rgba(230, 177, 122, 0.1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #E6B17A;
      text-decoration: none;
      transition: all 0.3s ease;
    }

    .social-link:hover {
      background: #E6B17A;
      color: white;
      transform: translateY(-3px);
    }

    .copyright {
      color: #718096;
      font-size: 0.875rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 2rem;
    }
  `,
};
