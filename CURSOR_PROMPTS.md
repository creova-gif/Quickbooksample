# 🤖 CURSOR AI PROMPTS - EA ACCOUNTING PLATFORM

**How to Use:** Copy each prompt into Cursor AI to generate the complete module.

---

## 📋 MODULE 1: TRANSACTION FORM

### Cursor Prompt
```
You are a senior full-stack engineer building an accounting platform for East Africa.

Generate a complete TransactionForm module with:

SCHEMA:
Transaction {
  id: UUID
  businessId: UUID
  type: "income" | "expense" | "transfer"
  amount: number           // Net amount (before VAT)
  vatRate: number          // e.g., 0.16, 0.18
  vatAmount: number        // Computed: amount × vatRate
  totalAmount: number      // amount + vatAmount
  currency: "KES" | "UGX" | "TZS" | "RWF" | "BIF"
  categoryId: UUID
  description: string
  paymentMethod: "cash" | "bank" | "mobile_money"
  transactionDate: ISODate
  reference?: string
  createdBy: UUID
  createdAt: ISODate
  updatedAt: ISODate
  status: "draft" | "posted" | "synced"
  syncedAt?: ISODate
}

REQUIREMENTS:
1. Frontend: React modal form (TransactionFormModal.tsx)
2. Backend: Express API endpoints
   - POST /api/v1/transactions
   - GET /api/v1/transactions
   - POST /api/v1/transactions/:id/post
   - POST /api/v1/transactions/:id/reverse
3. Database: PostgreSQL table with migrations
4. Ledger Integration:
   - On post, create double-entry ledger entries
   - Income: DR Cash, CR Revenue, CR VAT Payable
   - Expense: DR Expense, DR VAT Receivable, CR Cash
   - Validate: total debits === total credits
5. Audit Log: Log create/update/post/reverse actions
6. Offline Support:
   - Save to localStorage on submit
   - Queue for sync
   - Retry on network reconnect
7. License Gating:
   - Check useLicense().hasModule('accounting')
   - Disable form if not licensed
8. VAT Auto-Calculation:
   - Use calculateVAT() from /src/lib/vat.ts
   - Auto-compute vatAmount and totalAmount
9. Unit Tests:
   - Test form validation
   - Test ledger posting
   - Test offline queue

Deliver:
- Frontend: /src/app/components/transactions/TransactionFormModal.tsx
- Backend: /backend/src/routes/transactions.ts
- Service: /backend/src/services/transaction.service.ts
- Database: /backend/migrations/001_create_transactions.sql
- Tests: /backend/tests/transaction.test.ts
```

---

## 📋 MODULE 2: INVOICE FORM

