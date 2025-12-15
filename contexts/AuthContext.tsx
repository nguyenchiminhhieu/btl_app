/**
 * Auth Context - Quản lý trạng thái authentication cho toàn bộ app
 * 
 * Context là gì?
 * - Context giúp chia sẻ dữ liệu cho nhiều components mà KHÔNG cần truyền props
 * - Giống như "kho dữ liệu chung" mà ai cũng truy cập được
 * 
 * Tại sao cần AuthContext?
 * - Nhiều màn hình cần biết user đã đăng nhập chưa
 * - Thay vì truyền props qua 5-10 levels component
 * - Dùng Context để mọi nơi đều truy cập được trạng thái auth
 * 
 * Cách dùng:
 * 1. Wrap <AuthProvider> ở root component (App.tsx)
 * 2. Dùng useAuth() hook ở bất kỳ component nào
 * 3. Truy cập user, signIn, signOut, etc.
 */

import { authService, User } from '@/services';
import { router } from 'expo-router';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

/**
 * Interface AuthContextType - Định nghĩa cấu trúc dữ liệu trong Context
 * 
 * Mọi component dùng useAuth() sẽ nhận được object có các thuộc tính này
 */
interface AuthContextType {
  user: User | null; // Thông tin user hiện tại (null = chưa đăng nhập)
  loading: boolean; // Đang kiểm tra trạng thái auth hay không?
  signIn: (email: string, password: string) => Promise<void>; // Hàm đăng nhập
  signUp: (email: string, password: string, displayName?: string) => Promise<void>; // Hàm đăng ký
  signOut: () => Promise<void>; // Hàm đăng xuất
  isAuthenticated: boolean; // Đã đăng nhập chưa? (true/false)
}

/**
 * Tạo Context
 * 
 * createContext<Type>(default): Tạo context với kiểu dữ liệu
 * null: Giá trị mặc định ban đầu
 */
const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Props cho AuthProvider component
 * children: Các component con sẽ được wrap bởi Provider
 */
interface AuthProviderProps {
  children: ReactNode; // ReactNode = bất kỳ thứ gì render được trong React
}

/**
 * AuthProvider Component - "Người cung cấp" dữ liệu auth cho toàn app
 * 
 * Component này wrap xung quanh toàn bộ app ở App.tsx
 * Tất cả component con sẽ truy cập được dữ liệu auth
 * 
 * @param children - Các component con
 */
export function AuthProvider({ children }: AuthProviderProps) {
  /**
   * State user: Lưu thông tin user hiện tại
   * 
   * useState<Type>(initial): Hook quản lý state trong functional component
   * - user: Giá trị hiện tại
   * - setUser: Hàm để thay đổi giá trị
   * - null: Giá trị ban đầu (chưa đăng nhập)
   */
  const [user, setUser] = useState<User | null>(null);
  
  /**
   * State loading: Đang kiểm tra trạng thái auth
   * 
   * true: Hiển loading spinner
   * false: Hiển nội dung bình thường
   */
  const [loading, setLoading] = useState(true);

  /**
   * useEffect: Chạy code khi component mount (hiển lên màn hình)
   * 
   * [] (empty array): Chỉ chạy 1 lần khi component mount
   * 
   * Nhiệm vụ:
   * - Lắng nghe thay đổi trạng thái auth
   * - Cập nhật user state khi có thay đổi
   */
  useEffect(() => {
    console.log('AuthContext: Setting up auth state listener');
    
    /**
     * Timeout an toàn: Nếu sau 3s vẫn loading = true
     * → Tự động set loading = false
     * → Tránh loading mãi không dứng
     */
    const timeout = setTimeout(() => {
      console.log('AuthContext: Force setting loading to false after timeout');
      setLoading(false);
    }, 3000); // 3000ms = 3 giây
    
    /**
     * Lắng nghe thay đổi auth state
     * 
     * Mỗi khi user đăng nhập/đăng xuất:
     * - Callback này sẽ được gọi
     * - Cập nhật user state
     * - Tắt loading
     */
    const unsubscribe = authService.onAuthStateChange((user: User | null) => {
      console.log('AuthContext: Auth state changed:', user ? 'User logged in' : 'No user');
      clearTimeout(timeout); // Hủy timeout vì đã có kết quả
      setUser(user); // Cập nhật user mới
      setLoading(false); // Tắt loading
    });

    /**
     * Cleanup function: Chạy khi component unmount (biến mất)
     * 
     * Nhiệm vụ:
     * - Hủy timeout
     * - Hủy listener (ngừng lắng nghe)
     * → Tránh memory leak (rò rỉ bộ nhớ)
     */
    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []); // Empty array: Chỉ chạy 1 lần khi mount

  const signIn = async (email: string, password: string) => {
    console.log('AuthContext: SignIn attempt with Supabase auth');
    try {
      await authService.signIn(email.trim(), password);
    } catch (error) {
      console.error('AuthContext: SignIn error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    console.log('AuthContext: SignUp attempt with Supabase auth');
    try {
      await authService.signUp(email.trim(), password, displayName || email.split('@')[0]);
    } catch (error) {
      console.error('AuthContext: SignUp error:', error);
      throw error;
    }
  };


  const signOut = async () => {
    try {
      console.log('AuthContext: Signing out...');
      await authService.signOut();
      console.log('AuthContext: Sign out successful, navigating to login...');
      
      // Navigate to login after successful sign out
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('AuthContext: Sign out error:', error);
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