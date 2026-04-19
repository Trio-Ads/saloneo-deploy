import { SectionProps } from '../types';
import { PublicTeamMember } from '../../types';

function MemberAvatar({ member }: { member: PublicTeamMember }) {
  if (member.avatar) {
    return (
      <img
        src={member.avatar}
        alt={`${member.firstName} ${member.lastName}`}
        className="w-14 h-14 rounded-full object-cover"
      />
    );
  }
  return (
    <div
      className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-white text-lg flex-shrink-0"
      style={{ background: member.color || '#6366F1' }}
    >
      {member.firstName[0]}{member.lastName[0]}
    </div>
  );
}

export function TeamHScroll({ template, data }: SectionProps) {
  const { colors } = template.theme;
  const { borderRadius } = template.theme.layout;

  if (!data.team || data.team.length === 0) return null;

  return (
    <section id="team" style={{ background: colors.background }} className="py-12">
      {/* Section header */}
      <div className="px-6 md:px-12 mb-6 flex items-baseline justify-between">
        <div>
          <p style={{ color: colors.primary }} className="text-xs font-bold uppercase tracking-widest mb-1">
            Notre équipe
          </p>
          <h2
            style={{ color: colors.text, fontFamily: template.theme.typography.headingFont }}
            className="text-2xl font-extrabold"
          >
            {data.team.length} expert{data.team.length > 1 ? 's' : ''} à votre service
          </h2>
        </div>
        {/* Scroll hint */}
        <span style={{ color: colors.textSecondary }} className="hidden md:flex items-center gap-1 text-xs">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
          Défiler
        </span>
      </div>

      {/* Horizontal scroll track */}
      <div
        className="flex gap-4 overflow-x-auto px-6 md:px-12 pb-3 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
      >
        {data.team.map(member => (
          <div
            key={member._id}
            className="flex-shrink-0 snap-start flex flex-col items-center text-center"
            style={{ width: '5.5rem' }}
          >
            {/* Avatar with subtle ring */}
            <div
              style={{
                borderRadius: borderRadius.full || '9999px',
                padding: '2px',
                background: `linear-gradient(135deg, ${colors.primary}50, ${colors.secondary || colors.accent || colors.primary}30)`,
              }}
            >
              <MemberAvatar member={member} />
            </div>

            <p
              style={{ color: colors.text, fontFamily: template.theme.typography.headingFont }}
              className="font-bold text-xs mt-2 leading-tight"
            >
              {member.firstName}
            </p>
            <p style={{ color: colors.textSecondary }} className="text-xs leading-tight mt-0.5 line-clamp-1">
              {member.role}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
