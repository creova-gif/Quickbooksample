/**
 * License Context
 * Manages license-based feature gating
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface License {
  modules: string[]; // ['accounting', 'invoicing', 'tax', 'payroll', 'inventory']
  userLimit: number;
  deployment: 'cloud' | 'private' | 'onprem';
  tier: 'starter' | 'professional' | 'enterprise';
  expires: string; // ISO date
  features: {
    offlineMode: boolean;
    apiAccess: boolean;
    multiCurrency: boolean;
    advancedReporting: boolean;
  };
}

interface LicenseContextType {
  license: License | null;
  hasModule: (module: string) => boolean;
  hasFeature: (feature: keyof License['features']) => boolean;
  isExpired: () => boolean;
  loading: boolean;
}

const LicenseContext = createContext<LicenseContextType | undefined>(undefined);

export function LicenseProvider({ children }: { children: React.ReactNode }) {
  const [license, setLicense] = useState<License | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLicense();
  }, []);

  const loadLicense = async () => {
    try {
      // Try to load from API
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      try {
        const response = await fetch(`${API_URL}/api/v1/license`);
        if (response.ok) {
          const data = await response.json();
          setLicense(data);
          localStorage.setItem('license', JSON.stringify(data));
          return;
        }
      } catch (apiError) {
        console.log('API failed, using cached or default license');
      }

      // Fallback to localStorage
      const stored = localStorage.getItem('license');
      if (stored) {
        setLicense(JSON.parse(stored));
        return;
      }

      // Default trial license
      const trialLicense: License = {
        modules: ['accounting', 'invoicing', 'tax'],
        userLimit: 5,
        deployment: 'cloud',
        tier: 'starter',
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        features: {
          offlineMode: true,
          apiAccess: false,
          multiCurrency: false,
          advancedReporting: false,
        },
      };
      
      setLicense(trialLicense);
      localStorage.setItem('license', JSON.stringify(trialLicense));
    } catch (error) {
      console.error('Failed to load license:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasModule = (module: string): boolean => {
    return license?.modules.includes(module) || false;
  };

  const hasFeature = (feature: keyof License['features']): boolean => {
    return license?.features[feature] || false;
  };

  const isExpired = (): boolean => {
    if (!license) return true;
    return new Date(license.expires) < new Date();
  };

  const value: LicenseContextType = {
    license,
    hasModule,
    hasFeature,
    isExpired,
    loading,
  };

  return (
    <LicenseContext.Provider value={value}>
      {children}
    </LicenseContext.Provider>
  );
}

export function useLicense() {
  const context = useContext(LicenseContext);
  if (context === undefined) {
    throw new Error('useLicense must be used within a LicenseProvider');
  }
  return context;
}
