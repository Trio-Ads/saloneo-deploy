import React, { useEffect, useState } from 'react';
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

const tabs: Tab[] = [
  {
    id: 'templates',
    label: 'Templates',
    icon: SparklesIcon,
    gradient: 'from-indigo-500 to-purple-600'
  },
  {
    id: 'colors',
    label: 'Couleurs',
    icon: SwatchIcon,
    gradient: 'from-blue-500 to-cyan-600'
  },
  {
    id: 'images',
    label: 'Images',
    icon: PhotoIcon,
    gradient: 'from-cyan-500 to-teal-600'
  },
  {
    id: 'content',
    label: 'Contenu',
    icon: DocumentTextIcon,
    gradient: 'from-teal-500 to-green-600'
  },
  {
    id: 'settings',
    label: 'Paramètres',
    icon: Cog6ToothIcon,
    gradient: 'from-purple-500 to-indigo-600'
  }
];

const InterfacePage: React.FC = () => {
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
                Templates de Design
              </h3>
              <p className="text-gray-600">Choisissez un template pour votre salon</p>
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
                Couleurs du Thème
              </h3>
              <p className="text-gray-600">Personnalisez la palette de couleurs</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
                <ColorPicker
                  label="Couleur principale"
                  value={settings.colors.primary}
                  onChange={handleColorChange('primary')}
                />
              </div>
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
                <ColorPicker
                  label="Couleur secondaire"
                  value={settings.colors.secondary}
                  onChange={handleColorChange('secondary')}
                />
              </div>
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
                <ColorPicker
                  label="Couleur d'accent"
                  value={settings.colors.accent}
                  onChange={handleColorChange('accent')}
                />
              </div>
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
                <ColorPicker
                  label="Couleur de fond"
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
                Images du Salon
              </h3>
              <p className="text-gray-600">Téléchargez votre logo et bannière</p>
            </div>
            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
                <ImageUpload
                  label="Logo du salon"
                  imageUrl={settings.logo.url}
                  alt={settings.logo.alt}
                  onUpload={handleImageUpload('logo')}
                  dimensions={{ width: 200, height: 80 }}
                />
              </div>
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
                <ImageUpload
                  label="Bannière"
                  imageUrl={settings.banner.url}
                  alt={settings.banner.alt}
                  onUpload={handleImageUpload('banner')}
                  dimensions={{ width: 1200, height: 400 }}
                />
              </div>
            </div>
          </div>
        );

      case 'content':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-green-600 bg-clip-text text-transparent mb-2">
                Contenu du Salon
              </h3>
              <p className="text-gray-600">Gérez la présentation et l'affichage</p>
            </div>
            <div className="space-y-6">
              {/* Présentation */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Présentation du salon</h4>
                <textarea
                  value={settings.presentation}
                  onChange={handlePresentationChange}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                  placeholder="Présentez votre salon, vos spécialités, votre équipe..."
                />
              </div>
              
              {/* Affichage des Services */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Affichage des services</h4>
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
                Paramètres Avancés
              </h3>
              <p className="text-gray-600">Configuration des rendez-vous et partage</p>
            </div>
            <div className="space-y-6">
              {/* Paramètres des Rendez-vous */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Paramètres des rendez-vous</h4>
                <AppointmentSettings />
              </div>
              
              {/* Lien de Partage */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Lien de partage</h4>
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
                      Mon Interface
                    </h1>
                    <p className="text-gray-600 mt-2 text-lg">Chargement des paramètres...</p>
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
                <span className="text-gray-700">Chargement de l'interface...</span>
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
                    Mon Interface
                  </h1>
                  <p className="text-gray-600 mt-2 text-lg">Personnalisez l'apparence de votre salon</p>
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
                      Sauvegarde...
                    </div>
                  ) : (
                    'Enregistrer'
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
