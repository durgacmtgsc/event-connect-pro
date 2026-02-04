import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Phone, 
  MessageCircle, 
  Mail,
  CheckCircle2,
  Users,
  Sparkles,
  ArrowRight,
  Send
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SlotPlan {
  id: string;
  guests: number;
  price: number;
  popular?: boolean;
  features: string[];
}

const slotPlans: SlotPlan[] = [
  {
    id: 'starter',
    guests: 100,
    price: 499,
    features: [
      'Voice Call invitations',
      'SMS invitations',
      'WhatsApp invitations',
      'RSVP tracking',
      'Basic analytics',
    ],
  },
  {
    id: 'popular',
    guests: 200,
    price: 799,
    popular: true,
    features: [
      'Voice Call invitations',
      'SMS invitations',
      'WhatsApp invitations',
      'RSVP tracking',
      'Reminder follow-ups',
      'Priority support',
    ],
  },
  {
    id: 'professional',
    guests: 300,
    price: 999,
    features: [
      'Voice Call invitations',
      'SMS invitations',
      'WhatsApp invitations',
      'RSVP tracking',
      'Reminder follow-ups',
      'Priority support',
      'Detailed analytics',
    ],
  },
];

export default function BuySlots() {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<SlotPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) {
      toast({
        title: 'Please select a plan',
        description: 'Choose a slot package to continue.',
        variant: 'destructive',
      });
      return;
    }

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
      const slotPackage = `${selectedPlan.guests} Guests`;
      
      // Save to database
      const { error } = await supabase.from('slot_purchases').insert({
        customer_name: formData.name,
        customer_phone: phoneFormatted,
        customer_email: formData.email || null,
        slot_plan: slotPackage,
        slot_count: selectedPlan.guests,
        price: selectedPlan.price,
        status: 'pending',
      });

      if (error) throw error;

      // Send admin and customer notifications
      try {
        await supabase.functions.invoke('notify-admin', {
          body: {
            type: 'slot_purchase',
            customerName: formData.name,
            customerPhone: phoneFormatted,
            customerEmail: formData.email || undefined,
            slotPackage: slotPackage,
            slotCount: selectedPlan.guests,
          },
        });
      } catch (notifyError) {
        console.error('Notification error (non-blocking):', notifyError);
      }

      setSubmitted(true);
      toast({
        title: 'Booking Successful!',
        description: "We'll contact you shortly.",
      });
    } catch (error) {
      console.error('Error submitting booking:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
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
            </div>
          </div>
        </nav>

        <div className="pt-32 pb-20 px-4">
          <div className="max-w-lg mx-auto text-center">
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-success" />
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-4">
              Booking Successful!
            </h1>
            <p className="text-muted-foreground mb-2">
              Your booking for <strong>{selectedPlan?.guests} Guests Package</strong> has been received.
            </p>
            <p className="text-muted-foreground mb-8">
              We'll contact you shortly. You can also reach us directly:
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/">
                <Button variant="outline">Back to Home</Button>
              </Link>
              <a href="https://wa.me/918897105036">
                <Button className="gradient-primary">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat on WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-28 pb-12 px-4 gradient-hero text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Buy Invitation Slots
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Select a package that fits your event. No login required – just select, fill your details, and our team will get in touch.
          </p>
        </div>
      </section>

      {/* Slot Plans */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {slotPlans.map((plan) => (
              <Card 
                key={plan.id}
                className={`relative cursor-pointer transition-all hover:shadow-lg ${
                  selectedPlan?.id === plan.id 
                    ? 'ring-2 ring-primary shadow-lg' 
                    : 'hover:border-primary/50'
                } ${plan.popular ? 'border-primary' : ''}`}
                onClick={() => setSelectedPlan(plan)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 text-xs font-semibold bg-primary text-primary-foreground rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-display">{plan.guests} Guests</CardTitle>
                  <div className="mt-2">
                    <span className="text-4xl font-bold text-primary">₹{plan.price}</span>
                    <span className="text-muted-foreground"> / package</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full mt-6 ${
                      selectedPlan?.id === plan.id 
                        ? 'gradient-primary' 
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                    onClick={() => setSelectedPlan(plan)}
                  >
                    {selectedPlan?.id === plan.id ? 'Selected' : 'Select Plan'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Booking Form */}
          <Card className="max-w-lg mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Complete Your Booking
              </CardTitle>
              <CardDescription>
                Fill in your details and we'll contact you to confirm
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
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

                {selectedPlan && (
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm font-medium text-foreground">Selected Plan:</p>
                    <p className="text-lg font-semibold text-primary">
                      {selectedPlan.guests} Guests – ₹{selectedPlan.price}
                    </p>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full gradient-primary hover:opacity-90"
                  disabled={loading || !selectedPlan}
                >
                  {loading ? (
                    'Processing...'
                  ) : (
                    <>
                      Book Now
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
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
