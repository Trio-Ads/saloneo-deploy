import React from 'react';
import { useTranslation } from 'react-i18next';
import { ProductFormData } from '../types';

const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300';

interface ProductFormProps {
  initialData?: ProductFormData;
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  onSubmit,
  onCancel
}) => {
  const { t } = useTranslation(['services', 'common']);
  const [formData, setFormData] = React.useState<ProductFormData>(
    initialData || {
      name: '',
      description: '',
      quantity: 0,
      minQuantity: 0,
      unit: 'ml'
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

    if (name === 'quantity' || name === 'minQuantity') {
      newValue = Number(value) || 0;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Si le champ contient 0, on le vide pour faciliter la saisie
    if ((name === 'quantity' || name === 'minQuantity') && (value === '0' || Number(value) === 0)) {
      e.target.value = '';
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Si le champ est vide au blur, on remet 0
    if ((name === 'quantity' || name === 'minQuantity') && value === '') {
      setFormData((prev) => ({
        ...prev,
        [name]: 0
      }));
    }
  };

  const isLowStock = formData.quantity <= formData.minQuantity && formData.minQuantity > 0;

  return (
    <form onSubmit={handleSubmit} className="panel max-w-3xl dark:bg-gray-900 dark:border-gray-800">
      <div className="px-5 pt-5 pb-4">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">
          {initialData ? t('product_form.title_edit') : t('product_form.title_new')}
        </h2>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{t('product_form.subtitle')}</p>
      </div>

      <div className="divide-y divide-gray-100 border-t border-gray-100 dark:divide-gray-800 dark:border-gray-800">
        <section className="space-y-4 p-5">
          <div>
            <label htmlFor="name" className={labelClass}>{t('product_form.name')} *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="field"
              placeholder={t('product_form.name_placeholder')}
            />
          </div>
          <div>
            <label htmlFor="description" className={labelClass}>{t('product_form.description')}</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="field"
              placeholder={t('product_form.description_placeholder')}
            />
          </div>
        </section>

        <section className="space-y-4 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('product_form.section_stock')}</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="quantity" className={labelClass}>{t('product_form.quantity')} *</label>
              <div className="relative">
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  min="0"
                  required
                  aria-describedby={isLowStock ? 'quantity-warning' : undefined}
                  className="field pe-14 tabular-nums"
                  placeholder="0"
                />
                <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-sm text-gray-500 dark:text-gray-400">{formData.unit}</span>
              </div>
              {isLowStock && (
                <p id="quantity-warning" className="mt-1.5 text-xs text-amber-700 dark:text-amber-300">{t('product_form.low_warning')}</p>
              )}
            </div>

            <div>
              <label htmlFor="minQuantity" className={labelClass}>{t('product_form.min_quantity')} *</label>
              <div className="relative">
                <input
                  type="number"
                  id="minQuantity"
                  name="minQuantity"
                  value={formData.minQuantity}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  min="0"
                  required
                  className="field pe-14 tabular-nums"
                  placeholder="0"
                />
                <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-sm text-gray-500 dark:text-gray-400">{formData.unit}</span>
              </div>
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">{t('product_form.min_help')}</p>
            </div>

            <div>
              <label htmlFor="unit" className={labelClass}>{t('product_form.unit')} *</label>
              <select id="unit" name="unit" value={formData.unit} onChange={handleChange} required className="field">
                <option value="ml">{t('product_form.units.ml')}</option>
                <option value="g">{t('product_form.units.g')}</option>
                <option value="unité">{t('product_form.units.unit')}</option>
                <option value="l">{t('product_form.units.l')}</option>
                <option value="kg">{t('product_form.units.kg')}</option>
              </select>
            </div>
          </div>
        </section>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-gray-100 px-5 py-4 dark:border-gray-800 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="btn-secondary">{t('common:actions.cancel')}</button>
        <button type="submit" className="btn-primary">{initialData ? t('common:actions.edit') : t('common:actions.add')}</button>
      </div>
    </form>
  );
};

export default ProductForm;
