/**
 * Script de test des cartes SATIM
 * Ce script teste automatiquement les cartes de test SATIM et affiche les résultats
 */

require('dotenv').config();
const axios = require('axios');
// Utilisation de chalk en mode CommonJS
const chalk = require('chalk');

// Définition des cartes de test SATIM
const SATIM_TEST_CARDS = [
  {
    number: '6280580610061011',
    expiry: '01/2027',
    cvv: '992',
    password: '123456',
    description: 'Credit valide',
    expectedResult: 'SUCCESS'
  },
  {
    number: '6280581110006712',
    expiry: '01/2027',
    cvv: '897',
    password: '123456',
    description: 'TEMPORARILY BLOCKED',
    expectedResult: 'FAIL'
  },
  {
    number: '6280581110006316',
    expiry: '01/2027',
    cvv: '657',
    password: '123456',
    description: 'LOST',
    expectedResult: 'FAIL'
  },
  {
    number: '6280581110006415',
    expiry: '01/2027',
    cvv: '958',
    password: '123456',
    description: 'STOLEN',
    expectedResult: 'FAIL'
  },
  {
    number: '6280581110006613',
    expiry: '08/2027',
    cvv: '411',
    password: '123456',
    description: 'Saisie erronée de la date d\'expiration',
    expectedResult: 'FAIL'
  },
  {
    number: '6280581110003927',
    expiry: '01/2025',
    cvv: '834',
    password: '123456',
    description: 'Carte n\'existe plus sur le serveur de l\'émetteur',
    expectedResult: 'FAIL'
  },
  {
    number: '6280580610061219',
    expiry: '01/2027',
    cvv: '049',
    password: '123456',
    description: 'Plafond Carte Dépassé',
    expectedResult: 'FAIL'
  },
  {
    number: '6280580610061110',
    expiry: '01/2027',
    cvv: '260',
    password: '123456',
    description: 'Solde Carte Insuffisant',
    expectedResult: 'FAIL'
  },
  {
    number: '6280581110006514',
    expiry: '01/2027',
    cvv: '205',
    password: '123456',
    description: 'CVV2 Erroné',
    expectedResult: 'FAIL'
  },
  {
    number: '6280580610061318',
    expiry: '01/2027',
    cvv: '930',
    password: '666666',
    description: 'Dépassement Nb autorisé des PASSWORD (3 codes faux)',
    expectedResult: 'FAIL'
  },
  {
    number: '6280581110007017',
    expiry: '01/2027',
    cvv: '632',
    password: '123456',
    description: 'Carte Non Autorisée pour le Service Paiement en ligne',
    expectedResult: 'FAIL'
  },
  {
    number: '6280581110007116',
    expiry: '01/2027',
    cvv: '040',
    password: '123456',
    description: 'Carte Non Active et valide pour le Service Paiement en ligne',
    expectedResult: 'FAIL'
  },
  {
    number: '6280581110007215',
    expiry: '01/2027',
    cvv: '373',
    password: '123456',
    description: 'Carte valide',
    expectedResult: 'SUCCESS'
  },
  {
    number: '6280581110007314',
    expiry: '01/2027',
    cvv: '821',
    password: '123456',
    description: 'Dépassement Montant Plafond Terminal / TRX (MAX FLOOR LMT / AMT)',
    expectedResult: 'FAIL'
  },
  {
    number: '6280580610056615',
    expiry: '12/2022',
    cvv: '428',
    password: '123456',
    description: 'Carte expiré',
    expectedResult: 'FAIL'
  }
];

// Configuration SATIM (utilise les variables d'environnement)
const satimConfig = {
  username: process.env.SATIM_TEST_USERNAME || 'SAT2507010254',
  password: process.env.SATIM_TEST_PASSWORD || 'satim120',
  terminalId: process.env.SATIM_TEST_TERMINAL_ID || 'E010901571',
  baseUrl: process.env.SATIM_TEST_URL || 'https://test.satim.dz'
};

