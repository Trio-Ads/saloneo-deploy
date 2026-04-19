import { SectionProps } from '../types';
import { ServiceCard } from './ServiceCard';

export function ServicesGrid3col({ template, data, onBook }: SectionProps) {
  const { colors } = template.theme;
  const priceDisplay = data.profile.serviceDisplay?.priceDisplay || 'fixed';

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.services.map(service => (
              <ServiceCard
                key={service._id}
                service={service}
                template={template}
                onBook={onBook}
                priceDisplay={priceDisplay}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
