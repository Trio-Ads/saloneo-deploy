import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:5000/api';

async function testAppointmentCreation() {
  console.log('🔍 Test de création de rendez-vous...\n');

  // Étape 1: Se connecter pour obtenir un token
  console.log('1. Connexion...');
  const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'hello@thirdadvertising.dz',
      password: 'hello'
    })
  });

  if (!loginResponse.ok) {
    console.log('❌ Échec de connexion');
    return;
  }

  const loginData = await loginResponse.json();
  const token = loginData.token;
  console.log('✅ Connexion réussie');

  // Étape 2: Récupérer les clients
  console.log('\n2. Récupération des clients...');
  const clientsResponse = await fetch(`${API_BASE_URL}/clients`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!clientsResponse.ok) {
    console.log('❌ Échec de récupération des clients');
    return;
  }

  const clientsData = await clientsResponse.json();
  console.log(`✅ ${clientsData.clients?.length || 0} clients trouvés`);
  
  if (!clientsData.clients || clientsData.clients.length === 0) {
    console.log('⚠️ Aucun client trouvé. Création d\'un client de test...');
    
    // Créer un client de test
    const createClientResponse = await fetch(`${API_BASE_URL}/clients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'Client',
        email: 'test.client@example.com',
        phone: '+33123456789',
        dateOfBirth: '1990-01-01',
        gender: 'female'
      })
    });

    if (!createClientResponse.ok) {
      console.log('❌ Échec de création du client de test');
      const errorData = await createClientResponse.json();
      console.log('Erreur:', errorData);
      return;
    }

    const newClient = await createClientResponse.json();
    clientsData.clients = [newClient.client];
    console.log('✅ Client de test créé');
  }

  const testClient = clientsData.clients[0];
  console.log(`📋 Client sélectionné: ${testClient.firstName} ${testClient.lastName} (ID: ${testClient._id})`);

  // Étape 3: Tester la création de rendez-vous
  console.log('\n3. Test de création de rendez-vous...');
  
  const appointmentData = {
    clientId: testClient._id,
    serviceId: 'service-uuid-123', // UUID fictif pour le service
    teamMemberId: 'team-member-uuid-456', // UUID fictif pour le membre d'équipe
    date: '2025-07-15', // Date future
    startTime: '14:30', // Créneau différent
    notes: 'Rendez-vous de test'
  };

  console.log('📤 Données envoyées:', JSON.stringify(appointmentData, null, 2));

  const appointmentResponse = await fetch(`${API_BASE_URL}/appointments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(appointmentData)
  });

  console.log(`📥 Statut de réponse: ${appointmentResponse.status}`);

  if (appointmentResponse.ok) {
    const appointmentResult = await appointmentResponse.json();
    console.log('✅ Rendez-vous créé avec succès !');
    console.log('📋 Détails:', JSON.stringify(appointmentResult, null, 2));
  } else {
    console.log('❌ Échec de création du rendez-vous');
    const errorData = await appointmentResponse.json();
    console.log('📝 Erreur détaillée:', JSON.stringify(errorData, null, 2));
    
    // Analyser les erreurs de validation
    if (errorData.errors) {
      console.log('\n🔍 Erreurs de validation:');
      errorData.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error.path}: ${error.msg}`);
      });
    }
  }
}

testAppointmentCreation().catch(console.error);
