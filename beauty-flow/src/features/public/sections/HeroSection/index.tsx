import React, { useId, useState } from 'react';
import { SectionProps } from '../types';
import {
  Arrow, BookButton, CategoryStack, HeroCta, Icon, Meta, Monogram, ServicePeek, ServiceVisual, TodayHours,
  initials, isDark, onColor, telHref, useSalon,
} from '../kit';

type P = SectionProps;

const Logo = ({ data, className = '' }: Pick<P, 'data'> & { className?: string }) =>
  data.profile.logo ? <img src={data.profile.logo} alt="" className={`sp-logo h-12 w-auto object-contain ${className}`} /> : null;

const Banner = ({ data, className }: Pick<P, 'data'> & { className: string }) =>
  <img src={data.profile.banner} alt="" className={`w-full object-cover ${className}`} style={{ borderRadius: 'var(--sp-r)' }} />;

/** Text and photo side by side; without a photo, the menu takes the photo's place. */
function HeroSplit({ data }: P) {
  const { name, about } = useSalon(data);
  return (
    <section id="top" className="sp-section !pt-10 md:!pt-16">
      <div className="sp-wrap grid md:grid-cols-2 gap-10 md:gap-16 items-center">
        <div className="sp-rise">
          <Logo data={data} className="mb-8" />
          <h1 className="text-[clamp(2.5rem,1.4rem+4vw,4.75rem)]">{name}</h1>
          {about && <p className="mt-6 text-lg sp-muted max-w-[34rem]">{about}</p>}
          <div className="mt-9"><HeroCta data={data} /></div>
        </div>
        {data.profile.banner ? <Banner data={data} className="aspect-[4/3] md:aspect-[4/5]" /> : <ServicePeek data={data} />}
      </div>
    </section>
  );
}

/** The salon name is the visual, set as large as a poster; the photo runs below it. */
function HeroPoster({ data }: P) {
  const { name, about } = useSalon(data);
  return (
    <section id="top" className="sp-section !pt-12 md:!pt-20 !pb-0">
      <div className="sp-wrap sp-rise">
        <h1 className="text-[clamp(3.25rem,0.5rem+9.5vw,8.5rem)] !leading-[0.92] [overflow-wrap:anywhere]">{name}</h1>
        <div className="mt-10 md:mt-14 pt-6 border-t sp-line flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          {about && <p className="text-lg sp-muted max-w-[36rem]">{about}</p>}
          <HeroCta data={data} />
        </div>
      </div>
      {data.profile.banner && (
        <div className="sp-wrap mt-12 md:mt-16"><Banner data={data} className="aspect-[4/3] md:aspect-[21/9]" /></div>
      )}
    </section>
  );
}

/** Horseshoe arch window. The photo is framed by the arch; without one the arch is filled and carries the categories. */
function ArchFrame({ data, fill }: Pick<P, 'data'> & { fill: string }) {
  const id = useId().replace(/:/g, '');
  const inner = 'M10.5 400 L10.5 205 A150 150 0 1 1 289.5 205 L289.5 400 Z';
  const outer = 'M-2.4 412 L-2.4 205 A162 162 0 1 1 302.4 205 L302.4 412';
  return (
    <div className="relative w-full max-w-[26rem] mx-auto">
      <svg viewBox="-14 -14 328 428" className="w-full h-auto block" aria-hidden>
        <defs><clipPath id={id}><path d={inner} /></clipPath></defs>
        {data.profile.banner
          ? <image href={data.profile.banner} x="0" y="0" width="300" height="400" preserveAspectRatio="xMidYMid slice" clipPath={`url(#${id})`} />
          : <path d={inner} fill={fill} />}
        <path d={outer} fill="none" stroke="var(--sp-secondary)" strokeWidth="1.5" />
      </svg>
      {!data.profile.banner && (
        <CategoryStack data={data} className="absolute inset-x-[14%] bottom-[12%] top-[38%] items-center text-center" />
      )}
    </div>
  );
}

