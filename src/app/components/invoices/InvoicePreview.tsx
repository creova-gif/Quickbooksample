import React from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import { Invoice } from '@/types';
import { getCountry, formatCurrency } from '@/lib/countries';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Separator } from '@/app/components/ui/separator';
import { Download, Send, CheckCircle, QrCode } from 'lucide-react';

interface InvoicePreviewProps {
  invoice: Invoice;
}

export function InvoicePreview({ invoice }: InvoicePreviewProps) {
  const { business, updateInvoice } = useBusiness();

  if (!business) return null;

  const country = getCountry(business.countryCode);

  const handleMarkAsPaid = () => {
    updateInvoice(invoice.id, {
      status: 'paid',
      paidAt: new Date().toISOString(),
    });
  };

  const handleDownloadPDF = () => {
    // In production, this would generate and download a PDF
    alert('PDF download would happen here');
  };

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={handleDownloadPDF} className="gap-2">
          <Download className="w-4 h-4" />
          Download PDF
        </Button>
        <Button variant="outline" className="gap-2">
          <Send className="w-4 h-4" />
          Send to Customer
        </Button>
        {invoice.status !== 'paid' && (
          <Button onClick={handleMarkAsPaid} className="gap-2">
            <CheckCircle className="w-4 h-4" />
            Mark as Paid
          </Button>
        )}
      </div>

      {/* Invoice Document */}
      <Card className="shadow-lg">
        <CardContent className="p-8 md:p-12">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">{business.name}</h1>
              <div className="text-sm text-muted-foreground space-y-1">
                {business.address && <p>{business.address}</p>}
                {business.phone && <p>Tel: {business.phone}</p>}
                {business.email && <p>Email: {business.email}</p>}
                {business.taxId && (
                  <p>
                    {country.code === 'KE' ? 'PIN' :
                     country.code === 'BI' ? 'NIF' :
                     'TIN'}: {business.taxId}
                  </p>
                )}
              </div>
            </div>

            <div className="text-right">
              <h2 className="text-2xl font-bold mb-2">INVOICE</h2>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(invoice.status)}`}>
                {invoice.status.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-3">Bill To:</h3>
              <div className="space-y-1">
                <p className="font-medium">{invoice.customerName}</p>
                {invoice.customerAddress && <p className="text-sm">{invoice.customerAddress}</p>}
                {invoice.customerPhone && <p className="text-sm">Tel: {invoice.customerPhone}</p>}
                {invoice.customerEmail && <p className="text-sm">Email: {invoice.customerEmail}</p>}
                {invoice.customerTaxId && (
                  <p className="text-sm">
                    {country.code === 'KE' ? 'PIN' :
                     country.code === 'BI' ? 'NIF' :
                     'TIN'}: {invoice.customerTaxId}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invoice Number:</span>
                <span className="font-semibold">{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invoice Date:</span>
                <span>{new Date(invoice.date).toLocaleDateString('en-GB')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Due Date:</span>
                <span>{new Date(invoice.dueDate).toLocaleDateString('en-GB')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Currency:</span>
                <span>{country.currencySymbol} {invoice.currency}</span>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Line Items */}
          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 font-semibold">Description</th>
                  <th className="text-right py-3 font-semibold">Qty</th>
                  <th className="text-right py-3 font-semibold">Unit Price</th>
                  <th className="text-right py-3 font-semibold">{country.vatName}</th>
                  <th className="text-right py-3 font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-3">{item.description}</td>
                    <td className="text-right py-3">{item.quantity}</td>
                    <td className="text-right py-3">{formatCurrency(item.unitPrice, business.countryCode)}</td>
                    <td className="text-right py-3">{item.taxRate}%</td>
                    <td className="text-right py-3 font-semibold">
                      {formatCurrency(item.total, business.countryCode)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-full md:w-80 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>{formatCurrency(invoice.subtotal, business.countryCode)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{country.vatName} ({country.vatRate}%):</span>
                <span>{formatCurrency(invoice.taxAmount, business.countryCode)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-xl font-bold">
                <span>Total:</span>
                <span>{formatCurrency(invoice.total, business.countryCode)}</span>
              </div>
            </div>
          </div>

          {/* Compliance Information */}
          {invoice.complianceData && (
            <div className="bg-gray-50 border rounded-lg p-4 mb-8">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <QrCode className="w-4 h-4" />
                Tax Compliance Information
              </h4>
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                {country.code === 'KE' && invoice.complianceData.timsInvoiceId && (
                  <>
                    <div>
                      <span className="text-muted-foreground">TIMS Invoice ID:</span>
                      <span className="ml-2 font-mono">{invoice.complianceData.timsInvoiceId}</span>
                    </div>
                    {invoice.complianceData.timsQrCode && (
                      <div>
                        <span className="text-muted-foreground">QR Code:</span>
                        <span className="ml-2">Available for scanning</span>
                      </div>
                    )}
                  </>
                )}
                {country.code === 'TZ' && invoice.complianceData.vfdReceiptNumber && (
                  <>
                    <div>
                      <span className="text-muted-foreground">VFD Receipt:</span>
                      <span className="ml-2 font-mono">{invoice.complianceData.vfdReceiptNumber}</span>
                    </div>
                    {invoice.complianceData.vfdVerificationCode && (
                      <div>
                        <span className="text-muted-foreground">Verification Code:</span>
                        <span className="ml-2 font-mono">{invoice.complianceData.vfdVerificationCode}</span>
                      </div>
                    )}
                  </>
                )}
                {country.code === 'UG' && invoice.complianceData.efrisInvoiceId && (
                  <>
                    <div>
                      <span className="text-muted-foreground">EFRIS Invoice ID:</span>
                      <span className="ml-2 font-mono">{invoice.complianceData.efrisInvoiceId}</span>
                    </div>
                    {invoice.complianceData.efrisFdmSignature && (
                      <div>
                        <span className="text-muted-foreground">FDM Signature:</span>
                        <span className="ml-2 font-mono text-xs">{invoice.complianceData.efrisFdmSignature.substring(0, 20)}...</span>
                      </div>
                    )}
                  </>
                )}
                {country.code === 'RW' && invoice.complianceData.ebmInvoiceId && (
                  <>
                    <div>
                      <span className="text-muted-foreground">EBM Invoice ID:</span>
                      <span className="ml-2 font-mono">{invoice.complianceData.ebmInvoiceId}</span>
                    </div>
                    {invoice.complianceData.ebmSdcId && (
                      <div>
                        <span className="text-muted-foreground">SDC ID:</span>
                        <span className="ml-2 font-mono">{invoice.complianceData.ebmSdcId}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Notes and Terms */}
          {(invoice.notes || invoice.terms) && (
            <div className="space-y-4">
              {invoice.notes && (
                <div>
                  <h4 className="font-semibold mb-2">Notes:</h4>
                  <p className="text-sm text-muted-foreground">{invoice.notes}</p>
                </div>
              )}
              {invoice.terms && (
                <div>
                  <h4 className="font-semibold mb-2">Payment Terms:</h4>
                  <p className="text-sm text-muted-foreground">{invoice.terms}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
