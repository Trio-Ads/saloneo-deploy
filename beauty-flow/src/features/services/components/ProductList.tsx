import React from 'react';
import { 
  CubeIcon,
  PlusIcon,
  MinusIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';
import { Product } from '../types';
import { useServiceStore } from '../store';

interface ProductListProps {
  products?: Product[];
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
}

const ProductList: React.FC<ProductListProps> = ({ 
  products: propProducts, 
  onEdit, 
  onDelete 
}) => {
  const { products: storeProducts, updateProductQuantity } = useServiceStore();
  const products = propProducts || storeProducts;
  const activeProducts = products.filter(p => p.isActive);

  const handleEdit = (product: Product) => {
    if (onEdit) {
      onEdit(product);
    }
  };

  const handleDelete = (productId: string) => {
    if (onDelete) {
      onDelete(productId);
    }
  };

  const handleAdjustQuantity = (productId: string, adjustment: number) => {
    updateProductQuantity(productId, adjustment);
  };

  const getStockStatus = (product: Product) => {
    if (product.quantity === 0) {
      return { 
        status: 'out', 
        color: 'text-red-600', 
        bgColor: 'bg-red-100', 
        icon: XCircleIcon,
        label: 'Rupture' 
      };
    }
    if (product.quantity <= product.minQuantity) {
      return { 
        status: 'low', 
        color: 'text-orange-600', 
        bgColor: 'bg-orange-100', 
        icon: ExclamationTriangleIcon,
        label: 'Stock faible' 
      };
    }
    return { 
      status: 'good', 
      color: 'text-green-600', 
      bgColor: 'bg-green-100', 
      icon: CheckCircleIcon,
      label: 'En stock' 
    };
  };

  const getUnitIcon = (unit: string) => {
    const icons: Record<string, React.ReactNode> = {
      'ml': <BeakerIcon className="h-4 w-4" />,
      'g': <CubeIcon className="h-4 w-4" />,
      'unité': <CubeIcon className="h-4 w-4" />,
      'L': <BeakerIcon className="h-4 w-4" />,
      'kg': <CubeIcon className="h-4 w-4" />
    };
    return icons[unit] || <CubeIcon className="h-4 w-4" />;
  };

  if (activeProducts.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <div className="mx-auto w-24 h-24 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-lg animate-pulse">
          <CubeIcon className="h-12 w-12 text-white" />
        </div>
        <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-3">
          Aucun produit en stock
        </h3>
        <p className="text-gray-600 text-lg mb-6">Commencez par ajouter vos premiers produits</p>
        <div className="mt-6 inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full text-indigo-700 text-sm font-medium">
          📦 Gérez votre stock facilement
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg">
            <CubeIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Produits</h2>
            <p className="text-sm text-gray-500">{activeProducts.length} produit(s) actif(s)</p>
          </div>
        </div>
      </div>

      {/* Grille des produits */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {activeProducts.map((product) => {
          const stockStatus = getStockStatus(product);
          const StatusIcon = stockStatus.icon;
          
          return (
            <div
              key={product.id}
              className="glass-card p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] group animate-fadeIn border border-white/20"
            >
              {/* Header du produit */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-sm">
                      <div className="text-white">
                        {getUnitIcon(product.unit)}
                      </div>
                      <span className="sr-only">{product.unit}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-500">{product.description}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="glass-button p-3 text-purple-600 hover:text-purple-800 hover:bg-purple-50 transition-all duration-200 transform hover:scale-110 shadow-lg hover:shadow-xl"
                    title="Modifier le produit"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="glass-button p-3 text-red-600 hover:text-red-800 hover:bg-red-50 transition-all duration-200 transform hover:scale-110 shadow-lg hover:shadow-xl"
                    title="Supprimer le produit"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Statut du stock */}
              <div className={`flex items-center space-x-2 p-3 rounded-xl mb-4 ${stockStatus.bgColor}`}>
                <StatusIcon className={`h-5 w-5 ${stockStatus.color}`} />
                <div className="flex-1">
                  <p className={`text-sm font-medium ${stockStatus.color}`}>
                    {stockStatus.label}
                  </p>
                  <p className="text-xs text-gray-600">
                    {product.quantity} {product.unit} disponible(s)
                  </p>
                </div>
              </div>

              {/* Quantités */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between p-3 glass-card bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Stock actuel</p>
                    <p className={`text-lg font-bold ${stockStatus.color}`}>
                      {product.quantity} {product.unit}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-gray-600">Minimum requis</p>
                    <p className="text-lg font-bold text-gray-700">
                      {product.minQuantity} {product.unit}
                    </p>
                  </div>
                </div>

                {/* Barre de progression du stock */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      product.quantity === 0 
                        ? 'bg-red-500' 
                        : product.quantity <= product.minQuantity 
                        ? 'bg-orange-500' 
                        : 'bg-green-500'
                    }`}
                    style={{
                      width: `${Math.min(100, (product.quantity / (product.minQuantity * 2)) * 100)}%`
                    }}
                  />
                </div>
              </div>

              {/* Contrôles de quantité */}
              <div className="flex items-center justify-between p-3 glass-card bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                <span className="text-sm font-medium text-gray-700">Ajuster le stock</span>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleAdjustQuantity(product.id, -1)}
                    disabled={product.quantity <= 0}
                    className="glass-button p-2 text-red-600 hover:text-red-800 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-110"
                    title="Diminuer la quantité"
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  
                  <span className="text-sm font-bold text-gray-900 min-w-[3rem] text-center">
                    {product.quantity}
                  </span>
                  
                  <button
                    onClick={() => handleAdjustQuantity(product.id, 1)}
                    className="glass-button p-2 text-green-600 hover:text-green-800 hover:bg-green-50 transition-all duration-200 transform hover:scale-110"
                    title="Augmenter la quantité"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Alerte si stock critique */}
              {product.quantity <= product.minQuantity && (
                <div className="mt-4 p-3 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <ExclamationTriangleIcon className="h-4 w-4 text-orange-600" />
                    <p className="text-xs text-orange-800 font-medium">
                      {product.quantity === 0 
                        ? 'Produit en rupture de stock !' 
                        : 'Stock faible - Réapprovisionnement recommandé'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductList;
