# 🚀 EA ACCOUNTING PLATFORM - COMPLETE SETUP GUIDE

**From zero to running app in 30 minutes**

---

## 📋 PREREQUISITES

Before starting:
```bash
✅ Node.js 18+ installed
✅ PostgreSQL 14+ installed (or SQLite)
✅ Git installed
✅ npm or yarn installed
✅ Code editor (VS Code recommended)
```

---

## 🎯 QUICK START (5 Minutes)

### Option 1: Use Current Frontend + Add Backend
```bash
# You're already in the frontend project
# Just add the backend

# 1. Create backend directory
mkdir -p ../backend
cd ../backend

# 2. Initialize backend
npm init -y

# 3. Install dependencies
npm install express cors dotenv pg typeorm bcrypt jsonwebtoken
npm install --save-dev typescript @types/express @types/node ts-node nodemon

# 4. Create structure
mkdir -p src/{db/migrations,routes,services,middleware,utils}

# 5. Start developing!
```

### Option 2: Fresh Start (Complete Monorepo)
```bash
# 1. Create root directory
mkdir ea-accounting-platform
cd ea-accounting-platform

# 2. Copy current frontend
cp -r /path/to/current/frontend ./frontend

# 3. Initialize backend
mkdir backend
cd backend
npm init -y
# ... (install dependencies as above)

# 4. Initialize Electron (optional)
mkdir electron
cd electron
npm init -y
npm install electron electron-builder

# 5. Done!
```

---

## 🏗️ DETAILED SETUP

### Step 1: Backend Setup (10 minutes)

#### 1.1 Create Directory Structure
```bash
mkdir -p backend/src/{db/migrations,routes,services,middleware,utils}
cd backend
```

#### 1.2 Initialize package.json
```bash
npm init -y
```

#### 1.3 Install Dependencies
```bash
# Core dependencies
npm install express cors dotenv pg

# Accounting-specific
npm install decimal.js date-fns uuid

# Development dependencies
npm install --save-dev \
  typescript \
  @types/express \
  @types/node \
  @types/cors \
  ts-node \
  nodemon \
  jest \
  @types/jest \
  supertest \
  @types/supertest
```

#### 1.4 Create tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

#### 1.5 Update package.json Scripts
```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest",
    "migrate": "ts-node src/db/migrations/run.ts"
  }
}
```

#### 1.6 Create .env File
```bash
cp .env.example .env
# Edit .env with your settings
```

#### 1.7 Create Express Server (src/index.ts)
```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`EA Accounting API running on port ${PORT}`);
});
```

#### 1.8 Test Backend
```bash
npm run dev

# In another terminal:
curl http://localhost:3000/health
# Should return: {"status":"ok","timestamp":"..."}
```

---

### Step 2: Database Setup (5 minutes)

#### 2.1 Create Database
```bash
# PostgreSQL
createdb ea_accounting

# Or SQLite (for development)
# Just set DATABASE_URL in .env to:
# DATABASE_URL=sqlite:./data/ea_accounting.db
```

#### 2.2 Create Database Connection (src/db/connection.ts)
```typescript
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected:', res.rows[0].now);
  }
});
```

#### 2.3 Create First Migration (src/db/migrations/001_create_businesses.sql)
```sql
-- 001_create_businesses.sql
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  country_code VARCHAR(2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  tax_id VARCHAR(100),
  vat_registered BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_businesses_country ON businesses(country_code);
```

#### 2.4 Run Migrations
```bash
npm run migrate
```

---

### Step 3: Frontend Integration (5 minutes)

#### 3.1 Install Missing Dependencies
```bash
cd frontend

# Already installed:
# - React, TypeScript, Tailwind, Vite

# Add these if missing:
npm install \
  @tanstack/react-query \
  axios \
  date-fns \
  react-hook-form \
  zod
```

#### 3.2 Update .env
```bash
# frontend/.env
VITE_API_URL=http://localhost:3000
```

#### 3.3 Create API Client (src/services/api.client.ts)
```typescript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

#### 3.4 Test API Integration
```tsx
// Test in a component
import { apiClient } from '@/services/api.client';

