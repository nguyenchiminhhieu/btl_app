-- ============================================
-- DICTIONARY - SAVED WORDS TABLE
-- ============================================
-- This file contains the saved_words table for the Dictionary feature
-- Run this in Supabase Dashboard > SQL Editor

-- ============================================
-- CREATE SAVED_WORDS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.saved_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Word information
  word VARCHAR(255) NOT NULL,
  phonetic VARCHAR(255),
  definition TEXT NOT NULL,
  part_of_speech VARCHAR(100),
  example TEXT,
  origin TEXT,
  
  -- JSON data for full meanings structure
  -- Stores array of meanings with definitions, synonyms, antonyms, etc.
  meanings JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Timestamps
  saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraint: unique combination of user and word (prevent duplicates)
  UNIQUE(user_id, word)
);

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_saved_words_user_id 
ON public.saved_words(user_id);

CREATE INDEX IF NOT EXISTS idx_saved_words_user_word 
ON public.saved_words(user_id, word);

CREATE INDEX IF NOT EXISTS idx_saved_words_saved_at 
ON public.saved_words(user_id, saved_at DESC);

-- ============================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.saved_words ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE RLS POLICIES
-- ============================================
-- Users can only see their own saved words

CREATE POLICY "Users can view their own saved words"
  ON public.saved_words FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved words"
  ON public.saved_words FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved words"
  ON public.saved_words FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved words"
  ON public.saved_words FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- CREATE TRIGGER FOR UPDATED_AT
-- ============================================

CREATE TRIGGER update_saved_words_updated_at BEFORE UPDATE ON public.saved_words
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VERIFY TABLE CREATION
-- ============================================

-- Show table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'saved_words'
ORDER BY ordinal_position;

-- Show indexes
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'saved_words';

-- Show RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE tablename = 'saved_words'
ORDER BY policyname;

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================
-- Uncomment to add sample data after creating a test user

-- INSERT INTO public.saved_words (user_id, word, phonetic, definition, part_of_speech, example, origin, meanings)
-- VALUES (
--   'your-user-id-here',
--   'hello',
--   'həˈləʊ',
--   'used as a greeting or to begin a phone conversation.',
--   'exclamation',
--   'hello there, Katie!',
--   'early 19th century: variant of earlier hollo ; related to holla.',
--   '[{"partOfSpeech": "exclamation", "definitions": [{"definition": "used as a greeting or to begin a phone conversation.", "example": "hello there, Katie!"}]}]'::jsonb
-- );

-- ============================================
-- COMPLETED
-- ============================================
-- Dictionary saved_words table setup completed!
--
-- Next steps:
-- 1. Run this script in Supabase SQL Editor
-- 2. Verify the table is created: SELECT * FROM public.saved_words;
-- 3. Check RLS is enabled: SELECT * FROM pg_policies WHERE tablename = 'saved_words';
-- 4. Your app can now save words!
