import {
    Body,
    BodySmall,
    Button,
    Caption,
    Card,
    Container,
    HStack,
    Heading3,
    Heading4,
    TextInput,
    VStack
} from '@/components/design-system';
import { DesignTokens } from '@/constants/design-tokens';
import { useAuth } from '@/contexts/AuthContext';
import { dictionaryService, type SavedWord, type WordDefinition } from '@/services';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    TouchableOpacity
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
    <Container scrollable>
      <VStack gap="lg" style={{ paddingTop: DesignTokens.spacing.xl }}>
        {/* Header Section */}
        <HStack justify="space-between" align="center">
          <VStack gap="xs">
            <Heading3>📚 Từ điển học tập</Heading3>
            <Caption>Tìm kiếm và lưu trữ từ vựng của bạn</Caption>
          </VStack>
          <TouchableOpacity 
            onPress={() => {/* Handle info */}}
            accessibilityLabel="Dictionary Info"
          >
            <Ionicons 
              name="information-circle-outline" 
              size={24} 
              color={DesignTokens.colors.neutral[600]} 
            />
          </TouchableOpacity>
        </HStack>

        {/* Tabs Section */}
        <Card variant="outlined" padding="sm">
          <HStack gap="xs">
            <TouchableOpacity
              style={{
                flex: 1,
                borderRadius: DesignTokens.radius.md,
                backgroundColor: activeTab === 'search' 
                  ? DesignTokens.colors.primary[600] 
                  : 'transparent',
                paddingVertical: DesignTokens.spacing.sm,
                paddingHorizontal: DesignTokens.spacing.md,
              }}
              onPress={() => setActiveTab('search')}
            >
              <HStack gap="xs" align="center" justify="center">
                <Ionicons 
                  name="search" 
                  size={18} 
                  color={activeTab === 'search' 
                    ? DesignTokens.colors.neutral[0] 
                    : DesignTokens.colors.neutral[500]} 
                />
                <BodySmall 
                  weight="semibold" 
                  color={activeTab === 'search' 
                    ? DesignTokens.colors.neutral[0] 
                    : DesignTokens.colors.neutral[500]}
                >
                  Tìm kiếm
                </BodySmall>
              </HStack>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                borderRadius: DesignTokens.radius.md,
                backgroundColor: activeTab === 'saved' 
                  ? DesignTokens.colors.primary[600] 
                  : 'transparent',
                paddingVertical: DesignTokens.spacing.sm,
                paddingHorizontal: DesignTokens.spacing.md,
              }}
              onPress={() => setActiveTab('saved')}
            >
              <HStack gap="xs" align="center" justify="center">
                <Ionicons 
                  name="heart" 
                  size={18} 
                  color={activeTab === 'saved' 
                    ? DesignTokens.colors.neutral[0] 
                    : DesignTokens.colors.neutral[500]} 
                />
                <BodySmall 
                  weight="semibold" 
                  color={activeTab === 'saved' 
                    ? DesignTokens.colors.neutral[0] 
                    : DesignTokens.colors.neutral[500]}
                >
                  Đã lưu ({savedWords.length})
                </BodySmall>
              </HStack>
            </TouchableOpacity>
          </HStack>
        </Card>

        {activeTab === 'search' ? (
          // Search Tab
          <VStack gap="lg">
            {/* Enhanced Search Section */}
            <Card variant="outlined" padding="lg">
              <VStack gap="md">
                <HStack gap="xs" align="center">
                  <Ionicons name="search" size={20} color={DesignTokens.colors.primary[600]} />
                  <BodySmall weight="semibold" color={DesignTokens.colors.neutral[800]}>
                    Tìm kiếm từ vựng
                  </BodySmall>
                </HStack>
                
                <VStack gap="sm">
                  <TextInput
                    placeholder="Nhập từ tiếng Anh..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={handleSearch}
                    leftIcon="search"
                    containerStyle={{
                      backgroundColor: DesignTokens.colors.neutral[50],
                      borderColor: DesignTokens.colors.primary[200],
                      borderWidth: 1.5,
                    }}
                  />
                  
                  <Button
                    variant="primary"
                    size="lg"
                    onPress={handleSearch}
                    disabled={isLoading || !searchQuery.trim()}
                    loading={isLoading}
                    leftIcon="search"
                    fullWidth
                  >
                    {isLoading ? 'Đang tìm kiếm...' : 'Tìm kiếm'}
                  </Button>
                </VStack>
                
                <Caption color={DesignTokens.colors.neutral[500]} align="center">
                  💡 Gợi ý: Thử tìm "hello", "beautiful", "learning"...
                </Caption>
              </VStack>
            </Card>

            {/* Error Message */}
            {searchError && (
              <Card 
                variant="outlined" 
                padding="md"
                style={{ 
                  backgroundColor: DesignTokens.colors.error + '10',
                  borderColor: DesignTokens.colors.error + '30'
                }}
              >
                <HStack gap="md" align="center">
                  <Ionicons name="alert-circle" size={24} color={DesignTokens.colors.error} />
                  <VStack gap="xs" style={{ flex: 1 }}>
                    <BodySmall weight="semibold" color={DesignTokens.colors.error}>
                      Không tìm thấy kết quả
                    </BodySmall>
                    <Caption color={DesignTokens.colors.error}>
                      {searchError}
                    </Caption>
                  </VStack>
                </HStack>
              </Card>
            )}

            {/* Enhanced Word Definition */}
            {wordData && (
              <Card 
                variant="default" 
                padding="lg"
                style={{
                  borderColor: DesignTokens.colors.primary[200],
                  backgroundColor: DesignTokens.colors.neutral[0],
                }}
              >
                <VStack gap="lg">
                  {/* Enhanced Word Header */}
                  <Card variant="gradient" padding="md">
                    <HStack justify="space-between" align="center">
                      <VStack gap="xs">
                        <Heading3 color={DesignTokens.colors.neutral[0]}>
                          {wordData.word}
                        </Heading3>
                        {wordData.phonetic && (
                          <BodySmall color={DesignTokens.colors.neutral[100]} style={{ fontStyle: 'italic' }}>
                            {wordData.phonetic}
                          </BodySmall>
                        )}
                      </VStack>
                      {wordData.phonetics[0]?.audio && (
                        <TouchableOpacity
                          style={{
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            borderRadius: DesignTokens.radius.full,
                            padding: DesignTokens.spacing.xs,
                          }}
                        >
                          <Ionicons name="play-circle" size={32} color={DesignTokens.colors.neutral[0]} />
                        </TouchableOpacity>
                      )}
                    </HStack>
                  </Card>

                  {/* Enhanced Save Button */}
                  <Button
                    variant={isSaved ? "success" : "accent"}
                    size="lg"
                    onPress={handleSaveWord}
                    disabled={isSaved}
                    leftIcon={isSaved ? 'heart' : 'heart-outline'}
                    fullWidth
                  >
                    {isSaved ? 'Đã lưu vào từ điển' : 'Lưu vào từ điển'}
                  </Button>

                    {/* Origin */}
                    {wordData.origin && (
                      <Card variant="outlined" padding="md">
                        <VStack gap="xs">
                          <Caption weight="semibold" color={DesignTokens.colors.neutral[600]}>
                            Origin
                          </Caption>
                          <BodySmall color={DesignTokens.colors.neutral[800]} style={{ lineHeight: 20 }}>
                            {wordData.origin}
                          </BodySmall>
                        </VStack>
                      </Card>
                    )}

                    {/* Meanings */}
                    <VStack gap="md">
                      {wordData.meanings.map((meaning: any, meaningIndex: number) => (
                        <Card key={meaningIndex} variant="outlined" padding="md">
                          <VStack gap="md">
                            <HStack gap="sm" align="center">
                              <Caption 
                                weight="semibold" 
                                color={DesignTokens.colors.primary[600]}
                                style={{
                                  backgroundColor: DesignTokens.colors.primary[50],
                                  paddingHorizontal: DesignTokens.spacing.xs,
                                  paddingVertical: 2,
                                  borderRadius: DesignTokens.radius.sm,
                                }}
                              >
                                {meaning.partOfSpeech}
                              </Caption>
                            </HStack>

                            {/* Definitions */}
                            <VStack gap="sm">
                              <Caption weight="semibold" color={DesignTokens.colors.neutral[800]}>
                                Definitions
                              </Caption>
                              {meaning.definitions.map((def: any, defIndex: number) => (
                                <HStack key={defIndex} gap="sm" align="flex-start">
                                  <Caption 
                                    color={DesignTokens.colors.primary[600]}
                                    style={{ marginTop: 2, minWidth: 12 }}
                                  >
                                    •
                                  </Caption>
                                  <VStack gap="xs" style={{ flex: 1 }}>
                                    <Body color={DesignTokens.colors.neutral[800]}>
                                      {def.definition}
                                    </Body>
                                    {def.example && (
                                      <BodySmall 
                                        color={DesignTokens.colors.neutral[600]} 
                                        style={{ fontStyle: 'italic' }}
                                      >
                                        <BodySmall weight="semibold">Example: </BodySmall>
                                        "{def.example}"
                                      </BodySmall>
                                    )}
                                  </VStack>
                                </HStack>
                              ))}
                            </VStack>

                            {/* Synonyms */}
                            {meaning.synonyms && meaning.synonyms.length > 0 && (
                              <VStack gap="xs">
                                <Caption weight="semibold" color={DesignTokens.colors.success}>
                                  Synonyms
                                </Caption>
                                <HStack gap="xs" style={{ flexWrap: 'wrap' }}>
                                  {meaning.synonyms.map((syn: string, synIndex: number) => (
                                    <Caption
                                      key={synIndex}
                                      color={DesignTokens.colors.success}
                                      style={{
                                        backgroundColor: DesignTokens.colors.success + '20',
                                        paddingHorizontal: DesignTokens.spacing.xs,
                                        paddingVertical: 2,
                                        borderRadius: DesignTokens.radius.sm,
                                      }}
                                    >
                                      {syn}
                                    </Caption>
                                  ))}
                                </HStack>
                              </VStack>
                            )}

                            {/* Antonyms */}
                            {meaning.antonyms && meaning.antonyms.length > 0 && (
                              <VStack gap="xs">
                                <Caption weight="semibold" color={DesignTokens.colors.error}>
                                  Antonyms
                                </Caption>
                                <HStack gap="xs" style={{ flexWrap: 'wrap' }}>
                                  {meaning.antonyms.map((ant: string, antIndex: number) => (
                                    <Caption
                                      key={antIndex}
                                      color={DesignTokens.colors.error}
                                      style={{
                                        backgroundColor: DesignTokens.colors.error + '20',
                                        paddingHorizontal: DesignTokens.spacing.xs,
                                        paddingVertical: 2,
                                        borderRadius: DesignTokens.radius.sm,
                                      }}
                                    >
                                      {ant}
                                    </Caption>
                                  ))}
                                </HStack>
                              </VStack>
                            )}
                          </VStack>
                        </Card>
                      ))}
                    </VStack>
                  </VStack>
                </Card>
              )}

            {/* Enhanced Empty State */}
            {!wordData && !isLoading && !searchError && (
              <Card variant="outlined" padding="xl">
                <VStack gap="lg" align="center">
                  <VStack 
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: DesignTokens.radius.full,
                      backgroundColor: DesignTokens.colors.primary[50],
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Ionicons name="search-outline" size={40} color={DesignTokens.colors.primary[600]} />
                  </VStack>
                  <VStack gap="md" align="center">
                    <Heading3 color={DesignTokens.colors.neutral[700]}>Bắt đầu tìm kiếm</Heading3>
                    <Body align="center" color={DesignTokens.colors.neutral[500]} style={{ lineHeight: 24 }}>
                      Nhập bất kỳ từ tiếng Anh nào để xem nghĩa, ví dụ và thêm nhiều thông tin hữp ích khác.
                    </Body>
                  </VStack>
                </VStack>
              </Card>
            )}
          </VStack>
        ) : (
          // Enhanced Saved Words Tab
          <VStack gap="lg">
            {/* Stats Card */}
            <Card variant="gradient" padding="md">
              <HStack justify="space-between" align="center">
                <VStack gap="xs">
                  <Heading4 color={DesignTokens.colors.neutral[0]}>
                    Từ vựng của bạn
                  </Heading4>
                  <Caption color={DesignTokens.colors.neutral[100]}>
                    {savedWords.length} từ đã lưu
                  </Caption>
                </VStack>
                <VStack 
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: DesignTokens.radius.full,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons name="heart" size={24} color={DesignTokens.colors.neutral[0]} />
                </VStack>
              </HStack>
            </Card>
            
            {savedWords.length === 0 ? (
              <Card variant="outlined" padding="xl">
                <VStack gap="lg" align="center">
                  <VStack 
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: DesignTokens.radius.full,
                      backgroundColor: DesignTokens.colors.accent[100],
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Ionicons name="heart-outline" size={40} color={DesignTokens.colors.accent[500]} />
                  </VStack>
                  <VStack gap="md" align="center">
                    <Heading3 color={DesignTokens.colors.neutral[700]}>Chưa có từ nào được lưu</Heading3>
                    <Body align="center" color={DesignTokens.colors.neutral[500]} style={{ lineHeight: 24 }}>
                      Bắt đầu tìm kiếm và lưu các từ mới để xây dựng từ điển cá nhân của riêng bạn.
                    </Body>
                  </VStack>
                  <Button
                    variant="accent"
                    size="md"
                    onPress={() => setActiveTab('search')}
                    leftIcon="search"
                  >
                    Bắt đầu tìm kiếm
                  </Button>
                </VStack>
              </Card>
            ) : (
              <VStack gap="md">
                {savedWords.map((word) => (
                  <SavedWordCard 
                    key={word.id} 
                    word={word}
                    onDelete={() => handleDeleteWord(word.id, word.word)}
                  />
                ))}
              </VStack>
            )}
          </VStack>
        )}
      </VStack>
    </Container>
  );
}

