import React, { useState } from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import { getCountry, getAllCountries } from '@/lib/countries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Switch } from '@/app/components/ui/switch';
import { Separator } from '@/app/components/ui/separator';
import { Badge } from '@/app/components/ui/badge';
import { Building2, Globe, Receipt, Shield, Database, AlertTriangle, Palette } from 'lucide-react';
import { toast } from 'sonner';
import { FigmaIntegration } from '@/app/components/figma/FigmaIntegration';

export function Settings() {
  const { business, updateBusiness } = useBusiness();
  const [formData, setFormData] = useState({
    name: business?.name || '',
    phone: business?.phone || '',
    email: business?.email || '',
    address: business?.address || '',
    taxId: business?.taxId || '',
    registrationNumber: business?.registrationNumber || '',
    vatRegistered: business?.vatRegistered || false,
  });

  if (!business) return null;

  const country = getCountry(business.countryCode);

  const handleSave = () => {
    updateBusiness(formData);
    toast.success('Settings saved successfully');
  };

  const handleExportData = () => {
    toast.success('Data export would download a JSON/CSV file');
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure? This will delete all your data. This action cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold">Settings</h2>
        <p className="text-muted-foreground">
          Manage your business profile and preferences
        </p>
      </div>

      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Business Information
          </CardTitle>
          <CardDescription>
            Update your business details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name</Label>
            <Input
              id="businessName"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Business Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={2}
            />
          </div>

          <Button onClick={handleSave}>Save Changes</Button>
        </CardContent>
      </Card>

      {/* Country & Localization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Country & Localization
          </CardTitle>
          <CardDescription>
            Your regional settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Country</Label>
              <div className="text-2xl mt-1">{country.flag} {country.name}</div>
            </div>
            <Badge variant="outline">Cannot be changed</Badge>
          </div>

          <Separator />

          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Currency:</span>
              <span className="font-semibold">{country.currencySymbol} {country.currency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{country.vatName} Rate:</span>
              <span className="font-semibold">{country.vatRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date Format:</span>
              <span className="font-semibold">{country.dateFormat}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fiscal Year:</span>
              <span className="font-semibold">Starts {country.fiscalYearStart}</span>
            </div>
          </div>

          {country.complianceSystem && (
            <>
              <Separator />
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Receipt className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-1">E-Invoicing System</p>
                    <p>{country.complianceSystem}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Tax Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Tax Settings
          </CardTitle>
          <CardDescription>
            Manage tax identification and registration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="taxId">
                {country.code === 'KE' ? 'KRA PIN' :
                 country.code === 'BI' ? 'NIF (Tax ID)' :
                 'TIN (Tax Identification Number)'}
              </Label>
              <Input
                id="taxId"
                value={formData.taxId}
                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="regNumber">Registration Number</Label>
              <Input
                id="regNumber"
                value={formData.registrationNumber}
                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div>
              <Label htmlFor="vatSwitch" className="font-semibold">
                {country.vatName} Registration
              </Label>
              <p className="text-sm text-muted-foreground">
                Enable if your business is registered for {country.vatName}
              </p>
            </div>
            <Switch
              id="vatSwitch"
              checked={formData.vatRegistered}
              onCheckedChange={(checked) => setFormData({ ...formData, vatRegistered: checked })}
            />
          </div>

          <Button onClick={handleSave}>Save Tax Settings</Button>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Data Management
          </CardTitle>
          <CardDescription>
            Export or clear your business data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div>
              <div className="font-semibold">Export Data</div>
              <p className="text-sm text-muted-foreground">
                Download all your business data as JSON/CSV
              </p>
            </div>
            <Button variant="outline" onClick={handleExportData}>
              Export
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 bg-red-50">
            <div>
              <div className="font-semibold text-red-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Clear All Data
              </div>
              <p className="text-sm text-red-700">
                Permanently delete all business data. This cannot be undone.
              </p>
            </div>
            <Button variant="destructive" onClick={handleClearData}>
              Clear Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Business ID:</span>
            <span className="font-mono text-xs">{business.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Created:</span>
            <span>{new Date(business.createdAt).toLocaleDateString('en-GB')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Data Storage:</span>
            <span>Local (Offline-Ready)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Platform Version:</span>
            <span>1.0.0 (MVP)</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}