import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import {
  CheckIcon, ChevronLeftIcon, ChevronRightIcon, ComputerDesktopIcon, DevicePhoneMobileIcon, EyeIcon,
  MagnifyingGlassIcon, MoonIcon, StarIcon, SunIcon, XMarkIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import { allTemplates, DesignTemplate, getTemplateById } from '../index';
import { familyOf, fold, modeOf, salonProfile, scoreTemplate, tagsOf } from '../gallery';
import { sampleSalonFor } from '../samples';
import { useInterfaceStore } from '../../interface/store';
import { TemplateFrame, usePreviewData } from '../../interface/components/TemplatePreview';
import { useServiceStore } from '../../services/store';
import { useProfileStore } from '../../profile/store';
import { Badge, EmptyState, IconButton, Segmented } from '../../../components/ui';
import { SalonPublicData } from '../../public/types';

interface TemplateGalleryProps {
  onTemplateSelect?: (template: DesignTemplate) => void;
}

const PAGE = 24;
const FAV_KEY = 'saloneo:template-favorites';
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ');
// A family is named after its founding template ("medina" → "Médina") unless the locale names it.
const useFamilyLabel = () => {
  const { t } = useTranslation('interface');
  return (f: string) => t(`gallery.families.${f}`, {
    defaultValue: t(`gallery.categories.${f}`, { defaultValue: allTemplates.find((tpl) => tpl.id === f)?.name ?? cap(f) }),
  });
};

function useFavorites() {
  const [favs, setFavs] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(FAV_KEY) || '[]'); } catch { return []; }
  });
  const toggle = (id: string) => setFavs((f) => {
    const next = f.includes(id) ? f.filter((x) => x !== id) : [...f, id];
    try { localStorage.setItem(FAV_KEY, JSON.stringify(next)); } catch { /* private mode: favourites last the session */ }
    return next;
  });
  return { favs, toggle };
}

const Palette = ({ template }: { template: DesignTemplate }) => (
  <div className="flex -space-x-1 rtl:space-x-reverse">
    {(['primary', 'secondary', 'accent', 'background'] as const).map((k) => (
      <span key={k} className="size-4 rounded-full ring-2 ring-white dark:ring-gray-900 border border-black/10" style={{ backgroundColor: template.theme.colors[k] }} />
    ))}
  </div>
);

/**
 * Mounts the live preview (an iframe rendering the real page) only near the viewport and drops it again
 * once far off-screen, so a gallery of 100+ templates keeps ~a screenful of iframes alive.
 */
function LazyFrame({ template, data }: { template: DesignTemplate; data: SalonPublicData }) {
  const ref = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);
  useEffect(() => {
    const el = ref.current!;
    const near = new IntersectionObserver(([e]) => e.isIntersecting && setLive(true), { rootMargin: '100px 0px' });
    const far = new IntersectionObserver(([e]) => !e.isIntersecting && setLive(false), { rootMargin: '400px 0px' });
    near.observe(el);
    far.observe(el);
    return () => { near.disconnect(); far.disconnect(); };
  }, []);
  const { colors } = template.theme;
  return (
    <div ref={ref} className="aspect-[16/10] w-full" style={{ background: colors.background }}>
      {live ? (
        <TemplateFrame template={template} data={data} className="size-full" />
      ) : (
        <div aria-hidden className="flex size-full flex-col justify-center gap-[6%] px-[10%]">
          <span className="h-[9%] w-1/2 rounded-full opacity-20" style={{ background: colors.text }} />
          <span className="h-[5%] w-3/4 rounded-full opacity-10" style={{ background: colors.text }} />
          <span className="h-[10%] w-1/4 rounded-full opacity-60" style={{ background: colors.primary }} />
        </div>
      )}
    </div>
  );
}

