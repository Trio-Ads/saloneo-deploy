import React from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  variant?: 'default' | 'minimal' | 'elegant';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  fullScreen = true, 
  size = 'lg',
  message = 'Chargement...',
  variant = 'default'
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24'
  };

  const containerClasses = fullScreen 
    ? 'min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50' 
    : 'min-h-[200px]';

  if (variant === 'minimal') {
    return (
      <div className={`${containerClasses} flex items-center justify-center`}>
        <div className="relative">
          <div className={`animate-spin rounded-full border-4 border-purple-200 border-t-purple-600 ${sizeClasses[size]}`}></div>
        </div>
      </div>
    );
  }

  if (variant === 'elegant') {
    return (
      <div className={`${containerClasses} flex items-center justify-center`}>
        <div className="text-center">
          <div className="relative inline-block">
            {/* Outer glow ring */}
            <div className={`absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-20 animate-pulse ${sizeClasses[size]}`}></div>
            
            {/* Main spinner */}
            <div className={`relative animate-spin rounded-full border-4 border-transparent bg-gradient-to-r from-purple-500 to-pink-500 ${sizeClasses[size]}`}>
              <div className="absolute inset-1 rounded-full bg-white"></div>
            </div>
            
            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <SparklesIcon className="h-6 w-6 text-purple-600 animate-pulse" />
            </div>
          </div>
          
          {message && (
            <p className="mt-4 text-gray-600 font-medium animate-pulse">
              {message}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Default variant - Saloneo 2025 design
  return (
    <div className={`${containerClasses} flex items-center justify-center p-8`}>
      <div className="text-center">
        <div className="relative inline-block">
          {/* Background glow */}
          <div className="absolute inset-0 glass-card rounded-full animate-pulse-slow opacity-60"></div>
          
          {/* Outer rotating ring */}
          <div className={`relative ${sizeClasses[size]}`}>
            <div className="absolute inset-0 rounded-full border-4 border-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 animate-spin">
              <div className="absolute inset-1 rounded-full bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50"></div>
            </div>
            
            {/* Inner counter-rotating ring */}
            <div className="absolute inset-2 rounded-full border-2 border-transparent bg-gradient-to-l from-indigo-400 via-purple-400 to-pink-400 animate-spin-reverse">
              <div className="absolute inset-1 rounded-full bg-white/90 backdrop-blur-sm"></div>
            </div>
            
            {/* Center sparkle */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <SparklesIcon className="h-6 w-6 text-purple-600 animate-pulse" />
                <div className="absolute inset-0 h-6 w-6">
                  <div className="absolute top-0 left-1/2 w-1 h-1 bg-pink-400 rounded-full animate-ping transform -translate-x-1/2"></div>
                  <div className="absolute bottom-0 right-0 w-1 h-1 bg-purple-400 rounded-full animate-ping animation-delay-300"></div>
                  <div className="absolute bottom-0 left-0 w-1 h-1 bg-indigo-400 rounded-full animate-ping animation-delay-600"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Loading message */}
        {message && (
          <div className="mt-6 space-y-2">
            <p className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse">
              {message}
            </p>
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce animation-delay-200"></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce animation-delay-400"></div>
            </div>
          </div>
        )}
        
        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-1 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-float opacity-60`}
              style={{
                left: `${20 + i * 12}%`,
                top: `${30 + (i % 3) * 15}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + i * 0.5}s`
              }}
            />
          ))}
        </div>
      </div>
      
      {/* CSS Animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin-reverse {
            from { transform: rotate(360deg); }
            to { transform: rotate(0deg); }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.6; }
            50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
          }
          
          @keyframes pulse-slow {
            0%, 100% { opacity: 0.6; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.05); }
          }
          
          .animate-spin-reverse {
            animation: spin-reverse 2s linear infinite;
          }
          
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
          
          .animate-pulse-slow {
            animation: pulse-slow 3s ease-in-out infinite;
          }
          
          .animation-delay-200 {
            animation-delay: 0.2s;
          }
          
          .animation-delay-300 {
            animation-delay: 0.3s;
          }
          
          .animation-delay-400 {
            animation-delay: 0.4s;
          }
          
          .animation-delay-600 {
            animation-delay: 0.6s;
          }
        `
      }} />
    </div>
  );
};

export default LoadingSpinner;
