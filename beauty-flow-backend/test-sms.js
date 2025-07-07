#!/usr/bin/env node

/**
 * Script de test pour le service SMS eliteSMS
 * Usage: node test-sms.js
 */

require('dotenv').config();

// Configuration temporaire pour le test
process.env.ELITESMS_API_KEY = '257ba87eae01fe6bf142835ff89e1dab74f31362';
process.env.ELITESMS_USER_KEY = 'd6747aced94a812fec497d5c08e55b35';

// Import du service compilé
const { smsService } = require('./dist/services/smsService');

// Numéro de test
const TEST_NUMBER = '213550497322';

console.log('🚀 Test du service SMS eliteSMS\n');
console.log('Configuration:');
console.log('- API Key:', process.env.ELITESMS_API_KEY ? '✅ Configurée' : '❌ Manquante');
console.log('- User Key:', process.env.ELITESMS_USER_KEY ? '✅ Configurée' : '❌ Manquante');
console.log('- Numéro de test:', TEST_NUMBER);
console.log('\n' + '='.repeat(50) + '\n');

async function testSMS() {
  try {
    // Test 1: Envoi d'un SMS simple
    console.log('📱 Test 1: Envoi d\'un SMS simple...');
    const result1 = await smsService.sendSMS({
      to: TEST_NUMBER,
      message: 'Test Saloneo: Ceci est un SMS de test pour vérifier l\'intégration eliteSMS. Si vous recevez ce message, l\'intégration fonctionne correctement!'
    });

    if (result1.success) {
      console.log('✅ SMS envoyé avec succès!');
      console.log('- Message ID:', result1.messageId);
      console.log('- Statut:', result1.status);
      
      // Attendre 3 secondes avant de vérifier le statut
      console.log('\n⏳ Attente de 3 secondes avant de vérifier le statut...');
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Vérifier le statut
      console.log('\n📊 Vérification du statut du SMS...');
      const statusResult = await smsService.getSMSStatus(result1.messageId);
      
      if (statusResult.success) {
        console.log('✅ Statut récupéré:');
        console.log('- Statut actuel:', statusResult.status);
        console.log('- Coût:', statusResult.cost, 'DZD');
        
        // Explication des statuts
        const statusExplanations = {
          'S': 'SMS envoyé à l\'opérateur',
          'P': 'SMS en attente de livraison',
          'D': 'SMS livré au destinataire',
          'A': 'SMS rejeté par l\'opérateur',
          'E': 'Erreur d\'envoi',
          'F': 'Numéro invalide',
          'I': 'Crédit insuffisant'
        };
        
        console.log('- Explication:', statusExplanations[statusResult.status] || 'Statut inconnu');
      } else {
        console.log('❌ Erreur lors de la récupération du statut:', statusResult.error);
      }
    } else {
      console.log('❌ Erreur lors de l\'envoi du SMS:', result1.error);
    }

    // Test 2: Test d'un SMS de confirmation de RDV
    console.log('\n' + '='.repeat(50) + '\n');
    console.log('📱 Test 2: Envoi d\'un SMS de confirmation de RDV...');
    
    const result2 = await smsService.sendAppointmentConfirmation({
      to: TEST_NUMBER,
      salonName: 'Salon Test Saloneo',
      date: '15/01/2025',
      time: '14:30',
      service: 'Coupe et Brushing',
      token: 'ABC123'
    });

    if (result2.success) {
      console.log('✅ SMS de confirmation envoyé!');
      console.log('- Message ID:', result2.messageId);
    } else {
      console.log('❌ Erreur:', result2.error);
    }

    // Test 3: Test avec un numéro au format local
    console.log('\n' + '='.repeat(50) + '\n');
    console.log('📱 Test 3: Test de formatage de numéro (format local)...');
    
    const localNumber = '0550497322';
    console.log('- Numéro local:', localNumber);
    
    const result3 = await smsService.sendSMS({
      to: localNumber,
      message: 'Test format local: Ce SMS teste le formatage automatique des numéros.'
    });

    if (result3.success) {
      console.log('✅ SMS envoyé avec numéro local!');
      console.log('- Le numéro a été automatiquement converti au format international');
    } else {
      console.log('❌ Erreur:', result3.error);
    }

  } catch (error) {
    console.error('❌ Erreur inattendue:', error.message);
  }
}

// Afficher les templates disponibles
console.log('📝 Templates SMS disponibles:\n');
const templates = smsService.getTemplates();
Object.entries(templates).forEach(([key, value]) => {
  console.log(`${key}:`);
  console.log(`  "${value}"`);
  console.log();
});

console.log('='.repeat(50) + '\n');

// Lancer les tests
testSMS().then(() => {
  console.log('\n✅ Tests terminés!');
  console.log('\n💡 Prochaines étapes:');
  console.log('1. Vérifiez que vous avez reçu les SMS sur', TEST_NUMBER);
  console.log('2. Si tout fonctionne, ajoutez les variables d\'environnement dans .env');
  console.log('3. L\'intégration SMS sera automatique lors des réservations');
  process.exit(0);
}).catch(error => {
  console.error('\n❌ Erreur fatale:', error);
  process.exit(1);
});
