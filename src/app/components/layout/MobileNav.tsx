import React, { useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Plus,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { cn } from '@/app/components/ui/utils';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/app/components/ui/sheet';

export function MobileNav() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showQuickActions, setShowQuickActions] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'add', label: '', icon: Plus, isAction: true },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'income', label: 'Income', icon: TrendingUp },
  ];

  const handleNavClick = (id: string) => {
    if (id === 'add') {
      setShowQuickActions(true);
    } else {
      setActiveTab(id);
    }
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white shadow-lg">
        <div className="grid grid-cols-5 h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            if (item.isAction) {
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className="flex flex-col items-center justify-center relative"
                >
                  <div className="absolute -top-6 flex items-center justify-center w-14 h-14 bg-blue-600 rounded-full shadow-lg">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 transition-colors',
                  isActive ? 'text-blue-600' : 'text-gray-600'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Actions Sheet */}
      <Sheet open={showQuickActions} onOpenChange={setShowQuickActions}>
        <SheetContent side="bottom" className="h-auto">
          <SheetHeader>
            <SheetTitle>Quick Actions</SheetTitle>
            <SheetDescription>
              Create new transactions or invoices
            </SheetDescription>
          </SheetHeader>
          <div className="grid grid-cols-2 gap-3 mt-6 mb-4">
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => setShowQuickActions(false)}
            >
              <TrendingUp className="h-6 w-6 text-green-600" />
              <span>Add Income</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => setShowQuickActions(false)}
            >
              <TrendingUp className="h-6 w-6 text-red-600 rotate-180" />
              <span>Add Expense</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => setShowQuickActions(false)}
            >
              <FileText className="h-6 w-6 text-blue-600" />
              <span>New Invoice</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => setShowQuickActions(false)}
            >
              <FileText className="h-6 w-6 text-purple-600" />
              <span>Record Payment</span>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
