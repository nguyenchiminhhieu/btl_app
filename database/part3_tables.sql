-- Create Part 3 tables for IELTS Speaking Part 3 discussions
-- Run these queries in Supabase SQL Editor

-- Part 3 Topics table
CREATE TABLE public.part3_topics (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  topic_name character varying NOT NULL,
  main_question text NOT NULL,
  category character varying NOT NULL,
  difficulty_level character varying DEFAULT 'intermediate'::character varying CHECK (difficulty_level = ANY (ARRAY['beginner'::character varying, 'intermediate'::character varying, 'advanced'::character varying])),
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT part3_topics_pkey PRIMARY KEY (id)
);

-- Part 3 Discussion Questions table  
CREATE TABLE public.part3_discussion_questions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  topic_id uuid NOT NULL,
  question_text text NOT NULL,
  question_order integer NOT NULL,
  question_type character varying DEFAULT 'general'::character varying,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT part3_discussion_questions_pkey PRIMARY KEY (id),
  CONSTRAINT part3_discussion_questions_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.part3_topics(id) ON DELETE CASCADE
);

-- Insert sample Part 3 topics
INSERT INTO public.part3_topics (topic_name, main_question, category, difficulty_level) VALUES
('Technology and Society', 'How do you think technology has changed the way people communicate with each other?', 'technology', 'intermediate'),
('Education Systems', 'What do you think are the most important qualities a good teacher should have?', 'education', 'intermediate'),
('Environmental Issues', 'What role do you think individuals should play in protecting the environment?', 'environment', 'intermediate'),
('Work and Career', 'How important do you think it is for people to enjoy their work?', 'work', 'intermediate'),
('Family and Relationships', 'How do you think family relationships have changed over the past few generations?', 'family', 'intermediate'),
('Travel and Culture', 'What benefits do you think people can gain from traveling to different countries?', 'travel', 'intermediate'),
('Health and Lifestyle', 'Do you think people today are more health-conscious than in the past?', 'health', 'intermediate'),
('Media and Entertainment', 'How has the internet changed the way people consume entertainment?', 'media', 'intermediate'),
('City Life vs Rural Life', 'What are the advantages and disadvantages of living in a big city?', 'lifestyle', 'intermediate'),
('Shopping and Consumer Culture', 'How do you think shopping habits have changed in recent years?', 'consumer', 'intermediate');

-- Get topic IDs for inserting sub-questions
-- Technology and Society sub-questions
INSERT INTO public.part3_discussion_questions (topic_id, question_text, question_order, question_type) 
SELECT id, 'Do you think social media has made people more or less social?', 1, 'analytical'
FROM public.part3_topics WHERE topic_name = 'Technology and Society';

INSERT INTO public.part3_discussion_questions (topic_id, question_text, question_order, question_type)
SELECT id, 'What impact do you think artificial intelligence will have on employment?', 2, 'predictive'  
FROM public.part3_topics WHERE topic_name = 'Technology and Society';

INSERT INTO public.part3_discussion_questions (topic_id, question_text, question_order, question_type)
SELECT id, 'Should there be limits on how much time children spend using technology?', 3, 'evaluative'
FROM public.part3_topics WHERE topic_name = 'Technology and Society';

-- Education Systems sub-questions  
INSERT INTO public.part3_discussion_questions (topic_id, question_text, question_order, question_type)
SELECT id, 'Do you think traditional classroom learning is still relevant in the digital age?', 1, 'evaluative'
FROM public.part3_topics WHERE topic_name = 'Education Systems';

INSERT INTO public.part3_discussion_questions (topic_id, question_text, question_order, question_type)
SELECT id, 'How can schools better prepare students for the modern workplace?', 2, 'analytical'
FROM public.part3_topics WHERE topic_name = 'Education Systems';

INSERT INTO public.part3_discussion_questions (topic_id, question_text, question_order, question_type)
SELECT id, 'What role should parents play in their children''s education?', 3, 'general'
FROM public.part3_topics WHERE topic_name = 'Education Systems';

