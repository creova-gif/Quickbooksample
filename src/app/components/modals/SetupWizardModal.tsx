/**
 * Setup Wizard Modal
 * Multi-step setup wizard for initial configuration
 * (Web version of Electron Installer)
 */

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Card } from '@/app/components/ui/card';
import { Progress } from '@/app/components/ui/progress';
import { 
  Cloud, 
  Server, 
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Package,
  Globe,
  Database,
  Sparkles
} from 'lucide-react';
import { CountryCode } from '@/types';
import { getAllCountries } from '@/lib/countries';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
  onComplete: (config: SetupConfig) => void;
}

export interface SetupConfig {
  deploymentType: 'cloud' | 'on-premise';
  selectedCountry: CountryCode;
  selectedModules: string[];
  companyName: string;
  licenseKey?: string;
}

export function SetupWizardModal({ open, onClose, onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  // Configuration state
  const [deploymentType, setDeploymentType] = useState<'cloud' | 'on-premise'>('cloud');
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>('KE');
  const [selectedModules, setSelectedModules] = useState<string[]>(['invoicing', 'transactions']);
  const [companyName, setCompanyName] = useState('');
  const [licenseKey, setLicenseKey] = useState('');

  const countries = getAllCountries();

  const availableModules = [
    { id: 'invoicing', name: 'Invoicing & Billing', description: 'Create and manage invoices', required: true },
    { id: 'transactions', name: 'Transaction Recording', description: 'Track income and expenses', required: true },
    { id: 'payroll', name: 'Payroll Management', description: 'Process employee salaries', required: false },
    { id: 'inventory', name: 'Inventory Tracking', description: 'Manage stock levels', required: false },
    { id: 'reports', name: 'Financial Reports', description: 'P&L, Balance Sheet, etc.', required: false },
    { id: 'multi-branch', name: 'Multi-Branch Support', description: 'Manage multiple locations', premium: true },
    { id: 'api', name: 'API Access', description: 'Custom integrations', premium: true },
  ];

  const handleNext = () => {
    if (currentStep === 1 && !deploymentType) {
      toast.error('Please select a deployment type');
      return;
    }

    if (currentStep === 2 && selectedModules.length === 0) {
      toast.error('Please select at least one module');
      return;
    }

    if (currentStep === 3 && !selectedCountry) {
      toast.error('Please select a country');
      return;
    }

    if (currentStep === 4 && !companyName) {
      toast.error('Please enter your company name');
      return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    const config: SetupConfig = {
      deploymentType,
      selectedCountry,
      selectedModules,
      companyName,
      licenseKey: licenseKey || undefined,
    };

    onComplete(config);
    toast.success('Setup completed successfully!');
    onClose();
  };

  const toggleModule = (moduleId: string) => {
    const module = availableModules.find(m => m.id === moduleId);
    if (module?.required) return; // Can't toggle required modules

    if (selectedModules.includes(moduleId)) {
      setSelectedModules(selectedModules.filter(id => id !== moduleId));
    } else {
      setSelectedModules([...selectedModules, moduleId]);
    }
  };

  const progress = (currentStep / totalSteps) * 100;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Setup Wizard
          </DialogTitle>
          <DialogDescription>
            Step {currentStep} of {totalSteps}: {
              currentStep === 1 ? 'Deployment Type' :
              currentStep === 2 ? 'Select Modules' :
              currentStep === 3 ? 'Country Selection' :
              currentStep === 4 ? 'Company Information' :
              'Complete Setup'
            }
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <Progress value={progress} className="mb-6" />

        <div className="min-h-[400px]">
          {/* Step 1: Deployment Type */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg mb-4">Choose Deployment Type</h3>
              
              <RadioGroup value={deploymentType} onValueChange={(v) => setDeploymentType(v as any)}>
                <Card className={`p-4 cursor-pointer transition-all ${deploymentType === 'cloud' ? 'border-blue-500 ring-2 ring-blue-500' : ''}`}
                  onClick={() => setDeploymentType('cloud')}>
                  <div className="flex items-start gap-4">
                    <RadioGroupItem value="cloud" id="cloud" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Cloud className="w-5 h-5 text-blue-600" />
                        <Label htmlFor="cloud" className="font-semibold cursor-pointer">Cloud Hosted</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        We host and manage everything for you. Automatic updates, backups, and 99.9% uptime.
                      </p>
                      <ul className="mt-2 space-y-1 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>No infrastructure management</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Automatic backups</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Access from anywhere</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </Card>

                <Card className={`p-4 cursor-pointer transition-all ${deploymentType === 'on-premise' ? 'border-blue-500 ring-2 ring-blue-500' : ''}`}
                  onClick={() => setDeploymentType('on-premise')}>
                  <div className="flex items-start gap-4">
                    <RadioGroupItem value="on-premise" id="on-premise" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Server className="w-5 h-5 text-purple-600" />
                        <Label htmlFor="on-premise" className="font-semibold cursor-pointer">On-Premise</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Install on your own servers. Full control over your data and infrastructure.
                      </p>
                      <ul className="mt-2 space-y-1 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Complete data control</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Custom security policies</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>No internet dependency</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </RadioGroup>
            </div>
          )}

          {/* Step 2: Module Selection */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg mb-4">Select Modules</h3>
              
              <div className="space-y-3">
                {availableModules.map((module) => (
                  <Card 
                    key={module.id} 
                    className={`p-4 cursor-pointer transition-all ${
                      selectedModules.includes(module.id) ? 'border-blue-500 bg-blue-50' : ''
                    } ${module.required ? 'opacity-75' : ''}`}
                    onClick={() => !module.required && toggleModule(module.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedModules.includes(module.id)}
                        disabled={module.required}
                        onCheckedChange={() => toggleModule(module.id)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Label className="font-medium cursor-pointer">{module.name}</Label>
                          {module.required && (
                            <span className="text-xs text-muted-foreground">(Required)</span>
                          )}
                          {module.premium && (
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">Premium</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Country Selection */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg mb-4">Select Your Country</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This determines VAT rates, tax compliance, and currency settings.
              </p>
              
              <div className="grid grid-cols-1 gap-3">
                {countries.map((country) => (
                  <Card
                    key={country.code}
                    className={`p-4 cursor-pointer transition-all ${
                      selectedCountry === country.code ? 'border-blue-500 ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedCountry(country.code)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{country.flag}</span>
                        <div>
                          <p className="font-medium">{country.name}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span>Currency: {country.currency}</span>
                            <span>VAT: {(country.vatRate * 100).toFixed(0)}%</span>
                            {country.complianceSystem && (
                              <span>System: {country.complianceSystem}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      {selectedCountry === country.code && (
                        <CheckCircle className="w-6 h-6 text-blue-600" />
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Company Information */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="font-semibold text-lg mb-4">Company Information</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Acme Corporation Ltd"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licenseKey">License Key (Optional)</Label>
                  <Input
                    id="licenseKey"
                    value={licenseKey}
                    onChange={(e) => setLicenseKey(e.target.value)}
                    placeholder="EA-XXXX-XXXX-XXXX-XXXX"
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter your license key if you have one. You can activate it later from settings.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Complete */}
          {currentStep === 5 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              
              <h3 className="font-semibold text-xl mb-2">Setup Complete!</h3>
              <p className="text-muted-foreground mb-6">
                Your accounting platform is ready to use.
              </p>

              <Card className="p-4 text-left max-w-md mx-auto">
                <h4 className="font-medium mb-3">Configuration Summary:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deployment:</span>
                    <span className="font-medium capitalize">{deploymentType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Country:</span>
                    <span className="font-medium">
                      {countries.find(c => c.code === selectedCountry)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Modules:</span>
                    <span className="font-medium">{selectedModules.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Company:</span>
                    <span className="font-medium">{companyName}</span>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {currentStep < totalSteps ? (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleComplete}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete Setup
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
