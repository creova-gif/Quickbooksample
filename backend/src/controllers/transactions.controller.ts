/**
 * Transactions Controller
 */

import { Request, Response, NextFunction } from 'express';
import { query, transaction } from '../db';
import { AppError } from '../shared/utils/app-error';
import { logger } from '../shared/utils/logger';
import { AICategorizationService } from '../services/ai/categorization.service';
import { DoubleEntryService } from '../services/accounting/double-entry.service';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    tenantId: string;
  };
}

export class TransactionsController {
  private aiCategorizationService: AICategorizationService;
  private doubleEntryService: DoubleEntryService;

  constructor() {
    this.aiCategorizationService = new AICategorizationService();
    this.doubleEntryService = new DoubleEntryService();
  }

  /**
   * List all transactions
   */
  async listTransactions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const {
        type,
        categoryId,
        from,
        to,
        limit = '50',
        offset = '0',
      } = req.query;

      let queryText = `
        SELECT 
          t.id, t.transaction_date, t.type, t.amount, t.currency,
          t.description, t.reference, t.status, t.payment_method,
          c.id as category_id, c.name as category_name, c.color as category_color,
          ct.name as contact_name,
          t.created_at
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        LEFT JOIN contacts ct ON t.contact_id = ct.id
        WHERE t.tenant_id = $1 AND t.deleted_at IS NULL
      `;
      const params: any[] = [tenantId];
      let paramIndex = 2;

      if (type) {
        queryText += ` AND t.type = $${paramIndex}`;
        params.push(type);
        paramIndex++;
      }

      if (categoryId) {
        queryText += ` AND t.category_id = $${paramIndex}`;
        params.push(categoryId);
        paramIndex++;
      }

      if (from) {
        queryText += ` AND t.transaction_date >= $${paramIndex}`;
        params.push(from);
        paramIndex++;
      }

      if (to) {
        queryText += ` AND t.transaction_date <= $${paramIndex}`;
        params.push(to);
        paramIndex++;
      }

      queryText += ' ORDER BY t.transaction_date DESC, t.created_at DESC';
      queryText += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(parseInt(limit as string), parseInt(offset as string));

      const result = await query(queryText, params);

      const countResult = await query(
        'SELECT COUNT(*) FROM transactions WHERE tenant_id = $1 AND deleted_at IS NULL',
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
   * Create new transaction
   */
  async createTransaction(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const userId = req.user!.userId;
      const {
        transactionDate,
        type,
        amount,
        currency,
        description,
        categoryId,
        contactId,
        reference,
        taxRate = 0,
        taxAmount = 0,
        paymentMethod,
        paymentMethodDetails,
        attachmentUrls,
      } = req.body;

      // If no category provided, use AI to suggest one
      let finalCategoryId = categoryId;
      let aiSuggestedCategoryId = null;
      let aiConfidence = null;

      if (!categoryId && type === 'expense') {
        const suggestion = await this.aiCategorizationService.categorizeTransaction(
          tenantId,
          { description, amount }
        );
        finalCategoryId = suggestion.categoryId;
        aiSuggestedCategoryId = suggestion.categoryId;
        aiConfidence = suggestion.confidence;
      }

      const result = await transaction(async (client) => {
        // Insert transaction
        const txResult = await client.query(
          `INSERT INTO transactions (
            tenant_id, transaction_date, type, amount, currency,
            description, category_id, contact_id, reference,
            tax_rate, tax_amount, payment_method, payment_method_details,
            attachment_urls, ai_suggested_category_id, ai_confidence,
            status, created_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, 'confirmed', $17)
          RETURNING *`,
          [
            tenantId,
            transactionDate,
            type,
            amount,
            currency,
            description,
            finalCategoryId,
            contactId || null,
            reference || null,
            taxRate,
            taxAmount,
            paymentMethod || null,
            paymentMethodDetails ? JSON.stringify(paymentMethodDetails) : null,
            attachmentUrls ? JSON.stringify(attachmentUrls) : null,
            aiSuggestedCategoryId,
            aiConfidence,
            userId,
          ]
        );

        const newTransaction = txResult.rows[0];

        // Create journal entry
        const journalEntryId = await this.doubleEntryService.createTransactionEntry(
          tenantId,
          newTransaction,
          userId
        );

        newTransaction.journal_entry_id = journalEntryId;

        return newTransaction;
      });

      logger.info(`Transaction created: ${result.id} by user ${userId}`);

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get transaction by ID
   */
  async getTransaction(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const { id } = req.params;

      const result = await query(
        `SELECT 
          t.*,
          c.name as category_name,
          ct.name as contact_name
         FROM transactions t
         LEFT JOIN categories c ON t.category_id = c.id
         LEFT JOIN contacts ct ON t.contact_id = ct.id
         WHERE t.id = $1 AND t.tenant_id = $2 AND t.deleted_at IS NULL`,
        [id, tenantId]
      );

      if (result.rows.length === 0) {
        throw new AppError('Transaction not found', 404);
      }

      res.json(result.rows[0]);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update transaction
   */
  async updateTransaction(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const { id } = req.params;
      const updates = req.body;

      // Check if transaction exists
      const checkResult = await query(
        'SELECT id FROM transactions WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL',
        [id, tenantId]
      );

      if (checkResult.rows.length === 0) {
        throw new AppError('Transaction not found', 404);
      }

      // Build update query dynamically
      const allowedFields = [
        'description',
        'category_id',
        'amount',
        'tax_rate',
        'tax_amount',
        'reference',
      ];
      const updateFields: string[] = [];
      const updateValues: any[] = [];
      let paramIndex = 1;

      Object.keys(updates).forEach((key) => {
        if (allowedFields.includes(key)) {
          updateFields.push(`${key} = $${paramIndex}`);
          updateValues.push(updates[key]);
          paramIndex++;
        }
      });

      if (updateFields.length === 0) {
        throw new AppError('No valid fields to update', 400);
      }

      updateFields.push('updated_at = NOW()');

      const updateQuery = `
        UPDATE transactions 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex} AND tenant_id = $${paramIndex + 1}
        RETURNING *
      `;
      updateValues.push(id, tenantId);

      const result = await query(updateQuery, updateValues);

      res.json(result.rows[0]);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete transaction
   */
  async deleteTransaction(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const { id } = req.params;

      const result = await query(
        `UPDATE transactions 
         SET deleted_at = NOW() 
         WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL
         RETURNING id`,
        [id, tenantId]
      );

      if (result.rows.length === 0) {
        throw new AppError('Transaction not found', 404);
      }

      res.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update transaction category
   */
  async categorize(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const { id } = req.params;
      const { categoryId } = req.body;

      const result = await query(
        `UPDATE transactions 
         SET category_id = $1, updated_at = NOW()
         WHERE id = $2 AND tenant_id = $3 AND deleted_at IS NULL
         RETURNING *`,
        [categoryId, id, tenantId]
      );

      if (result.rows.length === 0) {
        throw new AppError('Transaction not found', 404);
      }

      // Learn from user correction if AI suggestion was different
      if (result.rows[0].ai_suggested_category_id && 
          result.rows[0].ai_suggested_category_id !== categoryId) {
        await this.aiCategorizationService.learnFromCorrection(
          tenantId,
          result.rows[0].description,
          result.rows[0].ai_suggested_category_id,
          categoryId
        );
      }

      res.json(result.rows[0]);
    } catch (error) {
      next(error);
    }
  }
}
