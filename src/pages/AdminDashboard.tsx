import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Users, 
  Send, 
  CheckCircle2, 
  Clock,
  CalendarPlus,
  Phone,
  MessageSquare,
  MessageCircle,
  Trash2,
  RefreshCw,
  Filter,
  Search,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface Campaign {
  id: string;
  title: string;
  mode: 'SMS' | 'WHATSAPP' | 'CALL';
  status: 'pending' | 'scheduled' | 'sending' | 'sent' | 'partial' | 'failed';
  total_contacts: number;
  sent_count: number;
  failed_count: number;
  scheduled_time: string;
  created_at: string;
}

interface Stats {
  totalGuests: number;
  invitationsSent: number;
  confirmedRSVPs: number;
  pendingResponses: number;
  slotsUsed: number;
  slotsRemaining: number;
  failedCampaigns: number;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalGuests: 0,
    invitationsSent: 0,
    confirmedRSVPs: 0,
    pendingResponses: 0,
    slotsUsed: 0,
    slotsRemaining: 500,
    failedCampaigns: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch campaigns (events)
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (eventsError) throw eventsError;

      const campaignsList = eventsData || [];
      setCampaigns(campaignsList);

      // Calculate stats
      const totalGuests = campaignsList.reduce((sum, c) => sum + (c.total_contacts || 0), 0);
      const invitationsSent = campaignsList.reduce((sum, c) => sum + (c.sent_count || 0), 0);
      const failedCampaigns = campaignsList.filter(c => c.status === 'failed').length;
      
