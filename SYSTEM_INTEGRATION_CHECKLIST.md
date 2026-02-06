# ✅ SYSTEM INTEGRATION CHECKLIST

**After using the Master Cursor Prompt, verify all integrations work correctly**

---

## 📋 PRE-GENERATION CHECKLIST

Before running the Master Cursor Prompt:

- [ ] Backend directory created (`backend/`)
- [ ] Frontend directory exists (current project)
- [ ] Electron directory created (`electron/`) (optional)
- [ ] Tests directory created (`tests/`)
- [ ] `.env` files configured
- [ ] Database running (PostgreSQL or SQLite)
- [ ] Node.js 18+ installed
- [ ] npm dependencies installed

---

## 🔧 POST-GENERATION VERIFICATION

### 1️⃣ Backend API (30 files)

#### Database Schema
- [ ] `src/db/schema.ts` generated
- [ ] All tables defined (businesses, accounts, transactions, invoices, etc.)
- [ ] Foreign keys configured
- [ ] Indexes added for performance
- [ ] Check constraints for accounting rules

#### Migrations
- [ ] `001_create_businesses.sql` ✓
- [ ] `002_create_accounts.sql` ✓
- [ ] `003_create_transactions.sql` ✓
- [ ] `004_create_invoices.sql` ✓
- [ ] `005_create_payroll.sql` ✓
- [ ] `006_create_inventory.sql` ✓
- [ ] `007_create_ledger.sql` ✓
- [ ] `008_create_audit_logs.sql` ✓
- [ ] `009_create_tax_sync_queue.sql` ✓

#### Routes (8 files)
- [ ] `routes/transactions.ts` ✓
- [ ] `routes/invoices.ts` ✓
- [ ] `routes/payroll.ts` ✓
- [ ] `routes/inventory.ts` ✓
- [ ] `routes/branches.ts` ✓
- [ ] `routes/license.ts` ✓
- [ ] `routes/taxSync.ts` ✓
- [ ] `routes/audit.ts` ✓

#### Services (6 files)
- [ ] `services/ledgerService.ts` ✓
- [ ] `services/auditService.ts` ✓
- [ ] `services/taxSyncService.ts` ✓
- [ ] `services/vatService.ts` ✓
- [ ] `services/offlineQueueService.ts` ✓
- [ ] `services/licenseService.ts` ✓

#### Middleware (4 files)
- [ ] `middleware/auth.ts` ✓
- [ ] `middleware/license.ts` ✓
- [ ] `middleware/audit.ts` ✓
- [ ] `middleware/validation.ts` ✓

#### Utils (3 files)
- [ ] `utils/countryVat.ts` ✓
- [ ] `utils/taxCalculator.ts` ✓
- [ ] `utils/cogsCalculator.ts` ✓

---

### 2️⃣ Frontend Web/Mobile (25 files)

#### Modals (9 components)
- [ ] `components/modals/TransactionFormModal.tsx` ✓
- [ ] `components/modals/InvoiceFormModal.tsx` ✓
- [ ] `components/modals/PayrollFormModal.tsx` ✓
- [ ] `components/modals/InventoryFormModal.tsx` ✓
- [ ] `components/modals/BranchSelectorModal.tsx` ✓
- [ ] `components/modals/LicenseActivationModal.tsx` ✓
- [ ] `components/modals/TaxSyncQueueModal.tsx` ✓
- [ ] `components/modals/AuditLogModal.tsx` ✓
- [ ] `components/modals/ElectronInstallerModal.tsx` ✓

#### Contexts (3 files)
- [ ] `contexts/LicenseContext.tsx` ✓ (already exists)
- [ ] `contexts/OfflineQueueContext.tsx` ✓
- [ ] `contexts/BranchContext.tsx` ✓

#### Hooks (5 files)
- [ ] `hooks/useTransaction.ts` ✓
- [ ] `hooks/useInvoice.ts` ✓
- [ ] `hooks/usePayroll.ts` ✓
- [ ] `hooks/useInventory.ts` ✓
- [ ] `hooks/useTaxSync.ts` ✓

#### Services
- [ ] `services/api.client.ts` ✓

---

### 3️⃣ Electron (5 files)

- [ ] `main.ts` ✓
- [ ] `preload.ts` ✓
- [ ] `installer/ElectronInstallerWizard.tsx` ✓
- [ ] `installer/steps/*.tsx` (8 steps) ✓
- [ ] `templates/docker-compose.yml` ✓

---

### 4️⃣ Tests (20 files)

#### Backend Tests
- [ ] `tests/backend/transaction.test.ts` ✓
- [ ] `tests/backend/invoice.test.ts` ✓
- [ ] `tests/backend/payroll.test.ts` ✓
- [ ] `tests/backend/inventory.test.ts` ✓
- [ ] `tests/backend/ledger.test.ts` ✓
- [ ] `tests/backend/audit.test.ts` ✓
- [ ] `tests/backend/taxSync.test.ts` ✓

