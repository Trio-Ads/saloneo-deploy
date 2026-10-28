import { useRef, useState } from 'react';
import { SectionProps } from '../types';
import { PublicService } from '../../types';
import { Arrow, BookButton, Icon, Meta, Section, ServiceVisual, Title, isDark, useSalon } from '../kit';

type P = SectionProps;

const Desc = ({ s, className = '' }: { s: PublicService; className?: string }) =>
  s.description ? <p className={`sp-muted ${className}`}>{s.description}</p> : null;

/** Name, description, price · duration on the left, booking on the right. */
function Row({ s, data, onBook, big }: Pick<P, 'data' | 'onBook'> & { s: PublicService; big?: boolean }) {
  return (
    <li className={`flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 border-b sp-line ${big ? 'py-7' : 'py-6'}`}>
      <div className="flex-1 min-w-0">
        <h3 className={big ? 'text-xl md:text-2xl' : 'text-lg md:text-xl'}>{s.name}</h3>
        <Desc s={s} className="mt-1.5 max-w-[60ch]" />
        <Meta service={s} data={data} className="block mt-2 text-[0.95rem]" />
      </div>
      <BookButton service={s} onBook={onBook} small ghost className="self-start sm:self-auto" />
    </li>
  );
}

/** Category tabs over a two-column list. */
function ServicesTabs({ data, onBook }: P) {
  const { t, categories } = useSalon(data);
  const [active, setActive] = useState('');
  const shown = active ? data.services.filter(s => s.category === active) : data.services;
  return (
    <Section id="services">
      <Title>{t('site.services_title')}</Title>
      {categories.length > 1 && (
        <div role="tablist" aria-label={t('site.services_title')} className="sp-scroller gap-2 -mx-5 px-5 md:mx-0 md:px-0 md:flex-wrap mb-6">
          {['', ...categories].map(c => (
            <button key={c || 'all'} type="button" role="tab" aria-selected={active === c} onClick={() => setActive(c)} className="sp-chip">
              {c || t('site.all')}
            </button>
          ))}
        </div>
      )}
      <ul role="tabpanel" className="grid md:grid-cols-2 md:gap-x-12">
        {shown.map(s => <Row key={s._id} s={s} data={data} onBook={onBook} />)}
      </ul>
    </Section>
  );
}

