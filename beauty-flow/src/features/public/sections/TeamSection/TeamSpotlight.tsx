import { useState } from 'react';
import { SectionProps } from '../types';
import { PublicTeamMember } from '../../types';

function MemberAvatar({ member, size }: { member: PublicTeamMember; size: string }) {
  if (member.avatar) {
    return (
      <img
        src={member.avatar}
        alt={`${member.firstName} ${member.lastName}`}
        className={`${size} rounded-full object-cover`}
      />
    );
  }
  return (
    <div
      className={`${size} rounded-full flex items-center justify-center font-bold text-white text-3xl flex-shrink-0`}
      style={{ background: member.color || '#6366F1' }}
    >
      {member.firstName[0]}{member.lastName[0]}
    </div>
  );
}

export function TeamSpotlight({ template, data }: SectionProps) {
  const { colors } = template.theme;
  const { shadows } = template.theme.effects;
  const { borderRadius } = template.theme.layout;
  const [activeIndex, setActiveIndex] = useState(0);
  const active = data.team[activeIndex] as PublicTeamMember | undefined;

  if (!data.team || data.team.length === 0) return null;

  return (
    <section id="team" style={{ background: colors.surface }} className="px-6 py-14 md:px-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <p style={{ color: colors.primary }} className="text-xs font-bold uppercase tracking-widest mb-2">
            Notre équipe
          </p>
          <h2
            style={{ color: colors.text, fontFamily: template.theme.typography.headingFont }}
            className="text-3xl font-extrabold"
          >
            Des experts passionnés
          </h2>
        </div>

        {/* Spotlight card */}
        {active && (
          <div
            key={active._id}
            style={{
              background: colors.background,
              borderRadius: borderRadius.xl || borderRadius.lg,
              boxShadow: shadows?.lg || '0 8px 24px rgba(0,0,0,0.10)',
              border: `1px solid ${colors.primary}18`,
            }}
            className="flex flex-col md:flex-row items-center gap-8 p-8 mb-8 transition-all duration-300"
          >
            {/* Large avatar */}
            <div className="flex-shrink-0">
              <div
                style={{
                  padding: '4px',
                  borderRadius: '9999px',
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent || colors.secondary || colors.primary}80)`,
                }}
              >
                <MemberAvatar member={active} size="w-32 h-32" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h3
                style={{ color: colors.text, fontFamily: template.theme.typography.headingFont }}
                className="text-2xl font-extrabold leading-tight"
              >
                {active.firstName} {active.lastName}
              </h3>
              <p
                style={{ color: colors.primary }}
                className="font-semibold text-base mt-1"
              >
                {active.role}
              </p>

              {active.specialties && active.specialties.length > 0 && (
                <div className="flex gap-2 flex-wrap justify-center md:justify-start mt-4">
                  {active.specialties.map(s => (
                    <span
                      key={s}
                      style={{
                        background: `${colors.primary}15`,
                        color: colors.textSecondary,
                        borderRadius: borderRadius.full || '9999px',
                        border: `1px solid ${colors.primary}20`,
                      }}
                      className="text-xs px-3 py-1 font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}

              {/* Member counter */}
              <p style={{ color: colors.textSecondary }} className="text-xs mt-4">
                {activeIndex + 1} / {data.team.length}
              </p>
            </div>
          </div>
        )}

        {/* Thumbnail selector */}
        <div className="flex justify-center gap-3 flex-wrap">
          {data.team.map((m, i) => (
            <button
              key={m._id}
              onClick={() => setActiveIndex(i)}
              className="focus:outline-none transition-transform duration-200 hover:scale-110 active:scale-95"
              aria-label={`Voir ${m.firstName} ${m.lastName}`}
              style={{
                padding: '2px',
                borderRadius: '9999px',
                background: i === activeIndex
                  ? `linear-gradient(135deg, ${colors.primary}, ${colors.accent || colors.primary}80)`
                  : 'transparent',
                opacity: i === activeIndex ? 1 : 0.5,
              }}
            >
              <MemberAvatar member={m} size="w-10 h-10" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
