# IELTS Speaking Part 3 - Implementation Guide

## 🎯 Overview

**Part 3 - Two-way Discussion** is now live with **Gemini Live API** integration!

- Real-time conversation with AI
- Live audio streaming
- Immediate AI feedback
- Complete assessment with detailed scores

## 🏗️ Architecture

```
User Speaks
    ↓
Mobile Mic (Audio Recording)
    ↓
Audio Stream (Base64 PCM)
    ↓
Gemini Live API (WebSocket)
    ↓
AI Response Processing
    ↓
Audio Response → Mobile Speaker
    ↓
Assessment & Feedback
```

## 📁 File Structure

```
services/
├── part3-types.ts          # Type definitions
├── part3-service.ts        # Gemini Live API integration

app/(tabs)/speaking/
├── part3.tsx              # Main discussion screen
├── part3-results.tsx      # Results & feedback screen
└── _layout.tsx            # Updated navigation

supabase/
└── migrations/
    └── create_part3_tables.sql  # (To be created)
```

## 🔑 Configuration

### Required Environment Variables

```env
# .env file
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
EXPO_PUBLIC_BACKEND_URL=http://YOUR_IP:3000
```

### Get Gemini API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project
3. Enable **Google AI Studio** API
4. Create API key
5. Add to `.env` as `EXPO_PUBLIC_GEMINI_API_KEY`

## 🚀 Features

### Pre-Session
- ✅ Select random topic
- ✅ Display main question and follow-up questions
- ✅ Show difficulty level
- ✅ Instructions for user

### During-Session
- ✅ Real-time audio streaming to Gemini
- ✅ Live audio response from Gemini
- ✅ Conversation log display
- ✅ Easy end session option

### Post-Session
- ✅ Overall band score (0-9)
- ✅ Detailed scoring:
  - Pronunciation
  - Fluency
  - Lexical Resource
  - Grammatical Accuracy
  - Coherence
- ✅ AI-generated feedback
- ✅ Strength areas
- ✅ Areas for improvement
- ✅ Retry or return to Speaking menu

## 📊 Database Schema

### part3_topics Table
```sql
CREATE TABLE part3_topics (
  id UUID PRIMARY KEY,
  topic_name VARCHAR(255) NOT NULL,
  main_question TEXT NOT NULL,
  sub_questions TEXT[] NOT NULL,  -- Array of follow-up questions
  difficulty VARCHAR(20),          -- 'easy', 'medium', 'hard'
  description TEXT,
  created_at TIMESTAMPTZ
);
```

### part3_sessions Table
```sql
CREATE TABLE part3_sessions (
  session_id VARCHAR(255) PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  topic_id UUID NOT NULL REFERENCES part3_topics(id),
  status VARCHAR(20),              -- 'ongoing', 'completed'
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
);
```

### part3_assessments Table
```sql
CREATE TABLE part3_assessments (
  id UUID PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL REFERENCES part3_sessions(session_id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  topic_id UUID NOT NULL REFERENCES part3_topics(id),
  duration INTEGER,                -- seconds
  turns INTEGER,                   -- number of Q&A exchanges
  overall_score DECIMAL(3,1),      -- 0-9
  pronunciation DECIMAL(3,1),
  fluency DECIMAL(3,1),
  lexical_resource DECIMAL(3,1),
  grammatical_accuracy DECIMAL(3,1),
  coherence DECIMAL(3,1),
  feedback TEXT,
  strength_areas TEXT[],
  improvement_areas TEXT[],
  recorded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
);
```

## 🔌 API Integration

### Gemini Live API

**Base URL**: `wss://generativelanguage.googleapis.com/google.ai.generativelanguage.v1alpha.GenerativeService/BidiGenerateContent`

**Model**: `gemini-2.5-flash-exp`

**Protocol**: WebSocket (real-time bidirectional)

### Audio Format
- **Codec**: PCM (16-bit)
- **Sample Rate**: 16kHz recommended
- **Encoding**: Base64
- **Transmission**: Chunks via WebSocket

### Request Example
```json
{
  "realtime_input": {
    "media_chunks": [
      {
        "data": "base64_encoded_audio",
        "mime_type": "audio/pcm"
      }
    ]
  }
}
```

### Response Example
```json
{
  "server_content": {
    "model_turn": {
      "turns": [
        {
          "role": "model",
          "parts": [
            {
              "text": "Optional text response"
            },
            {
              "inline_data": {
                "mime_type": "audio/pcm",
                "data": "base64_encoded_audio"
              }
            }
          ]
        }
      ]
    }
  }
}
```

## 🛠️ Service Layer Methods

### part3-service.ts

