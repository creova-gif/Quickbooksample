import React, { useState } from 'react';
import Welcome from './screens/Welcome';
import DeploymentType from './screens/DeploymentType';
import CountrySelect from './screens/CountrySelect';
import ModuleSelect from './screens/ModuleSelect';
import LicenseActivation from './screens/LicenseActivation';
import Summary from './screens/Summary';
import InstallProgress from './screens/InstallProgress';
import './App.css';

export interface InstallConfig {
  deployment: 'cloud' | 'private' | 'on-premise' | null;
  country: string;
  countryName: string;
  taxSystem: string;
  vatRate: number;
  modules: string[];
  licenseKey: string;
  license: any;
  maxUsers: number;
  port: number;
  seedData: boolean;
}

const STEPS = [
  'welcome',
  'deployment',
  'country',
  'modules',
  'license',
  'summary',
  'install'
] as const;

type Step = typeof STEPS[number];

function App() {
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [config, setConfig] = useState<InstallConfig>({
    deployment: null,
    country: '',
    countryName: '',
    taxSystem: '',
    vatRate: 0,
    modules: ['accounting', 'invoicing', 'tax'],
    licenseKey: '',
    license: null,
    maxUsers: 5,
    port: 3000,
    seedData: true
  });

  const updateConfig = (updates: Partial<InstallConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1]);
    }
  };

  const goToStep = (step: Step) => {
    setCurrentStep(step);
  };

  return (
    <div className="app">
      {currentStep === 'welcome' && (
        <Welcome onNext={nextStep} />
      )}
      {currentStep === 'deployment' && (
        <DeploymentType
          config={config}
          updateConfig={updateConfig}
          onNext={nextStep}
          onBack={prevStep}
        />
      )}
      {currentStep === 'country' && (
        <CountrySelect
          config={config}
          updateConfig={updateConfig}
          onNext={nextStep}
          onBack={prevStep}
        />
      )}
      {currentStep === 'modules' && (
        <ModuleSelect
          config={config}
          updateConfig={updateConfig}
          onNext={nextStep}
          onBack={prevStep}
        />
      )}
      {currentStep === 'license' && (
        <LicenseActivation
          config={config}
          updateConfig={updateConfig}
          onNext={nextStep}
          onBack={prevStep}
        />
      )}
      {currentStep === 'summary' && (
        <Summary
          config={config}
          onNext={nextStep}
          onBack={prevStep}
        />
      )}
      {currentStep === 'install' && (
        <InstallProgress
          config={config}
          onRestart={() => goToStep('welcome')}
        />
      )}
    </div>
  );
}

export default App;
