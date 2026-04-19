import { useState } from 'react';
import { SectionProps } from '../types';
import { StarRating } from './StarRating';

export function ReviewsCarousel({ template, data }: SectionProps) {
  const { colors, typography } = template.theme;
  const reviews = data.reviews;
  const [index, setIndex] = useState(0);

  if (!reviews.length) return null;

  const current = reviews[index];
  const prev = () => setIndex(i => (i - 1 + reviews.length) % reviews.length);
  const next = () => setIndex(i => (i + 1) % reviews.length);

  return (
    <section style={{ background: colors.surface }} className="px-6 py-16 md:px-12">
      <div className="max-w-2xl mx-auto">

        {/* Heading */}
        <div className="text-center mb-10">
          <h2
            className="text-2xl md:text-3xl font-extrabold"
            style={{ color: colors.text, fontFamily: typography.headingFont }}
          >
            Ce que disent nos clients
          </h2>
          <div className="mt-2 flex justify-center">
            <span className="inline-block h-0.5 w-12" style={{ background: colors.primary }} />
          </div>
        </div>

        {/* Card */}
        <div
          className="relative text-center px-6 md:px-12 py-8 rounded-2xl"
          style={{ background: colors.background }}
        >
          {/* Decorative quote mark */}
          <div
            className="absolute top-4 left-6 text-6xl font-black leading-none select-none pointer-events-none"
            style={{ color: colors.primary, opacity: 0.15, fontFamily: typography.headingFont }}
            aria-hidden
          >
            "
          </div>

          <div className="relative z-10">
            <StarRating rating={current.rating} color={colors.primary} />
            <p
              className="text-base md:text-lg italic mt-4 leading-relaxed"
              style={{ color: colors.text, fontFamily: typography.bodyFont }}
            >
              "{current.comment}"
            </p>
            <p className="mt-4 text-sm font-bold" style={{ color: colors.textSecondary }}>
              — {current.author}
            </p>
          </div>
        </div>

        {/* Controls */}
        {reviews.length > 1 && (
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={prev}
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all hover:opacity-80"
              style={{ background: colors.surface, color: colors.text, border: `1px solid ${colors.primary}40` }}
              aria-label="Précédent"
            >
              ‹
            </button>
            <div className="flex gap-2">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className="rounded-full transition-all"
                  style={{
                    width: i === index ? '20px' : '8px',
                    height: '8px',
                    background: i === index ? colors.primary : `${colors.primary}40`,
                  }}
                  aria-label={`Avis ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all hover:opacity-80"
              style={{ background: colors.surface, color: colors.text, border: `1px solid ${colors.primary}40` }}
              aria-label="Suivant"
            >
              ›
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
