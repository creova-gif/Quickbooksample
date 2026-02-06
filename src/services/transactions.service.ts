/**
 * Transaction Service
 * 
 * Handles all transaction-related API calls:
 * - Create, read, update, delete transactions
 * - Filter and search
 * - Export
 */

import api from './api';
import { Transaction } from '@/types';

export interface CreateTransactionData {
  date: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  categoryId: string;
  description: string;
  reference?: string;
  taxAmount?: number;
  taxRate?: number;
}

export interface UpdateTransactionData extends Partial<CreateTransactionData> {
  status?: 'draft' | 'confirmed' | 'reconciled';
}

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  type?: 'income' | 'expense' | 'transfer';
  categoryId?: string;
  minAmount?: number;
  maxAmount?: number;
  status?: string;
  search?: string;
}

/**
 * Get all transactions with optional filters
 */
export async function getTransactions(filters?: TransactionFilters): Promise<Transaction[]> {
  const response = await api.get('/transactions', { params: filters });
  return response.data;
}

/**
 * Get single transaction by ID
 */
export async function getTransaction(id: string): Promise<Transaction> {
  const response = await api.get(`/transactions/${id}`);
  return response.data;
}

/**
 * Create new transaction
 */
export async function createTransaction(data: CreateTransactionData): Promise<Transaction> {
  const response = await api.post('/transactions', data);
  return response.data;
}

/**
 * Update existing transaction
 */
export async function updateTransaction(id: string, data: UpdateTransactionData): Promise<Transaction> {
  const response = await api.patch(`/transactions/${id}`, data);
  return response.data;
}

/**
 * Delete transaction
 */
export async function deleteTransaction(id: string): Promise<void> {
  await api.delete(`/transactions/${id}`);
}

/**
 * Bulk create transactions
 */
export async function bulkCreateTransactions(transactions: CreateTransactionData[]): Promise<Transaction[]> {
  const response = await api.post('/transactions/bulk', { transactions });
  return response.data;
}

/**
 * Export transactions to CSV
 */
export async function exportTransactions(filters?: TransactionFilters): Promise<Blob> {
  const response = await api.get('/transactions/export', {
    params: filters,
    responseType: 'blob',
  });
  return response.data;
}

/**
 * Get transaction statistics
 */
export async function getTransactionStats(startDate?: string, endDate?: string): Promise<{
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  transactionCount: number;
  avgTransaction: number;
}> {
  const response = await api.get('/transactions/stats', {
    params: { startDate, endDate },
  });
  return response.data;
}
