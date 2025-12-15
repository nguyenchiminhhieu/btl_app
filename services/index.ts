// Supabase configuration
export { supabase } from './supabase-config';

// Database services (Supabase)
export {
  DatabaseService, default as DatabaseServiceClass
} from './supabase-database';

// Authentication service (Supabase)
export {
  AuthService,
  authService,
  type User
} from './supabase-auth';

// Application services (Supabase)
export {
  LessonService, lessonService, ProgressService, progressService,
  // Service classes
  UserService,
  // Service instances
  userService, UserVocabularyService, userVocabularyService, VocabularyService, vocabularyService, type Exercise, type Lesson,
  // Types/Interfaces
  type UserProfile, type UserProgress, type UserVocabulary, type Word
} from './supabase-services';

// Common types
export * from './types';

// IELTS Speaking Part 1 (Python Backend)
export * from './part1-service';
export * from './part1-types';

// IELTS Speaking Part 2 (Python Backend)
export * from './part2-service';
export * from './part2-types';

// Utility functions
export const dbUtils = {
  // Convert timestamp to Date
  timestampToDate: (timestamp: any): Date => {
    return timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  },
  
  // Format date for display
  formatDate: (date: Date, locale: string = 'vi-VN'): string => {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  },
  
  // Format time duration
  formatDuration: (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} phút`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 
      ? `${hours} giờ ${remainingMinutes} phút`
      : `${hours} giờ`;
  },
  
  // Calculate streak
  calculateStreak: (dates: Date[]): number => {
    if (dates.length === 0) return 0;
    
    const sortedDates = dates
      .map(date => new Date(date.getFullYear(), date.getMonth(), date.getDate()))
      .sort((a, b) => b.getTime() - a.getTime());
    
    let streak = 1;
    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // Check if the most recent date is today or yesterday
    const mostRecent = sortedDates[0];
    const daysDiff = Math.floor((todayDate.getTime() - mostRecent.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > 1) return 0; // Streak is broken
    
    // Count consecutive days
    for (let i = 1; i < sortedDates.length; i++) {
      const current = sortedDates[i];
      const previous = sortedDates[i - 1];
      const diff = Math.floor((previous.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diff === 1) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  },
  
  // Generate unique ID
  generateId: (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },
  
  // Validate email
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  // Validate password strength
  validatePassword: (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Mật khẩu phải có ít nhất 8 ký tự');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Mật khẩu phải có ít nhất 1 chữ hoa');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Mật khẩu phải có ít nhất 1 chữ thường');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Mật khẩu phải có ít nhất 1 số');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};