import { useRef } from 'react';
import { SectionProps } from '../types';
import { ServiceCard } from './ServiceCard';

export function ServicesCarousel({ template, data, onBook }: SectionProps) {
  const { colors } = template.theme;
  const { borderRadius } = template.theme.layout;
  const priceDisplay = data.profile.serviceDisplay?.priceDisplay || 'fixed';
  const scrollRef = useRef<HTMLDivElement>(null);

  function scrollBy(direction: 'left' | 'right') {
    if (!scrollRef.current) return;
    const amount = 280;
    scrollRef.current.scrollBy({ left: direction === 'right' ? amount : -amount, behavior: 'smooth' });
  }

  return (
    <section id="services" style={{ background: colors.background }} className="py-14">
      <div className="px-6 md:px-12 mb-6 flex items-end justify-between">
        <div>
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

        {/* Navigation arrows */}
        {data.services.length > 1 && (
          <div className="flex gap-2">
            <button
              onClick={() => scrollBy('left')}
              aria-label="Précédent"
              style={{
                background: colors.surface,
                border: `1px solid ${colors.primary}30`,
                borderRadius: borderRadius.md,
                color: colors.text,
                transition: 'background 0.2s ease',
              }}
              className="w-9 h-9 flex items-center justify-center hover:opacity-80 focus:outline-none"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <button
              onClick={() => scrollBy('right')}
              aria-label="Suivant"
              style={{
                background: colors.primary,
                borderRadius: borderRadius.md,
                color: '#fff',
                transition: 'opacity 0.2s ease',
              }}
              className="w-9 h-9 flex items-center justify-center hover:opacity-80 focus:outline-none"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        )}
      </div>

      {data.services.length === 0 ? (
        <div className="px-6 md:px-12">
          <p style={{ color: colors.textSecondary }} className="text-sm">
            Aucune prestation disponible pour le moment.
          </p>
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto px-6 md:px-12 pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {data.services.map(service => (
            <div key={service._id} className="flex-shrink-0 w-64 snap-start">
              <ServiceCard
                service={service}
                template={template}
                onBook={onBook}
                priceDisplay={priceDisplay}
              />
            </div>
          ))}
          {/* Trailing spacer */}
          <div className="flex-shrink-0 w-6 md:w-12" aria-hidden="true" />
        </div>
      )}
    </section>
  );
}
