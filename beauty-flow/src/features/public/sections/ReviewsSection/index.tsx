import { useState } from 'react';
import { SectionProps } from '../types';
import { PublicReview } from '../../types';
import { Arrow, Section, Stars, Title, useRating, useSalon } from '../kit';

type P = SectionProps;

const Quote = ({ r, className = '' }: { r: PublicReview; className?: string }) => (
  <figure className={className}>
    <Stars rating={r.rating} />
    <blockquote className="mt-4"><p>{r.comment}</p></blockquote>
    <figcaption className="mt-4 sp-muted text-[0.95rem]">{r.author}</figcaption>
  </figure>
);

const Head = ({ data }: Pick<P, 'data'>) => {
  const { t } = useSalon(data);
  const rating = useRating(data);
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-x-6">
      <Title>{t('site.reviews_title')}</Title>
      <p className="sp-muted sp-num -mt-4 mb-8 sm:mt-0 sm:mb-0">{rating}</p>
    </div>
  );
};

/** One review at a time, set in the display face. */
function ReviewsCarousel({ data }: P) {
  const { t } = useSalon(data);
  const rating = useRating(data);
  const [i, setI] = useState(0);
  const n = data.reviews.length;
  const r = data.reviews[i];
  return (
    <Section id="reviews" className="sp-surface">
      <div className="grid md:grid-cols-[1fr_2fr] gap-8 md:gap-16">
        <div>
          <Title>{t('site.reviews_title')}</Title>
          <p className="sp-muted sp-num -mt-4">{rating}</p>
          {n > 1 && (
            <div className="hidden md:flex items-center gap-3 mt-10">
              <button type="button" className="sp-iconbtn" onClick={() => setI((i - 1 + n) % n)} aria-label={t('site.previous')}><Arrow dir="prev" /></button>
              <button type="button" className="sp-iconbtn" onClick={() => setI((i + 1) % n)} aria-label={t('site.next')}><Arrow /></button>
              <span className="sp-muted sp-num ms-2">{i + 1} / {n}</span>
            </div>
          )}
        </div>
        <figure key={r._id} aria-live="polite" className="min-h-[14rem]">
          <Stars rating={r.rating} />
          <blockquote className="mt-6">
            <p className="sp-h text-[clamp(1.6rem,1.1rem+1.8vw,2.5rem)] !leading-[1.2] !normal-case">{r.comment}</p>
          </blockquote>
          <figcaption className="mt-8 sp-muted">{r.author}</figcaption>
        </figure>
        {n > 1 && (
          <div className="flex md:hidden items-center gap-3">
            <button type="button" className="sp-iconbtn" onClick={() => setI((i - 1 + n) % n)} aria-label={t('site.previous')}><Arrow dir="prev" /></button>
            <button type="button" className="sp-iconbtn" onClick={() => setI((i + 1) % n)} aria-label={t('site.next')}><Arrow /></button>
            <span className="sp-muted sp-num ms-2">{i + 1} / {n}</span>
          </div>
        )}
      </div>
    </Section>
  );
}

/** The best review large, the others in a quiet row below. */
function ReviewsFeatured({ data }: P) {
  const [lead, ...rest] = [...data.reviews].sort((a, b) => b.rating - a.rating || b.comment.length - a.comment.length);
  return (
    <Section id="reviews">
      <Head data={data} />
      <figure className="max-w-4xl">
        <Stars rating={lead.rating} />
        <blockquote className="mt-6">
          <p className="sp-h text-[clamp(1.75rem,1.1rem+2.4vw,3rem)] !leading-[1.15] !normal-case">{lead.comment}</p>
        </blockquote>
        <figcaption className="mt-8 sp-muted">{lead.author}</figcaption>
      </figure>
      {rest.length > 0 && (
        <div className="mt-14 md:mt-20 grid md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-8 border-t sp-line pt-10">
          {rest.slice(0, 6).map(r => <Quote key={r._id} r={r} className="text-[1.05rem]" />)}
        </div>
      )}
    </Section>
  );
}

function ReviewsMasonry({ data }: P) {
  return (
    <Section id="reviews">
      <Head data={data} />
      <div className="columns-1 md:columns-2 lg:columns-3 gap-5">
        {data.reviews.map((r, i) => (
          <Quote key={r._id} r={r} className={`break-inside-avoid mb-5 sp-card p-6 md:p-7 ${i % 3 === 0 ? 'text-xl' : 'text-[1.05rem]'}`} />
        ))}
      </div>
    </Section>
  );
}

/** A strip of short reviews running across the page (static and scrollable with reduced motion). */
function ReviewsTicker({ data }: P) {
  const { t } = useSalon(data);
  const rating = useRating(data);
  const half: PublicReview[] = [];
  while (half.length < 6) half.push(...data.reviews);
  return (
    <section id="reviews" className="sp-surface border-y sp-line py-8 md:py-10" aria-label={t('site.reviews_title')}>
      <div className="sp-wrap flex items-baseline justify-between gap-6 mb-6">
        <h2 className="text-2xl md:text-3xl">{t('site.reviews_title')}</h2>
        <p className="sp-muted sp-num">{rating}</p>
      </div>
      <div className="sp-ticker-wrap overflow-hidden">
        <ul className="sp-ticker">
          {[...half, ...half].map((r, i) => (
            <li key={i} aria-hidden={i >= half.length || i >= data.reviews.length || undefined}
              className="w-[19rem] md:w-[24rem] shrink-0 px-6 border-e sp-line">
              <Stars rating={r.rating} />
              <p className="mt-3 line-clamp-3">{r.comment}</p>
              <p className="mt-2 sp-muted text-sm">{r.author}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function ReviewsSection(props: SectionProps) {
  if (!props.data.reviews.length) return null;
  switch (props.template.sections.reviews.variant) {
    case 'featured': return <ReviewsFeatured {...props} />;
    case 'masonry':  return <ReviewsMasonry {...props} />;
    case 'ticker':   return <ReviewsTicker {...props} />;
    default:         return <ReviewsCarousel {...props} />;
  }
}
