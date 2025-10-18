import React from 'react';
import { useTheme } from '../hooks/useTheme';

interface SaloneoLogoProps {
  variant?: 'color' | 'white' | 'dark' | 'auto';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: { width: 100, height: 22 },
  md: { width: 150, height: 33 },
  lg: { width: 200, height: 44 },
  xl: { width: 250, height: 55 }
};

export const SaloneoLogo: React.FC<SaloneoLogoProps> = ({ 
  variant = 'auto', 
  size = 'md',
  className = '' 
}) => {
  const { theme } = useTheme();
  
  // Déterminer quelle version du logo utiliser
  const getLogoSrc = () => {
    if (variant === 'auto') {
      // En mode auto, utiliser le logo blanc en dark mode, coloré en light mode
      return theme === 'dark' 
        ? '/images/logos/Salonéo Logo - White.webp'
        : '/images/logos/Salonéo Logo - Colors.webp';
    }
    
    const logoMap = {
      color: '/images/logos/Salonéo Logo - Colors.webp',
      white: '/images/logos/Salonéo Logo - White.webp',
      dark: '/images/logos/Salonéo Logo - Dark.webp'
    };
    
    return logoMap[variant];
  };

  const dimensions = sizeMap[size];

  return (
    <img
      src={getLogoSrc()}
      alt="Saloneo"
      width={dimensions.width}
      height={dimensions.height}
      className={`object-contain ${className}`}
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  );
};

export default SaloneoLogo;
