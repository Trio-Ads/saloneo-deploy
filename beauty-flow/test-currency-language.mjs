import fetch from 'node-fetch';

// Configuration
const API_BASE_URL = 'http://localhost:5000/api';
const timestamp = Date.now();

// Données de test
const testUser = {
  email: `test.currency.${timestamp}@beautyflow.test`,
  password: 'TestPassword123!',
  firstName: 'Test',
  lastName: 'Currency',
  establishmentName: 'Test Currency Salon',
  phone: '+33123456789',
  address: '123 Test Street'
};

console.log('🧪 SCRIPT DE TEST - DEVISE ET LANGUE');
console.log('====================================\n');

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

// Test 1: Inscription et connexion
async function setupUser() {
  console.log('📝 ÉTAPE 1: Création du compte de test');
  console.log('-------------------------------------');
  
  // Inscription
  const registerResult = await makeRequest('/auth/register', 'POST', testUser);
  
  if (!registerResult.success) {
    console.log('❌ Échec de l\'inscription');
    console.log('Erreur:', registerResult.data);
    return false;
  }
  
  console.log('✅ Inscription réussie');
  authToken = registerResult.data.token;
  userId = registerResult.data.user.id;
  
  return true;
}

// Test 2: Récupération du profil initial
async function getInitialProfile() {
  console.log('\n👤 ÉTAPE 2: Récupération du profil initial');
  console.log('------------------------------------------');
  
  const result = await makeRequest('/profile');
  
  if (result.success) {
    console.log('✅ Profil récupéré avec succès');
    const profile = result.data.user;
    console.log(`📍 Langue actuelle: ${profile.settings?.language || 'non définie'}`);
    console.log(`💰 Devise actuelle: ${profile.settings?.currency || 'non définie'}`);
    return profile;
  } else {
    console.log('❌ Échec de la récupération du profil');
    console.log('Erreur:', result.data);
    return null;
  }
}

