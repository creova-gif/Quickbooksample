import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, CloudUpload } from 'lucide-react';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Button } from '@/app/components/ui/button';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSync, setPendingSync] = useState(0);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowAlert(true);
      // Auto-hide after 3 seconds
      setTimeout(() => setShowAlert(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowAlert(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check for pending sync items
    const checkPendingSync = () => {
      try {
        const pending = localStorage.getItem('pending_sync');
        if (pending) {
          const items = JSON.parse(pending);
          setPendingSync(items.length || 0);
        }
      } catch (error) {
        console.error('Error checking pending sync:', error);
      }
    };

    checkPendingSync();
    const interval = setInterval(checkPendingSync, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  if (!showAlert && isOnline && pendingSync === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 lg:bottom-4 lg:left-auto lg:right-4 lg:w-96">
      {!isOnline && (
        <Alert variant="destructive" className="shadow-lg">
          <WifiOff className="h-4 w-4" />
          <AlertDescription className="ml-2">
            You're offline. Changes will sync when you're back online.
            {pendingSync > 0 && (
              <span className="block mt-1 text-sm">
                {pendingSync} {pendingSync === 1 ? 'change' : 'changes'} pending
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {isOnline && pendingSync > 0 && (
        <Alert className="shadow-lg border-blue-200 bg-blue-50">
          <CloudUpload className="h-4 w-4 text-blue-600" />
          <AlertDescription className="ml-2 flex items-center justify-between">
            <span className="text-blue-900">
              {pendingSync} {pendingSync === 1 ? 'change' : 'changes'} ready to sync
            </span>
            <Button
              size="sm"
              variant="ghost"
              className="h-auto p-0 text-blue-600 hover:text-blue-800"
            >
              Sync Now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {isOnline && pendingSync === 0 && showAlert && (
        <Alert className="shadow-lg border-green-200 bg-green-50">
          <Wifi className="h-4 w-4 text-green-600" />
          <AlertDescription className="ml-2 text-green-900">
            Back online! All changes synced.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
