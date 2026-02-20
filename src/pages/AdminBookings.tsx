import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Phone,
  Mail,
  Users,
  ShoppingBag,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface Booking {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  slot_plan: string;
  slot_count: number;
  price: number;
  status: string;
  notes: string | null;
  created_at: string;
}

const STATUS_COLORS: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
  pending:   { variant: 'outline',     label: 'Pending' },
  confirmed: { variant: 'default',     label: 'Confirmed' },
  rejected:  { variant: 'destructive', label: 'Rejected' },
};

export default function AdminBookings() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('slot_purchases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (err) {
      console.error('[AdminBookings] Error fetching bookings:', err);
      toast({ title: 'Error', description: 'Failed to load bookings.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('slot_purchases')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: status === 'confirmed' ? 'Booking Confirmed' : 'Booking Rejected',
        description: `The booking request has been ${status}.`,
      });
      fetchBookings();
    } catch (err) {
      console.error('[AdminBookings] Error updating status:', err);
      toast({ title: 'Error', description: 'Failed to update booking status.', variant: 'destructive' });
    } finally {
      setConfirmDialogOpen(false);
      setRejectDialogOpen(false);
      setActionId(null);
    }
  };

  const filtered = bookings.filter((b) => {
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchSearch =
      b.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customer_phone.includes(searchQuery) ||
      (b.customer_email || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    rejected: bookings.filter(b => b.status === 'rejected').length,
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Booking Requests</h1>
          <p className="text-muted-foreground mt-1">View and manage all customer booking requests</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total',     value: stats.total,     icon: ShoppingBag,   color: 'text-primary',     bg: 'bg-primary/10' },
            { label: 'Pending',   value: stats.pending,   icon: Clock,         color: 'text-warning',     bg: 'bg-warning/10' },
            { label: 'Confirmed', value: stats.confirmed, icon: CheckCircle2,  color: 'text-success',     bg: 'bg-success/10' },
            { label: 'Rejected',  value: stats.rejected,  icon: XCircle,       color: 'text-destructive', bg: 'bg-destructive/10' },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center`}>
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{s.value}</p>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>All Booking Requests</CardTitle>
                <CardDescription>Approve or reject customer slot requests</CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-56"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading bookings...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">No bookings found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || statusFilter !== 'all' ? 'Try adjusting your filters.' : 'No booking requests yet.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 font-medium text-muted-foreground">Customer</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Package</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Price</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Submitted</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((booking) => {
                      const statusConfig = STATUS_COLORS[booking.status] || { variant: 'outline' as const, label: booking.status };
                      return (
                        <tr key={booking.id} className="border-b border-border hover:bg-secondary/30">
                          <td className="p-3">
                            <p className="font-medium text-foreground">{booking.customer_name}</p>
                            <p className="text-sm text-muted-foreground">{booking.customer_phone}</p>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">{booking.slot_plan}</span>
                            </div>
                          </td>
                          <td className="p-3 font-medium text-foreground">₹{booking.price}</td>
                          <td className="p-3">
                            <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                          </td>
                          <td className="p-3 text-sm text-muted-foreground whitespace-nowrap">
                            {format(new Date(booking.created_at), 'MMM d, yyyy')}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => { setSelectedBooking(booking); setDetailOpen(true); }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              {booking.status === 'pending' && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-success hover:text-success"
                                    onClick={() => { setActionId(booking.id); setConfirmDialogOpen(true); }}
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => { setActionId(booking.id); setRejectDialogOpen(true); }}
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
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

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>Full details for this booking request</DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-secondary/40 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {selectedBooking.customer_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{selectedBooking.customer_name}</p>
                    <Badge variant={(STATUS_COLORS[selectedBooking.status] || { variant: 'outline' as const }).variant}>
                      {(STATUS_COLORS[selectedBooking.status] || { label: selectedBooking.status }).label}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Phone</p>
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    <a href={`tel:${selectedBooking.customer_phone}`} className="text-primary hover:underline">
                      {selectedBooking.customer_phone}
                    </a>
                  </div>
                </div>
                {selectedBooking.customer_email && (
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Email</p>
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      <a href={`mailto:${selectedBooking.customer_email}`} className="text-primary hover:underline truncate">
                        {selectedBooking.customer_email}
                      </a>
                    </div>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-muted-foreground">Package</p>
                  <p className="font-medium">{selectedBooking.slot_plan}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Price</p>
                  <p className="font-medium text-primary">₹{selectedBooking.price}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Submitted</p>
                  <p className="font-medium">{format(new Date(selectedBooking.created_at), 'MMM d, yyyy')}</p>
                </div>
              </div>
              {selectedBooking.notes && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="text-sm">{selectedBooking.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {selectedBooking?.status === 'pending' && (
              <div className="flex gap-2 w-full">
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => { setActionId(selectedBooking.id); setDetailOpen(false); setRejectDialogOpen(true); }}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  className="flex-1 gradient-primary"
                  onClick={() => { setActionId(selectedBooking.id); setDetailOpen(false); setConfirmDialogOpen(true); }}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Confirm
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Booking?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the booking as confirmed. The customer should be notified manually via call or WhatsApp.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-success text-success-foreground hover:bg-success/90"
              onClick={() => actionId && updateStatus(actionId, 'confirmed')}
            >
              Confirm Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Booking?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the booking as rejected. The customer should be notified manually.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={() => actionId && updateStatus(actionId, 'rejected')}
            >
              Reject Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
