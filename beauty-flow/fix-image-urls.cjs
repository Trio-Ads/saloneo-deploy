/**
 * Script pour corriger les URLs des images des services
 * Convertit les clés localStorage en vraies URLs
 * Usage: node fix-image-urls.cjs
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

async function updateServiceImages(token, serviceId, images) {
  try {
    console.log(`🔄 Mise à jour des images pour le service ${serviceId}...`);
    
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

    console.log(`✅ Images mises à jour pour le service ${serviceId}`);
    return true;
  } catch (error) {
    console.error(`❌ Erreur pour le service ${serviceId}:`, error.message);
    return false;
  }
}

function convertLocalStorageKeyToUrl(key) {
  // Si c'est déjà une URL, la retourner
  if (key.startsWith('http') || key.startsWith('/uploads/')) {
    return key;
  }
  
  // Si c'est une clé localStorage, créer une URL placeholder
  // En réalité, ces images n'existent pas sur le serveur car elles étaient dans localStorage
  // On va utiliser des images placeholder pour l'instant
  const placeholderImages = [
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&h=600&fit=crop'
  ];
  
  // Utiliser une image différente selon la clé pour avoir de la variété
  const index = key.length % placeholderImages.length;
  return placeholderImages[index];
}

async function main() {
  try {
    console.log('🚀 Début de la correction des URLs d\'images...\n');

    // 1. Authentification
    const token = await authenticateAndGetToken();

    // 2. Récupération des services
    const services = await getServices(token);

    if (services.length === 0) {
      console.log('⚠️  Aucun service trouvé. Rien à corriger.');
      return;
    }

    // 3. Correction des URLs pour chaque service
    let correctedCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    console.log('\n🖼️  Correction des URLs d\'images...');
    
    for (const service of services) {
      const serviceId = service.id || service._id;
      
      console.log(`\n📝 Service "${service.name}" (${serviceId})`);
      
      if (!service.images || service.images.length === 0) {
        console.log(`   ⏭️  Aucune image, ignoré`);
        skippedCount++;
        continue;
      }

      // Vérifier si les URLs sont déjà correctes
      const needsCorrection = service.images.some(img => 
        !img.url.startsWith('http') && !img.url.startsWith('/uploads/')
      );

      if (!needsCorrection) {
        console.log(`   ✅ URLs déjà correctes, ignoré`);
        skippedCount++;
        continue;
      }

      // Corriger les URLs
      const correctedImages = service.images.map((img, index) => ({
        url: convertLocalStorageKeyToUrl(img.url),
        alt: img.alt || `Image ${index + 1}`,
        isPrimary: img.isPrimary || index === 0
      }));

      console.log(`   🔧 Correction de ${correctedImages.length} image(s):`);
      correctedImages.forEach((img, index) => {
        console.log(`     ${index + 1}. ${img.url}`);
      });

      const success = await updateServiceImages(token, serviceId, correctedImages);
      
      if (success) {
        correctedCount++;
      } else {
        errorCount++;
      }
    }

    // 4. Résumé
    console.log('\n📊 RÉSUMÉ DE LA CORRECTION :');
    console.log(`✅ Services corrigés : ${correctedCount}`);
    console.log(`⏭️  Services ignorés : ${skippedCount}`);
    console.log(`❌ Services en erreur : ${errorCount}`);
    console.log(`📝 Total traité : ${correctedCount + skippedCount + errorCount}`);

    if (correctedCount > 0) {
      console.log('\n🎉 Correction terminée ! Les images devraient maintenant s\'afficher sur la page publique.');
      console.log('🌐 Actualisez votre page publique pour voir les images.');
      console.log('\n💡 Note: Des images placeholder ont été utilisées. Vous pouvez maintenant uploader vos vraies images via l\'interface admin.');
    }

  } catch (error) {
    console.error('\n❌ Erreur générale lors de la correction :', error.message);
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