### Cursor Prompt
```
You are a senior full-stack engineer building an accounting platform for East Africa.

Generate a complete InvoiceForm module with:

SCHEMA:
Invoice {
  id: UUID
  businessId: UUID
  invoiceNumber: string    // Sequential, server-generated, immutable
  customerId?: UUID
  customerName: string
  customerEmail?: string
  customerPhone?: string
  customerAddress?: string
  customerTaxId?: string
  
  currency: "KES" | "UGX" | "TZS" | "RWF" | "BIF"
  
  issueDate: ISODate
  dueDate: ISODate
  
  status: "draft" | "issued" | "paid" | "voided" | "reversed"
  
  subtotal: number         // Before tax
  vatRate: number
  vatAmount: number        // Computed
  totalAmount: number      // subtotal + vatAmount
  balanceDue: number       // Reduces with payments
  
  items: InvoiceItem[]
  notes?: string
  terms?: string
  
  createdBy?: UUID
  createdAt: ISODate
  issuedAt?: ISODate
  paidAt?: ISODate
  
  taxSyncStatus: "pending" | "synced" | "failed"
  taxSyncedAt?: ISODate
  
  reversalOf?: UUID        // Original invoice if this is reversal
  reversedBy?: UUID        // Reversal invoice if this was reversed
  
  complianceData?: {
    timsInvoiceId?: string
    timsQrCode?: string
    efrisInvoiceId?: string
    vfdReceiptNumber?: string
    ebmInvoiceId?: string
    verificationUrl?: string
  }
}

InvoiceItem {
  id: UUID
  description: string
  quantity: number
  unitPrice: number
  lineTotal: number        // quantity × unitPrice
  categoryId?: UUID
}

REQUIREMENTS:
1. Frontend: React modal form (InvoiceFormModal.tsx)
2. Backend: Express API endpoints
   - POST /api/v1/invoices
   - GET /api/v1/invoices
   - POST /api/v1/invoices/:id/issue
   - POST /api/v1/invoices/:id/reverse
   - POST /api/v1/invoices/:id/payments
3. Database: PostgreSQL tables (invoices, invoice_items, payments)
4. Ledger Integration (Double-Entry):
   - On issue: DR Accounts Receivable, CR Revenue, CR VAT Payable
   - On payment: DR Cash/Bank, CR Accounts Receivable
   - On reversal: Create inverse entries (not deletion!)
   - Validate: debits === credits
5. Audit Log: Log draft/issue/payment/reversal
6. Tax Authority Sync:
   - Queue invoice for TIMS/EFRIS/VFD/EBM
   - Retry on failure (max 5 attempts)
   - Update complianceData on success
7. Offline Support:
   - Save draft invoices offline
   - Queue tax sync for later
8. License Gating:
   - Require 'invoicing' module
9. Invoice Numbering:
   - Server-side sequential (INV-0001, INV-0002, ...)
   - Per business, per country
10. Reversal Flow:
    - Create new invoice with negative amounts
    - Link via reversalOf/reversedBy
    - Create inverse ledger entries
    - Mark original as 'reversed'

Deliver:
- Frontend: /src/app/components/invoices/InvoiceFormModal.tsx
- Backend: /backend/src/routes/invoices.ts
- Service: /backend/src/services/invoice.service.ts
- Database: /backend/migrations/002_create_invoices.sql
- Tests: /backend/tests/invoice.test.ts
```

---

## 📋 MODULE 3: CHART OF ACCOUNTS

### Cursor Prompt
```
You are a senior accounting systems engineer.

Generate a Chart of Accounts module for East Africa with:

SCHEMA:
Account {
  id: UUID
  code: string             // e.g., "1000", "4100"
  name: string             // e.g., "Cash", "Sales Revenue"
  type: "asset" | "liability" | "equity" | "revenue" | "expense"
  currency: "KES" | "UGX" | "TZS" | "RWF" | "BIF"
  parentId?: UUID          // For hierarchical accounts
  country: "KE" | "TZ" | "UG" | "RW" | "BI"
  isTaxRelevant: boolean   // True for VAT accounts
  isSystem: boolean        // True for non-deletable accounts
  createdAt: ISODate
  updatedAt: ISODate
}

REQUIREMENTS:
1. Frontend: Account management interface (AccountList.tsx, AccountForm.tsx)
2. Backend: Express API endpoints
   - POST /api/v1/accounts
   - GET /api/v1/accounts
   - PUT /api/v1/accounts/:id
   - DELETE /api/v1/accounts/:id (only if not system account)
3. Database: PostgreSQL table
4. Default Accounts Per Country:
   Kenya (KE):
     Assets: Cash (1000), Bank (1010), AR (1200), VAT Receivable (1300)
     Liabilities: AP (2000), VAT Payable (2100), PAYE Payable (2200), NHIF (2210), NSSF (2220)
     Equity: Owner's Equity (3000), Retained Earnings (3100)
     Revenue: Sales (4000), Service Revenue (4100)
     Expenses: COGS (5000), Salaries (6000), Rent (6100), Utilities (6200)
   
   Uganda (UG):
     Similar structure, but with UGX currency and NSSF/PAYE specific accounts
   
   Tanzania (TZ):
     Similar structure, TZS currency
   
   Rwanda (RW):
     Similar structure, RWF currency
   
   Burundi (BI):
     Similar structure, BIF currency
5. Hierarchical Support:
   - Parent/child relationships
   - e.g., "6000 Operating Expenses" → "6100 Rent", "6200 Utilities"
6. Validation:
   - Cannot delete system accounts
   - Cannot delete accounts with transactions
   - Code must be unique per business
7. Audit Log: Log create/update/delete

Deliver:
- Frontend: /src/app/components/accounts/AccountList.tsx
- Frontend: /src/app/components/accounts/AccountForm.tsx
- Backend: /backend/src/routes/accounts.ts
- Backend: /backend/src/services/account.service.ts
- Backend: /backend/seeds/001_default_accounts.ts (per country)
- Database: /backend/migrations/003_create_accounts.sql
- Tests: /backend/tests/account.test.ts
```

