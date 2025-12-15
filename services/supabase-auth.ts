/**
 * Authentication Service với Supabase
 * 
 * File này chứa tất cả logic liên quan đến xác thực người dùng:
 * - Đăng ký (Sign Up)
 * - Đăng nhập (Sign In)
 * - Đăng xuất (Sign Out)
 * - Quản lý session (phiên đăng nhập)
 * - OAuth (Google, Facebook, etc.)
 * 
 * Supabase Auth cung cấp:
 * - Authentication tích hợp sẵn
 * - Session management tự động
 * - OAuth providers
 * - Email verification
 * - Password reset
 */

import type { AuthError, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from './supabase-config';
import { UserProfile } from './supabase-services';

/**
 * Interface User - Định nghĩa kiểu dữ liệu của User
 * 
 * Interface này tương thích với Firebase để dễ migration
 */
export interface User {
  uid: string; // User ID duy nhất
  email: string; // Email đăng nhập
  displayName: string | null; // Tên hiển thị
  photoURL: string | null; // URL ảnh đại diện
}

/**
 * Chuyển đổi Supabase User sang User interface của app
 */
const mapSupabaseUser = (supabaseUser: SupabaseUser): User => {
  return {
    uid: supabaseUser.id,
    email: supabaseUser.email || '',
    displayName: supabaseUser.user_metadata?.display_name || null,
    photoURL: supabaseUser.user_metadata?.photo_url || null,
  };
};

/**
 * Class AuthService - Quản lý toàn bộ authentication với Supabase
 * 
 * Supabase Auth tự động xử lý:
 * - Session persistence (lưu session)
 * - Token refresh (làm mới token)
 * - Auth state management
 */
export class AuthService {
  private currentUser: User | null = null;
  private authStateListeners: ((user: User | null) => void)[] = [];

  constructor() {
    this.initAuthListener();
  }

  /**
   * Khởi tạo listener để lắng nghe thay đổi auth state
   * 
   * Supabase tự động phát hiện:
   * - User đăng nhập/đăng xuất
   * - Session hết hạn
   * - Token refresh
   */
  private initAuthListener() {
    // Lấy session hiện tại
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        this.currentUser = mapSupabaseUser(session.user);
        this.notifyAuthStateChange();
      }
    });

    // Lắng nghe thay đổi auth state
    supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      
      if (session?.user) {
        this.currentUser = mapSupabaseUser(session.user);
      } else {
        this.currentUser = null;
      }
      
      this.notifyAuthStateChange();
    });
  }

  /**
   * Thông báo cho tất cả listeners về thay đổi auth state
   */
  private notifyAuthStateChange() {
    this.authStateListeners.forEach(listener => listener(this.currentUser));
  }

  /**
   * Lấy user hiện tại
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Lắng nghe thay đổi auth state
   * 
   * @param callback - Hàm sẽ được gọi khi auth state thay đổi
   * @returns Hàm unsubscribe để hủy listener
   */
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    this.authStateListeners.push(callback);
    
    // Gọi callback ngay với user hiện tại
    callback(this.currentUser);
    
    // Trả về hàm unsubscribe
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  /**
   * Đăng ký tài khoản mới với email và password
   * 
   * @param email - Email đăng ký
   * @param password - Mật khẩu
   * @param displayName - Tên hiển thị
   * @param level - Trình độ học
   * @returns User object
   */
  async signUp(
    email: string, 
    password: string, 
    displayName: string,
    level: UserProfile['level'] = 'beginner'
  ): Promise<User> {
    try {
      // Đăng ký với Supabase Auth
      // emailRedirectTo: false để không yêu cầu xác nhận email (cho dev)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
          emailRedirectTo: undefined, // Không redirect, tự động confirm
        },
      });

      if (error) throw error;
      if (!data.user) throw new Error('Không thể tạo tài khoản');

      console.log('User created in Auth:', data.user.id);

      // Tạo user profile trong database (có thể user đã tồn tại từ lần đăng ký trước)
      const { error: insertError } = await supabase.from('users').insert({
        id: data.user.id,
        email: data.user.email!,
        display_name: displayName,
        level,
        streak: 0,
        total_points: 0,
        language: 'vi',
        difficulty: level,
      });

      // Nếu user profile đã tồn tại (duplicate key), update thay vì báo lỗi
      if (insertError) {
        if (insertError.code === '23505') {
          console.log('User profile already exists, updating...');
          const { error: updateError } = await supabase
            .from('users')
            .update({
              display_name: displayName,
              level,
            })
            .eq('id', data.user.id);
          
          if (updateError) {
            console.error('Error updating user profile:', updateError);
          }
        } else {
          console.error('Error creating user profile:', insertError);
          throw insertError;
        }
      }

      const user = mapSupabaseUser(data.user);
      this.currentUser = user;
      this.notifyAuthStateChange();

      return user;
    } catch (error: any) {
      console.error('Error signing up:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Đăng nhập với email và password
   * 
   * @param email - Email đăng nhập
   * @param password - Mật khẩu
   * @returns User object
   */
  async signIn(email: string, password: string): Promise<User> {
    try {
      console.log('🔐 Attempting sign in with email:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Supabase signIn error:', error);
        console.error('   Error name:', error.name);
        console.error('   Error message:', error.message);
        console.error('   Error status:', error.status);
        throw error;
      }
      
      if (!data.user) {
        throw new Error('Không thể đăng nhập - No user data returned');
      }

      console.log('✅ Sign in successful, user ID:', data.user.id);

      const user = mapSupabaseUser(data.user);
      this.currentUser = user;
      this.notifyAuthStateChange();

      return user;
    } catch (error: any) {
      console.error('❌ Error signing in:', error);
      console.error('   Type:', typeof error);
      console.error('   Name:', error.name);
      console.error('   Message:', error.message);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Đăng nhập với Google
   * 
   * Supabase hỗ trợ OAuth providers:
   * - Google
   * - Facebook
   * - GitHub
   * - và nhiều providers khác
   */
  async signInWithGoogle(): Promise<User> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'englishlearning://auth/callback', // Deep link cho mobile
        },
      });

      if (error) throw error;

      // OAuth sẽ redirect, user sẽ được cập nhật qua onAuthStateChange
      throw new Error('Redirecting to Google Sign In...');
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Đăng xuất
   */
  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      this.currentUser = null;
      this.notifyAuthStateChange();
    } catch (error: any) {
      console.error('Error signing out:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Gửi email reset password
   * 
   * @param email - Email cần reset password
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'englishlearning://auth/reset-password',
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Error sending password reset email:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Cập nhật thông tin user
   * 
   * @param updates - Các field cần update
   */
  async updateUserProfile(updates: {
    displayName?: string;
    photoURL?: string;
  }): Promise<void> {
    if (!this.currentUser) {
      throw new Error('No authenticated user');
    }

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          display_name: updates.displayName,
          photo_url: updates.photoURL,
        },
      });

      if (error) throw error;

      // Cập nhật trong database users table
      await supabase
        .from('users')
        .update({
          display_name: updates.displayName,
          photo_url: updates.photoURL,
        })
        .eq('id', this.currentUser.uid);

      // Cập nhật local state
      if (updates.displayName !== undefined) {
        this.currentUser.displayName = updates.displayName;
      }
      if (updates.photoURL !== undefined) {
        this.currentUser.photoURL = updates.photoURL;
      }

      this.notifyAuthStateChange();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Đổi mật khẩu
   * 
   * @param currentPassword - Mật khẩu hiện tại (không dùng với Supabase, chỉ để tương thích)
   * @param newPassword - Mật khẩu mới
   */
  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    if (!this.currentUser) {
      throw new Error('No authenticated user');
    }

    try {
      // Supabase không cần verify current password
      // Nó sẽ check qua session token
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Error updating password:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Lấy user profile từ database
   */
  async getUserProfile(): Promise<UserProfile | null> {
    if (!this.currentUser) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', this.currentUser.uid)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        uid: data.id,
        email: data.email,
        displayName: data.display_name,
        photoURL: data.photo_url,
        level: data.level,
        streak: data.streak,
        totalPoints: data.total_points,
        language: data.language,
        difficulty: data.difficulty,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
    } catch (error: any) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  /**
   * Cập nhật user profile trong database
   */
  async updateUserProfileInDB(updates: Partial<UserProfile>): Promise<void> {
    if (!this.currentUser) {
      throw new Error('No authenticated user');
    }

    try {
      const dbUpdates: any = {};
      
      if (updates.displayName !== undefined) dbUpdates.display_name = updates.displayName;
      if (updates.photoURL !== undefined) dbUpdates.photo_url = updates.photoURL;
      if (updates.level !== undefined) dbUpdates.level = updates.level;
      if (updates.streak !== undefined) dbUpdates.streak = updates.streak;
      if (updates.totalPoints !== undefined) dbUpdates.total_points = updates.totalPoints;
      if (updates.language !== undefined) dbUpdates.language = updates.language;
      if (updates.difficulty !== undefined) dbUpdates.difficulty = updates.difficulty;

      const { error } = await supabase
        .from('users')
        .update(dbUpdates)
        .eq('id', this.currentUser.uid);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error updating user profile in database:', error);
      throw error;
    }
  }

  /**
   * Xử lý lỗi authentication
   */
  private handleAuthError(error: AuthError | any): Error {
    let message = 'An authentication error occurred';

    // Xử lý network errors
    if (error.message?.includes('Network request failed') || 
        error.message?.includes('fetch failed') ||
        error.name === 'TypeError') {
      message = 'Không thể kết nối đến server. Vui lòng kiểm tra:\n' +
                '1. Kết nối Internet\n' +
                '2. Supabase URL trong config\n' +
                '3. API Key còn hiệu lực';
      return new Error(message);
    }

    // Xử lý timeout
    if (error.message?.includes('timeout')) {
      message = 'Kết nối quá chậm. Vui lòng thử lại.';
      return new Error(message);
    }

    // Xử lý Supabase error codes
    if (error.status) {
      switch (error.status) {
        case 400:
          if (error.message?.includes('User already registered')) {
            message = 'Email này đã được sử dụng';
          } else if (error.message?.includes('Invalid login credentials')) {
            message = 'Email hoặc mật khẩu không chính xác';
          } else if (error.message?.includes('Email not confirmed')) {
            message = 'Email chưa được xác nhận. Vui lòng kiểm tra email hoặc liên hệ admin.';
          } else {
            message = 'Dữ liệu không hợp lệ';
          }
          break;
        case 422:
          message = 'Email hoặc mật khẩu không hợp lệ';
          break;
        case 429:
          message = 'Quá nhiều yêu cầu. Vui lòng thử lại sau';
          break;
        default:
          message = error.message || 'Đã xảy ra lỗi không xác định';
      }
    } else {
      message = error.message || 'Đã xảy ra lỗi không xác định';
    }

    return new Error(message);
  }

  /**
   * Kiểm tra user đã đăng nhập chưa
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  /**
   * Lấy user ID
   */
  getUserId(): string | null {
    return this.currentUser?.uid || null;
  }

  /**
   * Lấy email
   */
  getUserEmail(): string | null {
    return this.currentUser?.email || null;
  }

  /**
   * Lấy display name
   */
  getUserDisplayName(): string | null {
    return this.currentUser?.displayName || null;
  }
}

// Tạo và export auth service instance
export const authService = new AuthService();
