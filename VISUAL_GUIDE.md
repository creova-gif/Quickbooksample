# 📸 Visual Integration Guide

## What You'll See on Your Dashboard

---

## 🏠 Dashboard View

```
┌─────────────────────────────────────────────────────────────────┐
│  🇰🇪 My Business Name                            [🟢 Synced]   │
│  Friday, January 16, 2026                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │ Money In    │  │ Money Out   │  │ Profit      │            │
│  │ KSh 50,000  │  │ KSh 30,000  │  │ KSh 20,000  │            │
│  │ ↗ +12%      │  │ ↘ -5%       │  │ 💰 40% margin│            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│                                                                 │
│  ┌──────────────── 7-Day Trend ─────────────────┐              │
│  │        [Income/Expense Line Chart]           │              │
│  └──────────────────────────────────────────────┘              │
│                                                                 │
│  ┌──────────── QUICK ACTIONS ─────────────┐                    │
│  │                                          │                    │
│  │  [↗ Record Sale]  [↘ Add Expense]      │ ← Original        │
│  │                                          │                    │
│  │  [📄 New Invoice]  [👥 Payroll]        │ ← NEW!            │
│  │                                          │                    │
│  │  [📦 Inventory]                         │ ← NEW!            │
│  │                                          │                    │
│  └──────────────────────────────────────────┘                    │
│                                                                 │
│  Recent Activity...                                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📄 Invoice Modal (Clicking "New Invoice")

```
╔═══════════════════════════════════════════════════════════╗
║  📄 Create Invoice                                     [X]║
║  ─────────────────────────────────────────────────────────║
║  Issue a new invoice with automatic VAT calculation      ║
║                                                            ║
║  Customer Information                                     ║
║  ┌──────────────────────┐  ┌─────────────────────────┐  ║
║  │ Customer Name *      │  │ Email                   │  ║
║  │ Acme Corporation     │  │ info@acme.com          │  ║
║  └──────────────────────┘  └─────────────────────────┘  ║
║  ┌──────────────────────┐  ┌─────────────────────────┐  ║
║  │ Phone                │  │ Tax ID / PIN            │  ║
║  │ +254712345678        │  │ P051234567Z            │  ║
║  └──────────────────────┘  └─────────────────────────┘  ║
║                                                            ║
║  ┌──────────────────────┐  ┌─────────────────────────┐  ║
║  │ Issue Date           │  │ Due Date                │  ║
║  │ 2026-01-16          │  │ 2026-02-15             │  ║
║  └──────────────────────┘  └─────────────────────────┘  ║
║                                                            ║
║  Items                                      [+ Add Item]  ║
║  ┌─────────────────┬──────┬──────────┬─────────┬────┐    ║
║  │ Description     │ Qty  │ Price    │ Total   │ 🗑  │    ║
║  ├─────────────────┼──────┼──────────┼─────────┼────┤    ║
║  │ Web Design      │  1   │ 10000.00 │10000.00 │ X  │    ║
║  │ Hosting         │  12  │   500.00 │ 6000.00 │ X  │    ║
║  └─────────────────┴──────┴──────────┴─────────┴────┘    ║
║                                                            ║
║  ┌─────────────────────────────────────────────────────┐  ║
║  │ Subtotal:                             16,000.00     │  ║
║  │ VAT (16%):                             2,560.00     │  ║
║  │ ──────────────────────────────────────────────────  │  ║
║  │ Total:                        KSh 18,560.00        │  ║
║  └─────────────────────────────────────────────────────┘  ║
║                                                            ║
║  Notes (Optional)                                         ║
║  ┌──────────────────────────────────────────────────────┐ ║
║  │ Payment due within 30 days                          │ ║
║  └──────────────────────────────────────────────────────┘ ║
║                                                            ║
║                           [Cancel]  [Create Invoice]     ║
╚═══════════════════════════════════════════════════════════╝
```

### What Happens When You Click "Create Invoice":
```
1. ⚡ Form validates (customer name required, items valid)
2. 📝 Creates invoice with unique number
3. 📊 Posts to ledger:
   - Debit:  Accounts Receivable  18,560.00
   - Credit: Sales Revenue        16,000.00
   - Credit: VAT Payable           2,560.00
