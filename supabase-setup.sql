-- Quest Forge Database Setup for Supabase

-- 1. Players Table (Auth)
CREATE TABLE IF NOT EXISTS public.players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

-- 2. Game Saves Table
CREATE TABLE IF NOT EXISTS public.game_saves (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
    save_data JSONB NOT NULL,
    slot_number INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(player_id, slot_number)
);

-- Enable RLS
ALTER TABLE public.game_saves ENABLE ROW LEVEL SECURITY;

-- 3. Create policies
-- Players: Anyone can create account
CREATE POLICY "Anyone can sign up" ON public.players
    FOR INSERT WITH CHECK (true);

-- Players: Anyone can login (read own)
CREATE POLICY "Anyone can read own profile" ON public.players
    FOR SELECT USING (auth.uid() = id);

-- Game Saves: Anyone can create
CREATE POLICY "Anyone can create save" ON public.game_saves
    FOR INSERT WITH CHECK (true);

-- Game Saves: Anyone can update own
CREATE POLICY "Anyone can update own save" ON public.game_saves
    FOR UPDATE USING (player_id = (SELECT id FROM players WHERE auth.uid() = id));

-- Game Saves: Anyone can read own
CREATE POLICY "Anyone can read own saves" ON public.game_saves
    FOR SELECT USING (player_id = (SELECT id FROM players WHERE auth.uid() = id));

-- Enable uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";