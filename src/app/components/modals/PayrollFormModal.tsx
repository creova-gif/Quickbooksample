import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Loader2, UserCheck } from 'lucide-react';
import { useBusiness } from '@/contexts/BusinessContext';
import { saveLedgerEntries, SYSTEM_ACCOUNTS } from '@/services/ledger.service';
import { logAudit } from '@/services/audit.service';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
}

interface PayrollData {
  employeeName: string;
  employeeId: string;
  grossSalary: number;
  taxRate: number;
  taxAmount: number;
  nhifContribution: number;
  nssfContribution: number;
  otherDeductions: number;
  netSalary: number;
  paymentDate: string;
}

export function PayrollFormModal({ open, onClose }: Props) {
  const { business } = useBusiness();
  
  // Form state
  const [employeeName, setEmployeeName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [grossSalary, setGrossSalary] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [nhifContribution, setNhifContribution] = useState('');
  const [nssfContribution, setNssfContribution] = useState('');
  const [otherDeductions, setOtherDeductions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!business) return null;

  // Tax calculation (simplified - Kenya PAYE)
  const calculateTax = (gross: number): number => {
    if (gross <= 24000) return gross * 0.1;
    if (gross <= 32333) return 2400 + (gross - 24000) * 0.25;
    if (gross <= 500000) return 4483.25 + (gross - 32333) * 0.3;
    if (gross <= 800000) return 144783.35 + (gross - 500000) * 0.325;
    return 242283.35 + (gross - 800000) * 0.35;
  };

  const grossAmount = parseFloat(grossSalary) || 0;
  const taxAmount = calculateTax(grossAmount);
  const nhif = parseFloat(nhifContribution) || 0;
  const nssf = parseFloat(nssfContribution) || 0;
  const otherDed = parseFloat(otherDeductions) || 0;
  const netSalary = grossAmount - taxAmount - nhif - nssf - otherDed;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!employeeName.trim()) {
      toast.error('Employee name is required');
      return;
    }
    
    if (grossAmount <= 0) {
      toast.error('Gross salary must be greater than zero');
      return;
    }

    setIsSubmitting(true);

    try {
      const payrollData: PayrollData = {
        employeeName,
        employeeId,
        grossSalary: grossAmount,
        taxRate: taxAmount / grossAmount,
        taxAmount,
        nhifContribution: nhif,
        nssfContribution: nssf,
        otherDeductions: otherDed,
        netSalary,
        paymentDate,
      };

      const payrollId = crypto.randomUUID();

      // Post to ledger (double-entry bookkeeping)
      // Debit: Salary Expense (increases expense)
      // Credit: Tax Payable, NHIF Payable, NSSF Payable (liabilities)
      // Credit: Cash/Bank (for net salary paid)
      
      const ledgerEntries = [
        // Debit: Salary Expense (gross)
        {
          id: crypto.randomUUID(),
          accountId: SYSTEM_ACCOUNTS.OPERATING_EXPENSES.id,
          accountCode: '6100',
          accountName: 'Salary Expense',
          debit: grossAmount,
          credit: 0,
          currency: business.currency as any,
          entryDate: paymentDate,
          description: `Payroll for ${employeeName}`,
          reference: employeeId,
          createdBy: 'current-user',
          createdAt: new Date().toISOString(),
          isReversed: false,
        },
        // Credit: Tax Payable
        {
          id: crypto.randomUUID(),
          accountId: 'acc_tax_payable',
          accountCode: '2110',
          accountName: 'PAYE Tax Payable',
          debit: 0,
          credit: taxAmount,
          currency: business.currency as any,
          entryDate: paymentDate,
          description: `PAYE tax for ${employeeName}`,
          reference: employeeId,
          createdBy: 'current-user',
          createdAt: new Date().toISOString(),
          isReversed: false,
        },
        // Credit: NHIF Payable
        ...(nhif > 0 ? [{
          id: crypto.randomUUID(),
          accountId: 'acc_nhif_payable',
          accountCode: '2120',
          accountName: 'NHIF Payable',
          debit: 0,
          credit: nhif,
          currency: business.currency as any,
          entryDate: paymentDate,
          description: `NHIF for ${employeeName}`,
          reference: employeeId,
          createdBy: 'current-user',
          createdAt: new Date().toISOString(),
          isReversed: false,
        }] : []),
        // Credit: NSSF Payable
        ...(nssf > 0 ? [{
          id: crypto.randomUUID(),
          accountId: 'acc_nssf_payable',
          accountCode: '2130',
          accountName: 'NSSF Payable',
          debit: 0,
          credit: nssf,
          currency: business.currency as any,
          entryDate: paymentDate,
          description: `NSSF for ${employeeName}`,
          reference: employeeId,
          createdBy: 'current-user',
          createdAt: new Date().toISOString(),
          isReversed: false,
        }] : []),
        // Credit: Cash/Bank (net pay)
        {
          id: crypto.randomUUID(),
          accountId: SYSTEM_ACCOUNTS.BANK.id,
          accountCode: SYSTEM_ACCOUNTS.BANK.code,
          accountName: SYSTEM_ACCOUNTS.BANK.name,
          debit: 0,
          credit: netSalary,
          currency: business.currency as any,
          entryDate: paymentDate,
          description: `Net salary paid to ${employeeName}`,
          reference: employeeId,
          createdBy: 'current-user',
          createdAt: new Date().toISOString(),
          isReversed: false,
        },
      ];

      saveLedgerEntries(ledgerEntries);

      // Audit log
      logAudit({
        entityType: 'transaction',
        entityId: payrollId,
        action: 'create',
        after: payrollData,
        performedBy: 'current-user',
        metadata: {
          reason: 'Payroll processed',
        },
      });

      toast.success(`Payroll processed for ${employeeName}`);
      
      // Reset form
      setEmployeeName('');
      setEmployeeId('');
      setGrossSalary('');
      setNhifContribution('');
      setNssfContribution('');
      setOtherDeductions('');
      
      onClose();
    } catch (error: any) {
      console.error('Failed to process payroll:', error);
      toast.error(error.message || 'Failed to process payroll');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            Process Payroll
          </DialogTitle>
          <DialogDescription>
            Calculate and record employee salary with automatic tax and statutory deductions
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Employee Information */}
          <div className="space-y-4">
            <h3 className="font-semibold">Employee Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employeeName">Employee Name *</Label>
                <Input
                  id="employeeName"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input
                  id="employeeId"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="EMP001"
                />
              </div>
            </div>
          </div>

          {/* Salary & Deductions */}
          <div className="space-y-4">
            <h3 className="font-semibold">Salary & Deductions</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="grossSalary">Gross Salary *</Label>
                <Input
                  id="grossSalary"
                  type="number"
                  min="0"
                  step="0.01"
                  value={grossSalary}
                  onChange={(e) => setGrossSalary(e.target.value)}
                  placeholder="50000"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentDate">Payment Date *</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nhif">NHIF Contribution</Label>
                <Input
                  id="nhif"
                  type="number"
                  min="0"
                  step="0.01"
                  value={nhifContribution}
                  onChange={(e) => setNhifContribution(e.target.value)}
                  placeholder="1700"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nssf">NSSF Contribution</Label>
                <Input
                  id="nssf"
                  type="number"
                  min="0"
                  step="0.01"
                  value={nssfContribution}
                  onChange={(e) => setNssfContribution(e.target.value)}
                  placeholder="2160"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="otherDeductions">Other Deductions</Label>
                <Input
                  id="otherDeductions"
                  type="number"
                  min="0"
                  step="0.01"
                  value={otherDeductions}
                  onChange={(e) => setOtherDeductions(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Calculation Summary */}
          <div className="border rounded-lg p-4 bg-muted/50 space-y-2">
            <h3 className="font-semibold mb-3">Calculation Summary</h3>
            
            <div className="flex justify-between text-sm">
              <span>Gross Salary:</span>
              <span className="font-medium">{business.currencySymbol}{grossAmount.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>PAYE Tax:</span>
              <span>-{business.currencySymbol}{taxAmount.toFixed(2)}</span>
            </div>
            
            {nhif > 0 && (
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>NHIF:</span>
                <span>-{business.currencySymbol}{nhif.toFixed(2)}</span>
              </div>
            )}
            
            {nssf > 0 && (
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>NSSF:</span>
                <span>-{business.currencySymbol}{nssf.toFixed(2)}</span>
              </div>
            )}
            
            {otherDed > 0 && (
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Other Deductions:</span>
                <span>-{business.currencySymbol}{otherDed.toFixed(2)}</span>
              </div>
            )}
            
            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>Net Salary:</span>
              <span className="text-green-600">{business.currencySymbol}{netSalary.toFixed(2)}</span>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Process Payroll
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}