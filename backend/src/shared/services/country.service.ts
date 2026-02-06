/**
 * Country Service
 * Provides country-specific configurations
 */

interface CountryConfig {
  code: string;
  name: string;
  currency: string;
  vatRate: number;
  timezone: string;
  taxIdLabel: string;
  taxIdRegex: RegExp;
  complianceSystem: string;
}

const COUNTRIES: Record<string, CountryConfig> = {
  KE: {
    code: 'KE',
    name: 'Kenya',
    currency: 'KES',
    vatRate: 16.0,
    timezone: 'Africa/Nairobi',
    taxIdLabel: 'KRA PIN',
    taxIdRegex: /^[A-Z]\d{9}[A-Z]$/,
    complianceSystem: 'TIMS',
  },
  TZ: {
    code: 'TZ',
    name: 'Tanzania',
    currency: 'TZS',
    vatRate: 18.0,
    timezone: 'Africa/Dar_es_Salaam',
    taxIdLabel: 'TIN',
    taxIdRegex: /^\d{9}$/,
    complianceSystem: 'VFD',
  },
  UG: {
    code: 'UG',
    name: 'Uganda',
    currency: 'UGX',
    vatRate: 18.0,
    timezone: 'Africa/Kampala',
    taxIdLabel: 'TIN',
    taxIdRegex: /^\d{10}$/,
    complianceSystem: 'EFRIS',
  },
  RW: {
    code: 'RW',
    name: 'Rwanda',
    currency: 'RWF',
    vatRate: 18.0,
    timezone: 'Africa/Kigali',
    taxIdLabel: 'TIN',
    taxIdRegex: /^\d{9}$/,
    complianceSystem: 'EBM',
  },
  BI: {
    code: 'BI',
    name: 'Burundi',
    currency: 'BIF',
    vatRate: 18.0,
    timezone: 'Africa/Bujumbura',
    taxIdLabel: 'NIF',
    taxIdRegex: /^\d{13}$/,
    complianceSystem: 'OBR',
  },
};

export class CountryService {
  static getCountryConfig(countryCode: string): CountryConfig | null {
    return COUNTRIES[countryCode] || null;
  }

  static getAllCountries(): CountryConfig[] {
    return Object.values(COUNTRIES);
  }

  static validateTaxId(countryCode: string, taxId: string): boolean {
    const config = COUNTRIES[countryCode];
    if (!config) return false;
    return config.taxIdRegex.test(taxId);
  }

  static formatCurrency(amount: number, countryCode: string): string {
    const config = COUNTRIES[countryCode];
    if (!config) return amount.toFixed(2);

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: config.currency,
      minimumFractionDigits: 2,
    }).format(amount);
  }
}
