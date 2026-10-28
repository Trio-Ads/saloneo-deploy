import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DirectoryCard, fetchCard, Category } from './api';
import type { SalonPublicData } from '../public/types';

/** Title, meta description and one JSON-LD block for as long as the page is mounted; the previous head comes back after. */
export function usePageMeta(title?: string, description?: string, jsonLd?: string) {
  useEffect(() => {
    if (!title) return;
    const prevTitle = document.title;
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) {
      meta = Object.assign(document.createElement('meta'), { name: 'description' });
      document.head.appendChild(meta);
    }
    const prevDescription = meta.content;
    document.title = title;
    if (description) meta.content = description;
    const script = jsonLd ? Object.assign(document.createElement('script'), { type: 'application/ld+json', text: jsonLd }) : null;
    if (script) document.head.appendChild(script);
    return () => {
      document.title = prevTitle;
      meta!.content = prevDescription;
      script?.remove();
    };
  }, [title, description, jsonLd]);
}

const absolute = (url?: string) => (url ? new URL(url, window.location.origin).href : undefined);

/** schema.org type from the salon's main trade. */
const schemaType = (c?: Category) =>
  c === 'coiffure' || c === 'barbier' ? 'HairSalon' : c === 'ongles' ? 'NailSalon' : c === 'spa-hammam' ? 'DaySpa' : 'BeautySalon';

/** schema.org LocalBusiness of a salon card (used by the directory list and the salon page). */
export function salonLd(card: DirectoryCard, extra: Record<string, unknown> = {}) {
  return {
    '@type': schemaType(card.categories[0]),
    name: card.name,
    url: `${window.location.origin}/salon/${card.slug}`,
    image: absolute(card.banner || card.logo),
    address: { '@type': 'PostalAddress', addressLocality: card.city, addressRegion: card.wilaya, addressCountry: 'DZ' },
    ...(card.ratingCount > 0 && card.ratingAvg !== null
      ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: card.ratingAvg, reviewCount: card.ratingCount, bestRating: 5 } }
      : {}),
    ...extra,
  };
}

/** Salon page: "Nom — Coiffure à Alger | Réservation en ligne" + LocalBusiness JSON-LD. */
export function useSalonSeo(slug: string, data: SalonPublicData | null) {
  const { t } = useTranslation('marketing', { keyPrefix: 'directory' });
  const [card, setCard] = useState<DirectoryCard | null>(null);
  useEffect(() => {
    setCard(null);
    if (slug) fetchCard(slug).then(setCard).catch(() => {});
  }, [slug]);

  const p = data?.profile;
  const name = p?.establishmentName;
  const category = card?.categories[0] && t(`categories.${card.categories[0]}`);
  const city = card?.city || card?.wilaya;
  const title = name && (category && city ? t('seo.salonTitle', { name, category, city }) : t('seo.salonTitleShort', { name }));
  const description = name && (p?.presentation?.trim().slice(0, 155) || (city ? t('seo.salonDescription', { name, city }) : t('seo.salonDescriptionShort', { name })));
  const ld = p && JSON.stringify({
    '@context': 'https://schema.org',
    ...(card
      ? salonLd(card)
      : { '@type': 'BeautySalon', name, url: `${window.location.origin}/salon/${p.slug || slug}`, image: absolute(p.banner || p.logo) }),
    ...(p.address ? { address: { '@type': 'PostalAddress', streetAddress: p.address, addressLocality: card?.city, addressRegion: card?.wilaya, addressCountry: 'DZ' } } : {}),
    ...(p.publicPhone || p.phone ? { telephone: p.publicPhone || p.phone } : {}),
    ...(p.logo ? { logo: absolute(p.logo) } : {}),
  });
  usePageMeta(title || undefined, description || undefined, ld || undefined);
}
