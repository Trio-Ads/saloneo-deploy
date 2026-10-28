import { SectionProps } from '../types';
import { PublicTeamMember } from '../../types';
import { Avatar, Section, Title, useSalon } from '../kit';

type P = SectionProps;

const Who = ({ m, size = 'text-xl' }: { m: PublicTeamMember; size?: string }) => (
  <div className="min-w-0">
    <h3 className={size}>{m.firstName} {m.lastName}</h3>
    {m.role && <p className="sp-muted mt-1">{m.role}</p>}
    {!!m.specialties?.length && <p className="sp-muted text-sm mt-1">{m.specialties.join(' · ')}</p>}
  </div>
);

function TeamCards({ data }: P) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {data.team.map(m => (
        <article key={m._id} className="sp-card p-6 flex items-center gap-5">
          <Avatar member={m} className="w-16 text-xl" />
          <Who m={m} />
        </article>
      ))}
    </div>
  );
}

/** Tall portrait frames; without a photo the initials are set like a monogram. */
function TeamPortraits({ data }: P) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-10 md:gap-x-8">
      {data.team.map(m => (
        <article key={m._id}>
          <Avatar member={m} className="w-full !aspect-[3/4] text-[clamp(3rem,2rem+4vw,6rem)]" />
          <div className="mt-4"><Who m={m} size="text-xl md:text-2xl" /></div>
        </article>
      ))}
    </div>
  );
}

function TeamMinimal({ data }: P) {
  return (
    <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-7">
      {data.team.map(m => (
        <li key={m._id} className="flex items-center gap-4">
          <Avatar member={m} className="w-12 text-base" />
          <Who m={m} size="text-lg" />
        </li>
      ))}
    </ul>
  );
}

function TeamHScroll({ data }: P) {
  return (
    <div className="sp-scroller gap-5 -mx-5 px-5 md:mx-0 md:px-0">
      {data.team.map(m => (
        <article key={m._id} className="w-[68%] sm:w-[40%] lg:w-[calc((100%-3.75rem)/4)]">
          <Avatar member={m} className="w-full text-5xl !rounded-[var(--sp-r)]" />
          <div className="mt-4"><Who m={m} /></div>
        </article>
      ))}
    </div>
  );
}

/** The first member in the spotlight, the others alongside. */
function TeamSpotlight({ data }: P) {
  const [lead, ...rest] = data.team;
  return (
    <div className="grid md:grid-cols-12 gap-12 items-center">
      <div className="md:col-span-7 flex flex-col sm:flex-row sm:items-center gap-8">
        <Avatar member={lead} className="w-40 md:w-56 text-5xl md:text-6xl" />
        <Who m={lead} size="text-3xl md:text-4xl" />
      </div>
      {rest.length > 0 && (
        <ul className="md:col-span-5 border-t sp-line">
          {rest.map(m => (
            <li key={m._id} className="flex items-center gap-4 py-5 border-b sp-line">
              <Avatar member={m} className="w-14 text-lg" />
              <Who m={m} size="text-lg" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Instant-print frames, each one slightly askew. */
function TeamPolaroid({ data }: P) {
  const tilt = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2'];
  return (
    <ul className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-8 md:gap-y-12 pt-2">
      {data.team.map((m, i) => (
        <li key={m._id} className={`sp-polaroid ${tilt[i % 4]}`}>
          <Avatar member={m} className="w-full !rounded-none text-[clamp(2.5rem,1.8rem+3vw,4.5rem)]" />
          <div className="pt-3.5 px-1"><Who m={m} size="text-lg md:text-xl" /></div>
        </li>
      ))}
    </ul>
  );
}

/** A ruled roster: name, role and specialties side by side. */
function TeamList({ data }: P) {
  return (
    <ul className="border-t sp-line">
      {data.team.map(m => (
        <li key={m._id} className="grid grid-cols-[auto_1fr] md:grid-cols-[auto_1.2fr_1fr_1.4fr] md:items-center gap-x-5 gap-y-1 py-5 border-b sp-line">
          <Avatar member={m} className="w-12 md:w-14 text-base row-span-3 md:row-span-1" />
          <h3 className="text-xl md:text-2xl">{m.firstName} {m.lastName}</h3>
          <p className="sp-muted">{m.role}</p>
          <p className="sp-muted text-[0.95rem]">{m.specialties?.join(' · ')}</p>
        </li>
      ))}
    </ul>
  );
}

/** Portraits drifting slowly across the page (a scrollable row under reduced motion). */
function TeamMarqueePortraits({ data }: P) {
  const run: PublicTeamMember[] = [];
  while (run.length < 6) run.push(...data.team);
  return (
    <div className="sp-ticker-wrap overflow-hidden relative left-1/2 w-screen -translate-x-1/2">
      <ul className="sp-ticker sp-marquee">
        {[...run, ...run].map((m, i) => (
          <li key={i} aria-hidden={i >= data.team.length || undefined} className="w-[12.5rem] md:w-[17rem] shrink-0 ps-5 md:ps-8">
            <Avatar member={m} className="w-full !aspect-[3/4] !rounded-[var(--sp-r)] text-6xl" />
            <div className="mt-4"><Who m={m} size="text-lg md:text-xl" /></div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TeamSection(props: SectionProps) {
  const { t } = useSalon(props.data);
  const body = (() => {
    switch (props.template.sections.team.variant) {
      case 'portraits': return <TeamPortraits {...props} />;
      case 'minimal':   return <TeamMinimal {...props} />;
      case 'h-scroll':  return <TeamHScroll {...props} />;
      case 'spotlight': return <TeamSpotlight {...props} />;
      case 'polaroid':  return <TeamPolaroid {...props} />;
      case 'list':      return <TeamList {...props} />;
      case 'marquee-portraits': return <TeamMarqueePortraits {...props} />;
      default:          return <TeamCards {...props} />;
    }
  })();
  return (
    <Section id="team" className={props.template.sections.team.variant === 'marquee-portraits' ? 'overflow-x-clip' : ''}>
      <Title>{t('site.team_title')}</Title>
      {body}
    </Section>
  );
}
