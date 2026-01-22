import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { ModeBadge } from '@/components/ui/mode-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CalendarDays, 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  Plus,
  Clock,
  ArrowRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Event, DashboardStats } from '@/lib/types';
import { format } from 'date-fns';

export default function Dashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    pendingEvents: 0,
    sentMessages: 0,
    failedMessages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (eventsError) throw eventsError;
      
      // Type assertion for events since the database types aren't generated yet
      const typedEvents = (eventsData || []) as unknown as Event[];
      setEvents(typedEvents);

      // Calculate stats
      const { data: allEvents } = await supabase
        .from('events')
        .select('status, sent_count, failed_count');

      const allTypedEvents = (allEvents || []) as unknown as Event[];
      
      const totalEvents = allTypedEvents.length;
      const pendingEvents = allTypedEvents.filter(e => e.status === 'pending' || e.status === 'scheduled').length;
      const sentMessages = allTypedEvents.reduce((acc, e) => acc + (e.sent_count || 0), 0);
      const failedMessages = allTypedEvents.reduce((acc, e) => acc + (e.failed_count || 0), 0);

      setStats({ totalEvents, pendingEvents, sentMessages, failedMessages });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Overview of your scheduled events and messages
            </p>
          </div>
          <Link to="/create">
            <Button className="gradient-primary hover:opacity-90">
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Events"
            value={stats.totalEvents}
            icon={<CalendarDays className="h-5 w-5" />}
            variant="primary"
          />
          <StatCard
            title="Pending Events"
            value={stats.pendingEvents}
            icon={<Clock className="h-5 w-5" />}
            variant="warning"
          />
          <StatCard
            title="Sent Messages"
            value={stats.sentMessages}
            icon={<CheckCircle2 className="h-5 w-5" />}
            variant="success"
          />
          <StatCard
            title="Failed Messages"
            value={stats.failedMessages}
            icon={<XCircle className="h-5 w-5" />}
            variant="destructive"
          />
        </div>

        {/* Recent Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display">Recent Events</CardTitle>
            <Link to="/reports">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No events yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first event to start sending messages
                </p>
                <Link to="/create">
                  <Button className="gradient-primary hover:opacity-90">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Event
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground truncate">{event.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        <Clock className="inline h-3.5 w-3.5 mr-1" />
                        {format(new Date(event.scheduled_time), 'PPp')}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <ModeBadge mode={event.mode} />
                      <StatusBadge status={event.status} />
                      <span className="text-sm text-muted-foreground">
                        {event.total_contacts} contacts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
