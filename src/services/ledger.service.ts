/**
 * Ledger Service - Double-Entry Accounting
 * 
 * CRITICAL RULES:
 * 1. Total debits must equal total credits
 * 2. Ledger entries are IMMUTABLE
 * 3. Reversals create inverse entries
 * 4. Every financial transaction posts to ledger
 */

import { LedgerEntry, Invoice, Transaction, Payment } from '@/types';

/**
 * Chart of Accounts - System Accounts
 */
export const SYSTEM_ACCOUNTS = {
  // Assets
  CASH: { id: 'acc_cash', code: '1000', name: 'Cash', type: 'asset' },
  BANK: { id: 'acc_bank', code: '1010', name: 'Bank Account', type: 'asset' },
  ACCOUNTS_RECEIVABLE: { id: 'acc_ar', code: '1200', name: 'Accounts Receivable', type: 'asset' },
  
  // Liabilities
  ACCOUNTS_PAYABLE: { id: 'acc_ap', code: '2000', name: 'Accounts Payable', type: 'liability' },
  VAT_PAYABLE: { id: 'acc_vat_payable', code: '2100', name: 'VAT Payable', type: 'liability' },
  VAT_RECEIVABLE: { id: 'acc_vat_receivable', code: '2110', name: 'VAT Receivable', type: 'asset' },
  
  // Equity
  OWNERS_EQUITY: { id: 'acc_equity', code: '3000', name: "Owner's Equity", type: 'equity' },
  RETAINED_EARNINGS: { id: 'acc_retained', code: '3100', name: 'Retained Earnings', type: 'equity' },
  
  // Revenue
  SALES_REVENUE: { id: 'acc_revenue', code: '4000', name: 'Sales Revenue', type: 'revenue' },
  SERVICE_REVENUE: { id: 'acc_service', code: '4010', name: 'Service Revenue', type: 'revenue' },
  
  // Expenses
  COST_OF_GOODS: { id: 'acc_cogs', code: '5000', name: 'Cost of Goods Sold', type: 'expense' },
  OPERATING_EXPENSES: { id: 'acc_opex', code: '6000', name: 'Operating Expenses', type: 'expense' },
} as const;

/**
 * Create a ledger entry
 */
function createLedgerEntry(params: {
  accountId: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  currency: string;
  entryDate: string;
  description: string;
  reference?: string;
  transactionId?: string;
  invoiceId?: string;
  paymentId?: string;
  createdBy: string;
}): LedgerEntry {
  return {
    id: crypto.randomUUID(),
    ...params,
    createdAt: new Date().toISOString(),
    isReversed: false,
  };
}

/**
 * Validate that debits equal credits
 */
export function validateDoubleEntry(entries: LedgerEntry[]): {
  valid: boolean;
  totalDebits: number;
  totalCredits: number;
  difference: number;
  error?: string;
} {
  const totalDebits = entries.reduce((sum, e) => sum + e.debit, 0);
  const totalCredits = entries.reduce((sum, e) => sum + e.credit, 0);
  const difference = Math.abs(totalDebits - totalCredits);
  
  // Allow for rounding errors (1 cent)
  const valid = difference < 0.01;
  
  return {
    valid,
    totalDebits: Math.round(totalDebits * 100) / 100,
    totalCredits: Math.round(totalCredits * 100) / 100,
    difference: Math.round(difference * 100) / 100,
    error: valid ? undefined : `Debits (${totalDebits}) ≠ Credits (${totalCredits})`,
  };
}

/**
 * Post Invoice to Ledger (when issued)
 * 
 * Example: Invoice of 10,000 + 16% VAT = 11,600
 * 
 * Debit:  Accounts Receivable  11,600
 * Credit: Sales Revenue        10,000
 * Credit: VAT Payable           1,600
 */
export function postInvoiceToLedger(
  invoice: Invoice,
  createdBy: string
): LedgerEntry[] {
  const entries: LedgerEntry[] = [];
  
  // Debit: Accounts Receivable (total amount)
  entries.push(createLedgerEntry({
    accountId: SYSTEM_ACCOUNTS.ACCOUNTS_RECEIVABLE.id,
    accountCode: SYSTEM_ACCOUNTS.ACCOUNTS_RECEIVABLE.code,
    accountName: SYSTEM_ACCOUNTS.ACCOUNTS_RECEIVABLE.name,
    debit: invoice.totalAmount,
    credit: 0,
    currency: invoice.currency,
    entryDate: invoice.issueDate,
    description: `Invoice ${invoice.invoiceNumber} - ${invoice.customerName}`,
    reference: invoice.invoiceNumber,
    invoiceId: invoice.id,
    createdBy,
  }));
  
  // Credit: Revenue (subtotal)
  entries.push(createLedgerEntry({
    accountId: SYSTEM_ACCOUNTS.SALES_REVENUE.id,
    accountCode: SYSTEM_ACCOUNTS.SALES_REVENUE.code,
    accountName: SYSTEM_ACCOUNTS.SALES_REVENUE.name,
    debit: 0,
    credit: invoice.subtotal,
    currency: invoice.currency,
    entryDate: invoice.issueDate,
    description: `Invoice ${invoice.invoiceNumber} - ${invoice.customerName}`,
    reference: invoice.invoiceNumber,
    invoiceId: invoice.id,
    createdBy,
  }));
  
  // Credit: VAT Payable (tax amount)
  if (invoice.vatAmount > 0) {
    entries.push(createLedgerEntry({
      accountId: SYSTEM_ACCOUNTS.VAT_PAYABLE.id,
      accountCode: SYSTEM_ACCOUNTS.VAT_PAYABLE.code,
      accountName: SYSTEM_ACCOUNTS.VAT_PAYABLE.name,
      debit: 0,
      credit: invoice.vatAmount,
      currency: invoice.currency,
      entryDate: invoice.issueDate,
      description: `VAT on Invoice ${invoice.invoiceNumber}`,
      reference: invoice.invoiceNumber,
      invoiceId: invoice.id,
      createdBy,
    }));
  }
  
  // Validate
  const validation = validateDoubleEntry(entries);
  if (!validation.valid) {
    throw new Error(`Double-entry validation failed: ${validation.error}`);
  }
  
  return entries;
}

