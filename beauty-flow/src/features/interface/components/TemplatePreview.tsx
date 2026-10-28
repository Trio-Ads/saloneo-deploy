import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { DesignTemplate } from '../../templates';
import { SalonPageRenderer } from '../../public/SalonPageRenderer';
import { SalonPublicData } from '../../public/types';
import { useSalonPublicData } from '../../public/hooks/useSalonPublicData';
import { useProfileStore } from '../../profile/store';

// Shown when the salon has no services/team/reviews yet, so every template still previews as a full page.
const sample: SalonPublicData = {
  profile: {
    _id: 'sample',
    establishmentName: 'Maison Lina Beauté',
    slug: 'sample',
    description: 'Coiffure, soins et beauté des mains au cœur d’Alger.',
    address: '12 rue Didouche Mourad, Alger',
    publicPhone: '0550 12 34 56',
    settings: { currency: 'DZD' },
    showTeamOnPublicPage: true,
  },
  services: [
    { _id: 's1', name: 'Brushing', description: 'Lavage, soin et brushing.', category: 'Coiffure', duration: 45, price: 1500, images: [] },
    { _id: 's2', name: 'Coloration', description: 'Couleur complète et soin.', category: 'Coiffure', duration: 120, price: 6000, images: [] },
    { _id: 's3', name: 'Soin du visage', description: 'Nettoyage et hydratation.', category: 'Esthétique', duration: 60, price: 3500, images: [] },
    { _id: 's4', name: 'Manucure', description: 'Mise en forme et vernis.', category: 'Ongles', duration: 40, price: 1200, images: [] },
  ],
  team: [
    { _id: 't1', firstName: 'Lina', lastName: 'B.', role: 'Coiffeuse' },
    { _id: 't2', firstName: 'Sara', lastName: 'K.', role: 'Esthéticienne' },
    { _id: 't3', firstName: 'Amel', lastName: 'D.', role: 'Prothésiste ongulaire' },
  ],
  reviews: [
    { _id: 'r1', author: 'Nadia', rating: 5, comment: 'Accueil chaleureux et résultat parfait.', date: '2026-09-12' },
    { _id: 'r2', author: 'Yasmine', rating: 5, comment: 'Ma coloration tient depuis des semaines.', date: '2026-08-30' },
    { _id: 'r3', author: 'Imane', rating: 4, comment: 'Très professionnel, je reviendrai.', date: '2026-08-02' },
  ],
};

/** The salon's real public data, topped up with sample content where it is empty. */
export function usePreviewData() {
  const slug = useProfileStore((s) => s.profile.slug) || '';
  const { data } = useSalonPublicData(slug);
  const preview: SalonPublicData = {
    profile: { ...sample.profile, ...data?.profile },
    services: data?.services?.length ? data.services : sample.services,
    team: data?.team?.length ? data.team : sample.team,
    reviews: data?.reviews?.length ? data.reviews : sample.reviews,
  };
  return { data: preview, slug };
}

const SRC_DOC = '<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0"></body></html>';

/**
 * Renders the real public page for `template` inside a same-origin iframe (so media queries see
 * `width`, and template CSS stays out of the app), scaled down to fit the box. Mounts on first view.
 */
export function TemplateFrame({ template, data, width = 1280, interactive = false, className }: {
  template: DesignTemplate;
  data: SalonPublicData;
  width?: number;
  interactive?: boolean;
  className?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [seen, setSeen] = useState(false);
  const [body, setBody] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const el = box.current!;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setSeen(true), { rootMargin: '300px' });
    ro.observe(el);
    io.observe(el);
    return () => { ro.disconnect(); io.disconnect(); };
  }, []);

  const onLoad = (e: React.SyntheticEvent<HTMLIFrameElement>) => {
    const doc = e.currentTarget.contentDocument;
    if (!doc) return;
    document.querySelectorAll('style, link[rel="stylesheet"]').forEach((n) => doc.head.appendChild(n.cloneNode(true)));
    doc.documentElement.dir = document.documentElement.dir;
    doc.documentElement.lang = document.documentElement.lang;
    setBody(doc.body);
  };

  const scale = size ? size.w / width : 0;
  const { colors, typography } = template.theme;

  return (
    <div ref={box} aria-hidden={!interactive} className={clsx('relative overflow-hidden', className)} style={{ background: colors.background }}>
      {seen && scale > 0 && (
        <iframe
          title={template.name}
          srcDoc={SRC_DOC}
          onLoad={onLoad}
          tabIndex={interactive ? 0 : -1}
          className="absolute top-0 border-0"
          style={{
            left: 0,
            width,
            height: size!.h / scale,
            transform: `scale(${scale})`,
            transformOrigin: '0 0',
            pointerEvents: interactive ? 'auto' : 'none',
          }}
        />
      )}
      {body && createPortal(
        <div style={{ backgroundColor: colors.background, color: colors.text, fontFamily: typography.bodyFont, minHeight: '100vh' }}>
          {template.customCSS && <style>{template.customCSS}</style>}
          <SalonPageRenderer template={template} data={data} onBook={() => {}} />
        </div>,
        body,
      )}
    </div>
  );
}
