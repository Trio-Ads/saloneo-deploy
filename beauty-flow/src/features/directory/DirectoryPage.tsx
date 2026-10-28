import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { MagnifyingGlassIcon, MapPinIcon, ChevronDownIcon } from '@heroicons/react/20/solid';
import { BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import { SiteNav, SiteFooter, container } from '../marketing/components/site';
import { EmptyState } from '../../components/ui';
import { SalonCard, SalonCardSkeleton } from './SalonCard';
import { usePageMeta, salonLd } from './seo';
import {
  CATEGORIES, Category, DirectoryCard, DirectoryFacets, directoryPath, fetchDirectory, fetchFacets, isCategory, wilayaBySlug,
} from './api';

const PAGE = 12;

/** Saloneo directory: every salon taking online bookings. /salons, /salons/:wilaya, /salons/:category, /salons/:wilaya/:category. */
export default function DirectoryPage() {
  const { t, i18n } = useTranslation('marketing', { keyPrefix: 'directory' });
  const navigate = useNavigate();
  const { a, b } = useParams<{ a?: string; b?: string }>();
  const [params, setParams] = useSearchParams();

  // The first segment is a wilaya or a category; the two lists never share a slug.
  const wilaya = a && wilayaBySlug.has(a) ? a : undefined;
  const category = [b, a].find(isCategory) as Category | undefined;
  const invalid = (a && !wilaya && !isCategory(a)) || (b && !(wilaya && isCategory(b)));
  const q = params.get('q') || '';

  const [search, setSearch] = useState(q);
  const [facets, setFacets] = useState<DirectoryFacets | null>(null);
  const [salons, setSalons] = useState<DirectoryCard[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [status, setStatus] = useState<'loading' | 'more' | 'ready' | 'error'>('loading');
  const [retry, setRetry] = useState(0);

  useEffect(() => { fetchFacets({ wilaya, category }).then(setFacets).catch(() => {}); }, [wilaya, category]);
  // Back/forward or a link changed ?q=: show it (without eating the space being typed).
  useEffect(() => { setSearch((s) => (s.trim() === q ? s : q)); }, [q]);

  // Typing updates ?q= after a short pause (replace, so Back leaves the page instead of undoing letters).
  useEffect(() => {
    if (search.trim() === q) return;
    const id = setTimeout(() => {
      const next = new URLSearchParams(params);
      if (search.trim()) next.set('q', search.trim()); else next.delete('q');
      setParams(next, { replace: true });
    }, 300);
    return () => clearTimeout(id);
  }, [search, q, params, setParams]);

  // First page on every filter change.
  useEffect(() => {
    if (invalid) return;
    const ctrl = new AbortController();
    setStatus('loading');
    fetchDirectory({ q: q || undefined, wilaya, category, page: 1, limit: PAGE }, ctrl.signal)
      .then((r) => { setSalons(r.salons); setTotal(r.total); setHasMore(r.hasMore); setPage(1); setStatus('ready'); })
      .catch(() => { if (!ctrl.signal.aborted) setStatus('error'); });
    return () => ctrl.abort();
  }, [q, wilaya, category, invalid, retry]);

  const loadMore = () => {
    setStatus('more');
    fetchDirectory({ q: q || undefined, wilaya, category, page: page + 1, limit: PAGE })
      .then((r) => { setSalons((s) => [...s, ...r.salons]); setHasMore(r.hasMore); setPage(page + 1); setStatus('ready'); })
      .catch(() => setStatus('ready'));
  };

  const wilayaName = wilaya && wilayaBySlug.get(wilaya)!.name;
  const what = category && t(`plural.${category}`);
  const heading = what && wilayaName ? t('heading.both', { what, wilaya: wilayaName })
    : what ? t('heading.category', { what })
    : wilayaName ? t('heading.wilaya', { wilaya: wilayaName })
    : t('heading.all');
  const ld = useMemo(() => salons.length ? JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: heading,
    numberOfItems: total,
    itemListElement: salons.map((s, i) => ({ '@type': 'ListItem', position: i + 1, item: salonLd(s) })),
  }) : undefined, [salons, total, heading]);
  usePageMeta(`${heading} | Saloneo`, wilayaName ? t('seo.description', { what: what || t('seo.salons'), wilaya: wilayaName }) : t('seo.descriptionAll', { what: what || t('seo.salons') }), ld);

  // Keep a selected wilaya in the menu even when it has no salon yet.
  const wilayaOptions = useMemo(() => {
    const list = facets?.wilayas ?? [];
    return wilaya && !list.some((w) => w.slug === wilaya)
      ? [...list, { ...wilayaBySlug.get(wilaya)!, slug: wilaya, count: 0 }].sort((x, y) => x.code - y.code)
      : list;
  }, [facets, wilaya]);
  const categoryCounts = new Map(facets?.categories.map((c) => [c.slug, c.count]));
  const shownCategories = CATEGORIES.filter((c) => categoryCounts.has(c) || c === category);
  const keepQuery = q ? `?q=${encodeURIComponent(q)}` : '';
  const filtered = !!(q || wilaya || category);
  const nf = new Intl.NumberFormat(i18n.language);

  if (invalid) return <Navigate to="/salons" replace />;

  const chip = (active: boolean) => clsx(
    'inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-colors duration-150 ease-out',
    active
      ? 'border-gray-900 bg-gray-900 text-white dark:border-gray-50 dark:bg-gray-50 dark:text-gray-900'
      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:text-gray-50',
  );

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-[#0F1419] dark:text-gray-50">
      <SiteNav />

      <main>
        <section className="border-b border-gray-200 bg-gray-50 pb-8 pt-28 sm:pt-32 dark:border-gray-800 dark:bg-gray-900/40">
          <div className={container}>
            {filtered && (
              <nav aria-label={t('breadcrumb')} className="mb-3 text-sm text-gray-500 dark:text-gray-400">
                <Link to="/salons" className="hover:text-gray-900 dark:hover:text-gray-50">{t('nav')}</Link>
                {wilayaName && category && <> <span aria-hidden>/</span> <Link to={directoryPath(wilaya)} className="hover:text-gray-900 dark:hover:text-gray-50">{wilayaName}</Link></>}
              </nav>
            )}
            <h1 className="max-w-3xl font-display text-[2.25rem] font-semibold leading-[1.08] tracking-[-0.03em] sm:text-5xl">{heading}</h1>
            <p className="mt-3 max-w-2xl text-lg text-gray-600 dark:text-gray-300">{t('subtitle')}</p>

            <div className="mt-8 grid gap-2 sm:grid-cols-[1fr_16rem]">
              <label className="relative block">
                <span className="sr-only">{t('search.label')}</span>
                <MagnifyingGlassIcon className="pointer-events-none absolute start-3.5 top-1/2 size-5 -translate-y-1/2 text-gray-400" aria-hidden />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('search.placeholder')}
                  enterKeyHint="search"
                  className="field h-12 w-full ps-11 text-base sm:text-[0.9375rem] dark:border-gray-700 dark:bg-gray-900"
                />
              </label>
              <label className="relative block">
                <span className="sr-only">{t('wilaya.label')}</span>
                <MapPinIcon className="pointer-events-none absolute start-3.5 top-1/2 size-5 -translate-y-1/2 text-gray-400" aria-hidden />
                <select
                  value={wilaya || ''}
                  onChange={(e) => navigate(directoryPath(e.target.value || undefined, category) + keepQuery)}
                  className="field h-12 w-full appearance-none pe-10 ps-11 text-base sm:text-[0.9375rem] dark:border-gray-700 dark:bg-gray-900"
                >
                  <option value="">{t('wilaya.all')}</option>
                  {wilayaOptions.map((w) => (
                    <option key={w.slug} value={w.slug}>{`${String(w.code).padStart(2, '0')} · ${w.name}`}{w.count ? ` (${w.count})` : ''}</option>
                  ))}
                </select>
                <ChevronDownIcon className="pointer-events-none absolute end-3.5 top-1/2 size-5 -translate-y-1/2 text-gray-400" aria-hidden />
              </label>
            </div>

            {shownCategories.length > 0 && (
              <div className="-mx-4 mt-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 [scrollbar-width:none]">
                <ul className="flex gap-2 sm:flex-wrap" aria-label={t('categoriesLabel')}>
                  <li><Link to={directoryPath(wilaya) + keepQuery} className={chip(!category)} aria-current={!category ? 'page' : undefined}>{t('allCategories')}</Link></li>
                  {shownCategories.map((c) => (
                    <li key={c}>
                      <Link to={directoryPath(wilaya, c) + keepQuery} className={chip(c === category)} aria-current={c === category ? 'page' : undefined}>
                        {t(`categories.${c}`)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        <section className={clsx(container, 'py-8 sm:py-10')} aria-busy={status === 'loading'}>
          <p className="mb-5 h-5 text-sm text-gray-500 tabular-nums dark:text-gray-400" aria-live="polite">
            {status !== 'loading' && status !== 'error' && total > 0 && t('count', { count: total, formatted: nf.format(total) })}
          </p>

          {status === 'loading' ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }, (_, i) => <SalonCardSkeleton key={i} />)}
            </div>
          ) : status === 'error' ? (
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800">
              <EmptyState
                icon={BuildingStorefrontIcon}
                title={t('error.title')}
                body={t('error.body')}
                action={<button type="button" onClick={() => setRetry((n) => n + 1)} className="btn-secondary">{t('error.retry')}</button>}
              />
            </div>
          ) : salons.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800">
              {filtered ? (
                <EmptyState
                  icon={MagnifyingGlassIcon}
                  title={wilayaName && !q ? t('empty.wilayaTitle', { wilaya: wilayaName }) : t('empty.title')}
                  body={t('empty.body')}
                  action={<Link to="/salons" className="btn-secondary">{t('empty.reset')}</Link>}
                />
              ) : (
                <EmptyState
                  icon={BuildingStorefrontIcon}
                  title={t('empty.noneTitle')}
                  body={t('empty.noneBody')}
                  action={<Link to="/auth/register" className="btn-primary">{t('owner.cta')}</Link>}
                />
              )}
            </div>
          ) : (
            <>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {salons.map((s) => <li key={s.slug} className="flex"><SalonCard salon={s} /></li>)}
              </ul>
              {hasMore && (
                <div className="mt-8 flex justify-center">
                  <button type="button" onClick={loadMore} disabled={status === 'more'} className="btn-secondary h-11 px-6 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
                    {status === 'more' ? t('loadingMore') : t('more')}
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        <section className="border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/40">
          <div className={clsx(container, 'flex flex-col gap-5 py-12 sm:flex-row sm:items-center sm:justify-between')}>
            <div className="max-w-xl">
              <h2 className="font-display text-2xl font-semibold tracking-[-0.02em]">{t('owner.title')}</h2>
              <p className="mt-2 text-gray-600 dark:text-gray-300">{t('owner.body')}</p>
            </div>
            <Link to="/auth/register" className="btn-primary h-12 shrink-0 px-5">{t('owner.cta')}</Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
