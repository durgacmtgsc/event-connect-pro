import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Search,
  Phone,
  MessageSquare,
  MessageCircle,
  RefreshCw,
  Copy,
  Trash2,
  Eye,
  CalendarPlus,
  Info,
  Send,
  Users
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
  message: string;
}

export default function AdminCampaigns() {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast({
        title: 'Error',
        description: 'Failed to load campaigns.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!campaignToDelete) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', campaignToDelete);

      if (error) throw error;

      toast({
        title: 'Campaign Deleted',
        description: 'The campaign has been deleted successfully.',
      });
      fetchCampaigns();
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete campaign.',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setCampaignToDelete(null);
    }
  };

  const handleRetry = async (campaignId: string) => {
    try {
      await supabase
        .from('events')
        .update({ status: 'pending' })
        .eq('id', campaignId);

      toast({
        title: 'Retry Scheduled',
        description: 'Campaign has been queued for retry.',
      });
      fetchCampaigns();
    } catch (error) {
      console.error('Error retrying campaign:', error);
      toast({
        title: 'Error',
        description: 'Failed to retry campaign.',
        variant: 'destructive',
      });
    }
  };

  const handleDuplicate = async (campaign: Campaign) => {
    try {
      const { error } = await supabase.from('events').insert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        title: `${campaign.title} (Copy)`,
        message: campaign.message,
        mode: campaign.mode,
        scheduled_time: new Date().toISOString(),
        status: 'pending',
        total_contacts: 0,
        sent_count: 0,
        failed_count: 0,
      });

      if (error) throw error;

      toast({
        title: 'Campaign Duplicated',
        description: 'A copy of the campaign has been created.',
      });
      fetchCampaigns();
    } catch (error) {
      console.error('Error duplicating campaign:', error);
      toast({
        title: 'Error',
        description: 'Failed to duplicate campaign.',
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

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Campaigns</h1>
            <p className="text-muted-foreground mt-1">
              Manage all invitation campaigns
            </p>
          </div>
          <Link to="/admin/create">
            <Button className="gradient-primary hover:opacity-90">
              <CalendarPlus className="w-4 h-4 mr-2" />
              Create Invitation
            </Button>
          </Link>
        </div>

        {/* Status Definitions */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="font-medium text-foreground">Status Guide:</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-1">
                    <Badge>Sent</Badge>
                    <Info className="w-3 h-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>All guests contacted successfully</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-1">
                    <Badge variant="secondary">Partial</Badge>
                    <Info className="w-3 h-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>Some guests reached, some failed</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-1">
                    <Badge variant="destructive">Failed</Badge>
                    <Info className="w-3 h-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>No guests were reached</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>All Campaigns</CardTitle>
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
                    <SelectItem value="scheduled">Scheduled</SelectItem>
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
                <h3 className="font-semibold text-foreground mb-2">No campaigns found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Create your first invitation campaign'}
                </p>
                <Link to="/admin/create">
                  <Button className="gradient-primary">Create Invitation</Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 font-medium text-muted-foreground">Campaign</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Type</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Progress</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Guests</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Scheduled</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCampaigns.map((campaign) => {
                      const progress = campaign.total_contacts 
                        ? Math.round((campaign.sent_count / campaign.total_contacts) * 100) 
                        : 0;
                      const canRetry = campaign.status === 'failed' || campaign.status === 'partial';
                      
                      return (
                        <tr key={campaign.id} className="border-b border-border hover:bg-secondary/30">
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
                                {progress}%
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">{campaign.total_contacts}</span>
                            </div>
                          </td>
                          <td className="p-3 text-sm text-muted-foreground whitespace-nowrap">
                            {format(new Date(campaign.scheduled_time), 'MMM d, yyyy')}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              <Link to={`/admin/reports?campaign=${campaign.id}`}>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </Link>
                              {canRetry && (
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={() => handleRetry(campaign.id)}
                                >
                                  <RefreshCw className="w-4 h-4" />
                                </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => handleDuplicate(campaign)}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => {
                                  setCampaignToDelete(campaign.id);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
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

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this campaign and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
