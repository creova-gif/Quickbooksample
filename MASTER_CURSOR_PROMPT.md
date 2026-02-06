# 🤖 MASTER CURSOR PROMPT - COMPLETE EA ACCOUNTING PLATFORM

**Copy this entire prompt into Cursor AI to generate the complete production-ready system**

---

## 📋 SYSTEM OVERVIEW

You are a **senior full-stack accounting systems engineer** building a **QuickBooks-class accounting platform** for East Africa (Kenya, Uganda, Tanzania, Rwanda, Burundi).

Generate a **complete, production-ready, enterprise-grade** system with:
- ✅ Backend API (Node.js + Express + TypeScript + PostgreSQL)
- ✅ Frontend Web App (React + TypeScript + Tailwind CSS + Vite)
- ✅ Mobile App (React Native compatible)
- ✅ Desktop App (Electron)
- ✅ Complete test suite (Jest + Supertest + React Testing Library)

---

## 🎯 CRITICAL ACCOUNTING RULES

### 1. Double-Entry Ledger
```typescript
// EVERY financial transaction MUST post to ledger
// Total debits MUST ALWAYS equal total credits
// Example: Invoice of 10,000 + 16% VAT = 11,600
//   DR Accounts Receivable 11,600
//   CR Revenue 10,000
//   CR VAT Payable 1,600
//   Total: 11,600 = 11,600 ✅

// VALIDATION REQUIRED:
const validation = validateDoubleEntry(entries);
if (!validation.valid) {
  throw new Error('Debits must equal credits!');
}
```

### 2. Immutability
```typescript
// Posted records are IMMUTABLE - cannot be edited or deleted
// Only reversals allowed (creates inverse entries)
if (invoice.status === 'posted') {
  throw new Error('Cannot edit posted invoice. Use reversal instead.');
}
```

### 3. Audit Trail
```typescript
// EVERY action must create audit log
// Log before/after states
// Track user, timestamp, action type
// NO deletions allowed in production data
```

### 4. VAT Auto-Calculation
```typescript
// VAT is COMPUTED, not manually entered
vatAmount = amount × vatRate;
totalAmount = amount + vatAmount;
// Country-specific rates: Kenya 16%, Uganda 18%, Tanzania 18%, Rwanda 18%
```

### 5. Offline-First
```typescript
// All forms save to localStorage FIRST
// Then attempt sync to backend
// Auto-retry on network reconnect
// Never block user due to network
```

---

## 📁 GENERATE THESE FILES

### Backend (backend/)

#### Database Schema (src/db/schema.ts)
```typescript
// Generate complete PostgreSQL schema with:
// - businesses, branches, users
// - accounts (chart of accounts)
// - transactions, invoices, invoice_items
// - employees, payroll_runs
// - inventory_items, inventory_transactions
// - ledger_entries (double-entry)
// - audit_logs (immutable)
// - tax_sync_queue
// - licenses

// Include:
// - Proper indexes
// - Foreign keys
// - Check constraints (debits = credits)
// - Timestamps (created_at, updated_at)
// - Soft delete support (deleted_at)
```

#### Migrations (src/db/migrations/)
```sql
-- Generate SQL migration files:
-- 001_create_businesses.sql
-- 002_create_accounts.sql
-- 003_create_transactions.sql
-- 004_create_invoices.sql
-- 005_create_payroll.sql
-- 006_create_inventory.sql
-- 007_create_ledger.sql
-- 008_create_audit_logs.sql
-- 009_create_tax_sync_queue.sql

-- Include seed data:
-- - Default chart of accounts per country (Kenya, Uganda, Tanzania, Rwanda, Burundi)
-- - System accounts (Cash, AR, Revenue, VAT Payable, etc.)
```

#### Routes (src/routes/)
```typescript
// Generate API routes for:
// - transactions.ts (POST /api/v1/transactions, GET, POST /:id/post, POST /:id/reverse)
// - invoices.ts (POST /api/v1/invoices, GET, POST /:id/issue, POST /:id/reverse, POST /:id/payments)
// - payroll.ts (POST /api/v1/payroll, GET /employees, GET /runs, GET /:id/payslip)
// - inventory.ts (POST /api/v1/inventory/items, POST /adjustments, GET /movements)
// - branches.ts (POST /api/v1/branches, GET, GET /:id/ledger, GET /consolidated)
// - license.ts (POST /api/v1/license/activate, GET /validate)
// - taxSync.ts (GET /api/v1/tax-sync/queue, POST /retry/:id, POST /manual-sync)
// - audit.ts (GET /api/v1/audit, GET /export)

// Include:
// - Request validation (Zod schemas)
// - Authentication middleware
// - License gating middleware
// - Error handling
// - Response formatting
```

