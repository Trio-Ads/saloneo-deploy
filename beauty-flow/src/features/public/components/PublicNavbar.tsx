import { useState, useEffect, useRef } from 'react';
import { DesignTemplate } from '../../templates/types';
import { SalonPublicData } from '../types';

interface Props {
  template: DesignTemplate;
  data: SalonPublicData;
  onBook: () => void;
}

export function PublicNavbar({ template, data, onBook }: Props) {
  const { colors } = template.theme;
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const navRef = useRef<HTMLElement>(null);
  const { profile } = data;

  const showTeam =
    profile.showTeamOnPublicPage !== false && data.team.length > 0;

  /* ── scroll shadow + active-section tracking ── */
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);

      const sections = ['services', 'team', 'contact'];
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 90 && rect.bottom > 90) {
            setActiveSection(id);
            return;
          }
        }
      }
      setActiveSection('');
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── close mobile menu on outside click ── */
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const navLinks = [
    { href: '#services', label: 'Services', id: 'services', show: true },
    { href: '#team', label: 'Équipe', id: 'team', show: showTeam },
    { href: '#contact', label: 'Contact', id: 'contact', show: true },
  ].filter((l) => l.show);

  /* ── subtle backdrop blur for glassmorphism templates ── */
  const glassEnabled = template.theme.effects.glassmorphism.enabled;
  const navBg = glassEnabled
    ? `${colors.background}e8`
    : scrolled
    ? colors.background
    : colors.background;

  const boxShadow = scrolled
    ? template.theme.effects.shadows.sm
    : 'none';

  return (
    <nav
      ref={navRef}
      role="navigation"
      aria-label="Navigation principale"
      style={{
        background: navBg,
        borderBottom: scrolled
          ? `1px solid ${colors.surface}`
          : '1px solid transparent',
        boxShadow,
        backdropFilter: glassEnabled ? `blur(${template.theme.effects.glassmorphism.blur}px)` : undefined,
        WebkitBackdropFilter: glassEnabled ? `blur(${template.theme.effects.glassmorphism.blur}px)` : undefined,
        transition: 'border-color 0.25s ease, box-shadow 0.25s ease, background 0.25s ease',
        fontFamily: template.theme.typography.bodyFont,
      }}
      className="sticky top-0 z-50 px-6 py-3 md:px-12"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* ── Logo / Name ── */}
        <a
          href="#"
          aria-label={`${profile.establishmentName} — retour en haut`}
          className="flex items-center gap-3 no-underline"
          style={{ textDecoration: 'none' }}
        >
          {profile.logo ? (
            <img
              src={profile.logo}
              alt={profile.establishmentName}
              className="h-8 w-auto object-contain"
              style={{
                borderRadius: template.theme.layout.borderRadius.sm,
              }}
            />
          ) : (
            <span
              style={{
                color: colors.text,
                fontFamily: template.theme.typography.headingFont,
                letterSpacing: '-0.02em',
              }}
              className="font-extrabold text-lg leading-none"
            >
              {profile.establishmentName}
            </span>
          )}
        </a>

        {/* ── Desktop nav ── */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <a
                key={link.id}
                href={link.href}
                style={{
                  color: isActive ? colors.primary : colors.textSecondary,
                  fontFamily: template.theme.typography.bodyFont,
                  position: 'relative',
                  transition: 'color 0.2s ease',
                  textDecoration: 'none',
                }}
                className="text-sm font-medium px-4 py-2 rounded-md group"
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLAnchorElement).style.color = colors.text;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLAnchorElement).style.color = colors.textSecondary;
                  }
                }}
              >
                {link.label}
                {/* active underline */}
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    bottom: '4px',
                    left: '16px',
                    right: '16px',
                    height: '2px',
                    background: colors.primary,
                    borderRadius: '1px',
                    transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
                    transformOrigin: 'left',
                    transition: 'transform 0.25s ease',
                  }}
                />
              </a>
            );
          })}

          {/* CTA button */}
          <button
            onClick={onBook}
            style={{
              background: colors.primary,
              color: '#fff',
              borderRadius: template.theme.layout.borderRadius.md,
              fontFamily: template.theme.typography.bodyFont,
              boxShadow: `0 2px 8px ${colors.primary}55`,
              transition: 'opacity 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease',
              border: 'none',
              cursor: 'pointer',
            }}
            className="text-sm font-bold px-5 py-2 ml-2"
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = '0.88';
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 4px 14px ${colors.primary}66`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = '1';
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 2px 8px ${colors.primary}55`;
            }}
          >
            Réserver
          </button>
        </div>

        {/* ── Mobile hamburger ── */}
        <button
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-md"
          style={{
            color: colors.text,
            background: menuOpen ? colors.surface : 'transparent',
            border: `1px solid ${menuOpen ? colors.surface : 'transparent'}`,
            transition: 'background 0.2s ease, border-color 0.2s ease',
            cursor: 'pointer',
          }}
          onClick={() => setMenuOpen((m) => !m)}
          aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          <HamburgerIcon open={menuOpen} color={colors.text} />
        </button>
      </div>

      {/* ── Mobile dropdown ── */}
      <div
        id="mobile-menu"
        aria-hidden={!menuOpen}
        style={{
          background: colors.background,
          borderTop: `1px solid ${colors.surface}`,
          maxHeight: menuOpen ? '320px' : '0',
          overflow: 'hidden',
          transition: 'max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        className="md:hidden absolute top-full left-0 right-0"
      >
        <div className="px-6 py-4 flex flex-col gap-1">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                color: colors.text,
                fontFamily: template.theme.typography.bodyFont,
                borderRadius: template.theme.layout.borderRadius.sm,
                textDecoration: 'none',
                transition: 'background 0.15s ease',
              }}
              className="text-sm font-medium px-3 py-2.5"
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = colors.surface;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
              }}
            >
              {link.label}
            </a>
          ))}
          <button
            onClick={() => {
              onBook();
              setMenuOpen(false);
            }}
            style={{
              background: colors.primary,
              color: '#fff',
              borderRadius: template.theme.layout.borderRadius.md,
              fontFamily: template.theme.typography.bodyFont,
              border: 'none',
              cursor: 'pointer',
              marginTop: '8px',
            }}
            className="text-sm font-bold px-5 py-2.5 text-center"
          >
            Réserver
          </button>
        </div>
      </div>
    </nav>
  );
}

/* ── Animated hamburger icon ── */
function HamburgerIcon({ open, color }: { open: boolean; color: string }) {
  const lineStyle = (
    transformOpen: string,
    transformClosed: string,
    originY: string
  ): React.CSSProperties => ({
    display: 'block',
    width: '18px',
    height: '1.5px',
    background: color,
    borderRadius: '1px',
    transformOrigin: `center ${originY}`,
    transform: open ? transformOpen : transformClosed,
    transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease',
  });

  return (
    <span
      aria-hidden="true"
      style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'center' }}
    >
      <span style={lineStyle('rotate(45deg) translate(4.5px, 4.5px)', 'rotate(0) translate(0,0)', '50%')} />
      <span
        style={{
          ...lineStyle('rotate(0)', 'rotate(0)', '50%'),
          opacity: open ? 0 : 1,
        }}
      />
      <span style={lineStyle('rotate(-45deg) translate(4.5px, -4.5px)', 'rotate(0) translate(0,0)', '50%')} />
    </span>
  );
}
