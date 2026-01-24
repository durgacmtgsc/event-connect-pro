import { Calendar, Mail, Phone, MessageCircle, Clock, Users, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const Index = () => {
  const phoneNumber = "8897105036";
  const whatsappLink = `https://wa.me/91${phoneNumber}`;
  const emailAddress = "contact@eventcaller.com";

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="gradient-hero text-primary-foreground py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            EventConnect <span className="text-gradient">Pro</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Schedule and send SMS, WhatsApp messages, and voice calls to your contacts with ease
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="gradient-primary text-primary-foreground hover:opacity-90 transition-opacity">
                Get Started
              </Button>
            </Link>
            <a href={`#booking`}>
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10">
                Book a Slot
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Why Choose EventConnect Pro?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center mb-4">
                  <Send className="w-6 h-6 text-primary-foreground" />
                </div>
                <CardTitle>Multi-Channel Messaging</CardTitle>
                <CardDescription>
                  Send SMS, WhatsApp messages, or make voice calls—all from one platform
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-full gradient-accent flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-accent-foreground" />
                </div>
                <CardTitle>Schedule Events</CardTitle>
                <CardDescription>
                  Plan your communications ahead with our powerful scheduling system
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-info flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-info-foreground" />
                </div>
                <CardTitle>Bulk Contacts</CardTitle>
                <CardDescription>
                  Manage and reach multiple contacts in a single event with tracking
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section id="booking" className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 text-foreground">Book a Demo Slot</h2>
          <p className="text-center text-muted-foreground mb-12">
            Schedule a personalized demo to see how EventConnect Pro can work for you
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-primary-foreground" />
                </div>
                <CardTitle>Available Slots</CardTitle>
                <CardDescription>Choose a time that works for you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {["Mon - Fri: 9:00 AM - 6:00 PM", "Sat: 10:00 AM - 2:00 PM", "Sun: Closed"].map((slot, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-foreground">{slot}</span>
                  </div>
                ))}
                <Link to="/auth" className="block mt-4">
                  <Button className="w-full gradient-primary text-primary-foreground">
                    Book Now
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Contact Card */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Reach Us</CardTitle>
                <CardDescription>Get in touch through any of these channels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Email */}
                <a 
                  href={`mailto:${emailAddress}`}
                  className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium text-foreground">{emailAddress}</p>
                  </div>
                </a>

                {/* Phone */}
                <a 
                  href={`tel:+91${phoneNumber}`}
                  className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <Phone className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium text-foreground">+91 {phoneNumber}</p>
                  </div>
                </a>

                {/* WhatsApp */}
                <a 
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-lg bg-success/10 hover:bg-success/20 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center group-hover:bg-success/30 transition-colors">
                    <MessageCircle className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">WhatsApp</p>
                    <p className="font-medium text-foreground">+91 {phoneNumber}</p>
                  </div>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="gradient-hero text-primary-foreground py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-muted-foreground">
            © 2025 EventConnect Pro. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
