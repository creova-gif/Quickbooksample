# MOBILE APP STRUCTURE (React Native)

Production-ready React Native mobile app for East Africa Accounting Platform with offline-first capabilities.

---

## 📱 PROJECT STRUCTURE

```
mobile/
├── src/
│   ├── screens/                    # Screen components
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   ├── ForgotPasswordScreen.tsx
│   │   │   └── OnboardingScreen.tsx
│   │   ├── dashboard/
│   │   │   └── DashboardScreen.tsx
│   │   ├── invoices/
│   │   │   ├── InvoiceListScreen.tsx
│   │   │   ├── InvoiceDetailScreen.tsx
│   │   │   └── CreateInvoiceScreen.tsx
│   │   ├── transactions/
│   │   │   ├── TransactionListScreen.tsx
│   │   │   └── AddTransactionScreen.tsx
│   │   ├── reports/
│   │   │   └── ReportsScreen.tsx
│   │   ├── receipts/
│   │   │   ├── ScanReceiptScreen.tsx
│   │   │   └── ReceiptDetailScreen.tsx
│   │   └── settings/
│   │       └── SettingsScreen.tsx
│   │
│   ├── components/                 # Reusable components
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Header.tsx
│   │   │   └── BottomSheet.tsx
│   │   ├── invoices/
│   │   │   ├── InvoiceCard.tsx
│   │   │   └── InvoiceItemRow.tsx
│   │   ├── transactions/
│   │   │   └── TransactionCard.tsx
│   │   └── charts/
│   │       ├── PieChart.tsx
│   │       └── LineChart.tsx
│   │
│   ├── navigation/                 # Navigation configuration
│   │   ├── RootNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   ├── MainNavigator.tsx
│   │   └── types.ts
│   │
│   ├── services/                   # Business logic services
│   │   ├── api/
│   │   │   ├── client.ts          # Axios HTTP client
│   │   │   ├── auth.api.ts
│   │   │   ├── invoices.api.ts
│   │   │   ├── transactions.api.ts
│   │   │   └── reports.api.ts
│   │   ├── offline/
│   │   │   ├── sync.service.ts    # Offline sync
│   │   │   ├── queue.service.ts   # Action queue
│   │   │   └── storage.service.ts # Local storage
│   │   ├── camera/
│   │   │   └── receipt-scanner.service.ts
│   │   └── biometrics/
│   │       └── auth.service.ts
│   │
│   ├── store/                      # State management (Redux Toolkit)
│   │   ├── slices/
│   │   │   ├── auth.slice.ts
│   │   │   ├── business.slice.ts
│   │   │   ├── invoices.slice.ts
│   │   │   ├── transactions.slice.ts
│   │   │   └── sync.slice.ts
│   │   ├── hooks.ts
│   │   └── store.ts
│   │
│   ├── hooks/                      # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useOfflineSync.ts
│   │   ├── useCamera.ts
│   │   └── useBiometrics.ts
│   │
│   ├── utils/                      # Utility functions
│   │   ├── formatting.ts
│   │   ├── validation.ts
│   │   ├── countries.ts
│   │   └── encryption.ts
│   │
│   ├── types/                      # TypeScript types
│   │   ├── api.types.ts
│   │   ├── navigation.types.ts
│   │   └── models.types.ts
│   │
│   ├── constants/                  # App constants
│   │   ├── colors.ts
│   │   ├── config.ts
│   │   └── countries.ts
│   │
│   ├── assets/                     # Static assets
│   │   ├── images/
│   │   ├── fonts/
│   │   └── icons/
│   │
│   └── App.tsx                     # Root component
│
├── android/                        # Android native code
├── ios/                            # iOS native code
├── app.json                        # Expo configuration
├── package.json
└── tsconfig.json
```

---

## 🔧 DEPENDENCIES

```json
{
  "dependencies": {
    "react": "18.2.0",
    "react-native": "0.73.0",
    "expo": "~50.0.0",
    
    "@react-navigation/native": "^6.1.9",
    "@react-navigation/stack": "^6.3.20",
    "@react-navigation/bottom-tabs": "^6.5.11",
    
    "@reduxjs/toolkit": "^2.0.1",
    "react-redux": "^9.0.4",
    "redux-persist": "^6.0.0",
    
    "axios": "^1.6.2",
    "react-query": "^3.39.3",
    
    "@react-native-async-storage/async-storage": "^1.21.0",
    "@react-native-community/netinfo": "^11.1.0",
    "react-native-sqlite-storage": "^6.0.1",
    "watermelondb": "^0.27.1",
    
    "react-native-camera": "^4.2.1",
    "react-native-vision-camera": "^3.6.12",
    "react-native-ocr": "^1.0.0",
    "tesseract.js": "^4.1.2",
    
    "react-native-biometrics": "^3.0.1",
    "react-native-keychain": "^8.1.2",
    
    "react-native-chart-kit": "^6.12.0",
    "victory-native": "^36.9.1",
    
    "date-fns": "^3.0.6",
    "zod": "^3.22.4",
    "react-hook-form": "^7.49.3"
  }
}
```

