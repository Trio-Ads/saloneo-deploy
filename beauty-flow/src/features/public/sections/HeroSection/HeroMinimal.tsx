import { SectionProps } from '../types';

/**
 * HeroMinimal — Compact header-style hero, maximum restraint.
 * Design intent: Swiss typographic precision — every pixel earns its place.
 * Key details: flush border-bottom as sole decoration, tight grid,
 * monospaced service count, clean left/right split with breathing room.
 */
export function HeroMinimal({ template, data, onBook }: SectionProps) {
  const { colors, typography, layout } = template.theme;
  const { profile, services } = data;
  const firstServiceId = services[0]?._id ?? '';

  return (
    <section
      className="w-full"
      style={{
        background: colors.background,
        borderBottom: `1px solid ${colors.surface}`,
      }}
    >
      <div
        className="mx-auto px-6 md:px-10 py-8 md:py-10"
        style={{ maxWidth: layout.containers.maxWidth }}
      >
        <div className="flex items-center justify-between gap-6 flex-wrap">
          {/* Left: identity */}
          <div className="flex items-center gap-5 min-w-0">
            {profile.logo && (
              <img
                src={profile.logo}
                alt={profile.establishmentName}
                className="h-9 w-auto object-contain flex-shrink-0"
              />
            )}
            <div className="min-w-0">
              <h1
                className="font-bold truncate"
                style={{
                  color: colors.text,
                  fontFamily: typography.headingFont,
                  fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.15,
                }}
              >
                {profile.establishmentName}
              </h1>
              {profile.description && (
                <p
                  className="text-xs mt-0.5 truncate max-w-xs"
                  style={{ color: colors.textSecondary }}
                >
                  {profile.description}
                </p>
              )}
            </div>
          </div>

          {/* Right: meta + CTA */}
          <div className="flex items-center gap-5 flex-shrink-0">
            {/* Service count — monospaced accent */}
            {services.length > 0 && (
              <div className="hidden sm:flex flex-col items-end">
                <span
                  className="text-xl font-bold tabular-nums"
                  style={{ color: colors.primary, fontFamily: 'ui-monospace, monospace' }}
                >
                  {String(services.length).padStart(2, '0')}
                </span>
                <span className="text-[10px] uppercase tracking-widest" style={{ color: colors.textSecondary }}>
                  services
                </span>
              </div>
            )}

            {/* Thin separator */}
            <div className="hidden sm:block h-8 w-px" style={{ background: colors.surface }} />

            {/* CTA */}
            <button
              onClick={() => onBook(firstServiceId)}
              className="group inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: colors.primary,
                color: '#fff',
                letterSpacing: '0.08em',
              }}
            >
              Réserver
              <svg className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        </div>

        {/* Bottom micro-strip: address */}
        {profile.address && (
          <p
            className="mt-3 text-[11px] pt-3 border-t"
            style={{ color: colors.textSecondary, borderColor: colors.surface, opacity: 0.7 }}
          >
            {profile.address}
          </p>
        )}
      </div>
    </section>
  );
}
