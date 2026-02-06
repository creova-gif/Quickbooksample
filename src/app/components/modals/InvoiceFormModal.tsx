import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Trash2, Plus, Loader2 } from 'lucide-react';
import { Invoice, InvoiceItem } from '@/types';
import { useBusiness } from '@/contexts/BusinessContext';
import { postInvoiceToLedger, saveLedgerEntries } from '@/services/ledger.service';
import { logInvoiceCreated } from '@/services/audit.service';
import { queueInvoiceSync } from '@/services/taxsync.service';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function InvoiceFormModal({ open, onClose }: Props) {
  const { business, addInvoice, customers } = useBusiness();
  
  // Form state
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerTaxId, setCustomerTaxId] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [items, setItems] = useState<Omit<InvoiceItem, 'id'>[]>([
    { description: '', quantity: 1, unitPrice: 0, lineTotal: 0 }
  ]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!business) return null;

  const vatRate = business.vatRegistered ? 0.16 : 0; // Use business VAT rate
  
  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const vatAmount = subtotal * vatRate;
  const totalAmount = subtotal + vatAmount;

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, lineTotal: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    const item = newItems[index];
    
    if (field === 'description') {
      item.description = value as string;
    } else if (field === 'quantity') {
      item.quantity = Number(value);
      item.lineTotal = item.quantity * item.unitPrice;
    } else if (field === 'unitPrice') {
      item.unitPrice = Number(value);
      item.lineTotal = item.quantity * item.unitPrice;
    }
    
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!customerName.trim()) {
      toast.error('Customer name is required');
      return;
    }
    
    if (items.some(item => !item.description.trim())) {
      toast.error('All items must have a description');
      return;
    }
    
    if (subtotal <= 0) {
      toast.error('Invoice must have at least one item with a value');
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate invoice number (simple sequential)
      const invoiceNumber = `INV-${Date.now()}`;

      // Create invoice items with IDs
      const invoiceItems: InvoiceItem[] = items.map((item, idx) => ({
        ...item,
        id: `item_${idx}`,
      }));

      // Create invoice object
      const newInvoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'> = {
        businessId: business.id,
        invoiceNumber,
        customerName,
        customerEmail,
        customerPhone,
        customerTaxId,
        currency: business.currency as any,
        issueDate,
        dueDate,
        status: 'draft',
        subtotal,
        vatRate,
        vatAmount,
        totalAmount,
        balanceDue: totalAmount,
        items: invoiceItems,
        notes,
        taxSyncStatus: 'pending',
      };

      // Add to business context
      addInvoice(newInvoice);

      // Get the created invoice (with ID)
      const invoiceWithId: Invoice = {
        ...newInvoice,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Post to ledger (double-entry bookkeeping)
      const ledgerEntries = postInvoiceToLedger(invoiceWithId, 'current-user');
      saveLedgerEntries(ledgerEntries);

      // Audit log
      logInvoiceCreated(invoiceWithId.id, invoiceWithId, 'current-user');

      // Queue for tax authority sync
      if (business.complianceSystem) {
        queueInvoiceSync(invoiceWithId, business.complianceSystem as any);
      }

      toast.success('Invoice created successfully!');
      
      // Reset form
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setCustomerTaxId('');
      setItems([{ description: '', quantity: 1, unitPrice: 0, lineTotal: 0 }]);
      setNotes('');
      
      onClose();
    } catch (error: any) {
      console.error('Failed to create invoice:', error);
      toast.error(error.message || 'Failed to create invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
          <DialogDescription>
            Issue a new invoice with automatic VAT calculation and tax authority sync
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="font-semibold">Customer Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Acme Corporation"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerEmail">Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="customer@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerPhone">Phone</Label>
                <Input
                  id="customerPhone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+254712345678"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerTaxId">Tax ID / PIN</Label>
                <Input
                  id="customerTaxId"
                  value={customerTaxId}
                  onChange={(e) => setCustomerTaxId(e.target.value)}
                  placeholder="P051234567Z"
                />
              </div>
            </div>
          </div>

          {/* Invoice Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issueDate">Issue Date *</Label>
              <Input
                id="issueDate"
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Items</h3>
              <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <Input
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      required
                    />
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      required
                    />
                  </div>
                  <div className="w-32">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Unit Price"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                      required
                    />
                  </div>
                  <div className="w-32">
                    <Input
                      value={item.lineTotal.toFixed(2)}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(index)}
                    disabled={items.length === 1}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>{business.currencySymbol}{subtotal.toFixed(2)}</span>
            </div>
            {vatRate > 0 && (
              <div className="flex justify-between text-sm">
                <span>VAT ({(vatRate * 100).toFixed(0)}%):</span>
                <span>{business.currencySymbol}{vatAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span>{business.currencySymbol}{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Payment terms, special instructions, etc."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Invoice
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
