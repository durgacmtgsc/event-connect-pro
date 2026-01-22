import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/ui/status-badge';
import { ModeBadge } from '@/components/ui/mode-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  FileBarChart, 
  Calendar, 
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Event, Contact } from '@/lib/types';
import { format } from 'date-fns';

export default function Reports() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEvents((data || []) as unknown as Event[]);
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

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    fetchContacts(event.id);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground mt-1">
            View detailed logs and statistics for all your events
          </p>
        </div>

        {/* Events Table */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <FileBarChart className="h-5 w-5" />
              All Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-12">
                <FileBarChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No events yet</h3>
                <p className="text-muted-foreground">
                  Create your first event to see reports here
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Total</TableHead>
                      <TableHead className="text-center">Sent</TableHead>
                      <TableHead className="text-center">Failed</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event) => (
                      <TableRow 
                        key={event.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleEventClick(event)}
                      >
                        <TableCell className="font-medium">{event.title}</TableCell>
                        <TableCell><ModeBadge mode={event.mode} /></TableCell>
                        <TableCell><StatusBadge status={event.status} /></TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center gap-1">
                            <Users className="h-3.5 w-3.5 text-muted-foreground" />
                            {event.total_contacts}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center gap-1 text-success">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {event.sent_count}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center gap-1 text-destructive">
                            <XCircle className="h-3.5 w-3.5" />
                            {event.failed_count}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            {format(new Date(event.scheduled_time), 'PP')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Event Details Dialog */}
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">
                {selectedEvent?.title}
              </DialogTitle>
              <DialogDescription className="flex flex-wrap items-center gap-2">
                {selectedEvent && (
                  <>
                    <ModeBadge mode={selectedEvent.mode} />
                    <StatusBadge status={selectedEvent.status} />
                    <span className="text-muted-foreground">
                      •
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground text-sm">
                      <Calendar className="h-3.5 w-3.5" />
                      {format(new Date(selectedEvent.scheduled_time), 'PPp')}
                    </span>
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            {/* Stats */}
            {selectedEvent && (
              <div className="grid grid-cols-3 gap-4 py-4 border-y">
                <div className="text-center">
                  <p className="text-2xl font-display font-bold text-foreground">
                    {selectedEvent.total_contacts}
                  </p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-display font-bold text-success">
                    {selectedEvent.sent_count}
                  </p>
                  <p className="text-xs text-muted-foreground">Sent</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-display font-bold text-destructive">
                    {selectedEvent.failed_count}
                  </p>
                  <p className="text-xs text-muted-foreground">Failed</p>
                </div>
              </div>
            )}

            {/* Message */}
            {selectedEvent && (
              <div className="py-4 border-b">
                <p className="text-sm font-medium text-muted-foreground mb-2">Message</p>
                <p className="text-sm bg-muted p-3 rounded-lg">{selectedEvent.message}</p>
              </div>
            )}

            {/* Contacts List */}
            <div className="flex-1 overflow-auto">
              <p className="text-sm font-medium text-muted-foreground mb-2">Recipients</p>
              {loadingContacts ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Phone Number</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent At</TableHead>
                      <TableHead>Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell className="font-mono text-sm">{contact.phone}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-1 text-sm ${
                            contact.status === 'sent' ? 'text-success' :
                            contact.status === 'failed' ? 'text-destructive' :
                            'text-muted-foreground'
                          }`}>
                            {contact.status === 'sent' && <CheckCircle2 className="h-3.5 w-3.5" />}
                            {contact.status === 'failed' && <XCircle className="h-3.5 w-3.5" />}
                            {contact.status === 'pending' && <Clock className="h-3.5 w-3.5" />}
                            {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {contact.sent_at ? format(new Date(contact.sent_at), 'PPp') : '-'}
                        </TableCell>
                        <TableCell className="text-destructive text-sm max-w-[200px] truncate">
                          {contact.error_message || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
