# API ENDPOINTS DOCUMENTATION

**Base URL**: `https://api.ea-accounting.com/v1`  
**Authentication**: Bearer Token (JWT)  
**Rate Limiting**: 1000 requests/hour per tenant

---

## 🔐 AUTHENTICATION

### POST `/auth/register`
Register a new business account
```json
Request:
{
  "email": "owner@business.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Kamau",
  "businessName": "Kamau Enterprises",
  "countryCode": "KE",
  "phone": "+254712345678"
}

Response: 201 Created
{
  "user": { "id": "uuid", "email": "...", "role": "owner" },
  "tenant": { "id": "uuid", "name": "...", "countryCode": "KE" },
  "tokens": {
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG...",
    "expiresIn": 900
  }
}
```

### POST `/auth/login`
User login
```json
Request:
{
  "email": "owner@business.com",
  "password": "SecurePass123!"
}

Response: 200 OK
{
  "user": { ... },
  "tokens": { ... }
}
```

### POST `/auth/refresh`
Refresh access token
```json
Request:
{
  "refreshToken": "eyJhbG..."
}

Response: 200 OK
{
  "accessToken": "eyJhbG...",
  "expiresIn": 900
}
```

### POST `/auth/logout`
Revoke refresh token

### POST `/auth/forgot-password`
Request password reset

### POST `/auth/reset-password`
Reset password with token

### POST `/auth/verify-email`
Verify email address

### POST `/auth/2fa/enable`
Enable 2FA

### POST `/auth/2fa/verify`
Verify 2FA code

---

## 🏢 BUSINESS / TENANT

### GET `/business`
Get current business details
```json
Response: 200 OK
{
  "id": "uuid",
  "name": "Kamau Enterprises",
  "countryCode": "KE",
  "currency": "KES",
  "taxId": "A123456789Z",
  "vatRegistered": true,
  "vatRate": 16.00,
  "subscriptionTier": "professional",
  "fiscalYearStart": "2024-01-01"
}
```

### PATCH `/business`
Update business details
```json
Request:
{
  "name": "Updated Business Name",
  "phone": "+254722111222",
  "address": "123 Business Street, Nairobi"
}
```

### GET `/business/settings`
Get business settings and preferences

### PATCH `/business/settings`
Update business settings

---

## 👥 USERS & TEAM

### GET `/users`
List all users in tenant
```
Query params: ?role=staff&limit=20&offset=0
```

### POST `/users`
Invite new user
```json
Request:
{
  "email": "accountant@business.com",
  "firstName": "Jane",
  "lastName": "Wanjiru",
  "role": "accountant",
  "permissions": ["invoices.create", "invoices.read", "reports.read"]
}
```

### GET `/users/:id`
Get user details

### PATCH `/users/:id`
Update user

### DELETE `/users/:id`
Deactivate user (soft delete)

### PATCH `/users/:id/role`
Change user role

---

## 📊 CHART OF ACCOUNTS

### GET `/accounts`
List all accounts
```
Query params: ?type=asset&active=true&limit=100
```

```json
Response: 200 OK
{
  "data": [
    {
      "id": "uuid",
      "code": "1000",
      "name": "Cash",
      "type": "asset",
      "balance": 150000.00,
      "isSystem": true,
      "isActive": true
    }
  ],
  "meta": { "total": 45, "page": 1 }
}
```

### POST `/accounts`
Create new account
```json
Request:
{
  "code": "6500",
  "name": "Marketing Expenses",
  "type": "expense",
  "parentId": "uuid-of-parent-account"
}
```

### GET `/accounts/:id`
Get account details with balance

### PATCH `/accounts/:id`
Update account

### DELETE `/accounts/:id`
Deactivate account (cannot delete if has transactions)

### GET `/accounts/:id/balance`
Get account balance for date range

### GET `/accounts/:id/transactions`
Get transactions for account

---

## 📖 JOURNAL ENTRIES

### GET `/journal-entries`
List journal entries
```
Query params: ?status=posted&from=2024-01-01&to=2024-12-31
```

