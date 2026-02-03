import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  CalendarPlus, 
  ArrowLeft, 
  ArrowRight, 
  Check,
  Phone,
  MessageSquare,
  MessageCircle,
  Users,
  Clock,
  Upload,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Calendar,
  MapPin,
  User
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface GuestEntry {
  name: string;
  phone: string;
  notes: string;
}

interface EventData {
  eventName: string;
  eventType: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  eventCity: string;
  hostName: string;
  rsvpDeadline: string;
  preferredLanguage: string;
}

interface MessageData {
  mode: 'CALL' | 'SMS' | 'WHATSAPP';
  callScript: string;
  smsMessage: string;
  whatsappMessage: string;
}

interface ScheduleData {
  sendNow: boolean;
  scheduledDate: string;
  scheduledTime: string;
  timeWindowStart: string;
  timeWindowEnd: string;
  retryCount: number;
  retryGapHours: number;
}

const STEPS = [
  { number: 1, title: 'Event Details', icon: CalendarPlus },
  { number: 2, title: 'Message', icon: MessageSquare },
  { number: 3, title: 'Guest List', icon: Users },
  { number: 4, title: 'Schedule', icon: Clock },
  { number: 5, title: 'Review', icon: Check },
];

const EVENT_TYPES = [
  'Wedding',
  'Birthday',
  'Housewarming',
  'Engagement',
  'Anniversary',
  'Baby Shower',
  'Corporate Event',
  'Religious Ceremony',
  'Other',
];

const LANGUAGES = ['English', 'Hindi', 'Telugu', 'Tamil', 'Kannada', 'Malayalam', 'Marathi', 'Bengali', 'Gujarati'];

