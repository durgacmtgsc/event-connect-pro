import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PackageCard, packages } from '@/components/PackageCard';
import { 
  Phone, 
  ArrowRight,
  Check,
  MessageSquare,
  Bell,
  Shield
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const handleSelectPackage = (pkg: typeof packages[0]) => {
    setSelectedPackage(pkg.id);
    if (user) {
      navigate('/dashboard/slots');
    } else {
      navigate('/auth');
    }
  };

  const allFeatures = [
    { icon: Phone, text: 'Polite human-like voice calls' },
    { icon: MessageSquare, text: 'SMS & WhatsApp invitations' },
    { icon: Bell, text: 'Automatic reminder follow-ups' },
    { icon: Shield, text: 'RSVP tracking dashboard' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg gradient-primary">
                <Phone className="h-5 w-5 text-white" />
              </div>
              <span className="font-display font-bold text-lg">EventConnect</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-6">
              <Link to="/how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                How It Works
              </Link>
              <Link to="/pricing" className="text-sm text-foreground font-medium">
                Pricing
              </Link>
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
            
            <div className="flex items-center gap-3">
              <Link to="/auth">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link to="/auth">
                <Button size="sm" className="gradient-primary hover:opacity-90">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-12 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the package that fits your event size. All packages include 
            voice calls, SMS, WhatsApp, and RSVP tracking.
          </p>
        </div>
      </section>

      {/* Features included */}
      <section className="pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-wrap items-center justify-center gap-6">
            {allFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-muted-foreground">
                <feature.icon className="h-4 w-4 text-primary" />
                <span className="text-sm">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Package Cards */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {packages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                package={pkg}
                onSelect={handleSelectPackage}
                selected={selectedPackage === pkg.id}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-2xl font-display font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            {[
              {
                q: 'Can I use all three modes (Call, SMS, WhatsApp) for the same guest?',
                a: 'Yes! All packages include access to all communication modes. You can reach each guest through calls, SMS, and WhatsApp as needed.',
              },
              {
                q: 'What happens if a call doesn\'t go through?',
                a: 'Our system automatically retries failed calls and marks them in your dashboard. You can also manually trigger retries.',
              },
              {
                q: 'Can I add more guests after booking?',
                a: 'Absolutely! You can purchase additional slots anytime from your dashboard.',
              },
              {
                q: 'How do reminders work?',
                a: 'You can set up automatic reminder calls/messages at intervals you choose (7 days, 3 days, 1 day before the event).',
              },
            ].map((faq, index) => (
              <div key={index} className="p-6 rounded-xl bg-card border border-border">
                <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-display font-bold text-foreground mb-4">
            Need a Custom Package?
          </h2>
          <p className="text-muted-foreground mb-6">
            For events with more than 1000 guests or special requirements, contact us for a custom quote.
          </p>
          <Link to="/contact">
            <Button size="lg" variant="outline" className="px-8">
              Contact Us
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2025 EventConnect. Made with ❤️ for your special moments.
        </div>
      </footer>
    </div>
  );
}
