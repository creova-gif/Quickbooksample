import React, { useState } from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { ArrowUpRight, ArrowDownRight, ArrowLeftRight, CheckCircle } from 'lucide-react';
import { Transaction } from '@/types';
import { toast } from 'sonner';
import { getCountryByCode } from '@/lib/countries';

type TransactionType = 'income' | 'expense' | 'transfer';

interface TransactionFormData {
  type: TransactionType;
  amount: string;
  categoryId: string;
  description: string;
  reference: string;
  paymentMethod: string;
}

const INCOME_CATEGORIES = [
  { id: 'sales', name: 'Retail Sales', icon: '🛍️' },
  { id: 'services', name: 'Services', icon: '⚙️' },
  { id: 'consulting', name: 'Consulting', icon: '💼' },
  { id: 'other_income', name: 'Other Income', icon: '💰' },
];

const EXPENSE_CATEGORIES = [
  { id: 'rent', name: 'Rent', icon: '🏢' },
  { id: 'utilities', name: 'Utilities', icon: '💡' },
  { id: 'supplies', name: 'Supplies', icon: '📦' },
  { id: 'salaries', name: 'Salaries', icon: '👥' },
  { id: 'marketing', name: 'Marketing', icon: '📢' },
  { id: 'transport', name: 'Transport', icon: '🚗' },
  { id: 'other_expense', name: 'Other Expense', icon: '💳' },
];

const PAYMENT_METHODS = [
  { id: 'mpesa', name: 'M-Pesa', countries: ['KE', 'TZ'] },
  { id: 'airtel', name: 'Airtel Money', countries: ['KE', 'UG', 'TZ'] },
  { id: 'tigo', name: 'Tigo Pesa', countries: ['TZ'] },
  { id: 'mtn', name: 'MTN Mobile Money', countries: ['UG', 'RW'] },
  { id: 'bank', name: 'Bank Transfer', countries: ['KE', 'TZ', 'UG', 'RW', 'BI'] },
  { id: 'cash', name: 'Cash', countries: ['KE', 'TZ', 'UG', 'RW', 'BI'] },
];

