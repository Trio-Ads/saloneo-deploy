import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

// Script de diagnostic avancé pour le problème de devise
async function debugCurrencyIssue() {
  console.log('🔍 DIAGNOSTIC AVANCÉ - Problème de changement de devise\n');

  try {
    // 1. Test de connexion
    console.log('1️⃣ Test de connexion...');
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

    // 2. État initial du profil
    console.log('\n2️⃣ Récupération de l\'état initial...');
    const initialResponse = await fetch(`${API_BASE}/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const initialData = await initialResponse.json();
    console.log('📊 État initial du backend:', {
      currency: initialData.user.settings?.currency,
      language: initialData.user.settings?.language,
      firstName: initialData.user.firstName,
      lastName: initialData.user.lastName,
      establishmentName: initialData.user.establishmentName
    });

    // 3. Test de changement de devise
    console.log('\n3️⃣ Test de changement de devise...');
    const targetCurrency = initialData.user.settings?.currency === 'EUR' ? 'USD' : 'EUR';
    console.log(`🎯 Changement vers: ${targetCurrency}`);

    const updateResponse = await fetch(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        settings: {
          currency: targetCurrency
        }
      })
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(`Erreur mise à jour: ${updateResponse.status} - ${errorText}`);
    }

    const updateData = await updateResponse.json();
    console.log('✅ Réponse de mise à jour:', {
      currency: updateData.user.settings?.currency,
      success: updateData.user.settings?.currency === targetCurrency
    });

    // 4. Vérification immédiate
    console.log('\n4️⃣ Vérification immédiate...');
    const verifyResponse = await fetch(`${API_BASE}/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const verifyData = await verifyResponse.json();
    console.log('🔍 Vérification immédiate:', {
      currency: verifyData.user.settings?.currency,
      isPersisted: verifyData.user.settings?.currency === targetCurrency
    });

    // 5. Test de simulation de rechargement (attendre 2 secondes)
    console.log('\n5️⃣ Simulation de rechargement (attente 2s)...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    const reloadResponse = await fetch(`${API_BASE}/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const reloadData = await reloadResponse.json();
    console.log('🔄 Après simulation rechargement:', {
      currency: reloadData.user.settings?.currency,
      stillPersisted: reloadData.user.settings?.currency === targetCurrency
    });

    // 6. Analyse des différences
    console.log('\n6️⃣ ANALYSE DES RÉSULTATS:');
    console.log('═══════════════════════════════════════');
    
    const initialCurrency = initialData.user.settings?.currency;
    const updatedCurrency = updateData.user.settings?.currency;
    const verifiedCurrency = verifyData.user.settings?.currency;
    const reloadedCurrency = reloadData.user.settings?.currency;

    console.log(`📋 Devise initiale: ${initialCurrency}`);
    console.log(`🔄 Après mise à jour: ${updatedCurrency}`);
    console.log(`✅ Vérification immédiate: ${verifiedCurrency}`);
    console.log(`🔄 Après rechargement: ${reloadedCurrency}`);

    // 7. Diagnostic
    console.log('\n7️⃣ DIAGNOSTIC:');
    console.log('═══════════════════════════════════════');

    if (updatedCurrency === targetCurrency) {
      console.log('✅ L\'API de mise à jour fonctionne correctement');
    } else {
      console.log('❌ PROBLÈME: L\'API de mise à jour ne fonctionne pas');
      return;
    }

    if (verifiedCurrency === targetCurrency) {
      console.log('✅ La persistance immédiate fonctionne');
    } else {
      console.log('❌ PROBLÈME: La persistance immédiate échoue');
    }

    if (reloadedCurrency === targetCurrency) {
      console.log('✅ La persistance à long terme fonctionne');
    } else {
      console.log('❌ PROBLÈME: La persistance à long terme échoue');
    }

    // 8. Recommandations
    console.log('\n8️⃣ RECOMMANDATIONS:');
    console.log('═══════════════════════════════════════');

    if (updatedCurrency === targetCurrency && verifiedCurrency === targetCurrency && reloadedCurrency === targetCurrency) {
      console.log('🎉 LE BACKEND FONCTIONNE PARFAITEMENT !');
      console.log('💡 Le problème vient du FRONTEND:');
      console.log('   - Cache du navigateur');
      console.log('   - LocalStorage corrompu');
      console.log('   - Store Zustand qui recharge les anciennes données');
      console.log('   - Frontend pas redémarré avec les nouvelles modifications');
      console.log('\n🔧 ACTIONS À FAIRE:');
      console.log('   1. Ouvrir: http://localhost:3000/clear-cache.html');
      console.log('   2. Vider le cache');
      console.log('   3. Redémarrer le frontend');
      console.log('   4. Tester à nouveau');
    } else {
      console.log('❌ PROBLÈME BACKEND DÉTECTÉ');
      console.log('🔧 Vérifier la base de données et les modèles');
    }

  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error.message);
    console.log('\n🔧 VÉRIFICATIONS À FAIRE:');
    console.log('   - Le backend est-il démarré ?');
    console.log('   - La base de données est-elle accessible ?');
    console.log('   - Les credentials sont-ils corrects ?');
  }
}

// Exécution du diagnostic
debugCurrencyIssue();
