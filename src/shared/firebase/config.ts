import * as SQLite from 'expo-sqlite';

// Initialize SQLite database
export const db = SQLite.openDatabaseSync('english_learning.db');

// Initialize database tables
export const initDatabase = () => {
  try {
    // Create users table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uid TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        display_name TEXT,
        photo_url TEXT,
        level TEXT DEFAULT 'beginner',
        streak INTEGER DEFAULT 0,
        total_points INTEGER DEFAULT 0,
        language TEXT DEFAULT 'vi',
        difficulty TEXT DEFAULT 'beginner',
        notifications INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create sessions table for auth
    db.execSync(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);

    // Create lessons table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS lessons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        level TEXT NOT NULL,
        category TEXT NOT NULL,
        content TEXT,
        duration INTEGER DEFAULT 0,
        points INTEGER DEFAULT 0,
        is_published INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create user_progress table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        lesson_id INTEGER NOT NULL,
        status TEXT DEFAULT 'not-started',
        score INTEGER,
        time_spent INTEGER DEFAULT 0,
        completed_exercises TEXT,
        attempts INTEGER DEFAULT 0,
        last_accessed_at DATETIME,
        completed_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (lesson_id) REFERENCES lessons(id)
      );
    `);

    // Create vocabulary/words table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS words (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        word TEXT UNIQUE NOT NULL,
        pronunciation TEXT,
        definition TEXT NOT NULL,
        part_of_speech TEXT,
        examples TEXT,
        level TEXT NOT NULL,
        frequency INTEGER DEFAULT 0,
        audio_url TEXT,
        image_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create user_vocabulary table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS user_vocabulary (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        word_id INTEGER NOT NULL,
        status TEXT DEFAULT 'learning',
        correct_answers INTEGER DEFAULT 0,
        total_attempts INTEGER DEFAULT 0,
        last_reviewed_at DATETIME,
        next_review_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (word_id) REFERENCES words(id)
      );
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Auto-initialize on import
initDatabase();

