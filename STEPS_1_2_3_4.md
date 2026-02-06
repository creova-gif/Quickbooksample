# ✅ EXECUTING STEPS 1-4

**Quick implementation guide for immediate setup**

---

## 🎯 STEP 1: SETUP BACKEND (30 min)

### Option A: Automated (5 minutes)
```bash
# Make script executable
chmod +x QUICK_SETUP.sh

# Run setup script
./QUICK_SETUP.sh

# Done! Skip to Step 2
```

### Option B: Manual (30 minutes)

#### 1.1 Create Backend Directory
```bash
# From your current frontend directory
cd ..
mkdir backend
cd backend
```

#### 1.2 Initialize npm
```bash
npm init -y
```

#### 1.3 Copy package.json
```bash
# Copy the contents from /backend-package.json to backend/package.json
# Or manually install:

npm install express cors dotenv pg bcrypt jsonwebtoken uuid decimal.js date-fns

npm install --save-dev \
  typescript \
  @types/express \
  @types/node \
  @types/cors \
  @types/bcrypt \
  @types/jsonwebtoken \
  @types/uuid \
  ts-node \
  nodemon
```

#### 1.4 Create tsconfig.json
```bash
# Copy contents from /backend-tsconfig.json
# Or create manually:
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF
```

#### 1.5 Create Directory Structure
```bash
mkdir -p src/db/migrations
mkdir -p src/routes
mkdir -p src/services
mkdir -p src/middleware
mkdir -p src/utils
```

#### 1.6 Create src/index.ts
```bash
# Copy contents from /backend-index.ts to src/index.ts
```

#### 1.7 Create src/db/connection.ts
```bash
# Copy contents from /backend-db-connection.ts to src/db/connection.ts
```

#### 1.8 Create .env
```bash
# Copy contents from /backend-env-example to .env
cp .env.example .env

# Edit .env with your settings
nano .env  # or use your preferred editor
```

#### 1.9 Update package.json scripts
```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest"
  }
}
```

---

## ✅ STEP 2: TEST BACKEND (10 min)

### 2.1 Start Backend Server
```bash
# In backend directory
npm run dev
```

**Expected Output:**
```
==================================================
EA Accounting Platform - Backend API
==================================================
✓ Server running on port 3000
✓ Environment: development
✓ Health check: http://localhost:3000/health
✓ API info: http://localhost:3000/api/v1
==================================================
```

### 2.2 Test Health Endpoint
```bash
# In another terminal
curl http://localhost:3000/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-16T12:00:00.000Z",
  "uptime": 5.123,
  "environment": "development"
}
```

### 2.3 Test API Info Endpoint
```bash
curl http://localhost:3000/api/v1
```

**Expected Response:**
```json
{
  "name": "EA Accounting Platform API",
  "version": "1.0.0",
  "endpoints": {
    "health": "/health",
    "transactions": "/api/v1/transactions",
    "invoices": "/api/v1/invoices",
    ...
  }
}
```

### 2.4 Test 404 Handler
```bash
curl http://localhost:3000/nonexistent
```

**Expected Response:**
```json
{
  "error": "Not Found",
  "message": "Route GET /nonexistent not found",
  "timestamp": "..."
}
```

### ✅ Backend Tests Passed!
If all tests return expected responses, your backend is working! ✅

---

## 🔗 STEP 3: CONNECT FRONTEND (20 min)

### 3.1 Update Frontend .env
```bash
# In frontend directory
cd ../frontend

# Create or update .env
echo "VITE_API_URL=http://localhost:3000" > .env
```

### 3.2 Test API Connection
Open your browser console and run:
```javascript
// Test health endpoint
fetch('http://localhost:3000/health')
  .then(r => r.json())
  .then(console.log);

// Should log: { status: 'ok', timestamp: '...' }
```

### 3.3 Update API Client
Your existing `/src/services/api.client.ts` should already be configured, but verify:
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
```

### 3.4 Test from Component
Add a test button to your dashboard:
```tsx
// In Dashboard.tsx
import { useState } from 'react';

function TestAPIButton() {
  const [status, setStatus] = useState('');

  const testAPI = async () => {
    try {
      const response = await fetch('http://localhost:3000/health');
      const data = await response.json();
      setStatus(`✓ Backend connected: ${data.status}`);
    } catch (error) {
      setStatus('❌ Backend not reachable');
    }
  };

  return (
    <div>
      <button onClick={testAPI}>Test Backend</button>
      <p>{status}</p>
    </div>
  );
}
```

### ✅ Frontend Connected!
If you see "✓ Backend connected: ok", you're good to go! ✅

---

## 🚀 STEP 4: GENERATE API ROUTES (1-2 hours with Cursor AI)

### 4.1 Generate Transaction Routes
```bash
# Open Cursor AI
# Open file: CURSOR_PROMPTS.md
# Copy "TransactionForm" prompt
# Paste into Cursor

