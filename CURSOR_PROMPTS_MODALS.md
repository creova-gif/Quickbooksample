# 🤖 CURSOR AI PROMPTS - MODAL GENERATION

**Copy-paste these prompts into Cursor AI to generate each modal.**

---

## 1️⃣ BRANCH SELECTOR MODAL

### Cursor Prompt
```
You are a senior React + TypeScript engineer building a multi-branch accounting platform.

Generate a BranchSelectorModal component with:

REQUIREMENTS:
1. UI Components:
   - Modal dialog (use shadcn/ui Dialog)
   - Branch selection dropdown (current branch)
   - Multi-select checkboxes (consolidation view)
   - Financial summary table per branch
   - Total consolidated row
   - "Switch Branch" and "View Consolidated" buttons

2. Data Schema:
   interface Branch {
     id: string;
     name: string;
     businessId: string;
     country: 'KE' | 'TZ' | 'UG' | 'RW' | 'BI';
     currency: 'KES' | 'UGX' | 'TZS' | 'RWF' | 'BIF';
     location?: string;
     revenue: number;
     expenses: number;
     profit: number;
     isActive: boolean;
   }

3. Features:
   - Load branches from API or localStorage
   - Calculate consolidated totals
   - Switch branch context (updates dashboard)
   - Multi-currency display
   - License gating (enterprise tier only)
   - Offline support

4. Integration:
   - Use useBusiness() context to get current branch
   - Call API: GET /api/v1/branches
   - Save selected branch to localStorage
   - Emit onBranchChange event

5. Styling:
   - Use Tailwind CSS
   - Responsive (mobile-friendly)
   - Professional table layout
   - Color-coded profit/loss

Deliver:
- /src/app/components/branches/BranchSelectorModal.tsx
- Include TypeScript types
- Add license check: useLicense().hasModule('multibranch')
- Add loading and error states
```

---

## 2️⃣ LICENSE ACTIVATION MODAL

### Cursor Prompt
```
You are a senior React + TypeScript engineer building a license-gated SaaS platform.

Generate a LicenseActivationModal component with:

REQUIREMENTS:
1. UI Components:
   - Modal dialog (shadcn/ui Dialog)
   - License key input field (format: XXXX-XXXX-XXXX-XXXX)
   - "Activate License" button
   - Current license display (tier, modules, expiry)
   - Expiry warning (if < 30 days)
   - "Upgrade" and "Renew" buttons

2. Data Schema:
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

3. Validation Flow:
   - Validate key format (XXXX-XXXX-XXXX-XXXX)
   - Send to API: POST /api/v1/license/activate
   - On success: Update License Context, save to localStorage
   - On error: Show error message
   - Offline: Use cached license if available

4. Features:
   - Real-time validation
   - Server-side + offline validation
   - Auto-enable/disable modules
   - Expiry countdown
   - Upgrade prompts

5. Integration:
   - Use LicenseContext (from /src/contexts/LicenseContext.tsx)
   - Call license API
   - Update Quick Action buttons on activation
   - Save to localStorage for offline

6. Styling:
   - Use Tailwind CSS
   - Professional license card layout
   - Warning badges for expiry
   - Success/error states

Deliver:
- /src/app/components/license/LicenseActivationModal.tsx
- Include license key formatter (auto-add dashes)
- Add expiry date calculator
- Add upgrade button link
```

---

## 3️⃣ TAX SYNC QUEUE MODAL

