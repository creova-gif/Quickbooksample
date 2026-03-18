import React, { useState, useEffect } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  Plus,
  Send,
  DollarSign,
  CreditCard,
} from 'lucide-react';
import { toast } from 'sonner';

interface WalletBalance {
  currency: string;
  symbol: string;
  balance: number;
  pending: number;
  flag: string;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'payout' | 'conversion';
  amount: number;
  currency: string;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  reference?: string;
}

const initialWallets: WalletBalance[] = [
  { currency: 'USD', symbol: '$', balance: 5420.50, pending: 850.00, flag: '🇺🇸' },
  { currency: 'KES', symbol: 'KSh', balance: 145230.00, pending: 12400.00, flag: '🇰🇪' },
  { currency: 'UGX', symbol: 'USh', balance: 3654200.00, pending: 425000.00, flag: '🇺🇬' },
  { currency: 'TZS', symbol: 'TSh', balance: 8420500.00, pending: 620000.00, flag: '🇹🇿' },
  { currency: 'RWF', symbol: 'FRw', balance: 4236000.00, pending: 180000.00, flag: '🇷🇼' },
  { currency: 'EUR', symbol: '€', balance: 2150.75, pending: 320.00, flag: '🇪🇺' },
];

const mockTransactions: Transaction[] = [
  {
    id: 'TXN001',
    type: 'payout',
    amount: -425.00,
    currency: 'USD',
    description: 'Payout to Tanzania Wildlife Tours',
    status: 'completed',
    date: new Date().toISOString(),
    reference: 'BK001',
  },
  {
    id: 'TXN002',
    type: 'deposit',
    amount: 850.00,
    currency: 'USD',
    description: 'Guest payment - Serengeti Safari',
    status: 'pending',
    date: new Date().toISOString(),
    reference: 'BK003',
  },
  {
    id: 'TXN003',
    type: 'conversion',
    amount: 500.00,
    currency: 'USD',
    description: 'Converted to KES (KSh 67,500)',
    status: 'completed',
    date: new Date(Date.now() - 86400000).toISOString(),
  },
];

const exchangeRates: Record<string, number> = {
  'USD': 1.0,
  'KES': 135.0,
  'UGX': 3750.0,
  'TZS': 2520.0,
  'RWF': 1280.0,
  'EUR': 0.92,
};

