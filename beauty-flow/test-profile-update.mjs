import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:5000/api';

async function testProfileUpdate() {
  try {
    console.log('🔐 Test de connexion...');
    
    // 1. Connexion
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Erreur de connexion: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Connexion réussie');

    // 2. Récupération du profil actuel
    console.log('📋 Récupération du profil actuel...');
    const getProfileResponse = await fetch(`${API_BASE_URL}/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!getProfileResponse.ok) {
      throw new Error(`Erreur récupération profil: ${getProfileResponse.status}`);
    }

    const currentProfile = await getProfileResponse.json();
    console.log('📄 Profil actuel:', currentProfile.user);

    // 3. Mise à jour du profil
    console.log('🔄 Test de mise à jour du profil...');
    const updateData = {
      firstName: 'Jean',
      lastName: 'Dupont',
      establishmentName: 'Salon Test Updated',
      address: '123 Rue de la Beauté, Paris',
      preferences: {
        language: 'fr',
        currency: 'EUR'
      }
    };

    const updateResponse = await fetch(`${API_BASE_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(`Erreur mise à jour: ${updateResponse.status} - ${errorText}`);
    }

    const updatedProfile = await updateResponse.json();
    console.log('✅ Profil mis à jour avec succès:', updatedProfile.user);

    // 4. Vérification de la mise à jour
    console.log('🔍 Vérification de la persistance...');
    const verifyResponse = await fetch(`${API_BASE_URL}/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const verifiedProfile = await verifyResponse.json();
    console.log('📋 Profil vérifié:', verifiedProfile.user);

    // Comparaison
    const isUpdated = 
      verifiedProfile.user.firstName === updateData.firstName &&
      verifiedProfile.user.lastName === updateData.lastName &&
      verifiedProfile.user.establishmentName === updateData.establishmentName &&
      verifiedProfile.user.address === updateData.address;

    if (isUpdated) {
      console.log('🎉 Test réussi ! Le profil a été correctement mis à jour et persisté.');
    } else {
      console.log('❌ Test échoué ! Les données ne correspondent pas.');
      console.log('Attendu:', updateData);
      console.log('Reçu:', verifiedProfile.user);
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testProfileUpdate();