-- Environmental Issues sub-questions
INSERT INTO public.part3_discussion_questions (topic_id, question_text, question_order, question_type)
SELECT id, 'Do you think governments are doing enough to combat climate change?', 1, 'evaluative'
FROM public.part3_topics WHERE topic_name = 'Environmental Issues';

INSERT INTO public.part3_discussion_questions (topic_id, question_text, question_order, question_type)
SELECT id, 'How can businesses be encouraged to adopt more environmentally friendly practices?', 2, 'analytical'
FROM public.part3_topics WHERE topic_name = 'Environmental Issues';

INSERT INTO public.part3_discussion_questions (topic_id, question_text, question_order, question_type)
SELECT id, 'What environmental problems do you think will be most serious in the future?', 3, 'predictive'
FROM public.part3_topics WHERE topic_name = 'Environmental Issues';

-- Work and Career sub-questions
INSERT INTO public.part3_discussion_questions (topic_id, question_text, question_order, question_type)
SELECT id, 'Do you think work-life balance is more important now than it was in the past?', 1, 'comparative'
FROM public.part3_topics WHERE topic_name = 'Work and Career';

INSERT INTO public.part3_discussion_questions (topic_id, question_text, question_order, question_type)
SELECT id, 'What skills do you think will be most valuable in the future job market?', 2, 'predictive'
FROM public.part3_topics WHERE topic_name = 'Work and Career';

INSERT INTO public.part3_discussion_questions (topic_id, question_text, question_order, question_type)
SELECT id, 'Should people be allowed to work from home permanently?', 3, 'evaluative'
FROM public.part3_topics WHERE topic_name = 'Work and Career';

-- Family and Relationships sub-questions
INSERT INTO public.part3_discussion_questions (topic_id, question_text, question_order, question_type)
SELECT id, 'Do you think extended families are as important today as they were in the past?', 1, 'comparative'
FROM public.part3_topics WHERE topic_name = 'Family and Relationships';

INSERT INTO public.part3_discussion_questions (topic_id, question_text, question_order, question_type)
SELECT id, 'How do you think technology has affected family communication?', 2, 'analytical'
FROM public.part3_topics WHERE topic_name = 'Family and Relationships';

INSERT INTO public.part3_discussion_questions (topic_id, question_text, question_order, question_type)
SELECT id, 'What values do you think parents should teach their children?', 3, 'general'
FROM public.part3_topics WHERE topic_name = 'Family and Relationships';

-- Add more sub-questions for remaining topics following the same pattern...
-- Travel and Culture sub-questions
INSERT INTO public.part3_discussion_questions (topic_id, question_text, question_order, question_type)
SELECT id, 'Do you think tourism has more positive or negative effects on local communities?', 1, 'evaluative'
FROM public.part3_topics WHERE topic_name = 'Travel and Culture';

INSERT INTO public.part3_discussion_questions (topic_id, question_text, question_order, question_type)
SELECT id, 'How can travelers be more respectful of local cultures?', 2, 'analytical'
FROM public.part3_topics WHERE topic_name = 'Travel and Culture';

INSERT INTO public.part3_discussion_questions (topic_id, question_text, question_order, question_type)
SELECT id, 'Will virtual reality replace real travel in the future?', 3, 'predictive'
FROM public.part3_topics WHERE topic_name = 'Travel and Culture';

-- Enable Row Level Security (RLS)
ALTER TABLE public.part3_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.part3_discussion_questions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (read-only for all users)
CREATE POLICY "Allow read access to part3_topics" ON public.part3_topics
  FOR SELECT USING (true);

CREATE POLICY "Allow read access to part3_discussion_questions" ON public.part3_discussion_questions  
  FOR SELECT USING (true);

-- Create indexes for better query performance
CREATE INDEX idx_part3_topics_category ON public.part3_topics(category);
CREATE INDEX idx_part3_topics_difficulty ON public.part3_topics(difficulty_level);
CREATE INDEX idx_part3_discussion_questions_topic_id ON public.part3_discussion_questions(topic_id);
CREATE INDEX idx_part3_discussion_questions_order ON public.part3_discussion_questions(question_order);