/**
 * Modular Tax Adapter for East Africa Countries
 * Generates country-compliant invoice payloads for tax authorities
 * 
 * Supported Systems:
 * - Kenya: TIMS (Tax Invoice Management System)
 * - Uganda: EFRIS (Electronic Fiscal Receipting and Invoicing Solution)
 * - Tanzania: VFD (Virtual Fiscal Device)
 * - Rwanda: EBM (Electronic Billing Machines)
 * - Burundi: Generic VAT compliance
 */

class TaxAdapter {
  constructor(country) {
    this.country = country;
    this.vatRates = {
      'Kenya': 16,
      'Uganda': 18,
      'Tanzania': 18,
      'Rwanda': 18,
      'Burundi': 18,
    };
  }

  /**
   * Generate country-specific invoice payload
   * @param {Object} invoice - Invoice object
   * @returns {Object} Country-compliant invoice payload
   */
  generateInvoicePayload(invoice) {
    switch(this.country) {
      case 'Kenya':
        return this._formatTIMS(invoice);
      case 'Uganda':
        return this._formatEFRIS(invoice);
      case 'Tanzania':
        return this._formatVFD(invoice);
      case 'Rwanda':
        return this._formatEBM(invoice);
      case 'Burundi':
        return this._formatGeneric(invoice);
      default:
        throw new Error(`Unsupported country: ${this.country}`);
    }
  }

  /**
   * Validate TIN format by country
   * @param {String} tin - Tax Identification Number
   * @returns {Boolean} Valid or not
   */
  validateTIN(tin) {
    const patterns = {
      'Kenya': /^[A-Z]\d{9}[A-Z]$/,        // P051234567M
      'Uganda': /^\d{10}$/,                 // 1000123456
      'Tanzania': /^\d{3}-\d{3}-\d{3}$/,   // 100-123-456
      'Rwanda': /^\d{9}$/,                  // 100123456
      'Burundi': /^\d{8,10}$/,              // Generic
    };

    const pattern = patterns[this.country];
    return pattern ? pattern.test(tin) : false;
  }

  /**
   * Calculate VAT by country
   * @param {Number} amount - Base amount
   * @returns {Object} { vatAmount, totalWithVat, vatRate }
   */
  calculateVAT(amount) {
    const vatRate = this.vatRates[this.country] || 18;
    const vatAmount = (amount * vatRate) / 100;
    const totalWithVat = amount + vatAmount;

    return {
      vatRate,
      vatAmount: parseFloat(vatAmount.toFixed(2)),
      totalWithVat: parseFloat(totalWithVat.toFixed(2)),
    };
  }

  /**
   * Kenya TIMS Format
   * TIMS API: https://itax.kra.go.ke/KRA-Portal/
   */
  _formatTIMS(invoice) {
    return {
      // Header
      invoiceNumber: invoice.invoiceNumber,
      invoiceType: 'TAX_INVOICE',
      invoiceDate: invoice.date,
      dueDate: invoice.dueDate,
      
      // Seller (Business)
      seller: {
        pin: invoice.business.taxId,
        name: invoice.business.name,
        address: invoice.business.address,
        phone: invoice.business.phone,
        email: invoice.business.email,
      },
      
      // Buyer (Customer)
      buyer: {
        pin: invoice.customerTaxId || 'N/A',
        name: invoice.customerName,
        phone: invoice.customerPhone,
        email: invoice.customerEmail,
      },
      
      // Line Items
      items: invoice.items.map((item, index) => ({
        itemSequence: index + 1,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxCategory: 'A',  // Standard rated
        taxRate: 16,
        taxAmount: item.taxAmount,
        totalAmount: item.total,
      })),
      
      // Totals
      summary: {
        subtotal: invoice.subtotal,
        vatAmount: invoice.taxAmount,
        totalAmount: invoice.total,
        currency: invoice.currency,
      },
      
      // Metadata
      submissionDate: new Date(),
      timsVersion: '1.0',
      deviceSerialNumber: process.env.TIMS_DEVICE_SERIAL || 'DEV-001',
    };
  }

