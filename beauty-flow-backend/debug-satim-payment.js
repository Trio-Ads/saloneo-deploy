/**
 * Script de débogage pour tester l'API SATIM
 * Ce script génère une nouvelle URL de formulaire SATIM pour les tests
 */

require('dotenv').config();
const axios = require('axios');

// Configuration SATIM (utilise les variables d'environnement ou des valeurs par défaut)
const satimConfig = {
  username: process.env.SATIM_TEST_USERNAME || 'SAT2507010254',
  password: process.env.SATIM_TEST_PASSWORD || 'satim120',
  terminalId: process.env.SATIM_TEST_TERMINAL_ID || 'E010901571',
  baseUrl: process.env.SATIM_TEST_URL || 'https://test.satim.dz',
};

// Fonction pour générer un numéro de commande unique
function generateOrderNumber() {
  const timestamp = Date.now().toString().slice(-6); // 6 derniers chiffres
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0'); // 2 chiffres
  return `BF${timestamp}${random}`; // BF + 6 + 2 = 10 caractères
}

// Fonction pour enregistrer une commande auprès de SATIM
async function registerOrder() {
  try {
    // Générer un numéro de commande unique
    const orderNumber = generateOrderNumber();
    
    // Montant de test (5000 DZD)
    const amount = 500000; // Le montant doit être multiplié par 100
    
    // URLs de retour (pour les tests)
    const returnUrl = 'http://localhost:3000/payment/satim/return?test=true';
    const failUrl = 'http://localhost:3000/payment/satim/fail?test=true';
    
    // Paramètres JSON
    const jsonParams = {
      force_terminal_id: satimConfig.terminalId,
      udf1: 'test-user-id',
      udf2: 'PREMIUM',
      udf3: 'MONTHLY',
      udf4: 'test',
      udf5: new Date().toISOString()
    };
    
    // Préparer les paramètres de la requête
    const params = new URLSearchParams({
      userName: satimConfig.username,
      password: satimConfig.password,
      orderNumber,
      amount: amount.toString(),
      currency: '012', // DZD
      returnUrl,
      failUrl,
      description: 'Test SATIM - Abonnement Saloneo',
      language: 'FR',
      jsonParams: JSON.stringify(jsonParams)
    });
    
    console.log('Envoi de la requête à SATIM...');
    console.log('URL:', `${satimConfig.baseUrl}/payment/rest/register.do`);
    console.log('Paramètres:', params.toString());
    
    // Envoyer la requête
    const response = await axios.get(
      `${satimConfig.baseUrl}/payment/rest/register.do`,
      { params }
    );
    
    console.log('\n=== RÉPONSE SATIM ===');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.errorCode && response.data.errorCode !== '0' && response.data.errorCode !== 0) {
      console.error('\n❌ ERREUR:', response.data.errorMessage || 'Erreur inconnue');
    } else if (response.data.orderId && response.data.formUrl) {
      console.log('\n✅ SUCCÈS!');
      console.log('\nInformations de la commande:');
      console.log('- Numéro de commande:', orderNumber);
      console.log('- ID de commande SATIM:', response.data.orderId);
      console.log('- Montant:', (amount / 100).toLocaleString('fr-DZ'), 'DZD');
      
      console.log('\n📋 URL du formulaire SATIM:');
      console.log(response.data.formUrl);
      
      console.log('\n🔍 Pour tester cette URL:');
      console.log('1. Ouvrez le fichier beauty-flow/test-satim-redirect.html dans votre navigateur');
      console.log('2. Remplacez l\'URL de test par celle ci-dessus');
      console.log('3. Testez les différentes méthodes de redirection');
      
      console.log('\n💳 Pour tester le paiement:');
      console.log('- Numéro de carte: 628058061006101101');
      console.log('- Date d\'expiration: 01/2027');
      console.log('- CVV2: 992');
      console.log('- Mot de passe: 123456');
    } else {
      console.error('\n❌ ERREUR: Réponse SATIM invalide');
    }
    
  } catch (error) {
    console.error('\n❌ ERREUR:', error.message);
    if (error.response) {
      console.error('Détails:', error.response.data);
    }
  }
}

// Exécuter la fonction
registerOrder();
