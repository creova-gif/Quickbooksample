import React from 'react';
import { InstallConfig } from '../App';
import '../styles/screens.css';

interface ModuleSelectProps {
  config: InstallConfig;
  updateConfig: (updates: Partial<InstallConfig>) => void;
  onNext: () => void;
  onBack: () => void;
}

interface Module {
  id: string;
  name: string;
  description: string;
  required: boolean;
  icon: string;
  price: number;
  features: string[];
}

const MODULES: Module[] = [
  {
    id: 'accounting',
    name: 'Accounting',
    description: 'Double-entry bookkeeping, general ledger, chart of accounts',
    required: true,
    icon: '📊',
    price: 0,
    features: [
      'Double-entry bookkeeping',
      'General ledger',
      'Chart of accounts',
      'Journal entries',
      'Trial balance'
    ]
  },
  {
    id: 'invoicing',
    name: 'Invoicing',
    description: 'Invoice creation, PDF generation, client management',
    required: true,
    icon: '🧾',
    price: 0,
    features: [
      'Invoice creation & editing',
      'PDF generation',
      'Client management',
      'Payment tracking',
      'Invoice templates'
    ]
  },
  {
    id: 'tax',
    name: 'Tax Compliance',
    description: 'Country-specific VAT, tax calculations, e-invoicing',
    required: true,
    icon: '🏛️',
    price: 0,
    features: [
      'VAT calculation',
      'Tax reports',
      'E-invoicing compliance',
      'Government submissions',
      'Audit trail'
    ]
  },
  {
    id: 'payroll',
    name: 'Payroll',
    description: 'Employee management, salary processing, PAYE, NSSF',
    required: false,
    icon: '💰',
    price: 29,
    features: [
      'Employee database',
      'Salary processing',
      'PAYE calculations',
      'NSSF/pension contributions',
      'Payslips generation'
    ]
  },
  {
    id: 'inventory',
    name: 'Inventory',
    description: 'Stock management, COGS, purchase orders, warehousing',
    required: false,
    icon: '📦',
    price: 19,
    features: [
      'Stock tracking',
      'Purchase orders',
      'COGS calculation',
      'Multi-location warehouses',
      'Stock valuation'
    ]
  }
];

const ModuleSelect: React.FC<ModuleSelectProps> = ({
  config,
  updateConfig,
  onNext,
  onBack
}) => {
  const handleModuleToggle = (moduleId: string) => {
    const module = MODULES.find(m => m.id === moduleId);
    if (module?.required) return; // Cannot deselect required modules

    const currentModules = config.modules || [];
    const isSelected = currentModules.includes(moduleId);

    if (isSelected) {
      updateConfig({
        modules: currentModules.filter(id => id !== moduleId)
      });
    } else {
      updateConfig({
        modules: [...currentModules, moduleId]
      });
    }
  };

  const isModuleSelected = (moduleId: string) => {
    return config.modules?.includes(moduleId) || false;
  };

  const canContinue = () => {
    const requiredModules = MODULES.filter(m => m.required).map(m => m.id);
    return requiredModules.every(id => config.modules?.includes(id));
  };

  return (
    <div className="screen-container">
      <div className="screen-content">
        <div className="screen-header">
          <h1>Select Modules</h1>
          <p className="subtitle">Choose the features you need for your business</p>
          <div className="progress-indicator">
            <div className="progress-bar" style={{ width: '57%' }} />
          </div>
        </div>

        <div className="modules-grid">
          {MODULES.map((module) => (
            <div
              key={module.id}
              className={`module-card ${isModuleSelected(module.id) ? 'selected' : ''} ${
                module.required ? 'required' : ''
              }`}
              onClick={() => handleModuleToggle(module.id)}
              style={{ cursor: module.required ? 'not-allowed' : 'pointer' }}
            >
              <div className="module-header">
                <div className="module-icon">{module.icon}</div>
                <div className="module-info">
                  <h3>{module.name}</h3>
                  {module.required && (
                    <span className="badge badge-required">Required</span>
                  )}
                  {!module.required && module.price > 0 && (
                    <span className="badge badge-price">+${module.price}/mo</span>
                  )}
                </div>
                <div className="checkbox">
                  {isModuleSelected(module.id) ? (
                    <span className="check-icon">✓</span>
                  ) : (
                    <span className="check-empty"></span>
                  )}
                </div>
              </div>

              <p className="module-description">{module.description}</p>

              <div className="module-features">
                {module.features.map((feature, idx) => (
                  <div key={idx} className="feature-item">
                    <span className="feature-bullet">•</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {!module.required && !isModuleSelected(module.id) && (
                <div className="module-footer">
                  <span className="upgrade-text">
                    Available in Professional & Enterprise plans
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="info-box">
          <span className="info-icon">ℹ️</span>
          <div>
            <strong>Module Licensing:</strong> Additional modules can be enabled later
            by upgrading your license. Contact sales for custom module configurations.
          </div>
        </div>

        <div className="screen-footer">
          <button className="btn btn-secondary" onClick={onBack}>
            Back
          </button>
          <button
            className="btn btn-primary"
            onClick={onNext}
            disabled={!canContinue()}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModuleSelect;
