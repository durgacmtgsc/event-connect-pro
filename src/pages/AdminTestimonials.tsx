import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
import { Star, Plus, Edit, Trash2, Eye, EyeOff, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface Testimonial {
  id: string;
  author_name: string;
  event_type: string;
  content: string;
  rating: number;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
}

const EVENT_TYPES = ['Wedding', 'Birthday', 'Housewarming', 'Engagement', 'Anniversary', 'Baby Shower', 'Corporate Event', 'Other'];

const emptyForm = {
  author_name: '',
  event_type: '',
  content: '',
  rating: 5,
  is_featured: false,
  is_published: true,
};

export default function AdminTestimonials() {
  const { toast } = useToast();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setTestimonials(data || []);
    } catch (err) {
      console.error('[AdminTestimonials] Error:', err);
      toast({ title: 'Error', description: 'Failed to load testimonials.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (t: Testimonial) => {
    setEditingId(t.id);
    setForm({
      author_name: t.author_name,
      event_type: t.event_type,
      content: t.content,
      rating: t.rating,
      is_featured: t.is_featured,
      is_published: t.is_published,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.author_name.trim() || !form.event_type || !form.content.trim()) {
      toast({ title: 'Missing fields', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        const { error } = await supabase.from('testimonials').update(form).eq('id', editingId);
        if (error) throw error;
        toast({ title: 'Testimonial updated' });
      } else {
        const { error } = await supabase.from('testimonials').insert(form);
        if (error) throw error;
        toast({ title: 'Testimonial added' });
      }
      setDialogOpen(false);
      fetchTestimonials();
    } catch (err) {
      console.error('[AdminTestimonials] Save error:', err);
      toast({ title: 'Error', description: 'Failed to save testimonial.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const { error } = await supabase.from('testimonials').delete().eq('id', deleteId);
      if (error) throw error;
      toast({ title: 'Testimonial deleted' });
      fetchTestimonials();
    } catch (err) {
      console.error('[AdminTestimonials] Delete error:', err);
      toast({ title: 'Error', description: 'Failed to delete.', variant: 'destructive' });
    } finally {
      setDeleteId(null);
    }
  };

  const togglePublished = async (t: Testimonial) => {
    try {
      const { error } = await supabase.from('testimonials').update({ is_published: !t.is_published }).eq('id', t.id);
      if (error) throw error;
      toast({ title: t.is_published ? 'Unpublished' : 'Published' });
      fetchTestimonials();
    } catch (err) {
      console.error('[AdminTestimonials] Toggle error:', err);
      toast({ title: 'Error', description: 'Failed to update.', variant: 'destructive' });
    }
  };

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? 'text-warning fill-warning' : 'text-muted-foreground'}`} />
    ));

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Testimonials</h1>
            <p className="text-muted-foreground mt-1">Manage customer reviews displayed on the homepage</p>
          </div>
          <Button className="gradient-primary" onClick={openAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Testimonial
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total',     value: testimonials.length },
            { label: 'Published', value: testimonials.filter(t => t.is_published).length },
            { label: 'Featured',  value: testimonials.filter(t => t.is_featured).length },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* List */}
        <Card>
          <CardHeader>
            <CardTitle>All Testimonials</CardTitle>
            <CardDescription>Published testimonials appear on the homepage</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading...</div>
            ) : testimonials.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">No testimonials yet</h3>
                <p className="text-muted-foreground mb-4">Add your first customer testimonial.</p>
                <Button className="gradient-primary" onClick={openAdd}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Testimonial
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {testimonials.map((t) => (
                  <div key={t.id} className="flex items-start gap-4 p-4 rounded-xl border border-border hover:bg-secondary/30 transition-all">
                    <div className="w-10 h-10 rounded-full gradient-primary flex-shrink-0 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{t.author_name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-semibold text-foreground">{t.author_name}</p>
                        <Badge variant="secondary" className="text-xs">{t.event_type}</Badge>
                        {t.is_featured && <Badge className="text-xs">Featured</Badge>}
                        {!t.is_published && <Badge variant="outline" className="text-xs">Hidden</Badge>}
                      </div>
                      <div className="flex items-center gap-1 mb-2">{renderStars(t.rating)}</div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{t.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">{format(new Date(t.created_at), 'MMM d, yyyy')}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => togglePublished(t)}
                        title={t.is_published ? 'Unpublish' : 'Publish'}
                      >
                        {t.is_published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(t)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(t.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Testimonial' : 'Add Testimonial'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Update this customer review.' : 'Add a new customer testimonial to display on the homepage.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="author_name">Customer Name *</Label>
                <Input
                  id="author_name"
                  placeholder="e.g. Priya Sharma"
                  value={form.author_name}
                  onChange={(e) => setForm({ ...form, author_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Event Type *</Label>
                <Select value={form.event_type} onValueChange={(v) => setForm({ ...form, event_type: v })}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Review *</Label>
              <Textarea
                id="content"
                placeholder="What did the customer say about your service?"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button key={r} type="button" onClick={() => setForm({ ...form, rating: r })}>
                    <Star className={`w-6 h-6 ${r <= form.rating ? 'text-warning fill-warning' : 'text-muted-foreground'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.is_published}
                  onCheckedChange={(v) => setForm({ ...form, is_published: v })}
                />
                <Label>Published</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.is_featured}
                  onCheckedChange={(v) => setForm({ ...form, is_featured: v })}
                />
                <Label>Featured</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button className="gradient-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Testimonial'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Testimonial?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove this testimonial from the homepage.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
