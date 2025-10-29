import fetch from 'node-fetch';

// Configuration
const API_BASE_URL = 'http://localhost:5000/api';
const timestamp = Date.now();

// Données de test
const testUser = {
  email: `test.user.${timestamp}@beautyflow.test`,
  password: 'TestPassword123!',
  firstName: 'Jean',
  lastName: 'Dupont',
  phone: '+33123456789',
  establishmentName: 'Salon de Beauté Test',
  address: '123 Rue de la Beauté, 75001 Paris'
};

console.log('🧪 SCRIPT DE TEST - INSCRIPTION ET PROFIL');
console.log('==========================================\n');

let authToken = null;
let userId = null;

// Fonction utilitaire pour les requêtes
async function makeRequest(endpoint, method = 'GET', body = null, headers = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  if (authToken) {
    options.headers.Authorization = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    return {
      success: response.ok,
      status: response.status,
      data
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Test 1: Inscription
async function testRegistration() {
  console.log('📝 ÉTAPE 1: Test d\'inscription');
  console.log('------------------------------');
  
  console.log('Données d\'inscription:');
  console.log(JSON.stringify(testUser, null, 2));
  console.log('');

  const result = await makeRequest('/auth/register', 'POST', testUser);
  
  if (result.success) {
    console.log('✅ Inscription réussie !');
    console.log('Réponse du serveur:');
    console.log(JSON.stringify(result.data, null, 2));
    
    if (result.data.token) {
      authToken = result.data.token;
      console.log('🔑 Token d\'authentification récupéré');
    }
    
    if (result.data.user && result.data.user.id) {
      userId = result.data.user.id;
      console.log(`👤 ID utilisateur: ${userId}`);
    }
    
    return true;
  } else {
    console.log('❌ Échec de l\'inscription');
    console.log('Erreur:', result.data);
    return false;
  }
}

// Test 2: Connexion
async function testLogin() {
  console.log('\n🔐 ÉTAPE 2: Test de connexion');
  console.log('-----------------------------');
  
  const loginData = {
    email: testUser.email,
    password: testUser.password
  };
  
  console.log('Tentative de connexion avec:');
  console.log(`Email: ${loginData.email}`);
  console.log('');

  const result = await makeRequest('/auth/login', 'POST', loginData);
  
  if (result.success) {
    console.log('✅ Connexion réussie !');
    console.log('Réponse du serveur:');
    console.log(JSON.stringify(result.data, null, 2));
    
    if (result.data.token) {
      authToken = result.data.token;
      console.log('🔑 Nouveau token d\'authentification récupéré');
    }
    
    return true;
  } else {
    console.log('❌ Échec de la connexion');
    console.log('Erreur:', result.data);
    return false;
  }
}

// Test 3: Récupération du profil
async function testGetProfile() {
  console.log('\n👤 ÉTAPE 3: Récupération du profil');
  console.log('----------------------------------');
  
  const result = await makeRequest('/profile');
  
  if (result.success) {
    console.log('✅ Profil récupéré avec succès !');
    console.log('Données du profil:');
    console.log(JSON.stringify(result.data, null, 2));
    
    return result.data;
  } else {
    console.log('❌ Échec de la récupération du profil');
    console.log('Erreur:', result.data);
    return null;
  }
}

// Test 4: Comparaison des données
function compareData(profileResponse) {
  console.log('\n🔍 ÉTAPE 4: Comparaison des données');
  console.log('-----------------------------------');
  
  const issues = [];
  
  // Extraire les données utilisateur de la réponse
  const profileData = profileResponse.user || profileResponse;
  
  // Vérification de l'email
  if (profileData.email !== testUser.email) {
    issues.push({
      field: 'email',
      expected: testUser.email,
      actual: profileData.email,
      severity: 'CRITIQUE'
    });
  }
  
  // Vérification du prénom
  if (profileData.firstName !== testUser.firstName) {
    issues.push({
      field: 'firstName',
      expected: testUser.firstName,
      actual: profileData.firstName,
      severity: 'MAJEUR'
    });
  }
  
  // Vérification du nom
  if (profileData.lastName !== testUser.lastName) {
    issues.push({
      field: 'lastName',
      expected: testUser.lastName,
      actual: profileData.lastName,
      severity: 'MAJEUR'
    });
  }
  
  // Vérification du téléphone
  if (profileData.phone !== testUser.phone) {
    issues.push({
      field: 'phone',
      expected: testUser.phone,
      actual: profileData.phone,
      severity: 'MINEUR'
    });
  }
  
  // Vérification du nom d'établissement
  if (profileData.establishmentName !== testUser.establishmentName) {
    issues.push({
      field: 'establishmentName',
      expected: testUser.establishmentName,
      actual: profileData.establishmentName,
      severity: 'MAJEUR'
    });
  }
  
  // Vérification de l'adresse
  if (profileData.address !== testUser.address) {
    issues.push({
      field: 'address',
      expected: testUser.address,
      actual: profileData.address,
      severity: 'MINEUR'
    });
  }
  
  // Vérification des paramètres par défaut
  if (!profileData.settings) {
    issues.push({
      field: 'settings',
      expected: 'Objet settings présent',
      actual: 'Manquant',
      severity: 'MAJEUR'
    });
  } else {
    if (!profileData.settings.language) {
      issues.push({
        field: 'settings.language',
        expected: 'Langue par défaut',
        actual: 'Manquant',
        severity: 'MINEUR'
      });
    }
    
    if (!profileData.settings.currency) {
      issues.push({
        field: 'settings.currency',
        expected: 'Devise par défaut',
        actual: 'Manquant',
        severity: 'MINEUR'
      });
    }
  }
  
  // Affichage des résultats
  if (issues.length === 0) {
    console.log('✅ PARFAIT ! Toutes les données correspondent');
  } else {
    console.log(`❌ ${issues.length} problème(s) détecté(s):`);
    console.log('');
    
    issues.forEach((issue, index) => {
      const icon = issue.severity === 'CRITIQUE' ? '🚨' : 
                   issue.severity === 'MAJEUR' ? '⚠️' : '⚡';
      
      console.log(`${icon} Problème ${index + 1} [${issue.severity}]:`);
      console.log(`   Champ: ${issue.field}`);
      console.log(`   Attendu: "${issue.expected}"`);
      console.log(`   Actuel: "${issue.actual}"`);
      console.log('');
    });
  }
  
  return issues;
}

// Test 5: Nettoyage (suppression du compte de test)
async function cleanup() {
  console.log('\n🧹 ÉTAPE 5: Nettoyage');
  console.log('--------------------');
  
  if (!userId) {
    console.log('⚠️ Pas d\'ID utilisateur pour le nettoyage');
    return;
  }
  
  // Note: Il faudrait implémenter une route de suppression d'utilisateur
  // Pour l'instant, on affiche juste l'ID pour suppression manuelle
  console.log(`📝 ID du compte de test créé: ${userId}`);
  console.log(`📧 Email du compte de test: ${testUser.email}`);
  console.log('💡 Vous pouvez supprimer ce compte manuellement de la base de données');
}

// Fonction principale
async function runTests() {
  try {
    console.log(`🕐 Début des tests: ${new Date().toLocaleString()}\n`);
    
    // Test 1: Inscription
    const registrationSuccess = await testRegistration();
    if (!registrationSuccess) {
      console.log('\n❌ ARRÊT DES TESTS - Échec de l\'inscription');
      return;
    }
    
    // Test 2: Connexion
    const loginSuccess = await testLogin();
    if (!loginSuccess) {
      console.log('\n❌ ARRÊT DES TESTS - Échec de la connexion');
      return;
    }
    
    // Test 3: Récupération du profil
    const profileData = await testGetProfile();
    if (!profileData) {
      console.log('\n❌ ARRÊT DES TESTS - Échec de la récupération du profil');
      return;
    }
    
    // Test 4: Comparaison
    const issues = compareData(profileData);
    
    // Test 5: Nettoyage
    await cleanup();
    
    // Résumé final
    console.log('\n📊 RÉSUMÉ FINAL');
    console.log('===============');
    
    if (issues.length === 0) {
      console.log('🎉 TOUS LES TESTS SONT PASSÉS !');
      console.log('✅ L\'inscription et la récupération du profil fonctionnent parfaitement');
    } else {
      const critiques = issues.filter(i => i.severity === 'CRITIQUE').length;
      const majeurs = issues.filter(i => i.severity === 'MAJEUR').length;
      const mineurs = issues.filter(i => i.severity === 'MINEUR').length;
      
      console.log('⚠️ PROBLÈMES DÉTECTÉS:');
      if (critiques > 0) console.log(`🚨 ${critiques} problème(s) critique(s)`);
      if (majeurs > 0) console.log(`⚠️ ${majeurs} problème(s) majeur(s)`);
      if (mineurs > 0) console.log(`⚡ ${mineurs} problème(s) mineur(s)`);
      
      console.log('\n💡 RECOMMANDATIONS:');
      if (critiques > 0) {
        console.log('- Corriger immédiatement les problèmes critiques');
      }
      if (majeurs > 0) {
        console.log('- Vérifier le processus d\'inscription et de sauvegarde');
      }
      if (mineurs > 0) {
        console.log('- Améliorer la gestion des valeurs par défaut');
      }
    }
    
    console.log(`\n🕐 Fin des tests: ${new Date().toLocaleString()}`);
    
  } catch (error) {
    console.error('\n💥 ERREUR FATALE:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Lancement des tests
runTests();
