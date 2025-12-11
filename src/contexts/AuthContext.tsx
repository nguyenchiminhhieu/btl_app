import { authService, User } from '@/src/shared/firebase';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthContext: Setting up auth state listener');
    
    // Set timeout to ensure loading doesn't stay true forever
    const timeout = setTimeout(() => {
      console.log('AuthContext: Force setting loading to false after timeout');
      setLoading(false);
    }, 3000);
    
    const unsubscribe = authService.onAuthStateChange((user: User | null) => {
      console.log('AuthContext: Auth state changed:', user ? 'User logged in' : 'No user');
      clearTimeout(timeout); // Clear timeout if auth state changes normally
      setUser(user);
      setLoading(false);
    });

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  const signIn = async (username: string, password: string) => {
    console.log('AuthContext: SignIn attempt with Firebase auth');
    try {
      // Chuyển đổi username thành email format
      const email = `${username.trim()}@app.local`;
      await authService.signIn(email, password);
    } catch (error) {
      console.error('AuthContext: SignIn error:', error);
      throw error;
    }
  };

  const signUp = async (username: string, password: string) => {
    console.log('AuthContext: SignUp attempt with Firebase auth');
    try {
      // Chuyển đổi username thành email format
      const email = `${username.trim()}@app.local`;
      await authService.signUp(email, password, username.trim());
    } catch (error) {
      console.error('AuthContext: SignUp error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook để lấy username từ email
export function useUsername(): string | null {
  const { user } = useAuth();
  if (!user?.email) return null;
  
  // Lấy phần trước @ từ email để hiển thị username
  return user.email.split('@')[0];
}