function HeroArch({ template, data }: P) {
  const { name, about } = useSalon(data);
  const { colors } = template.theme;
  const band = colors.custom?.band ?? colors.surface;
  const dark = isDark(band);
  const fill = dark ? colors.accent : colors.primary;
  const zellige = template.assets?.patterns?.includes('zellige');
  return (
    <section id="top" className={`sp-section sp-band ${dark ? 'sp-band-dark' : ''} ${zellige ? 'sp-zellige' : ''}`}>
      <div className="sp-wrap grid md:grid-cols-[1.1fr_0.9fr] gap-12 md:gap-16 items-center">
        <div className="sp-rise">
          <Logo data={data} className="mb-8" />
          <h1 className="text-[clamp(2.75rem,1.5rem+4.2vw,5.25rem)]">{name}</h1>
          {about && <p className="mt-6 text-lg sp-muted max-w-[34rem]">{about}</p>}
          <div className="mt-9"><HeroCta data={data} /></div>
        </div>
        <div style={{ color: onColor(fill) }}><ArchFrame data={data} fill={fill} /></div>
      </div>
    </section>
  );
}

/** Photo across the whole width, name set over its lower edge. */
function HeroFullbleed({ data }: P) {
  const { name, about } = useSalon(data);
  const banner = data.profile.banner;
  return (
    <section id="top" className={`relative flex items-end overflow-hidden ${banner ? 'min-h-[78svh] md:min-h-[88vh]' : 'min-h-[60svh] md:min-h-[68vh]'}`}>
      {banner && <>
        <img src={banner} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--sp-bg) 4%, color-mix(in srgb, var(--sp-bg) 62%, transparent) 46%, color-mix(in srgb, var(--sp-bg) 18%, transparent))' }} />
      </>}
      <div className="sp-wrap relative w-full pt-28 pb-12 md:pb-20 sp-rise">
        <Logo data={data} className="mb-8" />
        <h1 className="text-[clamp(3.25rem,1rem+7.5vw,7.5rem)] !leading-[0.95] max-w-[14ch] [overflow-wrap:anywhere]">{name}</h1>
        <div className="mt-10 pt-6 border-t sp-line flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          {about && <p className="text-lg sp-muted max-w-[34rem]">{about}</p>}
          <HeroCta data={data} />
        </div>
      </div>
    </section>
  );
}

/** Centered, ceremonial, lots of air; the photo follows as a wide plate. */
function HeroCentered({ data }: P) {
  const { name, about } = useSalon(data);
  return (
    <section id="top" className="sp-section">
      <div className="sp-wrap">
        <div className="sp-rise flex flex-col items-center text-center">
          <Logo data={data} className="mb-10" />
          <h1 className="text-[clamp(3rem,1.5rem+5vw,5.75rem)] max-w-[15ch]">{name}</h1>
          <span aria-hidden className="block w-16 h-px my-9" style={{ background: 'var(--sp-primary)' }} />
          {about && <p className="text-lg sp-muted max-w-[34rem]">{about}</p>}
          <div className="mt-10 flex justify-center"><HeroCta data={data} /></div>
        </div>
        {data.profile.banner && <Banner data={data} className="mt-16 md:mt-24 aspect-[4/3] md:aspect-[21/9]" />}
      </div>
    </section>
  );
}

/** Quiet and left-aligned; the photo, if any, is a low strip. */
function HeroMinimal({ data }: P) {
  const { name, about } = useSalon(data);
  return (
    <section id="top" className="sp-section !pb-0">
      <div className="sp-wrap">
        <div className="sp-rise max-w-3xl">
          <Logo data={data} className="mb-10" />
          <h1 className="text-[clamp(2.5rem,1.5rem+3.4vw,4.25rem)]">{name}</h1>
          {about && <p className="mt-5 text-lg sp-muted max-w-[40rem]">{about}</p>}
          <div className="mt-8"><HeroCta data={data} /></div>
        </div>
        {data.profile.banner
          ? <Banner data={data} className="mt-14 md:mt-20 aspect-[16/9] md:aspect-[3/1]" />
          : <div className="mt-14 md:mt-20 border-b sp-line" />}
      </div>
    </section>
  );
}

