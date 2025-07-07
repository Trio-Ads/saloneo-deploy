import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

// Test du changement de devise
async function testCurrencyChange() {
  console.log('🧪 Test du changement de devise...\n');

  try {
    // 1. Connexion
    console.log('1️⃣ Connexion...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'hello@thirdadvertising.dz',
        password: 'hello'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Erreur de connexion: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Connexion réussie');

    // 2. Récupération du profil initial
    console.log('\n2️⃣ Récupération du profil initial...');
    const profileResponse = await fetch(`${API_BASE}/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!profileResponse.ok) {
      throw new Error(`Erreur récupération profil: ${profileResponse.status}`);
    }

    const profileData = await profileResponse.json();
    console.log('📋 Profil initial:', {
      currency: profileData.user.settings?.currency || 'Non défini',
      language: profileData.user.settings?.language || 'Non défini'
    });

    // 3. Test changement vers USD
    console.log('\n3️⃣ Changement de devise vers USD...');
    const updateResponse1 = await fetch(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        settings: {
          currency: 'USD'
        }
      })
    });

    if (!updateResponse1.ok) {
      throw new Error(`Erreur mise à jour USD: ${updateResponse1.status}`);
    }

    const updatedData1 = await updateResponse1.json();
    console.log('✅ Devise mise à jour vers USD:', updatedData1.user.settings?.currency);

    // 4. Vérification de la persistance
    console.log('\n4️⃣ Vérification de la persistance...');
    const verifyResponse = await fetch(`${API_BASE}/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const verifyData = await verifyResponse.json();
    console.log('🔍 Devise après vérification:', verifyData.user.settings?.currency);

    console.log('\n🎉 Test terminé avec succès !');
    console.log('📊 Résumé:');
    console.log(`   - Devise initiale: ${profileData.user.settings?.currency || 'Non défini'}`);
    console.log(`   - Après changement vers USD: ${updatedData1.user.settings?.currency}`);
    console.log(`   - Devise finale persistée: ${verifyData.user.settings?.currency}`);
    
    if (verifyData.user.settings?.currency === 'USD') {
      console.log('\n✅ SUCCÈS: Le changement de devise EUR → USD fonctionne parfaitement !');
      console.log('💰 Votre compte est maintenant configuré en USD');
    } else {
      console.log('\n❌ ÉCHEC: La devise n\'a pas été correctement sauvegardée');
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    process.exit(1);
  }
}

// Exécution du test
testCurrencyChange();
