const axios = require('axios');
const { performance } = require('perf_hooks');

// Configuration
const BASE_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const TARGET_USERS = parseInt(process.env.TARGET_USERS) || 1000;
const RAMP_UP_TIME = parseInt(process.env.RAMP_UP_TIME) || 60; // seconds
const TEST_DURATION = parseInt(process.env.TEST_DURATION) || 300; // seconds

// Test scenarios
const scenarios = {
  // Public endpoints (no auth)
  publicPages: [
    { method: 'GET', url: '/api/public/salons', weight: 30 },
    { method: 'GET', url: '/api/public/services', weight: 20 },
    { method: 'GET', url: '/api/public/team', weight: 10 },
  ],
  
  // Auth endpoints
  auth: [
    { method: 'POST', url: '/api/auth/login', weight: 5, data: { email: 'test@example.com', password: 'password123' } },
    { method: 'POST', url: '/api/auth/register', weight: 2 },
  ],
  
  // Protected endpoints (need auth)
  protected: [
    { method: 'GET', url: '/api/appointments', weight: 15 },
    { method: 'GET', url: '/api/clients', weight: 10 },
    { method: 'GET', url: '/api/services', weight: 8 },
  ]
};

// Metrics collection
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

// Virtual user class
class VirtualUser {
  constructor(id) {
    this.id = id;
    this.token = null;
    this.active = true;
    this.requestCount = 0;
  }

  async authenticate() {
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: `user${this.id}@test.com`,
        password: 'password123'
      });
      this.token = response.data.token;
      return true;
    } catch (error) {
      // Try to register if login fails
      try {
        const response = await axios.post(`${BASE_URL}/api/auth/register`, {
          email: `user${this.id}@test.com`,
          password: 'password123',
          name: `Test User ${this.id}`,
          role: 'client'
        });
        this.token = response.data.token;
        return true;
      } catch (regError) {
        console.error(`User ${this.id} authentication failed`);
        return false;
      }
    }
  }

  selectScenario() {
    const rand = Math.random() * 100;
    let cumWeight = 0;
    
    // 60% public, 40% authenticated requests
    const scenarioType = rand < 60 ? 'publicPages' : 'protected';
    const endpoints = scenarios[scenarioType];
    
    for (const endpoint of endpoints) {
      cumWeight += endpoint.weight;
      if (rand < cumWeight) {
        return { ...endpoint, needsAuth: scenarioType === 'protected' };
      }
    }
    
    return endpoints[0];
  }

  async makeRequest() {
    const scenario = this.selectScenario();
    const startTime = performance.now();
    
    const config = {
      method: scenario.method,
      url: `${BASE_URL}${scenario.url}`,
      timeout: 10000,
      validateStatus: () => true, // Don't throw on any status
    };

    if (scenario.needsAuth && this.token) {
      config.headers = { Authorization: `Bearer ${this.token}` };
    }

    if (scenario.data) {
      config.data = scenario.data;
    }

    try {
      const response = await axios(config);
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      // Update metrics
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

      this.requestCount++;
    } catch (error) {
      metrics.failedRequests++;
      metrics.totalRequests++;
      
      const errorType = error.code || 'UNKNOWN';
      metrics.errors[errorType] = (metrics.errors[errorType] || 0) + 1;
    }
  }

  async run() {
    // Authenticate first if needed
    if (Math.random() > 0.4) { // 60% of users will authenticate
      await this.authenticate();
    }

    // Simulate user behavior with random delays
    while (this.active) {
      await this.makeRequest();
      
      // Random think time between requests (1-5 seconds)
      const thinkTime = 1000 + Math.random() * 4000;
      await new Promise(resolve => setTimeout(resolve, thinkTime));
    }
  }

  stop() {
    this.active = false;
  }
}

// Load test controller
class LoadTest {
  constructor() {
    this.users = [];
    this.running = false;
  }

  async rampUp() {
    console.log(`🚀 Starting load test with ${TARGET_USERS} users...`);
    console.log(`📈 Ramp up time: ${RAMP_UP_TIME} seconds`);
    console.log(`⏱️  Test duration: ${TEST_DURATION} seconds`);
    console.log(`🎯 Target URL: ${BASE_URL}`);
    console.log('');

    metrics.startTime = new Date();
    const usersPerSecond = TARGET_USERS / RAMP_UP_TIME;
    
    for (let i = 0; i < TARGET_USERS; i++) {
      if (!this.running) break;
      
      const user = new VirtualUser(i);
      this.users.push(user);
      user.run();
      
      if (i % 10 === 0) {
        console.log(`✅ ${i} users created...`);
      }
      
      // Wait before creating next user
      await new Promise(resolve => setTimeout(resolve, 1000 / usersPerSecond));
    }
    
    console.log(`\n🎯 All ${this.users.length} users created and running!`);
  }

  async run() {
    this.running = true;
    
    // Start ramp up
    await this.rampUp();
    
    // Run for specified duration
    const testEndTime = Date.now() + (TEST_DURATION * 1000);
    
    // Print live metrics every 10 seconds
    const metricsInterval = setInterval(() => {
      this.printLiveMetrics();
    }, 10000);
    
    // Wait for test duration
    while (Date.now() < testEndTime && this.running) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Stop all users
    clearInterval(metricsInterval);
    this.stop();
  }

