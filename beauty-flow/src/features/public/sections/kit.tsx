// Shared pieces of the public salon page: theme → CSS variables, salon facts, small primitives.
import type { CSSProperties, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { DesignTemplate } from '../../templates/types';
import { PublicService, PublicTeamMember, SalonPublicData } from '../types';
import { formatDuration, formatPrice } from './ServicesSection/utils';
import './salon.css';

/* ── color ─────────────────────────────────────────────── */

const rgb = (hex: string) => {
  const h = hex.replace('#', '');
  const f = h.length === 3 ? h.split('').map(c => c + c).join('') : h.slice(0, 6);
  return [0, 2, 4].map(i => parseInt(f.slice(i, i + 2), 16) || 0);
};
const lum = (hex: string) => {
  const [r, g, b] = rgb(hex).map(v => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const contrast = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};
export const isDark = (hex: string) => lum(hex) < 0.2;
const mix = (a: string, b: string, t: number) =>
  '#' + rgb(a).map((v, i) => Math.round(v + (rgb(b)[i] - v) * t).toString(16).padStart(2, '0')).join('');

/** `fg` pushed toward the text color until it reaches `min` contrast on `bg`. */
const readable = (fg: string, bg: string, text: string, min = 4.5) => {
  for (let t = 0; t <= 1; t += 0.1) { const c = mix(fg, text, t); if (contrast(c, bg) >= min) return c; }
  return text;
};
/** Text on a filled color: white when it holds 3:1 (UI text, semibold), else the darkest ink. */
export const onColor = (bg: string) => (contrast('#ffffff', bg) >= 3 ? '#ffffff' : '#141414');

export function themeVars(t: DesignTemplate): CSSProperties {
  const { colors: c, typography: ty, layout } = t.theme;
  const band = c.custom?.band ?? c.surface;
  return {
    '--sp-primary': c.primary,
    '--sp-secondary': c.secondary,
    '--sp-accent': c.accent,
    '--sp-bg': c.background,
    '--sp-surface': c.surface,
    '--sp-text': c.text,
    '--sp-muted': c.textSecondary,
    '--sp-ink': readable(c.primary, c.background, c.text),
    '--sp-ink2': readable(c.secondary, c.background, c.text),
    '--sp-on': onColor(c.primary),
    '--sp-band': band,
    '--sp-on-band': isDark(band) ? '#F7F3EA' : c.text,
    '--sp-head': ty.headingFont,
    '--sp-body': ty.bodyFont,
    '--sp-hw': ty.headingWeight,
    '--sp-hcase': ty.headingCase ?? 'none',
    '--sp-ht': ty.headingTracking,
    '--sp-rb': layout.borderRadius.md,
    '--sp-r': layout.borderRadius.lg,
    '--sp-ra': layout.borderRadius.full,
    '--sp-py': layout.spacing.section ?? '6rem',
  } as CSSProperties;
}

/* ── salon facts ───────────────────────────────────────── */

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
type Hours = { start?: string; end?: string; open?: string; close?: string; closed?: boolean; isOpen?: boolean };

/**
 * Opening hours as grouped rows ("Lundi – Samedi · 09:00 – 19:00").
 * businessHours is either per-day, or one global { start, end } (then open days come from the team).
 */
function hoursRows(data: SalonPublicData, t: (k: string) => string) {
  const bh = data.profile.businessHours as Record<string, Hours> & Hours | undefined;
  if (!bh) return [];
  const perDay = DAYS.some(d => bh[d]);
  if (!perDay && !(bh.start && bh.end)) return [];
  const teamDays = new Set(data.team.flatMap(m => Object.entries(m.workingHours ?? {}).filter(([, h]) => h?.isWorking).map(([d]) => d)));
  const slot = (d: string) => {
    if (perDay) {
      const h = bh[d] as Hours | undefined;
      const s = h?.start ?? h?.open, e = h?.end ?? h?.close;
      return !h || h.closed || h.isOpen === false || !s || !e ? null : `${s} – ${e}`;
    }
    return teamDays.size && !teamDays.has(d) ? null : `${bh.start} – ${bh.end}`;
  };
  const rows: { from: string; to: string; value: string | null }[] = [];
  DAYS.forEach(d => {
    const value = slot(d), last = rows[rows.length - 1];
    if (last && last.value === value) last.to = d; else rows.push({ from: d, to: d, value });
  });
  return rows.map(r => ({
    days: r.from === r.to ? t(`days.${r.from}`) : `${t(`days.${r.from}`)} – ${t(`days.${r.to}`)}`,
    value: r.value ?? t('site.closed'),
    closed: !r.value,
  }));
}

export function useSalon(data: SalonPublicData) {
  const { t, i18n } = useTranslation('public');
  const { profile, services } = data;
  const categories = [...new Set(services.map(s => s.category).filter(Boolean))];
  const list = (items: string[]) => {
    try { return new Intl.ListFormat(i18n.language, { type: 'conjunction' }).format(items); } catch { return items.join(', '); }
  };
  const lower = categories.map((c, i) => (i === 0 ? c : c.toLocaleLowerCase(i18n.language)));
  const phone = profile.publicPhone || profile.phone || '';
  const address = profile.address?.trim() || '';
  return {
    t,
    name: profile.establishmentName,
    about: profile.presentation?.trim() || profile.description?.trim() || (categories.length ? `${list(lower)}.` : ''),
    categories,
    groups: categories.map(c => ({ name: c, services: services.filter(s => s.category === c) }))
      .concat(services.some(s => !s.category) ? [{ name: '', services: services.filter(s => !s.category) }] : []),
    phone,
    email: profile.email || '',
    address,
    mapsUrl: address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address} ${profile.establishmentName}`)}` : '',
    hours: hoursRows(data, t),
    price: (s: PublicService) => formatPrice(s, profile.serviceDisplay?.priceDisplay ?? 'fixed', profile.settings?.currency || 'DZD'),
    duration: (s: PublicService) => formatDuration(s.duration),
  };
}

/* ── primitives ────────────────────────────────────────── */

export function Section({ id, className = '', children, style }: { id?: string; className?: string; children: ReactNode; style?: CSSProperties }) {
  return (
    <section id={id} className={`sp-section ${className}`} style={style}>
      <div className="sp-wrap">{children}</div>
    </section>
  );
}

export const Title = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <h2 className={`sp-h sp-title ${className}`}>{children}</h2>
);

