/**
 * Compliance Service
 * 
 * Tax adapter implementation for country-specific compliance:
 * - Kenya TIMS
 * - Uganda EFRIS  
 * - Tanzania VFD
 * - Rwanda EBM
 * - Burundi Generic
 * 
 * This follows the adapter pattern you showed me.
 */

import api from './api';
import { Invoice, CountryCode } from '@/types';

export interface CompliancePayload {
  invoiceNumber: string;
  customer: {
    name: string;
    taxId?: string;
    email?: string;
    phone?: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    total: number;
  }>;
  subtotal: number;
  vat: number;
  total: number;
  submissionDate: Date;
}

export interface ComplianceResponse {
  success: boolean;
  invoiceId: string;
  complianceId?: string;
  qrCode?: string;
  verificationUrl?: string;
  message?: string;
}

/**
 * Tax Adapter Class
 * Formats invoices for country-specific compliance systems
 */
class TaxAdapter {
  private country: CountryCode;

  constructor(country: CountryCode) {
    this.country = country;
  }

  /**
   * Generate invoice payload for the specific country
   */
  generateInvoicePayload(invoice: Invoice): CompliancePayload {
    switch (this.country) {
      case 'KE':
        return this._formatTims(invoice);
      case 'UG':
        return this._formatEfris(invoice);
      case 'TZ':
        return this._formatVfd(invoice);
      case 'RW':
        return this._formatEbm(invoice);
      case 'BI':
        return this._formatGeneric(invoice);
      default:
        throw new Error(`Unsupported country: ${this.country}`);
    }
  }

  /**
   * Format for Kenya TIMS (Tax Invoice Management System)
   */
  private _formatTims(invoice: Invoice): CompliancePayload {
    return {
      invoiceNumber: invoice.invoiceNumber,
      customer: {
        name: invoice.customerName,
        taxId: invoice.customerTaxId, // KRA PIN required
        email: invoice.customerEmail,
        phone: invoice.customerPhone,
      },
      items: invoice.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate,
        total: item.total,
      })),
      subtotal: invoice.subtotal,
      vat: invoice.taxAmount,
      total: invoice.total,
      submissionDate: new Date(),
    };
  }

  /**
   * Format for Uganda EFRIS (Electronic Fiscal Receipting and Invoicing Solution)
   */
  private _formatEfris(invoice: Invoice): CompliancePayload {
    return {
      invoiceNumber: invoice.invoiceNumber,
      customer: {
        name: invoice.customerName,
        taxId: invoice.customerTaxId, // URA TIN required
        email: invoice.customerEmail,
        phone: invoice.customerPhone,
      },
      items: invoice.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate,
        total: item.total,
      })),
      subtotal: invoice.subtotal,
      vat: invoice.taxAmount,
      total: invoice.total,
      submissionDate: new Date(),
    };
  }

  /**
   * Format for Tanzania VFD (Virtual Fiscal Device)
   */
  private _formatVfd(invoice: Invoice): CompliancePayload {
    return {
      invoiceNumber: invoice.invoiceNumber,
      customer: {
        name: invoice.customerName,
        taxId: invoice.customerTaxId, // TRA TIN (optional)
        email: invoice.customerEmail,
        phone: invoice.customerPhone,
      },
      items: invoice.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate,
        total: item.total,
      })),
      subtotal: invoice.subtotal,
      vat: invoice.taxAmount,
      total: invoice.total,
      submissionDate: new Date(),
    };
  }

  /**
   * Format for Rwanda EBM (Electronic Billing Machine)
   */
  private _formatEbm(invoice: Invoice): CompliancePayload {
    return {
      invoiceNumber: invoice.invoiceNumber,
      customer: {
        name: invoice.customerName,
        taxId: invoice.customerTaxId, // RRA TIN (optional)
        email: invoice.customerEmail,
        phone: invoice.customerPhone,
      },
      items: invoice.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate,
        total: item.total,
      })),
      subtotal: invoice.subtotal,
      vat: invoice.taxAmount,
      total: invoice.total,
      submissionDate: new Date(),
    };
  }

  /**
   * Generic format for Burundi or other countries
   */
  private _formatGeneric(invoice: Invoice): CompliancePayload {
    return {
      invoiceNumber: invoice.invoiceNumber,
      customer: {
        name: invoice.customerName,
        taxId: invoice.customerTaxId,
        email: invoice.customerEmail,
        phone: invoice.customerPhone,
      },
      items: invoice.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate,
        total: item.total,
      })),
      subtotal: invoice.subtotal,
      vat: invoice.taxAmount,
      total: invoice.total,
      submissionDate: new Date(),
    };
  }
}

/**
 * Submit invoice to tax authority
 */
export async function submitInvoiceToTaxAuthority(
  invoice: Invoice,
  country: CountryCode
): Promise<ComplianceResponse> {
  const adapter = new TaxAdapter(country);
  const payload = adapter.generateInvoicePayload(invoice);

  const response = await api.post('/tax/submit-invoice', {
    country,
    payload,
    invoiceId: invoice.id,
  });

  return response.data;
}

/**
 * Verify invoice compliance status
 */
export async function verifyInvoiceCompliance(invoiceId: string): Promise<{
  verified: boolean;
  complianceId?: string;
  status: string;
  lastChecked: string;
}> {
  const response = await api.get(`/tax/verify/${invoiceId}`);
  return response.data;
}

/**
 * Get tax report for a period
 */
export async function getTaxReport(startDate: string, endDate: string): Promise<{
  totalSales: number;
  totalPurchases: number;
  taxCollected: number;
  taxPaid: number;
  netTax: number;
  invoices: number;
}> {
  const response = await api.get('/tax/report', {
    params: { startDate, endDate },
  });
  return response.data;
}

/**
 * Download tax return form
 */
export async function downloadTaxReturn(startDate: string, endDate: string): Promise<Blob> {
  const response = await api.get('/tax/return', {
    params: { startDate, endDate },
    responseType: 'blob',
  });
  return response.data;
}

/**
 * Get compliance configuration for country
 */
export async function getCountryCompliance(country: CountryCode): Promise<{
  vatRate: number;
  requiredFields: string[];
  submissionEndpoint: string;
  documentationUrl: string;
}> {
  const response = await api.get(`/tax/country/${country}`);
  return response.data;
}

export { TaxAdapter };
