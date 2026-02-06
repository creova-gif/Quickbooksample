import React, { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import {
  Download,
  Upload,
  Code,
  Palette,
  FileJson,
  Copy,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { figmaService } from '@/services/figma.service';
import { toast } from 'sonner';

export function FigmaIntegration() {
  const [figmaFileKey, setFigmaFileKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [exportedJSON, setExportedJSON] = useState('');
  const [designTokens, setDesignTokens] = useState('');
  const [cssVariables, setCssVariables] = useState('');
  const [copied, setCopied] = useState(false);

  const handleExportWireframes = () => {
    try {
      const json = figmaService.exportAsJSON();
      setExportedJSON(json);
      toast.success('Wireframes exported successfully!');
    } catch (error) {
      toast.error('Failed to export wireframes');
      console.error(error);
    }
  };

  const handleExtractTokens = async () => {
    if (!figmaFileKey) {
      toast.error('Please enter a Figma file key');
      return;
    }

    setLoading(true);
    try {
      const tokens = await figmaService.extractDesignTokens(figmaFileKey);
      setDesignTokens(JSON.stringify(tokens, null, 2));
      toast.success('Design tokens extracted!');
    } catch (error) {
      toast.error('Failed to extract design tokens');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSS = () => {
    try {
      const css = figmaService.exportDesignSystemToCSS();
      setCssVariables(css);
      toast.success('CSS variables generated!');
    } catch (error) {
      toast.error('Failed to generate CSS');
      console.error(error);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Palette className="w-4 h-4 mr-2" />
          Figma Integration
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Figma Integration</DialogTitle>
          <DialogDescription>
            Export wireframes, extract design tokens, and sync with Figma
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="export" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="export">
              <Download className="w-4 h-4 mr-2" />
              Export
            </TabsTrigger>
            <TabsTrigger value="import">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </TabsTrigger>
            <TabsTrigger value="tokens">
              <Code className="w-4 h-4 mr-2" />
              Tokens
            </TabsTrigger>
          </TabsList>

          {/* Export Tab */}
          <TabsContent value="export" className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <FileJson className="w-4 h-4" />
                Export Wireframes to Figma JSON
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Generate a Figma-compatible JSON structure of all app screens and components
              </p>
              <Button onClick={handleExportWireframes} className="w-full">
                Export Wireframes
              </Button>

              {exportedJSON && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label>Generated JSON</Label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(exportedJSON)}
                      >
                        {copied ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(exportedJSON, 'eastbooks-wireframes.json')}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    value={exportedJSON}
                    readOnly
                    className="font-mono text-xs h-64"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    💡 Import this JSON into Figma using a plugin or the Figma API
                  </p>
                </div>
              )}
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-2">How to Import to Figma</h3>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li>Copy the generated JSON</li>
                <li>Open Figma and create a new file</li>
                <li>Install a JSON import plugin (e.g., "JSON to Figma")</li>
                <li>Paste the JSON and import</li>
                <li>Your wireframes will appear as frames in Figma</li>
              </ol>
              <a
                href="https://www.figma.com/community/plugin/789839703871161985/JSON-to-Figma"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-2"
              >
                Get JSON to Figma Plugin
                <ExternalLink className="w-3 h-3" />
              </a>
            </Card>
          </TabsContent>

          {/* Import Tab */}
          <TabsContent value="import" className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Import Design Tokens from Figma
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Extract colors, spacing, and typography from a Figma file
              </p>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="figma-key">Figma File Key</Label>
                  <Input
                    id="figma-key"
                    placeholder="e.g., abc123def456"
                    value={figmaFileKey}
                    onChange={(e) => setFigmaFileKey(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Find this in your Figma file URL: figma.com/file/<strong>FILE_KEY</strong>/...
                  </p>
                </div>

                <div>
                  <Label htmlFor="figma-token">Figma Access Token</Label>
                  <Input
                    id="figma-token"
                    type="password"
                    placeholder="Enter your Figma personal access token"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Get your token from{' '}
                    <a
                      href="https://www.figma.com/developers/api#access-tokens"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Figma Settings → Account → Personal Access Tokens
                    </a>
                  </p>
                </div>

                <Button onClick={handleExtractTokens} disabled={loading} className="w-full">
                  {loading ? 'Extracting...' : 'Extract Design Tokens'}
                </Button>
              </div>

              {designTokens && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label>Extracted Tokens</Label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(designTokens)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(designTokens, 'design-tokens.json')}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    value={designTokens}
                    readOnly
                    className="font-mono text-xs h-48"
                  />
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Tokens Tab */}
          <TabsContent value="tokens" className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Code className="w-4 h-4" />
                Design System Variables
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Generate CSS variables for the design system
              </p>
              <Button onClick={handleExportCSS} className="w-full">
                Generate CSS Variables
              </Button>

              {cssVariables && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label>CSS Variables</Label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(cssVariables)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(cssVariables, 'design-system.css')}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    value={cssVariables}
                    readOnly
                    className="font-mono text-xs h-64"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    💡 Add this to your <code>src/styles/theme.css</code> file
                  </p>
                </div>
              )}
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-2">Available Design Tokens</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-medium mb-2">Colors (Country-Adaptive)</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#006B3F' }} />
                      <span className="text-xs">Kenya Primary</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#1EB53A' }} />
                      <span className="text-xs">Tanzania Primary</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FCDC04' }} />
                      <span className="text-xs">Uganda Primary</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#00A1DE' }} />
                      <span className="text-xs">Rwanda Primary</span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="font-medium mb-2">Spacing</p>
                  <p className="text-xs text-muted-foreground">xs (4px), sm (8px), md (16px), lg (24px), xl (32px)</p>
                </div>

                <div>
                  <p className="font-medium mb-2">Typography</p>
                  <p className="text-xs text-muted-foreground">H1 (24px), H2 (20px), Body (16px), Small (14px), Tiny (12px)</p>
                </div>

                <div>
                  <p className="font-medium mb-2">Border Radius</p>
                  <p className="text-xs text-muted-foreground">sm (4px), md (8px), lg (12px), full (9999px)</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
