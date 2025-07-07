/**
 * Script CLI pour migrer les images des services depuis localStorage vers la base de données
 * Usage: node migrate-images-cli.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const API_BASE_URL = 'http://localhost:5000/api';
const EMAIL = 'hello@thirdadvertising.dz';
const PASSWORD = 'hello';

// Données d'exemple des images (vous devrez les remplacer par vos vraies données)
const SAMPLE_SERVICE_IMAGES = {
  // Remplacez ces IDs par vos vrais IDs de services
  'service-id-1': [
    {
      url: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
      alt: 'Coupe moderne',
      isPrimary: true
    }
  ],
  'service-id-2': [
    {
      url: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
      alt: 'Coupe classique',
      isPrimary: true
    }
  ]
};

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

    const services = await response.json();
    console.log(`📊 ${services.length} services trouvés`);
    return services;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des services:', error.message);
    throw error;
  }
}

async function migrateServiceImages(token, serviceId, images) {
  try {
    console.log(`🔄 Migration des images pour le service ${serviceId}...`);
    
    const response = await fetch(`${API_BASE_URL}/services/${serviceId}/images`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ images })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erreur API: ${errorData.error || response.status}`);
    }

    console.log(`✅ Images migrées pour le service ${serviceId}`);
    return true;
  } catch (error) {
    console.error(`❌ Erreur pour le service ${serviceId}:`, error.message);
    return false;
  }
}

async function main() {
  try {
    console.log('🚀 Début de la migration des images des services...\n');

    // 1. Authentification
    const token = await authenticateAndGetToken();

    // 2. Récupération des services
    const services = await getServices(token);

    if (services.length === 0) {
      console.log('⚠️  Aucun service trouvé. Rien à migrer.');
      return;
    }

    // 3. Migration des images pour chaque service
    let migratedCount = 0;
    let errorCount = 0;

    console.log('\n📸 Migration des images...');
    
    for (const service of services) {
      const serviceId = service.id || service._id;
      
      // Vérifier si nous avons des images pour ce service
      const imagesToMigrate = SAMPLE_SERVICE_IMAGES[serviceId];
      
      if (!imagesToMigrate || imagesToMigrate.length === 0) {
        console.log(`⏭️  Service "${service.name}" (${serviceId}) : aucune image à migrer`);
        continue;
      }

      const success = await migrateServiceImages(token, serviceId, imagesToMigrate);
      
      if (success) {
        migratedCount++;
      } else {
        errorCount++;
      }
    }

    // 4. Résumé
    console.log('\n📊 RÉSUMÉ DE LA MIGRATION :');
    console.log(`✅ Services migrés avec succès : ${migratedCount}`);
    console.log(`❌ Services en erreur : ${errorCount}`);
    console.log(`📝 Total traité : ${migratedCount + errorCount}`);

    if (migratedCount > 0) {
      console.log('\n🎉 Migration terminée ! Actualisez votre page publique pour voir les images.');
      console.log('🌐 Page publique : http://localhost:3000/salon/third-advertising-dd');
    }

  } catch (error) {
    console.error('\n❌ Erreur générale lors de la migration :', error.message);
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
