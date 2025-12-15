/**
 * Services với Supabase
 * 
 * File này chứa tất cả các service classes để tương tác với database:
 * - UserService: Quản lý users
 * - LessonService: Quản lý lessons
 * - ProgressService: Quản lý user progress
 * - VocabularyService: Quản lý vocabulary
 * - UserVocabularyService: Quản lý user vocabulary learning
 */

import { supabase } from './supabase-config';
import DatabaseService from './supabase-database';

// User profile interface
export interface UserProfile {
  id?: string;
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  streak: number;
  totalPoints: number;
  language: string;
  difficulty: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Lesson interface
export interface Lesson {
  id?: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  content: any;
  duration: number;
  points: number;
  order_index: number;
  is_active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
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
  user_id: string;
  lesson_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  score: number;
  time_spent: number;
  completed_at?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Word/Vocabulary interface
export interface Word {
  id?: string;
  word: string;
  pronunciation: string;
  definition: string;
  part_of_speech: string;
  examples: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
  frequency: number;
  audio_url?: string;
  image_url?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// User vocabulary interface
export interface UserVocabulary {
  id?: string;
  user_id: string;
  word_id: string;
  status: 'learning' | 'familiar' | 'mastered';
  correct_answers: number;
  total_attempts: number;
  last_reviewed_at?: Date;
  next_review_at?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * UserService - Quản lý users
 */
export class UserService extends DatabaseService {
  constructor() {
    super('users');
  }

  async createUserProfile(profile: Omit<UserProfile, 'id'>): Promise<string> {
    return this.create({
      id: profile.uid, // Sử dụng auth uid làm id
      email: profile.email,
      display_name: profile.displayName,
      photo_url: profile.photoURL,
      level: profile.level,
      streak: profile.streak || 0,
      total_points: profile.totalPoints || 0,
      language: profile.language || 'vi',
      difficulty: profile.difficulty || profile.level,
    });
  }

  async getUserByUid(uid: string): Promise<UserProfile | null> {
    const user = await this.getById(uid);
    if (!user) return null;

    return {
      id: user.id,
      uid: user.id,
      email: user.email,
      displayName: user.display_name,
      photoURL: user.photo_url,
      level: user.level,
      streak: user.streak,
      totalPoints: user.total_points,
      language: user.language,
      difficulty: user.difficulty,
      createdAt: new Date(user.created_at),
      updatedAt: new Date(user.updated_at),
    };
  }

  async updateUserStreak(userId: string, streak: number): Promise<void> {
    await this.update(userId, { streak });
  }

  async addPoints(userId: string, points: number): Promise<void> {
    const user = await this.getById(userId);
    if (user) {
      await this.update(userId, { 
        total_points: user.total_points + points 
      });
    }
  }

  async getUserStats(userId: string): Promise<any> {
    const { data, error } = await supabase
      .rpc('get_user_stats', { user_id_param: userId });

    if (error) throw error;
    return data;
  }
}

/**
 * LessonService - Quản lý lessons
 */
export class LessonService extends DatabaseService {
  constructor() {
    super('lessons');
  }

  async getLessonsByLevel(level: string): Promise<Lesson[]> {
    const results = await this.queryDocuments([
      { field: 'level', operator: '==', value: level },
      { field: 'is_active', operator: '==', value: true }
    ], 'order_index', 'asc');

    return results.map(this.mapToLesson);
  }

  async getLessonsByCategory(category: string): Promise<Lesson[]> {
    const results = await this.queryDocuments([
      { field: 'category', operator: '==', value: category },
      { field: 'is_active', operator: '==', value: true }
    ], 'order_index', 'asc');

    return results.map(this.mapToLesson);
  }

  async searchLessons(searchTerm: string): Promise<Lesson[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .eq('is_active', true);

    if (error) throw error;
    return (data || []).map(this.mapToLesson);
  }

  private mapToLesson(data: any): Lesson {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      level: data.level,
      category: data.category,
      content: data.content,
      duration: data.duration,
      points: data.points,
      order_index: data.order_index,
      is_active: data.is_active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}

/**
 * ProgressService - Quản lý user progress
 */
export class ProgressService extends DatabaseService {
  constructor() {
    super('user_progress');
  }

  async getUserProgress(userId: string): Promise<UserProgress[]> {
    const results = await this.queryDocuments([
      { field: 'user_id', operator: '==', value: userId }
    ], 'updated_at', 'desc');

    return results.map(this.mapToProgress);
  }

  async getLessonProgress(userId: string, lessonId: string): Promise<UserProgress | null> {
    const progress = await this.queryDocuments([
      { field: 'user_id', operator: '==', value: userId },
      { field: 'lesson_id', operator: '==', value: lessonId }
    ]);

    return progress.length > 0 ? this.mapToProgress(progress[0]) : null;
  }