#### Frontend Tests
- [ ] `tests/frontend/TransactionFormModal.test.tsx` ✓
- [ ] `tests/frontend/InvoiceFormModal.test.tsx` ✓
- [ ] `tests/frontend/PayrollFormModal.test.tsx` ✓
- [ ] `tests/frontend/InventoryFormModal.test.tsx` ✓
- [ ] `tests/frontend/LicenseActivation.test.tsx` ✓

#### E2E Tests
- [ ] `tests/e2e/full-workflow.spec.ts` ✓
- [ ] `tests/e2e/offline-mode.spec.ts` ✓
- [ ] `tests/e2e/license-gating.spec.ts` ✓

---

## 🧪 FUNCTIONAL TESTING

### Accounting Integrity Tests

#### Test 1: Double-Entry Validation
```bash
# Create transaction
curl -X POST http://localhost:3000/api/v1/transactions \
  -H "Content-Type: application/json" \
  -d '{"type":"income","amount":10000,"currency":"KES"}'

# Check ledger
# ✓ Should create 3 entries
# ✓ DR Cash 11,600
# ✓ CR Revenue 10,000
# ✓ CR VAT Payable 1,600
# ✓ Total debits (11,600) === Total credits (11,600)
```

**Verification:**
- [ ] Ledger entries created
- [ ] Debits equal credits
- [ ] VAT calculated correctly (16% for Kenya)

#### Test 2: Immutability
```bash
# Create and post transaction
POST /transactions { ... }
POST /transactions/:id/post

# Try to edit posted transaction
PUT /transactions/:id { ... }

# ✓ Should return 400: "Cannot edit posted transaction"
```

**Verification:**
- [ ] Posted transaction cannot be edited
- [ ] Only reversal allowed
- [ ] Error message clear

#### Test 3: Reversal Flow
```bash
# Create invoice
POST /invoices { ... }

# Issue invoice (posts to ledger)
POST /invoices/:id/issue

# Reverse invoice
POST /invoices/:id/reverse {"reason":"Customer cancelled"}

# Check ledger
# ✓ Original entries exist
# ✓ Reversal entries created (inverse)
# ✓ Original marked as reversed
# ✓ No entries deleted
```

**Verification:**
- [ ] Reversal invoice created
- [ ] Inverse ledger entries created
- [ ] Original invoice status: reversed
- [ ] Link between original and reversal

---

### Audit Trail Tests

#### Test 4: Audit Logging
```bash
# Create transaction
POST /transactions { ... }

# Check audit log
GET /audit?entityType=transaction&entityId=...

# ✓ Should show action: create
# ✓ Should have after state
# ✓ Should have timestamp
# ✓ Should have user ID
```

**Verification:**
- [ ] Audit log entry created
- [ ] Before state (for updates)
- [ ] After state captured
- [ ] User tracked

#### Test 5: No Deletions
```bash
# Try to delete posted transaction
DELETE /transactions/:id

# ✓ Should return 403: "Deletions not allowed"
```

**Verification:**
- [ ] Delete endpoint disabled or returns error
- [ ] Audit log shows no delete actions
- [ ] Only reversals allowed

---

### Offline Support Tests

#### Test 6: Offline Queue
```bash
# Disconnect network
# Create transaction in UI
# Check localStorage

# ✓ Transaction saved locally
# ✓ Added to offline queue
# ✓ Sync status: pending
```

**Verification:**
- [ ] Transaction in localStorage
- [ ] Queue updated
- [ ] Status indicator shows pending

#### Test 7: Auto-Sync
```bash
# Reconnect network
# Wait for auto-sync

# ✓ Queue processed
# ✓ Transaction sent to backend
# ✓ Ledger entries created
# ✓ Queue cleared
# ✓ Status: synced
```

**Verification:**
- [ ] Auto-sync triggered on reconnect
- [ ] All queued items synced
- [ ] Status updated
- [ ] No data loss

---

### License Gating Tests

#### Test 8: Module Access
```bash
# Activate Starter license
POST /license/activate {"key":"STARTER-2024-XXXX"}

# Try to access payroll (not in starter)
POST /payroll { ... }

# ✓ Should return 403: "Payroll module not licensed"
```

**Verification:**
- [ ] License validated
- [ ] Module access controlled
- [ ] Error message clear
- [ ] Frontend buttons disabled

#### Test 9: License Expiry
```bash
# Check license with expiry < 30 days
GET /license/validate

# ✓ Should return warning
# ✓ UI shows expiry countdown
```

**Verification:**
- [ ] Expiry date checked
- [ ] Warning shown
- [ ] Grace period allowed

