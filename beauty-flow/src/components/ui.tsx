// Saloneo "Studio" UI primitives — see DESIGN.md. Every app page builds from these.
import React from 'react';
import clsx from 'clsx';

export function PageHeader({ title, subtitle, meta, actions }: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between pb-6 mb-6 border-b border-gray-200 dark:border-gray-800">
      <div className="min-w-0">
        <h1 className="font-display text-[1.75rem] leading-tight font-semibold text-gray-900 dark:text-gray-50">{title}</h1>
        {subtitle && <p className="mt-1 text-[0.9375rem] text-gray-500 dark:text-gray-400">{subtitle}</p>}
        {meta && <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">{meta}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
    </header>
  );
}

export function Panel({ title, description, actions, children, className, bodyClassName, flush }: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  /** No body padding — for lists/tables that run edge to edge. */
  flush?: boolean;
}) {
  return (
    <section className={clsx('panel overflow-hidden dark:bg-gray-900 dark:border-gray-800', className)}>
      {(title || actions) && (
        <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-3">
          <div className="min-w-0">
            {title && <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      )}
      <div className={clsx(!flush && 'px-5 pb-5', !flush && !(title || actions) && 'pt-5', bodyClassName)}>{children}</div>
    </section>
  );
}

export type StatItem = { label: React.ReactNode; value: React.ReactNode; hint?: React.ReactNode; accent?: boolean };

/** One bordered strip split into cells — replaces rows of identical stat cards. */
export function StatGroup({ items, className }: { items: StatItem[]; className?: string }) {
  return (
    <div className={clsx('panel grid grid-cols-2 lg:grid-flow-col lg:auto-cols-fr divide-gray-200 dark:divide-gray-800 dark:bg-gray-900 dark:border-gray-800 mb-6', className)}>
      {items.map((s, i) => (
        <div key={i} className={clsx('px-5 py-4 border-gray-200 dark:border-gray-800', i % 2 === 1 && 'border-s lg:border-s', i >= 2 && 'border-t lg:border-t-0', i > 0 && 'lg:border-s')}>
          <p className="text-[0.8125rem] font-medium text-gray-500 dark:text-gray-400">{s.label}</p>
          <p className={clsx('mt-1 font-display text-2xl font-semibold tabular-nums', s.accent ? 'text-orange-600 dark:text-orange-400' : 'text-gray-900 dark:text-gray-50')}>{s.value}</p>
          {s.hint && <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{s.hint}</p>}
        </div>
      ))}
    </div>
  );
}

export type BadgeTone = 'neutral' | 'orange' | 'green' | 'blue' | 'amber' | 'red';
const badgeTones: Record<BadgeTone, string> = {
  neutral: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  orange: 'bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300',
  green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  blue: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  amber: 'bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  red: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300',
};

export function Badge({ tone = 'neutral', children, className }: { tone?: BadgeTone; children: React.ReactNode; className?: string }) {
  return <span className={clsx('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap', badgeTones[tone], className)}>{children}</span>;
}

/** Appointment status → badge tone, shared by every list and calendar. */
export const statusTone = (status?: string): BadgeTone =>
  ({ scheduled: 'orange', pending: 'orange', confirmed: 'blue', completed: 'green', cancelled: 'red', canceled: 'red', no_show: 'amber', noShow: 'amber' } as Record<string, BadgeTone>)[status || ''] || 'neutral';

export function EmptyState({ icon: Icon, title, body, action }: {
  icon?: React.ComponentType<{ className?: string }>;
  title: React.ReactNode;
  body?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center text-center py-14 px-6">
      {Icon && <span className="mb-4 grid place-items-center size-11 rounded-xl bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"><Icon className="size-5" /></span>}
      <p className="text-[0.9375rem] font-semibold text-gray-900 dark:text-gray-50">{title}</p>
      {body && <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export const IconButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string; tone?: 'default' | 'danger' }>(
  ({ label, tone = 'default', className, children, ...rest }, ref) => (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      className={clsx(
        'grid place-items-center size-10 sm:size-9 rounded-lg text-gray-500 transition-[background-color,color,transform] duration-150 ease-out active:scale-95 dark:text-gray-400',
        tone === 'danger' ? 'hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10' : 'hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-50',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  ),
);
IconButton.displayName = 'IconButton';

/** Segmented control for view switches and sub-tabs. */
export function Segmented<T extends string>({ value, onChange, options, className }: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: React.ReactNode; icon?: React.ComponentType<{ className?: string }> }[];
  className?: string;
}) {
  return (
    <div role="tablist" className={clsx('inline-flex max-w-full overflow-x-auto scrollbar-hide rounded-xl bg-gray-100 p-1 dark:bg-gray-800', className)}>
      {options.map(({ value: v, label, icon: Icon }) => (
        <button
          key={v}
          role="tab"
          type="button"
          aria-selected={v === value}
          onClick={() => onChange(v)}
          className={clsx(
            'inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-[background-color,color,box-shadow] duration-150 ease-out',
            v === value ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-gray-50' : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50',
          )}
        >
          {Icon && <Icon className="size-4" />}
          {label}
        </button>
      ))}
    </div>
  );
}
