import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

async function createDemoServices() {
  console.log('🎨 Création de services de démonstration...\n');

  try {
    // Se connecter avec l'utilisateur de test
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'salon@test.com',
        password: 'password123'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Échec de la connexion');
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Connexion réussie !');

    // Services de démonstration modernes
    const demoServices = [
      {
        name: 'Coupe & Brushing',
        description: 'Coupe personnalisée avec brushing professionnel pour sublimer votre style',
        category: 'Coiffure',
        duration: 60,
        price: 45,
        isActive: true,
        isPublic: true,
        isOnline: true
      },
      {
        name: 'Coloration Complète',
        description: 'Transformation complète avec coloration premium et soins nourrissants',
        category: 'Coloration',
        duration: 120,
        price: 85,
        isActive: true,
        isPublic: true,
        isOnline: true
      },
      {
        name: 'Balayage Naturel',
        description: 'Technique de balayage pour un effet naturel et lumineux',
        category: 'Coloration',
        duration: 150,
        price: 120,
        isActive: true,
        isPublic: true,
        isOnline: true
      },
      {
        name: 'Soin Capillaire Luxe',
        description: 'Soin réparateur intensif avec masque haute qualité',
        category: 'Soins',
        duration: 45,
        price: 35,
        isActive: true,
        isPublic: true,
        isOnline: true
      },
      {
        name: 'Maquillage Événement',
        description: 'Maquillage professionnel pour vos événements spéciaux',
        category: 'Maquillage',
        duration: 90,
        price: 65,
        isActive: true,
        isPublic: true,
        isOnline: true
      },
      {
        name: 'Manucure Gel',
        description: 'Manucure complète avec pose de vernis gel longue tenue',
        category: 'Ongles',
        duration: 75,
        price: 40,
        isActive: true,
        isPublic: true,
        isOnline: true
      }
    ];

    console.log('📝 Création des services...');
    
    for (const service of demoServices) {
      const response = await fetch(`${API_BASE}/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(service)
      });

      if (response.ok) {
        console.log(`✅ Service créé: ${service.name} - ${service.price}€`);
      } else {
        const error = await response.text();
        console.log(`❌ Erreur pour ${service.name}: ${error}`);
      }
    }

    console.log('\n🎉 Services de démonstration créés avec succès !');
    console.log('🌐 Visitez: http://localhost:3000/salon/salon-de-test');

  } catch (error) {
    console.log(`❌ Erreur: ${error.message}`);
  }
}

createDemoServices().catch(console.error);
