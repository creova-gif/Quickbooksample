// Core Type Definitions for East Africa Accounting Platform

export type CountryCode = 'KE' | 'TZ' | 'UG' | 'RW' | 'BI';

export interface Country {
  code: CountryCode;
  name: string;
  currency: string;
  currencySymbol: string;
  vatRate: number;
  vatName: string;
  flag: string;
  complianceSystem?: string;
  fiscalYearStart: string; // MM-DD format
  dateFormat: string;
  numberFormat: {
    decimal: string;
    thousands: string;
  };
}

export interface Business {
  id: string;
  name: string;
  countryCode: CountryCode;
  currency: string;
  currencySymbol?: string;
  taxId?: string;
  registrationNumber?: string;
  phone?: string;
  email?: string;
  address?: string;
  industry?: string;
  vatRegistered: boolean;
  complianceSystem?: string;
  createdAt: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  code: string;
  balance: number;
  isSystem: boolean;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon?: string;
  color?: string;
  isSystem: boolean;
}

export interface Transaction {
  id: string;
  businessId?: string;
  date: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number; // Net amount (before VAT)
  vatRate: number; // e.g. 0.16, 0.18
  vatAmount: number; // computed: amount × vatRate
  totalAmount: number; // amount + vatAmount
  currency: 'KES' | 'UGX' | 'TZS' | 'RWF' | 'BIF';
  categoryId: string;
  description: string;
  paymentMethod: 'cash' | 'bank' | 'mobile_money' | 'mpesa' | 'airtel' | 'mtn' | 'tigo';
  reference?: string;
  attachments?: string[];
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'posted' | 'synced'; // draft=editing, posted=locked, synced=sent to tax authority
  syncedAt?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number; // quantity × unitPrice
  categoryId?: string;
}

export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'voided' | 'reversed';

export interface Invoice {
  id: string;
  businessId?: string;
  invoiceNumber: string; // Sequential, server-generated, immutable
  customerId?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerTaxId?: string;
  
  currency: 'KES' | 'UGX' | 'TZS' | 'RWF' | 'BIF';
  
  issueDate: string;
  dueDate: string;
  
  status: InvoiceStatus; // draft → issued → paid / voided / reversed
  
  // Amounts (accounting-safe)
  subtotal: number; // Before tax
  vatRate: number; // e.g., 0.16
  vatAmount: number; // Computed
  totalAmount: number; // subtotal + vatAmount
  balanceDue: number; // Reduces with payments
  
  items: InvoiceItem[];
  
  notes?: string;
  terms?: string;
  
  // Audit trail
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  issuedAt?: string;
  paidAt?: string;
  
  // Tax authority sync
  taxSyncStatus: 'pending' | 'synced' | 'failed';
  taxSyncedAt?: string;
  taxSyncError?: string;
  
  // Reversal tracking
  reversalOf?: string; // Original invoice ID if this is a reversal
  reversedBy?: string; // Reversal invoice ID if this was reversed
  
  // Country-specific compliance fields
  complianceData?: {
    // Kenya TIMS
    timsInvoiceId?: string;
    timsQrCode?: string;
    
    // Tanzania VFD/TRA
    vfdReceiptNumber?: string;
    vfdVerificationCode?: string;
    
    // Uganda EFRIS
    efrisInvoiceId?: string;
    efrisFdmSignature?: string;
    
    // Rwanda EBM
    ebmInvoiceId?: string;
    ebmSdcId?: string;
    
    // General
    verificationUrl?: string;
  };
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  totalInvoiced: number;
  totalPaid: number;
  createdAt: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'mobile_money' | 'bank' | 'cash' | 'card';
  provider?: string; // M-Pesa, Airtel Money, etc.
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  date: string;
  methodId: string;
  reference?: string;
  notes?: string;
  createdAt: string;
}

export interface TaxReport {
  period: string;
  startDate: string;
  endDate: string;
  totalSales: number;
  totalPurchases: number;
  taxCollected: number;
  taxPaid: number;
  netTax: number;
  status: 'draft' | 'filed';
}

export interface FinancialReport {
  type: 'profit_loss' | 'balance_sheet' | 'cash_flow';
  startDate: string;
  endDate: string;
  data: any;
  generatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'accountant' | 'staff';
  businesses: string[];
}

export interface JournalEntry {
  id: string;
  date: string;
  description: string;
  reference?: string;
  entries: {
    accountId: string;
    debit: number;
    credit: number;
  }[];
  createdAt: string;
  createdBy: string;
}

export interface LedgerEntry {
  id: string;
  transactionId?: string;
  invoiceId?: string;
  paymentId?: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  currency: 'KES' | 'UGX' | 'TZS' | 'RWF' | 'BIF';
  entryDate: string; // ISO date
  description: string;
  reference?: string;
  createdBy: string;
  createdAt: string;
  isReversed: boolean;
  reversalOf?: string; // ID of entry being reversed
}

export interface TaxSyncQueue {
  id: string;
  entityType: 'invoice' | 'transaction' | 'payment';
  entityId: string;
  payload: any; // Tax authority specific payload
  authority: 'TIMS' | 'EFRIS' | 'VFD' | 'EBM' | 'Generic';
  status: 'pending' | 'synced' | 'failed';
  retries: number;
  lastAttempt?: string;
  errorMessage?: string;
  createdAt: string;
  syncedAt?: string;
}

export interface AuditLog {
  id: string;
  entityType: 'invoice' | 'transaction' | 'ledger' | 'payment' | 'business' | 'user';
  entityId: string;
  action: 'create' | 'update' | 'post' | 'reverse' | 'void' | 'delete' | 'sync';
  before?: any; // State before change
  after?: any; // State after change
  performedBy: string;
  performedAt: string;
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    reason?: string;
  };
}