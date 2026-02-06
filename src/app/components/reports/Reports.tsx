import React, { useState } from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import { formatCurrency, getCountry } from '@/lib/countries';
import { calculateFinancialSummary, calculateTaxSummary } from '@/lib/accounting';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Download, FileText, TrendingUp, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export function Reports() {
  const { business, transactions, invoices, categories } = useBusiness();
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });

  if (!business) return null;

  const country = getCountry(business.countryCode);
  const financialSummary = calculateFinancialSummary(transactions);
  const taxSummary = calculateTaxSummary(transactions, invoices);

  // Group transactions by category for charts
  const expensesByCategory = categories
    .filter(c => c.type === 'expense')
    .map(cat => ({
      name: cat.name,
      value: transactions
        .filter(t => t.categoryId === cat.id && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0),
      color: cat.color || '#94a3b8',
    }))
    .filter(item => item.value > 0);

  const incomeByCategory = categories
    .filter(c => c.type === 'income')
    .map(cat => ({
      name: cat.name,
      value: transactions
        .filter(t => t.categoryId === cat.id && t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0),
      color: cat.color || '#3b82f6',
    }))
    .filter(item => item.value > 0);

  // Monthly trends (last 6 months)
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const monthName = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    const month = date.getMonth();

    const monthTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === month && tDate.getFullYear() === year;
    });

    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      name: monthName,
      income,
      expenses,
      profit: income - expenses,
    };
  });

  const handleExport = (reportType: string) => {
    alert(`Export ${reportType} would download a PDF/CSV file`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Financial Reports</h2>
          <p className="text-muted-foreground">
            Analyze your business performance
          </p>
        </div>
      </div>

      {/* Date Range Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label>From Date</Label>
              <Input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label>To Date</Label>
              <Input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              />
            </div>
            <Button variant="outline">Apply Filter</Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="profit-loss" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profit-loss">Profit & Loss</TabsTrigger>
          <TabsTrigger value="tax">Tax Summary</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
        </TabsList>

        {/* Profit & Loss Report */}
        <TabsContent value="profit-loss" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Profit & Loss Statement</CardTitle>
                <Button variant="outline" size="sm" onClick={() => handleExport('P&L')} className="gap-2">
                  <Download className="w-4 h-4" />
                  Export PDF
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                {new Date(dateRange.from).toLocaleDateString('en-GB')} to {new Date(dateRange.to).toLocaleDateString('en-GB')}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Revenue Section */}
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Revenue
                </h3>
                <div className="space-y-2 ml-7">
                  {incomeByCategory.map((cat) => (
                    <div key={cat.name} className="flex justify-between">
                      <span className="text-muted-foreground">{cat.name}</span>
                      <span className="font-semibold">{formatCurrency(cat.value, business.countryCode)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 border-t font-bold">
                    <span>Total Revenue</span>
                    <span className="text-green-600">{formatCurrency(financialSummary.totalIncome, business.countryCode)}</span>
                  </div>
                </div>
              </div>

              {/* Expenses Section */}
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-red-600" />
                  Expenses
                </h3>
                <div className="space-y-2 ml-7">
                  {expensesByCategory.map((cat) => (
                    <div key={cat.name} className="flex justify-between">
                      <span className="text-muted-foreground">{cat.name}</span>
                      <span className="font-semibold">{formatCurrency(cat.value, business.countryCode)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 border-t font-bold">
                    <span>Total Expenses</span>
                    <span className="text-red-600">{formatCurrency(financialSummary.totalExpenses, business.countryCode)}</span>
                  </div>
                </div>
              </div>

              {/* Net Profit */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg">Net Profit</h3>
                    <p className="text-sm text-muted-foreground">
                      Profit Margin: {financialSummary.profitMargin.toFixed(1)}%
                    </p>
                  </div>
                  <div className={`text-3xl font-bold ${
                    financialSummary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(financialSummary.netProfit, business.countryCode)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax Summary Report */}
        <TabsContent value="tax" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{country.vatName} Summary</CardTitle>
                <Button variant="outline" size="sm" onClick={() => handleExport('Tax')} className="gap-2">
                  <Download className="w-4 h-4" />
                  Export for Filing
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Tax Period: {new Date(dateRange.from).toLocaleDateString('en-GB')} to {new Date(dateRange.to).toLocaleDateString('en-GB')}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Sales & {country.vatName} Collected</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Sales (incl. {country.vatName})</span>
                      <span className="font-semibold">{formatCurrency(taxSummary.totalSalesWithVat, business.countryCode)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{country.vatName} Collected</span>
                      <span className="font-semibold text-green-600">{formatCurrency(taxSummary.vatCollected, business.countryCode)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Purchases & {country.vatName} Paid</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Purchases (incl. {country.vatName})</span>
                      <span className="font-semibold">{formatCurrency(taxSummary.totalPurchasesWithVat, business.countryCode)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{country.vatName} Paid</span>
                      <span className="font-semibold text-blue-600">{formatCurrency(taxSummary.vatPaid, business.countryCode)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg">Net {country.vatName} Payable</h3>
                    <p className="text-sm text-muted-foreground">
                      Amount to pay to tax authority
                    </p>
                  </div>
                  <div className="text-3xl font-bold text-amber-600">
                    {formatCurrency(taxSummary.netVatPayable, business.countryCode)}
                  </div>
                </div>
              </div>

              {country.complianceSystem && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-900">
                      <p className="font-semibold mb-1">Filing Information</p>
                      <p>
                        This report is formatted for <strong>{country.complianceSystem}</strong>.
                        In production, you would export this data directly to the tax authority system.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Charts */}
        <TabsContent value="charts" className="space-y-4">
          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <CardTitle>6-Month Income & Expense Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number, business.countryCode)} />
                  <Legend />
                  <Bar dataKey="income" fill="#10b981" name="Income" />
                  <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Expense Breakdown */}
          {expensesByCategory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Expenses by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={expensesByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => entry.name}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {expensesByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value as number, business.countryCode)} />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="space-y-3">
                    {expensesByCategory.map((cat) => (
                      <div key={cat.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded" style={{ backgroundColor: cat.color }} />
                          <span>{cat.name}</span>
                        </div>
                        <span className="font-semibold">{formatCurrency(cat.value, business.countryCode)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
