/**
 * SIMPLE AuthContext - Để debug vòng lặp vô hạn
 */

import React, { createContext, ReactNode, useContext, useState } from 'react';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(false); // Set to false to avoid loading state

  const signIn = async (email: string, password: string) => {
    console.log('Simple AuthContext: SignIn');
    // Mock successful login
    setUser({ email, displayName: email.split('@')[0] });
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    console.log('Simple AuthContext: SignUp');
    // Mock successful signup
    setUser({ email, displayName: displayName || email.split('@')[0] });
  };

  const signOut = async () => {
    console.log('Simple AuthContext: SignOut');
    setUser(null);
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

export function useUsername(): string | null {
  const { user } = useAuth();
  if (!user?.email) return null;
  return user.email.split('@')[0];
}