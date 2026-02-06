# BACKEND CODE SAMPLES

Production-ready code samples for key modules of the East Africa Accounting Platform.

---

## 📁 File: `backend/src/modules/compliance/adapters/base.adapter.ts`

```typescript
/**
 * Base Compliance Adapter Interface
 * All country-specific adapters must implement this interface
 */

export interface ComplianceConfig {
  apiBaseUrl: string;
  apiKey?: string;
  certificatePath?: string;
  timeout: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface EInvoicePayload {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  seller: {
    name: string;
    taxId: string;
    address: string;
  };
  buyer: {
    name: string;
    taxId?: string;
    address?: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    total: number;
  }>;
  subtotal: number;
  taxAmount: number;
  total: number;
  currency: string;
}

export interface SubmissionResult {
  success: boolean;
  invoiceId?: string;
  qrCode?: string;
  signature?: string;
  verificationUrl?: string;
  error?: string;
  rawResponse?: any;
}

export interface TaxReportPayload {
  periodStart: string;
  periodEnd: string;
  totalSales: number;
  totalPurchases: number;
  taxCollected: number;
  taxPaid: number;
  netTax: number;
}

export interface TaxReportResult {
  success: boolean;
  referenceNumber?: string;
  filedDate?: string;
  error?: string;
}

export abstract class BaseComplianceAdapter {
  protected config: ComplianceConfig;

  constructor(config: ComplianceConfig) {
    this.config = config;
  }

  /**
   * Validate invoice before submission
   */
  abstract validateInvoice(invoice: EInvoicePayload): Promise<ValidationResult>;

  /**
   * Generate country-specific e-invoice format
   */
  abstract generateEInvoice(invoice: EInvoicePayload): Promise<any>;

  /**
   * Submit e-invoice to tax authority
   */
  abstract submitToAuthority(payload: any): Promise<SubmissionResult>;

  /**
   * Verify submitted invoice
   */
  abstract verifyInvoice(invoiceId: string): Promise<any>;

  /**
   * Generate tax report for period
   */
  abstract generateTaxReport(payload: TaxReportPayload): Promise<any>;

  /**
   * Submit tax report to authority
   */
  abstract submitTaxReport(report: any): Promise<TaxReportResult>;

  /**
   * Validate tax ID format
   */
  abstract validateTaxId(taxId: string): boolean;

  /**
   * Get country code
   */
  abstract getCountryCode(): string;
}
```

---

## 📁 File: `backend/src/modules/compliance/adapters/tims.adapter.ts`

