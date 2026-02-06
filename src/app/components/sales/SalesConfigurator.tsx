import React, { useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Building2, Users, Globe, Database, Clock, DollarSign, Loader2 } from 'lucide-react';

interface ClientProfile {
  company_size: string;
  industry: string;
  countries: string[];
  data_volume?: string;
  deployment_preference?: string;
  offline_required: boolean;
  modules_needed: string[];
  budget_range?: string;
  timeline?: string;
}

interface SalesRecommendation {
  recommended_deployment: string;
  license_tier: string;
  user_limit: number | string;
  modules: string[];
  pricing: {
    setup_fee: number;
    license_fee: number;
    billing_frequency: string;
    module_addons: Record<string, number>;
    total_first_year: number;
    total_annual_recurring: number;
  };
  migration?: {
    required: boolean;
    estimate_hours: number;
    estimate_cost: number;
  };
  implementation?: {
    timeline_weeks: number;
  };
  justification: string[];
  next_steps: string[];
}

export function SalesConfigurator() {
  const [profile, setProfile] = useState<ClientProfile>({
    company_size: '',
    industry: '',
    countries: [],
    offline_required: false,
    modules_needed: ['accounting', 'invoicing', 'tax'],
  });

  const [recommendation, setRecommendation] = useState<SalesRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setRecommendation(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      // Add timeout to prevent long waits
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      const response = await fetch(`${API_URL}/api/v1/sales/configure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = `HTTP Error ${response.status}`;
        const contentType = response.headers.get('content-type');
        
        if (contentType?.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } else {
          // Response was HTML (404 or server error)
          errorMessage = `API Error (${response.status}): ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setRecommendation(data);
    } catch (err: any) {
      // Silently fallback to demo mode if backend is not running
      if (err.name === 'AbortError' || err.message === 'Failed to fetch' || err.name === 'TypeError') {
        console.log('Backend not available, using offline mode');
        
        // Generate mock recommendation (client-side fallback)
        const mockRecommendation = generateMockRecommendation(profile);
        setRecommendation(mockRecommendation);
      } else {
        // Show actual API errors
        setError(err.message || 'Failed to generate recommendation');
      }
    } finally {
      setLoading(false);
    }
  };

  // Mock recommendation generator (fallback when backend is down)
  const generateMockRecommendation = (profile: ClientProfile): SalesRecommendation => {
    const isLarge = profile.company_size === '201-500' || profile.company_size === '500+';
    const isNGO = profile.industry === 'ngo' || profile.industry === 'government';
    const needsOffline = profile.offline_required;
    
    let deployment: 'cloud' | 'private' | 'onprem' = 'cloud';
    let tier: 'starter' | 'professional' | 'enterprise' = 'starter';
    
    if (needsOffline || isNGO) deployment = 'onprem';
    else if (isLarge) deployment = 'private';
    
    if (isLarge || isNGO) tier = 'enterprise';
    else if (profile.company_size === '11-50' || profile.countries.length > 1) tier = 'professional';
    
    const prices = {
      cloud: { starter: 49, professional: 149, enterprise: 499 },
      private: { starter: 149, professional: 299, enterprise: 999 },
      onprem: { starter: 999, professional: 1999, enterprise: 4999 },
    };
    
    const setupFees = { cloud: 0, private: 500, onprem: 2000 };
    const licenseFee = prices[deployment][tier];
    const setupFee = setupFees[deployment];
    const billingFrequency = deployment === 'onprem' ? 'annual' : 'monthly';
    const multiplier = billingFrequency === 'annual' ? 12 : 1;
    
    return {
      recommended_deployment: deployment,
      license_tier: tier,
      user_limit: tier === 'enterprise' ? 'unlimited' : tier === 'professional' ? 25 : 5,
      modules: tier === 'enterprise' 
        ? ['accounting', 'invoicing', 'tax', 'payroll', 'inventory']
        : ['accounting', 'invoicing', 'tax'],
      pricing: {
        setup_fee: setupFee,
        license_fee: licenseFee,
        billing_frequency: billingFrequency,
        module_addons: {},
        total_first_year: setupFee + (licenseFee * multiplier),
        total_annual_recurring: licenseFee * multiplier,
      },
      justification: [
        `${deployment === 'cloud' ? 'Cloud deployment is cost-effective' : deployment === 'private' ? 'Private cloud provides dedicated resources' : 'On-premise ensures data sovereignty'}`,
        `${tier === 'enterprise' ? 'Enterprise tier for large organizations' : tier === 'professional' ? 'Professional tier supports growing teams' : 'Starter tier for small businesses'}`,
        `${profile.countries[0]} compliance built-in`,
      ],
      next_steps: [
        'Review this configuration',
        'Schedule a demo',
        'Discuss implementation',
      ],
    };
  };

  const updateProfile = (field: string, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const canGenerate = profile.company_size && profile.industry && profile.countries.length > 0;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">AI Sales Configurator</h1>
        <p className="text-gray-600">
          Generate instant deployment recommendations and pricing proposals
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card className="p-6 space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Client Profile
          </h2>

          {/* Company Size */}
          <div className="space-y-2">
            <Label htmlFor="company-size" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Company Size *
            </Label>
            <Select
              value={profile.company_size}
              onValueChange={(value) => updateProfile('company_size', value)}
            >
              <SelectTrigger id="company-size">
                <SelectValue placeholder="Select company size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-10">1-10 employees</SelectItem>
                <SelectItem value="11-50">11-50 employees</SelectItem>
                <SelectItem value="51-200">51-200 employees</SelectItem>
                <SelectItem value="201-500">201-500 employees</SelectItem>
                <SelectItem value="500+">500+ employees</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Industry */}
          <div className="space-y-2">
            <Label htmlFor="industry">Industry *</Label>
            <Select
              value={profile.industry}
              onValueChange={(value) => updateProfile('industry', value)}
            >
              <SelectTrigger id="industry">
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="services">Professional Services</SelectItem>
                <SelectItem value="ngo">NGO / Non-Profit</SelectItem>
                <SelectItem value="government">Government</SelectItem>
                <SelectItem value="manufacturing">Manufacturing</SelectItem>
                <SelectItem value="hospitality">Hospitality</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Countries */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Operating Countries *
            </Label>
            <div className="space-y-2">
              {[
                { code: 'KE', name: '🇰🇪 Kenya (TIMS)' },
                { code: 'UG', name: '🇺🇬 Uganda (EFRIS)' },
                { code: 'TZ', name: '🇹🇿 Tanzania (VFD)' },
                { code: 'RW', name: '🇷🇼 Rwanda (EBM)' },
                { code: 'BI', name: '🇧🇮 Burundi' },
              ].map(country => (
                <div key={country.code} className="flex items-center space-x-2">
                  <Checkbox
                    id={country.code}
                    checked={profile.countries.includes(country.code)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateProfile('countries', [...profile.countries, country.code]);
                      } else {
                        updateProfile('countries', profile.countries.filter(c => c !== country.code));
                      }
                    }}
                  />
                  <label htmlFor={country.code} className="text-sm cursor-pointer">
                    {country.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Data Volume */}
          <div className="space-y-2">
            <Label htmlFor="data-volume" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Expected Data Volume
            </Label>
            <Select
              value={profile.data_volume}
              onValueChange={(value) => updateProfile('data_volume', value)}
            >
              <SelectTrigger id="data-volume">
                <SelectValue placeholder="Select data volume" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low (&lt;10k transactions/year)</SelectItem>
                <SelectItem value="medium">Medium (10k-100k/year)</SelectItem>
                <SelectItem value="high">High (&gt;100k/year)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Deployment Preference */}
          <div className="space-y-2">
            <Label htmlFor="deployment">Deployment Preference</Label>
            <Select
              value={profile.deployment_preference}
              onValueChange={(value) => updateProfile('deployment_preference', value)}
            >
              <SelectTrigger id="deployment">
                <SelectValue placeholder="Select preference" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cloud">Cloud (Hosted)</SelectItem>
                <SelectItem value="private">Private Cloud</SelectItem>
                <SelectItem value="onprem">On-Premise</SelectItem>
                <SelectItem value="undecided">Undecided</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Offline Required */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="offline"
              checked={profile.offline_required}
              onCheckedChange={(checked) =>
                updateProfile('offline_required', checked === true)
              }
            />
            <label htmlFor="offline" className="text-sm cursor-pointer">
              Offline access required (field operations, poor connectivity)
            </label>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={loading || !canGenerate}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Recommendation'
            )}
          </Button>
        </Card>

        {/* Recommendation Output */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">AI Recommendation</h2>

          {!recommendation && !loading && (
            <div className="text-center text-gray-500 py-12">
              <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Fill in the client profile and click "Generate Recommendation"</p>
            </div>
          )}

          {loading && (
            <div className="text-center text-gray-500 py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p>Analyzing client profile...</p>
            </div>
          )}

          {recommendation && (
            <div className="space-y-6">
              {/* Deployment */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-sm text-gray-600">Recommended Deployment</h3>
                <p className="text-2xl font-bold text-blue-600 capitalize">
                  {recommendation.recommended_deployment === 'onprem'
                    ? 'On-Premise'
                    : recommendation.recommended_deployment}
                </p>
              </div>

              {/* License Tier */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold text-sm text-gray-600">License Tier</h3>
                <p className="text-xl font-bold text-purple-600 capitalize">
                  {recommendation.license_tier}
                </p>
                <p className="text-sm text-gray-600">
                  Up to {recommendation.user_limit} users
                </p>
              </div>

              {/* Pricing */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold mb-3">Pricing Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Setup Fee:</span>
                    <span className="font-semibold">
                      ${recommendation.pricing.setup_fee.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>License ({recommendation.pricing.billing_frequency}):</span>
                    <span className="font-semibold">
                      ${recommendation.pricing.license_fee.toLocaleString()}
                    </span>
                  </div>
                  {recommendation.migration && recommendation.migration.required && (
                    <div className="flex justify-between text-gray-600">
                      <span>Data Migration (est):</span>
                      <span className="font-semibold">
                        ${recommendation.migration.estimate_cost.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-bold text-base">
                    <span>First Year Total:</span>
                    <span className="text-green-600">
                      ${recommendation.pricing.total_first_year.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Modules */}
              <div>
                <h3 className="font-semibold mb-2 text-sm text-gray-600">Included Modules</h3>
                <div className="flex flex-wrap gap-2">
                  {recommendation.modules.map(module => (
                    <span
                      key={module}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm capitalize"
                    >
                      {module}
                    </span>
                  ))}
                </div>
              </div>

              {/* Justification */}
              <div>
                <h3 className="font-semibold mb-2 text-sm text-gray-600">Why This Recommendation?</h3>
                <ul className="space-y-2">
                  {recommendation.justification.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Next Steps */}
              <div>
                <h3 className="font-semibold mb-2 text-sm text-gray-600">Next Steps</h3>
                <ol className="space-y-1 list-decimal list-inside text-sm text-gray-700">
                  {recommendation.next_steps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button className="flex-1" variant="outline">
                  Generate Proposal PDF
                </Button>
                <Button className="flex-1" variant="outline">
                  Email to Client
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}