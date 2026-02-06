import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Checkbox } from '@/app/components/ui/checkbox';
import { CountryCode } from '@/types';
import { getAllCountries } from '@/lib/countries';
import { useBusiness } from '@/contexts/BusinessContext';
import { Check, Building2, MapPin, FileText, Sparkles } from 'lucide-react';
import { generateDemoTransactions, generateDemoInvoices, generateDemoCustomers } from '@/lib/demo-data';
import { BusinessStorage } from '@/lib/storage';

interface OnboardingStep {
  title: string;
  description: string;
}

const steps: OnboardingStep[] = [
  { title: 'Country', description: 'Select your business location' },
  { title: 'Business Info', description: 'Tell us about your business' },
  { title: 'Tax Details', description: 'Configure tax settings' },
  { title: 'Ready!', description: 'All set to get started' },
];

interface OnboardingWizardProps {
  onComplete: () => void;
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const { createBusiness } = useBusiness();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    countryCode: '' as CountryCode | '',
    name: '',
    industry: '',
    phone: '',
    email: '',
    address: '',
    taxId: '',
    registrationNumber: '',
    vatRegistered: false,
    loadDemoData: false, // New field for demo data
  });

  const countries = getAllCountries();
  const selectedCountry = countries.find(c => c.code === formData.countryCode);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    if (formData.countryCode) {
      const country = countries.find(c => c.code === formData.countryCode);
      const newBusiness = {
        name: formData.name,
        countryCode: formData.countryCode,
        currency: country!.currency,
        taxId: formData.taxId,
        registrationNumber: formData.registrationNumber,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        industry: formData.industry,
        vatRegistered: formData.vatRegistered,
      };
      
      createBusiness(newBusiness);
      
      // Load demo data if requested
      if (formData.loadDemoData) {
        // Give time for business to be created
        setTimeout(() => {
          const storage = new BusinessStorage(`${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
          const transactions = generateDemoTransactions(formData.countryCode as CountryCode);
          const invoices = generateDemoInvoices(formData.countryCode as CountryCode);
          const customers = generateDemoCustomers();
          
          storage.set('transactions', transactions);
          storage.set('invoices', invoices);
          storage.set('customers', customers);
        }, 100);
      }
      
      onComplete();
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return formData.countryCode !== '';
      case 1:
        return formData.name.trim() !== '';
      case 2:
        return true;
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center gap-2 text-blue-600">
              <Building2 className="w-8 h-8" />
              <span className="text-2xl font-bold">East Africa Accounting</span>
            </div>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                      index < currentStep
                        ? 'bg-green-500 text-white'
                        : index === currentStep
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {index < currentStep ? <Check className="w-5 h-5" /> : index + 1}
                  </div>
                  <span className="text-xs mt-2 text-center max-w-[80px]">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 w-12 mx-2 transition-colors ${
                      index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="text-center">
            <CardTitle>{steps[currentStep].title}</CardTitle>
            <CardDescription>{steps[currentStep].description}</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 0: Country Selection */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="country">Select Your Country</Label>
                <Select
                  value={formData.countryCode}
                  onValueChange={(value) => setFormData({ ...formData, countryCode: value as CountryCode })}
                >
                  <SelectTrigger id="country" className="h-12">
                    <SelectValue placeholder="Choose your country..." />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{country.flag}</span>
                          <div>
                            <div className="font-medium">{country.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {country.currency} • {country.vatName} {country.vatRate}%
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCountry && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-blue-900 font-semibold">
                    <MapPin className="w-4 h-4" />
                    <span>Localization Applied</span>
                  </div>
                  <ul className="text-sm text-blue-800 space-y-1 ml-6">
                    <li>✓ Currency: {selectedCountry.currencySymbol} ({selectedCountry.currency})</li>
                    <li>✓ {selectedCountry.vatName}: {selectedCountry.vatRate}%</li>
                    {selectedCountry.complianceSystem && (
                      <li>✓ Compliance: {selectedCountry.complianceSystem}</li>
                    )}
                    <li>✓ Date Format: {selectedCountry.dateFormat}</li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Step 1: Business Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  placeholder="Enter your business name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select
                  value={formData.industry}
                  onValueChange={(value) => setFormData({ ...formData, industry: value })}
                >
                  <SelectTrigger id="industry">
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retail">Retail & Wholesale</SelectItem>
                    <SelectItem value="services">Professional Services</SelectItem>
                    <SelectItem value="hospitality">Hospitality & Tourism</SelectItem>
                    <SelectItem value="construction">Construction</SelectItem>
                    <SelectItem value="agriculture">Agriculture</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="technology">Technology & IT</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+254 700 000000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="business@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Business Address</Label>
                <Input
                  id="address"
                  placeholder="Street, City, Postal Code"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Step 2: Tax Details */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="taxId">
                  {selectedCountry?.code === 'KE' ? 'KRA PIN' :
                   selectedCountry?.code === 'TZ' ? 'TIN (Tax Identification Number)' :
                   selectedCountry?.code === 'UG' ? 'TIN (Tax Identification Number)' :
                   selectedCountry?.code === 'RW' ? 'TIN (Tax Identification Number)' :
                   selectedCountry?.code === 'BI' ? 'NIF (Tax ID)' :
                   'Tax ID'}
                </Label>
                <Input
                  id="taxId"
                  placeholder={selectedCountry?.code === 'KE' ? 'A000000000X' : 'Enter tax ID'}
                  value={formData.taxId}
                  onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="regNumber">Business Registration Number</Label>
                <Input
                  id="regNumber"
                  placeholder="Enter registration number"
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                />
              </div>

              <div className="flex items-start space-x-3 rounded-lg border p-4">
                <Checkbox
                  id="vatRegistered"
                  checked={formData.vatRegistered}
                  onCheckedChange={(checked) => setFormData({ ...formData, vatRegistered: checked as boolean })}
                />
                <div className="space-y-1 leading-none">
                  <Label htmlFor="vatRegistered" className="font-semibold">
                    {selectedCountry?.vatName || 'VAT'} Registered
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Check this if your business is registered for {selectedCountry?.vatName || 'VAT'} ({selectedCountry?.vatRate}%)
                  </p>
                </div>
              </div>

              {selectedCountry?.complianceSystem && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <FileText className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div className="text-sm text-amber-900">
                      <p className="font-semibold mb-1">Compliance System</p>
                      <p>Your business will use <strong>{selectedCountry.complianceSystem}</strong> for e-invoicing and tax reporting.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Completion */}
          {currentStep === 3 && (
            <div className="space-y-6 text-center py-8">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-green-600" />
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">You're All Set!</h3>
                <p className="text-muted-foreground">
                  Your business profile is configured and ready to use.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 text-left space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Business Name:</span>
                  <span className="font-semibold">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Country:</span>
                  <span className="font-semibold">{selectedCountry?.flag} {selectedCountry?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Currency:</span>
                  <span className="font-semibold">{selectedCountry?.currencySymbol} {selectedCountry?.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{selectedCountry?.vatName}:</span>
                  <span className="font-semibold">{selectedCountry?.vatRate}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="min-w-[120px]"
            >
              {currentStep === steps.length - 1 ? 'Get Started' : 'Continue'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}