4. 📋 Creates audit log entry
5. 🔄 Queues for TIMS/EFRIS sync
6. 💾 Saves to localStorage
7. ✅ Shows success toast
8. ❌ Closes modal
```

---

## 👥 Payroll Modal (Clicking "Payroll")

```
╔═══════════════════════════════════════════════════════════╗
║  👥 Process Payroll                                    [X]║
║  ─────────────────────────────────────────────────────────║
║  Calculate salary with automatic PAYE & deductions        ║
║                                                            ║
║  Employee Information                                     ║
║  ┌──────────────────────┐  ┌─────────────────────────┐  ║
║  │ Employee Name *      │  │ Employee ID             │  ║
║  │ John Doe             │  │ EMP001                  │  ║
║  └──────────────────────┘  └─────────────────────────┘  ║
║                                                            ║
║  Salary & Deductions                                      ║
║  ┌──────────────────────┐  ┌─────────────────────────┐  ║
║  │ Gross Salary *       │  │ Payment Date            │  ║
║  │ 50,000               │  │ 2026-01-31             │  ║
║  └──────────────────────┘  └─────────────────────────┘  ║
║                                                            ║
║  ┌──────────────────────┐  ┌─────────────────────────┐  ║
║  │ NHIF Contribution    │  │ NSSF Contribution       │  ║
║  │ 1,700                │  │ 2,160                   │  ║
║  └──────────────────────┘  └─────────────────────────┘  ║
║                                                            ║
║  ┌─────────────────────────────────────────────────────┐  ║
║  │ Other Deductions                                    │  ║
║  │ 0                                                   │  ║
║  └─────────────────────────────────────────────────────┘  ║
║                                                            ║
║  ┌───────────── Calculation Summary ─────────────────┐    ║
║  │                                                    │    ║
║  │  Gross Salary:                    KSh 50,000.00  │    ║
║  │  PAYE Tax:                       -KSh  9,400.00  │    ║
║  │  NHIF:                           -KSh  1,700.00  │    ║
║  │  NSSF:                           -KSh  2,160.00  │    ║
║  │  ────────────────────────────────────────────────  │    ║
║  │  Net Salary:                      KSh 36,740.00  │    ║
║  │                                                    │    ║
║  └────────────────────────────────────────────────────┘    ║
║                                                            ║
║                           [Cancel]  [Process Payroll]    ║
╚═══════════════════════════════════════════════════════════╝
```

### What Happens When You Click "Process Payroll":
```
1. ⚡ Validates employee & salary
2. 🧮 Calculates PAYE tax (Kenya rates)
3. 📊 Posts to ledger:
   - Debit:  Salary Expense       50,000.00
   - Credit: PAYE Tax Payable      9,400.00
   - Credit: NHIF Payable          1,700.00
   - Credit: NSSF Payable          2,160.00
   - Credit: Bank Account         36,740.00
4. 📋 Creates audit log
5. ✅ Success toast
6. ❌ Closes modal
```

---

## 📦 Inventory Modal (Clicking "Inventory")

```
╔═══════════════════════════════════════════════════════════╗
║  📦 Inventory Transaction                              [X]║
║  ─────────────────────────────────────────────────────────║
║  Record purchases, sales, or adjustments with ledger      ║
║                                                            ║
║  Transaction Type                                         ║
║  ┌────────────────────────────────────────────────────┐   ║
║  │  [↗ Purchase]  [↘ Sale]  [Adjustment]            │   ║
║  └────────────────────────────────────────────────────┘   ║
║                                                            ║
║  Item Information                                         ║
║  ┌──────────────────────┐  ┌─────────────────────────┐  ║
║  │ Item Name *          │  │ SKU / Item Code         │  ║
║  │ Office Supplies      │  │ OFF-001                 │  ║
║  └──────────────────────┘  └─────────────────────────┘  ║
║                                                            ║
║  Quantity & Cost                                          ║
║  ┌──────┐  ┌──────────┐  ┌───────────┐                  ║
║  │ Qty  │  │ Unit Cost│  │ Total Cost│                  ║
║  │  10  │  │  500.00  │  │  5,000.00 │                  ║
║  └──────┘  └──────────┘  └───────────┘                  ║
║                                                            ║
║  ┌─────────────────────────────────────────────────────┐  ║
║  │ Transaction Date                                    │  ║
║  │ 2026-01-16                                         │  ║
║  └─────────────────────────────────────────────────────┘  ║
║                                                            ║
║  Notes                                                    ║
║  ┌──────────────────────────────────────────────────────┐ ║
║  │ Restocking office supplies for Q1                   │ ║
║  └──────────────────────────────────────────────────────┘ ║
║                                                            ║
║  ┌───────────────────────────────────────────────────┐    ║
║  │ This will increase your inventory and decrease    │    ║
║  │ cash                                               │    ║
║  │                                 Total: KSh 5,000   │    ║
║  └───────────────────────────────────────────────────┘    ║
║                                                            ║
║                           [Cancel]  [Record purchase]    ║
╚═══════════════════════════════════════════════════════════╝
```

### What Happens When You Click "Record purchase":
```
1. ⚡ Validates item & quantities
2. 📊 Posts to ledger (Purchase):
   - Debit:  Inventory           5,000.00
   - Credit: Bank/Cash           5,000.00
   
   OR (Sale):
   - Debit:  Cost of Goods Sold  5,000.00
   - Credit: Inventory           5,000.00
