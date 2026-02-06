/**
 * Invoice Routes
 * POST /api/v1/invoices - Create invoice
 * POST /api/v1/invoices/:id/issue - Issue invoice (post to ledger)
 * POST /api/v1/invoices/:id/reverse - Reverse invoice
 */

import express, { Request, Response } from 'express';
import { pool } from '../db/schema';
import { v4 as uuidv4 } from 'uuid';
import { postToLedger } from '../services/ledgerService';
import { logAudit } from '../services/auditService';
import { enqueueTaxSync } from '../services/offlineQueueService';
import { calculateVAT } from '../utils/vatCalculator';

const router = express.Router();

// Create invoice
router.post('/', async (req: Request, res: Response) => {
  try {
    const { customerName, items, currency, dueDate, notes } = req.body;
    
    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => 
      sum + (item.quantity * item.unitPrice), 0
    );
    
    const vatCalc = calculateVAT(subtotal, currency || 'KES');
    
    const id = uuidv4();
    const invoiceNumber = `INV-${Date.now()}`;
    
    const invoice = {
      id,
      invoiceNumber,
      customerName,
      items: JSON.stringify(items),
      currency: currency || 'KES',
      issueDate: new Date(),
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      subtotal,
      vatRate: vatCalc.vatRate,
      vatAmount: vatCalc.vatAmount,
      totalAmount: vatCalc.totalAmount,
      balanceDue: vatCalc.totalAmount,
      status: 'draft',
      taxSyncStatus: 'pending',
      notes,
      createdAt: new Date()
    };

    await pool.query(
      `INSERT INTO invoices (id, invoice_number, customer_name, items, currency, issue_date, due_date, subtotal, vat_rate, vat_amount, total_amount, balance_due, status, tax_sync_status, notes, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
      [
        invoice.id,
        invoice.invoiceNumber,
        invoice.customerName,
        invoice.items,
        invoice.currency,
        invoice.issueDate,
        invoice.dueDate,
        invoice.subtotal,
        invoice.vatRate,
        invoice.vatAmount,
        invoice.totalAmount,
        invoice.balanceDue,
        invoice.status,
        invoice.taxSyncStatus,
        invoice.notes,
        invoice.createdAt
      ]
    );

    // Audit log
    await logAudit('invoice', id, 'create', null, invoice, req.user?.id);

    res.status(201).json(invoice);
  } catch (error: any) {
    console.error('Invoice creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all invoices
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT * FROM invoices ORDER BY created_at DESC LIMIT 100`
    );
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Issue invoice (post to ledger and queue for tax sync)
router.post('/:id/issue', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Get invoice
    const invResult = await pool.query('SELECT * FROM invoices WHERE id = $1', [id]);
    if (invResult.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const invoice = invResult.rows[0];
    
    if (invoice.status !== 'draft') {
      return res.status(400).json({ error: 'Only draft invoices can be issued' });
    }

    // Create ledger entries
    const ledgerEntries = [
      // DR Accounts Receivable
      {
        accountId: 'accounts_receivable',
        debit: invoice.total_amount,
        credit: 0,
        currency: invoice.currency,
        invoiceId: id
      },
      // CR Revenue
      {
        accountId: 'revenue',
        debit: 0,
        credit: invoice.subtotal,
        currency: invoice.currency,
        invoiceId: id
      },
      // CR VAT Payable
      {
        accountId: 'vat_payable',
        debit: 0,
        credit: invoice.vat_amount,
        currency: invoice.currency,
        invoiceId: id
      }
    ];

    // Post to ledger
    await postToLedger(ledgerEntries);

    // Update invoice status
    await pool.query(
      'UPDATE invoices SET status = $1, tax_sync_status = $2 WHERE id = $3',
      ['issued', 'pending', id]
    );

    // Queue for tax sync
    const authority = getTaxAuthority(invoice.currency);
    await enqueueTaxSync({
      entityType: 'invoice',
      entityId: id,
      payload: invoice,
      authority
    });

    // Audit log
    await logAudit('invoice', id, 'issue', invoice, { ...invoice, status: 'issued' }, req.user?.id);

    res.json({ message: 'Invoice issued and posted to ledger', ledgerEntries });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Reverse invoice
router.post('/:id/reverse', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    // Get original invoice
    const invResult = await pool.query('SELECT * FROM invoices WHERE id = $1', [id]);
    if (invResult.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const originalInvoice = invResult.rows[0];
    
    if (originalInvoice.status !== 'issued') {
      return res.status(400).json({ error: 'Only issued invoices can be reversed' });
    }

    // Create reversal invoice
    const reversalId = uuidv4();
    const reversalInvoice = {
      id: reversalId,
      invoiceNumber: `${originalInvoice.invoice_number}-REV`,
      ...originalInvoice,
      subtotal: -originalInvoice.subtotal,
      vatAmount: -originalInvoice.vat_amount,
      totalAmount: -originalInvoice.total_amount,
      balanceDue: -originalInvoice.balance_due,
      status: 'reversed',
      reversalOf: id
    };

    // Insert reversal invoice
    await pool.query(
      `INSERT INTO invoices (id, invoice_number, customer_name, items, currency, issue_date, due_date, subtotal, vat_rate, vat_amount, total_amount, balance_due, status, notes, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [
        reversalInvoice.id,
        reversalInvoice.invoiceNumber,
        reversalInvoice.customerName,
        reversalInvoice.items,
        reversalInvoice.currency,
        new Date(),
        reversalInvoice.dueDate,
        reversalInvoice.subtotal,
        reversalInvoice.vatRate,
        reversalInvoice.vatAmount,
        reversalInvoice.totalAmount,
        reversalInvoice.balanceDue,
        'reversed',
        `Reversal of ${originalInvoice.invoice_number}. Reason: ${reason}`,
        new Date()
      ]
    );

    // Create inverse ledger entries
    const reversalLedgerEntries = [
      // CR Accounts Receivable (was debit)
      {
        accountId: 'accounts_receivable',
        debit: 0,
        credit: originalInvoice.total_amount,
        currency: originalInvoice.currency,
        invoiceId: reversalId
      },
      // DR Revenue (was credit)
      {
        accountId: 'revenue',
        debit: originalInvoice.subtotal,
        credit: 0,
        currency: originalInvoice.currency,
        invoiceId: reversalId
      },
      // DR VAT Payable (was credit)
      {
        accountId: 'vat_payable',
        debit: originalInvoice.vat_amount,
        credit: 0,
        currency: originalInvoice.currency,
        invoiceId: reversalId
      }
    ];

    await postToLedger(reversalLedgerEntries);

    // Update original invoice status
    await pool.query('UPDATE invoices SET status = $1 WHERE id = $2', ['reversed', id]);

    // Audit log
    await logAudit('invoice', id, 'reverse', originalInvoice, { ...originalInvoice, status: 'reversed' }, req.user?.id);
    await logAudit('invoice', reversalId, 'create', null, reversalInvoice, req.user?.id);

    res.json({ 
      message: 'Invoice reversed',
      originalInvoice: { ...originalInvoice, status: 'reversed' },
      reversalInvoice,
      reversalLedgerEntries
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to determine tax authority based on currency
function getTaxAuthority(currency: string): string {
  const authorities: { [key: string]: string } = {
    'KES': 'TIMS',    // Kenya
    'UGX': 'EFRIS',   // Uganda
    'TZS': 'VFD',     // Tanzania
    'RWF': 'EBM',     // Rwanda
    'BIF': 'Generic'  // Burundi
  };
  return authorities[currency] || 'Generic';
}

export default router;
