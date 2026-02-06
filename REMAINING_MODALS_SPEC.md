# 🎨 REMAINING MODALS - COMPLETE SPECIFICATIONS

## 📋 MODALS TO IMPLEMENT

| Modal | Status | Priority | Integration |
|-------|--------|----------|-------------|
| BranchSelectorModal | 🔲 Pending | High | Multi-branch, Dashboard |
| LicenseActivationModal | 🔲 Pending | High | License Context |
| TaxSyncQueueModal | 🔲 Pending | Medium | Tax Sync Service |
| AuditLogModal | 🔲 Pending | Medium | Audit Service |
| ElectronInstallerModal | 🔲 Pending | Low | Electron App |

---

## 1️⃣ BRANCH SELECTOR MODAL

### Purpose
Multi-branch management and consolidation for enterprise customers.

### Features
- ✅ Branch selection (single/multi)
- ✅ Financial summary per branch
- ✅ Consolidated view across branches
- ✅ Branch switching updates dashboard
- ✅ Offline-first selection queue

### UI Specification
```
┌─────────────────────────────────────────┐
│  Select Branch                      [X] │
├─────────────────────────────────────────┤
│                                         │
│  Current Branch: Nairobi HQ        ▼   │
│                                         │
│  Available Branches:                    │
│  ☑ Nairobi HQ (Kenya - KES)            │
│  ☐ Kampala Branch (Uganda - UGX)       │
│  ☐ Dar es Salaam (Tanzania - TZS)      │
│                                         │
│  ────────────────────────────────────  │
│                                         │
│  Branch Performance:                    │
│  ┌─────────────────────────────────┐   │
│  │ Branch        Revenue   Profit  │   │
│  │ Nairobi HQ    $50,000   $12,000 │   │
│  │ Kampala       $30,000   $8,000  │   │
│  │ Dar es Salaam $25,000   $6,000  │   │
│  │ ──────────────────────────────  │   │
│  │ TOTAL         $105,000  $26,000 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [View Consolidated]  [Switch Branch]  │
└─────────────────────────────────────────┘
```

### Data Schema
```typescript
interface Branch {
  id: string;
  name: string;
  businessId: string;
  country: 'KE' | 'TZ' | 'UG' | 'RW' | 'BI';
  currency: 'KES' | 'UGX' | 'TZS' | 'RWF' | 'BIF';
  location?: string;
  isActive: boolean;
  
  // Financial summary
  revenue: number;
  expenses: number;
  profit: number;
  
  createdAt: string;
}

interface BranchSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBranchChange: (branchId: string) => void;
  currentBranchId: string;
}
```

### Integration Points
- ✅ Dashboard (switch branch context)
- ✅ Multi-branch service
- ✅ Ledger consolidation
- ✅ License gating (enterprise tier only)

---

## 2️⃣ LICENSE ACTIVATION MODAL

### Purpose
Activate and validate license keys for module access.

### Features
- ✅ License key input
- ✅ Server-side validation
- ✅ Offline validation (cached)
- ✅ Enable/disable modules based on license
- ✅ Expiry warnings
- ✅ Upgrade prompts

### UI Specification
```
┌─────────────────────────────────────────┐
│  Activate License                   [X] │
├─────────────────────────────────────────┤
│                                         │
│  Enter License Key:                     │
│  ┌─────────────────────────────────┐   │
│  │ XXXX-XXXX-XXXX-XXXX             │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Activate License]                     │
│                                         │
│  ────────────────────────────────────  │
│                                         │
│  Current License:                       │
│  Tier: Professional                     │
│  Modules: Accounting, Invoicing, Tax    │
│  Users: 25                              │
│  Expires: Dec 31, 2026                  │
│                                         │
│  ⚠️ Warning: License expires in 30 days │
│                                         │
│  [Upgrade License]    [Renew]           │
└─────────────────────────────────────────┘
```

### Data Schema
```typescript
interface License {
  key: string;
  tier: 'starter' | 'professional' | 'enterprise';
  modules: string[];
  userLimit: number | 'unlimited';
  deployment: 'cloud' | 'private' | 'onprem';
  expires: string;
  features: {
    offlineMode: boolean;
    apiAccess: boolean;
    multiCurrency: boolean;
    advancedReporting: boolean;
  };
}

interface LicenseActivationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onActivated: (license: License) => void;
}
```

### Validation Flow
```
1. User enters license key
   ↓
2. Validate format (XXXX-XXXX-XXXX-XXXX)
   ↓
3. Send to backend API
   ↓
4. Backend validates with license server
   ↓
5. If valid → Enable modules
   If invalid → Show error
   If offline → Use cached license
   ↓
6. Save to localStorage
   ↓
7. Update License Context
   ↓
8. Refresh UI (enable/disable buttons)
```

### Integration Points
- ✅ License Context
- ✅ Quick Actions (enable/disable)
- ✅ Module access control
- ✅ Offline validation

---

## 3️⃣ TAX SYNC QUEUE MODAL

