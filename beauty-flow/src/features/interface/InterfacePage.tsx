import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useInterfaceStore } from './store';
import {
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
  CheckIcon,
  SwatchIcon,
  PhotoIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  SparklesIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import ColorPicker from './components/ColorPicker';
import ImageUpload from './components/ImageUpload';
import DisplaySettings from './components/DisplaySettings';
import ShareableLink, { usePublicUrl } from './components/ShareableLink';
import AppointmentSettings from '../appointments/components/AppointmentSettings';
import { TemplateGallery } from '../templates/components/TemplateGallery';
import { getTemplateById, salonTemplate } from '../templates';
import { ReviewsManager } from './components/ReviewsManager';
import { TemplateFrame, usePreviewData } from './components/TemplatePreview';
import { Toggle } from './components/Toggle';
import { PageHeader, Panel, Segmented } from '../../components/ui';
import { InterfaceSettings } from './types';

type TabType = 'templates' | 'colors' | 'images' | 'content' | 'settings' | 'reviews';

const colorKeys = ['primary', 'secondary', 'accent', 'background'] as const;

/** The applied template, repainted live with the colors being edited. */
function ColorsPreview({ colors }: { colors: InterfaceSettings['colors'] }) {
  const { t } = useTranslation('interface');
  const { data } = usePreviewData();
  const selectedTemplateId = useInterfaceStore((s) => s.selectedTemplateId);
  // Same merge as the public page, so the preview never promises colors the page will not show.
  const template = salonTemplate({ ...colors, selectedTemplateId: selectedTemplateId ?? undefined });
  return (
    <Panel title={t('colors_tab.preview')} description={template.name} flush>
      <div className="px-5 pb-5">
        <TemplateFrame template={template} data={data} className="aspect-[16/10] w-full rounded-xl border border-gray-200 dark:border-gray-800" />
      </div>
    </Panel>
  );
}

const InterfacePage: React.FC = () => {
  const { t } = useTranslation('interface');
  const {
    settings,
    selectedTemplateId,
    updateSettings,
    saveSettings,
    loadSettings,
    uploadLogo,
    uploadBanner,
    isSaving
  } = useInterfaceStore();
  const { url: publicUrl } = usePublicUrl();

  const [activeTab, setActiveTab] = useState<TabType>('templates');
  const [saveState, setSaveState] = useState<'idle' | 'saved' | 'error'>('idle');
  // Only the first load blocks the page; later reloads (e.g. after a banner upload) keep the tab mounted.
  const [ready, setReady] = useState(false);

  const tabs = [
    { value: 'templates' as const, label: t('tabs.templates'), icon: SparklesIcon },
    { value: 'colors' as const, label: t('tabs.colors'), icon: SwatchIcon },
    { value: 'images' as const, label: t('tabs.images'), icon: PhotoIcon },
    { value: 'content' as const, label: t('tabs.content'), icon: DocumentTextIcon },
    { value: 'settings' as const, label: t('tabs.settings'), icon: Cog6ToothIcon },
    { value: 'reviews' as const, label: t('tabs.reviews'), icon: StarIcon },
  ];

  // Charger les paramètres au montage du composant
  useEffect(() => {
    loadSettings().finally(() => setReady(true));
  }, [loadSettings]);

  const handleColorChange = (colorType: keyof typeof settings.colors) => (color: string) => {
    updateSettings({
      colors: {
        ...settings.colors,
        [colorType]: color,
      },
    });
  };

  const appliedTemplate = getTemplateById(selectedTemplateId);
  const resetColors = () => {
    const c = appliedTemplate.theme.colors;
    updateSettings({ colors: { primary: c.primary, secondary: c.secondary, accent: c.accent, background: c.background } });
  };

  const handleDisplaySettingsChange = (serviceDisplay: typeof settings.serviceDisplay) => {
    updateSettings({ serviceDisplay });
  };

  const handlePresentationChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateSettings({ presentation: e.target.value });
  };

  const handleSave = async () => {
    try {
      await saveSettings();
      setSaveState('saved');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setSaveState('error');
    }
    setTimeout(() => setSaveState('idle'), 2500);
  };

  const inputClass = 'field w-full dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100';

  const renderTabContent = () => {
    switch (activeTab) {
      case 'templates':
        return <TemplateGallery />;

      case 'colors':
        return (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start">
            <Panel title={t('sections.colors.title')} description={t('sections.colors.description')}>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {colorKeys.map((k) => (
                  <ColorPicker key={k} label={t(`colors.${k}`)} value={settings.colors[k]} onChange={handleColorChange(k)} />
                ))}
              </div>
              <button type="button" onClick={resetColors} className="btn-ghost -ms-3 mt-3 text-sm">
                <ArrowPathIcon className="size-4" />
                {t('colors_tab.reset')}
              </button>
            </Panel>
            <ColorsPreview colors={settings.colors} />
          </div>
        );

      case 'images':
        return (
          <div className="space-y-6">
            <Panel>
              <ImageUpload
                label={t('images.logo_label')}
                imageUrl={settings.logo.url}
                alt={settings.logo.alt}
                onUpload={uploadLogo}
                dimensions={{ width: 300, height: 120 }}
                type="logo"
              />
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">{t('images.logo_help')}</p>
            </Panel>
            <Panel>
              <ImageUpload
                label={t('images.banner_label')}
                imageUrl={settings.banner.url}
                alt={settings.banner.alt}
                onUpload={uploadBanner}
                dimensions={{ width: 1920, height: 600 }}
                type="banner"
              />
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">{t('images.banner_help')}</p>
            </Panel>
          </div>
        );

      case 'content':
        return (
          <div className="space-y-6">
            <Panel title={t('sections.content.title')} description={t('sections.content.description')}>
              <div className="space-y-5">
                <div>
                  <label htmlFor="presentation" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('forms.presentation.label')}</label>
                  <textarea
                    id="presentation"
                    value={settings.presentation}
                    onChange={handlePresentationChange}
                    rows={4}
                    className={inputClass}
                    placeholder={t('forms.presentation.placeholder')}
                  />
                </div>
                <div>
                  <label htmlFor="public-phone" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('forms.public_phone.label')}</label>
                  <input
                    id="public-phone"
                    type="tel"
                    value={settings.publicPhone || ''}
                    onChange={(e) => updateSettings({ publicPhone: e.target.value })}
                    className={`${inputClass} sm:max-w-xs`}
                    placeholder={t('forms.public_phone.placeholder')}
                  />
                  <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">{t('forms.public_phone.description')}</p>
                </div>
              </div>
            </Panel>

            <Panel title={t('forms.services_display')}>
              <DisplaySettings
                settings={settings.serviceDisplay}
                onChange={handleDisplaySettingsChange}
              />
            </Panel>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            {/* AppointmentSettings brings its own panels, so it is not wrapped in one. */}
            <section>
              <h2 className="mb-3 text-base font-semibold text-gray-900 dark:text-gray-50">{t('forms.appointments_settings')}</h2>
              <AppointmentSettings />
            </section>

            <Panel title={t('forms.team_display')}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p id="team-visibility" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('team.show_on_public')}</p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {settings.showTeamOnPublicPage ? t('team.visible_message') : t('team.hidden_message')}
                  </p>
                </div>
                <Toggle
                  checked={settings.showTeamOnPublicPage}
                  onChange={(v) => updateSettings({ showTeamOnPublicPage: v })}
                  label={t('team.show_on_public')}
                />
              </div>
            </Panel>

            <Panel title={t('forms.share_link')}>
              <ShareableLink />
            </Panel>
          </div>
        );

      case 'reviews':
        return (
          <Panel title={t('reviews.title')} description={t('reviews.description')} flush>
            <ReviewsManager />
          </Panel>
        );

      default:
        return null;
    }
  };

  return (
    <div className="py-6 sm:py-8">
        <PageHeader
          title={t('page.title')}
          subtitle={t('page.subtitle')}
          actions={
            <>
              <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                <ArrowTopRightOnSquareIcon className="size-4" />
                {t('page.view_page')}
              </a>
              <button type="button" onClick={handleSave} disabled={isSaving || !ready} className="btn-primary min-w-[8.5rem]">
                {isSaving ? (
                  <>
                    <span className="size-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    {t('actions.saving')}
                  </>
                ) : saveState === 'saved' ? (
                  <>
                    <CheckIcon className="size-4" />
                    {t('actions.saved')}
                  </>
                ) : (
                  t('actions.save')
                )}
              </button>
            </>
          }
        />
        {saveState === 'error' && (
          <p role="alert" className="-mt-3 mb-5 text-sm text-red-600 dark:text-red-400">{t('actions.save_error')}</p>
        )}

        <Segmented value={activeTab} onChange={setActiveTab} options={tabs} className="mb-6" />

        {!ready ? (
          <div className="panel flex items-center justify-center gap-3 py-16 text-sm text-gray-500 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-400">
            <span className="size-4 rounded-full border-2 border-gray-300 border-t-orange-500 animate-spin" />
            {t('page.loading_interface')}
          </div>
        ) : (
          renderTabContent()
        )}
    </div>
  );
};

export default InterfacePage;
