const jwt = require('jsonwebtoken');

/**
 * Validates license key by decoding JWT or calling remote API
 */
async function validateLicense(licenseKey) {
  try {
    // Demo mode: Accept any key starting with "EAAP-"
    if (licenseKey.startsWith('EAAP-')) {
      return {
        valid: true,
        plan: 'Professional',
        deployment: 'on-premise',
        users: 25,
        modules: ['accounting', 'invoicing', 'tax', 'payroll'],
        expires: '2026-12-31',
        support: 'Professional (Email + Chat)',
        company: 'Demo Company Ltd.'
      };
    }

    // Trial key
    if (licenseKey === 'TRIAL') {
      return {
        valid: true,
        plan: 'Trial',
        deployment: 'on-premise',
        users: 5,
        modules: ['accounting', 'invoicing', 'tax'],
        expires: '30 days',
        support: 'Community (Forums)',
        company: 'Trial User'
      };
    }

    // In production, this would:
    // 1. Call license server API: https://license.eastbooks.com/validate
    // 2. Verify JWT signature
    // 3. Check expiration
    // 4. Return license details

    // Example production implementation:
    /*
    const response = await fetch('https://license.eastbooks.com/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ key: licenseKey })
    });

    if (!response.ok) {
      throw new Error('License validation failed');
    }

    const data = await response.json();
    
    if (!data.valid) {
      return {
        valid: false,
        error: data.error || 'Invalid license key'
      };
    }

    return {
      valid: true,
      plan: data.plan,
      deployment: data.deployment,
      users: data.users,
      modules: data.modules,
      expires: data.expires,
      support: data.support,
      company: data.company
    };
    */

    return {
      valid: false,
      error: 'Invalid license key format'
    };

  } catch (error) {
    console.error('License validation error:', error);
    return {
      valid: false,
      error: 'Failed to validate license. Please check your internet connection.'
    };
  }
}

/**
 * Verifies JWT-based license (offline validation)
 */
function verifyLicenseJWT(licenseKey, publicKey) {
  try {
    const decoded = jwt.verify(licenseKey, publicKey, {
      algorithms: ['RS256']
    });

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      return {
        valid: false,
        error: 'License has expired'
      };
    }

    return {
      valid: true,
      plan: decoded.plan,
      deployment: decoded.deployment,
      users: decoded.users,
      modules: decoded.modules,
      expires: new Date(decoded.exp * 1000).toISOString().split('T')[0],
      support: decoded.support,
      company: decoded.company
    };

  } catch (error) {
    console.error('JWT verification failed:', error);
    return {
      valid: false,
      error: 'Invalid license signature'
    };
  }
}

/**
 * Generates a trial license (for demo purposes)
 */
function generateTrialLicense() {
  const expiresIn30Days = new Date();
  expiresIn30Days.setDate(expiresIn30Days.getDate() + 30);

  return {
    valid: true,
    plan: 'Trial',
    deployment: 'on-premise',
    users: 5,
    modules: ['accounting', 'invoicing', 'tax'],
    expires: expiresIn30Days.toISOString().split('T')[0],
    support: 'Community (Forums)',
    company: 'Trial User',
    isTrial: true
  };
}

module.exports = {
  validateLicense,
  verifyLicenseJWT,
  generateTrialLicense
};
