-- ============================================
-- IELTS Speaking Part 2 - Complete Data Import SQL
-- ============================================
-- This file contains all INSERT statements to import Part 2 data
-- Run this in Supabase Dashboard > SQL Editor after creating tables

-- First, create tables (if not already done)
CREATE TABLE IF NOT EXISTS part2_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  difficulty_level VARCHAR(20) DEFAULT 'intermediate',
  category VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS part2_cue_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES part2_topics(id) ON DELETE CASCADE,
  main_prompt TEXT NOT NULL,
  bullet_points TEXT[] NOT NULL,
  follow_up_question TEXT NOT NULL,
  preparation_time INTEGER DEFAULT 60,
  speaking_time_min INTEGER DEFAULT 60,
  speaking_time_max INTEGER DEFAULT 120,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Clear existing data (optional)
TRUNCATE part2_cue_cards, part2_topics RESTART IDENTITY CASCADE;

-- ============================================
-- INSERT PART 2 TOPICS
-- ============================================

-- PEOPLE CATEGORY (7 topics)
INSERT INTO part2_topics (id, title, description, difficulty_level, category) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Describe a person who has influenced you', 'Describe a person... - Describe a person who has influenced you', 'intermediate', 'people'),
('550e8400-e29b-41d4-a716-446655440002', 'Describe a family member you are close to', 'Describe a person... - Describe a family member you are close to', 'beginner', 'people'),
('550e8400-e29b-41d4-a716-446655440003', 'Describe someone you respect', 'Describe a person... - Describe someone you respect', 'intermediate', 'people'),
('550e8400-e29b-41d4-a716-446655440004', 'Describe a person who is kind', 'Describe a person... - Describe a person who is kind', 'beginner', 'people'),
('550e8400-e29b-41d4-a716-446655440005', 'Describe an older person you admire', 'Describe a person... - Describe an older person you admire', 'intermediate', 'people'),
('550e8400-e29b-41d4-a716-446655440006', 'Describe a famous person from your country', 'Describe a person... - Describe a famous person from your country', 'advanced', 'people'),
('550e8400-e29b-41d4-a716-446655440007', 'Describe a close friend from your childhood', 'Describe a person... - Describe a close friend from your childhood', 'intermediate', 'people');

-- PLACES CATEGORY (8 topics)  
INSERT INTO part2_topics (id, title, description, difficulty_level, category) VALUES
('550e8400-e29b-41d4-a716-446655440010', 'Describe a peaceful place you know', 'Describe a place... - Describe a peaceful place you know', 'beginner', 'places'),
('550e8400-e29b-41d4-a716-446655440011', 'Describe a place you have recently visited', 'Describe a place... - Describe a place you have recently visited', 'beginner', 'places'),
('550e8400-e29b-41d4-a716-446655440012', 'Describe your favourite shop', 'Describe a place... - Describe your favourite shop', 'beginner', 'places'),
('550e8400-e29b-41d4-a716-446655440013', 'Describe a place near water', 'Describe a place... - Describe a place near water', 'intermediate', 'places'),
('550e8400-e29b-41d4-a716-446655440014', 'Describe a museum you visited', 'Describe a place... - Describe a museum you visited', 'intermediate', 'places'),
('550e8400-e29b-41d4-a716-446655440015', 'Describe an important building in your country', 'Describe a place... - Describe an important building in your country', 'advanced', 'places'),
('550e8400-e29b-41d4-a716-446655440016', 'Describe your neighbourhood', 'Describe a place... - Describe your neighbourhood', 'beginner', 'places'),
('550e8400-e29b-41d4-a716-446655440017', 'Describe a place with animals', 'Describe a place... - Describe a place with animals', 'intermediate', 'places');

-- OBJECTS CATEGORY (7 topics)
INSERT INTO part2_topics (id, title, description, difficulty_level, category) VALUES
('550e8400-e29b-41d4-a716-446655440020', 'Describe a gift you recently gave', 'Describe an object or thing... - Describe a gift you recently gave', 'beginner', 'objects'),
('550e8400-e29b-41d4-a716-446655440021', 'Describe a book you have recently read', 'Describe an object or thing... - Describe a book you have recently read', 'intermediate', 'objects'),
('550e8400-e29b-41d4-a716-446655440022', 'Describe a piece of art you like', 'Describe an object or thing... - Describe a piece of art you like', 'advanced', 'objects'),
('550e8400-e29b-41d4-a716-446655440023', 'Describe a useful website', 'Describe an object or thing... - Describe a useful website', 'intermediate', 'objects'),
('550e8400-e29b-41d4-a716-446655440024', 'Describe a photograph you like', 'Describe an object or thing... - Describe a photograph you like', 'beginner', 'objects'),
('550e8400-e29b-41d4-a716-446655440025', 'Describe a song you like', 'Describe an object or thing... - Describe a song you like', 'beginner', 'objects'),
('550e8400-e29b-41d4-a716-446655440026', 'Describe an important possession', 'Describe an object or thing... - Describe an important possession', 'intermediate', 'objects');

