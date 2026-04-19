import { SectionProps } from '../types';

/**
 * HeroFullbleed — Full-viewport immersive hero.
 * Design intent: cinematic, bold — the image owns the entire screen.
 * Key details: dual-layer gradient scrim (bottom-up + slight vignette),
 * oversized display headline, scroll-hint indicator, glassmorphic CTA.
 */
export function HeroFullbleed({ template, data, onBook }: SectionProps) {
  const { colors, typography } = template.theme;
  const { profile, services } = data;
  const firstServiceId = services[0]?._id ?? '';

  const hasBanner = !!profile.banner;

  return (
    <section className="relative min-h-screen flex flex-col justify-end overflow-hidden">
      {/* Background layer */}
      {hasBanner ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${profile.banner})` }}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary ?? colors.accent} 50%, #111 100%)`,
          }}
        />
      )}

      {/* Dual scrim: vignette top + strong bottom fade */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(to bottom,
              rgba(0,0,0,0.25) 0%,
              rgba(0,0,0,0.05) 35%,
              rgba(0,0,0,0.6) 65%,
              rgba(0,0,0,0.88) 100%
            )
          `,
        }}
      />

      {/* Primary color tint strip at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{ background: colors.primary }}
      />

      {/* Logo — top left */}
      {profile.logo && (
        <div className="absolute top-6 left-6 md:top-10 md:left-10 z-20">
          <img
            src={profile.logo}
            alt={profile.establishmentName}
            className="h-12 w-auto object-contain"
            style={{ filter: 'brightness(0) invert(1) drop-shadow(0 1px 6px rgba(0,0,0,0.5))' }}
          />
        </div>
      )}

      {/* Main content — bottom left */}
      <div className="relative z-10 px-6 pb-14 md:px-14 md:pb-20 max-w-4xl">
        {/* Eyebrow */}
        <div className="flex items-center gap-2 mb-4">
          <span
            className="inline-block h-px w-8"
            style={{ background: colors.primary }}
          />
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/70">
            {profile.address ?? 'Salon de beauté'}
          </p>
        </div>

        {/* Headline — cinematic scale */}
        <h1
          className="font-extrabold text-white leading-none mb-5"
          style={{
            fontFamily: typography.headingFont,
            fontSize: 'clamp(3rem, 8vw, 6.5rem)',
            letterSpacing: '-0.03em',
            textShadow: '0 4px 40px rgba(0,0,0,0.3)',
          }}
        >
          {profile.establishmentName}
        </h1>

        {/* Description */}
        {profile.description && (
          <p
            className="text-white/75 text-base md:text-lg mb-8 max-w-xl leading-relaxed"
            style={{ textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}
          >
            {profile.description}
          </p>
        )}

        {/* CTA cluster */}
        <div className="flex items-center gap-4 flex-wrap">
          <button
            onClick={() => onBook(firstServiceId)}
            className="group relative inline-flex items-center gap-2 px-8 py-4 text-sm font-bold rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              background: colors.primary,
              color: '#fff',
              boxShadow: `0 4px 30px ${colors.primary}66`,
            }}
          >
            <span>Réserver maintenant</span>
            <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>

          {/* Ghost button — scrolls to services section */}
          <button
            onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center gap-1.5 px-6 py-3.5 text-sm font-semibold rounded-lg transition-all duration-200 hover:bg-white/10"
            style={{
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.35)',
              backdropFilter: 'blur(8px)',
            }}
          >
            Nos services
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-5 right-6 z-10 flex flex-col items-center gap-1.5 opacity-60">
        <span className="text-white text-[10px] uppercase tracking-widest rotate-90 origin-center" style={{ writingMode: 'vertical-rl' }}>
          Scroll
        </span>
        <div
          className="w-px h-8"
          style={{ background: 'linear-gradient(to bottom, white, transparent)' }}
        />
      </div>
    </section>
  );
}
