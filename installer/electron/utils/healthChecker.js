const http = require('http');

/**
 * Checks if services are healthy
 */
async function checkHealth(config) {
  const results = {
    database: false,
    backend: false,
    frontend: false
  };

  try {
    // Check backend API
    results.backend = await checkEndpoint(
      'http://localhost:4000/health',
      5000
    );

    // Check frontend
    results.frontend = await checkEndpoint(
      `http://localhost:${config.port || 3000}`,
      5000
    );

    // Database is healthy if backend is healthy (backend depends on DB)
    results.database = results.backend;

    return results;
  } catch (error) {
    console.error('Health check error:', error);
    return results;
  }
}

/**
 * Checks a single HTTP endpoint
 */
function checkEndpoint(url, timeout = 5000) {
  return new Promise((resolve) => {
    const request = http.get(url, { timeout }, (res) => {
      resolve(res.statusCode === 200);
    });

    request.on('error', () => {
      resolve(false);
    });

    request.on('timeout', () => {
      request.destroy();
      resolve(false);
    });
  });
}

/**
 * Waits for a service to become healthy
 */
async function waitForService(url, maxAttempts = 30, delayMs = 2000) {
  for (let i = 0; i < maxAttempts; i++) {
    const isHealthy = await checkEndpoint(url, 5000);
    
    if (isHealthy) {
      console.log(`✓ Service is healthy: ${url}`);
      return true;
    }

    console.log(`⏳ Waiting for service (attempt ${i + 1}/${maxAttempts})...`);
    await sleep(delayMs);
  }

  console.error(`✗ Service failed to start: ${url}`);
  return false;
}

/**
 * Sleep utility
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Comprehensive health check with retries
 */
async function performHealthCheck(config, maxAttempts = 10) {
  console.log('Starting health checks...');

  // Wait for backend to be healthy
  const backendHealthy = await waitForService(
    'http://localhost:4000/health',
    maxAttempts,
    2000
  );

  if (!backendHealthy) {
    return {
      success: false,
      error: 'Backend service failed to start'
    };
  }

  // Wait for frontend to be healthy
  const frontendHealthy = await waitForService(
    `http://localhost:${config.port || 3000}`,
    maxAttempts,
    2000
  );

  if (!frontendHealthy) {
    return {
      success: false,
      error: 'Frontend service failed to start'
    };
  }

  console.log('✓ All services are healthy');

  return {
    success: true,
    database: true,
    backend: true,
    frontend: true
  };
}

module.exports = {
  checkHealth,
  checkEndpoint,
  waitForService,
  performHealthCheck
};
