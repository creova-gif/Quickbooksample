import React, { useState, useMemo } from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/app/components/ui/sheet';
import {
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Search,
  Calendar,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle,
} from 'lucide-react';
import { Transaction } from '@/types';
import { format } from 'date-fns';

type FilterType = 'all' | 'income' | 'expense';

export function MobileTransactionList() {
  const { business, transactions, deleteTransaction } = useBusiness();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(transactions.map(t => t.categoryId));
    return Array.from(cats);
  }, [transactions]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // Type filter
      if (filterType !== 'all' && transaction.type !== filterType) {
        return false;
      }

      // Category filter
      if (filterCategory !== 'all' && transaction.categoryId !== filterCategory) {
        return false;
      }

      // Search filter
      if (searchQuery && !transaction.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filterType, filterCategory, searchQuery]);

  // Calculate totals
  const totals = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return { income, expense, net: income - expense };
  }, [filteredTransactions]);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      deleteTransaction(id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Search and Filter */}
      <div className="space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Bar */}
        <div className="flex gap-2">
          {/* Type Filter Pills */}
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            <Button
              variant={filterType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('all')}
            >
              All
            </Button>
            <Button
              variant={filterType === 'income' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('income')}
              className={filterType === 'income' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              <ArrowUpRight className="w-3 h-3 mr-1" />
              Income
            </Button>
            <Button
              variant={filterType === 'expense' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('expense')}
              className={filterType === 'expense' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              <ArrowDownRight className="w-3 h-3 mr-1" />
              Expense
            </Button>
          </div>

          {/* More Filters Sheet */}
          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="shrink-0">
                <Filter className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[400px]">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>Refine your transaction list</SheetDescription>
              </SheetHeader>
              <div className="space-y-4 mt-6">
                {/* Category Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setFilterType('all');
                      setFilterCategory('all');
                      setSearchQuery('');
                    }}
                  >
                    Clear All
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => setShowFilters(false)}
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="p-3">
          <p className="text-xs text-muted-foreground mb-1">Income</p>
          <p className="text-sm font-bold text-green-600">
            {business?.currency} {totals.income.toLocaleString()}
          </p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground mb-1">Expense</p>
          <p className="text-sm font-bold text-red-600">
            {business?.currency} {totals.expense.toLocaleString()}
          </p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground mb-1">Net</p>
          <p className={`text-sm font-bold ${totals.net >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
            {business?.currency} {totals.net.toLocaleString()}
          </p>
        </Card>
      </div>

      {/* Transaction List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-muted-foreground">
            {filteredTransactions.length} Transactions
          </h3>
        </div>

        {filteredTransactions.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-2">No transactions found</p>
            <p className="text-sm text-muted-foreground">
              {searchQuery || filterType !== 'all' || filterCategory !== 'all'
                ? 'Try adjusting your filters'
                : 'Start by recording your first transaction'}
            </p>
          </Card>
        ) : (
          filteredTransactions.map((transaction) => {
            const isIncome = transaction.type === 'income';
            const Icon = isIncome ? ArrowUpRight : ArrowDownRight;

            return (
              <Card key={transaction.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  {/* Icon and Details */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-lg shrink-0 ${isIncome ? 'bg-green-50' : 'bg-red-50'}`}>
                      <Icon className={`w-4 h-4 ${isIncome ? 'text-green-600' : 'text-red-600'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{transaction.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {transaction.categoryId}
                            </Badge>
                            {transaction.status === 'confirmed' && (
                              <CheckCircle className="w-3 h-3 text-green-600" />
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>{format(new Date(transaction.date), 'MMM d, yyyy')}</span>
                        {transaction.reference && (
                          <>
                            <span>•</span>
                            <span className="truncate">{transaction.reference}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Amount and Actions */}
                  <div className="text-right shrink-0">
                    <p className={`font-bold text-sm ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                      {isIncome ? '+' : '-'}{business?.currency} {transaction.amount.toLocaleString()}
                    </p>
                    
                    {/* Actions Menu */}
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 mt-1">
                          <MoreVertical className="w-3 h-3" />
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="bottom" className="h-auto">
                        <SheetHeader>
                          <SheetTitle>Transaction Actions</SheetTitle>
                          <SheetDescription>
                            {business?.currency} {transaction.amount.toLocaleString()} • {transaction.description}
                          </SheetDescription>
                        </SheetHeader>
                        <div className="space-y-2 mt-4">
                          <Button variant="outline" className="w-full justify-start">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Transaction
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(transaction.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Transaction
                          </Button>
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
