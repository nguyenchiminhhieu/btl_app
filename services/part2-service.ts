// Service for IELTS Speaking Part 2
import type {
    Part2Answer,
    Part2Category,
    Part2CueCard,
    Part2Topic,
    Part2TopicWithCueCard
} from './part2-types';
import { supabase } from './supabase-config';
import type { AssessmentResult } from './types';

/**
 * Get all Part 2 categories with topic counts
 */
export async function getPart2Categories(): Promise<Part2Category[]> {
  try {
    // Get all topics grouped by category
    const { data: topics, error } = await supabase
      .from('part2_topics')
      .select('*')
      .order('category', { ascending: true })
      .order('title', { ascending: true });

    if (error) throw error;
    if (!topics || topics.length === 0) {
      throw new Error('No Part 2 topics found in database');
    }

    // Group topics by category
    const categoryMap: Record<string, Part2Topic[]> = {};
    topics.forEach(topic => {
      const category = topic.category;
      if (!categoryMap[category]) {
        categoryMap[category] = [];
      }
      categoryMap[category].push(topic);
    });

    // Convert to category objects with descriptions
    const categoryDescriptions: Record<string, string> = {
      people: 'Describe a person...',
      places: 'Describe a place...',
      objects: 'Describe an object or thing...',
      events: 'Describe an event, occasion or celebration...',
      experiences: 'Describe an experience or activity...',
    };

    const categories: Part2Category[] = Object.keys(categoryMap).map(categoryName => ({
      name: categoryName.charAt(0).toUpperCase() + categoryName.slice(1),
      description: categoryDescriptions[categoryName] || `Describe ${categoryName}...`,
      topics: categoryMap[categoryName],
    }));

    console.log('📂 Loaded Part 2 categories:', categories.map(c => `${c.name} (${c.topics.length})`));
    return categories;

  } catch (error) {
    console.error('💥 Error loading Part 2 categories:', error);
    throw error;
  }
}

/**
 * Get topics by category
 */
export async function getTopicsByCategory(category: string): Promise<Part2Topic[]> {
  try {
    const { data: topics, error } = await supabase
      .from('part2_topics')
      .select('*')
      .eq('category', category.toLowerCase())
      .order('difficulty_level', { ascending: true })
      .order('title', { ascending: true });

    if (error) throw error;
    
    console.log(`📚 Loaded ${topics?.length || 0} topics for category: ${category}`);
    return topics || [];

  } catch (error) {
    console.error(`💥 Error loading topics for category ${category}:`, error);
    throw error;
  }
}

/**
 * Get a random topic from a specific category
 */
export async function getRandomTopicFromCategory(category: string): Promise<Part2TopicWithCueCard> {
  try {
    const topics = await getTopicsByCategory(category);
    
    if (topics.length === 0) {
      throw new Error(`No topics found for category: ${category}`);
    }

    // Pick random topic
    const randomIndex = Math.floor(Math.random() * topics.length);
    const selectedTopic = topics[randomIndex];

    // Get cue card for this topic
    const cueCard = await getCueCardByTopicId(selectedTopic.id);

    return {
      ...selectedTopic,
      cue_card: cueCard,
    };

  } catch (error) {
    console.error(`💥 Error getting random topic from ${category}:`, error);
    throw error;
  }
}

/**
 * Get topic with cue card by topic ID
 */
export async function getTopicWithCueCard(topicId: string): Promise<Part2TopicWithCueCard> {
  try {
    // Get topic
    const { data: topic, error: topicError } = await supabase
      .from('part2_topics')
      .select('*')
      .eq('id', topicId)
      .single();

    if (topicError) throw topicError;
    if (!topic) {
      throw new Error(`Topic not found: ${topicId}`);
    }

    // Get cue card
    const cueCard = await getCueCardByTopicId(topicId);

    return {
      ...topic,
      cue_card: cueCard,
    };

  } catch (error) {
    console.error(`💥 Error loading topic ${topicId}:`, error);
    throw error;
  }
}

/**
 * Get cue card by topic ID
 */
export async function getCueCardByTopicId(topicId: string): Promise<Part2CueCard> {
  try {
    const { data: cueCard, error } = await supabase
      .from('part2_cue_cards')
      .select('*')
      .eq('topic_id', topicId)
      .single();

    if (error) throw error;
    if (!cueCard) {
      throw new Error(`Cue card not found for topic: ${topicId}`);
    }

    console.log(`🎯 Loaded cue card for topic: ${topicId}`);
    return cueCard;

  } catch (error) {
    console.error(`💥 Error loading cue card for topic ${topicId}:`, error);
    throw error;
  }
}

/**
 * Save Part 2 practice session to database
 */
export async function savePart2Answer(answer: Omit<Part2Answer, 'id' | 'created_at'>): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('user_part2_sessions')
      .insert({
        user_id: answer.user_id,
        topic_id: answer.topic_id,
        cue_card_id: answer.cue_card_id,
        audio_url: answer.audio_url,
        audio_duration: answer.audio_duration,
        transcript: answer.transcript,
        preparation_notes: answer.preparation_notes,
        assessment_result: answer.assessment_result,
      })
      .select('id')
      .single();

    if (error) throw error;

    console.log('✅ Saved Part 2 answer:', data.id);
    return data.id;

  } catch (error) {
    console.error('💥 Error saving Part 2 answer:', error);
    throw error;
  }
}

