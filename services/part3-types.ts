/**
 * Part 3 Types - Simple conversation types
 */

export interface Part3Topic {
  id: string;
  topic_name: string;
  main_question: string;
  sub_questions: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  text?: string;
  audioBase64?: string;
  timestamp: number;
}
