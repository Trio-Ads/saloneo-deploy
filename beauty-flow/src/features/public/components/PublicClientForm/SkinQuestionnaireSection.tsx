import React from 'react';
import { SkinQuestionnaire } from '../../../clients/types';

interface SkinQuestionnaireSectionProps {
  values: SkinQuestionnaire;
  onChange: (field: keyof SkinQuestionnaire, value: any) => void;
}

const SkinQuestionnaireSection: React.FC<SkinQuestionnaireSectionProps> = ({
  values,
  onChange,
}) => {

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
    <div>

      <div className="space-y-4">
        {/* Type de peau */}
        <div>
          <label className="bk-label">
            Type de peau
          </label>
          <div className="grid grid-cols-2 gap-2">
            {skinTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onChange('skinType', type as SkinQuestionnaire['skinType'])}
                className="bk-option" aria-pressed={values.skinType === type}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Sensibilité */}
        <div>
          <label className="bk-label">
            Niveau de sensibilité
          </label>
          <div className="grid grid-cols-3 gap-2">
            {sensitivityLevels.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => onChange('sensitivity', level as SkinQuestionnaire['sensitivity'])}
                className="bk-option" aria-pressed={values.sensitivity === level as any}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Problèmes de peau */}
        <div>
          <label className="bk-label">
            Problèmes de peau
          </label>
          <div className="space-y-2">
            {skinProblems.map((problem) => (
              <label key={problem} className="flex items-center gap-3 min-h-[40px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={values.skinProblems.includes(problem)}
                  onChange={(e) => {
                    const newProblems = e.target.checked
                      ? [...values.skinProblems, problem as SkinQuestionnaire['skinProblems'][number]]
                      : values.skinProblems.filter((p) => p !== problem);
                    onChange('skinProblems', newProblems);
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

        {/* Zones de préoccupation */}
        <div>
          <label className="bk-label">
            Zones de préoccupation principales
          </label>
          <div className="space-y-2">
            {concernAreas.map((area) => (
              <label key={area} className="flex items-center gap-3 min-h-[40px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={values.mainConcernArea.includes(area)}
                  onChange={(e) => {
                    const newAreas = e.target.checked
                      ? [...values.mainConcernArea, area as SkinQuestionnaire['mainConcernArea'][number]]
                      : values.mainConcernArea.filter((a) => a !== area);
                    onChange('mainConcernArea', newAreas);
                  }}
                  className="h-5 w-5 shrink-0 accent-[var(--bk-primary)]"
                />
                <span className="text-sm">
                  {area}
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
            placeholder="Mentionnez toute allergie aux produits cosmétiques..."
          />
        </div>

        {/* Réactions passées */}
        <div>
          <label className="bk-label">
            Réactions passées aux traitements
          </label>
          <textarea
            value={values.pastReactions || ''}
            onChange={(e) => onChange('pastReactions', e.target.value)}
            rows={2}
            className="bk-field"
            placeholder="Décrivez toute réaction négative passée à des traitements..."
          />
        </div>
      </div>
    </div>
  );
};

export default SkinQuestionnaireSection;
