// beauty-flow/src/features/public/SalonPage.tsx
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { salonTemplate } from '../templates';
import { useSalonPublicData } from './hooks/useSalonPublicData';
import { SalonPageRenderer } from './SalonPageRenderer';
import { PublicBookingFlow } from './components/PublicBookingFlow';
import { PublicNavbar } from './components/PublicNavbar';
import { PublicFooter } from './components/PublicFooter';
import LoadingSpinner from './components/LoadingSpinner';
import { themeVars } from './sections/kit';
import { useSalonSeo } from '../directory/seo';

export default function SalonPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation('public');
  const { data, loading, error } = useSalonPublicData(slug || '');
  const [bookingServiceId, setBookingServiceId] = useState<string | null>(null);
  const template = useMemo(() => salonTemplate(data?.profile.theme), [data]);

  useSalonSeo(slug || '', data);

  if (loading) return <LoadingSpinner message={t('loading.message')} />;
  if (error || !data) {
    return <div className="min-h-screen grid place-items-center p-6 text-center text-zinc-600">{t('site.not_found')}</div>;
  }

  return (
    <div className="sp min-h-screen" style={themeVars(template)}>
      <PublicNavbar data={data} />
      <main>
        <SalonPageRenderer template={template} data={data} onBook={setBookingServiceId} />
      </main>
      <PublicFooter data={data} />
      {bookingServiceId && (
        <PublicBookingFlow
          template={template}
          serviceId={bookingServiceId}
          slug={slug || ''}
          services={data.services}
          team={data.team}
          profile={data.profile}
          onClose={() => setBookingServiceId(null)}
        />
      )}
    </div>
  );
}