### POST `/journal-entries`
Create manual journal entry
```json
Request:
{
  "entryDate": "2024-01-15",
  "description": "Monthly rent payment",
  "reference": "RENT-JAN-2024",
  "lines": [
    {
      "accountId": "uuid-rent-expense",
      "debit": 50000.00,
      "credit": 0,
      "description": "Office rent January"
    },
    {
      "accountId": "uuid-bank-account",
      "debit": 0,
      "credit": 50000.00,
      "description": "Payment from bank"
    }
  ]
}

Response: 201 Created
{
  "id": "uuid",
  "entryNumber": "JE-2024-0001",
  "status": "draft",
  ...
}
```

### GET `/journal-entries/:id`
Get journal entry details

### POST `/journal-entries/:id/post`
Post journal entry (makes it final)

### POST `/journal-entries/:id/reverse`
Reverse journal entry

### DELETE `/journal-entries/:id`
Delete draft journal entry

---

## 👤 CONTACTS (Customers & Suppliers)

### GET `/contacts`
List all contacts
```
Query params: ?type=customer&search=Acme&limit=50
```

### POST `/contacts`
Create new contact
```json
Request:
{
  "type": "customer",
  "name": "Acme Corporation Ltd",
  "email": "billing@acme.co.ke",
  "phone": "+254712345678",
  "taxId": "A987654321B",
  "address": "Industrial Area, Nairobi",
  "paymentTerms": 30,
  "currency": "KES"
}
```

### GET `/contacts/:id`
Get contact details with balance

### PATCH `/contacts/:id`
Update contact

### DELETE `/contacts/:id`
Deactivate contact

### GET `/contacts/:id/invoices`
Get all invoices for contact

### GET `/contacts/:id/payments`
Get all payments from contact

### GET `/contacts/:id/statement`
Generate account statement for contact
```
Query params: ?from=2024-01-01&to=2024-12-31
```

---

## 🧾 INVOICES

### GET `/invoices`
List all invoices
```
Query params: ?status=sent&from=2024-01-01&customerId=uuid
```

```json
Response: 200 OK
{
  "data": [
    {
      "id": "uuid",
      "invoiceNumber": "INV-KE-202401-0001",
      "customerName": "Acme Corporation",
      "invoiceDate": "2024-01-15",
      "dueDate": "2024-02-14",
      "status": "sent",
      "total": 116000.00,
      "amountPaid": 0,
      "balanceDue": 116000.00,
      "currency": "KES"
    }
  ],
  "meta": { "total": 156, "page": 1 }
}
```

### POST `/invoices`
Create new invoice
```json
Request:
{
  "customerId": "uuid",
  "invoiceDate": "2024-01-15",
  "dueDate": "2024-02-14",
  "currency": "KES",
  "items": [
    {
      "description": "Web Development Services",
      "quantity": 40,
      "unitPrice": 2500.00,
      "taxRate": 16.00
    }
  ],
  "notes": "Thank you for your business",
  "paymentTerms": "Net 30"
}

Response: 201 Created
{
  "id": "uuid",
  "invoiceNumber": "INV-KE-202401-0123",
  "subtotal": 100000.00,
  "taxAmount": 16000.00,
  "total": 116000.00,
  "status": "draft",
  "complianceData": {
    "timsInvoiceId": null // Generated when sent
  }
}
```

### GET `/invoices/:id`
Get invoice details

### PATCH `/invoices/:id`
Update invoice (only if draft)

### DELETE `/invoices/:id`
Delete invoice (only if draft)

### POST `/invoices/:id/send`
Send invoice to customer & submit to tax authority
```json
Request:
{
  "sendEmail": true,
  "emailTo": "customer@example.com"
}

Response: 200 OK
{
  "sentAt": "2024-01-15T10:30:00Z",
  "complianceData": {
    "timsInvoiceId": "KE-2024-INV-123456",
    "timsQrCode": "base64-qr-code-data",
    "submittedAt": "2024-01-15T10:30:05Z"
  }
}
```

### POST `/invoices/:id/mark-paid`
Mark invoice as paid

### POST `/invoices/:id/void`
Void invoice

### GET `/invoices/:id/pdf`
Download invoice as PDF

### POST `/invoices/:id/reminder`
Send payment reminder to customer

### POST `/invoices/bulk-send`
Send multiple invoices at once

---

## 💰 PAYMENTS

### GET `/payments`
List all payments
```
Query params: ?status=completed&from=2024-01-01&method=mobile_money
```

