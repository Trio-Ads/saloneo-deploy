import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CubeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ArchiveBoxIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import ProductList from './components/ProductList';
import ProductForm from './components/ProductForm';
import { useServiceStore } from './store';
import { Product, ProductFormData } from './types';
import { ProductFormWithLimits } from '../subscription/components/LimitedForms';
import { useLimitedForm } from '../subscription/components/LimitedForms';
import { useSubscriptionLimits } from '../subscription/hooks/useSubscriptionLimits';
import { SubscriptionLimitWidget } from '../subscription/components/SubscriptionLimitWidget';

const ProductsPage: React.FC = () => {
  const { t } = useTranslation(['services', 'common']);
  const { products, fetchProducts, addProduct, updateProduct, deleteProduct, loading, error } = useServiceStore();
  const { handleLimitExceeded } = useLimitedForm();
  const { checkProductLimit, currentPlan } = useSubscriptionLimits();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const formRef = React.useRef<HTMLDivElement>(null);

  // Charger les produits au montage du composant
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Filtrer les produits
  const filteredProducts = useMemo(() => {
    let filtered = products || [];
    
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.unit?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedUnit !== 'all') {
      filtered = filtered.filter(product => product.unit === selectedUnit);
    }
    
    if (stockFilter !== 'all') {
      switch (stockFilter) {
        case 'low':
          filtered = filtered.filter(product => product.quantity <= product.minQuantity);
          break;
        case 'out':
          filtered = filtered.filter(product => product.quantity === 0);
          break;
        case 'available':
          filtered = filtered.filter(product => product.quantity > product.minQuantity);
          break;
      }
    }
    
    return filtered;
  }, [products, searchTerm, selectedUnit, stockFilter]);

  // Calculer les statistiques
  const stats = useMemo(() => {
    const totalProducts = products?.length || 0;
    const lowStockProducts = products?.filter(p => p.quantity <= p.minQuantity).length || 0;
    const outOfStockProducts = products?.filter(p => p.quantity === 0).length || 0;
    const units = new Set(products?.map(p => p.unit)).size || 0;

    return {
      total: totalProducts,
      lowStock: lowStockProducts,
      outOfStock: outOfStockProducts,
      units
    };
  }, [products]);

  // Obtenir les unités uniques
  const uniqueUnits = useMemo(() => {
    return Array.from(new Set(products?.map(p => p.unit) || [])).sort();
  }, [products]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedUnit('all');
    setStockFilter('all');
  };

  const handleAddClick = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleFormSubmit = async (data: ProductFormData) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, data);
      } else {
        await addProduct(data);
      }
      setShowForm(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  // Auto-scroll vers le formulaire quand il s'ouvre
  React.useEffect(() => {
    if (showForm && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showForm]);

  const handleDeleteClick = (productId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      deleteProduct(productId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-orange-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* HERO HEADER - Design spectaculaire */}
        <div className="relative mb-12">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-orange-500/20 p-8 overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              
              {/* Titre avec icône spectaculaire */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl blur-lg opacity-30 animate-pulse"></div>
                  <div className="relative bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-2xl shadow-orange-xl transform hover:scale-110 transition-all duration-300">
                    <CubeIcon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 bg-clip-text text-transparent">
                    Gestion des Stocks
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">Gérez vos produits et leurs quantités en stock</p>
                  <div className="flex items-center mt-3 space-x-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <ArrowTrendingUpIcon className="h-4 w-4 mr-1 text-green-500" />
                      {stats.total} produits au total
                    </div>
                    {stats.lowStock > 0 && (
                      <div className="flex items-center text-sm text-orange-600 dark:text-orange-500">
                        <BellIcon className="h-4 w-4 mr-1 animate-bounce" />
                        {stats.lowStock} alertes stock
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions principales - Design premium */}
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={handleAddClick}
                  className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-semibold shadow-orange-xl hover:shadow-orange-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                  <PlusIcon className="h-5 w-5 mr-2 inline relative z-10" />
                  <span className="relative z-10">Ajouter un Produit</span>
                </button>
                
                <button className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                  <ChartBarIcon className="h-4 w-4 mr-2 inline" />
                  Rapport de Stock
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* WIDGET DE LIMITE D'ABONNEMENT */}
        <div className="mb-8">
          <SubscriptionLimitWidget
            title="Limite de Produits"
            icon={
              <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-orange-lg">
                <CubeIcon className="h-5 w-5 text-white" />
              </div>
            }
            limitCheck={checkProductLimit()}
            planName={currentPlan}
            resourceType="produits"
          />
        </div>

        {/* STATISTIQUES - Design premium avec couleurs cohérentes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-orange-500/20 p-6 hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total Produits</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.total}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Tous les produits</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-orange-lg">
                  <ArchiveBoxIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Unités */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-500 to-gray-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-500/20 p-6 hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Unités</p>
                  <p className="text-3xl font-bold text-gray-600 dark:text-gray-400 mt-1">{stats.units}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Types d'unités</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl shadow-lg">
                  <SparklesIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Stock Faible */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-orange-500/20 p-6 hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Stock Faible</p>
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-500 mt-1">{stats.lowStock}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Alertes de stock</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-orange-400 to-orange-500 rounded-xl shadow-orange-lg">
                  <ExclamationTriangleIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Rupture */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-red-500/20 p-6 hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Rupture</p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-500 mt-1">{stats.outOfStock}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Stock épuisé</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg">
                  <ExclamationTriangleIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alertes de stock */}
        {(stats.lowStock > 0 || stats.outOfStock > 0) && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-orange-500/20 p-6 mb-8 border-l-4 border-orange-500">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-6 w-6 text-orange-500 dark:text-orange-400 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Alertes de Stock</h3>
                <div className="mt-2 space-y-1">
                  {stats.outOfStock > 0 && (
                    <p className="text-sm text-red-600">
                      <span className="font-medium">{stats.outOfStock}</span> produit(s) en rupture de stock
                    </p>
                  )}
                  {stats.lowStock > 0 && (
                    <p className="text-sm text-orange-600">
                      <span className="font-medium">{stats.lowStock}</span> produit(s) avec un stock faible
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FILTRES ET CONTRÔLES - Design sophistiqué */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-orange-500/20 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            
            {/* Recherche et filtres */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Barre de recherche */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t("products.search_placeholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 w-64 bg-white/70 dark:bg-gray-700 dark:text-gray-100 backdrop-blur-sm border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-sm"
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl hover:bg-white/90 transition-all duration-200 text-sm font-medium text-gray-700 flex items-center"
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
                {showFilters ? 'Masquer' : 'Afficher'} les filtres
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {/* Filtre par unité */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unité
                </label>
                <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                    className="w-full bg-white/70 dark:bg-gray-700 dark:text-gray-100 backdrop-blur-sm border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 py-3 px-4"
                >
                  <option value="all">Toutes les unités</option>
                  {uniqueUnits.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtre par stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  État du Stock
                </label>
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  className="w-full bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 py-3 px-4"
                >
                  <option value="all">Tous les stocks</option>
                  <option value="available">Stock disponible</option>
                  <option value="low">Stock faible</option>
                  <option value="out">Rupture de stock</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex items-end">
                <button
                  onClick={resetFilters}
                  className="w-full px-4 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          )}

          {/* Résultats de recherche */}
          {(searchTerm || selectedUnit !== 'all' || stockFilter !== 'all') && (
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              {filteredProducts.length} produit(s) trouvé(s)
              {searchTerm && ` pour "${searchTerm}"`}
              {selectedUnit !== 'all' && ` avec l'unité "${selectedUnit}"`}
              {stockFilter !== 'all' && ` avec le filtre "${stockFilter}"`}
            </p>
          )}
        </div>

        {/* Contenu principal */}
        <div ref={formRef} className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-xl border border-orange-500/20 p-6 min-h-[600px]">
          {showForm ? (
            <div className="animate-fadeIn">
              <ProductFormWithLimits
                initialData={editingProduct ? {
                  name: editingProduct.name,
                  description: editingProduct.description,
                  quantity: editingProduct.quantity,
                  minQuantity: editingProduct.minQuantity,
                  unit: editingProduct.unit
                } : undefined}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
                onLimitExceeded={handleLimitExceeded}
              />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto w-24 h-24 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
                <CubeIcon className="h-12 w-12 text-indigo-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {searchTerm || selectedUnit !== 'all' || stockFilter !== 'all' 
                  ? 'Aucun produit trouvé' 
                  : 'Aucun produit en stock'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {searchTerm || selectedUnit !== 'all' || stockFilter !== 'all'
                  ? 'Essayez de modifier vos critères de recherche'
                  : 'Commencez par ajouter vos premiers produits'}
              </p>
              <button 
                onClick={handleAddClick}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-medium shadow-orange-lg hover:shadow-orange-xl transform hover:scale-105 transition-all duration-200"
              >
                <PlusIcon className="h-4 w-4 mr-2 inline" />
                Ajouter un Produit
              </button>
            </div>
          ) : (
            <div className="animate-fadeIn">
              <ProductList 
                products={filteredProducts}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