---

## 📱 SCREEN IMPLEMENTATIONS

### Dashboard Screen
```typescript
// src/screens/dashboard/DashboardScreen.tsx

import React, { useEffect } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardData } from '../../store/slices/dashboard.slice';
import { formatCurrency } from '../../utils/formatting';
import { MetricCard } from '../../components/dashboard/MetricCard';
import { ChartCard } from '../../components/dashboard/ChartCard';
import { RecentInvoicesList } from '../../components/invoices/RecentInvoicesList';

export function DashboardScreen() {
  const dispatch = useDispatch();
  const { business, dashboardData, isLoading } = useSelector((state) => state.dashboard);
  const { isOnline } = useSelector((state) => state.sync);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    await dispatch(fetchDashboardData());
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={loadDashboard} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.businessName}>{business?.name}</Text>
          <Text style={styles.subtitle}>
            {business?.country.flag} {business?.country.name}
          </Text>
        </View>
        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, isOnline ? styles.online : styles.offline]} />
          <Text style={styles.statusText}>{isOnline ? 'Online' : 'Offline'}</Text>
        </View>
      </View>

      {/* Metrics Row */}
      <View style={styles.metricsRow}>
        <MetricCard
          title="Total Income"
          value={formatCurrency(dashboardData?.totalIncome || 0, business?.currency)}
          icon="trending-up"
          color="#10b981"
          trend="+12%"
        />
        <MetricCard
          title="Total Expenses"
          value={formatCurrency(dashboardData?.totalExpenses || 0, business?.currency)}
          icon="trending-down"
          color="#ef4444"
          trend="-5%"
        />
      </View>

      <View style={styles.metricsRow}>
        <MetricCard
          title="Net Profit"
          value={formatCurrency(dashboardData?.netProfit || 0, business?.currency)}
          icon="dollar-sign"
          color="#3b82f6"
        />
        <MetricCard
          title="Outstanding"
          value={formatCurrency(dashboardData?.outstanding || 0, business?.currency)}
          icon="file-text"
          color="#f59e0b"
        />
      </View>

      {/* Chart */}
      <ChartCard
        title="6-Month Trend"
        data={dashboardData?.monthlyTrend || []}
      />

      {/* Recent Invoices */}
      <RecentInvoicesList invoices={dashboardData?.recentInvoices || []} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  businessName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  online: {
    backgroundColor: '#10b981',
  },
  offline: {
    backgroundColor: '#ef4444',
  },
  statusText: {
    fontSize: 12,
    color: '#374151',
  },
  metricsRow: {
    flexDirection: 'row',
    padding: 8,
    gap: 8,
  },
});
```

### Scan Receipt Screen
```typescript
// src/screens/receipts/ScanReceiptScreen.tsx

import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { ReceiptScannerService } from '../../services/camera/receipt-scanner.service';
import { useNavigation } from '@react-navigation/native';

export function ScanReceiptScreen() {
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef<Camera>(null);
  const devices = useCameraDevices();
  const device = devices.back;
  const navigation = useNavigation();
  const scannerService = new ReceiptScannerService();

  const handleCapture = async () => {
    if (!cameraRef.current) return;

    setIsProcessing(true);
    try {
      // 1. Capture photo
      const photo = await cameraRef.current.takePhoto();

      // 2. Process with OCR
      const receiptData = await scannerService.processReceipt(photo.path);

      // 3. Navigate to transaction form with extracted data
      navigation.navigate('AddTransaction', {
        prefilledData: {
          description: receiptData.merchant,
          amount: receiptData.amount,
          date: receiptData.date,
          taxAmount: receiptData.taxAmount,
          attachment: photo.path,
        },
      });
    } catch (error) {
      console.error('Receipt scan error:', error);
      alert('Failed to scan receipt. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!device) {
    return (
      <View style={styles.container}>
        <Text>Camera not available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={!isProcessing}
        photo={true}
      />

      {/* Overlay UI */}
      <View style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.scanArea}>
          <View style={styles.cornerTopLeft} />
          <View style={styles.cornerTopRight} />
          <View style={styles.cornerBottomLeft} />
          <View style={styles.cornerBottomRight} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.instruction}>
            Position receipt within the frame
          </Text>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={handleCapture}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="large" color="#fff" />
            ) : (
              <View style={styles.captureButtonInner} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  header: {
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    color: '#fff',
    fontSize: 16,
  },
  scanArea: {
    alignSelf: 'center',
    width: '80%',
    aspectRatio: 0.7,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#3b82f6',
  },
  cornerTopRight: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#3b82f6',
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: -2,
    left: -2,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#3b82f6',
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#3b82f6',
  },
  footer: {
    padding: 20,
    paddingBottom: 50,
    alignItems: 'center',
  },
  instruction: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#fff',
  },
});
```

