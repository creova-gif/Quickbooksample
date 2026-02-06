# 🚀 QUICK START CARD - STEPS 1-4

**Copy-paste commands for immediate setup**

---

## ⚡ FASTEST METHOD (5 minutes)

```bash
# Make setup script executable
chmod +x QUICK_SETUP.sh

# Run it
./QUICK_SETUP.sh

# Done! Backend is set up ✅
```

---

## 📝 MANUAL METHOD (30 minutes)

### 1️⃣ Setup Backend (10 min)
```bash
# Create backend directory
cd ..
mkdir backend && cd backend

# Initialize npm
npm init -y

# Install dependencies (copy-paste this entire block)
npm install express cors dotenv pg bcrypt jsonwebtoken uuid decimal.js date-fns && \
npm install --save-dev typescript @types/express @types/node @types/cors ts-node nodemon

# Create directories
mkdir -p src/{db/migrations,routes,services,middleware,utils}

# Create tsconfig.json
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

# Update package.json scripts
npm pkg set scripts.dev="nodemon --exec ts-node src/index.ts"
npm pkg set scripts.build="tsc"
npm pkg set scripts.start="node dist/index.js"
```

### Copy Files
```bash
# Copy these files from your frontend project:
# /backend-index.ts → backend/src/index.ts
# /backend-db-connection.ts → backend/src/db/connection.ts
# /backend-env-example → backend/.env

# Create .env
cat > .env << 'EOF'
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
DATABASE_URL=postgresql://localhost:5432/ea_accounting
JWT_SECRET=change-this-in-production
EOF
```

---

### 2️⃣ Test Backend (2 min)
```bash
# Terminal 1: Start server
npm run dev

# Terminal 2: Test
curl http://localhost:3000/health

# Expected: {"status":"ok","timestamp":"..."}
```

---

### 3️⃣ Connect Frontend (2 min)
```bash
cd ../frontend

# Update .env
echo "VITE_API_URL=http://localhost:3000" >> .env

# Test in browser console:
# fetch('http://localhost:3000/health').then(r=>r.json()).then(console.log)
```

---

### 4️⃣ Generate Routes (1-2 hours with Cursor)
```bash
# 1. Open Cursor AI
# 2. Open: CURSOR_PROMPTS.md
# 3. Copy "TransactionForm" prompt
# 4. Paste into Cursor
# 5. Wait 5 minutes
# 6. File generated: backend/src/routes/transactions.ts

# Repeat for:
# - Invoices
# - Payroll
# - Inventory
# - Branches
# - License
# - Tax Sync
# - Audit
```

---

## ✅ VERIFICATION

### Backend Working?
```bash
✓ npm run dev shows: "Server running on port 3000"
✓ curl http://localhost:3000/health returns JSON
✓ No errors in terminal
```

### Frontend Connected?
```bash
✓ Browser console fetch test works
✓ No CORS errors
✓ Can call backend APIs
```

### Routes Generated?
```bash
✓ 8 route files in backend/src/routes/
✓ All routes imported in src/index.ts
✓ All endpoints respond
```

---

## 🎯 FILES CREATED

```
backend/
├── package.json          ← Dependencies
├── tsconfig.json         ← TypeScript config
├── .env                  ← Environment vars
└── src/
    ├── index.ts          ← Express server
    ├── db/
    │   └── connection.ts ← Database connection
    ├── routes/           ← API routes (8 files)
    ├── services/         ← Business logic
    └── utils/            ← Helpers
```

---

## 🚀 RUN BOTH

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev

# Open: http://localhost:5173
# Backend: http://localhost:3000
```

---

## 📊 PROGRESS

```
✅ Step 1: Backend Setup      (30 min)
✅ Step 2: Test Backend       (10 min)
✅ Step 3: Connect Frontend   (20 min)
🔄 Step 4: Generate Routes    (1-2 hrs)
```

---

## 🆘 HELP

### Port 3000 in use?
```bash
lsof -i :3000
kill -9 <PID>
```

### Dependencies not installing?
```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript errors?
```bash
npm install --save-dev typescript ts-node @types/node
```

---

## ✅ YOU'RE READY!

**Your setup is complete when:**
- ✅ Backend runs on :3000
- ✅ Frontend runs on :5173
- ✅ Health check works
- ✅ No errors

**Next: Generate routes with Cursor AI!** 🚀