### POST `/payments`
Record new payment
```json
Request:
{
  "paymentDate": "2024-01-20",
  "amount": 116000.00,
  "currency": "KES",
  "contactId": "uuid-customer",
  "method": "mobile_money",
  "methodDetails": {
    "provider": "m-pesa",
    "phone": "+254712345678",
    "transactionId": "ABC123XYZ"
  },
  "reference": "M-PESA ABC123",
  "allocations": [
    {
      "invoiceId": "uuid-invoice",
      "amount": 116000.00
    }
  ]
}

Response: 201 Created
{
  "id": "uuid",
  "paymentNumber": "PAY-2024-0001",
  "status": "completed",
  "journalEntryId": "uuid" // Auto-created journal entry
}
```

### GET `/payments/:id`
Get payment details

### PATCH `/payments/:id`
Update payment (only if pending)

### DELETE `/payments/:id`
Delete payment (only if pending, reverses journal entry)

### POST `/payments/:id/reconcile`
Mark payment as reconciled

### GET `/payments/:id/receipt`
Download payment receipt

---

## 📝 EXPENSES & TRANSACTIONS

### GET `/transactions`
List all transactions
```
Query params: ?type=expense&categoryId=uuid&from=2024-01-01
```

### POST `/transactions`
Create new transaction
```json
Request:
{
  "transactionDate": "2024-01-15",
  "type": "expense",
  "amount": 35000.00,
  "currency": "KES",
  "categoryId": "uuid-rent-category",
  "description": "Office rent - January",
  "reference": "RENT-JAN",
  "paymentMethod": "bank_transfer",
  "taxRate": 0,
  "attachments": ["https://s3.../receipt.jpg"]
}
```

### GET `/transactions/:id`
Get transaction details

### PATCH `/transactions/:id`
Update transaction

### DELETE `/transactions/:id`
Delete transaction (only if draft)

### POST `/transactions/:id/categorize`
Update transaction category (manual override of AI suggestion)

### POST `/transactions/:id/split`
Split transaction into multiple categories

### POST `/transactions/:id/attach-receipt`
Upload receipt image
```
Content-Type: multipart/form-data
```

---

## 📂 CATEGORIES

### GET `/categories`
List all categories
```
Query params: ?type=expense&active=true
```

### POST `/categories`
Create new category
```json
Request:
{
  "name": "Travel & Transportation",
  "type": "expense",
  "color": "#8b5cf6",
  "icon": "car",
  "accountId": "uuid-travel-account"
}
```

### GET `/categories/:id`
Get category details

### PATCH `/categories/:id`
Update category

### DELETE `/categories/:id`
Deactivate category

---

## 📊 REPORTS

### GET `/reports/profit-loss`
Generate Profit & Loss statement
```
Query params: ?from=2024-01-01&to=2024-12-31&format=json
```

```json
Response: 200 OK
{
  "period": { "from": "2024-01-01", "to": "2024-12-31" },
  "currency": "KES",
  "revenue": {
    "salesRevenue": 5000000.00,
    "serviceRevenue": 2500000.00,
    "otherIncome": 100000.00,
    "total": 7600000.00
  },
  "expenses": {
    "rent": 420000.00,
    "salaries": 3600000.00,
    "utilities": 180000.00,
    "marketing": 300000.00,
    "other": 450000.00,
    "total": 4950000.00
  },
  "grossProfit": 7600000.00,
  "netProfit": 2650000.00,
  "profitMargin": 34.87
}
```

### GET `/reports/balance-sheet`
Generate Balance Sheet
```
Query params: ?asOf=2024-12-31
```

### GET `/reports/cash-flow`
Generate Cash Flow statement
```
Query params: ?from=2024-01-01&to=2024-12-31
```

### GET `/reports/trial-balance`
Generate Trial Balance

### GET `/reports/aged-receivables`
Aged Accounts Receivable report

### GET `/reports/aged-payables`
Aged Accounts Payable report

### GET `/reports/tax-summary`
VAT/Tax summary report
```json
Response: 200 OK
{
  "period": { "from": "2024-01-01", "to": "2024-03-31" },
  "taxType": "VAT",
  "totalSales": 10000000.00,
  "totalPurchases": 5000000.00,
  "taxCollected": 1600000.00,
  "taxPaid": 800000.00,
  "netTaxPayable": 800000.00,
  "status": "draft",
  "dueDate": "2024-04-20"
}
```

### GET `/reports/sales-by-customer`
Sales breakdown by customer

