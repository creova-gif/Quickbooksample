# Tax Compliance Adapter Design

## Overview
The East Africa Accounting Platform uses a **pluggable adapter pattern** to handle country-specific tax compliance requirements. This allows the system to support multiple countries with different e-invoicing systems without hardcoding logic.

---

## Architecture Pattern

### 1. Base Compliance Adapter Interface

```typescript
/**
 * Base interface that all country-specific adapters must implement
 * This ensures consistent behavior across all compliance systems
 */
interface IComplianceAdapter {
  // Country identification
  countryCode: CountryCode;
  countryName: string;
  
  // Tax configuration
  vatRate: number;
  vatName: string;
  
  // Validation
  validateInvoice(invoice: Invoice): ValidationResult;
  validateTaxId(taxId: string): boolean;
  
  // E-Invoice submission
  submitInvoice(invoice: Invoice): Promise<SubmissionResult>;
  cancelInvoice(invoiceId: string, reason: string): Promise<CancellationResult>;
  
  // Status checking
  getInvoiceStatus(invoiceId: string): Promise<InvoiceStatusResponse>;
  
  // QR Code generation (for countries that require it)
  generateQRCode(invoice: Invoice): Promise<string>;
  
  // Compliance reporting
  generateVATReport(startDate: Date, endDate: Date): Promise<VATReport>;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface SubmissionResult {
  success: boolean;
  invoiceId: string;
  verificationUrl?: string;
  qrCode?: string;
  deviceSignature?: string;
  errorMessage?: string;
}
```

---

## Country-Specific Implementations

### 1. Kenya - TIMS Adapter

```typescript
/**
 * Kenya Tax Invoice Management System (TIMS)
 * 
 * Requirements:
 * - All VAT-registered businesses must use TIMS
 * - Invoices must be submitted to KRA in real-time
 * - QR codes required on invoices
 * - Control Unit (CU) device required
 */
export class KenyaTIMSAdapter implements IComplianceAdapter {
  countryCode = 'KE';
  countryName = 'Kenya';
  vatRate = 16;
  vatName = 'VAT';
  
  private apiUrl = 'https://etims.kra.go.ke/api';
  private cuSerialNumber: string;
  
  constructor(config: TIMSConfig) {
    this.cuSerialNumber = config.cuSerialNumber;
  }
  
  validateTaxId(pin: string): boolean {
    // Kenya PIN format: P051234567M (11 characters)
    const pinRegex = /^[A-Z][0-9]{9}[A-Z]$/;
    return pinRegex.test(pin);
  }
  
  async submitInvoice(invoice: Invoice): Promise<SubmissionResult> {
    try {
      // Step 1: Prepare invoice data for TIMS
      const timsInvoice = {
        cuInvoiceNumber: this.generateCUInvoiceNumber(),
        cuSerialNumber: this.cuSerialNumber,
        invoiceDate: invoice.date,
        customerPIN: invoice.customerTaxId,
        items: invoice.items.map(item => ({
          itemName: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate,
          totalAmount: item.total,
        })),
        totalAmount: invoice.total,
        taxAmount: invoice.taxAmount,
      };
      
      // Step 2: Submit to TIMS API
      const response = await axios.post(
        `${this.apiUrl}/invoices/submit`,
        timsInvoice,
        {
          headers: {
            'Authorization': `Bearer ${this.getAccessToken()}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      // Step 3: Generate QR code
      const qrCode = await this.generateQRCode(invoice);
      
      return {
        success: true,
        invoiceId: response.data.timsInvoiceId,
        verificationUrl: response.data.verificationUrl,
        qrCode,
        deviceSignature: response.data.cuSignature,
      };
    } catch (error) {
      return {
        success: false,
        invoiceId: '',
        errorMessage: error.message,
      };
    }
  }
  
  async generateQRCode(invoice: Invoice): Promise<string> {
    // QR code contains: Invoice Number, CU Serial, Total Amount, Date
    const qrData = `INV:${invoice.invoiceNumber}|CU:${this.cuSerialNumber}|AMT:${invoice.total}|DATE:${invoice.date}`;
    return await QRCode.toDataURL(qrData);
  }
  
  async generateVATReport(startDate: Date, endDate: Date): Promise<VATReport> {
    // Fetch all invoices in date range
    const invoices = await this.getInvoicesInRange(startDate, endDate);
    
    // Calculate VAT summary
    const totalSales = invoices.reduce((sum, inv) => sum + inv.subtotal, 0);
    const totalVAT = invoices.reduce((sum, inv) => sum + inv.taxAmount, 0);
    
    return {
      period: `${startDate} to ${endDate}`,
      sales: totalSales,
      vatCollected: totalVAT,
      vatRate: this.vatRate,
      reportGeneratedAt: new Date(),
    };
  }
  
  private generateCUInvoiceNumber(): string {
    // Format: CU-SERIAL-INCREMENT
    const counter = this.getNextInvoiceCounter();
    return `${this.cuSerialNumber}-${counter.toString().padStart(6, '0')}`;
  }
  
  private getAccessToken(): string {
    // Implementation for OAuth token retrieval
    // In production, this would handle token refresh
    return 'mock-token';
  }
}
```

---

### 2. Uganda - EFRIS Adapter

```typescript
/**
 * Uganda Electronic Fiscal Receipting and Invoicing Solution (EFRIS)
 * 
 * Requirements:
 * - E-invoicing mandatory for VAT-registered businesses
 * - Fiscal Device Number (FDN) required
 * - Real-time submission to URA
 */