  /**
   * Uganda EFRIS Format
   * EFRIS API: https://efris.ura.go.ug/
   */
  _formatEFRIS(invoice) {
    return {
      // Document Header
      basicInformation: {
        invoiceNo: invoice.invoiceNumber,
        invoiceType: '1',  // Normal invoice
        invoiceKind: '1',  // Standard
        dataSource: 'WEB',
        invoiceIndustryCode: 'GENERAL',
        currency: invoice.currency,
      },
      
      // Seller Info
      sellerDetails: {
        tin: invoice.business.taxId,
        legalName: invoice.business.name,
        businessName: invoice.business.name,
        address: invoice.business.address,
        mobilePhone: invoice.business.phone,
        emailAddress: invoice.business.email,
      },
      
      // Buyer Info
      buyerDetails: {
        buyerTin: invoice.customerTaxId || '',
        buyerLegalName: invoice.customerName,
        buyerMobilePhone: invoice.customerPhone,
        buyerEmail: invoice.customerEmail,
        buyerType: invoice.customerTaxId ? 'BUSINESS' : 'INDIVIDUAL',
      },
      
      // Goods/Services Details
      goodsDetails: invoice.items.map((item, index) => ({
        item: index + 1,
        itemCode: item.code || `ITEM-${index + 1}`,
        goodsName: item.description,
        quantity: item.quantity.toString(),
        unitPrice: item.unitPrice.toString(),
        total: item.total.toString(),
        taxRate: '18',
        tax: item.taxAmount.toString(),
        discountTotal: '0',
        discountTaxRate: '0',
      })),
      
      // Tax Summary
      taxDetails: [{
        taxCategoryCode: 'STANDARD',
        netAmount: invoice.subtotal.toString(),
        taxRate: '18',
        taxAmount: invoice.taxAmount.toString(),
        grossAmount: invoice.total.toString(),
      }],
      
      // Summary
      summary: {
        netAmount: invoice.subtotal,
        taxAmount: invoice.taxAmount,
        grossAmount: invoice.total,
      },
      
      // Metadata
      referenceNo: invoice.id,
      invoiceDate: invoice.date,
      dueDate: invoice.dueDate,
      operator: invoice.createdBy || 'SYSTEM',
      fdmSignature: '',  // To be generated by EFRIS
    };
  }

  /**
   * Tanzania VFD Format
   * TRA VFD: https://www.tra.go.tz/
   */
  _formatVFD(invoice) {
    return {
      // Receipt Header
      receiptType: 'NORMAL',
      receiptNumber: invoice.invoiceNumber,
      date: invoice.date,
      time: new Date().toISOString(),
      
      // Seller
      tin: invoice.business.taxId,
      businessName: invoice.business.name,
      vfdSerialNumber: process.env.VFD_SERIAL || 'VFD-001',
      
      // Customer
      customerName: invoice.customerName,
      customerTIN: invoice.customerTaxId || '',
      customerPhone: invoice.customerPhone,
      
      // Items
      items: invoice.items.map((item, index) => ({
        itemNo: index + 1,
        description: item.description,
        qty: item.quantity,
        unitPrice: item.unitPrice,
        amount: item.total - item.taxAmount,
        vatCategory: 'A',  // Standard
        vatRate: 18,
        vatAmount: item.taxAmount,
        totalAmount: item.total,
      })),
      
      // Totals
      totals: {
        subtotal: invoice.subtotal,
        vatAmount: invoice.taxAmount,
        totalAmount: invoice.total,
      },
      
      // Payment
      paymentType: invoice.paymentMethod || 'CASH',
      currency: invoice.currency,
      
      // VFD Specific
      vfdDate: new Date().toISOString(),
      verificationCode: '',  // To be generated by VFD device
      verificationUrl: 'https://verify.tra.go.tz/',
    };
  }

