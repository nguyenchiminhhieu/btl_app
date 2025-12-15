// Service for IELTS Speaking Part 1
import type {
    AssessmentResult,
    Part1SessionData,
    Part1TopicWithQuestions,
    UserPracticeSession
} from './part1-types';
import { supabase } from './supabase-config';

/**
 * Lấy random 3 topics với 3 questions mỗi topic (tổng 9 questions)
 */
export async function getRandomPart1Topics(): Promise<Part1SessionData> {
  try {
    // Bước 1: Lấy tất cả topics
    const { data: allTopics, error: topicsError } = await supabase
      .from('part1_topics')
      .select('*');

    if (topicsError) throw topicsError;
    if (!allTopics || allTopics.length < 3) {
      throw new Error('Không đủ topics trong database');
    }

    // Bước 2: Random 3 topics
    const shuffled = [...allTopics].sort(() => Math.random() - 0.5);
    const selectedTopics = shuffled.slice(0, 3);

    // Bước 3: Lấy questions cho 3 topics đã chọn
    const topicsWithQuestions: Part1TopicWithQuestions[] = [];

    for (const topic of selectedTopics) {
      const { data: questions, error: questionsError } = await supabase
        .from('part1_questions')
        .select('*')
        .eq('topic_id', topic.id)
        .order('question_order', { ascending: true });

      if (questionsError) throw questionsError;
      
      if (!questions || questions.length !== 3) {
        throw new Error(`Topic "${topic.topic_name}" không có đủ 3 câu hỏi`);
      }

      topicsWithQuestions.push({
        ...topic,
        questions,
      });
    }

    return {
      topics: topicsWithQuestions,
      totalQuestions: 9,
    };
  } catch (error) {
    console.error('Error fetching random Part 1 topics:', error);
    throw error;
  }
}

/**
 * Lưu kết quả practice session vào database
 */
export async function savePracticeSession(
  session: Omit<UserPracticeSession, 'id' | 'created_at'>
): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('user_practice_sessions')
      .insert(session)
      .select('id')
      .single();

    if (error) throw error;
    
    return data.id;
  } catch (error) {
    console.error('Error saving practice session:', error);
    throw error;
  }
}

/**
 * Lấy lịch sử practice sessions của user
 */
export async function getUserPracticeSessions(
  userId: string,
  partType?: 1 | 2,
  limit: number = 20
): Promise<UserPracticeSession[]> {
  try {
    let query = supabase
      .from('user_practice_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (partType) {
      query = query.eq('part_type', partType);
    }

    const { data, error } = await query;

    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching user practice sessions:', error);
    throw error;
  }
}

/**
 * Call Node.js backend để chấm điểm với Azure + OpenAI
 * Backend xử lý: m4a → WAV conversion, Azure pronunciation, OpenAI content
 */
export async function assessSpeaking(params: {
  audioUri: string;
  questionId: string;
  topicId: string;
  questionText: string;
  part: 1 | 2;
}): Promise<AssessmentResult> {
  try {
    // Get backend URL from environment variable
    const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://192.168.1.221:3000';
    
    console.log('🔗 Backend URL:', BACKEND_URL);
    
    // Tạo FormData với format đúng cho React Native
    const formData = new FormData();
    
    // React Native FormData: m4a from expo-av
    formData.append('audioFile', {
      uri: params.audioUri,
      type: 'audio/m4a',
      name: 'recording.m4a',
    } as any);
    
    formData.append('questionText', params.questionText);
    formData.append('questionId', params.questionId);
    formData.append('topicId', params.topicId);

    console.log(`Calling Node.js backend: ${BACKEND_URL}/api/assess-speaking`);

    // Call Node.js backend
    const response = await fetch(`${BACKEND_URL}/api/assess-speaking`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
        // Don't set Content-Type - FormData will set it with boundary
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error response:', errorText);
      throw new Error(`Backend returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      console.error('Assessment failed:', data.error);
      throw new Error(data.error || 'Assessment failed');
    }

    return data.data;
  } catch (error) {
    console.error('Error assessing speaking:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error;
  }
}

/**
 * Batch assess multiple recordings
 * Dùng cho Part 1 khi cần chấm nhiều câu cùng lúc
 */
export async function batchAssessSpeaking(
  recordings: Array<{
    audioUri: string;
    questionId: string;
    topicId: string;
    questionText: string;
  }>
): Promise<AssessmentResult[]> {
  try {
    // Chấm điểm tuần tự (có thể optimize bằng Promise.all sau)
    const results: AssessmentResult[] = [];

    for (const recording of recordings) {
      const result = await assessSpeaking({
        ...recording,
        part: 1,
      });
      results.push(result);
    }

    return results;
  } catch (error) {
    console.error('Error batch assessing speaking:', error);
    throw error;
  }
}
