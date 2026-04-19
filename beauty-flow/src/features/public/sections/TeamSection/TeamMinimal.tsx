import { SectionProps } from '../types';
import { PublicTeamMember } from '../../types';

function MemberAvatar({ member }: { member: PublicTeamMember }) {
  if (member.avatar) {
    return (
      <img
        src={member.avatar}
        alt=""
        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
      />
    );
  }
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
      style={{ background: member.color || '#6366F1' }}
    >
      {member.firstName[0]}{member.lastName[0]}
    </div>
  );
}

export function TeamMinimal({ template, data }: SectionProps) {
  const { colors } = template.theme;

  if (!data.team || data.team.length === 0) return null;

  return (
    <section id="team" style={{ background: colors.background }} className="px-6 py-10 md:px-12">
      <div className="max-w-3xl mx-auto">
        {/* Minimal header — just a label */}
        <div
          className="flex items-center gap-3 mb-5"
          style={{ borderBottom: `1px solid ${colors.primary}18`, paddingBottom: '0.75rem' }}
        >
          <span
            style={{ background: colors.primary, borderRadius: '9999px' }}
            className="w-1.5 h-1.5 flex-shrink-0"
          />
          <h2
            style={{ color: colors.textSecondary }}
            className="text-xs font-bold uppercase tracking-widest"
          >
            Notre équipe
          </h2>
        </div>

        {/* Compact member list */}
        <div className="flex flex-wrap gap-3">
          {data.team.map(member => (
            <div
              key={member._id}
              className="flex items-center gap-2.5"
              style={{
                background: `${colors.primary}08`,
                borderRadius: template.theme.layout.borderRadius.md,
                padding: '0.5rem 0.75rem',
                border: `1px solid ${colors.primary}12`,
              }}
            >
              <MemberAvatar member={member} />
              <div>
                <p
                  style={{ color: colors.text, fontFamily: template.theme.typography.headingFont }}
                  className="text-sm font-semibold leading-none"
                >
                  {member.firstName} {member.lastName}
                </p>
                <p style={{ color: colors.textSecondary }} className="text-xs mt-0.5 leading-none">
                  {member.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
