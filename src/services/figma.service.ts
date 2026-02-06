/**
 * Figma REST API Integration Service
 * 
 * This service allows the app to:
 * 1. Export wireframes/designs to Figma
 * 2. Import design tokens from Figma
 * 3. Sync UI components with Figma designs
 * 4. Generate design specs for developers
 */

import axios from 'axios';

const FIGMA_API_BASE = 'https://api.figma.com/v1';
const FIGMA_ACCESS_TOKEN = import.meta.env.VITE_FIGMA_ACCESS_TOKEN;

interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
}

interface FigmaFrame {
  name: string;
  type: 'FRAME' | 'COMPONENT' | 'INSTANCE';
  width?: number;
  height?: number;
  children?: FigmaFrame[];
  fills?: any[];
  strokes?: any[];
}

interface FigmaDocument {
  document: {
    name: string;
    children: FigmaFrame[];
  };
}

interface DesignToken {
  name: string;
  value: string;
  type: 'color' | 'spacing' | 'typography' | 'shadow';
}

class FigmaService {
  private api = axios.create({
    baseURL: FIGMA_API_BASE,
    headers: {
      'X-Figma-Token': FIGMA_ACCESS_TOKEN,
    },
  });

  /**
   * Get file from Figma
   */
  async getFile(fileKey: string) {
    try {
      const response = await this.api.get(`/files/${fileKey}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch Figma file:', error);
      throw error;
    }
  }

  /**
   * Get specific node from Figma file
   */
  async getNode(fileKey: string, nodeId: string) {
    try {
      const response = await this.api.get(`/files/${fileKey}/nodes`, {
        params: { ids: nodeId },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch Figma node:', error);
      throw error;
    }
  }

  /**
   * Export wireframes to Figma JSON format
   */
  exportWireframesToFigma(): FigmaDocument {
    return {
      document: {
        name: 'EA Accounting Platform',
        children: [
          // Onboarding Flow
          {
            name: 'Onboarding',
            type: 'FRAME',
            width: 375,
            height: 812,
            children: [
              {
                name: 'Country Selector',
                type: 'COMPONENT',
                children: [
                  { name: 'Title', type: 'FRAME' },
                  { name: 'Country List', type: 'FRAME' },
                  { name: 'Kenya Option', type: 'COMPONENT' },
                  { name: 'Tanzania Option', type: 'COMPONENT' },
                  { name: 'Uganda Option', type: 'COMPONENT' },
                  { name: 'Rwanda Option', type: 'COMPONENT' },
                  { name: 'Burundi Option', type: 'COMPONENT' },
                ],
              },
              {
                name: 'Business Info',
                type: 'COMPONENT',
                children: [
                  { name: 'Business Name Input', type: 'COMPONENT' },
                  { name: 'TIN Input', type: 'COMPONENT' },
                  { name: 'Address Input', type: 'COMPONENT' },
                  { name: 'Continue Button', type: 'COMPONENT' },
                ],
              },
              {
                name: 'Tax Setup',
                type: 'COMPONENT',
                children: [
                  { name: 'VAT Registration Toggle', type: 'COMPONENT' },
                  { name: 'Tax ID Input', type: 'COMPONENT' },
                  { name: 'Complete Button', type: 'COMPONENT' },
                ],
              },
            ],
          },
          // Dashboard
          {
            name: 'Dashboard',
            type: 'FRAME',
            width: 375,
            height: 812,
            children: [
              { name: 'Header', type: 'COMPONENT' },
              {
                name: 'Summary Cards',
                type: 'COMPONENT',
                children: [
                  { name: 'Money In Card', type: 'COMPONENT' },
                  { name: 'Money Out Card', type: 'COMPONENT' },
                  { name: 'Profit Card', type: 'COMPONENT' },
                ],
              },
              { name: 'Trend Chart', type: 'COMPONENT' },
              {
                name: 'Quick Actions',
                type: 'COMPONENT',
                children: [
                  { name: 'Add Sale Button', type: 'COMPONENT' },
                  { name: 'Add Expense Button', type: 'COMPONENT' },
                  { name: 'New Invoice Button', type: 'COMPONENT' },
                ],
              },
              { name: 'Recent Activity List', type: 'COMPONENT' },
              { name: 'Tax Reminder', type: 'COMPONENT' },
              { name: 'Bottom Navigation', type: 'COMPONENT' },
            ],
          },
          // Transactions
          {
            name: 'Transactions',
            type: 'FRAME',
            width: 375,
            height: 812,
            children: [
              { name: 'Search Bar', type: 'COMPONENT' },
              { name: 'Filter Pills', type: 'COMPONENT' },
              { name: 'Summary Cards', type: 'COMPONENT' },
              {
                name: 'Transaction List',
                type: 'COMPONENT',
                children: [
                  { name: 'Transaction Item', type: 'COMPONENT' },
                ],
              },
            ],
          },
          // Invoices
          {
            name: 'Invoices',
            type: 'FRAME',
            width: 375,
            height: 812,
            children: [
              {
                name: 'Invoice Form',
                type: 'COMPONENT',
                children: [
                  { name: 'Customer Selector', type: 'COMPONENT' },
                  { name: 'Line Items', type: 'COMPONENT' },
                  { name: 'VAT Calculation', type: 'COMPONENT' },
                  { name: 'Preview Button', type: 'COMPONENT' },
                ],
              },
              { name: 'Preview PDF', type: 'COMPONENT' },
            ],
          },
          // Reports
          {
            name: 'Reports',
            type: 'FRAME',
            width: 375,
            height: 812,
            children: [
              { name: 'Period Selector', type: 'COMPONENT' },
              { name: 'Profit & Loss Card', type: 'COMPONENT' },
              { name: 'Cash Flow Card', type: 'COMPONENT' },
              { name: 'Balance Sheet Card', type: 'COMPONENT' },
              { name: 'VAT Summary Card', type: 'COMPONENT' },
            ],
          },
          // Receipt OCR
          {
            name: 'Receipt OCR',
            type: 'FRAME',
            width: 375,
            height: 812,
            children: [
              { name: 'Camera Button', type: 'COMPONENT' },
              { name: 'Upload Button', type: 'COMPONENT' },
              { name: 'Processing State', type: 'COMPONENT' },
              { name: 'Review Form', type: 'COMPONENT' },
              { name: 'Success State', type: 'COMPONENT' },
            ],
          },
          // Mobile Money Payment
          {
            name: 'Mobile Money Payment',
            type: 'FRAME',
            width: 375,
            height: 812,
            children: [
              { name: 'Provider Selection', type: 'COMPONENT' },
              { name: 'Phone Input', type: 'COMPONENT' },
              { name: 'Processing State', type: 'COMPONENT' },
              { name: 'Success State', type: 'COMPONENT' },
            ],
          },
        ],
      },
    };
  }

  /**
   * Extract design tokens from Figma file
   */
  async extractDesignTokens(fileKey: string): Promise<DesignToken[]> {
    try {
      const file = await this.getFile(fileKey);
      const tokens: DesignToken[] = [];

      // Extract colors from styles
      if (file.styles) {
        Object.values(file.styles).forEach((style: any) => {
          if (style.styleType === 'FILL') {
            tokens.push({
              name: style.name,
              value: this.rgbToHex(style.fills[0]?.color),
              type: 'color',
            });
          }
        });
      }

      return tokens;
    } catch (error) {
      console.error('Failed to extract design tokens:', error);
      return [];
    }
  }

  /**
   * Generate component specs for developers
   */
  generateComponentSpecs(wireframes: FigmaDocument) {
    const specs: Record<string, any> = {};

    wireframes.document.children.forEach((frame) => {
      specs[frame.name] = {
        name: frame.name,
        type: frame.type,
        components: this.extractComponents(frame.children || []),
      };
    });

    return specs;
  }

  /**
   * Export wireframes as JSON for Figma import
   */
  exportAsJSON(): string {
    const wireframes = this.exportWireframesToFigma();
    return JSON.stringify(wireframes, null, 2);
  }

  /**
   * Convert RGB to Hex
   */
  private rgbToHex(rgb: { r: number; g: number; b: number }): string {
    const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0');
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
  }

  /**
   * Extract components recursively
   */
  private extractComponents(children: FigmaFrame[]): any[] {
    return children.map((child) => ({
      name: child.name,
      type: child.type,
      hasChildren: (child.children?.length || 0) > 0,
      children: child.children ? this.extractComponents(child.children) : [],
    }));
  }

  /**
   * Get design system variables
   */
  getDesignSystemVariables() {
    return {
      colors: {
        // Kenya
        'kenya-primary': '#006B3F',
        'kenya-secondary': '#BC2025',
        // Tanzania
        'tanzania-primary': '#1EB53A',
        'tanzania-secondary': '#00A3DD',
        // Uganda
        'uganda-primary': '#FCDC04',
        'uganda-secondary': '#000000',
        // Rwanda
        'rwanda-primary': '#00A1DE',
        'rwanda-secondary': '#FAD201',
        // Burundi
        'burundi-primary': '#CE1126',
        'burundi-secondary': '#1EB53A',
        // UI Colors
        'blue-600': '#3b82f6',
        'green-600': '#10b981',
        'red-600': '#ef4444',
        'gray-50': '#f9fafb',
        'gray-900': '#111827',
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
      },
      typography: {
        'h1': { size: '24px', weight: 'bold' },
        'h2': { size: '20px', weight: '600' },
        'body': { size: '16px', weight: '400' },
        'small': { size: '14px', weight: '400' },
        'tiny': { size: '12px', weight: '400' },
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'full': '9999px',
      },
    };
  }

  /**
   * Export design system to CSS variables
   */
  exportDesignSystemToCSS(): string {
    const vars = this.getDesignSystemVariables();
    let css = ':root {\n';

    // Colors
    Object.entries(vars.colors).forEach(([name, value]) => {
      css += `  --color-${name}: ${value};\n`;
    });

    // Spacing
    Object.entries(vars.spacing).forEach(([name, value]) => {
      css += `  --spacing-${name}: ${value};\n`;
    });

    // Border Radius
    Object.entries(vars.borderRadius).forEach(([name, value]) => {
      css += `  --radius-${name}: ${value};\n`;
    });

    css += '}\n';
    return css;
  }

  /**
   * Generate Figma plugin manifest
   */
  generatePluginManifest() {
    return {
      name: 'EastBooks Design Sync',
      id: 'eastbooks-design-sync',
      api: '1.0.0',
      main: 'code.js',
      ui: 'ui.html',
      capabilities: ['fileRead', 'fileWrite'],
      permissions: ['currentUser'],
    };
  }
}

export const figmaService = new FigmaService();
