/**
 * Tax Sync Queue Modal
 * View and manage pending tax authority submissions
 * Supports manual retry and queue monitoring
 */

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Card } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Loader2,
  FileText,
  Receipt
} from 'lucide-react';
import { TaxSyncQueue } from '@/types';
import { 
  getQueueSummary, 
  getFailedItems, 
  retryFailedItem, 
  clearSyncedItems,
  processSyncQueue 
} from '@/services/taxsync.service';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function TaxSyncQueueModal({ open, onClose }: Props) {
  const [queue, setQueue] = useState<TaxSyncQueue[]>([]);
  const [summary, setSummary] = useState({
    pending: 0,
    synced: 0,
    failed: 0,
    byAuthority: {} as Record<string, number>,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'failed'>('pending');

  useEffect(() => {
    if (open) {
      loadQueue();
    }
  }, [open]);

  const loadQueue = () => {
    setIsLoading(true);
    try {
      const stored = localStorage.getItem('tax_sync_queue');
      const queueData: TaxSyncQueue[] = stored ? JSON.parse(stored) : [];
      setQueue(queueData);
      
      const queueSummary = getQueueSummary();
      setSummary(queueSummary);
    } catch (error) {
      console.error('Failed to load queue:', error);
      toast.error('Failed to load tax sync queue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncAll = async () => {
    setIsSyncing(true);
    try {
      const result = await processSyncQueue();
      
      toast.success(
        `Synced ${result.succeeded} items. ${result.failed} failed.`,
        { duration: 5000 }
      );
      
      loadQueue();
    } catch (error: any) {
      console.error('Sync failed:', error);
      toast.error('Failed to sync queue');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRetry = async (itemId: string) => {
    try {
      await retryFailedItem(itemId);
      toast.success('Retry initiated');
      loadQueue();
    } catch (error: any) {
      console.error('Retry failed:', error);
      toast.error(error.message || 'Failed to retry');
    }
  };

  const handleClearSynced = () => {
    try {
      const removed = clearSyncedItems();
      toast.success(`Cleared ${removed} synced items`);
      loadQueue();
    } catch (error) {
      console.error('Clear failed:', error);
      toast.error('Failed to clear synced items');
    }
  };

  const getStatusBadge = (status: TaxSyncQueue['status']) => {
    const variants = {
      pending: { variant: 'secondary' as const, icon: Clock, color: 'text-yellow-600' },
      synced: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      failed: { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' },
    };
    
    const config = variants[status];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className={`w-3 h-3 ${config.color}`} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getAuthorityBadge = (authority: string) => {
    const colors: Record<string, string> = {
      TIMS: 'bg-blue-100 text-blue-800',
      EFRIS: 'bg-green-100 text-green-800',
      VFD: 'bg-purple-100 text-purple-800',
      EBM: 'bg-orange-100 text-orange-800',
      Generic: 'bg-gray-100 text-gray-800',
    };
    
    return (
      <Badge className={colors[authority] || colors.Generic}>
        {authority}
      </Badge>
    );
  };

  const filteredQueue = queue.filter(item => {
    if (activeTab === 'pending') return item.status === 'pending';
    if (activeTab === 'failed') return item.status === 'failed';
    return true;
  });

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Tax Sync Queue
          </DialogTitle>
          <DialogDescription>
            Monitor and manage pending tax authority submissions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{summary.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Synced</p>
                  <p className="text-2xl font-bold text-green-600">{summary.synced}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{summary.failed}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                onClick={handleSyncAll}
                disabled={isSyncing || summary.pending === 0}
                size="sm"
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync All Pending
                  </>
                )}
              </Button>

              <Button
                onClick={handleClearSynced}
                disabled={summary.synced === 0}
                variant="outline"
                size="sm"
              >
                Clear Synced
              </Button>
            </div>

            <Button onClick={loadQueue} variant="ghost" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending">
                Pending ({summary.pending})
              </TabsTrigger>
              <TabsTrigger value="failed">
                Failed ({summary.failed})
              </TabsTrigger>
              <TabsTrigger value="all">
                All ({queue.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4 space-y-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredQueue.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    {activeTab === 'pending' && 'No pending items'}
                    {activeTab === 'failed' && 'No failed items'}
                    {activeTab === 'all' && 'Queue is empty'}
                  </p>
                </div>
              ) : (
                filteredQueue.map((item) => {
                  const Icon = item.entityType === 'invoice' ? FileText : Receipt;
                  
                  return (
                    <Card key={item.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="p-2 bg-gray-100 rounded">
                            <Icon className="w-5 h-5" />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="font-medium capitalize">{item.entityType}</p>
                              {getStatusBadge(item.status)}
                              {getAuthorityBadge(item.authority)}
                            </div>

                            <div className="space-y-1 text-sm">
                              <p className="text-muted-foreground">
                                Entity ID: <span className="font-mono text-xs">{item.entityId}</span>
                              </p>

                              <p className="text-muted-foreground">
                                Created: {format(new Date(item.createdAt), 'MMM d, yyyy • h:mm a')}
                              </p>

                              {item.lastAttempt && (
                                <p className="text-muted-foreground">
                                  Last Attempt: {format(new Date(item.lastAttempt), 'MMM d, yyyy • h:mm a')}
                                </p>
                              )}

                              {item.retries > 0 && (
                                <p className="text-orange-600">
                                  <AlertTriangle className="w-3 h-3 inline mr-1" />
                                  Retries: {item.retries}/5
                                </p>
                              )}

                              {item.errorMessage && (
                                <p className="text-red-600 text-xs mt-1">
                                  Error: {item.errorMessage}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        {item.status === 'failed' && (
                          <Button
                            onClick={() => handleRetry(item.id)}
                            size="sm"
                            variant="outline"
                          >
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Retry
                          </Button>
                        )}
                      </div>
                    </Card>
                  );
                })
              )}
            </TabsContent>
          </Tabs>

          {/* Close Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
