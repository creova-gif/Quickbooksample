-- =====================================================
-- EAST AFRICA ACCOUNTING PLATFORM - DATABASE SCHEMA
-- PostgreSQL 15+ with TimescaleDB extension
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "timescaledb";

-- =====================================================
-- MULTI-TENANCY & USERS
-- =====================================================

-- Tenants (Business entities)
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    country_code VARCHAR(2) NOT NULL CHECK (country_code IN ('KE', 'TZ', 'UG', 'RW', 'BI')),
    currency VARCHAR(3) NOT NULL,
    timezone VARCHAR(50) DEFAULT 'Africa/Nairobi',
    
    -- Tax & Compliance
    tax_id VARCHAR(50), -- KRA PIN, TIN, NIF
    registration_number VARCHAR(50),
    vat_registered BOOLEAN DEFAULT false,
    vat_rate DECIMAL(5,2) DEFAULT 16.00,
    
    -- Contact Information
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    
    -- Business Details
    industry VARCHAR(100),
    fiscal_year_start DATE DEFAULT '2024-01-01',
    
    -- Compliance Metadata (country-specific)
    compliance_metadata JSONB DEFAULT '{}',
    
    -- Subscription & Billing
    subscription_tier VARCHAR(20) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'starter', 'professional', 'enterprise')),
    subscription_status VARCHAR(20) DEFAULT 'active' CHECK (subscription_status IN ('active', 'suspended', 'cancelled')),
    subscription_expires_at TIMESTAMP,
    
    -- Audit
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,
    
    -- Indexes
    CONSTRAINT valid_tax_id CHECK (tax_id IS NULL OR LENGTH(tax_id) > 0)
);

CREATE INDEX idx_tenants_country ON tenants(country_code) WHERE deleted_at IS NULL;
CREATE INDEX idx_tenants_subscription ON tenants(subscription_status) WHERE deleted_at IS NULL;

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Authentication
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT false,
    email_verified_at TIMESTAMP,
    
    -- Profile
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    avatar_url TEXT,
    
    -- Role & Permissions
    role VARCHAR(20) NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'admin', 'accountant', 'staff', 'auditor')),
    permissions JSONB DEFAULT '[]',
    
    -- Security
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret VARCHAR(255),
    last_login_at TIMESTAMP,
    last_login_ip INET,
    
    -- Preferences
    language VARCHAR(5) DEFAULT 'en',
    preferences JSONB DEFAULT '{}',
    
    -- Audit
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_users_tenant ON users(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role ON users(tenant_id, role) WHERE deleted_at IS NULL;

-- Refresh Tokens (stored in Redis in production, here for reference)
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    revoked_at TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);

-- =====================================================
-- CHART OF ACCOUNTS
-- =====================================================

CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Account Details
    code VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
    subtype VARCHAR(50), -- e.g., 'current_asset', 'fixed_asset', 'operating_expense'
    
    -- Hierarchy
    parent_id UUID REFERENCES accounts(id),
    level INTEGER DEFAULT 0,
    
    -- Properties
    is_system BOOLEAN DEFAULT false, -- Cannot be deleted
    is_active BOOLEAN DEFAULT true,
    is_reconcilable BOOLEAN DEFAULT false, -- Can be reconciled (bank accounts)
    
    -- Balance Tracking
    balance DECIMAL(15,2) DEFAULT 0.00,
    debit_balance DECIMAL(15,2) DEFAULT 0.00,
    credit_balance DECIMAL(15,2) DEFAULT 0.00,
    
    -- Metadata
    description TEXT,
    tags JSONB DEFAULT '[]',
    
    -- Audit
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,
    created_by UUID REFERENCES users(id),
    
    CONSTRAINT unique_account_code UNIQUE (tenant_id, code)
);

