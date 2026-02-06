import React, { useState, useEffect } from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  Smartphone,
  CheckCircle,
  Loader2,
  AlertCircle,
  ArrowRight,
  CreditCard,
} from 'lucide-react';
import { toast } from 'sonner';
import { Invoice } from '@/types';

interface PaymentProvider {
  id: string;
  name: string;
  icon: string;
  countries: string[];
  ussdCode?: string;
  minAmount: number;
  maxAmount: number;
}

const PAYMENT_PROVIDERS: PaymentProvider[] = [
  {
    id: 'mpesa',
    name: 'M-Pesa',
    icon: '📱',
    countries: ['KE', 'TZ'],
    ussdCode: '*334#',
    minAmount: 10,
    maxAmount: 250000,
  },
  {
    id: 'airtel',
    name: 'Airtel Money',
    icon: '🔴',
    countries: ['KE', 'UG', 'TZ'],
    ussdCode: '*185#',
    minAmount: 10,
    maxAmount: 500000,
  },
  {
    id: 'tigo',
    name: 'Tigo Pesa',
    icon: '🔵',
    countries: ['TZ'],
    ussdCode: '*150*01#',
    minAmount: 1000,
    maxAmount: 2000000,
  },
  {
    id: 'mtn',
    name: 'MTN Mobile Money',
    icon: '🟡',
    countries: ['UG', 'RW'],
    ussdCode: '*165#',
    minAmount: 100,
    maxAmount: 5000000,
  },
];

type PaymentStep = 'select-provider' | 'enter-details' | 'processing' | 'success' | 'failed';

interface MobileMoneyPaymentProps {
  invoice?: Invoice;
  amount: number;
  onSuccess?: (reference: string) => void;
  onCancel?: () => void;
}

export function MobileMoneyPayment({ 
  invoice, 
  amount, 
  onSuccess, 
  onCancel 
}: MobileMoneyPaymentProps) {
  const { business } = useBusiness();
  const [step, setStep] = useState<PaymentStep>('select-provider');
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Filter providers by country
  const availableProviders = PAYMENT_PROVIDERS.filter(
    provider => provider.countries.includes(business?.countryCode || '')
  );

  // Countdown timer for processing
  useEffect(() => {
    if (step === 'processing' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [step, countdown]);

  const handleProviderSelect = (providerId: string) => {
    const provider = availableProviders.find(p => p.id === providerId);
    if (provider) {
      setSelectedProvider(provider);
      setStep('enter-details');
    }
  };

  const initiatePayment = async () => {
    if (!selectedProvider || !phoneNumber) {
      toast.error('Please enter your phone number');
      return;
    }

    // Validate phone number
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setStep('processing');
    setCountdown(60); // 60 seconds timeout

    // Simulate API call to payment provider
    try {
      // In production, this would call the actual payment API
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Simulate successful payment
      const mockReference = `${selectedProvider.id.toUpperCase()}-${Date.now()}`;
      setPaymentReference(mockReference);
      setStep('success');
      
      toast.success('Payment received!');
      onSuccess?.(mockReference);
    } catch (error) {
      setStep('failed');
      toast.error('Payment failed. Please try again.');
    }
  };

  const handleCancel = () => {
    if (step === 'processing') {
      toast.error('Please complete or cancel the payment on your phone first');
      return;
    }
    onCancel?.();
  };

  return (
    <div className="space-y-4">
      {/* Select Provider */}
      {step === 'select-provider' && (
        <>
          <Card className="p-4">
            <div className="text-center mb-4">
              <h3 className="font-semibold text-lg mb-1">Pay with Mobile Money</h3>
              <p className="text-2xl font-bold text-blue-600">
                {business?.currency} {amount.toLocaleString()}
              </p>
              {invoice && (
                <p className="text-sm text-muted-foreground mt-1">
                  Invoice #{invoice.invoiceNumber}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Select Payment Method</Label>
              {availableProviders.map((provider) => (
                <Card
                  key={provider.id}
                  className="p-4 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all"
                  onClick={() => handleProviderSelect(provider.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{provider.icon}</span>
                      <div>
                        <p className="font-semibold">{provider.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Dial {provider.ussdCode} on your phone
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          {onCancel && (
            <Button variant="outline" className="w-full" onClick={handleCancel}>
              Cancel
            </Button>
          )}
        </>
      )}

      {/* Enter Details */}
      {step === 'enter-details' && selectedProvider && (
        <>
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{selectedProvider.icon}</span>
              <div>
                <p className="font-semibold">{selectedProvider.name}</p>
                <p className="text-sm text-muted-foreground">
                  {business?.currency} {amount.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="0712345678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Enter your {selectedProvider.name} registered number
                </p>
              </div>

              {/* Payment Instructions */}
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-2">
                  📱 How to pay:
                </p>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Click "Pay Now" below</li>
                  <li>You'll receive a prompt on your phone</li>
                  <li>Enter your {selectedProvider.name} PIN</li>
                  <li>Confirm the payment</li>
                </ol>
              </div>

              {/* Limits */}
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Min: {business?.currency} {selectedProvider.minAmount.toLocaleString()}</span>
                <span>Max: {business?.currency} {selectedProvider.maxAmount.toLocaleString()}</span>
              </div>
            </div>
          </Card>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setStep('select-provider')}
            >
              Back
            </Button>
            <Button
              className="flex-1"
              onClick={initiatePayment}
              disabled={!phoneNumber}
            >
              Pay Now
            </Button>
          </div>
        </>
      )}

      {/* Processing */}
      {step === 'processing' && selectedProvider && (
        <Card className="p-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto">
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Waiting for Payment...</h3>
              <p className="text-sm text-muted-foreground">
                Check your phone for the payment prompt
              </p>
            </div>

            {/* Countdown */}
            <div className="text-3xl font-bold text-blue-600">
              {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 rounded-lg p-4 text-left">
              <p className="text-sm font-medium text-blue-900 mb-2">
                {selectedProvider.icon} {selectedProvider.name} Instructions:
              </p>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Check your phone ({phoneNumber})</li>
                <li>You should see a payment request</li>
                <li>Enter your PIN to confirm</li>
                <li>Wait for SMS confirmation</li>
              </ol>
            </div>

            {/* Didn't receive? */}
            <div className="text-sm text-muted-foreground">
              Didn't receive a prompt?{' '}
              <button
                className="text-blue-600 hover:underline"
                onClick={() => setStep('enter-details')}
              >
                Try again
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Success */}
      {step === 'success' && (
        <Card className="p-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Payment Successful!</h3>
              <p className="text-sm text-muted-foreground">
                Your payment has been received
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {business?.currency} {amount.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Ref: {paymentReference}
              </p>
            </div>

            {/* SMS Confirmation */}
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-900">
                📱 You will receive an SMS confirmation shortly
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Failed */}
      {step === 'failed' && (
        <Card className="p-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Payment Failed</h3>
              <p className="text-sm text-muted-foreground">
                The payment could not be processed
              </p>
            </div>

            {/* Common reasons */}
            <div className="bg-red-50 rounded-lg p-4 text-left">
              <p className="text-sm font-medium text-red-900 mb-2">
                Common reasons:
              </p>
              <ul className="text-sm text-red-800 space-y-1">
                <li>• Insufficient balance</li>
                <li>• Wrong PIN entered</li>
                <li>• Transaction cancelled</li>
                <li>• Network timeout</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={() => setStep('enter-details')}
              >
                Try Again
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
