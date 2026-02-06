import React, { useState } from 'react';
import { InstallConfig } from '../App';
import '../styles/screens.css';

interface SummaryProps {
  config: InstallConfig;
  onNext: () => void;
  onBack: () => void;
}

const Summary: React.FC<SummaryProps> = ({ config, onNext, onBack }) => {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);

  const getDeploymentLabel = () => {
    switch (config.deployment) {
      case 'cloud':
        return 'Cloud (Hosted)';
      case 'private':
        return 'Private Cloud (Dedicated)';
      case 'on-premise':
        return 'On-Premise (Local Server)';
      default:
        return 'Not selected';
    }
  };

  const getDataPath = () => {
    if (config.deployment === 'on-premise') {
      return '/var/lib/eastbooks/data';
    } else if (config.deployment === 'private') {
      return 'Dedicated cloud storage';
    } else {
      return 'Shared cloud storage';
    }
  };

  const getAccessUrl = () => {
    if (config.deployment === 'on-premise') {
      return `http://localhost:${config.port}`;
    } else if (config.deployment === 'private') {
      return 'https://your-instance.eastbooks.com';
    } else {
      return 'https://app.eastbooks.com';
    }
  };

  const canInstall = () => {
    return agreedToTerms && agreedToPrivacy;
  };

  return (
    <div className="screen-container">
      <div className="screen-content">
        <div className="screen-header">
          <h1>Installation Summary</h1>
          <p className="subtitle">Review your configuration before installing</p>
          <div className="progress-indicator">
            <div className="progress-bar" style={{ width: '85%' }} />
          </div>
        </div>

        <div className="summary-grid">
          <div className="summary-section">
            <h3>
              <span className="section-icon">🚀</span>
              Deployment Type
            </h3>
            <div className="summary-value">{getDeploymentLabel()}</div>
          </div>

          <div className="summary-section">
            <h3>
              <span className="section-icon">🌍</span>
              Country & Compliance
            </h3>
            <div className="summary-value">
              <div>{config.countryName}</div>
              <div className="summary-detail">Tax System: {config.taxSystem}</div>
              <div className="summary-detail">VAT Rate: {config.vatRate}%</div>
            </div>
          </div>

          <div className="summary-section">
            <h3>
              <span className="section-icon">📦</span>
              Modules
            </h3>
            <div className="module-tags">
              {config.modules.map(module => (
                <span key={module} className="module-tag">
                  {module.charAt(0).toUpperCase() + module.slice(1)}
                </span>
              ))}
            </div>
          </div>

          <div className="summary-section">
            <h3>
              <span className="section-icon">🔑</span>
              License
            </h3>
            <div className="summary-value">
              {config.license ? (
                <>
                  <div>{config.license.plan} Plan</div>
                  <div className="summary-detail">Users: Up to {config.license.users}</div>
                  <div className="summary-detail">Expires: {config.license.expires}</div>
                </>
              ) : (
                <div>No license configured</div>
              )}
            </div>
          </div>

          <div className="summary-section">
            <h3>
              <span className="section-icon">💾</span>
              Data Location
            </h3>
            <div className="summary-value">{getDataPath()}</div>
          </div>

          <div className="summary-section">
            <h3>
              <span className="section-icon">🌐</span>
              Access URL
            </h3>
            <div className="summary-value">
              <code>{getAccessUrl()}</code>
            </div>
          </div>

          <div className="summary-section">
            <h3>
              <span className="section-icon">⚙️</span>
              Configuration
            </h3>
            <div className="summary-value">
              <div className="summary-detail">Port: {config.port}</div>
              <div className="summary-detail">
                Sample Data: {config.seedData ? 'Enabled' : 'Disabled'}
              </div>
            </div>
          </div>
        </div>

        <div className="legal-agreements">
          <h3>Legal Agreements</h3>
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
            />
            <span>
              I agree to the{' '}
              <a href="https://eastbooks.com/terms" target="_blank" rel="noopener noreferrer">
                Terms of Service
              </a>
            </span>
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={agreedToPrivacy}
              onChange={(e) => setAgreedToPrivacy(e.target.checked)}
            />
            <span>
              I have read and understand the{' '}
              <a href="https://eastbooks.com/privacy" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>
            </span>
          </label>
        </div>

        <div className="info-box info-box-warning">
          <span className="info-icon">⚠️</span>
          <div>
            <strong>Important:</strong>
            <ul>
              <li>This software is licensed, not sold. Source code is proprietary.</li>
              <li>
                {config.deployment === 'on-premise'
                  ? 'Installation requires Docker to be installed on your system.'
                  : 'A stable internet connection is required for installation.'}
              </li>
              <li>The installation process will take 5-10 minutes.</li>
              <li>
                Default admin credentials will be sent to your registered email address.
              </li>
            </ul>
          </div>
        </div>

        <div className="screen-footer">
          <button className="btn btn-secondary" onClick={onBack}>
            Back
          </button>
          <button
            className="btn btn-primary btn-large"
            onClick={onNext}
            disabled={!canInstall()}
          >
            Install Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default Summary;
