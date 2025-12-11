import DatabaseService from './database';

// User profile interface
export interface UserProfile {
  id?: string;
  uid: string; // Firebase Auth UID
  email: string;
  displayName: string;
  photoURL?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  streak: number;
  totalPoints: number;
  preferences: {
    language: string;
    difficulty: string;
    notifications: boolean;
  };
  createdAt?: any;
  updatedAt?: any;
}

// Lesson interface
export interface Lesson {
  id?: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: 'vocabulary' | 'grammar' | 'listening' | 'speaking' | 'reading';
  content: {
    type: 'text' | 'audio' | 'video' | 'interactive';
    data: any;
  };
  exercises: Exercise[];
  duration: number; // in minutes
  points: number;
  isPublished: boolean;
  createdAt?: any;
  updatedAt?: any;
}

// Exercise interface
export interface Exercise {
  id: string;
  type: 'multiple-choice' | 'fill-blank' | 'matching' | 'ordering';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
}

// User progress interface
export interface UserProgress {
  id?: string;
  userId: string;
  lessonId: string;
  status: 'not-started' | 'in-progress' | 'completed';
  score?: number;
  timeSpent: number; // in minutes
  completedExercises: string[];
  attempts: number;
  lastAccessedAt?: any;
  completedAt?: any;
  createdAt?: any;
  updatedAt?: any;
}

// Word/Vocabulary interface
export interface Word {
  id?: string;
  word: string;
  pronunciation: string;
  definition: string;
  partOfSpeech: string;
  examples: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
  frequency: number;
  audioUrl?: string;
  imageUrl?: string;
  createdAt?: any;
  updatedAt?: any;
}

// User vocabulary interface (words learned by user)
export interface UserVocabulary {
  id?: string;
  userId: string;
  wordId: string;
  status: 'learning' | 'familiar' | 'mastered';
  correctAnswers: number;
  totalAttempts: number;
  lastReviewedAt?: any;
  nextReviewAt?: any;
  createdAt?: any;
  updatedAt?: any;
}

// Database service classes
export class UserService extends DatabaseService {
  constructor() {
    super('users');
  }

  async createUserProfile(profile: Omit<UserProfile, 'id'>): Promise<string> {
    return this.create(profile);
  }

  async getUserByUid(uid: string): Promise<UserProfile | null> {
    const users = await this.queryDocuments([
      { field: 'uid', operator: '==', value: uid }
    ]);
    return users.length > 0 ? users[0] as UserProfile : null;
  }

  async updateUserStreak(userId: string, streak: number): Promise<void> {
    await this.update(userId, { streak });
  }

  async addPoints(userId: string, points: number): Promise<void> {
    const user = await this.getById(userId) as UserProfile;
    if (user) {
      await this.update(userId, { 
        totalPoints: user.totalPoints + points 
      });
    }
  }
}

export class LessonService extends DatabaseService {
  constructor() {
    super('lessons');
  }

  async getLessonsByLevel(level: string): Promise<Lesson[]> {
    return this.queryDocuments([
      { field: 'level', operator: '==', value: level },
      { field: 'isPublished', operator: '==', value: true }
    ], 'createdAt') as Promise<Lesson[]>;
  }

  async getLessonsByCategory(category: string): Promise<Lesson[]> {
    return this.queryDocuments([
      { field: 'category', operator: '==', value: category },
      { field: 'isPublished', operator: '==', value: true }
    ], 'createdAt') as Promise<Lesson[]>;
  }

