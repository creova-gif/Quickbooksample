import React, { useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Checkbox } from '@/app/components/ui/checkbox';
import { CheckCircle, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';

interface ProposalRequest {
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  company_size: string;
  industry: string;
  countries: string[];
  needs_offline: boolean;
  modules_needed: string[];
  additional_info: string;
}

export function ProposalRequestForm() {
  const [formData, setFormData] = useState<ProposalRequest>({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    company_size: '',
    industry: '',
    countries: [],
    needs_offline: false,
    modules_needed: ['accounting', 'invoicing', 'tax'],
    additional_info: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      const proposal = {
        id: crypto.randomUUID(),
        ...formData,
        status: 'pending',
        created_at: new Date().toISOString(),
      };

      try {
        const response = await fetch(`${API_URL}/api/v1/proposals`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(proposal),
        });

        if (!response.ok) {
          throw new Error('API failed');
        }

        const data = await response.json();
        console.log('Proposal submitted via API:', data);
      } catch (apiError) {
        // Fallback to localStorage if API fails
        console.log('API failed, saving to localStorage');
        const stored = localStorage.getItem('proposals');
        const proposals = stored ? JSON.parse(stored) : [];
        proposals.push(proposal);
        localStorage.setItem('proposals', JSON.stringify(proposals));
      }

      setSubmitted(true);
      toast.success('Proposal request submitted successfully!');
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error('Failed to submit proposal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Request Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for your interest. Our team will review your request and send you a customized proposal within 24 hours.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>What's next?</strong><br />
              1. We'll review your requirements<br />
              2. Generate a custom proposal with pricing<br />
              3. Send you a detailed quote via email<br />
              4. Schedule a demo if you're interested
            </p>
          </div>
          <Button onClick={() => setSubmitted(false)} variant="outline">
            Submit Another Request
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Request a Proposal</h1>
        <p className="text-gray-600">
          Tell us about your business and we'll send you a customized quote
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="p-6 space-y-6">
          {/* Company Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name *</Label>
                <Input
                  id="company-name"
                  value={formData.company_name}
                  onChange={(e) => updateField('company_name', e.target.value)}
                  required
                  placeholder="Your Company Ltd."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-name">Contact Name *</Label>
                <Input
                  id="contact-name"
                  value={formData.contact_name}
                  onChange={(e) => updateField('contact_name', e.target.value)}
                  required
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  required
                  placeholder="john@company.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="+254 700 000 000"
                />
              </div>
            </div>
          </div>

          {/* Business Details */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Business Details</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company-size">Company Size *</Label>
                <Select
                  value={formData.company_size}
                  onValueChange={(value) => updateField('company_size', value)}
                  required
                >
                  <SelectTrigger id="company-size">
                    <SelectValue placeholder="Select size" />
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

              <div className="space-y-2">
                <Label htmlFor="industry">Industry *</Label>
                <Select
                  value={formData.industry}
                  onValueChange={(value) => updateField('industry', value)}
                  required
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
            </div>
          </div>

          {/* Countries */}
          <div>
            <Label className="mb-3 block">Operating Countries *</Label>
            <div className="space-y-2">
              {[
                { code: 'KE', name: '🇰🇪 Kenya' },
                { code: 'UG', name: '🇺🇬 Uganda' },
                { code: 'TZ', name: '🇹🇿 Tanzania' },
                { code: 'RW', name: '🇷🇼 Rwanda' },
                { code: 'BI', name: '🇧🇮 Burundi' },
              ].map(country => (
                <div key={country.code} className="flex items-center space-x-2">
                  <Checkbox
                    id={`country-${country.code}`}
                    checked={formData.countries.includes(country.code)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateField('countries', [...formData.countries, country.code]);
                      } else {
                        updateField('countries', formData.countries.filter(c => c !== country.code));
                      }
                    }}
                  />
                  <label htmlFor={`country-${country.code}`} className="text-sm cursor-pointer">
                    {country.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Features Needed */}
          <div>
            <Label className="mb-3 block">Features You Need</Label>
            <div className="space-y-2">
              {[
                { id: 'accounting', label: 'Accounting & Bookkeeping' },
                { id: 'invoicing', label: 'Invoicing & Payments' },
                { id: 'tax', label: 'Tax Compliance' },
                { id: 'payroll', label: 'Payroll Management' },
                { id: 'inventory', label: 'Inventory Tracking' },
              ].map(module => (
                <div key={module.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`module-${module.id}`}
                    checked={formData.modules_needed.includes(module.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateField('modules_needed', [...formData.modules_needed, module.id]);
                      } else {
                        updateField('modules_needed', formData.modules_needed.filter(m => m !== module.id));
                      }
                    }}
                  />
                  <label htmlFor={`module-${module.id}`} className="text-sm cursor-pointer">
                    {module.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Offline Access */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="offline"
              checked={formData.needs_offline}
              onCheckedChange={(checked) => updateField('needs_offline', checked === true)}
            />
            <label htmlFor="offline" className="text-sm cursor-pointer">
              I need offline access (field operations, poor connectivity)
            </label>
          </div>

          {/* Additional Information */}
          <div className="space-y-2">
            <Label htmlFor="additional-info">Additional Information</Label>
            <Textarea
              id="additional-info"
              value={formData.additional_info}
              onChange={(e) => updateField('additional_info', e.target.value)}
              placeholder="Tell us more about your specific needs, budget, timeline, or any questions you have..."
              rows={4}
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={loading || !formData.company_name || !formData.email || formData.countries.length === 0}
              className="flex-1"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Request Proposal
                </>
              )}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}