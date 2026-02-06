import React from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import { getCountry } from '@/lib/countries';
import { Building2, Wifi, WifiOff, Cloud } from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';

export function DashboardHeader() {
  const { business } = useBusiness();
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!business) return null;

  const country = getCountry(business.countryCode);

  return (
    <header className="bg-white border-b sticky top-0 z-40">
      <div className="px-4 md:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-6 h-6 text-blue-600" />
              <div>
                <h1 className="font-bold text-lg">{business.name}</h1>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{country.flag} {country.name}</span>
                  <span>•</span>
                  <span>{country.currencySymbol} {country.currency}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Sync Status */}
            <Badge
              variant={isOnline ? 'default' : 'secondary'}
              className="gap-1"
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3 h-3" />
                  <span className="hidden sm:inline">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3" />
                  <span className="hidden sm:inline">Offline</span>
                </>
              )}
            </Badge>

            {/* VAT Badge */}
            {business.vatRegistered && (
              <Badge variant="outline" className="hidden sm:flex">
                {country.vatName} Registered
              </Badge>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