---

## 📋 MODULE 4: PAYROLL

### Cursor Prompt
```
You are a senior payroll systems engineer.

Generate a Payroll module for East Africa with country-specific tax calculations:

SCHEMA:
Employee {
  id: UUID
  name: string
  employeeId: string       // Employee number
  email?: string
  phone?: string
  department?: string
  position?: string
  salary: number           // Monthly gross
  taxRate: number          // Calculated based on country tax brackets
  currency: "KES" | "UGX" | "TZS" | "RWF" | "BIF"
  country: "KE" | "TZ" | "UG" | "RW" | "BI"
  nhifContribution?: number  // Kenya only
  nssfContribution?: number  // Kenya, Uganda, Tanzania
  createdAt: ISODate
}

PayrollRun {
  id: UUID
  businessId: UUID
  month: number            // 1-12
  year: number
  employeeId: UUID
  grossSalary: number
  taxAmount: number        // PAYE
  nhifAmount?: number      // Kenya
  nssfAmount?: number      // Kenya, Uganda, Tanzania
  netSalary: number        // Gross - Tax - NHIF - NSSF
  status: "draft" | "posted" | "paid"
  ledgerPosted: boolean
  createdAt: ISODate
  postedAt?: ISODate
  paidAt?: ISODate
}

REQUIREMENTS:
1. Frontend: 
   - Employee management (EmployeeList.tsx, EmployeeForm.tsx)
   - Payroll run modal (PayrollRunModal.tsx)
   - Payslip view/download (PayslipView.tsx)
2. Backend: Express API endpoints
   - POST /api/v1/employees
   - GET /api/v1/employees
   - POST /api/v1/payroll/run
   - GET /api/v1/payroll/runs
   - GET /api/v1/payroll/:id/payslip
3. Database: PostgreSQL tables (employees, payroll_runs)
4. Tax Calculation Engine (per country):
   Kenya PAYE:
     0 - 24,000: 10%
     24,001 - 32,333: 25%
     32,334+: 30%
     Plus NHIF (based on salary bands)
     Plus NSSF (6% of gross, max 18,000)
   
   Uganda PAYE:
     0 - 235,000: 0%
     235,001 - 335,000: 10%
     335,001 - 410,000: 20%
     410,001+: 30%
     Plus NSSF (10% of gross)
   
   Tanzania PAYE:
     0 - 270,000: 0%
     270,001 - 520,000: 8%
     520,001 - 760,000: 20%
     760,001+: 25%
     Plus NSSF (10% of gross)
   
   Rwanda PAYE:
     0 - 30,000: 0%
     30,001 - 100,000: 20%
     100,001+: 30%
   
   Burundi PAYE:
     0 - 100,000: 0%
     100,001 - 200,000: 20%
     200,001+: 30%
5. Ledger Integration:
   - On post payroll:
     DR Salary Expense (gross)
     CR Salary Payable (net)
     CR PAYE Payable (tax)
     CR NHIF Payable (Kenya)
     CR NSSF Payable
6. Audit Log: Log payroll creation, posting, payment
7. Offline Support: Save draft payroll offline
8. License Gating: Require 'payroll' module
9. Payslip Generation: PDF export with company logo, employee details, deductions

Deliver:
- Frontend: /src/app/components/payroll/EmployeeList.tsx
- Frontend: /src/app/components/payroll/PayrollRunModal.tsx
- Frontend: /src/app/components/payroll/PayslipView.tsx
- Backend: /backend/src/routes/payroll.ts
- Backend: /backend/src/services/payroll.service.ts
- Backend: /backend/src/lib/tax-calculator.ts (country-specific)
- Database: /backend/migrations/004_create_payroll.sql
- Tests: /backend/tests/payroll.test.ts
```

---

## 📋 MODULE 5: INVENTORY

