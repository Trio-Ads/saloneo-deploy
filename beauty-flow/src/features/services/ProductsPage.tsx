import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CubeIcon, PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import ProductList from './components/ProductList';
import { useServiceStore } from './store';
import { Product, ProductFormData } from './types';
import { ProductFormWithLimits } from '../subscription/components/LimitedForms';
import { useLimitedForm } from '../subscription/components/LimitedForms';
import { useSubscriptionLimits } from '../subscription/hooks/useSubscriptionLimits';
import { SubscriptionLimitWidget } from '../subscription/components/SubscriptionLimitWidget';
import { PageHeader, StatGroup, Panel, EmptyState, Segmented } from '../../components/ui';
import { useAuthStore } from '../auth/store';
import SuppliersTab from '../marketplace/salon/SuppliersTab';

const ProductsPage: React.FC = () => {
  const { t } = useTranslation(['services', 'common', 'marketplace']);
  // "Fournisseurs" tab (supplier marketplace): salon owners only — staff never buy for the salon
  const [params, setParams] = useSearchParams();
  const canBuy = useAuthStore((s) => s.user?.role) !== 'staff';
  const tab = canBuy && params.get('tab') === 'suppliers' ? 'suppliers' : 'stock';
  const setTab = (v: 'stock' | 'suppliers') => setParams(v === 'suppliers' ? { tab: 'suppliers' } : {});
  const orderFromSupplier = (product: Product) => setParams({ tab: 'suppliers', q: product.name });
  const { products, fetchProducts, addProduct, updateProduct, deleteProduct, loading, error } = useServiceStore();
  const { handleLimitExceeded } = useLimitedForm();
  const { checkProductLimit, currentPlan } = useSubscriptionLimits();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');
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
      console.error(error);
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
    if (window.confirm(t('products.confirm_delete'))) {
      deleteProduct(productId);
    }
  };

  const isFiltering = !!searchTerm || selectedUnit !== 'all' || stockFilter !== 'all';

  return (
    <div className="py-6 sm:py-8">
      <PageHeader
        title={tab === 'suppliers' ? t('marketplace:products_tab.title') : t('products.title')}
        subtitle={tab === 'suppliers' ? t('marketplace:products_tab.subtitle') : t('products.subtitle')}
        meta={tab === 'stock' && (
          <SubscriptionLimitWidget
            title={t('products.limit_title')}
            limitCheck={checkProductLimit()}
            planName={currentPlan}
            resourceType={t('products.resource')}
          />
        )}
        actions={
          !showForm && tab === 'stock' && (
            <button onClick={handleAddClick} className="btn-primary">
              <PlusIcon className="size-4" />
              {t('products.add_product')}
            </button>
          )
        }
      />

      {canBuy && (
        <Segmented
          className="mb-6"
          value={tab}
          onChange={setTab}
          options={[{ value: 'stock', label: t('marketplace:products_tab.stock') }, { value: 'suppliers', label: t('marketplace:products_tab.suppliers') }]}
        />
      )}

      {tab === 'suppliers' ? <SuppliersTab /> : <>
      <StatGroup
        items={[
          { label: t('products.stats.all_products'), value: stats.total },
          { label: t('products.stats.units'), value: stats.units },
          { label: t('products.stats.low_stock'), value: stats.lowStock, accent: stats.lowStock > 0 },
          { label: t('products.stats.out_of_stock'), value: stats.outOfStock, accent: stats.outOfStock > 0 },
        ]}
      />

      {error && (
        <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800 dark:bg-red-500/10 dark:text-red-300">{error}</p>
      )}

      {showForm ? (
        <div ref={formRef} className="scroll-mt-6">
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
      ) : (
        <>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="relative sm:w-80">
              <MagnifyingGlassIcon className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="search"
                placeholder={t('products.search_placeholder')}
                aria-label={t('products.search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="field ps-9"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:flex">
              <select value={selectedUnit} onChange={(e) => setSelectedUnit(e.target.value)} aria-label={t('products.unit')} className="field sm:w-44">
                <option value="all">{t('products.all_units')}</option>
                {uniqueUnits.map((unit) => (
                  <option key={unit} value={unit}>{t(`product_form.unit_values.${unit}`, { count: 2, defaultValue: unit })}</option>
                ))}
              </select>
              <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)} aria-label={t('products.stock_status')} className="field sm:w-48">
                <option value="all">{t('products.all_stocks')}</option>
                <option value="available">{t('products.available_stock')}</option>
                <option value="low">{t('products.low_stock')}</option>
                <option value="out">{t('products.stats.out_of_stock')}</option>
              </select>
            </div>
            {isFiltering && (
              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 sm:ms-auto">
                <span>{t('products.products_found', { count: filteredProducts.length })}</span>
                <button type="button" onClick={resetFilters} className="btn-ghost">{t('products.reset')}</button>
              </div>
            )}
          </div>

          {filteredProducts.length === 0 ? (
            <Panel>
              <EmptyState
                icon={CubeIcon}
                title={isFiltering ? t('products.no_products_found') : t('products.no_products')}
                body={isFiltering ? t('products.modify_search') : t('products.add_first_products')}
                action={!isFiltering && (
                  <button onClick={handleAddClick} className="btn-primary">
                    <PlusIcon className="size-4" />
                    {t('products.add_product')}
                  </button>
                )}
              />
            </Panel>
          ) : (
            <ProductList products={filteredProducts} onEdit={handleEditClick} onDelete={handleDeleteClick} onOrder={canBuy ? orderFromSupplier : undefined} />
          )}
        </>
      )}
      </>}
    </div>
  );
};

export default ProductsPage;