/** Magazine cover: large name over a narrow text column, tall photo offset on the side. */
function HeroMagazine({ data }: P) {
  const { name, about } = useSalon(data);
  return (
    <section id="top" className="sp-section !pt-12 md:!pt-20">
      <div className="sp-wrap grid md:grid-cols-12 gap-12 md:gap-10 items-end">
        <div className="md:col-span-7 sp-rise">
          <Logo data={data} className="mb-10" />
          <h1 className="text-[clamp(3rem,1rem+6vw,6.5rem)] !leading-[0.95]">{name}</h1>
          <div className="mt-10 flex gap-6">
            <span aria-hidden className="hidden sm:block w-12 h-px mt-3.5 shrink-0" style={{ background: 'var(--sp-ink2)' }} />
            <div>
              {about && <p className="text-lg sp-muted max-w-[30rem]">{about}</p>}
              <div className="mt-8"><HeroCta data={data} /></div>
            </div>
          </div>
        </div>
        <div className="md:col-span-5">
          {data.profile.banner
            ? <Banner data={data} className="aspect-[4/5]" />
            : <CategoryStack data={data} className="sp-tile-1 aspect-[4/5] p-8 italic" />}
        </div>
      </div>
    </section>
  );
}

/** Half photo bleeding to the edge, half a solid panel in the template's second color carrying the name. */
function HeroPanel({ template, data }: P) {
  const { name, about } = useSalon(data);
  const panel = template.theme.colors.secondary;
  const ink = onColor(panel);
  return (
    <section id="top" className="grid md:grid-cols-2 md:min-h-[82vh]">
      <div
        className="sp-rise order-1 md:order-2 flex flex-col justify-center px-5 py-14 md:px-16 md:py-20"
        style={{ background: panel, color: ink, '--sp-text': ink, '--sp-muted': `color-mix(in srgb, ${ink} 78%, ${panel})` } as React.CSSProperties}
      >
        <Logo data={data} className="mb-8" />
        <h1 className="text-[clamp(3rem,1.5rem+5vw,6rem)] !leading-[0.95] max-w-[12ch]">{name}</h1>
        {about && <p className="mt-7 text-lg sp-muted max-w-[30rem]">{about}</p>}
        <div className="mt-9"><HeroCta data={data} /></div>
      </div>
      <div className="order-2 md:order-1 relative min-h-[18rem]">
        {data.profile.banner
          ? <img src={data.profile.banner} alt="" className="absolute inset-0 w-full h-full object-cover" />
          : <div className="h-full flex items-center px-5 py-12 md:px-16 sp-surface"><ServicePeek data={data} className="w-full max-w-md md:ms-auto" /></div>}
      </div>
    </section>
  );
}

/** Photo in a tall capsule over a colored disc; the categories sit under the name as polish-chip pills. */
function HeroCapsule({ data }: P) {
  const { name, about, categories } = useSalon(data);
  const chips = ['var(--sp-primary)', 'var(--sp-secondary)', 'color-mix(in srgb, var(--sp-primary) 50%, var(--sp-secondary))'];
  return (
    <section id="top" className="sp-section !pt-10 md:!pt-16 overflow-hidden">
      <div className="sp-wrap grid md:grid-cols-[1.15fr_0.85fr] gap-12 md:gap-16 items-center">
        <div className="sp-rise">
          <Logo data={data} className="mb-8" />
          <h1 className="text-[clamp(2.75rem,1.4rem+4.4vw,5.25rem)]">{name}</h1>
          {categories.length > 0 && (
            <ul className="mt-7 flex flex-wrap gap-2" aria-hidden>
              {categories.map((c, i) => (
                <li key={c} className="inline-flex items-center gap-2 h-9 ps-2 pe-3.5 rounded-full text-sm" style={{ boxShadow: 'inset 0 0 0 1px var(--sp-line)' }}>
                  <span className="w-5 h-5 rounded-full" style={{ background: chips[i % 3] }} />{c}
                </li>
              ))}
            </ul>
          )}
          {about && data.profile.presentation && <p className="mt-7 text-lg sp-muted max-w-[34rem]">{about}</p>}
          <div className="mt-9"><HeroCta data={data} /></div>
        </div>
        <div className="relative mx-auto w-[min(100%,22rem)]">
          <span aria-hidden className="absolute -top-6 -end-10 w-44 h-44 rounded-full" style={{ background: 'color-mix(in srgb, var(--sp-secondary) 45%, var(--sp-bg))' }} />
          {data.profile.banner
            ? <img src={data.profile.banner} alt="" className="relative w-full aspect-[3/5] object-cover rounded-full" />
            : <CategoryStack data={data} className="sp-tile-0 relative aspect-[3/5] rounded-full items-center text-center px-8 pb-[22%]" />}
        </div>
      </div>
    </section>
  );
}

