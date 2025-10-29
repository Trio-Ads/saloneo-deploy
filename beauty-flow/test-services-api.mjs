import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

// Fonction pour se connecter et obtenir un token
async function login() {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'hello@thirdadvertising.dz',
        password: 'hello'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    return null;
  }
}

// Fonction pour tester l'API des services
async function testServicesAPI() {
  console.log('🔍 Test de l\'API des services...\n');

  // 1. Connexion
  console.log('1. Connexion...');
  const token = await login();
  if (!token) {
    console.log('❌ Impossible de se connecter');
    return;
  }
  console.log('✅ Connexion réussie\n');

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // 2. Test GET /api/services
  console.log('2. Test GET /api/services...');
  try {
    const response = await fetch(`${API_BASE}/services`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const services = await response.json();
    console.log('✅ Services récupérés:', services.length || 0, 'services');
    console.log('📋 Données:', JSON.stringify(services, null, 2));
  } catch (error) {
    console.error('❌ Erreur GET services:', error.message);
  }

  console.log('\n3. Test POST /api/services (création d\'un service)...');
  try {
    const newService = {
      name: 'Test Service',
      description: 'Service de test',
      category: 'Coupe',
      duration: 60,
      price: 50,
      bufferTimeBefore: 5,
      bufferTimeAfter: 5,
      maxAdvanceBooking: 30,
      minAdvanceBooking: 1,
      isOnlineBookingEnabled: true
    };

    const response = await fetch(`${API_BASE}/services`, {
      method: 'POST',
      headers,
      body: JSON.stringify(newService)
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorData}`);
    }

    const createdService = await response.json();
    console.log('✅ Service créé avec succès');
    console.log('📋 Service créé:', JSON.stringify(createdService, null, 2));
  } catch (error) {
    console.error('❌ Erreur POST service:', error.message);
  }
}

// Exécuter le test
testServicesAPI();
