# Dictionary Feature - Quick Start Guide

## 🎯 Overview

Chức năng Dictionary cho phép người dùng:

1. **Search từ** từ API miễn phí (<https://api.dictionaryapi.dev>)
2. **Xem định nghĩa** đầy đủ với ví dụ, từ đồng nghĩa, từ trái nghĩa
3. **Lưu từ** vào kho từ điển cá nhân (Supabase)
4. **Quản lý từ** - xem danh sách, xóa từ

## 📋 Setup Checklist

### Step 1: Database Migration (5 minutes)

- [ ] Mở Supabase Dashboard
- [ ] Vào SQL Editor
- [ ] Chạy script: `supabase/migrations/create_saved_words_table.sql`
- [ ] Verify table được tạo thành công

### Step 2: Verify Services (1 minute)

- [ ] Check `services/dictionary-service.ts` tồn tại
- [ ] Check `services/dictionary-types.ts` tồn tại
- [ ] Check exports trong `services/index.ts`

### Step 3: Verify UI (1 minute)

- [ ] Check `app/(tabs)/dictionary.tsx` tồn tại
- [ ] Check `app/(tabs)/_layout.tsx` có dictionary tab

### Step 4: Test Feature (10 minutes)

```bash
# 1. Start the app
npm start

# 2. Go to Dictionary tab
# 3. Search: "hello"
# 4. Click Save
# 5. Go to Saved tab
# 6. Verify word appears
# 7. Test delete
```

## 🗄️ Database Schema

```
saved_words
├── id (UUID) - Primary Key
├── user_id (UUID) - FK to auth.users
├── word (VARCHAR) - Unique per user
├── phonetic (VARCHAR) - Pronunciation
├── definition (TEXT) - Main definition
├── part_of_speech (VARCHAR) - noun, verb, etc.
├── example (TEXT) - Usage example
├── origin (TEXT) - Word origin
├── meanings (JSONB) - Full meanings array
├── saved_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

Indexes:
- idx_saved_words_user_id
- idx_saved_words_user_word
- idx_saved_words_saved_at

RLS Policies: ✅ Enabled (Users see only their words)
```

## 🔧 Key Files

| File | Purpose |
|------|---------|
| `services/dictionary-service.ts` | API & database operations |
| `services/dictionary-types.ts` | TypeScript interfaces |
| `app/(tabs)/dictionary.tsx` | Main UI screen |
| `supabase/migrations/create_saved_words_table.sql` | Database setup |
| `DICTIONARY_SETUP.md` | Detailed documentation |

## 📱 UI Features

### Search Tab

```
┌─────────────────────────────────┐
│ [🔍 Search...] [→]              │  <- Search bar
├─────────────────────────────────┤
│ WORD                            │
│ phonetic pronunciation          │  <- Word header
│ [❤️ Save to Dictionary]          │  <- Save button
├─────────────────────────────────┤
│ Origin:                         │  <- Origin section
│ early 19th century...           │
├─────────────────────────────────┤
│ • Definition 1                  │  <- Definitions
│   Example: "..."                │
│ • Definition 2                  │
├─────────────────────────────────┤
│ Synonyms: hello, hi, greetings  │  <- Tags
│ Antonyms: goodbye, bye          │
└─────────────────────────────────┘
```

### Saved Tab

```
┌─────────────────────────────────┐
│ hello                      [🗑️]  │  <- Word card
│ exclamation                     │
│ used as a greeting...           │  <- Definition
│ Example: "hello there!"         │
├─────────────────────────────────┤
│ world                      [🗑️]  │
│ noun                            │
│ ...                             │
└─────────────────────────────────┘
```

## 🔌 API Integration

### Dictionary API

```
GET https://api.dictionaryapi.dev/api/v2/entries/en/{word}

Response Example:
{
  "word": "hello",
  "phonetic": "həˈləʊ",
  "phonetics": [{
    "text": "həˈləʊ",
    "audio": "//ssl.gstatic.com/..."
  }],
  "origin": "early 19th century...",
  "meanings": [{
    "partOfSpeech": "exclamation",
    "definitions": [{
      "definition": "used as a greeting...",
      "example": "hello there!",
      "synonyms": [],
      "antonyms": []
    }]
  }]
}
```

## 💻 Service Methods

```typescript
import { dictionaryService } from '@/services';

// 1. Search word
const result = await dictionaryService.searchWord('hello');
// Returns: WordDefinition | null

// 2. Get saved words
const saved = await dictionaryService.getSavedWords(userId);
// Returns: SavedWord[]

// 3. Save word
const newWord = await dictionaryService.saveWord(userId, 'hello', wordDef);
// Returns: SavedWord | null

// 4. Delete word
const success = await dictionaryService.deleteWord(wordId);
// Returns: boolean

// 5. Check if saved
const isSaved = await dictionaryService.isWordSaved(userId, 'hello');
// Returns: boolean
```

## 🔐 Security

✅ **Row Level Security (RLS)**

- Users can only view their own words
- Users can only save/delete their own words
- Enforced at database level

✅ **Input Validation**

- Word converted to lowercase for consistency
- Duplicate prevention with UNIQUE constraint
- Error handling for API failures

✅ **Error Handling**

- 404 errors → User-friendly message
- Network errors → Alert to user
- Duplicate save → Notify user

## 🚀 Performance

✅ **Optimized Queries**

- Indexes on frequently queried columns
- JSONB for efficient meanings storage
- Ordered queries for pagination

✅ **Caching Strategy**

- In-memory React state for current search
- No repeated API calls for same search

## 🧪 Testing Checklist

```
□ Search empty word → shows error
□ Search "hello" → displays definition
□ Save word → shows success message
□ Save again → shows "already saved" message
□ View saved words → list displays
□ Delete word → asks confirmation
□ After delete → word removed from list
□ Logout/Login → saved words persist
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Table not found | Run migration in Supabase SQL Editor |
| 401 Unauthorized | Check user is logged in (AuthGuard) |
| Word not found | Try different word or check API |
| Save failed | Check database connection, verify RLS |
| Duplicate error | Word already saved for this user |
| Slow queries | Check indexes are created |

## 📚 Additional Resources

- [Dictionary API Docs](https://dictionaryapi.dev)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase SQL Guide](https://supabase.com/docs/guides/database)

## 🔄 Future Enhancements

- 🔊 Audio playback for pronunciation
- 📊 Search history tracking
- 🏷️ Categories/tags for words
- 🎯 Spaced repetition quiz
- 📱 Offline support
- 📊 Learning statistics
- 👥 Share words with friends
- 📥 Import/Export dictionary

## ✅ Completed Features

- ✅ Search from free API
- ✅ Display full definitions
- ✅ Save to personal dictionary
- ✅ View saved words
- ✅ Delete words
- ✅ User-specific data
- ✅ Error handling
- ✅ Type-safe with TypeScript
- ✅ RLS for security

---

**Last Updated:** December 15, 2025
**Status:** ✅ Ready for Testing
