/**
 * Transaction Routes
 * POST /api/v1/transactions - Create transaction
 * GET /api/v1/transactions - List transactions
 * POST /api/v1/transactions/:id/post - Post to ledger
 */

import express, { Request, Response } from 'express';
import { pool } from '../db/schema';
import { v4 as uuidv4 } from 'uuid';
import { postToLedger } from '../services/ledgerService';
import { logAudit } from '../services/auditService';
import { calculateVAT } from '../utils/vatCalculator';

const router = express.Router();

// Create transaction
router.post('/', async (req: Request, res: Response) => {
  try {
    const { type, amount, description, currency, paymentMethod } = req.body;
    
    // Calculate VAT
    const vatCalc = calculateVAT(amount, currency || 'KES');
    
    const id = uuidv4();
    const transaction = {
      id,
      type,
      amount,
      vatRate: vatCalc.vatRate,
      vatAmount: vatCalc.vatAmount,
      totalAmount: vatCalc.totalAmount,
      currency: currency || 'KES',
      description,
      paymentMethod,
      transactionDate: new Date(),
      status: 'draft',
      createdAt: new Date()
    };

    // Insert transaction
    await pool.query(
      `INSERT INTO transactions (id, type, amount, vat_rate, vat_amount, total_amount, currency, description, payment_method, transaction_date, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        transaction.id,
        transaction.type,
        transaction.amount,
        transaction.vatRate,
        transaction.vatAmount,
        transaction.totalAmount,
        transaction.currency,
        transaction.description,
        transaction.paymentMethod,
        transaction.transactionDate,
        transaction.status,
        transaction.createdAt
      ]
    );

    // Audit log
    await logAudit('transaction', id, 'create', null, transaction, req.user?.id);

    res.status(201).json(transaction);
  } catch (error: any) {
    console.error('Transaction creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all transactions
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT * FROM transactions ORDER BY created_at DESC LIMIT 100`
    );
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Post transaction (create ledger entries)
router.post('/:id/post', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Get transaction
    const txResult = await pool.query('SELECT * FROM transactions WHERE id = $1', [id]);
    if (txResult.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const transaction = txResult.rows[0];
    
    // Check if already posted
    if (transaction.status === 'posted') {
      return res.status(400).json({ error: 'Transaction already posted' });
    }

    // Create ledger entries based on type
    const ledgerEntries = [];
    
    if (transaction.type === 'income') {
      // DR Cash (total)
      ledgerEntries.push({
        accountId: 'cash',
        debit: transaction.total_amount,
        credit: 0,
        currency: transaction.currency,
        transactionId: id
      });
      
      // CR Revenue (amount)
      ledgerEntries.push({
        accountId: 'revenue',
        debit: 0,
        credit: transaction.amount,
        currency: transaction.currency,
        transactionId: id
      });
      
      // CR VAT Payable (vat)
      if (transaction.vat_amount > 0) {
        ledgerEntries.push({
          accountId: 'vat_payable',
          debit: 0,
          credit: transaction.vat_amount,
          currency: transaction.currency,
          transactionId: id
        });
      }
    } else {
      // Expense: DR Expense, DR VAT Receivable, CR Cash
      ledgerEntries.push({
        accountId: 'expenses',
        debit: transaction.amount,
        credit: 0,
        currency: transaction.currency,
        transactionId: id
      });
      
      if (transaction.vat_amount > 0) {
        ledgerEntries.push({
          accountId: 'vat_receivable',
          debit: transaction.vat_amount,
          credit: 0,
          currency: transaction.currency,
          transactionId: id
        });
      }
      
      ledgerEntries.push({
        accountId: 'cash',
        debit: 0,
        credit: transaction.total_amount,
        currency: transaction.currency,
        transactionId: id
      });
    }

    // Post to ledger
    await postToLedger(ledgerEntries);

    // Update transaction status
    await pool.query('UPDATE transactions SET status = $1 WHERE id = $2', ['posted', id]);

    // Audit log
    await logAudit('transaction', id, 'post', transaction, { ...transaction, status: 'posted' }, req.user?.id);

    res.json({ message: 'Transaction posted to ledger', ledgerEntries });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
