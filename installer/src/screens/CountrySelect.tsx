import React from 'react';
import { InstallConfig } from '../App';

interface CountrySelectProps {
  config: InstallConfig;
  updateConfig: (updates: Partial<InstallConfig>) => void;
  onNext: () => void;
  onBack: () => void;
}

const COUNTRIES = [
  {
    code: 'KE',
    name: 'Kenya',
    flag: '🇰🇪',
    system: 'TIMS (Tax Invoice Management System)',
    systemShort: 'TIMS',
    vat: 16,
    format: 'TIMS-Compliant E-Invoicing',
    authority: 'Kenya Revenue Authority (KRA)'
  },
  {
    code: 'UG',
    name: 'Uganda',
    flag: '🇺🇬',
    system: 'EFRIS (Electronic Fiscal Receipting and Invoicing Solution)',
    systemShort: 'EFRIS',
    vat: 18,
    format: 'EFRIS-Compliant E-Invoicing',
    authority: 'Uganda Revenue Authority (URA)'
  },
  {
    code: 'TZ',
    name: 'Tanzania',
    flag: '🇹🇿',
    system: 'VFD (Virtual Fiscal Device)',
    systemShort: 'VFD',
    vat: 18,
    format: 'VFD-Compliant Receipts',
    authority: 'Tanzania Revenue Authority (TRA)'
  },
  {
    code: 'RW',
    name: 'Rwanda',
    flag: '🇷🇼',
    system: 'EBM (Electronic Billing Machines)',
    systemShort: 'EBM',
    vat: 18,
    format: 'EBM-Compliant Invoicing',
    authority: 'Rwanda Revenue Authority (RRA)'
  },
  {
    code: 'BI',
    name: 'Burundi',
    flag: '🇧🇮',
    system: 'Standard VAT Compliance',
    systemShort: 'Generic',
    vat: 18,
    format: 'Standard Invoice Format',
    authority: 'Office Burundais des Recettes (OBR)'
  }
];

export default function CountrySelect({
  config,
  updateConfig,
  onNext,
  onBack
}: CountrySelectProps) {
  const [selected, setSelected] = React.useState(config.country);

  const handleSelect = (countryCode: string) => {
    const country = COUNTRIES.find(c => c.code === countryCode);
    if (country) {
      setSelected(countryCode);
      updateConfig({
        country: country.code,
        countryName: country.name,
        taxSystem: country.systemShort,
        vatRate: country.vat
      });
    }
  };

  const selectedCountry = COUNTRIES.find(c => c.code === selected);
  const canContinue = selected !== '';

  return (
    <div className="screen country-screen">
      <div className="screen-header">
        <h2>Select Country & Tax System</h2>
        <p className="subtitle">Configure regional compliance settings</p>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: '28%' }}></div>
        </div>
      </div>

      <div className="screen-content">
        <div className="country-selector">
          <label className="form-label">Country</label>
          <select
            className="form-select country-dropdown"
            value={selected}
            onChange={(e) => handleSelect(e.target.value)}
          >
            <option value="">Select a country...</option>
            {COUNTRIES.map((country) => (
              <option key={country.code} value={country.code}>
                {country.flag} {country.name}
              </option>
            ))}
          </select>
        </div>

        {selectedCountry && (
          <div className="country-details">
            <div className="detail-card">
              <div className="detail-header">
                <span className="detail-icon">🏛️</span>
                <h3>Tax Compliance System</h3>
              </div>
              <div className="detail-content">
                <div className="detail-value locked">
                  ✓ {selectedCountry.system}
                </div>
                <p className="detail-note">Automatic compliance engine (cannot be disabled)</p>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-header">
                <span className="detail-icon">💰</span>
                <h3>VAT Rate</h3>
              </div>
              <div className="detail-content">
                <div className="detail-value locked">
                  ✓ {selectedCountry.vat}% (Standard Rate)
                </div>
                <p className="detail-note">Auto-calculated on all transactions</p>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-header">
                <span className="detail-icon">📄</span>
                <h3>Invoice Format</h3>
              </div>
              <div className="detail-content">
                <div className="detail-value locked">
                  ✓ {selectedCountry.format}
                </div>
                <p className="detail-note">Government-approved format</p>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-header">
                <span className="detail-icon">🏢</span>
                <h3>Tax Authority</h3>
              </div>
              <div className="detail-content">
                <div className="detail-value">
                  {selectedCountry.authority}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="warning-box">
          <div className="warning-icon">⚠️</div>
          <div>
            <strong>Tax Engine Locked</strong>
            <p>
              The tax compliance engine is automatically configured based on your country
              and cannot be disabled. This ensures regulatory compliance.
            </p>
          </div>
        </div>
      </div>

      <div className="screen-actions">
        <button className="btn btn-secondary" onClick={onBack}>
          Back
        </button>
        <button
          className="btn btn-primary"
          onClick={onNext}
          disabled={!canContinue}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
