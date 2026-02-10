
-- Create voters table
CREATE TABLE public.voters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  voter_id TEXT NOT NULL UNIQUE,
  aadhaar_number TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  has_voted BOOLEAN NOT NULL DEFAULT false,
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create candidates table
CREATE TABLE public.candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  party TEXT NOT NULL,
  symbol TEXT NOT NULL,
  votes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blockchain table
CREATE TABLE public.blockchain (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_index INTEGER NOT NULL UNIQUE,
  hash TEXT NOT NULL,
  previous_hash TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  vote_hash TEXT NOT NULL,
  candidate_id UUID REFERENCES public.candidates(id),
  voter_anonymous_id TEXT NOT NULL,
  nonce INTEGER NOT NULL DEFAULT 0,
  is_valid BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.voters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blockchain ENABLE ROW LEVEL SECURITY;

-- Voters: users can read their own record
CREATE POLICY "Users can view own voter record" ON public.voters
  FOR SELECT USING (auth.uid() = user_id);

-- Voters: users can insert their own record
CREATE POLICY "Users can register as voter" ON public.voters
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Voters: users can update their own record (for has_voted flag)
CREATE POLICY "Users can update own voter record" ON public.voters
  FOR UPDATE USING (auth.uid() = user_id);

-- Candidates: everyone can read
CREATE POLICY "Anyone can view candidates" ON public.candidates
  FOR SELECT USING (true);

-- Blockchain: everyone can read (transparency)
CREATE POLICY "Anyone can view blockchain" ON public.blockchain
  FOR SELECT USING (true);

-- Blockchain: authenticated users can insert (cast vote)
CREATE POLICY "Authenticated users can add blocks" ON public.blockchain
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Candidates: only via edge function (service role) for vote counting
-- No direct update policy for security

-- Seed initial candidates
INSERT INTO public.candidates (name, party, symbol) VALUES
  ('Rajesh Kumar', 'Progressive Party', '🌸'),
  ('Priya Sharma', 'Democratic Alliance', '🌳'),
  ('Amit Patel', 'National Front', '🦁'),
  ('Sunita Devi', 'People''s Movement', '🌻');

-- Seed genesis block
INSERT INTO public.blockchain (block_index, hash, previous_hash, vote_hash, voter_anonymous_id, nonce, is_valid)
VALUES (0, '0000000000000000000000000000000000000000000000000000000000000000', '0000000000000000000000000000000000000000000000000000000000000000', 'GENESIS_BLOCK', '', 0, true);
