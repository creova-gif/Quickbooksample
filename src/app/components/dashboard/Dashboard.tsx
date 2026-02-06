import React, { useState } from 'react';
import { DashboardHeader } from './DashboardHeader';
import { DashboardOverview } from './DashboardOverview';
import { TransactionList } from './TransactionList';
import { InvoiceManager } from '../invoices/InvoiceManager';
import { Reports } from '../reports/Reports';
import { Settings } from './Settings';
import { 
  LayoutDashboard, 
  FileText, 
  Receipt, 
  BarChart3, 
  Settings as SettingsIcon 
} from 'lucide-react';

type View = 'overview' | 'transactions' | 'invoices' | 'reports' | 'settings';

interface MenuItem {
  id: View;
  label: string;
  icon: React.ElementType;
}

const menuItems: MenuItem[] = [
  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: Receipt },
  { id: 'invoices', label: 'Invoices', icon: FileText },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

export function Dashboard() {
  const [currentView, setCurrentView] = useState<View>('overview');

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="hidden md:block w-64 bg-white border-r min-h-[calc(100vh-64px)]">
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
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
                  <span className="text-xs">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
          {currentView === 'overview' && <DashboardOverview />}
          {currentView === 'transactions' && <TransactionList />}
          {currentView === 'invoices' && <InvoiceManager />}
          {currentView === 'reports' && <Reports />}
          {currentView === 'settings' && <Settings />}
        </main>
      </div>
    </div>
  );
}
