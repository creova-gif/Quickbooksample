/**
 * Electron Preload Script
 * Exposes safe APIs to renderer process
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('installer', {
  // License validation
  validateLicense: (licenseKey) => ipcRenderer.invoke('validate-license', licenseKey),
  
  // Configuration generation
  generateEnv: (config) => ipcRenderer.invoke('generate-env', config),
  generateDockerCompose: (config) => ipcRenderer.invoke('generate-docker-compose', config),
  
  // Docker operations
  checkDocker: () => ipcRenderer.invoke('check-docker'),
  deployDocker: (config) => ipcRenderer.invoke('deploy-docker', config),
  
  // File system
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  
  // Progress updates
  onInstallProgress: (callback) => {
    ipcRenderer.on('install-progress', (event, data) => callback(data));
  },
  
  removeInstallProgressListener: () => {
    ipcRenderer.removeAllListeners('install-progress');
  }
});