function TemplateCard({ template, data, isCurrent, isFav, onPreview, onApply, onFav }: {
  template: DesignTemplate;
  data: SalonPublicData;
  isCurrent: boolean;
  isFav: boolean;
  onPreview: () => void;
  onApply: () => void;
  onFav: () => void;
}) {
  const { t } = useTranslation('interface');
  const familyLabel = useFamilyLabel();
  const family = familyOf(template);
  const mode = modeOf(template);
  return (
    <div className={clsx('panel flex h-full flex-col overflow-hidden dark:bg-gray-900', isCurrent ? 'border-orange-500 ring-1 ring-orange-500 dark:border-orange-400 dark:ring-orange-400' : 'dark:border-gray-800')}>
      <button
        type="button"
        onClick={onPreview}
        aria-label={t('gallery.preview_of', { name: template.name })}
        className="block border-b border-gray-200 dark:border-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-500"
      >
        <LazyFrame template={template} data={data} />
      </button>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[0.9375rem] font-semibold text-gray-900 dark:text-gray-50">{template.name}</h3>
            {isCurrent && <Badge tone="orange"><CheckIcon className="size-3" />{t('gallery.applied')}</Badge>}
          </div>
          <p className="mt-0.5 line-clamp-1 text-sm text-gray-500 dark:text-gray-400">{t(`gallery.templates.${template.id}.tagline`, template.tagline)}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge>{familyLabel(family)}</Badge>
            <Badge>{mode === 'dark' ? <MoonIcon className="size-3" /> : <SunIcon className="size-3" />}{t(`gallery.mode.${mode}`)}</Badge>
          </div>
        </div>
        <div className="mt-auto flex items-center justify-between gap-2">
          <Palette template={template} />
          <div className="flex items-center gap-1">
            <IconButton label={t(isFav ? 'gallery.unfavorite' : 'gallery.favorite')} aria-pressed={isFav} onClick={onFav}>
              {isFav ? <StarSolidIcon className="size-5 text-orange-500 dark:text-orange-400" /> : <StarIcon className="size-5" />}
            </IconButton>
            <button type="button" onClick={onPreview} className="btn-ghost text-sm">
              <EyeIcon className="size-4" />{t('gallery.preview')}
            </button>
            {!isCurrent && <button type="button" onClick={onApply} className="btn-secondary text-sm">{t('apply')}</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({ onTemplateSelect }) => {
  const { t } = useTranslation('interface');
  const { applyTemplate, selectedTemplateId } = useInterfaceStore();
  const { data } = usePreviewData();
  const { favs, toggle } = useFavorites();
  const familyLabel = useFamilyLabel();
  const services = useServiceStore((s) => s.services);
  const fetchServices = useServiceStore((s) => s.fetchServices);
  const salonName = useProfileStore((s) => s.profile.establishmentName) || '';
  const [params, setParams] = useSearchParams();
  // Previews show the sample salon of the template's trade (with photos) unless the owner asks for their own data.
  const view = params.get('data') === 'mine' ? 'mine' : 'sample';
  const dataFor = (tpl: DesignTemplate) => (view === 'mine' ? data : sampleSalonFor(tpl));
  const [limit, setLimit] = useState(PAGE);
  const [previewing, setPreviewing] = useState<{ list: DesignTemplate[]; index: number } | null>(null);

  useEffect(() => { if (!services.length) fetchServices(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Filters live in the URL so a refresh (or a shared link) keeps them.
  const q = params.get('q') ?? '';
  const category = params.get('cat') ?? 'all';
  const family = params.get('family') ?? 'all';
  const mode = params.get('mode') ?? 'all';
  const sort = params.get('sort') ?? 'recommended';
  const tags = params.get('tags')?.split(',').filter(Boolean) ?? [];
  const favOnly = params.get('fav') === '1';
  const set = (key: string, value: string | null) => setParams((p) => {
    const next = new URLSearchParams(p);
    if (value) next.set(key, value); else next.delete(key);
    return next;
  }, { replace: true });
  const filtering = !!(q || category !== 'all' || family !== 'all' || mode !== 'all' || tags.length || favOnly);
  const reset = () => setParams((p) => {
    const next = new URLSearchParams(p);
    ['q', 'cat', 'family', 'mode', 'tags', 'fav'].forEach((k) => next.delete(k));
    return next;
  }, { replace: true });

  // Maps legacy ids and falls back to the default template, like the public page does.
  const currentId = getTemplateById(selectedTemplateId).id;

  const profile = useMemo(() => salonProfile([salonName, ...services.flatMap((s) => [s.name, s.category])]), [services, salonName]);
  const scores = useMemo(() => new Map(allTemplates.map((tpl) => [tpl.id, scoreTemplate(tpl, profile)])), [profile]);
  const recommended = useMemo(
    () => allTemplates.filter((tpl) => scores.get(tpl.id)! > 0).sort((a, b) => scores.get(b.id)! - scores.get(a.id)!).slice(0, 6),
    [scores],
  );

  const categories = ['all', ...new Set(allTemplates.map((tpl) => tpl.category))];
  const families = [...new Set(allTemplates.map(familyOf))].sort((a, b) => familyLabel(a).localeCompare(familyLabel(b)));
  const tagCounts = allTemplates.flatMap(tagsOf).reduce<Record<string, number>>((m, tag) => ({ ...m, [tag]: (m[tag] ?? 0) + 1 }), {});
  const topTags = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a]).slice(0, 14);
  const tagOptions = [...topTags, ...tags.filter((tag) => !topTags.includes(tag))];

  const results = useMemo(() => {
    const needle = fold(q.trim());
    const list = allTemplates.filter((tpl) => {
      if (category !== 'all' && tpl.category !== category) return false;
      if (family !== 'all' && familyOf(tpl) !== family) return false;
      if (mode !== 'all' && modeOf(tpl) !== mode) return false;
      if (favOnly && !favs.includes(tpl.id)) return false;
      if (tags.length && !tags.every((tag) => tagsOf(tpl).includes(tag))) return false;
      if (!needle) return true;
      return fold([tpl.name, tpl.tagline, t(`gallery.templates.${tpl.id}.tagline`, tpl.tagline), familyOf(tpl), tpl.category, ...tagsOf(tpl)].join(' ')).includes(needle);
    });
    // "recommended" ranks by fit with the salon, then keeps the curated collection order.
    if (sort === 'name') return list.sort((a, b) => a.name.localeCompare(b.name));
    return list.sort((a, b) => scores.get(b.id)! - scores.get(a.id)!);
  }, [q, category, family, mode, favOnly, favs, tags.join(), sort, scores, t]); // eslint-disable-line react-hooks/exhaustive-deps

  const showRecommended = !filtering && recommended.length > 0;
  // The recommended row already shows the best fits; the grid continues after them.
  const grid = showRecommended ? results.filter((tpl) => !recommended.includes(tpl)) : results;
  useEffect(() => setLimit(PAGE), [params]);

  const apply = (template: DesignTemplate) => {
    applyTemplate(template);
    onTemplateSelect?.(template);
  };

  const card = (template: DesignTemplate, list: DesignTemplate[], index: number) => (
    <TemplateCard
      template={template}
      data={dataFor(template)}
      isCurrent={template.id === currentId}
      isFav={favs.includes(template.id)}
      onPreview={() => setPreviewing({ list, index })}
      onApply={() => apply(template)}
      onFav={() => toggle(template.id)}
    />
  );

  const chip = (active: boolean) => clsx(
    'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors duration-150 ease-out',
    active
      ? 'border-orange-500 bg-orange-50 text-orange-700 dark:border-orange-400 dark:bg-orange-500/15 dark:text-orange-300'
      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-600',
  );
  const select = 'field w-full min-w-0 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100';

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row">
          <label className="relative block flex-1">
            <span className="sr-only">{t('gallery.search')}</span>
            <MagnifyingGlassIcon className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={q}
              onChange={(e) => set('q', e.target.value)}
              placeholder={t('gallery.search_placeholder')}
              className={clsx(select, 'ps-9')}
            />
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:flex">
            <select aria-label={t('gallery.family')} value={family} onChange={(e) => set('family', e.target.value === 'all' ? null : e.target.value)} className={clsx(select, 'col-span-2 sm:col-span-1 lg:w-44')}>
              <option value="all">{t('gallery.all_families')}</option>
              {families.map((f) => <option key={f} value={f}>{familyLabel(f)}</option>)}
            </select>
            <select aria-label={t('gallery.mode.label')} value={mode} onChange={(e) => set('mode', e.target.value === 'all' ? null : e.target.value)} className={clsx(select, 'lg:w-36')}>
              <option value="all">{t('gallery.mode.all')}</option>
              <option value="light">{t('gallery.mode.light')}</option>
              <option value="dark">{t('gallery.mode.dark')}</option>
            </select>
            <select aria-label={t('gallery.sort.label')} value={sort} onChange={(e) => set('sort', e.target.value === 'recommended' ? null : e.target.value)} className={clsx(select, 'lg:w-40')}>
              <option value="recommended">{t('gallery.sort.recommended')}</option>
              <option value="name">{t('gallery.sort.name')}</option>
            </select>
          </div>
        </div>

        {categories.length > 2 && (
          <Segmented
            value={category}
            onChange={(c) => set('cat', c === 'all' ? null : c)}
            options={categories.map((c) => ({ value: c, label: t(`gallery.categories.${c}`, { defaultValue: cap(c) }) }))}
          />
        )}

        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide sm:mx-0 sm:flex-wrap sm:px-0">
          <button type="button" aria-pressed={favOnly} onClick={() => set('fav', favOnly ? null : '1')} className={chip(favOnly)}>
            {favOnly ? <StarSolidIcon className="size-4" /> : <StarIcon className="size-4" />}
            {t('gallery.favorites')}
            {favs.length > 0 && <span className="tabular-nums text-gray-500 dark:text-gray-400">{favs.length}</span>}
          </button>
          {tagOptions.map((tag) => {
            const on = tags.includes(tag);
            return (
              <button key={tag} type="button" aria-pressed={on} onClick={() => set('tags', (on ? tags.filter((x) => x !== tag) : [...tags, tag]).join(',') || null)} className={chip(on)}>
                {t(`gallery.tags.${tag}`, { defaultValue: cap(tag) })}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-3">
            <p aria-live="polite" className="tabular-nums">{t('gallery.count', { count: results.length })}</p>
            {filtering && (
              <button type="button" onClick={reset} className="font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400">
                {t('gallery.reset_filters')}
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="max-sm:sr-only">{t('gallery.data.label')}</span>
            <Segmented
              value={view}
              onChange={(v) => set('data', v === 'mine' ? 'mine' : null)}
              options={[
                { value: 'sample', label: t('gallery.data.sample') },
                { value: 'mine', label: t('gallery.data.mine') },
              ]}
            />
            {view === 'sample' && <span className="text-xs">{t('gallery.data.caption')}</span>}
          </div>
        </div>
      </div>

      {showRecommended && (
        <section aria-labelledby="tpl-recommended">
          <h2 id="tpl-recommended" className="text-base font-semibold text-gray-900 dark:text-gray-50">{t('gallery.recommended')}</h2>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{t('gallery.recommended_hint')}</p>
          <ul className="-mx-4 mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 scroll-px-4 sm:mx-0 sm:px-0 sm:scroll-px-0">
            {recommended.map((tpl, i) => (
              <li key={tpl.id} className="w-[17.5rem] shrink-0 snap-start sm:w-80">{card(tpl, recommended, i)}</li>
            ))}
          </ul>
        </section>
      )}

      {results.length === 0 ? (
        <div className="panel dark:bg-gray-900 dark:border-gray-800">
          <EmptyState
            icon={favOnly && !favs.length ? StarIcon : MagnifyingGlassIcon}
            title={t('gallery.empty_title')}
            body={favOnly && !favs.length ? t('gallery.empty_favorites') : t('gallery.empty_body')}
            action={<button type="button" onClick={reset} className="btn-secondary">{t('gallery.reset_filters')}</button>}
          />
        </div>
      ) : (
        <section aria-labelledby={showRecommended ? 'tpl-all' : undefined}>
          {showRecommended && <h2 id="tpl-all" className="mb-4 text-base font-semibold text-gray-900 dark:text-gray-50">{t('gallery.all_templates')}</h2>}
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {grid.slice(0, limit).map((tpl, i) => <li key={tpl.id}>{card(tpl, grid, i)}</li>)}
          </ul>
          {grid.length > limit && (
            <div className="mt-6 flex flex-col items-center gap-2">
              <button type="button" onClick={() => setLimit((l) => l + PAGE)} className="btn-secondary">{t('gallery.show_more')}</button>
              <p className="text-xs tabular-nums text-gray-500 dark:text-gray-400">{t('gallery.shown', { shown: limit, total: grid.length })}</p>
            </div>
          )}
        </section>
      )}

      <PreviewDialog
        state={previewing}
        dataFor={dataFor}
        sample={view === 'sample'}
        currentId={currentId}
        favs={favs}
        onFav={toggle}
        onMove={(index) => setPreviewing((p) => p && { ...p, index })}
        onClose={() => setPreviewing(null)}
        onApply={(tpl) => { apply(tpl); setPreviewing(null); }}
      />
    </div>
  );
};

function PreviewDialog({ state, dataFor, sample, currentId, favs, onFav, onMove, onClose, onApply }: {
  state: { list: DesignTemplate[]; index: number } | null;
  dataFor: (template: DesignTemplate) => SalonPublicData;
  sample: boolean;
  currentId: string;
  favs: string[];
  onFav: (id: string) => void;
  onMove: (index: number) => void;
  onClose: () => void;
  onApply: (template: DesignTemplate) => void;
}) {
  const { t } = useTranslation('interface');
  const [device, setDevice] = useState<'desktop' | 'mobile'>(() => (window.innerWidth < 640 ? 'mobile' : 'desktop'));
  const template = state ? state.list[state.index] : null;
  // Keep the last template while the dialog animates out.
  const [shown, setShown] = useState(template);
  if (template && template !== shown) setShown(template);

  const count = state?.list.length ?? 0;
  const go = (step: number) => state && onMove((state.index + step + count) % count);

  useEffect(() => {
    if (!state || count < 2) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      // Arrows follow the reading direction: in Arabic, ← moves forward.
      const rtl = document.documentElement.dir === 'rtl';
      if (e.key === 'ArrowRight') go(rtl ? -1 : 1);
      if (e.key === 'ArrowLeft') go(rtl ? 1 : -1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const isCurrent = shown?.id === currentId;
  const isFav = !!shown && favs.includes(shown.id);

  return (
    <Dialog open={!!template} onClose={onClose} className="relative z-50">
      <DialogBackdrop transition className="fixed inset-0 bg-gray-900/50 transition-opacity duration-200 ease-out data-[closed]:opacity-0 data-[leave]:duration-150" />
      <div className="fixed inset-0 flex sm:p-6">
        <DialogPanel
          transition
          className="mx-auto flex w-full max-w-6xl flex-col overflow-hidden bg-white shadow-xl transition duration-200 ease-out data-[closed]:scale-[0.97] data-[closed]:opacity-0 data-[leave]:duration-150 sm:rounded-2xl dark:bg-gray-900"
        >
          {shown && (
            <>
              <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 px-4 py-3 sm:px-5 dark:border-gray-800">
                {count > 1 && (
                  <div className="flex items-center">
                    <IconButton label={t('gallery.previous')} onClick={() => go(-1)}><ChevronLeftIcon className="size-5 rtl:rotate-180" /></IconButton>
                    <span className="min-w-[3.5rem] text-center text-xs tabular-nums text-gray-500 dark:text-gray-400">{(state?.index ?? 0) + 1} / {count}</span>
                    <IconButton label={t('gallery.next')} onClick={() => go(1)}><ChevronRightIcon className="size-5 rtl:rotate-180" /></IconButton>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <DialogTitle className="truncate text-base font-semibold text-gray-900 dark:text-gray-50">{shown.name}</DialogTitle>
                    {sample && <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400">{t('gallery.data.caption')}</span>}
                  </div>
                  <p className="truncate text-sm text-gray-500 dark:text-gray-400">{t(`gallery.templates.${shown.id}.description`, shown.description)}</p>
                </div>
                <IconButton label={t('gallery.close')} onClick={onClose} className="order-2 sm:order-3"><XMarkIcon className="size-5" /></IconButton>
                <div className="order-3 flex w-full items-center justify-between gap-2 sm:order-2 sm:w-auto">
                  <Segmented
                    value={device}
                    onChange={setDevice}
                    options={[
                      { value: 'desktop', label: <span className="max-sm:sr-only">{t('gallery.desktop')}</span>, icon: ComputerDesktopIcon },
                      { value: 'mobile', label: <span className="max-sm:sr-only">{t('gallery.mobile')}</span>, icon: DevicePhoneMobileIcon },
                    ]}
                  />
                  <div className="flex items-center gap-1">
                    <IconButton label={t(isFav ? 'gallery.unfavorite' : 'gallery.favorite')} aria-pressed={isFav} onClick={() => onFav(shown.id)}>
                      {isFav ? <StarSolidIcon className="size-5 text-orange-500 dark:text-orange-400" /> : <StarIcon className="size-5" />}
                    </IconButton>
                    {isCurrent
                      ? <Badge tone="orange"><CheckIcon className="size-3" />{t('gallery.applied')}</Badge>
                      : <button type="button" onClick={() => onApply(shown)} className="btn-primary text-sm">{t('gallery.apply_template')}</button>}
                  </div>
                </div>
              </div>
              <div className="flex min-h-0 flex-1 justify-center bg-gray-100 p-3 sm:p-5 dark:bg-gray-950">
                <TemplateFrame
                  key={`${shown.id}-${device}`}
                  template={shown}
                  data={dataFor(shown)}
                  interactive
                  width={device === 'desktop' ? 1280 : 390}
                  className={`h-full rounded-xl border border-gray-200 shadow-sm dark:border-gray-800 ${device === 'desktop' ? 'w-full' : 'w-[390px] max-w-full'}`}
                />
              </div>
            </>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  );
}