### Cursor Prompt
```
You are a senior inventory management engineer.

Generate an Inventory module with COGS tracking and ledger integration:

SCHEMA:
InventoryItem {
  id: UUID
  businessId: UUID
  name: string
  sku: string              // Stock Keeping Unit
  description?: string
  cost: number             // Purchase cost
  price: number            // Selling price
  quantityOnHand: number
  currency: "KES" | "UGX" | "TZS" | "RWF" | "BIF"
  ledgerAccountId: UUID    // Link to "Inventory" asset account
  reorderLevel?: number    // Low stock alert threshold
  createdAt: ISODate
  updatedAt: ISODate
}

InventoryTransaction {
  id: UUID
  itemId: UUID
  type: "purchase" | "sale" | "adjustment"
  quantity: number         // Positive for purchase/adjustment in, negative for sale/adjustment out
  cost: number             // Cost per unit
  reference?: string       // PO number, invoice number, etc.
  createdBy: UUID
  createdAt: ISODate
}

REQUIREMENTS:
1. Frontend:
   - Inventory list (InventoryList.tsx)
   - Item form (InventoryItemForm.tsx)
   - Transaction modal (InventoryTransactionModal.tsx)
   - Low stock alerts
2. Backend: Express API endpoints
   - POST /api/v1/inventory/items
   - GET /api/v1/inventory/items
   - POST /api/v1/inventory/adjustments
   - GET /api/v1/inventory/movements
   - GET /api/v1/inventory/low-stock
3. Database: PostgreSQL tables (inventory_items, inventory_transactions)
4. COGS Calculation:
   - Method: FIFO (First In, First Out)
   - On sale: Calculate COGS from oldest purchases
   - Track in inventory_transactions
5. Ledger Integration:
   - On purchase:
     DR Inventory (cost × quantity)
     CR Cash/AP
   - On sale:
     DR COGS (calculated FIFO cost)
     CR Inventory
6. Low Stock Alerts:
   - If quantityOnHand <= reorderLevel, flag item
   - Display in dashboard
7. Audit Log: Log all inventory transactions
8. Offline Support: Queue adjustments offline
9. License Gating: Require 'inventory' module
10. Mobile Features:
    - Barcode scanning (React Native)
    - Quick stock count

Deliver:
- Frontend: /src/app/components/inventory/InventoryList.tsx
- Frontend: /src/app/components/inventory/InventoryItemForm.tsx
- Frontend: /src/app/components/inventory/InventoryTransactionModal.tsx
- Backend: /backend/src/routes/inventory.ts
- Backend: /backend/src/services/inventory.service.ts
- Backend: /backend/src/lib/cogs-calculator.ts (FIFO logic)
- Database: /backend/migrations/005_create_inventory.sql
- Tests: /backend/tests/inventory.test.ts
```

---

## 📋 MODULE 6: MULTI-BRANCH

### Cursor Prompt
```
You are a senior enterprise accounting engineer.

Generate a Multi-Branch module with consolidated reporting:

SCHEMA:
Business {
  id: UUID
  name: string
  country: "KE" | "TZ" | "UG" | "RW" | "BI"
  currency: "KES" | "UGX" | "TZS" | "RWF" | "BIF"
  branches: Branch[]
  createdAt: ISODate
}

Branch {
  id: UUID
  name: string
  businessId: UUID
  location?: string
  currency: "KES" | "UGX" | "TZS" | "RWF" | "BIF"
  ledgerAccounts: Account[]   // Branch-specific accounts
  createdAt: ISODate
}

REQUIREMENTS:
1. Frontend:
   - Branch management (BranchList.tsx, BranchForm.tsx)
   - Branch selector (dropdown in header)
   - Consolidated reports view
2. Backend: Express API endpoints
   - POST /api/v1/branches
   - GET /api/v1/branches
   - GET /api/v1/branches/:id/ledger
   - GET /api/v1/businesses/:id/consolidated-ledger
   - GET /api/v1/businesses/:id/consolidated-pl
3. Database: PostgreSQL tables (businesses, branches)
4. Ledger Consolidation:
   - Each branch has own ledger entries
   - Consolidated view aggregates all branches
   - Eliminate inter-branch transfers
5. Multi-Currency Support:
   - Each branch can have different currency
   - Convert to business base currency for consolidation
   - Use exchange rates table
6. Inter-Branch Transfers:
   - Track transfers between branches
   - Create entries in both branch ledgers
   - Eliminate on consolidation
7. Reporting:
   - Branch-level P&L
   - Branch-level balance sheet
   - Consolidated financial statements
8. Audit Log: Log branch creation, transfers
9. License Gating: Require 'multibranch' module (enterprise tier)

Deliver:
- Frontend: /src/app/components/branches/BranchList.tsx
- Frontend: /src/app/components/branches/BranchForm.tsx
- Frontend: /src/app/components/reports/ConsolidatedReport.tsx
- Backend: /backend/src/routes/branches.ts
- Backend: /backend/src/services/branch.service.ts
- Backend: /backend/src/services/consolidation.service.ts
- Database: /backend/migrations/006_create_branches.sql
- Tests: /backend/tests/branch.test.ts
```

