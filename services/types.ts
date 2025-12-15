// Common types for the English Learning App

export interface BaseDocument {
  id?: string;
  createdAt?: any;
  updatedAt?: any;
}

export type LearningLevel = 'beginner' | 'intermediate' | 'advanced';

export type LessonCategory = 'vocabulary' | 'grammar' | 'listening' | 'speaking' | 'reading';

export type ExerciseType = 'multiple-choice' | 'fill-blank' | 'matching' | 'ordering';

export type ProgressStatus = 'not-started' | 'in-progress' | 'completed';

export type VocabularyStatus = 'learning' | 'familiar' | 'mastered';

export type ContentType = 'text' | 'audio' | 'video' | 'interactive';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface DatabaseOptions {
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  startAfter?: any;
}

export interface QueryCondition {
  field: string;
  operator: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'array-contains' | 'in' | 'array-contains-any';
  value: any;
}

// Analytics and tracking types
export interface LearningSession {
  userId: string;
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  activitiesCompleted: string[];
  pointsEarned: number;
  lessonsCompleted: string[];
  wordsLearned: string[];
}

export interface UserStats {
  totalLessons: number;
  completedLessons: number;
  totalWords: number;
  masteredWords: number;
  currentStreak: number;
  longestStreak: number;
  totalTimeSpent: number;
  averageScore: number;
  weeklyProgress: number[];
}

// Notification types
export interface NotificationPreferences {
  dailyReminder: boolean;
  weeklyProgress: boolean;
  newContent: boolean;
  achievements: boolean;
  streakReminder: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: {
    type: 'streak' | 'lessons' | 'words' | 'score' | 'time';
    value: number;
  };
  points: number;
  unlockedAt?: Date;
}

// Content management types
export interface ContentMetadata {
  difficulty: LearningLevel;
  estimatedTime: number;
  prerequisites?: string[];
  objectives: string[];
  tags: string[];
}

export interface MediaContent {
  type: 'image' | 'audio' | 'video';
  url: string;
  alt?: string;
  duration?: number;
  size?: number;
}

// Error handling types
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface AppError extends Error {
  code: string;
  severity: ErrorSeverity;
  context?: any;
  timestamp: Date;
}

// Storage types
export interface FileUploadOptions {
  folder: string;
  fileName?: string;
  metadata?: Record<string, any>;
}

export interface StorageFile {
  name: string;
  url: string;
  size: number;
  contentType: string;
  uploadedAt: Date;
}

// Search and filtering types
export interface SearchOptions {
  query: string;
  filters?: {
    level?: LearningLevel;
    category?: LessonCategory;
    tags?: string[];
  };
  pagination?: PaginationOptions;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  query: string;
  filters?: any;
  suggestions?: string[];
}

// Real-time types
export interface RealtimeEvent {
  type: string;
  data: any;
  timestamp: Date;
  userId?: string;
}

export type RealtimeCallback<T> = (data: T) => void;
export type RealtimeErrorCallback = (error: Error) => void;
export type UnsubscribeFunction = () => void;

// Assessment and scoring types
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