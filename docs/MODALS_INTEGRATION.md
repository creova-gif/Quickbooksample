# 📋 Modal Forms Integration Guide

## Overview

This guide covers the three enterprise-grade modal forms for your East Africa Accounting Platform:

1. **InvoiceFormModal** - Create invoices with VAT calculation and tax authority sync
2. **PayrollFormModal** - Process payroll with PAYE tax and statutory deductions
3. **InventoryFormModal** - Record inventory purchases, sales, and adjustments

All modals include:
- ✅ Double-entry ledger posting
- ✅ Audit trail logging
- ✅ Offline queue support
- ✅ Tax authority sync
- ✅ Form validation
- ✅ Real-time calculations

---

## 🚀 Quick Start

### 1. Import the Modals

```tsx
import { 
  InvoiceFormModal, 
  PayrollFormModal, 
  InventoryFormModal 
} from '@/app/components/modals';
```

### 2. Basic Usage

```tsx
import { useState } from 'react';

function MyDashboard() {
  const [showInvoice, setShowInvoice] = useState(false);
  const [showPayroll, setShowPayroll] = useState(false);
  const [showInventory, setShowInventory] = useState(false);

  return (
    <>
      <button onClick={() => setShowInvoice(true)}>
        Create Invoice
      </button>
      
      <InvoiceFormModal 
        open={showInvoice} 
        onClose={() => setShowInvoice(false)} 
      />
      
      <PayrollFormModal 
        open={showPayroll} 
        onClose={() => setShowPayroll(false)} 
      />
      
      <InventoryFormModal 
        open={showInventory} 
        onClose={() => setShowInventory(false)} 
      />
    </>
  );
}
```

---

## 📄 InvoiceFormModal

### Features
- Multi-line item entry
- Automatic VAT calculation (country-specific rates)
- Customer information capture
- Tax ID / PIN validation
- Due date calculation
- Notes and terms
- Compliance data for TIMS/EFRIS/VFD/EBM

### Ledger Entries

When an invoice is created, the following double-entry is posted:

```
Debit:  Accounts Receivable  (Total Amount)
Credit: Sales Revenue        (Subtotal)
Credit: VAT Payable          (VAT Amount)
```

### Example Usage

```tsx
<InvoiceFormModal 
  open={isOpen} 
  onClose={() => setIsOpen(false)} 
/>
```

### Form Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Customer Name | text | Yes | Customer's full name or company |
| Customer Email | email | No | For sending invoice |
| Customer Phone | tel | No | Contact number |
| Customer Tax ID | text | No | PIN/TIN/VRN number |
| Issue Date | date | Yes | Invoice date |
| Due Date | date | Yes | Payment due date |
| Items | array | Yes | Line items with description, qty, price |
| Notes | textarea | No | Payment terms, instructions |

### Calculations

```typescript
subtotal = Σ(quantity × unitPrice)
vatAmount = subtotal × vatRate
totalAmount = subtotal + vatAmount
```

---

## 👥 PayrollFormModal

### Features
- PAYE tax calculation (Kenya rates)
- NHIF contributions
- NSSF contributions
- Other deductions support
- Net salary calculation
- Statutory compliance

### Tax Calculation (Kenya PAYE)

```typescript
if (gross ≤ 24,000)     → 10%
if (gross ≤ 32,333)     → 2,400 + 25% of excess
if (gross ≤ 500,000)    → 4,483.25 + 30% of excess
if (gross ≤ 800,000)    → 144,783.35 + 32.5% of excess
if (gross > 800,000)    → 242,283.35 + 35% of excess
```

### Ledger Entries

```
Debit:  Salary Expense      (Gross Salary)
Credit: PAYE Tax Payable    (Tax Amount)
Credit: NHIF Payable        (NHIF)
Credit: NSSF Payable        (NSSF)
Credit: Bank Account        (Net Salary)
```

### Example Usage

```tsx
<PayrollFormModal 
  open={isOpen} 
  onClose={() => setIsOpen(false)} 
/>
```

### Form Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Employee Name | text | Yes | Full name |
| Employee ID | text | No | Employee identifier |
| Gross Salary | number | Yes | Before deductions |
| Payment Date | date | Yes | Salary payment date |
| NHIF Contribution | number | No | Health insurance |
| NSSF Contribution | number | No | Social security |
| Other Deductions | number | No | Loans, advances, etc. |

### Calculations

```typescript
taxAmount = calculatePAYE(grossSalary)
netSalary = grossSalary - taxAmount - nhif - nssf - otherDeductions
```

---

## 📦 InventoryFormModal

### Features
- Purchase transactions
- Sale transactions
- Inventory adjustments
- SKU tracking
- Total cost calculation
- Transaction notes

### Transaction Types

#### 1. Purchase
```
Debit:  Inventory         (Total Cost)
Credit: Bank/Cash         (Total Cost)
```

#### 2. Sale
```
Debit:  Cost of Goods Sold  (Total Cost)
Credit: Inventory           (Total Cost)
```