---

## 📋 MODULE 7: ELECTRON INSTALLER

### Cursor Prompt
```
You are a senior desktop application engineer.

Generate an Electron-based installer for the EA Accounting Platform:

REQUIREMENTS:
1. Multi-Step Wizard (7 screens):
   Screen 1: Welcome & License Agreement
   Screen 2: Deployment Type Selection
     - Cloud (SaaS)
     - Private Cloud (customer's cloud)
     - On-Premise (local servers)
   Screen 3: Module Selection
     - Show available modules based on license
     - Checkboxes for: Accounting, Invoicing, Payroll, Inventory, Multi-Branch
   Screen 4: Country Configuration
     - Select primary country: Kenya, Uganda, Tanzania, Rwanda, Burundi
     - Loads country-specific tax rules, VAT rates, chart of accounts
   Screen 5: Database Setup
     - PostgreSQL (cloud/private)
     - SQLite (on-premise)
     - Connection string input
     - Test connection button
   Screen 6: Configuration Summary
     - Review all selections
     - Back to edit
   Screen 7: Installation Progress
     - Download modules
     - Initialize database
     - Seed default data
     - Generate Docker Compose file (if on-prem)
   Screen 8: Complete & Launch
     - Success message
     - Launch application button
     - View logs button
2. License Validation:
   - Server-side validation API
   - Offline validation with cached license
   - Module gating based on license tier
3. Docker Compose Generation (On-Prem):
   - Generate docker-compose.yml with:
     - PostgreSQL container
     - Backend API container
     - Frontend web container
     - Redis for queue (optional)
   - Include environment variables
   - Network configuration
4. Auto-Update:
   - Check for updates on launch
   - Download and install updates
   - Rollback on failure
5. Cross-Platform:
   - Windows (NSIS installer)
   - macOS (DMG)
   - Linux (AppImage/Deb)
6. Offline Support:
   - Full offline installation
   - Bundled SQLite for on-prem
7. Features:
   - Tray icon with quick actions
   - System notifications
   - Local data backup
   - Export/import functionality

Deliver:
- Electron: /electron/main.ts (main process)
- Installer: /electron/installer/WizardApp.tsx (React UI)
- Screens: /electron/installer/screens/[1-8].tsx
- License: /electron/services/license.service.ts
- Database: /electron/services/database.service.ts
- Docker: /electron/templates/docker-compose.yml
- Build: /electron/build.js (packaging script)
- Config: electron-builder.json (build configuration)
- Tests: /electron/tests/installer.test.ts
```

---

## 🚀 USAGE INSTRUCTIONS

### For Each Module:
1. **Copy the prompt** for the module you want to generate
2. **Paste into Cursor AI** (or Claude, GPT-4, etc.)
3. **Cursor will generate**:
   - Frontend components
   - Backend API routes
   - Database migrations
   - Service layers
   - Unit tests
4. **Review and integrate** the generated code
5. **Test thoroughly** with provided test suites

### Recommended Order:
1. ChartOfAccounts (foundation)
2. TransactionForm (basic accounting)
3. InvoiceForm (invoicing)
4. Payroll (advanced)
5. Inventory (optional)
6. MultiBranch (enterprise)
7. ElectronInstaller (deployment)

---

## 📊 EXPECTED OUTPUT

Each module will generate:
- ✅ 5-10 TypeScript files
- ✅ Database migrations
- ✅ API endpoints
- ✅ Unit tests
- ✅ Integration with existing services (ledger, audit, tax sync)

Total estimated generation time: **2-3 hours** (with AI assistance) vs. **2-3 months** (manual coding)!

---

## ✅ VALIDATION CHECKLIST

After each module generation:
- [ ] TypeScript compiles without errors
- [ ] All tests pass
- [ ] Ledger entries balance (debits === credits)
- [ ] Audit logs created
- [ ] Offline queue works
- [ ] License gating enforced
- [ ] API endpoints documented

**Happy Generating!** 🚀
