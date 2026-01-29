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
  Send,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useState } from "react";

const Index = () => {
  const [bookingForm, setBookingForm] = useState({
    name: "",
    phone: "",
    eventDate: "",
    guestCount: ""
  });

  const phoneNumber = "8897105036";
  const whatsappLink = `https://wa.me/91${phoneNumber}`;
  const emailAddress = "info@eventconnect.com";

  const featureChips = [
    { icon: PhoneCall, label: "Polite Human Calls" },
    { icon: CalendarCheck, label: "RSVP Tracking" },
    { icon: Heart, label: "Personal Touch" },
    { icon: Clock, label: "Save 20+ Hours" },
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Share Your Guest List",
      description: "Upload your contacts or enter them manually. We handle the rest with care.",
      icon: Users,
    },
    {
      step: "02", 
      title: "We Make Warm Calls",
      description: "Our trained callers personally invite each guest with warmth and professionalism.",
      icon: Headphones,
    },
    {
      step: "03",
      title: "Track Every Response",
      description: "Get real-time RSVP updates. Know exactly who's coming to your special day.",
      icon: BarChart3,
    },
    {
      step: "04",
      title: "Celebrate Stress-Free",
      description: "Focus on what matters. We ensure every guest feels personally invited.",
      icon: Sparkles,
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

  const promises = [
    "Polite, trained callers who represent your family warmly",
    "Real-time dashboard with every RSVP status",
    "Multiple call attempts until we reach each guest",
    "Detailed notes on dietary preferences & special requests",
    "Same-day reporting on all responses",
    "100% privacy - your guest list stays confidential",
  ];

  const previewStats = [
    { label: "Guests Contacted", value: "248", trend: "+12 today" },
    { label: "Confirmed RSVPs", value: "186", trend: "75% rate" },
    { label: "Pending Responses", value: "42", trend: "Following up" },
    { label: "Dietary Notes", value: "23", trend: "Captured" },
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
              <span className="font-display font-bold text-lg">EventConnect</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-6">
              <Link to="/how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                How It Works
              </Link>
              <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
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

      {/* Hero Section with Feature Chips */}
      <section className="relative gradient-hero text-primary-foreground pt-32 pb-24 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        
        <div className="max-w-6xl mx-auto relative">
          {/* Feature Chips */}
          <div className="flex flex-wrap justify-center gap-3 mb-8 animate-fade-in">
            {featureChips.map((chip, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm"
                style={{ animationDelay: `${index * 100}ms` }}
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
              Because every invitation should feel special.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link to="/auth">
                <Button size="lg" className="gradient-primary text-primary-foreground hover:opacity-90 transition-all text-lg px-8 py-6 shadow-glow">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6">
                  See How It Works
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

      {/* Horizontal Booking Form */}
      <section className="py-8 px-4 bg-card border-b border-border relative -mt-8 z-10">
        <div className="max-w-5xl mx-auto">
          <div className="bg-background rounded-2xl shadow-xl border border-border p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                <CalendarCheck className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground">Book a Free Consultation</h3>
                <p className="text-sm text-muted-foreground">Tell us about your event, we'll call you within 2 hours</p>
              </div>
            </div>
            
            <form className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Your Name</label>
                <Input 
                  placeholder="Enter your name" 
                  value={bookingForm.name}
                  onChange={(e) => setBookingForm({...bookingForm, name: e.target.value})}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Phone Number</label>
                <Input 
                  placeholder="+91 9876543210" 
                  value={bookingForm.phone}
                  onChange={(e) => setBookingForm({...bookingForm, phone: e.target.value})}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Event Date</label>
                <Input 
                  type="date" 
                  value={bookingForm.eventDate}
                  onChange={(e) => setBookingForm({...bookingForm, eventDate: e.target.value})}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Guest Count</label>
                <Input 
                  placeholder="e.g., 150" 
                  value={bookingForm.guestCount}
                  onChange={(e) => setBookingForm({...bookingForm, guestCount: e.target.value})}
                  className="h-12"
                />
              </div>
              <Button type="submit" className="gradient-accent text-accent-foreground h-12 font-semibold hover:opacity-90">
                Get Free Quote
                <Send className="ml-2 w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* How It Works Timeline */}
      <section id="how-it-works" className="py-20 px-4 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-primary font-medium text-sm uppercase tracking-wider">Simple Process</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
              How We Make Magic Happen
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From guest list to confirmed RSVPs, we handle everything with care and professionalism.
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2" />
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorks.map((item, index) => (
                <div 
                  key={index} 
                  className="relative bg-card rounded-2xl p-6 shadow-lg border border-border hover:shadow-xl transition-all group"
                >
                  {/* Step number */}
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
        </div>
      </section>

      {/* Emotional Benefits Cards */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-accent font-medium text-sm uppercase tracking-wider">Why Choose Us</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
              More Than Just Calls
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're helping you create moments that matter, one personal invitation at a time.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {emotionalBenefits.map((benefit, index) => (
              <div 
                key={index}
                className={`relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br ${benefit.gradient} border border-border/50 hover:border-primary/30 transition-all group`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full" />
                
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

      {/* Promise Checklist */}
      <section className="py-20 px-4 bg-gradient-to-b from-background to-secondary/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-success font-medium text-sm uppercase tracking-wider">Our Promise</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
              What You Can Count On
            </h2>
          </div>

          <div className="bg-card rounded-2xl p-8 md:p-10 shadow-xl border border-border">
            <div className="grid md:grid-cols-2 gap-4">
              {promises.map((promise, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-xl hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-success/20 flex items-center justify-center mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  </div>
                  <span className="text-foreground">{promise}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Stats */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-info font-medium text-sm uppercase tracking-wider">Real-Time Tracking</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
              Your Event Dashboard
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Track every response in real-time. Know exactly where you stand, always.
            </p>
          </div>

          <div className="bg-sidebar rounded-2xl p-8 md:p-10 shadow-2xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-3 h-3 rounded-full bg-destructive" />
              <div className="w-3 h-3 rounded-full bg-warning" />
              <div className="w-3 h-3 rounded-full bg-success" />
              <span className="text-sidebar-foreground/50 text-sm ml-2">EventConnect Dashboard</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {previewStats.map((stat, index) => (
                <div 
                  key={index}
                  className="bg-sidebar-accent rounded-xl p-5 border border-sidebar-border"
                >
                  <p className="text-sidebar-foreground/60 text-sm mb-1">{stat.label}</p>
                  <p className="text-3xl md:text-4xl font-bold text-sidebar-primary mb-1">{stat.value}</p>
                  <p className="text-xs text-sidebar-foreground/40">{stat.trend}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <Link to="/auth">
                <Button className="gradient-primary text-primary-foreground hover:opacity-90">
                  See Your Dashboard
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Action Tiles */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-primary font-medium text-sm uppercase tracking-wider">Get In Touch</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
              Ready to Make Your Event Special?
            </h2>
            <p className="text-muted-foreground">
              Reach out through any channel. We're here to help.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Email Tile */}
            <a 
              href={`mailto:${emailAddress}`}
              className="group relative overflow-hidden rounded-2xl bg-card p-8 shadow-lg border border-border hover:border-primary/50 hover:shadow-xl transition-all"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Mail className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-1">Email Us</h3>
                <p className="text-primary font-medium">{emailAddress}</p>
                <p className="text-sm text-muted-foreground mt-2">We reply within 2 hours</p>
              </div>
            </a>

            {/* Phone Tile */}
            <a 
              href={`tel:+91${phoneNumber}`}
              className="group relative overflow-hidden rounded-2xl bg-card p-8 shadow-lg border border-border hover:border-accent/50 hover:shadow-xl transition-all"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-accent/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <Phone className="w-7 h-7 text-accent" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-1">Call Us</h3>
                <p className="text-accent font-medium">+91 {phoneNumber}</p>
                <p className="text-sm text-muted-foreground mt-2">Mon-Sat, 9am-7pm</p>
              </div>
            </a>

            {/* WhatsApp Tile */}
            <a 
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-2xl bg-card p-8 shadow-lg border border-border hover:border-success/50 hover:shadow-xl transition-all"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-success/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-success/10 flex items-center justify-center mb-4 group-hover:bg-success/20 transition-colors">
                  <MessageCircle className="w-7 h-7 text-success" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-1">WhatsApp</h3>
                <p className="text-success font-medium">Quick Chat</p>
                <p className="text-sm text-muted-foreground mt-2">Instant responses</p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 gradient-hero">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Don't Let RSVPs Stress You Out
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join hundreds of families who've chosen personal, stress-free event planning.
          </p>
          <Link to="/auth">
            <Button size="lg" className="gradient-primary text-primary-foreground hover:opacity-90 text-lg px-10 py-6 shadow-glow">
              Start Your Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-sidebar text-sidebar-foreground py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h3 className="font-display font-bold text-xl text-sidebar-primary">EventConnect</h3>
              <p className="text-sidebar-foreground/60 text-sm mt-1">Making every invitation personal</p>
            </div>
            
            <div className="flex items-center gap-6">
              <a href={`mailto:${emailAddress}`} className="text-sidebar-foreground/60 hover:text-sidebar-primary transition-colors">
                <Mail className="w-5 h-5" />
              </a>
              <a href={`tel:+91${phoneNumber}`} className="text-sidebar-foreground/60 hover:text-sidebar-primary transition-colors">
                <Phone className="w-5 h-5" />
              </a>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="text-sidebar-foreground/60 hover:text-sidebar-primary transition-colors">
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div className="border-t border-sidebar-border mt-8 pt-8 text-center">
            <p className="text-sidebar-foreground/40 text-sm">
              © 2025 EventConnect. Made with <Heart className="w-4 h-4 inline text-accent" /> for special moments.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
