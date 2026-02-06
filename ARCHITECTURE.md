# 🏗️ Modal Forms Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Invoice    │  │   Payroll    │  │  Inventory   │         │
│  │     Modal    │  │    Modal     │  │    Modal     │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                  │                  │                 │
│         └──────────────────┴──────────────────┘                 │
│                            │                                    │
└────────────────────────────┼────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BUSINESS CONTEXT LAYER                       │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  BusinessContext (React Context + Hooks)                │   │
│  │  • Current Business State                               │   │
│  │  • Transactions, Invoices, Customers                    │   │
│  │  • CRUD Operations                                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            │                                    │
└────────────────────────────┼────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                              │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Ledger     │  │    Audit     │  │   Tax Sync   │         │
│  │   Service    │  │   Service    │  │   Service    │         │
│  │              │  │              │  │              │         │
│  │ • Double-    │  │ • Log all    │  │ • Queue for  │         │
│  │   entry      │  │   actions    │  │   authority  │         │
│  │ • Validate   │  │ • Track who  │  │ • Retry      │         │
│  │ • Balance    │  │   & when     │  │   failed     │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                  │                  │                 │
│         └──────────────────┴──────────────────┘                 │
│                            │                                    │
└────────────────────────────┼────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   PERSISTENCE LAYER                             │
│                                                                 │
│  ┌───────────────────────────────────────────────────────┐     │
│  │               localStorage                             │     │
│  │  • ledger_entries                                     │     │
│  │  • audit_logs                                         │     │
│  │  • tax_sync_queue                                     │     │
│  │  • current_business                                   │     │
│  │  • transactions                                       │     │
│  │  • invoices                                           │     │
│  └───────────────────────────────────────────────────────┘     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow - Invoice Creation

```
USER ACTION
    ↓
┌─────────────────────┐
│ 1. User fills form  │
│    - Customer info  │
│    - Line items     │
│    - Dates          │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ 2. Form validation  │
│    - Required       │
│    - Formats        │
│    - Business rules │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ 3. Calculate        │
│    - Subtotal       │
│    - VAT (16%)      │
│    - Total          │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ 4. Create Invoice   │
│    - Generate ID    │
│    - Generate #     │
│    - Set status     │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ 5. Post to Ledger   │
│    DR: AR (11,600)  │
│    CR: Rev (10,000) │
│    CR: VAT (1,600)  │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ 6. Validate Entry   │
│    Debits = Credits │
│    11,600 = 11,600 ✓│
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ 7. Save to Storage  │
│    - ledger_entries │
│    - invoices       │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ 8. Log Audit        │
│    - Who: user-123  │
│    - What: create   │
│    - When: now      │
│    - Data: invoice  │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ 9. Queue Tax Sync   │
│    - Authority:TIMS │
│    - Status:pending │
│    - Payload: {...} │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ 10. Update Context  │
│     Add to invoices │
│     list            │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ 11. Show Success    │
│     Toast + Close   │
└─────────────────────┘
```

---

## Component Structure

```
InvoiceFormModal
├── DialogContent
│   ├── DialogHeader
│   │   ├── Title
│   │   └── Description
│   ├── Form
│   │   ├── Customer Section
│   │   │   ├── Name Input
│   │   │   ├── Email Input
│   │   │   ├── Phone Input
│   │   │   └── Tax ID Input
│   │   ├── Dates Section
│   │   │   ├── Issue Date
│   │   │   └── Due Date
│   │   ├── Items Section
│   │   │   ├── Item 1
│   │   │   │   ├── Description
│   │   │   │   ├── Quantity
│   │   │   │   ├── Unit Price
│   │   │   │   └── Line Total
│   │   │   ├── Item 2...
│   │   │   └── Add Item Button
│   │   ├── Totals Section
│   │   │   ├── Subtotal
│   │   │   ├── VAT
│   │   │   └── Total
│   │   └── Notes Section
│   └── DialogFooter
│       ├── Cancel Button
│       └── Submit Button
└── Handlers
    ├── handleItemChange()
    ├── handleAddItem()
    ├── handleRemoveItem()
    └── handleSubmit()
```

---

## State Management

