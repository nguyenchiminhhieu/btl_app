import { supabase } from './supabase-config';

// TypeScript interfaces
export interface TestSession {
  id: string;
  user_id: string;
  test_type: 1 | 2;
  topic_id?: string;
  topic_title: string;
  topic_category?: string;
  started_at?: string;
  completed_at: string;
  duration_seconds: number;
  overall_score?: number;
  pronunciation_score?: number;
  fluency_score?: number;
  grammar_score?: number;
  vocabulary_score?: number;
  questions_count: number;
  questions_data?: any[];
  overall_feedback?: string;
  strengths?: string[];
  improvements?: string[];
  detailed_feedback?: any;
  speaking_metrics?: any;
  created_at: string;
  updated_at: string;
}

export interface SaveTestSessionData {
  test_type: 1 | 2;
  topic_id?: string;
  topic_title: string;
  topic_category?: string;
  started_at?: string;
  duration_seconds: number;
  overall_score?: number;
  pronunciation_score?: number;
  fluency_score?: number;
  grammar_score?: number;
  vocabulary_score?: number;
  questions_count: number;
  questions_data?: any[];
  overall_feedback?: string;
  strengths?: string[];
  improvements?: string[];
  detailed_feedback?: any;
  speaking_metrics?: any;
}

export interface ChartDataPoint {
  test_date: string;
  test_type: number;
  avg_overall: number;
  avg_pronunciation: number;
  avg_fluency: number;
  avg_grammar: number;
  avg_vocabulary: number;
  test_count: number;
}

export interface TestStatistics {
  total_tests: number;
  avg_overall_score: number;
  avg_pronunciation_score: number;
  avg_fluency_score: number;
  avg_grammar_score: number;
  avg_vocabulary_score: number;
  best_overall_score: number;
  lowest_overall_score: number;
  total_practice_time: number;
  last_test_date: string;
  first_test_date: string;
}

class TestHistoryService {
  /**
   * Save a test session to database
   */
  async saveTestSession(sessionData: SaveTestSessionData): Promise<TestSession | null> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('user_test_sessions')
        .insert({
          user_id: user.user.id,
          ...sessionData,
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving test session:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to save test session:', error);
      return null;
    }
  }

  /**
   * Get user's test sessions with pagination
   */
  async getTestSessions(
    testType?: 1 | 2,
    limit = 20,
    offset = 0
  ): Promise<{ sessions: TestSession[]; total: number }> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      let query = supabase
        .from('user_test_sessions')
        .select('*', { count: 'exact' })
        .eq('user_id', user.user.id)
        .order('completed_at', { ascending: false });

      if (testType) {
        query = query.eq('test_type', testType);
      }

      const { data, error, count } = await query
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching test sessions:', error);
        throw error;
      }

      return {
        sessions: data || [],
        total: count || 0,
      };
    } catch (error) {
      console.error('Failed to fetch test sessions:', error);
      return { sessions: [], total: 0 };
    }
  }

  /**
   * Get chart data for progress visualization
   */
  async getChartData(
    testType?: 1 | 2,
    daysBack = 30
  ): Promise<ChartDataPoint[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .rpc('get_user_chart_data', {
          p_user_id: user.user.id,
          p_test_type: testType || null,
          p_days_back: daysBack,
        });

      if (error) {
        console.error('Error fetching chart data:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
      return [];
    }
  }

  /**
   * Get user's test statistics
   */
  async getTestStatistics(testType?: 1 | 2): Promise<TestStatistics[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      let query = supabase
        .from('user_test_statistics')
        .select('*')
        .eq('user_id', user.user.id);

      if (testType) {
        query = query.eq('test_type', testType);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching test statistics:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch test statistics:', error);
      return [];
    }
  }

  /**
   * Get recent test sessions for dashboard
   */
  async getRecentSessions(limit = 5): Promise<TestSession[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('user_test_sessions')
        .select('*')
        .eq('user_id', user.user.id)
        .order('completed_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching recent sessions:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch recent sessions:', error);
      return [];
    }
  }

  /**
   * Get progress data for specific metric
   */
  async getProgressData(
    metric: 'overall_score' | 'pronunciation_score' | 'fluency_score' | 'grammar_score' | 'vocabulary_score',
    testType?: 1 | 2,
    daysBack = 30
  ): Promise<Array<{ date: string; score: number; test_type: number }>> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      let query = supabase
        .from('user_test_sessions')
        .select(`completed_at, test_type, ${metric}`)
        .eq('user_id', user.user.id)
        .gte('completed_at', new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString())
        .not(metric, 'is', null)
        .order('completed_at', { ascending: true });

      if (testType) {
        query = query.eq('test_type', testType);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching progress data:', error);
        throw error;
      }

      return (data || []).map(item => ({
        date: item.completed_at,
        score: (item as any)[metric] as number,
        test_type: item.test_type,
      }));
    } catch (error) {
      console.error('Failed to fetch progress data:', error);
      return [];
    }
  }

  /**
   * Delete a test session
   */
  async deleteTestSession(sessionId: string): Promise<boolean> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('user_test_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', user.user.id);

      if (error) {
        console.error('Error deleting test session:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Failed to delete test session:', error);
      return false;
    }
  }

  /**
   * Update test session
   */
  async updateTestSession(
    sessionId: string,
    updates: Partial<SaveTestSessionData>
  ): Promise<TestSession | null> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('user_test_sessions')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId)
        .eq('user_id', user.user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating test session:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to update test session:', error);
      return null;
    }
  }
}

export const testHistoryService = new TestHistoryService();