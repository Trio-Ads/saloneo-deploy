#!/usr/bin/env node

/**
 * Script pour réinitialiser les couleurs de Beauty Flow
 * Ce script nettoie le localStorage et remet les couleurs par défaut Saloneo 2025
 */

console.log('🎨 Réinitialisation des couleurs Beauty Flow...');

// Instructions pour l'utilisateur
console.log(`
📋 Instructions pour réinitialiser les couleurs :

1. Ouvrez votre navigateur et allez sur votre application Beauty Flow
2. Ouvrez les outils de développement (F12)
3. Allez dans l'onglet "Console"
4. Copiez et collez le code suivant :

// Nettoyer le localStorage
localStorage.removeItem('beauty-flow-interface');
localStorage.removeItem('saloneo-theme');

// Nettoyer toutes les clés qui commencent par 'beauty-flow'
Object.keys(localStorage).forEach(key => {
  if (key.startsWith('beauty-flow')) {
    localStorage.removeItem(key);
  }
});

// Recharger la page
window.location.reload();

5. Appuyez sur Entrée pour exécuter le code
6. La page va se recharger avec les couleurs par défaut Saloneo 2025

✅ Les nouvelles couleurs par défaut sont :
- Primary: #6366F1 (Indigo)
- Secondary: #14B8A6 (Teal)
- Accent: #F59E0B (Orange)
- Background: #FFFFFF (Blanc)

🌙 Le bouton dark mode devrait maintenant fonctionner correctement !
`);

console.log('✨ Script terminé. Suivez les instructions ci-dessus pour réinitialiser les couleurs.');