#### Services (src/services/)
```typescript
// Generate business logic services:

// ledgerService.ts
export function postInvoiceToLedger(invoice, userId): LedgerEntry[] {
  // Create double-entry ledger entries
  // DR Accounts Receivable (total)
  // CR Revenue (subtotal)
  // CR VAT Payable (VAT amount)
  // Validate debits === credits
  // Return entries
}

export function postPaymentToLedger(payment, invoice, userId): LedgerEntry[] {
  // DR Cash/Bank
  // CR Accounts Receivable
}

export function postTransactionToLedger(transaction, userId): LedgerEntry[] {
  // Income: DR Cash, CR Revenue, CR VAT Payable
  // Expense: DR Expense, DR VAT Receivable, CR Cash
}

export function reverseLedgerEntries(originalEntries, reason, userId): LedgerEntry[] {
  // Create inverse entries (swap debit/credit)
  // Mark original as reversed
  // Never delete!
}

// auditService.ts
export function logAudit(params: AuditLogParams): AuditLog {
  // Create audit log entry
  // Include before/after states
  // Track user, timestamp, action
}

// taxSyncService.ts
export function queueInvoiceSync(invoice, authority): TaxSyncQueue {
  // Add to queue for TIMS/EFRIS/VFD/EBM
  // Build country-specific payload
}

export function processSyncQueue(): SyncResult {
  // Process all pending items
  // Retry failed items
  // Update entity sync status
}

// vatService.ts
export function calculateVAT(amount, countryCode, vatRegistered): VATCalculation {
  // Get country VAT rate
  // Calculate VAT amount
  // Return { amount, vatRate, vatAmount, totalAmount }
}

// offlineQueueService.ts
export function saveOffline(transaction): void {
  // Save to localStorage
  // Add to sync queue
}

export function syncTransactions(): SyncResult {
  // Sync all queued items
  // Update status
  // Clear queue on success
}

// licenseService.ts
export function validateLicense(licenseKey): License {
  // Validate format
  // Check expiry
  // Return license data
}
```

#### Middleware (src/middleware/)
```typescript
// auth.ts - JWT authentication
// license.ts - License gating (check hasModule)
// audit.ts - Auto-audit logging
// validation.ts - Request validation
```

#### Utils (src/utils/)
```typescript
// countryVat.ts - VAT rates per country
// taxCalculator.ts - PAYE, NHIF, NSSF calculations
// cogsCalculator.ts - FIFO inventory costing
```

---

### Frontend (frontend/)

#### Modals (src/app/components/modals/)
```typescript
// Generate React modals (React + React Native compatible):

// TransactionFormModal.tsx
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

// Features:
// - Type selector (income/expense)
// - Amount input (triggers VAT recalculation)
// - Category dropdown (dynamic based on type)
// - VAT display (read-only, auto-calculated)
// - Payment method (country-specific: M-Pesa, etc.)
// - Date picker
// - Reference input
// - Description textarea
// - Save button (posts to ledger, creates audit log, queues offline)
// - Sync status badge

// InvoiceFormModal.tsx
// Features:
// - Customer selection
// - Invoice items table (add/remove rows)
// - Line total calculation (qty × price)
// - Subtotal (sum of line totals)
// - VAT (auto-calculated)
// - Total (subtotal + VAT)
// - Issue date, due date
// - Save as Draft / Issue Invoice buttons
// - On issue: Post to ledger, queue for tax sync
// - Reversal button (creates reversal invoice)

// PayrollFormModal.tsx
// Features:
// - Employee selection
// - Gross salary input
// - Tax calculation (PAYE, NHIF, NSSF - country-specific)
// - Net salary display
// - Process button (posts to ledger, generates payslip)

// InventoryFormModal.tsx
// Features:
// - Item selection
// - Adjustment type (Purchase/Sale/Adjustment)
// - Quantity input
// - Cost per unit
// - COGS calculation (FIFO)
// - Stock level update
// - Ledger posting

// BranchSelectorModal.tsx
// Features:
// - Branch dropdown
// - Financial summary table (revenue, expenses, profit per branch)
// - Consolidated view
// - Multi-currency conversion
// - License gating (enterprise tier only)

// LicenseActivationModal.tsx
// Features:
// - License key input (XXXX-XXXX-XXXX-XXXX)
// - Validation (API + offline cache)
// - Module enablement
// - Expiry warning
// - Upgrade prompt

// TaxSyncQueueModal.tsx
// Features:
// - Queue table (entity, authority, status, retries)
// - Filter tabs (pending, synced, failed)
// - Retry button
// - Manual sync button
// - Real-time updates

// AuditLogModal.tsx
// Features:
// - Filter controls (entity type, user, date range)
// - Audit log table
// - Details view (before/after diff)
// - Export (JSON, CSV)
// - Pagination

// ElectronInstallerModal.tsx
// Features:
// - 8-step wizard
// - Deployment type selection
// - License activation
// - Country configuration
// - Database setup
// - Progress tracking
// - Docker Compose generation
```

