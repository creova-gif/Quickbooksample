# AI Prompt Registry & Sales Configurator

## Enterprise AI Architecture for EA Accounting Platform

This system turns your AI into:
- 🎯 Sales engineer (automated proposals)
- 🏗️ System architect (deployment recommendations)
- 📋 Compliance advisor (regulatory guidance)
- 💰 Pricing optimizer (revenue protection)

---

## Architecture Overview

```
AI System
│
├── Prompt Registry (versioned)
│   ├── System Prompts (core behavior)
│   ├── Task Prompts (specific actions)
│   └── Agent Prompts (sales, compliance, etc.)
│
├── Sales Configurator
│   ├── Client Input Collection
│   ├── AI Recommendation Engine
│   └── Proposal Generation
│
└── Output Generators
    ├── Proposals
    ├── SOWs
    ├── Pricing Quotes
    └── Installer Configs
```

---

## File Structure

```
/ai-system/
├── prompts/
│   ├── system/
│   │   ├── ea_architect_v1.0.0.json
│   │   └── ea_architect_v1.1.0.json
│   ├── tasks/
│   │   ├── installer_v1.json
│   │   ├── sales_v1.json
│   │   ├── compliance_v1.json
│   │   └── deployment_v1.json
│   ├── agents/
│   │   ├── sales_engineer.json
│   │   ├── compliance_advisor.json
│   │   └── pricing_optimizer.json
│   └── changelog.json
│
├── configurator/
│   ├── SalesConfiguratorUI.tsx
│   ├── ProposalGenerator.tsx
│   └── ConfigurationEngine.ts
│
└── services/
    ├── promptService.ts
    ├── aiService.ts
    └── proposalService.ts
```

---

## Implementation Guide

See individual files:
- `/ai-system/prompts/` - All prompt schemas
- `/ai-system/configurator/` - Sales UI components
- `/ai-system/services/` - Backend integration

---

## Quick Start

### 1. Set Up Prompt Registry
```bash
cd ai-system
npm install
```

### 2. Initialize AI Service
```typescript
import { AIService } from './services/aiService';

const ai = new AIService({
  systemPrompt: 'ea_architect_v1.0.0',
  apiKey: process.env.OPENAI_API_KEY
});
```

### 3. Run Sales Configurator
```typescript
import { SalesConfigurator } from './configurator/ConfigurationEngine';

const config = await SalesConfigurator.generate({
  company_size: '11-50',
  country: 'KE',
  deployment_preference: 'onprem'
});
```

---

## What This Achieves

| Without AI System | With AI System |
|-------------------|----------------|
| Manual proposals | Auto-generated |
| Pricing guesswork | AI-optimized |
| Long sales cycles | Instant quotes |
| Inconsistent positioning | Standardized |
| Revenue leakage | Protected margins |

---

## Next Steps

1. ✅ Review prompt schemas
2. ✅ Customize for your brand
3. ✅ Deploy configurator UI
4. ✅ Connect to backend
5. ✅ Train sales team
6. ✅ Start closing deals 🎯
