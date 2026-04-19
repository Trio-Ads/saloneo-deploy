import { SectionProps } from '../types';

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${h}h`;
}

export function ServicesList({ template, data, onBook }: SectionProps) {
  const { colors } = template.theme;
  const { borderRadius } = template.theme.layout;
  const priceDisplay = data.profile.serviceDisplay?.priceDisplay || 'fixed';
  const currency = template.theme.colors.custom?.currency || 'EUR';
  const sym =
    currency === 'EUR' ? '€'
    : currency === 'USD' ? '$'
    : currency === 'GBP' ? '£'
    : currency === 'DZD' ? 'DA'
    : currency;

  return (
    <section id="services" style={{ background: colors.background }} className="px-6 py-14 md:px-12">
      <div className="max-w-3xl mx-auto">
        {/* Section header */}
        <div className="mb-8">
          <p
            style={{ color: colors.primary }}
            className="text-xs font-bold uppercase tracking-[0.2em] mb-2"
          >
            Ce que nous proposons
          </p>
          <h2
            style={{ color: colors.text, fontFamily: template.theme.typography.headingFont }}
            className="text-2xl font-extrabold"
          >
            Nos prestations
          </h2>
          <div
            className="mt-3 h-0.5 w-12 rounded-full"
            style={{ background: colors.primary }}
          />
        </div>

        {data.services.length === 0 ? (
          <p style={{ color: colors.textSecondary }} className="text-sm">
            Aucune prestation disponible pour le moment.
          </p>
        ) : (
          <div className="flex flex-col">
            {data.services.map((service, index) => {
              const primaryImage = service.images.find(i => i.isPrimary) || service.images[0];
              return (
                <div
                  key={service._id}
                  className="flex items-center gap-4 py-4 group"
                  style={{
                    borderTop: index === 0 ? `1px solid ${colors.primary}20` : undefined,
                    borderBottom: `1px solid ${colors.primary}20`,
                  }}
                >
                  {/* Optional thumbnail */}
                  {primaryImage && (
                    <div
                      className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden"
                      style={{ borderRadius: borderRadius.md }}
                    >
                      <img
                        src={primaryImage.url}
                        alt={primaryImage.alt || service.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p
                      style={{ color: colors.text, fontFamily: template.theme.typography.headingFont }}
                      className="font-bold text-base leading-snug"
                    >
                      {service.name}
                    </p>
                    {service.description && (
                      <p
                        style={{ color: colors.textSecondary }}
                        className="text-sm mt-0.5 truncate leading-relaxed"
                      >
                        {service.description}
                      </p>
                    )}
                  </div>

                  {/* Price + Duration + CTA */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      {priceDisplay !== 'hidden' && (
                        <p style={{ color: colors.primary }} className="font-extrabold text-base leading-none">
                          {priceDisplay === 'from'
                            ? `dès ${service.price}${sym}`
                            : `${service.price}${sym}`}
                        </p>
                      )}
                      <p
                        style={{ color: colors.textSecondary }}
                        className="text-xs mt-0.5 flex items-center justify-end gap-1"
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                        </svg>
                        {formatDuration(service.duration)}
                      </p>
                    </div>
                    <button
                      onClick={() => onBook(service._id)}
                      style={{
                        background: colors.primary,
                        color: '#fff',
                        borderRadius: borderRadius.md,
                        transition: 'opacity 0.2s ease, transform 0.15s ease',
                      }}
                      className="text-xs font-bold px-3 py-1.5 hover:opacity-90 active:scale-95 focus:outline-none whitespace-nowrap"
                      aria-label={`Réserver ${service.name}`}
                    >
                      Réserver
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
