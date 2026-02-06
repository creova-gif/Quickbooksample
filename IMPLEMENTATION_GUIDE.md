# 🚀 EA ACCOUNTING PLATFORM - IMPLEMENTATION GUIDE

**From Blueprint to Production in Record Time**

---

## 📋 TABLE OF CONTENTS

1. [Quick Start](#quick-start)
2. [Project Structure](#project-structure)
3. [Module Implementation Order](#module-implementation-order)
4. [Database Setup](#database-setup)
5. [API Development](#api-development)
6. [Frontend Development](#frontend-development)
7. [Testing Strategy](#testing-strategy)
8. [Deployment](#deployment)

---

## 🎯 QUICK START

### Prerequisites
```bash
✅ Node.js 18+ installed
✅ PostgreSQL 14+ (or SQLite for on-prem)
✅ Redis (optional, for queue)
✅ Git
✅ Cursor AI (or similar AI coding assistant)
```

### Step 1: Load Blueprint
```bash
# Open Cursor AI
# Load /platform-blueprint.json
# Load /CURSOR_PROMPTS.md
```

### Step 2: Initialize Project
```bash
# Backend
mkdir ea-accounting-backend
cd ea-accounting-backend
npm init -y
npm install express typescript pg typeorm redis

# Frontend (already initialized in current project)
cd ../ea-accounting-frontend
npm install
```

### Step 3: Generate First Module
```bash
# Copy Cursor Prompt for "ChartOfAccounts"
# Paste into Cursor AI
# Review generated code
# Integrate into project
```

---

## 📁 PROJECT STRUCTURE

```
ea-accounting-platform/
├── frontend/                     # React web app (current project)
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── transactions/
│   │   │   │   │   ├── TransactionFormModal.tsx
│   │   │   │   │   └── TransactionList.tsx
│   │   │   │   ├── invoices/
│   │   │   │   │   ├── InvoiceFormModal.tsx
│   │   │   │   │   └── InvoiceList.tsx
│   │   │   │   ├── payroll/
│   │   │   │   ├── inventory/
│   │   │   │   ├── accounts/
│   │   │   │   └── branches/
│   │   │   └── App.tsx
│   │   ├── contexts/
│   │   │   ├── BusinessContext.tsx
│   │   │   └── LicenseContext.tsx
│   │   ├── services/
│   │   │   ├── ledger.service.ts
│   │   │   ├── audit.service.ts
│   │   │   ├── taxsync.service.ts
│   │   │   └── offline.service.ts
│   │   ├── lib/
│   │   │   ├── vat.ts
│   │   │   └── countries.ts
│   │   └── types/
│   │       └── index.ts
│   └── package.json
│
├── backend/                      # Node.js + Express API
│   ├── src/
│   │   ├── routes/
│   │   │   ├── transactions.ts
│   │   │   ├── invoices.ts
│   │   │   ├── payroll.ts
│   │   │   ├── inventory.ts
│   │   │   ├── accounts.ts
│   │   │   ├── branches.ts
│   │   │   └── auth.ts
│   │   ├── services/
│   │   │   ├── transaction.service.ts
│   │   │   ├── invoice.service.ts
│   │   │   ├── ledger.service.ts
│   │   │   ├── audit.service.ts
│   │   │   ├── taxsync.service.ts
│   │   │   └── license.service.ts
│   │   ├── models/
│   │   │   ├── Transaction.ts
│   │   │   ├── Invoice.ts
│   │   │   ├── LedgerEntry.ts
│   │   │   └── AuditLog.ts
│   │   ├── lib/
│   │   │   ├── tax-calculator.ts
│   │   │   ├── cogs-calculator.ts
│   │   │   └── vat.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   ├── license.ts
│   │   │   └── audit.ts
│   │   └── server.ts
│   ├── migrations/
│   │   ├── 001_create_businesses.sql
│   │   ├── 002_create_accounts.sql
│   │   ├── 003_create_transactions.sql
│   │   ├── 004_create_invoices.sql
│   │   ├── 005_create_payroll.sql
│   │   ├── 006_create_inventory.sql
│   │   ├── 007_create_ledger.sql
│   │   └── 008_create_audit_logs.sql
│   ├── seeds/
│   │   ├── 001_default_accounts_kenya.ts
│   │   ├── 002_default_accounts_uganda.ts
│   │   └── ...
│   ├── tests/
│   │   ├── transaction.test.ts
│   │   ├── invoice.test.ts
│   │   └── ledger.test.ts
│   └── package.json
│
├── mobile/                       # React Native app
│   ├── src/
│   │   ├── screens/
│   │   ├── components/
│   │   └── services/
│   └── package.json
│
├── desktop/                      # Electron installer
│   ├── main.ts
│   ├── installer/
│   │   ├── WizardApp.tsx
│   │   └── screens/
│   └── package.json
│
├── platform-blueprint.json       # Master configuration
├── CURSOR_PROMPTS.md            # AI generation prompts
└── IMPLEMENTATION_GUIDE.md      # This file
```

---

## 🔢 MODULE IMPLEMENTATION ORDER

### Phase 1: Foundation (Week 1)
```
Priority 1: Database Setup
  ├── PostgreSQL installation
  ├── Create database
  └── Run base migrations

Priority 2: Chart of Accounts
  ├── Generate with Cursor AI
  ├── Seed default accounts (Kenya, Uganda, Tanzania, Rwanda, Burundi)
  └── Test account CRUD operations

Priority 3: Ledger Service
  ├── Already created! (/src/services/ledger.service.ts)
  └── Test double-entry validation
```

### Phase 2: Core Accounting (Week 2)
```
Priority 4: Transaction Module
  ├── Generate with Cursor AI
  ├── Integrate with ledger service
  ├── Add offline queue
  └── Test end-to-end

Priority 5: Invoice Module
  ├── Generate with Cursor AI
  ├── Integrate with ledger service
  ├── Add tax authority sync queue
  └── Test reversal flow
```

### Phase 3: Advanced Features (Week 3-4)
```
Priority 6: Payroll Module
  ├── Generate with Cursor AI
  ├── Implement country-specific tax calculations
  └── Test payslip generation

Priority 7: Inventory Module
  ├── Generate with Cursor AI
  ├── Implement FIFO COGS calculation
  └── Test ledger integration

Priority 8: Multi-Branch Module
  ├── Generate with Cursor AI
  ├── Implement consolidation logic
  └── Test multi-currency
```

### Phase 4: Deployment (Week 5)
```
Priority 9: Electron Installer
  ├── Generate with Cursor AI
  ├── Test 7-screen wizard
  ├── Test Docker Compose generation
  └── Package for Windows/Mac/Linux
```

---

## 🗄️ DATABASE SETUP

### PostgreSQL (Cloud/Private)
```sql
-- Create database
CREATE DATABASE ea_accounting;

-- Create user
CREATE USER ea_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE ea_accounting TO ea_user;

-- Connect
\c ea_accounting

-- Run migrations (in order)
\i migrations/001_create_businesses.sql
\i migrations/002_create_accounts.sql
\i migrations/003_create_transactions.sql
\i migrations/004_create_invoices.sql
\i migrations/005_create_payroll.sql
\i migrations/006_create_inventory.sql
\i migrations/007_create_ledger.sql
\i migrations/008_create_audit_logs.sql

-- Run seeds
\i seeds/001_default_accounts_kenya.sql
\i seeds/002_default_accounts_uganda.sql
\i seeds/003_default_accounts_tanzania.sql
\i seeds/004_default_accounts_rwanda.sql
\i seeds/005_default_accounts_burundi.sql
```

### SQLite (On-Premise)
```bash
# SQLite is file-based, no setup needed
# Database file: ./data/ea_accounting.db

# Run migrations with Knex or similar
npx knex migrate:latest
npx knex seed:run
```

### Migration Example: Transactions Table
```sql
-- migrations/003_create_transactions.sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id),
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  amount DECIMAL(15,2) NOT NULL,
  vat_rate DECIMAL(5,4) NOT NULL,
  vat_amount DECIMAL(15,2) NOT NULL,
  total_amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id),
  description TEXT NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  transaction_date DATE NOT NULL,
  reference VARCHAR(255),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'synced')),
  synced_at TIMESTAMPTZ,
  
  CONSTRAINT amount_positive CHECK (amount >= 0),
  CONSTRAINT vat_calculated CHECK (vat_amount = amount * vat_rate),
  CONSTRAINT total_calculated CHECK (total_amount = amount + vat_amount)
);

CREATE INDEX idx_transactions_business ON transactions(business_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_status ON transactions(status);
```

---

## 🔌 API DEVELOPMENT

### Backend Setup
```bash
cd backend
npm install express typescript @types/express
npm install pg typeorm
npm install bcrypt jsonwebtoken
npm install cors dotenv
npm install --save-dev nodemon ts-node
```

### Express Server Template
```typescript
// backend/src/server.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Routes
import transactionRoutes from './routes/transactions';
import invoiceRoutes from './routes/invoices';
import accountRoutes from './routes/accounts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/invoices', invoiceRoutes);
app.use('/api/v1/accounts', accountRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`EA Accounting API running on port ${PORT}`);
});
```

### API Route Example
```typescript
// backend/src/routes/transactions.ts
import express from 'express';
import { TransactionService } from '../services/transaction.service';
import { authMiddleware } from '../middleware/auth';
import { licenseMiddleware } from '../middleware/license';
import { auditMiddleware } from '../middleware/audit';

const router = express.Router();
const transactionService = new TransactionService();

// Create transaction
router.post(
  '/',
  authMiddleware,
  licenseMiddleware('accounting'),
  auditMiddleware('transaction', 'create'),
  async (req, res) => {
    try {
      const transaction = await transactionService.create(req.body, req.user.id);
      res.status(201).json(transaction);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Get all transactions
router.get(
  '/',
  authMiddleware,
  async (req, res) => {
    const { businessId, startDate, endDate } = req.query;
    const transactions = await transactionService.findAll({
      businessId,
      startDate,
      endDate,
    });
    res.json(transactions);
  }
);

// Post transaction (lock and post to ledger)
router.post(
  '/:id/post',
  authMiddleware,
  licenseMiddleware('accounting'),
  auditMiddleware('transaction', 'post'),
  async (req, res) => {
    try {
      const transaction = await transactionService.post(req.params.id, req.user.id);
      res.json(transaction);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

export default router;
```

---

## 🎨 FRONTEND DEVELOPMENT

### Integration with Existing Components

Your frontend already has:
- ✅ TransactionFormModal (basic)
- ✅ Ledger service
- ✅ Audit service
- ✅ Tax sync service
- ✅ License context

**Next Steps:**
1. **Enhance TransactionFormModal** with AI-generated backend integration
2. **Add InvoiceFormModal** (generate with Cursor)
3. **Add PayrollModule** (generate with Cursor)
4. **Wire up API calls** to backend

### API Client Example
```typescript
// src/services/api.client.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export class APIClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Transactions
  async createTransaction(data: any) {
    return this.request('/api/v1/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTransactions(filters: any) {
    const query = new URLSearchParams(filters).toString();
    return this.request(`/api/v1/transactions?${query}`);
  }

  // Invoices
  async createInvoice(data: any) {
    return this.request('/api/v1/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async issueInvoice(id: string) {
    return this.request(`/api/v1/invoices/${id}/issue`, {
      method: 'POST',
    });
  }
}

export const apiClient = new APIClient();
```

---

## 🧪 TESTING STRATEGY

### Unit Tests (Backend)
```typescript
// backend/tests/transaction.test.ts
import { TransactionService } from '../src/services/transaction.service';
import { LedgerService } from '../src/services/ledger.service';

describe('Transaction Service', () => {
  let transactionService: TransactionService;
  let ledgerService: LedgerService;

  beforeEach(() => {
    transactionService = new TransactionService();
    ledgerService = new LedgerService();
  });

  it('should create transaction with correct VAT', async () => {
    const data = {
      businessId: 'test-business',
      type: 'income',
      amount: 10000,
      vatRate: 0.16,
      currency: 'KES',
      categoryId: 'sales',
      description: 'Test sale',
      paymentMethod: 'cash',
      transactionDate: '2026-01-16',
    };

    const transaction = await transactionService.create(data, 'user-123');

    expect(transaction.vatAmount).toBe(1600);
    expect(transaction.totalAmount).toBe(11600);
    expect(transaction.status).toBe('draft');
  });

  it('should post transaction to ledger', async () => {
    const transaction = {
      id: 'tx-123',
      type: 'income',
      amount: 10000,
      vatAmount: 1600,
      totalAmount: 11600,
      currency: 'KES',
      // ...
    };

    const ledgerEntries = await ledgerService.postTransaction(transaction, 'user-123');

    expect(ledgerEntries).toHaveLength(3); // Cash DR, Revenue CR, VAT CR
    
    const totalDebits = ledgerEntries.reduce((sum, e) => sum + e.debit, 0);
    const totalCredits = ledgerEntries.reduce((sum, e) => sum + e.credit, 0);
    
    expect(totalDebits).toBe(totalCredits); // Double-entry validation
  });
});
```

### Integration Tests
```typescript
// backend/tests/invoice.integration.test.ts
import request from 'supertest';
import app from '../src/server';

describe('Invoice API', () => {
  it('should create, issue, and reverse invoice', async () => {
    // 1. Create draft invoice
    const createRes = await request(app)
      .post('/api/v1/invoices')
      .send({
        customerName: 'Test Customer',
        items: [
          { description: 'Product A', quantity: 2, unitPrice: 5000 }
        ],
        currency: 'KES',
      });

    expect(createRes.status).toBe(201);
    const invoice = createRes.body;

    // 2. Issue invoice (posts to ledger)
    const issueRes = await request(app)
      .post(`/api/v1/invoices/${invoice.id}/issue`)
      .send();

    expect(issueRes.status).toBe(200);
    expect(issueRes.body.status).toBe('issued');

    // 3. Check ledger entries created
    const ledgerRes = await request(app)
      .get(`/api/v1/ledger?invoiceId=${invoice.id}`)
      .send();

    expect(ledgerRes.body).toHaveLength(3); // AR, Revenue, VAT

    // 4. Reverse invoice
    const reverseRes = await request(app)
      .post(`/api/v1/invoices/${invoice.id}/reverse`)
      .send({ reason: 'Customer cancelled' });

    expect(reverseRes.status).toBe(200);
    expect(reverseRes.body.status).toBe('reversed');
  });
});
```

---

## 🚀 DEPLOYMENT

### Development
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev

# Access
# Frontend: http://localhost:5173
# Backend:  http://localhost:3000
```

### Production (Cloud)
```bash
# Build backend
cd backend
npm run build
npm run start

# Build frontend
cd frontend
npm run build

# Deploy to cloud (e.g., Vercel, Railway, Render)
vercel deploy
```

### On-Premise (Docker)
```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: ea_accounting
      POSTGRES_USER: ea_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://ea_user:${DB_PASSWORD}@postgres:5432/ea_accounting
      PORT: 3000
    ports:
      - "3000:3000"
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

```bash
# Deploy
docker-compose up -d
```

---

## ✅ IMPLEMENTATION CHECKLIST

### Phase 1: Foundation
- [ ] Database setup complete
- [ ] Chart of Accounts seeded for all countries
- [ ] Ledger service tested
- [ ] Audit service tested

### Phase 2: Core Modules
- [ ] Transaction module generated and integrated
- [ ] Invoice module generated and integrated
- [ ] Offline queue working
- [ ] Tax sync queue working

### Phase 3: Advanced Modules
- [ ] Payroll module with country-specific taxes
- [ ] Inventory module with FIFO COGS
- [ ] Multi-branch consolidation

### Phase 4: Deployment
- [ ] Electron installer packaged
- [ ] Docker Compose tested
- [ ] Production deployment successful

---

## 📞 SUPPORT

**Files:**
- Blueprint: `/platform-blueprint.json`
- Prompts: `/CURSOR_PROMPTS.md`
- Guide: `/IMPLEMENTATION_GUIDE.md` (this file)

**Key Services:**
- Ledger: `/src/services/ledger.service.ts`
- Audit: `/src/services/audit.service.ts`
- Tax Sync: `/src/services/taxsync.service.ts`
- License: `/src/contexts/LicenseContext.tsx`

**Estimated Timeline:**
- **With AI:** 3-5 weeks (1 developer)
- **Without AI:** 6-12 months (team of 3-5)

**You're now ready to build a QuickBooks-level accounting platform!** 🚀
