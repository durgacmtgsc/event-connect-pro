-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for message modes
CREATE TYPE public.message_mode AS ENUM ('SMS', 'WHATSAPP', 'CALL');

-- Create enum for event status
CREATE TYPE public.event_status AS ENUM ('pending', 'scheduled', 'sending', 'sent', 'partial', 'failed');

-- Create enum for contact status
CREATE TYPE public.contact_status AS ENUM ('pending', 'sent', 'failed');

-- Create profiles table for user data
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    email TEXT,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create events table
CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    mode message_mode NOT NULL DEFAULT 'SMS',
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status event_status NOT NULL DEFAULT 'pending',
    total_contacts INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create contacts table
CREATE TABLE public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    phone TEXT NOT NULL,
    status contact_status NOT NULL DEFAULT 'pending',
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Events policies
CREATE POLICY "Users can view their own events"
    ON public.events FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own events"
    ON public.events FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events"
    ON public.events FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own events"
    ON public.events FOR DELETE
    USING (auth.uid() = user_id);

-- Contacts policies (accessed through events)
CREATE POLICY "Users can view contacts for their events"
    ON public.contacts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.events
            WHERE events.id = contacts.event_id
            AND events.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create contacts for their events"
    ON public.contacts FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.events
            WHERE events.id = contacts.event_id
            AND events.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update contacts for their events"
    ON public.contacts FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.events
            WHERE events.id = contacts.event_id
            AND events.user_id = auth.uid()
        )
    );

-- Function to handle profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON public.events
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_events_user_id ON public.events(user_id);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_scheduled_time ON public.events(scheduled_time);
CREATE INDEX idx_contacts_event_id ON public.contacts(event_id);
CREATE INDEX idx_contacts_status ON public.contacts(status);