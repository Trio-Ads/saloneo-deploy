import { DesignTemplate } from '../../templates/types';
import { SalonPublicData } from '../types';

interface Props {
  template: DesignTemplate;
  data: SalonPublicData;
}

/* ── SVG social icons ── */
const InstagramIcon = () => (
  <svg
    aria-hidden="true"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
  </svg>
);

const FacebookIcon = () => (
  <svg
    aria-hidden="true"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const SaloneoIcon = () => (
  <svg
    aria-hidden="true"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2 L2 7 L12 12 L22 7 Z" />
    <path d="M2 17 L12 22 L22 17" />
    <path d="M2 12 L12 17 L22 12" />
  </svg>
);

export function PublicFooter({ template, data }: Props) {
  const { colors } = template.theme;
  const { profile } = data;
  const isStarter = profile.subscription?.plan === 'starter';

  const hasSocial =
    !!profile.socialMedia?.instagram || !!profile.socialMedia?.facebook;

  const socialLinkBase: React.CSSProperties = {
    color: colors.textSecondary,
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    fontFamily: template.theme.typography.bodyFont,
    padding: '6px 10px',
    borderRadius: template.theme.layout.borderRadius.sm,
    border: `1px solid ${colors.surface}`,
    transition: 'color 0.2s ease, border-color 0.2s ease, background 0.2s ease',
  };

  return (
    <footer
      style={{
        background: colors.surface,
        borderTop: `1px solid ${colors.background}`,
        fontFamily: template.theme.typography.bodyFont,
      }}
      className="px-6 py-8 md:px-12"
    >
      {/* ── subtle top divider line with primary color accent ── */}
      <div
        aria-hidden="true"
        style={{
          height: '1px',
          background: `linear-gradient(to right, transparent, ${colors.primary}44, transparent)`,
          marginBottom: '32px',
          borderRadius: '1px',
        }}
      />

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">

          {/* ── Brand block ── */}
          <div className="flex flex-col gap-1">
            {profile.logo ? (
              <img
                src={profile.logo}
                alt={profile.establishmentName}
                className="h-7 w-auto object-contain"
                style={{
                  opacity: 0.85,
                  filter: 'grayscale(20%)',
                  borderRadius: template.theme.layout.borderRadius.sm,
                }}
              />
            ) : (
              <p
                style={{
                  color: colors.text,
                  fontFamily: template.theme.typography.headingFont,
                  letterSpacing: '-0.01em',
                }}
                className="font-bold text-base m-0"
              >
                {profile.establishmentName}
              </p>
            )}
            <p
              style={{ color: colors.textSecondary }}
              className="text-xs m-0"
            >
              © {new Date().getFullYear()}
              {' '}—{' '}
              {profile.address
                ? profile.address
                : 'Tous droits réservés'}
            </p>
          </div>

          {/* ── Social + Saloneo links ── */}
          <div className="flex items-center flex-wrap gap-2">
            {profile.socialMedia?.instagram && (
              <a
                href={profile.socialMedia.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                style={socialLinkBase}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.color = colors.text;
                  el.style.borderColor = colors.primary + '66';
                  el.style.background = colors.background;
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.color = colors.textSecondary;
                  el.style.borderColor = colors.surface;
                  el.style.background = 'transparent';
                }}
              >
                <InstagramIcon />
                Instagram
              </a>
            )}

            {profile.socialMedia?.facebook && (
              <a
                href={profile.socialMedia.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                style={socialLinkBase}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.color = colors.text;
                  el.style.borderColor = colors.primary + '66';
                  el.style.background = colors.background;
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.color = colors.textSecondary;
                  el.style.borderColor = colors.surface;
                  el.style.background = 'transparent';
                }}
              >
                <FacebookIcon />
                Facebook
              </a>
            )}

            {!hasSocial && !isStarter && (
              <span
                style={{ color: colors.textSecondary, fontSize: '12px' }}
                aria-hidden="true"
              />
            )}

            {isStarter && (
              <a
                href="https://saloneo.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Créé avec Saloneo"
                style={{
                  ...socialLinkBase,
                  fontSize: '11px',
                  letterSpacing: '0.01em',
                  opacity: 0.7,
                  border: 'none',
                  padding: '6px 8px',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.opacity = '1';
                  (e.currentTarget as HTMLAnchorElement).style.color = colors.text;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.opacity = '0.7';
                  (e.currentTarget as HTMLAnchorElement).style.color = colors.textSecondary;
                }}
              >
                <SaloneoIcon />
                Propulsé par Saloneo
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
