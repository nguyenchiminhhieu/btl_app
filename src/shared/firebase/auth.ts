import {
    createUserWithEmailAndPassword,
    EmailAuthProvider,
    onAuthStateChanged,
    reauthenticateWithCredential,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
    updatePassword,
    updateProfile,
    User
} from 'firebase/auth';
import { auth } from './config';
import { UserProfile, userService } from './services';

export class AuthService {
  private currentUser: User | null = null;
  private authStateListeners: ((user: User | null) => void)[] = [];

  constructor() {
    // Listen to auth state changes
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      this.authStateListeners.forEach(listener => listener(user));
    });
  }

  // Get current authenticated user
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    this.authStateListeners.push(callback);
    
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update user profile
      await updateProfile(user, {
        displayName
      });

      // Create user profile in Firestore
      await userService.createUserProfile({
        uid: user.uid,
        email: user.email!,
        displayName,
        level,
        streak: 0,
        totalPoints: 0,
        preferences: {
          language: 'vi', // Vietnamese as default
          difficulty: level,
          notifications: true
        }
      });

      return user;
    } catch (error: any) {
      console.error('Error signing up:', error);
      throw this.handleAuthError(error);
    }
  }

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error: any) {
      console.error('Error signing in:', error);
      throw this.handleAuthError(error);
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Error signing out:', error);
      throw this.handleAuthError(error);
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
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
      await updateProfile(this.currentUser, updates);
      
      // Also update in Firestore
      const userProfile = await userService.getUserByUid(this.currentUser.uid);
      if (userProfile) {
        await userService.update(userProfile.id!, {
          displayName: updates.displayName || userProfile.displayName,
          photoURL: updates.photoURL || userProfile.photoURL
        });
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
      // Re-authenticate user first
      const credential = EmailAuthProvider.credential(
        this.currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(this.currentUser, credential);
      
      // Update password
      await updatePassword(this.currentUser, newPassword);
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

// Export auth-related types and utilities
export type { User } from 'firebase/auth';

// Helper hook for React components (if using React hooks)
export const useAuthState = () => {
  const [user, setUser] = React.useState<User | null>(authService.getCurrentUser());

  React.useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(setUser);
    return unsubscribe;
  }, []);

  return user;
};

// Add React import for the hook
import React from 'react';
