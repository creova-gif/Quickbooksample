/**
 * Offline Queue Service
 * Handles offline-first transaction submission and sync
 */

import { Transaction } from '@/types';

const QUEUE_KEY = 'transaction_queue';
const SYNC_STATUS_KEY = 'sync_status';

export interface QueuedTransaction extends Transaction {
  queuedAt: string;
  syncAttempts: number;
}

export type SyncStatus = 'idle' | 'syncing' | 'error';

/**
 * Save transaction to offline queue
 */
export function saveOffline(transaction: Transaction): void {
  try {
    const queue = getQueue();
    const queuedTx: QueuedTransaction = {
      ...transaction,
      status: 'draft',
      queuedAt: new Date().toISOString(),
      syncAttempts: 0,
    };
    
    queue.push(queuedTx);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    
    console.log('Transaction saved to offline queue:', transaction.id);
  } catch (error) {
    console.error('Failed to save to offline queue:', error);
  }
}

/**
 * Get all queued transactions
 */
export function getQueue(): QueuedTransaction[] {
  try {
    const stored = localStorage.getItem(QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to read queue:', error);
    return [];
  }
}

/**
 * Remove transaction from queue
 */
export function removeFromQueue(transactionId: string): void {
  try {
    const queue = getQueue();
    const filtered = queue.filter(tx => tx.id !== transactionId);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to remove from queue:', error);
  }
}

/**
 * Clear entire queue (use after successful sync)
 */
export function clearQueue(): void {
  localStorage.removeItem(QUEUE_KEY);
}

/**
 * Get queue count
 */
export function getQueueCount(): number {
  return getQueue().length;
}

/**
 * Sync all queued transactions to backend
 */
export async function syncTransactions(apiUrl: string = 'http://localhost:3000'): Promise<{
  success: number;
  failed: number;
  errors: string[];
}> {
  const queue = getQueue();
  
  if (queue.length === 0) {
    return { success: 0, failed: 0, errors: [] };
  }

  setSyncStatus('syncing');
  
  let successCount = 0;
  let failedCount = 0;
  const errors: string[] = [];

  for (const tx of queue) {
    try {
      const response = await fetch(`${apiUrl}/api/v1/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...tx,
          status: 'posted', // Mark as posted when syncing
          syncedAt: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        removeFromQueue(tx.id);
        successCount++;
      } else {
        failedCount++;
        errors.push(`Transaction ${tx.id}: ${response.statusText}`);
        
        // Update sync attempts
        updateSyncAttempts(tx.id);
      }
    } catch (error: any) {
      failedCount++;
      errors.push(`Transaction ${tx.id}: ${error.message}`);
      updateSyncAttempts(tx.id);
    }
  }

  setSyncStatus(failedCount > 0 ? 'error' : 'idle');

  return { success: successCount, failed: failedCount, errors };
}

/**
 * Update sync attempt count for a transaction
 */
function updateSyncAttempts(transactionId: string): void {
  const queue = getQueue();
  const updated = queue.map(tx => {
    if (tx.id === transactionId) {
      return { ...tx, syncAttempts: tx.syncAttempts + 1 };
    }
    return tx;
  });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(updated));
}

/**
 * Set sync status
 */
export function setSyncStatus(status: SyncStatus): void {
  localStorage.setItem(SYNC_STATUS_KEY, status);
  
  // Dispatch custom event for UI updates
  window.dispatchEvent(new CustomEvent('syncStatusChanged', { detail: status }));
}

/**
 * Get current sync status
 */
export function getSyncStatus(): SyncStatus {
  return (localStorage.getItem(SYNC_STATUS_KEY) as SyncStatus) || 'idle';
}

/**
 * Auto-sync on network reconnect
 */
export function initAutoSync(): void {
  // Sync when app loads (if online)
  if (navigator.onLine) {
    syncTransactions().catch(console.error);
  }

  // Sync when network comes back online
  window.addEventListener('online', () => {
    console.log('Network reconnected, syncing...');
    syncTransactions().catch(console.error);
  });

  // Check periodically (every 5 minutes if online)
  setInterval(() => {
    if (navigator.onLine && getQueueCount() > 0) {
      syncTransactions().catch(console.error);
    }
  }, 5 * 60 * 1000);
}

/**
 * Get sync summary for UI
 */
export function getSyncSummary(): {
  queued: number;
  status: SyncStatus;
  oldestQueued?: string;
} {
  const queue = getQueue();
  const status = getSyncStatus();
  
  const summary = {
    queued: queue.length,
    status,
  };

  if (queue.length > 0) {
    const oldest = queue.reduce((prev, curr) => 
      new Date(prev.queuedAt) < new Date(curr.queuedAt) ? prev : curr
    );
    return { ...summary, oldestQueued: oldest.queuedAt };
  }

  return summary;
}
