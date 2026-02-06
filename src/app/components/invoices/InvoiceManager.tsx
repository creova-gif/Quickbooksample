import React, { useState } from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import { formatCurrency } from '@/lib/countries';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Plus, FileText, Eye } from 'lucide-react';
import { InvoiceStatus } from '@/types';
import { InvoiceForm } from './InvoiceForm';
import { InvoicePreview } from './InvoicePreview';

export function InvoiceManager() {
  const { business, invoices } = useBusiness();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);

  if (!business) return null;

  const statusCounts = {
    all: invoices.length,
    draft: invoices.filter(inv => inv.status === 'draft').length,
    sent: invoices.filter(inv => inv.status === 'sent').length,
    paid: invoices.filter(inv => inv.status === 'paid').length,
    overdue: invoices.filter(inv => inv.status === 'overdue').length,
  };

  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'sent':
        return 'secondary';
      case 'overdue':
        return 'destructive';
      case 'draft':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const viewingInvoice = selectedInvoice ? invoices.find(inv => inv.id === selectedInvoice) : null;

  if (isCreating) {
    return (
      <div>
        <Button
          variant="ghost"
          onClick={() => setIsCreating(false)}
          className="mb-4"
        >
          ← Back to Invoices
        </Button>
        <InvoiceForm onComplete={() => setIsCreating(false)} />
      </div>
    );
  }

  if (viewingInvoice) {
    return (
      <div>
        <Button
          variant="ghost"
          onClick={() => setSelectedInvoice(null)}
          className="mb-4"
        >
          ← Back to Invoices
        </Button>
        <InvoicePreview invoice={viewingInvoice} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Invoices</h2>
          <p className="text-muted-foreground">
            Create and manage customer invoices
          </p>
        </div>

        <Button className="gap-2" onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4" />
          New Invoice
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            All ({statusCounts.all})
          </TabsTrigger>
          <TabsTrigger value="draft">
            Drafts ({statusCounts.draft})
          </TabsTrigger>
          <TabsTrigger value="sent">
            Sent ({statusCounts.sent})
          </TabsTrigger>
          <TabsTrigger value="paid">
            Paid ({statusCounts.paid})
          </TabsTrigger>
          <TabsTrigger value="overdue">
            Overdue ({statusCounts.overdue})
          </TabsTrigger>
        </TabsList>

        {(['all', 'draft', 'sent', 'paid', 'overdue'] as const).map((status) => (
          <TabsContent key={status} value={status} className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                {invoices
                  .filter(inv => status === 'all' || inv.status === status)
                  .length > 0 ? (
                  <div className="space-y-3">
                    {invoices
                      .filter(inv => status === 'all' || inv.status === status)
                      .map((invoice) => (
                        <div
                          key={invoice.id}
                          className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => setSelectedInvoice(invoice.id)}
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <FileText className="w-5 h-5 text-blue-600" />
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{invoice.invoiceNumber}</span>
                                <Badge variant={getStatusColor(invoice.status)}>
                                  {invoice.status}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {invoice.customerName} • Due: {new Date(invoice.dueDate).toLocaleDateString('en-GB')}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="font-bold text-lg">
                              {formatCurrency(invoice.total, business.countryCode)}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1 mt-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedInvoice(invoice.id);
                              }}
                            >
                              <Eye className="w-3 h-3" />
                              View
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="text-lg mb-2">No {status !== 'all' ? status : ''} invoices</p>
                    <Button
                      variant="link"
                      size="sm"
                      className="mt-2"
                      onClick={() => setIsCreating(true)}
                    >
                      Create your first invoice
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
