import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { UserPlus, Trash2, Shield, Users, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { format } from 'date-fns';

interface AdminUser {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  email?: string;
}

export default function AdminUsers() {
  const { toast } = useToast();
  const { user: currentUser } = useAdminAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePassword, setInvitePassword] = useState('');
  const [inviting, setInviting] = useState(false);
  const [removeId, setRemoveId] = useState<string | null>(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('role', 'admin')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profile emails for each admin
      const enriched: AdminUser[] = [];
      for (const row of data || []) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('user_id', row.user_id)
          .single();
        enriched.push({ ...row, email: profile?.email || 'Unknown' });
      }
      setAdmins(enriched);
    } catch (err) {
      console.error('[AdminUsers] Error:', err);
      toast({ title: 'Error', description: 'Failed to load admin users.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !invitePassword.trim()) {
      toast({ title: 'Missing fields', description: 'Please enter email and password.', variant: 'destructive' });
      return;
    }
    if (invitePassword.length < 6) {
      toast({ title: 'Weak password', description: 'Password must be at least 6 characters.', variant: 'destructive' });
      return;
    }

    setInviting(true);
    try {
      // Sign up new user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: inviteEmail.trim(),
        password: invitePassword,
      });

      if (signUpError) throw signUpError;
      if (!signUpData.user) throw new Error('User creation failed');

      // Assign admin role
      const { error: roleError } = await supabase.from('user_roles').insert({
        user_id: signUpData.user.id,
        role: 'admin',
      });

      if (roleError) throw roleError;

      toast({
        title: 'Admin Invited',
        description: `${inviteEmail} has been created as an admin. They will need to verify their email.`,
      });

      setInviteOpen(false);
      setInviteEmail('');
      setInvitePassword('');
      fetchAdmins();
    } catch (err: any) {
      console.error('[AdminUsers] Invite error:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to create admin user.',
        variant: 'destructive',
      });
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async () => {
    if (!removeId) return;
    const target = admins.find(a => a.id === removeId);
    if (target?.user_id === currentUser?.id) {
      toast({ title: 'Cannot remove yourself', description: 'You cannot remove your own admin role.', variant: 'destructive' });
      setRemoveId(null);
      return;
    }

    try {
      const { error } = await supabase.from('user_roles').delete().eq('id', removeId);
      if (error) throw error;
      toast({ title: 'Admin role removed' });
      fetchAdmins();
    } catch (err) {
      console.error('[AdminUsers] Remove error:', err);
      toast({ title: 'Error', description: 'Failed to remove admin role.', variant: 'destructive' });
    } finally {
      setRemoveId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Admin Users</h1>
            <p className="text-muted-foreground mt-1">Manage who has admin access to the dashboard</p>
          </div>
          <Button className="gradient-primary" onClick={() => setInviteOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add Admin User
          </Button>
        </div>

        {/* Security Note */}
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-foreground">Role-based access control</p>
                <p className="text-muted-foreground">Admin roles are stored securely in a separate table. Removing a user's admin role immediately revokes their dashboard access.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-foreground">{admins.length}</p>
              <p className="text-sm text-muted-foreground">Total Admins</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <p className="text-sm font-medium text-foreground">Role: Admin</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Full dashboard access</p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Admin Users
            </CardTitle>
            <CardDescription>All users with admin dashboard access</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading...</div>
            ) : admins.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No admin users found.</div>
            ) : (
              <div className="space-y-3">
                {admins.map((admin) => {
                  const isSelf = admin.user_id === currentUser?.id;
                  return (
                    <div key={admin.id} className="flex items-center gap-4 p-4 rounded-xl border border-border hover:bg-secondary/30">
                      <div className="w-10 h-10 rounded-full gradient-primary flex-shrink-0 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {(admin.email || 'A').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{admin.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="text-xs">
                            <Shield className="w-3 h-3 mr-1" />
                            Admin
                          </Badge>
                          {isSelf && <Badge variant="outline" className="text-xs">You</Badge>}
                          <span className="text-xs text-muted-foreground">
                            Added {format(new Date(admin.created_at), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                      {!isSelf && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive flex-shrink-0"
                          onClick={() => setRemoveId(admin.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Invite Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Admin User</DialogTitle>
            <DialogDescription>
              Create a new admin account. The user will need to verify their email before logging in.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email Address *</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="admin@eventreach.in"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-password">Temporary Password *</Label>
              <Input
                id="invite-password"
                type="password"
                placeholder="Minimum 6 characters"
                value={invitePassword}
                onChange={(e) => setInvitePassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button className="gradient-primary" onClick={handleInvite} disabled={inviting}>
              {inviting ? 'Creating...' : 'Create Admin'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Dialog */}
      <AlertDialog open={!!removeId} onOpenChange={(o) => !o && setRemoveId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Admin Role?</AlertDialogTitle>
            <AlertDialogDescription>
              This will revoke admin access for this user. They will no longer be able to log into the admin dashboard. The user account itself will remain.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={handleRemove}>
              Remove Access
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