export function MultiCurrencyWallet() {
  const [wallets, setWallets] = useState<WalletBalance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showConversion, setShowConversion] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [conversionFrom, setConversionFrom] = useState<string>('USD');
  const [conversionTo, setConversionTo] = useState<string>('KES');
  const [conversionAmount, setConversionAmount] = useState<string>('');

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = () => {
    const storedWallets = localStorage.getItem('wallets');
    const storedTxns = localStorage.getItem('wallet_transactions');
    
    if (storedWallets) {
      setWallets(JSON.parse(storedWallets));
    } else {
      setWallets(initialWallets);
      localStorage.setItem('wallets', JSON.stringify(initialWallets));
    }

    if (storedTxns) {
      setTransactions(JSON.parse(storedTxns));
    } else {
      setTransactions(mockTransactions);
      localStorage.setItem('wallet_transactions', JSON.stringify(mockTransactions));
    }
  };

  const handleConversion = () => {
    const amount = parseFloat(conversionAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const fromWallet = wallets.find(w => w.currency === conversionFrom);
    if (!fromWallet || fromWallet.balance < amount) {
      toast.error('Insufficient balance');
      return;
    }

    const rate = exchangeRates[conversionTo] / exchangeRates[conversionFrom];
    const convertedAmount = amount * rate;

    const updatedWallets = wallets.map(w => {
      if (w.currency === conversionFrom) {
        return { ...w, balance: w.balance - amount };
      }
      if (w.currency === conversionTo) {
        return { ...w, balance: w.balance + convertedAmount };
      }
      return w;
    });

    const newTxn: Transaction = {
      id: `TXN${Date.now()}`,
      type: 'conversion',
      amount: amount,
      currency: conversionFrom,
      description: `Converted to ${conversionTo} (${convertedAmount.toFixed(2)})`,
      status: 'completed',
      date: new Date().toISOString(),
    };

    setWallets(updatedWallets);
    setTransactions([newTxn, ...transactions]);
    localStorage.setItem('wallets', JSON.stringify(updatedWallets));
    localStorage.setItem('wallet_transactions', JSON.stringify([newTxn, ...transactions]));

    toast.success(`Converted ${amount} ${conversionFrom} to ${convertedAmount.toFixed(2)} ${conversionTo}`);
    setShowConversion(false);
    setConversionAmount('');
  };

  const getTotalInUSD = () => {
    return wallets.reduce((total, wallet) => {
      const rate = exchangeRates[wallet.currency];
      return total + (wallet.balance / rate);
    }, 0);
  };

  const getPendingInUSD = () => {
    return wallets.reduce((total, wallet) => {
      const rate = exchangeRates[wallet.currency];
      return total + (wallet.pending / rate);
    }, 0);
  };

  const getTransactionIcon = (type: string) => {
    const icons: Record<string, any> = {
      deposit: TrendingUp,
      withdrawal: TrendingDown,
      transfer: ArrowLeftRight,
      payout: Send,
      conversion: ArrowLeftRight,
    };
    return icons[type] || Wallet;
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
    };
    return (
      <Badge className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Multi-Currency Wallets</h1>
        <p className="text-gray-600">
          Manage balances, conversions, and payouts across multiple currencies
        </p>
      </div>

      {/* Total Balance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-6 col-span-1 md:col-span-2 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm opacity-90">Total Balance (USD Equivalent)</div>
              <div className="text-4xl font-bold mt-1">
                ${getTotalInUSD().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <Wallet className="w-12 h-12 opacity-80" />
          </div>
          <div className="flex items-center gap-2 text-sm opacity-90">
            <TrendingUp className="w-4 h-4" />
            <span>
              ${getPendingInUSD().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} pending
            </span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-2">
            <Button onClick={() => setShowConversion(true)} className="w-full" variant="outline">
              <ArrowLeftRight className="w-4 h-4 mr-2" />
              Convert Currency
            </Button>
            <Button onClick={() => setShowWithdraw(true)} className="w-full" variant="outline">
              <Send className="w-4 h-4 mr-2" />
              Withdraw
            </Button>
          </div>
        </Card>
      </div>

      {/* Currency Wallets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {wallets.map((wallet) => (
          <Card key={wallet.currency} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{wallet.flag}</span>
                <div>
                  <div className="font-semibold">{wallet.currency}</div>
                  <div className="text-xs text-gray-500">Available</div>
                </div>
              </div>
              <DollarSign className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-2xl font-bold mb-2">
              {wallet.symbol}{wallet.balance.toLocaleString()}
            </div>
            {wallet.pending > 0 && (
              <div className="text-sm text-gray-600">
                <span className="text-yellow-600">
                  {wallet.symbol}{wallet.pending.toLocaleString()} pending
                </span>
              </div>
            )}
            <div className="mt-3 pt-3 border-t text-xs text-gray-500">
              USD: ${(wallet.balance / exchangeRates[wallet.currency]).toLocaleString(undefined, { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Transactions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
        <div className="space-y-3">
          {transactions.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No transactions yet
            </div>
          ) : (
            transactions.map((txn) => {
              const Icon = getTransactionIcon(txn.type);
              return (
                <div
                  key={txn.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      txn.type === 'deposit' ? 'bg-green-100' :
                      txn.type === 'withdrawal' || txn.type === 'payout' ? 'bg-red-100' :
                      'bg-blue-100'
                    }`}>
                      <Icon className={`w-4 h-4 ${
                        txn.type === 'deposit' ? 'text-green-600' :
                        txn.type === 'withdrawal' || txn.type === 'payout' ? 'text-red-600' :
                        'text-blue-600'
                      }`} />
                    </div>
                    <div>
                      <div className="font-medium">{txn.description}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(txn.date).toLocaleDateString()} • {txn.id}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${
                      txn.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {txn.amount > 0 ? '+' : ''}{txn.amount} {txn.currency}
                    </div>
                    <div className="text-sm">{getStatusBadge(txn.status)}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Currency Conversion Dialog */}
      <Dialog open={showConversion} onOpenChange={setShowConversion}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convert Currency</DialogTitle>
            <DialogDescription>
              Exchange between your available wallet balances
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>From Currency</Label>
              <Select value={conversionFrom} onValueChange={setConversionFrom}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {wallets.map(w => (
                    <SelectItem key={w.currency} value={w.currency}>
                      {w.flag} {w.currency} (Balance: {w.symbol}{w.balance.toLocaleString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={conversionAmount}
                onChange={(e) => setConversionAmount(e.target.value)}
              />
            </div>

            <div>
              <Label>To Currency</Label>
              <Select value={conversionTo} onValueChange={setConversionTo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {wallets.filter(w => w.currency !== conversionFrom).map(w => (
                    <SelectItem key={w.currency} value={w.currency}>
                      {w.flag} {w.currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {conversionAmount && parseFloat(conversionAmount) > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="text-sm text-gray-600 mb-1">You will receive approximately:</div>
                <div className="text-xl font-bold text-blue-600">
                  {((parseFloat(conversionAmount) * exchangeRates[conversionTo]) / exchangeRates[conversionFrom]).toFixed(2)} {conversionTo}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Rate: 1 {conversionFrom} = {(exchangeRates[conversionTo] / exchangeRates[conversionFrom]).toFixed(4)} {conversionTo}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowConversion(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleConversion} className="flex-1">
                <ArrowLeftRight className="w-4 h-4 mr-2" />
                Convert Now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
