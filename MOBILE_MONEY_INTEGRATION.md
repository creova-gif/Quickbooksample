# Mobile Money Integration Guide

## Overview
Mobile money is the primary payment method across East Africa. This guide covers integration with the major mobile money providers in the region.

---

## Supported Providers

| Provider | Countries | Coverage |
|----------|-----------|----------|
| **M-Pesa** | Kenya, Tanzania | 85% market share |
| **Airtel Money** | Kenya, Uganda, Tanzania, Rwanda | 30% market share |
| **MTN Mobile Money** | Uganda, Rwanda | 40% market share |
| **Tigo Pesa** | Tanzania | 15% market share |

---

## Architecture

### 1. Payment Service Interface

```typescript
/**
 * Base interface for all mobile money providers
 */
interface IMobileMoneyProvider {
  providerName: string;
  supportedCountries: CountryCode[];
  
  // Initialize payment request
  initiatePayment(request: PaymentRequest): Promise<PaymentInitiation>;
  
  // Query payment status
  getPaymentStatus(referenceId: string): Promise<PaymentStatus>;
  
  // Handle callback/webhook
  handleCallback(data: any): Promise<CallbackResult>;
  
  // Initiate refund
  initiateRefund(originalTransactionId: string, amount: number): Promise<RefundResult>;
}

interface PaymentRequest {
  amount: number;
  currency: string;
  phoneNumber: string;
  accountReference: string; // Invoice number, etc.
  description: string;
  callbackUrl: string;
}

interface PaymentInitiation {
  success: boolean;
  checkoutRequestId: string;
  merchantRequestId?: string;
  message: string;
}

interface PaymentStatus {
  status: 'pending' | 'success' | 'failed' | 'cancelled';
  transactionId?: string;
  amount?: number;
  phoneNumber?: string;
  receiptNumber?: string;
  errorMessage?: string;
}
```

---

## M-Pesa Integration (Kenya & Tanzania)

### Implementation