```typescript
// Get all topics
async function getPart3Topics(): Promise<Part3Topic[]>

// Get random topic
async function getRandomPart3Topic(): Promise<Part3Topic>

// Initialize session
async function initializePart3Session(
  topicId: string,
  userId: string
): Promise<Part3SessionData>

// Gemini Live Client (WebSocket)
class GeminiLiveClient {
  // Connect to Gemini Live API
  async connect(sessionId: string): Promise<void>
  
  // Send audio to Gemini
  async sendAudio(audioBase64: string): Promise<void>
  
  // Set callback for audio responses
  onAudio(callback: (audioBase64: string) => void): void
  
  // Set error callback
  onErrorCallback(callback: (error: string) => void): void
  
  // Close connection
  close(): void
}

// Convert audio file to base64
async function convertAudioToBase64(audioUri: string): Promise<string>

// Save assessment results
async function savePart3Assessment(
  assessment: Part3Assessment
): Promise<void>

// Update session status
async function updateSessionStatus(
  sessionId: string,
  status: 'ongoing' | 'completed'
): Promise<void>
```

## 📱 UI Components

### Part 3 Screen (part3.tsx)

**Pre-Session View**:
- Topic card with main question
- Follow-up questions list
- Difficulty badge
- Instructions
- Start button

**During-Session View**:
- Conversation log
- Audio recorder
- Processing indicator
- End session button

### Part 3 Results Screen (part3-results.tsx)

**Results Display**:
- Overall band score with color coding
- Session duration and turns
- Detailed score breakdown (5 criteria)
- Strengths (AI-generated)
- Areas for improvement
- Detailed feedback
- Retry and home buttons

## ⚙️ Setup Instructions

### 1️⃣ Database Setup

```bash
# Run migration to create tables
supabase migration up
```

Or manually in Supabase SQL Editor:
```sql
-- Copy content from supabase/migrations/create_part3_tables.sql
-- Paste in Supabase SQL Editor and Run
```

### 2️⃣ Environment Configuration

```bash
# Edit .env file
EXPO_PUBLIC_GEMINI_API_KEY=your_api_key
EXPO_PUBLIC_BACKEND_URL=http://YOUR_IP:3000
```

### 3️⃣ Test the Feature

1. Start app: `npm start`
2. Navigate to Speaking tab
3. Click Part 3 card
4. Select a topic
5. Record and speak naturally
6. View assessment results

## 🔄 Real-time Flow

```
1. User clicks Part 3
2. Random topic loaded
3. User clicks "Start Discussion"
4. Connection to Gemini established
5. Initial question displayed
6. User clicks record & speaks
7. Audio sent to Gemini via WebSocket
8. Gemini processes & responds with audio
9. Audio played to user
10. Conversation continues...
11. User clicks "End Discussion"
12. Assessment calculated
13. Results displayed
```

## 🎯 Assessment Criteria

### 1. **Pronunciation** (0-9)
- Accent clarity
- Stress patterns
- Intonation

### 2. **Fluency** (0-9)
- Speech rate
- Pauses
- Coherence

### 3. **Lexical Resource** (0-9)
- Vocabulary range
- Vocabulary accuracy
- Collocation

### 4. **Grammatical Accuracy** (0-9)
- Sentence structure
- Grammar accuracy
- Complexity

### 5. **Coherence** (0-9)
- Logical flow
- Idea connection
- Overall structure

## 🧪 Testing Checklist

- [ ] Can select random topic
- [ ] Can see main question and follow-ups
- [ ] Can start discussion (connect to Gemini)
- [ ] Can record audio
- [ ] Audio sends to Gemini
- [ ] Receive audio response
- [ ] Conversation log updates
- [ ] Can end session
- [ ] Results page shows scores
- [ ] Feedback displays correctly
- [ ] Can retry discussion
- [ ] Can return to Speaking menu

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "API key not configured" | Add EXPO_PUBLIC_GEMINI_API_KEY to .env |
| "Connection error" | Check internet connection, verify API key |
| "Audio not recording" | Grant microphone permissions |
| "No audio response" | Check Gemini API status, verify audio format |
| "Assessment missing" | Check database connection, verify session saved |
| "High latency" | Reduce audio chunk size, check network |

## 🚀 Performance Tips

1. **Audio Quality**: Use 16kHz PCM for better performance
2. **Chunk Size**: Send audio in ~1-2 second chunks
3. **Timeout**: Set 60-second timeout for responses
4. **Buffer**: Pre-record before sending to reduce lag
5. **Connection**: Test on 4G/WiFi, not cellular if possible

## 📚 Additional Resources

- [Gemini Live API Docs](https://ai.google.dev/api/generativelanguage)
- [IELTS Speaking Criteria](https://www.ielts.org/take-ielts/test-format)
- [Audio Streaming Guide](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

## 🔮 Future Enhancements

- [ ] Audio playback for Gemini responses
- [ ] Recording transcription display
- [ ] Topic difficulty adjustment based on performance
- [ ] Speaking rate metrics
- [ ] Vocabulary feedback with alternatives
- [ ] Practice word highlighting
- [ ] Comparison with previous attempts
- [ ] AI-generated study plan

## ✅ Completion Checklist

- [x] Part 3 types defined
- [x] Gemini Live API service created
- [x] Part 3 screen implemented
- [x] Results screen implemented
- [x] Navigation updated
- [x] Services exported
- [x] Documentation complete
- [ ] Database migration created
- [ ] Topics data inserted
- [ ] Testing completed
- [ ] Production ready

---

**Status**: ✅ Implementation Complete (Database migration pending)

**Last Updated**: December 15, 2025

**Version**: 1.0
