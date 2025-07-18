import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useInterfaceStore } from './store';
import { 
  PaintBrushIcon,
  SwatchIcon,
  PhotoIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import ColorPicker from './components/ColorPicker';
import ImageUpload from './components/ImageUpload';
import DisplaySettings from './components/DisplaySettings';
import ShareableLink from './components/ShareableLink';
import AppointmentSettings from '../appointments/components/AppointmentSettings';
import { TemplateGallery } from '../templates/components/TemplateGallery';

type TabType = 'templates' | 'colors' | 'images' | 'content' | 'settings';

interface Tab {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
}

const InterfacePage: React.FC = () => {
  const { t } = useTranslation('interface');

  const tabs: Tab[] = [
    {
      id: 'templates',
      label: t('tabs.templates'),
      icon: SparklesIcon,
      gradient: 'from-indigo-500 to-purple-600'
    },
    {
      id: 'colors',
      label: t('tabs.colors'),
      icon: SwatchIcon,
      gradient: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'images',
      label: t('tabs.images'),
      icon: PhotoIcon,
      gradient: 'from-cyan-500 to-teal-600'
    },
    {
      id: 'content',
      label: t('tabs.content'),
      icon: DocumentTextIcon,
      gradient: 'from-teal-500 to-green-600'
    },
    {
      id: 'settings',
      label: t('tabs.settings'),
      icon: Cog6ToothIcon,
      gradient: 'from-purple-500 to-indigo-600'
    }
  ];
  const { 
    settings, 
    updateSettings, 
    saveSettings, 
    loadSettings, 
    uploadLogo, 
    uploadBanner, 
    isSaving, 
    isLoading 
  } = useInterfaceStore();

  const [activeTab, setActiveTab] = useState<TabType>('templates');

  // Charger les paramètres au montage du composant
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleColorChange = (colorType: keyof typeof settings.colors) => (color: string) => {
    updateSettings({
      colors: {
        ...settings.colors,
        [colorType]: color,
      },
    });
  };

  const handleImageUpload = (type: 'logo' | 'banner') => async (file: File) => {
    try {
      if (type === 'logo') {
        await uploadLogo(file);
      } else {
        await uploadBanner(file);
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement de l\'image:', error);
    }
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
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'templates':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {t('sections.templates.title')}
              </h3>
              <p className="text-gray-600">{t('sections.templates.description')}</p>
            </div>
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
              <TemplateGallery />
            </div>
          </div>
        );

      case 'colors':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                {t('sections.colors.title')}
              </h3>
              <p className="text-gray-600">{t('sections.colors.description')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
                <ColorPicker
                  label={t('colors.primary')}
                  value={settings.colors.primary}
                  onChange={handleColorChange('primary')}
                />
              </div>
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
                <ColorPicker
                  label={t('colors.secondary')}
                  value={settings.colors.secondary}
                  onChange={handleColorChange('secondary')}
                />
              </div>
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
                <ColorPicker
                  label={t('colors.accent')}
                  value={settings.colors.accent}
                  onChange={handleColorChange('accent')}
                />
              </div>
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
                <ColorPicker
                  label={t('colors.background')}
                  value={settings.colors.background}
                  onChange={handleColorChange('background')}
                />
              </div>
            </div>
          </div>
        );

      case 'images':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent mb-2">
                {t('sections.images.title')}
              </h3>
              <p className="text-gray-600">{t('sections.images.description')}</p>
            </div>
            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
                <ImageUpload
                  label={t('images.logo_label')}
                  imageUrl={settings.logo.url}
                  alt={settings.logo.alt}
                  onUpload={handleImageUpload('logo')}
                  dimensions={{ width: 300, height: 120 }}
                  type="logo"
                />
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700">
                    <span className="font-medium">{t('images.logo_tip')}</span> Utilisez un fond transparent (PNG) pour un rendu optimal dans la navigation
                  </p>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
                <ImageUpload
                  label={t('images.banner_label')}
                  imageUrl={settings.banner.url}
                  alt={settings.banner.alt}
                  onUpload={handleImageUpload('banner')}
                  dimensions={{ width: 1920, height: 600 }}
                  type="banner"
                />
                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700">
                    <span className="font-medium">{t('images.logo_tip')}</span> Image haute résolution pour un affichage parfait sur tous les écrans (ratio 16:5)
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'content':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-green-600 bg-clip-text text-transparent mb-2">
                {t('sections.content.title')}
              </h3>
              <p className="text-gray-600">{t('sections.content.description')}</p>
            </div>
            <div className="space-y-6">
              {/* Présentation */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">{t('forms.presentation.label')}</h4>
                <textarea
                  value={settings.presentation}
                  onChange={handlePresentationChange}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                  placeholder={t('forms.presentation.placeholder')}
                />
              </div>
              
              {/* Affichage des Services */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">{t('forms.services_display')}</h4>
                <DisplaySettings
                  settings={settings.serviceDisplay}
                  onChange={handleDisplaySettingsChange}
                />
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                {t('sections.settings.title')}
              </h3>
              <p className="text-gray-600">{t('sections.settings.description')}</p>
            </div>
            <div className="space-y-6">
              {/* Paramètres des Rendez-vous */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">{t('forms.appointments_settings')}</h4>
                <AppointmentSettings />
              </div>
              
              {/* {t('forms.team_display')} */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">{t('forms.team_display')}</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-700">
                        {t('team.show_on_public')}
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        {t('team.description')}
                      </p>
                    </div>
                    <div className="ml-4">
                      <button
                        type="button"
                        onClick={() => updateSettings({ showTeamOnPublicPage: !settings.showTeamOnPublicPage })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                          settings.showTeamOnPublicPage ? 'bg-indigo-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.showTeamOnPublicPage ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg border ${settings.showTeamOnPublicPage ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                    <p className={`text-sm ${settings.showTeamOnPublicPage ? 'text-green-700' : 'text-orange-700'}`}>
                      {settings.showTeamOnPublicPage ? (
                        <>
                          <span className="font-medium">{t('team.visible_message')}</span> Les clients peuvent voir votre équipe et choisir leur coiffeur préféré
                        </>
                      ) : (
                        <>
                          <span className="font-medium">{t('team.hidden_message')}</span> Vous assignerez manuellement les coiffeurs aux rendez-vous depuis votre interface d'administration
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Lien de Partage */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">{t('forms.share_link')}</h4>
                <ShareableLink />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* HERO HEADER - Loading */}
          <div className="relative mb-12">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 overflow-hidden">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl blur-lg opacity-30 animate-pulse"></div>
                    <div className="relative bg-gradient-to-r from-indigo-500 to-blue-600 p-4 rounded-2xl shadow-xl">
                      <PaintBrushIcon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                      {t('page.title')}
                    </h1>
                    <p className="text-gray-600 mt-2 text-lg">{t('page.loading_subtitle')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Loading Content */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 min-h-[600px]">
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-700">{t('page.loading_interface')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* HERO HEADER - Design spectaculaire */}
        <div className="relative mb-12">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              
              {/* Titre avec icône spectaculaire */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl blur-lg opacity-30 animate-pulse"></div>
                  <div className="relative bg-gradient-to-r from-indigo-500 to-blue-600 p-4 rounded-2xl shadow-xl transform hover:scale-110 transition-all duration-300">
                    <PaintBrushIcon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                    {t('page.title')}
                  </h1>
                  <p className="text-gray-600 mt-2 text-lg">{t('page.subtitle')}</p>
                </div>
              </div>

              {/* Bouton de sauvegarde */}
              <div className="flex-shrink-0">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-medium"
                >
                  {isSaving ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {t('actions.saving')}
                    </div>
                  ) : (
                    t('actions.save')
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* NAVIGATION PAR ONGLETS */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-2">
            <nav className="flex space-x-2 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap
                      ${isActive 
                        ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg transform scale-105` 
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100/50'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* CONTENU DE L'ONGLET ACTIF */}
        <div className="animate-fadeIn">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default InterfacePage;
