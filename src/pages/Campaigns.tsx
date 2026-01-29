import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CampaignTable } from '@/components/CampaignTable';
import { StatusBadge } from '@/components/ui/status-badge';
import { ModeBadge } from '@/components/ui/mode-badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Event, Contact } from '@/lib/types';
import { format } from 'date-fns';

export default function Campaigns() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<Event | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCampaigns();
    }
  }, [user]);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns((data || []) as unknown as Event[]);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
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

  const handleViewDetails = (campaign: Event) => {
    setSelectedCampaign(campaign);
    fetchContacts(campaign.id);
  };

  const getProgress = (campaign: Event) => {
    if (!campaign.total_contacts) return 0;
    return Math.round(((campaign.sent_count || 0) + (campaign.failed_count || 0)) / campaign.total_contacts * 100);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Campaigns</h1>
            <p className="text-muted-foreground mt-1">
              Manage and track all your invitation campaigns
            </p>
          </div>
          <Button 
            onClick={() => navigate('/create')}
            className="gradient-primary hover:opacity-90"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
        </div>

        {/* Campaigns Table */}
        <CampaignTable
          campaigns={campaigns}
          onViewDetails={handleViewDetails}
          loading={loading}
        />

        {/* Campaign Details Dialog */}
        <Dialog open={!!selectedCampaign} onOpenChange={() => setSelectedCampaign(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">
                {selectedCampaign?.title}
              </DialogTitle>
              <DialogDescription className="flex flex-wrap items-center gap-2">
                {selectedCampaign && (
                  <>
                    <ModeBadge mode={selectedCampaign.mode} />
                    <StatusBadge status={selectedCampaign.status} />
                    <span className="text-muted-foreground">•</span>
                    <span className="flex items-center gap-1 text-muted-foreground text-sm">
                      <Calendar className="h-3.5 w-3.5" />
                      {format(new Date(selectedCampaign.scheduled_time), 'PPp')}
                    </span>
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            {selectedCampaign && (
              <div className="space-y-6">
                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {getProgress(selectedCampaign)}% complete
                    </span>
                  </div>
                  <Progress value={getProgress(selectedCampaign)} className="h-3" />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-muted/50 text-center">
                    <Users className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                    <p className="text-2xl font-display font-bold">{selectedCampaign.total_contacts}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                  <div className="p-4 rounded-xl bg-success/10 text-center">
                    <CheckCircle2 className="h-5 w-5 mx-auto text-success mb-1" />
                    <p className="text-2xl font-display font-bold text-success">{selectedCampaign.sent_count}</p>
                    <p className="text-xs text-muted-foreground">Sent</p>
                  </div>
                  <div className="p-4 rounded-xl bg-destructive/10 text-center">
                    <XCircle className="h-5 w-5 mx-auto text-destructive mb-1" />
                    <p className="text-2xl font-display font-bold text-destructive">{selectedCampaign.failed_count}</p>
                    <p className="text-xs text-muted-foreground">Failed</p>
                  </div>
                  <div className="p-4 rounded-xl bg-warning/10 text-center">
                    <Clock className="h-5 w-5 mx-auto text-warning mb-1" />
                    <p className="text-2xl font-display font-bold text-warning">
                      {(selectedCampaign.total_contacts || 0) - (selectedCampaign.sent_count || 0) - (selectedCampaign.failed_count || 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </div>
                </div>

                {/* Message Preview */}
                <div>
                  <p className="text-sm font-medium mb-2">Message</p>
                  <p className="text-sm text-muted-foreground bg-muted p-4 rounded-lg whitespace-pre-wrap">
                    {selectedCampaign.message}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      setSelectedCampaign(null);
                      navigate('/reports');
                    }}
                  >
                    View Full Report
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
