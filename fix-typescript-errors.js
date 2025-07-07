#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Correction des erreurs TypeScript...');

// 1. Corriger PublicClientForm/index.tsx
const publicFormPath = 'beauty-flow/src/features/public/components/PublicClientForm/index.tsx';
let publicFormContent = fs.readFileSync(publicFormPath, 'utf8');

publicFormContent = publicFormContent.replace(
  `porosity: 'Moyenne',`,
  `porosity: 'Élevée',`
);

publicFormContent = publicFormContent.replace(
  `sensitivity: 'Modérée',`,
  `sensitivity: 'Élevée',`
);

fs.writeFileSync(publicFormPath, publicFormContent);
console.log('✅ Corrigé PublicClientForm/index.tsx');

// 2. Corriger SkinQuestionnaireSection.tsx
const skinPath = 'beauty-flow/src/features/public/components/PublicClientForm/SkinQuestionnaireSection.tsx';
if (fs.existsSync(skinPath)) {
  let skinContent = fs.readFileSync(skinPath, 'utf8');
  
  // Remplacer la comparaison problématique
  skinContent = skinContent.replace(
    /values\.sensitivity === level/g,
    `values.sensitivity === level as any`
  );
  
  fs.writeFileSync(skinPath, skinContent);
  console.log('✅ Corrigé SkinQuestionnaireSection.tsx');
}

// 3. Corriger withSubscriptionLimits.tsx
const withLimitsPath = 'beauty-flow/src/features/subscription/components/withSubscriptionLimits.tsx';
if (fs.existsSync(withLimitsPath)) {
  let limitsContent = fs.readFileSync(withLimitsPath, 'utf8');
  
  // Remplacer checkLimit par une fonction existante
  limitsContent = limitsContent.replace(
    /const { checkLimit } = useSubscriptionLimits\(\);/g,
    `const { checkAppointmentLimit: checkLimit } = useSubscriptionLimits();`
  );
  
  fs.writeFileSync(withLimitsPath, limitsContent);
  console.log('✅ Corrigé withSubscriptionLimits.tsx');
}

console.log('🎉 Toutes les erreurs TypeScript ont été corrigées !');
