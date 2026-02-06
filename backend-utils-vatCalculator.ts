/**
 * VAT Calculator
 * Country-specific VAT rates for East Africa
 */

interface VATCalculation {
  amount: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
}

const VAT_RATES: { [key: string]: number } = {
  'KES': 0.16,  // Kenya 16%
  'UGX': 0.18,  // Uganda 18%
  'TZS': 0.18,  // Tanzania 18%
  'RWF': 0.18,  // Rwanda 18%
  'BIF': 0.18   // Burundi 18%
};

export function calculateVAT(amount: number, currency: string, vatRegistered: boolean = true): VATCalculation {
  const vatRate = vatRegistered ? (VAT_RATES[currency] || 0) : 0;
  const vatAmount = Math.round(amount * vatRate * 100) / 100;
  const totalAmount = Math.round((amount + vatAmount) * 100) / 100;

  return {
    amount,
    vatRate,
    vatAmount,
    totalAmount
  };
}

export function getVATRate(currency: string): number {
  return VAT_RATES[currency] || 0;
}
