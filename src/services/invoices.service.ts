/**
 * Invoice Service
 * 
 * Handles all invoice-related API calls:
 * - CRUD operations
 * - PDF generation
 * - Email sending
 * - Payment recording
 * - Compliance submission
 */

import api from './api';
import { Invoice, InvoiceItem, InvoiceStatus } from '@/types';

export interface CreateInvoiceData {
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerTaxId?: string;
  date: string;
  dueDate: string;
  items: Omit<InvoiceItem, 'id' | 'taxAmount' | 'total'>[];
  notes?: string;
  terms?: string;
}

export interface UpdateInvoiceData extends Partial<CreateInvoiceData> {
  status?: InvoiceStatus;
}

export interface InvoiceFilters {
  startDate?: string;
  endDate?: string;
  status?: InvoiceStatus;
  customerId?: string;
  search?: string;
}

/**
 * Get all invoices with optional filters
 */
export async function getInvoices(filters?: InvoiceFilters): Promise<Invoice[]> {
  const response = await api.get('/invoices', { params: filters });
  return response.data;
}

/**
 * Get single invoice by ID
 */
export async function getInvoice(id: string): Promise<Invoice> {
  const response = await api.get(`/invoices/${id}`);
  return response.data;
}

/**
 * Create new invoice
 */
export async function createInvoice(data: CreateInvoiceData): Promise<Invoice> {
  const response = await api.post('/invoices', data);
  return response.data;
}

/**
 * Update existing invoice
 */
export async function updateInvoice(id: string, data: UpdateInvoiceData): Promise<Invoice> {
  const response = await api.patch(`/invoices/${id}`, data);
  return response.data;
}

/**
 * Delete invoice
 */
export async function deleteInvoice(id: string): Promise<void> {
  await api.delete(`/invoices/${id}`);
}

/**
 * Mark invoice as sent
 */
export async function markInvoiceSent(id: string): Promise<Invoice> {
  const response = await api.post(`/invoices/${id}/send`);
  return response.data;
}

/**
 * Record payment for invoice
 */
export async function recordPayment(
  invoiceId: string,
  data: {
    amount: number;
    date: string;
    methodId: string;
    reference?: string;
    notes?: string;
  }
): Promise<Invoice> {
  const response = await api.post(`/invoices/${invoiceId}/payments`, data);
  return response.data;
}

/**
 * Generate PDF for invoice
 */
export async function generateInvoicePDF(id: string): Promise<Blob> {
  const response = await api.get(`/invoices/${id}/pdf`, {
    responseType: 'blob',
  });
  return response.data;
}

/**
 * Email invoice to customer
 */
export async function emailInvoice(id: string, email?: string): Promise<void> {
  await api.post(`/invoices/${id}/email`, { email });
}

/**
 * Submit invoice to tax authority (TIMS, EFRIS, etc.)
 */
export async function submitToTaxAuthority(id: string): Promise<Invoice> {
  const response = await api.post(`/invoices/${id}/submit-compliance`);
  return response.data;
}

/**
 * Get invoice statistics
 */
export async function getInvoiceStats(): Promise<{
  total: number;
  draft: number;
  sent: number;
  paid: number;
  overdue: number;
  totalValue: number;
  paidValue: number;
  outstandingValue: number;
}> {
  const response = await api.get('/invoices/stats');
  return response.data;
}

/**
 * Duplicate invoice
 */
export async function duplicateInvoice(id: string): Promise<Invoice> {
  const response = await api.post(`/invoices/${id}/duplicate`);
  return response.data;
}
