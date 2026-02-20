import { 
  Heart, 
  Phone, 
  CheckCircle2, 
  Users, 
  Clock, 
  MessageCircle,
  Mail,
  CalendarCheck,
  ArrowRight,
  Shield,
  Headphones,
  BarChart3,
  UserCheck,
  PhoneCall,
  Star,
  Sparkles,
  CalendarDays,
  ListChecks,
  SendHorizonal,
  ClipboardCheck,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";

const Index = () => {
  const phoneNumber = "8897105036";
  const whatsappLink = `https://wa.me/91${phoneNumber}`;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const featureChips = [
    { icon: PhoneCall, label: "Voice Call Invitations" },
    { icon: MessageCircle, label: "WhatsApp Integration" },
    { icon: CalendarCheck, label: "Real-time RSVP Tracking" },
    { icon: Heart, label: "Personal Touch" },
    { icon: Clock, label: "SMS Reminders" },
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Event Creation",
      description: "Share your event details — name, date, venue, and guest preferences.",
      icon: CalendarDays,
    },
    {
      step: "02",
      title: "Message Setup",
      description: "Craft personalized invitation messages with dynamic variables.",
      icon: MessageCircle,
    },
    {
      step: "03",
      title: "Guest List",
      description: "Upload your guest list via CSV or enter contacts manually.",
      icon: Users,
    },
    {
      step: "04",
      title: "Schedule",
      description: "Set the perfect time to send invitations with retry windows.",
      icon: Clock,
    },
    {
      step: "05",
      title: "Review",
      description: "Preview every detail before you launch the campaign.",
      icon: ListChecks,
    },
    {
      step: "06",
      title: "Confirmation",
      description: "Track RSVPs in real-time as guests confirm their attendance.",
      icon: ClipboardCheck,
    },
  ];

  const emotionalBenefits = [
    {
      icon: Heart,
      title: "No More Stress",
      description: "We handle all guest communication so you can focus on enjoying your special day without the pressure.",
    },
    {
      icon: Sparkles,
      title: "A Personal Touch",
      description: "A genuine phone call says 'you matter to us' in ways a text message never can. Every guest feels valued.",
    },
    {
      icon: BarChart3,
      title: "Track RSVPs Easily",
      description: "Get real-time RSVP updates at a glance. Know exactly who's confirmed, who's pending, and plan accordingly.",
    },
  ];

  const packages = [
    { guests: 100, price: 499 },
    { guests: 200, price: 799 },
    { guests: 300, price: 999 },
  ];

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg gradient-primary">
                <Phone className="h-5 w-5 text-white" />
              </div>
              <span className="font-display font-bold text-lg text-foreground">EventReach</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                link.href.startsWith("#") ? (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.label}
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                )
              ))}
              <Link to="/admin/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Login
              </Link>
            </div>

            {/* CTA + Mobile Toggle */}
            <div className="flex items-center gap-3">
              <Link to="/buy-slots" className="hidden sm:block">
                <Button size="sm" className="gradient-primary hover:opacity-90">
                  Book a Slot
                </Button>
              </Link>
              <button
                className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-border py-4 space-y-3">
              {navLinks.map((link) => (
                link.href.startsWith("#") ? (
                  <a
                    key={link.label}
                    href={link.href}
                    className="block text-sm text-muted-foreground hover:text-foreground py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.label}
                    to={link.href}
                    className="block text-sm text-muted-foreground hover:text-foreground py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                )
              ))}
              <Link
                to="/admin/login"
                className="block text-sm text-muted-foreground hover:text-foreground py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link to="/buy-slots" onClick={() => setMobileMenuOpen(false)}>
                <Button size="sm" className="gradient-primary w-full mt-2">
                  Book a Slot
                </Button>
              </Link>
            </div>
          )}
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
              Stress-Free Event Planning
              <span className="block text-gradient mt-2">Starts Here.</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Easily invite guests, track RSVPs, and send reminders with EventReach.
              <span className="text-primary font-medium"> No login required</span> for customers.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link to="/buy-slots">
                <Button size="lg" className="gradient-primary text-primary-foreground hover:opacity-90 transition-all text-lg px-8 py-6 shadow-glow">
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <a href={whatsappLink}>
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
      <section id="pricing" className="py-16 px-4 bg-card border-b border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-primary font-medium text-sm uppercase tracking-wider">Simple Pricing</span>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mt-2 mb-2">
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
                    <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                    Voice Call invitations
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                    SMS + WhatsApp
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                    RSVP tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                    Automated reminder follow-ups
                  </li>
                </ul>
                <Link to="/buy-slots" className="block mt-6">
                  <Button className={`w-full ${index === 1 ? 'gradient-primary' : ''}`} variant={index === 1 ? 'default' : 'outline'}>
                    Request a Booking
                  </Button>
                </Link>
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
      <section id="how-it-works" className="py-20 px-4 bg-secondary/30">
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

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {howItWorks.map((item, index) => (
              <div
                key={index}
                className="relative bg-card rounded-2xl p-6 shadow-lg border border-border hover:shadow-xl transition-all group"
              >
                {/* Connector line for desktop */}
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

      {/* Emotional Benefits */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-accent font-medium text-sm uppercase tracking-wider">Why Choose Us</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
              More Than Just Calls
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We bring warmth and personal touch to every event, making your guests feel genuinely valued.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {emotionalBenefits.map((benefit, index) => (
              <div
                key={index}
                className="relative overflow-hidden rounded-2xl p-8 bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all group"
              >
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <benefit.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-display font-semibold text-xl text-foreground mb-3">{benefit.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 px-4 bg-secondary/30 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-primary font-medium text-sm uppercase tracking-wider">Reach Us</span>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mt-2 mb-2">Contact Us</h2>
            <p className="text-muted-foreground">Have questions? We're here to help.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <a href={`tel:+91${phoneNumber}`} className="block">
              <div className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-lg transition-all text-center group cursor-pointer">
                <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Phone className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">Call Us</h3>
                <p className="text-primary font-medium text-sm">+91 {phoneNumber}</p>
                <p className="text-xs text-muted-foreground mt-1">Mon–Sat, 9AM – 7PM</p>
              </div>
            </a>

            <a href="mailto:info@eventreach.in" className="block">
              <div className="p-6 rounded-xl bg-card border border-border hover:border-info/50 hover:shadow-lg transition-all text-center group cursor-pointer">
                <div className="w-14 h-14 rounded-xl bg-info flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Mail className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">Email</h3>
                <p className="text-info font-medium text-sm">info@eventreach.in</p>
                <p className="text-xs text-muted-foreground mt-1">We reply within 24 hours</p>
              </div>
            </a>

            <a href={whatsappLink} className="block">
              <div className="p-6 rounded-xl bg-card border border-border hover:border-success/50 hover:shadow-lg transition-all text-center group cursor-pointer">
                <div className="w-14 h-14 rounded-xl bg-success flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">WhatsApp</h3>
                <p className="text-success font-medium text-sm">Chat Now</p>
                <p className="text-xs text-muted-foreground mt-1">Quick responses</p>
              </div>
            </a>
          </div>

          <div className="text-center">
            <Link to="/contact">
              <Button className="gradient-primary">
                Send Us a Message
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
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
                Book a Slot Now
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

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg gradient-primary">
                <Phone className="h-4 w-4 text-white" />
              </div>
              <span className="font-display font-semibold text-foreground">EventReach</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href={`tel:+91${phoneNumber}`} className="hover:text-foreground transition-colors">
                +91 {phoneNumber}
              </a>
              <a href="mailto:info@eventreach.in" className="hover:text-foreground transition-colors">
                info@eventreach.in
              </a>
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
