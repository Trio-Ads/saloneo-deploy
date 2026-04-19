import { SectionProps } from '../types';
import { StarRating } from './StarRating';

export function ReviewsTicker({ template, data }: SectionProps) {
  const { colors, typography } = template.theme;
  const br = template.theme.layout.borderRadius.md || '8px';

  if (!data.reviews.length) return null;

  // Double for seamless visual loop (pure CSS scroll)
  const doubled = [...data.reviews, ...data.reviews];

  return (
    <section style={{ background: colors.surface, overflow: 'hidden' }} className="py-12">
      <div className="px-6 md:px-12 mb-6">
        <h2
          className="text-xl font-extrabold"
          style={{ color: colors.text, fontFamily: typography.headingFont }}
        >
          Avis clients
        </h2>
      </div>

      {/* Horizontal scroll strip with fade edges */}
      <div className="relative">
        {/* Left fade */}
        <div
          className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
          style={{ background: `linear-gradient(to right, ${colors.surface}, transparent)` }}
        />
        {/* Right fade */}
        <div
          className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
          style={{ background: `linear-gradient(to left, ${colors.surface}, transparent)` }}
        />

        <div className="flex gap-4 overflow-x-auto pb-3 px-6 md:px-12" style={{ scrollbarWidth: 'none' }}>
          {doubled.map((review, i) => (
            <div
              key={`${review._id}-${i}`}
              className="p-4 flex-shrink-0"
              style={{
                background: colors.background,
                borderRadius: br,
                width: '220px',
                borderLeft: `3px solid ${colors.primary}`,
              }}
            >
              <div className="mb-2">
                <StarRating rating={review.rating} color={colors.primary} size="xs" />
              </div>
              <p
                className="text-xs italic leading-relaxed line-clamp-3"
                style={{ color: colors.text }}
              >
                "{review.comment}"
              </p>
              <p className="text-[10px] mt-2 font-bold" style={{ color: colors.textSecondary }}>
                — {review.author}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