#### 3. Adjustment
```
Debit:  Inventory              (Total Cost)
Credit: Inventory Adjustment   (Total Cost)
```

### Example Usage

```tsx
<InventoryFormModal 
  open={isOpen} 
  onClose={() => setIsOpen(false)} 
/>
```

### Form Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Transaction Type | select | Yes | Purchase/Sale/Adjustment |
| Item Name | text | Yes | Product name |
| SKU / Item Code | text | No | Stock keeping unit |
| Quantity | number | Yes | Number of units |
| Unit Cost | number | Yes | Cost per unit |
| Transaction Date | date | Yes | Date of transaction |
| Notes | textarea | No | Additional details |

### Calculations

```typescript
totalCost = quantity × unitCost
```

---

## 🔐 Integration Details

### Service Dependencies

All modals integrate with these services:

```typescript
import { postInvoiceToLedger, saveLedgerEntries } from '@/services/ledger.service';
import { logAudit, logInvoiceCreated } from '@/services/audit.service';
import { queueInvoiceSync } from '@/services/taxsync.service';
import { useBusiness } from '@/contexts/BusinessContext';
```

### Offline Support

All forms automatically:
1. Save to localStorage
2. Queue for sync when offline
3. Sync to backend when online
4. Retry failed submissions

### Audit Trail

Every transaction creates an audit log entry:

```typescript
{
  entityType: 'invoice' | 'transaction',
  entityId: string,
  action: 'create',
  before: null,
  after: {...data},
  performedBy: 'current-user',
  performedAt: ISO timestamp,
  metadata: { reason, ... }
}
```

### Tax Authority Sync

Invoices are automatically queued for tax authority submission:

- **Kenya**: TIMS (Tax Invoice Management System)
- **Uganda**: EFRIS (Electronic Fiscal Receipting)
- **Tanzania**: VFD (Virtual Fiscal Device)
- **Rwanda**: EBM (Electronic Billing Machine)

---

## 🧪 Testing

Run the test suite:

```bash
npm test src/tests/modals.test.tsx
```

### Test Coverage

- ✅ Form validation
- ✅ Calculation accuracy
- ✅ Ledger posting
- ✅ Audit logging
- ✅ Tax sync queueing
- ✅ Double-entry validation

---

## 🎨 Customization

### Styling

All modals use shadcn/ui components. Customize in `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      primary: {...},
      secondary: {...}
    }
  }
}
```

### Validation

Add custom validation:

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Custom validation
  if (customCondition) {
    toast.error('Custom validation message');
    return;
  }
  
  // ... rest of submit logic
};
```

### Currency Format

Currency is automatically formatted based on business settings:

```tsx
const { business } = useBusiness();
// business.currency = 'KES'
// business.currencySymbol = 'KSh'
```

---

## 📊 Example Dashboard Integration

```tsx
import { QuickActionsDemo } from '@/app/components/dashboard/QuickActionsDemo';

function Dashboard() {
  return (
    <div className="space-y-6">
      <h1>Dashboard</h1>
      
      {/* Quick Actions with modals */}
      <QuickActionsDemo />
      
      {/* Other dashboard widgets */}
    </div>
  );
}
```

---

## 🐛 Troubleshooting

### Modal doesn't open
- Check `open` prop is `true`
- Verify BusinessContext is wrapped around component

### Calculations are wrong
- Check `vatRate` is set correctly in business settings
- Verify input values are numbers, not strings

### Ledger entries not saving
- Check localStorage permissions
- Verify `saveLedgerEntries` is called after posting

### Tax sync not working
- Ensure `complianceSystem` is set in business settings
- Check network connectivity for sync

---

## 🚀 Next Steps

1. **Add more modals**: Create similar modals for expenses, customers, etc.
2. **Enhance validation**: Add stricter validation rules
3. **Add attachments**: Allow file uploads for receipts
4. **Multi-currency**: Support multi-currency transactions
5. **Approval workflows**: Add approval steps for large transactions

---

## 📚 Related Documentation

- [Ledger Service Guide](./LEDGER_SERVICE.md)
- [Audit Service Guide](./AUDIT_SERVICE.md)
- [Tax Sync Guide](./TAX_SYNC.md)
- [Offline Queue Guide](./OFFLINE_QUEUE.md)

---

## 💡 Tips & Best Practices

1. **Always validate inputs** before posting to ledger
2. **Use toast notifications** for user feedback
3. **Reset form** on successful submission
4. **Handle errors gracefully** with try/catch
5. **Test double-entry** calculations thoroughly
6. **Log everything** for audit compliance
7. **Queue tax sync** for all taxable transactions

---

## ✅ Checklist for Production

- [ ] All forms validated and tested
- [ ] Ledger posting verified
- [ ] Audit logs created for all actions
- [ ] Tax sync queue working
- [ ] Offline mode tested
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Success/error messages shown
- [ ] Forms reset after submission
- [ ] Double-entry validation passed

---

**Questions?** Check the main documentation or contact the development team.

**Version:** 1.0.0  
**Last Updated:** January 2026
