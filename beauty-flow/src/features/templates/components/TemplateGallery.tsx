import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  SparklesIcon,
  SwatchIcon,
  CheckCircleIcon,
  EyeIcon,
  PaintBrushIcon,
  BeakerIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { allTemplates, getTemplatesByCategory, DesignTemplate } from '../index';
import { useInterfaceStore } from '../../interface/store';

interface TemplateGalleryProps {
  onTemplateSelect?: (template: DesignTemplate) => void;
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({ onTemplateSelect }) => {
  const { t } = useTranslation('interface');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const { applyTemplate, selectedTemplateId } = useInterfaceStore();

  // Synchroniser l'état local avec le template sélectionné du store
  React.useEffect(() => {
    if (selectedTemplateId && !selectedTemplate) {
      setSelectedTemplate(selectedTemplateId);
    }
  }, [selectedTemplateId, selectedTemplate]);

  const categories = [
    { id: 'all', name: 'Tous les thèmes', icon: SparklesIcon, color: 'from-purple-500 to-pink-600' },
    { id: 'minimal', name: 'Minimaliste', icon: SwatchIcon, color: 'from-blue-500 to-cyan-600' },
    { id: 'classic', name: 'Classique', icon: StarIcon, color: 'from-green-500 to-emerald-600' },
    { id: 'modern', name: 'Moderne', icon: BeakerIcon, color: 'from-indigo-500 to-purple-600' },
    { id: 'creative', name: 'Créatif', icon: PaintBrushIcon, color: 'from-orange-500 to-red-600' }
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? allTemplates 
    : getTemplatesByCategory(selectedCategory);

  const handleTemplateSelect = (template: DesignTemplate) => {
    setSelectedTemplate(template.id);
    if (onTemplateSelect) {
      onTemplateSelect(template);
    }
  };

  const handleApplyTemplate = (template: DesignTemplate) => {
    applyTemplate(template);
    setSelectedTemplate(template.id);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="text-center glass-card p-8 bg-gradient-to-r from-purple-50/50 to-pink-50/50 border border-purple-200/50">
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
          <SparklesIcon className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
          Galerie de Thèmes
        </h2>
        <p className="text-gray-600 text-lg">
          Choisissez un thème pour personnaliser l'apparence de votre salon
        </p>
      </div>

      {/* Category Filter */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <SwatchIcon className="h-5 w-5 text-purple-600" />
          <span>Catégories</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {categories.map((category) => {
            const IconComponent = category.icon;
            const isSelected = selectedCategory === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`glass-card p-4 transition-all duration-300 transform hover:scale-105 border border-white/20 ${
                  isSelected
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 shadow-lg ring-2 ring-purple-500/50'
                    : 'hover:bg-white/5 hover:shadow-lg'
                }`}
              >
                <div className="text-center">
                  <div className={`mx-auto p-3 rounded-xl mb-3 bg-gradient-to-r ${
                    isSelected ? category.color : 'from-gray-400 to-gray-600'
                  }`}>
                    <IconComponent className="h-6 w-6 text-white mx-auto" />
                  </div>
                  <span className={`text-sm font-medium ${
                    isSelected ? 'text-purple-600' : 'text-gray-700'
                  }`}>
                    {category.name}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className={`glass-card overflow-hidden transition-all duration-300 transform hover:scale-105 cursor-pointer border border-white/20 ${
              selectedTemplate === template.id
                ? 'ring-2 ring-purple-500/50 shadow-xl'
                : 'hover:shadow-lg'
            }`}
            onClick={() => handleTemplateSelect(template)}
          >
            {/* Template Preview */}
            <div 
              className="h-48 relative overflow-hidden group"
              style={{
                background: `linear-gradient(135deg, ${template.theme.colors.primary}, ${template.theme.colors.secondary})`
              }}
            >
              {/* Preview Content */}
              <div className="absolute inset-0 p-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div 
                    className="h-3 rounded-lg shadow-sm"
                    style={{ backgroundColor: template.theme.colors.text, opacity: 0.8, width: '60%' }}
                  />
                  <div 
                    className="h-2 rounded-lg shadow-sm"
                    style={{ backgroundColor: template.theme.colors.textSecondary, opacity: 0.6, width: '80%' }}
                  />
                </div>
                
                <div className="space-y-1">
                  <div 
                    className="h-2 rounded-lg shadow-sm"
                    style={{ backgroundColor: template.theme.colors.accent, opacity: 0.7, width: '40%' }}
                  />
                  <div 
                    className="h-2 rounded-lg shadow-sm"
                    style={{ backgroundColor: template.theme.colors.text, opacity: 0.5, width: '30%' }}
                  />
                </div>
              </div>

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApplyTemplate(template);
                  }}
                  className="opacity-0 group-hover:opacity-100 glass-button bg-white text-gray-900 px-6 py-3 rounded-xl font-medium transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 shadow-lg hover:shadow-xl"
                >
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="h-5 w-5" />
                    <span>Appliquer</span>
                  </div>
                </button>
              </div>

              {/* Category Badge */}
              <div className="absolute top-3 right-3">
                <span className="glass-card bg-white/90 text-gray-800 text-xs px-3 py-1 rounded-full font-medium shadow-lg">
                  {template.category}
                </span>
              </div>

              {/* Selected Badge */}
              {selectedTemplate === template.id && (
                <div className="absolute top-3 left-3">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-lg">
                    <CheckCircleIcon className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}
            </div>

            {/* Template Info */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {template.description}
                  </p>
                </div>
                <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                  <EyeIcon className="h-4 w-4 text-purple-600" />
                </div>
              </div>
              
              {/* Color Palette */}
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-white shadow-lg"
                    style={{ backgroundColor: template.theme.colors.primary }}
                    title="Couleur primaire"
                  />
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-white shadow-lg"
                    style={{ backgroundColor: template.theme.colors.secondary }}
                    title="Couleur secondaire"
                  />
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-white shadow-lg"
                    style={{ backgroundColor: template.theme.colors.accent }}
                    title="Couleur d'accent"
                  />
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-white shadow-lg"
                    style={{ backgroundColor: template.theme.colors.background }}
                    title="Couleur de fond"
                  />
                </div>
                
                {selectedTemplate === template.id && (
                  <div className="flex items-center space-x-1 text-green-600">
                    <CheckCircleIcon className="h-4 w-4" />
                    <span className="text-xs font-medium">Sélectionné</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Template Details */}
      {selectedTemplate && (
        <div className="glass-card p-8 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 border border-indigo-200/50">
          {(() => {
            const template = allTemplates.find(t => t.id === selectedTemplate);
            if (!template) return null;
            
            return (
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                    <EyeIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {template.name}
                    </h3>
                    <p className="text-gray-600 text-lg">
                      {template.description}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="glass-card bg-white/70 p-6 rounded-xl">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center space-x-2">
                      <PaintBrushIcon className="h-5 w-5 text-indigo-600" />
                      <span>Typographie</span>
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Titres:</span>
                        <p className="text-indigo-600 font-bold">{template.theme.typography.headingFont}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Texte:</span>
                        <p className="text-indigo-600 font-medium">{template.theme.typography.bodyFont}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="glass-card bg-white/70 p-6 rounded-xl">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center space-x-2">
                      <SparklesIcon className="h-5 w-5 text-purple-600" />
                      <span>Effets visuels</span>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {template.theme.effects.animations.map((animation, index) => (
                        <span 
                          key={index}
                          className="glass-card bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium"
                        >
                          {animation}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={() => handleApplyTemplate(template)}
                    className="glass-button bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 px-8 py-3"
                  >
                    <div className="flex items-center space-x-2">
                      <CheckCircleIcon className="h-5 w-5" />
                      <span>Appliquer ce thème</span>
                    </div>
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Information */}
      <div className="glass-card p-6 bg-gradient-to-r from-blue-50/50 to-cyan-50/50 border border-blue-200/50">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg">
            <SparklesIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-800 mb-2">À propos des thèmes</h4>
            <div className="space-y-2 text-sm text-blue-700">
              <p>• Chaque thème modifie l'apparence complète de votre salon</p>
              <p>• Les couleurs, polices et effets sont personnalisables après application</p>
              <p>• Vous pouvez changer de thème à tout moment sans perdre vos données</p>
              <p>• Prévisualisez avant d'appliquer pour voir le rendu final</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