// Analyse des arguments de ligne de commande
const args = process.argv.slice(2);
const options = {
  card: null,
  amount: 10000, // 100 DZD par défaut (en centimes)
  verbose: false,
  customCard: false
};

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--card' && args[i + 1]) {
    options.card = args[i + 1];
    i++;
  } else if (args[i] === '--amount' && args[i + 1]) {
    options.amount = parseInt(args[i + 1], 10);
    i++;
  } else if (args[i] === '--verbose' || args[i] === '-v') {
    options.verbose = true;
  } else if (args[i] === '--custom-card') {
    options.customCard = true;
  } else if (args[i] === '--help' || args[i] === '-h') {
    console.log(`
${chalk.bold('Test des cartes SATIM')}

${chalk.bold('Usage:')}
  node test-satim-cards.js [options]

${chalk.bold('Options:')}
  --card NUMBER    Teste uniquement la carte spécifiée
  --amount NUMBER  Montant du test en centimes (par défaut: 10000 = 100 DZD)
  --verbose, -v    Affiche tous les détails des réponses
  --custom-card    Teste une carte personnalisée (6360982611108465)
  --help, -h       Affiche cette aide
    `);
    process.exit(0);
  }
}

// Fonction pour générer un numéro de commande unique
function generateOrderNumber() {
  const timestamp = Date.now().toString().slice(-6); // 6 derniers chiffres
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0'); // 2 chiffres
  return `BF${timestamp}${random}`; // BF + 6 + 2 = 10 caractères
}

// Fonction pour enregistrer une commande auprès de SATIM
async function registerOrder(cardDetails) {
  try {
    // Générer un numéro de commande unique
    const orderNumber = generateOrderNumber();
    
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
      amount: options.amount.toString(),
      currency: '012', // DZD
      returnUrl,
      failUrl,
      description: `Test carte ${cardDetails.number} - ${cardDetails.description}`,
      language: 'FR',
      jsonParams: JSON.stringify(jsonParams)
    });
    
    if (options.verbose) {
      console.log(chalk.blue('Envoi de la requête à SATIM...'));
      console.log(chalk.blue('URL:'), `${satimConfig.baseUrl}/payment/rest/register.do`);
      console.log(chalk.blue('Paramètres:'), params.toString());
    }
    
    // Envoyer la requête
    const response = await axios.get(
      `${satimConfig.baseUrl}/payment/rest/register.do`,
      { params }
    );
    
    return {
      success: !response.data.errorCode || response.data.errorCode === '0' || response.data.errorCode === 0,
      data: response.data,
      orderNumber
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      response: error.response?.data
    };
  }
}

// Fonction pour tester une carte
async function testCard(cardDetails) {
  console.log('\n' + '='.repeat(80));
  console.log(chalk.bold(`Test de la carte: ${cardDetails.number} (${cardDetails.description})`));
  console.log('-'.repeat(80));
  
  // Enregistrer la commande
  console.log(chalk.cyan('1. Enregistrement de la commande...'));
  const registerResult = await registerOrder(cardDetails);
  
  if (registerResult.success) {
    console.log(chalk.green('✓ Commande enregistrée avec succès'));
    console.log(chalk.green(`  - Numéro de commande: ${registerResult.orderNumber}`));
    console.log(chalk.green(`  - ID de commande SATIM: ${registerResult.data.orderId}`));
    console.log(chalk.green(`  - URL du formulaire: ${registerResult.data.formUrl}`));
    
    // Afficher les détails complets si demandé
    if (options.verbose) {
      console.log(chalk.yellow('\nRéponse complète:'));
      console.log(JSON.stringify(registerResult.data, null, 2));
    }
    
    // Note: Nous marquons toujours cette étape comme SUCCESS car c'est seulement l'enregistrement
    // L'échec réel se produirait lors de la tentative de paiement sur le formulaire SATIM
    return {
      card: cardDetails.number,
      description: cardDetails.description,
      expectedResult: cardDetails.expectedResult,
      // Pour l'étape d'enregistrement, toutes les cartes réussissent
      // L'échec se produirait à l'étape suivante (paiement sur le formulaire)
      actualResult: 'REGISTER_SUCCESS',
      orderId: registerResult.data.orderId,
      formUrl: registerResult.data.formUrl
    };
  } else {
    console.log(chalk.red(`✗ Échec de l'enregistrement de la commande`));
    
    if (registerResult.error) {
      console.log(chalk.red(`  - Erreur: ${registerResult.error}`));
    }
    
    if (registerResult.response) {
      console.log(chalk.red(`  - Réponse: ${JSON.stringify(registerResult.response)}`));
    }
    
    return {
      card: cardDetails.number,
      description: cardDetails.description,
      expectedResult: cardDetails.expectedResult,
      actualResult: 'REGISTER_FAIL',
      error: registerResult.error || 'Erreur inconnue'
    };
  }
}

