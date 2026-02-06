/**
 * Database Seed File
 * Populates the database with sample data for development and testing
 */

const bcrypt = require('bcryptjs');

async function seedDatabase(sequelize) {
  const { User, Business, Transaction, Invoice, LedgerEntry } = sequelize.models;

  try {
    console.log('🌱 Starting database seed...');

    // 1. Create Users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = await User.bulkCreate([
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'John Kimani',
        email: 'john@example.com',
        password: hashedPassword,
        role: 'owner',
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'Mary Nakato',
        email: 'mary@example.com',
        password: hashedPassword,
        role: 'accountant',
      },
    ]);
    console.log('✅ Created 2 users');

    // 2. Create Businesses (one per country)
    const businesses = await Business.bulkCreate([
      {
        id: '550e8400-e29b-41d4-a716-446655440010',
        name: 'Juma Electronics',
        ownerId: users[0].id,
        country: 'KE',
        currency: 'KES',
        taxId: 'P051234567M',
        vatRate: 16,
        address: 'Nairobi, Kenya',
        email: 'info@jumaelectronics.co.ke',
        phone: '+254712345678',
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440011',
        name: 'Nakato Boutique',
        ownerId: users[1].id,
        country: 'UG',
        currency: 'UGX',
        taxId: '1000123456',
        vatRate: 18,
        address: 'Kampala, Uganda',
        email: 'info@nakatoboutique.ug',
        phone: '+256712345678',
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440012',
        name: 'Dar Traders',
        ownerId: users[0].id,
        country: 'TZ',
        currency: 'TZS',
        taxId: '100-123-456',
        vatRate: 18,
        address: 'Dar es Salaam, Tanzania',
        email: 'info@dartraders.co.tz',
        phone: '+255712345678',
      },
    ]);
    console.log('✅ Created 3 businesses (KE, UG, TZ)');

    // 3. Create Transactions
    const kenyanBusiness = businesses[0];
    const transactions = await Transaction.bulkCreate([
      // Kenya - Income transactions
      {
        id: '550e8400-e29b-41d4-a716-446655440100',
        businessId: kenyanBusiness.id,
        type: 'income',
        amount: 5000,
        category: 'Sales Revenue',
        currency: 'KES',
        description: 'Sale of Samsung phone',
        date: new Date('2026-01-10'),
        paymentMethod: 'mpesa',
        reference: 'SAX123456',
        status: 'completed',
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440101',
        businessId: kenyanBusiness.id,
        type: 'income',
        amount: 3500,
        category: 'Sales Revenue',
        currency: 'KES',
        description: 'Sale of laptop accessories',
        date: new Date('2026-01-12'),
        paymentMethod: 'cash',
        status: 'completed',
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440102',
        businessId: kenyanBusiness.id,
        type: 'income',
        amount: 8000,
        category: 'Service Revenue',
        currency: 'KES',
        description: 'Phone repair service',
        date: new Date('2026-01-13'),
        paymentMethod: 'mpesa',
        reference: 'SAX789012',
        status: 'completed',
      },
      // Kenya - Expense transactions
      {
        id: '550e8400-e29b-41d4-a716-446655440103',
        businessId: kenyanBusiness.id,
        type: 'expense',
        amount: 15000,
        category: 'Rent',
        currency: 'KES',
        description: 'January office rent',
        date: new Date('2026-01-01'),
        paymentMethod: 'bank_transfer',
        status: 'completed',
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440104',
        businessId: kenyanBusiness.id,
        type: 'expense',
        amount: 2500,
        category: 'Utilities',
        currency: 'KES',
        description: 'Electricity bill',
        date: new Date('2026-01-05'),
        paymentMethod: 'mpesa',
        reference: 'KPLC-12345',
        status: 'completed',
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440105',
        businessId: kenyanBusiness.id,
        type: 'expense',
        amount: 4000,
        category: 'Supplies',
        currency: 'KES',
        description: 'Office supplies',
        date: new Date('2026-01-08'),
        paymentMethod: 'cash',
        status: 'completed',
      },
    ]);
    console.log('✅ Created 6 transactions (3 income, 3 expense)');

    // 4. Create Invoices
    const invoices = await Invoice.bulkCreate([
      {
        id: '550e8400-e29b-41d4-a716-446655440200',
        businessId: kenyanBusiness.id,
        invoiceNumber: 'INV-2026-001',
        customerName: 'Sarah Mwangi',
        customerEmail: 'sarah@example.com',
        customerPhone: '+254722345678',
        customerTaxId: 'P051234567N',
        date: new Date('2026-01-10'),
        dueDate: new Date('2026-01-20'),
        items: [
          {
            id: '1',
            description: 'Samsung Galaxy A54',
            quantity: 1,
            unitPrice: 43103.45,
            taxRate: 16,
            taxAmount: 6896.55,
            total: 50000,
          },
        ],
        subtotal: 43103.45,
        taxAmount: 6896.55,
        total: 50000,
        currency: 'KES',
        status: 'paid',
        paidAt: new Date('2026-01-12'),
        complianceData: {
          timsInvoiceId: 'TIMS-2026-001',
          timsQrCode: 'https://itax.kra.go.ke/verify/TIMS-2026-001',
        },
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440201',
        businessId: kenyanBusiness.id,
        invoiceNumber: 'INV-2026-002',
        customerName: 'Tech Solutions Ltd',
        customerEmail: 'info@techsolutions.co.ke',
        customerPhone: '+254733456789',
        customerTaxId: 'P051234567P',
        date: new Date('2026-01-15'),
        dueDate: new Date('2026-01-30'),
        items: [
          {
            id: '1',
            description: 'Laptop Dell XPS 15',
            quantity: 2,
            unitPrice: 86206.90,
            taxRate: 16,
            taxAmount: 27586.20,
            total: 200000,
          },
        ],
        subtotal: 172413.80,
        taxAmount: 27586.20,
        total: 200000,
        currency: 'KES',
        status: 'sent',
        complianceData: {
          timsInvoiceId: 'TIMS-2026-002',
          timsQrCode: 'https://itax.kra.go.ke/verify/TIMS-2026-002',
        },
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440202',
        businessId: kenyanBusiness.id,
        invoiceNumber: 'INV-2026-003',
        customerName: 'John Omondi',
        customerEmail: 'john.omondi@example.com',
        customerPhone: '+254744567890',
        date: new Date('2026-01-14'),
        dueDate: new Date('2026-01-21'),
        items: [
          {
            id: '1',
            description: 'Phone repair service',
            quantity: 1,
            unitPrice: 6896.55,
            taxRate: 16,
            taxAmount: 1103.45,
            total: 8000,
          },
        ],
        subtotal: 6896.55,
        taxAmount: 1103.45,
        total: 8000,
        currency: 'KES',
        status: 'overdue',
      },
    ]);
    console.log('✅ Created 3 invoices (paid, sent, overdue)');

    // 5. Create Ledger Entries (Double-Entry)
    const ledgerEntries = [];
    
    // For each income transaction, create ledger entries
    transactions.filter(t => t.type === 'income').forEach(tx => {
      ledgerEntries.push(
        // Debit: Cash/Bank
        {
          transactionId: tx.id,
          accountCode: '1100',
          accountName: 'Cash and Cash Equivalents',
          debit: tx.amount,
          credit: 0,
        },
        // Credit: Revenue
        {
          transactionId: tx.id,
          accountCode: '4100',
          accountName: 'Sales Revenue',
          debit: 0,
          credit: tx.amount,
        }
      );
    });

    // For each expense transaction, create ledger entries
    transactions.filter(t => t.type === 'expense').forEach(tx => {
      ledgerEntries.push(
        // Debit: Expense
        {
          transactionId: tx.id,
          accountCode: '5100',
          accountName: tx.category,
          debit: tx.amount,
          credit: 0,
        },
        // Credit: Cash/Bank
        {
          transactionId: tx.id,
          accountCode: '1100',
          accountName: 'Cash and Cash Equivalents',
          debit: 0,
          credit: tx.amount,
        }
      );
    });

    await LedgerEntry.bulkCreate(ledgerEntries);
    console.log(`✅ Created ${ledgerEntries.length} ledger entries (double-entry)`);

    // Summary
    console.log('\n📊 Seed Summary:');
    console.log(`   Users:      ${users.length}`);
    console.log(`   Businesses: ${businesses.length}`);
    console.log(`   Transactions: ${transactions.length}`);
    console.log(`   Invoices:   ${invoices.length}`);
    console.log(`   Ledger Entries: ${ledgerEntries.length}`);
    console.log('\n✅ Database seeded successfully!');
    console.log('\n🔑 Test Credentials:');
    console.log('   Email: john@example.com');
    console.log('   Password: password123');
    
  } catch (error) {
    console.error('❌ Seed error:', error);
    throw error;
  }
}

module.exports = seedDatabase;