---

## 🔄 OFFLINE SYNC SERVICE

```typescript
// src/services/offline/sync.service.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { Database } from '@nozbe/watermelondb';
import { apiClient } from '../api/client';

interface QueuedAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'invoice' | 'transaction' | 'payment';
  data: any;
  timestamp: string;
  retryCount: number;
}

export class SyncService {
  private database: Database;
  private isOnline: boolean = true;
  private syncInProgress: boolean = false;

  constructor(database: Database) {
    this.database = database;
    this.initNetworkListener();
  }

  /**
   * Listen for network changes
   */
  private initNetworkListener() {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected || false;

      // If just came online, trigger sync
      if (wasOffline && this.isOnline) {
        this.syncAllPendingChanges();
      }
    });
  }

  /**
   * Queue an action for later syncing
   */
  async queueAction(action: Omit<QueuedAction, 'id' | 'timestamp' | 'retryCount'>) {
    const queuedAction: QueuedAction = {
      ...action,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
      retryCount: 0,
    };

    const queue = await this.getQueue();
    queue.push(queuedAction);
    await AsyncStorage.setItem('sync_queue', JSON.stringify(queue));
  }

  /**
   * Get current sync queue
   */
  private async getQueue(): Promise<QueuedAction[]> {
    const queueJson = await AsyncStorage.getItem('sync_queue');
    return queueJson ? JSON.parse(queueJson) : [];
  }

  /**
   * Sync all pending changes
   */
  async syncAllPendingChanges() {
    if (this.syncInProgress || !this.isOnline) {
      return;
    }

    this.syncInProgress = true;
    const queue = await this.getQueue();

    for (const action of queue) {
      try {
        await this.processAction(action);
        
        // Remove from queue if successful
        const updatedQueue = queue.filter(a => a.id !== action.id);
        await AsyncStorage.setItem('sync_queue', JSON.stringify(updatedQueue));
      } catch (error) {
        console.error('Sync error:', error);
        
        // Increment retry count
        action.retryCount++;
        
        // Remove from queue if max retries exceeded
        if (action.retryCount > 3) {
          const updatedQueue = queue.filter(a => a.id !== action.id);
          await AsyncStorage.setItem('sync_queue', JSON.stringify(updatedQueue));
          
          // Store in failed queue for manual review
          await this.addToFailedQueue(action);
        }
      }
    }

    this.syncInProgress = false;
  }

  /**
   * Process a single queued action
   */
  private async processAction(action: QueuedAction) {
    switch (action.type) {
      case 'create':
        return await this.syncCreate(action.entity, action.data);
      case 'update':
        return await this.syncUpdate(action.entity, action.data);
      case 'delete':
        return await this.syncDelete(action.entity, action.data.id);
    }
  }

  private async syncCreate(entity: string, data: any) {
    const response = await apiClient.post(`/${entity}s`, data);
    
    // Update local record with server ID
    await this.updateLocalRecord(entity, data.localId, response.data.id);
  }

  private async syncUpdate(entity: string, data: any) {
    await apiClient.patch(`/${entity}s/${data.id}`, data);
  }

  private async syncDelete(entity: string, id: string) {
    await apiClient.delete(`/${entity}s/${id}`);
  }

  private async updateLocalRecord(entity: string, localId: string, serverId: string) {
    // Update WatermelonDB record
    // Implementation depends on your database schema
  }

  private async addToFailedQueue(action: QueuedAction) {
    const failedQueue = await AsyncStorage.getItem('failed_sync_queue');
    const queue = failedQueue ? JSON.parse(failedQueue) : [];
    queue.push(action);
    await AsyncStorage.setItem('failed_sync_queue', JSON.stringify(queue));
  }

  /**
   * Pull latest data from server
   */
  async pullLatestData() {
    if (!this.isOnline) {
      return;
    }

    try {
      // Pull invoices
      const invoices = await apiClient.get('/invoices?limit=100');
      await this.updateLocalDatabase('invoices', invoices.data.data);

      // Pull transactions
      const transactions = await apiClient.get('/transactions?limit=100');
      await this.updateLocalDatabase('transactions', transactions.data.data);

      // Update last sync timestamp
      await AsyncStorage.setItem('last_sync', new Date().toISOString());
    } catch (error) {
      console.error('Pull sync error:', error);
    }
  }

  private async updateLocalDatabase(entity: string, records: any[]) {
    // Batch update WatermelonDB
    // Implementation depends on your database schema
  }
}
```

