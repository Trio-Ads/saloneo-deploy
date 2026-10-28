// Dev-only (/dev/layouts): every variant of every public section, for picking layouts when defining templates.
// Query: ?template=<id>&data=sample|kit:<kit>|api&images=0|1&logo=0|1&section=<key>|extras, full=1 renders the whole page instead
import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { allTemplates, getTemplateById } from '../../templates';
import { DesignTemplate, SectionKey, bookingVariants, imageTreatments, ornaments, sectionVariants } from '../../templates/types';
import { SampleKit, sampleKits, sampleSalonFor, sampleSalons, withoutPhotos } from '../../templates/samples';
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

const LOGO = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="240" height="120" viewBox="0 0 240 120"><circle cx="60" cy="60" r="52" fill="none" stroke="#7a5a3a" stroke-width="3"/><text x="60" y="76" text-anchor="middle" font-family="Georgia" font-size="46" fill="#7a5a3a">ML</text><text x="128" y="70" font-family="Georgia" font-size="26" fill="#7a5a3a">Maison Lina</text></svg>')}`;

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
    // "sample" = the photo kit of the template's trade, "kit:<kit>" picks one.
    const kit = source.startsWith('kit:') ? sampleSalons[source.slice(4) as SampleKit] : undefined;
    let d = source === 'api' && api.data ? api.data : kit ?? sampleSalonFor(template);
    if (!images) d = withoutPhotos(d);
    if (q.get('logo') === '1') d = { ...d, profile: { ...d.profile, logo: LOGO } };
    return d;
  }, [source, api.data, images, q, template]);

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
          <option value="sample">sample salon (template kit)</option>
          {sampleKits.map(k => <option key={k} value={`kit:${k}`}>kit: {k}</option>)}
          <option value="api">API demo (maison-lina-beaute)</option>
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
