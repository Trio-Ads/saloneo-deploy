import { Trans } from 'react-i18next';
import { SalonPublicData } from '../types';
import { useSalon } from '../sections/kit';

const ICONS = {
  instagram: 'M7 3h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7a4 4 0 014-4zm5 5a4 4 0 100 8 4 4 0 000-8zm5.5-1.5h.01',
  facebook: 'M14 8h3V4h-3a4 4 0 00-4 4v2H8v4h2v7h4v-7h3l1-4h-4V8z',
} as const;

export function PublicFooter({ data }: { data: SalonPublicData }) {
  const { t, name, address, phone } = useSalon(data);
  const socials = Object.entries(data.profile.socialMedia ?? {}).filter(([k, v]) => v && k in ICONS) as [keyof typeof ICONS, string][];

  return (
    <footer className="border-t sp-line">
      <div className="sp-wrap py-12 md:py-16 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
        <div>
          <p className="sp-h text-2xl">{name}</p>
          {(address || phone) && (
            <p className="sp-muted mt-2">
              {address}{address && phone && <span aria-hidden className="sp-dot">·</span>}
              {phone && <a href={`tel:${phone.replace(/\s+/g, '')}`} className="sp-num hover:underline underline-offset-4">{phone}</a>}
            </p>
          )}
        </div>
        {socials.length > 0 && (
          <ul className="flex gap-2">
            {socials.map(([k, url]) => (
              <li key={k}>
                <a href={url} target="_blank" rel="noopener noreferrer" aria-label={k} className="sp-iconbtn">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d={ICONS[k]} />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="sp-wrap py-6 border-t sp-line flex flex-wrap justify-between gap-3 text-sm sp-muted">
        <span>© {new Date().getFullYear()} {name}</span>
        <a href="https://saloneo.com" target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-4">
          <Trans t={t} i18nKey="site.credit_by" values={{ brand: 'Saloneo' }} components={{ b: <span className="font-semibold" /> }} />
        </a>
      </div>
      {/* room for the pinned mobile "Réserver" bar */}
      {data.services.length > 0 && <div aria-hidden className="md:hidden h-[calc(4.5rem+env(safe-area-inset-bottom))]" />}
    </footer>
  );
}
