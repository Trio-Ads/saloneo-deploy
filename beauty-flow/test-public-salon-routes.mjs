import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

async function testPublicRoutes() {
  console.log('🧪 Test des nouvelles routes publiques par slug...\n');

  // Test avec différents slugs possibles
  const testSlugs = [
    'salon-de-test',  // Le slug que nous venons de créer
    'test-salon',
    'salon-test', 
    'demo-salon',
    'beauty-salon',
    'mon-salon'
  ];

  for (const slug of testSlugs) {
    console.log(`📍 Test du slug: "${slug}"`);
    
    try {
      // Test route salon
      console.log(`  GET /public/salon/${slug}`);
      const salonResponse = await fetch(`${API_BASE}/public/salon/${slug}`);
      console.log(`  Status: ${salonResponse.status}`);
      
      if (salonResponse.ok) {
        const salonData = await salonResponse.json();
        console.log(`  ✅ Salon trouvé: ${salonData.establishmentName || salonData.firstName + ' ' + salonData.lastName}`);
        
        // Test routes services et team pour ce slug
        const servicesResponse = await fetch(`${API_BASE}/public/services/${slug}`);
        const teamResponse = await fetch(`${API_BASE}/public/team/${slug}`);
        
        console.log(`  Services status: ${servicesResponse.status}`);
        console.log(`  Team status: ${teamResponse.status}`);
        
        if (servicesResponse.ok) {
          const services = await servicesResponse.json();
          console.log(`  Services trouvés: ${services.length}`);
        }
        
        if (teamResponse.ok) {
          const team = await teamResponse.json();
          console.log(`  Membres d'équipe trouvés: ${team.length}`);
        }
        
        console.log(`  🌐 URL publique: http://localhost:3000/salon/${slug}\n`);
        return; // Arrêter dès qu'on trouve un salon qui fonctionne
      } else {
        const error = await salonResponse.text();
        console.log(`  ❌ Erreur: ${error}`);
      }
    } catch (error) {
      console.log(`  ❌ Erreur de connexion: ${error.message}`);
    }
    
    console.log('');
  }
  
  console.log('❌ Aucun salon trouvé avec les slugs testés.');
  console.log('\n💡 Solutions possibles:');
  console.log('1. Vérifier qu\'il y a des utilisateurs dans la base de données');
  console.log('2. Créer un utilisateur de test avec un nom d\'établissement');
  console.log('3. Vérifier que le backend est démarré sur le port 5000');
}

// Exécuter le test
testPublicRoutes().catch(console.error);
