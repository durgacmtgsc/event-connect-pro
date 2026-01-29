import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ReportTable } from '@/components/ReportTable';
import { StatusBadge } from '@/components/ui/status-badge';
import { ModeBadge } from '@/components/ui/mode-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  FileBarChart, 
  Calendar,
  ChevronRight,
  Download,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Event, Contact } from '@/lib/types';
import { format } from 'date-fns';

export default function Reports() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user]);

  useEffect(() => {
    if (selectedEventId) {
      fetchContacts(selectedEventId);
    }
  }, [selectedEventId]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const typedEvents = (data || []) as unknown as Event[];
      setEvents(typedEvents);
      
      if (typedEvents.length > 0) {
        setSelectedEventId(typedEvents[0].id);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async (eventId: string) => {
    setLoadingContacts(true);
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setContacts((data || []) as unknown as Contact[]);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoadingContacts(false);
    }
  };

  const handleRetry = async (contactId: string) => {
    toast({
      title: 'Retry Initiated',
      description: 'Attempting to reach the guest again...',
    });
    // In production, trigger the retry via edge function
  };

  const handleExport = () => {
    if (contacts.length === 0) return;

    const selectedEvent = events.find(e => e.id === selectedEventId);
    const csv = [
      ['Phone', 'Status', 'Sent At', 'Error'].join(','),
      ...contacts.map(c => [
        c.phone,
        c.status,
        c.sent_at || '',
        c.error_message || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedEvent?.title || 'report'}-guests.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Report Exported',
      description: 'CSV file downloaded successfully.',
    });
  };

  const selectedEvent = events.find(e => e.id === selectedEventId);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Reports</h1>
            <p className="text-muted-foreground mt-1">
              Detailed guest status and campaign analytics
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : events.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileBarChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No campaigns yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first invitation campaign to see reports
              </p>
              <Button 
                className="gradient-primary hover:opacity-90" 
                onClick={() => navigate('/create')}
              >
                Create Campaign
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Event Selector */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileBarChart className="h-5 w-5" />
                  Select Campaign
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                  <div className="flex-1">
                    <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a campaign" />
                      </SelectTrigger>
                      <SelectContent>
                        {events.map((event) => (
                          <SelectItem key={event.id} value={event.id}>
                            <div className="flex items-center gap-2">
                              <span>{event.title}</span>
                              <span className="text-muted-foreground text-xs">
                                ({format(new Date(event.scheduled_time), 'PP')})
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {selectedEvent && (
                    <div className="flex items-center gap-4">
                      <ModeBadge mode={selectedEvent.mode} />
                      <StatusBadge status={selectedEvent.status} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Report Table */}
            {selectedEventId && (
              <ReportTable
                contacts={contacts}
                onRetry={handleRetry}
                onExport={handleExport}
                loading={loadingContacts}
              />
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
