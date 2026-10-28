import React from 'react';
import { useTranslation } from 'react-i18next';
import { HairQuestionnaire } from '../../../clients/types';

interface HairQuestionnaireSectionProps {
  values: HairQuestionnaire;
  onChange: (field: keyof HairQuestionnaire, value: any) => void;
}

const HairQuestionnaireSection: React.FC<HairQuestionnaireSectionProps> = ({
  values,
  onChange,
}) => {
  const { t } = useTranslation('public');

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
            {t('booking.questionnaire.hair_type')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {hairTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onChange('hairType', type as HairQuestionnaire['hairType'])}
                className="bk-option" aria-pressed={values.hairType === type}
              >
                {t(`booking.questionnaire.values.${type}`, type)}
              </button>
            ))}
          </div>
        </div>

        {/* Épaisseur */}
        <div>
          <label className="bk-label">
            {t('booking.questionnaire.thickness')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {thicknessTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onChange('thickness', type as HairQuestionnaire['thickness'])}
                className="bk-option" aria-pressed={values.thickness === type}
              >
                {t(`booking.questionnaire.values.${type}`, type)}
              </button>
            ))}
          </div>
        </div>

        {/* État du cuir chevelu */}
        <div>
          <label className="bk-label">
            {t('booking.questionnaire.scalp')}
          </label>
          <select
            value={values.scalpCondition}
            onChange={(e) => onChange('scalpCondition', e.target.value as HairQuestionnaire['scalpCondition'])}
            className="bk-field"
          >
            {scalpConditions.map((condition) => (
              <option key={condition} value={condition}>
                {t(`booking.questionnaire.values.${condition}`, condition)}
              </option>
            ))}
          </select>
        </div>

        {/* Porosité */}
        <div>
          <label className="bk-label">
            {t('booking.questionnaire.porosity')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {porosityLevels.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => onChange('porosity', level as HairQuestionnaire['porosity'])}
                className="bk-option" aria-pressed={values.porosity === level}
              >
                {t(`booking.questionnaire.values.${level}`, level)}
              </button>
            ))}
          </div>
        </div>

        {/* Traitements chimiques */}
        <div>
          <label className="bk-label">
            {t('booking.questionnaire.chemical_treatments')}
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
                  {t(`booking.questionnaire.values.${treatment}`, treatment)}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Date du dernier traitement */}
        {values.chemicalTreatments.length > 0 && values.chemicalTreatments[0] !== 'Aucun' && (
          <div>
            <label className="bk-label">
              {t('booking.questionnaire.last_treatment_date')}
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
            {t('booking.questionnaire.hair_problems')}
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
                  {t(`booking.questionnaire.values.${problem}`, problem)}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Produits actuels */}
        <div>
          <label className="bk-label">
            {t('booking.questionnaire.current_products')}
          </label>
          <textarea
            value={values.currentProducts || ''}
            onChange={(e) => onChange('currentProducts', e.target.value)}
            rows={3}
            className="bk-field"
            placeholder={t('booking.questionnaire.current_products_placeholder')}
          />
        </div>

        {/* Allergies */}
        <div>
          <label className="bk-label">
            {t('booking.questionnaire.allergies')}
          </label>
          <textarea
            value={values.allergies || ''}
            onChange={(e) => onChange('allergies', e.target.value)}
            rows={2}
            className="bk-field"
            placeholder={t('booking.questionnaire.hair_allergies_placeholder')}
          />
        </div>
      </div>
    </div>
  );
};

export default HairQuestionnaireSection;
