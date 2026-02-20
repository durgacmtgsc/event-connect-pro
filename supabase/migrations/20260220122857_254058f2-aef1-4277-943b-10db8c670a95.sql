
-- Create testimonials table
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_name TEXT NOT NULL,
  event_type TEXT NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Public can read published testimonials
CREATE POLICY "Anyone can view published testimonials"
  ON public.testimonials
  FOR SELECT
  USING (is_published = true);

-- Admins can manage all testimonials
CREATE POLICY "Admins can insert testimonials"
  ON public.testimonials
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update testimonials"
  ON public.testimonials
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete testimonials"
  ON public.testimonials
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_testimonials_updated_at
  BEFORE UPDATE ON public.testimonials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed a few sample testimonials
INSERT INTO public.testimonials (author_name, event_type, content, rating, is_featured, is_published) VALUES
  ('Priya Sharma', 'Wedding', 'EventReach made our wedding so special. Every guest received a personal call and everyone showed up! We saved hours of stress.', 5, true, true),
  ('Ravi Kumar', 'Birthday Party', 'Amazing service! The team called all 150 guests personally. RSVP tracking was perfect. Highly recommend for any event.', 5, true, true),
  ('Anita Reddy', 'Housewarming', 'Our housewarming was a huge success. EventReach handled all the guest communication and we could focus on the preparations.', 5, false, true);
