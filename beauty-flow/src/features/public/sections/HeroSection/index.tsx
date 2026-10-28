import React, { useId } from 'react';
import { SectionProps } from '../types';
import { CategoryStack, HeroCta, ServicePeek, isDark, onColor, useSalon } from '../kit';

type P = SectionProps;

const Logo = ({ data, className = '' }: Pick<P, 'data'> & { className?: string }) =>
  data.profile.logo ? <img src={data.profile.logo} alt="" className={`h-12 w-auto object-contain ${className}`} /> : null;

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
    default:          return <HeroCentered {...props} />;
  }
}
