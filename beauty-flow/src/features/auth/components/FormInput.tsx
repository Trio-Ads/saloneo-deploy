import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { EyeIcon, EyeSlashIcon, ExclamationCircleIcon } from '@heroicons/react/20/solid';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** i18n key (auth namespace) */
  label: string;
  /** i18n key (auth namespace) */
  error?: string;
  /** i18n key (auth namespace) */
  hint?: string;
  /** Rendered at the end of the label row (e.g. "forgot password" link) */
  aside?: React.ReactNode;
}

export const FormInput: React.FC<FormInputProps> = ({ label, error, hint, aside, type = 'text', id, className = '', ...props }) => {
  const { t } = useTranslation('auth');
  const [visible, setVisible] = useState(false);
  const inputId = id || props.name;
  const msgId = `${inputId}-msg`;
  const isPassword = type === 'password';

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700 dark:text-gray-300">{t(label)}</label>
        {aside}
      </div>
      <div className="relative mt-1.5">
        <input
          id={inputId}
          type={isPassword && visible ? 'text' : type}
          aria-invalid={!!error}
          aria-describedby={error || hint ? msgId : undefined}
          className={clsx(
            'field h-11 dark:bg-gray-900 dark:border-gray-700',
            isPassword && 'pe-11',
            error && '!border-red-500 focus:!shadow-[0_0_0_3px_rgb(239_68_68/0.15)]',
            className,
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible(!visible)}
            aria-label={t(visible ? 'field.hidePassword' : 'field.showPassword')}
            aria-pressed={visible}
            className="absolute inset-y-0 end-0 grid w-11 place-items-center rounded-e-xl text-gray-400 transition-colors duration-150 ease-out hover:text-gray-700 dark:hover:text-gray-200"
          >
            {visible ? <EyeSlashIcon className="size-5" /> : <EyeIcon className="size-5" />}
          </button>
        )}
      </div>
      {error ? (
        <p id={msgId} className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
          <ExclamationCircleIcon className="size-4 shrink-0" />{t(error)}
        </p>
      ) : hint ? (
        <p id={msgId} className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">{t(hint)}</p>
      ) : null}
    </div>
  );
};

interface FormButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: 'primary' | 'secondary';
}

export const FormButton: React.FC<FormButtonProps> = ({ children, isLoading, variant = 'primary', className = '', disabled, ...props }) => {
  const { t } = useTranslation('auth');
  return (
    <button
      className={clsx(variant === 'primary' ? 'btn-primary' : 'btn-secondary', 'h-11 text-[0.9375rem]', className)}
      disabled={isLoading || disabled}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
          {t('field.loading')}
        </>
      ) : children}
    </button>
  );
};

export const FormLink: React.FC<{ to: string; children: React.ReactNode; className?: string }> = ({ to, children, className = '' }) => (
  <Link to={to} className={clsx('font-medium text-orange-600 underline-offset-4 transition-colors duration-150 ease-out hover:text-orange-700 hover:underline dark:text-orange-400 dark:hover:text-orange-300', className)}>
    {children}
  </Link>
);

/** Form-level error banner. */
export const FormAlert: React.FC<{ children: React.ReactNode; tone?: 'error' | 'success' }> = ({ children, tone = 'error' }) => (
  <div
    role={tone === 'error' ? 'alert' : 'status'}
    className={clsx(
      'flex items-start gap-2 rounded-xl border px-3.5 py-3 text-sm',
      tone === 'error'
        ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300'
        : 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
    )}
  >
    {tone === 'error' && <ExclamationCircleIcon className="mt-0.5 size-4 shrink-0" />}
    <span>{children}</span>
  </div>
);
