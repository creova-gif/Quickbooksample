/**
 * VAT Calculation Utilities
 * Ensures accounting-safe VAT handling
 */

import { getCountryByCode } from './countries';

export interface VATCalculation {
  amount: number; // Net amount (before VAT)
  vatRate: number; // e.g., 0.16 for 16%
  vatAmount: number; // Calculated VAT
  totalAmount: number; // amount + vatAmount
}

/**
 * Calculate VAT for a transaction
 */
export function calculateVAT(
  amount: number,
  countryCode: string,
  vatRegistered: boolean = true
): VATCalculation {
  // Get country VAT rate
  const country = getCountryByCode(countryCode);
  const vatRate = vatRegistered && country ? country.vatRate / 100 : 0;
  
  // Calculate VAT amount
  const vatAmount = Math.round(amount * vatRate * 100) / 100; // Round to 2 decimals
  
  // Calculate total
  const totalAmount = amount + vatAmount;

  return {
    amount,
    vatRate,
    vatAmount,
    totalAmount,
  };
}

/**
 * Extract VAT from gross amount (reverse calculation)
 */
export function extractVAT(
  grossAmount: number,
  countryCode: string,
  vatRegistered: boolean = true
): VATCalculation {
  const country = getCountryByCode(countryCode);
  const vatRate = vatRegistered && country ? country.vatRate / 100 : 0;
  
  // Calculate net amount from gross
  const amount = Math.round((grossAmount / (1 + vatRate)) * 100) / 100;
  const vatAmount = grossAmount - amount;

  return {
    amount,
    vatRate,
    vatAmount,
    totalAmount: grossAmount,
  };
}

/**
 * Format VAT rate as percentage
 */
export function formatVATRate(vatRate: number): string {
  return `${(vatRate * 100).toFixed(0)}%`;
}

/**
 * Get VAT display info for a country
 */
export function getVATInfo(countryCode: string): {
  rate: number;
  rateDecimal: number;
  name: string;
  formatted: string;
} {
  const country = getCountryByCode(countryCode);
  
  if (!country) {
    return {
      rate: 0,
      rateDecimal: 0,
      name: 'VAT',
      formatted: '0%',
    };
  }

  return {
    rate: country.vatRate,
    rateDecimal: country.vatRate / 100,
    name: country.vatName || 'VAT',
    formatted: `${country.vatRate}%`,
  };
}

/**
 * Validate transaction amounts (accounting integrity check)
 */
export function validateTransactionAmounts(
  amount: number,
  vatAmount: number,
  totalAmount: number
): { valid: boolean; error?: string } {
  // Check for negative amounts
  if (amount < 0 || vatAmount < 0 || totalAmount < 0) {
    return { valid: false, error: 'Amounts cannot be negative' };
  }

  // Check calculation integrity
  const calculatedTotal = Math.round((amount + vatAmount) * 100) / 100;
  const difference = Math.abs(calculatedTotal - totalAmount);
  
  if (difference > 0.01) { // Allow 1 cent rounding difference
    return {
      valid: false,
      error: `Total amount mismatch: ${calculatedTotal} vs ${totalAmount}`,
    };
  }

  return { valid: true };
}
