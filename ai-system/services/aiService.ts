/**
 * AI Service
 * Handles interaction with AI models and prompt management
 */

import { readFileSync } from 'fs';
import { join } from 'path';

interface SystemPrompt {
  id: string;
  version: string;
  context: any;
  principles: string[];
  constraints: any;
}

interface TaskPrompt {
  task_id: string;
  version: string;
  instructions: string[];
  decision_logic: any;
  output_schema: any;
}

export class AIService {
  private systemPrompt: SystemPrompt;
  private apiKey: string;
  private model: string;

  constructor(config: {
    systemPromptVersion?: string;
    apiKey?: string;
    model?: string;
  }) {
    this.apiKey = config.apiKey || process.env.OPENAI_API_KEY || '';
    this.model = config.model || 'gpt-4';
    
    // Load system prompt
    const version = config.systemPromptVersion || '1.0.0';
    this.systemPrompt = this.loadSystemPrompt(version);
  }

  /**
   * Load system prompt from registry
   */
  private loadSystemPrompt(version: string): SystemPrompt {
    const promptPath = join(
      __dirname,
      '../prompts/system',
      `ea_architect_v${version}.json`
    );
    
    try {
      const promptData = readFileSync(promptPath, 'utf-8');
      return JSON.parse(promptData);
    } catch (error) {
      console.error(`Failed to load system prompt v${version}:`, error);
      throw new Error('System prompt not found');
    }
  }

  /**
   * Load task prompt
   */
  private loadTaskPrompt(taskId: string, version: string = '1'): TaskPrompt {
    const promptPath = join(
      __dirname,
      '../prompts/tasks',
      `${taskId}_v${version}.json`
    );
    
    try {
      const promptData = readFileSync(promptPath, 'utf-8');
      return JSON.parse(promptData);
    } catch (error) {
      console.error(`Failed to load task prompt ${taskId}:`, error);
      throw new Error('Task prompt not found');
    }
  }

  /**
   * Build complete prompt with system + task context
   */
  private buildPrompt(taskPrompt: TaskPrompt, userInput: any): any[] {
    return [
      {
        role: 'system',
        content: JSON.stringify({
          identity: 'Enterprise Software Architect for EA Accounting Platform',
          context: this.systemPrompt.context,
          principles: this.systemPrompt.principles,
          constraints: this.systemPrompt.constraints,
          response_style: 'Professional, structured, implementation-ready'
        })
      },
      {
        role: 'user',
        content: JSON.stringify({
          task: taskPrompt.task_id,
          instructions: taskPrompt.instructions,
          input: userInput,
          output_schema: taskPrompt.output_schema
        })
      }
    ];
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(messages: any[]): Promise<any> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  }

  /**
   * Execute a task with AI
   */
  async execute(taskId: string, userInput: any, taskVersion?: string): Promise<any> {
    const taskPrompt = this.loadTaskPrompt(taskId, taskVersion);
    const messages = this.buildPrompt(taskPrompt, userInput);
    
    return this.callOpenAI(messages);
  }

  /**
   * Generate sales configuration
   */
  async generateSalesConfig(clientProfile: any): Promise<any> {
    return this.execute('sales', clientProfile);
  }

  /**
   * Generate compliance checklist
   */
  async generateComplianceChecklist(country: string): Promise<any> {
    return this.execute('compliance', { country });
  }

  /**
   * Generate installer configuration
   */
  async generateInstallerConfig(config: any): Promise<any> {
    return this.execute('installer', config);
  }
}

/**
 * Singleton instance
 */
export const aiService = new AIService({
  systemPromptVersion: process.env.AI_PROMPT_VERSION || '1.0.0',
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.AI_MODEL || 'gpt-4'
});
