import React from 'react';
import { InstallConfig } from '../App';

interface DeploymentTypeProps {
  config: InstallConfig;
  updateConfig: (updates: Partial<InstallConfig>) => void;
  onNext: () => void;
  onBack: () => void;
}

const DEPLOYMENTS = [
  {
    id: 'cloud' as const,
    name: 'Cloud (Hosted)',
    description: 'Fully managed infrastructure with automatic updates',
    price: 'Starting at $49/month',
    icon: '☁️',
    features: [
      'Automatic backups',
      'Managed updates',
      '99.9% uptime SLA',
      'Global CDN'
    ]
  },
  {
    id: 'private' as const,
    name: 'Private Cloud (Dedicated)',
    description: 'Isolated instance with enhanced security',
    price: 'Starting at $299/month',
    icon: '🔒',
    features: [
      'Dedicated resources',
      'VPN access',
      'Custom domain',
      'Priority support'
    ]
  },
  {
    id: 'on-premise' as const,
    name: 'On-Premise (Local Server)',
    description: 'Complete control with local installation',
    price: 'Starting at $1,999/year',
    icon: '🏢',
    features: [
      'Full data control',
      'Offline capability',
      'Custom integration',
      'Perpetual license option'
    ]
  }
];

export default function DeploymentType({
  config,
  updateConfig,
  onNext,
  onBack
}: DeploymentTypeProps) {
  const [selected, setSelected] = React.useState(config.deployment);

  const handleSelect = (deployment: typeof selected) => {
    setSelected(deployment);
    updateConfig({ deployment });
  };

  const canContinue = selected !== null;

  return (
    <div className="screen deployment-screen">
      <div className="screen-header">
        <h2>Select Deployment Type</h2>
        <p className="subtitle">Choose how you want to run EastBooks</p>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: '14%' }}></div>
        </div>
      </div>

      <div className="screen-content">
        <div className="deployment-grid">
          {DEPLOYMENTS.map((deployment) => (
            <div
              key={deployment.id}
              className={`deployment-card ${selected === deployment.id ? 'selected' : ''}`}
              onClick={() => handleSelect(deployment.id)}
            >
              <div className="deployment-header">
                <div className="deployment-icon">{deployment.icon}</div>
                <div>
                  <h3>{deployment.name}</h3>
                  <p className="deployment-description">{deployment.description}</p>
                </div>
              </div>

              <div className="deployment-price">{deployment.price}</div>

              <ul className="deployment-features">
                {deployment.features.map((feature, idx) => (
                  <li key={idx}>
                    <span className="checkmark">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="deployment-select">
                {selected === deployment.id ? (
                  <span className="selected-badge">✓ Selected</span>
                ) : (
                  <span className="select-text">Click to select</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {selected === 'on-premise' && (
          <div className="info-box">
            <div className="info-icon">ℹ️</div>
            <div>
              <strong>On-Premise Deployment</strong>
              <p>
                Includes offline access and full data sovereignty. Annual license required.
                Docker must be installed on your server.
              </p>
            </div>
          </div>
        )}
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
