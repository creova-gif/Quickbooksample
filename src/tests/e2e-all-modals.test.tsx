/**
 * End-to-End Tests for All Modal Components
 * 
 * Covers complete workflow:
 * - Invoice creation
 * - Payroll processing  
 * - Inventory management
 * - Branch switching
 * - License activation
 * - Tax sync queue
 * - Audit logs
 * - Setup wizard
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BusinessProvider } from '@/contexts/BusinessContext';
import {
  InvoiceFormModal,
  PayrollFormModal,
  InventoryFormModal,
  BranchSelectorModal,
  LicenseActivationModal,
  TaxSyncQueueModal,
  AuditLogModal,
  SetupWizardModal,
} from '@/app/components/modals';
import * as ledgerService from '@/services/ledger.service';
import * as auditService from '@/services/audit.service';
import * as taxsyncService from '@/services/taxsync.service';

// Mock services
vi.mock('@/services/ledger.service');
vi.mock('@/services/audit.service');
vi.mock('@/services/taxsync.service');

// Test wrapper
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BusinessProvider>{children}</BusinessProvider>
);

describe('E2E: Complete Modal Workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    // Setup test business
    localStorage.setItem('current_business', JSON.stringify({
      id: 'test-business-123',
      name: 'Test Company Ltd',
      countryCode: 'KE',
      currency: 'KES',
      currencySymbol: 'KSh',
      vatRegistered: true,
      createdAt: new Date().toISOString(),
    }));
  });

  it('E2E: Invoice → Ledger → Audit → Tax Sync', async () => {
    const mockPostInvoice = vi.spyOn(ledgerService, 'postInvoiceToLedger').mockReturnValue([]);
    const mockSaveLedger = vi.spyOn(ledgerService, 'saveLedgerEntries').mockReturnValue(undefined);
    const mockLogAudit = vi.spyOn(auditService, 'logInvoiceCreated').mockReturnValue(undefined);
    const mockQueueSync = vi.spyOn(taxsyncService, 'queueInvoiceSync').mockReturnValue({} as any);

    const onClose = vi.fn();

    render(
      <TestWrapper>
        <InvoiceFormModal open={true} onClose={onClose} />
      </TestWrapper>
    );

    // Fill customer details
    const customerInput = screen.getByLabelText(/Customer Name/i);
    fireEvent.change(customerInput, { target: { value: 'Acme Corporation' } });

    // Fill item details
    const descInput = screen.getByPlaceholderText('Description');
    const qtyInput = screen.getByPlaceholderText('Qty');
    const priceInput = screen.getByPlaceholderText('Unit Price');

    fireEvent.change(descInput, { target: { value: 'Web Development' } });
    fireEvent.change(qtyInput, { target: { value: '1' } });
    fireEvent.change(priceInput, { target: { value: '10000' } });

    // Submit
    const submitButton = screen.getByRole('button', { name: /Create.*Invoice/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      // Verify ledger posting
      expect(mockPostInvoice).toHaveBeenCalled();
      expect(mockSaveLedger).toHaveBeenCalled();
      
      // Verify audit logging
      expect(mockLogAudit).toHaveBeenCalled();
      
      // Verify tax sync queueing
      expect(mockQueueSync).toHaveBeenCalled();
      
      // Verify modal closed
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('E2E: Payroll → Ledger → Audit', async () => {
    const mockSaveLedger = vi.spyOn(ledgerService, 'saveLedgerEntries').mockReturnValue(undefined);
    const mockLogAudit = vi.spyOn(auditService, 'logAudit').mockReturnValue({} as any);

    const onClose = vi.fn();

    render(
      <TestWrapper>
        <PayrollFormModal open={true} onClose={onClose} />
      </TestWrapper>
    );

    // Fill payroll details
    fireEvent.change(screen.getByLabelText(/Employee Name/i), {
      target: { value: 'John Doe' },
    });

    fireEvent.change(screen.getByLabelText(/Gross Salary/i), {
      target: { value: '50000' },
    });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /Process Payroll/i }));

    await waitFor(() => {
      // Verify ledger entries created
      expect(mockSaveLedger).toHaveBeenCalled();
      const ledgerEntries = mockSaveLedger.mock.calls[0][0];
      expect(ledgerEntries.length).toBeGreaterThan(2); // Salary, tax, bank at minimum
      
      // Verify audit log
      expect(mockLogAudit).toHaveBeenCalledWith(
        expect.objectContaining({
          entityType: 'transaction',
          action: 'create',
        })
      );
    });
  });

  it('E2E: Inventory Purchase → Ledger → Audit', async () => {
    const mockSaveLedger = vi.spyOn(ledgerService, 'saveLedgerEntries').mockReturnValue(undefined);
    const mockLogAudit = vi.spyOn(auditService, 'logAudit').mockReturnValue({} as any);

    const onClose = vi.fn();

    render(
      <TestWrapper>
        <InventoryFormModal open={true} onClose={onClose} />
      </TestWrapper>
    );

    // Select Purchase tab
    fireEvent.click(screen.getByText('Purchase'));

    // Fill inventory details
    fireEvent.change(screen.getByLabelText(/Item Name/i), {
      target: { value: 'Office Supplies' },
    });

    fireEvent.change(screen.getByLabelText(/Quantity/i), {
      target: { value: '100' },
    });

    fireEvent.change(screen.getByLabelText(/Unit Cost/i), {
      target: { value: '50' },
    });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /Record/i }));

    await waitFor(() => {
      // Verify ledger: Debit Inventory, Credit Cash
      expect(mockSaveLedger).toHaveBeenCalled();
      const entries = mockSaveLedger.mock.calls[0][0];
      expect(entries).toHaveLength(2);
      expect(entries[0].debit).toBeGreaterThan(0);
      expect(entries[1].credit).toBeGreaterThan(0);
      
      // Verify audit
      expect(mockLogAudit).toHaveBeenCalled();
    });
  });

  it('E2E: Branch Switching → Audit Log', async () => {
    const mockLogAudit = vi.spyOn(auditService, 'logAudit').mockReturnValue({} as any);

    const branches = [
      { id: '1', name: 'Nairobi HQ', country: 'Kenya', countryCode: 'KE', currency: 'KES', isActive: true },
      { id: '2', name: 'Kampala Branch', country: 'Uganda', countryCode: 'UG', currency: 'UGX', isActive: true },
    ];

    const onBranchChange = vi.fn();
    const onClose = vi.fn();

    render(
      <BranchSelectorModal
        open={true}
        onClose={onClose}
        branches={branches}
        currentBranchId="1"
        onBranchChange={onBranchChange}
      />
    );

    // Select second branch
    const kampalaCard = screen.getByText('Kampala Branch').closest('div');
    fireEvent.click(kampalaCard!);

    // Click Switch Branch button
    fireEvent.click(screen.getByRole('button', { name: /Switch Branch/i }));

    await waitFor(() => {
      // Verify branch changed
      expect(onBranchChange).toHaveBeenCalledWith(
        expect.objectContaining({ id: '2', name: 'Kampala Branch' })
      );
      
      // Verify audit log
      expect(mockLogAudit).toHaveBeenCalledWith(
        expect.objectContaining({
          entityType: 'business',
          action: 'update',
        })
      );
    });
  });

  it('E2E: License Activation → Audit Log', async () => {
    const mockLogAudit = vi.spyOn(auditService, 'logAudit').mockReturnValue({} as any);
    const onActivate = vi.fn();
    const onClose = vi.fn();

    render(
      <LicenseActivationModal
        open={true}
        onClose={onClose}
        onActivate={onActivate}
      />
    );

    // Enter license key
    const licenseInput = screen.getByLabelText(/License Key/i);
    fireEvent.change(licenseInput, { target: { value: 'EA-P123-4567-89AB-CDEF' } });

    // Validate
    fireEvent.click(screen.getByRole('button', { name: /Validate License/i }));

    await waitFor(() => {
      // Should show valid message
      expect(screen.getByText(/License key is valid/i)).toBeInTheDocument();
    });

    // Activate
    fireEvent.click(screen.getByRole('button', { name: /Activate License/i }));

    await waitFor(() => {
      // Verify activation callback
      expect(onActivate).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'EA-P123-4567-89AB-CDEF',
          type: 'professional',
          isValid: true,
        })
      );
      
      // Verify audit log
      expect(mockLogAudit).toHaveBeenCalledWith(
        expect.objectContaining({
          entityType: 'business',
          entityId: 'license',
          action: 'update',
        })
      );
    });
  });

  it('E2E: Tax Sync Queue Management', async () => {
    // Setup queue data
    const mockQueue = [
      {
        id: 'queue-1',
        entityType: 'invoice',
        entityId: 'inv-123',
        authority: 'TIMS',
        status: 'pending',
        retries: 0,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'queue-2',
        entityType: 'invoice',
        entityId: 'inv-456',
        authority: 'TIMS',
        status: 'failed',
        retries: 2,
        errorMessage: 'Connection timeout',
        createdAt: new Date().toISOString(),
      },
    ];

    localStorage.setItem('tax_sync_queue', JSON.stringify(mockQueue));

    const onClose = vi.fn();

    render(<TaxSyncQueueModal open={true} onClose={onClose} />);

    // Verify summary cards
    await waitFor(() => {
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('Failed')).toBeInTheDocument();
    });

    // Switch to Failed tab
    fireEvent.click(screen.getByText(/Failed \(1\)/i));

    await waitFor(() => {
      expect(screen.getByText('Connection timeout')).toBeInTheDocument();
    });

    // Test retry button
    const retryButton = screen.getByRole('button', { name: /Retry/i });
    expect(retryButton).toBeInTheDocument();
  });

  it('E2E: Audit Log Viewing and Filtering', async () => {
    // Setup audit logs
    const mockLogs = [
      {
        id: 'log-1',
        entityType: 'invoice',
        entityId: 'inv-123',
        action: 'create',
        performedBy: 'user-123',
        performedAt: new Date().toISOString(),
      },
      {
        id: 'log-2',
        entityType: 'transaction',
        entityId: 'tx-456',
        action: 'update',
        performedBy: 'user-123',
        performedAt: new Date().toISOString(),
      },
    ];

    localStorage.setItem('audit_logs', JSON.stringify(mockLogs));

    const onClose = vi.fn();

    render(<AuditLogModal open={true} onClose={onClose} />);

    // Verify logs are displayed
    await waitFor(() => {
      expect(screen.getByText(/Create invoice/i)).toBeInTheDocument();
      expect(screen.getByText(/Update transaction/i)).toBeInTheDocument();
    });

    // Test filtering by entity type
    const entityFilter = screen.getByRole('combobox', { name: /Entity Type/i });
    fireEvent.change(entityFilter, { target: { value: 'invoice' } });

    // Should show only invoice logs
    await waitFor(() => {
      expect(screen.getByText(/Showing 1 of 2 logs/i)).toBeInTheDocument();
    });
  });

  it('E2E: Setup Wizard Complete Flow', async () => {
    const onComplete = vi.fn();
    const onClose = vi.fn();

    render(
      <SetupWizardModal open={true} onClose={onClose} onComplete={onComplete} />
    );

    // Step 1: Select Cloud deployment
    fireEvent.click(screen.getByText(/Cloud Hosted/i));
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));

    // Step 2: Select modules (already has defaults)
    await waitFor(() => {
      expect(screen.getByText(/Select Modules/i)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));

    // Step 3: Select country
    await waitFor(() => {
      expect(screen.getByText(/Select Your Country/i)).toBeInTheDocument();
    });
    // Kenya should be selected by default
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));

    // Step 4: Enter company info
    await waitFor(() => {
      expect(screen.getByText(/Company Information/i)).toBeInTheDocument();
    });

    const companyInput = screen.getByLabelText(/Company Name/i);
    fireEvent.change(companyInput, { target: { value: 'Test Corp Ltd' } });

    fireEvent.click(screen.getByRole('button', { name: /Next/i }));

    // Step 5: Complete
    await waitFor(() => {
      expect(screen.getByText(/Setup Complete/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Complete Setup/i }));

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          deploymentType: 'cloud',
          selectedCountry: 'KE',
          companyName: 'Test Corp Ltd',
        })
      );
    });
  });
});

describe('E2E: Integration Tests', () => {
  it('Invoice creation triggers all downstream services', async () => {
    const mockPostInvoice = vi.spyOn(ledgerService, 'postInvoiceToLedger').mockReturnValue([
      { id: '1', accountId: 'acc_ar', debit: 11600, credit: 0 } as any,
      { id: '2', accountId: 'acc_revenue', debit: 0, credit: 10000 } as any,
      { id: '3', accountId: 'acc_vat_payable', debit: 0, credit: 1600 } as any,
    ]);

    const mockValidate = vi.spyOn(ledgerService, 'validateDoubleEntry').mockReturnValue({
      valid: true,
      totalDebits: 11600,
      totalCredits: 11600,
      difference: 0,
    });

    const mockSaveLedger = vi.spyOn(ledgerService, 'saveLedgerEntries');
    const mockLogAudit = vi.spyOn(auditService, 'logInvoiceCreated');
    const mockQueueSync = vi.spyOn(taxsyncService, 'queueInvoiceSync');

    const onClose = vi.fn();

    render(
      <TestWrapper>
        <InvoiceFormModal open={true} onClose={onClose} />
      </TestWrapper>
    );

    // Quick fill and submit
    fireEvent.change(screen.getByLabelText(/Customer Name/i), {
      target: { value: 'Quick Test' },
    });
    fireEvent.change(screen.getByPlaceholderText('Description'), {
      target: { value: 'Service' },
    });
    fireEvent.change(screen.getByPlaceholderText('Qty'), {
      target: { value: '1' },
    });
    fireEvent.change(screen.getByPlaceholderText('Unit Price'), {
      target: { value: '10000' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Create.*Invoice/i }));

    await waitFor(() => {
      // Verify complete flow
      expect(mockPostInvoice).toHaveBeenCalled();
      expect(mockValidate).toHaveBeenCalled();
      expect(mockSaveLedger).toHaveBeenCalled();
      expect(mockLogAudit).toHaveBeenCalled();
      expect(mockQueueSync).toHaveBeenCalled();
    });
  });

  it('Double-entry validation catches errors', () => {
    const entries = [
      { debit: 1000, credit: 0 },
      { debit: 0, credit: 900 }, // Intentional mismatch!
    ];

    const validation = ledgerService.validateDoubleEntry(entries as any);

    expect(validation.valid).toBe(false);
    expect(validation.difference).toBe(100);
    expect(validation.error).toContain('≠');
  });
});
