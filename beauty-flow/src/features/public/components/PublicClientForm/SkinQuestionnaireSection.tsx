import React from 'react';
import { useInterfaceStore } from '../../../interface/store';
import { SkinQuestionnaire } from '../../../clients/types';

interface SkinQuestionnaireSectionProps {
  values: SkinQuestionnaire;
  onChange: (field: keyof SkinQuestionnaire, value: any) => void;
}

const SkinQuestionnaireSection: React.FC<SkinQuestionnaireSectionProps> = ({
  values,
  onChange,
}) => {
  const settings = useInterfaceStore((state) => state.settings);

  const skinTypes = [
    'Normale',
    'Sèche',
    'Grasse',
    'Mixte',
    'Sensible'
  ] as const;

  const sensitivityLevels = [
    'Pas sensible',
    'Légèrement sensible',
    'Très sensible'
  ] as const;

  const skinProblems = [
    'Acné',
    'Vieillissement',
    'Taches pigmentaires',
    'Rougeurs',
    'Sécheresse'
  ] as const;

  const concernAreas = [
    'Front',
    'Joues',
    'Menton',
    'Nez',
    'Contour des yeux'
  ] as const;

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-orange-700 dark:from-orange-500 dark:to-orange-600 bg-clip-text text-transparent">
        Questionnaire peau
      </h3>

      <div className="space-y-4">
        {/* Type de peau */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
            Type de peau
          </label>
          <div className="grid grid-cols-2 gap-2">
            {skinTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onChange('skinType', type as SkinQuestionnaire['skinType'])}
                className={`glass-button p-3 text-sm transition-all duration-300 ${
                  values.skinType === type
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-neon'
                    : 'hover:bg-orange-50 dark:hover:bg-white/5 hover-lift'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Sensibilité */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
            Niveau de sensibilité
          </label>
          <div className="grid grid-cols-3 gap-2">
            {sensitivityLevels.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => onChange('sensitivity', level as SkinQuestionnaire['sensitivity'])}
                className={`glass-button p-3 text-sm transition-all duration-300 ${
                  values.sensitivity === level as any
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-neon'
                    : 'hover:bg-orange-50 dark:hover:bg-white/5 hover-lift'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Problèmes de peau */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
            Problèmes de peau
          </label>
          <div className="space-y-2">
            {skinProblems.map((problem) => (
              <label key={problem} className="flex items-center group hover-lift transition-all duration-300">
                <input
                  type="checkbox"
                  checked={values.skinProblems.includes(problem)}
                  onChange={(e) => {
                    const newProblems = e.target.checked
                      ? [...values.skinProblems, problem as SkinQuestionnaire['skinProblems'][number]]
                      : values.skinProblems.filter((p) => p !== problem);
                    onChange('skinProblems', newProblems);
                  }}
                  className="rounded border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 text-orange-600 focus:ring-orange-500 transition-colors duration-300"
                />
                <span className="ml-3 text-sm text-gray-700 dark:text-white/80 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">
                  {problem}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Zones de préoccupation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
            Zones de préoccupation principales
          </label>
          <div className="space-y-2">
            {concernAreas.map((area) => (
              <label key={area} className="flex items-center group hover-lift transition-all duration-300">
                <input
                  type="checkbox"
                  checked={values.mainConcernArea.includes(area)}
                  onChange={(e) => {
                    const newAreas = e.target.checked
                      ? [...values.mainConcernArea, area as SkinQuestionnaire['mainConcernArea'][number]]
                      : values.mainConcernArea.filter((a) => a !== area);
                    onChange('mainConcernArea', newAreas);
                  }}
                  className="rounded border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 text-orange-600 focus:ring-orange-500 transition-colors duration-300"
                />
                <span className="ml-3 text-sm text-gray-700 dark:text-white/80 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">
                  {area}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Produits actuels */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
            Produits actuellement utilisés
          </label>
          <textarea
            value={values.currentProducts || ''}
            onChange={(e) => onChange('currentProducts', e.target.value)}
            rows={3}
            className="glass-input w-full transition-all duration-300 hover:bg-orange-50 dark:hover:bg-white/10"
            placeholder="Listez les produits que vous utilisez actuellement..."
          />
        </div>

        {/* Allergies */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
            Allergies connues
          </label>
          <textarea
            value={values.allergies || ''}
            onChange={(e) => onChange('allergies', e.target.value)}
            rows={2}
            className="glass-input w-full transition-all duration-300 hover:bg-orange-50 dark:hover:bg-white/10"
            placeholder="Mentionnez toute allergie aux produits cosmétiques..."
          />
        </div>

        {/* Réactions passées */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
            Réactions passées aux traitements
          </label>
          <textarea
            value={values.pastReactions || ''}
            onChange={(e) => onChange('pastReactions', e.target.value)}
            rows={2}
            className="glass-input w-full transition-all duration-300 hover:bg-orange-50 dark:hover:bg-white/10"
            placeholder="Décrivez toute réaction négative passée à des traitements..."
          />
        </div>
      </div>
    </div>
  );
};

export default SkinQuestionnaireSection;
