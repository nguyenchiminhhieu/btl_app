import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { dictionaryService, type SavedWord, type WordDefinition } from '@/services';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function DictionaryScreen() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [wordData, setWordData] = useState<WordDefinition | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savedWords, setSavedWords] = useState<SavedWord[]>([]);
  const [searchError, setSearchError] = useState('');
  const [activeTab, setActiveTab] = useState<'search' | 'saved'>('search');

  useEffect(() => {
    if (user?.uid) {
      loadSavedWords();
    }
  }, [user?.uid]);

  const loadSavedWords = async () => {
    if (!user?.uid) return;
    
    try {
      const words = await dictionaryService.getSavedWords(user.uid);
      setSavedWords(words);
    } catch (error) {
      console.error('Error loading saved words:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchError('Please enter a word to search');
      return;
    }

    setIsLoading(true);
    setSearchError('');
    setWordData(null);

    try {
      const result = await dictionaryService.searchWord(searchQuery);
      
      if (!result) {
        setSearchError(`Word "${searchQuery}" not found. Please try another word.`);
        setWordData(null);
      } else {
        setWordData(result);
        // Check if word is already saved
        if (user?.uid) {
          const saved = await dictionaryService.isWordSaved(user.uid, result.word);
          setIsSaved(saved);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('Failed to search word. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveWord = async () => {
    if (!user?.uid || !wordData) return;

    try {
      const saved = await dictionaryService.saveWord(user.uid, wordData.word, wordData);
      
      if (saved) {
        setIsSaved(true);
        setSavedWords([saved, ...savedWords]);
        Alert.alert('Success', `"${wordData.word}" has been saved!`);
      } else {
        Alert.alert('Already Saved', `"${wordData.word}" is already in your dictionary.`);
      }
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save word. Please try again.');
    }
  };

  const handleDeleteWord = async (savedWordId: string, word: string) => {
    Alert.alert('Delete Word', `Are you sure you want to remove "${word}" from your dictionary?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const success = await dictionaryService.deleteWord(savedWordId);
            if (success) {
              setSavedWords(savedWords.filter(w => w.id !== savedWordId));
              Alert.alert('Deleted', `"${word}" has been removed from your dictionary.`);
            }
          } catch (error) {
            Alert.alert('Error', 'Failed to delete word. Please try again.');
          }
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.primary.main, Colors.primary.light]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Ionicons name="book" size={32} color="#FFF" />
          <Text style={styles.headerTitle}>Dictionary</Text>
        </View>
        <Text style={styles.headerSubtitle}>Learn and save new words</Text>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'search' && styles.tabActive]}
          onPress={() => setActiveTab('search')}
        >
          <Ionicons 
            name="search" 
            size={20} 
            color={activeTab === 'search' ? Colors.primary.main : '#999'} 
          />
          <Text style={[styles.tabText, activeTab === 'search' && styles.tabTextActive]}>
            Search
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'saved' && styles.tabActive]}
          onPress={() => setActiveTab('saved')}
        >
          <Ionicons 
            name="heart" 
            size={20} 
            color={activeTab === 'saved' ? Colors.primary.main : '#999'} 
          />
          <Text style={[styles.tabText, activeTab === 'saved' && styles.tabTextActive]}>
            Saved ({savedWords.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'search' ? (
          // Search Tab
          <>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <View style={styles.searchInputWrapper}>
                <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search a word..."
                  placeholderTextColor="#999"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onSubmitEditing={handleSearch}
                />
              </View>
              <TouchableOpacity
                style={styles.searchButton}
                onPress={handleSearch}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Ionicons name="arrow-forward" size={20} color="#FFF" />
                )}
              </TouchableOpacity>
            </View>

            {/* Error Message */}
            {searchError && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={20} color="#EF4444" />
                <Text style={styles.errorText}>{searchError}</Text>
              </View>
            )}

            {/* Word Definition */}
            {wordData && (
              <View style={styles.wordContainer}>
                {/* Word Header */}
                <View style={styles.wordHeader}>
                  <View>
                    <Text style={styles.wordTitle}>{wordData.word}</Text>
                    {wordData.phonetic && (
                      <Text style={styles.phonetic}>{wordData.phonetic}</Text>
                    )}
                  </View>
                  {wordData.phonetics[0]?.audio && (
                    <TouchableOpacity style={styles.audioButton}>
                      <Ionicons name="play-circle" size={48} color={Colors.primary.main} />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Save Button */}
                <TouchableOpacity
                  style={[styles.saveButton, isSaved && styles.saveButtonSaved]}
                  onPress={handleSaveWord}
                  disabled={isSaved}
                >
                  <Ionicons 
                    name={isSaved ? 'heart' : 'heart-outline'} 
                    size={20} 
                    color={isSaved ? '#FFF' : Colors.secondary.main} 
                  />
                  <Text style={[styles.saveButtonText, isSaved && styles.saveButtonTextSaved]}>
                    {isSaved ? 'Saved' : 'Save to Dictionary'}
                  </Text>
                </TouchableOpacity>

                {/* Origin */}
                {wordData.origin && (
                  <View style={styles.originBox}>
                    <Text style={styles.originLabel}>Origin</Text>
                    <Text style={styles.originText}>{wordData.origin}</Text>
                  </View>
                )}

                {/* Meanings */}
                <View style={styles.meaningsContainer}>
                  {wordData.meanings.map((meaning: any, meaningIndex: number) => (
                    <View key={meaningIndex} style={styles.meaningCard}>
                      <View style={styles.partOfSpeechHeader}>
                        <Text style={styles.partOfSpeech}>{meaning.partOfSpeech}</Text>
                        {meaningIndex < wordData.meanings.length - 1 && (
                          <View style={styles.divider} />
                        )}
                      </View>

                      {/* Definitions */}
                      <View style={styles.definitionsSection}>
                        <Text style={styles.sectionLabel}>Definitions</Text>
                        {meaning.definitions.map((def: any, defIndex: number) => (
                          <View key={defIndex} style={styles.definitionItem}>
                            <View style={styles.bulletCircle}>
                              <Text style={styles.bullet}>•</Text>
                            </View>
                            <View style={styles.definitionContent}>
                              <Text style={styles.definitionText}>{def.definition}</Text>
                              {def.example && (
                                <Text style={styles.exampleText}>
                                  <Text style={styles.exampleLabel}>Example: </Text>
                                  "{def.example}"
                                </Text>
                              )}
                            </View>
                          </View>
                        ))}
                      </View>

                      {/* Synonyms */}
                      {meaning.synonyms && meaning.synonyms.length > 0 && (
                        <View style={styles.synonymsSection}>
                          <Text style={styles.sectionLabel}>Synonyms</Text>
                          <View style={styles.tagContainer}>
                            {meaning.synonyms.map((syn: string, synIndex: number) => (
                              <View key={synIndex} style={styles.tag}>
                                <Text style={styles.tagText}>{syn}</Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}

                      {/* Antonyms */}
                      {meaning.antonyms && meaning.antonyms.length > 0 && (
                        <View style={styles.antonymsSection}>
                          <Text style={styles.sectionLabel}>Antonyms</Text>
                          <View style={styles.tagContainer}>
                            {meaning.antonyms.map((ant: string, antIndex: number) => (
                              <View key={antIndex} style={styles.tag}>
                                <Text style={styles.tagText}>{ant}</Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Empty State */}
            {!wordData && !isLoading && !searchError && (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={64} color="#DDD" />
                <Text style={styles.emptyStateTitle}>Search for a Word</Text>
                <Text style={styles.emptyStateText}>
                  Enter any English word to view its definition, examples, and more.
                </Text>
              </View>
            )}
          </>
        ) : (
          // Saved Words Tab
          <>
            {savedWords.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="heart-outline" size={64} color="#DDD" />
                <Text style={styles.emptyStateTitle}>No Saved Words</Text>
                <Text style={styles.emptyStateText}>
                  Start searching and saving words to build your personal dictionary.
                </Text>
              </View>
            ) : (
              <View style={styles.savedWordsContainer}>
                {savedWords.map((word) => (
                  <View key={word.id} style={styles.savedWordCard}>
                    <View style={styles.savedWordHeader}>
                      <View>
                        <Text style={styles.savedWordTitle}>{word.word}</Text>
                        {word.part_of_speech && (
                          <Text style={styles.savedWordPos}>{word.part_of_speech}</Text>
                        )}
                      </View>
                      <TouchableOpacity
                        onPress={() => handleDeleteWord(word.id, word.word)}
                        style={styles.deleteButton}
                      >
                        <Ionicons name="trash" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.savedWordDefinition}>{word.definition}</Text>
                    {word.example && (
                      <Text style={styles.savedWordExample}>
                        <Text style={styles.exampleLabel}>Example: </Text>
                        "{word.example}"
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 6,
  },
  tabActive: {
    backgroundColor: '#F0F9FF',
  },
  tabText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '600',
  },
  tabTextActive: {
    color: Colors.primary.main,
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 20,
    marginVertical: 20,
    marginTop: 20,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  searchButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorBox: {
    marginHorizontal: 20,
    marginVertical: 12,
    padding: 12,
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#991B1B',
    fontWeight: '500',
  },
  wordContainer: {
    marginHorizontal: 20,
    marginVertical: 20,
  },
  wordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  wordTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary.main,
  },
  phonetic: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  audioButton: {
    padding: 8,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: Colors.secondary.main,
    borderRadius: 12,
    marginBottom: 16,
  },
  saveButtonSaved: {
    backgroundColor: Colors.secondary.main,
    borderColor: Colors.secondary.main,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.secondary.main,
  },
  saveButtonTextSaved: {
    color: '#FFF',
  },
  originBox: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#14B8A6',
    marginBottom: 16,
  },
  originLabel: {
    fontSize: 12,
    color: '#0369A1',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  originText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  meaningsContainer: {
    gap: 16,
  },
  meaningCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  partOfSpeechHeader: {
    marginBottom: 16,
  },
  partOfSpeech: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary.main,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginTop: 16,
  },
  definitionsSection: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  definitionItem: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 10,
  },
  bulletCircle: {
    width: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bullet: {
    fontSize: 16,
    color: Colors.secondary.main,
    fontWeight: 'bold',
  },
  definitionContent: {
    flex: 1,
  },
  definitionText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    fontWeight: '500',
  },
  exampleText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginTop: 6,
    fontStyle: 'italic',
  },
  exampleLabel: {
    fontWeight: '600',
    color: '#333',
  },
  synonymsSection: {
    marginBottom: 12,
  },
  antonymsSection: {
    marginBottom: 0,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#F3E8FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 13,
    color: Colors.primary.main,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  savedWordsContainer: {
    marginHorizontal: 20,
    marginVertical: 20,
  },
  savedWordCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.secondary.main,
  },
  savedWordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  savedWordTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary.main,
  },
  savedWordPos: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
    marginTop: 4,
    fontStyle: 'italic',
  },
  deleteButton: {
    padding: 8,
  },
  savedWordDefinition: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  savedWordExample: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    fontStyle: 'italic',
  },
});
