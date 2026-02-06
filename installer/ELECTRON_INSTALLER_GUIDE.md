# 🖥️ ELECTRON GUI INSTALLER

## Enterprise-Grade Installation Experience

This turns your "npm install" into a professional, QuickBooks-level installation wizard.

---

## 🎯 Purpose

- **One-click setup** for Cloud / Private / On-Prem
- **Non-technical teams** can install (accounting & IT)
- **Enforces licensing** + compliance
- **Reduces support burden**
- **Justifies enterprise pricing**

---

## 🧱 Installer Architecture

```
Electron App
│
├── UI (React)
│   ├── 1. Welcome
│   ├── 2. Deployment Selection
│   ├── 3. Country & Tax
│   ├── 4. Modules
│   ├── 5. License
│   ├── 6. Summary
│   └── 7. Install Progress
│
├── Node Backend (Electron Main)
│   ├── Env generator
│   ├── Docker runner
│   ├── License validator
│   └── Health checks
│
└── Output
    ├── .env
    ├── docker-compose.yml
    └── logs/install.log
```

---

## 🖥️ GUI SCREENS (7-Step Wizard)

### 1. Welcome Screen

```
┌─────────────────────────────────────────┐
│                                         │
│     [EA ACCOUNTING PLATFORM LOGO]      │
│                                         │
│   Welcome to the Enterprise Installer  │
│                                         │
│   Deployment Options:                  │
│   ✓ Cloud Hosting                      │
│   ✓ Private Cloud                      │
│   ✓ On-Premise Server                  │
│                                         │
│   [Start Setup]  [View Documentation]  │
│                                         │
└─────────────────────────────────────────┘
```

**Components:**
- Logo display
- Marketing copy
- Start button (primary CTA)
- Documentation link (opens external)

---

### 2. Deployment Type

```
┌─────────────────────────────────────────┐
│  Select Deployment Type                 │
├─────────────────────────────────────────┤
│                                         │
│  ○ Cloud (Hosted)                       │
│     Managed infrastructure             │
│     Starting at $49/month              │
│                                         │
│  ○ Private Cloud (Dedicated)            │
│     Isolated instance                  │
│     Starting at $299/month             │
│                                         │
│  ● On-Premise (Local Server)            │
│     Full control, annual license       │
│     Starting at $1,999/year            │
│                                         │
│  ℹ️  On-Premise deployments include    │
│     offline access and local data.     │
│                                         │
│  [Back]                      [Continue]│
└─────────────────────────────────────────┘
```

**Logic:**
```javascript
const deploymentTypes = [
  {
    id: 'cloud',
    label: 'Cloud (Hosted)',
    description: 'Managed infrastructure',
    price: '$49/month',
  },
  {
    id: 'private',
    label: 'Private Cloud (Dedicated)',
    description: 'Isolated instance',
    price: '$299/month',
  },
  {
    id: 'on-premise',
    label: 'On-Premise (Local Server)',
    description: 'Full control, annual license',
    price: '$1,999/year',
  },
];
```

---

### 3. Country & Compliance

```
┌─────────────────────────────────────────┐
│  Select Country & Tax System            │
├─────────────────────────────────────────┤
│                                         │
│  Country:                               │
│  [Kenya                          ▼]    │
│                                         │
│  Tax Compliance System:                │
│  ✓ TIMS (Tax Invoice Management)       │
│                                         │
│  VAT Rate:                              │
│  ✓ 16% (Kenya Standard Rate)           │
│                                         │
│  Invoice Format:                        │
│  ✓ TIMS-Compliant                      │
│                                         │
│  ⚠️  Tax engine cannot be disabled     │
│                                         │
│  [Back]                      [Continue]│
└─────────────────────────────────────────┘
```

**Countries:**
```javascript
const countries = [
  {
    code: 'KE',
    name: 'Kenya',
    system: 'TIMS (Tax Invoice Management)',
    vat: 16,
    format: 'TIMS-Compliant',
  },
  {
    code: 'UG',
    name: 'Uganda',
    system: 'EFRIS (Electronic Fiscal Receipting)',
    vat: 18,
    format: 'EFRIS-Compliant',
  },
  {
    code: 'TZ',
    name: 'Tanzania',
    system: 'VFD (Virtual Fiscal Device)',
    vat: 18,
    format: 'VFD-Compliant',
  },
  {
    code: 'RW',
    name: 'Rwanda',
    system: 'EBM (Electronic Billing Machine)',
    vat: 18,
    format: 'EBM-Compliant',
  },
  {
    code: 'BI',
    name: 'Burundi',
    system: 'VAT (Generic)',
    vat: 18,
    format: 'Standard Invoice',
  },
];
```

