// Script de debug pour la création de clients
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function debugClientCreation() {
  console.log('🔍 Debug de la création de clients\n');

  try {
    // 1. Test d'inscription pour obtenir un token
    console.log('1. Création d\'un utilisateur de test...');
    const testUser = {
      email: `debug-${Date.now()}@example.com`,
      password: 'testpassword123',
      establishmentName: 'Salon Debug',
      phone: '0123456789',
      address: '123 Rue Debug'
    };

    const registerResponse = await axios.post(`${API_URL}/auth/register`, testUser);
    const { token } = registerResponse.data;
    console.log('✅ Utilisateur créé et token obtenu');

    // 2. Test avec données minimales
    console.log('\n2. Test avec données minimales...');
    const minimalClient = {
      firstName: 'Test',
      lastName: 'Client',
      phone: '0987654321'
    };

    try {
      const response = await axios.post(`${API_URL}/clients`, minimalClient, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Client minimal créé:', response.data.client.firstName, response.data.client.lastName);
    } catch (error) {
      console.log('❌ Erreur avec données minimales:');
      console.log('Status:', error.response?.status);
      console.log('Data:', error.response?.data);
    }

    // 3. Test avec données complètes
    console.log('\n3. Test avec données complètes...');
    const fullClient = {
      firstName: 'Marie',
      lastName: 'Dupont',
      email: 'marie.dupont@example.com',
      phone: '0123456789',
      dateOfBirth: '1990-01-01',
      address: '123 Rue de la Paix, Paris',
      notes: 'Cliente test',
      preferences: {
        favoriteServices: [],
        preferredStylists: [],
        communicationPreferences: {
          smsReminders: true,
          emailMarketing: false,
          birthdayOffers: true
        },
        hairQuestionnaire: {
          type: 'Ondulés',
          thickness: 'Moyens',
          condition: 'Normaux',
          chemicalTreatments: ['Aucun'],
          concerns: [],
          washFrequency: 'Tous les 2 jours',
          preferredStyles: []
        },
        skinQuestionnaire: {
          type: 'Normale',
          sensitivity: 'Faible',
          concerns: [],
          allergies: [],
          currentProducts: [],
          goals: []
        }
      }
    };

    try {
      const response = await axios.post(`${API_URL}/clients`, fullClient, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Client complet créé:', response.data.client.firstName, response.data.client.lastName);
    } catch (error) {
      console.log('❌ Erreur avec données complètes:');
      console.log('Status:', error.response?.status);
      console.log('Data:', error.response?.data);
      
      if (error.response?.data?.details) {
        console.log('Détails:', error.response.data.details);
      }
    }

    // 4. Test avec données invalides pour voir la validation
    console.log('\n4. Test avec données invalides...');
    const invalidClient = {
      firstName: '', // Vide
      lastName: 'Test',
      phone: 'invalid-phone',
      email: 'invalid-email'
    };

    try {
      await axios.post(`${API_URL}/clients`, invalidClient, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('⚠️  Données invalides acceptées (problème de validation)');
    } catch (error) {
      console.log('✅ Validation fonctionne - données invalides rejetées');
      console.log('Erreurs:', error.response?.data?.errors || error.response?.data);
    }

  } catch (error) {
    console.error('\n💥 Erreur générale:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Exécuter le debug
debugClientCreation();