export function BookButton({ service, onBook, ghost, small, className = '' }: { service: PublicService; onBook: (id: string) => void; ghost?: boolean; small?: boolean; className?: string }) {
  const { t } = useTranslation('public');
  return (
    <button
      type="button"
      onClick={() => onBook(service._id)}
      className={`sp-btn ${ghost ? 'sp-btn-ghost' : ''} ${small ? 'sp-btn-sm' : ''} ${className}`}
      aria-label={t('site.book_service', { name: service.name })}
    >
      {t('site.book')}
    </button>
  );
}

/** "2 500 DA · 1h30" */
export function Meta({ service, data, className = '' }: { service: PublicService; data: SalonPublicData; className?: string }) {
  const { price, duration } = useSalon(data);
  const p = price(service);
  return (
    <span className={`sp-num ${className}`}>
      {p && <span className="sp-price">{p}</span>}
      {p && <span aria-hidden className="sp-dot">·</span>}
      <span className="sp-muted">{duration(service)}</span>
    </span>
  );
}

export function Avatar({ member, className = '' }: { member: PublicTeamMember; className?: string }) {
  const name = `${member.firstName} ${member.lastName}`.trim();
  if (member.avatar) return <img src={member.avatar} alt={name} className={`sp-avatar object-cover ${className}`} />;
  const initials = `${member.firstName?.[0] ?? ''}${member.lastName?.[0] ?? ''}`.toUpperCase();
  return <span role="img" aria-label={name} className={`sp-avatar sp-initials ${className}`}>{initials}</span>;
}

/** Image when the service has one, otherwise a typographic tile in the template's display face. */
export function ServiceVisual({ service, index, className = '' }: { service: PublicService; index: number; className?: string }) {
  const img = service.images?.find(i => i.isPrimary) ?? service.images?.[0];
  if (img) return <img src={img.url} alt={img.alt || service.name} loading="lazy" className={`sp-visual object-cover ${className}`} />;
  return (
    <div className={`sp-visual sp-tile sp-tile-${index % 3} ${className}`} aria-hidden>
      <span className="sp-h">{service.category || service.name}</span>
    </div>
  );
}

