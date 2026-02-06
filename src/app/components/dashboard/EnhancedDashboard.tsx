import React, { useState } from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import { EnhancedDashboardComplete } from './EnhancedDashboardComplete';
import { MobileTransactionList } from '../transactions/MobileTransactionList';
import { InvoiceManager } from '../invoices/InvoiceManager';
import { Reports } from '../reports/Reports';
import { Settings } from './Settings';
import { ReceiptOCR } from '../receipts/ReceiptOCR';
import { SalesConfigurator } from '../sales/SalesConfigurator'; // Admin only
import { ProposalRequestForm } from '../proposals/ProposalRequestForm'; // Customer facing
import { ProposalManagement } from '../proposals/ProposalManagement'; // Admin only
import { TransactionFormModal } from '../transactions/TransactionFormModal';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import {
  Home,
  Receipt,
  FileText,
  BarChart3,
  Settings as SettingsIcon,
  Menu,
  Bell,
  Plus,
  LogOut,
  User,
  CheckCircle,
  Camera,
  TrendingUp, // Admin: Sales Configurator
  Send, // Customer: Request Quote
  Inbox, // Admin: View Proposals
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/app/components/ui/sheet';

type View = 'dashboard' | 'transactions' | 'invoices' | 'reports' | 'receipts' | 'settings' | 'sales' | 'proposals'; // NEW: Added 'sales' and 'proposals'

interface MenuItem {
  id: View;
  label: string;
  icon: React.ElementType;
  mobileLabel?: string;
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, mobileLabel: 'Home' },
  { id: 'transactions', label: 'Transactions', icon: Receipt, mobileLabel: 'Money' },
  { id: 'invoices', label: 'Invoices', icon: FileText },
  { id: 'receipts', label: 'Receipts', icon: Camera, mobileLabel: 'Scan' },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'sales', label: 'Sales Tool', icon: TrendingUp, mobileLabel: 'Sales' }, // NEW: AI Sales Configurator
  { id: 'proposals', label: 'Proposals', icon: Inbox, mobileLabel: 'Proposals' }, // NEW: Proposals
  { id: 'settings', label: 'Settings', icon: SettingsIcon, mobileLabel: 'More' },
];

export function EnhancedDashboard() {
  const { business, clearBusiness } = useBusiness();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      clearBusiness();
      window.location.reload();
    }
  };

  const handleTransactionSuccess = () => {
    // Refresh the current view
    setCurrentView(currentView);
  };

  const getCountryFlag = (countryCode: string) => {
    const flags: Record<string, string> = {
      'KE': '🇰🇪',
      'TZ': '🇹🇿',
      'UG': '🇺🇬',
      'RW': '🇷🇼',
      'BI': '🇧🇮',
    };
    return flags[countryCode] || '🌍';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left: Logo & Business */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">{getCountryFlag(business?.countryCode || '')}</span>
                <h1 className="font-bold text-lg hidden sm:block">{business?.name}</h1>
              </div>
              <Badge variant="outline" className="gap-1 text-xs hidden sm:flex">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span>Online</span>
              </Badge>
            </div>
          </div>

          {/* Right: Actions & Profile */}
          <div className="flex items-center gap-2">
            {/* Add Transaction Button */}
            <Button
              onClick={() => setShowTransactionModal(true)}
              className="hidden sm:flex"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Transaction
            </Button>
            <Button
              onClick={() => setShowTransactionModal(true)}
              size="icon"
              className="sm:hidden"
            >
              <Plus className="w-5 h-5" />
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                1
              </span>
            </Button>

            {/* Profile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{business?.name}</p>
                    <p className="text-xs text-muted-foreground">{business?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setCurrentView('settings')}>
                  <SettingsIcon className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation (Desktop) */}
        <aside
          className={`fixed md:sticky top-[57px] left-0 h-[calc(100vh-57px)] w-64 bg-white border-r z-30 transition-transform md:translate-x-0 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Overlay for mobile menu */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 max-w-7xl mx-auto w-full">
          {currentView === 'dashboard' && <EnhancedDashboardComplete />}
          {currentView === 'transactions' && <MobileTransactionList />}
          {currentView === 'invoices' && <InvoiceManager />}
          {currentView === 'reports' && <Reports />}
          {currentView === 'receipts' && <ReceiptOCR />}
          {currentView === 'settings' && <Settings />}
          {currentView === 'sales' && <SalesConfigurator />}
          {currentView === 'proposals' && <ProposalManagement />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50">
        <div className="flex justify-around">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex flex-col items-center gap-1 py-3 px-4 flex-1 ${
                  isActive ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{item.mobileLabel || item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Transaction Form Modal */}
      <TransactionFormModal
        open={showTransactionModal}
        onOpenChange={setShowTransactionModal}
        onSuccess={handleTransactionSuccess}
      />
    </div>
  );
}