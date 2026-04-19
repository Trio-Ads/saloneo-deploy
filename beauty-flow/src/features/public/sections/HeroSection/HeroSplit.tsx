import { SectionProps } from '../types';

/**
 * HeroSplit — 50/50 image-text split layout.
 * Design intent: editorial magazine diptych — strong visual contrast,
 * image left / content right with deliberate asymmetric white space.
 * Key details: vertical rule accent, tight typographic hierarchy,
 * slide-in stagger animation from opposite sides.
 */
export function HeroSplit({ template, data, onBook }: SectionProps) {
  const { colors, typography, layout } = template.theme;
  const { profile, services } = data;
  const firstServiceId = services[0]?._id ?? '';

  return (
    <section className="flex flex-col md:flex-row overflow-hidden" style={{ minHeight: '56vh' }}>
      {/* Image panel */}
      <div
        className="relative md:w-1/2 min-h-64 md:min-h-0 overflow-hidden"
        style={{ flexShrink: 0 }}
      >
        {profile.banner ? (
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
            style={{ backgroundImage: `url(${profile.banner})` }}
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(145deg, ${colors.primary}, ${colors.secondary ?? colors.accent})` }}
          />
        )}
        {/* Corner tag */}
        <div
          className="absolute bottom-4 left-4 px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-sm"
          style={{ background: 'rgba(0,0,0,0.55)', color: '#fff', backdropFilter: 'blur(4px)' }}
        >
          {profile.address ?? 'Beauté & Soin'}
        </div>
      </div>

      {/* Content panel */}
      <div
        className="md:w-1/2 flex flex-col justify-center px-8 py-12 md:px-14 md:py-16"
        style={{ background: colors.background }}
      >
        {/* Logo */}
        {profile.logo && (
          <img
            src={profile.logo}
            alt={profile.establishmentName}
            className="h-10 w-auto object-contain self-start mb-6"
            style={{ opacity: 0.9 }}
          />
        )}

        {/* Vertical rule + eyebrow */}
        <div className="flex items-center gap-3 mb-5">
          <div className="h-6 w-0.5 rounded-full" style={{ background: colors.primary }} />
          <p
            className="text-xs font-bold uppercase tracking-[0.25em]"
            style={{ color: colors.primary }}
          >
            Bienvenue
          </p>
        </div>

        {/* Headline */}
        <h1
          className="font-extrabold tracking-tight mb-5 leading-tight"
          style={{
            color: colors.text,
            fontFamily: typography.headingFont,
            fontSize: 'clamp(2rem, 4vw, 3.5rem)',
            letterSpacing: '-0.025em',
          }}
        >
          {profile.establishmentName}
        </h1>

        {/* Divider */}
        <div
          className="h-px mb-5"
          style={{ background: `linear-gradient(to right, ${colors.primary}55, transparent)`, width: '4rem' }}
        />

        {/* Description */}
        {profile.description && (
          <p
            className="text-sm md:text-base leading-relaxed mb-8 max-w-sm"
            style={{ color: colors.textSecondary }}
          >
            {profile.description}
          </p>
        )}

        {/* CTA row */}
        <div className="flex items-center gap-4 flex-wrap">
          <button
            onClick={() => onBook(firstServiceId)}
            className="group inline-flex items-center gap-2 px-7 py-3 text-sm font-bold rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              background: colors.primary,
              color: '#fff',
              boxShadow: `0 2px 16px ${colors.primary}44`,
              borderRadius: layout.borderRadius.md ?? '0.5rem',
            }}
          >
            Réserver maintenant
            <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>

          {/* Service count badge */}
          {services.length > 0 && (
            <span className="text-xs font-medium" style={{ color: colors.textSecondary }}>
              {services.length} service{services.length > 1 ? 's' : ''} disponible{services.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