function TestComponent() {
  const testAPI = async () => {
    const response = await apiClient.get('/health');
    console.log('API Response:', response.data);
  };

  return <button onClick={testAPI}>Test API</button>;
}
```

---

### Step 4: Electron Setup (Optional, 5 minutes)

#### 4.1 Create Electron Directory
```bash
mkdir electron
cd electron
npm init -y
```

#### 4.2 Install Dependencies
```bash
npm install electron electron-builder
npm install --save-dev typescript @types/node
```

#### 4.3 Create main.ts
```typescript
import { app, BrowserWindow } from 'electron';
import path from 'path';

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load frontend
  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, '../frontend/dist/index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
```

#### 4.4 Update package.json
```json
{
  "main": "dist/main.js",
  "scripts": {
    "dev": "electron .",
    "build": "electron-builder"
  }
}
```

#### 4.5 Test Electron
```bash
npm run dev
```

---

## ✅ VERIFICATION CHECKLIST

### Backend ✓
```bash
# 1. Server starts
cd backend
npm run dev
# ✓ Should show: "EA Accounting API running on port 3000"

# 2. Health check works
curl http://localhost:3000/health
# ✓ Should return: {"status":"ok"}

# 3. Database connected
# ✓ Should show: "Database connected: <timestamp>"
```

### Frontend ✓
```bash
# 1. App starts
cd frontend
npm run dev
# ✓ Should show: "Local: http://localhost:5173"

# 2. Dashboard loads
# Open http://localhost:5173
# ✓ Should see dashboard

# 3. API calls work
# Open browser console
# Test API endpoint
# ✓ Should see successful response
```

### Electron ✓ (Optional)
```bash
# 1. Electron starts
cd electron
npm run dev
# ✓ Should open desktop app
```

---

## 🧪 POST-SETUP TESTING

### Test 1: Create Transaction
```bash
# Backend API call
curl -X POST http://localhost:3000/api/v1/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "type": "income",
    "amount": 10000,
    "description": "Test sale",
    "currency": "KES"
  }'
```

### Test 2: Frontend Form
```
1. Open Dashboard
2. Click "Record Sale"
3. Fill form
4. Submit
5. Check Recent Activity
✓ Transaction should appear
```

### Test 3: Offline Mode
```
1. Disconnect internet
2. Create transaction
3. Check offline queue
✓ Should queue transaction
4. Reconnect internet
✓ Should auto-sync
```

---

## 🐛 TROUBLESHOOTING

### Backend won't start
```bash
# Check port availability
lsof -i :3000

# Check Node version
node --version  # Should be 18+

# Check dependencies
npm install

# Check database
psql ea_accounting -c "SELECT 1;"
```

### Frontend can't connect to API
```bash
# Check CORS settings in backend
# Add to backend/src/index.ts:
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

# Check .env
cat frontend/.env
# Should have: VITE_API_URL=http://localhost:3000
```

### Database connection fails
```bash
# Check PostgreSQL is running
pg_isready

# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1;"
```

---

## 📊 SETUP STATUS

```
Component       Status      Port    URL
──────────────────────────────────────────────
Backend         ✅ Running  3000    http://localhost:3000
Frontend        ✅ Running  5173    http://localhost:5173
Database        ✅ Running  5432    localhost
Electron        ⏸️  Optional -      Desktop app
──────────────────────────────────────────────
Overall         ✅ Ready
```

---

## 🎯 NEXT STEPS

Now that your project is set up:

1. **Generate API Routes** - Use CURSOR_PROMPTS.md
2. **Generate Modals** - Use CURSOR_PROMPTS_MODALS.md
3. **Add Tests** - Follow END_TO_END_TESTING.md
4. **Deploy** - Follow deployment guide

---

## 📞 QUICK REFERENCE

### Start All Services
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev

# Terminal 3: Electron (optional)
cd electron && npm run dev
```

### Stop All Services
```bash
# Press Ctrl+C in each terminal
```

### Reset Database
```bash
# Drop and recreate
dropdb ea_accounting
createdb ea_accounting
cd backend && npm run migrate
```

---

## ✅ SETUP COMPLETE!

**Your EA Accounting Platform is now running!** 🎉

Access:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API Health: http://localhost:3000/health

**Next:** Start generating features with Cursor AI! 🚀
