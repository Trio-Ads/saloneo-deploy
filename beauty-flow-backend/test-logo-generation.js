const axios = require('axios');

async function testLogoGeneration() {
  try {
    console.log('🎨 Test de génération du logo Saloneo...\n');
    
    const response = await axios.get('http://localhost:5000/api/marketing/logo/generate');
    
    if (response.data.success) {
      console.log('✅ Logo généré avec succès !');
      console.log('📍 Logo horizontal:', response.data.logo.horizontal);
      console.log('📍 Logo carré:', response.data.logo.square);
      console.log('💾 Depuis le cache:', response.data.fromCache ? 'Oui' : 'Non');
      
      console.log('\n🌐 URLs complètes:');
      console.log('Horizontal:', `http://localhost:5000${response.data.logo.horizontal.url}`);
      console.log('Carré:', `http://localhost:5000${response.data.logo.square.url}`);
    } else {
      console.error('❌ Erreur:', response.data.error);
    }
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.response?.data || error.message);
    console.log('\n💡 Assurez-vous que:');
    console.log('1. Le backend est démarré (npm run dev)');
    console.log('2. L\'API Stability AI est configurée');
    console.log('3. Vous avez une clé API valide');
  }
}

// Exécuter le test
testLogoGeneration();
