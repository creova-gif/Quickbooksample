/**
 * Invoice Validation Schemas
 */

import { z } from 'zod';

const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().positive('Quantity must be positive'),
  unitPrice: z.number().nonnegative('Unit price must be non-negative'),
  taxRate: z.number().min(0).max(100, 'Tax rate must be between 0 and 100'),
});

export const createInvoiceSchema = z.object({
  body: z.object({
    customerId: z.string().uuid().optional(),
    customerName: z.string().min(1, 'Customer name is required'),
    customerEmail: z.string().email().optional().or(z.literal('')),
    customerPhone: z.string().optional(),
    customerAddress: z.string().optional(),
    customerTaxId: z.string().optional(),
    invoiceDate: z.string(), // ISO date string
    dueDate: z.string(), // ISO date string
    reference: z.string().optional(),
    currency: z.string().length(3, 'Currency must be 3 characters'),
    items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
    notes: z.string().optional(),
    paymentTerms: z.string().optional(),
  }),
});