### Cursor Prompt
```
You are a senior React + TypeScript engineer building a tax compliance platform for East Africa.

Generate a TaxSyncQueueModal component with:

REQUIREMENTS:
1. UI Components:
   - Modal dialog (shadcn/ui Dialog)
   - Filter tabs (All, Pending, Synced, Failed)
   - Data table with columns:
     * Entity ID
     * Entity Type (Invoice/Transaction)
     * Authority (TIMS/EFRIS/VFD/EBM)
     * Status (badge: pending/synced/failed)
     * Retries (number)
     * Last Attempt (timestamp)
     * Action button (Retry/View)
   - Summary stats (pending count, synced count, failed count)
   - Action buttons: "Retry All Failed", "Manual Sync", "Clear Synced"

2. Data Schema:
   interface TaxSyncQueueItem {
     id: string;
     entityType: 'invoice' | 'transaction' | 'payment';
     entityId: string;
     authority: 'TIMS' | 'EFRIS' | 'VFD' | 'EBM';
     status: 'pending' | 'synced' | 'failed';
     retries: number;
     lastAttempt?: string;
     errorMessage?: string;
     createdAt: string;
     syncedAt?: string;
   }

3. Features:
   - Load queue from tax sync service
   - Filter by status
   - Retry individual failed items
   - Retry all failed items
   - Manual sync trigger
   - Real-time status updates
   - Color-coded status badges

4. Integration:
   - Use getTaxSyncQueue() from /src/services/taxsync.service.ts
   - Use retryFailedItem() for retry
   - Use processSyncQueue() for manual sync
   - Auto-refresh every 10 seconds

5. Styling:
   - Use Tailwind CSS
   - Professional table layout
   - Status badges (green/yellow/red)
   - Loading states

Deliver:
- /src/app/components/admin/TaxSyncQueueModal.tsx
- Include retry mechanism
- Add real-time updates (polling or websocket)
- Add export to CSV functionality
```

---

## 4️⃣ AUDIT LOG MODAL

### Cursor Prompt
```
You are a senior React + TypeScript engineer building a compliance-ready accounting platform.

Generate an AuditLogModal component with:

REQUIREMENTS:
1. UI Components:
   - Modal dialog (shadcn/ui Dialog)
   - Filter controls:
     * Entity type dropdown (Invoice, Transaction, Ledger, Payment, All)
     * User dropdown (load from API)
     * Date range picker
     * Search input
   - Data table with columns:
     * Timestamp
     * User
     * Action (badge: create/update/post/reverse/void)
     * Entity Type
     * Entity ID
     * Details button (→)
   - Pagination (10 per page)
   - Export buttons (JSON, CSV)

2. Data Schema:
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

3. Features:
   - Load audit logs from service
   - Filter by entity type, user, date range
   - Search by entity ID
   - Pagination (client-side or server-side)
   - View details (before/after diff)
   - Export to JSON/CSV
   - Real-time updates (new entries appear)

4. Integration:
   - Use getAuditLogs() from /src/services/audit.service.ts
   - Use exportAuditLogs() for export
   - Load users from API
   - Save filter preferences to localStorage

5. Details View:
   - Show before/after JSON diff
   - Highlight changes
   - Show metadata (IP, user agent)

6. Styling:
   - Use Tailwind CSS
   - Professional table layout
   - Action badges (color-coded)
   - Diff view (red/green highlights)

Deliver:
- /src/app/components/admin/AuditLogModal.tsx
- /src/app/components/admin/AuditLogDetails.tsx (details view)
- Include pagination logic
- Add JSON diff viewer
- Add CSV export function
```

---

## 5️⃣ ELECTRON INSTALLER MODAL

