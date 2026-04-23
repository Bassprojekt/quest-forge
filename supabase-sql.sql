-- Alles löschen
DROP TABLE IF EXISTS public.game_saves CASCADE;
DROP TABLE IF EXISTS public.players CASCADE;

-- Players Tabelle
CREATE TABLE public.players (
  username TEXT PRIMARY KEY,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game Saves Tabelle  
CREATE TABLE public.game_saves (
  player_id TEXT PRIMARY KEY,
  save_data JSONB NOT NULL,
  slot_number INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security aus
ALTER TABLE public.players DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_saves DISABLE ROW LEVEL SECURITY;