/** Text only: the name set huge and light across the page, the photo a thin strip running edge to edge. */
function HeroStatement({ data }: P) {
  const { name, about } = useSalon(data);
  return (
    <section id="top" className="pt-14 md:pt-24">
      <div className="sp-wrap sp-rise">
        <Logo data={data} className="mb-10" />
        <h1 className="!font-light text-[clamp(3.25rem,0.5rem+9vw,8.75rem)] !leading-[0.92] [overflow-wrap:anywhere]">{name}</h1>
        <div className="mt-12 md:mt-16 pt-6 border-t sp-line flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          {about && <p className="text-lg sp-muted max-w-[36rem]">{about}</p>}
          <HeroCta data={data} />
        </div>
      </div>
      {data.profile.banner
        ? <img src={data.profile.banner} alt="" className="mt-14 md:mt-20 w-full h-[7.5rem] md:h-[11rem] object-cover" />
        : <div className="sp-wrap"><div className="mt-14 md:mt-20 border-b sp-line" /></div>}
    </section>
  );
}

/** Collage: the banner as the tall tile, up to three service photos around it; typographic tiles fill the gaps. */
function HeroMosaic({ data }: P) {
  const { name, about } = useSalon(data);
  // Photos first; typographic tiles take one service per category so they don't repeat.
  const seen = new Set<string>();
  const picks = [
    ...data.services.filter(s => s.images?.length),
    ...data.services.filter(s => !s.images?.length && !seen.has(s.category) && !!seen.add(s.category)),
  ].slice(0, 3);
  const cells = ['row-span-2', '', '', 'row-span-2'];
  return (
    <section id="top" className="sp-section !pt-10 md:!pt-16">
      <div className="sp-wrap grid md:grid-cols-12 gap-10 md:gap-12 items-center">
        <div className="md:col-span-5 sp-rise">
          <Logo data={data} className="mb-8" />
          <h1 className="text-[clamp(2.75rem,1.4rem+4.4vw,5.5rem)] !leading-[0.95]">{name}</h1>
          {about && <p className="mt-6 text-lg sp-muted max-w-[34rem]">{about}</p>}
          <div className="mt-9"><HeroCta data={data} /></div>
        </div>
        <div className="md:col-span-7 grid grid-cols-2 grid-rows-3 grid-flow-col gap-3 md:gap-4 aspect-[4/5] sm:aspect-[5/4]">
          <div className={cells[0]}>
            {data.profile.banner
              ? <Banner data={data} className="h-full" />
              : <div aria-hidden className="sp-tile sp-tile-1 h-full" style={{ borderRadius: 'var(--sp-r)' }}><span className="sp-h !text-[clamp(3rem,2rem+4vw,6rem)]">{initials(name)}</span></div>}
          </div>
          {[0, 1, 2].map(i => (
            <div key={i} className={cells[i + 1]}>
              {picks[i]
                ? <ServiceVisual service={picks[i]} index={i} className="h-full" />
                : <div aria-hidden className={`sp-tile sp-tile-${(i + 2) % 3} h-full`} style={{ borderRadius: 'var(--sp-r)' }} />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** The salon name runs as a slow band across the page (still under reduced motion). */
function HeroMarquee({ data }: P) {
  const { name, about } = useSalon(data);
  const run = Array.from({ length: 4 }, () => name);
  return (
    <section id="top" className="sp-section !pt-8 md:!pt-14 overflow-hidden">
      <h1 className="sr-only">{name}</h1>
      <div className="sp-ticker-wrap sp-marquee-wrap overflow-hidden border-y sp-line py-5 md:py-8" aria-hidden>
        <div className="sp-ticker sp-marquee">
          {[...run, ...run].map((n, i) => (
            <span key={i} className="sp-h flex items-center gap-[0.45em] pe-[0.45em] text-[clamp(4rem,2rem+8vw,9.5rem)] !leading-[1] whitespace-nowrap">
              {n}<span className="sp-marquee-mark" />
            </span>
          ))}
        </div>
      </div>
      <div className="sp-wrap mt-10 md:mt-14 flex flex-col md:flex-row md:items-end md:justify-between gap-8 sp-rise">
        {about && <p className="text-lg sp-muted max-w-[36rem]">{about}</p>}
        <HeroCta data={data} />
      </div>
      {data.profile.banner && <div className="sp-wrap mt-12 md:mt-16"><Banner data={data} className="aspect-[4/3] md:aspect-[21/9]" /></div>}
    </section>
  );
}

/** The photo set in a thick colored passe-partout; the name is lettered on the mat below it. */
function HeroFrame({ template, data }: P) {
  const { name, about } = useSalon(data);
  const mat = template.theme.colors.custom?.band ?? template.theme.colors.primary;
  const ink = onColor(mat);
  return (
    <section
      id="top"
      className="sp-mat px-[clamp(0.875rem,3.5vw,3.5rem)] pt-[clamp(0.875rem,3.5vw,3.5rem)] pb-12 md:pb-16"
      style={{ background: mat, color: ink, '--sp-text': ink, '--sp-muted': `color-mix(in srgb, ${ink} 80%, ${mat})`, '--sp-mat': mat } as React.CSSProperties}
    >
      <div className="max-w-[90rem] mx-auto">
        <div className="sp-mat-window aspect-[4/5] sm:aspect-[16/10] md:aspect-[2/1] overflow-hidden">
          {data.profile.banner
            ? <img src={data.profile.banner} alt="" className="w-full h-full object-cover" />
            : <CategoryStack data={data} className="h-full p-6 md:p-12 italic" />}
        </div>
        <div className="mt-8 md:mt-12 flex flex-col md:flex-row md:items-end md:justify-between gap-8 sp-rise">
          <div>
            <Logo data={data} className="mb-6" />
            <h1 className="text-[clamp(2.5rem,1.4rem+4.5vw,5.5rem)] !leading-[0.95]">{name}</h1>
            {about && <p className="mt-5 text-lg sp-muted max-w-[36rem]">{about}</p>}
          </div>
          <HeroCta data={data} />
        </div>
      </div>
    </section>
  );
}

/** The name set vertically along the edge; the photo fills the rest, the text follows below it. */
function HeroVertical({ data }: P) {
  const { name, about } = useSalon(data);
  return (
    <section id="top" className="grid grid-cols-[auto_1fr] border-b sp-line">
      <div className="flex items-end justify-center px-2.5 md:px-8 py-6 md:py-10 border-e sp-line">
        <h1 className="sp-vertical text-[clamp(2.75rem,1.5rem+6vw,8rem)] !leading-[0.9] max-h-[82svh]">{name}</h1>
      </div>
      <div className="flex flex-col min-w-0">
        <div className="relative min-h-[58svh] md:min-h-[72vh]">
          {data.profile.banner
            ? <img src={data.profile.banner} alt="" className="absolute inset-0 w-full h-full object-cover" />
            : <CategoryStack data={data} className="sp-tile-0 absolute inset-0 p-6 md:p-12" />}
        </div>
        <div className="px-5 md:px-12 py-8 md:py-12 flex flex-col md:flex-row md:items-end md:justify-between gap-7 sp-rise">
          <div>
            <Logo data={data} className="mb-6" />
            {about && <p className="text-lg sp-muted max-w-[34rem]">{about}</p>}
          </div>
          <HeroCta data={data} />
        </div>
      </div>
    </section>
  );
}

/** Cinematic 2.39:1 banner, the name below it in large type. */
function HeroLetterbox({ data }: P) {
  const { name, about, categories } = useSalon(data);
  return (
    <section id="top" className="sp-section !pt-0">
      {data.profile.banner
        ? <img src={data.profile.banner} alt="" className="w-full aspect-[16/9] md:aspect-[2.39/1] object-cover" />
        : categories.length > 0 && (
          <div aria-hidden className="sp-tile-0 w-full aspect-[16/9] md:aspect-[2.39/1] flex items-center justify-center px-6">
            <span className="sp-h italic text-center text-[clamp(1.5rem,1rem+2.5vw,3.25rem)] max-w-[24ch]">{categories.join(' · ')}</span>
          </div>
        )}
      <div className="sp-wrap mt-10 md:mt-16 grid md:grid-cols-[1.4fr_1fr] gap-8 md:gap-16 md:items-end sp-rise">
        <div>
          <Logo data={data} className="mb-6" />
          <h1 className="text-[clamp(3rem,1.2rem+6vw,7rem)] !leading-[0.92] [overflow-wrap:anywhere]">{name}</h1>
        </div>
        <div>
          {about && <p className="text-lg sp-muted max-w-[34rem] mb-8">{about}</p>}
          <HeroCta data={data} />
        </div>
      </div>
    </section>
  );
}

/** The hero is the booking: pick a category, then one of its first three services. */
function HeroBooking({ data, onBook }: P) {
  const { t, name, about, phone, categories } = useSalon(data);
  const [cat, setCat] = useState(categories[0] ?? '');
  const shown = (cat ? data.services.filter(s => s.category === cat) : data.services).slice(0, 3);
  return (
    <section id="top" className="sp-section !pt-10 md:!pt-16">
      <div className="sp-wrap grid md:grid-cols-[1fr_1.1fr] gap-10 md:gap-16 items-start [&>*]:min-w-0">
        <div className="sp-rise">
          <Logo data={data} className="mb-8" />
          <h1 className="text-[clamp(2.5rem,1.4rem+3.8vw,4.75rem)]">{name}</h1>
          {about && <p className="mt-5 text-lg sp-muted max-w-[34rem]">{about}</p>}
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 sp-muted">
            <TodayHours data={data} />
            {phone && <a href={telHref(phone)} className="sp-num hover:underline underline-offset-4">{phone}</a>}
          </div>
          {data.profile.banner && <Banner data={data} className="hidden md:block mt-10 aspect-[16/10]" />}
        </div>
        {data.services.length > 0 && (
          <div className="sp-card p-5 md:p-8">
            {categories.length > 1 && (
              <div role="tablist" aria-label={t('site.services_title')} className="sp-scroller gap-2 -mx-5 px-5 md:-mx-8 md:px-8 mb-2">
                {categories.map(c => (
                  <button key={c} type="button" role="tab" aria-selected={cat === c} onClick={() => setCat(c)} className="sp-chip">{c}</button>
                ))}
              </div>
            )}
            <ul role="tabpanel">
              {shown.map(s => (
                <li key={s._id} className="flex items-center gap-4 py-4 border-b sp-line">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg md:text-xl !leading-snug">{s.name}</h2>
                    <Meta service={s} data={data} className="block mt-1 text-[0.95rem]" />
                  </div>
                  <BookButton service={s} onBook={onBook} small />
                </li>
              ))}
            </ul>
            <a href="#services" className="sp-link inline-flex items-center gap-2 mt-5">{t('site.all_services')} <Arrow /></a>
          </div>
        )}
      </div>
    </section>
  );
}

/** The neighbourhood salon: the address is the visual (street, then city), with today's hours and the way there. */
function HeroAddress(props: P) {
  const { data } = props;
  const { t, name, about, address, mapsUrl, phone, today } = useSalon(data);
  if (!address) return <HeroMinimal {...props} />;
  const cut = address.lastIndexOf(',');
  const [street, city] = cut > 0 ? [address.slice(0, cut), address.slice(cut + 1).trim()] : [address, ''];
  const banner = data.profile.banner;
  return (
    <section id="top" className="sp-section !pt-10 md:!pt-16">
      <div className="sp-wrap grid md:grid-cols-12 gap-10 md:gap-14 items-end">
        <div className={`sp-rise ${banner ? 'md:col-span-8' : 'md:col-span-12'}`}>
          <div className="flex items-center gap-4">
            <Logo data={data} className="!h-10" />
            <h1 className="text-[clamp(1.5rem,1.2rem+1.2vw,2.25rem)]">{name}</h1>
          </div>
          {about && <p className="mt-3 sp-muted max-w-[38rem]">{about}</p>}
          <address className="not-italic block mt-10 md:mt-14 pt-6 border-t sp-line">
            <span className="sr-only">{t('site.address')} : </span>
            <span className="sp-h block text-[clamp(2.5rem,1.2rem+5.5vw,6.5rem)] !leading-[0.95] [overflow-wrap:anywhere]">{street}</span>
            {city && <span className="sp-h block sp-ink mt-3 text-[clamp(1.5rem,1rem+2.4vw,3.25rem)] !leading-none">{city}</span>}
          </address>
          {today && (
            <p className="mt-8 inline-flex items-center gap-2.5 text-lg">
              <Icon name="clock" size={22} className="sp-ink" /><TodayHours data={data} />
            </p>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="sp-btn"><Icon name="pin" size={18} />{t('site.directions')}</a>
            {phone && <a href={telHref(phone)} className="sp-btn sp-btn-ghost"><Icon name="phone" size={18} />{t('site.call')}</a>}
            {data.services.length > 0 && <a href="#services" className="sp-link self-center inline-flex items-center gap-2 min-h-[46px] ms-1">{t('site.book')} <Arrow /></a>}
          </div>
        </div>
        {banner && (
          <div className="md:col-span-4 p-2.5 md:p-3 border sp-line" style={{ borderRadius: 'var(--sp-r)' }}>
            <img src={banner} alt="" className="w-full aspect-[4/3] md:aspect-[3/4] object-cover" style={{ borderRadius: 'calc(var(--sp-r) * 0.6)' }} />
          </div>
        )}
      </div>
    </section>
  );
}

/** Logo-led: the logo (or a monogram of the initials) large, the name quiet under it, lots of air. */
function HeroSignature({ data }: P) {
  const { name, about } = useSalon(data);
  return (
    <section id="top" className="py-[calc(var(--sp-py)*1.1)] md:py-[calc(var(--sp-py)*1.5)]">
      <div className="sp-wrap flex flex-col items-center text-center sp-rise">
        <Monogram data={data} className="h-28 md:h-40 w-auto max-w-[80vw] text-[clamp(5.5rem,3rem+8vw,10rem)] !leading-none sp-ink" />
        <h1 className="mt-10 md:mt-12 text-[clamp(1.5rem,1.2rem+1.2vw,2.25rem)]">{name}</h1>
        {about && <p className="mt-4 sp-muted max-w-[34rem]">{about}</p>}
        <div className="mt-10 flex justify-center"><HeroCta data={data} /></div>
      </div>
    </section>
  );
}

export function HeroSection(props: SectionProps) {
  switch (props.template.sections.hero.variant) {
    case 'split':     return <HeroSplit {...props} />;
    case 'poster':    return <HeroPoster {...props} />;
    case 'arch':      return <HeroArch {...props} />;
    case 'fullbleed': return <HeroFullbleed {...props} />;
    case 'minimal':   return <HeroMinimal {...props} />;
    case 'magazine':  return <HeroMagazine {...props} />;
    case 'panel':     return <HeroPanel {...props} />;
    case 'capsule':   return <HeroCapsule {...props} />;
    case 'statement': return <HeroStatement {...props} />;
    case 'mosaic':    return <HeroMosaic {...props} />;
    case 'marquee':   return <HeroMarquee {...props} />;
    case 'frame':     return <HeroFrame {...props} />;
    case 'vertical':  return <HeroVertical {...props} />;
    case 'letterbox': return <HeroLetterbox {...props} />;
    case 'booking':   return <HeroBooking {...props} />;
    case 'address':   return <HeroAddress {...props} />;
    case 'signature': return <HeroSignature {...props} />;
    default:          return <HeroCentered {...props} />;
  }
}