export function Stars({ rating }: { rating: number }) {
  return (
    <span className="sp-stars" role="img" aria-label={`${rating}/5`}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} viewBox="0 0 20 20" width="14" height="14" fill={i <= rating ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.2" aria-hidden>
          <path d="M10 1.8l2.5 5.2 5.7.8-4.1 4 1 5.6L10 14.7l-5.1 2.7 1-5.6-4.1-4 5.7-.8z" />
        </svg>
      ))}
    </span>
  );
}

export function Arrow({ dir = 'next' }: { dir?: 'prev' | 'next' }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={`sp-arrow ${dir === 'prev' ? 'sp-flip' : ''}`}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

/* ── shared blocks ─────────────────────────────────────── */

/** Primary "book" (goes to the services) + call, used by every hero. */
export function HeroCta({ data }: { data: SalonPublicData }) {
  const { t, phone } = useSalon(data);
  return (
    <div className="flex flex-wrap gap-3">
      {data.services.length > 0 && <a href="#services" className="sp-btn">{t('site.book')}</a>}
      {phone && <a href={`tel:${phone.replace(/\s+/g, '')}`} className="sp-btn sp-btn-ghost">{t('site.call')}</a>}
    </div>
  );
}

/** A hero without a banner photo shows the menu instead of an empty frame. */
export function ServicePeek({ data, className = '' }: { data: SalonPublicData; className?: string }) {
  const { t, price } = useSalon(data);
  return (
    <div className={`sp-card p-6 md:p-8 ${className}`}>
      <ul>
        {data.services.slice(0, 5).map(s => (
          <li key={s._id} className="flex items-baseline gap-3 py-3.5 border-b sp-line last:border-0">
            <span className="font-medium">{s.name}</span>
            <span className="sp-leader" />
            <span className="sp-num sp-price">{price(s)}</span>
          </li>
        ))}
      </ul>
      <a href="#services" className="sp-link inline-flex items-center gap-2 mt-5">
        {t('site.all_services')} <Arrow />
      </a>
    </div>
  );
}

/** The salon's categories set large in the display face (frames without a photo). */
export function CategoryStack({ data, className = '' }: { data: SalonPublicData; className?: string }) {
  const { categories, name } = useSalon(data);
  const words = categories.length ? categories.slice(0, 5) : [name];
  return (
    <div className={`flex flex-col justify-end gap-1 ${className}`} aria-hidden>
      {words.map(w => <span key={w} className="sp-h block text-[clamp(1.75rem,1.2rem+1.8vw,2.75rem)] leading-[1.05]">{w}</span>)}
    </div>
  );
}

export function HoursTable({ data, className = '' }: { data: SalonPublicData; className?: string }) {
  const { hours } = useSalon(data);
  return (
    <dl className={`sp-num ${className}`}>
      {hours.map(h => (
        <div key={h.days} className="flex justify-between gap-6 py-2.5 border-b sp-line last:border-0">
          <dt>{h.days}</dt>
          <dd className={h.closed ? 'sp-muted' : ''}>{h.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Address / phone / email, each only when known. */
export function ContactItems({ data, className = '', itemClass = '' }: { data: SalonPublicData; className?: string; itemClass?: string }) {
  const { t, address, mapsUrl, phone, email } = useSalon(data);
  const items = [
    address && { k: 'address', v: <>{address}<br /><a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="sp-link text-[0.95rem]">{t('site.directions')}</a></> },
    phone && { k: 'phone', v: <a href={`tel:${phone.replace(/\s+/g, '')}`} className="sp-num hover:underline underline-offset-4">{phone}</a> },
    email && { k: 'email', v: <a href={`mailto:${email}`} className="hover:underline underline-offset-4 break-all">{email}</a> },
  ].filter(Boolean) as { k: string; v: ReactNode }[];
  return (
    <dl className={className}>
      {items.map(i => (
        <div key={i.k} className={itemClass}>
          <dt className="sp-muted text-sm">{t(`site.${i.k}`)}</dt>
          <dd className="mt-1 text-lg">{i.v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function useRating(data: SalonPublicData) {
  const { t, i18n } = useTranslation('public');
  const n = data.reviews.length;
  const avg = n ? data.reviews.reduce((a, r) => a + r.rating, 0) / n : 0;
  return n ? t('site.rating_summary', { avg: avg.toLocaleString(i18n.language, { maximumFractionDigits: 1 }), count: n }) : '';
}
