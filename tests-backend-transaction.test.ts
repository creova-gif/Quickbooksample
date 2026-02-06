/**
 * Transaction API Tests
 * Tests double-entry accounting, VAT calculation, audit logging
 */

import request from 'supertest';
import app from '../src/index';
import { pool } from '../src/db/schema';

describe('Transaction API', () => {
  beforeAll(async () => {
    // Initialize test database
    await pool.query('DELETE FROM transactions');
    await pool.query('DELETE FROM ledger_entries');
    await pool.query('DELETE FROM audit_logs');
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('POST /api/v1/transactions', () => {
    it('should create transaction with correct VAT (Kenya 16%)', async () => {
      const response = await request(app)
        .post('/api/v1/transactions')
        .send({
          type: 'income',
          amount: 10000,
          description: 'Test sale',
          currency: 'KES',
          paymentMethod: 'mpesa'
        });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        type: 'income',
        amount: 10000,
        vatRate: 0.16,
        vatAmount: 1600,
        totalAmount: 11600,
        currency: 'KES',
        status: 'draft'
      });
    });

    it('should create transaction with correct VAT (Uganda 18%)', async () => {
      const response = await request(app)
        .post('/api/v1/transactions')
        .send({
          type: 'income',
          amount: 10000,
          description: 'Test sale',
          currency: 'UGX'
        });

      expect(response.status).toBe(201);
      expect(response.body.vatRate).toBe(0.18);
      expect(response.body.vatAmount).toBe(1800);
      expect(response.body.totalAmount).toBe(11800);
    });

    it('should create audit log entry', async () => {
      const response = await request(app)
        .post('/api/v1/transactions')
        .send({
          type: 'income',
          amount: 5000,
          description: 'Audit test',
          currency: 'KES'
        });

      const transactionId = response.body.id;

      // Check audit log
      const auditResult = await pool.query(
        'SELECT * FROM audit_logs WHERE entity_id = $1 AND entity_type = $2',
        [transactionId, 'transaction']
      );

      expect(auditResult.rows.length).toBeGreaterThan(0);
      expect(auditResult.rows[0].action).toBe('create');
    });
  });

  describe('POST /api/v1/transactions/:id/post', () => {
    it('should post income transaction to ledger with correct entries', async () => {
      // Create transaction
      const createResponse = await request(app)
        .post('/api/v1/transactions')
        .send({
          type: 'income',
          amount: 10000,
          description: 'Ledger test',
          currency: 'KES'
        });

      const transactionId = createResponse.body.id;

      // Post to ledger
      const postResponse = await request(app)
        .post(`/api/v1/transactions/${transactionId}/post`)
        .send();

      expect(postResponse.status).toBe(200);

      // Check ledger entries
      const ledgerResult = await pool.query(
        'SELECT * FROM ledger_entries WHERE transaction_id = $1',
        [transactionId]
      );

      expect(ledgerResult.rows).toHaveLength(3); // Cash DR, Revenue CR, VAT CR

      // Validate double-entry
      const totalDebits = ledgerResult.rows.reduce((sum, entry) => sum + parseFloat(entry.debit), 0);
      const totalCredits = ledgerResult.rows.reduce((sum, entry) => sum + parseFloat(entry.credit), 0);

      expect(totalDebits).toBe(totalCredits);
      expect(totalDebits).toBe(11600); // 10000 + 1600 VAT
    });

    it('should post expense transaction to ledger with correct entries', async () => {
      // Create expense
      const createResponse = await request(app)
        .post('/api/v1/transactions')
        .send({
          type: 'expense',
          amount: 5000,
          description: 'Expense test',
          currency: 'KES'
        });

      const transactionId = createResponse.body.id;

      // Post to ledger
      await request(app)
        .post(`/api/v1/transactions/${transactionId}/post`)
        .send();

      // Check ledger entries
      const ledgerResult = await pool.query(
        'SELECT * FROM ledger_entries WHERE transaction_id = $1',
        [transactionId]
      );

      expect(ledgerResult.rows).toHaveLength(3); // Expense DR, VAT Receivable DR, Cash CR

      // Validate double-entry
      const totalDebits = ledgerResult.rows.reduce((sum, entry) => sum + parseFloat(entry.debit), 0);
      const totalCredits = ledgerResult.rows.reduce((sum, entry) => sum + parseFloat(entry.credit), 0);

      expect(totalDebits).toBe(totalCredits);
      expect(totalCredits).toBe(5800); // 5000 + 800 VAT
    });

    it('should not allow posting already posted transaction', async () => {
      // Create and post transaction
      const createResponse = await request(app)
        .post('/api/v1/transactions')
        .send({
          type: 'income',
          amount: 1000,
          currency: 'KES'
        });

      const transactionId = createResponse.body.id;
      
      await request(app)
        .post(`/api/v1/transactions/${transactionId}/post`)
        .send();

      // Try to post again
      const secondPostResponse = await request(app)
        .post(`/api/v1/transactions/${transactionId}/post`)
        .send();

      expect(secondPostResponse.status).toBe(400);
      expect(secondPostResponse.body.error).toContain('already posted');
    });

    it('should create audit log on post', async () => {
      const createResponse = await request(app)
        .post('/api/v1/transactions')
        .send({
          type: 'income',
          amount: 1000,
          currency: 'KES'
        });

      const transactionId = createResponse.body.id;
      
      await request(app)
        .post(`/api/v1/transactions/${transactionId}/post`)
        .send();

      // Check audit log for post action
      const auditResult = await pool.query(
        'SELECT * FROM audit_logs WHERE entity_id = $1 AND action = $2',
        [transactionId, 'post']
      );

      expect(auditResult.rows.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/transactions', () => {
    it('should return list of transactions', async () => {
      const response = await request(app)
        .get('/api/v1/transactions')
        .send();

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