```typescript
/**
 * M-Pesa STK Push (Lipa Na M-Pesa)
 * 
 * Flow:
 * 1. Request payment
 * 2. Customer receives STK push on phone
 * 3. Customer enters PIN
 * 4. Callback received with result
 */
export class MPesaProvider implements IMobileMoneyProvider {
  providerName = 'M-Pesa';
  supportedCountries: CountryCode[] = ['KE', 'TZ'];
  
  private apiUrl: string;
  private consumerKey: string;
  private consumerSecret: string;
  private shortcode: string;
  private passkey: string;
  
  constructor(config: MPesaConfig, country: CountryCode) {
    if (country === 'KE') {
      this.apiUrl = 'https://api.safaricom.co.ke';
    } else {
      this.apiUrl = 'https://api.vodacom.co.tz';
    }
    this.consumerKey = config.consumerKey;
    this.consumerSecret = config.consumerSecret;
    this.shortcode = config.shortcode;
    this.passkey = config.passkey;
  }
  
  async initiatePayment(request: PaymentRequest): Promise<PaymentInitiation> {
    try {
      // Step 1: Get OAuth token
      const token = await this.getAccessToken();
      
      // Step 2: Generate password
      const timestamp = this.getTimestamp();
      const password = Buffer.from(
        `${this.shortcode}${this.passkey}${timestamp}`
      ).toString('base64');
      
      // Step 3: Make STK push request
      const response = await axios.post(
        `${this.apiUrl}/mpesa/stkpush/v1/processrequest`,
        {
          BusinessShortCode: this.shortcode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: 'CustomerPayBillOnline',
          Amount: Math.round(request.amount),
          PartyA: this.formatPhoneNumber(request.phoneNumber),
          PartyB: this.shortcode,
          PhoneNumber: this.formatPhoneNumber(request.phoneNumber),
          CallBackURL: request.callbackUrl,
          AccountReference: request.accountReference,
          TransactionDesc: request.description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      return {
        success: response.data.ResponseCode === '0',
        checkoutRequestId: response.data.CheckoutRequestID,
        merchantRequestId: response.data.MerchantRequestID,
        message: response.data.CustomerMessage || 'Payment initiated',
      };
    } catch (error) {
      return {
        success: false,
        checkoutRequestId: '',
        message: error.response?.data?.errorMessage || error.message,
      };
    }
  }
  
  async handleCallback(callbackData: any): Promise<CallbackResult> {
    const { Body } = callbackData;
    const { stkCallback } = Body;
    
    if (stkCallback.ResultCode === 0) {
      // Payment successful
      const callbackMetadata = stkCallback.CallbackMetadata.Item;
      const amount = callbackMetadata.find((item: any) => item.Name === 'Amount')?.Value;
      const mpesaReceiptNumber = callbackMetadata.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value;
      const phoneNumber = callbackMetadata.find((item: any) => item.Name === 'PhoneNumber')?.Value;
      
      return {
        success: true,
        status: 'success',
        transactionId: mpesaReceiptNumber,
        amount,
        phoneNumber,
        message: 'Payment successful',
      };
    } else {
      // Payment failed
      return {
        success: false,
        status: 'failed',
        message: stkCallback.ResultDesc,
      };
    }
  }
  
  async getPaymentStatus(checkoutRequestId: string): Promise<PaymentStatus> {
    try {
      const token = await this.getAccessToken();
      const timestamp = this.getTimestamp();
      const password = Buffer.from(
        `${this.shortcode}${this.passkey}${timestamp}`
      ).toString('base64');
      
      const response = await axios.post(
        `${this.apiUrl}/mpesa/stkpushquery/v1/query`,
        {
          BusinessShortCode: this.shortcode,
          Password: password,
          Timestamp: timestamp,
          CheckoutRequestID: checkoutRequestId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      const resultCode = response.data.ResultCode;
      
      if (resultCode === '0') {
        return {
          status: 'success',
          transactionId: checkoutRequestId,
        };
      } else if (resultCode === '1032') {
        return {
          status: 'cancelled',
          errorMessage: 'User cancelled transaction',
        };
      } else {
        return {
          status: 'failed',
          errorMessage: response.data.ResultDesc,
        };
      }
    } catch (error) {
      return {
        status: 'pending',
        errorMessage: error.message,
      };
    }
  }
  
  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(
      `${this.consumerKey}:${this.consumerSecret}`
    ).toString('base64');
    
    const response = await axios.get(
      `${this.apiUrl}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );
    
    return response.data.access_token;
  }
  
  private formatPhoneNumber(phone: string): string {
    // Remove any non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // For Kenya, ensure format is 254XXXXXXXXX
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.substring(1);
    } else if (cleaned.startsWith('254')) {
      // Already in correct format
    } else if (cleaned.startsWith('+254')) {
      cleaned = cleaned.substring(1);
    }
    
    return cleaned;
  }
  
  private getTimestamp(): string {
    return new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  }
  
  async initiateRefund(originalTransactionId: string, amount: number): Promise<RefundResult> {
    // M-Pesa B2C reversal
    try {
      const token = await this.getAccessToken();
      
      const response = await axios.post(
        `${this.apiUrl}/mpesa/reversal/v1/request`,
        {
          Initiator: 'API_USER',
          SecurityCredential: this.getSecurityCredential(),
          CommandID: 'TransactionReversal',
          TransactionID: originalTransactionId,
          Amount: amount,
          ReceiverParty: this.shortcode,
          ResultURL: process.env.MPESA_RESULT_URL,
          QueueTimeOutURL: process.env.MPESA_TIMEOUT_URL,
          Remarks: 'Refund',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      return {
        success: true,
        refundId: response.data.ConversationID,
      };
    } catch (error) {
      return {
        success: false,
        errorMessage: error.message,
      };
    }
  }
  
  private getSecurityCredential(): string {
    // Encrypt initiator password with M-Pesa public key
    // Implementation would use proper encryption
    return 'ENCRYPTED_PASSWORD';
  }
}
```

---

## Airtel Money Integration

```typescript
/**
 * Airtel Money integration
 * Supports Kenya, Uganda, Tanzania, Rwanda
 */
export class AirtelMoneyProvider implements IMobileMoneyProvider {
  providerName = 'Airtel Money';
  supportedCountries: CountryCode[] = ['KE', 'UG', 'TZ', 'RW'];
  
  private apiUrl = 'https://openapiuat.airtel.africa'; // Prod: openapi.airtel.africa
  private clientId: string;
  private clientSecret: string;
  private merchantId: string;
  
  constructor(config: AirtelMoneyConfig) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.merchantId = config.merchantId;
  }
  
  async initiatePayment(request: PaymentRequest): Promise<PaymentInitiation> {
    try {
      // Step 1: Get access token
      const token = await this.getAccessToken();
      
      // Step 2: Initiate payment
      const response = await axios.post(
        `${this.apiUrl}/merchant/v1/payments/`,
        {
          reference: request.accountReference,
          subscriber: {
            country: this.getCountryFromCurrency(request.currency),
            currency: request.currency,
            msisdn: this.formatPhoneNumber(request.phoneNumber),
          },
          transaction: {
            amount: request.amount,
            country: this.getCountryFromCurrency(request.currency),
            currency: request.currency,
            id: this.generateTransactionId(),
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-Country': this.getCountryFromCurrency(request.currency),
            'X-Currency': request.currency,
            'Content-Type': 'application/json',
          },
        }
      );
      
      return {
        success: response.data.status.success,
        checkoutRequestId: response.data.data.transaction.id,
        message: response.data.status.message,
      };
    } catch (error) {
      return {
        success: false,
        checkoutRequestId: '',
        message: error.message,
      };
    }
  }
  
  async getPaymentStatus(transactionId: string): Promise<PaymentStatus> {
    try {
      const token = await this.getAccessToken();
      
      const response = await axios.get(
        `${this.apiUrl}/standard/v1/payments/${transactionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      const status = response.data.data.transaction.status;
      
      return {
        status: this.mapAirtelStatus(status),
        transactionId,
        amount: response.data.data.transaction.amount,
        phoneNumber: response.data.data.transaction.msisdn,
      };
    } catch (error) {
      return {
        status: 'failed',
        errorMessage: error.message,
      };
    }
  }
  
  private async getAccessToken(): Promise<string> {
    const response = await axios.post(
      `${this.apiUrl}/auth/oauth2/token`,
      {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'client_credentials',
      }
    );
    
    return response.data.access_token;
  }
  
  private formatPhoneNumber(phone: string): string {
    // Format based on country
    return phone.replace(/\D/g, '');
  }
  
  private getCountryFromCurrency(currency: string): string {
    const mapping: Record<string, string> = {
      KES: 'KE',
      UGX: 'UG',
      TZS: 'TZ',
      RWF: 'RW',
    };
    return mapping[currency] || 'KE';
  }
  
  private generateTransactionId(): string {
    return `AIRTEL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private mapAirtelStatus(airtelStatus: string): PaymentStatus['status'] {
    const mapping: Record<string, PaymentStatus['status']> = {
      'TS': 'success',
      'TF': 'failed',
      'TA': 'pending',
      'TC': 'cancelled',
    };
    return mapping[airtelStatus] || 'pending';
  }
  
  async handleCallback(callbackData: any): Promise<CallbackResult> {
    const transaction = callbackData.transaction;
    
    return {
      success: transaction.status === 'TS',
      status: this.mapAirtelStatus(transaction.status),
      transactionId: transaction.id,
      amount: transaction.amount,
      message: transaction.message,
    };
  }
  
  async initiateRefund(originalTransactionId: string, amount: number): Promise<RefundResult> {
    try {
      const token = await this.getAccessToken();
      
      const response = await axios.post(
        `${this.apiUrl}/standard/v1/payments/refund`,
        {
          transaction: {
            airtel_money_id: originalTransactionId,
          },
          refund: {
            amount: amount,
            reference: `REFUND-${Date.now()}`,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      return {
        success: true,
        refundId: response.data.data.transaction.id,
      };
    } catch (error) {
      return {
        success: false,
        errorMessage: error.message,
      };
    }
  }
}
```

---

## MTN Mobile Money Integration

```typescript
/**
 * MTN Mobile Money (Uganda & Rwanda)
 */
export class MTNMoMoProvider implements IMobileMoneyProvider {
  providerName = 'MTN Mobile Money';
  supportedCountries: CountryCode[] = ['UG', 'RW'];
  
  private apiUrl = 'https://sandbox.momodeveloper.mtn.com'; // Prod URL different
  private subscriptionKey: string;
  private userId: string;
  private apiKey: string;
  
  async initiatePayment(request: PaymentRequest): Promise<PaymentInitiation> {
    try {
      const token = await this.getAccessToken();
      const referenceId = this.generateUUID();
      
      const response = await axios.post(
        `${this.apiUrl}/collection/v1_0/requesttopay`,
        {
          amount: request.amount.toString(),
          currency: request.currency,
          externalId: request.accountReference,
          payer: {
            partyIdType: 'MSISDN',
            partyId: this.formatPhoneNumber(request.phoneNumber),
          },
          payerMessage: request.description,
          payeeNote: request.description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-Reference-Id': referenceId,
            'X-Target-Environment': 'sandbox',
            'Ocp-Apim-Subscription-Key': this.subscriptionKey,
            'Content-Type': 'application/json',
          },
        }
      );
      
      return {
        success: true,
        checkoutRequestId: referenceId,
        message: 'Payment initiated',
      };
    } catch (error) {
      return {
        success: false,
        checkoutRequestId: '',
        message: error.message,
      };
    }
  }
  
  async getPaymentStatus(referenceId: string): Promise<PaymentStatus> {
    try {
      const token = await this.getAccessToken();
      
      const response = await axios.get(
        `${this.apiUrl}/collection/v1_0/requesttopay/${referenceId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-Target-Environment': 'sandbox',
            'Ocp-Apim-Subscription-Key': this.subscriptionKey,
          },
        }
      );
      
      const data = response.data;
      
      return {
        status: this.mapMTNStatus(data.status),
        transactionId: data.financialTransactionId,
        amount: parseFloat(data.amount),
        phoneNumber: data.payer.partyId,
      };
    } catch (error) {
      return {
        status: 'pending',
        errorMessage: error.message,
      };
    }
  }
  
  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.userId}:${this.apiKey}`).toString('base64');
    
    const response = await axios.post(
      `${this.apiUrl}/collection/token/`,
      {},
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Ocp-Apim-Subscription-Key': this.subscriptionKey,
        },
      }
    );
    
    return response.data.access_token;
  }
  
  private mapMTNStatus(mtnStatus: string): PaymentStatus['status'] {
    const mapping: Record<string, PaymentStatus['status']> = {
      'SUCCESSFUL': 'success',
      'FAILED': 'failed',
      'PENDING': 'pending',
    };
    return mapping[mtnStatus] || 'pending';
  }
  
  private formatPhoneNumber(phone: string): string {
    return phone.replace(/\D/g, '');
  }
  
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
  
  async handleCallback(callbackData: any): Promise<CallbackResult> {
    return {
      success: callbackData.status === 'SUCCESSFUL',
      status: this.mapMTNStatus(callbackData.status),
      transactionId: callbackData.financialTransactionId,
      amount: parseFloat(callbackData.amount),
      message: callbackData.reason || 'Payment processed',
    };
  }
  
  async initiateRefund(originalTransactionId: string, amount: number): Promise<RefundResult> {
    // MTN MoMo refund implementation
    return {
      success: false,
      errorMessage: 'Refunds not yet implemented for MTN MoMo',
    };
  }
}
```

---

## Payment Provider Factory

```typescript
/**
 * Factory to create appropriate mobile money provider
 */
export class MobileMoneyFactory {
  static create(
    provider: 'mpesa' | 'airtel' | 'mtn' | 'tigo',
    config: any,
    countryCode: CountryCode
  ): IMobileMoneyProvider {
    switch (provider) {
      case 'mpesa':
        return new MPesaProvider(config, countryCode);
      case 'airtel':
        return new AirtelMoneyProvider(config);
      case 'mtn':
        return new MTNMoMoProvider(config);
      case 'tigo':
        return new TigoPesaProvider(config);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }
}

// Usage example:
const business = getCurrentBusiness();
const provider = MobileMoneyFactory.create(
  'mpesa',
  business.paymentConfig.mpesa,
  business.countryCode
);

// Initiate payment
const result = await provider.initiatePayment({
  amount: 5000,
  currency: 'KES',
  phoneNumber: '254712345678',
  accountReference: 'INV-001',
  description: 'Invoice payment',
  callbackUrl: 'https://myapp.com/api/payments/callback',
});

if (result.success) {
  console.log('Payment initiated:', result.checkoutRequestId);
}
```

---

## Webhook/Callback Handler

```typescript
/**
 * Express.js route to handle mobile money callbacks
 */
app.post('/api/payments/callback/:provider', async (req, res) => {
  const { provider } = req.params;
  const callbackData = req.body;
  
  try {
    // Get appropriate provider
    const paymentProvider = MobileMoneyFactory.create(
      provider as any,
      getProviderConfig(provider),
      'KE'
    );
    
    // Handle callback
    const result = await paymentProvider.handleCallback(callbackData);
    
    if (result.success) {
      // Update invoice payment status
      await updateInvoicePayment({
        invoiceId: result.accountReference,
        transactionId: result.transactionId,
        amount: result.amount,
        phoneNumber: result.phoneNumber,
        status: 'paid',
      });
      
      // Send receipt to customer
      await sendPaymentReceipt(result.transactionId);
    }
    
    res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (error) {
    console.error('Callback error:', error);
    res.status(500).json({ ResultCode: 1, ResultDesc: 'Error' });
  }
});
```

---

## Frontend Integration

```typescript
/**
 * React component for mobile money payment
 */
export function MobileMoneyPayment({ invoice }: { invoice: Invoice }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [provider, setProvider] = useState<'mpesa' | 'airtel' | 'mtn'>('mpesa');
  const [isProcessing, setIsProcessing] = useState(false);
  const { business } = useBusiness();
  
  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      const response = await axios.post('/api/payments/initiate', {
        provider,
        amount: invoice.total,
        phoneNumber,
        invoiceId: invoice.id,
      });
      
      if (response.data.success) {
        toast.success('Payment request sent! Check your phone.');
        
        // Poll for payment status
        pollPaymentStatus(response.data.checkoutRequestId);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('Payment initiation failed');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const pollPaymentStatus = (checkoutRequestId: string) => {
    const interval = setInterval(async () => {
      const status = await axios.get(`/api/payments/status/${checkoutRequestId}`);
      
      if (status.data.status === 'success') {
        clearInterval(interval);
        toast.success('Payment successful!');
        // Refresh invoice
      } else if (status.data.status === 'failed' || status.data.status === 'cancelled') {
        clearInterval(interval);
        toast.error('Payment failed or cancelled');
      }
    }, 3000);
    
    // Stop polling after 2 minutes
    setTimeout(() => clearInterval(interval), 120000);
  };
  
  return (
    <div className="space-y-4">
      <Select value={provider} onValueChange={(value: any) => setProvider(value)}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="mpesa">M-Pesa</SelectItem>
          <SelectItem value="airtel">Airtel Money</SelectItem>
          <SelectItem value="mtn">MTN Mobile Money</SelectItem>
        </SelectContent>
      </Select>
      
      <Input
        type="tel"
        placeholder="Phone number"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
      />
      
      <Button onClick={handlePayment} disabled={isProcessing} className="w-full">
        {isProcessing ? 'Processing...' : `Pay ${formatCurrency(invoice.total, business.countryCode)}`}
      </Button>
    </div>
  );
}
```

---

This integration provides a complete mobile money payment solution for East African businesses.
