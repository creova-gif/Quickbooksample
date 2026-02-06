import React, { useState } from 'react';
import {
  LayoutDashboard,
  Receipt,
  TrendingUp,
  TrendingDown,
  FileText,
  BarChart3,
  Settings,
  X,
  DollarSign,
  Shield,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { cn } from '@/app/components/ui/utils';

interface SidebarProps {
  onClose?: () => void;
}

type NavItem = {
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
};

const navigation: NavItem[] = [
  { label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" />, path: 'dashboard' },
  { label: 'Income', icon: <TrendingUp className="h-5 w-5" />, path: 'income' },
  { label: 'Expenses', icon: <TrendingDown className="h-5 w-5" />, path: 'expenses' },
  { label: 'Invoices', icon: <FileText className="h-5 w-5" />, path: 'invoices', badge: 2 },
  { label: 'Payments', icon: <DollarSign className="h-5 w-5" />, path: 'payments' },
  { label: 'Reports', icon: <BarChart3 className="h-5 w-5" />, path: 'reports' },
  { label: 'Compliance', icon: <Shield className="h-5 w-5" />, path: 'compliance' },
  { label: 'Settings', icon: <Settings className="h-5 w-5" />, path: 'settings' },
];

export function Sidebar({ onClose }: SidebarProps) {
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleNavClick = (path: string) => {
    setActiveTab(path);
    onClose?.();
  };

  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-200 px-6 pb-4">
      <div className="flex h-16 shrink-0 items-center justify-between">
        <div className="flex items-center gap-2">
          <Receipt className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">EA Accounting</span>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-1">
          {navigation.map((item) => (
            <li key={item.path}>
              <button
                onClick={() => handleNavClick(item.path)}
                className={cn(
                  'group flex w-full gap-x-3 rounded-md p-3 text-sm font-medium leading-6 transition-colors',
                  activeTab === item.path
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                )}
              >
                {item.icon}
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                    {item.badge}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-gray-200 pt-4">
        <div className="rounded-lg bg-blue-50 p-4">
          <p className="text-xs font-medium text-blue-900">Need Help?</p>
          <p className="mt-1 text-xs text-blue-700">
            Check our documentation or contact support
          </p>
          <Button variant="link" className="mt-2 h-auto p-0 text-xs text-blue-600">
            View Docs →
          </Button>
        </div>
      </div>
    </div>
  );
}
