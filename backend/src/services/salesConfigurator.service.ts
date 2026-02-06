/**
 * Sales Configurator Service
 * Rule-based sales recommendations
 */

export interface ClientProfile {
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

export interface SalesRecommendation {
  recommended_deployment: 'cloud' | 'private' | 'onprem';
  license_tier: 'starter' | 'professional' | 'enterprise';
  user_limit: number | string;
  modules: string[];
  pricing: {
    setup_fee: number;
    license_fee: number;
    billing_frequency: 'monthly' | 'annual';
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
    training_included: boolean;
    data_migration_included: boolean;
  };
  justification: string[];
  upsell_opportunities?: string[];
  next_steps: string[];
}

export class SalesConfiguratorService {
  async generate(profile: ClientProfile): Promise<SalesRecommendation> {
    const deployment = this.determineDeployment(profile);
    const tier = this.determineTier(profile);
    const pricing = this.calculatePricing(deployment, tier, profile);
    const modules = this.determineModules(profile, tier);

    const recommendation: SalesRecommendation = {
      recommended_deployment: deployment,
      license_tier: tier,
      user_limit: this.getUserLimit(tier, profile.company_size),
      modules,
      pricing,
      justification: this.generateJustification(deployment, tier, profile),
      next_steps: this.generateNextSteps(profile),
    };

    if (this.needsMigration(profile)) {
      recommendation.migration = this.estimateMigration(profile);
    }

    recommendation.implementation = this.estimateImplementation(deployment, tier);

    return recommendation;
  }

  private determineDeployment(profile: ClientProfile): 'cloud' | 'private' | 'onprem' {
    if (profile.deployment_preference && profile.deployment_preference !== 'undecided') {
      return profile.deployment_preference as any;
    }
    if (profile.offline_required) return 'onprem';
    if (profile.industry === 'government' || profile.industry === 'ngo') return 'onprem';
    if (profile.company_size === '201-500' || profile.company_size === '500+') return 'private';
    if (profile.data_volume === 'high') return 'private';
    return 'cloud';
  }

  private determineTier(profile: ClientProfile): 'starter' | 'professional' | 'enterprise' {
    if (
      profile.company_size === '201-500' ||
      profile.company_size === '500+' ||
      profile.industry === 'government' ||
      profile.industry === 'ngo'
    ) return 'enterprise';

    if (
      profile.company_size === '51-200' ||
      profile.countries.length > 1 ||
      profile.modules_needed?.includes('payroll') ||
      profile.data_volume === 'high'
    ) return 'professional';

    if (profile.company_size === '11-50') return 'professional';
    
    return 'starter';
  }

  private calculatePricing(
    deployment: string,
    tier: string,
    profile: ClientProfile
  ): SalesRecommendation['pricing'] {
    const basePricing: Record<string, Record<string, number>> = {
      cloud: { starter: 49, professional: 149, enterprise: 499 },
      private: { starter: 149, professional: 299, enterprise: 999 },
      onprem: { starter: 999, professional: 1999, enterprise: 4999 },
    };

    const setupFees: Record<string, number> = {
      cloud: 0,
      private: 500,
      onprem: 2000,
    };

    const licenseFee = basePricing[deployment][tier];
    const setupFee = setupFees[deployment];
    const billingFrequency: 'monthly' | 'annual' = deployment === 'onprem' ? 'annual' : 'monthly';

    const moduleAddons: Record<string, number> = {};
    if (profile.modules_needed?.includes('payroll') && tier !== 'enterprise') {
      moduleAddons.payroll = 29;
    }
    if (profile.modules_needed?.includes('inventory') && tier !== 'enterprise') {
      moduleAddons.inventory = 19;
    }

    const addonCost = Object.values(moduleAddons).reduce((sum, cost) => sum + cost, 0);
    const totalMonthlyLicense = licenseFee + addonCost;
    const multiplier = billingFrequency === 'annual' ? 12 : 1;
    const annualLicense = totalMonthlyLicense * multiplier;

    return {
      setup_fee: setupFee,
      license_fee: licenseFee,
      billing_frequency: billingFrequency,
      module_addons: moduleAddons,
      total_first_year: setupFee + annualLicense,
      total_annual_recurring: annualLicense,
    };
  }

