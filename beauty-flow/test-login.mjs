import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:5000/api';

async function testLogin() {
  console.log('🔍 Test de connexion API...\n');

  // Test 1: Vérifier que le serveur répond
  try {
    console.log('1. Test de connectivité du serveur...');
    const healthResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@invalid.com',
        password: 'invalid'
      })
    });
    
    if (healthResponse.status === 401) {
      console.log('✅ Serveur accessible (erreur 401 attendue pour des identifiants invalides)');
    } else {
      console.log(`⚠️ Réponse inattendue: ${healthResponse.status}`);
    }
  } catch (error) {
    console.log('❌ Serveur non accessible:', error.message);
    console.log('💡 Assurez-vous que le backend est lancé avec: cd beauty-flow-backend && npm run dev');
    return;
  }

  // Test 2: Connexion avec un utilisateur valide
  const testUsers = [
    { email: 'hani.mazouni@gmail.com', password: 'hello' },
    { email: 'hello@thirdadvertising.dz', password: 'hello' },
    { email: 'hanimazouni@gmail.com', password: 'hello' }
  ];

  for (const user of testUsers) {
    console.log(`\n2. Test de connexion avec ${user.email}...`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user)
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Connexion réussie !');
        console.log('🔑 Token reçu:', data.token ? 'Oui' : 'Non');
        console.log('👤 Utilisateur:', data.user?.email || 'Non défini');
        console.log('🏢 Établissement:', data.user?.establishmentName || 'Non défini');
        return; // Arrêter au premier succès
      } else {
        console.log(`❌ Échec de connexion: ${data.error || 'Erreur inconnue'}`);
        console.log('📝 Détails:', JSON.stringify(data, null, 2));
      }
    } catch (error) {
      console.log('❌ Erreur lors de la connexion:', error.message);
    }
  }

  console.log('\n💡 Suggestions:');
  console.log('1. Vérifiez que le backend est lancé');
  console.log('2. Vérifiez la base de données MongoDB');
  console.log('3. Essayez de créer un nouvel utilisateur');
}

testLogin();
