# Backend Integration Guide

## Overview
This guide shows how to connect the existing frontend to the Node.js + Express + PostgreSQL backend.

---

## Backend Setup (Already Provided)

### Project Structure
```
ea-accounting/
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── .env
│   ├── db/
│   │   └── index.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Business.js
│   │   ├── Transaction.js
│   │   └── Invoice.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── transactions.js
│   │   └── invoices.js
│   └── controllers/
│       ├── authController.js
│       ├── transactionsController.js
│       └── invoicesController.js
```

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Create `.env` file:
```env
# Database
DB_HOST=localhost
DB_USER=postgres
DB_PASS=yourpassword
DB_NAME=ea_accounting
DB_PORT=5432

# JWT
JWT_SECRET=supersecretkey_change_in_production

# Server
PORT=5000
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:5173
```

### 3. Initialize Database
Run the SQL schema from `/DATABASE_SCHEMA.sql`:
```bash
psql -U postgres -d ea_accounting -f DATABASE_SCHEMA.sql
```

### 4. Start Backend Server
```bash
npm run dev
```

Server will run on `http://localhost:5000`

---

## Frontend Integration

### 1. Update API Configuration

Update `/src/services/api.ts`:

```typescript
import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 2. Create Environment Variables

Create `.env.local` in frontend root:
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=EastBooks
```

### 3. Update Service Files

The existing service files (`/src/services/`) are already structured correctly:
- `auth.service.ts` - Authentication
- `transaction.service.ts` - Transactions
- `invoice.service.ts` - Invoices
- `compliance.service.ts` - Tax compliance
- `reports.service.ts` - Financial reports

They just need to be connected to the backend API (already done in the existing code).

---

## API Endpoint Mapping

### Authentication
```typescript
// Frontend: /src/services/auth.service.ts
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
GET  /api/auth/me

// Backend: /backend/routes/auth.js
```

### Transactions
```typescript
// Frontend: /src/services/transaction.service.ts
GET    /api/transactions?businessId={id}&startDate={date}&endDate={date}
POST   /api/transactions
GET    /api/transactions/:id
PUT    /api/transactions/:id
DELETE /api/transactions/:id
GET    /api/transactions/summary?businessId={id}

// Backend: /backend/routes/transactions.js
```

### Invoices
```typescript
// Frontend: /src/services/invoices.service.ts
GET    /api/invoices?businessId={id}&status={status}
POST   /api/invoices
GET    /api/invoices/:id
PUT    /api/invoices/:id
POST   /api/invoices/:id/submit  // Submit to tax authority
POST   /api/invoices/:id/send    // Send to customer

// Backend: /backend/routes/invoices.js
```

### Reports
```typescript
// Frontend: /src/services/reports.service.ts
GET /api/reports/profit-loss?businessId={id}&startDate={date}&endDate={date}
GET /api/reports/balance-sheet?businessId={id}&asOf={date}
GET /api/reports/cash-flow?businessId={id}&startDate={date}&endDate={date}
GET /api/reports/vat-summary?businessId={id}&period={period}

// Backend: /backend/routes/reports.js
```

---

## Data Flow Example

### Creating a Transaction

```mermaid
Frontend Component (TransactionFormModal)
    ↓
Frontend Service (transaction.service.ts)
    ↓ HTTP POST
Backend Route (/api/transactions)
    ↓
Backend Controller (transactionsController.js)
    ↓
Backend Model (Transaction.js - Sequelize)
    ↓
PostgreSQL Database
    ↓
Response → Frontend → Update UI
```

### Code Example

**Frontend (TransactionFormModal.tsx):**
```typescript
import { transactionService } from '@/services/transaction.service';

const handleSubmit = async () => {
  try {
    const transaction = await transactionService.create({
      businessId: business.id,
      type: 'income',
      amount: 2500,
      category: 'sales',
      currency: 'KES',
      description: 'Product sale',
      date: new Date().toISOString(),
    });
    
    toast.success('Transaction created!');
    onSuccess();
  } catch (error) {
    toast.error('Failed to create transaction');
  }
};
```

