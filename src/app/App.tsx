/**
 * EAST AFRICA ACCOUNTING PLATFORM
 * ================================
 * 
 * A comprehensive, QuickBooks-level accounting platform built for East Africa.
 * 
 * KEY FEATURES:
 * - Multi-country support (Kenya, Tanzania, Uganda, Rwanda, Burundi)
 * - Country-specific tax rules and compliance (TIMS, VFD, EFRIS, EBM)
 * - Invoice creation with automatic VAT calculation
 * - Transaction management (income & expenses)
 * - Financial reports (P&L, Tax Summary, Charts)
 * - Offline-first with localStorage
 * - Mobile-responsive design
 * 
 * ARCHITECTURE:
 * - /src/types - TypeScript interfaces (Business, Invoice, Transaction, etc.)
 * - /src/lib/countries - Country configurations & pluggable compliance adapters
 * - /src/lib/accounting - Double-entry accounting engine
 * - /src/lib/storage - Offline-first localStorage wrapper
 * - /src/contexts - React Context for global business state
 * - /src/app/components - UI components (Dashboard, Invoices, Reports, etc.)
 * 
 * COUNTRY COMPLIANCE:
 * Each country has specific VAT rates, tax fields, and e-invoicing systems.
 * The platform dynamically adapts based on the selected country.
 */

import React from 'react';
import { BusinessProvider, useBusiness } from '@/contexts/BusinessContext';
import { OnboardingWizard } from '@/app/components/onboarding/OnboardingWizard';
import { EnhancedDashboard } from '@/app/components/dashboard/EnhancedDashboard';
import { Toaster } from 'sonner';

function AppContent() {
  const { business, isLoading } = useBusiness();
  const [showOnboarding, setShowOnboarding] = React.useState(!business);

  React.useEffect(() => {
    setShowOnboarding(!business);
  }, [business]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (showOnboarding) {
    return <OnboardingWizard onComplete={() => setShowOnboarding(false)} />;
  }

  return <EnhancedDashboard />;
}

export default function App() {
  return (
    <BusinessProvider>
      <AppContent />
    </BusinessProvider>
  );
}