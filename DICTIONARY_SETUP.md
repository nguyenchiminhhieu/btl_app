# Dictionary Feature Setup Guide

## Overview

Chức năng Dictionary cho phép người dùng:

- **Search từ** từ Dictionary API (https://api.dictionaryapi.dev/api/v2/entries/en)
- **Xem định nghĩa** đầy đủ với ví dụ, từ đồng nghĩa, từ trái nghĩa
- **Lưu từ** vào kho từ điển cá nhân
- **Quản lý từ đã lưu** - xem danh sách, xóa từ

## Database Setup

### 1. Run Migration trong Supabase

Có 2 cách để setup database:

#### Cách 1: Dùng SQL Editor (Recommended)

1. Truy cập Supabase Dashboard: https://app.supabase.com
2. Chọn project của bạn
3. Vào **SQL Editor** > **New Query**
4. Copy nội dung từ `supabase/migrations/create_saved_words_table.sql`
5. Paste vào SQL Editor
6. Click **Run**

#### Cách 2: Dùng Supabase CLI (Nếu có)

```bash
supabase db pull
# Hoặc
supabase migration up
```

### 2. Verify Setup

Sau khi chạy migration, verify bằng cách chạy query này trong SQL Editor:

```sql
-- Check table exists
SELECT * FROM public.saved_words LIMIT 1;

-- Check RLS is enabled
SELECT * FROM pg_policies WHERE tablename = 'saved_words';

-- Check indexes
SELECT indexname FROM pg_indexes WHERE tablename = 'saved_words';
```

Bạn sẽ thấy:

- ✅ Table `saved_words` với 10 columns
- ✅ 4 RLS policies (SELECT, INSERT, UPDATE, DELETE)
- ✅ 3 indexes cho performance

## File Structure

```
services/
  ├── dictionary-types.ts      # Type definitions
  ├── dictionary-service.ts    # Service layer
  └── index.ts                 # Exports

app/(tabs)/
  ├── dictionary.tsx           # Main dictionary screen
  └── _layout.tsx             # Updated with dictionary tab

supabase/
  └── migrations/
      └── saved_words.sql      # Database migration
```

## Service Methods

### DictionaryService

```typescript
import { dictionaryService } from '@/services';

// 1. Search từ từ API
const result = await dictionaryService.searchWord('hello');
// Returns: WordDefinition | null

// 2. Lấy danh sách từ đã lưu
const saved = await dictionaryService.getSavedWords(userId);
// Returns: SavedWord[]

// 3. Lưu từ mới
const newWord = await dictionaryService.saveWord(userId, 'hello', wordDefinition);
// Returns: SavedWord | null (null if already saved)

// 4. Xóa từ
const success = await dictionaryService.deleteWord(savedWordId);
// Returns: boolean

// 5. Check xem từ đã lưu hay chưa
const isSaved = await dictionaryService.isWordSaved(userId, 'hello');
// Returns: boolean
```

## API Integration

### Dictionary API

- **Base URL**: https://api.dictionaryapi.dev/api/v2/entries/en
- **Endpoint**: `/{word}`
- **Method**: GET
- **Auth**: None required

#### Sample Response

```json
[
  {
    "word": "hello",
    "phonetic": "həˈləʊ",
    "phonetics": [
      {
        "text": "həˈləʊ",
        "audio": "//ssl.gstatic.com/dictionary/static/sounds/20200429/hello--_gb_1.mp3"
      }
    ],
    "origin": "early 19th century: variant of earlier hollo",
    "meanings": [
      {
        "partOfSpeech": "exclamation",
        "definitions": [
          {
            "definition": "used as a greeting or to begin a phone conversation.",
            "example": "hello there, Katie!",
            "synonyms": [],
            "antonyms": []
          }
        ]
      }
    ]
  }
]
```

## UI Features

### Screen Components

#### Dictionary Screen

- **Header**: Gradient background with book icon
- **Tabs**: Search | Saved ({count})
- **Search Tab**:
  - Search input with icon
  - Search button (arrow)
  - Error handling
  - Word definition display
  - Save button (heart icon)
  - Origin section
  - Meanings with definitions, synonyms, antonyms
- **Saved Tab**:
  - List of saved words
  - Delete functionality
  - Empty state

#### Styling

- **Colors**: Navy primary (#202254), Orange secondary (#F97316)
- **Layout**: LinearGradient header, card-based content
- **Icons**: Ionicons (search, heart, trash, etc.)

## Features

### 1. Search Words

- Type any English word
- Real-time error handling
- Display full definition including:
  - Pronunciation (phonetic)
  - Word origin
  - Multiple meanings with part of speech
  - Definitions with examples
  - Synonyms and antonyms

### 2. Save Words

- One-click save to personal dictionary
- Prevent duplicate saves
- Confirmation messages

### 3. Manage Dictionary

- View all saved words in saved tab
- Sort by most recently saved
- Delete words with confirmation

### 4. User-Specific Data

- RLS policies ensure users can only see their own words
- Automatic user_id association

## Security

- **Row Level Security (RLS)**: Enabled on `saved_words` table
- **Policies**:
  - SELECT: Users can only view their own words
  - INSERT: Users can only add their own words
  - UPDATE: Users can only update their own words
  - DELETE: Users can only delete their own words
- **Auth**: Integration with `auth.users` table

## Type Definitions

```typescript
// Phonetic information
interface Phonetic {
  text?: string;
  audio?: string;
}

// Definition item
interface Definition {
  definition: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
}

// Meaning (by part of speech)
interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
  synonyms?: string[];
  antonyms?: string[];
}

// Word from API
interface WordDefinition {
  word: string;
  phonetic?: string;
  phonetics: Phonetic[];
  origin?: string;
  meanings: Meaning[];
  license?: License;
  sourceUrls?: string[];
}

// Saved word in database
interface SavedWord {
  id: string;
  user_id: string;
  word: string;
  phonetic?: string;
  definition: string;
  part_of_speech?: string;
  example?: string;
  meanings: Meaning[];
  origin?: string;
  saved_at: string;
  updated_at?: string;
}
```

## Error Handling

- **Word not found**: 404 from API → Display user-friendly message
- **Network error**: Try-catch blocks → Alert to user
- **Duplicate save**: Check before insert → Notify user
- **Delete failure**: Error handling with user feedback

## Performance

- **Indexes**: Created on frequently queried columns (user_id, word, saved_at)
- **Lazy loading**: Tab-based navigation
- **API caching**: Not implemented (stateless calls)
- **JSONB storage**: Efficient for meanings data

## Future Enhancements

1. **Audio playback**: Play word pronunciation from API
2. **Search history**: Track recently searched words
3. **Categories/Tags**: Organize saved words by topic
4. **Spaced repetition**: Quiz on saved words
5. **Offline support**: Cache definitions locally
6. **Export**: Download dictionary as PDF/CSV
7. **Social**: Share words with other users
8. **Statistics**: Track learning progress
