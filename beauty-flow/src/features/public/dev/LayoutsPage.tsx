// Dev-only (/dev/layouts): every variant of every public section, for picking layouts when defining templates.
// Query: ?template=<id>&data=sample|api&images=0|1&logo=0|1&section=<key>|extras, full=1 renders the whole page instead
import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { allTemplates, getTemplateById } from '../../templates';
import { DesignTemplate, SectionKey, bookingVariants, imageTreatments, ornaments, sectionVariants } from '../../templates/types';
import { SalonPublicData } from '../types';
import { useSalonPublicData } from '../hooks/useSalonPublicData';
import { HeroSection } from '../sections/HeroSection';
import { AboutSection } from '../sections/AboutSection';
import { ServicesSection } from '../sections/ServicesSection';
import { GallerySection } from '../sections/GallerySection';
import { TeamSection } from '../sections/TeamSection';
import { ReviewsSection } from '../sections/ReviewsSection';
import { CtaSection } from '../sections/CtaSection';
import { ContactSection } from '../sections/ContactSection';
import { PublicBookingFlow } from '../components/PublicBookingFlow';
import { SalonPageRenderer } from '../SalonPageRenderer';
import { Duotone, Ornament, themeVars } from '../sections/kit';
import { SectionProps } from '../sections/types';

/* ── sample salon ──────────────────────────────────────── */

