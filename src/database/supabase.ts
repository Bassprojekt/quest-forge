import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vggleihfsdzefirezvgw.supabase.co');
const supabaseKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnZ2xlaWhmc2R6ZWZpcmV6dmd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3OTkzOTUsImV4cCI6MjA5MjM3NTM5NX0.E-_e7OpvHmPQCe4VrO54aB5kbtcsDgSF05fdHo-Z7fM');

export const supabase = createClient(supabaseUrl, supabaseKey);