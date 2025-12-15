// Types for IELTS Speaking Part 2
import type { AssessmentResult } from './types';

export interface Part2Topic {
  id: string;
  title: string;
  description?: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  category: 'people' | 'places' | 'objects' | 'events' | 'experiences';
  created_at?: string;
  updated_at?: string;
}

export interface Part2CueCard {
  id: string;
  topic_id: string;
  main_prompt: string;
  bullet_points: string[];
  follow_up_question: string;
  preparation_time: number; // seconds (default: 60)
  speaking_time_min: number; // minimum seconds (default: 60)
  speaking_time_max: number; // maximum seconds (default: 120)
  created_at?: string;
}

export interface Part2TopicWithCueCard extends Part2Topic {
  cue_card: Part2CueCard;
}

export interface Part2Category {
  name: string;
  description: string;
  icon?: string;
  topics: Part2Topic[];
}

export interface Part2SessionData {
  selectedTopic: Part2TopicWithCueCard;
  preparationNotes?: string;
  recordingStartTime?: Date;
  recordingEndTime?: Date;
  audioUri?: string;
}

export interface Part2Answer {
  id?: string;
  user_id?: string;
  topic_id: string;
  cue_card_id: string;
  audio_url: string;
  audio_duration?: number; // seconds
  transcript?: string;
  preparation_notes?: string;
  assessment_result?: AssessmentResult;
  created_at?: string;
  isProcessing?: boolean;
}

export interface Part2PreparationTimer {
  totalTime: number; // 60 seconds
  remainingTime: number;
  isActive: boolean;
  isCompleted: boolean;
}

export interface Part2RecordingTimer {
  minTime: number; // 60 seconds
  maxTime: number; // 120 seconds  
  currentTime: number;
  isActive: boolean;
  hasReachedMinimum: boolean;
  hasExceededMaximum: boolean;
}

// Part 2 Assessment Types (extends from Part 1)
export interface Part2AssessmentCriteria {
  // Same as Part 1 but with Part 2 specific focus
  fluencyCoherence: {
    score: number; // 0-9
    feedback: string;
    strengths: string[];
    improvements: string[];
    // Part 2 specific criteria
    sustainedSpeech: boolean; // Can speak for 1-2 minutes
    discourseMarkers: string[]; // Transitional phrases used
    coherentStructure: boolean; // Follows cue card structure
  };
  lexicalResource: {
    score: number; // 0-9
    feedback: string;
    strengths: string[];
    improvements: string[];
    // Part 2 specific
    topicSpecificVocabulary: string[];
    paraphrasing: boolean;
    vocabularyRange: 'limited' | 'adequate' | 'wide' | 'extensive';
  };
  grammaticalRange: {
    score: number; // 0-9
    feedback: string;
    strengths: string[];
    improvements: string[];
    // Part 2 specific
    complexStructures: boolean; // Uses complex sentences for extended speech
    accuracyInFlow: boolean; // Maintains accuracy during fluent speech
  };
  pronunciation: {
    overall: number; // 0-100 (Azure Speech)
    accuracy: number;
    fluency: number;
    completeness: number;
    prosody: number;
    feedback?: string;
  };
}

export interface Part2AssessmentResult extends AssessmentResult {
  // Add Part 2 specific assessment data
  part2Criteria?: Part2AssessmentCriteria;
  speechDuration: number; // seconds
  preparationEffectiveness?: {
    notesUsed: boolean;
    structureFollowed: boolean;
    timeManagement: 'excellent' | 'good' | 'fair' | 'poor';
  };
  cueCardAdherence?: {
    bulletPointsCovered: number; // out of total bullet points
    followUpAnswered: boolean;
    relevance: number; // 0-100
  };
}