### Cursor Prompt
```
You are a senior Electron + React engineer building a desktop installer wizard.

Generate an ElectronInstallerModal component with:

REQUIREMENTS:
1. Multi-Step Wizard (7 steps):
   Step 1: Welcome & License Agreement
   Step 2: Deployment Type Selection (Cloud/Private/On-Prem)
   Step 3: License Activation & Module Selection
   Step 4: Country Configuration (VAT engine)
   Step 5: Database Setup (PostgreSQL/SQLite)
   Step 6: Configuration Summary
   Step 7: Installation Progress
   Step 8: Complete & Launch

2. Data Schema:
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

3. Step Components:
   - WelcomeStep: Logo, welcome text, license agreement checkbox
   - DeploymentStep: Radio buttons for cloud/private/onprem
   - LicenseStep: License key input, module checkboxes (gated)
   - CountryStep: Country selection (flags, VAT rates)
   - DatabaseStep: DB type, connection string, test button
   - SummaryStep: Review all selections
   - ProgressStep: Progress bar, status messages
   - CompleteStep: Success message, launch button

4. Features:
   - Step validation (can't proceed if invalid)
   - Back/Next navigation
   - Progress indicator (step X of 7)
   - License validation (API call)
   - Database connection test
   - Docker Compose file generation (on-prem)
   - Installation progress tracking
   - Error handling (retry/cancel)

5. Installation Tasks:
   - Initialize database (run migrations)
   - Seed chart of accounts (country-specific)
   - Install modules (based on license)
   - Generate docker-compose.yml (if on-prem)
   - Start services
   - Create admin user

6. Integration:
   - Electron IPC for file system access
   - License API validation
   - Database initialization
   - Docker command execution (on-prem)

7. Styling:
   - Use Tailwind CSS
   - Wizard-style layout
   - Progress bar
   - Professional step transitions

Deliver:
- /electron/installer/ElectronInstallerWizard.tsx
- /electron/installer/steps/WelcomeStep.tsx
- /electron/installer/steps/DeploymentStep.tsx
- /electron/installer/steps/LicenseStep.tsx
- /electron/installer/steps/CountryStep.tsx
- /electron/installer/steps/DatabaseStep.tsx
- /electron/installer/steps/SummaryStep.tsx
- /electron/installer/steps/ProgressStep.tsx
- /electron/installer/steps/CompleteStep.tsx
- /electron/services/installer.service.ts (installation logic)
- /electron/templates/docker-compose.yml (template)
```

---

## 🚀 USAGE INSTRUCTIONS

### For Each Modal:
1. **Copy the prompt** above
2. **Paste into Cursor AI**
3. **Wait 2-5 minutes** for generation
4. **Review generated code**
5. **Integrate** into project
6. **Test** functionality

### Example Workflow:
```bash
# 1. Generate BranchSelectorModal
# Copy prompt → Paste in Cursor → Wait

# 2. Cursor generates:
# - /src/app/components/branches/BranchSelectorModal.tsx
# - Complete with types, API integration, styling

# 3. Import and use:
import { BranchSelectorModal } from '@/app/components/branches/BranchSelectorModal';

function Dashboard() {
  const [showBranchSelector, setShowBranchSelector] = useState(false);
  
  return (
    <>
      <Button onClick={() => setShowBranchSelector(true)}>
        Select Branch
      </Button>
      
      <BranchSelectorModal
        open={showBranchSelector}
        onOpenChange={setShowBranchSelector}
        onBranchChange={(branchId) => {
          // Update dashboard context
        }}
      />
    </>
  );
}
```

---

## ✅ GENERATION CHECKLIST

After generating each modal:

**BranchSelectorModal:**
- [ ] Loads branches from API
- [ ] Shows financial summary
- [ ] Switches branch context
- [ ] License gating works
- [ ] Offline support

**LicenseActivationModal:**
- [ ] Validates license key
- [ ] Updates License Context
- [ ] Enables/disables modules
- [ ] Shows expiry warning
- [ ] Offline validation

**TaxSyncQueueModal:**
- [ ] Loads queue items
- [ ] Filters by status
- [ ] Retries failed items
- [ ] Shows real-time updates
- [ ] Export works

**AuditLogModal:**
- [ ] Loads audit logs
- [ ] Filters work
- [ ] Pagination works
- [ ] Details view shows diff
- [ ] Export works

**ElectronInstallerModal:**
- [ ] All 8 steps work
- [ ] Validation prevents invalid proceed
- [ ] Database test works
- [ ] Installation executes
- [ ] Docker Compose generated

---

## 📞 SUPPORT

**Files:**
- Specs: `/REMAINING_MODALS_SPEC.md`
- Prompts: `/CURSOR_PROMPTS_MODALS.md` (this file)
- Testing: `/END_TO_END_TESTING.md`

**Estimated Time:**
- Per modal: 5-10 minutes (with Cursor AI)
- All 5 modals: 30-50 minutes
- Manual coding: 2-3 weeks!

**Ready to generate!** 🚀