export class UgandaEFRISAdapter implements IComplianceAdapter {
  countryCode = 'UG';
  countryName = 'Uganda';
  vatRate = 18;
  vatName = 'VAT';
  
  private apiUrl = 'https://efris.ura.go.ug/api';
  private deviceNumber: string;
  
  validateTaxId(tin: string): boolean {
    // Uganda TIN format: 10 digits
    return /^[0-9]{10}$/.test(tin);
  }
  
  async submitInvoice(invoice: Invoice): Promise<SubmissionResult> {
    try {
      const efrisInvoice = {
        deviceNumber: this.deviceNumber,
        invoiceNo: invoice.invoiceNumber,
        invoiceType: '1', // 1 = Tax Invoice
        issuedDate: invoice.date,
        buyer: {
          tin: invoice.customerTaxId,
          name: invoice.customerName,
        },
        items: invoice.items.map(item => ({
          itemCode: item.id,
          itemName: item.description,
          qty: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate,
          tax: item.taxAmount,
          total: item.total,
        })),
        summary: {
          netAmount: invoice.subtotal,
          taxAmount: invoice.taxAmount,
          grossAmount: invoice.total,
        },
      };
      
      const response = await axios.post(
        `${this.apiUrl}/invoice/upload`,
        efrisInvoice,
        {
          headers: {
            'Authorization': this.getAuthHeader(),
            'Content-Type': 'application/json',
          },
        }
      );
      
      return {
        success: true,
        invoiceId: response.data.fiscalDocumentNumber,
        verificationUrl: response.data.verificationUrl,
        qrCode: await this.generateQRCode(invoice),
        deviceSignature: response.data.fdmSignature,
      };
    } catch (error) {
      return {
        success: false,
        invoiceId: '',
        errorMessage: error.message,
      };
    }
  }
  
  async generateQRCode(invoice: Invoice): Promise<string> {
    const qrData = {
      fdn: this.deviceNumber,
      invoice: invoice.invoiceNumber,
      total: invoice.total,
      date: invoice.date,
    };
    return await QRCode.toDataURL(JSON.stringify(qrData));
  }
}
```

---

### 3. Tanzania - VFD Adapter

```typescript
/**
 * Tanzania Virtual Fiscal Device (VFD)
 * 
 * Requirements:
 * - VFD integration with TRA
 * - Receipt verification codes
 * - Z-Report generation
 */
export class TanzaniaVFDAdapter implements IComplianceAdapter {
  countryCode = 'TZ';
  countryName = 'Tanzania';
  vatRate = 18;
  vatName = 'VAT';
  
  private apiUrl = 'https://vfd.tra.go.tz/api';
  private vfdSerialNumber: string;
  
  validateTaxId(tin: string): boolean {
    // Tanzania TIN format: 9 digits
    return /^[0-9]{9}$/.test(tin);
  }
  
