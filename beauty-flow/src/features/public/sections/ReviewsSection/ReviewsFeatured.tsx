import { SectionProps } from '../types';
import { StarRating } from './StarRating';

export function ReviewsFeatured({ template, data }: SectionProps) {
  const { colors, typography } = template.theme;
  const brLg = template.theme.layout.borderRadius.lg || '12px';
  const brMd = template.theme.layout.borderRadius.md || '8px';

  if (!data.reviews.length) return null;

  const [featured, ...rest] = data.reviews;

  // Average rating for the header stat
  const avg = data.reviews.reduce((sum, r) => sum + r.rating, 0) / data.reviews.length;
  const avgDisplay = avg.toFixed(1);

  return (
    <section style={{ background: colors.surface }} className="px-6 py-16 md:px-12">
      <div className="max-w-4xl mx-auto">

        {/* Header with aggregate stat */}
        <div className="flex items-end gap-4 mb-8">
          <h2
            className="text-2xl font-extrabold"
            style={{ color: colors.text, fontFamily: typography.headingFont }}
          >
            Ce qu'ils disent
          </h2>
          <div className="flex items-center gap-1.5 pb-0.5">
            <span className="text-2xl font-black" style={{ color: colors.primary }}>
              {avgDisplay}
            </span>
            <StarRating rating={Math.round(avg)} color={colors.primary} />
            <span className="text-xs ml-1" style={{ color: colors.textSecondary }}>
              ({data.reviews.length} avis)
            </span>
          </div>
        </div>

        {/* Featured review — hero card */}
        <div
          className="relative p-6 mb-6 overflow-hidden"
          style={{
            background: `${colors.primary}10`,
            borderLeft: `4px solid ${colors.primary}`,
            borderRadius: brLg,
          }}
        >
          {/* Decorative large quote */}
          <div
            className="absolute top-2 right-6 text-8xl font-black leading-none select-none pointer-events-none"
            style={{ color: colors.primary, opacity: 0.08, fontFamily: typography.headingFont }}
            aria-hidden
          >
            "
          </div>
          <StarRating rating={featured.rating} color={colors.primary} />
          <p
            className="text-base md:text-lg italic mt-3 leading-relaxed relative z-10"
            style={{ color: colors.text, fontFamily: typography.headingFont }}
          >
            "{featured.comment}"
          </p>
          <p className="text-sm mt-3 font-bold" style={{ color: colors.textSecondary }}>
            — {featured.author}
          </p>
        </div>

        {/* Secondary reviews grid */}
        {rest.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {rest.map(review => (
              <div
                key={review._id}
                className="p-4"
                style={{ background: colors.background, borderRadius: brMd }}
              >
                <StarRating rating={review.rating} color={colors.primary} size="sm" />
                <p className="text-sm italic mt-2 leading-relaxed" style={{ color: colors.text }}>
                  "{review.comment}"
                </p>
                <p className="text-xs mt-2 font-bold" style={{ color: colors.textSecondary }}>
                  — {review.author}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
