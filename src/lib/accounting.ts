// Double-entry accounting engine (simplified for frontend)
// In production, this would be server-side with full ACID guarantees

import { Account, Transaction, Invoice, InvoiceItem, CountryCode } from '@/types';
import { getCountry } from './countries';

// Chart of Accounts - Default structure
export function getDefaultAccounts(): Account[] {
  return [
    // Assets
    { id: 'acc_cash', name: 'Cash', type: 'asset', code: '1000', balance: 0, isSystem: true },
    { id: 'acc_bank', name: 'Bank Account', type: 'asset', code: '1010', balance: 0, isSystem: true },
    { id: 'acc_ar', name: 'Accounts Receivable', type: 'asset', code: '1200', balance: 0, isSystem: true },
    { id: 'acc_inventory', name: 'Inventory', type: 'asset', code: '1400', balance: 0, isSystem: false },
    
    // Liabilities
    { id: 'acc_ap', name: 'Accounts Payable', type: 'liability', code: '2000', balance: 0, isSystem: true },
    { id: 'acc_vat_payable', name: 'VAT Payable', type: 'liability', code: '2100', balance: 0, isSystem: true },
    { id: 'acc_vat_receivable', name: 'VAT Recoverable', type: 'asset', code: '1150', balance: 0, isSystem: true },
    
    // Equity
    { id: 'acc_capital', name: 'Owner\'s Capital', type: 'equity', code: '3000', balance: 0, isSystem: true },
    { id: 'acc_retained', name: 'Retained Earnings', type: 'equity', code: '3100', balance: 0, isSystem: true },
    
    // Revenue
    { id: 'acc_revenue', name: 'Sales Revenue', type: 'revenue', code: '4000', balance: 0, isSystem: true },
    { id: 'acc_service_revenue', name: 'Service Revenue', type: 'revenue', code: '4100', balance: 0, isSystem: false },
    { id: 'acc_other_income', name: 'Other Income', type: 'revenue', code: '4900', balance: 0, isSystem: false },
    
    // Expenses
    { id: 'acc_cogs', name: 'Cost of Goods Sold', type: 'expense', code: '5000', balance: 0, isSystem: false },
    { id: 'acc_salaries', name: 'Salaries & Wages', type: 'expense', code: '6000', balance: 0, isSystem: false },
    { id: 'acc_rent', name: 'Rent Expense', type: 'expense', code: '6100', balance: 0, isSystem: false },
    { id: 'acc_utilities', name: 'Utilities', type: 'expense', code: '6200', balance: 0, isSystem: false },
    { id: 'acc_office', name: 'Office Supplies', type: 'expense', code: '6300', balance: 0, isSystem: false },
    { id: 'acc_marketing', name: 'Marketing & Advertising', type: 'expense', code: '6400', balance: 0, isSystem: false },
    { id: 'acc_transport', name: 'Transportation', type: 'expense', code: '6500', balance: 0, isSystem: false },
    { id: 'acc_bank_fees', name: 'Bank Charges', type: 'expense', code: '6800', balance: 0, isSystem: false },
    { id: 'acc_misc_expense', name: 'Miscellaneous Expenses', type: 'expense', code: '6900', balance: 0, isSystem: false },
  ];
}

// Calculate VAT for invoice items
export function calculateInvoiceItem(
  quantity: number,
  unitPrice: number,
  taxRate: number
): InvoiceItem {
  const subtotal = quantity * unitPrice;
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;
  
  return {
    id: '',
    description: '',
    quantity,
    unitPrice,
    taxRate,
    taxAmount: Math.round(taxAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

// Calculate invoice totals
export function calculateInvoiceTotals(items: InvoiceItem[]): {
  subtotal: number;
  taxAmount: number;
  total: number;
} {
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const taxAmount = items.reduce((sum, item) => sum + item.taxAmount, 0);
  const total = subtotal + taxAmount;
  
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

// Generate invoice number
export function generateInvoiceNumber(countryCode: CountryCode, count: number): string {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const sequence = String(count + 1).padStart(4, '0');
  return `INV-${countryCode}-${year}${month}-${sequence}`;
}

// Financial Calculations
export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
}

export function calculateFinancialSummary(transactions: Transaction[]): FinancialSummary {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const netProfit = totalIncome - totalExpenses;
  const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;
  
  return {
    totalIncome: Math.round(totalIncome * 100) / 100,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    netProfit: Math.round(netProfit * 100) / 100,
    profitMargin: Math.round(profitMargin * 100) / 100,
  };
}

// Calculate tax summary for a period
export interface TaxSummary {
  totalSalesWithVat: number;
  totalPurchasesWithVat: number;
  vatCollected: number;
  vatPaid: number;
  netVatPayable: number;
}

export function calculateTaxSummary(
  transactions: Transaction[],
  invoices: Invoice[]
): TaxSummary {
  const vatCollected = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.taxAmount, 0);
  
  const vatPaid = transactions
    .filter(t => t.type === 'expense' && t.taxAmount)
    .reduce((sum, t) => sum + (t.taxAmount || 0), 0);
  
  const totalSalesWithVat = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total, 0);
  
  const totalPurchasesWithVat = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  return {
    totalSalesWithVat: Math.round(totalSalesWithVat * 100) / 100,
    totalPurchasesWithVat: Math.round(totalPurchasesWithVat * 100) / 100,
    vatCollected: Math.round(vatCollected * 100) / 100,
    vatPaid: Math.round(vatPaid * 100) / 100,
    netVatPayable: Math.round((vatCollected - vatPaid) * 100) / 100,
  };
}

// Profit & Loss Statement Data
export interface ProfitLossData {
  revenue: {
    sales: number;
    services: number;
    other: number;
    total: number;
  };
  expenses: {
    [category: string]: number;
    total: number;
  };
  grossProfit: number;
  netProfit: number;
}

// Balance Sheet Data
export interface BalanceSheetData {
  assets: {
    current: { [key: string]: number; total: number };
    fixed: { [key: string]: number; total: number };
    total: number;
  };
  liabilities: {
    current: { [key: string]: number; total: number };
    longTerm: { [key: string]: number; total: number };
    total: number;
  };
  equity: {
    capital: number;
    retained: number;
    total: number;
  };
}

// Cash Flow Data
export interface CashFlowData {
  operating: {
    receipts: number;
    payments: number;
    net: number;
  };
  investing: {
    receipts: number;
    payments: number;
    net: number;
  };
  financing: {
    receipts: number;
    payments: number;
    net: number;
  };
  netChange: number;
  openingBalance: number;
  closingBalance: number;
}
