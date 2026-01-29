import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  FileBarChart, 
  Search,
  Download,
  RefreshCw,
  CheckCircle2,
  XCircle,
  PhoneOff,
  Clock,
  Filter
} from 'lucide-react';
import { Contact } from '@/lib/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type RSVPStatus = 'all' | 'confirmed' | 'not_coming' | 'not_reachable' | 'pending';

interface ReportTableProps {
  contacts: Contact[];
  onRetry: (contactId: string) => void;
  onExport: () => void;
  loading?: boolean;
}

const statusConfig = {
  sent: {
    label: 'Confirmed',
    icon: CheckCircle2,
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
  failed: {
    label: 'Not Reachable',
    icon: PhoneOff,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
  },
  pending: {
    label: 'Pending',
    icon: Clock,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
  },
};

export function ReportTable({ contacts, onRetry, onExport, loading }: ReportTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<RSVPStatus>('all');

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.phone.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'confirmed' && contact.status === 'sent') ||
      (statusFilter === 'not_reachable' && contact.status === 'failed') ||
      (statusFilter === 'pending' && contact.status === 'pending');
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: contacts.length,
    confirmed: contacts.filter(c => c.status === 'sent').length,
    notReachable: contacts.filter(c => c.status === 'failed').length,
    pending: contacts.filter(c => c.status === 'pending').length,
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <FileBarChart className="h-5 w-5" />
            Guest Status Report
          </CardTitle>
          <Button variant="outline" onClick={onExport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-muted/50 text-center">
            <p className="text-2xl font-display font-bold text-foreground">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total Guests</p>
          </div>
          <div className="p-4 rounded-xl bg-success/10 text-center">
            <p className="text-2xl font-display font-bold text-success">{stats.confirmed}</p>
            <p className="text-sm text-muted-foreground">Confirmed</p>
          </div>
          <div className="p-4 rounded-xl bg-destructive/10 text-center">
            <p className="text-2xl font-display font-bold text-destructive">{stats.notReachable}</p>
            <p className="text-sm text-muted-foreground">Not Reachable</p>
          </div>
          <div className="p-4 rounded-xl bg-warning/10 text-center">
            <p className="text-2xl font-display font-bold text-warning">{stats.pending}</p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by phone number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as RSVPStatus)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="not_reachable">Not Reachable</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="text-center py-8">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No guests found matching your criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent At</TableHead>
                  <TableHead>Error</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.map((contact) => {
                  const config = statusConfig[contact.status];
                  const StatusIcon = config.icon;
                  
                  return (
                    <TableRow key={contact.id}>
                      <TableCell className="font-mono text-sm">
                        {contact.phone}
                      </TableCell>
                      <TableCell>
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                          config.bgColor,
                          config.color
                        )}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          {config.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {contact.sent_at 
                          ? format(new Date(contact.sent_at), 'PPp') 
                          : '-'
                        }
                      </TableCell>
                      <TableCell className="text-sm max-w-[200px]">
                        {contact.error_message ? (
                          <span className="text-destructive truncate block">
                            {contact.error_message}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {contact.status === 'failed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRetry(contact.id)}
                            className="text-primary hover:text-primary"
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Retry
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
