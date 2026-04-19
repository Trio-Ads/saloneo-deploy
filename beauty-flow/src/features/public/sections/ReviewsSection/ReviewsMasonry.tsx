import { SectionProps } from '../types';
import { PublicReview } from '../../types';

function StarRating({ rating, color }: { rating: number; color: string }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ color: i <= rating ? color : '#d1d5db' }} className="text-sm">★</span>
      ))}
    </div>
  );
}

function ReviewCard({ review, colors, borderRadius }: {
  review: PublicReview;
  colors: { primary: string; text: string; textSecondary: string; background: string };
  borderRadius: string;
}) {
  return (
    <div
      className="p-4 mb-4 transition-shadow duration-200 hover:shadow-md"
      style={{ background: colors.background, borderRadius }}
    >
      <StarRating rating={review.rating} color={colors.primary} />
      <p className="text-sm mt-2 italic leading-relaxed" style={{ color: colors.text }}>
        "{review.comment}"
      </p>
      <p className="text-xs mt-2 font-bold" style={{ color: colors.textSecondary }}>
        — {review.author}
      </p>
    </div>
  );
}

export function ReviewsMasonry({ template, data }: SectionProps) {
  const { colors, typography } = template.theme;
  const col1 = data.reviews.filter((_, i) => i % 2 === 0);
  const col2 = data.reviews.filter((_, i) => i % 2 !== 0);
  const br = template.theme.layout.borderRadius.lg || '12px';

  if (!data.reviews.length) return null;

  return (
    <section style={{ background: colors.surface }} className="px-6 py-16 md:px-12">
      <div className="max-w-4xl mx-auto">
        <h2
          className="text-2xl font-extrabold mb-8"
          style={{ color: colors.text, fontFamily: typography.headingFont }}
        >
          Avis clients
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          <div>
            {col1.map(r => (
              <ReviewCard key={r._id} review={r} colors={colors} borderRadius={br} />
            ))}
          </div>
          <div className="sm:mt-6">
            {col2.map(r => (
              <ReviewCard key={r._id} review={r} colors={colors} borderRadius={br} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