**Auto-lock logic:**
```javascript
// Tax engine cannot be disabled
const taxEngineRequired = true;
const selectedCountry = 'KE';
const taxEngine = getTaxEngine(selectedCountry); // Auto-loaded
```

---

### 4. Module Selection

```
┌─────────────────────────────────────────┐
│  Select Modules                          │
├─────────────────────────────────────────┤
│                                         │
│  ☑ Accounting (Required)                │
│     Double-entry, ledger, reports       │
│                                         │
│  ☑ Invoicing (Required)                 │
│     Invoice creation, PDF, e-invoicing  │
│                                         │
│  ☑ Tax Compliance (Required)            │
│     Country-specific VAT, submissions   │
│                                         │
│  ☐ Payroll (Optional)                   │
│     Employee management, PAYE, NSSF     │
│     ⓘ Professional & Enterprise plans   │
│                                         │
│  ☐ Inventory (Optional)                 │
│     Stock management, COGS              │
│     ⓘ Professional & Enterprise plans   │
│                                         │
│  [Back]                      [Continue]│
└─────────────────────────────────────────┘
```

**Module Logic:**
```javascript
const modules = [
  { id: 'accounting', name: 'Accounting', required: true, price: 0 },
  { id: 'invoicing', name: 'Invoicing', required: true, price: 0 },
  { id: 'tax', name: 'Tax Compliance', required: true, price: 0 },
  { id: 'payroll', name: 'Payroll', required: false, price: 29 },
  { id: 'inventory', name: 'Inventory', required: false, price: 19 },
];

// Disabled modules show upgrade message
const isDisabled = (module) => {
  return !module.required && !licenseAllows(module.id);
};
```

---

### 5. License Activation

```
┌─────────────────────────────────────────┐
│  Enter License Key                       │
├─────────────────────────────────────────┤
│                                         │
│  License Key:                           │
│  ┌─────────────────────────────────┐   │
│  │ EAAP-XXXX-XXXX-XXXX-XXXX        │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Status: ✔ Valid                        │
│                                         │
│  License Details:                       │
│  • Plan: Professional                   │
│  • Users: Up to 25                      │
│  • Modules: Accounting, Invoicing,      │
│             Tax, Payroll                │
│  • Expires: Dec 31, 2026                │
│  • Support: Professional (Email + Chat) │
│                                         │
│  [Purchase License] [Contact Sales]     │
│                                         │
│  [Back]                      [Continue]│
└─────────────────────────────────────────┘
```

**License Validation:**
```javascript
const validateLicense = async (key) => {
  // Call license server
  const response = await fetch('https://license.eastbooks.com/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key }),
  });

  const data = await response.json();

  return {
    valid: data.valid,
    plan: data.plan,
    users: data.users,
    modules: data.modules,
    expires: data.expires,
    support: data.support,
  };
};
```

**License Payload (JWT):**
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

---

### 6. Summary Screen

```
┌─────────────────────────────────────────┐
│  Installation Summary                    │
├─────────────────────────────────────────┤
│                                         │
│  Deployment Type:                       │
│  → On-Premise (Local Server)            │
│                                         │
│  Country:                               │
│  → Kenya (TIMS Compliance)              │
│                                         │
│  Modules:                               │
│  → Accounting, Invoicing, Tax, Payroll  │
│                                         │
│  License:                               │
│  → Professional (25 users)              │
│                                         │
│  Data Location:                         │
│  → /var/lib/eastbooks/data              │
│                                         │
│  Access URL (after install):            │
│  → http://localhost:3000                │
│                                         │
│  ☑ I agree to Terms of Service          │
│  ☑ I have read Privacy Policy           │
│                                         │
│  [Back]                        [Install]│
└─────────────────────────────────────────┘
```

