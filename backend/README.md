# EA Accounting Platform - Backend API

Production-ready Node.js + TypeScript + PostgreSQL backend for the East Africa Accounting Platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+ with TimescaleDB
- Redis 7+
- npm or yarn

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.example .env
# Edit .env with your configuration

# 3. Create database
createdb ea_accounting_dev

# 4. Run database schema
psql ea_accounting_dev < ../DATABASE_SCHEMA.sql

# 5. Start development server
npm run dev
```

The API will be available at `http://localhost:3000/api/v1`

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/         # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── invoices.controller.ts
│   │   └── transactions.controller.ts
│   ├── routes/             # API routes
│   │   ├── auth.routes.ts
│   │   ├── invoices.routes.ts
│   │   └── transactions.routes.ts
│   ├── services/           # Business logic
│   │   ├── compliance/
│   │   ├── accounting/
│   │   └── ai/
│   ├── shared/             # Shared utilities
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── validators/
│   ├── db/                 # Database connection
│   │   └── index.ts
│   └── server.ts           # Entry point
├── package.json
├── tsconfig.json
└── .env.example
```

## 🔐 Authentication

All protected endpoints require a JWT Bearer token:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/v1/invoices
```

### Get Access Token

```bash
# Register
POST /api/v1/auth/register
{
  "email": "owner@business.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Kamau",
  "businessName": "Kamau Enterprises",
  "countryCode": "KE"
}

# Login
POST /api/v1/auth/login
{
  "email": "owner@business.com",
  "password": "SecurePass123!"
}

# Response
{
  "user": { ... },
  "tenant": { ... },
  "tokens": {
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG...",
    "expiresIn": 900
  }
}
```

## 📚 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new business
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user

### Invoices
- `GET /api/v1/invoices` - List invoices
- `POST /api/v1/invoices` - Create invoice
- `GET /api/v1/invoices/:id` - Get invoice
- `PATCH /api/v1/invoices/:id` - Update invoice
- `DELETE /api/v1/invoices/:id` - Delete invoice
- `POST /api/v1/invoices/:id/send` - Send invoice & submit to tax authority
- `GET /api/v1/invoices/:id/pdf` - Download PDF

### Transactions
- `GET /api/v1/transactions` - List transactions
- `POST /api/v1/transactions` - Create transaction (with AI categorization)
- `GET /api/v1/transactions/:id` - Get transaction
- `PATCH /api/v1/transactions/:id` - Update transaction
- `DELETE /api/v1/transactions/:id` - Delete transaction
- `POST /api/v1/transactions/:id/categorize` - Update category

See `/API_ENDPOINTS.md` for complete documentation.

## 🛠️ Development

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Format code
npm run format
```

## 🧪 Testing

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# Test coverage
npm test -- --coverage
```

## 🌍 Environment Variables

Key environment variables (see `.env.example` for complete list):

```env
# Server
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/ea_accounting_dev

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-token-secret

# OpenAI (for AI features)
OPENAI_API_KEY=your-openai-api-key

# Kenya TIMS
KE_TIMS_API_URL=https://sandbox.kra.go.ke/tims/api
KE_TIMS_API_KEY=your-tims-api-key

# Uganda EFRIS
UG_EFRIS_API_URL=https://test.ura.go.ug/efris/api
UG_EFRIS_API_KEY=your-efris-api-key
```

## 📊 Database

The platform uses PostgreSQL with TimescaleDB for time-series optimization.

### Migrations

```bash
# Run migrations
npm run migrate

# Seed demo data
npm run seed
```

### Key Tables
- `tenants` - Business entities (multi-tenancy)
- `users` - User accounts with RBAC
- `accounts` - Chart of accounts
- `journal_entries` - Double-entry bookkeeping
- `invoices` - Customer invoices
- `transactions` - Income/expense transactions
- `payments` - Payment records
- `tax_returns` - Tax compliance

## 🔧 Features Implemented

✅ JWT Authentication with refresh tokens  
✅ Multi-tenant architecture  
✅ Invoice CRUD operations  
✅ Transaction management  
✅ AI-powered expense categorization (OpenAI)  
✅ Double-entry accounting engine  
✅ Country-specific compliance adapters (TIMS, EFRIS, VFD, EBM)  
✅ Role-based access control  
✅ Rate limiting  
✅ Request logging  
✅ Error handling  
✅ Input validation (Zod)  

## 🚧 Features To Implement

See `/IMPLEMENTATION_GUIDE.md` for the complete roadmap.

Priority items:
1. Payment processing (M-Pesa, Airtel Money)
2. Financial reports (P&L, Balance Sheet, Cash Flow)
3. Receipt OCR processing
4. Email/SMS notifications
5. Tax return filing
6. PDF generation
7. File uploads (S3)

## 🤝 Contributing

1. Create feature branch
2. Write tests
3. Submit PR with description

## 📄 License

MIT

## 📞 Support

- Email: support@eaaccounting.com
- Docs: See `/API_ENDPOINTS.md`
- Issues: GitHub Issues

---

Built with ❤️ for East African SMEs