  private determineModules(profile: ClientProfile, tier: string): string[] {
    const baseModules = ['accounting', 'invoicing', 'tax'];
    if (tier === 'enterprise') {
      return ['accounting', 'invoicing', 'tax', 'payroll', 'inventory'];
    }
    const modules = [...baseModules];
    if (profile.modules_needed?.includes('payroll')) modules.push('payroll');
    if (profile.modules_needed?.includes('inventory')) modules.push('inventory');
    return modules;
  }

  private getUserLimit(tier: string, companySize: string): number | string {
    if (tier === 'enterprise') return 'unlimited';
    if (tier === 'professional') return 25;
    return 5;
  }

  private generateJustification(
    deployment: string,
    tier: string,
    profile: ClientProfile
  ): string[] {
    const reasons: string[] = [];

    if (deployment === 'onprem') {
      if (profile.offline_required) {
        reasons.push('On-premise deployment required for offline field operations');
      }
      if (profile.industry === 'government' || profile.industry === 'ngo') {
        reasons.push('On-premise ensures data sovereignty and regulatory compliance');
      }
      reasons.push('Full control over data and infrastructure');
    } else if (deployment === 'private') {
      reasons.push('Private cloud provides dedicated resources and enhanced security');
      if (profile.data_volume === 'high') {
        reasons.push('High data volume requires dedicated instance');
      }
    } else {
      reasons.push('Cloud deployment is cost-effective and scales with your business');
      reasons.push('Managed infrastructure with automatic updates');
    }

    if (tier === 'enterprise') {
      reasons.push('Enterprise tier includes unlimited users and SLA-backed support');
      if (profile.industry === 'government' || profile.industry === 'ngo') {
        reasons.push('Enterprise-grade audit trails required for compliance');
      }
    } else if (tier === 'professional') {
      reasons.push('Professional tier supports growing teams (up to 25 users)');
    }

    const countryNames: Record<string, string> = {
      KE: 'Kenya (TIMS)',
      UG: 'Uganda (EFRIS)',
      TZ: 'Tanzania (VFD)',
      RW: 'Rwanda (EBM)',
      BI: 'Burundi (Generic VAT)',
    };

    if (profile.countries.length > 1) {
      const countries = profile.countries.map((c) => countryNames[c] || c).join(', ');
      reasons.push(`Multi-country tax compliance included: ${countries}`);
    } else if (profile.countries.length === 1) {
      reasons.push(`${countryNames[profile.countries[0]]} compliance built-in`);
    }

    if (profile.industry === 'retail' && profile.modules_needed?.includes('inventory')) {
      reasons.push('Inventory management essential for retail operations');
    }

    return reasons;
  }

  private generateNextSteps(profile: ClientProfile): string[] {
    return [
      'Review this configuration with your team',
      'Schedule a technical demo to see the platform',
      'Discuss data migration requirements and timeline',
      'Review software license agreement and terms',
      'Plan implementation schedule and user training',
    ];
  }

  private needsMigration(profile: ClientProfile): boolean {
    return profile.company_size !== '1-10';
  }

  private estimateMigration(profile: ClientProfile): {
    required: boolean;
    estimate_hours: number;
    estimate_cost: number;
  } {
    let hours = 20;
    if (profile.company_size === '51-200') hours = 40;
    if (profile.company_size === '201-500') hours = 60;
    if (profile.company_size === '500+') hours = 80;
    if (profile.data_volume === 'high') hours += 20;
    const cost = hours * 100;

    return {
      required: true,
      estimate_hours: hours,
      estimate_cost: cost,
    };
  }

  private estimateImplementation(deployment: string, tier: string) {
    let weeks = 2;
    if (deployment === 'onprem') weeks = 4;
    if (tier === 'enterprise') weeks += 2;

    return {
      timeline_weeks: weeks,
      training_included: tier !== 'starter',
      data_migration_included: tier === 'enterprise',
    };
  }
}

export const salesConfiguratorService = new SalesConfiguratorService();