CREATE INDEX idx_accounts_tenant ON accounts(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_accounts_type ON accounts(tenant_id, type) WHERE deleted_at IS NULL;
CREATE INDEX idx_accounts_parent ON accounts(parent_id) WHERE deleted_at IS NULL;

-- =====================================================
-- JOURNAL ENTRIES (DOUBLE-ENTRY BOOKKEEPING)
-- =====================================================

CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Entry Details
    entry_date DATE NOT NULL,
    entry_number VARCHAR(50) NOT NULL,
    reference VARCHAR(100), -- External reference (invoice #, receipt #)
    description TEXT NOT NULL,
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'reversed', 'voided')),
    posted_at TIMESTAMP,
    reversed_at TIMESTAMP,
    reversed_by_id UUID REFERENCES journal_entries(id),
    
    -- Metadata
    source_type VARCHAR(50), -- 'invoice', 'payment', 'expense', 'manual'
    source_id UUID, -- Reference to source record
    tags JSONB DEFAULT '[]',
    
    -- Audit
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,
    created_by UUID REFERENCES users(id),
    posted_by UUID REFERENCES users(id),
    
    CONSTRAINT unique_entry_number UNIQUE (tenant_id, entry_number)
);

CREATE INDEX idx_journal_entries_tenant ON journal_entries(tenant_id, entry_date DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_journal_entries_status ON journal_entries(tenant_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_journal_entries_source ON journal_entries(source_type, source_id) WHERE deleted_at IS NULL;

-- Convert to hypertable for time-series optimization
SELECT create_hypertable('journal_entries', 'created_at', if_not_exists => TRUE);

-- Journal Entry Lines (MUST BALANCE: SUM(debits) = SUM(credits))
CREATE TABLE journal_entry_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id),
    
    -- Double-Entry Amounts
    debit DECIMAL(15,2) DEFAULT 0.00 CHECK (debit >= 0),
    credit DECIMAL(15,2) DEFAULT 0.00 CHECK (credit >= 0),
    
    -- Description
    description TEXT,
    
    -- Audit
    created_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT debit_or_credit CHECK (
        (debit > 0 AND credit = 0) OR (credit > 0 AND debit = 0)
    )
);

CREATE INDEX idx_journal_lines_entry ON journal_entry_lines(journal_entry_id);
CREATE INDEX idx_journal_lines_account ON journal_entry_lines(account_id);

-- =====================================================
-- CUSTOMERS & SUPPLIERS
-- =====================================================

CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Type
    type VARCHAR(20) NOT NULL CHECK (type IN ('customer', 'supplier', 'both')),
    
    -- Basic Info
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    mobile VARCHAR(20),
    
    -- Address
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    country_code VARCHAR(2),
    
    -- Tax & Compliance
    tax_id VARCHAR(50), -- PIN, TIN, NIF
    registration_number VARCHAR(50),
    
    -- Financial
    currency VARCHAR(3),
    payment_terms INTEGER DEFAULT 30, -- Days
    credit_limit DECIMAL(15,2),
    
    -- Balances
    total_invoiced DECIMAL(15,2) DEFAULT 0.00,
    total_paid DECIMAL(15,2) DEFAULT 0.00,
    balance DECIMAL(15,2) DEFAULT 0.00,
    
    -- Metadata
    notes TEXT,
    tags JSONB DEFAULT '[]',
    custom_fields JSONB DEFAULT '{}',
    
    -- Audit
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_contacts_tenant ON contacts(tenant_id, type) WHERE deleted_at IS NULL;
CREATE INDEX idx_contacts_name ON contacts(tenant_id, name) WHERE deleted_at IS NULL;

