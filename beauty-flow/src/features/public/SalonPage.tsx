// beauty-flow/src/features/public/SalonPage.tsx
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { getTemplateById } from '../templates';
import { useSalonPublicData } from './hooks/useSalonPublicData';
import { SalonPageRenderer } from './SalonPageRenderer';
import { PublicBookingFlow } from './components/PublicBookingFlow';
import { PublicNavbar } from './components/PublicNavbar';
import { PublicFooter } from './components/PublicFooter';

export default function SalonPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, loading, error } = useSalonPublicData(slug || '');
  const [bookingServiceId, setBookingServiceId] = useState<string | null>(null);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement…</div>;
  if (error || !data) return <div className="min-h-screen flex items-center justify-center">{error}</div>;

  const templateId = data.profile.theme?.selectedTemplateId || 'saloneo-classic';
  const template = getTemplateById(templateId) || getTemplateById('saloneo-classic')!;

  return (
    <div
      style={{
        backgroundColor: template.theme.colors.background,
        color: template.theme.colors.text,
        fontFamily: template.theme.typography.bodyFont,
      }}
    >
      {template.customCSS && (
        <style dangerouslySetInnerHTML={{ __html: template.customCSS }} />
      )}
      <PublicNavbar template={template} data={data} onBook={() => setBookingServiceId(data.services[0]?._id || null)} />
      <SalonPageRenderer template={template} data={data} onBook={setBookingServiceId} />
      <PublicFooter template={template} data={data} />
      {bookingServiceId && (
        <PublicBookingFlow
          template={template}
          serviceId={bookingServiceId}
          slug={slug || ''}
          services={data.services}
          team={data.team}
          onClose={() => setBookingServiceId(null)}
        />
      )}
    </div>
  );
}
