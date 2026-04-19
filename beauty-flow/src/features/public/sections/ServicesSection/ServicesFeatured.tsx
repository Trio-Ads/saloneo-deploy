import { SectionProps } from '../types';
import { ServiceCard } from './ServiceCard';
import { formatDuration, formatPrice } from './utils';

export function ServicesFeatured({ template, data, onBook }: SectionProps) {
  const { colors } = template.theme;
  const { borderRadius } = template.theme.layout;
  const { shadows } = template.theme.effects;
  const priceDisplay = data.profile.serviceDisplay?.priceDisplay || 'fixed';
  const currency = data.profile.settings?.currency || 'EUR';

  const [featured, ...rest] = data.services;

  return (
    <section id="services" style={{ background: colors.background }} className="px-6 py-14 md:px-12">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="mb-10">
          <p
            style={{ color: colors.primary }}
            className="text-xs font-bold uppercase tracking-[0.2em] mb-2"
          >
            Ce que nous proposons
          </p>
          <h2
            style={{ color: colors.text, fontFamily: template.theme.typography.headingFont }}
            className="text-2xl md:text-3xl font-extrabold"
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
          <>
            {/* Featured hero card */}
            {featured && (
              <div
                className="mb-8 overflow-hidden group relative"
                style={{
                  background: colors.surface,
                  borderRadius: borderRadius.xl || borderRadius.lg,
                  boxShadow: shadows.lg || '0 10px 15px -3px rgba(0,0,0,0.1)',
                  border: `1px solid ${colors.primary}20`,
                }}
              >
                <div className="md:flex">
                  {/* Image side */}
                  {(featured.images.find(i => i.isPrimary) || featured.images[0]) && (
                    <div className="md:w-2/5 relative overflow-hidden" style={{ minHeight: '280px' }}>
                      <img
                        src={(featured.images.find(i => i.isPrimary) || featured.images[0]).url}
                        alt={(featured.images.find(i => i.isPrimary) || featured.images[0]).alt || featured.name}
                        className="w-full h-full object-cover absolute inset-0 transition-transform duration-500 group-hover:scale-105"
                        style={{ minHeight: '280px' }}
                      />
                      <div
                        className="absolute inset-0"
                        style={{ background: `linear-gradient(to right, transparent 70%, ${colors.surface})` }}
                      />
                      {/* Badge */}
                      <span
                        className="absolute top-4 left-4 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full"
                        style={{ background: colors.primary, color: '#fff' }}
                      >
                        À la une
                      </span>
                    </div>
                  )}

                  {/* Content side */}
                  <div className="md:w-3/5 p-8 flex flex-col justify-center">
                    {featured.category && (
                      <p
                        style={{ color: colors.primary }}
                        className="text-xs font-bold uppercase tracking-[0.15em] mb-2"
                      >
                        {featured.category}
                      </p>
                    )}
                    <h3
                      style={{ color: colors.text, fontFamily: template.theme.typography.headingFont }}
                      className="text-2xl md:text-3xl font-extrabold mb-3 leading-tight"
                    >
                      {featured.name}
                    </h3>
                    {featured.description && (
                      <p
                        style={{ color: colors.textSecondary }}
                        className="text-sm leading-relaxed mb-6 max-w-md"
                      >
                        {featured.description}
                      </p>
                    )}
                    <div className="flex items-center gap-6">
                      {priceDisplay !== 'hidden' && (
                        <div>
                          <span style={{ color: colors.primary }} className="text-2xl font-extrabold">
                            {formatPrice(featured, priceDisplay, currency)}
                          </span>
                          <span style={{ color: colors.textSecondary }} className="text-xs ml-2">
                            · {formatDuration(featured.duration)}
                          </span>
                        </div>
                      )}
                      <button
                        onClick={() => onBook(featured._id)}
                        style={{
                          background: colors.primary,
                          color: '#fff',
                          borderRadius: borderRadius.md,
                          transition: 'opacity 0.2s ease, transform 0.15s ease',
                        }}
                        className="text-sm font-bold px-5 py-2.5 hover:opacity-90 active:scale-95 focus:outline-none"
                        aria-label={`Réserver ${featured.name}`}
                      >
                        Réserver maintenant
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Rest of services grid */}
            {rest.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {rest.map(s => (
                  <ServiceCard
                    key={s._id}
                    service={s}
                    template={template}
                    onBook={onBook}
                    priceDisplay={priceDisplay}
                    currency={currency}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
