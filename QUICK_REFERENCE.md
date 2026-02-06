# 🚀 Quick Reference - Modal Forms

## Import & Use (Copy-Paste Ready)

### 1. Invoice Modal

```tsx
import { InvoiceFormModal } from '@/app/components/modals';
import { useState } from 'react';

function MyComponent() {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setOpen(true)}>Create Invoice</button>
      <InvoiceFormModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
```

### 2. Payroll Modal

```tsx
import { PayrollFormModal } from '@/app/components/modals';
import { useState } from 'react';

function MyComponent() {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setOpen(true)}>Process Payroll</button>
      <PayrollFormModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
```

### 3. Inventory Modal

```tsx
import { InventoryFormModal } from '@/app/components/modals';
import { useState } from 'react';

function MyComponent() {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setOpen(true)}>Inventory Transaction</button>
      <InventoryFormModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
```

---

## All Three Together

```tsx
import { 
  InvoiceFormModal, 
  PayrollFormModal, 
  InventoryFormModal 
} from '@/app/components/modals';
import { useState } from 'react';

function Dashboard() {
  const [showInvoice, setShowInvoice] = useState(false);
  const [showPayroll, setShowPayroll] = useState(false);
  const [showInventory, setShowInventory] = useState(false);

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Quick Actions */}
      <button onClick={() => setShowInvoice(true)}>
        📄 Invoice
      </button>
      <button onClick={() => setShowPayroll(true)}>
        👥 Payroll
      </button>
      <button onClick={() => setShowInventory(true)}>
        📦 Inventory
      </button>

      {/* Modals */}
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
    </div>
  );
}
```

---

## File Locations

```
Project Root
│
├── /src/app/components/modals/
│   ├── InvoiceFormModal.tsx      ← Invoice form
│   ├── PayrollFormModal.tsx      ← Payroll form
│   ├── InventoryFormModal.tsx    ← Inventory form
│   └── index.ts                  ← Exports
│
├── /src/app/components/dashboard/
│   └── QuickActionsDemo.tsx      ← Ready-to-use example
│
├── /src/lib/
│   └── modal-utils.ts            ← Helper functions
│
├── /src/tests/
│   └── modals.test.tsx           ← Tests
│
└── /docs/
    └── MODALS_INTEGRATION.md     ← Full docs
```

---

## Key Props

All modals accept:

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `open` | boolean | Yes | Controls modal visibility |
| `onClose` | () => void | Yes | Called when modal closes |

---

## What Happens on Submit?

### Invoice
1. ✅ Validates customer name & items
2. ✅ Calculates VAT & totals
3. ✅ Creates invoice with unique number
4. ✅ Posts to ledger (AR ↔ Revenue + VAT)
5. ✅ Logs audit trail
6. ✅ Queues for tax authority sync
7. ✅ Shows success toast
8. ✅ Resets form & closes

### Payroll
1. ✅ Validates employee name & salary
2. ✅ Calculates PAYE tax
3. ✅ Calculates net salary
4. ✅ Posts to ledger (Salary ↔ Tax + Deductions + Bank)
5. ✅ Logs audit trail
6. ✅ Shows success toast
7. ✅ Resets form & closes

### Inventory
1. ✅ Validates item name & quantities
2. ✅ Calculates total cost
3. ✅ Posts to ledger (based on transaction type)
4. ✅ Logs audit trail
5. ✅ Shows success toast
6. ✅ Resets form & closes

---

## Calculations

### Invoice
```typescript
subtotal = Σ(quantity × unitPrice)
vatAmount = subtotal × vatRate
totalAmount = subtotal + vatAmount
```

### Payroll
```typescript
taxAmount = calculatePAYE(grossSalary)
netSalary = grossSalary - taxAmount - nhif - nssf - other
```

### Inventory
```typescript
totalCost = quantity × unitCost
```

---

## Ledger Entries

### Invoice Creates
```
DR  Accounts Receivable  11,600
CR  Sales Revenue        10,000
CR  VAT Payable           1,600
```

### Payroll Creates
```
DR  Salary Expense       50,000
CR  PAYE Tax Payable     10,000
CR  NHIF Payable          1,700
CR  NSSF Payable          2,160
CR  Bank Account         36,140
```

### Inventory Purchase Creates
```
DR  Inventory             5,000
CR  Bank/Cash             5,000
```

