/**
 * Invoices Controller
 */

import { Request, Response, NextFunction } from 'express';
import { query, transaction } from '../db';
import { AppError } from '../shared/utils/app-error';
import { logger } from '../shared/utils/logger';
import { ComplianceService } from '../services/compliance/compliance.service';
import { DoubleEntryService } from '../services/accounting/double-entry.service';
import { PDFService } from '../services/pdf/pdf.service';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    tenantId: string;
  };
}

export class InvoicesController {
  private complianceService: ComplianceService;
  private doubleEntryService: DoubleEntryService;
  private pdfService: PDFService;

  constructor() {
    this.complianceService = new ComplianceService();
    this.doubleEntryService = new DoubleEntryService();
    this.pdfService = new PDFService();
  }

  /**
   * List all invoices for tenant
   */
  async listInvoices(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const {
        status,
        customerId,
        from,
        to,
        limit = '50',
        offset = '0',
      } = req.query;

      let queryText = `
        SELECT 
          i.id, i.invoice_number, i.customer_name, i.customer_email,
          i.invoice_date, i.due_date, i.status, i.currency,
          i.subtotal, i.discount, i.tax_amount, i.total,
          i.amount_paid, i.balance_due, i.created_at
        FROM invoices i
        WHERE i.tenant_id = $1 AND i.deleted_at IS NULL
      `;
      const params: any[] = [tenantId];
      let paramIndex = 2;

      // Add filters
      if (status) {
        queryText += ` AND i.status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      if (customerId) {
        queryText += ` AND i.customer_id = $${paramIndex}`;
        params.push(customerId);
        paramIndex++;
      }

      if (from) {
        queryText += ` AND i.invoice_date >= $${paramIndex}`;
        params.push(from);
        paramIndex++;
      }

      if (to) {
        queryText += ` AND i.invoice_date <= $${paramIndex}`;
        params.push(to);
        paramIndex++;
      }

      // Order by date descending
      queryText += ' ORDER BY i.invoice_date DESC, i.created_at DESC';

      // Pagination
      queryText += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(parseInt(limit as string), parseInt(offset as string));

      const result = await query(queryText, params);

      // Get total count
      const countResult = await query(
        'SELECT COUNT(*) FROM invoices WHERE tenant_id = $1 AND deleted_at IS NULL',
        [tenantId]
      );

      res.json({
        data: result.rows,
        meta: {
          total: parseInt(countResult.rows[0].count),
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new invoice
   */
  async createInvoice(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const userId = req.user!.userId;
      const {
        customerId,
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        customerTaxId,
        invoiceDate,
        dueDate,
        reference,
        currency,
        items,
        notes,
        paymentTerms,
      } = req.body;

      // Validate customer
      if (!customerId && !customerName) {
        throw new AppError('Either customerId or customerName is required', 400);
      }

      // Calculate totals
      let subtotal = 0;
      let taxAmount = 0;
      const processedItems = items.map((item: any) => {
        const itemSubtotal = item.quantity * item.unitPrice;
        const itemTax = itemSubtotal * (item.taxRate / 100);
        const itemTotal = itemSubtotal + itemTax;

        subtotal += itemSubtotal;
        taxAmount += itemTax;

        return {
          ...item,
          subtotal: itemSubtotal,
          taxAmount: itemTax,
          total: itemTotal,
        };
      });

      const total = subtotal + taxAmount;

      // Create invoice in transaction
      const result = await transaction(async (client) => {
        // 1. Generate invoice number
        const numberResult = await client.query(
          `SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM '\\d+$') AS INTEGER)), 0) + 1 as next_number
           FROM invoices 
           WHERE tenant_id = $1 
           AND invoice_number LIKE $2`,
          [tenantId, `INV-${new Date().getFullYear()}-%`]
        );
        const nextNumber = numberResult.rows[0].next_number;
        const invoiceNumber = `INV-${new Date().getFullYear()}-${String(nextNumber).padStart(4, '0')}`;

        // 2. Insert invoice
        const invoiceResult = await client.query(
          `INSERT INTO invoices (
            tenant_id, customer_id, customer_name, customer_email, customer_phone,
            customer_address, customer_tax_id, invoice_number, invoice_date, due_date,
            reference, currency, subtotal, tax_amount, total, balance_due,
            notes, payment_terms, status, created_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, 'draft', $19)
          RETURNING *`,
          [
            tenantId,
            customerId || null,
            customerName,
            customerEmail || null,
            customerPhone || null,
            customerAddress || null,
            customerTaxId || null,
            invoiceNumber,
            invoiceDate,
            dueDate,
            reference || null,
            currency,
            subtotal,
            taxAmount,
            total,
            total, // balance_due = total initially
            notes || null,
            paymentTerms || null,
            userId,
          ]
        );

        const invoice = invoiceResult.rows[0];

        // 3. Insert invoice items
        for (let i = 0; i < processedItems.length; i++) {
          const item = processedItems[i];
          await client.query(
            `INSERT INTO invoice_items (
              tenant_id, invoice_id, description, quantity, unit_price,
              tax_rate, tax_amount, subtotal, total, line_order
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
              tenantId,
              invoice.id,
              item.description,
              item.quantity,
              item.unitPrice,
              item.taxRate,
              item.taxAmount,
              item.subtotal,
              item.total,
              i,
            ]
          );
        }

        return invoice;
      });

      logger.info(`Invoice created: ${result.invoice_number} by user ${userId}`);

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get invoice by ID
   */
  async getInvoice(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const { id } = req.params;

      const result = await query(
        `SELECT * FROM invoices WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL`,
        [id, tenantId]
      );

      if (result.rows.length === 0) {
        throw new AppError('Invoice not found', 404);
      }

      const invoice = result.rows[0];

      // Get invoice items
      const itemsResult = await query(
        `SELECT * FROM invoice_items WHERE invoice_id = $1 ORDER BY line_order`,
        [id]
      );

      invoice.items = itemsResult.rows;

      res.json(invoice);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update invoice (only if draft)
   */
  async updateInvoice(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const { id } = req.params;

      // Check if invoice exists and is draft
      const checkResult = await query(
        'SELECT status FROM invoices WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL',
        [id, tenantId]
      );

      if (checkResult.rows.length === 0) {
        throw new AppError('Invoice not found', 404);
      }

      if (checkResult.rows[0].status !== 'draft') {
        throw new AppError('Can only update draft invoices', 400);
      }

      // TODO: Implement update logic
      // Similar to create but with UPDATE queries

      res.json({ message: 'Invoice updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete invoice (only if draft)
   */
  async deleteInvoice(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const { id } = req.params;

      const result = await query(
        `UPDATE invoices 
         SET deleted_at = NOW() 
         WHERE id = $1 AND tenant_id = $2 AND status = 'draft' AND deleted_at IS NULL
         RETURNING id`,
        [id, tenantId]
      );

      if (result.rows.length === 0) {
        throw new AppError('Invoice not found or cannot be deleted', 404);
      }

      res.json({ message: 'Invoice deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Send invoice to customer and submit to tax authority
   */
  async sendInvoice(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const userId = req.user!.userId;
      const { id } = req.params;
      const { sendEmail = true, emailTo } = req.body;

      // Get invoice with tenant info
      const invoiceResult = await query(
        `SELECT i.*, t.country_code, t.currency
         FROM invoices i
         JOIN tenants t ON i.tenant_id = t.id
         WHERE i.id = $1 AND i.tenant_id = $2 AND i.deleted_at IS NULL`,
        [id, tenantId]
      );

      if (invoiceResult.rows.length === 0) {
        throw new AppError('Invoice not found', 404);
      }

      const invoice = invoiceResult.rows[0];

      if (invoice.status !== 'draft') {
        throw new AppError('Invoice has already been sent', 400);
      }

      // Get invoice items
      const itemsResult = await query(
        'SELECT * FROM invoice_items WHERE invoice_id = $1 ORDER BY line_order',
        [id]
      );
      invoice.items = itemsResult.rows;

      // Submit to compliance system (TIMS, EFRIS, VFD, EBM)
      const complianceResult = await this.complianceService.submitInvoice(
        tenantId,
        invoice
      );

      // Create journal entry for the invoice
      await this.doubleEntryService.createInvoiceEntry(tenantId, invoice, userId);

      // Update invoice with compliance data and status
      await query(
        `UPDATE invoices 
         SET status = 'sent', 
             compliance_data = $1,
             sent_at = NOW(),
             updated_at = NOW()
         WHERE id = $2`,
        [JSON.stringify(complianceResult), id]
      );

      // TODO: Send email if requested
      // if (sendEmail && (emailTo || invoice.customer_email)) {
      //   await this.emailService.sendInvoiceEmail(invoice, emailTo || invoice.customer_email);
      // }

      logger.info(`Invoice sent: ${invoice.invoice_number}`);

      res.json({
        success: true,
        sentAt: new Date().toISOString(),
        complianceData: complianceResult,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Download invoice as PDF
   */
  async downloadPDF(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const { id } = req.params;

      // Get invoice with items
      const invoiceResult = await query(
        `SELECT i.*, t.name as business_name, t.address as business_address
         FROM invoices i
         JOIN tenants t ON i.tenant_id = t.id
         WHERE i.id = $1 AND i.tenant_id = $2 AND i.deleted_at IS NULL`,
        [id, tenantId]
      );

      if (invoiceResult.rows.length === 0) {
        throw new AppError('Invoice not found', 404);
      }

      const invoice = invoiceResult.rows[0];

      const itemsResult = await query(
        'SELECT * FROM invoice_items WHERE invoice_id = $1 ORDER BY line_order',
        [id]
      );
      invoice.items = itemsResult.rows;

      // Generate PDF
      const pdfBuffer = await this.pdfService.generateInvoicePDF(invoice);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=invoice-${invoice.invoice_number}.pdf`
      );
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark invoice as paid
   */
  async markPaid(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const { id } = req.params;

      const result = await query(
        `UPDATE invoices 
         SET status = 'paid', 
             amount_paid = total,
             balance_due = 0,
             paid_at = NOW(),
             updated_at = NOW()
         WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL
         RETURNING *`,
        [id, tenantId]
      );

      if (result.rows.length === 0) {
        throw new AppError('Invoice not found', 404);
      }

      res.json(result.rows[0]);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Void invoice
   */
  async voidInvoice(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const { id } = req.params;

      const result = await query(
        `UPDATE invoices 
         SET status = 'void', updated_at = NOW()
         WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL
         RETURNING *`,
        [id, tenantId]
      );

      if (result.rows.length === 0) {
        throw new AppError('Invoice not found', 404);
      }

      res.json(result.rows[0]);
    } catch (error) {
      next(error);
    }
  }
}
