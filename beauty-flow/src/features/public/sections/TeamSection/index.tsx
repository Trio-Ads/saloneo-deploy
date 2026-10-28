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

export function TeamSection(props: SectionProps) {
  const { t } = useSalon(props.data);
  const body = (() => {
    switch (props.template.sections.team.variant) {
      case 'portraits': return <TeamPortraits {...props} />;
      case 'minimal':   return <TeamMinimal {...props} />;
      case 'h-scroll':  return <TeamHScroll {...props} />;
      case 'spotlight': return <TeamSpotlight {...props} />;
      default:          return <TeamCards {...props} />;
    }
  })();
  return (
    <Section id="team">
      <Title>{t('site.team_title')}</Title>
      {body}
    </Section>
  );
}
