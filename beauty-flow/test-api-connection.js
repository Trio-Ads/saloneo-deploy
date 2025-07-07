/**
 * Script de test pour vérifier la connexion à l'API
 * Exécuter avec: node test-api-connection.js
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testAPIConnection() {
  console.log('🔍 Test de connexion à l\'API Beauty Flow...\n');

  try {
    // Test de base - vérifier si le serveur répond
    console.log('1. Test de connexion au serveur...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`, {
      timeout: 5000
    }).catch(() => {
      // Si pas de route health, essayer une route qui existe
      return axios.get(`${API_BASE_URL}/auth/me`, {
        timeout: 5000,
        validateStatus: () => true // Accepter toutes les réponses
      });
    });
    
    console.log('✅ Serveur accessible');
    console.log(`   Status: ${healthResponse.status}`);

    // Test des routes principales
    const routes = [
      '/appointments',
      '/clients', 
      '/services',
      '/team'
    ];

    console.log('\n2. Test des routes principales...');
    for (const route of routes) {
      try {
        const response = await axios.get(`${API_BASE_URL}${route}`, {
          timeout: 3000,
          validateStatus: (status) => status < 500 // Accepter 401, 403, etc.
        });
        
        if (response.status === 401) {
          console.log(`✅ ${route} - Authentification requise (normal)`);
        } else if (response.status < 400) {
          console.log(`✅ ${route} - Accessible`);
        } else {
          console.log(`⚠️  ${route} - Status ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ ${route} - Erreur: ${error.message}`);
      }
    }

    console.log('\n✅ Test de connexion terminé avec succès !');
    console.log('\n📋 Instructions pour nettoyer le cache:');
    console.log('1. Ouvrir la console du navigateur (F12)');
    console.log('2. Exécuter: beautyFlowDebug.diagnoseData()');
    console.log('3. Si des données en cache, exécuter: beautyFlowDebug.clearAllLocalData()');
    
  } catch (error) {
    console.log('❌ Erreur de connexion à l\'API:');
    console.log(`   ${error.message}`);
    console.log('\n🔧 Vérifications à faire:');
    console.log('1. Le serveur backend est-il démarré ? (npm run dev dans beauty-flow-backend)');
    console.log('2. Le serveur écoute-t-il sur le port 5000 ?');
    console.log('3. MongoDB est-il démarré ?');
  }
}

// Exécuter le test
testAPIConnection();
