const axios = require('axios');
const { performance } = require('perf_hooks');

// Configuration
const BASE_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const TARGET_USERS = parseInt(process.env.TARGET_USERS) || 100;
const TEST_DURATION = parseInt(process.env.TEST_DURATION) || 60; // seconds
const REQUESTS_PER_USER_PER_SECOND = parseFloat(process.env.REQUESTS_PER_SECOND) || 0.5;

// Test salon slug (vous devrez remplacer par un vrai slug)
const TEST_SALON_SLUG = 'test-salon';

// Métriques
const metrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  responseTimes: [],
  errors: {},
  statusCodes: {},
  startTime: null,
  endTime: null,
};

// Endpoints publics à tester
const publicEndpoints = [
  { method: 'GET', path: `/api/public/salon/${TEST_SALON_SLUG}`, weight: 30 },
  { method: 'GET', path: `/api/public/services/${TEST_SALON_SLUG}`, weight: 25 },
  { method: 'GET', path: `/api/public/team/${TEST_SALON_SLUG}`, weight: 20 },
  { method: 'GET', path: '/health', weight: 25 },
];

// Fonction pour sélectionner un endpoint aléatoire basé sur le poids
function selectEndpoint() {
  const totalWeight = publicEndpoints.reduce((sum, ep) => sum + ep.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const endpoint of publicEndpoints) {
    random -= endpoint.weight;
    if (random <= 0) {
      return endpoint;
    }
  }
  
  return publicEndpoints[0];
}

// Fonction pour faire une requête
async function makeRequest() {
  const endpoint = selectEndpoint();
  const startTime = performance.now();
  
  try {
    const response = await axios({
      method: endpoint.method,
      url: `${BASE_URL}${endpoint.path}`,
      timeout: 10000,
      validateStatus: () => true,
    });
    
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    
    // Mise à jour des métriques
    metrics.totalRequests++;
    metrics.responseTimes.push(responseTime);
    
    const statusCode = response.status;
    metrics.statusCodes[statusCode] = (metrics.statusCodes[statusCode] || 0) + 1;
    
    if (statusCode >= 200 && statusCode < 400) {
      metrics.successfulRequests++;
    } else {
      metrics.failedRequests++;
      metrics.errors[statusCode] = (metrics.errors[statusCode] || 0) + 1;
    }
    
  } catch (error) {
    metrics.failedRequests++;
    metrics.totalRequests++;
    
    const errorType = error.code || 'UNKNOWN';
    metrics.errors[errorType] = (metrics.errors[errorType] || 0) + 1;
  }
}

// Fonction pour simuler un utilisateur
async function simulateUser(userId) {
  const requestInterval = 1000 / REQUESTS_PER_USER_PER_SECOND;
  
  while (Date.now() - metrics.startTime < TEST_DURATION * 1000) {
    await makeRequest();
    await new Promise(resolve => setTimeout(resolve, requestInterval));
  }
}

