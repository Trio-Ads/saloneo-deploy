import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { DesignTemplate } from '../../templates';
import { sampleSalons, withoutPhotos } from '../../templates/samples';
import { SalonPageRenderer } from '../../public/SalonPageRenderer';
import { SalonPublicData } from '../../public/types';
import { useSalonPublicData } from '../../public/hooks/useSalonPublicData';
import { useProfileStore } from '../../profile/store';

// Shown when the salon has no services/team/reviews yet, so every template still previews as a full page.
// Without photos: "Mon salon" never shows stock pictures as if they were the salon's.
const sample = withoutPhotos(sampleSalons.coiffure);

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
