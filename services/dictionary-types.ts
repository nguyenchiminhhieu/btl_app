/**
 * Dictionary Types - Type definitions cho Dictionary feature
 */

/**
 * Phonetic information
 */
export interface Phonetic {
  text?: string;
  audio?: string;
}

/**
 * Definition - Định nghĩa của từ
 */
export interface Definition {
  definition: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
}

/**
 * Meaning - Ý nghĩa của từ theo loại từ (noun, verb, adjective, etc.)
 */
export interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
  synonyms?: string[];
  antonyms?: string[];
}

/**
 * License information
 */
export interface License {
  name: string;
  url: string;
}

/**
 * Word definition từ API - Full word information
 */
export interface WordDefinition {
  word: string;
  phonetic?: string;
  phonetics: Phonetic[];
  origin?: string;
  meanings: Meaning[];
  license?: License;
  sourceUrls?: string[];
}

/**
 * Saved word - Từ được lưu trong kho từ điển
 */
export interface SavedWord {
  id: string;
  user_id: string;
  word: string;
  phonetic?: string;
  definition: string; // Main definition text
  part_of_speech?: string;
  example?: string;
  meanings: Meaning[]; // Full meanings data
  origin?: string;
  saved_at: string;
  updated_at?: string;
}

/**
 * Dictionary API Response - Array of word definitions
 */
export type DictionaryApiResponse = WordDefinition[];