-- EVENTS CATEGORY (7 topics)
INSERT INTO part2_topics (id, title, description, difficulty_level, category) VALUES
('550e8400-e29b-41d4-a716-446655440030', 'Describe a recent event you attended', 'Describe an event, occasion or celebration... - Describe a recent event you attended', 'beginner', 'events'),
('550e8400-e29b-41d4-a716-446655440031', 'Describe a party you attended', 'Describe an event, occasion or celebration... - Describe a party you attended', 'beginner', 'events'),
('550e8400-e29b-41d4-a716-446655440032', 'Describe a festival in your country', 'Describe an event, occasion or celebration... - Describe a festival in your country', 'intermediate', 'events'),
('550e8400-e29b-41d4-a716-446655440033', 'Describe an unexpected event', 'Describe an event, occasion or celebration... - Describe an unexpected event', 'advanced', 'events'),
('550e8400-e29b-41d4-a716-446655440034', 'Describe a time you were embarrassed', 'Describe an event, occasion or celebration... - Describe a time you were embarrassed', 'advanced', 'events'),
('550e8400-e29b-41d4-a716-446655440035', 'Describe a journey that didn''t go as planned', 'Describe an event, occasion or celebration... - Describe a journey that didn''t go as planned', 'intermediate', 'events'),
('550e8400-e29b-41d4-a716-446655440036', 'Describe a memorable trip', 'Describe an event, occasion or celebration... - Describe a memorable trip', 'beginner', 'events');

-- EXPERIENCES CATEGORY (6 topics)
INSERT INTO part2_topics (id, title, description, difficulty_level, category) VALUES
('550e8400-e29b-41d4-a716-446655440040', 'Describe a hobby you enjoy', 'Describe an experience or activity... - Describe a hobby you enjoy', 'beginner', 'experiences'),
('550e8400-e29b-41d4-a716-446655440041', 'Describe something you do to relax', 'Describe an experience or activity... - Describe something you do to relax', 'beginner', 'experiences'),
('550e8400-e29b-41d4-a716-446655440042', 'Describe an exercise you know', 'Describe an experience or activity... - Describe an exercise you know', 'intermediate', 'experiences'),
('550e8400-e29b-41d4-a716-446655440043', 'Describe a sport you would like to learn', 'Describe an experience or activity... - Describe a sport you would like to learn', 'intermediate', 'experiences'),
('550e8400-e29b-41d4-a716-446655440044', 'Describe something difficult you learned', 'Describe an experience or activity... - Describe something difficult you learned', 'advanced', 'experiences'),
('550e8400-e29b-41d4-a716-446655440045', 'Describe an important decision you made', 'Describe an experience or activity... - Describe an important decision you made', 'advanced', 'experiences');

-- ============================================
-- INSERT PART 2 CUE CARDS
-- ============================================

-- PEOPLE CUE CARDS
INSERT INTO part2_cue_cards (topic_id, main_prompt, bullet_points, follow_up_question, preparation_time, speaking_time_min, speaking_time_max) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Describe a person who has had an important influence on your life', ARRAY['who this person is and how you know them', 'what kind of person they are', 'what this person has done that has influenced you'], 'and explain why you think this person has been such an important influence on you', 60, 60, 120),
('550e8400-e29b-41d4-a716-446655440002', 'Describe a member of your family you get on well with', ARRAY['who this person is', 'what relationship you have to that person', 'what that person is like', 'what you do together'], 'and explain why you get on so well', 60, 60, 120),
('550e8400-e29b-41d4-a716-446655440003', 'Describe someone you respect', ARRAY['who the person is', 'how you know about this person', 'what this person does', 'what this person is like'], 'and explain why you respect this person', 60, 60, 120),
('550e8400-e29b-41d4-a716-446655440004', 'Describe a person you know who is kind', ARRAY['who this person is', 'how you know this person', 'what sort of person he/she is'], 'and explain why you think they are kind', 60, 60, 120),
('550e8400-e29b-41d4-a716-446655440005', 'Describe a person much older than you who you admire', ARRAY['who this person is', 'how old he/she is', 'what this person is like', 'how you know this person'], 'and explain why you admire this person', 60, 60, 120),
('550e8400-e29b-41d4-a716-446655440006', 'Describe a famous person from your country', ARRAY['who this person is', 'what this person is famous for', 'how people in your country feel towards him/her'], 'and explain how you feel towards this person', 60, 60, 120),
('550e8400-e29b-41d4-a716-446655440007', 'Describe a close friend from your childhood', ARRAY['where you met this person', 'why you liked him/her', 'what you used to do together'], 'and explain whether you still have contact with them and why', 60, 60, 120);

