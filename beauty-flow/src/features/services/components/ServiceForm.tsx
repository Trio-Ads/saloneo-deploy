import React from 'react';
import { useTranslation } from 'react-i18next';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ServiceFormData, ServiceProduct, ServiceDeposit, depositAmount } from '../types';
import { useProfileStore } from '../../profile/store';
import { formatPrice, getCurrencySymbol } from '../../../utils/currency';
import ServiceImageUpload from './ServiceImageUpload';
import { IconButton, Segmented } from '../../../components/ui';
import { fetchDepositsEnabled } from '../../appointments/availability';

const DEPOSIT_PRESETS = [20, 30, 50];

const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300';

interface ServiceFormProps {
  initialData?: ServiceFormData;
  onSubmit: (data: ServiceFormData) => void;
  onCancel: () => void;
  categories: string[];
  products: Array<{
    id: string;
    name: string;
    quantity: number;
    unit: string;
  }>;
}

const ServiceForm: React.FC<ServiceFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  categories,
  products
}) => {
  const { t } = useTranslation(['services', 'common']);
  const { profile } = useProfileStore();
  const currencySymbol = getCurrencySymbol(profile.currency);
  const [depositsOn, setDepositsOn] = React.useState(true);
  React.useEffect(() => { fetchDepositsEnabled().then(setDepositsOn); }, []);
  const [formData, setFormData] = React.useState<ServiceFormData>(
    initialData || {
      name: '',
      description: '',
      duration: 30,
      price: 0,
      category: categories[0],
      products: [],
      isOnline: true // same default as the server: bookable online unless switched off
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    let newValue: string | number = value;

    if (name === 'duration' || name === 'price') {
      // Si la valeur est vide, on met 0
      if (value === '') {
        newValue = 0;
      } else {
        // Sinon on convertit en nombre en ignorant les zéros non significatifs au début
        newValue = Number(value.replace(/^0+/, '')) || 0;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Si le champ contient 0, on le vide pour faciliter la saisie
    if ((name === 'duration' || name === 'price') && (value === '0' || Number(value) === 0)) {
      e.target.value = '';
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Si le champ est vide au blur, on remet 0
    if ((name === 'duration' || name === 'price') && value === '') {
      setFormData((prev) => ({
        ...prev,
        [name]: 0
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="panel max-w-3xl dark:bg-gray-900 dark:border-gray-800">
      <div className="px-5 pt-5 pb-4">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">
          {initialData ? t('common:service_form.titles.edit') : t('common:service_form.titles.new')}
        </h2>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{t('common:service_form.subtitle')}</p>
      </div>

      <div className="divide-y divide-gray-100 border-t border-gray-100 dark:divide-gray-800 dark:border-gray-800">
        <section className="space-y-4 p-5">
          <div>
            <label htmlFor="name" className={labelClass}>{t('form.name')} *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="field"
              placeholder={t('common:service_form.placeholders.name')}
            />
          </div>

          <div>
            <label htmlFor="description" className={labelClass}>{t('form.description')}</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="field"
              placeholder={t('common:service_form.placeholders.description')}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="duration" className={labelClass}>{t('form.duration')} *</label>
              <div className="relative">
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  min="5"
                  step="5"
                  required
                  className="field pe-12 tabular-nums"
                />
                <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-sm text-gray-500 dark:text-gray-400">
                  {t('common:service_form.units.min')}
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="price" className={labelClass}>{t('form.price')} *</label>
              <div className="relative">
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  min="0"
                  step="0.01"
                  required
                  className="field pe-12 tabular-nums"
                />
                <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-sm text-gray-500 dark:text-gray-400">
                  {currencySymbol}
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="category" className={labelClass}>{t('form.category')} *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="field"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="space-y-3 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('form.online_settings.section')}</h3>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={!!formData.isOnline}
              onChange={(e) => setFormData((prev) => ({ ...prev, isOnline: e.target.checked }))}
              className="mt-0.5 size-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-800"
            />
            <span>
              <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('form.online_settings.available_online')}</span>
              <span className="block text-xs text-gray-500 dark:text-gray-400">{t('form.online_settings.help')}</span>
            </span>
          </label>
          <div className="grid gap-4 sm:grid-cols-2 sm:max-w-md">
            {(['bufferTimeBefore', 'bufferTimeAfter'] as const).map((key) => (
              <div key={key}>
                <label htmlFor={key} className={labelClass}>{t(`form.online_settings.${key === 'bufferTimeBefore' ? 'buffer_before' : 'buffer_after'}`)}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    id={key}
                    min={0}
                    max={120}
                    step={5}
                    inputMode="numeric"
                    value={formData[key] ?? 0}
                    onChange={(e) => setFormData((prev) => ({ ...prev, [key]: Math.min(120, Math.max(0, parseInt(e.target.value, 10) || 0)) }))}
                    className="field w-24 tabular-nums"
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400">{t('form.online_settings.minutes')}</span>
                </div>
              </div>
            ))}
            <p className="text-xs text-gray-500 sm:col-span-2 dark:text-gray-400">{t('form.online_settings.buffer_help')}</p>
          </div>
          {formData.isOnline && (
            <div className="sm:w-72">
              <label htmlFor="minimumBookingTime" className={labelClass}>{t('form.online_settings.minimum_booking_time')}</label>
              <select
                id="minimumBookingTime"
                value={formData.minimumBookingTime ?? ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, minimumBookingTime: e.target.value === '' ? null : Number(e.target.value) }))}
                className="field"
              >
                <option value="">{t('form.online_settings.booking_times.salon')}</option>
                {[1, 2, 4, 12, 48].map((h) => (
                  <option key={h} value={h}>{t(`form.online_settings.booking_times.${h}`)}</option>
                ))}
              </select>
            </div>
          )}
        </section>

        {formData.isOnline && (() => {
          // Online deposit (acompte), paid by card when booking online; amount previewed with the server's rule
          const deposit: ServiceDeposit = formData.deposit || { mode: 'none', value: 0 };
          const setDeposit = (d: ServiceDeposit) => setFormData((prev) => ({ ...prev, deposit: d }));
          const amount = depositAmount(formData.price, deposit);
          return (
            <section className="space-y-3 p-5">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('form.deposit.section')}</h3>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{t('form.deposit.help')}</p>
              </div>
              {!depositsOn && (
                <p className="rounded-xl bg-gray-50 px-3.5 py-2.5 text-sm text-gray-600 dark:bg-gray-800/60 dark:text-gray-300" role="status">{t('form.deposit.coming_soon')}</p>
              )}
              <Segmented
                value={deposit.mode}
                onChange={(mode) => setDeposit({ mode, value: mode === 'percent' ? 30 : mode === 'fixed' ? Math.min(formData.price || 1000, 1000) : 0 })}
                options={[
                  { value: 'none', label: t('form.deposit.none') },
                  { value: 'percent', label: t('form.deposit.percent') },
                  { value: 'fixed', label: t('form.deposit.fixed') },
                ]}
              />
              {deposit.mode === 'percent' && (
                <div className="flex flex-wrap items-center gap-2">
                  {DEPOSIT_PRESETS.map((p) => (
                    <button key={p} type="button" onClick={() => setDeposit({ mode: 'percent', value: p })} aria-pressed={deposit.value === p}
                      className="min-h-10 rounded-xl border border-gray-200 px-3.5 text-sm font-medium tabular-nums text-gray-700 transition-colors duration-150 ease-out hover:bg-gray-50 aria-pressed:border-orange-500 aria-pressed:bg-orange-50 aria-pressed:text-orange-700 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:aria-pressed:bg-orange-500/15 dark:aria-pressed:text-orange-300">
                      {p} %
                    </button>
                  ))}
                  <div className="flex items-center gap-2">
                    <input type="number" aria-label={t('form.deposit.percent_value')} min={1} max={100} step={5} inputMode="numeric" value={deposit.value}
                      onChange={(e) => setDeposit({ mode: 'percent', value: Math.min(100, Math.max(0, parseInt(e.target.value, 10) || 0)) })}
                      className="field w-24 tabular-nums" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">%</span>
                  </div>
                </div>
              )}
              {deposit.mode === 'fixed' && (
                <div className="relative w-40">
                  <input type="number" aria-label={t('form.deposit.fixed_value')} min={0} step={50} inputMode="numeric" value={deposit.value}
                    onChange={(e) => setDeposit({ mode: 'fixed', value: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                    className="field pe-12 tabular-nums" />
                  <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-sm text-gray-500 dark:text-gray-400">{currencySymbol}</span>
                </div>
              )}
              {deposit.mode !== 'none' && (
                <p className="text-sm text-gray-700 dark:text-gray-300" role="status">
                  {amount > 0
                    ? t('form.deposit.preview', { amount: formatPrice(amount, profile.currency), rest: formatPrice(Math.max(0, formData.price - amount), profile.currency) })
                    : t('form.deposit.preview_none')}
                  <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">{t('form.deposit.rules')}</span>
                </p>
              )}
            </section>
          );
        })()}

        <section className="space-y-3 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('common:service_form.sections.products')}</h3>
          {formData.products.map((serviceProduct, index) => (
            <div key={index} className="flex items-end gap-3">
              <div className="min-w-0 flex-1">
                <label className={labelClass}>{t('common:service_form.labels.product')}</label>
                <select
                  value={serviceProduct.productId}
                  onChange={(e) => {
                    const newProducts = [...formData.products];
                    newProducts[index] = { ...newProducts[index], productId: e.target.value };
                    setFormData(prev => ({ ...prev, products: newProducts }));
                  }}
                  className="field"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.quantity} {t(`product_form.unit_values.${p.unit}`, { count: p.quantity, defaultValue: p.unit })} {t('details.available')})
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-24">
                <label className={labelClass}>{t('common:service_form.labels.quantity')}</label>
                <input
                  type="number"
                  value={serviceProduct.quantity}
                  onChange={(e) => {
                    const newProducts = [...formData.products];
                    newProducts[index] = { ...newProducts[index], quantity: Math.max(0, Number(e.target.value)) };
                    setFormData(prev => ({ ...prev, products: newProducts }));
                  }}
                  min="0"
                  step="1"
                  className="field tabular-nums"
                />
              </div>
              <IconButton
                label={t('common:actions.delete')}
                tone="danger"
                className="mb-0.5"
                onClick={() => setFormData(prev => ({ ...prev, products: prev.products.filter((_, i) => i !== index) }))}
              >
                <XMarkIcon className="size-[18px]" />
              </IconButton>
            </div>
          ))}

          {products.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('common:service_form.messages.no_products')}</p>
          ) : (
            <button
              type="button"
              onClick={() => setFormData(prev => ({
                ...prev,
                products: [...prev.products, { productId: products[0].id, quantity: 1 } as ServiceProduct]
              }))}
              className="btn-secondary"
            >
              <PlusIcon className="size-4" />
              {t('common:actions.add_product')}
            </button>
          )}
        </section>

        {initialData && (
          <section className="p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('common:service_form.sections.photos')}</h3>
            <ServiceImageUpload serviceId={initialData.id || 'temp-service'} />
          </section>
        )}
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-gray-100 px-5 py-4 dark:border-gray-800 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="btn-secondary">
          {t('common:actions.cancel')}
        </button>
        <button type="submit" className="btn-primary">
          {initialData ? t('common:actions.edit') : t('common:actions.add')}
        </button>
      </div>
    </form>
  );
};

export default ServiceForm;