---

### Tax Compliance Tests

#### Test 10: Tax Sync Queue
```bash
# Create invoice
POST /invoices { ... }

# Issue invoice
POST /invoices/:id/issue

# Check tax sync queue
GET /tax-sync/queue

# ✓ Should show pending sync
# ✓ Authority: TIMS (for Kenya)
# ✓ Status: pending
```

**Verification:**
- [ ] Invoice queued for sync
- [ ] Correct authority selected
- [ ] Payload built correctly

#### Test 11: Tax Sync Retry
```bash
# Simulate failed sync
# Retry
POST /tax-sync/retry/:id

# ✓ Should increment retries
# ✓ Should attempt sync again
# ✓ On success: update status
```

**Verification:**
- [ ] Retry mechanism works
- [ ] Max retries enforced (5)
- [ ] Status updates correctly
- [ ] Compliance data updated on success

---

### Multi-Branch Tests

#### Test 12: Branch Switching
```bash
# Switch branch
POST /branches/switch {"branchId":"kampala"}

# Get transactions
GET /transactions

# ✓ Should only show Kampala transactions
# ✓ Currency: UGX
# ✓ VAT rate: 18% (Uganda)
```

**Verification:**
- [ ] Context switched
- [ ] Data filtered by branch
- [ ] Currency changed
- [ ] VAT rate updated

#### Test 13: Consolidation
```bash
# Get consolidated ledger
GET /businesses/:id/consolidated-ledger

# ✓ Should sum all branches
# ✓ Should eliminate inter-branch transfers
# ✓ Should convert currencies
```

**Verification:**
- [ ] All branches included
- [ ] Inter-branch eliminations
- [ ] Multi-currency conversion
- [ ] Totals correct

---

## 📊 PERFORMANCE TESTS

### Load Testing
- [ ] 1,000 transactions in 1 minute
- [ ] 100 concurrent users
- [ ] Database query time < 100ms
- [ ] API response time < 500ms

### Stress Testing
- [ ] 10,000 ledger entries
- [ ] Complex consolidation (5+ branches)
- [ ] Large invoice (100+ line items)
- [ ] Heavy audit log queries

---

## 🔐 SECURITY TESTS

### Authentication
- [ ] JWT validation works
- [ ] Expired tokens rejected
- [ ] Invalid tokens rejected
- [ ] Refresh token flow works

### Authorization
- [ ] License gating enforced
- [ ] Role-based access (if implemented)
- [ ] Branch-level access control

### SQL Injection
- [ ] All queries use parameterized statements
- [ ] Input sanitization works
- [ ] No raw SQL execution

### XSS Prevention
- [ ] HTML escaped in outputs
- [ ] JSON properly encoded
- [ ] No eval() usage

---

## ✅ INTEGRATION CHECKLIST

### Backend ↔ Database
- [ ] Migrations run successfully
- [ ] Seed data loaded
- [ ] Queries execute correctly
- [ ] Transactions (DB) work

### Backend ↔ Frontend
- [ ] API calls succeed
- [ ] CORS configured correctly
- [ ] Authentication works
- [ ] Error handling works

### Frontend ↔ localStorage
- [ ] Offline queue saves
- [ ] Data persists across refreshes
- [ ] Sync works

### Frontend ↔ Electron
- [ ] IPC communication works
- [ ] File system access works
- [ ] Installer runs

---

## 🎯 FINAL VALIDATION

### Code Quality
- [ ] TypeScript strict mode enabled
- [ ] No `any` types
- [ ] All imports resolve
- [ ] No unused variables
- [ ] No console errors

### Test Coverage
- [ ] Unit tests pass (>80% coverage)
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] All edge cases covered

### Documentation
- [ ] README.md updated
- [ ] API documentation complete
- [ ] Code comments added
- [ ] Deployment guide written

---

## 🚀 DEPLOYMENT READINESS

- [ ] Backend builds without errors
- [ ] Frontend builds without errors
- [ ] Electron packages successfully
- [ ] Environment variables documented
- [ ] Database migrations documented
- [ ] Rollback plan documented

---

## ✅ STATUS

```
Category                Progress    Status
────────────────────────────────────────────
Backend Files           0/30        🔲 Pending
Frontend Files          0/25        🔲 Pending
Electron Files          0/5         🔲 Pending
Test Files              0/20        🔲 Pending
────────────────────────────────────────────
Accounting Tests        0/3         🔲 Pending
Audit Tests             0/2         🔲 Pending
Offline Tests           0/2         🔲 Pending
License Tests           0/2         🔲 Pending
Tax Tests               0/2         🔲 Pending
Branch Tests            0/2         🔲 Pending
────────────────────────────────────────────
Overall                 0/93        0%
```

**Mark items as complete and track progress!** ✅