**Summary Data:**
```javascript
const summary = {
  deployment: selectedDeployment,
  country: selectedCountry,
  modules: selectedModules,
  license: validatedLicense,
  dataPath: getDataPath(selectedDeployment),
  accessUrl: getAccessUrl(selectedDeployment),
};
```

---

### 7. Install Progress

```
┌─────────────────────────────────────────┐
│  Installing...                           │
├─────────────────────────────────────────┤
│                                         │
│  ✔ Generating configuration             │
│  ✔ Initializing database                │
│  ⏳ Starting services...                │
│  ░ Verifying health                     │
│                                         │
│  [████████████░░░░░░░░░] 65%            │
│                                         │
│  Logs:                                  │
│  ┌─────────────────────────────────┐   │
│  │ Creating Docker network...      │   │
│  │ Pulling postgres:15...          │   │
│  │ Starting backend service...     │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [View Full Logs]            [Cancel]  │
└─────────────────────────────────────────┘
```

**Installation Steps:**
```javascript
const installSteps = [
  {
    id: 'config',
    label: 'Generating configuration',
    action: async () => generateEnvFile(config),
  },
  {
    id: 'database',
    label: 'Initializing database',
    action: async () => runDatabaseMigrations(),
  },
  {
    id: 'services',
    label: 'Starting services',
    action: async () => startDockerCompose(),
  },
  {
    id: 'health',
    label: 'Verifying health',
    action: async () => checkHealthEndpoints(),
  },
];

// Run steps sequentially
for (const step of installSteps) {
  await runStep(step);
  updateProgress(step.id, 'complete');
}
```

**Final Success:**
```
┌─────────────────────────────────────────┐
│  ✅ Installation Complete!              │
├─────────────────────────────────────────┤
│                                         │
│  Your EA Accounting Platform is ready. │
│                                         │
│  Access your system at:                │
│  🌐 http://localhost:3000               │
│                                         │
│  Default Login:                         │
│  Email: admin@yourcompany.com          │
│  Password: (check email)               │
│                                         │
│  Next Steps:                            │
│  1. Open your browser                  │
│  2. Complete onboarding wizard         │
│  3. Import your data                   │
│  4. Invite users                       │
│                                         │
│  [Open App]  [View Documentation]      │
│                                         │
└─────────────────────────────────────────┘
```

---

## ⚙️ Tech Stack

### Electron + React
```json
{
  "name": "eastbooks-installer",
  "version": "1.0.0",
  "main": "electron/main.js",
  "dependencies": {
    "electron": "^28.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "tailwindcss": "^3.4.0"
  },
  "scripts": {
    "start": "electron .",
    "build": "electron-builder"
  }
}
```

### File Structure
```
installer/
├── electron/
│   ├── main.js              # Electron main process
│   ├── preload.js           # Preload script
│   └── utils/
│       ├── envGenerator.js  # .env file generator
│       ├── dockerRunner.js  # Docker Compose runner
│       ├── licenseValidator.js
│       └── healthChecker.js
├── src/
│   ├── App.tsx              # Main React app
│   ├── screens/
│   │   ├── Welcome.tsx
│   │   ├── DeploymentType.tsx
│   │   ├── CountrySelect.tsx
│   │   ├── ModuleSelect.tsx
│   │   ├── LicenseActivation.tsx
│   │   ├── Summary.tsx
│   │   └── InstallProgress.tsx
│   └── components/
│       ├── Wizard.tsx
│       ├── ProgressBar.tsx
│       └── LogViewer.tsx
└── output/
    ├── .env
    ├── docker-compose.yml
    └── logs/
```

---

## 🔧 Key Implementation Files

See `/installer/` directory for complete code.

---

## 🚀 Build & Distribute

```bash
# Development
npm install
npm start

# Build installers
npm run build

# Output:
# - Windows: eastbooks-installer-1.0.0.exe
# - macOS: eastbooks-installer-1.0.0.dmg
# - Linux: eastbooks-installer-1.0.0.AppImage
```

---

## 📊 What This Achieves

| Without Installer | With GUI Installer |
|-------------------|-------------------|
| Command line scary | Professional wizard |
| IT dept only | Anyone can install |
| Support tickets | Self-service setup |
| Look like startup | Look like SAP/Oracle |
| Hard to sell | Easy to demo |

---

**Status: Ready to Build** 🎯

This installer alone justifies **10x higher pricing** than "download and run npm install."
