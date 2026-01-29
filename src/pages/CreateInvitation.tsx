import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StepWizard } from '@/components/StepWizard';
import { MessageEditor } from '@/components/MessageEditor';
import { GuestListUploader } from '@/components/GuestListUploader';
import { SchedulePicker } from '@/components/SchedulePicker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  ArrowRight, 
  Calendar,
  MapPin,
  Clock,
  Globe,
  Send,
  MessageSquare,
  Phone,
  CheckCircle2,
  Users,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { MessageMode } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface Guest {
  phone: string;
  name?: string;
}

const steps = [
  { id: 1, title: 'Event Details', description: 'Basic info' },
  { id: 2, title: 'Message', description: 'Craft invite' },
  { id: 3, title: 'Guest List', description: 'Add guests' },
  { id: 4, title: 'Schedule', description: 'Set timing' },
  { id: 5, title: 'Review', description: 'Confirm' },
];

const eventTypes = [
  'Wedding', 'Birthday', 'Engagement', 'Anniversary', 
  'Baby Shower', 'House Warming', 'Corporate Event', 'Other'
];

const languages = [
  'English', 'Hindi', 'Telugu', 'Tamil', 'Kannada', 
  'Malayalam', 'Marathi', 'Bengali', 'Gujarati'
];

export default function CreateInvitation() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Step 1: Event Details
  const [eventName, setEventName] = useState('');
  const [eventType, setEventType] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [venue, setVenue] = useState('');
  const [language, setLanguage] = useState('English');
  
  // Step 2: Message
  const [message, setMessage] = useState('');
  const [mode, setMode] = useState<MessageMode>('CALL');
  
  // Step 3: Guests
  const [guests, setGuests] = useState<Guest[]>([]);
  
  // Step 4: Schedule
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [sendNow, setSendNow] = useState(false);
  const [enableReminders, setEnableReminders] = useState(true);
  const [reminderDays, setReminderDays] = useState<number[]>([3, 1]);

  const modeOptions = [
    { value: 'CALL', label: 'Voice Call', icon: Phone, description: 'Personal human-like calls' },
    { value: 'SMS', label: 'SMS', icon: Send, description: 'Text message invites' },
    { value: 'WHATSAPP', label: 'WhatsApp', icon: MessageSquare, description: 'WhatsApp messages' },
  ];

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return eventName && eventType && eventDate && eventTime && venue;
      case 2:
        return message.length > 10;
      case 3:
        return guests.length > 0;
      case 4:
        return sendNow || (scheduledDate && scheduledTime);
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const scheduledDateTime = sendNow 
        ? new Date() 
        : new Date(`${scheduledDate}T${scheduledTime}`);

      // Create event
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .insert({
          user_id: user.id,
          title: eventName,
          message,
          mode,
          scheduled_time: scheduledDateTime.toISOString(),
          total_contacts: guests.length,
          status: sendNow ? 'sending' : 'scheduled',
        })
        .select()
        .single();

      if (eventError) throw eventError;

      // Create contacts
      const contacts = guests.map(guest => ({
        event_id: eventData.id,
        phone: guest.phone,
        status: 'pending' as const,
      }));

      const { error: contactsError } = await supabase
        .from('contacts')
        .insert(contacts);

      if (contactsError) throw contactsError;

      toast({
        title: 'Invitation Created!',
        description: `${guests.length} guests will receive your invitation.`,
      });

      navigate('/campaigns');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create invitation',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Create Invitation</h1>
            <p className="text-muted-foreground mt-1">
              Set up your event invitation in a few simple steps
            </p>
          </div>
        </div>

        {/* Step Wizard */}
        <StepWizard steps={steps} currentStep={currentStep}>
          {/* Step 1: Event Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Event Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="eventName">Event Name *</Label>
                      <Input
                        id="eventName"
                        placeholder="e.g., Rahul & Priya's Wedding"
                        value={eventName}
                        onChange={(e) => setEventName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="eventType">Event Type *</Label>
                      <select
                        id="eventType"
                        value={eventType}
                        onChange={(e) => setEventType(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">Select type...</option>
                        {eventTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="eventDate">Event Date *</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="eventDate"
                          type="date"
                          value={eventDate}
                          onChange={(e) => setEventDate(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="eventTime">Event Time *</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="eventTime"
                          type="time"
                          value={eventTime}
                          onChange={(e) => setEventTime(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="venue">Venue *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Textarea
                        id="venue"
                        placeholder="Full address of the venue"
                        value={venue}
                        onChange={(e) => setVenue(e.target.value)}
                        className="pl-10 min-h-[80px]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Preferred Language</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <select
                        id="language"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm"
                      >
                        {languages.map((lang) => (
                          <option key={lang} value={lang}>{lang}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 2: Message Setup */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Communication Mode</CardTitle>
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

              <MessageEditor
                value={message}
                onChange={setMessage}
                eventName={eventName}
                eventDate={eventDate ? format(new Date(eventDate), 'PPP') : ''}
                venue={venue}
              />
            </div>
          )}

          {/* Step 3: Guest List */}
          {currentStep === 3 && (
            <GuestListUploader
              guests={guests}
              onChange={setGuests}
            />
          )}

          {/* Step 4: Schedule */}
          {currentStep === 4 && (
            <SchedulePicker
              scheduledDate={scheduledDate}
              scheduledTime={scheduledTime}
              sendNow={sendNow}
              enableReminders={enableReminders}
              reminderDays={reminderDays}
              onDateChange={setScheduledDate}
              onTimeChange={setScheduledTime}
              onSendNowChange={setSendNow}
              onRemindersChange={setEnableReminders}
              onReminderDaysChange={setReminderDays}
            />
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  Review Your Invitation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Event Summary */}
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-semibold mb-3">Event Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Event Name</p>
                      <p className="font-medium">{eventName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Event Type</p>
                      <p className="font-medium">{eventType}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Date & Time</p>
                      <p className="font-medium">
                        {eventDate && format(new Date(eventDate), 'PPP')} at {eventTime}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Language</p>
                      <p className="font-medium">{language}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-muted-foreground">Venue</p>
                    <p className="font-medium">{venue}</p>
                  </div>
                </div>

                {/* Message Summary */}
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-semibold mb-3">Message</h4>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary">
                      {mode}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{message}</p>
                </div>

                {/* Guest & Schedule Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Guests
                    </h4>
                    <p className="text-2xl font-display font-bold text-primary">{guests.length}</p>
                    <p className="text-sm text-muted-foreground">guests to invite</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Sending
                    </h4>
                    <p className="text-lg font-semibold">
                      {sendNow ? 'Immediately' : format(new Date(`${scheduledDate}T${scheduledTime}`), 'PPp')}
                    </p>
                    {enableReminders && (
                      <p className="text-sm text-muted-foreground">
                        + {reminderDays.length} reminder(s)
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </StepWizard>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentStep < 5 ? (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!canProceed()}
              className="gradient-primary hover:opacity-90"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="gradient-primary hover:opacity-90"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Create Invitation
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
