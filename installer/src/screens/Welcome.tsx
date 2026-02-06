import React from 'react';

interface WelcomeProps {
  onNext: () => void;
}

export default function Welcome({ onNext }: WelcomeProps) {
  return (
    <div className="screen welcome-screen">
      <div className="screen-content">
        <div className="logo-container">
          <div className="logo">📊</div>
          <h1 className="app-title">EastBooks</h1>
          <p className="app-subtitle">Enterprise Accounting Platform</p>
        </div>

        <div className="welcome-text">
          <h2>Welcome to the Installer</h2>
          <p className="description">
            This wizard will guide you through the installation of EastBooks,
            a QuickBooks-level accounting platform built for East Africa.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">☁️</div>
            <h3>Flexible Deployment</h3>
            <p>Cloud, Private Cloud, or On-Premise</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🌍</div>
            <h3>Regional Compliance</h3>
            <p>TIMS, EFRIS, VFD, EBM built-in</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Offline Ready</h3>
            <p>Works without internet connection</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Enterprise Security</h3>
            <p>Audit-ready with encryption</p>
          </div>
        </div>

        <div className="install-time">
          <p>⏱️ Estimated installation time: 10-15 minutes</p>
        </div>
      </div>

      <div className="screen-actions">
        <button className="btn btn-primary btn-lg" onClick={onNext}>
          Start Installation
        </button>
        <button className="btn btn-ghost" onClick={() => window.open('https://docs.eastbooks.com')}>
          View Documentation
        </button>
      </div>
    </div>
  );
}
