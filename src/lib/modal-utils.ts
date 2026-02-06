/**
 * Modal Utilities
 * Helper functions for modal forms
 */

import { Invoice, Transaction } from '@/types';

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, symbol: string = 'KSh'): string {
  return `${symbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Generate invoice number
 */
export function generateInvoiceNumber(prefix: string = 'INV'): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Calculate VAT amount
 */
export function calculateVAT(amount: number, vatRate: number): number {
  return Math.round(amount * vatRate * 100) / 100;
}

/**
 * Calculate total with VAT
 */
export function calculateTotalWithVAT(amount: number, vatRate: number): number {
  const vatAmount = calculateVAT(amount, vatRate);
  return Math.round((amount + vatAmount) * 100) / 100;
}

/**
 * Calculate net amount from gross (reverse VAT)
 */
export function calculateNetFromGross(grossAmount: number, vatRate: number): number {
  return Math.round((grossAmount / (1 + vatRate)) * 100) / 100;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (East Africa formats)
 */
export function isValidPhone(phone: string): boolean {
  // Remove spaces, dashes, and parentheses
  const cleaned = phone.replace(/[\s\-()]/g, '');
  
  // Check for valid East Africa formats
  // Kenya: +254... or 254... or 07...
  // Uganda: +256... or 256... or 07...
  // Tanzania: +255... or 255... or 07...
  const phoneRegex = /^(\+?254|254|0)(7|1)\d{8}$|^(\+?256|256|0)(7|3|4)\d{8}$|^(\+?255|255|0)(6|7)\d{8}$/;
  
  return phoneRegex.test(cleaned);
}

/**
 * Validate tax ID format
 */
export function isValidTaxId(taxId: string, countryCode: string): boolean {
  switch (countryCode) {
    case 'KE':
      // Kenya PIN: A... or P... followed by 9 digits and a letter
      return /^[AP]\d{9}[A-Z]$/.test(taxId);
    case 'UG':
      // Uganda TIN: 10 digits
      return /^\d{10}$/.test(taxId);
    case 'TZ':
      // Tanzania VRN: 9 digits
      return /^\d{9}$/.test(taxId);
    case 'RW':
      // Rwanda TIN: 9 digits
      return /^\d{9}$/.test(taxId);
    default:
      return true; // No validation for other countries
  }
}

/**
 * Format date for input[type="date"]
 */
export function formatDateForInput(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

/**
 * Calculate due date (default 30 days from issue)
 */
export function calculateDueDate(issueDate: Date | string, days: number = 30): string {
  const issue = typeof issueDate === 'string' ? new Date(issueDate) : issueDate;
  const due = new Date(issue);
  due.setDate(due.getDate() + days);
  return formatDateForInput(due);
}

/**
 * Calculate Kenya PAYE tax
 */
export function calculateKenyaPAYE(grossSalary: number): {
  taxAmount: number;
  netSalary: number;
  taxRate: number;
  breakdown: Array<{ band: string; rate: string; amount: number }>;
} {
  let taxAmount = 0;
  const breakdown: Array<{ band: string; rate: string; amount: number }> = [];

  if (grossSalary <= 24000) {
    taxAmount = grossSalary * 0.1;
    breakdown.push({ band: '≤ 24,000', rate: '10%', amount: taxAmount });
  } else if (grossSalary <= 32333) {
    breakdown.push({ band: '≤ 24,000', rate: '10%', amount: 2400 });
    const excess = grossSalary - 24000;
    const excessTax = excess * 0.25;
    breakdown.push({ band: '24,001 - 32,333', rate: '25%', amount: excessTax });
    taxAmount = 2400 + excessTax;
  } else if (grossSalary <= 500000) {
    breakdown.push({ band: '≤ 24,000', rate: '10%', amount: 2400 });
    breakdown.push({ band: '24,001 - 32,333', rate: '25%', amount: 2083.25 });
    const excess = grossSalary - 32333;
    const excessTax = excess * 0.3;
    breakdown.push({ band: '32,334 - 500,000', rate: '30%', amount: excessTax });
    taxAmount = 4483.25 + excessTax;
  } else if (grossSalary <= 800000) {
    breakdown.push({ band: '≤ 500,000', rate: 'Various', amount: 144783.35 });
    const excess = grossSalary - 500000;
    const excessTax = excess * 0.325;
    breakdown.push({ band: '500,001 - 800,000', rate: '32.5%', amount: excessTax });
    taxAmount = 144783.35 + excessTax;
  } else {
    breakdown.push({ band: '≤ 800,000', rate: 'Various', amount: 242283.35 });
    const excess = grossSalary - 800000;
    const excessTax = excess * 0.35;
    breakdown.push({ band: '> 800,000', rate: '35%', amount: excessTax });
    taxAmount = 242283.35 + excessTax;
  }

  const netSalary = grossSalary - taxAmount;
  const taxRate = taxAmount / grossSalary;

  return {
    taxAmount: Math.round(taxAmount * 100) / 100,
    netSalary: Math.round(netSalary * 100) / 100,
    taxRate: Math.round(taxRate * 10000) / 10000,
    breakdown,
  };
}

/**
 * Calculate line item total
 */
export function calculateLineTotal(quantity: number, unitPrice: number): number {
  return Math.round(quantity * unitPrice * 100) / 100;
}

/**
 * Calculate invoice subtotal from items
 */
export function calculateInvoiceSubtotal(
  items: Array<{ quantity: number; unitPrice: number }>
): number {
  return items.reduce((sum, item) => sum + calculateLineTotal(item.quantity, item.unitPrice), 0);
}

/**
 * Generate unique ID
 */
export function generateId(prefix?: string): string {
  const id = crypto.randomUUID();
  return prefix ? `${prefix}_${id}` : id;
}

/**
 * Parse number from input (handles empty strings)
 */
export function parseNumberInput(value: string): number {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Validate positive number
 */
export function isPositiveNumber(value: number): boolean {
  return !isNaN(value) && value > 0;
}

/**
 * Format number with commas
 */
export function formatNumber(num: number, decimals: number = 2): string {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Get country-specific VAT rate
 */
export function getVATRate(countryCode: string): number {
  const rates: Record<string, number> = {
    KE: 0.16, // Kenya
    UG: 0.18, // Uganda
    TZ: 0.18, // Tanzania
    RW: 0.18, // Rwanda
    BI: 0.18, // Burundi
  };
  return rates[countryCode] || 0.16;
}

/**
 * Get compliance system for country
 */
export function getComplianceSystem(countryCode: string): string {
  const systems: Record<string, string> = {
    KE: 'TIMS',
    UG: 'EFRIS',
    TZ: 'VFD',
    RW: 'EBM',
    BI: 'Generic',
  };
  return systems[countryCode] || 'Generic';
}

/**
 * Validate invoice data
 */
export function validateInvoice(invoice: {
  customerName: string;
  items: Array<{ description: string; quantity: number; unitPrice: number }>;
  subtotal: number;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!invoice.customerName?.trim()) {
    errors.push('Customer name is required');
  }

  if (!invoice.items || invoice.items.length === 0) {
    errors.push('At least one item is required');
  }

  invoice.items?.forEach((item, index) => {
    if (!item.description?.trim()) {
      errors.push(`Item ${index + 1}: Description is required`);
    }
    if (item.quantity <= 0) {
      errors.push(`Item ${index + 1}: Quantity must be greater than zero`);
    }
    if (item.unitPrice <= 0) {
      errors.push(`Item ${index + 1}: Unit price must be greater than zero`);
    }
  });

  if (invoice.subtotal <= 0) {
    errors.push('Invoice total must be greater than zero');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get friendly error message
 */
export function getFriendlyErrorMessage(error: any): string {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Debounce function for input handlers
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 10000) / 100;
}

/**
 * Format date for display
 */
export function formatDateForDisplay(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Check if date is in the past
 */
export function isDateInPast(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d < new Date();
}

/**
 * Calculate days between dates
 */
export function daysBetween(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
