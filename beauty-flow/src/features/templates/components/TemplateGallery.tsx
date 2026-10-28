import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { CheckIcon, ComputerDesktopIcon, DevicePhoneMobileIcon, EyeIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { allTemplates, DesignTemplate, getTemplateById } from '../index';
import { useInterfaceStore } from '../../interface/store';
import { TemplateFrame, usePreviewData } from '../../interface/components/TemplatePreview';
import { Badge, IconButton, Segmented } from '../../../components/ui';
import { SalonPublicData } from '../../public/types';

interface TemplateGalleryProps {
  onTemplateSelect?: (template: DesignTemplate) => void;
}

const Palette = ({ template }: { template: DesignTemplate }) => (
  <div className="flex -space-x-1 rtl:space-x-reverse">
    {(['primary', 'secondary', 'accent', 'background'] as const).map((k) => (
      <span key={k} className="size-4 rounded-full ring-2 ring-white dark:ring-gray-900 border border-black/10" style={{ backgroundColor: template.theme.colors[k] }} />
    ))}
  </div>
);

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({ onTemplateSelect }) => {
  const { t } = useTranslation('interface');
  const { applyTemplate, selectedTemplateId } = useInterfaceStore();
  const { data } = usePreviewData();
  const [category, setCategory] = useState('all');
  const [previewing, setPreviewing] = useState<DesignTemplate | null>(null);

  // Maps legacy ids and falls back to the default template, like the public page does.
  const currentId = getTemplateById(selectedTemplateId).id;
  const categories = ['all', ...new Set(allTemplates.map((tpl) => tpl.category))];
  const templates = category === 'all' ? allTemplates : allTemplates.filter((tpl) => tpl.category === category);

  const apply = (template: DesignTemplate) => {
    applyTemplate(template);
    onTemplateSelect?.(template);
  };

  return (
    <div className="space-y-5">
      {categories.length > 2 && (
        <Segmented
          value={category}
          onChange={setCategory}
          options={categories.map((c) => ({ value: c, label: t(`gallery.categories.${c}`, { defaultValue: c.charAt(0).toUpperCase() + c.slice(1) }) }))}
        />
      )}

      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {templates.map((template) => {
          const isCurrent = template.id === currentId;
          return (
            <li
              key={template.id}
              className={`panel flex flex-col overflow-hidden dark:bg-gray-900 ${isCurrent ? 'border-orange-500 ring-1 ring-orange-500 dark:border-orange-400 dark:ring-orange-400' : 'dark:border-gray-800'}`}
            >
              <button
                type="button"
                onClick={() => setPreviewing(template)}
                aria-label={t('gallery.preview_of', { name: template.name })}
                className="block border-b border-gray-200 dark:border-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-500"
              >
                <TemplateFrame template={template} data={data} className="aspect-[16/10] w-full" />
              </button>
              <div className="flex flex-1 flex-col gap-3 p-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-[0.9375rem] font-semibold text-gray-900 dark:text-gray-50">{template.name}</h3>
                    {isCurrent && <Badge tone="orange"><CheckIcon className="size-3" />{t('gallery.applied')}</Badge>}
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-sm text-gray-500 dark:text-gray-400">{template.tagline}</p>
                </div>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
                  <Palette template={template} />
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setPreviewing(template)} className="btn-ghost text-sm">
                      <EyeIcon className="size-4" />{t('gallery.preview')}
                    </button>
                    {!isCurrent && (
                      <button type="button" onClick={() => apply(template)} className="btn-secondary text-sm">
                        {t('apply')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <PreviewDialog
        template={previewing}
        data={data}
        isCurrent={previewing?.id === currentId}
        onClose={() => setPreviewing(null)}
        onApply={(tpl) => { apply(tpl); setPreviewing(null); }}
      />
    </div>
  );
};

function PreviewDialog({ template, data, isCurrent, onClose, onApply }: {
  template: DesignTemplate | null;
  data: SalonPublicData;
  isCurrent: boolean;
  onClose: () => void;
  onApply: (template: DesignTemplate) => void;
}) {
  const { t } = useTranslation('interface');
  const [device, setDevice] = useState<'desktop' | 'mobile'>(() => (window.innerWidth < 640 ? 'mobile' : 'desktop'));
  // Keep the last template while the dialog animates out.
  const [shown, setShown] = useState(template);
  if (template && template !== shown) setShown(template);

  return (
    <Dialog open={!!template} onClose={onClose} className="relative z-50">
      <DialogBackdrop transition className="fixed inset-0 bg-gray-900/50 transition-opacity duration-200 ease-out data-[closed]:opacity-0 data-[leave]:duration-150" />
      <div className="fixed inset-0 flex sm:p-6">
        <DialogPanel
          transition
          className="mx-auto flex w-full max-w-6xl flex-col overflow-hidden bg-white shadow-xl transition duration-200 ease-out data-[closed]:scale-[0.97] data-[closed]:opacity-0 data-[leave]:duration-150 sm:rounded-2xl dark:bg-gray-900"
        >
          {shown && (
            <>
              <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 px-4 py-3 sm:px-5 dark:border-gray-800">
                <div className="min-w-0 flex-1">
                  <DialogTitle className="truncate text-base font-semibold text-gray-900 dark:text-gray-50">{shown.name}</DialogTitle>
                  <p className="truncate text-sm text-gray-500 dark:text-gray-400">{shown.description}</p>
                </div>
                <IconButton label={t('gallery.close')} onClick={onClose} className="order-2 sm:order-3"><XMarkIcon className="size-5" /></IconButton>
                <div className="order-3 flex w-full items-center justify-between gap-2 sm:order-2 sm:w-auto">
                  <Segmented
                    value={device}
                    onChange={setDevice}
                    options={[
                      { value: 'desktop', label: t('gallery.desktop'), icon: ComputerDesktopIcon },
                      { value: 'mobile', label: t('gallery.mobile'), icon: DevicePhoneMobileIcon },
                    ]}
                  />
                  {isCurrent
                    ? <Badge tone="orange"><CheckIcon className="size-3" />{t('gallery.applied')}</Badge>
                    : <button type="button" onClick={() => onApply(shown)} className="btn-primary text-sm">{t('gallery.apply_template')}</button>}
                </div>
              </div>
              <div className="flex min-h-0 flex-1 justify-center bg-gray-100 p-3 sm:p-5 dark:bg-gray-950">
                <TemplateFrame
                  key={device}
                  template={shown}
                  data={data}
                  interactive
                  width={device === 'desktop' ? 1280 : 390}
                  className={`h-full rounded-xl border border-gray-200 shadow-sm dark:border-gray-800 ${device === 'desktop' ? 'w-full' : 'w-[390px] max-w-full'}`}
                />
              </div>
            </>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  );
}
