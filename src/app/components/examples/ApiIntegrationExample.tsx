/**
 * API Integration Examples
 * 
 * This file demonstrates how to integrate the backend API services
 * with your existing React components.
 * 
 * Copy these patterns into your actual components!
 */

import React, { useEffect } from 'react';
import { useApi, useMutation } from '@/hooks/useApi';
import {
  getTransactions,
  createTransaction,
  deleteTransaction,
} from '@/services/transactions.service';
import {
  getInvoices,
  createInvoice,
  generateInvoicePDF,
  submitToTaxAuthority,
} from '@/services/invoices.service';
import { getProfitLossReport } from '@/services/reports.service';
import { submitInvoiceToTaxAuthority } from '@/services/compliance.service';
import { Button } from '@/app/components/ui/button';
import { toast } from 'sonner';

// ============================================
// EXAMPLE 1: Fetch Transactions on Component Mount
// ============================================
export function TransactionListExample() {
  const { data: transactions, loading, error, execute } = useApi(getTransactions);

  useEffect(() => {
    // Fetch transactions when component mounts
    execute({
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    });
  }, []);

  if (loading) return <div>Loading transactions...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-2">
      <h2 className="text-xl font-bold">Transactions</h2>
      {transactions?.map((tx) => (
        <div key={tx.id} className="p-4 border rounded">
          <p className="font-medium">{tx.description}</p>
          <p className="text-sm text-gray-600">
            {tx.type === 'income' ? '+' : '-'}${tx.amount}
          </p>
          <p className="text-xs text-gray-400">{new Date(tx.date).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
}

// ============================================
// EXAMPLE 2: Create Transaction with Mutation Hook
// ============================================
export function CreateTransactionExample() {
  const [formData, setFormData] = React.useState({
    description: '',
    amount: 0,
    type: 'expense' as 'income' | 'expense',
    categoryId: '',
  });

  const { execute: create, loading } = useMutation(createTransaction, {
    onSuccess: (transaction) => {
      toast.success(`Transaction created: ${transaction.description}`);
      // Reset form
      setFormData({ description: '', amount: 0, type: 'expense', categoryId: '' });
    },
    onError: (error) => {
      toast.error(`Failed to create transaction: ${error}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await create({
      ...formData,
      date: new Date().toISOString(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold">Create Transaction</h2>
      <input
        type="text"
        placeholder="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        className="w-full p-2 border rounded"
        required
      />
      <input
        type="number"
        placeholder="Amount"
        value={formData.amount}
        onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
        className="w-full p-2 border rounded"
        required
      />
      <Button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Transaction'}
      </Button>
    </form>
  );
}

// ============================================
// EXAMPLE 3: Invoice with PDF Download & Tax Submission
// ============================================
export function InvoiceActionsExample({ invoiceId }: { invoiceId: string }) {
  // Download PDF
  const handleDownloadPDF = async () => {
    try {
      const pdfBlob = await generateInvoicePDF(invoiceId);
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoiceId}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('PDF downloaded!');
    } catch (error) {
      toast.error('Failed to download PDF');
    }
  };

  // Submit to tax authority
  const { execute: submitCompliance, loading: submitting } = useMutation(
    submitToTaxAuthority,
    {
      onSuccess: (invoice) => {
        toast.success('Invoice submitted to tax authority!');
        console.log('Compliance data:', invoice.complianceData);
      },
      onError: (error) => {
        toast.error(`Submission failed: ${error}`);
      },
    }
  );

  return (
    <div className="flex gap-2">
      <Button onClick={handleDownloadPDF}>Download PDF</Button>
      <Button onClick={() => submitCompliance(invoiceId)} disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit to Tax Authority'}
      </Button>
    </div>
  );
}

// ============================================
// EXAMPLE 4: Create Invoice with Tax Adapter
// ============================================
export function CreateInvoiceExample() {
  const { execute: create, loading } = useMutation(createInvoice, {
    onSuccess: async (invoice) => {
      toast.success(`Invoice ${invoice.invoiceNumber} created!`);
      
      // Optionally submit to tax authority automatically
      try {
        await submitInvoiceToTaxAuthority(invoice, 'KE'); // Kenya TIMS
        toast.success('Invoice submitted to TIMS!');
      } catch (error) {
        toast.error('Tax submission failed (invoice saved)');
      }
    },
    onError: (error) => {
      toast.error(`Failed to create invoice: ${error}`);
    },
  });

  const handleCreate = async () => {
    await create({
      customerName: 'ABC Corporation',
      customerEmail: 'abc@example.com',
      customerTaxId: 'A123456789P', // KRA PIN for Kenya
      date: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      items: [
        {
          description: 'Consulting Services',
          quantity: 10,
          unitPrice: 5000,
          taxRate: 16, // Kenya VAT
        },
      ],
      notes: 'Thank you for your business!',
    });
  };

  return (
    <Button onClick={handleCreate} disabled={loading}>
      {loading ? 'Creating...' : 'Create & Submit Invoice'}
    </Button>
  );
}

// ============================================
// EXAMPLE 5: Financial Report with Charts
// ============================================
export function ProfitLossReportExample() {
  const { data: report, loading, error, execute } = useApi(getProfitLossReport);

  useEffect(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), 0, 1).toISOString();
    const lastDay = today.toISOString();
    
    execute(firstDay, lastDay);
  }, []);

  if (loading) return <div>Loading report...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!report) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Profit & Loss Report</h2>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-green-100 rounded">
          <p className="text-sm text-gray-600">Total Income</p>
          <p className="text-2xl font-bold text-green-600">
            ${report.totalIncome.toLocaleString()}
          </p>
        </div>
        <div className="p-4 bg-red-100 rounded">
          <p className="text-sm text-gray-600">Total Expenses</p>
          <p className="text-2xl font-bold text-red-600">
            ${report.totalExpenses.toLocaleString()}
          </p>
        </div>
        <div className="p-4 bg-blue-100 rounded">
          <p className="text-sm text-gray-600">Net Profit</p>
          <p className="text-2xl font-bold text-blue-600">
            ${report.netProfit.toLocaleString()}
          </p>
        </div>
      </div>

      <div>
        <h3 className="font-bold mb-2">Income Breakdown</h3>
        {report.income.map((item, i) => (
          <div key={i} className="flex justify-between py-1">
            <span>{item.category}</span>
            <span className="font-medium">${item.amount.toLocaleString()}</span>
          </div>
        ))}
      </div>

      <div>
        <h3 className="font-bold mb-2">Expense Breakdown</h3>
        {report.expenses.map((item, i) => (
          <div key={i} className="flex justify-between py-1">
            <span>{item.category}</span>
            <span className="font-medium">${item.amount.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 6: Update Business Context to Use API
// ============================================
// Update your /src/contexts/BusinessContext.tsx to fetch from backend:
/*
export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const { data: business, loading, execute } = useApi(getStoredBusiness);

  useEffect(() => {
    // Fetch business from backend instead of localStorage
    execute();
  }, []);

  return (
    <BusinessContext.Provider value={{ business, loading }}>
      {children}
    </BusinessContext.Provider>
  );
}
*/

// ============================================
// HOW TO USE THESE EXAMPLES
// ============================================
// 1. Copy the patterns above into your actual components
// 2. Replace your localStorage calls with API service calls
// 3. Use the useApi hook for GET requests
// 4. Use the useMutation hook for POST/PUT/DELETE requests
// 5. Add proper error handling with toast notifications
// 6. The backend is already set up and ready to receive these requests!