// Fonction principale
async function runTests() {
  console.log(chalk.bold.green('\n=== TEST DES CARTES SATIM ==='));
  console.log(chalk.cyan(`Configuration: ${satimConfig.baseUrl} (${satimConfig.username})`));
  console.log(chalk.cyan(`Montant du test: ${(options.amount / 100).toFixed(2)} DZD`));
  
  const results = [];
  let cardsToTest = SATIM_TEST_CARDS;
  
  // Si l'option carte personnalisée est activée
  if (options.customCard) {
    // Carte personnalisée fournie par l'utilisateur
    cardsToTest = [{
      number: '6360982611108465',
      expiry: '01/2029',
      cvv: '238',
      password: '123456', // Mot de passe par défaut pour les tests
      description: 'Carte personnalisée',
      expectedResult: 'SUCCESS' // On suppose que la carte est valide
    }];
    console.log(chalk.yellow('Test avec une carte personnalisée'));
  }
  // Si une carte spécifique est demandée
  else if (options.card) {
    cardsToTest = SATIM_TEST_CARDS.filter(card => card.number.includes(options.card));
    if (cardsToTest.length === 0) {
      console.log(chalk.red(`Aucune carte trouvée avec le numéro ${options.card}`));
      process.exit(1);
    }
  }
  
  // Tester chaque carte
  for (const cardDetails of cardsToTest) {
    const result = await testCard(cardDetails);
    results.push(result);
  }
  
  // Afficher le résumé
  console.log('\n' + '='.repeat(80));
  console.log(chalk.bold.green('=== RÉSUMÉ DES TESTS ==='));
  console.log('-'.repeat(80));
  
  const registerSuccessCount = results.filter(r => r.actualResult === 'REGISTER_SUCCESS').length;
  const registerFailCount = results.length - registerSuccessCount;
  
  console.log(chalk.bold(`Total des tests: ${results.length}`));
  console.log(chalk.green(`Enregistrements réussis: ${registerSuccessCount}`));
  console.log(chalk.red(`Enregistrements échoués: ${registerFailCount}`));
  console.log(chalk.yellow(`\nNote: L'enregistrement est seulement la première étape du processus de paiement.`));
  console.log(chalk.yellow(`Les cartes marquées comme "NON conforme aux attentes" échoueraient à l'étape suivante`));
  console.log(chalk.yellow(`(lors de la tentative de paiement sur le formulaire SATIM).`));
  
  console.log('\n' + '-'.repeat(80));
  console.log(chalk.bold('Détails des résultats:'));
  console.log('-'.repeat(80));
  
  results.forEach((result, index) => {
    // Pour l'étape d'enregistrement, nous considérons que c'est conforme aux attentes
    // si l'enregistrement réussit (ce qui est normal pour toutes les cartes)
    const registerSuccess = result.actualResult === 'REGISTER_SUCCESS';
    
    // Mais nous indiquons aussi si le paiement final serait conforme aux attentes
    const paymentWouldBeExpected = 
      (result.expectedResult === 'SUCCESS' && registerSuccess) || 
      (result.expectedResult === 'FAIL' && !registerSuccess);
    
    const statusColor = registerSuccess ? chalk.green : chalk.red;
    const expectationColor = paymentWouldBeExpected ? chalk.green : chalk.yellow;
    
    console.log(`${index + 1}. ${statusColor('REGISTER_' + (registerSuccess ? 'SUCCESS' : 'FAIL'))} - Carte: ${result.card}`);
    console.log(`   Description: ${result.description}`);
    console.log(`   Résultat attendu au paiement final: ${result.expectedResult}`);
    
    if (registerSuccess) {
      // Si l'enregistrement a réussi mais que la carte devrait échouer au paiement
      if (result.expectedResult === 'FAIL') {
        console.log(`   Note: ${chalk.yellow('Cette carte réussit l\'enregistrement mais échouerait lors du paiement')}`);
      } else {
        console.log(`   Note: ${chalk.green('Cette carte devrait réussir le paiement complet')}`);
      }
    }
    
    if (result.formUrl) {
      console.log(`   URL du formulaire: ${result.formUrl}`);
    }
    
    if (result.error) {
      console.log(`   Erreur: ${result.error}`);
    }
    
    console.log();
  });
  
  console.log(chalk.bold.green('=== FIN DES TESTS ==='));
}

// Exécuter les tests
runTests().catch(error => {
  console.error(chalk.red('Erreur lors de l\'exécution des tests:'), error);
  process.exit(1);
});
