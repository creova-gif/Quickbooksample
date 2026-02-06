# API Quick Reference Card

## 🔥 Most Common Operations

### Authentication
```typescript
import { login, register, logout } from '@/services/auth.service';

// Login
await login({ email: 'user@example.com', password: 'pass123' });

// Register
await register({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'secure123',
  businessName: 'My Business',
  country: 'KE',
  vatRegistered: true
});

// Logout
await logout();
```

### Transactions
```typescript
import { getTransactions, createTransaction } from '@/services/transactions.service';
import { useApi } from '@/hooks/useApi';

// Fetch all
const { data, loading, execute } = useApi(getTransactions);
execute({ startDate: '2024-01-01', endDate: '2024-12-31' });

// Create
await createTransaction({
  date: new Date().toISOString(),
  type: 'expense',
  amount: 500,
  categoryId: 'cat-123',
  description: 'Office supplies'
});
```

### Invoices
```typescript
import { createInvoice, generateInvoicePDF } from '@/services/invoices.service';

// Create
const invoice = await createInvoice({
  customerName: 'ABC Corp',
  customerTaxId: 'A123456789P',
  date: new Date().toISOString(),
  dueDate: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
  items: [{
    description: 'Consulting',
    quantity: 10,
    unitPrice: 5000,
    taxRate: 16
  }]
});

// Download PDF
const blob = await generateInvoicePDF(invoice.id);
const url = URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = 'invoice.pdf';
link.click();
```

### Tax Compliance
```typescript
import { submitInvoiceToTaxAuthority } from '@/services/compliance.service';

// Submit to tax authority (adapts to country)
await submitInvoiceToTaxAuthority(invoice, 'KE'); // Kenya TIMS
await submitInvoiceToTaxAuthority(invoice, 'UG'); // Uganda EFRIS
await submitInvoiceToTaxAuthority(invoice, 'TZ'); // Tanzania VFD
```

### Reports
```typescript
import { getProfitLossReport } from '@/services/reports.service';

const report = await getProfitLossReport('2024-01-01', '2024-12-31');
console.log(report.netProfit); // Total profit
```

## 🎣 Using with React Hooks

### GET Request (with auto-fetch)
```typescript
const { data, loading, error, execute } = useApi(getTransactions);

useEffect(() => {
  execute({ startDate: '2024-01-01' });
}, []);
```

### POST/PUT/DELETE (mutation)
```typescript
const { execute, loading } = useMutation(createTransaction, {
  onSuccess: (data) => toast.success('Created!'),
  onError: (error) => toast.error(error)
});

const handleSubmit = () => execute({ /* data */ });
```

## 🔐 Auth Token Management

```typescript
import { setAuthToken, clearAuthToken, isAuthenticated } from '@/services/api';

// Check if logged in
if (isAuthenticated()) {
  // User has valid token
}

// Tokens are automatically:
// - Added to all requests
// - Cleared on 401 errors
// - Stored in localStorage
```

## 🌍 Country Codes

| Country | Code | System | Tax Field |
|---------|------|--------|-----------|
| Kenya | `KE` | TIMS | KRA PIN |
| Uganda | `UG` | EFRIS | URA TIN |
| Tanzania | `TZ` | VFD | TRA TIN |
| Rwanda | `RW` | EBM | RRA TIN |
| Burundi | `BI` | Generic | NIF |

## 📊 Available Services

| Service | Import From |
|---------|-------------|
| Auth | `@/services/auth.service` |
| Transactions | `@/services/transactions.service` |
| Invoices | `@/services/invoices.service` |
| Compliance | `@/services/compliance.service` |
| Reports | `@/services/reports.service` |

## ⚡ Quick Copy-Paste

**Complete component with API:**
```typescript
import { useApi } from '@/hooks/useApi';
import { getTransactions } from '@/services/transactions.service';

function MyComponent() {
  const { data, loading, error, execute } = useApi(getTransactions);
  
  useEffect(() => {
    execute();
  }, []);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {data?.map(item => <div key={item.id}>{item.description}</div>)}
    </div>
  );
}
```

**Form with mutation:**
```typescript
import { useMutation } from '@/hooks/useApi';
import { createTransaction } from '@/services/transactions.service';
import { toast } from 'sonner';

function Form() {
  const { execute, loading } = useMutation(createTransaction, {
    onSuccess: () => toast.success('Saved!'),
    onError: (e) => toast.error(e)
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    execute({ /* form data */ });
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

## 🔥 Pro Tips

1. **Always use hooks** for API calls (handles loading/error automatically)
2. **Use toast notifications** for user feedback
3. **The adapter handles compliance** formatting - just pass the country code
4. **All services are typed** - TypeScript will guide you
5. **Backend is multi-tenant** - no need to pass business ID (comes from JWT)

## 🚀 Environment Setup

```bash
# .env file
VITE_API_URL=http://localhost:5000/api
```

## 🆘 Common Issues

**"Network Error"**
- Backend not running? Start with `cd backend && npm run dev`
- Wrong URL? Check `.env` file

**"401 Unauthorized"**
- Token expired? Call `logout()` and login again
- Not logged in? Redirect to login page

**"Cannot read property of undefined"**
- Data not loaded yet? Check `loading` state first
- API call failed? Check `error` state

## 📚 Full Documentation

- **Complete Guide**: `/FRONTEND_API_INTEGRATION.md`
- **Examples**: `/src/app/components/examples/ApiIntegrationExample.tsx`
- **Integration Status**: `/INTEGRATION_COMPLETE.md`