-- PLACES CUE CARDS  
INSERT INTO part2_cue_cards (topic_id, main_prompt, bullet_points, follow_up_question, preparation_time, speaking_time_min, speaking_time_max) VALUES
('550e8400-e29b-41d4-a716-446655440010', 'Describe a place that you find peaceful', ARRAY['where it is', 'when you first went there', 'what you do there'], 'and explain why you find it peaceful', 60, 60, 120),
('550e8400-e29b-41d4-a716-446655440011', 'Describe a place you have recently visited', ARRAY['where you went', 'who you went with', 'how you got there'], 'and explain why you enjoyed it', 60, 60, 120),
('550e8400-e29b-41d4-a716-446655440012', 'Describe your favourite shop', ARRAY['where it is', 'how often you go there', 'what it sells'], 'and explain why you think it is a good shop', 60, 60, 120),
('550e8400-e29b-41d4-a716-446655440013', 'Describe a place near water that you like', ARRAY['where it is', 'how you get there', 'how often you go there', 'what you can do there'], 'and explain why you like this place', 60, 60, 120),
('550e8400-e29b-41d4-a716-446655440014', 'Describe a museum that you visited', ARRAY['where the museum is', 'what''s in the museum', 'who you went with'], 'and explain your overall experience', 60, 60, 120),
('550e8400-e29b-41d4-a716-446655440015', 'Describe an important building in your country', ARRAY['what the building looks like', 'what the building is used for', 'when it was built'], 'and explain why it''s important and whether you would like to visit it', 60, 60, 120),
('550e8400-e29b-41d4-a716-446655440016', 'Describe your neighbourhood', ARRAY['what it looks like', 'what you can find there', 'what you like to do there'], 'and explain how you feel about your neighbourhood', 60, 60, 120),
('550e8400-e29b-41d4-a716-446655440017', 'Describe a place with animals you visited', ARRAY['where it is', 'how you heard of it', 'what animals can be seen there'], 'and explain why it might be an interesting place to visit', 60, 60, 120);

-- OBJECTS CUE CARDS
INSERT INTO part2_cue_cards (topic_id, main_prompt, bullet_points, follow_up_question, preparation_time, speaking_time_min, speaking_time_max) VALUES
('550e8400-e29b-41d4-a716-446655440020', 'Describe a gift you recently gave to someone', ARRAY['who you gave it to', 'what kind of person he/she is', 'what the gift was', 'what occasion the gift was for'], 'and explain why you chose that gift', 60, 60, 120),
('550e8400-e29b-41d4-a716-446655440021', 'Describe a book you have recently read', ARRAY['what kind of book it is', 'what it is about', 'what sort of people would enjoy it'], 'and explain why you liked it', 60, 60, 120),
('550e8400-e29b-41d4-a716-446655440022', 'Describe a piece of art you like', ARRAY['what the work of art is', 'when you first saw it', 'what you know about it'], 'and explain why you like it', 60, 60, 120),
('550e8400-e29b-41d4-a716-446655440023', 'Describe a useful website you know', ARRAY['what it is', 'how often you visit it', 'what kind of site it is', 'what kind of information it offers'], 'and explain why you think it is useful', 60, 60, 120),
('550e8400-e29b-41d4-a716-446655440024', 'Describe a photograph you like', ARRAY['what can be seen in the photo', 'when it was taken', 'who took it'], 'and explain why you like it', 60, 60, 120),
('550e8400-e29b-41d4-a716-446655440025', 'Describe a song you like', ARRAY['what kind of song it is', 'what the song is about', 'when you first heard it'], 'and explain why you like it', 60, 60, 120),
('550e8400-e29b-41d4-a716-446655440026', 'Describe a possession that is important to you', ARRAY['where you got it from', 'what you do with it', 'why it''s important to you'], 'and explain how you would feel if you were to lose it', 60, 60, 120);

