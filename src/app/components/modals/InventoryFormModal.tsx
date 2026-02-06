import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Loader2, Package, TrendingUp, TrendingDown } from 'lucide-react';
import { useBusiness } from '@/contexts/BusinessContext';
import { saveLedgerEntries, SYSTEM_ACCOUNTS } from '@/services/ledger.service';
import { logAudit } from '@/services/audit.service';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
}

interface InventoryTransaction {
  id: string;
  itemName: string;
  itemSku: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  transactionType: 'purchase' | 'sale' | 'adjustment';
  transactionDate: string;
  notes: string;
}

export function InventoryFormModal({ open, onClose }: Props) {
  const { business } = useBusiness();
  
  // Form state
  const [transactionType, setTransactionType] = useState<'purchase' | 'sale' | 'adjustment'>('purchase');
  const [itemName, setItemName] = useState('');
  const [itemSku, setItemSku] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!business) return null;

  const quantityNum = parseFloat(quantity) || 0;
  const unitCostNum = parseFloat(unitCost) || 0;
  const totalCost = quantityNum * unitCostNum;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!itemName.trim()) {
      toast.error('Item name is required');
      return;
    }
    
    if (quantityNum <= 0) {
      toast.error('Quantity must be greater than zero');
      return;
    }
    
    if (unitCostNum <= 0) {
      toast.error('Unit cost must be greater than zero');
      return;
    }

    setIsSubmitting(true);

    try {
      const inventoryTx: InventoryTransaction = {
        id: crypto.randomUUID(),
        itemName,
        itemSku,
        quantity: quantityNum,
        unitCost: unitCostNum,
        totalCost,
        transactionType,
        transactionDate,
        notes,
      };

      // Post to ledger based on transaction type
      const ledgerEntries = [];

      if (transactionType === 'purchase') {
        // Purchase: Inventory increases (asset), Cash/AP decreases
        // Debit: Inventory (asset increases)
        // Credit: Cash/Bank or Accounts Payable
        
        ledgerEntries.push(
          {
            id: crypto.randomUUID(),
            accountId: 'acc_inventory',
            accountCode: '1300',
            accountName: 'Inventory',
            debit: totalCost,
            credit: 0,
            currency: business.currency as any,
            entryDate: transactionDate,
            description: `Purchase: ${itemName} (${quantityNum} units)`,
            reference: itemSku,
            createdBy: 'current-user',
            createdAt: new Date().toISOString(),
            isReversed: false,
          },
          {
            id: crypto.randomUUID(),
            accountId: SYSTEM_ACCOUNTS.BANK.id,
            accountCode: SYSTEM_ACCOUNTS.BANK.code,
            accountName: SYSTEM_ACCOUNTS.BANK.name,
            debit: 0,
            credit: totalCost,
            currency: business.currency as any,
            entryDate: transactionDate,
            description: `Payment for ${itemName}`,
            reference: itemSku,
            createdBy: 'current-user',
            createdAt: new Date().toISOString(),
            isReversed: false,
          }
        );
      } else if (transactionType === 'sale') {
        // Sale: Inventory decreases, COGS increases
        // Debit: Cost of Goods Sold (expense)
        // Credit: Inventory (asset decreases)
        
        ledgerEntries.push(
          {
            id: crypto.randomUUID(),
            accountId: SYSTEM_ACCOUNTS.COST_OF_GOODS.id,
            accountCode: SYSTEM_ACCOUNTS.COST_OF_GOODS.code,
            accountName: SYSTEM_ACCOUNTS.COST_OF_GOODS.name,
            debit: totalCost,
            credit: 0,
            currency: business.currency as any,
            entryDate: transactionDate,
            description: `COGS: ${itemName} (${quantityNum} units)`,
            reference: itemSku,
            createdBy: 'current-user',
            createdAt: new Date().toISOString(),
            isReversed: false,
          },
          {
            id: crypto.randomUUID(),
            accountId: 'acc_inventory',
            accountCode: '1300',
            accountName: 'Inventory',
            debit: 0,
            credit: totalCost,
            currency: business.currency as any,
            entryDate: transactionDate,
            description: `Sale: ${itemName} (${quantityNum} units)`,
            reference: itemSku,
            createdBy: 'current-user',
            createdAt: new Date().toISOString(),
            isReversed: false,
          }
        );
      } else if (transactionType === 'adjustment') {
        // Adjustment: Depends on whether it's positive or negative
        // For simplicity, we'll adjust inventory and expense/income
        const isPositive = quantityNum > 0;
        
        if (isPositive) {
          // Positive adjustment: Inventory increases
          ledgerEntries.push(
            {
              id: crypto.randomUUID(),
              accountId: 'acc_inventory',
              accountCode: '1300',
              accountName: 'Inventory',
              debit: totalCost,
              credit: 0,
              currency: business.currency as any,
              entryDate: transactionDate,
              description: `Adjustment: ${itemName} (${quantityNum} units)`,
              reference: itemSku,
              createdBy: 'current-user',
              createdAt: new Date().toISOString(),
              isReversed: false,
            },
            {
              id: crypto.randomUUID(),
              accountId: SYSTEM_ACCOUNTS.OPERATING_EXPENSES.id,
              accountCode: '6500',
              accountName: 'Inventory Adjustment',
              debit: 0,
              credit: totalCost,
              currency: business.currency as any,
              entryDate: transactionDate,
              description: `Adjustment: ${itemName}`,
              reference: itemSku,
              createdBy: 'current-user',
              createdAt: new Date().toISOString(),
              isReversed: false,
            }
          );
        }
      }

      saveLedgerEntries(ledgerEntries);

      // Audit log
      logAudit({
        entityType: 'transaction',
        entityId: inventoryTx.id,
        action: 'create',
        after: inventoryTx,
        performedBy: 'current-user',
        metadata: {
          reason: `Inventory ${transactionType}`,
        },
      });

      toast.success(`Inventory ${transactionType} recorded successfully`);
      
      // Reset form
      setItemName('');
      setItemSku('');
      setQuantity('');
      setUnitCost('');
      setNotes('');
      
      onClose();
    } catch (error: any) {
      console.error('Failed to record inventory transaction:', error);
      toast.error(error.message || 'Failed to record transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Inventory Transaction
          </DialogTitle>
          <DialogDescription>
            Record inventory purchases, sales, or adjustments with automatic ledger posting
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Transaction Type */}
          <div className="space-y-2">
            <Label>Transaction Type</Label>
            <Tabs value={transactionType} onValueChange={(value) => setTransactionType(value as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="purchase" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Purchase
                </TabsTrigger>
                <TabsTrigger value="sale" className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4" />
                  Sale
                </TabsTrigger>
                <TabsTrigger value="adjustment">
                  Adjustment
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Item Information */}
          <div className="space-y-4">
            <h3 className="font-semibold">Item Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="itemName">Item Name *</Label>
                <Input
                  id="itemName"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="Product name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="itemSku">SKU / Item Code</Label>
                <Input
                  id="itemSku"
                  value={itemSku}
                  onChange={(e) => setItemSku(e.target.value)}
                  placeholder="SKU-001"
                />
              </div>
            </div>
          </div>

          {/* Quantity & Cost */}
          <div className="space-y-4">
            <h3 className="font-semibold">Quantity & Cost</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  step="0.01"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="10"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unitCost">Unit Cost *</Label>
                <Input
                  id="unitCost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={unitCost}
                  onChange={(e) => setUnitCost(e.target.value)}
                  placeholder="1000"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalCost">Total Cost</Label>
                <Input
                  id="totalCost"
                  value={totalCost.toFixed(2)}
                  disabled
                  className="bg-muted font-medium"
                />
              </div>
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="transactionDate">Transaction Date *</Label>
            <Input
              id="transactionDate"
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              required
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional details about this transaction..."
              rows={3}
            />
          </div>

          {/* Summary */}
          <div className="border rounded-lg p-4 bg-muted/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {transactionType === 'purchase' && 'This will increase your inventory and decrease cash'}
                  {transactionType === 'sale' && 'This will decrease inventory and record cost of goods sold'}
                  {transactionType === 'adjustment' && 'This will adjust your inventory value'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold">{business.currencySymbol}{totalCost.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Record {transactionType}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
