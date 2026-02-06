import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Business, 
  Transaction, 
  Invoice, 
  Category, 
  Customer,
  CountryCode 
} from '@/types';
import { Storage, BusinessStorage, generateId } from '@/lib/storage';
import { getDefaultCategories } from '@/lib/countries';
import { getDefaultAccounts } from '@/lib/accounting';
import { generateDemoTransactions, generateDemoInvoices, generateDemoCustomers } from '@/lib/demo-data';

interface BusinessContextType {
  business: Business | null;
  transactions: Transaction[];
  invoices: Invoice[];
  categories: Category[];
  customers: Customer[];
  
  // Business actions
  createBusiness: (data: Omit<Business, 'id' | 'createdAt'>) => void;
  updateBusiness: (data: Partial<Business>) => void;
  clearBusiness: () => void;
  
  // Transaction actions
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTransaction: (id: string, data: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  
  // Invoice actions
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateInvoice: (id: string, data: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  
  // Category actions
  addCategory: (category: Omit<Category, 'id'>) => void;
  
  // Customer actions
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'totalInvoiced' | 'totalPaid'>) => void;
  
  // Utility
  isLoading: boolean;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const [business, setBusiness] = useState<Business | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    const loadData = () => {
      const savedBusiness = Storage.get<Business>('current_business');
      
      if (savedBusiness) {
        setBusiness(savedBusiness);
        
        const storage = new BusinessStorage(savedBusiness.id);
        setTransactions(storage.get<Transaction[]>('transactions') || []);
        setInvoices(storage.get<Invoice[]>('invoices') || []);
        setCategories(storage.get<Category[]>('categories') || []);
        setCustomers(storage.get<Customer[]>('customers') || []);
      }
      
      setIsLoading(false);
    };

    loadData();
  }, []);

  // Save business data whenever it changes
  useEffect(() => {
    if (business) {
      Storage.set('current_business', business);
      const storage = new BusinessStorage(business.id);
      storage.set('transactions', transactions);
      storage.set('invoices', invoices);
      storage.set('categories', categories);
      storage.set('customers', customers);
    }
  }, [business, transactions, invoices, categories, customers]);

  const createBusiness = (data: Omit<Business, 'id' | 'createdAt'>) => {
    const newBusiness: Business = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    
    setBusiness(newBusiness);
    
    // Initialize default categories
    const incomeCategories = getDefaultCategories('income').map((cat, idx) => ({
      id: `cat_income_${idx}`,
      ...cat,
      type: 'income' as const,
      isSystem: true,
    }));
    
    const expenseCategories = getDefaultCategories('expense').map((cat, idx) => ({
      id: `cat_expense_${idx}`,
      ...cat,
      type: 'expense' as const,
      isSystem: true,
    }));
    
    setCategories([...incomeCategories, ...expenseCategories]);
    
    // Initialize default accounts (stored but not shown in UI)
    const storage = new BusinessStorage(newBusiness.id);
    storage.set('accounts', getDefaultAccounts());
    
    // Load demo data for demo purposes
    const demoTransactions = generateDemoTransactions(data.countryCode);
    const demoInvoices = generateDemoInvoices(data.countryCode);
    const demoCustomers = generateDemoCustomers();
    
    setTransactions(demoTransactions);
    setInvoices(demoInvoices);
    setCustomers(demoCustomers);
  };

  const updateBusiness = (data: Partial<Business>) => {
    if (business) {
      setBusiness({ ...business, ...data });
    }
  };

  const clearBusiness = () => {
    setBusiness(null);
    setTransactions([]);
    setInvoices([]);
    setCategories([]);
    setCustomers([]);
    Storage.remove('current_business');
  };

  const addTransaction = (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTransaction: Transaction = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTransactions([newTransaction, ...transactions]);
  };

  const updateTransaction = (id: string, data: Partial<Transaction>) => {
    setTransactions(transactions.map(t => 
      t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t
    ));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const addInvoice = (data: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newInvoice: Invoice = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setInvoices([newInvoice, ...invoices]);
  };

  const updateInvoice = (id: string, data: Partial<Invoice>) => {
    setInvoices(invoices.map(inv => 
      inv.id === id ? { ...inv, ...data, updatedAt: new Date().toISOString() } : inv
    ));
  };

  const deleteInvoice = (id: string) => {
    setInvoices(invoices.filter(inv => inv.id !== id));
  };

  const addCategory = (data: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...data,
      id: generateId(),
    };
    setCategories([...categories, newCategory]);
  };

  const addCustomer = (data: Omit<Customer, 'id' | 'createdAt' | 'totalInvoiced' | 'totalPaid'>) => {
    const newCustomer: Customer = {
      ...data,
      id: generateId(),
      totalInvoiced: 0,
      totalPaid: 0,
      createdAt: new Date().toISOString(),
    };
    setCustomers([...customers, newCustomer]);
  };

  return (
    <BusinessContext.Provider
      value={{
        business,
        transactions,
        invoices,
        categories,
        customers,
        createBusiness,
        updateBusiness,
        clearBusiness,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        addCategory,
        addCustomer,
        isLoading,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
}