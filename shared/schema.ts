import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, date, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  pwBatchId: text("pw_batch_id").notNull(),
  rivalCode: text("rival_code").notNull(),
  userIcon: text("user_icon").default("🦊"),
  profileImageUrl: text("profile_image_url"),
  theme: text("theme").default("light"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Lectures table
export const lectures = pgTable("lectures", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  subject: text("subject").notNull(),
  chapter: text("chapter").notNull(),
  lectureNumber: text("lecture_number").notNull(),
  lectureName: text("lecture_name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// DPPs table
export const dpps = pgTable("dpps", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  subject: text("subject").notNull(),
  chapter: text("chapter").notNull(),
  dppNumber: text("dpp_number").notNull(),
  dppName: text("dpp_name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Lecture completions
export const lectureCompletions = pgTable("lecture_completions", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  lectureId: varchar("lecture_id", { length: 36 }).notNull().references(() => lectures.id),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  completedAt: timestamp("completed_at").defaultNow(),
}, (table) => ({
  uniqueLectureUser: unique().on(table.lectureId, table.userId),
}));

// DPP completions
export const dppCompletions = pgTable("dpp_completions", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  dppId: varchar("dpp_id", { length: 36 }).notNull().references(() => dpps.id),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  completedAt: timestamp("completed_at").defaultNow(),
}, (table) => ({
  uniqueDppUser: unique().on(table.dppId, table.userId),
}));

// School lessons
export const schoolLessons = pgTable("school_lessons", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  subject: text("subject").notNull(),
  lessonNumber: text("lesson_number").notNull(),
  lessonName: text("lesson_name").notNull(),
  monthRange: text("month_range").notNull(),
  mindmapUrl: text("mindmap_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// School lesson completions
export const schoolLessonCompletions = pgTable("school_lesson_completions", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  lessonId: varchar("lesson_id", { length: 36 }).notNull().references(() => schoolLessons.id),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  completedAt: timestamp("completed_at").defaultNow(),
}, (table) => ({
  uniqueLessonUser: unique().on(table.lessonId, table.userId),
}));

// Chat messages
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Streaks
export const streaks = pgTable("streaks", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id).unique(),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastActivityDate: date("last_activity_date"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Achievements
export const achievements = pgTable("achievements", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  achievementName: text("achievement_name").notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
}, (table) => ({
  uniqueUserAchievement: unique().on(table.userId, table.achievementName),
}));

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  lectureCompletions: many(lectureCompletions),
  dppCompletions: many(dppCompletions),
  schoolLessons: many(schoolLessons),
  schoolLessonCompletions: many(schoolLessonCompletions),
  chatMessages: many(chatMessages),
  streak: one(streaks),
  achievements: many(achievements),
}));

export const lecturesRelations = relations(lectures, ({ many }) => ({
  completions: many(lectureCompletions),
}));

export const dppsRelations = relations(dpps, ({ many }) => ({
  completions: many(dppCompletions),
}));

export const lectureCompletionsRelations = relations(lectureCompletions, ({ one }) => ({
  lecture: one(lectures, {
    fields: [lectureCompletions.lectureId],
    references: [lectures.id],
  }),
  user: one(users, {
    fields: [lectureCompletions.userId],
    references: [users.id],
  }),
}));

export const dppCompletionsRelations = relations(dppCompletions, ({ one }) => ({
  dpp: one(dpps, {
    fields: [dppCompletions.dppId],
    references: [dpps.id],
  }),
  user: one(users, {
    fields: [dppCompletions.userId],
    references: [users.id],
  }),
}));

export const schoolLessonsRelations = relations(schoolLessons, ({ one, many }) => ({
  user: one(users, {
    fields: [schoolLessons.userId],
    references: [users.id],
  }),
  completions: many(schoolLessonCompletions),
}));

export const schoolLessonCompletionsRelations = relations(schoolLessonCompletions, ({ one }) => ({
  lesson: one(schoolLessons, {
    fields: [schoolLessonCompletions.lessonId],
    references: [schoolLessons.id],
  }),
  user: one(users, {
    fields: [schoolLessonCompletions.userId],
    references: [users.id],
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id],
  }),
}));

export const streaksRelations = relations(streaks, ({ one }) => ({
  user: one(users, {
    fields: [streaks.userId],
    references: [users.id],
  }),
}));