### GET `/reports/expenses-by-category`
Expense breakdown by category

### POST `/reports/custom`
Generate custom report with filters

### GET `/reports/:id/export`
Export report as PDF/Excel
```
Query params: ?format=pdf
```

---

## 🧾 TAX RETURNS & COMPLIANCE

### GET `/tax-returns`
List all tax returns
```
Query params: ?taxType=vat&status=draft
```

### POST `/tax-returns`
Create new tax return
```json
Request:
{
  "taxType": "vat",
  "periodStart": "2024-01-01",
  "periodEnd": "2024-03-31"
}

Response: 201 Created
{
  "id": "uuid",
  "totalSales": 10000000.00,
  "taxCollected": 1600000.00,
  "netTaxPayable": 800000.00,
  "status": "draft"
}
```

### GET `/tax-returns/:id`
Get tax return details

### POST `/tax-returns/:id/file`
File tax return with authority
```json
Response: 200 OK
{
  "filedAt": "2024-04-15T14:30:00Z",
  "authorityReference": "KRA-VAT-2024-Q1-123456",
  "compliancePayload": { ... },
  "authorityResponse": { ... }
}
```

### POST `/tax-returns/:id/mark-paid`
Mark tax return as paid

### GET `/tax-returns/:id/pdf`
Download tax return as PDF

---

## 🤖 AI-ASSISTED FEATURES

### POST `/ai/categorize-transaction`
Get AI category suggestion
```json
Request:
{
  "description": "Uber ride to client meeting",
  "amount": 1500.00,
  "merchant": "Uber Technologies"
}

Response: 200 OK
{
  "suggestedCategory": {
    "id": "uuid-transport-category",
    "name": "Transportation",
    "confidence": 0.92
  },
  "alternativeSuggestions": [
    { "id": "uuid", "name": "Client Entertainment", "confidence": 0.65 }
  ],
  "explanation": "Based on the description 'Uber ride', this appears to be a transportation expense."
}
```

### POST `/ai/extract-receipt`
OCR receipt extraction
```
Content-Type: multipart/form-data
File: receipt.jpg
```

```json
Response: 200 OK
{
  "merchant": "Java House",
  "date": "2024-01-15",
  "amount": 2500.00,
  "currency": "KES",
  "taxAmount": 400.00,
  "items": [
    { "description": "Cappuccino", "quantity": 2, "amount": 1000.00 },
    { "description": "Sandwich", "quantity": 1, "amount": 1500.00 }
  ],
  "confidence": 0.88,
  "rawText": "JAVA HOUSE\n..."
}
```

### POST `/ai/tax-insights`
Get tax insights and warnings
```json
Response: 200 OK
{
  "insights": [
    {
      "type": "warning",
      "message": "You're approaching the VAT registration threshold (KES 5,000,000). Current sales: KES 4,750,000",
      "actionRequired": true,
      "dueDate": "2024-02-01"
    },
    {
      "type": "tip",
      "message": "You may be eligible for tax relief on equipment purchases",
      "actionRequired": false
    }
  ]
}
```

### POST `/ai/explain`
Get simple explanation of accounting concepts
```json
Request:
{
  "question": "What is double-entry bookkeeping?"
}

Response: 200 OK
{
  "explanation": "Double-entry bookkeeping means every transaction affects at least two accounts...",
  "example": { ... },
  "relatedConcepts": ["debit", "credit", "journal entry"]
}
```

---

## 📸 OCR & RECEIPT PROCESSING

### POST `/ocr/process`
Process receipt image
```
Content-Type: multipart/form-data
```

### GET `/ocr/jobs/:id`
Get OCR processing status

### GET `/ocr/jobs`
List all OCR jobs

---

## 🔔 NOTIFICATIONS

### GET `/notifications`
List user notifications
```
Query params: ?read=false&limit=20
```

### PATCH `/notifications/:id/read`
Mark notification as read

### PATCH `/notifications/read-all`
Mark all notifications as read

### GET `/notifications/settings`
Get notification preferences

### PATCH `/notifications/settings`
Update notification preferences

---

## 📈 DASHBOARD & ANALYTICS

