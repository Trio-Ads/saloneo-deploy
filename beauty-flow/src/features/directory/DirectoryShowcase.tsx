import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { container } from '../marketing/components/site';
import { SalonCard } from './SalonCard';
import { DirectoryCard, fetchDirectory } from './api';

/** Landing: "Ils sont sur Saloneo", up to 6 real salons from the directory; hidden under 3. */
export default function DirectoryShowcase() {
  const { t } = useTranslation('marketing', { keyPrefix: 'directory' });
  const [salons, setSalons] = useState<DirectoryCard[]>([]);
  useEffect(() => { fetchDirectory({ limit: 6 }).then((r) => setSalons(r.salons)).catch(() => {}); }, []);
  if (salons.length < 3) return null;

  return (
    <section className="border-t border-gray-200 py-20 sm:py-28 dark:border-gray-800">
      <div className={container}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-semibold leading-tight tracking-[-0.025em] sm:text-[2.75rem]">{t('showcase.title')}</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">{t('showcase.body')}</p>
          </div>
          <Link to="/salons" className="inline-flex shrink-0 items-center gap-1 font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400">
            {t('showcase.all')} <ArrowRightIcon className="size-4 rtl:rotate-180" />
          </Link>
        </div>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {salons.map((s) => <li key={s.slug} className="flex"><SalonCard salon={s} /></li>)}
        </ul>
      </div>
    </section>
  );
}
