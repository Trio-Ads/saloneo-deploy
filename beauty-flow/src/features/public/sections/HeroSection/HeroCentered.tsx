import { SectionProps } from '../types';

/**
 * HeroCentered — Centred stage with subtle banner overlay.
 * Design intent: elevated, ceremonial — like an editorial spread.
 * Key details: large negative space, animated fade-in stagger,
 * pill CTA with shimmer hover, soft vignette over banner image.
 */
export function HeroCentered({ template, data, onBook }: SectionProps) {
  const { colors, typography, layout } = template.theme;
  const { profile, services } = data;
  const firstServiceId = services[0]?._id ?? '';

  return (
    <section
      style={{ background: colors.background }}
      className="relative overflow-hidden"
    >
      {/* Banner with radial vignette */}
      {profile.banner && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${profile.banner})`,
              opacity: 0.18,
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at center, transparent 30%, ${colors.background} 85%)`,
            }}
          />
        </>
      )}

      {/* Decorative geometric accent */}
      <div
        className="absolute top-0 right-0 w-64 h-64 opacity-5 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${colors.primary} 0%, transparent 70%)`,
          transform: 'translate(30%, -30%)',
        }}
      />

      <div
        className="relative z-10 flex flex-col items-center text-center px-6 py-20 md:py-32"
        style={{ maxWidth: layout.containers.maxWidth, margin: '0 auto' }}
      >
        {/* Logo */}
        {profile.logo && (
          <div className="mb-8 animate-[fadeInDown_0.6s_ease_forwards] opacity-0" style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}>
            <img
              src={profile.logo}
              alt={profile.establishmentName}
              className="h-16 w-auto object-contain"
              style={{ filter: 'drop-shadow(0 2px 12px rgba(0,0,0,0.12))' }}
            />
          </div>
        )}

        {/* Eye-brow label */}
        <p
          className="text-xs font-bold uppercase tracking-[0.3em] mb-4 opacity-0"
          style={{
            color: colors.primary,
            animationName: 'fadeInUp',
            animationDuration: '0.55s',
            animationDelay: '100ms',
            animationFillMode: 'forwards',
            animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          Salon de beauté
        </p>

        {/* Headline */}
        <h1
          className="font-extrabold tracking-tight mb-5 opacity-0"
          style={{
            color: colors.text,
            fontFamily: typography.headingFont,
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            animationName: 'fadeInUp',
            animationDuration: '0.6s',
            animationDelay: '200ms',
            animationFillMode: 'forwards',
            animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {profile.establishmentName}
        </h1>

        {/* Description */}
        {profile.description && (
          <p
            className="text-base md:text-lg max-w-xl mb-10 opacity-0 leading-relaxed"
            style={{
              color: colors.textSecondary,
              animationName: 'fadeInUp',
              animationDuration: '0.6s',
              animationDelay: '320ms',
              animationFillMode: 'forwards',
              animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            {profile.description}
          </p>
        )}

        {/* CTA */}
        <div
          className="opacity-0"
          style={{
            animationName: 'fadeInUp',
            animationDuration: '0.6s',
            animationDelay: '440ms',
            animationFillMode: 'forwards',
            animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          <button
            onClick={() => onBook(firstServiceId)}
            className="group relative inline-flex items-center gap-2 px-8 py-3.5 font-bold text-sm rounded-full overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              background: colors.primary,
              color: '#fff',
              boxShadow: `0 4px 24px ${colors.primary}55`,
            }}
          >
            <span className="relative z-10">Prendre rendez-vous</span>
            <svg className="relative z-10 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            {/* Shimmer overlay */}
            <span
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%)',
                backgroundSize: '200% 100%',
              }}
            />
          </button>
        </div>

        {/* Address hint */}
        {profile.address && (
          <p
            className="mt-6 text-xs opacity-0"
            style={{
              color: colors.textSecondary,
              animationName: 'fadeInUp',
              animationDuration: '0.6s',
              animationDelay: '560ms',
              animationFillMode: 'forwards',
              animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            <span style={{ opacity: 0.5 }}>📍</span> {profile.address}
          </p>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