/** A printed price list: grouped by category, dotted leaders up to the price. On dark templates it sits on a board. */
function ServicesMenu({ template, data, onBook }: P) {
  const { t, groups, price, duration } = useSalon(data);
  const board = isDark(template.theme.colors.background);
  return (
    <Section id="services">
      <Title>{t('site.services_title')}</Title>
      <div className={`md:columns-2 md:gap-16 ${board ? 'sp-card p-6 md:p-12' : ''}`}>
        {groups.map(g => (
          <div key={g.name} className="break-inside-avoid mb-10 last:mb-0 md:last:mb-10">
            {g.name && <h3 className="sp-ink text-2xl md:text-[1.75rem] pb-3 border-b sp-line">{g.name}</h3>}
            <ul>
              {g.services.map(s => (
                <li key={s._id} className="py-4 border-b sp-line last:border-0">
                  <div className="flex items-baseline gap-3">
                    <span className="font-semibold text-[1.05rem]">{s.name}</span>
                    <span className="sp-leader" />
                    <span className="sp-num sp-price">{price(s) || duration(s)}</span>
                  </div>
                  <div className="mt-1 flex items-start justify-between gap-6">
                    <p className="sp-muted text-[0.95rem]">
                      {s.description}{price(s) && <span className="sp-num whitespace-nowrap">{s.description && ' · '}{duration(s)}</span>}
                    </p>
                    <button type="button" onClick={() => onBook(s._id)} className="sp-link text-[0.95rem] shrink-0 min-h-[40px] -my-2" aria-label={t('site.book_service', { name: s.name })}>
                      {t('site.book')}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}

/** One column of generous rows separated by hairlines. */
function ServicesList({ data, onBook }: P) {
  const { t } = useSalon(data);
  return (
    <Section id="services">
      <Title>{t('site.services_title')}</Title>
      <ul className="border-t sp-line">
        {data.services.map(s => <Row key={s._id} s={s} data={data} onBook={onBook} big />)}
      </ul>
    </Section>
  );
}

/** Uneven cards with a color chip, like polish swatches. */
function ServicesMasonry({ data, onBook }: P) {
  const { t } = useSalon(data);
  const chips = ['var(--sp-primary)', 'var(--sp-secondary)', 'color-mix(in srgb, var(--sp-primary) 50%, var(--sp-secondary))'];
  return (
    <Section id="services">
      <Title>{t('site.services_title')}</Title>
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-5">
        {data.services.map((s, i) => {
          const lead = i % 4 === 0;
          const hasImg = s.images?.length > 0;
          return (
            <article key={s._id} className={`break-inside-avoid mb-5 sp-card ${lead ? 'p-7 md:p-8' : 'p-6'}`}
              style={lead ? { background: 'color-mix(in srgb, var(--sp-primary) 9%, var(--sp-surface))' } : undefined}>
              {hasImg && <ServiceVisual service={s} index={i} className="aspect-[4/5] mb-5" />}
              <div className="flex items-center gap-2 text-sm sp-muted">
                <span aria-hidden className="w-3.5 h-3.5 rounded-full" style={{ background: chips[i % 3] }} />
                {s.category}
              </div>
              <h3 className={`mt-3 ${lead ? 'text-3xl md:text-4xl' : 'text-2xl'}`}>{s.name}</h3>
              <Desc s={s} className="mt-2" />
              <div className={`flex items-center justify-between gap-4 ${lead ? 'mt-10' : 'mt-6'}`}>
                <Meta service={s} data={data} className="text-[0.95rem]" />
                <BookButton service={s} onBook={onBook} small />
              </div>
            </article>
          );
        })}
      </div>
    </Section>
  );
}

/** One service set large (the one with a photo, else the most valued), the rest as a quiet list beside it. */
function ServicesFeatured({ data, onBook }: P) {
  const { t } = useSalon(data);
  const lead = data.services.find(s => s.images?.length) ?? [...data.services].sort((a, b) => b.price - a.price)[0];
  if (!lead) return null;
  const rest = data.services.filter(s => s !== lead);
  const img = lead.images?.length > 0;
  return (
    <Section id="services">
      <Title>{t('site.services_title')}</Title>
      <div className="grid md:grid-cols-12 gap-10 md:gap-14">
        {/* without a photo the featured service becomes a typographic panel */}
        <article className={`md:col-span-6 ${img ? '' : 'sp-tile-2 p-7 md:p-12 flex flex-col justify-end min-h-[20rem] md:min-h-[34rem]'}`} style={img ? undefined : { borderRadius: 'var(--sp-r)' }}>
          {img ? <ServiceVisual service={lead} index={0} className="aspect-[4/3] md:aspect-[4/5]" /> : lead.category && <p className="sp-muted">{lead.category}</p>}
          <h3 className={img ? 'mt-7 text-3xl md:text-4xl' : 'mt-3 text-[clamp(2.25rem,1.5rem+3vw,4rem)]'}>{lead.name}</h3>
          <Desc s={lead} className="mt-3 text-lg max-w-[44ch]" />
          <div className="mt-7 flex flex-wrap items-center gap-6">
            <BookButton service={lead} onBook={onBook} />
            <Meta service={lead} data={data} />
          </div>
        </article>
        <ul className="md:col-span-6 border-t sp-line md:border-t-0 self-start">
          {rest.map(s => <Row key={s._id} s={s} data={data} onBook={onBook} />)}
        </ul>
      </div>
    </Section>
  );
}

function ServicesCarousel({ data, onBook }: P) {
  const { t } = useSalon(data);
  const ref = useRef<HTMLDivElement>(null);
  const go = (d: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const rtl = getComputedStyle(el).direction === 'rtl' ? -1 : 1;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: d * rtl * el.clientWidth * 0.8, behavior: reduce ? 'auto' : 'smooth' });
  };
  return (
    <Section id="services">
      <div className="flex items-end justify-between gap-6">
        <Title>{t('site.services_title')}</Title>
        <div className="hidden md:flex gap-2 mb-10">
          <button type="button" className="sp-iconbtn" onClick={() => go(-1)} aria-label={t('site.previous')}><Arrow dir="prev" /></button>
          <button type="button" className="sp-iconbtn" onClick={() => go(1)} aria-label={t('site.next')}><Arrow /></button>
        </div>
      </div>
      <div ref={ref} className="sp-scroller gap-5 -mx-5 px-5 md:mx-0 md:px-0 pb-1">
        {data.services.map((s, i) => (
          <article key={s._id} className="w-[80%] sm:w-[46%] lg:w-[calc((100%-2.5rem)/3)] sp-card overflow-hidden flex flex-col">
            <ServiceVisual service={s} index={i} className="aspect-[4/3] !rounded-none" />
            <div className="p-6 flex flex-col flex-1">
              <h3 className="text-2xl">{s.name}</h3>
              <Desc s={s} className="mt-2" />
              <div className="mt-auto pt-6 flex items-center justify-between gap-4">
                <Meta service={s} data={data} className="text-[0.95rem]" />
                <BookButton service={s} onBook={onBook} small />
              </div>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}

/** Open three-column grid, no card chrome. */
function ServicesGrid3col({ data, onBook }: P) {
  const { t } = useSalon(data);
  return (
    <Section id="services">
      <Title>{t('site.services_title')}</Title>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
        {data.services.map((s, i) => (
          <article key={s._id} className="flex flex-col">
            <ServiceVisual service={s} index={i} className="aspect-[4/3]" />
            <h3 className="mt-5 text-2xl">{s.name}</h3>
            <Desc s={s} className="mt-2" />
            <div className="mt-auto pt-5 flex items-center justify-between gap-4">
              <Meta service={s} data={data} className="text-[0.95rem]" />
              <BookButton service={s} onBook={onBook} small ghost />
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}

/** One disclosure per category, the first one open. */
function ServicesAccordion({ data, onBook }: P) {
  const { t, groups } = useSalon(data);
  return (
    <Section id="services">
      <Title>{t('site.services_title')}</Title>
      <div className="border-t sp-line">
        {groups.map((g, i) => (
          <details key={g.name} open={i === 0} className="sp-acc border-b sp-line">
            <summary className="flex items-center justify-between gap-6 min-h-[4.5rem] py-4 cursor-pointer">
              <span className="sp-h text-2xl md:text-3xl">{g.name || t('site.other_services')}</span>
              <span className="flex items-center gap-4 sp-muted sp-num text-[0.95rem] shrink-0">
                {t('site.service_count', { count: g.services.length })}
                <Icon name="chevron" size={20} className="sp-acc-chevron" />
              </span>
            </summary>
            <ul className="pb-2 [&>li:last-child]:border-0">
              {g.services.map(s => <Row key={s._id} s={s} data={data} onBook={onBook} />)}
            </ul>
          </details>
        ))}
      </div>
    </Section>
  );
}

/** A tariff board: categories in columns, one ruled line per service (the whole line books). */
function ServicesPricelist({ data, onBook }: P) {
  const { t, groups, price, duration } = useSalon(data);
  return (
    <Section id="services" className="sp-surface">
      <Title>{t('site.services_title')}</Title>
      <div className="sm:columns-2 lg:columns-3 gap-10 lg:gap-14">
        {groups.map(g => (
          <div key={g.name} className="break-inside-avoid mb-10">
            <h3 className="sp-ink text-xl md:text-2xl pb-3 border-b sp-line">{g.name || t('site.other_services')}</h3>
            <ul>
              {g.services.map(s => (
                <li key={s._id}>
                  <button type="button" onClick={() => onBook(s._id)} aria-label={t('site.book_service', { name: s.name })}
                    className="sp-rowbtn w-full grid grid-cols-[1fr_auto_auto] items-baseline gap-x-4 py-3 border-b sp-line text-start">
                    <span className="font-medium">{s.name}</span>
                    <span className="sp-muted sp-num text-sm">{duration(s)}</span>
                    <span className="sp-num sp-price">{price(s)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}

/** Image-forward: tall pictures with the price set on them; a typographic tile when there is no photo. */
function ServicesLookbook({ data, onBook }: P) {
  const { t, price, duration } = useSalon(data);
  return (
    <Section id="services">
      <Title>{t('site.services_title')}</Title>
      <ul className="grid grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-8 md:gap-x-6 md:gap-y-12">
        {data.services.map((s, i) => (
          <li key={s._id} className={`${i % 2 ? 'max-lg:mt-10' : ''} ${i % 3 === 1 ? 'lg:mt-16' : ''}`}>
            <button type="button" onClick={() => onBook(s._id)} aria-label={t('site.book_service', { name: s.name })} className="sp-look block w-full text-start">
              <span className="relative block overflow-hidden" style={{ borderRadius: 'var(--sp-r)' }}>
                <ServiceVisual service={s} index={i} className="aspect-[3/4] !rounded-none" />
                {price(s) && <span className="sp-look-price absolute top-2.5 end-2.5 md:top-4 md:end-4 sp-num">{price(s)}</span>}
              </span>
              <span className="sp-h block mt-3 md:mt-4 text-lg md:text-2xl">{s.name}</span>
              <span className="block mt-1 sp-muted text-sm sp-num">{duration(s)}{s.category && ` · ${s.category}`}</span>
            </button>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/** Compact chips grouped by category; the chosen one is summed up in a bar that follows the scroll. */
function ServicesChips({ data, onBook }: P) {
  const { t, groups, price } = useSalon(data);
  const [sel, setSel] = useState<PublicService | null>(null);
  return (
    <Section id="services">
      <Title>{t('site.services_title')}</Title>
      <div className="grid gap-8">
        {groups.map(g => (
          <div key={g.name}>
            {g.name && <h3 className="text-lg md:text-xl mb-3">{g.name}</h3>}
            <div className="flex flex-wrap gap-2">
              {g.services.map(s => (
                <button key={s._id} type="button" aria-pressed={sel?._id === s._id} onClick={() => setSel(sel?._id === s._id ? null : s)} className="sp-chip gap-2">
                  {s.name}{price(s) && <span className="sp-num opacity-70 text-sm">{price(s)}</span>}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="sp-chips-bar sticky bottom-3 mt-10 sp-card flex items-center gap-4 min-h-[4rem] p-3 ps-5" aria-live="polite">
        {sel ? <>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{sel.name}</p>
            <Meta service={sel} data={data} className="text-sm" />
          </div>
          <BookButton service={sel} onBook={onBook} small />
        </> : <p className="sp-muted">{t('site.choose_service')}</p>}
      </div>
    </Section>
  );
}

/** Categories listed on one side (sticky on desktop), every service on the other. */
function ServicesSplitCategories({ data, onBook }: P) {
  const { t, groups } = useSalon(data);
  const anchor = (i: number) => `services-${i}`;
  return (
    <Section id="services">
      <Title>{t('site.services_title')}</Title>
      <div className="grid md:grid-cols-[minmax(12rem,1fr)_2.6fr] gap-8 md:gap-16 items-start">
        {groups.length > 1 && (
          <nav aria-label={t('site.services_title')} className="md:sticky md:top-24">
            <ul className="sp-scroller md:flex-col gap-2 md:gap-0 -mx-5 px-5 md:mx-0 md:px-0 md:border-t sp-line">
              {groups.map((g, i) => (
                <li key={g.name}>
                  <a href={`#${anchor(i)}`} className="sp-chip md:!flex md:justify-between md:w-full md:min-h-[3.25rem] md:!px-0 md:!rounded-none md:!shadow-none md:border-b sp-line md:!text-lg">
                    <span>{g.name || t('site.other_services')}</span>
                    <span className="hidden md:inline sp-muted sp-num text-sm">{g.services.length}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
        <div className="grid gap-12 md:col-start-2">
          {groups.map((g, i) => (
            <div key={g.name} id={anchor(i)} className="scroll-mt-24">
              <h3 className="sp-ink text-2xl md:text-3xl pb-3 border-b sp-line">{g.name || t('site.other_services')}</h3>
              <ul>{g.services.map(s => <Row key={s._id} s={s} data={data} onBook={onBook} />)}</ul>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

export function ServicesSection(props: SectionProps) {
  if (!props.data.services.length) return null;
  switch (props.template.sections.services.variant) {
    case 'tabs':     return <ServicesTabs {...props} />;
    case 'menu':     return <ServicesMenu {...props} />;
    case 'list':     return <ServicesList {...props} />;
    case 'masonry':  return <ServicesMasonry {...props} />;
    case 'featured': return <ServicesFeatured {...props} />;
    case 'carousel': return <ServicesCarousel {...props} />;
    case 'accordion': return <ServicesAccordion {...props} />;
    case 'pricelist-columns': return <ServicesPricelist {...props} />;
    case 'lookbook': return <ServicesLookbook {...props} />;
    case 'chips':    return <ServicesChips {...props} />;
    case 'split-categories': return <ServicesSplitCategories {...props} />;
    default:         return <ServicesGrid3col {...props} />;
  }
}
