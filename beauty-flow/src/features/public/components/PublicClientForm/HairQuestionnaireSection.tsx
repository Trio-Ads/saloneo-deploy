import React from 'react';
import { useInterfaceStore } from '../../../interface/store';
import { HairQuestionnaire } from '../../../clients/types';

interface HairQuestionnaireSectionProps {
  values: HairQuestionnaire;
  onChange: (field: keyof HairQuestionnaire, value: any) => void;
}

const HairQuestionnaireSection: React.FC<HairQuestionnaireSectionProps> = ({
  values,
  onChange,
}) => {
  const settings = useInterfaceStore((state) => state.settings);

  const hairTypes = ['Raides', 'Ondulés', 'Bouclés', 'Crépus'] as const;
  const thicknessTypes = ['Fins', 'Moyens', 'Épais'] as const;
  const scalpConditions = ['Normal', 'Sec', 'Gras', 'Sensible', 'Pellicules'] as const;
  const porosityLevels = ['Faible', 'Moyenne', 'Élevée'] as const;
  const chemicalTreatments = [
    'Aucun',
    'Coloration',
    'Mèches',
    'Défrisage',
    'Permanente'
  ] as const;
  const hairProblems = [
    'Pointes fourchues',
    'Cassure',
    'Frisottis',
    'Sécheresse',
    'Excès de sébum'
  ] as const;

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-orange-700 dark:from-orange-500 dark:to-orange-600 bg-clip-text text-transparent">
        Questionnaire cheveux
      </h3>

      <div className="space-y-4">
        {/* Type de cheveux */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
            Type de cheveux
          </label>
          <div className="grid grid-cols-2 gap-2">
            {hairTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onChange('hairType', type as HairQuestionnaire['hairType'])}
                className={`glass-button p-3 text-sm transition-all duration-300 ${
                  values.hairType === type
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-neon'
                    : 'hover:bg-orange-50 dark:hover:bg-white/5 hover-lift'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Épaisseur */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Épaisseur des cheveux
          </label>
          <div className="grid grid-cols-3 gap-2">
            {thicknessTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onChange('thickness', type as HairQuestionnaire['thickness'])}
                className={`glass-button p-3 text-sm transition-all duration-300 ${
                  values.thickness === type
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-neon'
                    : 'hover:bg-orange-50 dark:hover:bg-white/5 hover-lift'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* État du cuir chevelu */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            État du cuir chevelu
          </label>
          <select
            value={values.scalpCondition}
            onChange={(e) => onChange('scalpCondition', e.target.value as HairQuestionnaire['scalpCondition'])}
            className="glass-input w-full transition-all duration-300 hover:bg-orange-50 dark:hover:bg-white/10"
          >
            {scalpConditions.map((condition) => (
              <option key={condition} value={condition}>
                {condition}
              </option>
            ))}
          </select>
        </div>

        {/* Porosité */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Porosité
          </label>
          <div className="grid grid-cols-3 gap-2">
            {porosityLevels.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => onChange('porosity', level as HairQuestionnaire['porosity'])}
                className={`glass-button p-3 text-sm transition-all duration-300 ${
                  values.porosity === level
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-neon'
                    : 'hover:bg-orange-50 dark:hover:bg-white/5 hover-lift'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Traitements chimiques */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Traitements chimiques
          </label>
          <div className="space-y-2">
            {chemicalTreatments.map((treatment) => (
              <label key={treatment} className="flex items-center group hover-lift transition-all duration-300">
                <input
                  type="checkbox"
                  checked={values.chemicalTreatments.includes(treatment)}
                  onChange={(e) => {
                    const newTreatments = e.target.checked
                      ? [...values.chemicalTreatments, treatment as HairQuestionnaire['chemicalTreatments'][number]]
                      : values.chemicalTreatments.filter((t) => t !== treatment);
                    onChange('chemicalTreatments', newTreatments);
                  }}
                  className="rounded border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 text-orange-600 focus:ring-orange-500 transition-colors duration-300"
                />
                <span className="ml-3 text-sm text-gray-700 dark:text-white/80 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">
                  {treatment}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Date du dernier traitement */}
        {values.chemicalTreatments.length > 0 && values.chemicalTreatments[0] !== 'Aucun' && (
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Date du dernier traitement
            </label>
            <input
              type="date"
              value={values.lastTreatmentDate || ''}
              onChange={(e) => onChange('lastTreatmentDate', e.target.value)}
              className="glass-input w-full transition-all duration-300 hover:bg-orange-50 dark:hover:bg-white/10"
            />
          </div>
        )}

        {/* Problèmes capillaires */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Problèmes capillaires
          </label>
          <div className="space-y-2">
            {hairProblems.map((problem) => (
              <label key={problem} className="flex items-center group hover-lift transition-all duration-300">
                <input
                  type="checkbox"
                  checked={values.hairProblems.includes(problem)}
                  onChange={(e) => {
                    const newProblems = e.target.checked
                      ? [...values.hairProblems, problem as HairQuestionnaire['hairProblems'][number]]
                      : values.hairProblems.filter((p) => p !== problem);
                    onChange('hairProblems', newProblems);
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

        {/* Produits actuels */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
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
          <label className="block text-sm font-medium text-white mb-2">
            Allergies connues
          </label>
          <textarea
            value={values.allergies || ''}
            onChange={(e) => onChange('allergies', e.target.value)}
            rows={2}
            className="glass-input w-full transition-all duration-300 hover:bg-white/10"
            placeholder="Mentionnez toute allergie aux produits capillaires..."
          />
        </div>
      </div>
    </div>
  );
};

export default HairQuestionnaireSection;
