// Script de test pour vérifier la connexion API des clients
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Test de connexion à l'API
async function testClientAPI() {
  console.log('🧪 Test de l\'API Clients Beauty Flow\n');

  try {
    // Test 1: Health check
    console.log('1. Test de santé du serveur...');
    const healthResponse = await axios.get('http://localhost:5000/health');
    console.log('✅ Serveur en ligne:', healthResponse.data.status);

    // Test 2: Tentative de récupération des clients sans authentification
    console.log('\n2. Test de récupération des clients sans auth...');
    try {
      await axios.get(`${API_URL}/clients`);
      console.log('❌ Erreur: L\'API devrait rejeter les requêtes non authentifiées');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Protection d\'authentification fonctionne');
      } else {
        console.log('⚠️  Erreur inattendue:', error.response?.status);
      }
    }

    // Test 3: Test d'inscription
    console.log('\n3. Test d\'inscription...');
    const testUser = {
      email: `test-${Date.now()}@example.com`,
      password: 'testpassword123',
      establishmentName: 'Salon Test API',
      phone: '0123456789',
      address: '123 Rue Test'
    };

    const registerResponse = await axios.post(`${API_URL}/auth/register`, testUser);
    console.log('✅ Inscription réussie');
    
    const { token } = registerResponse.data;
    console.log('✅ Token reçu');

    // Test 4: Test de récupération des clients avec authentification
    console.log('\n4. Test de récupération des clients avec auth...');
    const clientsResponse = await axios.get(`${API_URL}/clients`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Récupération des clients réussie');
    console.log(`📊 Nombre de clients: ${clientsResponse.data.clients.length}`);

    // Test 5: Test de création d'un client
    console.log('\n5. Test de création d\'un client...');
    const testClient = {
      firstName: 'Marie',
      lastName: 'Test',
      email: 'marie.test@example.com',
      phone: '0987654321',
      preferences: {
        communicationPreferences: {
          smsReminders: true,
          emailMarketing: false,
          birthdayOffers: true
        }
      }
    };

    const createClientResponse = await axios.post(`${API_URL}/clients`, testClient, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Création de client réussie');
    
    const createdClient = createClientResponse.data.client;
    console.log(`📝 Client créé: ${createdClient.firstName} ${createdClient.lastName}`);

    // Test 6: Test de mise à jour du client
    console.log('\n6. Test de mise à jour du client...');
    const updateData = {
      notes: 'Client test créé via API'
    };

    await axios.put(`${API_URL}/clients/${createdClient._id}`, updateData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Mise à jour du client réussie');

    // Test 7: Test de suppression du client
    console.log('\n7. Test de suppression du client...');
    await axios.delete(`${API_URL}/clients/${createdClient._id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Suppression du client réussie');

    console.log('\n🎉 Tous les tests sont passés avec succès !');
    console.log('\n📋 Résumé:');
    console.log('- ✅ Serveur backend fonctionnel');
    console.log('- ✅ Authentification sécurisée');
    console.log('- ✅ CRUD clients complet');
    console.log('- ✅ API prête pour le frontend');

  } catch (error) {
    console.error('\n❌ Erreur lors du test:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    process.exit(1);
  }
}

// Exécuter les tests
testClientAPI();