  async submitInvoice(invoice: Invoice): Promise<SubmissionResult> {
    try {
      const vfdReceipt = {
        vfdSerial: this.vfdSerialNumber,
        receiptNumber: this.generateReceiptNumber(),
        date: invoice.date,
        time: new Date().toISOString(),
        tin: invoice.customerTaxId,
        items: invoice.items.map(item => ({
          description: item.description,
          qty: item.quantity,
          price: item.unitPrice,
          tax: item.taxAmount,
        })),
        totalWithTax: invoice.total,
      };
      
      const response = await axios.post(
        `${this.apiUrl}/receipt/submit`,
        vfdReceipt
      );
      
      return {
        success: true,
        invoiceId: response.data.receiptNumber,
        verificationUrl: `https://verify.tra.go.tz/${response.data.verificationCode}`,
        qrCode: await this.generateQRCode(invoice),
      };
    } catch (error) {
      return {
        success: false,
        invoiceId: '',
        errorMessage: error.message,
      };
    }
  }
  
  private generateReceiptNumber(): string {
    // VFD receipt format
    return `${this.vfdSerialNumber}-${Date.now()}`;
  }
}
```

---

### 4. Rwanda - EBM Adapter

```typescript
/**
 * Rwanda Electronic Billing Machine (EBM)
 * 
 * Requirements:
 * - EBM device integration
 * - SDC (Sales Data Controller) communication
 * - Internal data encryption
 */
export class RwandaEBMAdapter implements IComplianceAdapter {
  countryCode = 'RW';
  countryName = 'Rwanda';
  vatRate = 18;
  vatName = 'VAT';
  
  private apiUrl = 'https://ebm.rra.gov.rw/api';
  private ebmSerialNumber: string;
  private sdcId: string;
  
  validateTaxId(tin: string): boolean {
    // Rwanda TIN format: 9 digits
    return /^[0-9]{9}$/.test(tin);
  }
  
  async submitInvoice(invoice: Invoice): Promise<SubmissionResult> {
    try {
      const ebmInvoice = {
        ebmSerial: this.ebmSerialNumber,
        sdcId: this.sdcId,
        invoiceNumber: invoice.invoiceNumber,
        issueDate: invoice.date,
        customer: {
          tin: invoice.customerTaxId,
          name: invoice.customerName,
        },
        items: invoice.items,
        totals: {
          subtotal: invoice.subtotal,
          vat: invoice.taxAmount,
          total: invoice.total,
        },
      };
      
      // Encrypt internal data
      const internalData = this.encryptInternalData(ebmInvoice);
      
      const response = await axios.post(
        `${this.apiUrl}/invoice/create`,
        { ...ebmInvoice, internalData }
      );
      
      return {
        success: true,
        invoiceId: response.data.ebmInvoiceId,
        qrCode: await this.generateQRCode(invoice),
      };
    } catch (error) {
      return {
        success: false,
        invoiceId: '',
        errorMessage: error.message,
      };
    }
  }
  
  private encryptInternalData(data: any): string {
    // EBM requires encrypted internal data
    // Implementation would use proper encryption
    return Buffer.from(JSON.stringify(data)).toString('base64');
  }
}
```

---

### 5. Burundi - Generic VAT Adapter

```typescript
/**
 * Burundi - Generic VAT compliance
 * 
 * No specific e-invoicing system required
 * Standard VAT calculation and reporting
 */
export class BurundiAdapter implements IComplianceAdapter {
  countryCode = 'BI';
  countryName = 'Burundi';
  vatRate = 18;
  vatName = 'TVA'; // Taxe sur la Valeur Ajoutée
  
  validateTaxId(nif: string): boolean {
    // Burundi NIF format: 13 digits
    return /^[0-9]{13}$/.test(nif);
  }
  
  async submitInvoice(invoice: Invoice): Promise<SubmissionResult> {
    // No real-time submission required
    // Just store invoice locally
    return {
      success: true,
      invoiceId: invoice.invoiceNumber,
    };
  }
  
  async generateQRCode(invoice: Invoice): Promise<string> {
    // Optional QR code for invoice
    const qrData = `INV:${invoice.invoiceNumber}|TOTAL:${invoice.total}`;
    return await QRCode.toDataURL(qrData);
  }
}
```

---

## Adapter Factory Pattern

```typescript
/**
 * Factory to create the appropriate compliance adapter
 * based on country code
 */
