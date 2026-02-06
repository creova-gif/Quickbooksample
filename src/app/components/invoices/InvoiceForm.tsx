import React, { useState } from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import { getCountry, getComplianceFields } from '@/lib/countries';
import { calculateInvoiceItem, calculateInvoiceTotals, generateInvoiceNumber } from '@/lib/accounting';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Separator } from '@/app/components/ui/separator';
import { InvoiceItem } from '@/types';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';

interface InvoiceFormProps {
  onComplete: () => void;
}

export function InvoiceForm({ onComplete }: InvoiceFormProps) {
  const { business, invoices, addInvoice } = useBusiness();
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    customerTaxId: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
    terms: 'Payment due within 30 days',
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: '1',
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxRate: business ? getCountry(business.countryCode).vatRate : 16,
      taxAmount: 0,
      total: 0,
    },
  ]);

  if (!business) return null;

  const country = getCountry(business.countryCode);
  const complianceFields = getComplianceFields(business.countryCode);
  const totals = calculateInvoiceTotals(items);

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    // Recalculate if quantity, unitPrice, or taxRate changed
    if (['quantity', 'unitPrice', 'taxRate'].includes(field)) {
      const calculated = calculateInvoiceItem(
        updatedItems[index].quantity,
        updatedItems[index].unitPrice,
        updatedItems[index].taxRate
      );
      updatedItems[index].taxAmount = calculated.taxAmount;
      updatedItems[index].total = calculated.total;
    }

    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        description: '',
        quantity: 1,
        unitPrice: 0,
        taxRate: country.vatRate,
        taxAmount: 0,
        total: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSave = (status: 'draft' | 'sent') => {
    const invoiceNumber = generateInvoiceNumber(business.countryCode, invoices.length);

    addInvoice({
      invoiceNumber,
      date: formData.date,
      dueDate: formData.dueDate,
      status,
      customerName: formData.customerName,
      customerEmail: formData.customerEmail || undefined,
      customerPhone: formData.customerPhone || undefined,
      customerAddress: formData.customerAddress || undefined,
      customerTaxId: formData.customerTaxId || undefined,
      items,
      subtotal: totals.subtotal,
      taxAmount: totals.taxAmount,
      total: totals.total,
      currency: business.currency,
      notes: formData.notes || undefined,
      terms: formData.terms || undefined,
    });

    onComplete();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create Invoice</CardTitle>
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="outline">{country.flag} {country.name}</Badge>
            <Badge variant="secondary">{country.vatName} {country.vatRate}%</Badge>
            {country.complianceSystem && (
              <Badge variant="outline" className="text-xs">{country.complianceSystem}</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Customer Information */}
          <div>
            <h3 className="font-semibold mb-4">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  placeholder="Customer name"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerEmail">Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  placeholder="customer@example.com"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerPhone">Phone</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  placeholder="+254 700 000000"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerTaxId">
                  {complianceFields.labels.customerTaxId || 'Tax ID'}
                  {complianceFields.required.includes('customerTaxId') && ' *'}
                </Label>
                <Input
                  id="customerTaxId"
                  placeholder={
                    business.countryCode === 'KE' ? 'A000000000X' :
                    business.countryCode === 'BI' ? 'NIF' :
                    'TIN'
                  }
                  value={formData.customerTaxId}
                  onChange={(e) => setFormData({ ...formData, customerTaxId: e.target.value })}
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="customerAddress">Address</Label>
                <Textarea
                  id="customerAddress"
                  placeholder="Customer address"
                  value={formData.customerAddress}
                  onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Invoice Details */}
          <div>
            <h3 className="font-semibold mb-4">Invoice Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Invoice Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Items</h3>
              <Button variant="outline" size="sm" onClick={addItem} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <Card key={item.id} className="relative">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-12 gap-3">
                      <div className="col-span-12 md:col-span-5">
                        <Label>Description</Label>
                        <Input
                          placeholder="Item description"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        />
                      </div>

                      <div className="col-span-4 md:col-span-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                        />
                      </div>

                      <div className="col-span-4 md:col-span-2">
                        <Label>Unit Price</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        />
                      </div>

                      <div className="col-span-4 md:col-span-2">
                        <Label>{country.vatName} %</Label>
                        <Input
                          type="number"
                          value={item.taxRate}
                          onChange={(e) => handleItemChange(index, 'taxRate', parseFloat(e.target.value) || 0)}
                        />
                      </div>

                      <div className="col-span-12 md:col-span-1 flex items-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                          disabled={items.length === 1}
                          className="w-full"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-3 text-sm text-muted-foreground">
                      Subtotal: {country.currencySymbol} {(item.quantity * item.unitPrice).toFixed(2)} • 
                      Tax: {country.currencySymbol} {item.taxAmount.toFixed(2)} • 
                      Total: {country.currencySymbol} {item.total.toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full md:w-80 space-y-3">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal:</span>
                <span>{country.currencySymbol} {totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>{country.vatName} ({country.vatRate}%):</span>
                <span>{country.currencySymbol} {totals.taxAmount.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-xl font-bold">
                <span>Total:</span>
                <span>{country.currencySymbol} {totals.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Additional Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes for the customer"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="terms">Payment Terms</Label>
              <Input
                id="terms"
                placeholder="Payment terms"
                value={formData.terms}
                onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
              />
            </div>
          </div>

          {/* Compliance Warning */}
          {country.complianceSystem && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">Compliance System Active</p>
                  <p>
                    This invoice will be formatted for <strong>{country.complianceSystem}</strong>.
                    In production, it would be automatically submitted to tax authorities.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onComplete}>
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSave('draft')}
              disabled={!formData.customerName || items.some(i => !i.description)}
            >
              Save as Draft
            </Button>
            <Button
              onClick={() => handleSave('sent')}
              disabled={!formData.customerName || items.some(i => !i.description)}
            >
              Create & Send
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
