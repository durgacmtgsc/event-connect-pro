import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { ModeBadge } from '@/components/ui/mode-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  Plus,
  ArrowRight,
  Send,
  ShoppingCart,
  Calendar,
  AlertCircle,
  Megaphone
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Event, DashboardStats } from '@/lib/types';
import { format } from 'date-fns';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    pendingEvents: 0,
    sentMessages: 0,
    failedMessages: 0,
  });
  const [loading, setLoading] = useState(true);

  // Mock active booking - in production, fetch from database
  const activeBooking = {
    packageName: '300 Guests Package',
    totalSlots: 300,
    usedSlots: 124,
    remainingSlots: 176,
    expiresAt: null,
  };

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
      
      const typedEvents = (eventsData || []) as unknown as Event[];
      setEvents(typedEvents);

      // Calculate stats
      const { data: allEvents } = await supabase
        .from('events')
        .select('status, sent_count, failed_count, total_contacts');

      const allTypedEvents = (allEvents || []) as unknown as Event[];
      
      const totalGuests = allTypedEvents.reduce((acc, e) => acc + (e.total_contacts || 0), 0);
      const sentMessages = allTypedEvents.reduce((acc, e) => acc + (e.sent_count || 0), 0);
      const pendingMessages = allTypedEvents.reduce((acc, e) => {
        return acc + ((e.total_contacts || 0) - (e.sent_count || 0) - (e.failed_count || 0));
      }, 0);
      const confirmedCount = sentMessages; // In production, track actual RSVPs

      setStats({ 
        totalEvents: totalGuests, 
        pendingEvents: pendingMessages, 
        sentMessages, 
        failedMessages: confirmedCount 
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgress = (event: Event) => {
    if (!event.total_contacts) return 0;
    return Math.round(((event.sent_count || 0) + (event.failed_count || 0)) / event.total_contacts * 100);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back! Here's your invitation overview
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/dashboard/slots')}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Buy Slots
            </Button>
            <Button className="gradient-primary hover:opacity-90" onClick={() => navigate('/create')}>
              <Plus className="mr-2 h-4 w-4" />
              New Invitation
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Guests"
            value={stats.totalEvents}
            icon={<Users className="h-5 w-5" />}
            variant="primary"
          />
          <StatCard
            title="Invitations Sent"
            value={stats.sentMessages}
            icon={<Send className="h-5 w-5" />}
            variant="success"
          />
          <StatCard
            title="Confirmed RSVPs"
            value={stats.failedMessages}
            icon={<CheckCircle2 className="h-5 w-5" />}
            variant="success"
          />
          <StatCard
            title="Pending"
            value={stats.pendingEvents}
            icon={<Clock className="h-5 w-5" />}
            variant="warning"
          />
        </div>

        {/* Active Booking Card */}
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                My Active Booking
              </span>
              <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/slots')}>
                Buy More Slots
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-lg font-semibold">{activeBooking.packageName}</p>
                <p className="text-sm text-muted-foreground">
                  {activeBooking.remainingSlots} slots remaining
                </p>
              </div>
              <div className="flex-1 max-w-xs">
                <div className="flex justify-between text-sm mb-2">
                  <span>{activeBooking.usedSlots} used</span>
                  <span>{activeBooking.totalSlots} total</span>
                </div>
                <Progress 
                  value={(activeBooking.usedSlots / activeBooking.totalSlots) * 100} 
                  className="h-3"
                />
              </div>
            </div>
            
            {activeBooking.remainingSlots < 50 && (
              <div className="mt-4 p-3 rounded-lg bg-warning/10 border border-warning/20 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-warning" />
                <p className="text-sm text-warning">
                  Running low on slots! Consider purchasing more for your upcoming events.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Campaigns */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Recent Campaigns
            </CardTitle>
            <Link to="/campaigns">
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
                  <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-12">
                <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No campaigns yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first invitation campaign to get started
                </p>
                <Button className="gradient-primary hover:opacity-90" onClick={() => navigate('/create')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Invitation
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors gap-4 cursor-pointer"
                    onClick={() => navigate('/campaigns')}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground truncate">{event.title}</h4>
                        <ModeBadge mode={event.mode} />
                        <StatusBadge status={event.status} />
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(new Date(event.scheduled_time), 'PPp')}
                        <span className="mx-1">•</span>
                        <Users className="h-3.5 w-3.5" />
                        {event.total_contacts} guests
                      </p>
                    </div>
                    <div className="w-32">
                      <div className="flex justify-between text-xs mb-1">
                        <span>{event.sent_count || 0} sent</span>
                        <span>{getProgress(event)}%</span>
                      </div>
                      <Progress value={getProgress(event)} className="h-2" />
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
