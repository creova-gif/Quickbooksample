import React, { useState, useRef } from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  Camera,
  Upload,
  CheckCircle,
  Loader2,
  AlertCircle,
  Sparkles,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

interface ExtractedData {
  amount: string;
  vendor: string;
  date: string;
  items: string[];
  suggestedCategory: string;
  confidence: number;
}

const EXPENSE_CATEGORIES = [
  { id: 'rent', name: 'Rent', icon: '🏢' },
  { id: 'utilities', name: 'Utilities', icon: '💡' },
  { id: 'supplies', name: 'Supplies', icon: '📦' },
  { id: 'food', name: 'Food & Beverages', icon: '🍽️' },
  { id: 'transport', name: 'Transport', icon: '🚗' },
  { id: 'marketing', name: 'Marketing', icon: '📢' },
  { id: 'other', name: 'Other Expense', icon: '💳' },
];

export function ReceiptOCR() {
  const { business, addTransaction } = useBusiness();
  const [step, setStep] = useState<'upload' | 'processing' | 'review' | 'success'>('upload');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [formData, setFormData] = useState({
    amount: '',
    vendor: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    description: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      processImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async (imageData: string) => {
    setStep('processing');

    // Simulate OCR processing (in production, this would call an OCR API)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock extracted data
    const mockData: ExtractedData = {
      amount: '2500',
      vendor: 'ABC Supplies Ltd',
      date: new Date().toISOString().split('T')[0],
      items: ['Office supplies', 'Printer paper', 'Pens'],
      suggestedCategory: 'supplies',
      confidence: 0.92,
    };

    setExtractedData(mockData);
    setFormData({
      amount: mockData.amount,
      vendor: mockData.vendor,
      date: mockData.date,
      category: mockData.suggestedCategory,
      description: `Receipt from ${mockData.vendor}`,
    });
    setStep('review');
  };

  const handleSave = () => {
    if (!formData.amount || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Create transaction
    addTransaction({
      date: new Date(formData.date).toISOString(),
      type: 'expense',
      amount: parseFloat(formData.amount),
      categoryId: formData.category,
      description: formData.description || `Receipt from ${formData.vendor}`,
      reference: `OCR-${Date.now()}`,
      attachments: imagePreview ? [imagePreview] : undefined,
      status: 'confirmed',
    });

    setStep('success');
    toast.success('Transaction created from receipt!');

    setTimeout(() => {
      handleReset();
    }, 2000);
  };

  const handleReset = () => {
    setStep('upload');
    setImageFile(null);
    setImagePreview(null);
    setExtractedData(null);
    setFormData({
      amount: '',
      vendor: '',
      date: new Date().toISOString().split('T')[0],
      category: '',
      description: '',
    });
  };

  return (
    <div className="space-y-4">
      {/* Upload Step */}
      {step === 'upload' && (
        <>
          <Card className="p-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                <Camera className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Upload Receipt</h3>
                <p className="text-sm text-muted-foreground">
                  We'll automatically extract transaction details
                </p>
              </div>

              {/* Camera Button (Mobile) */}
              <div className="space-y-2">
                <Button
                  className="w-full"
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo
                </Button>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                />

                {/* Upload Button */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose from Gallery
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                />
              </div>

              {/* Tips */}
              <div className="text-left bg-blue-50 rounded-lg p-4 mt-4">
                <p className="text-sm font-medium text-blue-900 mb-2">📸 Tips for best results:</p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Ensure good lighting</li>
                  <li>• Keep receipt flat and straight</li>
                  <li>• Capture the entire receipt</li>
                  <li>• Avoid shadows and glare</li>
                </ul>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Processing Step */}
      {step === 'processing' && (
        <Card className="p-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto">
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Processing Receipt...</h3>
              <p className="text-sm text-muted-foreground">
                Extracting transaction details with AI
              </p>
            </div>
            {imagePreview && (
              <div className="mt-4">
                <img
                  src={imagePreview}
                  alt="Receipt"
                  className="max-h-48 mx-auto rounded-lg border"
                />
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Review Step */}
      {step === 'review' && extractedData && (
        <>
          {/* AI Confidence Banner */}
          <Card className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-purple-900 text-sm">
                  AI extracted with {(extractedData.confidence * 100).toFixed(0)}% confidence
                </p>
                <p className="text-xs text-purple-700 mt-1">
                  Please review and confirm the details below
                </p>
              </div>
            </div>
          </Card>

          {/* Image Preview */}
          {imagePreview && (
            <Card className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Receipt Image</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <img
                src={imagePreview}
                alt="Receipt"
                className="w-full rounded-lg border"
              />
            </Card>
          )}

          {/* Form */}
          <Card className="p-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount ({business?.currency}) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="text-lg font-semibold"
                />
              </div>

              <div>
                <Label htmlFor="vendor">Vendor</Label>
                <Input
                  id="vendor"
                  value={formData.vendor}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  placeholder="Business name"
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <span className="flex items-center gap-2">
                          <span>{cat.icon}</span>
                          <span>{cat.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {extractedData.suggestedCategory === formData.category && (
                  <p className="text-xs text-muted-foreground mt-1">
                    ✨ AI suggested category
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add notes..."
                  rows={2}
                />
              </div>

              {/* Extracted Items */}
              {extractedData.items.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-medium mb-2">Extracted Items:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {extractedData.items.map((item, idx) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleReset}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSave}
              disabled={!formData.amount || !formData.category}
            >
              Save Transaction
            </Button>
          </div>
        </>
      )}

      {/* Success Step */}
      {step === 'success' && (
        <Card className="p-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Transaction Saved!</h3>
              <p className="text-sm text-muted-foreground">
                Receipt processed and transaction created
              </p>
            </div>
            <div className="text-lg font-bold">
              {business?.currency} {formData.amount}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