**Backend (transactionsController.js):**
```javascript
const Transaction = require('../models/Transaction');

exports.createTransaction = async (req, res) => {
  try {
    const { businessId, type, amount, category, currency, description, date } = req.body;
    
    // Validate
    if (!businessId || !type || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Create transaction
    const transaction = await Transaction.create({
      businessId,
      type,
      amount,
      category,
      currency,
      description,
      date,
    });
    
    // Create ledger entries (double-entry bookkeeping)
    await createLedgerEntries(transaction);
    
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
```

---

## Switching from LocalStorage to API

### Current State (LocalStorage)
```typescript
// /src/contexts/BusinessContext.tsx
const transactions = localStorage.getItem('transactions');
```

### Updated State (API)
```typescript
// /src/contexts/BusinessContext.tsx
import { transactionService } from '@/services/transaction.service';

const [transactions, setTransactions] = useState<Transaction[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadTransactions = async () => {
    if (business?.id) {
      try {
        const data = await transactionService.getAll(business.id);
        setTransactions(data);
      } catch (error) {
        console.error('Failed to load transactions:', error);
      } finally {
        setLoading(false);
      }
    }
  };
  
  loadTransactions();
}, [business?.id]);

const addTransaction = async (data) => {
  try {
    const newTransaction = await transactionService.create({
      ...data,
      businessId: business.id,
    });
    setTransactions([newTransaction, ...transactions]);
    return newTransaction;
  } catch (error) {
    throw error;
  }
};
```

---

## Error Handling

### Backend Error Responses
```javascript
// Standard error format
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { /* additional info */ }
}
```

### Frontend Error Handling
```typescript
import { toast } from 'sonner';

try {
  const response = await api.post('/transactions', data);
  return response.data;
} catch (error) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.error || 'Something went wrong';
    toast.error(message);
  }
  throw error;
}
```

---

## CORS Configuration

### Backend (server.js)
```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
```

---

## Testing the Integration

### 1. Test Backend API
```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test transactions endpoint
curl -X GET http://localhost:5000/api/transactions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Test Frontend Connection
```typescript
// In browser console
import api from '@/services/api';
api.get('/transactions').then(console.log);
```

### 3. Monitor Network Tab
- Open browser DevTools → Network tab
- Filter by XHR/Fetch
- Watch API calls in real-time

---

## Deployment

### Backend Deployment (Heroku/Railway/DigitalOcean)

1. **Environment Variables:**
```bash
heroku config:set DB_HOST=your-db-host
heroku config:set DB_NAME=your-db-name
heroku config:set JWT_SECRET=your-secret
```

2. **Deploy:**
```bash
git push heroku main
```

### Frontend Deployment (Vercel/Netlify)

1. **Build command:**
```bash
npm run build
```

2. **Environment variables:**
```
VITE_API_URL=https://your-backend.herokuapp.com/api
```

3. **Deploy:**
```bash
vercel --prod
```

---

## Migration Path

### Phase 1 (Current - LocalStorage)
- ✅ All data in browser localStorage
- ✅ Offline-first
- ✅ No backend dependency

### Phase 2 (Hybrid - LocalStorage + API)
- Keep localStorage for offline
- Sync to backend when online
- Background sync with Service Worker

### Phase 3 (Full Backend)
- Primary data source: Backend API
- localStorage as cache only
- Real-time updates via WebSocket

---

## Next Steps

1. ✅ Backend already set up (provided by user)
2. ✅ Frontend API services already created
3. 🔄 Update BusinessContext to use API instead of localStorage
4. 🔄 Add offline sync queue
5. 🔄 Implement WebSocket for real-time updates
6. 🔄 Add Service Worker for background sync

---

## Troubleshooting

### Issue: CORS Error
**Solution:** Make sure backend has CORS enabled and frontend URL is whitelisted.

### Issue: 401 Unauthorized
**Solution:** Check if JWT token is being sent in Authorization header.

### Issue: Network timeout
**Solution:** Increase axios timeout or check backend server status.

### Issue: Data not persisting
**Solution:** Verify PostgreSQL connection and check backend logs.

---

## Additional Resources

- Backend code: `/backend/`
- Frontend API services: `/src/services/`
- Database schema: `/DATABASE_SCHEMA.sql`
- API documentation: `/API_ENDPOINTS.md`
