# Hướng dẫn setup và chạy

## Clone proeject về và sau đó làm theoo các bước sau

### . Tải file database

 1. Truy cập <https://console.firebase.google.com>
 2. Click "Add Project" hoặc "Create a project"
 3. Đặt tên project: "english-learning-app"
 4. Disable Google Analytics (không cần cho BTL)
 5. Click "Create project"
Sau đó chờ firebase tạo project
 1. Click Android icon trong Project Overview
 2. Package name: com.englishlearningapp (lấy từ android/app/build.gradle)
 3. Download google-services.json
 4. Đặt file vào: trong folder cha của project

### Sau đó thiết lập Firebase theo hướng dẫn sau

#### 1. Cấu hình Firebase Project

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Tạo project mới hoặc chọn project existing
3. Bật Firestore Database:
   - Vào "Firestore Database"
   - Chọn "Create database"
   - Chọn "Start in test mode" (cho development)
   - Chọn location gần nhất

4. Bật Authentication:
   - Vào "Authentication"
   - Tab "Sign-in method"
   - Enable "Email/Password"

5. Bật Storage (optional):
   - Vào "Storage"
   - "Get started"

#### 2. Cấu hình App

1. Vào "Project Settings" > "General" > "Your apps"
2. Thêm Web app
3. Copy Firebase config và thay thế trong `src/shared/firebase/config.ts`:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

#### 3. Database Collections Structure

##### Users Collection (`users`)

```
users/{userId}
├── uid: string
├── email: string
├── displayName: string
├── photoURL?: string
├── level: 'beginner' | 'intermediate' | 'advanced'
├── streak: number
├── totalPoints: number
├── preferences: {
│   ├── language: string
│   ├── difficulty: string
│   └── notifications: boolean
│   }
├── createdAt: timestamp
└── updatedAt: timestamp
```

##### Lessons Collection (`lessons`)

```
lessons/{lessonId}
├── title: string
├── description: string
├── level: 'beginner' | 'intermediate' | 'advanced'
├── category: 'vocabulary' | 'grammar' | 'listening' | 'speaking' | 'reading'
├── content: {
│   ├── type: 'text' | 'audio' | 'video' | 'interactive'
│   └── data: any
│   }
├── exercises: Exercise[]
├── duration: number (minutes)
├── points: number
├── isPublished: boolean
├── createdAt: timestamp
└── updatedAt: timestamp
```

##### Progress Collection (`progress`)

```
progress/{progressId}
├── userId: string
├── lessonId: string
├── status: 'not-started' | 'in-progress' | 'completed'
├── score?: number
├── timeSpent: number (minutes)
├── completedExercises: string[]
├── attempts: number
├── lastAccessedAt?: timestamp
├── completedAt?: timestamp
├── createdAt: timestamp
└── updatedAt: timestamp
```

##### Vocabulary Collections

**vocabulary** (từ vựng tổng)

```
vocabulary/{wordId}
├── word: string
├── pronunciation: string
├── definition: string
├── partOfSpeech: string
├── examples: string[]
├── level: 'beginner' | 'intermediate' | 'advanced'
├── frequency: number
├── audioUrl?: string
├── imageUrl?: string
├── createdAt: timestamp
└── updatedAt: timestamp
```

**userVocabulary** (từ vựng của user)

```
userVocabulary/{userVocabId}
├── userId: string
├── wordId: string
├── status: 'learning' | 'familiar' | 'mastered'
├── correctAnswers: number
├── totalAttempts: number
├── lastReviewedAt?: timestamp
├── nextReviewAt?: timestamp
├── createdAt: timestamp
└── updatedAt: timestamp
```