      // For demo purposes, simulate some data
      setStats({
        totalGuests,
        invitationsSent,
        confirmedRSVPs: Math.floor(invitationsSent * 0.7),
        pendingResponses: Math.floor(invitationsSent * 0.2),
        slotsUsed: totalGuests,
        slotsRemaining: 500 - totalGuests,
        failedCampaigns,
      });

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCampaign = (campaignId: string) => {
    setSelectedCampaigns(prev => 
      prev.includes(campaignId) 
        ? prev.filter(id => id !== campaignId)
        : [...prev, campaignId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCampaigns.length === filteredCampaigns.length) {
      setSelectedCampaigns([]);
    } else {
      setSelectedCampaigns(filteredCampaigns.map(c => c.id));
    }
  };

  const handleDeleteSelected = async () => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .in('id', selectedCampaigns);

      if (error) throw error;

      toast({
        title: 'Campaigns Deleted',
        description: `${selectedCampaigns.length} campaign(s) deleted successfully.`,
      });
      setSelectedCampaigns([]);
      fetchData();
    } catch (error) {
      console.error('Error deleting campaigns:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete campaigns.',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleRetryFailed = async () => {
    const failedCampaignIds = selectedCampaigns.filter(id => {
      const campaign = campaigns.find(c => c.id === id);
      return campaign && (campaign.status === 'failed' || campaign.status === 'partial');
    });

    if (failedCampaignIds.length === 0) {
      toast({
        title: 'No Failed Campaigns',
        description: 'Select campaigns with Failed or Partial status to retry.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await supabase
        .from('events')
        .update({ status: 'pending' })
        .in('id', failedCampaignIds);

      toast({
        title: 'Retry Scheduled',
        description: `${failedCampaignIds.length} campaign(s) queued for retry.`,
      });
      fetchData();
    } catch (error) {
      console.error('Error retrying campaigns:', error);
      toast({
        title: 'Error',
        description: 'Failed to retry campaigns.',
        variant: 'destructive',
      });
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'CALL': return <Phone className="w-4 h-4" />;
      case 'SMS': return <MessageSquare className="w-4 h-4" />;
      case 'WHATSAPP': return <MessageCircle className="w-4 h-4" />;
      default: return <Phone className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      sent: { variant: 'default', label: 'Sent' },
      partial: { variant: 'secondary', label: 'Partial' },
      failed: { variant: 'destructive', label: 'Failed' },
      pending: { variant: 'outline', label: 'Pending' },
      scheduled: { variant: 'outline', label: 'Scheduled' },
      sending: { variant: 'secondary', label: 'Sending' },
    };
    const config = variants[status] || { variant: 'outline', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    const matchesType = typeFilter === 'all' || campaign.mode === typeFilter;
    const matchesSearch = campaign.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  const statCards = [
    { 
      title: 'Total Guests', 
      value: stats.totalGuests, 
      icon: Users, 
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    { 
      title: 'Invitations Sent', 
      value: stats.invitationsSent, 
      icon: Send, 
      color: 'text-info',
      bgColor: 'bg-info/10'
    },
    { 
      title: 'Confirmed RSVPs', 
      value: stats.confirmedRSVPs, 
      icon: CheckCircle2, 
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    { 
      title: 'Pending Responses', 
      value: stats.pendingResponses, 
      icon: Clock, 
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    { 
      title: 'Slots Used', 
      value: `${stats.slotsUsed} / ${stats.slotsUsed + stats.slotsRemaining}`, 
      icon: TrendingUp, 
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    },
    { 
      title: 'Failed Campaigns', 
      value: stats.failedCampaigns, 
      icon: AlertTriangle, 
      color: 'text-destructive',
      bgColor: 'bg-destructive/10'
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage all invitation campaigns and track performance
            </p>
          </div>
          <Link to="/admin/create">
            <Button className="gradient-primary hover:opacity-90">
              <CalendarPlus className="w-4 h-4 mr-2" />
              Create Invitation
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center mb-3`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Campaigns Section */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Recent Campaigns</CardTitle>
                <CardDescription>Manage and track all invitation campaigns</CardDescription>
              </div>
              
              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search campaigns..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-48"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="CALL">Voice Call</SelectItem>
                    <SelectItem value="SMS">SMS</SelectItem>
                    <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedCampaigns.length > 0 && (
              <div className="flex items-center gap-3 mt-4 p-3 bg-secondary/50 rounded-lg">
                <span className="text-sm font-medium">
                  {selectedCampaigns.length} selected
                </span>
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Campaigns?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete {selectedCampaigns.length} campaign(s). This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteSelected} className="bg-destructive text-destructive-foreground">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button variant="outline" size="sm" onClick={handleRetryFailed}>
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Retry Failed
                </Button>
              </div>
            )}
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading campaigns...
              </div>
            ) : filteredCampaigns.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">No campaigns yet</h3>
                <p className="text-muted-foreground mb-4">Create your first invitation campaign to get started.</p>
                <Link to="/admin/create">
                  <Button className="gradient-primary">Create Invitation</Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3">
                        <Checkbox 
                          checked={selectedCampaigns.length === filteredCampaigns.length && filteredCampaigns.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Campaign</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Type</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Progress</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCampaigns.map((campaign) => {
                      const progress = campaign.total_contacts 
                        ? Math.round((campaign.sent_count / campaign.total_contacts) * 100) 
                        : 0;
                      return (
                        <tr key={campaign.id} className="border-b border-border hover:bg-secondary/30">
                          <td className="p-3">
                            <Checkbox 
                              checked={selectedCampaigns.includes(campaign.id)}
                              onCheckedChange={() => handleSelectCampaign(campaign.id)}
                            />
                          </td>
                          <td className="p-3">
                            <span className="font-medium text-foreground">{campaign.title}</span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              {getModeIcon(campaign.mode)}
                              <span className="text-sm">{campaign.mode}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            {getStatusBadge(campaign.status)}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-3 min-w-32">
                              <Progress value={progress} className="h-2" />
                              <span className="text-sm text-muted-foreground whitespace-nowrap">
                                {campaign.sent_count}/{campaign.total_contacts}
                              </span>
                            </div>
                          </td>
                          <td className="p-3 text-sm text-muted-foreground whitespace-nowrap">
                            {format(new Date(campaign.scheduled_time), 'MMM d, yyyy h:mm a')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
