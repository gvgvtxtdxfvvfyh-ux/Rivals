import Database from "better-sqlite3";
import { randomUUID } from "crypto";

const db = new Database("rivals.db");
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    pw_batch_id TEXT NOT NULL,
    rival_code TEXT NOT NULL,
    user_icon TEXT NOT NULL DEFAULT '🦊',
    theme TEXT NOT NULL DEFAULT 'light',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS lectures (
    id TEXT PRIMARY KEY,
    subject TEXT NOT NULL,
    chapter TEXT NOT NULL,
    lecture_number TEXT NOT NULL,
    lecture_name TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS lecture_completions (
    id TEXT PRIMARY KEY,
    lecture_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    completed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lecture_id) REFERENCES lectures(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS dpps (
    id TEXT PRIMARY KEY,
    subject TEXT NOT NULL,
    chapter TEXT NOT NULL,
    dpp_number TEXT NOT NULL,
    dpp_name TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS dpp_completions (
    id TEXT PRIMARY KEY,
    dpp_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    completed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dpp_id) REFERENCES dpps(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS school_lessons (
    id TEXT PRIMARY KEY,
    subject TEXT NOT NULL,
    lesson_number TEXT NOT NULL,
    lesson_name TEXT NOT NULL,
    month_range TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS school_lesson_completions (
    id TEXT PRIMARY KEY,
    lesson_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    completed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES school_lessons(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS streaks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    current_streak INTEGER NOT NULL DEFAULT 0,
    last_activity_date DATETIME,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS battle_info (
    id TEXT PRIMARY KEY,
    rival_code TEXT NOT NULL UNIQUE,
    battle_end_date DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS achievements (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    category TEXT NOT NULL,
    condition TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_achievements (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    achievement_id TEXT NOT NULL,
    earned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
    UNIQUE(user_id, achievement_id)
  );

  CREATE INDEX IF NOT EXISTS idx_lectures_subject ON lectures(subject);
  CREATE INDEX IF NOT EXISTS idx_dpps_subject ON dpps(subject);
  CREATE INDEX IF NOT EXISTS idx_school_lessons_month_range ON school_lessons(month_range);
  CREATE INDEX IF NOT EXISTS idx_lecture_completions_user ON lecture_completions(user_id);
  CREATE INDEX IF NOT EXISTS idx_dpp_completions_user ON dpp_completions(user_id);
  CREATE INDEX IF NOT EXISTS idx_school_lesson_completions_user ON school_lesson_completions(user_id);
  CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
`);

// Ensure theme column exists on users table
try {
  db.prepare("ALTER TABLE users ADD COLUMN theme TEXT NOT NULL DEFAULT 'obsidian'").run();
} catch (e) {
  // Column already exists, that's fine
}

export { db };
export default db;
