import React, { useState, useEffect } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Switch } from '@/app/components/ui/switch';
import {
  Send,
  Mail,
  MessageSquare,
  CheckCircle,
  Clock,
  Calendar,
  Sparkles,
  Plus,
  Edit,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

interface MessageTemplate {
  id: string;
  name: string;
  trigger: 'booking_confirmed' | 'reminder_24h' | 'check_in' | 'check_out' | 'review_request' | 'manual';
  subject: string;
  body: string;
  enabled: boolean;
  channel: 'email' | 'sms' | 'both';
}

interface SentMessage {
  id: string;
  booking_id: string;
  guest_name: string;
  guest_email: string;
  template_id: string;
  template_name: string;
  channel: 'email' | 'sms' | 'both';
  status: 'sent' | 'delivered' | 'failed';
  sent_at: string;
}

const defaultTemplates: MessageTemplate[] = [
  {
    id: 'TPL001',
    name: 'Booking Confirmation',
    trigger: 'booking_confirmed',
    subject: 'Your booking is confirmed! 🎉',
    body: `Hi {{guest_name}},

Great news! Your booking for {{service_name}} has been confirmed.

📅 Dates: {{date_start}} to {{date_end}}
👥 Guests: {{guests}}
💰 Total: {{currency}} {{amount}}

Your confirmation number: {{booking_id}}

We look forward to hosting you!

Best regards,
{{provider_name}}`,
    enabled: true,
    channel: 'both',
  },
  {
    id: 'TPL002',
    name: '24-Hour Reminder',
    trigger: 'reminder_24h',
    subject: 'Your adventure starts tomorrow! 🌍',
    body: `Hi {{guest_name}},

This is a friendly reminder that your {{service_name}} begins tomorrow!

📅 Date: {{date_start}}
📍 Meeting Point: {{meeting_point}}
⏰ Time: {{meeting_time}}

Things to bring:
✓ Confirmation number: {{booking_id}}
✓ Valid ID
✓ Comfortable clothing

See you soon!
{{provider_name}}`,
    enabled: true,
    channel: 'both',
  },
  {
    id: 'TPL003',
    name: 'Check-In Reminder',
    trigger: 'check_in',
    subject: 'Check-in instructions for your stay',
    body: `Hi {{guest_name}},

You can check in today! Here are your details:

🏠 Property: {{service_name}}
📍 Address: {{address}}
🔑 Check-in time: {{check_in_time}}

Access code: {{access_code}}

If you need anything, contact us at {{contact_phone}}.

Enjoy your stay!
{{provider_name}}`,
    enabled: true,
    channel: 'email',
  },
  {
    id: 'TPL004',
    name: 'Review Request',
    trigger: 'review_request',
    subject: 'How was your experience? ⭐',
    body: `Hi {{guest_name}},

Thank you for choosing {{service_name}}! We hope you had an amazing time.

We'd love to hear about your experience. Your feedback helps us improve and helps other travelers make informed decisions.

📝 Leave a review: {{review_link}}

As a thank you, we're offering 10% off your next booking!

Best regards,
{{provider_name}}`,
    enabled: true,
    channel: 'email',
  },
];

const mockSentMessages: SentMessage[] = [
  {
    id: 'MSG001',
    booking_id: 'BK001',
    guest_name: 'Sarah Johnson',
    guest_email: 'sarah@example.com',
    template_id: 'TPL001',
    template_name: 'Booking Confirmation',
    channel: 'both',
    status: 'delivered',
    sent_at: new Date().toISOString(),
  },
  {
    id: 'MSG002',
    booking_id: 'BK003',
    guest_name: 'Maria Garcia',
    guest_email: 'maria@example.com',
    template_id: 'TPL002',
    template_name: '24-Hour Reminder',
    channel: 'email',
    status: 'sent',
    sent_at: new Date(Date.now() - 3600000).toISOString(),
  },
];

export function GuestCommunication() {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [sentMessages, setSentMessages] = useState<SentMessage[]>([]);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [showSendManual, setShowSendManual] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const storedTemplates = localStorage.getItem('message_templates');
    const storedMessages = localStorage.getItem('sent_messages');

    if (storedTemplates) {
      setTemplates(JSON.parse(storedTemplates));
    } else {
      setTemplates(defaultTemplates);
      localStorage.setItem('message_templates', JSON.stringify(defaultTemplates));
    }

    if (storedMessages) {
      setSentMessages(JSON.parse(storedMessages));
    } else {
      setSentMessages(mockSentMessages);
      localStorage.setItem('sent_messages', JSON.stringify(mockSentMessages));
    }
  };

  const handleToggleTemplate = (templateId: string) => {
    const updated = templates.map(t =>
      t.id === templateId ? { ...t, enabled: !t.enabled } : t
    );
    setTemplates(updated);
    localStorage.setItem('message_templates', JSON.stringify(updated));
    toast.success('Template updated');
  };

  const handleEditTemplate = (template: MessageTemplate) => {
    setEditingTemplate(template);
    setShowTemplateEditor(true);
  };

  const handleSaveTemplate = () => {
    if (!editingTemplate) return;

    const updated = templates.map(t =>
      t.id === editingTemplate.id ? editingTemplate : t
    );
    setTemplates(updated);
    localStorage.setItem('message_templates', JSON.stringify(updated));
    toast.success('Template saved');
    setShowTemplateEditor(false);
    setEditingTemplate(null);
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      sent: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };
    return (
      <Badge className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getChannelIcon = (channel: string) => {
    if (channel === 'email') return <Mail className="w-4 h-4" />;
    if (channel === 'sms') return <MessageSquare className="w-4 h-4" />;
    return <Send className="w-4 h-4" />;
  };

  const stats = {
    totalSent: sentMessages.length,
    delivered: sentMessages.filter(m => m.status === 'delivered').length,
    activeTemplates: templates.filter(t => t.enabled).length,
    automationRate: templates.filter(t => t.enabled && t.trigger !== 'manual').length,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Guest Communication</h1>
        <p className="text-gray-600">
          Automated messages and email templates for guest engagement
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Messages Sent</div>
              <div className="text-2xl font-bold">{stats.totalSent}</div>
            </div>
            <Send className="w-8 h-8 text-blue-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Delivered</div>
              <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Active Templates</div>
              <div className="text-2xl font-bold">{stats.activeTemplates}</div>
            </div>
            <Mail className="w-8 h-8 text-purple-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Automated</div>
              <div className="text-2xl font-bold text-orange-600">{stats.automationRate}</div>
            </div>
            <Zap className="w-8 h-8 text-orange-500" />
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Message Templates */}
        <div>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Message Templates</h2>
              <Button size="sm" onClick={() => setShowSendManual(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Send Manual
              </Button>
            </div>
            <div className="space-y-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{template.name}</h3>
                      {getChannelIcon(template.channel)}
                      {template.trigger !== 'manual' && (
                        <Badge variant="outline" className="gap-1">
                          <Sparkles className="w-3 h-3" />
                          Auto
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Trigger:{' '}
                      <span className="font-medium capitalize">
                        {template.trigger.replace('_', ' ')}
                      </span>
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={template.enabled}
                          onCheckedChange={() => handleToggleTemplate(template.id)}
                        />
                        <span className="text-xs text-gray-600">
                          {template.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditTemplate(template)}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Recent Messages */}
        <div>
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Messages</h2>
            <div className="space-y-3">
              {sentMessages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No messages sent yet
                </div>
              ) : (
                sentMessages.map((message) => (
                  <div
                    key={message.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="p-2 bg-blue-100 rounded-full">
                      {getChannelIcon(message.channel)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold">{message.guest_name}</h3>
                        {getStatusBadge(message.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {message.template_name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {new Date(message.sent_at).toLocaleString()}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Booking: {message.booking_id}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Template Editor Dialog */}
      <Dialog open={showTemplateEditor} onOpenChange={setShowTemplateEditor}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Message Template</DialogTitle>
            <DialogDescription>
              Customize your automated guest communication template
            </DialogDescription>
          </DialogHeader>

          {editingTemplate && (
            <div className="space-y-4">
              <div>
                <Label>Template Name</Label>
                <Input
                  value={editingTemplate.name}
                  onChange={(e) =>
                    setEditingTemplate({ ...editingTemplate, name: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Channel</Label>
                <Select
                  value={editingTemplate.channel}
                  onValueChange={(value: any) =>
                    setEditingTemplate({ ...editingTemplate, channel: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email Only</SelectItem>
                    <SelectItem value="sms">SMS Only</SelectItem>
                    <SelectItem value="both">Email + SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Email Subject</Label>
                <Input
                  value={editingTemplate.subject}
                  onChange={(e) =>
                    setEditingTemplate({ ...editingTemplate, subject: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Message Body</Label>
                <Textarea
                  value={editingTemplate.body}
                  onChange={(e) =>
                    setEditingTemplate({ ...editingTemplate, body: e.target.value })
                  }
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-sm mb-2">Available Variables:</h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
                  <div><code>{'{{guest_name}}'}</code> - Guest's name</div>
                  <div><code>{'{{service_name}}'}</code> - Service name</div>
                  <div><code>{'{{booking_id}}'}</code> - Booking ID</div>
                  <div><code>{'{{date_start}}'}</code> - Start date</div>
                  <div><code>{'{{date_end}}'}</code> - End date</div>
                  <div><code>{'{{guests}}'}</code> - Number of guests</div>
                  <div><code>{'{{amount}}'}</code> - Price amount</div>
                  <div><code>{'{{currency}}'}</code> - Currency code</div>
                  <div><code>{'{{provider_name}}'}</code> - Provider name</div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowTemplateEditor(false);
                    setEditingTemplate(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveTemplate} className="flex-1">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Save Template
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
