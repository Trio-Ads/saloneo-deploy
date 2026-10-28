import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { ChatBubbleLeftRightIcon, ChevronDownIcon, ChevronUpIcon, TrashIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/20/solid';
import api from '../../../services/api';
import { EmptyState, IconButton } from '../../../components/ui';
import { Toggle } from './Toggle';

interface Review {
  _id: string;
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  date: string;
  isVisible: boolean;
  order: number;
}

const Stars = ({ rating }: { rating: number }) => (
  <span className="inline-flex" aria-label={`${rating}/5`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <StarIcon key={n} className={clsx('size-4', n <= rating ? 'text-amber-400' : 'text-gray-200 dark:text-gray-700')} />
    ))}
  </span>
);

export function ReviewsManager() {
  const { t } = useTranslation('interface');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ author: '', rating: 5, comment: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    api.get('/reviews')
      .then(r => setReviews(r.data))
      .catch(() => setError(t('reviews.errors.load')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.author.trim() || !form.comment.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await api.post('/reviews', form);
      setForm({ author: '', rating: 5, comment: '' });
      load();
    } catch {
      setError(t('reviews.errors.create'));
    } finally {
      setSaving(false);
    }
  };

  const toggleVisible = async (review: Review) => {
    setReviews(rs => rs.map(r => r._id === review._id ? { ...r, isVisible: !r.isVisible } : r));
    try {
      await api.patch(`/reviews/${review._id}`, { isVisible: !review.isVisible });
    } catch {
      setError(t('reviews.errors.update'));
      load();
    }
  };

  // Swap with the neighbour, then persist the new positions of every row whose order changed.
  const move = async (index: number, delta: -1 | 1) => {
    const next = [...reviews];
    [next[index], next[index + delta]] = [next[index + delta], next[index]];
    const changed = next.map((r, i) => ({ ...r, order: i })).filter((r) => reviews.find(o => o._id === r._id)!.order !== r.order);
    setReviews(next.map((r, i) => ({ ...r, order: i })));
    try {
      await Promise.all(changed.map(r => api.patch(`/reviews/${r._id}`, { order: r.order })));
    } catch {
      setError(t('reviews.errors.update'));
      load();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('reviews.confirm_delete'))) return;
    try {
      await api.delete(`/reviews/${id}`);
      load();
    } catch {
      setError(t('reviews.errors.delete'));
    }
  };

  return (
    <div>
      {error && (
        <div role="alert" className="mx-5 mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Review list */}
      {loading && reviews.length === 0 ? (
        <p className="px-5 py-8 text-sm text-gray-500 dark:text-gray-400">{t('reviews.loading')}</p>
      ) : reviews.length === 0 ? (
        <EmptyState icon={ChatBubbleLeftRightIcon} title={t('reviews.empty_title')} body={t('reviews.empty_body')} />
      ) : (
        <ul className="divide-y divide-gray-100 border-y border-gray-100 dark:divide-gray-800 dark:border-gray-800">
          {reviews.map((review, i) => (
            <li key={review._id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start">
              <div className={clsx('min-w-0 flex-1 transition-opacity duration-150', !review.isVisible && 'opacity-60')}>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-50">{review.author}</span>
                  <Stars rating={review.rating} />
                  {!review.isVisible && <span className="text-xs text-gray-500 dark:text-gray-400">{t('reviews.hidden')}</span>}
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">{review.comment}</p>
              </div>
              <div className="flex shrink-0 items-center justify-end gap-1">
                <label className="me-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="sm:sr-only">{t('reviews.visible')}</span>
                  <Toggle checked={review.isVisible} onChange={() => toggleVisible(review)} label={t('reviews.visible')} />
                </label>
                <IconButton label={t('reviews.move_up')} disabled={i === 0} onClick={() => move(i, -1)} className="disabled:opacity-30 disabled:pointer-events-none">
                  <ChevronUpIcon className="size-4" />
                </IconButton>
                <IconButton label={t('reviews.move_down')} disabled={i === reviews.length - 1} onClick={() => move(i, 1)} className="disabled:opacity-30 disabled:pointer-events-none">
                  <ChevronDownIcon className="size-4" />
                </IconButton>
                <IconButton label={t('reviews.delete')} tone="danger" onClick={() => handleDelete(review._id)}>
                  <TrashIcon className="size-4" />
                </IconButton>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Add form */}
      <div className="space-y-3 px-5 pt-5 pb-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('reviews.add_title')}</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <label htmlFor="review-author" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('reviews.author')}</label>
            <input
              id="review-author"
              value={form.author}
              onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
              className="field w-full dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
            />
          </div>
          <div>
            <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('reviews.rating')}</span>
            <div role="radiogroup" aria-label={t('reviews.rating')} className="flex">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={form.rating === n}
                  aria-label={`${n}/5`}
                  onClick={() => setForm(f => ({ ...f, rating: n }))}
                  className="grid size-10 place-items-center rounded-lg transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <StarIcon className={clsx('size-6', n <= form.rating ? 'text-amber-400' : 'text-gray-200 dark:text-gray-700')} />
                </button>
              ))}
            </div>
          </div>
        </div>
        <div>
          <label htmlFor="review-comment" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('reviews.comment')}</label>
          <textarea
            id="review-comment"
            value={form.comment}
            onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
            rows={3}
            maxLength={500}
            className="field w-full resize-none dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
          />
          <p className="mt-1 text-end text-xs text-gray-500 tabular-nums dark:text-gray-400">{form.comment.length}/500</p>
        </div>
        <button
          type="button"
          onClick={handleCreate}
          disabled={saving || !form.author.trim() || !form.comment.trim()}
          className="btn-primary"
        >
          {saving ? t('reviews.adding') : t('reviews.add')}
        </button>
      </div>
    </div>
  );
}
