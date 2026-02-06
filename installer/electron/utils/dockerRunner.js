const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

/**
 * Generates docker-compose.yml based on deployment type
 */
function generateDockerCompose(config, outputPath) {
  let dockerConfig;

  switch (config.deployment) {
    case 'on-premise':
      dockerConfig = generateOnPremiseConfig(config);
      break;
    case 'private':
      dockerConfig = generatePrivateCloudConfig(config);
      break;
    case 'cloud':
      dockerConfig = generateCloudConfig(config);
      break;
    default:
      throw new Error('Invalid deployment type');
  }

  try {
    const yamlContent = yaml.dump(dockerConfig, { indent: 2 });
    fs.writeFileSync(outputPath, yamlContent, 'utf8');
    console.log(`✓ Docker Compose file created: ${outputPath}`);
    return true;
  } catch (error) {
    console.error('✗ Failed to create docker-compose.yml:', error);
    return false;
  }
}

/**
 * On-Premise deployment configuration
 */
function generateOnPremiseConfig(config) {
  return {
    version: '3.8',
    services: {
      postgres: {
        image: 'postgres:15-alpine',
        container_name: 'eastbooks-db',
        environment: {
          POSTGRES_DB: 'eastbooks',
          POSTGRES_USER: 'eastbooks',
          POSTGRES_PASSWORD: 'eastbooks'
        },
        volumes: [
          'postgres_data:/var/lib/postgresql/data'
        ],
        ports: [
          '5432:5432'
        ],
        networks: ['eastbooks-network'],
        restart: 'unless-stopped',
        healthcheck: {
          test: ['CMD-SHELL', 'pg_isready -U eastbooks'],
          interval: '10s',
          timeout: '5s',
          retries: 5
        }
      },

      backend: {
        image: 'eastbooks/backend:latest',
        container_name: 'eastbooks-backend',
        depends_on: {
          postgres: {
            condition: 'service_healthy'
          }
        },
        env_file: ['.env'],
        environment: {
          DATABASE_URL: 'postgresql://eastbooks:eastbooks@postgres:5432/eastbooks',
          API_PORT: 4000
        },
        ports: [
          '4000:4000'
        ],
        volumes: [
          './uploads:/app/uploads',
          './logs:/app/logs'
        ],
        networks: ['eastbooks-network'],
        restart: 'unless-stopped',
        healthcheck: {
          test: ['CMD', 'curl', '-f', 'http://localhost:4000/health'],
          interval: '30s',
          timeout: '10s',
          retries: 3
        }
      },

      frontend: {
        image: 'eastbooks/frontend:latest',
        container_name: 'eastbooks-frontend',
        depends_on: ['backend'],
        environment: {
          VITE_API_URL: 'http://localhost:4000',
          PORT: config.port || 3000
        },
        ports: [
          `${config.port || 3000}:${config.port || 3000}`
        ],
        networks: ['eastbooks-network'],
        restart: 'unless-stopped'
      }
    },

    networks: {
      'eastbooks-network': {
        driver: 'bridge'
      }
    },

    volumes: {
      postgres_data: {}
    }
  };
}

/**
 * Private Cloud deployment configuration
 */
function generatePrivateCloudConfig(config) {
  const baseConfig = generateOnPremiseConfig(config);
  
  // Add backup service for private cloud
  baseConfig.services.backup = {
    image: 'prodrigestivill/postgres-backup-local',
    container_name: 'eastbooks-backup',
    depends_on: ['postgres'],
    environment: {
      POSTGRES_HOST: 'postgres',
      POSTGRES_DB: 'eastbooks',
      POSTGRES_USER: 'eastbooks',
      POSTGRES_PASSWORD: 'eastbooks',
      SCHEDULE: '@daily',
      BACKUP_KEEP_DAYS: 7,
      BACKUP_KEEP_WEEKS: 4,
      BACKUP_KEEP_MONTHS: 6
    },
    volumes: [
      'backup_data:/backups'
    ],
    networks: ['eastbooks-network'],
    restart: 'unless-stopped'
  };

  // Add monitoring service
  baseConfig.services.monitor = {
    image: 'prom/prometheus',
    container_name: 'eastbooks-monitor',
    volumes: [
      './monitoring/prometheus.yml:/etc/prometheus/prometheus.yml'
    ],
    ports: ['9090:9090'],
    networks: ['eastbooks-network'],
    restart: 'unless-stopped'
  };

  baseConfig.volumes.backup_data = {};

  return baseConfig;
}

/**
 * Cloud deployment configuration (minimal, mostly for reference)
 */
function generateCloudConfig(config) {
  return {
    version: '3.8',
    services: {
      frontend: {
        image: 'eastbooks/frontend:latest',
        container_name: 'eastbooks-frontend',
        environment: {
          VITE_API_URL: 'https://api.eastbooks.com',
          PORT: config.port || 3000
        },
        ports: [
          `${config.port || 3000}:${config.port || 3000}`
        ],
        restart: 'unless-stopped'
      }
    }
  };
}

module.exports = {
  generateDockerCompose
};