-- =====================================================
-- INVOICES & QUOTES
-- =====================================================

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Type & Status
    type VARCHAR(20) DEFAULT 'invoice' CHECK (type IN ('invoice', 'quote', 'credit_note', 'debit_note')),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'paid', 'partial', 'overdue', 'cancelled', 'void')),
    
    -- Numbers
    invoice_number VARCHAR(50) NOT NULL,
    reference VARCHAR(100),
    
    -- Customer
    customer_id UUID REFERENCES contacts(id),
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20),
    customer_address TEXT,
    customer_tax_id VARCHAR(50),
    
    -- Dates
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    sent_at TIMESTAMP,
    viewed_at TIMESTAMP,
    paid_at TIMESTAMP,
    
    -- Amounts
    currency VARCHAR(3) NOT NULL,
    subtotal DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    discount DECIMAL(15,2) DEFAULT 0.00,
    tax_amount DECIMAL(15,2) DEFAULT 0.00,
    total DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    amount_paid DECIMAL(15,2) DEFAULT 0.00,
    balance_due DECIMAL(15,2) DEFAULT 0.00,
    
    -- Terms & Notes
    payment_terms TEXT,
    notes TEXT,
    footer TEXT,
    
    -- Attachments
    attachment_urls JSONB DEFAULT '[]',
    
    -- Compliance Data (country-specific)
    compliance_data JSONB DEFAULT '{}',
    -- {
    --   "timsInvoiceId": "KE-2024-000123",
    --   "timsQrCode": "base64...",
    --   "efrisInvoiceId": "UG-2024-000456",
    --   "efrisFdmSignature": "signature...",
    --   "vfdReceiptNumber": "TZ-2024-000789",
    --   "ebmInvoiceId": "RW-2024-001011"
    -- }
    
    -- Audit
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,
    created_by UUID REFERENCES users(id),
    
    CONSTRAINT unique_invoice_number UNIQUE (tenant_id, invoice_number)
);

