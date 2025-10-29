import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Configuration axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fonction pour se connecter et obtenir un token
async function login() {
  try {
    console.log('🔐 Connexion...');
    const response = await api.post('/auth/login', {
      email: 'hello@thirdadvertising.dz',
      password: 'hello'
    });
    
    if (response.data.token) {
      // Configurer le token pour les prochaines requêtes
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      console.log('✅ Connexion réussie');
      return response.data.token;
    } else {
      throw new Error('Pas de token reçu');
    }
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.response?.data || error.message);
    throw error;
  }
}

// Fonction pour tester la création d'un membre d'équipe
async function testCreateTeamMember() {
  try {
    console.log('\n📝 Test de création d\'un membre d\'équipe...');
    
    const teamMemberData = {
      firstName: 'Marie',
      lastName: 'Dubois',
      email: 'marie.dubois@test.com',
      phone: '+33 6 12 34 56 78',
      role: 'Coiffeur(se)',
      specialties: [],
      services: [],
      workingHours: {
        monday: { isWorking: true, start: '09:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
        tuesday: { isWorking: true, start: '09:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
        wednesday: { isWorking: true, start: '09:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
        thursday: { isWorking: true, start: '09:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
        friday: { isWorking: true, start: '09:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
        saturday: { isWorking: true, start: '09:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
        sunday: { isWorking: false }
      },
      isActive: true,
      color: '#FF6B6B'
    };

    console.log('📤 Données envoyées:', JSON.stringify(teamMemberData, null, 2));

    const response = await api.post('/team', teamMemberData);
    
    console.log('✅ Membre d\'équipe créé avec succès!');
    console.log('📥 Réponse:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('❌ Erreur lors de la création du membre d\'équipe:');
    console.error('Status:', error.response?.status);
    console.error('Data:', JSON.stringify(error.response?.data, null, 2));
    console.error('Headers:', error.response?.headers);
    throw error;
  }
}

// Fonction pour tester la récupération des membres d'équipe
async function testGetTeamMembers() {
  try {
    console.log('\n📋 Test de récupération des membres d\'équipe...');
    
    const response = await api.get('/team');
    
    console.log('✅ Membres d\'équipe récupérés avec succès!');
    console.log('📥 Réponse:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des membres d\'équipe:');
    console.error('Status:', error.response?.status);
    console.error('Data:', JSON.stringify(error.response?.data, null, 2));
    throw error;
  }
}

// Fonction principale
async function main() {
  try {
    console.log('🚀 Début des tests API Team...\n');
    
    // Se connecter
    await login();
    
    // Tester la récupération des membres
    await testGetTeamMembers();
    
    // Tester la création d'un membre
    await testCreateTeamMember();
    
    // Tester à nouveau la récupération pour voir le nouveau membre
    await testGetTeamMembers();
    
    console.log('\n🎉 Tous les tests sont terminés avec succès!');
    
  } catch (error) {
    console.error('\n💥 Erreur dans les tests:', error.message);
    process.exit(1);
  }
}

// Exécuter les tests
main();
