import { SectionProps } from '../types';
import { MemberAvatar } from './MemberAvatar';

export function TeamCards({ template, data }: SectionProps) {
  const { colors } = template.theme;
  const { shadows } = template.theme.effects;
  const { borderRadius } = template.theme.layout;

  if (!data.team || data.team.length === 0) return null;

  return (
    <section id="team" style={{ background: colors.surface }} className="px-6 py-14 md:px-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <p
            style={{ color: colors.primary }}
            className="text-xs font-bold uppercase tracking-widest mb-2"
          >
            Notre équipe
          </p>
          <h2
            style={{ color: colors.text, fontFamily: template.theme.typography.headingFont }}
            className="text-3xl font-extrabold leading-tight"
          >
            Des experts passionnés
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {data.team.map(member => (
            <div
              key={member._id}
              style={{
                background: colors.background,
                borderRadius: borderRadius.lg,
                boxShadow: shadows?.sm || '0 1px 4px rgba(0,0,0,0.08)',
                border: `1px solid ${colors.primary}14`,
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
              }}
              className="p-6 flex flex-col items-center text-center group hover:scale-[1.03] hover:shadow-md cursor-default"
            >
              {/* Ring accent on hover */}
              <div
                style={{ borderColor: `${colors.primary}30` }}
                className="rounded-full p-0.5 mb-3 border-2 border-transparent group-hover:border-current transition-colors duration-300"
              >
                <MemberAvatar member={member} size="lg" />
              </div>

              <p
                style={{ color: colors.text, fontFamily: template.theme.typography.headingFont }}
                className="font-bold text-sm leading-snug"
              >
                {member.firstName} {member.lastName}
              </p>
              <p style={{ color: colors.primary }} className="text-xs font-medium mt-0.5">
                {member.role}
              </p>

              {/* Specialties */}
              {member.specialties && member.specialties.length > 0 && (
                <div className="flex flex-wrap gap-1 justify-center mt-3">
                  {member.specialties.slice(0, 2).map(s => (
                    <span
                      key={s}
                      style={{ background: `${colors.primary}12`, color: colors.textSecondary }}
                      className="text-xs px-2 py-0.5 rounded-full"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
