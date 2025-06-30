import React from 'react';
import { 
  BeakerIcon,
  DocumentTextIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  ScaleIcon
} from '@heroicons/react/24/outline';
import { ProductFormData } from '../types';
import { useServiceStore } from '../store';

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

  const isLowStock = formData.quantity <= formData.minQuantity && formData.minQuantity > 0;

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <BeakerIcon className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              {initialData ? 'Modifier le Produit' : 'Nouveau Produit'}
            </h2>
          </div>
          <p className="text-gray-600">Gérez votre stock de produits de beauté</p>
        </div>

        {/* Informations de base */}
        <div className="glass-card p-6">
          <div className="flex items-center space-x-3 mb-6">
            <BeakerIcon className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Informations du Produit</h3>
          </div>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                <BeakerIcon className="h-4 w-4 inline mr-2 text-blue-600" />
                Nom du produit *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="glass-input w-full rounded-xl border-0 bg-white/70 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
                placeholder="Ex: Shampooing hydratant"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                <DocumentTextIcon className="h-4 w-4 inline mr-2 text-blue-600" />
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="glass-input w-full rounded-xl border-0 bg-white/70 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
                placeholder="Décrivez le produit, ses propriétés, son utilisation..."
              />
            </div>
          </div>
        </div>

        {/* Gestion des stocks */}
        <div className="glass-card p-6">
          <div className="flex items-center space-x-3 mb-6">
            <CubeIcon className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Gestion des Stocks</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                <CubeIcon className="h-4 w-4 inline mr-2 text-blue-600" />
                Quantité actuelle *
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="0"
                  required
                  className={`glass-input w-full rounded-xl border-0 bg-white/70 backdrop-blur-sm shadow-lg focus:ring-2 focus:bg-white transition-all duration-200 pr-16 ${
                    isLowStock ? 'focus:ring-red-500 ring-2 ring-red-300' : 'focus:ring-blue-500'
                  }`}
                  placeholder="0"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm">{formData.unit}</span>
                </div>
              </div>
              {isLowStock && (
                <div className="mt-2 flex items-center text-red-600 text-sm">
                  <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                  Stock faible !
                </div>
              )}
            </div>

            <div>
              <label htmlFor="minQuantity" className="block text-sm font-medium text-gray-700 mb-2">
                <ExclamationTriangleIcon className="h-4 w-4 inline mr-2 text-orange-600" />
                Seuil d'alerte *
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="minQuantity"
                  name="minQuantity"
                  value={formData.minQuantity}
                  onChange={handleChange}
                  min="0"
                  required
                  className="glass-input w-full rounded-xl border-0 bg-white/70 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all duration-200 pr-16"
                  placeholder="0"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm">{formData.unit}</span>
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Alerte quand le stock descend sous ce seuil
              </p>
            </div>

            <div>
              <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-2">
                <ScaleIcon className="h-4 w-4 inline mr-2 text-blue-600" />
                Unité de mesure *
              </label>
              <select
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                required
                className="glass-input w-full rounded-xl border-0 bg-white/70 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
              >
                <option value="ml">Millilitres (ml)</option>
                <option value="g">Grammes (g)</option>
                <option value="unité">Unité(s)</option>
                <option value="l">Litres (l)</option>
                <option value="kg">Kilogrammes (kg)</option>
              </select>
            </div>
          </div>

          {/* Indicateur visuel du stock */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Niveau de stock</span>
              <span className={`text-sm font-semibold ${
                isLowStock ? 'text-red-600' : 
                formData.quantity < formData.minQuantity * 2 ? 'text-orange-600' : 'text-green-600'
              }`}>
                {formData.quantity} {formData.unit}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${
                  isLowStock ? 'bg-gradient-to-r from-red-500 to-red-600' :
                  formData.quantity < formData.minQuantity * 2 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                  'bg-gradient-to-r from-green-500 to-green-600'
                }`}
                style={{ 
                  width: `${Math.min(100, Math.max(5, (formData.quantity / Math.max(formData.minQuantity * 3, 100)) * 100))}%` 
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0</span>
              <span className="text-orange-600">Seuil: {formData.minQuantity}</span>
              <span>Stock optimal</span>
            </div>
          </div>
        </div>

        {/* Aperçu du statut */}
        {formData.name && (
          <div className={`glass-card p-4 border-l-4 ${
            isLowStock ? 'border-red-500 bg-red-50/50' :
            formData.quantity < formData.minQuantity * 2 ? 'border-orange-500 bg-orange-50/50' :
            'border-green-500 bg-green-50/50'
          }`}>
            <div className="flex items-center">
              <div className={`flex-shrink-0 ${
                isLowStock ? 'text-red-600' :
                formData.quantity < formData.minQuantity * 2 ? 'text-orange-600' :
                'text-green-600'
              }`}>
                {isLowStock ? (
                  <ExclamationTriangleIcon className="h-5 w-5" />
                ) : (
                  <CubeIcon className="h-5 w-5" />
                )}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${
                  isLowStock ? 'text-red-800' :
                  formData.quantity < formData.minQuantity * 2 ? 'text-orange-800' :
                  'text-green-800'
                }`}>
                  {isLowStock ? '⚠️ Stock critique' :
                   formData.quantity < formData.minQuantity * 2 ? '⚡ Stock faible' :
                   '✅ Stock suffisant'}
                </p>
                <p className={`text-xs ${
                  isLowStock ? 'text-red-600' :
                  formData.quantity < formData.minQuantity * 2 ? 'text-orange-600' :
                  'text-green-600'
                }`}>
                  {formData.name} - {formData.quantity} {formData.unit} disponible(s)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="glass-button bg-white/70 hover:bg-white/90 text-gray-700 border border-gray-300 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            {initialData ? 'Modifier' : 'Ajouter'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
