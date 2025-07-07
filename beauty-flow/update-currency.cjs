/**
 * Script pour mettre à jour la currency des services existants
 * Usage: node update-currency.cjs
 */

const API_BASE_URL = 'http://localhost:5000/api';
const EMAIL = 'hello@thirdadvertising.dz';
const PASSWORD = 'hello';
const NEW_CURRENCY = 'GBP'; // Changer de DZD vers GBP

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

async function getServices(token) {
  try {
    console.log('📋 Récupération de la liste des services...');
    
    const response = await fetch(`${API_BASE_URL}/services`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des services: ${response.status}`);
    }

    const data = await response.json();
    const services = data.services || data;
    console.log(`📊 ${services.length} services trouvés`);
    return services;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des services:', error.message);
    throw error;
  }
}

async function updateServiceCurrency(token, serviceId, currency) {
  try {
    console.log(`🔄 Mise à jour de la currency pour le service ${serviceId}...`);
    
    const response = await fetch(`${API_BASE_URL}/services/${serviceId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ currency })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erreur API: ${errorData.error || response.status}`);
    }

    console.log(`✅ Currency mise à jour pour le service ${serviceId}`);
    return true;
  } catch (error) {
    console.error(`❌ Erreur pour le service ${serviceId}:`, error.message);
    return false;
  }
}

async function main() {
  try {
    console.log('🚀 Début de la mise à jour des currencies...\n');

    // 1. Authentification
    const token = await authenticateAndGetToken();

    // 2. Récupération des services
    const services = await getServices(token);

    if (services.length === 0) {
      console.log('⚠️  Aucun service trouvé. Rien à mettre à jour.');
      return;
    }

    // 3. Mise à jour de la currency pour chaque service
    let updatedCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    console.log('\n💰 Mise à jour des currencies...');
    
    for (const service of services) {
      const serviceId = service.id || service._id;
      const currentCurrency = service.currency;
      
      console.log(`\n📝 Service "${service.name}" (${serviceId})`);
      console.log(`   Currency actuelle: ${currentCurrency}`);
      
      if (currentCurrency === NEW_CURRENCY) {
        console.log(`   ⏭️  Déjà en ${NEW_CURRENCY}, ignoré`);
        skippedCount++;
        continue;
      }

      const success = await updateServiceCurrency(token, serviceId, NEW_CURRENCY);
      
      if (success) {
        console.log(`   ✅ Mis à jour: ${currentCurrency} → ${NEW_CURRENCY}`);
        updatedCount++;
      } else {
        console.log(`   ❌ Échec de la mise à jour`);
        errorCount++;
      }
    }

    // 4. Résumé
    console.log('\n📊 RÉSUMÉ DE LA MISE À JOUR :');
    console.log(`✅ Services mis à jour : ${updatedCount}`);
    console.log(`⏭️  Services ignorés (déjà en ${NEW_CURRENCY}) : ${skippedCount}`);
    console.log(`❌ Services en erreur : ${errorCount}`);
    console.log(`📝 Total traité : ${updatedCount + skippedCount + errorCount}`);

    if (updatedCount > 0) {
      console.log(`\n🎉 Mise à jour terminée ! Vos services utilisent maintenant ${NEW_CURRENCY}.`);
      console.log('🌐 Actualisez votre page publique pour voir les prix en £.');
    }

  } catch (error) {
    console.error('\n❌ Erreur générale lors de la mise à jour :', error.message);
    process.exit(1);
  }
}

// Vérification que fetch est disponible (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.error('❌ Ce script nécessite Node.js 18+ ou l\'installation du package node-fetch');
  console.log('💡 Installez node-fetch : npm install node-fetch');
  process.exit(1);
}

// Exécution du script
main();
