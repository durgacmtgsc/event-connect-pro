import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Send, 
  MessageSquare, 
  Phone, 
  Upload, 
  Calendar,
  Clock,
  Users,
  Loader2,
  X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { MessageMode } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function CreateEvent() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [mode, setMode] = useState<MessageMode>('SMS');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [phoneNumbers, setPhoneNumbers] = useState('');
  const [loading, setLoading] = useState(false);

  const parsePhoneNumbers = (input: string): string[] => {
    return input
      .split(/[\n,;]+/)
      .map(phone => phone.trim().replace(/[^\d+]/g, ''))
      .filter(phone => phone.length >= 10);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      // Parse CSV - assumes phone numbers are in the first column
      const lines = text.split('\n');
      const phones = lines
        .map(line => line.split(',')[0].trim())
        .filter(phone => phone && !isNaN(parseInt(phone.replace(/[^\d]/g, ''))));
      
      setPhoneNumbers(prev => {
        const existing = prev ? prev + '\n' : '';
        return existing + phones.join('\n');
      });
      
      toast({
        title: 'File Uploaded',
        description: `Found ${phones.length} phone numbers`,
      });
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const phones = parsePhoneNumbers(phoneNumbers);
    if (phones.length === 0) {
      toast({
        title: 'No valid phone numbers',
        description: 'Please add at least one valid phone number',
        variant: 'destructive',
      });
      return;
    }

    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    if (scheduledDateTime <= new Date()) {
      toast({
        title: 'Invalid date/time',
        description: 'Scheduled time must be in the future',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Create event
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .insert({
          user_id: user.id,
          title,
          message,
          mode,
          scheduled_time: scheduledDateTime.toISOString(),
          total_contacts: phones.length,
          status: 'scheduled',
        })
        .select()
        .single();

      if (eventError) throw eventError;

      // Create contacts
      const contacts = phones.map(phone => ({
        event_id: eventData.id,
        phone,
        status: 'pending' as const,
      }));

      const { error: contactsError } = await supabase
        .from('contacts')
        .insert(contacts);

      if (contactsError) throw contactsError;

      toast({
        title: 'Event Created!',
        description: `Scheduled to send ${phones.length} ${mode} messages`,
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create event',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const modeOptions = [
    { value: 'SMS', label: 'SMS', icon: Send, description: 'Standard text message' },
    { value: 'WHATSAPP', label: 'WhatsApp', icon: MessageSquare, description: 'WhatsApp message' },
    { value: 'CALL', label: 'Voice Call', icon: Phone, description: 'Text-to-speech call' },
  ];

  const parsedCount = parsePhoneNumbers(phoneNumbers).length;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Create Event</h1>
          <p className="text-muted-foreground mt-1">
            Schedule SMS, WhatsApp, or voice call campaigns
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Details */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-xl">Event Details</CardTitle>
              <CardDescription>Basic information about your event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Name</Label>
                <Input
                  id="title"
                  placeholder="e.g., Monthly Newsletter, Appointment Reminder"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Message Content</Label>
                <Textarea
                  id="message"
                  placeholder="Type your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  {message.length} characters
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Message Mode */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-xl">Message Mode</CardTitle>
              <CardDescription>Choose how to deliver your message</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={mode}
                onValueChange={(value) => setMode(value as MessageMode)}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              >
                {modeOptions.map((option) => (
                  <Label
                    key={option.value}
                    htmlFor={option.value}
                    className={cn(
                      "flex flex-col items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                      mode === option.value 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
                    <div className={cn(
                      "p-3 rounded-xl transition-colors",
                      mode === option.value ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}>
                      <option.icon className="h-6 w-6" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold">{option.label}</p>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                  </Label>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-xl">Schedule</CardTitle>
              <CardDescription>When should the messages be sent?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="date"
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      required
                      className="pl-10"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="time"
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      required
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contacts */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-xl">Recipients</CardTitle>
              <CardDescription>Add phone numbers to receive the message</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="phones">Phone Numbers</Label>
                  {parsedCount > 0 && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {parsedCount} valid numbers
                    </span>
                  )}
                </div>
                <Textarea
                  id="phones"
                  placeholder="Enter phone numbers, one per line or comma-separated&#10;e.g., +1234567890, +0987654321"
                  value={phoneNumbers}
                  onChange={(e) => setPhoneNumbers(e.target.value)}
                  rows={6}
                  className="font-mono text-sm resize-none"
                />
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex-1 border-t border-border" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="flex-1 border-t border-border" />
              </div>
              
              <div>
                <Label
                  htmlFor="csv-upload"
                  className="flex flex-col items-center gap-2 p-6 border-2 border-dashed rounded-xl cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm font-medium">Upload CSV file</span>
                  <span className="text-xs text-muted-foreground">
                    Phone numbers should be in the first column
                  </span>
                </Label>
                <Input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="sr-only"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !title || !message || parsedCount === 0}
              className="flex-1 sm:flex-none gradient-primary hover:opacity-90"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Schedule Event
                  <Calendar className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