// Saved Word Card Component
const SavedWordCard: React.FC<{
  word: SavedWord;
  onDelete: () => void;
}> = ({ word, onDelete }) => (
  <Card 
    variant="default" 
    padding="lg"
    style={{
      borderColor: DesignTokens.colors.primary[200],
      borderWidth: 1,
    }}
  >
    <VStack gap="md">
      <HStack justify="space-between" align="flex-start">
        <VStack gap="sm" style={{ flex: 1 }}>
          <HStack gap="md" align="center">
            <Heading4 color={DesignTokens.colors.neutral[900]}>
              {word.word}
            </Heading4>
            {word.part_of_speech && (
              <Caption 
                weight="semibold" 
                color={DesignTokens.colors.accent[600]}
                style={{
                  backgroundColor: DesignTokens.colors.accent[100],
                  paddingHorizontal: DesignTokens.spacing.sm,
                  paddingVertical: DesignTokens.spacing.xs,
                  borderRadius: DesignTokens.radius.md,
                }}
              >
                {word.part_of_speech}
              </Caption>
            )}
          </HStack>
          
          <Body color={DesignTokens.colors.neutral[800]} style={{ lineHeight: 22 }}>
            {word.definition}
          </Body>
          
          {word.example && (
            <Card variant="outlined" padding="sm" style={{ backgroundColor: DesignTokens.colors.neutral[50] }}>
              <HStack gap="xs" align="flex-start">
                <Caption color={DesignTokens.colors.primary[600]}>💡</Caption>
                <VStack gap="xs" style={{ flex: 1 }}>
                  <Caption weight="semibold" color={DesignTokens.colors.neutral[700]}>
                    Ví dụ:
                  </Caption>
                  <BodySmall 
                    color={DesignTokens.colors.neutral[600]} 
                    style={{ fontStyle: 'italic', lineHeight: 18 }}
                  >
                    "{word.example}"
                  </BodySmall>
                </VStack>
              </HStack>
            </Card>
          )}
        </VStack>
        
        <TouchableOpacity
          onPress={onDelete}
          style={{
            padding: DesignTokens.spacing.sm,
            borderRadius: DesignTokens.radius.md,
            backgroundColor: DesignTokens.colors.error + '15',
          }}
        >
          <Ionicons name="trash" size={18} color={DesignTokens.colors.error} />
        </TouchableOpacity>
      </HStack>
    </VStack>
  </Card>
);