3. 📋 Creates audit log
4. ✅ Success toast
5. ❌ Closes modal
```

---

## 📱 Mobile View

```
┌──────────────────────────┐
│  My Business        [☰] │
├──────────────────────────┤
│                          │
│  💰 Money In: 50K        │
│  💸 Money Out: 30K       │
│  📈 Profit: 20K          │
│                          │
│  ┌──── Quick Actions ──┐ │
│  │ [↗ Sale] [↘ Expense]│ │
│  │ [📄 Invoice] [👥 Pay]│ │
│  │ [📦 Inventory]       │ │
│  └─────────────────────┘ │
│                          │
│  Recent Activity...      │
│                          │
├──────────────────────────┤
│ [🏠] [💰] [📄] [📊] [⚙️]│
└──────────────────────────┘
```

---

## ✅ Success States

### After Creating Invoice
```
┌─────────────────────────────────────┐
│  ✅ Invoice created successfully!  │
│  Invoice #INV-1737044520000-123    │
└─────────────────────────────────────┘
```

### After Processing Payroll
```
┌─────────────────────────────────────┐
│  ✅ Payroll processed for John Doe │
│  Net salary: KSh 36,740.00         │
└─────────────────────────────────────┘
```

### After Recording Inventory
```
┌─────────────────────────────────────┐
│  ✅ Inventory purchase recorded    │
│  Total cost: KSh 5,000.00          │
└─────────────────────────────────────┘
```

---

## 🔍 Behind The Scenes (Browser DevTools)

### localStorage After Invoice Creation

```javascript
// Open DevTools → Application → Local Storage

invoices: [
  {
    id: "invoice-abc123",
    invoiceNumber: "INV-1737044520000-123",
    customerName: "Acme Corporation",
    totalAmount: 18560,
    balanceDue: 18560,
    status: "draft",
    items: [
      { description: "Web Design", quantity: 1, unitPrice: 10000, lineTotal: 10000 },
      { description: "Hosting", quantity: 12, unitPrice: 500, lineTotal: 6000 }
    ],
    subtotal: 16000,
    vatRate: 0.16,
    vatAmount: 2560,
    createdAt: "2026-01-16T10:30:00.000Z"
  }
]

ledger_entries: [
  { accountId: "acc_ar", debit: 18560, credit: 0, description: "Invoice INV-..." },
  { accountId: "acc_revenue", debit: 0, credit: 16000, description: "Invoice INV-..." },
  { accountId: "acc_vat_payable", debit: 0, credit: 2560, description: "VAT on Invoice..." }
]

audit_logs: [
  {
    entityType: "invoice",
    entityId: "invoice-abc123",
    action: "create",
    performedBy: "current-user",
    performedAt: "2026-01-16T10:30:00.000Z",
    after: { /* full invoice object */ }
  }
]

tax_sync_queue: [
  {
    entityType: "invoice",
    entityId: "invoice-abc123",
    authority: "TIMS",
    status: "pending",
    payload: { /* TIMS-formatted invoice */ }
  }
]
```

---

## 🎯 User Journey

### Complete Flow (Invoice Example)

```
1. User sees dashboard
   ↓
2. Clicks "New Invoice" button
   ↓
3. Modal opens with empty form
   ↓
4. User fills in:
   - Customer: "Acme Corp"
   - Item 1: "Web Design", 1, 10000
   - Clicks "Add Item"
   - Item 2: "Hosting", 12, 500
   ↓
5. Sees real-time calculations:
   - Subtotal: 16,000
   - VAT (16%): 2,560
   - Total: 18,560
   ↓
6. Clicks "Create & Issue Invoice"
   ↓
7. Loading spinner appears
   ↓
8. Backend processing:
   - Validates form
   - Creates invoice object
   - Posts to ledger (3 entries)
   - Logs audit trail
   - Queues for TIMS sync
   - Saves to localStorage
   ↓
9. Success toast shows
   ↓
10. Modal closes
   ↓
11. Dashboard refreshes (if needed)
   ↓
12. Invoice appears in Recent Activity
```

---

## 🎨 Color Coding

```
Green (Income/Positive):  ↗ Record Sale, Money In
Red (Expense/Negative):   ↘ Add Expense, Money Out
Blue (Info):              📄 Invoices, 💰 Profit
Orange (Warning):         VAT Return Due
Gray (Neutral):           👥 Payroll, 📦 Inventory
```

---

## ⌨️ Keyboard Shortcuts (Future Enhancement)

```
Ctrl + I  → Open Invoice Modal
Ctrl + P  → Open Payroll Modal
Ctrl + V  → Open Inventory Modal
Esc       → Close any open modal
```

---

## 📊 Dashboard Metrics Display

```
┌────────────────────────────────────┐
│  This Month: January 2026          │
│  ────────────────────────────────  │
│  💰 Revenue:      KSh 50,000      │
│  💸 Expenses:     KSh 30,000      │
│  📈 Profit:       KSh 20,000      │
│  📊 Margin:       40%              │
│  ────────────────────────────────  │
│  📄 Invoices:     15 issued        │
│  👥 Employees:    5 active         │
│  📦 Products:     120 items        │
│  ⚠️  Tax Due:      5 days left     │
└────────────────────────────────────┘
```

---

## 🎉 That's It!

You now have a **fully visual understanding** of how your integrated modals work!

**Try it yourself:**
1. Run `npm run dev`
2. Open dashboard
3. Click "New Invoice"
4. Fill the form
5. Submit
6. Watch the magic happen! ✨

---

**Visual guide created:** January 16, 2026
**Status:** 📸 Ready to screenshot and share!