# Cursor will generate:
# - backend/src/routes/transactions.ts
# - backend/src/services/transaction.service.ts
```

### 4.2 Generate Invoice Routes
```bash
# Copy "InvoiceForm" prompt from CURSOR_PROMPTS.md
# Paste into Cursor

# Cursor will generate:
# - backend/src/routes/invoices.ts
# - backend/src/services/invoice.service.ts
```

### 4.3 Generate Remaining Routes
Repeat for:
- Payroll
- Inventory
- Branches
- License
- Tax Sync
- Audit

### 4.4 Import Routes in src/index.ts
```typescript
// Add to src/index.ts

import transactionRoutes from './routes/transactions';
import invoiceRoutes from './routes/invoices';
import payrollRoutes from './routes/payroll';
import inventoryRoutes from './routes/inventory';
import branchRoutes from './routes/branches';
import licenseRoutes from './routes/license';
import taxSyncRoutes from './routes/taxSync';
import auditRoutes from './routes/audit';

// Use routes
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/invoices', invoiceRoutes);
app.use('/api/v1/payroll', payrollRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/branches', branchRoutes);
app.use('/api/v1/license', licenseRoutes);
app.use('/api/v1/tax-sync', taxSyncRoutes);
app.use('/api/v1/audit', auditRoutes);
```

### 4.5 Test Each Route
```bash
# Test transaction endpoint
curl -X POST http://localhost:3000/api/v1/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "type": "income",
    "amount": 10000,
    "description": "Test sale"
  }'
```

---

## ✅ VERIFICATION CHECKLIST

### Backend ✓
- [ ] Server starts without errors
- [ ] Health endpoint returns `{ status: 'ok' }`
- [ ] API info endpoint returns endpoint list
- [ ] 404 handler works
- [ ] Database connection successful (if configured)

### Frontend ✓
- [ ] .env file has `VITE_API_URL=http://localhost:3000`
- [ ] Browser console fetch test works
- [ ] No CORS errors
- [ ] Test API button shows success

### API Routes ✓
- [ ] Transaction routes generated
- [ ] Invoice routes generated
- [ ] Payroll routes generated
- [ ] Inventory routes generated
- [ ] Branch routes generated
- [ ] License routes generated
- [ ] Tax sync routes generated
- [ ] Audit routes generated

---

## 🎉 SUCCESS CRITERIA

You've completed Steps 1-4 when:

✅ Backend server running on port 3000
✅ Frontend running on port 5173
✅ Health endpoint responds correctly
✅ Frontend can call backend APIs
✅ No CORS errors
✅ All routes generated (8 total)
✅ All routes imported and working

---

## 🐛 TROUBLESHOOTING

### Backend won't start
```bash
# Check Node version
node --version  # Should be 18+

# Check port availability
lsof -i :3000  # Should be empty

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### CORS errors
```bash
# Update backend/src/index.ts
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### Database connection fails
```bash
# Check PostgreSQL is running
pg_isready

# Or use SQLite for development
# In .env:
DATABASE_URL=sqlite:./data/ea_accounting.db
```

### Module not found errors
```bash
# Reinstall TypeScript types
npm install --save-dev @types/express @types/node @types/cors
```

---

## 📊 CURRENT STATUS

```
Step    Task                    Status      Time
─────────────────────────────────────────────────
1       Setup Backend           🔲 Pending  30 min
2       Test Backend            🔲 Pending  10 min
3       Connect Frontend        🔲 Pending  20 min
4       Generate API Routes     🔲 Pending  1-2 hrs
─────────────────────────────────────────────────
Total                                       2-3 hrs
```

---

## 🎯 NEXT STEPS

After completing Steps 1-4:

1. **Generate Modals** (1 hour)
   - Use CURSOR_PROMPTS_MODALS.md
   - Generate all 5 modals

2. **Add Tests** (2 hours)
   - Follow END_TO_END_TESTING.md
   - Test all workflows

3. **Deploy** (1 hour)
   - Deploy backend to Railway/Render
   - Deploy frontend to Vercel/Netlify

---

## ✅ LET'S GO!

**Start with Step 1 now:**

```bash
# Quick automated setup
chmod +x QUICK_SETUP.sh
./QUICK_SETUP.sh

# Or manual setup
cd ..
mkdir backend
cd backend
npm init -y
# ... follow manual steps above
```

**You got this!** 🚀
