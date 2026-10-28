import { SectionProps } from '../types';
import { Monogram, Section, Title, useSalon } from '../kit';

const paragraphs = (text: string) => text.split(/\n+/).map(p => p.trim()).filter(Boolean);

/** The salon's presentation, set as a reading piece. Hidden when the salon wrote none. */
export function AboutSection({ template, data }: SectionProps) {
  const { t, name } = useSalon(data);
  const text = data.profile.presentation?.trim();
  if (!text) return null;
  const [first, ...rest] = paragraphs(text);
  const variant = template.sections.about?.variant ?? 'text';

  if (variant === 'quote') {
    return (
      <Section id="about">
        <figure className="max-w-4xl mx-auto text-center">
          <blockquote>
            {paragraphs(text).map((p, i) => (
              <p key={i} className={`sp-h !normal-case !leading-[1.2] ${text.length > 280 ? 'text-[clamp(1.35rem,1.1rem+1vw,1.9rem)]' : 'text-[clamp(1.75rem,1.2rem+2.2vw,3rem)]'} ${i ? 'mt-6' : ''}`}>{p}</p>
            ))}
          </blockquote>
          <figcaption className="mt-10 inline-flex items-center gap-4 sp-muted">
            <span aria-hidden className="w-10 h-px" style={{ background: 'var(--sp-ink)' }} />{name}
          </figcaption>
        </figure>
      </Section>
    );
  }

  const body = (
    <div className="max-w-[62ch]">
      <p className="text-[clamp(1.2rem,1rem+0.7vw,1.5rem)] !leading-[1.55]">{first}</p>
      {rest.map((p, i) => <p key={i} className="mt-5 text-lg sp-muted">{p}</p>)}
    </div>
  );

  if (variant === 'logo-text') {
    return (
      <Section id="about">
        <div className="grid md:grid-cols-[auto_1fr] gap-10 md:gap-20 items-start">
          <Monogram data={data} className="h-24 md:h-36 w-auto text-[4.5rem] md:text-[7rem] leading-none sp-ink" />
          <div>
            <Title>{t('site.about_title')}</Title>
            {body}
          </div>
        </div>
      </Section>
    );
  }

  return (
    <Section id="about">
      <div className="grid md:grid-cols-[1fr_2fr] gap-2 md:gap-16">
        <Title>{t('site.about_title')}</Title>
        {body}
      </div>
    </Section>
  );
}
