import React, { useState, useEffect } from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  TrendingDown,
  Plus,
  FileText,
  Receipt,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Users,
  Package
} from 'lucide-react';
import { Transaction } from '@/types';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TransactionFormModal } from '../transactions/TransactionFormModal'; // Modal for income/expense
import { InvoiceForm } from '../invoices/InvoiceForm'; // Invoice creation form
import { InvoiceFormModal, PayrollFormModal, InventoryFormModal } from '@/app/components/modals'; // NEW MODALS
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';

interface QuickStat {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ElementType;
  color: string;
}

export function EnhancedDashboardComplete() {
  const { business } = useBusiness();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state management
  const [activeModal, setActiveModal] = useState<'income' | 'expense' | 'invoice' | 'payroll' | 'inventory' | null>(null);
  
  // Modal handlers
  const openIncomeModal = () => setActiveModal('income');
  const openExpenseModal = () => setActiveModal('expense');
  const openInvoiceModal = () => setActiveModal('invoice');
  const openPayrollModal = () => setActiveModal('payroll');
  const openInventoryModal = () => setActiveModal('inventory');
  const closeModal = () => setActiveModal(null);
  
  // Handle successful transaction/invoice creation
  const handleTransactionSuccess = () => {
    closeModal();
    // Reload transactions
    const stored = localStorage.getItem(`transactions_${business?.id}`);
    if (stored) {
      setTransactions(JSON.parse(stored));
    }
  };

  // Demo data for visualization
  const [chartData] = useState([
    { date: 'Jan 9', income: 4200, expense: 2400 },
    { date: 'Jan 10', income: 3800, expense: 1800 },
    { date: 'Jan 11', income: 5100, expense: 2200 },
    { date: 'Jan 12', income: 4600, expense: 3100 },
    { date: 'Jan 13', income: 5400, expense: 2800 },
    { date: 'Jan 14', income: 4900, expense: 1900 },
    { date: 'Jan 15', income: 5200, expense: 2600 },
  ]);

  useEffect(() => {
    // Load transactions from localStorage or API
    const loadData = () => {
      try {
        const stored = localStorage.getItem(`transactions_${business?.id}`);
        if (stored) {
          setTransactions(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Error loading transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [business?.id]);

  // Calculate statistics
  const thisMonthStart = new Date();
  thisMonthStart.setDate(1);
  thisMonthStart.setHours(0, 0, 0, 0);

  const thisMonthTransactions = transactions.filter(
    t => new Date(t.date) >= thisMonthStart && t.status === 'confirmed'
  );

  const moneyIn = thisMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const moneyOut = thisMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const profit = moneyIn - moneyOut;
  const profitMargin = moneyIn > 0 ? (profit / moneyIn) * 100 : 0;

  const stats: QuickStat[] = [
    {
      label: 'Money In',
      value: `${business?.currency} ${moneyIn.toLocaleString()}`,
      change: '+12%',
      trend: 'up',
      icon: ArrowUpRight,
      color: 'text-green-600'
    },
    {
      label: 'Money Out',
      value: `${business?.currency} ${moneyOut.toLocaleString()}`,
      change: '-5%',
      trend: 'down',
      icon: ArrowDownRight,
      color: 'text-red-600'
    },
    {
      label: 'Profit',
      value: `${business?.currency} ${profit.toLocaleString()}`,
      change: `${profitMargin.toFixed(0)}% margin`,
      trend: profit >= 0 ? 'up' : 'down',
      icon: DollarSign,
      color: profit >= 0 ? 'text-blue-600' : 'text-orange-600'
    }
  ];

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const QuickActionButton = ({ 
    icon: Icon, 
    label, 
    onClick, 
    variant = 'default' 
  }: { 
    icon: React.ElementType; 
    label: string; 
    onClick: () => void;
    variant?: 'default' | 'outline';
  }) => (
    <Button
      onClick={onClick}
      variant={variant}
      className="flex flex-col items-center justify-center h-24 gap-2"
    >
      <Icon className="w-6 h-6" />
      <span className="text-sm">{label}</span>
    </Button>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Business Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold flex items-center gap-2">
            <span className="text-2xl">{business?.countryCode === 'KE' ? '🇰🇪' : business?.countryCode === 'TZ' ? '🇹🇿' : business?.countryCode === 'UG' ? '🇺🇬' : business?.countryCode === 'RW' ? '🇷🇼' : '🇧🇮'}</span>
            {business?.name}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <CheckCircle className="w-3 h-3 text-green-600" />
            <span className="text-xs">Synced 2 min ago</span>
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
          
          return (
            <Card key={index} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="mt-2 font-bold">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendIcon className={`w-4 h-4 ${stat.color}`} />
                    <span className={`text-sm ${stat.color}`}>{stat.change}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg bg-gray-50`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Profit Summary */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">This Month</h3>
            <p className="text-sm text-muted-foreground">January 2026</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Profit Margin</p>
            <p className="font-bold text-blue-600">{profitMargin.toFixed(0)}%</p>
          </div>
        </div>
        
        {/* Profit Bar */}
        <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all"
            style={{ width: `${Math.min(profitMargin, 100)}%` }}
          />
        </div>
      </Card>

      {/* 7-Day Trend Chart */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">7-Day Trend</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              stroke="#888"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#888"
            />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="income" 
              stroke="#10b981" 
              strokeWidth={2}
              dot={{ fill: '#10b981', r: 4 }}
              name="Money In"
            />
            <Line 
              type="monotone" 
              dataKey="expense" 
              stroke="#ef4444" 
              strokeWidth={2}
              dot={{ fill: '#ef4444', r: 4 }}
              name="Money Out"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Quick Actions */}
      <div>
        <h3 className="font-semibold mb-3">Quick Actions</h3>
        <div className="grid grid-cols-3 gap-3">
          <QuickActionButton
            icon={ArrowUpRight}
            label="Record Sale"
            onClick={openIncomeModal}
          />
          <QuickActionButton
            icon={ArrowDownRight}
            label="Add Expense"
            onClick={openExpenseModal}
            variant="outline"
          />
          <QuickActionButton
            icon={FileText}
            label="New Invoice"
            onClick={openInvoiceModal}
            variant="outline"
          />
          <QuickActionButton
            icon={Users}
            label="Payroll"
            onClick={openPayrollModal}
            variant="outline"
          />
          <QuickActionButton
            icon={Package}
            label="Inventory"
            onClick={openInventoryModal}
            variant="outline"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Recent Activity</h3>
          <Button variant="ghost" size="sm">View All</Button>
        </div>
        
        <div className="space-y-3">
          {recentTransactions.length === 0 ? (
            <Card className="p-8 text-center">
              <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">No transactions yet</p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Transaction
              </Button>
            </Card>
          ) : (
            recentTransactions.map((transaction) => {
              const isIncome = transaction.type === 'income';
              const Icon = isIncome ? ArrowUpRight : ArrowDownRight;
              
              return (
                <Card key={transaction.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isIncome ? 'bg-green-50' : 'bg-red-50'}`}>
                        <Icon className={`w-5 h-5 ${isIncome ? 'text-green-600' : 'text-red-600'}`} />
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(transaction.date), 'MMM d, yyyy • h:mm a')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                        {isIncome ? '+' : '-'}{business?.currency} {transaction.amount.toLocaleString()}
                      </p>
                      {transaction.reference && (
                        <p className="text-xs text-muted-foreground">{transaction.reference}</p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Tax Reminders */}
      <Card className="p-4 border-orange-200 bg-orange-50">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-orange-900">VAT Return Due: January 20</p>
            <p className="text-sm text-orange-700 mt-1">
              You have 5 days left to file your VAT return
            </p>
            <Button variant="outline" size="sm" className="mt-3 border-orange-300 hover:bg-orange-100">
              View VAT Summary
            </Button>
          </div>
        </div>
      </Card>

      {/* Transaction Form Modal */}
      <TransactionFormModal
        open={activeModal === 'income' || activeModal === 'expense'}
        onOpenChange={(open) => !open && closeModal()}
        onSuccess={handleTransactionSuccess}
      />

      {/* Invoice Form Modal */}
      <InvoiceFormModal open={activeModal === 'invoice'} onClose={closeModal} />

      {/* Payroll Form Modal */}
      <PayrollFormModal open={activeModal === 'payroll'} onClose={closeModal} />

      {/* Inventory Form Modal */}
      <InventoryFormModal open={activeModal === 'inventory'} onClose={closeModal} />
    </div>
  );
}