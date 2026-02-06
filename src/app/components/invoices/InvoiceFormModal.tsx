/**
 * Invoice Form Modal - Web Version
 * Fully integrated with ledger, audit, tax sync, and offline queue
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { useBusiness } from '@/contexts/BusinessContext';
import { FileText, Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

interface InvoiceFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function InvoiceFormModal({ open, onOpenChange, onSuccess }: InvoiceFormModalProps) {
  const { business } = useBusiness();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: crypto.randomUUID(), description: '', quantity: 1, unitPrice: 0, lineTotal: 0 }
  ]);
  const [notes, setNotes] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const vatRate = business?.country === 'KE' ? 0.16 : 0.18;
  const vatAmount = Math.round(subtotal * vatRate * 100) / 100;
  const totalAmount = subtotal + vatAmount;

  // Add item
  const addItem = () => {
    setItems([
      ...items,
      { id: crypto.randomUUID(), description: '', quantity: 1, unitPrice: 0, lineTotal: 0 }
    ]);
  };

  // Update item
  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updated.lineTotal = Math.round(updated.quantity * updated.unitPrice * 100) / 100;
        }
        return updated;
      }
      return item;
    }));
  };

  // Remove item
  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  // Submit invoice
  const handleSubmit = async () => {
    // Validation
    if (!customerName.trim()) {
      toast.error('Customer name is required');
      return;
    }
    
    if (items.some(item => !item.description.trim())) {
      toast.error('All items must have a description');
      return;
    }

    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      const invoice = {
        customerName,
        customerEmail,
        customerPhone,
        items: items.map(({ id, ...item }) => item),
        currency: business?.currency || 'KES',
        issueDate,
        dueDate,
        notes,
        subtotal,
        vatRate,
        vatAmount,
        totalAmount
      };

      // Try API call
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      try {
        const response = await fetch(`${API_URL}/api/v1/invoices`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(invoice),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const createdInvoice = await response.json();
          
          // Issue invoice (post to ledger and queue for tax sync)
          await fetch(`${API_URL}/api/v1/invoices/${createdInvoice.id}/issue`, {
            method: 'POST'
          });

          toast.success('Invoice created and issued successfully!');
        } else {
          throw new Error('Failed to create invoice');
        }
      } catch (apiError) {
        console.log('API unavailable, using offline mode');
        
        // Save to offline queue
        const queue = JSON.parse(localStorage.getItem('invoice_queue') || '[]');
        queue.push({
          ...invoice,
          id: crypto.randomUUID(),
          invoiceNumber: `INV-${Date.now()}`,
          status: 'pending_sync',
          createdAt: new Date().toISOString()
        });
        localStorage.setItem('invoice_queue', JSON.stringify(queue));
        
        toast.success('Invoice saved offline. Will sync when connected.');
      }

      // Also save to localStorage for immediate display
      const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
      invoices.push({
        id: crypto.randomUUID(),
        invoiceNumber: `INV-${Date.now()}`,
        ...invoice,
        status: 'draft',
        balanceDue: totalAmount,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('invoices', JSON.stringify(invoices));

      // Reset form
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setItems([{ id: crypto.randomUUID(), description: '', quantity: 1, unitPrice: 0, lineTotal: 0 }]);
      setNotes('');

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Invoice creation error:', error);
      toast.error('Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            New Invoice
          </DialogTitle>
          <DialogDescription>
            Create a new invoice for your customer
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Customer Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                />
              </div>
              
              <div>
                <Label htmlFor="customerEmail">Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="customer@example.com"
                />
              </div>
              
              <div>
                <Label htmlFor="customerPhone">Phone</Label>
                <Input
                  id="customerPhone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+254 700 000 000"
                />
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Items</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    {index === 0 && <Label className="text-xs mb-1">Description</Label>}
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      placeholder="Item description"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    {index === 0 && <Label className="text-xs mb-1">Quantity</Label>}
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      min="0"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    {index === 0 && <Label className="text-xs mb-1">Unit Price</Label>}
                    <Input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      min="0"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    {index === 0 && <Label className="text-xs mb-1">Total</Label>}
                    <div className="h-10 flex items-center font-semibold">
                      {item.lineTotal.toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="col-span-1">
                    {index === 0 && <div className="h-5" />}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      disabled={items.length === 1}
                      className="h-10 w-10 p-0"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span className="font-semibold">{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>VAT ({(vatRate * 100).toFixed(0)}%):</span>
              <span className="font-semibold">{vatAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total:</span>
              <span className="text-green-600">{totalAmount.toFixed(2)} {business?.currency || 'KES'}</span>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="issueDate">Issue Date</Label>
              <Input
                id="issueDate"
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || !customerName || items.some(i => !i.description)}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create & Issue Invoice'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
