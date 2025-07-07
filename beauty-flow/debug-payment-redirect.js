/**
 * Script de débogage pour tester les redirections de paiement
 * Ce script simule les redirections après paiement SATIM
 */

// Paramètres de test
const testParams = {
  // Paramètres de transaction
  transactionId: 'TEST-' + Date.now(),
  amount: 5000,
  plan: 'PREMIUM',
  paymentMethod: 'CIB',
  cardLast4: '1101',
  
  // URLs de redirection
  successUrl: '/subscription?success=true',
  failUrl: '/subscription?error=payment_failed',
  
  // Délai avant redirection (ms)
  delay: 2000
};

// Fonction pour construire l'URL de succès
function buildSuccessUrl() {
  const url = new URL(testParams.successUrl, window.location.origin);
  url.searchParams.append('transaction_id', testParams.transactionId);
  url.searchParams.append('amount', testParams.amount);
  url.searchParams.append('plan', testParams.plan);
  url.searchParams.append('payment_method', testParams.paymentMethod);
  url.searchParams.append('card_last4', testParams.cardLast4);
  return url.toString();
}

// Fonction pour construire l'URL d'échec
function buildFailUrl() {
  return new URL(testParams.failUrl, window.location.origin).toString();
}

// Fonction pour simuler une redirection réussie
function simulateSuccessRedirect() {
  const url = buildSuccessUrl();
  console.log('Redirection vers URL de succès:', url);
  setTimeout(() => {
    window.location.href = url;
  }, testParams.delay);
}

// Fonction pour simuler une redirection échouée
function simulateFailRedirect() {
  const url = buildFailUrl();
  console.log('Redirection vers URL d\'échec:', url);
  setTimeout(() => {
    window.location.href = url;
  }, testParams.delay);
}

// Créer l'interface utilisateur
function createDebugUI() {
  // Créer le conteneur
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.bottom = '20px';
  container.style.right = '20px';
  container.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  container.style.color = 'white';
  container.style.padding = '15px';
  container.style.borderRadius = '8px';
  container.style.zIndex = '9999';
  container.style.width = '300px';
  container.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
  container.style.fontFamily = 'Arial, sans-serif';
  
  // Ajouter le titre
  const title = document.createElement('h3');
  title.textContent = '🔧 Débogage Paiement';
  title.style.margin = '0 0 10px 0';
  title.style.fontSize = '16px';
  container.appendChild(title);
  
  // Ajouter les boutons
  const successButton = document.createElement('button');
  successButton.textContent = '✅ Simuler Succès';
  successButton.style.backgroundColor = '#4CAF50';
  successButton.style.color = 'white';
  successButton.style.border = 'none';
  successButton.style.padding = '8px 12px';
  successButton.style.margin = '5px 5px 5px 0';
  successButton.style.borderRadius = '4px';
  successButton.style.cursor = 'pointer';
  successButton.onclick = simulateSuccessRedirect;
  container.appendChild(successButton);
  
  const failButton = document.createElement('button');
  failButton.textContent = '❌ Simuler Échec';
  failButton.style.backgroundColor = '#F44336';
  failButton.style.color = 'white';
  failButton.style.border = 'none';
  failButton.style.padding = '8px 12px';
  failButton.style.margin = '5px';
  failButton.style.borderRadius = '4px';
  failButton.style.cursor = 'pointer';
  failButton.onclick = simulateFailRedirect;
  container.appendChild(failButton);
  
  // Ajouter le bouton de fermeture
  const closeButton = document.createElement('button');
  closeButton.textContent = '✖';
  closeButton.style.position = 'absolute';
  closeButton.style.top = '5px';
  closeButton.style.right = '5px';
  closeButton.style.backgroundColor = 'transparent';
  closeButton.style.color = 'white';
  closeButton.style.border = 'none';
  closeButton.style.fontSize = '16px';
  closeButton.style.cursor = 'pointer';
  closeButton.onclick = () => container.remove();
  container.appendChild(closeButton);
  
  // Ajouter au document
  document.body.appendChild(container);
  
  console.log('Interface de débogage de paiement initialisée');
  console.log('Paramètres de test:', testParams);
}

// Initialiser l'interface de débogage
if (typeof window !== 'undefined') {
  // Attendre que le DOM soit chargé
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createDebugUI);
  } else {
    createDebugUI();
  }
}

// Exporter les fonctions pour utilisation dans la console
if (typeof window !== 'undefined') {
  window.debugPayment = {
    simulateSuccessRedirect,
    simulateFailRedirect,
    testParams
  };
  
  console.log('Fonctions de débogage disponibles dans window.debugPayment');
}
