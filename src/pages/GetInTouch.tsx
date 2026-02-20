import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Phone, 
  MessageCircle, 
  Mail,
  Send,
  CheckCircle2,
  MapPin,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function GetInTouch() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });

  const phoneNumber = "8897105036";
  const whatsappLink = `https://wa.me/91${phoneNumber}`;
  const emailAddress = "info@eventreach.in";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate phone number
    const phoneRegex = /^[6-9]\d{9}$/;
    const cleanPhone = formData.phone.replace(/\D/g, '').replace(/^91/, '');
    if (!phoneRegex.test(cleanPhone)) {
      toast({
        title: 'Invalid Phone Number',
        description: 'Please enter a valid 10-digit Indian mobile number.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const phoneFormatted = `+91${cleanPhone}`;
      
      // Save to database
      const { error } = await supabase.from('contact_inquiries').insert({
        name: formData.name,
        phone: phoneFormatted,
        email: formData.email || null,
        message: formData.message || null,
        status: 'new',
      });

      if (error) throw error;

      // Send admin notification
      try {
        await supabase.functions.invoke('notify-admin', {
          body: {
            type: 'contact',
            customerName: formData.name,
            customerPhone: phoneFormatted,
            customerEmail: formData.email || undefined,
            message: formData.message || undefined,
          },
        });
      } catch (notifyError) {
        // Log but don't fail - inquiry is already saved to database
        console.error('[GetInTouch] Notification error (non-blocking):', notifyError);
      }

      setSubmitted(true);
      toast({
        title: 'Message Sent!',
        description: "Thanks! We'll contact you shortly.",
      });
    } catch (error) {
      console.error('[GetInTouch] Error submitting contact form:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit your message. Please try again or contact us directly.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg gradient-primary">
                <Phone className="h-5 w-5 text-white" />
              </div>
              <span className="font-display font-bold text-lg">EventReach</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <a href="/#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                How It Works
              </a>
              <a href="/#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </a>
              <Link to="/buy-slots" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Buy Slots
              </Link>
              <Link to="/admin/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-28 pb-12 px-4 gradient-hero text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Get in Touch
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Have questions about EventReach? We're here to help. Reach out via call, WhatsApp, or email.
          </p>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Quick Contact Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <a href={`tel:+91${phoneNumber}`} className="block">
              <Card className="h-full hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Call Us</h3>
                  <p className="text-primary font-medium">+91 {phoneNumber}</p>
                  <p className="text-sm text-muted-foreground mt-2">Mon-Sat, 9AM - 7PM</p>
                </CardContent>
              </Card>
            </a>

            <a href={whatsappLink} className="block">
              <Card className="h-full hover:shadow-lg transition-all hover:border-success/50 cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 rounded-xl bg-success flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">WhatsApp</h3>
                  <p className="text-success font-medium">Chat Now</p>
                  <p className="text-sm text-muted-foreground mt-2">Quick responses</p>
                </CardContent>
              </Card>
            </a>

            <a href={`mailto:${emailAddress}`} className="block">
              <Card className="h-full hover:shadow-lg transition-all hover:border-info/50 cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 rounded-xl bg-info flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Email</h3>
                  <p className="text-info font-medium">{emailAddress}</p>
                  <p className="text-sm text-muted-foreground mt-2">We reply within 24 hours</p>
                </CardContent>
              </Card>
            </a>
          </div>

          {/* Contact Form */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5 text-primary" />
                  Send Us a Message
                </CardTitle>
                <CardDescription>
                  Fill the form and we'll get back to you shortly
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-success" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Message Sent!</h3>
                    <p className="text-muted-foreground mb-4">
                      Thanks! We'll contact you shortly.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSubmitted(false);
                        setFormData({ name: '', phone: '', email: '', message: '' });
                      }}
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name *</Label>
                      <Input
                        id="name"
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-sm text-muted-foreground">
                          +91
                        </span>
                        <Input
                          id="phone"
                          placeholder="9876543210"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          required
                          className="rounded-l-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email (Optional)</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us about your event or inquiry..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        rows={4}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full gradient-primary hover:opacity-90"
                      disabled={loading}
                    >
                      {loading ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Info Panel */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Business Hours</h3>
                      <p className="text-muted-foreground text-sm">Monday - Saturday</p>
                      <p className="text-muted-foreground text-sm">9:00 AM - 7:00 PM IST</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Location</h3>
                      <p className="text-muted-foreground text-sm">Hyderabad, Telangana</p>
                      <p className="text-muted-foreground text-sm">India</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="p-6 rounded-xl bg-primary/5 border border-primary/20">
                <h3 className="font-semibold text-foreground mb-2">Looking to book slots?</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Check out our pricing packages and book slots for your upcoming event.
                </p>
                <Link to="/buy-slots">
                  <Button className="gradient-primary w-full">
                    View Packages
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-5xl mx-auto text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} EventReach. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