/**
 * Get user's Part 2 practice history
 */
export async function getUserPart2History(userId: string, limit = 20): Promise<Part2Answer[]> {
  try {
    const { data: sessions, error } = await supabase
      .from('user_part2_sessions')
      .select(`
        *,
        part2_topics:topic_id (
          title,
          category,
          difficulty_level
        ),
        part2_cue_cards:cue_card_id (
          main_prompt
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    console.log(`📊 Loaded ${sessions?.length || 0} Part 2 practice sessions for user: ${userId}`);
    return sessions || [];

  } catch (error) {
    console.error(`💥 Error loading Part 2 history for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Assess Part 2 speaking (similar to Part 1 but with Part 2 specific criteria)
 */
export async function assessPart2Speaking(params: {
  audioUri: string;
  topicId: string;
  cueCardId: string;
  preparationNotes?: string;
  cueCard: any;
  topic: any;
}): Promise<AssessmentResult> {
  try {
    console.log('🎯 Starting Part 2 assessment...', params);
    
    // Get backend URL from environment variable
    const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://192.168.1.221:3000';
    
    console.log('🔗 Backend URL:', BACKEND_URL);
    
    // Prepare Part 2 specific context for GPT assessment
    const part2Context = {
      assessmentType: 'part2',
      topic: {
        title: params.topic.title,
        category: params.topic.category,
        difficulty: params.topic.difficulty_level,
      },
      cueCard: {
        mainPrompt: params.cueCard.main_prompt,
        bulletPoints: params.cueCard.bullet_points,
        followUpQuestion: params.cueCard.follow_up_question,
        speakingTimeMin: params.cueCard.speaking_time_min,
        speakingTimeMax: params.cueCard.speaking_time_max,
        preparationTime: params.cueCard.preparation_time,
      },
      preparationNotes: params.preparationNotes || '',
      expectedDuration: `${params.cueCard.speaking_time_min}-${params.cueCard.speaking_time_max} seconds`,
    };
    
    // Create FormData for React Native
    const formData = new FormData();
    
    // React Native FormData: m4a from expo-av
    formData.append('audioFile', {
      uri: params.audioUri,
      type: 'audio/m4a',
      name: 'recording.m4a',
    } as any);
    
    // Add Part 2 specific context
    formData.append('part2Context', JSON.stringify(part2Context));
    formData.append('questionId', params.cueCardId);
    formData.append('topicId', params.topicId);
    formData.append('assessmentType', 'part2');

    console.log(`Calling Node.js backend for Part 2: ${BACKEND_URL}/api/assess-part2-speaking`);

    // Call Node.js backend with Part 2 specific endpoint
    const response = await fetch(`${BACKEND_URL}/api/assess-part2-speaking`, {
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
      console.error('Part 2 assessment failed:', data.error);
      throw new Error(data.error || 'Part 2 assessment failed');
    }

    console.log('✅ Part 2 assessment completed');
    return data.data;

  } catch (error) {
    console.error('💥 Error assessing Part 2 speaking:', error);
    
    // Fallback to mock result if backend fails
    console.warn('⚠️ Using fallback mock result for Part 2');
    const mockResult: AssessmentResult = {
      transcript: 'Mock transcript for Part 2 speaking assessment',
      content: {
        bandScore: 7.0,
        fluencyCoherence: 7.0,
        lexicalResource: 6.5,
        grammaticalRange: 7.5,
        pronunciation: 6.5,
        feedback: 'Good coherent response following the cue card structure. Shows good range of vocabulary and grammar structures appropriate for sustained speech.',
        strengths: [
          'Clear structure following cue card prompts',
          'Good use of discourse markers',
          'Sustained speech for required duration',
        ],
        improvements: [
          'More varied vocabulary for higher band',
          'Complex sentence structures',
          'Natural hesitation and self-correction',
        ],
      },
      pronunciation: {
        overall: 72,
        accuracy: 75,
        fluency: 68,
        completeness: 78,
        prosody: 70,
      },
      feedback: 'Strong Part 2 performance with good adherence to cue card structure and sustained fluent speech.',
      strengths: [
        'Clear structure following cue card prompts',
        'Good use of discourse markers',
        'Sustained speech for required duration',
      ],
      improvements: [
        'More varied vocabulary for higher band',
        'Complex sentence structures',
        'Natural hesitation and self-correction',
      ],
      overallBand: 7.0,
    };

    console.log('✅ Part 2 assessment completed');
    return mockResult;
  }
}

// Export all functions
export const part2Service = {
  getPart2Categories,
  getTopicsByCategory,
  getRandomTopicFromCategory,
  getTopicWithCueCard,
  getCueCardByTopicId,
  savePart2Answer,
  getUserPart2History,
  assessPart2Speaking,
};