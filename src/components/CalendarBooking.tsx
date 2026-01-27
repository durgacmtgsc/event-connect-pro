import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarBookingProps {
  calLink?: string;
}

const CalendarBooking = ({ calLink = "https://cal.com" }: CalendarBookingProps) => {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center mb-4">
          <Calendar className="w-6 h-6 text-primary-foreground" />
        </div>
        <CardTitle>Book a Demo</CardTitle>
        <CardDescription>Schedule a personalized demo at your convenience</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border bg-secondary/30 p-4">
          <div className="aspect-video bg-muted rounded-md flex items-center justify-center mb-4">
            <iframe
              src={`${calLink}/embed`}
              className="w-full h-full rounded-md min-h-[400px]"
              frameBorder="0"
              allowFullScreen
              title="Book a demo slot"
            />
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Or open the calendar in a new tab
          </p>
          <a href={calLink} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="gap-2">
              <ExternalLink className="w-4 h-4" />
              Open Cal.com
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarBooking;
