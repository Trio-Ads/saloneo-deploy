/**
 * Script de migration pour synchroniser les images des services
 * depuis localStorage vers la base de données
 */

const API_BASE_URL = 'http://localhost:5000/api';

async function migrateServiceImages() {
  try {
    console.log('🔄 Début de la migration des images des services...');

    // Récupérer les données depuis localStorage
    const interfaceData = localStorage.getItem('beauty-flow-interface');
    if (!interfaceData) {
      console.log('❌ Aucune donnée d\'interface trouvée dans localStorage');
      return;
    }

    const parsedData = JSON.parse(interfaceData);
    const serviceSettings = parsedData.state?.serviceSettings || [];

    if (serviceSettings.length === 0) {
      console.log('❌ Aucun paramètre de service trouvé');
      return;
    }

    console.log(`📊 ${serviceSettings.length} services trouvés avec des paramètres`);

    // Récupérer le token d'authentification
    const authData = localStorage.getItem('beauty-flow-auth');
    if (!authData) {
      console.log('❌ Aucun token d\'authentification trouvé');
      return;
    }

    const token = JSON.parse(authData).state?.token;
    if (!token) {
      console.log('❌ Token d\'authentification invalide');
      return;
    }

    let migratedCount = 0;
    let errorCount = 0;

    // Migrer chaque service avec des images
    for (const serviceSetting of serviceSettings) {
      if (!serviceSetting.images || serviceSetting.images.length === 0) {
        console.log(`⏭️  Service ${serviceSetting.id} : aucune image à migrer`);
        continue;
      }

      try {
        console.log(`🔄 Migration du service ${serviceSetting.id} (${serviceSetting.images.length} images)...`);

        // Appeler l'API pour mettre à jour les images
        const response = await fetch(`${API_BASE_URL}/services/${serviceSetting.id}/images`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            images: serviceSetting.images
          })
        });

        if (response.ok) {
          console.log(`✅ Service ${serviceSetting.id} : ${serviceSetting.images.length} images migrées`);
          migratedCount++;
        } else {
          const errorData = await response.json();
          console.log(`❌ Erreur pour le service ${serviceSetting.id}:`, errorData.error);
          errorCount++;
        }
      } catch (error) {
        console.log(`❌ Erreur réseau pour le service ${serviceSetting.id}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 RÉSUMÉ DE LA MIGRATION :');
    console.log(`✅ Services migrés avec succès : ${migratedCount}`);
    console.log(`❌ Services en erreur : ${errorCount}`);
    console.log(`📝 Total traité : ${migratedCount + errorCount}`);

    if (migratedCount > 0) {
      console.log('\n🎉 Migration terminée ! Actualisez votre page publique pour voir les images.');
    }

  } catch (error) {
    console.error('❌ Erreur générale lors de la migration :', error);
  }
}

// Exporter la fonction pour utilisation dans la console
window.migrateServiceImages = migrateServiceImages;

console.log('🚀 Script de migration chargé !');
console.log('📝 Pour migrer vos images, exécutez : migrateServiceImages()');
