import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Search,
  Download,
  Upload,
  RefreshCw,
  Edit,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  Phone,
  FileSpreadsheet
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface Campaign {
  id: string;
  title: string;
  status: string;
  total_contacts: number;
  sent_count: number;
  failed_count: number;
}

interface Contact {
  id: string;
  phone: string;
  status: 'pending' | 'sent' | 'failed';
  error_message?: string;
  sent_at?: string;
  created_at: string;
}

export default function AdminReports() {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(searchParams.get('campaign') || '');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [editNotes, setEditNotes] = useState('');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (selectedCampaignId) {
      fetchContacts();
    }
  }, [selectedCampaignId]);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, title, status, total_contacts, sent_count, failed_count')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
      
      // Auto-select first campaign if none selected
      if (!selectedCampaignId && data && data.length > 0) {
        setSelectedCampaignId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('event_id', selectedCampaignId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load contacts.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRetryContact = async (contactId: string) => {
    try {
      await supabase
        .from('contacts')
        .update({ status: 'pending', error_message: null })
        .eq('id', contactId);

      toast({
        title: 'Retry Scheduled',
        description: 'Contact has been queued for retry.',
      });
      fetchContacts();
    } catch (error) {
      console.error('Error retrying contact:', error);
      toast({
        title: 'Error',
        description: 'Failed to retry contact.',
        variant: 'destructive',
      });
    }
  };

  const handleSaveNotes = async () => {
    if (!editingContact) return;

    try {
      await supabase
        .from('contacts')
        .update({ error_message: editNotes })
        .eq('id', editingContact.id);

      toast({
        title: 'Notes Saved',
        description: 'Contact notes have been updated.',
      });
      setEditingContact(null);
      fetchContacts();
    } catch (error) {
      console.error('Error saving notes:', error);
      toast({
        title: 'Error',
        description: 'Failed to save notes.',
        variant: 'destructive',
      });
    }
  };

  const handleExportCSV = () => {
    const filteredData = filteredContacts;
    
    const csvContent = [
      ['Phone', 'Status', 'Sent At', 'Notes'].join(','),
      ...filteredData.map(c => [
        c.phone,
        c.status,
        c.sent_at ? format(new Date(c.sent_at), 'yyyy-MM-dd HH:mm') : '',
        c.error_message || ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campaign-report-${selectedCampaignId}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Export Complete',
      description: 'Report has been downloaded as CSV.',
    });
  };

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedCampaignId) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      const newContacts: { phone: string; event_id: string; status: 'pending' }[] = [];
      const errors: string[] = [];
      
      lines.forEach((line, index) => {
        if (index === 0 && line.toLowerCase().includes('name')) return;
        
        const parts = line.split(',').map(p => p.trim().replace(/"/g, ''));
        let phone = parts[1] || parts[0];
        phone = phone.replace(/\D/g, '');

        if (!phone.startsWith('91') && phone.length === 10) {
          phone = '91' + phone;
        }

        if (phone.length !== 12) {
          errors.push(`Line ${index + 1}: Invalid phone`);
          return;
        }

        newContacts.push({
          phone: `+${phone}`,
          event_id: selectedCampaignId,
          status: 'pending',
        });
      });

      if (newContacts.length > 0) {
        try {
          const { error } = await supabase.from('contacts').insert(newContacts);
          if (error) throw error;
          
          // Update event total_contacts
          await supabase
            .from('events')
            .update({ total_contacts: contacts.length + newContacts.length })
            .eq('id', selectedCampaignId);

          toast({
            title: 'Import Complete',
            description: `Added ${newContacts.length} contacts. ${errors.length} errors.`,
          });
          fetchContacts();
        } catch (error) {
          console.error('Error importing contacts:', error);
          toast({
            title: 'Error',
            description: 'Failed to import contacts.',
            variant: 'destructive',
          });
        }
      }
    };
    reader.readAsText(file);
  };

  const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId);

  const filteredContacts = contacts.filter(contact => {
    const matchesStatus = statusFilter === 'all' || contact.status === statusFilter;
    const matchesSearch = contact.phone.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: contacts.length,
    confirmed: contacts.filter(c => c.status === 'sent').length,
    pending: contacts.filter(c => c.status === 'pending').length,
    failed: contacts.filter(c => c.status === 'failed').length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-success text-success-foreground">Confirmed</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Not Reachable</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Reports</h1>
            <p className="text-muted-foreground mt-1">
              Detailed guest-level analytics and status tracking
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label htmlFor="import-csv">
              <Button variant="outline" asChild>
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  Import Contacts
                </span>
              </Button>
            </label>
            <input
              id="import-csv"
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              className="hidden"
            />
            <Button variant="outline" onClick={handleExportCSV} disabled={contacts.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Campaign Selector */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId}>
                  <SelectTrigger className="w-full md:w-80">
                    <SelectValue placeholder="Select a campaign" />
                  </SelectTrigger>
                  <SelectContent>
                    {campaigns.map(campaign => (
                      <SelectItem key={campaign.id} value={campaign.id}>
                        {campaign.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedCampaign && (
                <Badge variant={selectedCampaign.status === 'sent' ? 'default' : 'secondary'}>
                  {selectedCampaign.status}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        {selectedCampaignId && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-sm text-muted-foreground">Total Guests</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.confirmed}</p>
                    <p className="text-sm text-muted-foreground">Confirmed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.pending}</p>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.failed}</p>
                    <p className="text-sm text-muted-foreground">Not Reachable</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Guest Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>Guest Status</CardTitle>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-48"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="sent">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Not Reachable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {!selectedCampaignId ? (
              <div className="text-center py-12 text-muted-foreground">
                Select a campaign to view guest details
              </div>
            ) : loading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading contacts...
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">No contacts found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || statusFilter !== 'all' 
                    ? 'Try adjusting your filters' 
                    : 'No contacts in this campaign'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 font-medium text-muted-foreground">Phone</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Sent At</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Notes</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContacts.map((contact) => (
                      <tr key={contact.id} className="border-b border-border/50 hover:bg-secondary/30">
                        <td className="p-3 font-mono">{contact.phone}</td>
                        <td className="p-3">{getStatusBadge(contact.status)}</td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {contact.sent_at 
                            ? format(new Date(contact.sent_at), 'MMM d, yyyy h:mm a')
                            : '-'}
                        </td>
                        <td className="p-3 text-sm text-muted-foreground max-w-48 truncate">
                          {contact.error_message || '-'}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            {contact.status === 'failed' && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => handleRetryContact(contact.id)}
                              >
                                <RefreshCw className="w-4 h-4" />
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => {
                                setEditingContact(contact);
                                setEditNotes(contact.error_message || '');
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
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

      {/* Edit Notes Dialog */}
      <Dialog open={!!editingContact} onOpenChange={() => setEditingContact(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Notes</DialogTitle>
            <DialogDescription>
              Add or update notes for {editingContact?.phone}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={editNotes}
            onChange={(e) => setEditNotes(e.target.value)}
            placeholder="Add notes about this contact..."
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingContact(null)}>Cancel</Button>
            <Button onClick={handleSaveNotes} className="gradient-primary">Save Notes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