export class ComplianceAdapterFactory {
  static create(countryCode: CountryCode, config: any): IComplianceAdapter {
    switch (countryCode) {
      case 'KE':
        return new KenyaTIMSAdapter(config);
      case 'UG':
        return new UgandaEFRISAdapter(config);
      case 'TZ':
        return new TanzaniaVFDAdapter(config);
      case 'RW':
        return new RwandaEBMAdapter(config);
      case 'BI':
        return new BurundiAdapter(config);
      default:
        throw new Error(`Unsupported country code: ${countryCode}`);
    }
  }
}

// Usage example:
const business = getCurrentBusiness();
const adapter = ComplianceAdapterFactory.create(
  business.countryCode,
  business.complianceConfig
);

// Submit invoice using the appropriate adapter
const result = await adapter.submitInvoice(invoice);
if (result.success) {
  // Update invoice with compliance data
  invoice.complianceData = {
    invoiceId: result.invoiceId,
    qrCode: result.qrCode,
    verificationUrl: result.verificationUrl,
  };
}
```

---

## Service Layer Integration

```typescript
/**
 * Invoice service that uses compliance adapters
 */
export class InvoiceService {
  private complianceAdapter: IComplianceAdapter;
  
  constructor(countryCode: CountryCode, config: any) {
    this.complianceAdapter = ComplianceAdapterFactory.create(countryCode, config);
  }
  
  async createAndSubmitInvoice(invoiceData: InvoiceInput): Promise<Invoice> {
    // Step 1: Validate invoice
    const validation = this.complianceAdapter.validateInvoice(invoiceData);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }
    
    // Step 2: Calculate taxes
    const invoice = this.calculateTaxes(invoiceData);
    
    // Step 3: Save to database
    const savedInvoice = await db.invoices.create(invoice);
    
    // Step 4: Submit to compliance system
    const result = await this.complianceAdapter.submitInvoice(savedInvoice);
    
    // Step 5: Update invoice with compliance data
    if (result.success) {
      savedInvoice.complianceData = {
        invoiceId: result.invoiceId,
        qrCode: result.qrCode,
        verificationUrl: result.verificationUrl,
      };
      await db.invoices.update(savedInvoice.id, savedInvoice);
    }
    
    return savedInvoice;
  }
  
  private calculateTaxes(invoiceData: InvoiceInput): Invoice {
    // Apply country-specific VAT rate
    const vatRate = this.complianceAdapter.vatRate;
    
    invoiceData.items.forEach(item => {
      item.taxRate = vatRate;
      item.taxAmount = (item.quantity * item.unitPrice * vatRate) / 100;
      item.total = item.quantity * item.unitPrice + item.taxAmount;
    });
    
    const subtotal = invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = invoiceData.items.reduce((sum, item) => sum + item.taxAmount, 0);
    
    return {
      ...invoiceData,
      subtotal,
      taxAmount,
      total: subtotal + taxAmount,
    };
  }
}
```

---

## Benefits of This Design

1. **Extensibility**: Easy to add new countries by creating new adapter classes
2. **Maintainability**: Country-specific logic is isolated in separate adapters
3. **Testability**: Each adapter can be tested independently
4. **Flexibility**: Can swap adapters at runtime based on business configuration
5. **Consistency**: All adapters follow the same interface
6. **Separation of Concerns**: Business logic separate from compliance logic

---

## Testing Strategy

```typescript
describe('KenyaTIMSAdapter', () => {
  let adapter: KenyaTIMSAdapter;
  
  beforeEach(() => {
    adapter = new KenyaTIMSAdapter({
      cuSerialNumber: 'TEST123456',
    });
  });
  
  it('should validate Kenya PIN format', () => {
    expect(adapter.validateTaxId('P051234567M')).toBe(true);
    expect(adapter.validateTaxId('INVALID')).toBe(false);
  });
  
  it('should submit invoice to TIMS', async () => {
    const invoice = createMockInvoice();
    const result = await adapter.submitInvoice(invoice);
    
    expect(result.success).toBe(true);
    expect(result.invoiceId).toBeDefined();
    expect(result.qrCode).toBeDefined();
  });
});
```

---

This adapter design provides a robust, scalable foundation for multi-country tax compliance in the East Africa Accounting Platform.