#### Contexts (src/contexts/)
```typescript
// LicenseContext.tsx
export function useLicense() {
  return {
    license,
    hasModule,
    hasFeature,
    isExpired
  };
}

// OfflineQueueContext.tsx
export function useOfflineQueue() {
  return {
    queue,
    saveOffline,
    syncAll,
    getStatus
  };
}

// BranchContext.tsx
export function useBranch() {
  return {
    currentBranch,
    branches,
    switchBranch,
    getConsolidated
  };
}

// BusinessContext.tsx (already exists)
```

#### Hooks (src/hooks/)
```typescript
// useTransaction.ts
export function useTransaction() {
  return {
    createTransaction,
    getTransactions,
    postTransaction,
    reverseTransaction
  };
}

// useInvoice.ts
export function useInvoice() {
  return {
    createInvoice,
    issueInvoice,
    recordPayment,
    reverseInvoice
  };
}

// usePayroll.ts
export function usePayroll() {
  return {
    processPayroll,
    getPayslip,
    calculateTax
  };
}

// useInventory.ts
export function useInventory() {
  return {
    adjustStock,
    calculateCOGS,
    getMovements
  };
}

// useTaxSync.ts
export function useTaxSync() {
  return {
    queueSync,
    retryFailed,
    getQueue
  };
}
```

#### Services (src/services/)
```typescript
// Already exist:
// - ledger.service.ts ✅
// - audit.service.ts ✅
// - taxsync.service.ts ✅
// - offline.service.ts ✅

// Generate:
// - api.client.ts (Axios with auth interceptor)
```

---

### Electron (electron/)

#### Main Process (main.ts)
```typescript
// Generate Electron main process:
// - Window creation
// - Menu setup
// - IPC handlers
// - Auto-update
// - Installer wizard integration
```

#### Installer (installer/)
```typescript
// ElectronInstallerWizard.tsx
// - 8-step wizard
// - License validation
// - Database initialization
// - Docker Compose generation
```

---

### Tests (tests/)

#### Backend Tests (tests/backend/)
```typescript
// transaction.test.ts
describe('Transaction API', () => {
  it('creates transaction with correct VAT', async () => {
    const response = await request(app)
      .post('/api/v1/transactions')
      .send({
        type: 'income',
        amount: 10000,
        currency: 'KES'
      });
    
    expect(response.body.vatAmount).toBe(1600);
    expect(response.body.totalAmount).toBe(11600);
  });

  it('posts transaction to ledger', async () => {
    // Create transaction
    // Check ledger entries created
    // Validate debits === credits
  });

  it('creates audit log', async () => {
    // Create transaction
    // Check audit log exists
  });
});

// invoice.test.ts
describe('Invoice API', () => {
  it('creates invoice with items', async () => { /* ... */ });
  it('issues invoice and posts to ledger', async () => { /* ... */ });
  it('reverses invoice with inverse entries', async () => { /* ... */ });
  it('prevents editing posted invoice', async () => { /* ... */ });
});

// ledger.test.ts
describe('Ledger Service', () => {
  it('validates double-entry', () => {
    const entries = [
      { debit: 11600, credit: 0 },
      { debit: 0, credit: 10000 },
      { debit: 0, credit: 1600 }
    ];
    const result = validateDoubleEntry(entries);
    expect(result.valid).toBe(true);
  });

  it('rejects unbalanced entries', () => {
    const entries = [
      { debit: 10000, credit: 0 },
      { debit: 0, credit: 5000 }
    ];
    const result = validateDoubleEntry(entries);
    expect(result.valid).toBe(false);
  });
});
```

#### Frontend Tests (tests/frontend/)
```typescript
// TransactionFormModal.test.tsx
describe('TransactionFormModal', () => {
  it('calculates VAT automatically', () => { /* ... */ });
  it('saves to offline queue', () => { /* ... */ });
  it('posts to ledger on submit', () => { /* ... */ });
});
```

#### E2E Tests (tests/e2e/)
```typescript
// full-workflow.spec.ts
describe('Complete Workflow', () => {
  it('creates transaction → ledger → audit → tax sync', async () => {
    // 1. Create transaction
    // 2. Check ledger entries
    // 3. Check audit log
    // 4. Check tax sync queue
  });

  it('creates invoice → payment → reversal', async () => {
    // Full invoice lifecycle
  });
});
```

---

## 🔐 CRITICAL REQUIREMENTS

### 1. TypeScript Strict Mode
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

### 2. Error Handling
```typescript
// All API routes must have try/catch
// All services must throw descriptive errors
// All errors logged to audit trail
```

### 3. Validation
```typescript
// Use Zod for request validation
// Validate before processing
// Return 400 with clear error messages
```

