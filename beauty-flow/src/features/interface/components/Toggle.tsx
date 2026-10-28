import clsx from 'clsx';

/** On/off switch (role="switch"); the ::before extends the hit area to 40px. */
export function Toggle({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={clsx(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-150 ease-out disabled:opacity-50 before:absolute before:-inset-2 before:content-[""]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900',
        checked ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700',
      )}
    >
      <span
        className={clsx(
          'inline-block size-5 rounded-full bg-white shadow-sm transition-transform duration-150 ease-out',
          checked ? 'translate-x-[1.375rem] rtl:-translate-x-[1.375rem]' : 'translate-x-0.5 rtl:-translate-x-0.5',
        )}
      />
    </button>
  );
}