```typescript
// Local State (Form)
┌─────────────────────────┐
│ InvoiceFormModal State  │
├─────────────────────────┤
│ customerName: string    │
│ customerEmail: string   │
│ items: InvoiceItem[]    │
│ issueDate: string       │
│ dueDate: string         │
│ notes: string           │
│ isSubmitting: boolean   │
└─────────────────────────┘
         │
         ↓
// Global State (Context)
┌─────────────────────────┐
│ BusinessContext State   │
├─────────────────────────┤
│ business: Business      │
│ invoices: Invoice[]     │
│ transactions: Tx[]      │
│ customers: Customer[]   │
│ categories: Category[]  │
└─────────────────────────┘
         │
         ↓
// Persistent State (Storage)
┌─────────────────────────┐
│ localStorage            │
├─────────────────────────┤
│ current_business        │
│ business_123_invoices   │
│ ledger_entries          │
│ audit_logs              │
│ tax_sync_queue          │
└─────────────────────────┘
```

---

## Double-Entry Ledger Flow

```
Invoice Example: KSh 10,000 + 16% VAT = KSh 11,600

┌──────────────────────────────────────────────────────────┐
│                  BALANCE SHEET                           │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ASSETS                    │  LIABILITIES & EQUITY      │
│  ─────────────────────────┼────────────────────────────│
│                            │                            │
│  Accounts Receivable       │  VAT Payable              │
│  DR +11,600 ◄──────────────┼──────────────► CR +1,600  │
│  (Customer owes us)        │  (We owe tax authority)   │
│                            │                            │
│                            │  EQUITY                    │
│                            │  ────────────              │
│                            │  Revenue                   │
│                            │  CR +10,000                │
│                            │  (Income earned)           │
│                            │                            │
└──────────────────────────────────────────────────────────┘

Accounting Equation: Assets = Liabilities + Equity
                     11,600 = 1,600 + 10,000 ✓
```

---

## Tax Sync Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     INVOICE CREATED                     │
└────────────────────────┬────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────┐
│              ADD TO TAX SYNC QUEUE                      │
│  {                                                      │
│    entityType: 'invoice',                              │
│    entityId: 'inv-123',                                │
│    authority: 'TIMS' | 'EFRIS' | 'VFD' | 'EBM',       │
│    status: 'pending',                                  │
│    payload: {...}                                      │
│  }                                                      │
└────────────────────────┬────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────┐
│                    SYNC WORKER                          │
│  • Runs every 10 minutes                               │
│  • Runs on network reconnect                           │
│  • Processes pending items                             │
└────────────────────────┬────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────┐
│              POST TO TAX AUTHORITY                      │
│  POST /api/v1/tax-sync/tims                            │
│  Body: {invoice data in authority format}              │
└────────────────┬────────────────────┬───────────────────┘
                 │                    │
         SUCCESS │                    │ FAILURE
                 ↓                    ↓
     ┌─────────────────┐  ┌─────────────────────┐
     │ Mark as synced  │  │ Increment retries   │
     │ Save compliance │  │ Log error           │
     │ data (QR, ID)   │  │ Retry later         │
     └─────────────────┘  │ (max 5 attempts)    │
                          └─────────────────────┘
```

---

## Audit Trail Structure

```
Every action creates an audit log:

┌─────────────────────────────────────────────────────────┐
│                      AUDIT LOG                          │
├─────────────────────────────────────────────────────────┤
│ id: "audit-123"                                         │
│ entityType: "invoice"                                   │
│ entityId: "inv-456"                                     │
│ action: "create"                                        │
│ performedBy: "user-789"                                 │
│ performedAt: "2024-01-15T10:30:00Z"                     │
│                                                         │
│ before: null                                            │
│                                                         │
│ after: {                                                │
│   invoiceNumber: "INV-001",                            │
│   customerName: "Acme Corp",                           │
│   totalAmount: 11600,                                  │
│   ...                                                  │
│ }                                                       │
│                                                         │
│ metadata: {                                             │
│   userAgent: "Mozilla/5.0...",                         │
│   ipAddress: "192.168.1.1",                            │
│   reason: "Invoice created"                            │
│ }                                                       │
└─────────────────────────────────────────────────────────┘

This allows:
✓ Complete history
✓ Who did what when
✓ Compliance audits
✓ Fraud detection
✓ Regulatory reporting
```

---

## Error Handling Flow

```
┌─────────────┐
│ User Action │
└──────┬──────┘
       │
       ↓
┌─────────────────┐
│ Validate Input  │
└──────┬──────────┘
       │
   [FAIL]─────────► Show validation error toast
       │            Stay on form
   [PASS]
       │
       ↓
