# 🖥️ EA Accounting Platform - Enterprise GUI Installer

Professional Electron-based installer for deploying the EA Accounting Platform across Cloud, Private Cloud, and On-Premise environments.

---

## ✨ Features

- **7-Screen Wizard** - Professional installation flow
- **License Validation** - JWT-based license verification
- **Country Compliance Locking** - Auto-configure tax engines (TIMS, EFRIS, VFD, EBM)
- **Docker Deployment** - Automated containerized deployment
- **Health Checks** - Verify all services before completion
- **Module Selection** - Feature flag-based module control
- **Trial Mode** - 30-day trial with limited features

---

## 🏗️ Architecture

```
installer/
├── electron/
│   ├── main.js              # Electron main process
│   ├── preload.js           # Preload script (IPC bridge)
│   └── utils/
│       ├── envGenerator.js      # .env file generator
│       ├── dockerRunner.js      # Docker Compose generator
│       ├── licenseValidator.js  # License validation logic
│       └── healthChecker.js     # Service health checks
├── src/
│   ├── App.tsx              # Main React app
│   ├── main.tsx             # React entry point
│   ├── screens/
│   │   ├── Welcome.tsx           # Screen 1: Welcome
│   │   ├── DeploymentType.tsx    # Screen 2: Deployment selection
│   │   ├── CountrySelect.tsx     # Screen 3: Country & tax
│   │   ├── ModuleSelect.tsx      # Screen 4: Module selection
│   │   ├── LicenseActivation.tsx # Screen 5: License validation
│   │   ├── Summary.tsx           # Screen 6: Summary & confirmation
│   │   └── InstallProgress.tsx   # Screen 7: Installation progress
│   └── styles/
│       ├── App.css
│       └── screens.css      # All screen styles
├── templates/               # Docker Compose templates
├── package.json
├── vite.config.ts
└── README.md
```

---

## 🚀 Installation Wizard Flow

### **1. Welcome Screen**
- Branding and introduction
- Links to documentation
- Start setup button

### **2. Deployment Type**
- **Cloud (Hosted)** - Shared infrastructure, $49/month
- **Private Cloud (Dedicated)** - Isolated instance, $299/month
- **On-Premise (Local Server)** - Full control, $1,999/year

### **3. Country & Compliance**
- Select country (Kenya, Uganda, Tanzania, Rwanda, Burundi)
- Auto-lock tax engine (TIMS, EFRIS, VFD, EBM, Generic)
- Display VAT rate and compliance requirements

### **4. Module Selection**
- **Required:** Accounting, Invoicing, Tax Compliance
- **Optional:** Payroll (+$29/mo), Inventory (+$19/mo)
- Feature flag integration

### **5. License Activation**
- Enter license key (format: `EAAP-XXXX-XXXX-XXXX-XXXX`)
- Validate license via JWT or API call
- Display license details (plan, users, modules, expiry)
- Option to start 30-day trial

### **6. Summary**
- Review all configuration
- Display access URL and data location
- Legal agreements (Terms of Service, Privacy Policy)

### **7. Installation Progress**
Steps:
1. Generating configuration (.env, docker-compose.yml)
2. Initializing database (PostgreSQL)
3. Starting services (backend, frontend)
4. Verifying health (API endpoints)
5. Success screen with access instructions

---

## 📦 Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Docker Desktop (for testing)

### Install Dependencies
```bash
cd installer
npm install
```

### Development Mode
```bash
# Terminal 1: Start Vite dev server
npm run dev:react

# Terminal 2: Start Electron
npm run dev:electron
```

### Build Installer
```bash
# Build for all platforms
npm run build

# Build for specific platform
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

### Output
```
dist/
├── eastbooks-installer-1.0.0.exe       # Windows
├── eastbooks-installer-1.0.0.dmg       # macOS
└── eastbooks-installer-1.0.0.AppImage  # Linux
```

---

## 🔧 Configuration

### Environment Variables
Create `.env` in installer root (for development):

```env
NODE_ENV=development
VITE_LICENSE_API=https://license.eastbooks.com/validate
```

### License Validation
The installer validates licenses using:
1. **JWT Verification** (offline)
2. **API Call** (online validation)

#### JWT License Format
```json
{
  "iss": "eastbooks.com",
  "sub": "customer-uuid",
  "plan": "professional",
  "deployment": "on-premise",
  "users": 25,
  "modules": ["accounting", "invoicing", "tax", "payroll"],
  "expires": "2026-12-31",
  "support": "professional",
  "iat": 1704067200,
  "exp": 1735689600
}
```

### Trial License
Demo license key: `EAAP-XXXX-XXXX-XXXX-XXXX`
- Any key starting with "EAAP-" is accepted in demo mode
- `TRIAL` key activates 30-day trial with limited features

---

## 🐳 Docker Deployment

### On-Premise Configuration
```yaml
services:
  postgres:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  backend:
    image: eastbooks/backend:latest
    env_file: .env
  
  frontend:
    image: eastbooks/frontend:latest
    ports:
      - "3000:3000"
