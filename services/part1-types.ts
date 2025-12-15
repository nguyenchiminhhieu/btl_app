// Types for IELTS Speaking Part 1

export interface Part1Topic {
  id: string;
  topic_name: string;
  category: string;
  created_at?: string;
}

export interface Part1Question {
  id: string;
  topic_id: string;
  question_text: string;
  question_order: 1 | 2 | 3; // Chỉ 1, 2, 3
  question_type: 'description' | 'preference' | 'frequency' | 'like_dislike' | 'future';
  created_at?: string;
}

export interface Part1TopicWithQuestions extends Part1Topic {
  questions: Part1Question[];
}

export interface Part1SessionData {
  topics: Part1TopicWithQuestions[]; // 3 topics
  totalQuestions: number; // Always 9
}

export interface PronunciationResult {
  overallScore: number; // 0-100
  accuracyScore: number;
  fluencyScore: number;
  completenessScore: number;
  prosodyScore: number;
  feedback?: string;
}

export interface ContentResult {
  bandScore: number; // 0-9 (average of 4 criteria)
  fluencyCoherence: number;
  lexicalResource: number;
  grammaticalRange: number;
  pronunciation: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  detailedAnalysis?: {
    wordCount: number;
    answerRelevance: string;
    keyVocabulary: string[];
    grammarIssues: string[];
    pronunciationIssues: string[];
  };
}

export interface AssessmentResult {
  questionId?: string;
  topicId?: string;
  transcript: string;
  
  // Pronunciation scores from Azure
  pronunciation: {
    overall: number;
    accuracy: number;
    fluency: number;
    completeness: number;
    prosody: number;
  };
  
  // Word-level details
  words?: Array<{
    word: string;
    accuracyScore: number;
    errorType?: string;
  }>;
  
  // Content scores from OpenAI
  content: ContentResult;
  
  // Feedback
  feedback: string;
  strengths: string[];
  improvements: string[];
  
  // Overall band
  overallBand: number;
}

export interface UserPracticeSession {
  id?: string;
  user_id?: string;
  part_type: 1 | 2; // 1 = Part 1, 2 = Part 2
  topic_id?: string;
  question_id?: string;
  audio_url?: string;
  transcript?: string;
  pronunciation_score?: number;
  content_score?: number;
  detailed_feedback?: any; // JSONB
  created_at?: string;
}

export interface Part1Answer {
  questionId: string;
  audioBlob?: Blob;
  audioUri?: string;
  result?: AssessmentResult;
  isProcessing?: boolean;
}

export interface Part1SessionState {
  sessionData: Part1SessionData | null;
  currentTopicIndex: number; // 0, 1, 2
  currentQuestionIndex: number; // 0, 1, 2
  answers: Part1Answer[]; // 9 answers
  isCompleted: boolean;
}
