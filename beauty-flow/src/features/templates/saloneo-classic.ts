import { DesignTemplate } from './types';

export const saloneoClassicTemplate: DesignTemplate = {
  id: 'saloneo-classic',
  name: 'Saloneo Classic',
  category: 'classic',
  description: 'Template par défaut professionnel et polyvalent, optimisé pour la conversion et adapté à tous types de salons',
  preview: '/templates/previews/saloneo-classic-v2.webp',
  theme: {
    colors: {
      primary: '#6366F1',
      secondary: '#4F46E5',
      accent: '#8B5CF6',
      background: '#FAFAFA',
      surface: '#FFFFFF',
      text: '#1F2937',
      textSecondary: '#6B7280',
      custom: {
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#06B6D4',
        neutral: '#9CA3AF',
        lightGray: '#F9FAFB',
        darkGray: '#374151',
        gold: '#D97706',
        softBlue: '#EEF2FF',
        bookingButton: '#6366F1',
        bookingButtonHover: '#4F46E5'
      }
    },
    typography: {
      headingFont: "'Poppins', sans-serif",
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
      }
    },
    effects: {
      glassmorphism: {
        enabled: true,
        blur: '16px',
        opacity: '0.1',
        border: '1px solid rgba(37, 99, 235, 0.1)'
      },
      animations: ['fadeInUp', 'slideInLeft', 'scaleIn', 'bounceIn'],
      transitions: ['smooth', 'spring', 'ease-out'],
      specialEffects: ['parallax', 'hover-lift', 'button-pulse'],
      shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        neon: '0 0 20px rgba(37, 99, 235, 0.3)'
      }
    },
    layout: {
      borderRadius: {
        sm: '0.375rem',
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
        padding: '1.5rem'
      }
    }
  },
  assets: {
    patterns: ['grid-subtle', 'dots-pattern'],
    particles: [{
      type: 'floating',
      count: 8,
      size: { min: 3, max: 6 },
      speed: { min: 0.3, max: 0.8 },
      color: '#3B82F6',
      opacity: { min: 0.1, max: 0.2 }
    }]
  },
  customCSS: `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');
    
    /* Saloneo Classic Template Styles */
    .saloneo-classic {
      font-family: 'Inter', sans-serif;
      background: linear-gradient(135deg, #FAFAFA 0%, #F9FAFB 100%);
      min-height: 100vh;
    }
    
    .saloneo-classic h1, 
    .saloneo-classic h2, 
    .saloneo-classic h3 {
      font-family: 'Poppins', sans-serif;
    }

    /* Navigation moderne */
    .navbar {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(99, 102, 241, 0.1);
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
      font-family: 'Poppins', sans-serif;
      font-size: 1.75rem;
      font-weight: 700;
      background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .nav-link {
      color: #374151;
      text-decoration: none;
      font-weight: 500;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      transition: all 0.3s ease;
      position: relative;
    }

    .nav-link:hover {
      background: rgba(99, 102, 241, 0.1);
      color: #6366F1;
      transform: translateY(-1px);
    }

    /* Hero Section moderne */
    .hero-section {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
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
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><defs><radialGradient id="a" cx="50%" cy="50%"><stop offset="0%" stop-color="%236366F1" stop-opacity="0.1"/><stop offset="100%" stop-color="%236366F1" stop-opacity="0"/></radialGradient></defs><circle cx="200" cy="200" r="150" fill="url(%23a)"/><circle cx="800" cy="300" r="100" fill="url(%23a)"/><circle cx="600" cy="700" r="120" fill="url(%23a)"/></svg>') no-repeat center center;
      background-size: cover;
      opacity: 0.4;
    }

    .hero-content {
      position: relative;
      z-index: 2;
      text-align: center;
    }

    .hero-title {
      font-family: 'Poppins', sans-serif;
      font-size: clamp(2.5rem, 5vw, 4rem);
      font-weight: 800;
      color: #1F2937;
      line-height: 1.2;
      margin-bottom: 1.5rem;
      background: linear-gradient(135deg, #1F2937 0%, #374151 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero-subtitle {
      font-size: 1.25rem;
      color: #6B7280;
      margin-bottom: 2.5rem;
      font-weight: 400;
      line-height: 1.6;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }

    /* Service Cards améliorées */
    .service-card {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(99, 102, 241, 0.1);
      border-radius: 1.5rem;
      padding: 1.5rem;
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
      background: linear-gradient(90deg, #6366F1 0%, #8B5CF6 100%);
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
      border-color: rgba(99, 102, 241, 0.2);
    }

    /* Images des services */
    .service-image-container {
      position: relative;
      margin: -1.5rem -1.5rem 1.5rem -1.5rem;
      border-radius: 1.5rem 1.5rem 0 0;
      overflow: hidden;
    }

    .service-image {
      width: 100%;
      height: 200px;
      object-fit: cover;
      transition: transform 0.5s ease;
    }

    .service-card:hover .service-image {
      transform: scale(1.1);
    }

    .service-image-container::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 50px;
      background: linear-gradient(transparent, rgba(255, 255, 255, 0.1));
      pointer-events: none;
    }

    .service-title {
      font-family: 'Poppins', sans-serif;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1F2937;
      margin-bottom: 0.75rem;
      line-height: 1.3;
    }

    .service-description {
      color: #6B7280;
      line-height: 1.6;
      margin-bottom: 1.5rem;
      font-size: 0.875rem;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .service-price {
      font-size: 1.75rem;
      font-weight: 700;
      color: #6366F1;
      font-family: 'Poppins', sans-serif;
    }

    .service-duration {
      color: #9CA3AF;
      font-size: 0.875rem;
      font-weight: 500;
    }

    /* Boutons modernes */
    .btn-primary {
      background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
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
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
      font-family: 'Poppins', sans-serif;
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
      box-shadow: 0 8px 25px rgba(99, 102, 241, 0.6);
      background: linear-gradient(135deg, #4F46E5 0%, #4338CA 100%);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.9);
      color: #6366F1;
      border: 2px solid #6366F1;
      padding: 1rem 2rem;
      border-radius: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      font-family: 'Poppins', sans-serif;
    }

    .btn-secondary:hover {
      background: #6366F1;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
    }

    /* Team Section moderne */
    .team-member {
      text-align: center;
      padding: 2rem;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 1.5rem;
      transition: all 0.3s ease;
      border: 1px solid rgba(99, 102, 241, 0.1);
      backdrop-filter: blur(10px);
    }

    .team-member:hover {
      transform: translateY(-8px);
      background: rgba(255, 255, 255, 0.95);
      box-shadow: 0 15px 35px rgba(99, 102, 241, 0.2);
      border-color: rgba(99, 102, 241, 0.2);
    }

    .team-avatar {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      margin: 0 auto 1.5rem;
      border: 4px solid #6366F1;
      object-fit: cover;
      transition: all 0.3s ease;
      box-shadow: 0 8px 25px rgba(99, 102, 241, 0.3);
    }

    .team-member:hover .team-avatar {
      transform: scale(1.1);
      box-shadow: 0 12px 35px rgba(99, 102, 241, 0.4);
    }

    .team-name {
      font-family: 'Poppins', sans-serif;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1F2937;
      margin-bottom: 0.5rem;
    }

    .team-role {
      color: #6366F1;
      font-weight: 500;
      font-size: 0.875rem;
    }

    /* Contact Section moderne */
    .contact-info {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(20px);
      border-radius: 1.5rem;
      padding: 2rem;
      border: 1px solid rgba(99, 102, 241, 0.1);
      transition: all 0.3s ease;
    }

    .contact-info:hover {
      transform: translateY(-4px);
      box-shadow: 0 15px 35px rgba(99, 102, 241, 0.15);
    }

    .contact-title {
      font-family: 'Poppins', sans-serif;
      font-size: 1.5rem;
      font-weight: 600;
      color: #1F2937;
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
      background: rgba(99, 102, 241, 0.1);
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
      border-bottom: 1px solid rgba(99, 102, 241, 0.1);
      transition: all 0.3s ease;
    }

    .hours-item:last-child {
      border-bottom: none;
    }

    .hours-item:hover {
      background: rgba(99, 102, 241, 0.05);
      padding-left: 0.5rem;
      padding-right: 0.5rem;
      border-radius: 0.5rem;
    }

    .hours-day {
      font-weight: 600;
      color: #374151;
      font-family: 'Poppins', sans-serif;
    }

    .hours-time {
      color: #6B7280;
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

    @keyframes slideInLeft {
      from {
        opacity: 0;
        transform: translateX(-30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.9);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes bounceIn {
      0% {
        opacity: 0;
        transform: scale(0.3);
      }
      50% {
        opacity: 1;
        transform: scale(1.05);
      }
      70% {
        transform: scale(0.9);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }

    /* Utility Classes */
    .fade-in-up {
      animation: fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .slide-in-left {
      animation: slideInLeft 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .scale-in {
      animation: scaleIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .bounce-in {
      animation: bounceIn 1s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }

    .stagger-1 { animation-delay: 0.1s; }
    .stagger-2 { animation-delay: 0.2s; }
    .stagger-3 { animation-delay: 0.3s; }
    .stagger-4 { animation-delay: 0.4s; }

    /* Footer moderne */
    .footer {
      background: linear-gradient(135deg, #374151 0%, #1F2937 100%);
      color: white;
      padding: 3rem 0 2rem;
      margin-top: 4rem;
    }

    .footer-content {
      text-align: center;
    }

    .footer-logo {
      font-family: 'Poppins', sans-serif;
      font-size: 2rem;
      font-weight: 700;
      color: #6366F1;
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
      background: rgba(99, 102, 241, 0.1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6366F1;
      text-decoration: none;
      transition: all 0.3s ease;
      font-size: 1.25rem;
    }

    .social-link:hover {
      background: #6366F1;
      color: white;
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
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
  customAnimations: [
    {
      name: 'fadeInUp',
      keyframes: `
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      `,
      duration: '0.8s',
      timing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    },
    {
      name: 'slideInLeft',
      keyframes: `
        from { opacity: 0; transform: translateX(-30px); }
        to { opacity: 1; transform: translateX(0); }
      `,
      duration: '0.8s',
      timing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    },
    {
      name: 'scaleIn',
      keyframes: `
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
      `,
      duration: '0.6s',
      timing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    },
    {
      name: 'bounceIn',
      keyframes: `
        0% { opacity: 0; transform: scale(0.3); }
        50% { opacity: 1; transform: scale(1.05); }
        70% { transform: scale(0.9); }
        100% { opacity: 1; transform: scale(1); }
      `,
      duration: '1s',
      timing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    }
  ]
};
