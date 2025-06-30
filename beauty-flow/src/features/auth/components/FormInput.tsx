import React from 'react';
import { useTranslation } from 'react-i18next';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  variant?: 'default' | 'glass';
}

export const FormInput: React.FC<FormInputProps> = ({ 
  label, 
  error, 
  type = 'text',
  variant = 'glass',
  className = '',
  ...props 
}) => {
  const { t } = useTranslation('auth');

  const baseClasses = "w-full px-4 py-3 rounded-xl transition-all duration-300 font-body";
  
  const variantClasses = {
    default: `
      bg-white border border-gray-200 text-gray-900 
      placeholder-gray-500 focus:border-indigo-500 
      focus:ring-2 focus:ring-indigo-100
    `,
    glass: `
      glass-input text-white placeholder-white/50
      focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20
      hover:bg-white/10
    `
  };

  return (
    <div className="mb-6">
      <label className="block text-white text-sm font-medium font-display mb-3 transition-all duration-300">
        {t(label)}
      </label>
      <input
        type={type}
        className={`
          ${baseClasses}
          ${variantClasses[variant]}
          ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-2 text-red-400 text-sm font-medium animate-slide-down">
          {t(error)}
        </p>
      )}
    </div>
  );
};

interface FormButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const FormButton: React.FC<FormButtonProps> = ({ 
  children, 
  isLoading,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props 
}) => {
  const baseClasses = `
    w-full font-medium font-display rounded-xl transition-all duration-300 
    transform hover:scale-[1.02] active:scale-[0.98] 
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-offset-2
    click-effect
  `;

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  const variantClasses = {
    primary: `
      btn-primary text-white shadow-soft hover:shadow-medium
      focus:ring-indigo-400/20
    `,
    secondary: `
      btn-secondary text-white shadow-soft hover:shadow-medium
      focus:ring-blue-400/20
    `,
    ghost: `
      btn-ghost text-white hover:bg-white/15
      focus:ring-white/20
    `
  };

  return (
    <button
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
          <span>Chargement...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

interface FormLinkProps {
  href: string;
  children: React.ReactNode;
  variant?: 'default' | 'accent';
}

export const FormLink: React.FC<FormLinkProps> = ({ href, children, variant = 'default' }) => {
  const variantClasses = {
    default: `
      text-white/80 hover:text-white
      decoration-white/30 hover:decoration-white/60
    `,
    accent: `
      text-cyan-400 hover:text-cyan-300
      decoration-cyan-400/50 hover:decoration-cyan-300
    `
  };

  return (
    <a
      href={href}
      className={`
        text-sm font-medium font-body
        transition-all duration-300
        underline underline-offset-4
        hover:scale-105 active:scale-95
        focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-transparent
        ${variantClasses[variant]}
      `}
    >
      {children}
    </a>
  );
};