export const achievementsRelations = relations(achievements, ({ one }) => ({
  user: one(users, {
    fields: [achievements.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLectureSchema = createInsertSchema(lectures).omit({
  id: true,
  createdAt: true,
});

export const insertDppSchema = createInsertSchema(dpps).omit({
  id: true,
  createdAt: true,
});

export const insertLectureCompletionSchema = createInsertSchema(lectureCompletions).omit({
  id: true,
  completedAt: true,
});

export const insertDppCompletionSchema = createInsertSchema(dppCompletions).omit({
  id: true,
  completedAt: true,
});

export const insertSchoolLessonSchema = createInsertSchema(schoolLessons).omit({
  id: true,
  createdAt: true,
});

export const insertSchoolLessonCompletionSchema = createInsertSchema(schoolLessonCompletions).omit({
  id: true,
  completedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertStreakSchema = createInsertSchema(streaks).omit({
  id: true,
  updatedAt: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  unlockedAt: true,
});

// Auth schemas
export const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  pwBatchId: z.string().min(1, "PW Batch ID is required"),
  rivalCode: z.string().min(4, "Rival code must be at least 4 characters"),
});

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Lecture = typeof lectures.$inferSelect;
export type InsertLecture = z.infer<typeof insertLectureSchema>;
export type Dpp = typeof dpps.$inferSelect;
export type InsertDpp = z.infer<typeof insertDppSchema>;
export type LectureCompletion = typeof lectureCompletions.$inferSelect;
export type InsertLectureCompletion = z.infer<typeof insertLectureCompletionSchema>;
export type DppCompletion = typeof dppCompletions.$inferSelect;
export type InsertDppCompletion = z.infer<typeof insertDppCompletionSchema>;
export type SchoolLesson = typeof schoolLessons.$inferSelect;
export type InsertSchoolLesson = z.infer<typeof insertSchoolLessonSchema>;
export type SchoolLessonCompletion = typeof schoolLessonCompletions.$inferSelect;
export type InsertSchoolLessonCompletion = z.infer<typeof insertSchoolLessonCompletionSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type Streak = typeof streaks.$inferSelect;
export type InsertStreak = z.infer<typeof insertStreakSchema>;
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;

// Subject type
export type Subject = "Physics" | "Chemistry" | "Mathematics";

// Achievement definitions
export const ACHIEVEMENT_DEFINITIONS = [
  { name: "First Step", description: "Complete your first lecture or DPP", icon: "🎯", requirement: 1 },
  { name: "Getting Started", description: "Complete 5 items", icon: "🚀", requirement: 5 },
  { name: "Double Digits", description: "Complete 10 items", icon: "🔟", requirement: 10 },
  { name: "Quarter Century", description: "Complete 25 items", icon: "🏅", requirement: 25 },
  { name: "Half Century", description: "Complete 50 items", icon: "⭐", requirement: 50 },
  { name: "Century Club", description: "Complete 100 items", icon: "💯", requirement: 100 },
  { name: "Double Century", description: "Complete 200 items", icon: "🏆", requirement: 200 },
  { name: "Physics Novice", description: "Complete 10 Physics items", icon: "⚡", requirement: 10, subject: "Physics" },
  { name: "Physics Expert", description: "Complete 25 Physics items", icon: "🔬", requirement: 25, subject: "Physics" },
  { name: "Physics Master", description: "Complete 50 Physics items", icon: "🧲", requirement: 50, subject: "Physics" },
  { name: "Chemistry Novice", description: "Complete 10 Chemistry items", icon: "🧪", requirement: 10, subject: "Chemistry" },
  { name: "Chemistry Expert", description: "Complete 25 Chemistry items", icon: "⚗️", requirement: 25, subject: "Chemistry" },
  { name: "Chemistry Master", description: "Complete 50 Chemistry items", icon: "🔮", requirement: 50, subject: "Chemistry" },
  { name: "Math Novice", description: "Complete 10 Math items", icon: "📐", requirement: 10, subject: "Mathematics" },
  { name: "Math Expert", description: "Complete 25 Math items", icon: "📊", requirement: 25, subject: "Mathematics" },
  { name: "Math Genius", description: "Complete 50 Math items", icon: "🧮", requirement: 50, subject: "Mathematics" },
  { name: "Streak Starter", description: "Maintain a 3-day streak", icon: "🔥", requirement: 3, type: "streak" },
  { name: "Week Warrior", description: "Maintain a 7-day streak", icon: "💪", requirement: 7, type: "streak" },
  { name: "Fortnight Fighter", description: "Maintain a 14-day streak", icon: "⚔️", requirement: 14, type: "streak" },
  { name: "Month Monster", description: "Maintain a 30-day streak", icon: "👹", requirement: 30, type: "streak" },
  { name: "Chat Starter", description: "Send your first message", icon: "💬", requirement: 1, type: "chat" },
  { name: "Social Butterfly", description: "Send 50 messages", icon: "🦋", requirement: 50, type: "chat" },
  { name: "School Scholar", description: "Complete 10 school lessons", icon: "📚", requirement: 10, type: "school" },
  { name: "Mindmap Master", description: "Upload 5 mindmaps", icon: "🗺️", requirement: 5, type: "mindmap" },
  { name: "Perfect Rival", description: "Both users complete all items", icon: "🤝", requirement: 100, type: "special" },
] as const;

// Chapter data structure
export const CHAPTERS_DATA = {
  Physics: [
    "Circular Motion",
    "Gravitation",
    "Rotational Motion",
    "Simple Harmonic Motion",
    "Elasticity",
    "Surface Tension and Viscosity",
    "Wave Motion",
    "Stationary Waves",
    "Kinetic Theory and Thermodynamics",
  ],
  Chemistry: [
    "Some Basic Concepts of Chemistry",
    "Structure of Atom",
    "Classification of Elements and Periodicity in Properties",
    "Chemical Bonding and Molecular Structure",
    "Redox Reactions",
    "Hydrogen",
    "s-Block Elements",
    "p-Block Elements - I",
    "Organic Chemistry - Basic Principles and Techniques",
    "Hydrocarbons",
    "Environmental Chemistry",
    "Solid State",
    "Solutions",
  ],
  Mathematics: [
    "Angle and its Measurement",
    "Trigonometry - I",
    "Sets and Relations",
    "Determinants and Matrices",
    "Complex Numbers",
    "Sequences and Series",
    "Trigonometry - II",
    "Permutations and Combination",
    "Methods of Induction and Binomial Theorem",
    "Straight Line",
    "Circle",
    "Conic Sections",
    "Vectors",
    "Three Dimensional Geometry",
    "Limits, Continuity and Differentiability",
    "Application of Derivatives",
    "Indefinite Integration",
    "Definite Integration",
    "Differentiation",
  ],
} as const;
