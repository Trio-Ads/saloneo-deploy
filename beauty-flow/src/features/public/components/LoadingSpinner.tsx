import React from 'react';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  /** kept for callers; all variants render the same quiet spinner */
  variant?: 'default' | 'minimal' | 'elegant';
}

const sizes = { sm: 'h-5 w-5', md: 'h-7 w-7', lg: 'h-9 w-9', xl: 'h-12 w-12' };

/** Neutral ring in the current text color, so it fits whichever salon template surrounds it. */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ fullScreen = true, size = 'lg', message }) => (
  <div
    role="status"
    className={`flex flex-col items-center justify-center gap-4 ${fullScreen ? 'min-h-screen bg-white text-zinc-500' : 'min-h-[200px] opacity-70'}`}
  >
    <span className={`${sizes[size]} rounded-full border-2 border-current border-t-transparent animate-spin`} aria-hidden />
    {message ? <p className="text-sm">{message}</p> : <span className="sr-only">Chargement…</span>}
  </div>
);

export default LoadingSpinner;
