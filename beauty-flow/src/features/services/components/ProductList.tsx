import React from 'react';
import { useTranslation } from 'react-i18next';
import { PlusIcon, MinusIcon, PencilIcon, TrashIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { Product } from '../types';
import { useServiceStore } from '../store';
import { Panel, Badge, IconButton, BadgeTone } from '../../../components/ui';

interface ProductListProps {
  products?: Product[];
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  /** Low stock → "Commander": opens the supplier marketplace searching this product. */
  onOrder?: (product: Product) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products: propProducts, onEdit, onDelete, onOrder }) => {
  const { t } = useTranslation(['services', 'marketplace']);
  const { products: storeProducts, updateProductQuantity } = useServiceStore();
  const products = propProducts || storeProducts;
  const activeProducts = products.filter(p => p.isActive);

  const getStockStatus = (product: Product): { tone: BadgeTone; label: string } => {
    if (product.quantity === 0) return { tone: 'red', label: t('products.stats.out_of_stock') };
    if (product.quantity <= product.minQuantity) return { tone: 'amber', label: t('products.low_stock') };
    return { tone: 'green', label: t('products.in_stock') };
  };

  return (
    <Panel flush>
      <ul className="divide-y divide-gray-100 dark:divide-gray-800">
        {activeProducts.map((product) => {
          const status = getStockStatus(product);
          return (
            <li key={product.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-5">
              <div className="min-w-0 flex-1 basis-48">
                <div className="flex min-w-0 items-center gap-2">
                  <p className="truncate font-medium text-gray-900 dark:text-gray-50">{product.name}</p>
                  <Badge tone={status.tone}>{status.label}</Badge>
                </div>
                {product.description && (
                  <p className="line-clamp-1 text-sm text-gray-500 dark:text-gray-400">{product.description}</p>
                )}
              </div>

              <div className="flex w-full items-center gap-x-3 sm:w-auto sm:gap-x-4">
                <span className="whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 sm:w-32">
                  {t('products.threshold', { value: product.minQuantity, unit: t(`product_form.unit_values.${product.unit}`, { count: product.minQuantity, defaultValue: product.unit }) })}
                </span>
                <div className="flex items-center gap-1">
                  <IconButton
                    label={t('products.decrease')}
                    onClick={() => updateProductQuantity(product.id, -1)}
                    disabled={product.quantity <= 0}
                    className="disabled:opacity-40 disabled:pointer-events-none"
                  >
                    <MinusIcon className="size-4" />
                  </IconButton>
                  <span className="min-w-[4.5rem] whitespace-nowrap text-center text-sm font-medium tabular-nums text-gray-900 dark:text-gray-50">
                    {product.quantity} {t(`product_form.unit_values.${product.unit}`, { count: product.quantity, defaultValue: product.unit })}
                  </span>
                  <IconButton label={t('products.increase')} onClick={() => updateProductQuantity(product.id, 1)}>
                    <PlusIcon className="size-4" />
                  </IconButton>
                </div>
                <div className="ms-auto flex items-center gap-1 sm:ms-0">
                  {onOrder && product.quantity <= product.minQuantity && (
                    <button type="button" onClick={() => onOrder(product)} className="btn-ghost text-sm">
                      <ShoppingCartIcon className="size-4" />
                      {t('marketplace:products_tab.order')}
                    </button>
                  )}
                  <IconButton label={t('products.edit_product')} onClick={() => onEdit?.(product)}>
                    <PencilIcon className="size-[18px]" />
                  </IconButton>
                  <IconButton label={t('products.delete_product')} tone="danger" onClick={() => onDelete?.(product.id)}>
                    <TrashIcon className="size-[18px]" />
                  </IconButton>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
};

export default ProductList;