```

### Private Cloud Configuration
Includes:
- Automated backups (daily, weekly, monthly)
- Prometheus monitoring
- Redis caching

---

## 📊 IPC Communication

### Electron IPC Handlers

```javascript
// License validation
const result = await window.electron.validateLicense(licenseKey);

// Generate configuration files
await window.electron.generateEnv(config);
await window.electron.generateDockerCompose(config);

// Check Docker status
const dockerStatus = await window.electron.checkDocker();

// Deploy services
await window.electron.deployDocker(config);

// Select install directory
const directory = await window.electron.selectDirectory();
```

---

## 🎨 Customization

### Branding
Replace assets:
- `/installer/assets/icon.png` - App icon
- `/installer/assets/icon.ico` - Windows icon
- `/installer/assets/icon.icns` - macOS icon
- `/installer/assets/logo.svg` - Logo in wizard

### Colors
Edit `/installer/src/styles/screens.css`:
```css
/* Primary gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Accent color */
color: #667eea;
```

---

## 🔒 Security

### Production Checklist
- [ ] Replace demo license validation with real API
- [ ] Add license signature verification (RS256)
- [ ] Implement license revocation checks
- [ ] Secure IPC communication
- [ ] Code signing for installers
- [ ] Auto-update mechanism

### License Server API
```typescript
POST https://license.eastbooks.com/validate
Content-Type: application/json

{
  "key": "EAAP-XXXX-XXXX-XXXX-XXXX"
}

Response:
{
  "valid": true,
  "plan": "professional",
  "users": 25,
  "modules": ["accounting", "invoicing", "tax", "payroll"],
  "expires": "2026-12-31"
}
```

---

## 📋 Deployment Checklist

### Before Building Installers
- [ ] Update version in `package.json`
- [ ] Test all 7 screens
- [ ] Test license validation
- [ ] Test Docker deployment
- [ ] Test health checks
- [ ] Verify all country tax adapters load
- [ ] Test on target OS (Windows, macOS, Linux)
- [ ] Sign installers with code signing certificate

### Post-Build
- [ ] Test installer on clean machine
- [ ] Verify Docker Compose generates correctly
- [ ] Verify .env file generates correctly
- [ ] Test complete installation flow
- [ ] Verify services start successfully
- [ ] Test access to application

---

## 🐛 Troubleshooting

### Docker Not Found
```bash
# Verify Docker is installed
docker --version

# Verify Docker is running
docker ps
```

### License Validation Fails
- Check internet connection
- Verify license key format
- Check license expiration date
- Contact support@eastbooks.com

### Services Won't Start
```bash
# Check Docker logs
docker-compose logs -f

# Restart services
docker-compose down
docker-compose up -d
```

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Change port in configuration
PORT=3001 npm start
```

---

## 📞 Support

- **Documentation:** https://docs.eastbooks.com
- **Email:** support@eastbooks.com
- **Sales:** sales@eastbooks.com
- **Community:** https://community.eastbooks.com

---

## 📄 License

This installer is proprietary software.
© 2026 EastBooks. All rights reserved.

**Software is licensed, not sold.**
See LICENSE file for details.

---

## 🎯 What This Achieves

| Without GUI Installer | With GUI Installer |
|-----------------------|-------------------|
| Command line scary | Professional wizard |
| IT dept only | Anyone can install |
| Support tickets | Self-service setup |
| Look like startup | Look like SAP/Oracle |
| Hard to sell | Easy to demo |
| Free tier pressure | Enterprise pricing justified |

**This installer alone justifies 10x higher pricing.** 🚀