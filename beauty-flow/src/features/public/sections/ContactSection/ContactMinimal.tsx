import { SectionProps } from '../types';

export function ContactMinimal({ template, data }: SectionProps) {
  const { colors } = template.theme;
  const { profile } = data;

  return (
    <section
      id="contact"
      style={{ background: colors.background, borderTop: `1px solid ${colors.surface}` }}
      className="px-6 py-8 md:px-12"
    >
      <div className="max-w-6xl mx-auto flex flex-wrap gap-6 items-center justify-between">
        <div className="flex flex-wrap gap-6">
          {profile.address && (
            <span style={{ color: colors.textSecondary }} className="text-sm">
              📍 {profile.address}
            </span>
          )}
          {profile.publicPhone && (
            <span style={{ color: colors.textSecondary }} className="text-sm">
              📞 {profile.publicPhone}
            </span>
          )}
          {profile.email && (
            <span style={{ color: colors.textSecondary }} className="text-sm">✉ {profile.email}</span>
          )}
        </div>
        {profile.socialMedia && (
          <div className="flex gap-3">
            {profile.socialMedia.instagram && (
              <a
                href={profile.socialMedia.instagram}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: colors.primary }}
                className="text-sm hover:opacity-70"
              >
                Instagram
              </a>
            )}
            {profile.socialMedia.facebook && (
              <a
                href={profile.socialMedia.facebook}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: colors.primary }}
                className="text-sm hover:opacity-70"
              >
                Facebook
              </a>
            )}
            {profile.socialMedia.twitter && (
              <a href={profile.socialMedia.twitter} target="_blank" rel="noopener noreferrer"
                 style={{ color: colors.primary }} className="text-sm font-bold hover:opacity-70">
                Twitter
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
