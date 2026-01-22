import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://sbgzecjckkckgeoenydq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNiZ3plY2pja2tja2dlb2VueWRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwNjY2MjUsImV4cCI6MjA4NDY0MjYyNX0.fvbQz1-qB12zidWres3tzWQwYtE9BKvYMEvQG7Hmtcc";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
