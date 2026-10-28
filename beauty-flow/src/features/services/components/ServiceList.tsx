import React from 'react';
import { useTranslation } from 'react-i18next';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Service, depositAmount } from '../types';
import { useServiceStore } from '../store';
import ServiceOnlineSettings from './ServiceOnlineSettings';
import { useProfileStore } from '../../profile/store';
import { fileService } from '../../../services/fileService';
import { formatPrice } from '../../../utils/currency';
import { Panel, Badge, IconButton } from '../../../components/ui';

interface ServiceListProps {
  services: Service[];
  onEdit: (service: Service) => void;
  onDelete: (serviceId: string) => void;
}

const ServiceList: React.FC<ServiceListProps> = ({ services, onEdit, onDelete }) => {
  const { t } = useTranslation('services');
  const products = useServiceStore((state) => state.products);
  const { profile } = useProfileStore();

  const servicesByCategory = services.reduce((acc, service) => {
    (acc[service.category] ||= []).push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  return (
    <div className="space-y-6">
      {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
        <Panel
          key={category}
          flush
          title={category}
          description={t('list.services_count', { count: categoryServices.length })}
        >
          <ul className="divide-y divide-gray-100 dark:divide-gray-800 border-t border-gray-100 dark:border-gray-800">
            {categoryServices.map((service) => {
              const image = service.images?.[0];
              const usedProducts = (service.products || [])
                .map((sp) => {
                  const product = products.find((p) => p.id === sp.productId);
                  return product ? `${product.name} (${sp.quantity} ${product.unit})` : null;
                })
                .filter(Boolean)
                .join(', ');

              return (
                <li key={service.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-5">
                  {image && (
                    <img
                      src={fileService.getImageUrl(image.url)}
                      alt={image.alt || service.name}
                      className="size-10 shrink-0 rounded-lg object-cover bg-gray-100 dark:bg-gray-800"
                    />
                  )}
                  <div className="min-w-0 flex-1 basis-48">
                    <p className="truncate font-medium text-gray-900 dark:text-gray-50">{service.name}</p>
                    {service.description && (
                      <p className="line-clamp-1 text-sm text-gray-500 dark:text-gray-400">{service.description}</p>
                    )}
                    {service.isOnline && depositAmount(service.price, service.deposit) > 0 && (
                      <Badge tone="orange" className="mt-1">
                        {service.deposit!.mode === 'percent'
                          ? t('list.deposit_badge', { rule: `${service.deposit!.value} %`, amount: formatPrice(depositAmount(service.price, service.deposit), profile.currency) })
                          : t('list.deposit_badge_fixed', { amount: formatPrice(depositAmount(service.price, service.deposit), profile.currency) })}
                      </Badge>
                    )}
                    {usedProducts && (
                      <p className="line-clamp-1 text-xs text-gray-500 dark:text-gray-400">
                        {t('form.products')} : {usedProducts}
                      </p>
                    )}
                  </div>

                  <div className="flex w-full items-center gap-x-3 sm:w-auto sm:gap-x-4">
                    <span className="sm:w-16 whitespace-nowrap text-sm tabular-nums text-gray-500 dark:text-gray-400">
                      {service.duration} {t('duration.min')}
                    </span>
                    <span className="sm:w-24 whitespace-nowrap text-end text-sm font-medium tabular-nums text-gray-900 dark:text-gray-50">
                      {formatPrice(service.price, profile.currency)}
                    </span>
                    <ServiceOnlineSettings service={service} />
                    <span className="sm:w-16">
                      {service.isActive
                        ? <Badge tone="green">{t('list.active')}</Badge>
                        : <Badge>{t('list.inactive')}</Badge>}
                    </span>
                    <div className="ms-auto flex items-center gap-1 sm:ms-0">
                      <IconButton label={t('edit_service')} onClick={() => onEdit(service)}>
                        <PencilIcon className="size-[18px]" />
                      </IconButton>
                      <IconButton label={t('actions.delete')} tone="danger" onClick={() => onDelete(service.id)}>
                        <TrashIcon className="size-[18px]" />
                      </IconButton>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>
      ))}
    </div>
  );
};

export default ServiceList;