### GET `/dashboard/summary`
Get dashboard summary data
```json
Response: 200 OK
{
  "totalIncome": 7600000.00,
  "totalExpenses": 4950000.00,
  "netProfit": 2650000.00,
  "profitMargin": 34.87,
  "outstandingInvoices": 5,
  "outstandingAmount": 580000.00,
  "overdueInvoices": 2,
  "overdueAmount": 230000.00,
  "monthlyTrend": [
    { "month": "Jan", "income": 650000, "expenses": 410000 },
    ...
  ]
}
```

### GET `/dashboard/cash-position`
Get current cash position

### GET `/dashboard/upcoming-obligations`
Get upcoming tax and payment obligations

---

## 🔍 SEARCH

### GET `/search`
Global search across all entities
```
Query params: ?q=acme&entities=customers,invoices,transactions
```

```json
Response: 200 OK
{
  "results": {
    "customers": [ ... ],
    "invoices": [ ... ],
    "transactions": [ ... ]
  },
  "total": 23
}
```

---

## 📤 BULK OPERATIONS

### POST `/bulk/invoices/send`
Send multiple invoices

### POST `/bulk/invoices/export`
Export multiple invoices

### POST `/bulk/transactions/import`
Import transactions from CSV

### POST `/bulk/contacts/import`
Import contacts from CSV

---

## 🔧 WEBHOOKS

### GET `/webhooks`
List configured webhooks

### POST `/webhooks`
Create new webhook
```json
Request:
{
  "url": "https://your-app.com/webhooks",
  "events": ["invoice.sent", "payment.received"],
  "secret": "your-webhook-secret"
}
```

### DELETE `/webhooks/:id`
Delete webhook

---

## 🏥 HEALTH & MONITORING

### GET `/health`
Health check endpoint
```json
Response: 200 OK
{
  "status": "healthy",
  "database": "connected",
  "redis": "connected",
  "version": "1.0.0",
  "uptime": 86400
}
```

### GET `/metrics`
Prometheus metrics endpoint

---

## 📝 AUDIT LOGS

### GET `/audit-logs`
List audit logs
```
Query params: ?userId=uuid&action=update&from=2024-01-01
```

```json
Response: 200 OK
{
  "data": [
    {
      "id": "uuid",
      "action": "update",
      "entityType": "invoice",
      "entityId": "uuid",
      "changes": { "status": { "from": "draft", "to": "sent" } },
      "userId": "uuid",
      "userName": "John Kamau",
      "ipAddress": "41.90.xx.xx",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

## 🌍 COUNTRY-SPECIFIC ENDPOINTS

### POST `/compliance/kenya/tims/submit-invoice`
Submit invoice to Kenya TIMS

### POST `/compliance/uganda/efris/submit-invoice`
Submit invoice to Uganda EFRIS

### POST `/compliance/tanzania/vfd/submit-receipt`
Submit receipt to Tanzania VFD

### POST `/compliance/rwanda/ebm/submit-invoice`
Submit invoice to Rwanda EBM

### GET `/compliance/:country/validate-tax-id`
Validate tax ID format
```
Query params: ?taxId=A123456789Z&country=KE
```

---

## ERROR RESPONSES

All endpoints follow consistent error format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invoice amount must be greater than 0",
    "field": "total",
    "details": { ... }
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "uuid"
}
```

**Error Codes:**
- `VALIDATION_ERROR` - Input validation failed
- `AUTHENTICATION_ERROR` - Invalid/expired token
- `AUTHORIZATION_ERROR` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `CONFLICT` - Resource already exists
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_ERROR` - Server error
- `COMPLIANCE_ERROR` - Tax authority submission failed

---

## RATE LIMITING

**Headers in Response:**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 987
X-RateLimit-Reset: 1642248000
```

**Limits by Tier:**
- Free: 100 requests/hour
- Starter: 500 requests/hour
- Professional: 1000 requests/hour
- Enterprise: 5000 requests/hour

---

## PAGINATION

All list endpoints support pagination:
```
Query params: ?limit=50&offset=0&sort=-createdAt
```

**Response:**
```json
{
  "data": [ ... ],
  "meta": {
    "total": 234,
    "limit": 50,
    "offset": 0,
    "page": 1,
    "totalPages": 5
  },
  "links": {
    "first": "/invoices?limit=50&offset=0",
    "prev": null,
    "next": "/invoices?limit=50&offset=50",
    "last": "/invoices?limit=50&offset=200"
  }
}
```

---

**End of API Documentation**