```typescript
/**
 * Kenya TIMS (Tax Invoice Management System) Adapter
 * KRA e-Invoicing Integration
 */

import axios, { AxiosInstance } from 'axios';
import * as QRCode from 'qrcode';
import { BaseComplianceAdapter, EInvoicePayload, SubmissionResult, ValidationResult } from './base.adapter';

export class TIMSAdapter extends BaseComplianceAdapter {
  private httpClient: AxiosInstance;

  constructor(config: any) {
    super(config);
    this.httpClient = axios.create({
      baseURL: config.apiBaseUrl || 'https://itax.kra.go.ke/tims/api',
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
    });
  }

  getCountryCode(): string {
    return 'KE';
  }

  validateTaxId(taxId: string): boolean {
    // Kenya PIN format: A000000000X (1 letter + 9 digits + 1 letter)
    const pinRegex = /^[A-Z]\d{9}[A-Z]$/;
    return pinRegex.test(taxId);
  }

  async validateInvoice(invoice: EInvoicePayload): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate seller PIN
    if (!this.validateTaxId(invoice.seller.taxId)) {
      errors.push('Invalid seller KRA PIN format');
    }

    // Validate buyer PIN (optional but recommended)
    if (invoice.buyer.taxId && !this.validateTaxId(invoice.buyer.taxId)) {
      warnings.push('Invalid buyer KRA PIN format');
    }

    // Validate amounts
    if (invoice.total <= 0) {
      errors.push('Invoice total must be greater than 0');
    }

    // Validate VAT rate (should be 16% in Kenya)
    const expectedVatRate = 16;
    invoice.items.forEach((item, index) => {
      if (item.taxRate !== expectedVatRate && item.taxRate !== 0) {
        warnings.push(`Item ${index + 1}: VAT rate ${item.taxRate}% does not match standard rate of ${expectedVatRate}%`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  async generateEInvoice(invoice: EInvoicePayload): Promise<any> {
    // Transform to TIMS format
    const timsPayload = {
      invoiceType: '1', // Standard invoice
      invoiceNumber: invoice.invoiceNumber,
      issueDateTime: new Date(invoice.issueDate).toISOString(),
      dueDate: new Date(invoice.dueDate).toISOString(),
      
      seller: {
        pin: invoice.seller.taxId,
        name: invoice.seller.name,
        address: invoice.seller.address,
      },
      
      buyer: {
        pin: invoice.buyer.taxId || '',
        name: invoice.buyer.name,
        address: invoice.buyer.address || '',
      },
      
      items: invoice.items.map((item, index) => ({
        itemSeq: index + 1,
        itemCode: `ITEM-${index + 1}`,
        itemClassificationCode: '56101501', // Default service code
        itemName: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate,
        taxAmount: item.total - (item.quantity * item.unitPrice),
        totalAmount: item.total,
      })),
      
      summary: {
        taxableAmount: invoice.subtotal,
        taxAmount: invoice.taxAmount,
        totalAmount: invoice.total,
      },
      
      currency: invoice.currency,
    };

    return timsPayload;
  }

  async submitToAuthority(payload: any): Promise<SubmissionResult> {
    try {
      // 1. Submit invoice to TIMS
      const response = await this.httpClient.post('/invoices/submit', payload);

      if (response.data.success) {
        const timsInvoiceId = response.data.invoiceId;
        const internalData = response.data.internalData;

        // 2. Generate QR Code for invoice verification
        const qrData = {
          invoiceId: timsInvoiceId,
          seller: payload.seller.pin,
          buyer: payload.buyer.pin,
          total: payload.summary.totalAmount,
          date: payload.issueDateTime,
        };

        const qrCodeBase64 = await QRCode.toDataURL(JSON.stringify(qrData));

        // 3. Generate verification URL
        const verificationUrl = `https://itax.kra.go.ke/verify/${timsInvoiceId}`;

        return {
          success: true,
          invoiceId: timsInvoiceId,
          qrCode: qrCodeBase64,
          verificationUrl,
          rawResponse: response.data,
        };
      } else {
        return {
          success: false,
          error: response.data.message || 'TIMS submission failed',
          rawResponse: response.data,
        };
      }
    } catch (error: any) {
      console.error('TIMS submission error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Network error',
        rawResponse: error.response?.data,
      };
    }
  }

  async verifyInvoice(invoiceId: string): Promise<any> {
    try {
      const response = await this.httpClient.get(`/invoices/verify/${invoiceId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(`TIMS verification failed: ${error.message}`);
    }
  }

  async generateTaxReport(payload: any): Promise<any> {
    // TIMS VAT Return format
    return {
      period: {
        start: payload.periodStart,
        end: payload.periodEnd,
      },
      sales: {
        standard: payload.totalSales, // 16% VAT
        zeroRated: 0,
        exempt: 0,
        total: payload.totalSales,
      },
      purchases: {
        standard: payload.totalPurchases,
        zeroRated: 0,
        exempt: 0,
        total: payload.totalPurchases,
      },
      vat: {
        output: payload.taxCollected,
        input: payload.taxPaid,
        net: payload.netTax,
      },
    };
  }

  async submitTaxReport(report: any): Promise<any> {
    try {
      const response = await this.httpClient.post('/vat/submit', report);
      return {
        success: true,
        referenceNumber: response.data.referenceNumber,
        filedDate: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }
}
```

---

## 📁 File: `backend/src/modules/accounting/double-entry.engine.ts`

```typescript
/**
 * Double-Entry Bookkeeping Engine
 * Ensures all transactions are balanced (debits = credits)
 */

import { pool } from '../../shared/database/connection';

export interface JournalEntryLine {
  accountId: string;
  debit: number;
  credit: number;
  description?: string;
}

export interface JournalEntry {
  tenantId: string;
  entryDate: string;
  description: string;
  reference?: string;
  sourceType?: string;
  sourceId?: string;
  lines: JournalEntryLine[];
  createdBy: string;
}

export class DoubleEntryEngine {
  /**
   * Validate that journal entry is balanced
   */
  static validateBalance(lines: JournalEntryLine[]): { valid: boolean; error?: string } {
    const totalDebits = lines.reduce((sum, line) => sum + line.debit, 0);
    const totalCredits = lines.reduce((sum, line) => sum + line.credit, 0);

    // Allow for floating point precision errors (0.01 tolerance)
    const difference = Math.abs(totalDebits - totalCredits);
    
    if (difference > 0.01) {
      return {
        valid: false,
        error: `Journal entry is not balanced. Debits: ${totalDebits}, Credits: ${totalCredits}, Difference: ${difference}`,
      };
    }

    // Ensure each line has either debit or credit (not both)
    for (const line of lines) {
      if ((line.debit > 0 && line.credit > 0) || (line.debit === 0 && line.credit === 0)) {
        return {
          valid: false,
          error: 'Each journal line must have either a debit or credit amount, but not both or neither',
        };
      }
    }

    return { valid: true };
  }

  /**
   * Create a journal entry with validation
   */
  static async createJournalEntry(entry: JournalEntry): Promise<string> {
    // Validate balance
    const validation = this.validateBalance(entry.lines);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // 1. Generate entry number
      const entryNumberResult = await client.query(
        `SELECT COALESCE(MAX(CAST(SUBSTRING(entry_number FROM 'JE-\\d{4}-(\\d+)') AS INTEGER)), 0) + 1 as next_number
         FROM journal_entries 
         WHERE tenant_id = $1 
         AND entry_number LIKE $2`,
        [entry.tenantId, `JE-${new Date().getFullYear()}-%`]
      );
      const nextNumber = entryNumberResult.rows[0].next_number;
      const entryNumber = `JE-${new Date().getFullYear()}-${String(nextNumber).padStart(4, '0')}`;

      // 2. Insert journal entry header
      const entryResult = await client.query(
        `INSERT INTO journal_entries (
          tenant_id, entry_date, entry_number, description, reference, 
          source_type, source_id, status, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'draft', $8) 
        RETURNING id`,
        [
          entry.tenantId,
          entry.entryDate,
          entryNumber,
          entry.description,
          entry.reference,
          entry.sourceType,
          entry.sourceId,
          entry.createdBy,
        ]
      );
      const journalEntryId = entryResult.rows[0].id;

      // 3. Insert journal entry lines
      for (const line of entry.lines) {
        await client.query(
          `INSERT INTO journal_entry_lines (
            tenant_id, journal_entry_id, account_id, debit, credit, description
          ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            entry.tenantId,
            journalEntryId,
            line.accountId,
            line.debit,
            line.credit,
            line.description,
          ]
        );
      }

      await client.query('COMMIT');
      return journalEntryId;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Post a journal entry (make it final)
   */
  static async postJournalEntry(journalEntryId: string, userId: string): Promise<void> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 1. Update entry status
      await client.query(
        `UPDATE journal_entries 
         SET status = 'posted', posted_at = NOW(), posted_by = $1 
         WHERE id = $2 AND status = 'draft'`,
        [userId, journalEntryId]
      );

      // 2. Update account balances
      const linesResult = await client.query(
        `SELECT account_id, debit, credit 
         FROM journal_entry_lines 
         WHERE journal_entry_id = $1`,
        [journalEntryId]
      );

      for (const line of linesResult.rows) {
        await client.query(
          `UPDATE accounts 
           SET 
             balance = balance + $1 - $2,
             debit_balance = debit_balance + $1,
             credit_balance = credit_balance + $2
           WHERE id = $3`,
          [line.debit, line.credit, line.account_id]
        );
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Reverse a journal entry
   */
  static async reverseJournalEntry(
    journalEntryId: string,
    reverseDate: string,
    userId: string,
    reason: string
  ): Promise<string> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 1. Get original entry
      const entryResult = await client.query(
        `SELECT * FROM journal_entries WHERE id = $1 AND status = 'posted'`,
        [journalEntryId]
      );

      if (entryResult.rows.length === 0) {
        throw new Error('Journal entry not found or not posted');
      }

      const originalEntry = entryResult.rows[0];

      // 2. Get original lines
      const linesResult = await client.query(
        `SELECT * FROM journal_entry_lines WHERE journal_entry_id = $1`,
        [journalEntryId]
      );

      // 3. Create reversing entry with swapped debits/credits
      const reversingLines: JournalEntryLine[] = linesResult.rows.map((line: any) => ({
        accountId: line.account_id,
        debit: line.credit, // Swap debit and credit
        credit: line.debit,
        description: `Reversal of ${line.description || ''}`,
      }));

      const reversingEntry: JournalEntry = {
        tenantId: originalEntry.tenant_id,
        entryDate: reverseDate,
        description: `REVERSAL: ${reason}`,
        reference: originalEntry.reference,
        sourceType: originalEntry.source_type,
        sourceId: originalEntry.source_id,
        lines: reversingLines,
        createdBy: userId,
      };

      const reversingEntryId = await this.createJournalEntry(reversingEntry);

      // 4. Post the reversing entry
      await this.postJournalEntry(reversingEntryId, userId);

      // 5. Mark original entry as reversed
      await client.query(
        `UPDATE journal_entries 
         SET status = 'reversed', reversed_at = NOW(), reversed_by_id = $1 
         WHERE id = $2`,
        [reversingEntryId, journalEntryId]
      );

      await client.query('COMMIT');
      return reversingEntryId;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Create journal entry for an invoice
   */
  static async createInvoiceEntry(
    tenantId: string,
    invoiceId: string,
    invoice: any,
    accountsReceivableId: string,
    revenueAccountId: string,
    vatPayableAccountId: string,
    userId: string
  ): Promise<string> {
    const lines: JournalEntryLine[] = [
      // Debit: Accounts Receivable (Asset increases)
      {
        accountId: accountsReceivableId,
        debit: invoice.total,
        credit: 0,
        description: `Invoice ${invoice.invoiceNumber} - ${invoice.customerName}`,
      },
      // Credit: Revenue (Revenue increases)
      {
        accountId: revenueAccountId,
        debit: 0,
        credit: invoice.subtotal,
        description: `Sales revenue from invoice ${invoice.invoiceNumber}`,
      },
      // Credit: VAT Payable (Liability increases)
      {
        accountId: vatPayableAccountId,
        debit: 0,
        credit: invoice.taxAmount,
        description: `VAT collected on invoice ${invoice.invoiceNumber}`,
      },
    ];

    const entry: JournalEntry = {
      tenantId,
      entryDate: invoice.invoiceDate,
      description: `Invoice ${invoice.invoiceNumber}`,
      reference: invoice.invoiceNumber,
      sourceType: 'invoice',
      sourceId: invoiceId,
      lines,
      createdBy: userId,
    };

    const journalEntryId = await this.createJournalEntry(entry);
    await this.postJournalEntry(journalEntryId, userId);

    return journalEntryId;
  }

  /**
   * Create journal entry for a payment
   */
  static async createPaymentEntry(
    tenantId: string,
    paymentId: string,
    payment: any,
    bankAccountId: string,
    accountsReceivableId: string,
    userId: string
  ): Promise<string> {
    const lines: JournalEntryLine[] = [
      // Debit: Bank Account (Asset increases)
      {
        accountId: bankAccountId,
        debit: payment.amount,
        credit: 0,
        description: `Payment ${payment.paymentNumber} from ${payment.contactName}`,
      },
      // Credit: Accounts Receivable (Asset decreases)
      {
        accountId: accountsReceivableId,
        debit: 0,
        credit: payment.amount,
        description: `Payment received - ${payment.reference}`,
      },
    ];

    const entry: JournalEntry = {
      tenantId,
      entryDate: payment.paymentDate,
      description: `Payment ${payment.paymentNumber}`,
      reference: payment.reference,
      sourceType: 'payment',
      sourceId: paymentId,
      lines,
      createdBy: userId,
    };

    const journalEntryId = await this.createJournalEntry(entry);
    await this.postJournalEntry(journalEntryId, userId);

    return journalEntryId;
  }

  /**
   * Create journal entry for an expense
   */
  static async createExpenseEntry(
    tenantId: string,
    transactionId: string,
    transaction: any,
    expenseAccountId: string,
    bankAccountId: string,
    vatRecoverableAccountId: string,
    userId: string
  ): Promise<string> {
    const lines: JournalEntryLine[] = [
      // Debit: Expense Account (Expense increases)
      {
        accountId: expenseAccountId,
        debit: transaction.amount - transaction.taxAmount,
        credit: 0,
        description: transaction.description,
      },
    ];

    // Add VAT recoverable if applicable
    if (transaction.taxAmount > 0) {
      lines.push({
        accountId: vatRecoverableAccountId,
        debit: transaction.taxAmount,
        credit: 0,
        description: `VAT on ${transaction.description}`,
      });
    }

    // Credit: Bank Account (Asset decreases)
    lines.push({
      accountId: bankAccountId,
      debit: 0,
      credit: transaction.amount,
      description: `Payment for ${transaction.description}`,
    });

    const entry: JournalEntry = {
      tenantId,
      entryDate: transaction.transactionDate,
      description: transaction.description,
      reference: transaction.reference,
      sourceType: 'transaction',
      sourceId: transactionId,
      lines,
      createdBy: userId,
    };

    const journalEntryId = await this.createJournalEntry(entry);
    await this.postJournalEntry(journalEntryId, userId);

    return journalEntryId;
  }
}
```

---

## 📁 File: `backend/src/modules/ai/categorization.service.ts`

```typescript
/**
 * AI-Powered Transaction Categorization Service
 * Uses OpenAI GPT for intelligent expense categorization
 */

import OpenAI from 'openai';
import { pool } from '../../shared/database/connection';

interface CategorizationRequest {
  description: string;
  amount: number;
  merchant?: string;
  date?: string;
}

interface CategorizationResult {
  categoryId: string;
  categoryName: string;
  confidence: number;
  explanation: string;
  alternatives: Array<{
    categoryId: string;
    categoryName: string;
    confidence: number;
  }>;
}

export class CategorizationService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Categorize transaction using AI
   */
  async categorizeTransaction(
    tenantId: string,
    request: CategorizationRequest
  ): Promise<CategorizationResult> {
    // 1. Get available categories for tenant
    const categoriesResult = await pool.query(
      `SELECT id, name, type FROM categories 
       WHERE tenant_id = $1 AND type = 'expense' AND is_active = true AND deleted_at IS NULL`,
      [tenantId]
    );

    const categories = categoriesResult.rows;

    // 2. Get historical categorizations for learning
    const historyResult = await pool.query(
      `SELECT description, category_id, categories.name as category_name
       FROM transactions 
       JOIN categories ON transactions.category_id = categories.id
       WHERE transactions.tenant_id = $1 
       AND transactions.type = 'expense'
       AND transactions.deleted_at IS NULL
       ORDER BY transactions.created_at DESC
       LIMIT 50`,
      [tenantId]
    );

    const history = historyResult.rows;

    // 3. Build prompt with context
    const categoryList = categories.map(c => `- ${c.name} (ID: ${c.id})`).join('\n');
    const exampleList = history.slice(0, 10).map(h => 
      `"${h.description}" → ${h.category_name}`
    ).join('\n');

    const prompt = `You are an AI assistant helping categorize business expenses for an East African company.

Available expense categories:
${categoryList}

Recent categorization examples from this business:
${exampleList}

Now categorize this transaction:
Description: "${request.description}"
Amount: ${request.amount}
${request.merchant ? `Merchant: ${request.merchant}` : ''}

Respond in JSON format:
{
  "categoryId": "uuid-of-best-matching-category",
  "confidence": 0.95,
  "explanation": "Short explanation of why this category fits",
  "alternatives": [
    { "categoryId": "uuid", "confidence": 0.75 },
    { "categoryId": "uuid", "confidence": 0.45 }
  ]
}

IMPORTANT:
- Use ONLY category IDs from the available categories list above
- Confidence should be between 0 and 1
- Provide 1-3 alternative categories
- Keep explanation under 100 characters`;

    try {
      // 4. Call OpenAI API
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a financial AI assistant specialized in expense categorization for East African businesses.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3, // Lower temperature for more consistent results
        max_tokens: 500,
      });

      const responseText = completion.choices[0].message.content || '';
      const aiResponse = JSON.parse(responseText);

      // 5. Validate and enrich response
      const mainCategory = categories.find(c => c.id === aiResponse.categoryId);
      if (!mainCategory) {
        throw new Error('AI returned invalid category ID');
      }

      const alternatives = aiResponse.alternatives
        .map((alt: any) => {
          const cat = categories.find(c => c.id === alt.categoryId);
          return cat ? {
            categoryId: cat.id,
            categoryName: cat.name,
            confidence: alt.confidence,
          } : null;
        })
        .filter((alt: any) => alt !== null);

      // 6. Store AI suggestion for learning
      await pool.query(
        `INSERT INTO transaction_ai_suggestions 
         (tenant_id, description, suggested_category_id, confidence, alternatives)
         VALUES ($1, $2, $3, $4, $5)`,
        [tenantId, request.description, mainCategory.id, aiResponse.confidence, JSON.stringify(alternatives)]
      );

      return {
        categoryId: mainCategory.id,
        categoryName: mainCategory.name,
        confidence: aiResponse.confidence,
        explanation: aiResponse.explanation,
        alternatives,
      };
    } catch (error: any) {
      console.error('AI categorization error:', error);
      
      // Fallback to keyword matching
      return this.fallbackCategorization(request.description, categories);
    }
  }

  /**
   * Fallback categorization using simple keyword matching
   */
  private fallbackCategorization(description: string, categories: any[]): CategorizationResult {
    const descriptionLower = description.toLowerCase();

    // Simple keyword mapping
    const keywords: { [key: string]: string[] } = {
      'rent': ['rent', 'lease', 'rental'],
      'salaries': ['salary', 'salaries', 'wages', 'payroll'],
      'utilities': ['electricity', 'water', 'utility', 'power'],
      'marketing': ['marketing', 'advertising', 'ad', 'promo', 'campaign'],
      'transportation': ['uber', 'taxi', 'transport', 'fuel', 'petrol'],
      'office supplies': ['stationery', 'supplies', 'office'],
      'internet & phone': ['internet', 'wifi', 'phone', 'mobile', 'airtime'],
    };

    let bestMatch: any = null;
    let bestScore = 0;

    for (const category of categories) {
      const categoryNameLower = category.name.toLowerCase();
      const relatedKeywords = keywords[categoryNameLower] || [categoryNameLower];

      let score = 0;
      for (const keyword of relatedKeywords) {
        if (descriptionLower.includes(keyword)) {
          score += 1;
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = category;
      }
    }

    // Default to first category if no match
    if (!bestMatch && categories.length > 0) {
      bestMatch = categories[0];
    }

    return {
      categoryId: bestMatch.id,
      categoryName: bestMatch.name,
      confidence: bestScore > 0 ? 0.7 : 0.3,
      explanation: bestScore > 0 ? 'Matched by keywords' : 'Default categorization',
      alternatives: [],
    };
  }

  /**
   * Learn from user corrections to improve future categorizations
   */
  async learnFromCorrection(
    tenantId: string,
    description: string,
    suggestedCategoryId: string,
    actualCategoryId: string
  ): Promise<void> {
    await pool.query(
      `INSERT INTO transaction_categorization_feedback 
       (tenant_id, description, suggested_category_id, actual_category_id)
       VALUES ($1, $2, $3, $4)`,
      [tenantId, description, suggestedCategoryId, actualCategoryId]
    );

    // In production, periodically retrain the model with this feedback
  }
}
```

---

## 📁 File: `backend/src/modules/invoicing/invoice.controller.ts`

```typescript
/**
 * Invoice Controller
 * Handles HTTP requests for invoice management
 */

