import React from 'react';
import { useTheme } from '../hooks/useTheme';

interface SaloneoLogoProps {
  variant?: 'color' | 'white' | 'dark' | 'white-colors' | 'auto';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  iconOnly?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { width: 100, height: 22 },
  md: { width: 150, height: 33 },
  lg: { width: 200, height: 44 },
  xl: { width: 250, height: 55 }
};

const iconSizeMap = {
  sm: { width: 32, height: 32 },
  md: { width: 48, height: 48 },
  lg: { width: 64, height: 64 },
  xl: { width: 96, height: 96 }
};

export const SaloneoLogo: React.FC<SaloneoLogoProps> = ({ 
  variant = 'auto', 
  size = 'md',
  iconOnly = false,
  className = '' 
}) => {
  const { theme } = useTheme();
  
  // Si iconOnly, utiliser l'icône
  if (iconOnly) {
    const dimensions = iconSizeMap[size];
    return (
      <img
        src="/images/logos/saloneo-logo-icon.webp"
        alt="Saloneo"
        width={dimensions.width}
        height={dimensions.height}
        className={`object-contain ${className}`}
        style={{ maxWidth: '100%', height: 'auto' }}
      />
    );
  }
  
  // Déterminer quelle version du logo utiliser
  const getLogoSrc = () => {
    if (variant === 'auto') {
      // En mode auto, utiliser White Colors en dark mode (icône colorée + texte blanc)
      // et Colors en light mode (icône colorée + texte coloré)
      return theme === 'dark' 
        ? '/images/logos/saloneo-logo-white-colors.webp'
        : '/images/logos/saloneo-logo-colors.webp';
    }
    
    const logoMap = {
      color: '/images/logos/saloneo-logo-colors.webp',
      white: '/images/logos/saloneo-logo-white.webp',
      dark: '/images/logos/saloneo-logo-dark.webp',
      'white-colors': '/images/logos/saloneo-logo-white-colors.webp'
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
