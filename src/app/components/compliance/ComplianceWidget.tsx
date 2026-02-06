import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Shield, CheckCircle2, AlertTriangle, ExternalLink, FileText } from 'lucide-react';
import { useBusiness } from '@/contexts/BusinessContext';
import { getCountry } from '@/lib/countries';
import { Progress } from '@/app/components/ui/progress';

interface ComplianceStatus {
  isActive: boolean;
  lastSync?: string;
  nextDue?: string;
  status: 'active' | 'warning' | 'inactive';
  message: string;
}

export function ComplianceWidget() {
  const { business } = useBusiness();
  
  if (!business) return null;

  const country = getCountry(business.countryCode);
  
  // Mock compliance status - in production, fetch from API
  const getComplianceStatus = (): ComplianceStatus => {
    switch (business.countryCode) {
      case 'KE':
        return {
          isActive: true,
          lastSync: '2 hours ago',
          nextDue: 'VAT Return due in 5 days',
          status: 'active',
          message: 'TIMS connected and active',
        };
      case 'UG':
        return {
          isActive: true,
          lastSync: '1 hour ago',
          nextDue: 'VAT Return due in 10 days',
          status: 'active',
          message: 'EFRIS connected and active',
        };
      case 'TZ':
        return {
          isActive: false,
          status: 'warning',
          message: 'VFD configuration required',
        };
      case 'RW':
        return {
          isActive: true,
          lastSync: '30 minutes ago',
          nextDue: 'Monthly filing due in 15 days',
          status: 'active',
          message: 'EBM connected and active',
        };
      default:
        return {
          isActive: false,
          status: 'inactive',
          message: 'No compliance system required',
        };
    }
  };

  const complianceStatus = getComplianceStatus();

  const getStatusIcon = () => {
    switch (complianceStatus.status) {
      case 'active':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default:
        return <Shield className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = () => {
    switch (complianceStatus.status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Action Required</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Tax Compliance
            </CardTitle>
            <CardDescription className="mt-1">
              {country.flag} {country.complianceSystem || country.name}
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          {getStatusIcon()}
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              {complianceStatus.message}
            </p>
            {complianceStatus.lastSync && (
              <p className="text-xs text-gray-500 mt-1">
                Last sync: {complianceStatus.lastSync}
              </p>
            )}
          </div>
        </div>

        {complianceStatus.nextDue && (
          <Alert>
            <AlertDescription className="flex items-center justify-between">
              <span className="text-sm">{complianceStatus.nextDue}</span>
              <Button size="sm" variant="link" className="h-auto p-0">
                View Details
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Country-specific information */}
        {business.countryCode === 'KE' && complianceStatus.isActive && (
          <div className="space-y-2 pt-2 border-t">
            <h4 className="text-sm font-medium">TIMS Status</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Invoices submitted this month:</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex justify-between">
                <span>Total VAT collected:</span>
                <span className="font-medium">KSh 45,600</span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-2">
              <ExternalLink className="h-4 w-4 mr-2" />
              View on KRA eTax
            </Button>
          </div>
        )}

        {business.countryCode === 'UG' && complianceStatus.isActive && (
          <div className="space-y-2 pt-2 border-t">
            <h4 className="text-sm font-medium">EFRIS Status</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>E-invoices this month:</span>
                <span className="font-medium">8</span>
              </div>
              <div className="flex justify-between">
                <span>Total VAT (18%):</span>
                <span className="font-medium">USh 1,240,000</span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-2">
              <ExternalLink className="h-4 w-4 mr-2" />
              View on URA Portal
            </Button>
          </div>
        )}

        {business.countryCode === 'TZ' && !complianceStatus.isActive && (
          <Alert variant="destructive">
            <AlertDescription>
              <p className="text-sm font-medium mb-2">VFD Setup Required</p>
              <p className="text-sm mb-3">
                Configure your Virtual Fiscal Device to comply with TRA regulations.
              </p>
              <Button size="sm" variant="outline" className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Configure VFD
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {business.vatRegistered && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">VAT Compliance</span>
              <span className="text-xs text-green-600">On Track</span>
            </div>
            <Progress value={75} className="h-2" />
            <p className="text-xs text-gray-500">
              75% of this month's transactions have VAT properly recorded
            </p>
          </div>
        )}

        {!complianceStatus.isActive && business.countryCode !== 'TZ' && (
          <Button variant="default" size="sm" className="w-full">
            <Shield className="h-4 w-4 mr-2" />
            Setup Compliance
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