### Purpose
Monitor and retry tax authority submissions.

### Features
- ✅ Show pending/synced/failed items
- ✅ Retry failed syncs
- ✅ Filter by entity type
- ✅ Show sync details
- ✅ Manual sync trigger

### UI Specification
```
┌─────────────────────────────────────────────────────────┐
│  Tax Authority Sync Queue                           [X] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Filter: [All] [Pending] [Synced] [Failed]             │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Entity      Authority  Status   Retries  Action   │ │
│  ├───────────────────────────────────────────────────┤ │
│  │ INV-001     TIMS       ✓ Synced  0       View     │ │
│  │ INV-002     EFRIS      🟡 Pending 0       -       │ │
│  │ TX-123      TIMS       ❌ Failed  3       Retry   │ │
│  │ INV-003     VFD        ✓ Synced  0       View     │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  Summary:                                               │
│  • Pending: 5                                           │
│  • Synced: 143                                          │
│  • Failed: 2                                            │
│                                                         │
│  [Retry All Failed]  [Manual Sync]  [Clear Synced]     │
└─────────────────────────────────────────────────────────┘
```

### Data Schema
```typescript
interface TaxSyncQueueItem {
  id: string;
  entityType: 'invoice' | 'transaction' | 'payment';
  entityId: string;
  authority: 'TIMS' | 'EFRIS' | 'VFD' | 'EBM' | 'Generic';
  status: 'pending' | 'synced' | 'failed';
  retries: number;
  lastAttempt?: string;
  errorMessage?: string;
  createdAt: string;
  syncedAt?: string;
}

interface TaxSyncQueueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
```

### Integration Points
- ✅ Tax Sync Service
- ✅ Invoice/Transaction entities
- ✅ Audit logging
- ✅ Retry mechanism

---

## 4️⃣ AUDIT LOG MODAL

### Purpose
Display complete audit trail for compliance.

### Features
- ✅ Filter by entity type, user, date
- ✅ Show before/after states
- ✅ Pagination
- ✅ Export to JSON/CSV
- ✅ Search functionality

### UI Specification
```
┌─────────────────────────────────────────────────────────┐
│  Audit Log                                          [X] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Filters:                                               │
│  Entity: [All ▼]  User: [All ▼]  Date: [Last 7 days ▼] │
│  Search: [________________________]                     │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Time        User    Action   Entity      Details  │ │
│  ├───────────────────────────────────────────────────┤ │
│  │ 2:30 PM     john    create   INV-001     View →   │ │
│  │ 2:25 PM     sarah   post     TX-123      View →   │ │
│  │ 2:20 PM     john    update   INV-001     View →   │ │
│  │ 2:15 PM     admin   reverse  INV-002     View →   │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  Showing 1-10 of 523 entries                            │
│  [← Prev]  Page 1 of 53  [Next →]                      │
│                                                         │
│  [Export JSON]  [Export CSV]  [Generate Report]        │
└─────────────────────────────────────────────────────────┘
```

### Data Schema
```typescript
interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: 'create' | 'update' | 'post' | 'reverse' | 'void' | 'delete';
  entityType: 'invoice' | 'transaction' | 'ledger' | 'payment';
  entityId: string;
  before?: any;
  after?: any;
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    reason?: string;
  };
}

interface AuditLogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters?: {
    entityType?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  };
}
```

### Integration Points
- ✅ Audit Service
- ✅ All entities (invoices, transactions, etc.)
- ✅ Export functionality
- ✅ Compliance reporting

---

## 5️⃣ ELECTRON INSTALLER MODAL

### Purpose
Multi-step installation wizard for desktop app.

### Features
- ✅ 7-step wizard
- ✅ Deployment type selection
- ✅ Module selection (license-gated)
- ✅ Country configuration
- ✅ Database setup
- ✅ Progress tracking
- ✅ Docker Compose generation

