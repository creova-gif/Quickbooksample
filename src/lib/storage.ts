// Offline-first localStorage wrapper with encryption consideration
// In production, add encryption layer for sensitive data

const STORAGE_PREFIX = 'eaaccounting_';

export class Storage {
  static set<T>(key: string, value: T): void {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(STORAGE_PREFIX + key, serialized);
    } catch (error) {
      console.error('Storage.set error:', error);
    }
  }

  static get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(STORAGE_PREFIX + key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Storage.get error:', error);
      return null;
    }
  }

  static remove(key: string): void {
    localStorage.removeItem(STORAGE_PREFIX + key);
  }

  static clear(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }

  static has(key: string): boolean {
    return localStorage.getItem(STORAGE_PREFIX + key) !== null;
  }
}

// Business-specific storage
export class BusinessStorage {
  private businessId: string;

  constructor(businessId: string) {
    this.businessId = businessId;
  }

  private getKey(key: string): string {
    return `business_${this.businessId}_${key}`;
  }

  set<T>(key: string, value: T): void {
    Storage.set(this.getKey(key), value);
  }

  get<T>(key: string): T | null {
    return Storage.get<T>(this.getKey(key));
  }

  remove(key: string): void {
    Storage.remove(this.getKey(key));
  }
}

// Generate unique IDs
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Sync status management
export type SyncStatus = 'synced' | 'pending' | 'error';

export interface SyncState {
  lastSync: string | null;
  pendingChanges: number;
  status: SyncStatus;
}

export class SyncManager {
  static getSyncState(): SyncState {
    return Storage.get<SyncState>('sync_state') || {
      lastSync: null,
      pendingChanges: 0,
      status: 'synced',
    };
  }

  static updateSyncState(state: Partial<SyncState>): void {
    const current = this.getSyncState();
    Storage.set('sync_state', { ...current, ...state });
  }

  static markPendingChange(): void {
    const state = this.getSyncState();
    this.updateSyncState({
      pendingChanges: state.pendingChanges + 1,
      status: 'pending',
    });
  }

  static markSynced(): void {
    this.updateSyncState({
      lastSync: new Date().toISOString(),
      pendingChanges: 0,
      status: 'synced',
    });
  }
}
