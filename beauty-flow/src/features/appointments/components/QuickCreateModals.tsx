import React, { useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { IconButton } from '../../../components/ui';
import { getCurrencySymbol } from '../../../utils/currency';
import { useProfileStore } from '../../profile/store';
import { TEAM_ROLES } from '../../team/store';
import { ClientFormData } from '../../clients/types';
import { ServiceFormData } from '../../services/types';
import { TeamMemberFormData } from '../../team/types';

const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300';

/** Shared dialog chrome: backdrop, title bar, Escape to close, cancel/submit footer. */
const ModalShell: React.FC<{
  title: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  children: React.ReactNode;
}> = ({ title, onClose, onSubmit, loading, children }) => {
  const { t } = useTranslation('appointments');
  const titleId = useId();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-gray-900/40 p-0 animate-fadeIn sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-xl sm:rounded-2xl sm:pb-0 dark:border-gray-800 dark:bg-gray-900"
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h3 id={titleId} className="text-base font-semibold text-gray-900 dark:text-gray-50">{title}</h3>
          <IconButton label={t('quick_create.close')} onClick={onClose} className="-me-2">
            <XMarkIcon className="size-5" />
          </IconButton>
        </div>
        <form onSubmit={onSubmit} className="space-y-4 px-5 pb-5">
          {children}
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="btn-secondary">
              {t('quick_create.cancel')}
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? t('quick_create.creating') : t('quick_create.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface QuickCreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: ClientFormData) => Promise<void>;
}

export const QuickCreateClientModal: React.FC<QuickCreateClientModalProps> = ({
  isOpen,
  onClose,
  onCreate
}) => {
  const [formData, setFormData] = useState<Partial<ClientFormData>>({
    firstName: '',
    lastName: '',
    phone: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation('appointments');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onCreate(formData as ClientFormData);
      onClose();
      setFormData({ firstName: '', lastName: '', phone: '', email: '' });
    } catch (error) {
      console.error('Error creating client:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell title={t('quick_create.client_title')} onClose={onClose} onSubmit={handleSubmit} loading={loading}>
      <label className="block">
        <span className={labelClass}>
          {t('quick_create.first_name')}
        </span>
        <input
          type="text"
          required
          value={formData.firstName}
          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          className="field"
        />
      </label>

      <label className="block">
        <span className={labelClass}>
          {t('quick_create.last_name')}
        </span>
        <input
          type="text"
          required
          value={formData.lastName}
          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          className="field"
        />
      </label>

      <label className="block">
        <span className={labelClass}>
          {t('quick_create.phone')}
        </span>
        <input
          type="tel"
          required
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="field"
        />
      </label>

      <label className="block">
        <span className={labelClass}>
          {t('quick_create.email')}
        </span>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="field"
        />
      </label>
    </ModalShell>
  );
};

interface QuickCreateServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: ServiceFormData) => Promise<void>;
  categories: string[];
}

export const QuickCreateServiceModal: React.FC<QuickCreateServiceModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  categories
}) => {
  const { profile } = useProfileStore();
  const [formData, setFormData] = useState<Partial<ServiceFormData>>({
    name: '',
    category: categories[0] || 'Coupe',
    duration: 30,
    price: 0
  });
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation('appointments');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onCreate(formData as ServiceFormData);
      onClose();
      setFormData({ name: '', category: categories[0] || 'Coupe', duration: 30, price: 0 });
    } catch (error) {
      console.error('Error creating service:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell title={t('quick_create.service_title')} onClose={onClose} onSubmit={handleSubmit} loading={loading}>
      <label className="block">
        <span className={labelClass}>
          {t('quick_create.service_name')}
        </span>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="field"
        />
      </label>

      <label className="block">
        <span className={labelClass}>
          {t('quick_create.category')}
        </span>
        <select
          required
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="field"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className={labelClass}>
          {t('quick_create.duration')}
        </span>
        <input
          type="number"
          required
          min="5"
          step="5"
          value={formData.duration}
          onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
          className="field"
        />
      </label>

      <label className="block">
        <span className={labelClass}>
          {`${t('quick_create.price')} (${getCurrencySymbol(profile.currency)})`}
        </span>
        <input
          type="number"
          required
          min="0"
          step="0.01"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
          className="field"
        />
      </label>
    </ModalShell>
  );
};

interface QuickCreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: TeamMemberFormData) => Promise<void>;
}

export const QuickCreateTeamModal: React.FC<QuickCreateTeamModalProps> = ({
  isOpen,
  onClose,
  onCreate
}) => {
  const [formData, setFormData] = useState<Partial<TeamMemberFormData>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'Coiffeur(se)'
  });
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation('appointments');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onCreate(formData as TeamMemberFormData);
      onClose();
      setFormData({ firstName: '', lastName: '', email: '', phone: '', role: 'Coiffeur(se)' });
    } catch (error) {
      console.error('Error creating team member:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell title={t('quick_create.team_title')} onClose={onClose} onSubmit={handleSubmit} loading={loading}>
      <label className="block">
        <span className={labelClass}>
          {t('quick_create.first_name')}
        </span>
        <input
          type="text"
          required
          value={formData.firstName}
          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          className="field"
        />
      </label>

      <label className="block">
        <span className={labelClass}>
          {t('quick_create.last_name')}
        </span>
        <input
          type="text"
          required
          value={formData.lastName}
          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          className="field"
        />
      </label>

      <label className="block">
        <span className={labelClass}>
          {t('quick_create.role')}
        </span>
        <select
          required
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          className="field"
        >
          {TEAM_ROLES.map((role) => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className={labelClass}>
          {t('quick_create.email')}
        </span>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="field"
        />
      </label>

      <label className="block">
        <span className={labelClass}>
          {t('quick_create.phone')}
        </span>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="field"
        />
      </label>
    </ModalShell>
  );
};