import { Request, Response, NextFunction } from 'express';
import { InvoiceService } from './invoice.service';
import { ComplianceService } from '../compliance/compliance.service';
import { DoubleEntryEngine } from '../accounting/double-entry.engine';

export class InvoiceController {
  private invoiceService: InvoiceService;
  private complianceService: ComplianceService;

  constructor() {
    this.invoiceService = new InvoiceService();
    this.complianceService = new ComplianceService();
  }

  /**
   * GET /invoices
   */
  async listInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user.tenantId;
      const { status, customerId, from, to, limit = 50, offset = 0 } = req.query;

      const result = await this.invoiceService.listInvoices(tenantId, {
        status: status as string,
        customerId: customerId as string,
        from: from as string,
        to: to as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });

      res.json({
        data: result.invoices,
        meta: {
          total: result.total,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /invoices
   */
  async createInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user.tenantId;
      const userId = req.user.id;
      const invoiceData = req.body;

      // 1. Create invoice
      const invoice = await this.invoiceService.createInvoice(tenantId, invoiceData, userId);

      // 2. Create journal entry for the invoice
      const accountIds = await this.invoiceService.getDefaultAccountIds(tenantId);
      await DoubleEntryEngine.createInvoiceEntry(
        tenantId,
        invoice.id,
        invoice,
        accountIds.accountsReceivable,
        accountIds.revenue,
        accountIds.vatPayable,
        userId
      );

      res.status(201).json(invoice);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /invoices/:id/send
   */
  async sendInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user.tenantId;
      const userId = req.user.id;
      const invoiceId = req.params.id;
      const { sendEmail, emailTo } = req.body;

      // 1. Get invoice
      const invoice = await this.invoiceService.getInvoiceById(tenantId, invoiceId);

      if (!invoice) {
        return res.status(404).json({ error: 'Invoice not found' });
      }

      // 2. Submit to compliance system (TIMS, EFRIS, etc.)
      const complianceResult = await this.complianceService.submitInvoice(tenantId, invoice);

      // 3. Update invoice with compliance data
      await this.invoiceService.updateInvoiceCompliance(invoiceId, complianceResult);

      // 4. Mark invoice as sent
      await this.invoiceService.updateInvoiceStatus(invoiceId, 'sent', userId);

      // 5. Send email if requested
      if (sendEmail && emailTo) {
        await this.invoiceService.sendInvoiceEmail(invoice, emailTo);
      }

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
   * GET /invoices/:id/pdf
   */
  async downloadPDF(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user.tenantId;
      const invoiceId = req.params.id;

      const invoice = await this.invoiceService.getInvoiceById(tenantId, invoiceId);

      if (!invoice) {
        return res.status(404).json({ error: 'Invoice not found' });
      }

      // Generate PDF (using puppeteer or similar)
      const pdfBuffer = await this.invoiceService.generatePDF(invoice);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`);
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }
}
```

---

**More backend samples would include:**
- Authentication middleware
- Payment processing service
- OCR service implementation
- Report generation service
- Webhook handlers
- Queue workers
- Database migrations

Would you like me to continue with more samples?
