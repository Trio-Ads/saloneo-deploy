/**
 * Script pour déboguer les services et leurs images
 * Usage: node debug-services.cjs
 */

const API_BASE_URL = 'http://localhost:5000/api';
const EMAIL = 'hello@thirdadvertising.dz';
const PASSWORD = 'hello';

async function authenticateAndGetToken() {
  try {
    console.log('🔐 Authentification en cours...');
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: EMAIL,
        password: PASSWORD
      })
    });

    if (!response.ok) {
      throw new Error(`Erreur d'authentification: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Authentification réussie');
    return data.token;
  } catch (error) {
    console.error('❌ Erreur d\'authentification:', error.message);
    throw error;
  }
}

async function debugServices(token) {
  try {
    console.log('\n📋 Récupération des services...');
    
    const response = await fetch(`${API_BASE_URL}/services`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Erreur: ${response.status}`);
    }

    const data = await response.json();
    const services = data.services || data;
    
    console.log(`\n📊 ${services.length} services trouvés\n`);
    
    services.forEach((service, index) => {
      console.log(`🔍 SERVICE ${index + 1}:`);
      console.log(`   ID: ${service.id || service._id}`);
      console.log(`   Nom: ${service.name}`);
      console.log(`   Prix: ${service.price}`);
      console.log(`   Currency: ${service.currency}`);
      console.log(`   Images: ${service.images ? service.images.length : 0} image(s)`);
      
      if (service.images && service.images.length > 0) {
        service.images.forEach((img, imgIndex) => {
          console.log(`     Image ${imgIndex + 1}:`);
          console.log(`       URL: ${img.url}`);
          console.log(`       Alt: ${img.alt}`);
          console.log(`       Primary: ${img.isPrimary}`);
        });
      } else {
        console.log(`     ⚠️  Aucune image trouvée`);
      }
      console.log('');
    });
    
    return services;
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    throw error;
  }
}

async function debugPublicAPI() {
  try {
    console.log('\n🌐 Test de l\'API publique...');
    
    const response = await fetch(`${API_BASE_URL}/public/services/third-advertising-dd`);
    
    if (!response.ok) {
      throw new Error(`Erreur API publique: ${response.status}`);
    }

    const services = await response.json();
    
    console.log(`📊 API publique: ${services.length} services trouvés\n`);
    
    services.forEach((service, index) => {
      console.log(`🌍 SERVICE PUBLIC ${index + 1}:`);
      console.log(`   ID: ${service.id || service._id}`);
      console.log(`   Nom: ${service.name}`);
      console.log(`   Prix: ${service.price}`);
      console.log(`   Currency: ${service.currency}`);
      console.log(`   Images: ${service.images ? service.images.length : 0} image(s)`);
      
      if (service.images && service.images.length > 0) {
        service.images.forEach((img, imgIndex) => {
          console.log(`     Image ${imgIndex + 1}:`);
          console.log(`       URL: ${img.url}`);
          console.log(`       Alt: ${img.alt}`);
        });
      }
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Erreur API publique:', error.message);
  }
}

async function main() {
  try {
    console.log('🚀 Début du débogage...');

    // 1. Authentification
    const token = await authenticateAndGetToken();

    // 2. Debug services privés
    await debugServices(token);

    // 3. Debug API publique
    await debugPublicAPI();

  } catch (error) {
    console.error('\n❌ Erreur générale:', error.message);
    process.exit(1);
  }
}

// Vérification que fetch est disponible (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.error('❌ Ce script nécessite Node.js 18+');
  process.exit(1);
}

// Exécution du script
main();