CREATE INDEX idx_invoices_tenant ON invoices(tenant_id, invoice_date DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_invoices_customer ON invoices(customer_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_invoices_status ON invoices(tenant_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_invoices_due_date ON invoices(tenant_id, due_date) WHERE status IN ('sent', 'partial', 'overdue');

-- Invoice Line Items
CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    
    -- Item Details
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1.00,
    unit_price DECIMAL(15,2) NOT NULL,
    
    -- Tax
    tax_rate DECIMAL(5,2) DEFAULT 0.00,
    tax_amount DECIMAL(15,2) DEFAULT 0.00,
    
    -- Totals
    subtotal DECIMAL(15,2) NOT NULL,
    total DECIMAL(15,2) NOT NULL,
    
    -- Sort Order
    line_order INTEGER DEFAULT 0,
    
    -- Audit
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_invoice_items_invoice ON invoice_items(invoice_id);

-- =====================================================
-- PAYMENTS
-- =====================================================

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Payment Details
    payment_number VARCHAR(50) NOT NULL,
    payment_date DATE NOT NULL,
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) NOT NULL,
    
    -- Payer
    contact_id UUID REFERENCES contacts(id),
    contact_name VARCHAR(255) NOT NULL,
    
    -- Payment Method
    method VARCHAR(50) NOT NULL, -- 'mobile_money', 'bank_transfer', 'cash', 'card', 'check'
    method_details JSONB DEFAULT '{}',
    -- {
    --   "provider": "m-pesa",
    --   "phone": "+254712345678",
    --   "transaction_id": "ABC123XYZ",
    --   "bank_name": "KCB",
    --   "account_number": "****1234"
    -- }
    
    -- Reference
    reference VARCHAR(100),
    notes TEXT,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')),
    
    -- Reconciliation
    reconciled BOOLEAN DEFAULT false,
    reconciled_at TIMESTAMP,
    reconciled_by UUID REFERENCES users(id),
    
    -- Audit
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,
    created_by UUID REFERENCES users(id),
    
    CONSTRAINT unique_payment_number UNIQUE (tenant_id, payment_number)
);

CREATE INDEX idx_payments_tenant ON payments(tenant_id, payment_date DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_payments_contact ON payments(contact_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_payments_status ON payments(status) WHERE deleted_at IS NULL;

-- Payment Allocations (Payments can be split across multiple invoices)
CREATE TABLE payment_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payment_allocations_payment ON payment_allocations(payment_id);
CREATE INDEX idx_payment_allocations_invoice ON payment_allocations(invoice_id);

-- =====================================================
-- EXPENSES & TRANSACTIONS
-- =====================================================

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    
    -- Linked Account
    account_id UUID REFERENCES accounts(id),
    
    -- Visual
    color VARCHAR(7),
    icon VARCHAR(50),
    
    -- Properties
    is_system BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    
    -- Audit
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,
    
    CONSTRAINT unique_category_name UNIQUE (tenant_id, name)
);

CREATE INDEX idx_categories_tenant ON categories(tenant_id, type) WHERE deleted_at IS NULL;

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Transaction Details
    transaction_date DATE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) NOT NULL,
    
    -- Categorization
    category_id UUID REFERENCES categories(id),
    contact_id UUID REFERENCES contacts(id),
    
    -- Description
    description TEXT NOT NULL,
    reference VARCHAR(100),
    
    -- Tax
    tax_rate DECIMAL(5,2) DEFAULT 0.00,
    tax_amount DECIMAL(15,2) DEFAULT 0.00,
    
    -- Payment Method
    payment_method VARCHAR(50),
    payment_method_details JSONB DEFAULT '{}',
    
    -- Attachments (receipts)
    attachment_urls JSONB DEFAULT '[]',
    
    -- OCR Data (from receipt scanning)
    ocr_data JSONB DEFAULT '{}',
    
    -- AI Categorization
    ai_suggested_category_id UUID REFERENCES categories(id),
    ai_confidence DECIMAL(3,2), -- 0.00 to 1.00
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'reconciled', 'void')),
    
    -- Reconciliation
    reconciled BOOLEAN DEFAULT false,
    reconciled_at TIMESTAMP,
    
    -- Linked Journal Entry
    journal_entry_id UUID REFERENCES journal_entries(id),
    
    -- Audit
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_transactions_tenant ON transactions(tenant_id, transaction_date DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_transactions_category ON transactions(category_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_transactions_type ON transactions(tenant_id, type) WHERE deleted_at IS NULL;

-- Convert to hypertable
SELECT create_hypertable('transactions', 'created_at', if_not_exists => TRUE);

-- =====================================================
-- TAX RETURNS & COMPLIANCE
-- =====================================================

CREATE TABLE tax_returns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Period
    tax_type VARCHAR(50) NOT NULL, -- 'vat', 'income_tax', 'withholding_tax'
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Amounts
    total_sales DECIMAL(15,2) DEFAULT 0.00,
    total_purchases DECIMAL(15,2) DEFAULT 0.00,
    tax_collected DECIMAL(15,2) DEFAULT 0.00,
    tax_paid DECIMAL(15,2) DEFAULT 0.00,
    net_tax DECIMAL(15,2) DEFAULT 0.00,
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'filed', 'paid', 'overdue')),
    filed_at TIMESTAMP,
    paid_at TIMESTAMP,
    
    -- Compliance Payload (submitted to authority)
    compliance_payload JSONB DEFAULT '{}',
    
    -- Response from Authority
    authority_response JSONB DEFAULT '{}',
    authority_reference VARCHAR(100),
    
    -- Audit
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,
    created_by UUID REFERENCES users(id),
    filed_by UUID REFERENCES users(id)
);

CREATE INDEX idx_tax_returns_tenant ON tax_returns(tenant_id, period_end DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_tax_returns_status ON tax_returns(status) WHERE deleted_at IS NULL;

-- =====================================================
-- AUDIT LOGS (IMMUTABLE)
-- =====================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Action Details
    action VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete', 'login', 'export'
    entity_type VARCHAR(50) NOT NULL, -- 'invoice', 'payment', 'user'
    entity_id UUID,
    
    -- Changes (before/after)
    changes JSONB DEFAULT '{}',
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    request_id UUID,
    
    -- Timestamp (IMMUTABLE - never updated/deleted)
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id, created_at DESC);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- Convert to hypertable
SELECT create_hypertable('audit_logs', 'created_at', if_not_exists => TRUE);

