import * as Crypto from 'expo-crypto';
import { db } from './config';
import { UserProfile, userService } from './services';

// User type definition
export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
}

// Generate secure token
const generateToken = async (): Promise<string> => {
  const randomBytes = await Crypto.getRandomBytesAsync(32);
  return Array.from(randomBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// Hash password using SHA-256
const hashPassword = async (password: string): Promise<string> => {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password
  );
};

export class AuthService {
  private currentUser: User | null = null;
  private authStateListeners: ((user: User | null) => void)[] = [];
  private sessionToken: string | null = null;

  constructor() {
    // Restore session on startup
    this.restoreSession();
  }

  // Restore session from database
  private async restoreSession() {
    try {
      const result = db.getFirstSync<{ user_id: number; token: string; expires_at: string }>(
        'SELECT user_id, token, expires_at FROM sessions WHERE expires_at > datetime("now") ORDER BY created_at DESC LIMIT 1'
      );

      if (result) {
        const user = db.getFirstSync<User & { id: number }>(
          'SELECT id, uid, email, display_name as displayName, photo_url as photoURL FROM users WHERE id = ?',
          [result.user_id]
        );

        if (user) {
          this.currentUser = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
          };
          this.sessionToken = result.token;
          this.notifyAuthStateChange();
        }
      }
    } catch (error) {
      console.error('Error restoring session:', error);
    }
  }

  // Notify all listeners of auth state change
  private notifyAuthStateChange() {
    this.authStateListeners.forEach(listener => listener(this.currentUser));
  }

  // Get current authenticated user
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    this.authStateListeners.push(callback);
    
    // Immediately call callback with current user state
    callback(this.currentUser);
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  // Sign up with email and password
  async signUp(
    email: string, 
    password: string, 
    displayName: string,
    level: UserProfile['level'] = 'beginner'
  ): Promise<User> {
    try {
      // Check if user already exists
      const existingUser = db.getFirstSync<{ id: number }>(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (existingUser) {
        throw new Error('auth/email-already-in-use');
      }

      // Hash password
      const passwordHash = await hashPassword(password);
      
      // Generate UID
      const uid = await generateToken();

      // Insert user into database
      const result = db.runSync(
        `INSERT INTO users (uid, email, password_hash, display_name, level, language, difficulty)
         VALUES (?, ?, ?, ?, ?, 'vi', ?)`,
        [uid, email, passwordHash, displayName, level, level]
      );

      // Create user object
      const user: User = {
        uid,
        email,
        displayName,
        photoURL: null
      };

      // Create session
      const token = await generateToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

      db.runSync(
        'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)',
        [result.lastInsertRowId, token, expiresAt.toISOString()]
      );

      this.currentUser = user;
      this.sessionToken = token;
      this.notifyAuthStateChange();

      return user;
    } catch (error: any) {
      console.error('Error signing up:', error);
      throw this.handleAuthError(error);
    }
  }

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<User> {
    try {
      // Hash password
      const passwordHash = await hashPassword(password);

      // Find user
      const userRow = db.getFirstSync<{ id: number; uid: string; email: string; display_name: string; photo_url: string | null; password_hash: string }>(
        'SELECT id, uid, email, display_name, photo_url, password_hash FROM users WHERE email = ?',
        [email]
      );

      if (!userRow || userRow.password_hash !== passwordHash) {
        throw new Error('auth/wrong-password');
      }

      // Create user object
      const user: User = {
        uid: userRow.uid,
        email: userRow.email,
        displayName: userRow.display_name,
        photoURL: userRow.photo_url
      };

      // Create session
      const token = await generateToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

      db.runSync(
        'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)',
        [userRow.id, token, expiresAt.toISOString()]
      );

      this.currentUser = user;
      this.sessionToken = token;
      this.notifyAuthStateChange();

      return user;
    } catch (error: any) {
      console.error('Error signing in:', error);
      throw this.handleAuthError(error);
    }
  }

  // TODO: Google Sign-in - Will implement later with proper OAuth setup
  async signInWithGoogle(): Promise<User> {
    throw new Error('Google Sign-in not implemented yet. Please use email/password for now.');
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      if (this.sessionToken) {
        // Delete session from database
        db.runSync('DELETE FROM sessions WHERE token = ?', [this.sessionToken]);
      }

      this.currentUser = null;
      this.sessionToken = null;
      this.notifyAuthStateChange();
    } catch (error: any) {
      console.error('Error signing out:', error);
      throw this.handleAuthError(error);
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      // Check if user exists
      const user = db.getFirstSync<{ id: number }>(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (!user) {
        throw new Error('auth/user-not-found');
      }

      // TODO: Implement email sending logic
      // For now, just log that email would be sent
      console.log('Password reset email would be sent to:', email);
      // In production, integrate with email service like SendGrid, AWS SES, etc.
    } catch (error: any) {
      console.error('Error sending password reset email:', error);
      throw this.handleAuthError(error);
    }
  }

  // Update user profile
  async updateUserProfile(updates: {
    displayName?: string;
    photoURL?: string;
  }): Promise<void> {
    if (!this.currentUser) {
      throw new Error('No authenticated user');
    }

    try {
      // Build update query dynamically
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (updates.displayName !== undefined) {
        updateFields.push('display_name = ?');
        updateValues.push(updates.displayName);
        this.currentUser.displayName = updates.displayName;
      }

      if (updates.photoURL !== undefined) {
        updateFields.push('photo_url = ?');
        updateValues.push(updates.photoURL);
        this.currentUser.photoURL = updates.photoURL;
      }

      if (updateFields.length > 0) {
        updateFields.push('updated_at = CURRENT_TIMESTAMP');
        updateValues.push(this.currentUser.uid);

        db.runSync(
          `UPDATE users SET ${updateFields.join(', ')} WHERE uid = ?`,
          updateValues
        );

        this.notifyAuthStateChange();
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      throw this.handleAuthError(error);
    }
  }

  // Update password
  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    if (!this.currentUser || !this.currentUser.email) {
      throw new Error('No authenticated user');
    }

    try {
      // Verify current password
      const currentHash = await hashPassword(currentPassword);
      const user = db.getFirstSync<{ password_hash: string }>(
        'SELECT password_hash FROM users WHERE uid = ?',
        [this.currentUser.uid]
      );

      if (!user || user.password_hash !== currentHash) {
        throw new Error('auth/wrong-password');
      }

      // Update password
      const newHash = await hashPassword(newPassword);
      db.runSync(
        'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE uid = ?',
        [newHash, this.currentUser.uid]
      );
    } catch (error: any) {
      console.error('Error updating password:', error);
      throw this.handleAuthError(error);
    }
  }

  // Get user profile from Firestore
  async getUserProfile(): Promise<UserProfile | null> {
    if (!this.currentUser) {
      return null;
    }

    try {
      return await userService.getUserByUid(this.currentUser.uid);
    } catch (error: any) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  // Update user profile in Firestore
  async updateUserProfileInDB(updates: Partial<UserProfile>): Promise<void> {
    if (!this.currentUser) {
      throw new Error('No authenticated user');
    }

    try {
      const userProfile = await userService.getUserByUid(this.currentUser.uid);
      if (userProfile) {
        await userService.update(userProfile.id!, updates);
      }
    } catch (error: any) {
      console.error('Error updating user profile in database:', error);
      throw error;
    }
  }

  // Handle authentication errors
  private handleAuthError(error: any): Error {
    let message = 'An authentication error occurred';

    switch (error.code) {
      case 'auth/user-not-found':
        message = 'Không tìm thấy tài khoản với email này';
        break;
      case 'auth/wrong-password':
        message = 'Mật khẩu không chính xác';
        break;
      case 'auth/email-already-in-use':
        message = 'Email này đã được sử dụng';
        break;
      case 'auth/weak-password':
        message = 'Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn';
        break;
      case 'auth/invalid-email':
        message = 'Email không hợp lệ';
        break;
      case 'auth/user-disabled':
        message = 'Tài khoản này đã bị vô hiệu hóa';
        break;
      case 'auth/too-many-requests':
        message = 'Quá nhiều yêu cầu. Vui lòng thử lại sau';
        break;
      case 'auth/network-request-failed':
        message = 'Lỗi kết nối mạng. Vui lòng kiểm tra internet';
        break;
      case 'auth/requires-recent-login':
        message = 'Vui lòng đăng nhập lại để thực hiện hành động này';
        break;
      default:
        message = error.message || 'Đã xảy ra lỗi không xác định';
    }

    return new Error(message);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  // Get user ID
  getUserId(): string | null {
    return this.currentUser?.uid || null;
  }

  // Get user email
  getUserEmail(): string | null {
    return this.currentUser?.email || null;
  }

  // Get user display name
  getUserDisplayName(): string | null {
    return this.currentUser?.displayName || null;
  }
}

// Create and export auth service instance
export const authService = new AuthService();

// Auth service instance is ready to use

