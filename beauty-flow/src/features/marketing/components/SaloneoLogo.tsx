import React from 'react';

interface SaloneoLogoProps {
  className?: string;
  variant?: 'horizontal' | 'icon';
}

export const SaloneoLogo: React.FC<SaloneoLogoProps> = ({ 
  className = '', 
  variant = 'horizontal' 
}) => {
  if (variant === 'icon') {
    return (
      <svg 
        width="60" 
        height="60" 
        viewBox="0 0 60 60" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <defs>
          <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#4F46E5', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#06B6D4', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        
        {/* Cercle de fond */}
        <circle cx="30" cy="30" r="28" fill="url(#logo-gradient)" opacity="0.1" />
        
        {/* Forme S stylisée */}
        <path 
          d="M30 10 C20 10, 15 15, 15 22 C15 26, 18 28, 22 30 L30 34 L38 38 C42 40, 45 42, 45 46 C45 50, 40 50, 35 50 C30 50, 25 48, 22 45"
          stroke="url(#logo-gradient)" 
          strokeWidth="4" 
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Points décoratifs */}
        <circle cx="22" cy="18" r="3" fill="#4F46E5" opacity="0.8" />
        <circle cx="38" cy="42" r="3" fill="#06B6D4" opacity="0.8" />
      </svg>
    );
  }

  return (
    <svg 
      width="200" 
      height="60" 
      viewBox="0 0 200 60" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logo-gradient-h" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#4F46E5', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#06B6D4', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      
      {/* Icône */}
      <g transform="translate(0, 5)">
        {/* Cercle de fond */}
        <circle cx="25" cy="25" r="23" fill="url(#logo-gradient-h)" opacity="0.1" />
        
        {/* Forme S stylisée */}
        <path 
          d="M25 10 C17 10, 13 14, 13 20 C13 23, 15 25, 18 27 L25 30 L32 33 C35 35, 37 36, 37 39 C37 42, 33 42, 30 42 C26 42, 22 40, 20 38"
          stroke="url(#logo-gradient-h)" 
          strokeWidth="3" 
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Points décoratifs */}
        <circle cx="19" cy="17" r="2.5" fill="#4F46E5" opacity="0.8" />
        <circle cx="31" cy="35" r="2.5" fill="#06B6D4" opacity="0.8" />
      </g>
      
      {/* Texte Saloneo */}
      <g transform="translate(60, 20)">
        <text 
          x="0" 
          y="20" 
          fontFamily="system-ui, -apple-system, sans-serif" 
          fontSize="28" 
          fontWeight="700" 
          fill="#1E293B"
        >
          Saloneo
        </text>
        
        {/* Accent sous le O */}
        <circle cx="95" cy="28" r="2" fill="url(#logo-gradient-h)" />
      </g>
    </svg>
  );
};