  stop() {
    console.log('\n🛑 Stopping load test...');
    this.running = false;
    metrics.endTime = new Date();
    
    // Stop all users
    this.users.forEach(user => user.stop());
    
    // Wait a bit for pending requests
    setTimeout(() => {
      this.printFinalReport();
      process.exit(0);
    }, 5000);
  }

  printLiveMetrics() {
    const successRate = metrics.totalRequests > 0 
      ? ((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(2)
      : 0;
    
    const avgResponseTime = metrics.responseTimes.length > 0
      ? (metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length).toFixed(2)
      : 0;
    
    console.log('\n📊 Live Metrics:');
    console.log(`   Active Users: ${this.users.length}`);
    console.log(`   Total Requests: ${metrics.totalRequests}`);
    console.log(`   Success Rate: ${successRate}%`);
    console.log(`   Avg Response Time: ${avgResponseTime}ms`);
    console.log(`   Failed Requests: ${metrics.failedRequests}`);
  }

  printFinalReport() {
    const duration = (metrics.endTime - metrics.startTime) / 1000;
    const requestsPerSecond = metrics.totalRequests / duration;
    const successRate = ((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(2);
    
    // Calculate percentiles
    const sortedTimes = metrics.responseTimes.sort((a, b) => a - b);
    const p50 = sortedTimes[Math.floor(sortedTimes.length * 0.5)];
    const p90 = sortedTimes[Math.floor(sortedTimes.length * 0.9)];
    const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)];
    const p99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)];
    
    console.log('\n' + '='.repeat(60));
    console.log('📈 LOAD TEST FINAL REPORT');
    console.log('='.repeat(60));
    
    console.log('\n🎯 Test Configuration:');
    console.log(`   Target Users: ${TARGET_USERS}`);
    console.log(`   Test Duration: ${duration.toFixed(2)} seconds`);
    console.log(`   Target URL: ${BASE_URL}`);
    
    console.log('\n📊 Overall Results:');
    console.log(`   Total Requests: ${metrics.totalRequests}`);
    console.log(`   Successful: ${metrics.successfulRequests}`);
    console.log(`   Failed: ${metrics.failedRequests}`);
    console.log(`   Success Rate: ${successRate}%`);
    console.log(`   Requests/Second: ${requestsPerSecond.toFixed(2)}`);
    
    console.log('\n⏱️  Response Times:');
    console.log(`   Min: ${Math.min(...sortedTimes).toFixed(2)}ms`);
    console.log(`   P50 (Median): ${p50?.toFixed(2)}ms`);
    console.log(`   P90: ${p90?.toFixed(2)}ms`);
    console.log(`   P95: ${p95?.toFixed(2)}ms`);
    console.log(`   P99: ${p99?.toFixed(2)}ms`);
    console.log(`   Max: ${Math.max(...sortedTimes).toFixed(2)}ms`);
    
    console.log('\n📈 Status Code Distribution:');
    Object.entries(metrics.statusCodes).forEach(([code, count]) => {
      const percentage = ((count / metrics.totalRequests) * 100).toFixed(2);
      console.log(`   ${code}: ${count} (${percentage}%)`);
    });
    
    if (Object.keys(metrics.errors).length > 0) {
      console.log('\n❌ Errors:');
      Object.entries(metrics.errors).forEach(([error, count]) => {
        console.log(`   ${error}: ${count}`);
      });
    }
    
    console.log('\n🏁 Performance Analysis:');
    if (successRate > 99 && p95 < 1000) {
      console.log('   ✅ EXCELLENT: System performing very well');
    } else if (successRate > 95 && p95 < 2000) {
      console.log('   ✅ GOOD: System performing well');
    } else if (successRate > 90 && p95 < 5000) {
      console.log('   ⚠️  ACCEPTABLE: System showing some strain');
    } else {
      console.log('   ❌ POOR: System struggling under load');
    }
    
    console.log('\n💡 Capacity Estimation:');
    if (successRate > 95 && p95 < 2000) {
      const estimatedCapacity = Math.floor(TARGET_USERS * (successRate / 100) * (1000 / p95));
      console.log(`   Estimated capacity: ~${estimatedCapacity} concurrent users`);
      console.log(`   For 100,000 users: ${estimatedCapacity >= 100000 ? '✅ CAPABLE' : '❌ NEEDS SCALING'}`);
    }
    
    console.log('\n' + '='.repeat(60));
  }
}

// Signal handlers
process.on('SIGINT', () => {
  console.log('\n⚠️  Received SIGINT, gracefully shutting down...');
  if (loadTest.running) {
    loadTest.stop();
  } else {
    process.exit(0);
  }
});

// Main execution
const loadTest = new LoadTest();

console.log('🔧 Beauty Flow / Saloneo Load Test Tool');
console.log('=====================================\n');

// Check if backend is reachable
axios.get(`${BASE_URL}/health`)
  .then(() => {
    console.log('✅ Backend is reachable\n');
    loadTest.run();
  })
  .catch((error) => {
    console.error('❌ Cannot reach backend at', BASE_URL);
    console.error('   Error:', error.message);
    console.error('\n💡 Make sure the backend is running and accessible');
    process.exit(1);
  });
