import { SectionProps } from '../types';

export function ContactCentered({ template, data }: SectionProps) {
  const { colors } = template.theme;
  const { profile } = data;

  return (
    <section id="contact" style={{ background: colors.background }} className="px-6 py-14 md:px-12 text-center">
      <div className="max-w-2xl mx-auto">
        <h2
          style={{ color: colors.text, fontFamily: template.theme.typography.headingFont }}
          className="text-2xl font-extrabold mb-8"
        >
          Nous contacter
        </h2>
        <div className="flex flex-col gap-4 items-center">
          {profile.address && (
            <p style={{ color: colors.textSecondary }}>📍 {profile.address}</p>
          )}
          {profile.publicPhone && (
            <p style={{ color: colors.textSecondary }}>📞 {profile.publicPhone}</p>
          )}
          {profile.email && (
            <p style={{ color: colors.textSecondary }}>✉ {profile.email}</p>
          )}
        </div>
        {profile.socialMedia && (
          <div className="flex justify-center gap-4 mt-6">
            {profile.socialMedia.instagram && (
              <a
                href={profile.socialMedia.instagram}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: colors.primary }}
                className="text-sm font-bold hover:opacity-70"
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
                className="text-sm font-bold hover:opacity-70"
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
