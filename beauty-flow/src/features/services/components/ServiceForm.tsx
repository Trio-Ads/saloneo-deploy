import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  SparklesIcon,
  DocumentTextIcon,
  ClockIcon,
  CurrencyDollarIcon,
  TagIcon,
  BeakerIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { ServiceFormData, ServiceProduct } from '../types';
import { useServiceStore } from '../store';
import { useProfileStore } from '../../profile/store';
import { getCurrencySymbol } from '../../../utils/currency';

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
  const { t } = useTranslation('services');
  const { profile } = useProfileStore();
  const currencySymbol = getCurrencySymbol(profile.currency);
  const [formData, setFormData] = React.useState<ServiceFormData>(
    initialData || {
      name: '',
      description: '',
      duration: 30,
      price: 0,
      category: categories[0],
      products: []
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

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl shadow-lg">
              <SparklesIcon className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              {initialData ? 'Modifier le Service' : 'Nouveau Service'}
            </h2>
          </div>
          <p className="text-gray-600">Créez un service de beauté personnalisé pour vos clients</p>
        </div>

        {/* Informations de base */}
        <div className="glass-card p-6">
          <div className="flex items-center space-x-3 mb-6">
            <SparklesIcon className="h-6 w-6 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">Informations de Base</h3>
          </div>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                <SparklesIcon className="h-4 w-4 inline mr-2 text-indigo-600" />
                {t('service.form.name')} *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="glass-input w-full rounded-xl border-0 bg-white/70 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200"
                placeholder="Ex: Coupe et brushing"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                <DocumentTextIcon className="h-4 w-4 inline mr-2 text-indigo-600" />
                {t('service.form.description')}
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="glass-input w-full rounded-xl border-0 bg-white/70 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200"
                placeholder="Décrivez votre service en détail..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                  <ClockIcon className="h-4 w-4 inline mr-2 text-indigo-600" />
                  {t('form.duration.label')} *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    min={t('form.duration.min')}
                    step={t('form.duration.step')}
                    required
                    className="glass-input w-full rounded-xl border-0 bg-white/70 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200 pr-12"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm">min</span>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  <CurrencyDollarIcon className="h-4 w-4 inline mr-2 text-indigo-600" />
                  {t('form.price.label')} ({currencySymbol}) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min={t('form.price.min')}
                    step={t('form.price.step')}
                    required
                    className="glass-input w-full rounded-xl border-0 bg-white/70 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200 pr-12"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm">{currencySymbol}</span>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  <TagIcon className="h-4 w-4 inline mr-2 text-indigo-600" />
                  {t('service.form.category')} *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="glass-input w-full rounded-xl border-0 bg-white/70 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Produits utilisés */}
        <div className="glass-card p-6">
          <div className="flex items-center space-x-3 mb-6">
            <BeakerIcon className="h-6 w-6 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">{t('form.products.title')}</h3>
          </div>
          
          <div className="space-y-4">
            {formData.products.map((serviceProduct, index) => {
              const product = products.find(p => p.id === serviceProduct.productId);
              return (
                <div key={index} className="glass-card bg-white/50 p-4 rounded-xl hover:bg-white/70 transition-all duration-200">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Produit
                      </label>
                      <select
                        value={serviceProduct.productId}
                        onChange={(e) => {
                          const newProducts = [...formData.products];
                          newProducts[index] = {
                            ...newProducts[index],
                            productId: e.target.value
                          };
                          setFormData(prev => ({ ...prev, products: newProducts }));
                        }}
                        className="glass-input w-full rounded-xl border-0 bg-white/70 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.quantity} {p.unit} {t('service.details.available')})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="w-32">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantité
                      </label>
                      <input
                        type="number"
                        value={serviceProduct.quantity}
                        onChange={(e) => {
                          const newProducts = [...formData.products];
                          newProducts[index] = {
                            ...newProducts[index],
                            quantity: Math.max(0, Number(e.target.value))
                          };
                          setFormData(prev => ({ ...prev, products: newProducts }));
                        }}
                        min="0"
                        step="1"
                        className="glass-input w-full rounded-xl border-0 bg-white/70 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200"
                      />
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => {
                        const newProducts = formData.products.filter((_, i) => i !== index);
                        setFormData(prev => ({ ...prev, products: newProducts }));
                      }}
                      className="mt-6 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              );
            })}
            
            <button
              type="button"
              onClick={() => {
                if (products.length > 0) {
                  const newProduct: ServiceProduct = {
                    productId: products[0].id,
                    quantity: 1
                  };
                  setFormData(prev => ({
                    ...prev,
                    products: [...prev.products, newProduct]
                  }));
                }
              }}
              disabled={products.length === 0}
              className="glass-button bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              {t('actions.add_product')}
            </button>
            
            {products.length === 0 && (
              <p className="text-gray-500 text-sm italic">
                Aucun produit disponible. Ajoutez des produits dans la section Stocks pour les utiliser ici.
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="glass-button bg-white/70 hover:bg-white/90 text-gray-700 border border-gray-300 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            {t('actions.cancel')}
          </button>
          <button
            type="submit"
            className="glass-button bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            {initialData ? t('actions.edit') : t('actions.add')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServiceForm;