export default function AdminCreateInvitation() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAdminAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Event Details
  const [eventData, setEventData] = useState<EventData>({
    eventName: '',
    eventType: '',
    eventDate: '',
    eventTime: '',
    venue: '',
    eventCity: '',
    hostName: '',
    rsvpDeadline: '',
    preferredLanguage: 'English',
  });

  // Step 2: Message
  const [messageData, setMessageData] = useState<MessageData>({
    mode: 'CALL',
    callScript: `Hello {GuestName}, this is a warm invitation from {HostName} for their {EventType}. The event will be held on {Date} at {Venue}. We would be honored by your presence. Please confirm your attendance. Thank you!`,
    smsMessage: `Dear {GuestName}, You are warmly invited to {EventName} on {Date} at {Venue}. RSVP by {RSVPDeadline}. - {HostName}`,
    whatsappMessage: `🎉 *{EventName}*\n\nDear {GuestName},\n\nYou are cordially invited to celebrate with us!\n\n📅 Date: {Date}\n🕐 Time: {Time}\n📍 Venue: {Venue}\n\nPlease confirm your attendance.\n\nWith love,\n{HostName}`,
  });

  // Step 3: Guest List
  const [guests, setGuests] = useState<GuestEntry[]>([]);
  const [newGuest, setNewGuest] = useState<GuestEntry>({ name: '', phone: '', notes: '' });
  const [csvImportResult, setCsvImportResult] = useState<{ success: number; errors: string[] } | null>(null);

  // Step 4: Schedule
  const [scheduleData, setScheduleData] = useState<ScheduleData>({
    sendNow: false,
    scheduledDate: '',
    scheduledTime: '09:00',
    timeWindowStart: '09:00',
    timeWindowEnd: '19:00',
    retryCount: 2,
    retryGapHours: 4,
  });

  const handleAddGuest = () => {
    if (!newGuest.name || !newGuest.phone) {
      toast({
        title: 'Missing Information',
        description: 'Please enter guest name and phone number.',
        variant: 'destructive',
      });
      return;
    }

    // Validate and format phone
    let cleanPhone = newGuest.phone.replace(/\D/g, '');
    if (!cleanPhone.startsWith('91') && cleanPhone.length === 10) {
      cleanPhone = '91' + cleanPhone;
    }
    if (cleanPhone.length !== 12) {
      toast({
        title: 'Invalid Phone',
        description: 'Please enter a valid 10-digit phone number.',
        variant: 'destructive',
      });
      return;
    }

    // Check for duplicates
    if (guests.some(g => g.phone.replace(/\D/g, '') === cleanPhone)) {
      toast({
        title: 'Duplicate Entry',
        description: 'This phone number is already in the list.',
        variant: 'destructive',
      });
      return;
    }

    setGuests([...guests, { ...newGuest, phone: `+${cleanPhone}` }]);
    setNewGuest({ name: '', phone: '', notes: '' });
  };

  const handleRemoveGuest = (index: number) => {
    setGuests(guests.filter((_, i) => i !== index));
  };

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      const newGuests: GuestEntry[] = [];
      const errors: string[] = [];
      
      lines.forEach((line, index) => {
        if (index === 0 && line.toLowerCase().includes('name')) return; // Skip header
        
        const parts = line.split(',').map(p => p.trim().replace(/"/g, ''));
        if (parts.length < 2) {
          errors.push(`Line ${index + 1}: Invalid format`);
          return;
        }

        const name = parts[0];
        let phone = parts[1].replace(/\D/g, '');
        const notes = parts[2] || '';

        if (!phone.startsWith('91') && phone.length === 10) {
          phone = '91' + phone;
        }

        if (phone.length !== 12) {
          errors.push(`Line ${index + 1}: Invalid phone for ${name}`);
          return;
        }

        if (guests.some(g => g.phone.includes(phone)) || newGuests.some(g => g.phone.includes(phone))) {
          errors.push(`Line ${index + 1}: Duplicate phone for ${name}`);
          return;
        }

        newGuests.push({ name, phone: `+${phone}`, notes });
      });

      setGuests([...guests, ...newGuests]);
      setCsvImportResult({ success: newGuests.length, errors });
      
      toast({
        title: 'Import Complete',
        description: `Added ${newGuests.length} guests. ${errors.length} errors.`,
      });
    };
    reader.readAsText(file);
  };

  const handleNext = () => {
    // Validation for each step
    if (currentStep === 1) {
      if (!eventData.eventName || !eventData.eventType || !eventData.eventDate || !eventData.venue) {
        toast({
          title: 'Missing Fields',
          description: 'Please fill in all required event details.',
          variant: 'destructive',
        });
        return;
      }
    }

    if (currentStep === 3 && guests.length === 0) {
      toast({
        title: 'No Guests',
        description: 'Please add at least one guest to continue.',
        variant: 'destructive',
      });
      return;
    }

    if (currentStep === 4) {
      if (!scheduleData.sendNow && (!scheduleData.scheduledDate || !scheduleData.scheduledTime)) {
        toast({
          title: 'Schedule Required',
          description: 'Please select a date and time or choose to send now.',
          variant: 'destructive',
        });
        return;
      }
    }

    setCurrentStep(prev => Math.min(prev + 1, 5));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: 'Not Authenticated',
        description: 'Please log in to create an invitation.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Create the event
      const scheduledTime = scheduleData.sendNow 
        ? new Date().toISOString()
        : new Date(`${scheduleData.scheduledDate}T${scheduleData.scheduledTime}`).toISOString();

      const message = messageData.mode === 'CALL' 
        ? messageData.callScript 
        : messageData.mode === 'SMS' 
          ? messageData.smsMessage 
          : messageData.whatsappMessage;

      const { data: eventResult, error: eventError } = await supabase
        .from('events')
        .insert({
          user_id: user.id,
          title: eventData.eventName,
          message,
          mode: messageData.mode,
          scheduled_time: scheduledTime,
          status: scheduleData.sendNow ? 'pending' : 'scheduled',
          total_contacts: guests.length,
          sent_count: 0,
          failed_count: 0,
        })
        .select()
        .single();

      if (eventError) throw eventError;

      // Add contacts
      const contacts = guests.map(guest => ({
        event_id: eventResult.id,
        phone: guest.phone,
        status: 'pending' as const,
      }));

      const { error: contactsError } = await supabase
        .from('contacts')
        .insert(contacts);

      if (contactsError) throw contactsError;

      toast({
        title: 'Campaign Created!',
        description: `Invitation campaign for ${guests.length} guests has been created.`,
      });

      navigate('/admin/campaigns');
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast({
        title: 'Error',
        description: 'Failed to create campaign. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="eventName">Event Name *</Label>
                <Input
                  id="eventName"
                  placeholder="e.g., Sharma Family Wedding"
                  value={eventData.eventName}
                  onChange={(e) => setEventData({ ...eventData, eventName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventType">Event Type *</Label>
                <Select 
                  value={eventData.eventType} 
                  onValueChange={(value) => setEventData({ ...eventData, eventType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventDate">Event Date *</Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={eventData.eventDate}
                  onChange={(e) => setEventData({ ...eventData, eventDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventTime">Event Time</Label>
                <Input
                  id="eventTime"
                  type="time"
                  value={eventData.eventTime}
                  onChange={(e) => setEventData({ ...eventData, eventTime: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="venue">Venue (Full Address) *</Label>
                <Textarea
                  id="venue"
                  placeholder="Enter complete venue address"
                  value={eventData.venue}
                  onChange={(e) => setEventData({ ...eventData, venue: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventCity">Event City</Label>
                <Input
                  id="eventCity"
                  placeholder="e.g., Hyderabad"
                  value={eventData.eventCity}
                  onChange={(e) => setEventData({ ...eventData, eventCity: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hostName">Host Name</Label>
                <Input
                  id="hostName"
                  placeholder="e.g., Durga & Family"
                  value={eventData.hostName}
                  onChange={(e) => setEventData({ ...eventData, hostName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rsvpDeadline">RSVP Deadline</Label>
                <Input
                  id="rsvpDeadline"
                  type="date"
                  value={eventData.rsvpDeadline}
                  onChange={(e) => setEventData({ ...eventData, rsvpDeadline: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Preferred Language</Label>
                <Select 
                  value={eventData.preferredLanguage} 
                  onValueChange={(value) => setEventData({ ...eventData, preferredLanguage: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map(lang => (
                      <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label>Select Invitation Mode *</Label>
              <RadioGroup
                value={messageData.mode}
                onValueChange={(value: 'CALL' | 'SMS' | 'WHATSAPP') => 
                  setMessageData({ ...messageData, mode: value })}
                className="grid grid-cols-3 gap-4"
              >
                <Label 
                  htmlFor="mode-call" 
                  className={`flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    messageData.mode === 'CALL' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value="CALL" id="mode-call" className="sr-only" />
                  <Phone className="w-8 h-8 mb-2 text-primary" />
                  <span className="font-medium">Voice Call</span>
                </Label>
                <Label 
                  htmlFor="mode-sms" 
                  className={`flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    messageData.mode === 'SMS' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value="SMS" id="mode-sms" className="sr-only" />
                  <MessageSquare className="w-8 h-8 mb-2 text-info" />
                  <span className="font-medium">SMS</span>
                </Label>
                <Label 
                  htmlFor="mode-whatsapp" 
                  className={`flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    messageData.mode === 'WHATSAPP' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value="WHATSAPP" id="mode-whatsapp" className="sr-only" />
                  <MessageCircle className="w-8 h-8 mb-2 text-success" />
                  <span className="font-medium">WhatsApp</span>
                </Label>
              </RadioGroup>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Message Editor</Label>
                <div className="text-xs text-muted-foreground mb-2">
                  Variables: {'{GuestName}'}, {'{EventName}'}, {'{Date}'}, {'{Time}'}, {'{Venue}'}, {'{HostName}'}, {'{RSVPDeadline}'}
                </div>
                <Textarea
                  value={
                    messageData.mode === 'CALL' 
                      ? messageData.callScript 
                      : messageData.mode === 'SMS' 
                        ? messageData.smsMessage 
                        : messageData.whatsappMessage
                  }
                  onChange={(e) => {
                    if (messageData.mode === 'CALL') {
                      setMessageData({ ...messageData, callScript: e.target.value });
                    } else if (messageData.mode === 'SMS') {
                      setMessageData({ ...messageData, smsMessage: e.target.value });
                    } else {
                      setMessageData({ ...messageData, whatsappMessage: e.target.value });
                    }
                  }}
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label>Live Preview</Label>
                <Card className="h-full">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      {messageData.mode === 'CALL' && <Phone className="w-4 h-4 text-primary" />}
                      {messageData.mode === 'SMS' && <MessageSquare className="w-4 h-4 text-info" />}
                      {messageData.mode === 'WHATSAPP' && <MessageCircle className="w-4 h-4 text-success" />}
                      <span className="text-sm font-medium">{messageData.mode} Preview</span>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50 text-sm whitespace-pre-wrap">
                      {(messageData.mode === 'CALL' 
                        ? messageData.callScript 
                        : messageData.mode === 'SMS' 
                          ? messageData.smsMessage 
                          : messageData.whatsappMessage
                      )
                        .replace('{GuestName}', 'Rajesh Kumar')
                        .replace('{EventName}', eventData.eventName || 'Wedding Celebration')
                        .replace('{EventType}', eventData.eventType || 'Wedding')
                        .replace('{Date}', eventData.eventDate || '15th January 2025')
                        .replace('{Time}', eventData.eventTime || '6:00 PM')
                        .replace('{Venue}', eventData.venue || 'Grand Palace Hall')
                        .replace('{HostName}', eventData.hostName || 'Sharma Family')
                        .replace('{RSVPDeadline}', eventData.rsvpDeadline || '10th January')}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {/* Import CSV */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Import Guests from CSV</CardTitle>
                <CardDescription>Format: Name, Phone Number, Notes (optional)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={handleCSVUpload}
                    className="max-w-xs"
                  />
                  <span className="text-sm text-muted-foreground">
                    +91 prefix added automatically
                  </span>
                </div>
                {csvImportResult && (
                  <div className="mt-3 p-3 rounded-lg bg-secondary/50 text-sm">
                    <p className="flex items-center gap-2 text-success">
                      <CheckCircle2 className="w-4 h-4" />
                      {csvImportResult.success} guests imported successfully
                    </p>
                    {csvImportResult.errors.length > 0 && (
                      <div className="mt-2">
                        <p className="text-destructive font-medium">Errors:</p>
                        {csvImportResult.errors.slice(0, 5).map((err, i) => (
                          <p key={i} className="text-destructive text-xs">{err}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Manual Add */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Add Guest Manually</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  <Input
                    placeholder="Guest Name"
                    value={newGuest.name}
                    onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                  />
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-sm text-muted-foreground">
                      +91
                    </span>
                    <Input
                      placeholder="9876543210"
                      value={newGuest.phone}
                      onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
                      className="rounded-l-none"
                    />
                  </div>
                  <Input
                    placeholder="Notes (optional)"
                    value={newGuest.notes}
                    onChange={(e) => setNewGuest({ ...newGuest, notes: e.target.value })}
                  />
                  <Button onClick={handleAddGuest} className="gradient-primary">
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Guest List */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  Guest List
                  <Badge variant="secondary">{guests.length} guests</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {guests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No guests added yet. Import CSV or add manually.</p>
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2 text-sm font-medium text-muted-foreground">Name</th>
                          <th className="text-left p-2 text-sm font-medium text-muted-foreground">Phone</th>
                          <th className="text-left p-2 text-sm font-medium text-muted-foreground">Notes</th>
                          <th className="w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {guests.map((guest, index) => (
                          <tr key={index} className="border-b border-border/50">
                            <td className="p-2">{guest.name}</td>
                            <td className="p-2 text-muted-foreground">{guest.phone}</td>
                            <td className="p-2 text-muted-foreground text-sm">{guest.notes}</td>
                            <td className="p-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveGuest(index)}
                                className="h-8 w-8 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Schedule Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                  <div>
                    <Label htmlFor="sendNow" className="font-medium">Send Immediately</Label>
                    <p className="text-sm text-muted-foreground">Start campaign right after creation</p>
                  </div>
                  <Switch
                    id="sendNow"
                    checked={scheduleData.sendNow}
                    onCheckedChange={(checked) => setScheduleData({ ...scheduleData, sendNow: checked })}
                  />
                </div>

                {!scheduleData.sendNow && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Scheduled Date</Label>
                      <Input
                        type="date"
                        value={scheduleData.scheduledDate}
                        onChange={(e) => setScheduleData({ ...scheduleData, scheduledDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Scheduled Time</Label>
                      <Input
                        type="time"
                        value={scheduleData.scheduledTime}
                        onChange={(e) => setScheduleData({ ...scheduleData, scheduledTime: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                <div className="border-t pt-6">
                  <Label className="text-base font-medium mb-4 block">Call/Message Time Window</Label>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Time</Label>
                      <Input
                        type="time"
                        value={scheduleData.timeWindowStart}
                        onChange={(e) => setScheduleData({ ...scheduleData, timeWindowStart: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Time</Label>
                      <Input
                        type="time"
                        value={scheduleData.timeWindowEnd}
                        onChange={(e) => setScheduleData({ ...scheduleData, timeWindowEnd: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <Label className="text-base font-medium mb-4 block">Retry Settings</Label>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Number of Retries</Label>
                      <Select 
                        value={String(scheduleData.retryCount)}
                        onValueChange={(value) => setScheduleData({ ...scheduleData, retryCount: Number(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">No retries</SelectItem>
                          <SelectItem value="1">1 retry</SelectItem>
                          <SelectItem value="2">2 retries</SelectItem>
                          <SelectItem value="3">3 retries</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Retry Gap (hours)</Label>
                      <Select 
                        value={String(scheduleData.retryGapHours)}
                        onValueChange={(value) => setScheduleData({ ...scheduleData, retryGapHours: Number(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">2 hours</SelectItem>
                          <SelectItem value="4">4 hours</SelectItem>
                          <SelectItem value="6">6 hours</SelectItem>
                          <SelectItem value="12">12 hours</SelectItem>
                          <SelectItem value="24">24 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Event Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Event Name</p>
                    <p className="font-medium">{eventData.eventName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Event Type</p>
                    <p className="font-medium">{eventData.eventType || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date & Time</p>
                    <p className="font-medium">{eventData.eventDate} {eventData.eventTime && `at ${eventData.eventTime}`}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Host</p>
                    <p className="font-medium">{eventData.hostName || '-'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground">Venue</p>
                    <p className="font-medium">{eventData.venue || '-'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Campaign Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Invitation Mode</p>
                    <Badge className="mt-1">{messageData.mode}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Guests</p>
                    <p className="font-medium text-lg">{guests.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Schedule</p>
                    <p className="font-medium">
                      {scheduleData.sendNow 
                        ? 'Send Immediately' 
                        : `${scheduleData.scheduledDate} at ${scheduleData.scheduledTime}`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Ready to Launch?</p>
                  <p className="text-sm text-muted-foreground">
                    Once confirmed, the campaign will be created and {scheduleData.sendNow ? 'started immediately' : 'scheduled'}. 
                    This will use {guests.length} slots from your balance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Create Invitation</h1>
            <p className="text-muted-foreground">Step {currentStep} of 5</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div 
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                    currentStep >= step.number 
                      ? 'border-primary bg-primary text-primary-foreground' 
                      : 'border-border text-muted-foreground'
                  }`}
                >
                  {currentStep > step.number ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`hidden md:block w-16 lg:w-24 h-0.5 mx-2 ${
                    currentStep > step.number ? 'bg-primary' : 'bg-border'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="hidden md:flex justify-between text-sm">
            {STEPS.map((step) => (
              <span 
                key={step.number}
                className={currentStep >= step.number ? 'text-primary font-medium' : 'text-muted-foreground'}
              >
                {step.title}
              </span>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
          </CardHeader>
          <CardContent>
            {renderStep()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          {currentStep < 5 ? (
            <Button onClick={handleNext} className="gradient-primary">
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              className="gradient-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Campaign'}
              <Check className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