-- EVENTS CUE CARDS
INSERT INTO part2_cue_cards (topic_id, main_prompt, bullet_points, follow_up_question, preparation_time, speaking_time_min, speaking_time_max) VALUES
('550e8400-e29b-41d4-a716-446655440030', 'Describe an event that you attended recently', ARRAY['what and where the occasion was', 'who was there', 'what happened'], 'and explain how you enjoyed it', 60, 60, 120),
('550e8400-e29b-41d4-a716-446655440031', 'Describe a party that you attended recently', ARRAY['what and where the occasion was', 'who was there', 'what happened'], 'and describe how you enjoyed it', 60, 60, 120),
('550e8400-e29b-41d4-a716-446655440032', 'Describe a festival that is celebrated in your country', ARRAY['when you celebrate it', 'why it is celebrated', 'how people in your country celebrate it'], 'and explain how you feel during this festival', 60, 60, 120),
('550e8400-e29b-41d4-a716-446655440033', 'Describe an unexpected event that happened to you', ARRAY['what it was', 'when it happened', 'who was there', 'why it was unexpected'], 'and explain why you enjoyed it or how you felt about it', 60, 60, 120),
('550e8400-e29b-41d4-a716-446655440034', 'Describe a time you were embarrassed', ARRAY['when it was', 'who you were with', 'what happened'], 'and explain how you coped afterwards', 60, 60, 120),
('550e8400-e29b-41d4-a716-446655440035', 'Describe a journey that didn''t go as planned', ARRAY['where you were going', 'how you were travelling', 'who you were with', 'what went wrong'], 'and explain what you would do differently', 60, 60, 120),
('550e8400-e29b-41d4-a716-446655440036', 'Describe a trip you went on that you enjoyed', ARRAY['where you went', 'where you stayed', 'who you went with', 'what you did there'], 'and explain why you enjoyed it', 60, 60, 120);

-- EXPERIENCES CUE CARDS
INSERT INTO part2_cue_cards (topic_id, main_prompt, bullet_points, follow_up_question, preparation_time, speaking_time_min, speaking_time_max) VALUES
('550e8400-e29b-41d4-a716-446655440040', 'Describe an interesting hobby you have', ARRAY['what it is', 'what kind of people do it', 'how it is done'], 'and explain why you think it is interesting', 60, 60, 120),
('550e8400-e29b-41d4-a716-446655440041', 'Describe something you do to relax', ARRAY['what it is', 'where you do it', 'when you first did it'], 'and explain why you find it relaxing', 60, 60, 120),
('550e8400-e29b-41d4-a716-446655440042', 'Describe an exercise you know', ARRAY['what it is', 'how it is done', 'when you first tried it', 'what kind of people it is suitable for'], 'and explain why you think it is a good exercise', 60, 60, 120),
('550e8400-e29b-41d4-a716-446655440043', 'Describe a sport you would like to learn', ARRAY['what it is', 'what equipment is needed for it', 'how you would learn it'], 'and explain why you would like to learn this sport', 60, 60, 120),
('550e8400-e29b-41d4-a716-446655440044', 'Describe something difficult you learned to do', ARRAY['what you learned to do', 'how you learned to do it', 'why it was difficult'], 'and explain whether you''re glad you learned to do this or not', 60, 60, 120),
('550e8400-e29b-41d4-a716-446655440045', 'Describe a decision that you made that was important to your life', ARRAY['what the decision was', 'who you were with when you made it', 'the consequences of your decision'], 'and explain how you felt after you had made it', 60, 60, 120);

-- ============================================
-- ENABLE RLS AND CREATE POLICIES
-- ============================================

-- Enable Row Level Security
ALTER TABLE part2_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE part2_cue_cards ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access on part2_topics" ON part2_topics;
DROP POLICY IF EXISTS "Allow public read access on part2_cue_cards" ON part2_cue_cards;

-- Create policies for public read access
CREATE POLICY "Allow public read access on part2_topics" 
ON part2_topics FOR SELECT 
USING (true);

CREATE POLICY "Allow public read access on part2_cue_cards" 
ON part2_cue_cards FOR SELECT 
USING (true);

-- ============================================
-- VERIFY DATA
-- ============================================

-- Check data counts
SELECT 
  'part2_topics' as table_name,
  category,
  COUNT(*) as count
FROM part2_topics 
GROUP BY category
UNION ALL
SELECT 
  'part2_cue_cards' as table_name,
  'all' as category,
  COUNT(*) as count
FROM part2_cue_cards;

-- Show sample data
SELECT t.category, t.title, c.main_prompt 
FROM part2_topics t
JOIN part2_cue_cards c ON t.id = c.topic_id
ORDER BY t.category, t.title
LIMIT 10;