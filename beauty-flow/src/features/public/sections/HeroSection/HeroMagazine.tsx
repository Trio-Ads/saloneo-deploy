import { SectionProps } from '../types';

/**
 * HeroMagazine — Editorial luxury magazine cover layout.
 * Design intent: high-fashion editorial — think Vogue cover meets boutique landing page.
 * Key details: full-bleed image, strong bottom-up gradient scrim,
 * large serif-style title, location tag, tinted category chip,
 * pill CTA against deep overlay, service teaser strip at bottom.
 */
export function HeroMagazine({ template, data, onBook }: SectionProps) {
  const { colors, typography } = template.theme;
  const { profile, services } = data;
  const firstServiceId = services[0]?._id ?? '';

  // Show first 3 service names as a teaser
  const teaserServices = services.slice(0, 3);

  return (
    <section
      className="relative overflow-hidden"
      style={{ minHeight: '65vh' }}
    >
      {/* Background */}
      {profile.banner ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${profile.banner})` }}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(160deg, ${colors.primary} 0%, ${colors.accent ?? colors.secondary} 50%, #0a0a0a 100%)`,
          }}
        />
      )}

      {/* Layered scrim: magazine-style bottom heavy */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.72) 65%, rgba(0,0,0,0.95) 100%)',
        }}
      />

      {/* Primary color left edge bar — editorial detail */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ background: `linear-gradient(to bottom, ${colors.primary}, transparent)` }}
      />

      {/* Logo + issue-style badge — top */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-start justify-between px-6 pt-6 md:px-10 md:pt-8">
        {profile.logo && (
          <img
            src={profile.logo}
            alt={profile.establishmentName}
            className="h-9 w-auto object-contain"
            style={{ filter: 'brightness(0) invert(1)', opacity: 0.9 }}
          />
        )}
        {/* Category chip */}
        <span
          className="text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full"
          style={{
            background: colors.primary,
            color: '#fff',
          }}
        >
          {profile.subscription?.plan ?? 'Premium'}
        </span>
      </div>

      {/* Main editorial block — bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 px-6 pb-8 md:px-10 md:pb-10"
      >
        {/* Location + rule */}
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px flex-1 max-w-8" style={{ background: colors.primary }} />
          <p
            className="text-[11px] font-bold uppercase tracking-[0.22em]"
            style={{ color: colors.primary }}
          >
            {profile.address ?? 'Salon de beauté'}
          </p>
        </div>

        {/* Title — oversized, condensed */}
        <h1
          className="font-bold text-white leading-none mb-3"
          style={{
            fontFamily: typography.headingFont,
            fontSize: 'clamp(2.5rem, 7vw, 5.5rem)',
            letterSpacing: '-0.03em',
            textShadow: '0 2px 20px rgba(0,0,0,0.3)',
          }}
        >
          {profile.establishmentName}
        </h1>

        {/* Description */}
        {profile.description && (
          <p
            className="text-white/65 text-sm md:text-base mb-6 max-w-lg leading-relaxed"
          >
            {profile.description}
          </p>
        )}

        {/* Bottom row: CTA + service teaser chips */}
        <div className="flex items-center gap-4 flex-wrap">
          <button
            onClick={() => onBook(firstServiceId)}
            className="group inline-flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-full transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              background: colors.primary,
              color: '#fff',
              boxShadow: `0 4px 20px ${colors.primary}55`,
            }}
          >
            Découvrir & réserver
            <svg className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>

          {/* Service teaser chips */}
          {teaserServices.map((svc) => (
            <button
              key={svc._id}
              onClick={() => onBook(svc._id)}
              className="hidden sm:inline-block px-3 py-1.5 text-[11px] font-semibold rounded-full transition-all duration-200 hover:bg-white/20"
              style={{
                color: 'rgba(255,255,255,0.75)',
                border: '1px solid rgba(255,255,255,0.25)',
                backdropFilter: 'blur(8px)',
              }}
            >
              {svc.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