/**
 * Post Payment to Ledger
 * 
 * Example: Cash payment of 11,600 against invoice
 * 
 * Debit:  Cash                 11,600
 * Credit: Accounts Receivable  11,600
 */
export function postPaymentToLedger(
  payment: Payment,
  invoice: Invoice,
  paymentMethod: 'cash' | 'bank' | 'mobile_money',
  createdBy: string
): LedgerEntry[] {
  const entries: LedgerEntry[] = [];
  
  // Determine cash account based on payment method
  const cashAccount = paymentMethod === 'bank' 
    ? SYSTEM_ACCOUNTS.BANK 
    : SYSTEM_ACCOUNTS.CASH;
  
  // Debit: Cash/Bank (payment amount)
  entries.push(createLedgerEntry({
    accountId: cashAccount.id,
    accountCode: cashAccount.code,
    accountName: cashAccount.name,
    debit: payment.amount,
    credit: 0,
    currency: invoice.currency,
    entryDate: payment.date,
    description: `Payment for Invoice ${invoice.invoiceNumber}`,
    reference: payment.reference || invoice.invoiceNumber,
    paymentId: payment.id,
    invoiceId: invoice.id,
    createdBy,
  }));
  
  // Credit: Accounts Receivable (payment amount)
  entries.push(createLedgerEntry({
    accountId: SYSTEM_ACCOUNTS.ACCOUNTS_RECEIVABLE.id,
    accountCode: SYSTEM_ACCOUNTS.ACCOUNTS_RECEIVABLE.code,
    accountName: SYSTEM_ACCOUNTS.ACCOUNTS_RECEIVABLE.name,
    debit: 0,
    credit: payment.amount,
    currency: invoice.currency,
    entryDate: payment.date,
    description: `Payment for Invoice ${invoice.invoiceNumber}`,
    reference: payment.reference || invoice.invoiceNumber,
    paymentId: payment.id,
    invoiceId: invoice.id,
    createdBy,
  }));
  
  // Validate
  const validation = validateDoubleEntry(entries);
  if (!validation.valid) {
    throw new Error(`Double-entry validation failed: ${validation.error}`);
  }
  
  return entries;
}

/**
 * Post Transaction to Ledger (income/expense)
 * 
 * Example: Income transaction of 5,000 + 16% VAT = 5,800
 * 
 * Debit:  Cash                 5,800
 * Credit: Sales Revenue        5,000
 * Credit: VAT Payable            800
 */