  async updateProgress(
    userId: string, 
    lessonId: string, 
    progressData: Partial<UserProgress>
  ): Promise<void> {
    const existingProgress = await this.getLessonProgress(userId, lessonId);
    
    if (existingProgress && existingProgress.id) {
      await this.update(existingProgress.id, progressData);
    } else {
      await this.create({
        user_id: userId,
        lesson_id: lessonId,
        status: 'in_progress',
        score: 0,
        time_spent: 0,
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
      time_spent: timeSpent,
      completed_at: new Date()
    });
  }

  async getCompletedLessonsCount(userId: string): Promise<number> {
    return this.count([
      { field: 'user_id', operator: '==', value: userId },
      { field: 'status', operator: '==', value: 'completed' }
    ]);
  }

  private mapToProgress(data: any): UserProgress {
    return {
      id: data.id,
      user_id: data.user_id,
      lesson_id: data.lesson_id,
      status: data.status,
      score: data.score,
      time_spent: data.time_spent,
      completed_at: data.completed_at ? new Date(data.completed_at) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}

/**
 * VocabularyService - Quản lý vocabulary
 */
export class VocabularyService extends DatabaseService {
  constructor() {
    super('vocabulary');
  }

  async getWordsByLevel(level: string): Promise<Word[]> {
    const results = await this.queryDocuments([
      { field: 'level', operator: '==', value: level }
    ], 'frequency', 'desc');

    return results.map(this.mapToWord);
  }

  async searchWords(searchTerm: string): Promise<Word[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .or(`word.ilike.%${searchTerm}%,definition.ilike.%${searchTerm}%`);

    if (error) throw error;
    return (data || []).map(this.mapToWord);
  }

  async getRandomWords(level: string, count: number = 10): Promise<Word[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('level', level)
      .limit(count * 2); // Lấy nhiều hơn để random

    if (error) throw error;
    
    const words = (data || []).map(this.mapToWord);
    const shuffled = words.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  private mapToWord(data: any): Word {
    return {
      id: data.id,
      word: data.word,
      pronunciation: data.pronunciation,
      definition: data.definition,
      part_of_speech: data.part_of_speech,
      examples: data.examples,
      level: data.level,
      frequency: data.frequency,
      audio_url: data.audio_url,
      image_url: data.image_url,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}

/**
 * UserVocabularyService - Quản lý user vocabulary learning
 */
export class UserVocabularyService extends DatabaseService {
  constructor() {
    super('user_vocabulary');
  }

  async getUserVocabulary(userId: string): Promise<UserVocabulary[]> {
    const results = await this.queryDocuments([
      { field: 'user_id', operator: '==', value: userId }
    ], 'last_reviewed_at', 'desc');

    return results.map(this.mapToUserVocab);
  }

  async addWordToUserVocabulary(
    userId: string, 
    wordId: string
  ): Promise<string> {
    const existing = await this.queryDocuments([
      { field: 'user_id', operator: '==', value: userId },
      { field: 'word_id', operator: '==', value: wordId }
    ]);

    if (existing.length > 0) {
      return existing[0].id!;
    }

    const nextReviewAt = new Date();
    nextReviewAt.setDate(nextReviewAt.getDate() + 1); // 1 day later

    return this.create({
      user_id: userId,
      word_id: wordId,
      status: 'learning',
      correct_answers: 0,
      total_attempts: 0,
      last_reviewed_at: new Date(),
      next_review_at: nextReviewAt
    });
  }

  async updateWordStatus(
    userId: string, 
    wordId: string, 
    isCorrect: boolean
  ): Promise<void> {
    const userVocab = await this.queryDocuments([
      { field: 'user_id', operator: '==', value: userId },
      { field: 'word_id', operator: '==', value: wordId }
    ]);

    if (userVocab.length > 0) {
      const vocab = userVocab[0];
      const correctAnswers = isCorrect ? vocab.correct_answers + 1 : vocab.correct_answers;
      const totalAttempts = vocab.total_attempts + 1;
      const accuracy = correctAnswers / totalAttempts;

      let status: UserVocabulary['status'] = 'learning';
      if (accuracy >= 0.8 && correctAnswers >= 3) {
        status = 'familiar';
      }
      if (accuracy >= 0.9 && correctAnswers >= 5) {
        status = 'mastered';
      }

      // Spaced repetition algorithm
      const baseInterval = 24 * 60 * 60 * 1000; // 1 day in ms
      const multiplier = isCorrect ? Math.min(accuracy * 4, 7) : 0.5;
      const nextReviewAt = new Date(Date.now() + baseInterval * multiplier);

      await this.update(vocab.id!, {
        correct_answers: correctAnswers,
        total_attempts: totalAttempts,
        status,
        last_reviewed_at: new Date(),
        next_review_at: nextReviewAt
      });
    }
  }

  async getWordsForReview(userId: string): Promise<UserVocabulary[]> {
    const now = new Date();
    const results = await this.queryDocuments([
      { field: 'user_id', operator: '==', value: userId },
      { field: 'next_review_at', operator: '<=', value: now.toISOString() }
    ], 'next_review_at', 'asc');

    return results.map(this.mapToUserVocab);
  }

  private mapToUserVocab(data: any): UserVocabulary {
    return {
      id: data.id,
      user_id: data.user_id,
      word_id: data.word_id,
      status: data.status,
      correct_answers: data.correct_answers,
      total_attempts: data.total_attempts,
      last_reviewed_at: data.last_reviewed_at ? new Date(data.last_reviewed_at) : undefined,
      next_review_at: data.next_review_at ? new Date(data.next_review_at) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}

// Export service instances
export const userService = new UserService();
export const lessonService = new LessonService();
export const progressService = new ProgressService();
export const vocabularyService = new VocabularyService();
export const userVocabularyService = new UserVocabularyService();
