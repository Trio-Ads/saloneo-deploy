import { useEffect, useState } from 'react';
import { SalonPublicData } from '../types';
import { useSalon } from '../sections/kit';

/** Sticky salon bar; on phones the links fold into a menu and "Réserver" stays pinned to the bottom. */
export function PublicNavbar({ data }: { data: SalonPublicData }) {
  const { t, name } = useSalon(data);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { profile } = data;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const links = [
    { id: 'services', label: t('site.nav_services'), show: data.services.length > 0 },
    { id: 'team', label: t('site.nav_team'), show: profile.showTeamOnPublicPage !== false && data.team.length > 0 },
    { id: 'reviews', label: t('site.nav_reviews'), show: data.reviews.length > 0 },
    { id: 'contact', label: t('site.nav_contact'), show: true },
  ].filter(l => l.show);
  const canBook = data.services.length > 0;

  return (
    <>
      <header
        className={`sticky top-0 z-40 border-b transition-[border-color] duration-200 ${scrolled || open ? 'sp-line' : 'border-transparent'}`}
        style={{ background: 'var(--sp-bg)' }}
      >
        <nav aria-label={t('site.nav_label')} className="sp-wrap h-16 md:h-[4.5rem] flex items-center justify-between gap-6">
          <a href="#top" className="flex items-center gap-3 min-w-0" onClick={() => setOpen(false)}>
            {profile.logo && <img src={profile.logo} alt="" className="h-8 w-auto object-contain" />}
            <span className="sp-h text-lg md:text-xl truncate">{name}</span>
          </a>
          <ul className="hidden md:flex items-center gap-8">
            {links.map(l => (
              <li key={l.id}><a href={`#${l.id}`} className="sp-muted hover:text-[color:var(--sp-text)] transition-colors">{l.label}</a></li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            {canBook && <a href="#services" className="sp-btn sp-btn-sm !hidden md:!inline-flex">{t('site.book')}</a>}
            <button
              type="button"
              className="sp-iconbtn md:!hidden"
              aria-expanded={open}
              aria-controls="sp-menu"
              aria-label={open ? t('site.menu_close') : t('site.menu_open')}
              onClick={() => setOpen(o => !o)}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 8h16M4 16h16" />}
              </svg>
            </button>
          </div>
        </nav>
        {open && (
          <ul id="sp-menu" className="md:hidden sp-wrap pb-4">
            {links.map(l => (
              <li key={l.id}>
                <a href={`#${l.id}`} onClick={() => setOpen(false)} className="flex items-center min-h-[48px] text-lg border-b sp-line">{l.label}</a>
              </li>
            ))}
          </ul>
        )}
      </header>
      {canBook && (
        <div
          className="md:hidden fixed inset-x-0 bottom-0 z-30 px-4 pt-6 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
          style={{ background: 'linear-gradient(to top, var(--sp-bg) 55%, transparent)' }}
        >
          <a href="#services" className="sp-btn w-full">{t('site.book')}</a>
        </div>
      )}
    </>
  );
}
