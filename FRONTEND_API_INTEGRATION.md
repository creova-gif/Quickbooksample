# Frontend API Integration - Complete

## Overview

I've created a complete API integration layer that connects your React frontend to the Node.js TypeScript backend. This follows the patterns you showed me and includes:

✅ **Axios configuration** with interceptors
✅ **Authentication service** (login, register, logout)
✅ **Transaction service** (CRUD, filtering, export)
✅ **Invoice service** (CRUD, PDF, email, payments)
✅ **Compliance service** (Tax adapter pattern for TIMS, EFRIS, VFD, EBM)
✅ **Reports service** (P&L, Balance Sheet, Cash Flow)
✅ **React hooks** for easy API integration

## Files Created

### 1. Core API Client
- `/src/services/api.ts` - Axios instance with auth interceptors

### 2. Service Modules
- `/src/services/auth.service.ts` - User authentication
- `/src/services/transactions.service.ts` - Transaction management
- `/src/services/invoices.service.ts` - Invoice operations
- `/src/services/compliance.service.ts` - Tax compliance (with adapter pattern)
- `/src/services/reports.service.ts` - Financial reports

### 3. React Hooks
- `/src/hooks/useApi.ts` - Hook for API calls with loading/error states

## Usage Examples

### 1. Authentication

```typescript
import { login, register, logout } from '@/services/auth.service';

// Login
const authData = await login({
  email: 'user@example.com',
  password: 'password123'
});

// Register
const newUser = await register({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'secure123',
  businessName: 'My Business',
  country: 'KE',
  vatRegistered: true,
  taxId: 'A123456789'
});

// Logout
await logout();
```

### 2. Transactions with Hook

```typescript
import { useApi } from '@/hooks/useApi';
import { getTransactions, createTransaction } from '@/services/transactions.service';

function TransactionList() {
  const { data, loading, error, execute } = useApi(getTransactions);

  useEffect(() => {
    execute({ startDate: '2024-01-01', endDate: '2024-12-31' });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
      {data?.map(tx => (
        <li key={tx.id}>{tx.description}: {tx.amount}</li>
      ))}
    </ul>
  );
}
```

### 3. Creating Invoice

```typescript
import { createInvoice } from '@/services/invoices.service';
import { useMutation } from '@/hooks/useApi';
import { toast } from 'sonner';

function CreateInvoiceForm() {
  const { execute, loading } = useMutation(createInvoice, {
    onSuccess: () => toast.success('Invoice created!'),
    onError: (error) => toast.error(error),
  });

  const handleSubmit = async (formData) => {
    await execute({
      customerName: 'ABC Corp',
      customerEmail: 'abc@example.com',
      date: '2024-01-15',
      dueDate: '2024-02-15',
      items: [
        { description: 'Service', quantity: 1, unitPrice: 1000, taxRate: 16 }
      ],
    });
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### 4. Tax Compliance (Adapter Pattern)

```typescript
import { TaxAdapter, submitInvoiceToTaxAuthority } from '@/services/compliance.service';

// The adapter automatically formats invoices for each country's system
const invoice = await getInvoice('invoice-123');

// Submit to Kenya TIMS
await submitInvoiceToTaxAuthority(invoice, 'KE');

// Submit to Uganda EFRIS
await submitInvoiceToTaxAuthority(invoice, 'UG');

// The adapter handles country-specific formatting internally
const adapter = new TaxAdapter('KE');
const timsPayload = adapter.generateInvoicePayload(invoice);
```

### 5. Financial Reports

```typescript
import { getProfitLossReport, downloadReportPDF } from '@/services/reports.service';

// Get P&L data
const plReport = await getProfitLossReport('2024-01-01', '2024-12-31');

// Download as PDF
const pdfBlob = await downloadReportPDF('profit-loss', {
  startDate: '2024-01-01',
  endDate: '2024-12-31'
});

// Trigger download
const url = URL.createObjectURL(pdfBlob);
const link = document.createElement('a');
link.href = url;
link.download = 'profit-loss-2024.pdf';
link.click();
```

## Environment Variables

Create `/frontend/.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

## API Error Handling

The API client automatically handles:
- **401 Unauthorized** → Redirects to login, clears tokens
- **Network errors** → Returns friendly error message
- **Token management** → Auto-adds Bearer token to requests

## Tax Compliance Architecture

The `TaxAdapter` class implements the pattern you showed me:

```typescript
class TaxAdapter {
  constructor(country: CountryCode) {}
  
  generateInvoicePayload(invoice: Invoice): CompliancePayload {
    switch(country) {
      case 'KE': return this._formatTims(invoice);
      case 'UG': return this._formatEfris(invoice);
      case 'TZ': return this._formatVfd(invoice);
      case 'RW': return this._formatEbm(invoice);
      case 'BI': return this._formatGeneric(invoice);
    }
  }
}
```

Each country has its own formatting method that includes:
- Required fields (e.g., KRA PIN for Kenya)
- Specific payload structure
- Compliance system endpoints

## Next Steps

### Option 1: Backend Integration
Now that you have services, update your existing components to use them:

1. Replace localStorage calls with API calls
2. Update `BusinessContext` to fetch from backend
3. Add loading states to Dashboard
4. Connect InvoiceForm to `createInvoice` service

### Option 2: Authentication Flow
Add login/signup pages:

```typescript
// /src/app/components/auth/Login.tsx
import { login } from '@/services/auth.service';
import { useMutation } from '@/hooks/useApi';

function Login() {
  const { execute, loading } = useMutation(login, {
    onSuccess: () => navigate('/dashboard'),
  });
  
  // ... form implementation
}
```

### Option 3: Test Backend Connection
1. Start backend: `cd backend && npm run dev`
2. Update components to call APIs
3. Test authentication flow
4. Verify data syncs to PostgreSQL

## Backend Endpoints Summary

Your backend already has these routes ready:

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - New user registration
- `GET /api/transactions` - List transactions
- `POST /api/transactions` - Create transaction
- `GET /api/invoices` - List invoices
- `POST /api/invoices` - Create invoice
- `POST /api/invoices/:id/submit-compliance` - Submit to tax authority
- `GET /api/reports/profit-loss` - P&L report

All services are typed and ready to use! 🚀
