import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Eye, Sparkles } from 'lucide-react';

interface MessageEditorProps {
  value: string;
  onChange: (value: string) => void;
  eventName?: string;
  eventDate?: string;
  venue?: string;
}

const templates = [
  {
    id: 'wedding',
    name: 'Wedding',
    message: `Namaste! 🙏

You are cordially invited to the wedding ceremony of [Bride Name] & [Groom Name].

📅 Date: {eventDate}
📍 Venue: {venue}

Your presence will make our special day even more memorable. Please confirm your attendance by replying to this message.

With warm regards,
[Family Name]`,
  },
  {
    id: 'birthday',
    name: 'Birthday',
    message: `Hello! 🎂

You are invited to celebrate [Name]'s birthday party!

📅 Date: {eventDate}
📍 Venue: {venue}

Let's make this celebration special together. Please RSVP to confirm your presence.

Looking forward to seeing you!`,
  },
  {
    id: 'ceremony',
    name: 'Ceremony',
    message: `Respected Sir/Madam,

We are pleased to invite you to {eventName}.

📅 Date: {eventDate}
📍 Venue: {venue}

Your gracious presence will add to our joy. Kindly confirm your attendance.

With warm regards`,
  },
  {
    id: 'corporate',
    name: 'Corporate',
    message: `Dear Invitee,

You are invited to attend {eventName}.

📅 Date: {eventDate}
📍 Location: {venue}

Please RSVP to confirm your participation.

Best regards,
[Organization Name]`,
  },
];

export function MessageEditor({ value, onChange, eventName, eventDate, venue }: MessageEditorProps) {
  const [activeTab, setActiveTab] = useState('write');

  const applyTemplate = (template: string) => {
    let message = template;
    if (eventName) message = message.replace(/{eventName}/g, eventName);
    if (eventDate) message = message.replace(/{eventDate}/g, eventDate);
    if (venue) message = message.replace(/{venue}/g, venue);
    onChange(message);
    setActiveTab('write');
  };

  const previewMessage = () => {
    let message = value;
    if (eventName) message = message.replace(/{eventName}/g, eventName);
    if (eventDate) message = message.replace(/{eventDate}/g, eventDate);
    if (venue) message = message.replace(/{venue}/g, venue);
    return message;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="h-5 w-5" />
          Message Content
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="write">Write</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="write" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message">Your Message</Label>
              <Textarea
                id="message"
                placeholder="Type your invitation message here..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                rows={8}
                className="resize-none"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{value.length} characters</span>
                <span>Use {'{eventName}'}, {'{eventDate}'}, {'{venue}'} for dynamic content</span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="templates" className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Choose a template to get started quickly
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => applyTemplate(template.message)}
                  className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 hover:bg-muted/50 transition-colors text-left group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground">{template.name}</span>
                    <Sparkles className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {template.message.substring(0, 100)}...
                  </p>
                </button>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="preview" className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Eye className="h-4 w-4" />
              Preview how your message will appear
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border border-border min-h-[200px]">
              <p className="whitespace-pre-wrap text-sm">{previewMessage()}</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
