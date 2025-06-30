/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        'display': ['Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
        'body': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        // Couleurs Saloneo 2025
        'saloneo': {
          'primary': {
            DEFAULT: '#6366F1',
            50: '#F0F0FF',
            100: '#E5E5FF',
            200: '#D1D1FF',
            300: '#B8B8FF',
            400: '#9B9BFF',
            500: '#6366F1',
            600: '#4F46E5',
            700: '#4338CA',
            800: '#3730A3',
            900: '#312E81',
            950: '#1E1B4B',
          },
          'secondary': {
            DEFAULT: '#14B8A6',
            50: '#F0FDFA',
            100: '#CCFBF1',
            200: '#99F6E4',
            300: '#5EEAD4',
            400: '#2DD4BF',
            500: '#14B8A6',
            600: '#0D9488',
            700: '#0F766E',
            800: '#115E59',
            900: '#134E4A',
            950: '#042F2E',
          },
          'accent': {
            DEFAULT: '#F59E0B',
            50: '#FFFBEB',
            100: '#FEF3C7',
            200: '#FDE68A',
            300: '#FCD34D',
            400: '#FBBF24',
            500: '#F59E0B',
            600: '#D97706',
            700: '#B45309',
            800: '#92400E',
            900: '#78350F',
            950: '#451A03',
          },
        },
        // États
        'success': {
          DEFAULT: '#10B981',
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
          950: '#022C22',
        },
        'warning': {
          DEFAULT: '#F59E0B',
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
          950: '#451A03',
        },
        'error': {
          DEFAULT: '#EF4444',
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
          950: '#450A0A',
        },
        'info': {
          DEFAULT: '#3B82F6',
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
          950: '#172554',
        },
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '16px',
        xl: '24px',
        '2xl': '32px',
        '3xl': '48px',
        'glass': '20px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-glass': 'linear-gradient(120deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05) 30%, rgba(255, 255, 255, 0.02))',
        'gradient-shine': 'linear-gradient(45deg, transparent 40%, rgba(255, 255, 255, 0.1) 50%, transparent 60%)',
        'gradient-fade': 'linear-gradient(180deg, rgba(255, 255, 255, 0.15), transparent)',
        'gradient-mesh': 'radial-gradient(at 40% 20%, var(--tw-gradient-stops))',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'slide-down': 'slideDown 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-reverse': 'spin 1s linear infinite reverse',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { 
            opacity: '0', 
            transform: 'translateY(20px) scale(0.95)', 
            filter: 'blur(10px)' 
          },
          '100%': { 
            opacity: '1', 
            transform: 'translateY(0) scale(1)', 
            filter: 'blur(0)' 
          },
        },
        slideUp: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(30px) scale(0.95)' 
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0) scale(1)' 
          },
        },
        slideDown: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(-30px) scale(0.95)' 
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0) scale(1)' 
          },
        },
        scaleIn: {
          '0%': { 
            opacity: '0',
            transform: 'scale(0.8)' 
          },
          '100%': { 
            opacity: '1',
            transform: 'scale(1)' 
          },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { 
            boxShadow: '0 0 15px rgba(99, 102, 241, 0.3), 0 0 30px rgba(20, 184, 166, 0.2)' 
          },
          '100%': { 
            boxShadow: '0 0 25px rgba(99, 102, 241, 0.4), 0 0 50px rgba(20, 184, 166, 0.3)' 
          },
        },
        bounceGentle: {
          '0%, 100%': { 
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)' 
          },
          '50%': { 
            transform: 'translateY(-5px)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)' 
          },
        },
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.1), 0 2px 8px 0 rgba(0, 0, 0, 0.05)',
        'glass-sm': '0 4px 16px 0 rgba(0, 0, 0, 0.08), 0 1px 4px 0 rgba(0, 0, 0, 0.03)',
        'glass-lg': '0 16px 48px 0 rgba(0, 0, 0, 0.15), 0 4px 12px 0 rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        'inner-glass': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.05), inset 0 -1px 2px 0 rgba(0, 0, 0, 0.05)',
        'neon': '0 0 15px rgba(99, 102, 241, 0.3), 0 0 30px rgba(20, 184, 166, 0.2), 0 0 5px rgba(255, 255, 255, 0.2)',
        'neon-intense': '0 0 20px rgba(99, 102, 241, 0.4), 0 0 40px rgba(20, 184, 166, 0.3), 0 0 10px rgba(255, 255, 255, 0.3)',
        'soft': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'medium': '0 8px 30px rgba(0, 0, 0, 0.12)',
        'strong': '0 20px 50px rgba(0, 0, 0, 0.15)',
        'glow': '0 0 20px rgba(99, 102, 241, 0.3)',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.5rem',
      },
      scale: {
        '98': '.98',
        '102': '1.02',
        '103': '1.03',
      },
      blur: {
        'xs': '2px',
        '4xl': '72px',
        '5xl': '96px',
      },
      brightness: {
        '25': '.25',
        '175': '1.75',
      },
      contrast: {
        '25': '.25',
        '175': '1.75',
      },
      saturate: {
        '25': '.25',
        '175': '1.75',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
        '900': '900ms',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
    // Plugin personnalisé pour les utilitaires Saloneo
    function({ addUtilities, theme }) {
      const newUtilities = {
        '.text-balance': {
          'text-wrap': 'balance',
        },
        '.text-pretty': {
          'text-wrap': 'pretty',
        },
        '.scrollbar-none': {
          'scrollbar-width': 'none',
          '-ms-overflow-style': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'var(--surface)',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'var(--border)',
            'border-radius': '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'var(--text-tertiary)',
          },
        },
        '.container-2025': {
          width: '100%',
          'max-width': '80rem',
          'margin-left': 'auto',
          'margin-right': 'auto',
          'padding-left': '1rem',
          'padding-right': '1rem',
          '@screen sm': {
            'padding-left': '1.5rem',
            'padding-right': '1.5rem',
          },
          '@screen lg': {
            'padding-left': '2rem',
            'padding-right': '2rem',
          },
        },
        '.grid-responsive': {
          display: 'grid',
          'grid-template-columns': 'repeat(1, minmax(0, 1fr))',
          gap: '1.5rem',
          '@screen sm': {
            'grid-template-columns': 'repeat(2, minmax(0, 1fr))',
          },
          '@screen lg': {
            'grid-template-columns': 'repeat(3, minmax(0, 1fr))',
          },
          '@screen xl': {
            'grid-template-columns': 'repeat(4, minmax(0, 1fr))',
          },
        },
        '.padding-responsive': {
          padding: '1rem',
          '@screen sm': {
            padding: '1.5rem',
          },
          '@screen lg': {
            padding: '2rem',
          },
        },
      }
      addUtilities(newUtilities)
    },
  ],
}