export function TransactionFormModal({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}) {
  const { business } = useBusiness();
  const [step, setStep] = useState<'type' | 'details' | 'success'>('type');
  const [formData, setFormData] = useState<TransactionFormData>({
    type: 'income',
    amount: '',
    categoryId: '',
    description: '',
    reference: '',
    paymentMethod: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const country = business ? getCountryByCode(business.countryCode) : null;
  const vatRate = country?.vatRate || 0;

  // Calculate VAT
  const amount = parseFloat(formData.amount) || 0;
  const taxAmount = formData.type === 'income' ? (amount * vatRate) / (100 + vatRate) : 0;
  const total = amount;

  const availablePaymentMethods = PAYMENT_METHODS.filter(
    method => method.countries.includes(business?.countryCode || '')
  );

  const categories = formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleTypeSelect = (type: TransactionType) => {
    setFormData({ ...formData, type });
    setStep('details');
  };

  const handleSubmit = async () => {
    if (!formData.amount || !formData.categoryId) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);

    try {
      // Create transaction
      const transaction: Transaction = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        type: formData.type,
        amount: parseFloat(formData.amount),
        categoryId: formData.categoryId,
        description: formData.description || categories.find(c => c.id === formData.categoryId)?.name || '',
        reference: formData.reference,
        taxAmount,
        taxRate: vatRate,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to localStorage (in real app, this would be an API call)
      const existingTransactions = JSON.parse(
        localStorage.getItem(`transactions_${business?.id}`) || '[]'
      );
      existingTransactions.push(transaction);
      localStorage.setItem(
        `transactions_${business?.id}`,
        JSON.stringify(existingTransactions)
      );

      // Update totals
      const totalsKey = `totals_${business?.id}`;
      const totals = JSON.parse(localStorage.getItem(totalsKey) || '{"income":0,"expense":0}');
      if (formData.type === 'income') {
        totals.income += transaction.amount;
      } else {
        totals.expense += transaction.amount;
      }
      localStorage.setItem(totalsKey, JSON.stringify(totals));

      setStep('success');
      setTimeout(() => {
        onOpenChange(false);
        onSuccess?.();
        // Reset form
        setFormData({
          type: 'income',
          amount: '',
          categoryId: '',
          description: '',
          reference: '',
          paymentMethod: '',
        });
        setStep('type');
      }, 2000);
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast.error('Failed to save transaction');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        {step === 'type' && (
          <>
            <DialogHeader>
              <DialogTitle>New Transaction</DialogTitle>
              <DialogDescription>What happened?</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 pt-4">
              <Card
                className="p-6 cursor-pointer hover:shadow-lg transition-all hover:border-green-300"
                onClick={() => handleTypeSelect('income')}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <ArrowUpRight className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Money In</h3>
                    <p className="text-sm text-muted-foreground">Record a sale or income</p>
                  </div>
                </div>
              </Card>

              <Card
                className="p-6 cursor-pointer hover:shadow-lg transition-all hover:border-red-300"
                onClick={() => handleTypeSelect('expense')}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-50 rounded-lg">
                    <ArrowDownRight className="w-8 h-8 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Money Out</h3>
                    <p className="text-sm text-muted-foreground">Record an expense</p>
                  </div>
                </div>
              </Card>

              <Card
                className="p-6 cursor-pointer hover:shadow-lg transition-all hover:border-blue-300"
                onClick={() => handleTypeSelect('transfer')}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <ArrowLeftRight className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Transfer</h3>
                    <p className="text-sm text-muted-foreground">Move money between accounts</p>
                  </div>
                </div>
              </Card>
            </div>
          </>
        )}

        {step === 'details' && (
          <>
            <DialogHeader>
              <DialogTitle>
                Record {formData.type === 'income' ? 'Sale' : 'Expense'}
              </DialogTitle>
              <DialogDescription>
                Enter the transaction details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {/* Amount */}
              <div>
                <Label htmlFor="amount">
                  Amount ({business?.currency}) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="text-lg font-semibold"
                  autoFocus
                />
              </div>

              {/* Category */}
              <div>
                <Label htmlFor="category">
                  {formData.type === 'income' ? 'What did you sell?' : 'What did you buy?'} <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <span className="flex items-center gap-2">
                          <span>{cat.icon}</span>
                          <span>{cat.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.categoryId && (
                  <p className="text-xs text-muted-foreground mt-1">💡 Based on your history</p>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <Label htmlFor="payment">How were you {formData.type === 'income' ? 'paid' : 'charged'}?</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePaymentMethods.map((method) => (
                      <SelectItem key={method.id} value={method.id}>
                        {method.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Reference */}
              <div>
                <Label htmlFor="reference">Reference (Optional)</Label>
                <Input
                  id="reference"
                  placeholder={formData.paymentMethod === 'mpesa' ? 'SAX123456' : 'Transaction reference'}
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Add notes about this transaction..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
              </div>

              {/* Tax Summary */}
              {formData.type === 'income' && amount > 0 && (
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">VAT ({vatRate}%):</span>
                      <span className="font-medium">{business?.currency} {taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base">
                      <span>Total:</span>
                      <span>{business?.currency} {total.toFixed(2)}</span>
                    </div>
                  </div>
                </Card>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep('type')}
                  disabled={submitting}
                >
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={submitting || !formData.amount || !formData.categoryId}
                >
                  {submitting ? 'Saving...' : 'Save Transaction'}
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 'success' && (
          <div className="py-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="font-bold text-xl mb-2">
              {formData.type === 'income' ? 'Sale' : 'Expense'} Recorded!
            </h3>
            <p className="text-2xl font-bold mb-1">{business?.currency} {total.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">
              {categories.find(c => c.id === formData.categoryId)?.name} • {formData.paymentMethod}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
