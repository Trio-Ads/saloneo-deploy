import { SectionProps } from '../types';
import { Section, Title, photos, useSalon } from '../kit';

/** The salon's own photos (banner + service images). Hidden under three. */
export function GallerySection({ template, data }: SectionProps) {
  const { t } = useSalon(data);
  const all = photos(data).slice(0, 9);
  if (all.length < 3) return null;

  // The grid only takes counts that fill it: one 2×2 lead + full rows of 4 (from 5 photos) or of 3 columns.
  const wide = all.length >= 5;
  const imgs = template.sections.gallery?.variant === 'strip' ? all
    : all.slice(0, wide ? 5 + 4 * Math.floor((all.length - 5) / 4) : 3);
  if (template.sections.gallery?.variant === 'strip') {
    return (
      <section id="gallery" className="sp-section">
        <div className="sp-wrap"><Title>{t('site.gallery_title')}</Title></div>
        <ul className="sp-scroller gap-3 md:gap-5 px-5 md:px-8 pb-1">
          {imgs.map((p, i) => (
            <li key={p.url + i} className="w-[72%] sm:w-[40%] lg:w-[26rem]">
              <img decoding="async" src={p.url} alt={p.alt} loading="lazy" className={`sp-visual object-cover w-full ${i % 2 ? 'aspect-[4/5]' : 'aspect-[3/4]'}`} />
              {p.service && <p className="mt-3 sp-muted text-[0.95rem]">{p.service.name}</p>}
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <Section id="gallery">
      <Title>{t('site.gallery_title')}</Title>
      <ul className={`grid grid-cols-2 gap-3 md:gap-4 auto-rows-[9.5rem] sm:auto-rows-[13rem] ${wide ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
        {imgs.map((p, i) => (
          <li key={p.url + i} className={i === 0 ? 'col-span-2 row-span-2' : ''}>
            <img decoding="async" src={p.url} alt={p.alt} loading="lazy" className="sp-visual object-cover w-full h-full" />
          </li>
        ))}
      </ul>
    </Section>
  );
}
