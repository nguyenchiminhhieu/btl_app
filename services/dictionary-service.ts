/**
 * Dictionary Service - Quản lý chức năng từ điển
 */

import { DictionaryApiResponse, SavedWord, WordDefinition } from './dictionary-types';
import { supabase } from './supabase-config';
import { DatabaseService } from './supabase-database';

const DICTIONARY_API_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en';

/**
 * Dictionary Service Class
 */
export class DictionaryService extends DatabaseService {
  constructor() {
    super('saved_words');
  }

  /**
   * Search từ trong API Dictionary
   */
  async searchWord(word: string): Promise<WordDefinition | null> {
    try {
      const response = await fetch(`${DICTIONARY_API_URL}/${word.toLowerCase()}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`API error: ${response.status}`);
      }

      const data: DictionaryApiResponse = await response.json();
      // API returns array, get first item
      return Array.isArray(data) ? data[0] : null;
    } catch (error) {
      console.error('Error searching word:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách từ đã lưu của user
   */
  async getSavedWords(userId: string): Promise<SavedWord[]> {
    try {
      const { data, error } = await supabase
        .from('saved_words')
        .select('*')
        .eq('user_id', userId)
        .order('saved_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting saved words:', error);
      return [];
    }
  }

  /**
   * Lưu từ mới vào database
   */
  async saveWord(
    userId: string,
    word: string,
    definition: WordDefinition
  ): Promise<SavedWord | null> {
    try {
      // Check if word already saved
      const { data: existing } = await supabase
        .from('saved_words')
        .select('id')
        .eq('user_id', userId)
        .eq('word', word.toLowerCase())
        .single();

      if (existing) {
        return null; // Word already saved
      }

      const firstMeaning = definition.meanings[0];
      const firstDefinition = firstMeaning?.definitions[0];

      const savedWord = {
        user_id: userId,
        word: word.toLowerCase(),
        definition: firstDefinition?.definition || '',
        part_of_speech: firstMeaning?.partOfSpeech || '',
        phonetic: definition.phonetic || '',
        example: firstDefinition?.example || '',
        meanings: definition.meanings,
        origin: definition.origin || '',
        saved_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('saved_words')
        .insert(savedWord)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving word:', error);
      throw error;
    }
  }

  /**
   * Xóa từ khỏi kho
   */
  async deleteWord(savedWordId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('saved_words')
        .delete()
        .eq('id', savedWordId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting word:', error);
      return false;
    }
  }

  /**
   * Check xem từ đã được lưu hay chưa
   */
  async isWordSaved(userId: string, word: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('saved_words')
        .select('id')
        .eq('user_id', userId)
        .eq('word', word.toLowerCase())
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
      return !!data;
    } catch (error) {
      console.error('Error checking saved word:', error);
      return false;
    }
  }
}

// Export singleton instance
export const dictionaryService = new DictionaryService();