// Test 3: Changement de langue
async function testLanguageChange() {
  console.log('\n🌍 ÉTAPE 3: Test de changement de langue');
  console.log('----------------------------------------');
  
  const languages = ['en', 'es', 'ar', 'fr'];
  const results = [];
  
  for (const lang of languages) {
    console.log(`\n🔄 Changement vers: ${lang}`);
    
    const updateResult = await makeRequest('/profile', 'PUT', {
      settings: {
        language: lang
      }
    });
    
    if (updateResult.success) {
      console.log(`✅ Langue mise à jour vers ${lang}`);
      
      // Vérifier que le changement a été pris en compte
      const profileResult = await makeRequest('/profile');
      if (profileResult.success) {
        const currentLang = profileResult.data.user.settings?.language;
        if (currentLang === lang) {
          console.log(`✅ Vérification réussie: langue = ${currentLang}`);
          results.push({ language: lang, success: true });
        } else {
          console.log(`❌ Vérification échouée: attendu ${lang}, reçu ${currentLang}`);
          results.push({ language: lang, success: false, expected: lang, actual: currentLang });
        }
      }
    } else {
      console.log(`❌ Échec du changement vers ${lang}`);
      console.log('Erreur:', updateResult.data);
      results.push({ language: lang, success: false, error: updateResult.data });
    }
    
    // Petite pause entre les changements
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return results;
}

// Test 4: Changement de devise
async function testCurrencyChange() {
  console.log('\n💰 ÉTAPE 4: Test de changement de devise');
  console.log('----------------------------------------');
  
  const currencies = ['USD', 'GBP', 'JPY', 'EUR'];
  const results = [];
  
  for (const currency of currencies) {
    console.log(`\n🔄 Changement vers: ${currency}`);
    
    const updateResult = await makeRequest('/profile', 'PUT', {
      settings: {
        currency: currency
      }
    });
    
    if (updateResult.success) {
      console.log(`✅ Devise mise à jour vers ${currency}`);
      
      // Vérifier que le changement a été pris en compte
      const profileResult = await makeRequest('/profile');
      if (profileResult.success) {
        const currentCurrency = profileResult.data.user.settings?.currency;
        if (currentCurrency === currency) {
          console.log(`✅ Vérification réussie: devise = ${currentCurrency}`);
          results.push({ currency: currency, success: true });
        } else {
          console.log(`❌ Vérification échouée: attendu ${currency}, reçu ${currentCurrency}`);
          results.push({ currency: currency, success: false, expected: currency, actual: currentCurrency });
        }
      }
    } else {
      console.log(`❌ Échec du changement vers ${currency}`);
      console.log('Erreur:', updateResult.data);
      results.push({ currency: currency, success: false, error: updateResult.data });
    }
    
    // Petite pause entre les changements
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return results;
}

// Test 5: Changement simultané langue + devise
async function testSimultaneousChange() {
  console.log('\n🔄 ÉTAPE 5: Test de changement simultané');
  console.log('---------------------------------------');
  
  const testCases = [
    { language: 'fr', currency: 'EUR' },
    { language: 'en', currency: 'USD' },
    { language: 'es', currency: 'EUR' },
    { language: 'ar', currency: 'SAR' }
  ];
  
  const results = [];
  
  for (const testCase of testCases) {
    console.log(`\n🔄 Changement vers: ${testCase.language} + ${testCase.currency}`);
    
    const updateResult = await makeRequest('/profile', 'PUT', {
      settings: {
        language: testCase.language,
        currency: testCase.currency
      }
    });
    
    if (updateResult.success) {
      console.log(`✅ Mise à jour réussie`);
      
      // Vérifier que les changements ont été pris en compte
      const profileResult = await makeRequest('/profile');
      if (profileResult.success) {
        const settings = profileResult.data.user.settings;
        const langOk = settings?.language === testCase.language;
        const currencyOk = settings?.currency === testCase.currency;
        
        if (langOk && currencyOk) {
          console.log(`✅ Vérification réussie: ${settings.language} + ${settings.currency}`);
          results.push({ ...testCase, success: true });
        } else {
          console.log(`❌ Vérification échouée:`);
          console.log(`   Langue: attendu ${testCase.language}, reçu ${settings?.language}`);
          console.log(`   Devise: attendu ${testCase.currency}, reçu ${settings?.currency}`);
          results.push({ 
            ...testCase, 
            success: false, 
            actualLanguage: settings?.language,
            actualCurrency: settings?.currency
          });
        }
      }
    } else {
      console.log(`❌ Échec de la mise à jour`);
      console.log('Erreur:', updateResult.data);
      results.push({ ...testCase, success: false, error: updateResult.data });
    }
    
    // Petite pause entre les changements
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return results;
}

// Fonction principale
async function runTests() {
  try {
    console.log(`🕐 Début des tests: ${new Date().toLocaleString()}\n`);
    
    // Étape 1: Configuration
    const setupSuccess = await setupUser();
    if (!setupSuccess) {
      console.log('\n❌ ARRÊT DES TESTS - Échec de la configuration');
      return;
    }
    
    // Étape 2: Profil initial
    const initialProfile = await getInitialProfile();
    if (!initialProfile) {
      console.log('\n❌ ARRÊT DES TESTS - Impossible de récupérer le profil');
      return;
    }
    
    // Étape 3: Test des langues
    const languageResults = await testLanguageChange();
    
    // Étape 4: Test des devises
    const currencyResults = await testCurrencyChange();
    
    // Étape 5: Test simultané
    const simultaneousResults = await testSimultaneousChange();
    
    // Résumé final
    console.log('\n📊 RÉSUMÉ FINAL');
    console.log('===============');
    
    const languageSuccess = languageResults.filter(r => r.success).length;
    const languageTotal = languageResults.length;
    const currencySuccess = currencyResults.filter(r => r.success).length;
    const currencyTotal = currencyResults.length;
    const simultaneousSuccess = simultaneousResults.filter(r => r.success).length;
    const simultaneousTotal = simultaneousResults.length;
    
    console.log(`🌍 Langues: ${languageSuccess}/${languageTotal} réussies`);
    console.log(`💰 Devises: ${currencySuccess}/${currencyTotal} réussies`);
    console.log(`🔄 Simultané: ${simultaneousSuccess}/${simultaneousTotal} réussies`);
    
    const totalSuccess = languageSuccess + currencySuccess + simultaneousSuccess;
    const totalTests = languageTotal + currencyTotal + simultaneousTotal;
    
    if (totalSuccess === totalTests) {
      console.log('\n🎉 TOUS LES TESTS SONT PASSÉS !');
      console.log('✅ Les changements de devise et de langue fonctionnent parfaitement');
    } else {
      console.log(`\n⚠️ ${totalTests - totalSuccess} test(s) échoué(s) sur ${totalTests}`);
      
      // Afficher les détails des échecs
      const failures = [
        ...languageResults.filter(r => !r.success),
        ...currencyResults.filter(r => !r.success),
        ...simultaneousResults.filter(r => !r.success)
      ];
      
      if (failures.length > 0) {
        console.log('\n❌ DÉTAILS DES ÉCHECS:');
        failures.forEach((failure, index) => {
          console.log(`\n${index + 1}. ${failure.language || failure.currency || 'Test simultané'}`);
          if (failure.error) {
            console.log(`   Erreur: ${JSON.stringify(failure.error)}`);
          }
          if (failure.expected && failure.actual) {
            console.log(`   Attendu: ${failure.expected}, Reçu: ${failure.actual}`);
          }
        });
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
