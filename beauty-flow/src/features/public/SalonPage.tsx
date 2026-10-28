// beauty-flow/src/features/public/SalonPage.tsx
import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
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
import { usePublicBookingStore } from './store';
import { waitlistAPI, WaitlistOfferView } from './waitlist';

export default function SalonPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation('public');
  const { data, loading, error } = useSalonPublicData(slug || '');
  const [bookingServiceId, setBookingServiceId] = useState<string | null>(null);
  const template = useMemo(() => salonTemplate(data?.profile.theme), [data]);

  // Waitlist offer link (?offer=…): open the booking sheet on the offered slot, or say why it is gone
  const [params] = useSearchParams();
  const offerToken = params.get('offer');
  const [offer, setOffer] = useState<WaitlistOfferView | null>(null);
  const [offerNotice, setOfferNotice] = useState<string | null>(null);
  useEffect(() => {
    if (!offerToken) return;
    waitlistAPI.offer(offerToken).then(({ data: o }) => {
      if (o.valid) { setOffer(o); setBookingServiceId(o.serviceId); } else setOfferNotice(o.reason || 'expired');
    }).catch(() => setOfferNotice('expired'));
  }, [offerToken]);
  // Prefill slot and client once the sheet has opened (and reset) itself — next tick, so React's dev double-run of its effects cannot wipe it
  useEffect(() => {
    if (!offer || !data || bookingServiceId !== offer.serviceId) return;
    const id = setTimeout(() => {
      const { bookingData, updateBookingData } = usePublicBookingStore.getState();
      // Two calls: the store merges clientData alone when it is present
      updateBookingData({ date: offer.date, startTime: offer.time, stylistId: offer.stylistId, waitlistOffer: offerToken || undefined });
      updateBookingData({ clientData: { ...bookingData.clientData, firstName: offer.client?.firstName || '', lastName: offer.client?.lastName || '', phone: offer.client?.phone || '', email: offer.client?.email || '' } });
      setOffer(null);
    });
    return () => clearTimeout(id);
  }, [offer, data, bookingServiceId, offerToken]);

  useSalonSeo(slug || '', data);

  if (loading) return <LoadingSpinner message={t('loading.message')} />;
  if (error || !data) {
    return <div className="min-h-screen grid place-items-center p-6 text-center text-zinc-600">{t('site.not_found')}</div>;
  }

  return (
    <div className="sp min-h-screen" style={themeVars(template)}>
      <PublicNavbar data={data} />
      {offerNotice && (
        <div role="status" className="mx-auto max-w-3xl px-4 pt-4">
          <div className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700 shadow-sm">
            <p className="flex-1">{t(`waitlist.offer.${offerNotice}`)}</p>
            <button type="button" className="-m-2 grid size-10 shrink-0 place-items-center rounded-lg text-zinc-500 hover:bg-zinc-100" onClick={() => setOfferNotice(null)} aria-label={t('modal.close')}>
              <XMarkIcon className="size-5" />
            </button>
          </div>
        </div>
      )}
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
