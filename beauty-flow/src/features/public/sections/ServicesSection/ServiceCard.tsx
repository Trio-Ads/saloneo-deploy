import { DesignTemplate } from '../../../templates/types';
import { PublicService } from '../../types';

interface Props {
  service: PublicService;
  template: DesignTemplate;
  onBook: (serviceId: string) => void;
  priceDisplay?: 'fixed' | 'from' | 'range' | 'hidden';
  size?: 'normal' | 'large';
}

function formatPrice(service: PublicService, mode: string, currency: string): string {
  if (mode === 'hidden') return '';
  const sym =
    currency === 'EUR' ? '€'
    : currency === 'USD' ? '$'
    : currency === 'GBP' ? '£'
    : currency === 'DZD' ? 'DA'
    : currency;
  if (mode === 'from') return `À partir de ${service.price}${sym}`;
  return `${service.price}${sym}`;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${h}h`;
}

export function ServiceCard({ service, template, onBook, priceDisplay = 'fixed', size = 'normal' }: Props) {
  const { colors } = template.theme;
  const { borderRadius, shadows } = template.theme.effects
    ? { borderRadius: template.theme.layout.borderRadius, shadows: template.theme.effects.shadows }
    : { borderRadius: template.theme.layout.borderRadius, shadows: { sm: '', md: '', lg: '', xl: '', neon: '' } };
  const primaryImage = service.images.find(i => i.isPrimary) || service.images[0];
  const currency = template.theme.colors.custom?.currency || 'EUR';
  const imageHeight = size === 'large' ? 'h-56' : 'h-40';

  return (
    <div
      style={{
        background: colors.surface,
        borderRadius: borderRadius.lg,
        boxShadow: shadows?.md || '0 4px 6px -1px rgba(0,0,0,0.1)',
        border: `1px solid ${colors.primary}18`,
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
      }}
      className="overflow-hidden flex flex-col group cursor-default hover:scale-[1.02] hover:shadow-lg"
    >
      {primaryImage ? (
        <div className={`relative ${imageHeight} overflow-hidden flex-shrink-0`}>
          <img
            src={primaryImage.url}
            alt={primaryImage.alt || service.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {/* Gradient overlay */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: `linear-gradient(to top, ${colors.primary}40 0%, transparent 60%)` }}
          />
          {service.images.length > 1 && (
            <span
              className="absolute top-2 right-2 text-white text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
            >
              +{service.images.length - 1}
            </span>
          )}
          {service.category && (
            <span
              className="absolute bottom-2 left-2 text-xs px-2 py-0.5 rounded-full font-semibold tracking-wide uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: colors.primary, color: '#fff' }}
            >
              {service.category}
            </span>
          )}
        </div>
      ) : (
        <div
          className={`${imageHeight} flex items-center justify-center flex-shrink-0`}
          style={{ background: `${colors.primary}12` }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="1.5" opacity="0.4">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
            <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
            <line x1="9" y1="9" x2="9.01" y2="9"/>
            <line x1="15" y1="9" x2="15.01" y2="9"/>
          </svg>
        </div>
      )}

      <div className="p-4 flex flex-col flex-1">
        <h3
          style={{ color: colors.text, fontFamily: template.theme.typography.headingFont }}
          className="font-bold text-base mb-1 leading-snug"
        >
          {service.name}
        </h3>
        {service.description && (
          <p
            style={{ color: colors.textSecondary }}
            className="text-sm mb-3 flex-1 line-clamp-2 leading-relaxed"
          >
            {service.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto pt-2" style={{ borderTop: `1px solid ${colors.primary}14` }}>
          <div className="flex flex-col">
            {priceDisplay !== 'hidden' && (
              <span style={{ color: colors.primary }} className="font-extrabold text-base leading-none">
                {formatPrice(service, priceDisplay, currency)}
              </span>
            )}
            <span
              style={{ color: colors.textSecondary }}
              className="text-xs mt-0.5 flex items-center gap-1"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              {formatDuration(service.duration)}
            </span>
          </div>
          <button
            onClick={() => onBook(service._id)}
            style={{
              background: colors.primary,
              color: '#fff',
              borderRadius: borderRadius.md,
              fontFamily: template.theme.typography.bodyFont,
              transition: 'opacity 0.2s ease, transform 0.15s ease',
            }}
            className="text-xs font-bold px-3 py-1.5 hover:opacity-90 active:scale-95 focus:outline-none focus:ring-2"
            aria-label={`Réserver ${service.name}`}
          >
            Réserver
          </button>
        </div>
      </div>
    </div>
  );
}
