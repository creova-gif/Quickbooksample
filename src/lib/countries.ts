import { Country, CountryCode } from '@/types';

// Country Configuration - Pluggable Compliance Adapters
export const COUNTRIES: Record<CountryCode, Country> = {
  KE: {
    code: 'KE',
    name: 'Kenya',
    currency: 'KES',
    currencySymbol: 'KSh',
    vatRate: 16,
    vatName: 'VAT',
    flag: '🇰🇪',
    complianceSystem: 'TIMS (Tax Invoice Management System)',
    fiscalYearStart: '01-01',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: {
      decimal: '.',
      thousands: ',',
    },
  },
  TZ: {
    code: 'TZ',
    name: 'Tanzania',
    currency: 'TZS',
    currencySymbol: 'TSh',
    vatRate: 18,
    vatName: 'VAT',
    flag: '🇹🇿',
    complianceSystem: 'VFD (Virtual Fiscal Device) / TRA',
    fiscalYearStart: '07-01',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: {
      decimal: '.',
      thousands: ',',
    },
  },
  UG: {
    code: 'UG',
    name: 'Uganda',
    currency: 'UGX',
    currencySymbol: 'USh',
    vatRate: 18,
    vatName: 'VAT',
    flag: '🇺🇬',
    complianceSystem: 'EFRIS (Electronic Fiscal Receipting and Invoicing Solution)',
    fiscalYearStart: '07-01',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: {
      decimal: '.',
      thousands: ',',
    },
  },
  RW: {
    code: 'RW',
    name: 'Rwanda',
    currency: 'RWF',
    currencySymbol: 'FRw',
    vatRate: 18,
    vatName: 'VAT',
    flag: '🇷🇼',
    complianceSystem: 'EBM (Electronic Billing Machine)',
    fiscalYearStart: '01-01',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: {
      decimal: '.',
      thousands: ',',
    },
  },
  BI: {
    code: 'BI',
    name: 'Burundi',
    currency: 'BIF',
    currencySymbol: 'FBu',
    vatRate: 18,
    vatName: 'TVA',
    flag: '🇧🇮',
    fiscalYearStart: '01-01',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: {
      decimal: ',',
      thousands: ' ',
    },
  },
};

export function getCountry(code: CountryCode): Country {
  return COUNTRIES[code];
}

export function getCountryByCode(code: CountryCode): Country {
  return COUNTRIES[code];
}

export function getAllCountries(): Country[] {
  return Object.values(COUNTRIES);
}

export function formatCurrency(amount: number, countryCode: CountryCode): string {
  const country = COUNTRIES[countryCode];
  const formatted = Math.abs(amount)
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, country.numberFormat.thousands)
    .replace('.', country.numberFormat.decimal);
  
  const sign = amount < 0 ? '-' : '';
  return `${sign}${country.currencySymbol} ${formatted}`;
}

export function formatNumber(num: number, countryCode: CountryCode): string {
  const country = COUNTRIES[countryCode];
  return num
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, country.numberFormat.thousands)
    .replace('.', country.numberFormat.decimal);
}

// Default categories per country type
export function getDefaultCategories(type: 'income' | 'expense') {
  if (type === 'income') {
    return [
      { name: 'Sales Revenue', icon: 'ShoppingCart', color: '#10b981' },
      { name: 'Service Revenue', icon: 'Briefcase', color: '#3b82f6' },
      { name: 'Consulting', icon: 'Users', color: '#8b5cf6' },
      { name: 'Interest Income', icon: 'TrendingUp', color: '#f59e0b' },
      { name: 'Other Income', icon: 'DollarSign', color: '#6366f1' },
    ];
  } else {
    return [
      { name: 'Rent', icon: 'Home', color: '#ef4444' },
      { name: 'Salaries', icon: 'Users', color: '#f97316' },
      { name: 'Utilities', icon: 'Zap', color: '#eab308' },
      { name: 'Office Supplies', icon: 'Package', color: '#84cc16' },
      { name: 'Marketing', icon: 'Megaphone', color: '#06b6d4' },
      { name: 'Transportation', icon: 'Car', color: '#8b5cf6' },
      { name: 'Internet & Phone', icon: 'Wifi', color: '#ec4899' },
      { name: 'Bank Fees', icon: 'CreditCard', color: '#64748b' },
      { name: 'Professional Services', icon: 'Briefcase', color: '#0ea5e9' },
      { name: 'Other Expenses', icon: 'MoreHorizontal', color: '#94a3b8' },
    ];
  }
}

// Compliance-specific invoice fields
export interface ComplianceFields {
  required: string[];
  optional: string[];
  labels: Record<string, string>;
}

export function getComplianceFields(countryCode: CountryCode): ComplianceFields {
  switch (countryCode) {
    case 'KE':
      return {
        required: ['customerTaxId', 'invoiceNumber'],
        optional: ['timsInvoiceId', 'timsQrCode'],
        labels: {
          customerTaxId: 'Customer PIN',
          timsInvoiceId: 'TIMS Invoice ID',
          timsQrCode: 'TIMS QR Code',
        },
      };
    case 'TZ':
      return {
        required: ['invoiceNumber'],
        optional: ['vfdReceiptNumber', 'vfdVerificationCode', 'customerTaxId'],
        labels: {
          customerTaxId: 'Customer TIN',
          vfdReceiptNumber: 'VFD Receipt Number',
          vfdVerificationCode: 'VFD Verification Code',
        },
      };
    case 'UG':
      return {
        required: ['customerTaxId', 'invoiceNumber'],
        optional: ['efrisInvoiceId', 'efrisFdmSignature'],
        labels: {
          customerTaxId: 'Customer TIN',
          efrisInvoiceId: 'EFRIS Invoice ID',
          efrisFdmSignature: 'FDM Signature',
        },
      };
    case 'RW':
      return {
        required: ['invoiceNumber'],
        optional: ['ebmInvoiceId', 'ebmSdcId', 'customerTaxId'],
        labels: {
          customerTaxId: 'Customer TIN',
          ebmInvoiceId: 'EBM Invoice ID',
          ebmSdcId: 'SDC ID',
        },
      };
    case 'BI':
      return {
        required: ['invoiceNumber'],
        optional: ['customerTaxId'],
        labels: {
          customerTaxId: 'NIF (Tax ID)',
        },
      };
  }
}