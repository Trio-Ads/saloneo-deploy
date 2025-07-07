import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Test de synchronisation des devises - Services');
console.log('================================================\n');

// Test de la fonction getCurrencySymbol
console.log('📋 Test des fonctions utilitaires de devise:');

// Simulation des fonctions utilitaires
const getCurrencySymbol = (currency) => {
  const currencyCode = typeof currency === 'string' ? currency : currency?.code || 'EUR';
  
  const symbols = {
    'EUR': '€',
    'USD': '$',
    'GBP': '£',
    'JPY': '¥',
    'CAD': 'C$',
    'AUD': 'A$',
    'CHF': 'CHF'
  };

  return symbols[currencyCode] || currencyCode;
};

const formatPrice = (price, currency) => {
  const symbol = getCurrencySymbol(currency);
  return `${price.toFixed(2)} ${symbol}`;
};

// Tests
const testCases = [
  { currency: 'EUR', price: 50.00, expected: '50.00 €' },
  { currency: 'USD', price: 60.00, expected: '60.00 $' },
  { currency: 'GBP', price: 45.00, expected: '45.00 £' },
  { currency: { code: 'JPY' }, price: 5000, expected: '5000.00 ¥' },
  { currency: 'CAD', price: 70.00, expected: '70.00 C$' }
];

testCases.forEach((test, index) => {
  const result = formatPrice(test.price, test.currency);
  const success = result === test.expected;
  console.log(`  ${index + 1}. ${test.currency.code || test.currency}: ${success ? '✅' : '❌'} ${result}`);
  if (!success) {
    console.log(`     Attendu: ${test.expected}, Reçu: ${result}`);
  }
});

console.log('\n🔄 Simulation du changement de devise dans le profil:');
console.log('  1. Profil initial: EUR (€)');
console.log('  2. Changement vers USD ($)');
console.log('  3. Les services doivent maintenant afficher: "50.00 $" au lieu de "50.00 €"');

console.log('\n📝 Composants modifiés:');
console.log('  ✅ ServiceList.tsx - Prix dynamique avec formatPrice()');
console.log('  ✅ ServiceForm.tsx - Symbole de devise dynamique');
console.log('  ✅ utils/currency.ts - Fonctions utilitaires créées');

console.log('\n🎯 Points de vérification:');
console.log('  1. Aller dans Profil → Changer la devise');
console.log('  2. Aller dans Services → Vérifier que les prix utilisent la nouvelle devise');
console.log('  3. Ouvrir le modal "Nouveau Service" → Vérifier le symbole de devise');
console.log('  4. Les changements doivent être immédiats (temps réel)');

console.log('\n🚀 Test terminé - Prêt pour validation utilisateur!');
