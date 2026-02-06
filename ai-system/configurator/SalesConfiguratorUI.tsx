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
import { Building2, Users, Globe, Database, Clock, DollarSign } from 'lucide-react';

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
    total_first_year: number;
    total_annual_recurring: number;
  };
  migration?: {
    required: boolean;
    estimate_cost: number;
  };
  justification: string[];
  next_steps: string[];
}

export function SalesConfiguratorUI() {
  const [profile, setProfile] = useState<ClientProfile>({
    company_size: '',
    industry: '',
    countries: [],
    offline_required: false,
    modules_needed: ['accounting', 'invoicing', 'tax'],
  });

  const [recommendation, setRecommendation] = useState<SalesRecommendation | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      // Call AI service
      const response = await fetch('/api/sales/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      const data = await response.json();
      setRecommendation(data);
    } catch (error) {
      console.error('Failed to generate recommendation:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = (field: string, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Sales Configurator</h1>
        <p className="text-gray-600">
          Generate instant deployment recommendations and pricing proposals
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Client Profile
          </h2>

          {/* Company Size */}
          <div className="space-y-2">
            <Label htmlFor="company-size" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Company Size
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
            <Label htmlFor="industry">Industry</Label>
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
                <SelectItem value="ngo">NGO</SelectItem>
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
              Operating Countries
            </Label>
            <div className="space-y-2">
              {['KE', 'UG', 'TZ', 'RW', 'BI'].map(country => (
                <div key={country} className="flex items-center space-x-2">
                  <Checkbox
                    id={country}
                    checked={profile.countries.includes(country)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateProfile('countries', [...profile.countries, country]);
                      } else {
                        updateProfile('countries', profile.countries.filter(c => c !== country));
                      }
                    }}
                  />
                  <label htmlFor={country} className="text-sm cursor-pointer">
                    {country === 'KE' && '🇰🇪 Kenya'}
                    {country === 'UG' && '🇺🇬 Uganda'}
                    {country === 'TZ' && '🇹🇿 Tanzania'}
                    {country === 'RW' && '🇷🇼 Rwanda'}
                    {country === 'BI' && '🇧🇮 Burundi'}
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

          {/* Budget Range */}
          <div className="space-y-2">
            <Label htmlFor="budget" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Annual Budget Range
            </Label>
            <Select
              value={profile.budget_range}
              onValueChange={(value) => updateProfile('budget_range', value)}
            >
              <SelectTrigger id="budget">
                <SelectValue placeholder="Select budget range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="<5k">&lt;$5,000</SelectItem>
                <SelectItem value="5k-20k">$5,000 - $20,000</SelectItem>
                <SelectItem value="20k-50k">$20,000 - $50,000</SelectItem>
                <SelectItem value="50k+">$50,000+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Timeline */}
          <div className="space-y-2">
            <Label htmlFor="timeline" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Implementation Timeline
            </Label>
            <Select
              value={profile.timeline}
              onValueChange={(value) => updateProfile('timeline', value)}
            >
              <SelectTrigger id="timeline">
                <SelectValue placeholder="Select timeline" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate (1-4 weeks)</SelectItem>
                <SelectItem value="1-3_months">1-3 months</SelectItem>
                <SelectItem value="3-6_months">3-6 months</SelectItem>
                <SelectItem value="6+_months">6+ months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading || !profile.company_size || profile.countries.length === 0}
            className="w-full"
            size="lg"
          >
            {loading ? 'Generating...' : 'Generate Recommendation'}
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
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Analyzing client profile...</p>
            </div>
          )}

          {recommendation && (
            <div className="space-y-6">
              {/* Deployment */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-lg">Recommended Deployment</h3>
                <p className="text-2xl font-bold text-blue-600 capitalize">
                  {recommendation.recommended_deployment === 'onprem'
                    ? 'On-Premise'
                    : recommendation.recommended_deployment}
                </p>
              </div>

              {/* License Tier */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold">License Tier</h3>
                <p className="text-xl font-bold text-purple-600 capitalize">
                  {recommendation.license_tier}
                </p>
                <p className="text-sm text-gray-600">
                  Up to {recommendation.user_limit} users
                </p>
              </div>

              {/* Pricing */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold mb-2">Pricing Summary</h3>
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
                    <div className="flex justify-between">
                      <span>Data Migration:</span>
                      <span className="font-semibold">
                        ${recommendation.migration.estimate_cost.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>First Year Total:</span>
                    <span className="text-green-600">
                      ${recommendation.pricing.total_first_year.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Modules */}
              <div>
                <h3 className="font-semibold mb-2">Included Modules</h3>
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
                <h3 className="font-semibold mb-2">Why This Recommendation?</h3>
                <ul className="space-y-2">
                  {recommendation.justification.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Next Steps */}
              <div>
                <h3 className="font-semibold mb-2">Next Steps</h3>
                <ol className="space-y-2 list-decimal list-inside text-sm">
                  {recommendation.next_steps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button className="flex-1">Generate Proposal PDF</Button>
                <Button variant="outline" className="flex-1">Email to Client</Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
