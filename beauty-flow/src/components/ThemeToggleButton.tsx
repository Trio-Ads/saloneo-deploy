import React from 'react';
import { useTheme } from '../hooks/useTheme';

interface ThemeToggleButtonProps {
  className?: string;
}

/**
 * Composant bouton de toggle pour basculer entre Light et Dark Mode
 * 
 * Utilise le hook useTheme pour gérer l'état du thème
 * Design moderne avec animation smooth et icônes ☀️/🌙
 * 
 * @param className - Classes CSS additionnelles (optionnel)
 */
export const ThemeToggleButton: React.FC<ThemeToggleButtonProps> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative w-14 h-7 rounded-full transition-all duration-300 
                  bg-gray-200 dark:bg-gray-700
                  hover:bg-gray-300 dark:hover:bg-gray-600
                  focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
                  ${className}`}
      aria-label={`Basculer vers le mode ${theme === 'light' ? 'sombre' : 'clair'}`}
      title={`Mode ${theme === 'light' ? 'sombre' : 'clair'}`}
    >
      {/* Cercle qui se déplace */}
      <span
        className={`absolute top-1 left-1 w-5 h-5 rounded-full
                    bg-white dark:bg-orange-500
                    shadow-md transition-all duration-300 ease-in-out
                    flex items-center justify-center text-xs
                    ${theme === 'dark' ? 'translate-x-7' : 'translate-x-0'}`}
      >
        {/* Icônes */}
        {theme === 'light' ? (
          <span role="img" aria-label="Soleil">☀️</span>
        ) : (
          <span role="img" aria-label="Lune">🌙</span>
        )}
      </span>
    </button>
  );
};

export default ThemeToggleButton;
