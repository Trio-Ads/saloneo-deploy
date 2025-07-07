import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

// Helper function to generate slug
const generateSalonSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

async function findExistingUsers() {
  console.log('🔍 Recherche des utilisateurs existants...\n');

  try {
    // D'abord, essayons de nous connecter pour obtenir un token
    console.log('🔐 Tentative de connexion...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      const token = loginData.token;
      
      console.log('✅ Connexion réussie !');
      
      // Maintenant récupérons le profil de l'utilisateur connecté
      const profileResponse = await fetch(`${API_BASE}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (profileResponse.ok) {
        const profile = await profileResponse.json();
        console.log('\n👤 Profil utilisateur trouvé:');
        console.log(`  Nom: ${profile.firstName} ${profile.lastName}`);
        console.log(`  Email: ${profile.email}`);
        console.log(`  Établissement: ${profile.establishmentName || 'Non défini'}`);
        
        // Générer le slug pour cet utilisateur
        const salonName = profile.establishmentName || `${profile.firstName} ${profile.lastName}`;
        const slug = generateSalonSlug(salonName);
        
        console.log(`  Slug généré: "${slug}"`);
        console.log(`  🌐 URL publique: http://localhost:3000/salon/${slug}`);
        
        // Tester cette URL
        console.log('\n🧪 Test de l\'URL publique...');
        const testResponse = await fetch(`${API_BASE}/public/salon/${slug}`);
        console.log(`  Status: ${testResponse.status}`);
        
        if (testResponse.ok) {
          console.log('  ✅ L\'URL publique fonctionne !');
        } else {
          const error = await testResponse.text();
          console.log(`  ❌ Erreur: ${error}`);
        }
        
      } else {
        console.log('❌ Impossible de récupérer le profil');
      }
      
    } else {
      console.log('❌ Échec de la connexion avec test@example.com');
      console.log('💡 Essayons de créer un utilisateur de test...');
      
      // Essayer de créer un utilisateur
      const registerResponse = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: 'Salon',
          lastName: 'Test',
          email: 'salon@test.com',
          password: 'password123',
          establishmentName: 'Salon de Test'
        })
      });
      
      if (registerResponse.ok) {
        console.log('✅ Utilisateur de test créé !');
        const userData = await registerResponse.json();
        
        const slug = generateSalonSlug('Salon de Test');
        console.log(`  Slug généré: "${slug}"`);
        console.log(`  🌐 URL publique: http://localhost:3000/salon/${slug}`);
        
      } else {
        const error = await registerResponse.text();
        console.log(`❌ Erreur lors de la création: ${error}`);
      }
    }
    
  } catch (error) {
    console.log(`❌ Erreur de connexion: ${error.message}`);
    console.log('💡 Vérifiez que le backend est démarré sur le port 5000');
  }
}

// Exécuter la recherche
findExistingUsers().catch(console.error);