┌─────────────────┐
│ Try Submit      │
└──────┬──────────┘
       │
   try {
       │
       ↓
┌─────────────────┐
│ Post to Ledger  │
└──────┬──────────┘
       │
   [ERROR]────────► Catch error
       │            Log to console
       │            Show error toast
       │            Stay on form
       │            Don't close modal
   [SUCCESS]
       │
       ↓
┌─────────────────┐
│ Save to Storage │
└──────┬──────────┘
       │
       ↓
┌─────────────────┐
│ Show Success    │
│ Reset Form      │
│ Close Modal     │
└─────────────────┘
   }
   catch (error) {
       toast.error(error.message)
   }
   finally {
       setIsSubmitting(false)
   }
```

---

## Offline Mode Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      ONLINE MODE                        │
│                                                         │
│  User Action → Validate → Save to localStorage →       │
│  → Post to Ledger → Audit Log → Tax Sync Queue         │
│                                                         │
└─────────────────────────────────────────────────────────┘

                            │
                    NETWORK DISCONNECTS
                            │
                            ↓

┌─────────────────────────────────────────────────────────┐
│                     OFFLINE MODE                        │
│                                                         │
│  User Action → Validate → Save to localStorage ONLY    │
│  → Add to Offline Queue → Show "Will sync later"       │
│                                                         │
│  Background: Queue items wait for reconnection         │
│                                                         │
└─────────────────────────────────────────────────────────┘

                            │
                    NETWORK RECONNECTS
                            │
                            ↓

┌─────────────────────────────────────────────────────────┐
│                  AUTO-SYNC PROCESS                      │
│                                                         │
│  1. Detect online status                               │
│  2. Get queued items from localStorage                 │
│  3. For each item:                                     │
│     a. Try to sync to backend                          │
│     b. On success: remove from queue                   │
│     c. On failure: increment retry count              │
│  4. Show sync status to user                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Performance Optimizations

```typescript
// 1. Memoize expensive calculations
const subtotal = useMemo(() => 
  items.reduce((sum, item) => sum + item.lineTotal, 0),
  [items]
);

// 2. Debounce input handlers
const debouncedCalc = debounce((value) => {
  calculateTotal(value);
}, 300);

// 3. Lazy load modals
const InvoiceModal = lazy(() => 
  import('./modals/InvoiceFormModal')
);

// 4. Use React.memo for list items
const InvoiceItem = React.memo(({ item, onChange }) => {
  // Component logic
});

// 5. Batch state updates
setInvoice(prev => ({
  ...prev,
  subtotal,
  vatAmount,
  totalAmount
}));
```

---

## Security Considerations

```
┌─────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Input Validation                                   │
│     ✓ Sanitize user input                             │
│     ✓ Validate data types                             │
│     ✓ Check business rules                            │
│                                                         │
│  2. Audit Trail                                        │
│     ✓ Log all actions                                 │
│     ✓ Track user identity                             │
│     ✓ Immutable logs                                  │
│                                                         │
│  3. Ledger Integrity                                   │
│     ✓ Double-entry validation                         │
│     ✓ Immutable entries                               │
│     ✓ Reversal-only corrections                       │
│                                                         │
│  4. localStorage Encryption (future)                   │
│     ⚠ Currently plain text                            │
│     📝 Encrypt sensitive data before storage           │
│                                                         │
│  5. API Authentication (future)                        │
│     ⚠ Currently mock                                  │
│     📝 Add JWT tokens for production                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Scalability Path

```
Current: localStorage
    │
    ↓ Phase 1
Backend API + PostgreSQL
    │
    ↓ Phase 2
Microservices Architecture
    ├── Invoice Service
    ├── Ledger Service
    ├── Audit Service
    └── Tax Sync Service
    │
    ↓ Phase 3
Event-Driven Architecture
    ├── Event Bus (Kafka/RabbitMQ)
    ├── Event Sourcing
    └── CQRS Pattern
    │
    ↓ Phase 4
Multi-Region Deployment
    ├── Kenya Cluster
    ├── Uganda Cluster
    ├── Tanzania Cluster
    └── Global Load Balancer
```

---

**This architecture supports:**
- ✅ Offline-first operation
- ✅ Double-entry accounting
- ✅ Complete audit trails
- ✅ Tax authority compliance
- ✅ Data integrity
- ✅ User-friendly interface
- ✅ Easy maintenance
- ✅ Future scalability