  async searchLessons(searchTerm: string): Promise<Lesson[]> {
    // Note: Firestore doesn't support full-text search natively
    // You might want to integrate with Algolia or implement client-side filtering
    const allLessons = await this.getAll() as Lesson[];
    return allLessons.filter(lesson => 
      lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lesson.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
}

export class ProgressService extends DatabaseService {
  constructor() {
    super('progress');
  }

  async getUserProgress(userId: string): Promise<UserProgress[]> {
    return this.queryDocuments([
      { field: 'userId', operator: '==', value: userId }
    ], 'lastAccessedAt') as Promise<UserProgress[]>;
  }

  async getLessonProgress(userId: string, lessonId: string): Promise<UserProgress | null> {
    const progress = await this.queryDocuments([
      { field: 'userId', operator: '==', value: userId },
      { field: 'lessonId', operator: '==', value: lessonId }
    ]);
    return progress.length > 0 ? progress[0] as UserProgress : null;
  }

  async updateProgress(
    userId: string, 
    lessonId: string, 
    progressData: Partial<UserProgress>
  ): Promise<void> {
    const existingProgress = await this.getLessonProgress(userId, lessonId);
    
    if (existingProgress) {
      await this.update(existingProgress.id!, progressData);
    } else {
      await this.create({
        userId,
        lessonId,
        status: 'in-progress',
        score: 0,
        timeSpent: 0,
        completedExercises: [],
        attempts: 1,
        ...progressData
      });
    }
  }

  async completeLesson(
    userId: string, 
    lessonId: string, 
    score: number, 
    timeSpent: number
  ): Promise<void> {
    await this.updateProgress(userId, lessonId, {
      status: 'completed',
      score,
      timeSpent,
      completedAt: new Date()
    });
  }
}

export class VocabularyService extends DatabaseService {
  constructor() {
    super('vocabulary');
  }

  async getWordsByLevel(level: string): Promise<Word[]> {
    return this.queryDocuments([
      { field: 'level', operator: '==', value: level }
    ], 'frequency', 'desc') as Promise<Word[]>;
  }

  async searchWords(searchTerm: string): Promise<Word[]> {
    const allWords = await this.getAll() as Word[];
    return allWords.filter(word => 
      word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      word.definition.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  async getRandomWords(level: string, count: number = 10): Promise<Word[]> {
    const words = await this.getWordsByLevel(level);
    const shuffled = words.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
}

export class UserVocabularyService extends DatabaseService {
  constructor() {
    super('userVocabulary');
  }

  async getUserVocabulary(userId: string): Promise<UserVocabulary[]> {
    return this.queryDocuments([
      { field: 'userId', operator: '==', value: userId }
    ], 'lastReviewedAt', 'desc') as Promise<UserVocabulary[]>;
  }

  async addWordToUserVocabulary(
    userId: string, 
    wordId: string
  ): Promise<string> {
    const existing = await this.queryDocuments([
      { field: 'userId', operator: '==', value: userId },
      { field: 'wordId', operator: '==', value: wordId }
    ]);

    if (existing.length > 0) {
      return existing[0].id!;
    }

    return this.create({
      userId,
      wordId,
      status: 'learning',
      correctAnswers: 0,
      totalAttempts: 0,
      lastReviewedAt: new Date(),
      nextReviewAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Next day
    });
  }

  async updateWordStatus(
    userId: string, 
    wordId: string, 
    isCorrect: boolean
  ): Promise<void> {
    const userVocab = await this.queryDocuments([
      { field: 'userId', operator: '==', value: userId },
      { field: 'wordId', operator: '==', value: wordId }
    ]);

    if (userVocab.length > 0) {
      const vocab = userVocab[0] as UserVocabulary;
      const correctAnswers = isCorrect ? vocab.correctAnswers + 1 : vocab.correctAnswers;
      const totalAttempts = vocab.totalAttempts + 1;
      const accuracy = correctAnswers / totalAttempts;

      let status: UserVocabulary['status'] = 'learning';
      if (accuracy >= 0.8 && correctAnswers >= 3) {
        status = 'familiar';
      }
      if (accuracy >= 0.9 && correctAnswers >= 5) {
        status = 'mastered';
      }

      // Spaced repetition: increase interval based on performance
      const baseInterval = 24 * 60 * 60 * 1000; // 1 day
      const multiplier = isCorrect ? Math.min(accuracy * 4, 7) : 0.5;
      const nextReviewAt = new Date(Date.now() + baseInterval * multiplier);

      await this.update(vocab.id!, {
        correctAnswers,
        totalAttempts,
        status,
        lastReviewedAt: new Date(),
        nextReviewAt
      });
    }
  }

  async getWordsForReview(userId: string): Promise<UserVocabulary[]> {
    const now = new Date();
    return this.queryDocuments([
      { field: 'userId', operator: '==', value: userId },
      { field: 'nextReviewAt', operator: '<=', value: now }
    ], 'nextReviewAt') as Promise<UserVocabulary[]>;
  }
}

// Create service instances
export const userService = new UserService();
export const lessonService = new LessonService();
export const progressService = new ProgressService();
export const vocabularyService = new VocabularyService();
export const userVocabularyService = new UserVocabularyService();