### UI Specification
```
Step 1: Welcome
┌─────────────────────────────────────────┐
│  EA Accounting Platform Setup           │
├─────────────────────────────────────────┤
│                                         │
│  Welcome to EA Accounting Platform!     │
│                                         │
│  This wizard will guide you through:    │
│  • Deployment type selection            │
│  • Module configuration                 │
│  • Country setup                        │
│  • Database initialization              │
│                                         │
│  [Cancel]                    [Next →]   │
└─────────────────────────────────────────┘

Step 2: Deployment Type
┌─────────────────────────────────────────┐
│  Select Deployment Type        (2/7)    │
├─────────────────────────────────────────┤
│                                         │
│  ○ Cloud (SaaS)                         │
│    Hosted by us, automatic updates      │
│                                         │
│  ● Private Cloud                        │
│    Your cloud, dedicated resources      │
│                                         │
│  ○ On-Premise                           │
│    Your servers, full control           │
│                                         │
│  [← Back]                    [Next →]   │
└─────────────────────────────────────────┘

Step 3: License & Modules
┌─────────────────────────────────────────┐
│  Activate License              (3/7)    │
├─────────────────────────────────────────┤
│                                         │
│  License Key:                           │
│  [XXXX-XXXX-XXXX-XXXX]                  │
│                                         │
│  Available Modules:                     │
│  ☑ Accounting                           │
│  ☑ Invoicing                            │
│  ☑ Tax Compliance                       │
│  ☐ Payroll (Professional+)    🔒        │
│  ☐ Inventory (Professional+)  🔒        │
│  ☐ Multi-Branch (Enterprise)  🔒        │
│                                         │
│  [← Back]                    [Next →]   │
└─────────────────────────────────────────┘

Step 4: Country Configuration
┌─────────────────────────────────────────┐
│  Select Primary Country        (4/7)    │
├─────────────────────────────────────────┤
│                                         │
│  ● 🇰🇪 Kenya (TIMS, KRA)                │
│  ○ 🇺🇬 Uganda (EFRIS, URA)              │
│  ○ 🇹🇿 Tanzania (VFD, TRA)              │
│  ○ 🇷🇼 Rwanda (EBM, RRA)                │
│  ○ 🇧🇮 Burundi (OBR)                    │
│                                         │
│  This will configure:                   │
│  • VAT rate (16% for Kenya)             │
│  • Chart of accounts                    │
│  • Tax compliance system                │
│                                         │
│  [← Back]                    [Next →]   │
└─────────────────────────────────────────┘

Step 5: Database Setup
┌─────────────────────────────────────────┐
│  Database Configuration        (5/7)    │
├─────────────────────────────────────────┤
│                                         │
│  Database Type:                         │
│  ● PostgreSQL (Recommended)             │
│  ○ SQLite (On-premise only)             │
│                                         │
│  Connection String:                     │
│  [postgresql://localhost:5432/ea_acc]   │
│                                         │
│  [Test Connection]  ✓ Connected         │
│                                         │
│  [← Back]                    [Next →]   │
└─────────────────────────────────────────┘

Step 6: Summary
┌─────────────────────────────────────────┐
│  Configuration Summary         (6/7)    │
├─────────────────────────────────────────┤
│                                         │
│  Deployment: Private Cloud              │
│  License: Professional                  │
│  Modules: Accounting, Invoicing, Tax    │
│  Country: Kenya (TIMS)                  │
│  Database: PostgreSQL                   │
│                                         │
│  Ready to install!                      │
│                                         │
│  [← Back]                   [Install]   │
└─────────────────────────────────────────┘

Step 7: Installing
┌─────────────────────────────────────────┐
│  Installing...                 (7/7)    │
├─────────────────────────────────────────┤
│                                         │
│  ✓ Database initialized                 │
│  ✓ Chart of accounts seeded             │
│  ✓ Modules installed                    │
│  ⏳ Generating Docker Compose...        │
│  ⏳ Starting services...                │
│                                         │
│  [████████████░░░░] 75%                 │
│                                         │
│                        [Cancel]         │
└─────────────────────────────────────────┘

Step 8: Complete
┌─────────────────────────────────────────┐
│  Installation Complete!        (8/7)    │
├─────────────────────────────────────────┤
│                                         │
│  ✓ EA Accounting Platform is ready!    │
│                                         │
│  Access your app at:                    │
│  http://localhost:3000                  │
│                                         │
│  Default admin credentials:             │
│  Email: admin@example.com               │
│  Password: [shown here]                 │
│                                         │
│  [View Logs]            [Launch App →]  │
└─────────────────────────────────────────┘
```

### Data Schema
```typescript
interface InstallerConfig {
  deploymentType: 'cloud' | 'private' | 'onprem';
  licenseKey: string;
  modules: string[];
  country: 'KE' | 'TZ' | 'UG' | 'RW' | 'BI';
  database: {
    type: 'postgresql' | 'sqlite';
    connectionString: string;
  };
}

interface ElectronInstallerProps {
  onComplete: (config: InstallerConfig) => void;
  onCancel: () => void;
}
```

### Integration Points
- ✅ Electron main process
- ✅ License validation
- ✅ Database initialization
- ✅ Docker Compose generation
- ✅ Module installation

---

## ✅ IMPLEMENTATION PRIORITY

### Phase 1 (High Priority)
1. **LicenseActivationModal** - Needed for module gating
2. **BranchSelectorModal** - Needed for multi-branch feature

### Phase 2 (Medium Priority)
3. **TaxSyncQueueModal** - Needed for compliance monitoring
4. **AuditLogModal** - Needed for compliance reporting

### Phase 3 (Low Priority)
5. **ElectronInstallerModal** - Needed for desktop deployment

---

## 📞 NEXT STEPS

1. **Generate with Cursor AI** - Use prompts from CURSOR_PROMPTS_MODALS.md
2. **Integrate with Services** - Connect to existing services (ledger, audit, tax sync)
3. **Test End-to-End** - Follow workflow testing plan
4. **Deploy** - Ship to production!

**Ready to generate!** 🚀