export function postTransactionToLedger(
  transaction: Transaction,
  createdBy: string
): LedgerEntry[] {
  const entries: LedgerEntry[] = [];
  
  if (transaction.type === 'income') {
    // Income: Cash increases, Revenue increases
    
    // Debit: Cash
    entries.push(createLedgerEntry({
      accountId: SYSTEM_ACCOUNTS.CASH.id,
      accountCode: SYSTEM_ACCOUNTS.CASH.code,
      accountName: SYSTEM_ACCOUNTS.CASH.name,
      debit: transaction.totalAmount,
      credit: 0,
      currency: transaction.currency,
      entryDate: transaction.date,
      description: transaction.description,
      reference: transaction.reference,
      transactionId: transaction.id,
      createdBy,
    }));
    
    // Credit: Revenue
    entries.push(createLedgerEntry({
      accountId: SYSTEM_ACCOUNTS.SALES_REVENUE.id,
      accountCode: SYSTEM_ACCOUNTS.SALES_REVENUE.code,
      accountName: SYSTEM_ACCOUNTS.SALES_REVENUE.name,
      debit: 0,
      credit: transaction.amount,
      currency: transaction.currency,
      entryDate: transaction.date,
      description: transaction.description,
      reference: transaction.reference,
      transactionId: transaction.id,
      createdBy,
    }));
    
    // Credit: VAT Payable
    if (transaction.vatAmount > 0) {
      entries.push(createLedgerEntry({
        accountId: SYSTEM_ACCOUNTS.VAT_PAYABLE.id,
        accountCode: SYSTEM_ACCOUNTS.VAT_PAYABLE.code,
        accountName: SYSTEM_ACCOUNTS.VAT_PAYABLE.name,
        debit: 0,
        credit: transaction.vatAmount,
        currency: transaction.currency,
        entryDate: transaction.date,
        description: `VAT on ${transaction.description}`,
        reference: transaction.reference,
        transactionId: transaction.id,
        createdBy,
      }));
    }
  } else if (transaction.type === 'expense') {
    // Expense: Cash decreases, Expense increases
    
    // Debit: Operating Expenses
    entries.push(createLedgerEntry({
      accountId: SYSTEM_ACCOUNTS.OPERATING_EXPENSES.id,
      accountCode: SYSTEM_ACCOUNTS.OPERATING_EXPENSES.code,
      accountName: SYSTEM_ACCOUNTS.OPERATING_EXPENSES.name,
      debit: transaction.amount,
      credit: 0,
      currency: transaction.currency,
      entryDate: transaction.date,
      description: transaction.description,
      reference: transaction.reference,
      transactionId: transaction.id,
      createdBy,
    }));
    
    // Debit: VAT Receivable (VAT on purchases can be reclaimed)
    if (transaction.vatAmount > 0) {
      entries.push(createLedgerEntry({
        accountId: SYSTEM_ACCOUNTS.VAT_RECEIVABLE.id,
        accountCode: SYSTEM_ACCOUNTS.VAT_RECEIVABLE.code,
        accountName: SYSTEM_ACCOUNTS.VAT_RECEIVABLE.name,
        debit: transaction.vatAmount,
        credit: 0,
        currency: transaction.currency,
        entryDate: transaction.date,
        description: `VAT on ${transaction.description}`,
        reference: transaction.reference,
        transactionId: transaction.id,
        createdBy,
      }));
    }
    
    // Credit: Cash
    entries.push(createLedgerEntry({
      accountId: SYSTEM_ACCOUNTS.CASH.id,
      accountCode: SYSTEM_ACCOUNTS.CASH.code,
      accountName: SYSTEM_ACCOUNTS.CASH.name,
      debit: 0,
      credit: transaction.totalAmount,
      currency: transaction.currency,
      entryDate: transaction.date,
      description: transaction.description,
      reference: transaction.reference,
      transactionId: transaction.id,
      createdBy,
    }));
  }
  
  // Validate
  const validation = validateDoubleEntry(entries);
  if (!validation.valid) {
    throw new Error(`Double-entry validation failed: ${validation.error}`);
  }
  
  return entries;
}

/**
 * Reverse ledger entries (for invoice reversal, corrections, etc.)
 * 
 * Creates inverse entries with opposite debit/credit
 */
export function reverseLedgerEntries(
  originalEntries: LedgerEntry[],
  reason: string,
  createdBy: string
): LedgerEntry[] {
  const reversalEntries: LedgerEntry[] = [];
  
  for (const entry of originalEntries) {
    if (entry.isReversed) {
      throw new Error(`Entry ${entry.id} has already been reversed`);
    }
    
    // Create inverse entry
    reversalEntries.push({
      ...entry,
      id: crypto.randomUUID(),
      debit: entry.credit, // Swap!
      credit: entry.debit, // Swap!
      description: `REVERSAL: ${reason} - Original: ${entry.description}`,
      reversalOf: entry.id,
      createdBy,
      createdAt: new Date().toISOString(),
    });
  }
  
  return reversalEntries;
}

/**
 * Get account balance from ledger entries
 */
export function getAccountBalance(
  accountId: string,
  entries: LedgerEntry[]
): number {
  const accountEntries = entries.filter(e => 
    e.accountId === accountId && !e.isReversed
  );
  
  const totalDebits = accountEntries.reduce((sum, e) => sum + e.debit, 0);
  const totalCredits = accountEntries.reduce((sum, e) => sum + e.credit, 0);
  
  // For asset and expense accounts: balance = debits - credits
  // For liability, equity, and revenue accounts: balance = credits - debits
  // This function returns the net amount (will need account type to determine sign)
  return totalDebits - totalCredits;
}

/**
 * Save ledger entries to storage
 */
export function saveLedgerEntries(entries: LedgerEntry[]): void {
  const existing = getLedgerEntries();
  const updated = [...existing, ...entries];
  localStorage.setItem('ledger_entries', JSON.stringify(updated));
}

/**
 * Get all ledger entries
 */
export function getLedgerEntries(): LedgerEntry[] {
  const stored = localStorage.getItem('ledger_entries');
  return stored ? JSON.parse(stored) : [];
}

/**
 * Get ledger entries for a specific entity
 */
export function getLedgerEntriesForEntity(
  entityType: 'invoice' | 'transaction' | 'payment',
  entityId: string
): LedgerEntry[] {
  const all = getLedgerEntries();
  
  switch (entityType) {
    case 'invoice':
      return all.filter(e => e.invoiceId === entityId);
    case 'transaction':
      return all.filter(e => e.transactionId === entityId);
    case 'payment':
      return all.filter(e => e.paymentId === entityId);
    default:
      return [];
  }
}