-- =====================================================
-- REPORTS CACHE
-- =====================================================

CREATE TABLE report_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Report Details
    report_type VARCHAR(50) NOT NULL, -- 'profit_loss', 'balance_sheet', 'cash_flow', 'tax_summary'
    parameters JSONB NOT NULL, -- Date range, filters, etc.
    
    -- Data
    data JSONB NOT NULL,
    
    -- Expiry
    expires_at TIMESTAMP NOT NULL,
    
    -- Audit
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_report_cache_tenant ON report_cache(tenant_id, report_type, expires_at);

-- =====================================================
-- BACKGROUND JOBS (Queue)
-- =====================================================

CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Job Details
    job_type VARCHAR(50) NOT NULL, -- 'send_invoice', 'generate_report', 'process_ocr'
    payload JSONB NOT NULL,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    
    -- Result
    result JSONB DEFAULT '{}',
    error TEXT,
    
    -- Scheduling
    scheduled_for TIMESTAMP DEFAULT NOW(),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_jobs_status ON jobs(status, scheduled_for);
CREATE INDEX idx_jobs_tenant ON jobs(tenant_id, created_at DESC);

-- =====================================================
-- ROW-LEVEL SECURITY (RLS) - Multi-Tenancy Enforcement
-- =====================================================

-- Enable RLS on all tenant-scoped tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entry_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_returns ENABLE ROW LEVEL SECURITY;

-- Example RLS Policy (repeat for each table)
CREATE POLICY tenant_isolation_policy ON invoices
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Account Balances View
CREATE VIEW account_balances AS
SELECT 
    a.id,
    a.tenant_id,
    a.code,
    a.name,
    a.type,
    COALESCE(SUM(jel.debit), 0) as total_debit,
    COALESCE(SUM(jel.credit), 0) as total_credit,
    COALESCE(SUM(jel.debit) - SUM(jel.credit), 0) as balance
FROM accounts a
LEFT JOIN journal_entry_lines jel ON a.id = jel.account_id
WHERE a.deleted_at IS NULL
GROUP BY a.id, a.tenant_id, a.code, a.name, a.type;

-- Outstanding Invoices View
CREATE VIEW outstanding_invoices AS
SELECT 
    i.id,
    i.tenant_id,
    i.invoice_number,
    i.customer_name,
    i.invoice_date,
    i.due_date,
    i.total,
    i.amount_paid,
    i.balance_due,
    CASE 
        WHEN i.due_date < CURRENT_DATE THEN 'overdue'
        WHEN i.due_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'due_soon'
        ELSE 'current'
    END as payment_status
FROM invoices i
WHERE i.status IN ('sent', 'partial', 'overdue')
    AND i.balance_due > 0
    AND i.deleted_at IS NULL;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- ... repeat for other tables

-- =====================================================
-- SAMPLE DATA SEED (for development)
-- =====================================================

-- Insert sample tenant (Kenya)
INSERT INTO tenants (id, name, country_code, currency, tax_id, vat_registered, vat_rate)
VALUES (
    'c7a9d4b5-6e8f-4a1c-9b2d-3e4f5a6b7c8d',
    'Demo Business Kenya',
    'KE',
    'KES',
    'A123456789Z',
    true,
    16.00
);

-- Insert owner user
INSERT INTO users (id, tenant_id, email, password_hash, first_name, last_name, role, email_verified)
VALUES (
    'd8b0e5c6-7f9g-5b2e-0c3f-4g5h6i7j8k9l',
    'c7a9d4b5-6e8f-4a1c-9b2d-3e4f5a6b7c8d',
    'owner@demobusiness.co.ke',
    '$2b$10$abcdefghijklmnopqrstuvwxyz', -- bcrypt hash
    'John',
    'Kamau',
    'owner',
    true
);

-- =====================================================
-- END OF SCHEMA
-- =====================================================
