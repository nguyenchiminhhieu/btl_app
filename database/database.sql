-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.lessons (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text NOT NULL,
  level text NOT NULL CHECK (level = ANY (ARRAY['beginner'::text, 'intermediate'::text, 'advanced'::text])),
  category text NOT NULL,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  duration integer NOT NULL DEFAULT 0,
  points integer NOT NULL DEFAULT 0,
  order_index integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT lessons_pkey PRIMARY KEY (id)
);
CREATE TABLE public.part1_questions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  topic_id uuid NOT NULL,
  question_text text NOT NULL,
  question_order integer NOT NULL CHECK (question_order = ANY (ARRAY[1, 2, 3])),
  question_type character varying,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT part1_questions_pkey PRIMARY KEY (id),
  CONSTRAINT part1_questions_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.part1_topics(id)
);
CREATE TABLE public.part1_topics (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  topic_name character varying NOT NULL,
  category character varying,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT part1_topics_pkey PRIMARY KEY (id)
);
CREATE TABLE public.part2_cue_cards (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  topic_id uuid,
  main_prompt text NOT NULL,
  bullet_points ARRAY NOT NULL,
  follow_up_question text NOT NULL,
  preparation_time integer DEFAULT 60,
  speaking_time_min integer DEFAULT 60,
  speaking_time_max integer DEFAULT 120,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT part2_cue_cards_pkey PRIMARY KEY (id),
  CONSTRAINT part2_cue_cards_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.part2_topics(id)
);
CREATE TABLE public.part2_topics (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title character varying NOT NULL,
  description text,
  difficulty_level character varying DEFAULT 'intermediate'::character varying,
  category character varying NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT part2_topics_pkey PRIMARY KEY (id)
);
CREATE TABLE public.part3_discussion_questions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  topic_id uuid NOT NULL,
  question_text text NOT NULL,
  question_order integer NOT NULL,
  question_type character varying DEFAULT 'general'::character varying,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT part3_discussion_questions_pkey PRIMARY KEY (id),
  CONSTRAINT part3_discussion_questions_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.part3_topics(id)
);
CREATE TABLE public.part3_topics (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  topic_name character varying NOT NULL,
  main_question text NOT NULL,
  category character varying NOT NULL,
  difficulty_level character varying DEFAULT 'intermediate'::character varying CHECK (difficulty_level::text = ANY (ARRAY['beginner'::character varying, 'intermediate'::character varying, 'advanced'::character varying]::text[])),
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT part3_topics_pkey PRIMARY KEY (id)
);
CREATE TABLE public.saved_words (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  word character varying NOT NULL,
  phonetic character varying,
  definition text NOT NULL,
  part_of_speech character varying,
  example text,
  origin text,
  meanings jsonb NOT NULL DEFAULT '[]'::jsonb,
  saved_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT saved_words_pkey PRIMARY KEY (id),
  CONSTRAINT saved_words_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_practice_sessions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  part_type integer NOT NULL CHECK (part_type = ANY (ARRAY[1, 2])),
  topic_id uuid,
  question_id uuid,
  audio_url text,
  transcript text,
  pronunciation_score numeric,
  content_score numeric,
  detailed_feedback jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_practice_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT user_practice_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT user_practice_sessions_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.part1_topics(id),
  CONSTRAINT user_practice_sessions_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.part1_questions(id)
);
CREATE TABLE public.user_progress (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  lesson_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'not_started'::text CHECK (status = ANY (ARRAY['not_started'::text, 'in_progress'::text, 'completed'::text])),
  score integer NOT NULL DEFAULT 0,
  time_spent integer NOT NULL DEFAULT 0,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_progress_pkey PRIMARY KEY (id),
  CONSTRAINT user_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT user_progress_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id)
);
CREATE TABLE public.user_vocabulary (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  word_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'learning'::text CHECK (status = ANY (ARRAY['learning'::text, 'familiar'::text, 'mastered'::text])),
  correct_answers integer NOT NULL DEFAULT 0,
  total_attempts integer NOT NULL DEFAULT 0,
  last_reviewed_at timestamp with time zone,
  next_review_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_vocabulary_pkey PRIMARY KEY (id),
  CONSTRAINT user_vocabulary_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT user_vocabulary_word_id_fkey FOREIGN KEY (word_id) REFERENCES public.vocabulary(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL,
  email text NOT NULL UNIQUE,
  display_name text NOT NULL,
  photo_url text,
  level text NOT NULL DEFAULT 'beginner'::text CHECK (level = ANY (ARRAY['beginner'::text, 'intermediate'::text, 'advanced'::text])),
  streak integer NOT NULL DEFAULT 0,
  total_points integer NOT NULL DEFAULT 0,
  language text NOT NULL DEFAULT 'vi'::text,
  difficulty text NOT NULL DEFAULT 'beginner'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.vocabulary (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  word text NOT NULL UNIQUE,
  pronunciation text NOT NULL,
  definition text NOT NULL,
  part_of_speech text NOT NULL,
  examples ARRAY NOT NULL DEFAULT '{}'::text[],
  level text NOT NULL CHECK (level = ANY (ARRAY['beginner'::text, 'intermediate'::text, 'advanced'::text])),
  frequency integer NOT NULL DEFAULT 0,
  audio_url text,
  image_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT vocabulary_pkey PRIMARY KEY (id)
);