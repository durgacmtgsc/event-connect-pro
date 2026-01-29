import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Phone, 
  MessageSquare, 
  Users,
  Calendar,
  ArrowRight,
  Upload,
  Bell,
  CheckCircle2,
  Send,
  ClipboardList
} from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      title: 'Choose Your Package',
      description: 'Select a package based on your guest count. All packages include calls, SMS, and WhatsApp support.',
      icon: ClipboardList,
      details: [
        '100 to 1000+ guest packages',
        'Transparent pricing',
        'All communication modes included',
      ],
    },
    {
      number: 2,
      title: 'Add Your Guest List',
      description: 'Upload an Excel file, paste numbers, or add guests manually. Include names for a personal touch.',
      icon: Upload,
      details: [
        'Excel/CSV upload supported',
        'Paste multiple numbers at once',
        'Add guest names for personalization',
      ],
    },
    {
      number: 3,
      title: 'Craft Your Message',
      description: 'Write your invitation message or choose from our beautiful templates. Preview before sending.',
      icon: MessageSquare,
      details: [
        'Wedding, birthday & ceremony templates',
        'Customize every word',
        'Preview in all formats',
      ],
    },
    {
      number: 4,
      title: 'Schedule & Send',
      description: 'Send immediately or schedule for later. Set up automatic reminder follow-ups.',
      icon: Calendar,
      details: [
        'Send now or schedule later',
        'Automatic reminder system',
        'Choose reminder intervals',
      ],
    },
    {
      number: 5,
      title: 'We Call & Message',
      description: 'Our system sends polite, human-like voice calls along with SMS and WhatsApp messages.',
      icon: Phone,
      details: [
        'Warm, respectful voice calls',
        'Simultaneous SMS delivery',
        'WhatsApp for modern reach',
      ],
    },
    {
      number: 6,
      title: 'Track RSVPs',
      description: 'See who confirmed, who is pending, and who wasn\'t reachable. Export reports anytime.',
      icon: CheckCircle2,
      details: [
        'Real-time status updates',
        'Retry unreachable guests',
        'Export detailed reports',
      ],
    },
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
              <Link to="/how-it-works" className="text-sm text-foreground font-medium">
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

      {/* Hero */}
      <section className="pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-6">
            How It Works
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From your guest list to confirmed RSVPs – here's how we make your event invitations 
            simple, personal, and stress-free.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2 hidden md:block" />
            
            <div className="space-y-12">
              {steps.map((step, index) => (
                <div 
                  key={step.number}
                  className={`relative flex flex-col md:flex-row gap-8 ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Step number circle */}
                  <div className="absolute left-6 md:left-1/2 w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-white font-bold -translate-x-1/2 z-10 hidden md:flex">
                    {step.number}
                  </div>
                  
                  {/* Content */}
                  <div className={`flex-1 ${index % 2 === 0 ? 'md:pr-20' : 'md:pl-20'}`}>
                    <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-lg transition-all">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-primary/10 text-primary md:hidden">
                          <step.icon className="h-6 w-6" />
                        </div>
                        <div className="md:hidden w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold flex-shrink-0">
                          {step.number}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 mb-3 mt-4 md:mt-0">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary hidden md:block">
                          <step.icon className="h-5 w-5" />
                        </div>
                        <h3 className="text-xl font-display font-semibold">{step.title}</h3>
                      </div>
                      
                      <p className="text-muted-foreground mb-4">{step.description}</p>
                      
                      <ul className="space-y-2">
                        {step.details.map((detail, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                            <span className="text-muted-foreground">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  {/* Spacer */}
                  <div className="flex-1 hidden md:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-display font-bold text-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Choose your package and create your first invitation campaign in minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/pricing">
              <Button size="lg" className="gradient-primary hover:opacity-90 px-8">
                View Packages
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="px-8">
                Contact Us
              </Button>
            </Link>
          </div>
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