// Soft gradient "photos" so layouts can be judged with images without shipping any.
const photo = (a: string, b: string, c: string) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1500" viewBox="0 0 1200 1500"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient><filter id="f"><feGaussianBlur stdDeviation="90"/></filter></defs><rect width="1200" height="1500" fill="url(#g)"/><g filter="url(#f)"><circle cx="380" cy="520" r="300" fill="${c}"/><circle cx="860" cy="1060" r="360" fill="${a}" opacity=".7"/><ellipse cx="760" cy="380" rx="240" ry="160" fill="#fff" opacity=".35"/></g></svg>`)}`;
const img = (a: string, b: string, c: string, alt = '') => [{ url: photo(a, b, c), alt, isPrimary: true }];
const LOGO = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="240" height="120" viewBox="0 0 240 120"><circle cx="60" cy="60" r="52" fill="none" stroke="#7a5a3a" stroke-width="3"/><text x="60" y="76" text-anchor="middle" font-family="Georgia" font-size="46" fill="#7a5a3a">ML</text><text x="128" y="70" font-family="Georgia" font-size="26" fill="#7a5a3a">Maison Lina</text></svg>')}`;

const day = { start: '09:00', end: '19:00' };
const sample: SalonPublicData = {
  profile: {
    _id: 'sample', slug: 'maison-lina-beaute', establishmentName: 'Maison Lina Beauté',
    description: 'Coiffure, soins du visage et beauté des mains au cœur d’Alger.',
    presentation: 'Depuis 2014, Maison Lina accueille ses clientes rue Didouche Mourad, dans un appartement haussmannien baigné de lumière.\nNous travaillons la couleur à la main, sur rendez-vous, avec des soins choisis pour chaque cheveu et chaque peau.',
    address: '12 rue Didouche Mourad, 16000 Alger', publicPhone: '0550 12 34 56', email: 'contact@maisonlina.dz',
    banner: photo('#c9a27e', '#5b3a29', '#e8d3bd'),
    businessHours: { saturday: day, sunday: day, monday: day, tuesday: day, wednesday: day, thursday: { start: '09:00', end: '20:00' } },
    settings: { currency: 'DZD' }, showTeamOnPublicPage: true,
  },
  services: [
    { _id: 's1', name: 'Coupe & brushing', description: 'Coupe sur mesure, shampoing soin et brushing.', category: 'Coiffure', duration: 60, price: 2500, images: img('#d7b59a', '#6e4630', '#f2e2d2') },
    { _id: 's2', name: 'Balayage', description: 'Éclaircissement à main levée, patine et soin.', category: 'Coiffure', duration: 180, price: 9000, images: img('#e9c98f', '#8a5a2b', '#fff1d6') },
    { _id: 's3', name: 'Coloration', description: 'Couleur complète racines et longueurs.', category: 'Coiffure', duration: 120, price: 6000, images: [] },
    { _id: 's4', name: 'Lissage kératine', description: 'Cheveux disciplinés jusqu’à quatre mois.', category: 'Coiffure', duration: 150, price: 12000, images: [] },
    { _id: 's5', name: 'Soin du visage éclat', description: 'Nettoyage, gommage, masque et massage.', category: 'Esthétique', duration: 60, price: 3500, images: img('#efd5c8', '#a8706a', '#fbeae3') },
    { _id: 's6', name: 'Épilation sourcils', description: 'Au fil ou à la cire.', category: 'Esthétique', duration: 20, price: 600, images: [] },
    { _id: 's7', name: 'Manucure semi-permanent', description: 'Mise en forme, cuticules et pose couleur.', category: 'Ongles', duration: 60, price: 2200, images: img('#e6a6b4', '#7d3248', '#f8d9e0') },
    { _id: 's8', name: 'Pédicure spa', description: 'Bain, gommage et vernis.', category: 'Ongles', duration: 50, price: 2000, images: [] },
    { _id: 's9', name: 'Maquillage mariée', description: 'Essai inclus, tenue toute la journée.', category: 'Mariage', duration: 90, price: 15000, images: img('#f1e3cf', '#b08d57', '#fffaf0') },
  ],
  team: [
    { _id: 't1', firstName: 'Lina', lastName: 'Benali', role: 'Fondatrice, coloriste', specialties: ['Balayage', 'Couleur'], avatar: photo('#caa58a', '#4c3226', '#efd9c6') },
    { _id: 't2', firstName: 'Amira', lastName: 'Kaci', role: 'Coiffeuse', specialties: ['Coupe', 'Chignon'], avatar: photo('#b9a3a0', '#4a3a3c', '#e6d8d4') },
    { _id: 't3', firstName: 'Sara', lastName: 'Hadj', role: 'Esthéticienne', specialties: ['Soins visage'] },
    { _id: 't4', firstName: 'Yasmine', lastName: 'Ould', role: 'Prothésiste ongulaire', specialties: ['Semi-permanent', 'Nail art'], avatar: photo('#d9b0b8', '#5e3140', '#f6dfe4') },
  ],
  reviews: [
    { _id: 'r1', author: 'Nadia B.', rating: 5, comment: 'Lina a compris exactement le blond que je voulais. Accueil chaleureux, résultat lumineux, je ne vais plus ailleurs.', date: '2026-10-20' },
    { _id: 'r2', author: 'Lydia C.', rating: 4, comment: 'Très bon soin visage, peau lumineuse pendant une semaine.', date: '2026-10-12' },
    { _id: 'r3', author: 'Imane K.', rating: 5, comment: 'Ma manucure a tenu trois semaines.', date: '2026-09-30' },
    { _id: 'r4', author: 'Sonia M.', rating: 5, comment: 'Maquillage parfait pour mon mariage, il a tenu jusqu’au bout de la nuit.', date: '2026-09-02' },
    { _id: 'r5', author: 'Rym A.', rating: 3, comment: 'Bon résultat mais un peu d’attente.', date: '2026-08-15' },
    { _id: 'r6', author: 'Hana T.', rating: 5, comment: 'Salon calme et propre, équipe aux petits soins.', date: '2026-07-28' },
  ],
};

const stripImages = (d: SalonPublicData): SalonPublicData => ({
  ...d,
  profile: { ...d.profile, banner: undefined },
  services: d.services.map(s => ({ ...s, images: [] })),
  team: d.team.map(m => ({ ...m, avatar: undefined })),
});

/* ── page ──────────────────────────────────────────────── */

const SECTIONS: Record<SectionKey, React.ComponentType<SectionProps>> = {
  hero: HeroSection, about: AboutSection, services: ServicesSection, gallery: GallerySection,
  team: TeamSection, reviews: ReviewsSection, cta: CtaSection, contact: ContactSection,
};

const withVariant = (t: DesignTemplate, key: SectionKey, variant: string): DesignTemplate =>
  ({ ...t, sections: { ...t.sections, [key]: { variant, order: 0, enabled: true } } }) as DesignTemplate;

export default function LayoutsPage() {
  const [q, setQ] = useSearchParams();
  const set = (k: string, v: string) => { const n = new URLSearchParams(q); n.set(k, v); setQ(n, { replace: true }); };
  const template = getTemplateById(q.get('template') || 'studio');
  const source = q.get('data') || 'sample';
  const images = q.get('images') !== '0';
  const only = q.get('section') as SectionKey | null;
  const api = useSalonPublicData(source === 'api' ? 'maison-lina-beaute' : '');
  const [booking, setBooking] = useState<DesignTemplate | null>(null);

  const data = useMemo(() => {
    let d = source === 'api' && api.data ? api.data : sample;
    if (!images) d = stripImages(d);
    if (q.get('logo') === '1') d = { ...d, profile: { ...d.profile, logo: LOGO } };
    return d;
  }, [source, api.data, images, q]);

  const keys = (Object.keys(sectionVariants) as SectionKey[]).filter(k => !only || k === only);
  const bar = 'sticky top-0 z-40 flex flex-wrap items-center gap-3 px-4 py-2 bg-zinc-900 text-zinc-100 text-sm';
  const ctl = 'bg-zinc-800 rounded px-2 py-1';

  return (
    <div className="min-h-screen bg-zinc-100">
      <link rel="stylesheet" href={template.fonts} />
      <div className={bar}>
        <strong>Layouts</strong>
        <select className={ctl} value={template.id} onChange={e => set('template', e.target.value)}>
          {allTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <select className={ctl} value={source} onChange={e => set('data', e.target.value)}>
          <option value="sample">sample salon</option><option value="api">API demo (maison-lina-beaute)</option>
        </select>
        <label className="flex items-center gap-1"><input type="checkbox" checked={images} onChange={e => set('images', e.target.checked ? '1' : '0')} /> images</label>
        <label className="flex items-center gap-1"><input type="checkbox" checked={q.get('logo') === '1'} onChange={e => set('logo', e.target.checked ? '1' : '0')} /> logo</label>
        <select className={ctl} value={only ?? ''} onChange={e => set('section', e.target.value)}>
          <option value="">all sections</option>
          {[...Object.keys(sectionVariants), 'extras'].map(k => <option key={k} value={k}>{k}</option>)}
        </select>
        <span className="flex gap-1">
          {bookingVariants.map(v => (
            <button key={v} type="button" className={ctl} onClick={() => setBooking({ ...template, booking: { variant: v } })}>booking: {v}</button>
          ))}
        </span>
      </div>

      {q.get('full') === '1' && <SalonPageRenderer template={template} data={data} onBook={() => setBooking(template)} />}

      {q.get('full') !== '1' && keys.map(key => sectionVariants[key].map(variant => {
        const Section = SECTIONS[key];
        const t = withVariant(template, key, variant);
        return (
          <div key={`${key}-${variant}`} id={`${key}-${variant}`}>
            <div className="px-4 py-1.5 bg-zinc-800 text-zinc-100 font-mono text-xs">{key} · {variant}</div>
            <div className="sp" style={themeVars(t)}><Section template={t} data={data} onBook={() => setBooking(template)} /></div>
          </div>
        );
      }))}

      {q.get('full') !== '1' && (!only || (only as string) === 'extras') && <>
        <div className="px-4 py-1.5 bg-zinc-800 text-zinc-100 font-mono text-xs">ornaments</div>
        <div className="sp" style={themeVars(template)}>
          {ornaments.filter(o => o !== 'none').map(o => (
            <div key={o}><p className="sp-wrap py-2 font-mono text-xs">{o}</p><Ornament template={{ ...template, ornament: o }} /></div>
          ))}
        </div>
        {imageTreatments.map(it => (
          <div key={it}>
            <div className="px-4 py-1.5 bg-zinc-800 text-zinc-100 font-mono text-xs">imageTreatment · {it}</div>
            <div className={`sp sp-img-${it}`} style={{ ...themeVars(template), '--sp-duo': `url(#duo-${it})` } as React.CSSProperties}>
              <Duotone template={template} id={`duo-${it}`} />
              <HeroSection template={withVariant(template, 'hero', 'mosaic')} data={data} onBook={() => {}} />
              <GallerySection template={withVariant(template, 'gallery', 'grid')} data={data} onBook={() => {}} />
            </div>
          </div>
        ))}
      </>}

      {booking && (
        <PublicBookingFlow
          template={booking}
          serviceId={data.services[0]?._id ?? ''}
          slug={data.profile.slug}
          services={data.services}
          team={data.team}
          profile={data.profile}
          onClose={() => setBooking(null)}
        />
      )}
    </div>
  );
}
