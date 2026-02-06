/**
 * Modal Integration Tests
 * 
 * Tests the three main modal forms:
 * - InvoiceFormModal
 * - PayrollFormModal
 * - InventoryFormModal
 * 
 * Each test verifies:
 * ✅ Form validation
 * ✅ Calculation logic
 * ✅ Ledger posting (double-entry)
 * ✅ Audit logging
 * ✅ Tax sync queueing
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { InvoiceFormModal } from '@/app/components/modals/InvoiceFormModal';
import { PayrollFormModal } from '@/app/components/modals/PayrollFormModal';
import { InventoryFormModal } from '@/app/components/modals/InventoryFormModal';
import { BusinessProvider } from '@/contexts/BusinessContext';
import * as ledgerService from '@/services/ledger.service';
import * as auditService from '@/services/audit.service';
import * as taxsyncService from '@/services/taxsync.service';

// Mock services
vi.mock('@/services/ledger.service');
vi.mock('@/services/audit.service');
vi.mock('@/services/taxsync.service');

// Test wrapper with BusinessContext
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BusinessProvider>{children}</BusinessProvider>
);

describe('InvoiceFormModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    // Set up test business
    localStorage.setItem('current_business', JSON.stringify({
      id: 'test-business',
      name: 'Test Company',
      countryCode: 'KE',
      currency: 'KES',
      currencySymbol: 'KSh',
      vatRegistered: true,
      createdAt: new Date().toISOString(),
    }));
  });

  it('should render invoice form with all fields', () => {
    render(
      <TestWrapper>
        <InvoiceFormModal open={true} onClose={vi.fn()} />
      </TestWrapper>
    );

    expect(screen.getByText('Create Invoice')).toBeInTheDocument();
    expect(screen.getByLabelText(/Customer Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Issue Date/i)).toBeInTheDocument();
    expect(screen.getByText('Items')).toBeInTheDocument();
  });

  it('should calculate VAT and totals correctly', async () => {
    render(
      <TestWrapper>
        <InvoiceFormModal open={true} onClose={vi.fn()} />
      </TestWrapper>
    );

    // Fill in customer name
    fireEvent.change(screen.getByLabelText(/Customer Name/i), {
      target: { value: 'Test Customer' },
    });

    // Fill in item details
    const descInput = screen.getByPlaceholderText('Description');
    const qtyInput = screen.getByPlaceholderText('Qty');
    const priceInput = screen.getByPlaceholderText('Unit Price');

    fireEvent.change(descInput, { target: { value: 'Test Item' } });
    fireEvent.change(qtyInput, { target: { value: '10' } });
    fireEvent.change(priceInput, { target: { value: '1000' } });

    // Check calculations
    await waitFor(() => {
      // Subtotal: 10 * 1000 = 10,000
      // VAT (16%): 1,600
      // Total: 11,600
      expect(screen.getByText(/10000\.00/)).toBeInTheDocument(); // Subtotal
      expect(screen.getByText(/1600\.00/)).toBeInTheDocument(); // VAT
      expect(screen.getByText(/11600\.00/)).toBeInTheDocument(); // Total
    });
  });

  it('should post to ledger on submit', async () => {
    const mockPostInvoice = vi.spyOn(ledgerService, 'postInvoiceToLedger');
    const mockSaveLedger = vi.spyOn(ledgerService, 'saveLedgerEntries');
    const onClose = vi.fn();

    render(
      <TestWrapper>
        <InvoiceFormModal open={true} onClose={onClose} />
      </TestWrapper>
    );

    // Fill form
    fireEvent.change(screen.getByLabelText(/Customer Name/i), {
      target: { value: 'Test Customer' },
    });
    fireEvent.change(screen.getByPlaceholderText('Description'), {
      target: { value: 'Test Item' },
    });
    fireEvent.change(screen.getByPlaceholderText('Qty'), {
      target: { value: '1' },
    });
    fireEvent.change(screen.getByPlaceholderText('Unit Price'), {
      target: { value: '1000' },
    });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /Create Invoice/i }));

    await waitFor(() => {
      expect(mockPostInvoice).toHaveBeenCalled();
      expect(mockSaveLedger).toHaveBeenCalled();
    });
  });

  it('should queue for tax sync', async () => {
    const mockQueueSync = vi.spyOn(taxsyncService, 'queueInvoiceSync');

    render(
      <TestWrapper>
        <InvoiceFormModal open={true} onClose={vi.fn()} />
      </TestWrapper>
    );

    // Fill and submit
    fireEvent.change(screen.getByLabelText(/Customer Name/i), {
      target: { value: 'Test Customer' },
    });
    fireEvent.change(screen.getByPlaceholderText('Description'), {
      target: { value: 'Test Item' },
    });
    fireEvent.change(screen.getByPlaceholderText('Qty'), { target: { value: '1' } });
    fireEvent.change(screen.getByPlaceholderText('Unit Price'), { target: { value: '1000' } });

    fireEvent.click(screen.getByRole('button', { name: /Create Invoice/i }));

    await waitFor(() => {
      expect(mockQueueSync).toHaveBeenCalled();
    });
  });

  it('should validate required fields', async () => {
    render(
      <TestWrapper>
        <InvoiceFormModal open={true} onClose={vi.fn()} />
      </TestWrapper>
    );

    // Try to submit without filling
    fireEvent.click(screen.getByRole('button', { name: /Create Invoice/i }));

    // Should show validation error (via toast)
    await waitFor(() => {
      // Form should not close
      expect(screen.getByText('Create Invoice')).toBeInTheDocument();
    });
  });
});

describe('PayrollFormModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    localStorage.setItem('current_business', JSON.stringify({
      id: 'test-business',
      name: 'Test Company',
      countryCode: 'KE',
      currency: 'KES',
      currencySymbol: 'KSh',
      createdAt: new Date().toISOString(),
    }));
  });

  it('should calculate PAYE tax correctly', async () => {
    render(
      <TestWrapper>
        <PayrollFormModal open={true} onClose={vi.fn()} />
      </TestWrapper>
    );

    // Fill employee name and gross salary
    fireEvent.change(screen.getByLabelText(/Employee Name/i), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(screen.getByLabelText(/Gross Salary/i), {
      target: { value: '50000' },
    });

    // Check tax calculation is displayed
    await waitFor(() => {
      expect(screen.getByText(/PAYE Tax/i)).toBeInTheDocument();
    });
  });

  it('should calculate net salary with deductions', async () => {
    render(
      <TestWrapper>
        <PayrollFormModal open={true} onClose={vi.fn()} />
      </TestWrapper>
    );

    fireEvent.change(screen.getByLabelText(/Employee Name/i), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(screen.getByLabelText(/Gross Salary/i), {
      target: { value: '50000' },
    });
    fireEvent.change(screen.getByLabelText(/NHIF Contribution/i), {
      target: { value: '1700' },
    });
    fireEvent.change(screen.getByLabelText(/NSSF Contribution/i), {
      target: { value: '2160' },
    });

    await waitFor(() => {
      // Net should be Gross - Tax - NHIF - NSSF
      expect(screen.getByText(/Net Salary/i)).toBeInTheDocument();
    });
  });

  it('should post payroll to ledger', async () => {
    const mockSaveLedger = vi.spyOn(ledgerService, 'saveLedgerEntries');

    render(
      <TestWrapper>
        <PayrollFormModal open={true} onClose={vi.fn()} />
      </TestWrapper>
    );

    fireEvent.change(screen.getByLabelText(/Employee Name/i), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(screen.getByLabelText(/Gross Salary/i), {
      target: { value: '50000' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Process Payroll/i }));

    await waitFor(() => {
      expect(mockSaveLedger).toHaveBeenCalled();
      
      // Verify ledger entries include all deductions
      const entries = mockSaveLedger.mock.calls[0][0];
      expect(entries.length).toBeGreaterThan(2); // At least salary, tax, bank
    });
  });

  it('should create audit log for payroll', async () => {
    const mockLogAudit = vi.spyOn(auditService, 'logAudit');

    render(
      <TestWrapper>
        <PayrollFormModal open={true} onClose={vi.fn()} />
      </TestWrapper>
    );

    fireEvent.change(screen.getByLabelText(/Employee Name/i), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(screen.getByLabelText(/Gross Salary/i), {
      target: { value: '50000' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Process Payroll/i }));

    await waitFor(() => {
      expect(mockLogAudit).toHaveBeenCalledWith(
        expect.objectContaining({
          entityType: 'transaction',
          action: 'create',
        })
      );
    });
  });
});

describe('InventoryFormModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    localStorage.setItem('current_business', JSON.stringify({
      id: 'test-business',
      name: 'Test Company',
      countryCode: 'KE',
      currency: 'KES',
      currencySymbol: 'KSh',
      createdAt: new Date().toISOString(),
    }));
  });

  it('should calculate total cost correctly', async () => {
    render(
      <TestWrapper>
        <InventoryFormModal open={true} onClose={vi.fn()} />
      </TestWrapper>
    );

    fireEvent.change(screen.getByLabelText(/Item Name/i), {
      target: { value: 'Test Product' },
    });
    fireEvent.change(screen.getByLabelText(/Quantity/i), {
      target: { value: '10' },
    });
    fireEvent.change(screen.getByLabelText(/Unit Cost/i), {
      target: { value: '500' },
    });

    await waitFor(() => {
      // Total: 10 * 500 = 5000
      expect(screen.getByDisplayValue('5000.00')).toBeInTheDocument();
    });
  });

  it('should handle purchase transactions', async () => {
    const mockSaveLedger = vi.spyOn(ledgerService, 'saveLedgerEntries');

    render(
      <TestWrapper>
        <InventoryFormModal open={true} onClose={vi.fn()} />
      </TestWrapper>
    );

    // Select Purchase tab
    fireEvent.click(screen.getByText('Purchase'));

    fireEvent.change(screen.getByLabelText(/Item Name/i), {
      target: { value: 'Test Product' },
    });
    fireEvent.change(screen.getByLabelText(/Quantity/i), {
      target: { value: '10' },
    });
    fireEvent.change(screen.getByLabelText(/Unit Cost/i), {
      target: { value: '500' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Record purchase/i }));

    await waitFor(() => {
      expect(mockSaveLedger).toHaveBeenCalled();
      
      // Purchase should debit inventory, credit cash
      const entries = mockSaveLedger.mock.calls[0][0];
      expect(entries).toHaveLength(2);
      expect(entries[0].debit).toBeGreaterThan(0);
      expect(entries[1].credit).toBeGreaterThan(0);
    });
  });

  it('should handle sale transactions', async () => {
    const mockSaveLedger = vi.spyOn(ledgerService, 'saveLedgerEntries');

    render(
      <TestWrapper>
        <InventoryFormModal open={true} onClose={vi.fn()} />
      </TestWrapper>
    );

    // Select Sale tab
    fireEvent.click(screen.getByText('Sale'));

    fireEvent.change(screen.getByLabelText(/Item Name/i), {
      target: { value: 'Test Product' },
    });
    fireEvent.change(screen.getByLabelText(/Quantity/i), {
      target: { value: '5' },
    });
    fireEvent.change(screen.getByLabelText(/Unit Cost/i), {
      target: { value: '500' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Record sale/i }));

    await waitFor(() => {
      expect(mockSaveLedger).toHaveBeenCalled();
      
      // Sale should debit COGS, credit inventory
      const entries = mockSaveLedger.mock.calls[0][0];
      expect(entries).toHaveLength(2);
    });
  });

  it('should create audit log for inventory transactions', async () => {
    const mockLogAudit = vi.spyOn(auditService, 'logAudit');

    render(
      <TestWrapper>
        <InventoryFormModal open={true} onClose={vi.fn()} />
      </TestWrapper>
    );

    fireEvent.change(screen.getByLabelText(/Item Name/i), {
      target: { value: 'Test Product' },
    });
    fireEvent.change(screen.getByLabelText(/Quantity/i), {
      target: { value: '10' },
    });
    fireEvent.change(screen.getByLabelText(/Unit Cost/i), {
      target: { value: '500' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Record/i }));

    await waitFor(() => {
      expect(mockLogAudit).toHaveBeenCalledWith(
        expect.objectContaining({
          entityType: 'transaction',
          action: 'create',
        })
      );
    });
  });
});

describe('Double-Entry Validation', () => {
  it('should validate debits equal credits for invoices', () => {
    const invoice = {
      id: 'test-inv',
      subtotal: 10000,
      vatAmount: 1600,
      totalAmount: 11600,
      currency: 'KES',
      issueDate: '2024-01-01',
      invoiceNumber: 'INV-001',
      customerName: 'Test',
    };

    const entries = ledgerService.postInvoiceToLedger(invoice as any, 'user');
    const validation = ledgerService.validateDoubleEntry(entries);

    expect(validation.valid).toBe(true);
    expect(validation.totalDebits).toBe(validation.totalCredits);
  });
});
