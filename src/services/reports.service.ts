/**
 * Reports Service
 * 
 * Financial reporting:
 * - Profit & Loss
 * - Balance Sheet
 * - Cash Flow
 * - Tax reports
 */

import api from './api';

export interface ProfitLossReport {
  period: string;
  income: {
    category: string;
    amount: number;
  }[];
  expenses: {
    category: string;
    amount: number;
  }[];
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
}

export interface BalanceSheetReport {
  date: string;
  assets: {
    category: string;
    amount: number;
  }[];
  liabilities: {
    category: string;
    amount: number;
  }[];
  equity: {
    category: string;
    amount: number;
  }[];
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
}

export interface CashFlowReport {
  period: string;
  operating: {
    category: string;
    amount: number;
  }[];
  investing: {
    category: string;
    amount: number;
  }[];
  financing: {
    category: string;
    amount: number;
  }[];
  netCashFlow: number;
}

/**
 * Get Profit & Loss report
 */
export async function getProfitLossReport(startDate: string, endDate: string): Promise<ProfitLossReport> {
  const response = await api.get('/reports/profit-loss', {
    params: { startDate, endDate },
  });
  return response.data;
}

/**
 * Get Balance Sheet
 */
export async function getBalanceSheet(date: string): Promise<BalanceSheetReport> {
  const response = await api.get('/reports/balance-sheet', {
    params: { date },
  });
  return response.data;
}

/**
 * Get Cash Flow Statement
 */
export async function getCashFlowReport(startDate: string, endDate: string): Promise<CashFlowReport> {
  const response = await api.get('/reports/cash-flow', {
    params: { startDate, endDate },
  });
  return response.data;
}

/**
 * Download report as PDF
 */
export async function downloadReportPDF(
  reportType: 'profit-loss' | 'balance-sheet' | 'cash-flow',
  params: { startDate?: string; endDate?: string; date?: string }
): Promise<Blob> {
  const response = await api.get(`/reports/${reportType}/pdf`, {
    params,
    responseType: 'blob',
  });
  return response.data;
}

/**
 * Download report as Excel
 */
export async function downloadReportExcel(
  reportType: 'profit-loss' | 'balance-sheet' | 'cash-flow',
  params: { startDate?: string; endDate?: string; date?: string }
): Promise<Blob> {
  const response = await api.get(`/reports/${reportType}/excel`, {
    params,
    responseType: 'blob',
  });
  return response.data;
}
