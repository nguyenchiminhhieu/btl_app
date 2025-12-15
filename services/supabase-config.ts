/**
 * Supabase Configuration File
 * 
 * File này chứa cấu hình và khởi tạo Supabase client cho ứng dụng.
 * Supabase là nền tảng Backend-as-a-Service cung cấp:
 * - Database (PostgreSQL)
 * - Authentication
 * - Storage
 * - Real-time subscriptions
 * 
 * Lợi ích của Supabase:
 * - Database mạnh mẽ (PostgreSQL)
 * - Authentication tích hợp sẵn
 * - API tự động từ database
 * - Real-time updates
 * - Hosting miễn phí
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import 'react-native-url-polyfill/auto';

/**
 * Lấy config từ environment variables
 * 
 * SUPABASE_URL: URL của project Supabase
 * SUPABASE_KEY: Anon public key (API key công khai)
 * 
 * Các key này được lưu trong file .env và được load
 * thông qua expo-constants
 */
const supabaseUrl = Constants.expoConfig?.extra?.SUPABASE_URL || 
                    process.env.SUPABASE_URL || 
                    'https://wbbnrgchnokxzgjpifrt.supabase.co';

const supabaseKey = Constants.expoConfig?.extra?.SUPABASE_KEY || 
                    process.env.SUPABASE_KEY || '';

// Debug logging
console.log('Supabase Config:');
console.log('  URL:', supabaseUrl);
console.log('  Key exists:', !!supabaseKey);
console.log('  Key length:', supabaseKey?.length || 0);

if (!supabaseKey) {
  console.error('❌ SUPABASE_KEY không tìm thấy trong environment variables');
  console.error('   Kiểm tra file .env và app.json');
} else {
  console.log('✅ Supabase config loaded successfully');
}

/**
 * Khởi tạo Supabase Client
 * 
 * createClient() tạo instance để giao tiếp với Supabase
 * 
 * Options:
 * - auth.storage: Sử dụng AsyncStorage để lưu session
 * - auth.autoRefreshToken: Tự động refresh token khi hết hạn
 * - auth.persistSession: Lưu session để user không cần đăng nhập lại
 * - auth.detectSessionInUrl: Phát hiện session từ URL (cho OAuth)
 */
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Tắt cho mobile app
  },
});

/**
 * Database Types
 * 
 * Định nghĩa các types cho database tables
 * Giúp TypeScript kiểm tra type khi làm việc với database
 */
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          photo_url: string | null;
          level: 'beginner' | 'intermediate' | 'advanced';
          streak: number;
          total_points: number;
          language: string;
          difficulty: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      lessons: {
        Row: {
          id: string;
          title: string;
          description: string;
          level: string;
          category: string;
          duration: number;
          points: number;
          content: any;
          order_index: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['lessons']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['lessons']['Insert']>;
      };
      user_progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          status: 'not_started' | 'in_progress' | 'completed';
          score: number;
          time_spent: number;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_progress']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['user_progress']['Insert']>;
      };
    };
    Views: {};
    Functions: {};
  };
}

// Export typed supabase client
export type SupabaseClient = ReturnType<typeof createClient<Database>>;
