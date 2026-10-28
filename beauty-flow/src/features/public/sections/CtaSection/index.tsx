import { SectionProps } from '../types';
import { Icon, TodayHours, telHref, useSalon } from '../kit';

/** Closing call to action: book, or call. Hidden when the salon offers neither. */
export function CtaSection({ template, data }: SectionProps) {
  const { t, phone, name } = useSalon(data);
  const book = data.services.length > 0;
  if (!book && !phone) return null;
  const actions = (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
      {book && <a href="#services" className="sp-btn">{t('site.book')}</a>}
      {phone && (
        <a href={telHref(phone)} className="inline-flex items-center gap-3 text-xl sp-num hover:underline underline-offset-4">
          <Icon name="phone" size={20} />{phone}
        </a>
      )}
    </div>
  );

  if (template.sections.cta?.variant === 'split') {
    return (
      <section id="cta" className="sp-section">
        <div className="sp-wrap grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          {data.profile.banner
            ? <img decoding="async" src={data.profile.banner} alt="" loading="lazy" className="sp-visual object-cover aspect-[4/3] order-last md:order-none" />
            : <div aria-hidden className="sp-tile sp-tile-0 aspect-[4/3] hidden md:flex" style={{ borderRadius: 'var(--sp-r)' }}><span className="sp-h">{name}</span></div>}
          <div>
            <h2 className="text-[clamp(2rem,1.3rem+2.8vw,3.5rem)] max-w-[16ch]">{t('site.cta_title')}</h2>
            <TodayHours data={data} className="block mt-5 sp-muted" />
            <div className="mt-9">{actions}</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="cta" className="sp-cta-band">
      <div className="sp-wrap py-[calc(var(--sp-py)*0.62)] md:py-[calc(var(--sp-py)*0.8)] flex flex-col md:flex-row md:items-end md:justify-between gap-10">
        <h2 className="text-[clamp(2.25rem,1.2rem+4vw,4.5rem)] !leading-[1] max-w-[14ch]">{t('site.cta_title')}</h2>
        {actions}
      </div>
    </section>
  );
}
