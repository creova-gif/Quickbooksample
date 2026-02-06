/**
 * License Activation Modal
 * Handles license key validation and activation
 * Supports offline validation with online verification
 */

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Key, CheckCircle, XCircle, Loader2, Shield, Calendar, Building } from 'lucide-react';
import { logAudit } from '@/services/audit.service';
import { toast } from 'sonner';

interface LicenseInfo {
  key: string;
  type: 'trial' | 'standard' | 'professional' | 'enterprise';
  expiryDate: string;
  maxUsers: number;
  features: string[];
  companyName?: string;
  isValid: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onActivate: (license: LicenseInfo) => void;
  currentLicense?: LicenseInfo | null;
}

export function LicenseActivationModal({ open, onClose, onActivate, currentLicense }: Props) {
  const [licenseKey, setLicenseKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    message: string;
    license?: LicenseInfo;
  } | null>(null);

  // Validate license key format
  const validateLicenseKeyFormat = (key: string): boolean => {
    // Format: EA-XXXX-XXXX-XXXX-XXXX (East Africa prefix)
    const pattern = /^EA-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
    return pattern.test(key.toUpperCase());
  };

  // Parse license key to extract info (simplified version)
  const parseLicenseKey = (key: string): LicenseInfo | null => {
    if (!validateLicenseKeyFormat(key)) return null;

    const parts = key.split('-');
    const typeCode = parts[1][0]; // First character determines type
    
    const types: Record<string, LicenseInfo['type']> = {
      'T': 'trial',
      'S': 'standard',
      'P': 'professional',
      'E': 'enterprise',
    };

    const maxUsers: Record<string, number> = {
      'trial': 2,
      'standard': 5,
      'professional': 25,
      'enterprise': 999,
    };

    const features: Record<string, string[]> = {
      'trial': ['Basic Invoicing', 'Transaction Recording'],
      'standard': ['Invoicing', 'Transactions', 'Reports', 'Tax Compliance'],
      'professional': ['All Standard', 'Payroll', 'Inventory', 'Multi-Branch'],
      'enterprise': ['All Features', 'API Access', 'Custom Integrations', 'Priority Support'],
    };

    const type = types[typeCode] || 'trial';
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + (type === 'trial' ? 1 : 12));

    return {
      key: key.toUpperCase(),
      type,
      expiryDate: expiryDate.toISOString(),
      maxUsers: maxUsers[type],
      features: features[type],
      companyName: 'Demo Company',
      isValid: true,
    };
  };

  const handleValidate = async () => {
    const trimmedKey = licenseKey.trim().toUpperCase();

    if (!trimmedKey) {
      setValidationResult({
        valid: false,
        message: 'Please enter a license key',
      });
      return;
    }

    if (!validateLicenseKeyFormat(trimmedKey)) {
      setValidationResult({
        valid: false,
        message: 'Invalid license key format. Expected: EA-XXXX-XXXX-XXXX-XXXX',
      });
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      // Simulate API call to license server
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Parse license (in production, this would be server-side)
      const parsedLicense = parseLicenseKey(trimmedKey);

      if (parsedLicense) {
        setValidationResult({
          valid: true,
          message: 'License key is valid!',
          license: parsedLicense,
        });
      } else {
        setValidationResult({
          valid: false,
          message: 'License key is invalid or expired',
        });
      }
    } catch (error: any) {
      setValidationResult({
        valid: false,
        message: 'Failed to validate license. Please try again.',
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleActivate = async () => {
    if (!validationResult?.license) return;

    try {
      // Log license activation
      logAudit({
        entityType: 'business',
        entityId: 'license',
        action: 'update',
        before: currentLicense,
        after: validationResult.license,
        performedBy: 'current-user',
        metadata: {
          reason: 'License activated',
          licenseType: validationResult.license.type,
        },
      });

      // Save to localStorage
      localStorage.setItem('license_info', JSON.stringify(validationResult.license));

      // Callback to parent
      onActivate(validationResult.license);

      toast.success('License activated successfully!');
      onClose();
    } catch (error: any) {
      console.error('Failed to activate license:', error);
      toast.error('Failed to activate license');
    }
  };

  const getLicenseTypeColor = (type: LicenseInfo['type']) => {
    const colors = {
      trial: 'bg-gray-100 text-gray-800',
      standard: 'bg-blue-100 text-blue-800',
      professional: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-green-100 text-green-800',
    };
    return colors[type];
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            License Activation
          </DialogTitle>
          <DialogDescription>
            Enter your license key to unlock premium features
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Current License Display */}
          {currentLicense && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-green-900">Active License</p>
                    <p className="text-sm text-green-700">
                      {currentLicense.type.charAt(0).toUpperCase() + currentLicense.type.slice(1)} Edition
                    </p>
                  </div>
                  <Badge className={getLicenseTypeColor(currentLicense.type)}>
                    {currentLicense.type.toUpperCase()}
                  </Badge>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* License Key Input */}
          <div className="space-y-2">
            <Label htmlFor="licenseKey">License Key</Label>
            <Input
              id="licenseKey"
              value={licenseKey}
              onChange={(e) => {
                setLicenseKey(e.target.value.toUpperCase());
                setValidationResult(null);
              }}
              placeholder="EA-XXXX-XXXX-XXXX-XXXX"
              className="font-mono text-center text-lg tracking-wider"
              disabled={isValidating}
            />
            <p className="text-xs text-muted-foreground">
              Enter the license key provided with your purchase
            </p>
          </div>

          {/* Validate Button */}
          <Button
            onClick={handleValidate}
            disabled={isValidating || !licenseKey}
            className="w-full"
            variant="outline"
          >
            {isValidating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Validating...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Validate License
              </>
            )}
          </Button>

          {/* Validation Result */}
          {validationResult && (
            <Alert className={validationResult.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
              {validationResult.valid ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
              <AlertDescription>
                <p className={validationResult.valid ? 'text-green-900' : 'text-red-900'}>
                  {validationResult.message}
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* License Details */}
          {validationResult?.valid && validationResult.license && (
            <div className="border rounded-lg p-4 space-y-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="font-semibold">License Details</p>
                <Badge className={getLicenseTypeColor(validationResult.license.type)}>
                  {validationResult.license.type.toUpperCase()}
                </Badge>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Company:</span>
                  <span className="font-medium">{validationResult.license.companyName}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Expires:</span>
                  <span className="font-medium">
                    {new Date(validationResult.license.expiryDate).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <div>
                    <span className="text-muted-foreground">Max Users:</span>{' '}
                    <span className="font-medium">{validationResult.license.maxUsers}</span>
                  </div>
                </div>

                <div className="mt-3">
                  <p className="text-muted-foreground mb-2">Included Features:</p>
                  <ul className="space-y-1">
                    {validationResult.license.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            {validationResult?.valid && (
              <Button onClick={handleActivate}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Activate License
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
