/**
 * Script pour vérifier le statut d'une commande SATIM
 * Ce script permet de vérifier le statut d'une commande après son enregistrement
 */

require('dotenv').config();
const axios = require('axios');
const chalk = require('chalk');

// Configuration SATIM (utilise les variables d'environnement)
const satimConfig = {
  username: process.env.SATIM_TEST_USERNAME || 'SAT2507010254',
  password: process.env.SATIM_TEST_PASSWORD || 'satim120',
  baseUrl: process.env.SATIM_TEST_URL || 'https://test.satim.dz'
};

// Analyse des arguments de ligne de commande
const args = process.argv.slice(2);
let orderId = null;
let verbose = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--order-id' && args[i + 1]) {
    orderId = args[i + 1];
    i++;
  } else if (args[i] === '--verbose' || args[i] === '-v') {
    verbose = true;
  } else if (args[i] === '--help' || args[i] === '-h') {
    console.log(`
${chalk.bold('Vérification du statut d\'une commande SATIM')}

${chalk.bold('Usage:')}
  node check-satim-order.js --order-id ORDER_ID [options]

${chalk.bold('Options:')}
  --order-id ORDER_ID  ID de la commande SATIM à vérifier (obligatoire)
  --verbose, -v        Affiche tous les détails des réponses
  --help, -h           Affiche cette aide
    `);
    process.exit(0);
  }
}

if (!orderId) {
  console.log(chalk.red('Erreur: Vous devez spécifier un ID de commande avec --order-id'));
  console.log('Exemple: node check-satim-order.js --order-id 1XDZxR31tF3bMAAAGRUI');
  process.exit(1);
}

/**
 * Fonction pour vérifier le statut d'une commande
 * @param {string} orderId - ID de la commande SATIM
 * @returns {Promise<object>} - Résultat de la vérification
 */
async function checkOrderStatus(orderId) {
  try {
    // Préparer les paramètres de la requête
    const params = new URLSearchParams({
      userName: satimConfig.username,
      password: satimConfig.password,
      orderId: orderId,
      language: 'fr'
    });
    
    if (verbose) {
      console.log(chalk.blue('Envoi de la requête à SATIM...'));
      console.log(chalk.blue('URL:'), `${satimConfig.baseUrl}/payment/rest/getOrderStatus.do`);
      console.log(chalk.blue('Paramètres:'), params.toString());
    }
    
    // Envoyer la requête
    const response = await axios.get(
      `${satimConfig.baseUrl}/payment/rest/getOrderStatus.do`,
      { params }
    );
    
    return {
      success: true,
      data: response.data
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      response: error.response?.data
    };
  }
}

/**
 * Fonction pour interpréter le statut d'une commande
 * @param {object} statusData - Données de statut de la commande
 * @returns {string} - Description du statut
 */
function interpretOrderStatus(statusData) {
  // Codes de statut SATIM
  const statusCodes = {
    '0': 'Commande enregistrée mais non payée',
    '1': 'Pré-autorisé',
    '2': 'Autorisé',
    '3': 'Refusé',
    '4': 'Annulé',
    '5': 'Remboursé',
    '6': 'Pré-autorisé partiel'
  };
  
  // Codes d'erreur SATIM
  const errorCodes = {
    '0': 'Succès',
    '5': 'Commande non trouvée',
    '6': 'Erreur système'
  };
  
  // Vérifier si la commande existe
  // Note: L'API SATIM utilise des noms de propriétés avec des majuscules
  const errorCode = statusData.ErrorCode || statusData.errorCode;
  if (errorCode && errorCode !== '0') {
    return `Erreur: ${errorCodes[errorCode] || `Code d'erreur inconnu: ${errorCode}`}`;
  }
  
  // Interpréter le statut
  // Note: L'API SATIM utilise des noms de propriétés avec des majuscules
  const orderStatus = statusData.OrderStatus !== undefined ? statusData.OrderStatus : statusData.orderStatus;
  return statusCodes[orderStatus] || `Statut inconnu: ${orderStatus}`;
}

/**
 * Fonction principale
 */
async function main() {
  console.log(chalk.bold.green('\n=== VÉRIFICATION DU STATUT D\'UNE COMMANDE SATIM ==='));
  console.log(chalk.cyan(`Configuration: ${satimConfig.baseUrl} (${satimConfig.username})`));
  console.log(chalk.cyan(`ID de commande: ${orderId}`));
  
  // Vérifier le statut de la commande
  console.log(chalk.cyan('\nRécupération du statut...'));
  const result = await checkOrderStatus(orderId);
  
  if (result.success) {
    console.log(chalk.green('✓ Statut récupéré avec succès'));
    
    // Interpréter le statut
    const statusDescription = interpretOrderStatus(result.data);
    console.log(chalk.bold('\nStatut de la commande:'));
    console.log(chalk.yellow(`${statusDescription}`));
    
    // Afficher les détails de la commande
    console.log(chalk.bold('\nDétails de la commande:'));
    
    // Note: L'API SATIM utilise des noms de propriétés avec des majuscules
    const errorCode = result.data.ErrorCode || result.data.errorCode;
    if (errorCode === '0') {
      // Commande trouvée
      console.log(chalk.cyan(`Numéro de commande: ${result.data.OrderNumber || result.data.orderNumber || 'Non disponible'}`));
      // Convertir le code de devise en nom de devise
      const currencyCode = result.data.currency || '012';
      const currencyName = currencyCode === '012' ? 'DZD' : currencyCode;
      console.log(chalk.cyan(`Montant: ${((result.data.Amount || result.data.amount) / 100).toFixed(2) || '0.00'} ${currencyName}`));
      console.log(chalk.cyan(`Date: ${result.data.date || 'Non disponible'}`));
      console.log(chalk.cyan(`Description: ${result.data.description || 'Non disponible'}`));
      
      // Informations sur la carte (si disponibles)
      if (result.data.cardAuthInfo) {
        console.log(chalk.bold('\nInformations sur la carte:'));
        console.log(chalk.cyan(`Masque de la carte: ${result.data.cardAuthInfo.maskedPan || 'Non disponible'}`));
        console.log(chalk.cyan(`Émetteur: ${result.data.cardAuthInfo.cardholderName || 'Non disponible'}`));
        console.log(chalk.cyan(`Expiration: ${result.data.cardAuthInfo.expiration || 'Non disponible'}`));
      }
    }
    
    // Afficher les détails complets si demandé
    if (verbose) {
      console.log(chalk.yellow('\nRéponse complète:'));
      console.log(JSON.stringify(result.data, null, 2));
    }
  } else {
    console.log(chalk.red(`✗ Échec de la récupération du statut`));
    
    if (result.error) {
      console.log(chalk.red(`  - Erreur: ${result.error}`));
    }
    
    if (result.response) {
      console.log(chalk.red(`  - Réponse: ${JSON.stringify(result.response)}`));
    }
  }
  
  console.log(chalk.bold.green('\n=== FIN DE LA VÉRIFICATION ==='));
}

// Exécuter le script
main().catch(error => {
  console.error(chalk.red('Erreur lors de l\'exécution du script:'), error);
  process.exit(1);
});
