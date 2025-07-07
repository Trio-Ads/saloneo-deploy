// Script de débogage pour les redirections de paiement
// À exécuter dans la console du navigateur après un retour de paiement

(function() {
  console.log('=== DÉBOGAGE REDIRECTION PAIEMENT ===');
  
  // Afficher l'URL complète
  console.log('URL complète:', window.location.href);
  
  // Analyser les paramètres d'URL
  const params = new URLSearchParams(window.location.search);
  console.log('Paramètres d\'URL:');
  
  // Convertir les paramètres en objet pour un affichage plus clair
  const paramsObj = {};
  params.forEach((value, key) => {
    paramsObj[key] = value;
  });
  console.log(paramsObj);
  
  // Vérifier les paramètres spécifiques
  console.log('Paramètres spécifiques:');
  console.log('- success:', params.get('success'));
  console.log('- error:', params.get('error'));
  console.log('- plan:', params.get('plan'));
  console.log('- transaction_id:', params.get('transaction_id'));
  console.log('- amount:', params.get('amount'));
  console.log('- payment_method:', params.get('payment_method'));
  console.log('- card_last4:', params.get('card_last4'));
  
  // Vérifier l'historique de navigation
  console.log('Historique de navigation:');
  console.log('- Nombre d\'entrées:', history.length);
  console.log('- État actuel:', history.state);
  
  // Vérifier le localStorage pour les données de paiement
  console.log('LocalStorage:');
  try {
    const paymentData = localStorage.getItem('paymentData');
    console.log('- paymentData:', paymentData ? JSON.parse(paymentData) : null);
  } catch (e) {
    console.log('- Erreur lors de la lecture du localStorage:', e);
  }
  
  // Vérifier les cookies
  console.log('Cookies:');
  console.log(document.cookie);
  
  // Vérifier si la page est dans un iframe
  console.log('Iframe:', window !== window.top);
  
  // Vérifier les redirections
  console.log('Redirections:');
  console.log('- Référent:', document.referrer);
  
  // Vérifier les erreurs dans la console
  console.log('Vérifiez les erreurs dans la console du navigateur');
  
  // Suggérer des solutions
  console.log('\n=== SOLUTIONS POSSIBLES ===');
  console.log('1. Vérifiez que les URLs de retour dans satimPaymentService.ts sont correctes');
  console.log('2. Vérifiez que le contrôleur de paiement redirige vers les bonnes URLs');
  console.log('3. Vérifiez que paymentService.parsePaymentReturn() analyse tous les paramètres nécessaires');
  console.log('4. Vérifiez que SubscriptionPage.tsx gère correctement les paramètres de retour');
  console.log('5. Vérifiez les règles CORS et les en-têtes de sécurité');
  
  return 'Débogage terminé. Vérifiez la console pour les résultats.';
})();
