const fs = require('fs');
const path = require('path');

/**
 * Generates .env file based on installation configuration
 */
function generateEnvFile(config, outputPath) {
  const envContent = `
# EA Accounting Platform Configuration
# Generated on ${new Date().toISOString()}

# Deployment
DEPLOYMENT_TYPE=${config.deployment}
NODE_ENV=production

# Database
DATABASE_URL=postgresql://eastbooks:eastbooks@localhost:5432/eastbooks
DB_HOST=localhost
DB_PORT=5432
DB_NAME=eastbooks
DB_USER=eastbooks
DB_PASSWORD=eastbooks

# Server
PORT=${config.port || 3000}
API_PORT=4000
HOST=0.0.0.0

# Country & Compliance
COUNTRY_CODE=${config.country}
TAX_SYSTEM=${config.taxSystem}
VAT_RATE=${config.vatRate}

# Modules
MODULES=${config.modules.join(',')}

# License
LICENSE_KEY=${config.licenseKey}
MAX_USERS=${config.maxUsers || 5}

# Security
JWT_SECRET=${generateRandomSecret()}
ENCRYPTION_KEY=${generateRandomSecret()}

# Features
ENABLE_OFFLINE=true
ENABLE_SYNC=true
ENABLE_AI=true
SEED_DATA=${config.seedData}

# Logging
LOG_LEVEL=info
LOG_DIR=./logs

# File Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Email (Configure after installation)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=noreply@eastbooks.com

# Mobile Money (Configure after installation)
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_SHORTCODE=
AIRTEL_MONEY_API_KEY=
MTN_MOMO_API_KEY=

# External APIs
OPENAI_API_KEY=

# Session
SESSION_SECRET=${generateRandomSecret()}
SESSION_TIMEOUT=86400000

# CORS
CORS_ORIGIN=${config.deployment === 'on-premise' ? `http://localhost:${config.port}` : 'https://app.eastbooks.com'}

# Admin
ADMIN_EMAIL=admin@yourcompany.com
ADMIN_PASSWORD=${generateRandomPassword()}
`.trim();

  try {
    fs.writeFileSync(outputPath, envContent, 'utf8');
    console.log(`✓ Environment file created: ${outputPath}`);
    return true;
  } catch (error) {
    console.error('✗ Failed to create .env file:', error);
    return false;
  }
}

/**
 * Generate random secret for JWT/encryption
 */
function generateRandomSecret(length = 64) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let secret = '';
  for (let i = 0; i < length; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
}

/**
 * Generate random admin password
 */
function generateRandomPassword(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

module.exports = {
  generateEnvFile,
  generateRandomSecret,
  generateRandomPassword
};