### 4. Security
```typescript
// JWT authentication required
// License validation on all gated routes
// SQL injection prevention (parameterized queries)
// XSS prevention (sanitize inputs)
```

### 5. Performance
```typescript
// Database indexes on frequently queried fields
// Pagination for large datasets
// Caching for license validation
// Optimistic UI updates
```

---

## 🌍 COUNTRY-SPECIFIC FEATURES

### VAT Rates
```typescript
const VAT_RATES = {
  KE: 0.16,  // Kenya 16%
  UG: 0.18,  // Uganda 18%
  TZ: 0.18,  // Tanzania 18%
  RW: 0.18,  // Rwanda 18%
  BI: 0.18   // Burundi 18%
};
```

### Tax Authorities
```typescript
const TAX_AUTHORITIES = {
  KE: 'TIMS',    // Kenya Tax Invoice Management System
  UG: 'EFRIS',   // Uganda Electronic Fiscal Receipting
  TZ: 'VFD',     // Tanzania Virtual Fiscal Device
  RW: 'EBM',     // Rwanda Electronic Billing Machine
  BI: 'Generic'  // Burundi (no specific system yet)
};
```

### PAYE Tax Brackets (Kenya Example)
```typescript
const PAYE_BRACKETS_KE = [
  { max: 24000, rate: 0.10 },
  { max: 32333, rate: 0.25 },
  { max: Infinity, rate: 0.30 }
];
```

### Chart of Accounts
```typescript
// Generate default accounts per country
// Kenya: Include NHIF, NSSF accounts
// Uganda: Include NSSF accounts
// Tanzania: Include NSSF accounts
// Each country has unique account codes
```

---

## 📊 DELIVERABLES

Generate **production-ready code** for:

### Backend (30+ files)
- ✅ Database schema (1 file)
- ✅ Migrations (9 SQL files)
- ✅ API routes (8 files)
- ✅ Services (6 files)
- ✅ Middleware (4 files)
- ✅ Utils (3 files)
- ✅ Tests (10 files)

### Frontend (25+ files)
- ✅ Modals (9 components)
- ✅ Contexts (3 files)
- ✅ Hooks (5 files)
- ✅ Services (1 file - api.client.ts)
- ✅ Tests (5 files)

### Electron (5+ files)
- ✅ Main process (1 file)
- ✅ Preload (1 file)
- ✅ Installer (1 file + 8 steps)

### Tests (20+ files)
- ✅ Unit tests (10 files)
- ✅ Integration tests (5 files)
- ✅ E2E tests (5 files)

### Total: 80+ production-ready files

---

## ✅ VALIDATION CHECKLIST

After generation, verify:

### Accounting Integrity
- [ ] All transactions post to ledger
- [ ] Debits always equal credits
- [ ] VAT auto-calculated correctly
- [ ] Posted records are immutable
- [ ] Reversals create inverse entries

### Audit Compliance
- [ ] All actions logged
- [ ] Before/after states captured
- [ ] No deletions (only reversals)
- [ ] Export functionality works

### Offline Support
- [ ] Forms save to localStorage
- [ ] Queue syncs on reconnect
- [ ] No data loss
- [ ] Status indicators work

### License Gating
- [ ] Modules disabled without license
- [ ] Validation works offline
- [ ] Expiry warnings shown

### Tax Compliance
- [ ] Invoices queue for sync
- [ ] Retry mechanism works
- [ ] Compliance data updated
- [ ] Country-specific payloads correct

---

## 🚀 FINAL NOTES

### Code Quality
- Use **meaningful variable names**
- Add **comprehensive comments**
- Follow **DRY principle**
- Use **TypeScript strict mode**
- Handle **all edge cases**

### Best Practices
- **Separation of concerns** (routes → services → database)
- **Single responsibility** (one function, one purpose)
- **Error handling** (try/catch everywhere)
- **Logging** (console.log important events)
- **Testing** (unit + integration + E2E)

### React Native Compatibility
- Use **React Native safe** components
- Avoid **browser-specific** APIs in shared code
- Use **Platform.select** for platform-specific code
- Test **touch interactions**

### Electron Integration
- Use **IPC** for main ↔ renderer communication
- Handle **file system** operations safely
- Implement **auto-update**
- Package for **Windows, macOS, Linux**

---

## 🎯 READY TO GENERATE!

This prompt will create a **complete, production-ready, enterprise-grade** EA Accounting Platform with:
- ✅ Accounting-safe double-entry ledger
- ✅ Complete audit trails
- ✅ Tax compliance (5 East African countries)
- ✅ Offline-first architecture
- ✅ License-based module gating
- ✅ Multi-branch consolidation
- ✅ Full test coverage
- ✅ React + React Native + Electron support

**Generate all files following the specifications above.**

**START GENERATION NOW!** 🚀
