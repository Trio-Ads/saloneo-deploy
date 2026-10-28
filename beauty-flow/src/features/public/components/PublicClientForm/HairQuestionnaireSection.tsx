import React from 'react';
import { HairQuestionnaire } from '../../../clients/types';

interface HairQuestionnaireSectionProps {
  values: HairQuestionnaire;
  onChange: (field: keyof HairQuestionnaire, value: any) => void;
}

const HairQuestionnaireSection: React.FC<HairQuestionnaireSectionProps> = ({
  values,
  onChange,
}) => {

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
    <div>

      <div className="space-y-4">
        {/* Type de cheveux */}
        <div>
          <label className="bk-label">
            Type de cheveux
          </label>
          <div className="grid grid-cols-2 gap-2">
            {hairTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onChange('hairType', type as HairQuestionnaire['hairType'])}
                className="bk-option" aria-pressed={values.hairType === type}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Épaisseur */}
        <div>
          <label className="bk-label">
            Épaisseur des cheveux
          </label>
          <div className="grid grid-cols-3 gap-2">
            {thicknessTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onChange('thickness', type as HairQuestionnaire['thickness'])}
                className="bk-option" aria-pressed={values.thickness === type}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* État du cuir chevelu */}
        <div>
          <label className="bk-label">
            État du cuir chevelu
          </label>
          <select
            value={values.scalpCondition}
            onChange={(e) => onChange('scalpCondition', e.target.value as HairQuestionnaire['scalpCondition'])}
            className="bk-field"
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
          <label className="bk-label">
            Porosité
          </label>
          <div className="grid grid-cols-3 gap-2">
            {porosityLevels.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => onChange('porosity', level as HairQuestionnaire['porosity'])}
                className="bk-option" aria-pressed={values.porosity === level}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Traitements chimiques */}
        <div>
          <label className="bk-label">
            Traitements chimiques
          </label>
          <div className="space-y-2">
            {chemicalTreatments.map((treatment) => (
              <label key={treatment} className="flex items-center gap-3 min-h-[40px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={values.chemicalTreatments.includes(treatment)}
                  onChange={(e) => {
                    const newTreatments = e.target.checked
                      ? [...values.chemicalTreatments, treatment as HairQuestionnaire['chemicalTreatments'][number]]
                      : values.chemicalTreatments.filter((t) => t !== treatment);
                    onChange('chemicalTreatments', newTreatments);
                  }}
                  className="h-5 w-5 shrink-0 accent-[var(--bk-primary)]"
                />
                <span className="text-sm">
                  {treatment}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Date du dernier traitement */}
        {values.chemicalTreatments.length > 0 && values.chemicalTreatments[0] !== 'Aucun' && (
          <div>
            <label className="bk-label">
              Date du dernier traitement
            </label>
            <input
              type="date"
              value={values.lastTreatmentDate || ''}
              onChange={(e) => onChange('lastTreatmentDate', e.target.value)}
              className="bk-field"
            />
          </div>
        )}

        {/* Problèmes capillaires */}
        <div>
          <label className="bk-label">
            Problèmes capillaires
          </label>
          <div className="space-y-2">
            {hairProblems.map((problem) => (
              <label key={problem} className="flex items-center gap-3 min-h-[40px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={values.hairProblems.includes(problem)}
                  onChange={(e) => {
                    const newProblems = e.target.checked
                      ? [...values.hairProblems, problem as HairQuestionnaire['hairProblems'][number]]
                      : values.hairProblems.filter((p) => p !== problem);
                    onChange('hairProblems', newProblems);
                  }}
                  className="h-5 w-5 shrink-0 accent-[var(--bk-primary)]"
                />
                <span className="text-sm">
                  {problem}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Produits actuels */}
        <div>
          <label className="bk-label">
            Produits actuellement utilisés
          </label>
          <textarea
            value={values.currentProducts || ''}
            onChange={(e) => onChange('currentProducts', e.target.value)}
            rows={3}
            className="bk-field"
            placeholder="Listez les produits que vous utilisez actuellement..."
          />
        </div>

        {/* Allergies */}
        <div>
          <label className="bk-label">
            Allergies connues
          </label>
          <textarea
            value={values.allergies || ''}
            onChange={(e) => onChange('allergies', e.target.value)}
            rows={2}
            className="bk-field"
            placeholder="Mentionnez toute allergie aux produits capillaires..."
          />
        </div>
      </div>
    </div>
  );
};

export default HairQuestionnaireSection;
