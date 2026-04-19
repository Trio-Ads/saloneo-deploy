import { SectionProps } from '../types';
import { ServiceCard } from './ServiceCard';

export function ServicesMasonry({ template, data, onBook }: SectionProps) {
  const { colors } = template.theme;
  const priceDisplay = data.profile.serviceDisplay?.priceDisplay || 'fixed';

  // Split into two columns with alternating heights effect
  const col1 = data.services.filter((_, i) => i % 2 === 0);
  const col2 = data.services.filter((_, i) => i % 2 !== 0);

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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
            {/* Column 1 — starts at top */}
            <div className="flex flex-col gap-6">
              {col1.map(s => (
                <ServiceCard
                  key={s._id}
                  service={s}
                  template={template}
                  onBook={onBook}
                  priceDisplay={priceDisplay}
                />
              ))}
            </div>
            {/* Column 2 — offset downward for masonry feel */}
            <div className="flex flex-col gap-6 sm:mt-10">
              {col2.map(s => (
                <ServiceCard
                  key={s._id}
                  service={s}
                  template={template}
                  onBook={onBook}
                  priceDisplay={priceDisplay}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
