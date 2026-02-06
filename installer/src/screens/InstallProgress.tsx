import React, { useState, useEffect, useRef } from 'react';
import { InstallConfig } from '../App';
import '../styles/screens.css';

interface InstallProgressProps {
  config: InstallConfig;
  onRestart: () => void;
}

interface InstallStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  logs: string[];
}

const InstallProgress: React.FC<InstallProgressProps> = ({ config, onRestart }) => {
  const [steps, setSteps] = useState<InstallStep[]>([
    {
      id: 'config',
      label: 'Generating configuration',
      status: 'pending',
      logs: []
    },
    {
      id: 'database',
      label: 'Initializing database',
      status: 'pending',
      logs: []
    },
    {
      id: 'services',
      label: 'Starting services',
      status: 'pending',
      logs: []
    },
    {
      id: 'health',
      label: 'Verifying health',
      status: 'pending',
      logs: []
    }
  ]);

  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    runInstallation();
  }, []);

  useEffect(() => {
    // Auto-scroll logs to bottom
    if (showLogs && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [steps, showLogs]);

  const updateStep = (
    stepId: string,
    status: InstallStep['status'],
    newLogs: string[] = []
  ) => {
    setSteps(prev =>
      prev.map(step =>
        step.id === stepId
          ? { ...step, status, logs: [...step.logs, ...newLogs] }
          : step
      )
    );
  };

  const addLog = (stepId: string, log: string) => {
    setSteps(prev =>
      prev.map(step =>
        step.id === stepId ? { ...step, logs: [...step.logs, log] } : step
      )
    );
  };

  const runInstallation = async () => {
    try {
      // Step 1: Generate configuration
      updateStep('config', 'running', ['Starting configuration generation...']);
      setProgress(10);

      await simulateStep('config', [
        'Creating .env file...',
        `Setting deployment type: ${config.deployment}`,
        `Configuring for ${config.countryName}`,
        `Setting VAT rate: ${config.vatRate}%`,
        'Generating Docker Compose configuration...',
        `Port configuration: ${config.port}`,
        'Configuration files created successfully'
      ]);

      updateStep('config', 'complete');
      setProgress(25);

      // Step 2: Initialize database
      updateStep('database', 'running', ['Initializing PostgreSQL database...']);
      setProgress(30);

      await simulateStep('database', [
        'Pulling postgres:15 image...',
        'Creating database container...',
        'Starting PostgreSQL...',
        'Creating database schema...',
        'Running migrations...',
        'Setting up chart of accounts...',
        config.seedData ? 'Loading sample data...' : 'Skipping sample data...',
        'Database initialized successfully'
      ]);

      updateStep('database', 'complete');
      setProgress(50);

      // Step 3: Start services
      updateStep('services', 'running', ['Starting application services...']);
      setProgress(55);

      await simulateStep('services', [
        'Building backend service...',
        'Installing Node.js dependencies...',
        'Compiling TypeScript...',
        'Starting Express server...',
        'Loading tax adapters...',
        `Activated tax engine: ${config.taxSystem}`,
        'Backend service started on port 4000',
        'Building frontend service...',
        'Compiling React application...',
        `Frontend service started on port ${config.port}`,
        'All services running'
      ]);

      updateStep('services', 'complete');
      setProgress(75);

      // Step 4: Health checks
      updateStep('health', 'running', ['Running health checks...']);
      setProgress(80);

      await simulateStep('health', [
        'Checking database connection...',
        '✓ Database: Connected',
        'Checking backend API...',
        '✓ Backend API: Responding',
        'Checking frontend application...',
        '✓ Frontend: Responding',
        'Verifying tax adapter...',
        `✓ Tax Adapter (${config.taxSystem}): Loaded`,
        'All health checks passed'
      ]);

      updateStep('health', 'complete');
      setProgress(100);

      // Complete!
      setIsComplete(true);
    } catch (error) {
      console.error('Installation error:', error);
      setHasError(true);
      const currentStep = steps.find(s => s.status === 'running');
      if (currentStep) {
        updateStep(currentStep.id, 'error', [
          'Error: Installation failed',
          error instanceof Error ? error.message : 'Unknown error occurred'
        ]);
      }
    }
  };

  const simulateStep = async (stepId: string, logs: string[]) => {
    for (const log of logs) {
      await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));
      addLog(stepId, log);
    }
  };

  const getStepIcon = (status: InstallStep['status']) => {
    switch (status) {
      case 'complete':
        return '✓';
      case 'running':
        return '⏳';
      case 'error':
        return '✗';
      default:
        return '○';
    }
  };

  const getStepClassName = (status: InstallStep['status']) => {
    return `step-item step-${status}`;
  };

  const handleOpenApp = () => {
    const url =
      config.deployment === 'on-premise'
        ? `http://localhost:${config.port}`
        : 'https://app.eastbooks.com';
    
    // In Electron, this would use: window.electron.openExternal(url)
    window.open(url, '_blank');
  };

  const handleViewDocs = () => {
    // In Electron, this would use: window.electron.openExternal('https://docs.eastbooks.com')
    window.open('https://docs.eastbooks.com', '_blank');
  };

  return (
    <div className="screen-container">
      <div className="screen-content">
        <div className="screen-header">
          {!isComplete && !hasError && <h1>Installing...</h1>}
          {isComplete && <h1>✅ Installation Complete!</h1>}
          {hasError && <h1>❌ Installation Failed</h1>}
          
          <div className="progress-indicator">
            <div className="progress-bar" style={{ width: `${progress}%` }} />
          </div>
          <div className="progress-text">{progress}%</div>
        </div>

        <div className="install-steps">
          {steps.map(step => (
            <div key={step.id} className={getStepClassName(step.status)}>
              <span className="step-icon">{getStepIcon(step.status)}</span>
              <span className="step-label">{step.label}</span>
            </div>
          ))}
        </div>

        {isComplete && (
          <div className="success-message">
            <div className="success-icon">🎉</div>
            <h2>Your EA Accounting Platform is ready!</h2>
            <p>The installation completed successfully.</p>

            <div className="access-info">
              <div className="info-card">
                <h3>🌐 Access Your System</h3>
                <div className="access-url">
                  {config.deployment === 'on-premise'
                    ? `http://localhost:${config.port}`
                    : 'https://app.eastbooks.com'}
                </div>
              </div>

              <div className="info-card">
                <h3>🔐 Default Login</h3>
                <div className="login-info">
                  <div>Email: admin@yourcompany.com</div>
                  <div>Password: (check your email)</div>
                </div>
              </div>
            </div>

            <div className="next-steps">
              <h3>Next Steps:</h3>
              <ol>
                <li>Open your browser and access the system</li>
                <li>Complete the onboarding wizard</li>
                <li>Import your existing data (optional)</li>
                <li>Invite team members</li>
                <li>Configure payment methods</li>
              </ol>
            </div>

            <div className="action-buttons">
              <button className="btn btn-primary btn-large" onClick={handleOpenApp}>
                Open Application
              </button>
              <button className="btn btn-secondary" onClick={handleViewDocs}>
                View Documentation
              </button>
            </div>
          </div>
        )}

        {hasError && (
          <div className="error-message">
            <div className="error-icon">⚠️</div>
            <h2>Installation encountered an error</h2>
            <p>Please check the logs below for details.</p>
            <div className="action-buttons">
              <button className="btn btn-primary" onClick={onRestart}>
                Start Over
              </button>
              <button className="btn btn-secondary" onClick={() => setShowLogs(true)}>
                View Logs
              </button>
            </div>
          </div>
        )}

        {!isComplete && (
          <div className="logs-section">
            <div className="logs-header">
              <h3>Installation Logs</h3>
              <button
                className="btn-link"
                onClick={() => setShowLogs(!showLogs)}
              >
                {showLogs ? 'Hide' : 'Show'} Detailed Logs
              </button>
            </div>

            {showLogs && (
              <div className="logs-container">
                {steps.map(step =>
                  step.logs.map((log, idx) => (
                    <div key={`${step.id}-${idx}`} className="log-line">
                      <span className="log-timestamp">
                        {new Date().toLocaleTimeString()}
                      </span>
                      <span className="log-message">{log}</span>
                    </div>
                  ))
                )}
                <div ref={logsEndRef} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InstallProgress;
