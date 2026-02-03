import { 
  Heart, 
  Phone, 
  CheckCircle2, 
  Users, 
  Clock, 
  Sparkles,
  MessageCircle,
  Mail,
  CalendarCheck,
  ArrowRight,
  Shield,
  Headphones,
  BarChart3,
  UserCheck,
  PhoneCall,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  const phoneNumber = "8897105036";
  const whatsappLink = `https://wa.me/91${phoneNumber}`;

  const featureChips = [
    { icon: PhoneCall, label: "Polite Human Calls" },
    { icon: CalendarCheck, label: "RSVP Tracking" },
    { icon: Heart, label: "Personal Touch" },
    { icon: Clock, label: "Save 20+ Hours" },
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Buy Slots",
      description: "Choose a package based on your guest count. No login needed.",
      icon: Users,
    },
    {
      step: "02", 
      title: "We Take Your Details",
      description: "Our team contacts you to collect guest list and event details.",
      icon: Headphones,
    },
    {
      step: "03",
      title: "We Make Warm Calls",
      description: "Our trained callers personally invite each guest with warmth.",
      icon: PhoneCall,
    },
    {
      step: "04",
      title: "Track Every Response",
      description: "Get real-time RSVP updates. Know exactly who's coming.",
      icon: BarChart3,
    },
  ];

  const emotionalBenefits = [
    {
      icon: Heart,
      title: "Every Guest Feels Special",
      description: "A personal phone call says 'you matter to us' in ways a text message never can.",
      gradient: "from-rose-500/20 to-pink-500/20",
    },
    {
      icon: Clock,
      title: "Reclaim Your Time",
      description: "Stop chasing RSVPs. Spend those precious hours with family and final preparations.",
      gradient: "from-primary/20 to-info/20",
    },
    {
      icon: Shield,
      title: "Zero Planning Stress",
      description: "No more wondering who's coming. Get confirmed headcounts for perfect planning.",
      gradient: "from-success/20 to-primary/20",
    },
    {
      icon: UserCheck,
      title: "Higher Response Rates",
      description: "Personal calls get 3x more responses than digital invites. Every call counts.",
      gradient: "from-accent/20 to-warning/20",
    },
  ];

  const packages = [
    { guests: 100, price: 499 },
    { guests: 200, price: 799 },
    { guests: 300, price: 999 },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navigation Bar */}
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
              <Link to="/buy-slots" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Buy Slots
              </Link>
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
            
            <div className="flex items-center gap-3">
              <Link to="/buy-slots">
                <Button size="sm" className="gradient-primary hover:opacity-90">
                  Buy Slots
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative gradient-hero text-primary-foreground pt-32 pb-24 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        
        <div className="max-w-6xl mx-auto relative">
          {/* Feature Chips */}
          <div className="flex flex-wrap justify-center gap-3 mb-8 animate-fade-in">
            {featureChips.map((chip, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm"
              >
                <chip.icon className="w-4 h-4 text-primary" />
                <span>{chip.label}</span>
              </div>
            ))}
          </div>

          <div className="text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Your Guests Deserve
              <span className="block text-gradient mt-2">A Personal Invitation</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              We call your guests personally, track every RSVP, and help you celebrate 
              <span className="text-primary font-medium"> stress-free</span>. 
              No login required for customers.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link to="/buy-slots">
                <Button size="lg" className="gradient-primary text-primary-foreground hover:opacity-90 transition-all text-lg px-8 py-6 shadow-glow">
                  Buy Slots Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6">
                  <MessageCircle className="mr-2 w-5 h-5" />
                  Chat on WhatsApp
                </Button>
              </a>
            </div>

            <p className="text-muted-foreground text-sm flex items-center justify-center gap-2">
              <Star className="w-4 h-4 text-warning fill-warning" />
              Trusted by 500+ families for their special moments
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-16 px-4 bg-card border-b border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Simple, Transparent Pricing
            </h2>
            <p className="text-muted-foreground">No hidden fees. No login required.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {packages.map((pkg, index) => (
              <div 
                key={index}
                className={`p-6 rounded-xl border ${index === 1 ? 'border-primary bg-primary/5' : 'border-border bg-background'}`}
              >
                {index === 1 && (
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">Most Popular</span>
                )}
                <div className="mt-2">
                  <span className="text-4xl font-bold text-foreground">{pkg.guests}</span>
                  <span className="text-muted-foreground ml-2">Guests</span>
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-bold text-primary">₹{pkg.price}</span>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    Voice Call invitations
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    SMS + WhatsApp
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    RSVP tracking
                  </li>
                </ul>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link to="/buy-slots">
              <Button className="gradient-primary">
                View All Packages
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-primary font-medium text-sm uppercase tracking-wider">Simple Process</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
              How EventReach Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From booking to confirmed RSVPs, we handle everything with care and professionalism.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => (
              <div 
                key={index} 
                className="relative bg-card rounded-2xl p-6 shadow-lg border border-border hover:shadow-xl transition-all group"
              >
                <div className="absolute -top-4 left-6 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                  Step {item.step}
                </div>
                
                <div className="pt-4">
                  <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <item.icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-accent font-medium text-sm uppercase tracking-wider">Why Choose Us</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
              More Than Just Calls
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {emotionalBenefits.map((benefit, index) => (
              <div 
                key={index}
                className={`relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br ${benefit.gradient} border border-border/50 hover:border-primary/30 transition-all group`}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-background/80 backdrop-blur-sm flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-xl text-foreground mb-3">{benefit.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 gradient-hero text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Make Every Guest Feel Special?
          </h2>
          <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
            Get started today. No login required. Just choose your package and we'll take care of the rest.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/buy-slots">
              <Button size="lg" className="gradient-accent text-accent-foreground hover:opacity-90 text-lg px-8 py-6">
                Buy Slots Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Bar */}
      <section className="py-12 px-4 bg-card border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <a href={`tel:+91${phoneNumber}`} className="flex items-center justify-center gap-3 p-4 rounded-xl hover:bg-secondary transition-colors">
              <Phone className="w-6 h-6 text-primary" />
              <span className="font-medium text-foreground">+91 {phoneNumber}</span>
            </a>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 p-4 rounded-xl hover:bg-secondary transition-colors">
              <MessageCircle className="w-6 h-6 text-success" />
              <span className="font-medium text-foreground">WhatsApp Chat</span>
            </a>
            <a href="mailto:info@eventreach.in" className="flex items-center justify-center gap-3 p-4 rounded-xl hover:bg-secondary transition-colors">
              <Mail className="w-6 h-6 text-info" />
              <span className="font-medium text-foreground">info@eventreach.in</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg gradient-primary">
                <Phone className="h-4 w-4 text-white" />
              </div>
              <span className="font-display font-semibold">EventReach</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} EventReach. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
