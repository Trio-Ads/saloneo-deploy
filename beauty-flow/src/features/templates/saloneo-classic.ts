import { DesignTemplate } from './types';

export const saloneoClassicTemplate: DesignTemplate = {
  id: 'saloneo-classic',
  name: 'Saloneo Classic',
  category: 'classic',
  description: 'Template par défaut professionnel et polyvalent, optimisé pour la conversion et adapté à tous types de salons',
  preview: '/templates/previews/saloneo-classic-v2.webp',
  theme: {
    colors: {
      primary: '#2563EB',
      secondary: '#1E40AF',
      accent: '#3B82F6',
      background: '#FFFFFF',
      surface: '#F8FAFC',
      text: '#1E293B',
      textSecondary: '#64748B',
      custom: {
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#06B6D4',
        neutral: '#6B7280',
        lightBlue: '#EFF6FF',
        darkBlue: '#1E3A8A',
        bookingButton: '#2563EB',
        bookingButtonHover: '#1D4ED8'
      }
    },
    typography: {
      headingFont: 'Playfair Display, serif',
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
    /* Saloneo Classic Template Styles */
    .saloneo-classic {
      font-family: 'Inter', system-ui, sans-serif;
    }
    
    .saloneo-classic h1, 
    .saloneo-classic h2, 
    .saloneo-classic h3 {
      font-family: 'Playfair Display', serif;
    }
    
    /* Header Styles */
    .saloneo-header {
      background: linear-gradient(135deg, #2563EB 0%, #1E40AF 100%);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(37, 99, 235, 0.1);
    }
    
    /* Service Cards */
    .service-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(37, 99, 235, 0.1);
      border-radius: 0.75rem;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    
    .service-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 0 20px rgba(37, 99, 235, 0.3);
    }
    
    /* Booking Button */
    .booking-button {
      background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
      color: white;
      border: none;
      border-radius: 0.5rem;
      padding: 0.75rem 1.5rem;
      font-weight: 600;
      font-size: 0.875rem;
      transition: all 0.3s ease;
      cursor: pointer;
      box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3);
    }
    
    .booking-button:hover {
      background: linear-gradient(135deg, #1D4ED8 0%, #1E3A8A 100%);
      transform: translateY(-1px);
      box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.4);
    }
    
    .booking-button:active {
      transform: translateY(0);
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
    
    /* Responsive Design */
    @media (max-width: 768px) {
      .saloneo-header {
        padding: 1rem;
      }
      
      .service-card {
        margin-bottom: 1rem;
      }
      
      .booking-button {
        width: 100%;
        padding: 1rem;
        font-size: 1rem;
      }
    }
    
    /* Grid Layout for Services */
    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      padding: 2rem 0;
    }
    
    @media (max-width: 640px) {
      .services-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
        padding: 1rem 0;
      }
    }
    
    /* Salon Info Section */
    .salon-info {
      background: linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%);
      border-radius: 1rem;
      padding: 2rem;
      margin-top: 3rem;
    }
    
    /* Contact Cards */
    .contact-card {
      background: white;
      border-radius: 0.75rem;
      padding: 1.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease;
    }
    
    .contact-card:hover {
      transform: translateY(-2px);
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
