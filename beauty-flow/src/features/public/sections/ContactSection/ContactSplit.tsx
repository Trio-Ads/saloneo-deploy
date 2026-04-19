import { SectionProps } from '../types';

export function ContactSplit({ template, data }: SectionProps) {
  const { colors } = template.theme;
  const { profile } = data;

  return (
    <section id="contact" style={{ background: colors.surface }} className="px-6 py-12 md:px-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
          <h2
            style={{ color: colors.text, fontFamily: template.theme.typography.headingFont }}
            className="text-2xl font-extrabold mb-6"
          >
            Nous trouver
          </h2>
          {profile.address && (
            <p style={{ color: colors.textSecondary }} className="flex gap-2 mb-3">
              <span style={{ color: colors.primary }}>📍</span>
              {profile.address}
            </p>
          )}
          {profile.publicPhone && (
            <p style={{ color: colors.textSecondary }} className="flex gap-2 mb-3">
              <span style={{ color: colors.primary }}>📞</span>
              {profile.publicPhone}
            </p>
          )}
          {profile.email && (
            <p style={{ color: colors.textSecondary }} className="flex gap-2">
              <span style={{ color: colors.primary }}>✉</span>
              {profile.email}
            </p>
          )}
        </div>
        <div>
          <h3
            style={{ color: colors.text, fontFamily: template.theme.typography.headingFont }}
            className="text-2xl font-extrabold mb-6"
          >
            Horaires
          </h3>
          {profile.businessHours &&
            Object.entries(profile.businessHours).map(([day, hours]) =>
              hours ? (
                <div key={day} className="flex justify-between mb-2">
                  <span style={{ color: colors.text }} className="capitalize font-medium text-sm">
                    {day}
                  </span>
                  <span style={{ color: colors.textSecondary }} className="text-sm">
                    {hours.start} – {hours.end}
                  </span>
                </div>
              ) : null
            )}
        </div>
      </div>
    </section>
  );
}
