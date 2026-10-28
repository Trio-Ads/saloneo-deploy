import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ClockIcon, MapPinIcon, StarIcon } from '@heroicons/react/20/solid';
import { salonTemplate } from '../templates';
import { formatPrice } from '../../utils/currency';
import { DirectoryCard } from './api';

const isDark = (hex: string) => {
  const f = hex.length === 4 ? hex.slice(1).split('').map(c => c + c).join('') : hex.slice(1, 7);
  const [r, g, b] = [0, 2, 4].map(i => parseInt(f.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.55;
};
const initials = (name: string) => name.split(/\s+/).filter(w => /^\p{L}/u.test(w)).slice(0, 2).map(w => w[0]).join('').toUpperCase();

/** One salon of the directory: banner (or its name set in the salon's accent color), logo, place, trades, rating, price. */
export function SalonCard({ salon }: { salon: DirectoryCard }) {
  const { t, i18n } = useTranslation('marketing', { keyPrefix: 'directory' });
  const accent = salonTemplate(salon.theme).theme.colors.primary;
  const onAccent = isDark(accent) ? '#fff' : '#18181B';
  const place = [salon.city, salon.wilaya !== salon.city && salon.wilaya].filter(Boolean).join(', ');
  const rating = salon.ratingAvg?.toLocaleString(i18n.language, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const slot = salon.nextSlot;
  const time = slot?.time.replace(/^0(?=\d:)/, '');
  const lang = Intl.DateTimeFormat.supportedLocalesOf([i18n.language]).length ? i18n.language : 'fr';
  const when = slot && (slot.inDays === 0 ? t('card.today', { time }) : slot.inDays === 1 ? t('card.tomorrow', { time })
    : t('card.day', { day: new Intl.DateTimeFormat(lang, { weekday: 'short', timeZone: 'UTC' }).format(new Date(`${slot.date}T12:00:00Z`)), time }));

  return (
    <Link
      to={`/salon/${salon.slug}`}
      className="group flex w-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-colors duration-150 ease-out hover:border-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700 dark:focus-visible:ring-offset-gray-950"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-gray-800">
        {salon.banner ? (
          <img src={salon.banner} alt="" loading="lazy" decoding="async" className="size-full object-cover" />
        ) : (
          <div aria-hidden className="relative size-full" style={{ background: accent, color: onAccent }}>
            {/* Soft monogram in the salon's accent: reads like a photo without repeating the name below. */}
            <span className="absolute -bottom-[0.18em] end-3 select-none font-display text-[9rem] font-semibold leading-none tracking-[-0.06em] opacity-[0.16]">{initials(salon.name)}</span>
          </div>
        )}
      </div>

      <div className="relative flex flex-1 flex-col px-4 pb-4 pt-9">
        <span
          className="absolute -top-7 start-4 grid size-14 place-items-center overflow-hidden rounded-full border-[3px] border-white bg-white text-base font-semibold shadow-sm dark:border-gray-900"
          style={salon.logo ? undefined : { background: accent, color: onAccent }}
          aria-hidden
        >
          {salon.logo ? <img src={salon.logo} alt="" loading="lazy" className="size-full object-contain p-1" /> : initials(salon.name)}
        </span>

        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50">{salon.name}</h3>
        {place && (
          <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
            <MapPinIcon className="size-4 shrink-0 text-gray-400" aria-hidden />
            <span className="truncate">{place}</span>
          </p>
        )}
        {salon.categories.length > 0 && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{salon.categories.map(c => t(`categories.${c}`)).join(' · ')}</p>
        )}
        {when && (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
            <ClockIcon className="size-4 shrink-0 text-gray-400" aria-hidden />
            <span>{t('card.nextSlot')} <span className="font-medium tabular-nums text-gray-900 dark:text-gray-50">{when}</span></span>
          </p>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div className="min-w-0 text-sm">
            {salon.ratingCount > 0 ? (
              <p className="flex items-center gap-1 text-gray-900 dark:text-gray-50">
                <StarIcon className="size-4 text-orange-500" aria-hidden />
                <span className="font-semibold tabular-nums">{rating}</span>
                <span className="text-gray-500 dark:text-gray-400">· {t('card.reviews', { count: salon.ratingCount })}</span>
              </p>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">{t('card.new')}</p>
            )}
            {salon.minPrice !== null && (
              <p className="mt-0.5 tabular-nums text-gray-600 dark:text-gray-300">{t('card.from', { price: formatPrice(salon.minPrice, salon.currency) })}</p>
            )}
          </div>
          <span className="btn-secondary shrink-0 group-hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">{t('card.book')}</span>
        </div>
      </div>
    </Link>
  );
}

export function SalonCardSkeleton() {
  return (
    <div aria-hidden className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="aspect-[16/9] animate-pulse bg-gray-100 motion-reduce:animate-none dark:bg-gray-800" />
      <div className="space-y-2.5 px-4 pb-4 pt-9">
        <div className="h-4 w-2/3 rounded bg-gray-100 dark:bg-gray-800" />
        <div className="h-3.5 w-1/3 rounded bg-gray-100 dark:bg-gray-800" />
        <div className="h-3.5 w-1/2 rounded bg-gray-100 dark:bg-gray-800" />
        <div className="flex items-end justify-between pt-3">
          <div className="h-3.5 w-24 rounded bg-gray-100 dark:bg-gray-800" />
          <div className="h-10 w-24 rounded-xl bg-gray-100 dark:bg-gray-800" />
        </div>
      </div>
    </div>
  );
}
