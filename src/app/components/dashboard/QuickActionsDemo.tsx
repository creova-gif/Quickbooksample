import React, { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { FileText, Users, Package } from 'lucide-react';
import { InvoiceFormModal, PayrollFormModal, InventoryFormModal } from '@/app/components/modals';

/**
 * Quick Actions Demo Component
 * Shows how to integrate the three modal forms into your dashboard
 */
export function QuickActionsDemo() {
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPayrollModal, setShowPayrollModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common accounting tasks with integrated ledger posting, audit trails, and tax sync
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Invoice Button */}
            <Button
              variant="outline"
              className="h-auto flex-col gap-3 p-6"
              onClick={() => setShowInvoiceModal(true)}
            >
              <FileText className="w-8 h-8 text-blue-600" />
              <div className="text-center">
                <div className="font-semibold">Create Invoice</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Issue invoice with VAT & tax sync
                </div>
              </div>
            </Button>

            {/* Payroll Button */}
            <Button
              variant="outline"
              className="h-auto flex-col gap-3 p-6"
              onClick={() => setShowPayrollModal(true)}
            >
              <Users className="w-8 h-8 text-green-600" />
              <div className="text-center">
                <div className="font-semibold">Process Payroll</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Calculate salary with PAYE & deductions
                </div>
              </div>
            </Button>

            {/* Inventory Button */}
            <Button
              variant="outline"
              className="h-auto flex-col gap-3 p-6"
              onClick={() => setShowInventoryModal(true)}
            >
              <Package className="w-8 h-8 text-orange-600" />
              <div className="text-center">
                <div className="font-semibold">Inventory Transaction</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Record purchases, sales & adjustments
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <InvoiceFormModal
        open={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
      />
      
      <PayrollFormModal
        open={showPayrollModal}
        onClose={() => setShowPayrollModal(false)}
      />
      
      <InventoryFormModal
        open={showInventoryModal}
        onClose={() => setShowInventoryModal(false)}
      />
    </>
  );
}
