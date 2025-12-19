/**
 * Part 3 Types - Simple conversation types
 */

export interface Part3Topic {
  id: string;
  topic_name: string;
  main_question: string;
  sub_questions: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'easy' | 'medium' | 'hard'; // Support both database and legacy formats
  category?: string;
}

// Database types for Supabase responses
export interface Part3TopicDB {
  id: string;
  topic_name: string;
  main_question: string;
  category: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  created_at: string;
  updated_at: string;
}

export interface Part3DiscussionQuestionDB {
  id: string;
  topic_id: string;
  question_text: string;
  question_order: number;
  question_type: string;
  created_at: string;
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  text?: string;
  audioBase64?: string;
  timestamp: number;
}
