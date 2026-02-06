# 🚀 QUICK START - Electron Installer

## Run the Installer (Development Mode)

### Step 1: Install Dependencies
```bash
cd installer
npm install
```

### Step 2: Start Development
```bash
# Option A: Concurrent mode (recommended)
npm run dev

# Option B: Two terminals
# Terminal 1:
npm run dev:react

# Terminal 2:
npm run dev:electron
```

### Step 3: Test the Flow
1. **Welcome Screen** - Click "Start Setup"
2. **Deployment Type** - Select "On-Premise (Local Server)"
3. **Country** - Select "Kenya" (or any country)
4. **Modules** - Keep defaults (Accounting, Invoicing, Tax)
5. **License** - Enter `EAAP-TEST-1234-5678-ABCD` or click "Start 30-Day Trial"
6. **Summary** - Check both legal agreements
7. **Install** - Click "Install Now" and watch progress

---

## Build Production Installers

```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux

# All platforms
npm run build
```

**Output:** `/installer/dist/eastbooks-installer-1.0.0.*`

---

## Demo License Keys

```
Valid: EAAP-XXXX-XXXX-XXXX-XXXX (any key starting with EAAP-)
Trial: TRIAL
```

---

## Test Checklist

- [ ] All 7 screens display correctly
- [ ] Navigation (Back/Continue) works
- [ ] License validation accepts demo keys
- [ ] Module selection toggles work
- [ ] Summary shows all configuration
- [ ] Progress bar animates during install
- [ ] Success screen shows access URL
- [ ] Responsive design works

---

## Troubleshooting

**Issue:** Vite server won't start
```bash
rm -rf node_modules
npm install
npm run dev:react
```

**Issue:** Electron won't open
```bash
# Make sure React dev server is running first
npm run dev:react
# Then in new terminal:
npm run dev:electron
```

**Issue:** Build fails
```bash
# Install electron-builder globally
npm install -g electron-builder
npm run build
```

---

## Next: Customize

1. Replace logo: `/installer/assets/icon.png`
2. Update colors: `/installer/src/styles/screens.css`
3. Configure license API: `/installer/electron/utils/licenseValidator.js`
4. Add real Docker images: `/installer/electron/utils/dockerRunner.js`

---

**Ready to demo!** 🎯