  /**
   * Rwanda EBM Format
   * RRA EBM: https://www.rra.gov.rw/
   */
  _formatEBM(invoice) {
    return {
      // Invoice Header
      invoiceIdentifier: invoice.invoiceNumber,
      invoiceDate: invoice.date,
      invoiceType: 'NORMAL_INVOICE',
      
      // Seller
      sellerTIN: invoice.business.taxId,
      sellerName: invoice.business.name,
      sellerAddress: invoice.business.address,
      sellerPhone: invoice.business.phone,
      ebmSerialNumber: process.env.EBM_SERIAL || 'EBM-001',
      sdcId: process.env.SDC_ID || 'SDC-001',
      
      // Customer
      customerTIN: invoice.customerTaxId || '',
      customerName: invoice.customerName,
      customerPhone: invoice.customerPhone,
      
      // Items
      itemList: invoice.items.map((item, index) => ({
        itemSequence: index + 1,
        itemCode: item.code || `ITEM-${index + 1}`,
        itemName: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        itemTaxCategory: 'A',  // Standard
        itemTaxRate: 18,
        itemTaxAmount: item.taxAmount,
        itemTotalAmount: item.total,
      })),
      
      // Summary
      invoiceSummary: {
        totalItemCount: invoice.items.length,
        taxableAmount: invoice.subtotal,
        taxAmount: invoice.taxAmount,
        totalAmount: invoice.total,
      },
      
      // Payment
      paymentMode: invoice.paymentMethod || 'CASH',
      currency: invoice.currency,
      
      // EBM Specific
      issueDate: new Date().toISOString(),
      internalData: '',  // To be signed by EBM
      receiptSignature: '',  // To be generated by EBM
      receiptQRCode: '',  // To be generated
    };
  }

  /**
   * Burundi Generic Format
   * Standard invoice format (no specific e-invoicing system yet)
   */
  _formatGeneric(invoice) {
    return {
      // Standard Invoice Format
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.date,
      dueDate: invoice.dueDate,
      
      // Business
      business: {
        name: invoice.business.name,
        nif: invoice.business.taxId,  // NIF = Numéro d'Identification Fiscale
        address: invoice.business.address,
        phone: invoice.business.phone,
        email: invoice.business.email,
      },
      
      // Customer
      customer: {
        name: invoice.customerName,
        nif: invoice.customerTaxId || '',
        phone: invoice.customerPhone,
        email: invoice.customerEmail,
      },
      
      // Items
      items: invoice.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: item.total - item.taxAmount,
        tvaRate: 18,  // TVA = Taxe sur la Valeur Ajoutée (VAT in French)
        tvaAmount: item.taxAmount,
        total: item.total,
      })),
      
      // Totals
      summary: {
        subtotal: invoice.subtotal,
        tvaAmount: invoice.taxAmount,
        totalAmount: invoice.total,
        currency: invoice.currency,
      },
      
      // Payment
      paymentTerms: invoice.paymentTerms || 'NET 30',
      paymentMethod: invoice.paymentMethod || 'CASH',
    };
  }

  /**
   * Get country-specific invoice number format
   * @param {Number} sequence - Invoice sequence number
   * @returns {String} Formatted invoice number
   */
  formatInvoiceNumber(sequence) {
    const year = new Date().getFullYear();
    const padded = sequence.toString().padStart(4, '0');
    
    const prefixes = {
      'Kenya': 'KE',
      'Uganda': 'UG',
      'Tanzania': 'TZ',
      'Rwanda': 'RW',
      'Burundi': 'BI',
    };
    
    const prefix = prefixes[this.country] || 'INV';
    return `${prefix}-${year}-${padded}`;
  }

  /**
   * Get country-specific tax authority details
   * @returns {Object} Tax authority info
   */
  getTaxAuthorityInfo() {
    const authorities = {
      'Kenya': {
        name: 'Kenya Revenue Authority (KRA)',
        system: 'TIMS',
        website: 'https://itax.kra.go.ke/',
        filingFrequency: 'Monthly',
        filingDeadline: '20th of following month',
      },
      'Uganda': {
        name: 'Uganda Revenue Authority (URA)',
        system: 'EFRIS',
        website: 'https://efris.ura.go.ug/',
        filingFrequency: 'Monthly',
        filingDeadline: '15th of following month',
      },
      'Tanzania': {
        name: 'Tanzania Revenue Authority (TRA)',
        system: 'VFD',
        website: 'https://www.tra.go.tz/',
        filingFrequency: 'Monthly',
        filingDeadline: '20th of following month',
      },
      'Rwanda': {
        name: 'Rwanda Revenue Authority (RRA)',
        system: 'EBM',
        website: 'https://www.rra.gov.rw/',
        filingFrequency: 'Monthly',
        filingDeadline: '15th of following month',
      },
      'Burundi': {
        name: 'Office Burundais des Recettes (OBR)',
        system: 'Generic',
        website: 'https://www.obr.bi/',
        filingFrequency: 'Monthly',
        filingDeadline: '20th of following month',
      },
    };
    
    return authorities[this.country] || authorities['Burundi'];
  }
}

module.exports = TaxAdapter;