### Inventory Sale Creates
```
DR  Cost of Goods Sold    5,000
CR  Inventory             5,000
```

---

## Helper Functions

```tsx
import {
  formatCurrency,
  calculateVAT,
  generateInvoiceNumber,
  calculateKenyaPAYE,
  validateEmail,
  isValidPhone,
} from '@/lib/modal-utils';

// Format money
formatCurrency(1000, 'KSh'); // "KSh1,000.00"

// Calculate VAT
calculateVAT(10000, 0.16); // 1600

// Generate invoice number
generateInvoiceNumber('INV'); // "INV-1738339200000-123"

// Calculate PAYE
calculateKenyaPAYE(50000);
// { taxAmount: 9400, netSalary: 40600, taxRate: 0.188, breakdown: [...] }

// Validate email
isValidEmail('user@example.com'); // true

// Validate phone
isValidPhone('+254712345678'); // true
```

---

## Common Customizations

### Change VAT Rate

```tsx
// In InvoiceFormModal.tsx
const vatRate = business.vatRegistered ? 0.18 : 0; // Change 0.16 → 0.18
```

### Change Invoice Prefix

```tsx
// In InvoiceFormModal.tsx
const invoiceNumber = `CUSTOM-${Date.now()}`;
```

### Add Custom Field

```tsx
// Add state
const [customField, setCustomField] = useState('');

// Add input
<Input
  value={customField}
  onChange={(e) => setCustomField(e.target.value)}
  placeholder="Custom field"
/>

// Include in submission
const newInvoice = {
  ...existingFields,
  customField,
};
```

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Esc` | Close modal |
| `Tab` | Navigate fields |
| `Enter` | Submit form (when focused on submit button) |

---

## Toast Notifications

```tsx
import { toast } from 'sonner';

// Success
toast.success('Invoice created successfully!');

// Error
toast.error('Customer name is required');

// Info
toast.info('Processing...');

// Warning
toast.warning('This action cannot be undone');
```

---

## Troubleshooting

### Modal doesn't open
```tsx
// ❌ Wrong
<InvoiceFormModal open={true} />

// ✅ Correct
<InvoiceFormModal open={isOpen} onClose={() => setIsOpen(false)} />
```

### Business context error
```tsx
// Make sure BusinessProvider wraps your app
<BusinessProvider>
  <App />
</BusinessProvider>
```

### Calculations wrong
```tsx
// Use parseFloat for string inputs
const amount = parseFloat(inputValue) || 0;
```

### Ledger not saving
```tsx
// Check localStorage is available
if (typeof window !== 'undefined') {
  saveLedgerEntries(entries);
}
```

---

## Testing

```bash
# Run all tests
npm test

# Run modal tests only
npm test src/tests/modals.test.tsx

# Run with coverage
npm test -- --coverage
```

---

## Country-Specific Settings

```tsx
// Kenya
vatRate: 0.16
taxSystem: 'TIMS'
currency: 'KES'
currencySymbol: 'KSh'

// Uganda
vatRate: 0.18
taxSystem: 'EFRIS'
currency: 'UGX'
currencySymbol: 'USh'

// Tanzania
vatRate: 0.18
taxSystem: 'VFD'
currency: 'TZS'
currencySymbol: 'TSh'
```

---

## Performance Tips

1. **Memoize calculations**
```tsx
const total = useMemo(() => 
  items.reduce((sum, item) => sum + item.lineTotal, 0),
  [items]
);
```

2. **Debounce input handlers**
```tsx
const debouncedUpdate = debounce((value) => {
  setAmount(value);
}, 300);
```

3. **Lazy load modals**
```tsx
const InvoiceModal = lazy(() => import('./modals/InvoiceFormModal'));
```

---

## Next Steps

1. ✅ Import modals into your dashboard
2. ✅ Add buttons to trigger modals
3. ✅ Test with demo data
4. ✅ Customize styling if needed
5. ✅ Deploy to production

---

## Support

📖 **Full Documentation**: `/docs/MODALS_INTEGRATION.md`  
🧪 **Tests**: `/src/tests/modals.test.tsx`  
💡 **Examples**: `/src/app/components/dashboard/QuickActionsDemo.tsx`  
🔧 **Utils**: `/src/lib/modal-utils.ts`

---

**Ready to use! 🚀**
