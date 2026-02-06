import React, { useState } from 'react';
import { InstallConfig } from '../App';
import '../styles/screens.css';

interface LicenseActivationProps {
  config: InstallConfig;
  updateConfig: (updates: Partial<InstallConfig>) => void;
  onNext: () => void;
  onBack: () => void;
}

interface LicenseDetails {
  valid: boolean;
  plan: string;
  deployment: string;
  users: number;
  modules: string[];
  expires: string;
  support: string;
  company: string;
  error?: string;
}

const LicenseActivation: React.FC<LicenseActivationProps> = ({
  config,
  updateConfig,
  onNext,
  onBack
}) => {
  const [licenseKey, setLicenseKey] = useState(config.licenseKey || '');
  const [isValidating, setIsValidating] = useState(false);
  const [licenseDetails, setLicenseDetails] = useState<LicenseDetails | null>(null);
  const [error, setError] = useState('');

  const formatLicenseKey = (value: string) => {
    // Remove all non-alphanumeric characters
    const cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    
    // Split into groups of 4
    const groups = cleaned.match(/.{1,4}/g) || [];
    
    // Join with hyphens, limit to 5 groups
    return groups.slice(0, 5).join('-');
  };

  const handleLicenseKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatLicenseKey(e.target.value);
    setLicenseKey(formatted);
    setError('');
  };

  const validateLicense = async () => {
    if (!licenseKey || licenseKey.length < 24) {
      setError('Please enter a valid license key');
      return;
    }

    setIsValidating(true);
    setError('');

    try {
      // Call license validation API
      // In production, this would call: await window.electron.validateLicense(licenseKey)
      
      // Demo validation logic
      await new Promise(resolve => setTimeout(resolve, 1500));

      // For demo: Accept any key starting with "EAAP-"
      if (licenseKey.startsWith('EAAP-')) {
        const details: LicenseDetails = {
          valid: true,
          plan: 'Professional',
          deployment: config.deployment || 'on-premise',
          users: 25,
          modules: ['accounting', 'invoicing', 'tax', 'payroll'],
          expires: '2026-12-31',
          support: 'Professional (Email + Chat)',
          company: 'Demo Company Ltd.'
        };

        setLicenseDetails(details);
        updateConfig({
          licenseKey,
          license: details,
          maxUsers: details.users
        });
      } else {
        setError('Invalid license key. Please check and try again.');
        setLicenseDetails(null);
      }
    } catch (err) {
      setError('Failed to validate license. Please check your internet connection.');
      setLicenseDetails(null);
    } finally {
      setIsValidating(false);
    }
  };

  const handleSkipLicense = () => {
    // Set trial license
    const trialLicense: LicenseDetails = {
      valid: true,
      plan: 'Trial',
      deployment: config.deployment || 'on-premise',
      users: 5,
      modules: ['accounting', 'invoicing', 'tax'],
      expires: '30 days',
      support: 'Community (Forums)',
      company: 'Trial User'
    };

    setLicenseDetails(trialLicense);
    updateConfig({
      licenseKey: 'TRIAL',
      license: trialLicense,
      maxUsers: 5
    });

    // Automatically proceed to next step
    setTimeout(onNext, 1000);
  };

  const canContinue = () => {
    return licenseDetails?.valid || false;
  };

  return (
    <div className="screen-container">
      <div className="screen-content">
        <div className="screen-header">
          <h1>License Activation</h1>
          <p className="subtitle">Enter your license key or start a trial</p>
          <div className="progress-indicator">
            <div className="progress-bar" style={{ width: '71%' }} />
          </div>
        </div>

        <div className="license-form">
          <div className="form-group">
            <label htmlFor="license-key">License Key</label>
            <input
              id="license-key"
              type="text"
              className="input-large"
              placeholder="EAAP-XXXX-XXXX-XXXX-XXXX"
              value={licenseKey}
              onChange={handleLicenseKeyChange}
              maxLength={24}
              disabled={isValidating || !!licenseDetails}
            />
            <p className="input-hint">
              Enter your 20-character license key (format: EAAP-XXXX-XXXX-XXXX-XXXX)
            </p>
          </div>

          {error && (
            <div className="alert alert-error">
              <span className="alert-icon">❌</span>
              <span>{error}</span>
            </div>
          )}

          {licenseDetails?.valid && (
            <div className="alert alert-success">
              <span className="alert-icon">✅</span>
              <span>License validated successfully!</span>
            </div>
          )}

          <div className="button-group">
            {!licenseDetails && (
              <>
                <button
                  className="btn btn-primary"
                  onClick={validateLicense}
                  disabled={isValidating || licenseKey.length < 24}
                >
                  {isValidating ? (
                    <>
                      <span className="spinner"></span>
                      Validating...
                    </>
                  ) : (
                    'Validate License'
                  )}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={handleSkipLicense}
                  disabled={isValidating}
                >
                  Start 30-Day Trial
                </button>
              </>
            )}
          </div>

          {licenseDetails && (
            <div className="license-details">
              <h3>License Details</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Plan</span>
                  <span className="detail-value">{licenseDetails.plan}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Deployment</span>
                  <span className="detail-value">
                    {licenseDetails.deployment === 'on-premise'
                      ? 'On-Premise'
                      : licenseDetails.deployment === 'private'
                      ? 'Private Cloud'
                      : 'Cloud'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Max Users</span>
                  <span className="detail-value">{licenseDetails.users}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Expires</span>
                  <span className="detail-value">{licenseDetails.expires}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Support Level</span>
                  <span className="detail-value">{licenseDetails.support}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Company</span>
                  <span className="detail-value">{licenseDetails.company}</span>
                </div>
              </div>

              <div className="modules-list">
                <strong>Enabled Modules:</strong>
                <div className="module-tags">
                  {licenseDetails.modules.map(module => (
                    <span key={module} className="module-tag">
                      {module.charAt(0).toUpperCase() + module.slice(1)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="info-box">
          <span className="info-icon">🛒</span>
          <div>
            <strong>Don't have a license?</strong>
            <p>
              Purchase a license at{' '}
              <a href="https://eastbooks.com/pricing" target="_blank" rel="noopener noreferrer">
                eastbooks.com/pricing
              </a>{' '}
              or contact our sales team at{' '}
              <a href="mailto:sales@eastbooks.com">sales@eastbooks.com</a>
            </p>
          </div>
        </div>

        <div className="screen-footer">
          <button className="btn btn-secondary" onClick={onBack} disabled={isValidating}>
            Back
          </button>
          <button
            className="btn btn-primary"
            onClick={onNext}
            disabled={!canContinue() || isValidating}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default LicenseActivation;