// Fonction pour afficher les métriques en temps réel
function printLiveMetrics() {
  const elapsed = (Date.now() - metrics.startTime) / 1000;
  const rps = metrics.totalRequests / elapsed;
  const successRate = metrics.totalRequests > 0 
    ? ((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(2)
    : 0;
  
  const avgResponseTime = metrics.responseTimes.length > 0
    ? (metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length).toFixed(2)
    : 0;
  
  console.log('\n📊 Métriques en temps réel:');
  console.log(`   Durée écoulée: ${elapsed.toFixed(0)}s`);
  console.log(`   Requêtes/seconde: ${rps.toFixed(2)}`);
  console.log(`   Total requêtes: ${metrics.totalRequests}`);
  console.log(`   Taux de succès: ${successRate}%`);
  console.log(`   Temps de réponse moyen: ${avgResponseTime}ms`);
  console.log(`   Requêtes échouées: ${metrics.failedRequests}`);
}

// Fonction pour afficher le rapport final
function printFinalReport() {
  const duration = (metrics.endTime - metrics.startTime) / 1000;
  const requestsPerSecond = metrics.totalRequests / duration;
  const successRate = ((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(2);
  
  // Calcul des percentiles
  const sortedTimes = metrics.responseTimes.sort((a, b) => a - b);
  const p50 = sortedTimes[Math.floor(sortedTimes.length * 0.5)];
  const p90 = sortedTimes[Math.floor(sortedTimes.length * 0.9)];
  const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)];
  const p99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)];
  
  console.log('\n' + '='.repeat(60));
  console.log('📈 RAPPORT FINAL DU TEST DE CHARGE');
  console.log('='.repeat(60));
  
  console.log('\n🎯 Configuration du test:');
  console.log(`   Utilisateurs simulés: ${TARGET_USERS}`);
  console.log(`   Durée du test: ${duration.toFixed(2)} secondes`);
  console.log(`   URL cible: ${BASE_URL}`);
  console.log(`   Requêtes par utilisateur/seconde: ${REQUESTS_PER_USER_PER_SECOND}`);
  
  console.log('\n📊 Résultats globaux:');
  console.log(`   Total requêtes: ${metrics.totalRequests}`);
  console.log(`   Requêtes réussies: ${metrics.successfulRequests}`);
  console.log(`   Requêtes échouées: ${metrics.failedRequests}`);
  console.log(`   Taux de succès: ${successRate}%`);
  console.log(`   Requêtes/seconde: ${requestsPerSecond.toFixed(2)}`);
  
  console.log('\n⏱️  Temps de réponse:');
  console.log(`   Min: ${Math.min(...sortedTimes).toFixed(2)}ms`);
  console.log(`   P50 (Médiane): ${p50?.toFixed(2)}ms`);
  console.log(`   P90: ${p90?.toFixed(2)}ms`);
  console.log(`   P95: ${p95?.toFixed(2)}ms`);
  console.log(`   P99: ${p99?.toFixed(2)}ms`);
  console.log(`   Max: ${Math.max(...sortedTimes).toFixed(2)}ms`);
  
  console.log('\n📈 Distribution des codes de statut:');
  Object.entries(metrics.statusCodes).forEach(([code, count]) => {
    const percentage = ((count / metrics.totalRequests) * 100).toFixed(2);
    console.log(`   ${code}: ${count} (${percentage}%)`);
  });
  
  if (Object.keys(metrics.errors).length > 0) {
    console.log('\n❌ Erreurs:');
    Object.entries(metrics.errors).forEach(([error, count]) => {
      console.log(`   ${error}: ${count}`);
    });
  }
  
  console.log('\n🏁 Analyse de performance:');
  const totalCapacity = requestsPerSecond;
  console.log(`   Capacité actuelle: ${totalCapacity.toFixed(2)} requêtes/seconde`);
  
  // Estimation pour 100,000 utilisateurs
  // En supposant que chaque utilisateur fait 1 requête toutes les 10 secondes
  const estimatedRPSFor100k = 100000 / 10; // 10,000 requêtes/seconde
  const scalingFactor = estimatedRPSFor100k / totalCapacity;
  
  console.log(`\n💡 Estimation de capacité:`);
  console.log(`   Pour 100,000 utilisateurs simultanés (1 req/10s par user):`);
  console.log(`   - Besoin: ${estimatedRPSFor100k.toFixed(0)} requêtes/seconde`);
  console.log(`   - Capacité actuelle: ${totalCapacity.toFixed(2)} requêtes/seconde`);
  console.log(`   - Factor de scaling nécessaire: ${scalingFactor.toFixed(0)}x`);
  
  if (successRate > 95 && p95 < 1000) {
    console.log(`   ✅ Performance EXCELLENTE avec ${TARGET_USERS} utilisateurs`);
  } else if (successRate > 90 && p95 < 2000) {
    console.log(`   ✅ Performance BONNE avec ${TARGET_USERS} utilisateurs`);
  } else if (successRate > 80 && p95 < 5000) {
    console.log(`   ⚠️  Performance ACCEPTABLE avec ${TARGET_USERS} utilisateurs`);
  } else {
    console.log(`   ❌ Performance INSUFFISANTE avec ${TARGET_USERS} utilisateurs`);
  }
  
  console.log('\n' + '='.repeat(60));
}

// Fonction principale
async function runLoadTest() {
  console.log('🔧 Test de charge Beauty Flow / Saloneo');
  console.log('=====================================\n');
  
  // Vérifier que le backend est accessible
  try {
    await axios.get(`${BASE_URL}/health`);
    console.log('✅ Backend accessible\n');
  } catch (error) {
    console.error('❌ Impossible de joindre le backend à', BASE_URL);
    console.error('   Erreur:', error.message);
    console.error('\n💡 Assurez-vous que le backend est en cours d\'exécution');
    process.exit(1);
  }
  
  console.log(`🚀 Démarrage du test avec ${TARGET_USERS} utilisateurs...`);
  console.log(`⏱️  Durée du test: ${TEST_DURATION} secondes`);
  console.log(`🎯 URL cible: ${BASE_URL}`);
  console.log('');
  
  metrics.startTime = Date.now();
  
  // Créer les utilisateurs virtuels
  const userPromises = [];
  for (let i = 0; i < TARGET_USERS; i++) {
    userPromises.push(simulateUser(i));
  }
  
  // Afficher les métriques toutes les 5 secondes
  const metricsInterval = setInterval(printLiveMetrics, 5000);
  
  // Attendre la fin du test
  await Promise.all(userPromises);
  
  metrics.endTime = Date.now();
  clearInterval(metricsInterval);
  
  // Afficher le rapport final
  printFinalReport();
}

// Gestion des signaux
process.on('SIGINT', () => {
  console.log('\n⚠️  Test interrompu...');
  metrics.endTime = Date.now();
  printFinalReport();
  process.exit(0);
});

// Lancer le test
runLoadTest().catch(error => {
  console.error('❌ Erreur lors du test:', error);
  process.exit(1);
});
