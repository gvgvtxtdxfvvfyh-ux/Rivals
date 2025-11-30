import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  pwBatchId: text("pw_batch_id").notNull(),
  rivalCode: text("rival_code").notNull(),
  userIcon: text("user_icon").notNull().default("🦊"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const lectures = pgTable("lectures", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subject: text("subject").notNull(),
  lectureNumber: text("lecture_number").notNull(),
  lectureName: text("lecture_name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const lectureCompletions = pgTable("lecture_completions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  lectureId: varchar("lecture_id").notNull().references(() => lectures.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
});

export const dpps = pgTable("dpps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subject: text("subject").notNull(),
  dppNumber: text("dpp_number").notNull(),
  dppName: text("dpp_name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const dppCompletions = pgTable("dpp_completions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dppId: varchar("dpp_id").notNull().references(() => dpps.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
});

export const schoolLessons = pgTable("school_lessons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subject: text("subject").notNull(),
  lessonNumber: text("lesson_number").notNull(),
  lessonName: text("lesson_name").notNull(),
  monthRange: text("month_range").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const schoolLessonCompletions = pgTable("school_lesson_completions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  lessonId: varchar("lesson_id").notNull().references(() => schoolLessons.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const streaks = pgTable("streaks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  currentStreak: integer("current_streak").notNull().default(0),
  lastActivityDate: timestamp("last_activity_date"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertLectureSchema = createInsertSchema(lectures).omit({ id: true, createdAt: true });
export const insertDppSchema = createInsertSchema(dpps).omit({ id: true, createdAt: true });
export const insertSchoolLessonSchema = createInsertSchema(schoolLessons).omit({ id: true, createdAt: true });
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, createdAt: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertLecture = z.infer<typeof insertLectureSchema>;
export type Lecture = typeof lectures.$inferSelect;
export type LectureCompletion = typeof lectureCompletions.$inferSelect;
export type InsertDpp = z.infer<typeof insertDppSchema>;
export type Dpp = typeof dpps.$inferSelect;
export type DppCompletion = typeof dppCompletions.$inferSelect;
export type InsertSchoolLesson = z.infer<typeof insertSchoolLessonSchema>;
export type SchoolLesson = typeof schoolLessons.$inferSelect;
export type SchoolLessonCompletion = typeof schoolLessonCompletions.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type Streak = typeof streaks.$inferSelect;
