import { Transaction, Invoice, Customer, CountryCode } from '@/types';
import { generateId } from './storage';
import { getCountry } from './countries';

export function generateDemoTransactions(countryCode: CountryCode): Transaction[] {
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  return [
    // Income transactions
    {
      id: generateId(),
      date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      type: 'income',
      amount: 125000,
      categoryId: 'cat_income_0', // Sales Revenue
      description: 'Product sales - Online store',
      reference: 'INV-001',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      date: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      type: 'income',
      amount: 85000,
      categoryId: 'cat_income_1', // Service Revenue
      description: 'Consulting services - Tech Corp',
      reference: 'INV-002',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      date: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      type: 'income',
      amount: 45000,
      categoryId: 'cat_income_0', // Sales Revenue
      description: 'Retail sales - Walk-in customers',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    
    // Expense transactions
    {
      id: generateId(),
      date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      type: 'expense',
      amount: 35000,
      categoryId: 'cat_expense_0', // Rent
      description: 'Office rent - January',
      reference: 'RENT-JAN',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      type: 'expense',
      amount: 75000,
      categoryId: 'cat_expense_1', // Salaries
      description: 'Staff salaries - 3 employees',
      reference: 'SAL-JAN',
      taxAmount: 0,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      date: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      type: 'expense',
      amount: 8500,
      categoryId: 'cat_expense_2', // Utilities
      description: 'Electricity & water',
      reference: 'UTIL-001',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      date: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      type: 'expense',
      amount: 12000,
      categoryId: 'cat_expense_3', // Office Supplies
      description: 'Stationery and office equipment',
      reference: 'SUPP-001',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      date: new Date(today.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      type: 'expense',
      amount: 15000,
      categoryId: 'cat_expense_4', // Marketing
      description: 'Social media advertising',
      reference: 'MKT-FB-001',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      date: new Date(today.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      type: 'expense',
      amount: 6500,
      categoryId: 'cat_expense_6', // Internet & Phone
      description: 'Monthly internet & mobile bills',
      reference: 'TEL-001',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

export function generateDemoInvoices(countryCode: CountryCode): Invoice[] {
  const country = getCountry(countryCode);
  const today = new Date();
  
  return [
    {
      id: generateId(),
      invoiceNumber: `INV-${countryCode}-202601-0001`,
      date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      dueDate: new Date(today.getTime() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'paid',
      customerName: 'Acme Corporation Ltd',
      customerEmail: 'accounts@acmecorp.com',
      customerPhone: countryCode === 'KE' ? '+254 712 345 678' : '+255 712 345 678',
      customerAddress: 'Industrial Area, Nairobi',
      customerTaxId: countryCode === 'KE' ? 'A123456789Z' : 'TIN-123456789',
      items: [
        {
          id: '1',
          description: 'Professional Consulting Services',
          quantity: 40,
          unitPrice: 2500,
          taxRate: country.vatRate,
          taxAmount: 16000,
          total: 116000,
        },
      ],
      subtotal: 100000,
      taxAmount: 16000,
      total: 116000,
      currency: country.currency,
      notes: 'Thank you for your business!',
      terms: 'Payment due within 30 days',
      createdAt: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      paidAt: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: generateId(),
      invoiceNumber: `INV-${countryCode}-202601-0002`,
      date: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      dueDate: new Date(today.getTime() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'sent',
      customerName: 'Tech Innovations Kenya',
      customerEmail: 'billing@techinnovations.co.ke',
      customerPhone: '+254 722 123 456',
      customerAddress: 'Westlands, Nairobi',
      customerTaxId: 'A987654321B',
      items: [
        {
          id: '1',
          description: 'Website Development',
          quantity: 1,
          unitPrice: 150000,
          taxRate: country.vatRate,
          taxAmount: 24000,
          total: 174000,
        },
        {
          id: '2',
          description: 'Hosting & Maintenance (1 year)',
          quantity: 1,
          unitPrice: 25000,
          taxRate: country.vatRate,
          taxAmount: 4000,
          total: 29000,
        },
      ],
      subtotal: 175000,
      taxAmount: 28000,
      total: 203000,
      currency: country.currency,
      notes: 'Project completed ahead of schedule',
      terms: 'Net 30',
      createdAt: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: generateId(),
      invoiceNumber: `INV-${countryCode}-202601-0003`,
      date: new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      dueDate: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'overdue',
      customerName: 'Retail Solutions Ltd',
      customerEmail: 'info@retailsolutions.com',
      customerPhone: '+254 733 456 789',
      customerTaxId: 'A555666777C',
      items: [
        {
          id: '1',
          description: 'POS System Installation',
          quantity: 3,
          unitPrice: 45000,
          taxRate: country.vatRate,
          taxAmount: 21600,
          total: 156600,
        },
      ],
      subtotal: 135000,
      taxAmount: 21600,
      total: 156600,
      currency: country.currency,
      terms: 'Payment on delivery',
      createdAt: new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: generateId(),
      invoiceNumber: `INV-${countryCode}-202601-0004`,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'draft',
      customerName: 'Green Energy Solutions',
      customerEmail: 'procurement@greenenergy.co',
      customerPhone: '+254 744 567 890',
      items: [
        {
          id: '1',
          description: 'Solar Panel Consultation',
          quantity: 1,
          unitPrice: 50000,
          taxRate: country.vatRate,
          taxAmount: 8000,
          total: 58000,
        },
      ],
      subtotal: 50000,
      taxAmount: 8000,
      total: 58000,
      currency: country.currency,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

export function generateDemoCustomers(): Customer[] {
  return [
    {
      id: generateId(),
      name: 'Acme Corporation Ltd',
      email: 'accounts@acmecorp.com',
      phone: '+254 712 345 678',
      address: 'Industrial Area, Nairobi',
      taxId: 'A123456789Z',
      totalInvoiced: 116000,
      totalPaid: 116000,
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: generateId(),
      name: 'Tech Innovations Kenya',
      email: 'billing@techinnovations.co.ke',
      phone: '+254 722 123 456',
      address: 'Westlands, Nairobi',
      taxId: 'A987654321B',
      totalInvoiced: 203000,
      totalPaid: 0,
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: generateId(),
      name: 'Retail Solutions Ltd',
      email: 'info@retailsolutions.com',
      phone: '+254 733 456 789',
      taxId: 'A555666777C',
      totalInvoiced: 156600,
      totalPaid: 0,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
}