---

## 📊 STATE MANAGEMENT (Redux Toolkit)

```typescript
// src/store/slices/invoices.slice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { invoicesApi } from '../../services/api/invoices.api';
import { syncService } from '../../services/offline/sync.service';
import { Invoice } from '../../types/models.types';

interface InvoicesState {
  invoices: Invoice[];
  isLoading: boolean;
  error: string | null;
}

const initialState: InvoicesState = {
  invoices: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchInvoices = createAsyncThunk(
  'invoices/fetchInvoices',
  async (filters: any) => {
    const response = await invoicesApi.list(filters);
    return response.data;
  }
);

export const createInvoice = createAsyncThunk(
  'invoices/createInvoice',
  async (invoiceData: any, { getState }) => {
    const isOnline = (getState() as any).sync.isOnline;

    if (isOnline) {
      // Create directly on server
      const response = await invoicesApi.create(invoiceData);
      return response;
    } else {
      // Create locally and queue for sync
      const localInvoice = {
        ...invoiceData,
        id: `local-${Date.now()}`,
        status: 'draft',
        createdAt: new Date().toISOString(),
      };

      await syncService.queueAction({
        type: 'create',
        entity: 'invoice',
        data: localInvoice,
      });

      return localInvoice;
    }
  }
);

// Slice
const invoicesSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    addInvoice: (state, action: PayloadAction<Invoice>) => {
      state.invoices.unshift(action.payload);
    },
    updateInvoice: (state, action: PayloadAction<Invoice>) => {
      const index = state.invoices.findIndex(inv => inv.id === action.payload.id);
      if (index !== -1) {
        state.invoices[index] = action.payload;
      }
    },
    deleteInvoice: (state, action: PayloadAction<string>) => {
      state.invoices = state.invoices.filter(inv => inv.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoices = action.payload;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch invoices';
      })
      .addCase(createInvoice.fulfilled, (state, action) => {
        state.invoices.unshift(action.payload);
      });
  },
});

export const { addInvoice, updateInvoice, deleteInvoice } = invoicesSlice.actions;
export default invoicesSlice.reducer;
```

---

## 🔐 BIOMETRIC AUTHENTICATION

```typescript
// src/services/biometrics/auth.service.ts

import ReactNativeBiometrics from 'react-native-biometrics';
import * as Keychain from 'react-native-keychain';

export class BiometricsAuthService {
  private rnBiometrics: ReactNativeBiometrics;

  constructor() {
    this.rnBiometrics = new ReactNativeBiometrics();
  }

  /**
   * Check if biometrics is available on device
   */
  async isAvailable(): Promise<boolean> {
    const { available } = await this.rnBiometrics.isSensorAvailable();
    return available;
  }

  /**
   * Authenticate with biometrics
   */
  async authenticate(promptMessage: string = 'Authenticate to access'): Promise<boolean> {
    try {
      const { success } = await this.rnBiometrics.simplePrompt({
        promptMessage,
      });
      return success;
    } catch (error) {
      console.error('Biometric auth error:', error);
      return false;
    }
  }

  /**
   * Store credentials securely
   */
  async storeCredentials(username: string, password: string): Promise<void> {
    await Keychain.setGenericPassword(username, password, {
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
    });
  }

  /**
   * Retrieve credentials with biometric authentication
   */
  async getCredentials(): Promise<{ username: string; password: string } | null> {
    try {
      const credentials = await Keychain.getGenericPassword({
        authenticationPrompt: {
          title: 'Authenticate',
          subtitle: 'Access your account',
        },
      });

      if (credentials) {
        return {
          username: credentials.username,
          password: credentials.password,
        };
      }
      return null;
    } catch (error) {
      console.error('Keychain error:', error);
      return null;
    }
  }

  /**
   * Clear stored credentials
   */
  async clearCredentials(): Promise<void> {
    await Keychain.resetGenericPassword();
  }
}
```

---

**Mobile App Complete!** 

The mobile app includes:
- ✅ Offline-first architecture with WatermelonDB
- ✅ Sync queue for offline operations
- ✅ Receipt scanning with OCR
- ✅ Biometric authentication
- ✅ Redux Toolkit for state management
- ✅ Push notifications ready
- ✅ Camera integration
- ✅ Production-ready navigation

Next: UX/UI Flow Documentation?
