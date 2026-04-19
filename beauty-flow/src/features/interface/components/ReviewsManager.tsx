import { useState, useEffect } from 'react';
import api from '../../../services/api';

interface Review {
  _id: string;
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  date: string;
  isVisible: boolean;
  order: number;
}

export function ReviewsManager() {
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
      .catch(() => setError('Impossible de charger les avis.'))
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
      setError("Erreur lors de l'ajout de l'avis.");
    } finally {
      setSaving(false);
    }
  };

  const toggleVisible = async (review: Review) => {
    try {
      await api.patch(`/reviews/${review._id}`, { isVisible: !review.isVisible });
      load();
    } catch {
      setError("Erreur lors de la mise à jour.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet avis ?')) return;
    try {
      await api.delete(`/reviews/${id}`);
      load();
    } catch {
      setError("Erreur lors de la suppression.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Add form */}
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-4">Ajouter un avis</h3>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input
            placeholder="Nom du client"
            value={form.author}
            onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <select
            value={form.rating}
            onChange={e => setForm(f => ({ ...f, rating: Number(e.target.value) as 1 | 2 | 3 | 4 | 5 }))}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            {[5, 4, 3, 2, 1].map(n => (
              <option key={n} value={n}>{'★'.repeat(n)} {n}/5</option>
            ))}
          </select>
        </div>
        <textarea
          placeholder="Commentaire du client…"
          value={form.comment}
          onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
          rows={3}
          maxLength={500}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none mb-3"
        />
        <button
          onClick={handleCreate}
          disabled={saving || !form.author.trim() || !form.comment.trim()}
          className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Ajout…' : "Ajouter l'avis"}
        </button>
      </div>

      {/* Review list */}
      <div className="space-y-3">
        {loading && <p className="text-gray-400 text-sm">Chargement…</p>}
        {!loading && reviews.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-8">
            Aucun avis pour l'instant. Ajoutez le premier !
          </p>
        )}
        {reviews.map(review => (
          <div
            key={review._id}
            className={`bg-white rounded-xl p-4 border shadow-sm flex gap-3 items-start transition-opacity ${!review.isVisible ? 'opacity-50' : ''}`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-sm text-gray-900">{review.author}</span>
                <span className="text-yellow-500 text-sm">{'★'.repeat(review.rating)}</span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">"{review.comment}"</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => toggleVisible(review)}
                title={review.isVisible ? 'Masquer de la page publique' : 'Afficher sur la page publique'}
                className="text-gray-400 hover:text-indigo-600 transition-colors text-base"
              >
                {review.isVisible ? '👁' : '🙈'}
              </button>
              <button
                onClick={() => handleDelete(review._id)}
                title="Supprimer"
                className="text-gray-400 hover:text-red-500 transition-colors text-base"
              >
                🗑
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
