import {
  users,
  lectures,
  dpps,
  lectureCompletions,
  dppCompletions,
  schoolLessons,
  schoolLessonCompletions,
  chatMessages,
  streaks,
  achievements,
  type User,
  type InsertUser,
  type Lecture,
  type InsertLecture,
  type Dpp,
  type InsertDpp,
  type LectureCompletion,
  type DppCompletion,
  type SchoolLesson,
  type InsertSchoolLesson,
  type ChatMessage,
  type InsertChatMessage,
  type Streak,
  type Achievement,
  type InsertAchievement,
  CHAPTERS_DATA,
  ACHIEVEMENT_DEFINITIONS,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql, desc, count } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUsersByRivalCode(rivalCode: string): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  getUserCount(): Promise<number>;

  getAllLectures(): Promise<Lecture[]>;
  getLecturesByChapter(subject: string, chapter: string): Promise<Lecture[]>;
  createLecture(lecture: InsertLecture): Promise<Lecture>;
  
  getAllDpps(): Promise<Dpp[]>;
  getDppsByChapter(subject: string, chapter: string): Promise<Dpp[]>;
  createDpp(dpp: InsertDpp): Promise<Dpp>;
  deleteLecture(id: string): Promise<void>;
  deleteDpp(id: string): Promise<void>;

  getLectureCompletions(userId: string): Promise<LectureCompletion[]>;
  toggleLectureCompletion(lectureId: string, userId: string): Promise<boolean>;

  getDppCompletions(userId: string): Promise<DppCompletion[]>;
  toggleDppCompletion(dppId: string, userId: string): Promise<boolean>;

  getSchoolLessons(rivalCode: string): Promise<SchoolLesson[]>;
  createSchoolLesson(lesson: InsertSchoolLesson): Promise<SchoolLesson>;
  getSchoolLessonCompletions(userId: string): Promise<any[]>;
  toggleSchoolLessonCompletion(lessonId: string, userId: string): Promise<boolean>;
  updateSchoolLessonMindmap(lessonId: string, mindmapUrl: string): Promise<void>;

  getChatMessages(rivalCode: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;

  getStreak(userId: string): Promise<Streak | undefined>;
  updateStreak(userId: string): Promise<Streak>;

  getAchievements(userId: string): Promise<Achievement[]>;
  checkAndUnlockAchievements(userId: string): Promise<Achievement[]>;

  seedInitialData(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUsersByRivalCode(rivalCode: string): Promise<User[]> {
    return db.select().from(users).where(eq(users.rivalCode, rivalCode));
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const userCount = await this.getUsersByRivalCode(insertUser.rivalCode);
    const userIcon = userCount.length === 0 ? "🦊" : "⚡";
    
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        password: hashedPassword,
        userIcon,
      })
      .returning();
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getUserCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(users);
    return result?.count || 0;
  }

  async getAllLectures(): Promise<Lecture[]> {
    return db.select().from(lectures);
  }

  async getLecturesByChapter(subject: string, chapter: string): Promise<Lecture[]> {
    return db
      .select()
      .from(lectures)
      .where(and(eq(lectures.subject, subject), eq(lectures.chapter, chapter)));
  }

  async createLecture(lecture: InsertLecture): Promise<Lecture> {
    const [newLecture] = await db.insert(lectures).values(lecture).returning();
    return newLecture;
  }

  async getAllDpps(): Promise<Dpp[]> {
    return db.select().from(dpps);
  }

  async getDppsByChapter(subject: string, chapter: string): Promise<Dpp[]> {
    return db
      .select()
      .from(dpps)
      .where(and(eq(dpps.subject, subject), eq(dpps.chapter, chapter)));
  }

  async createDpp(dpp: InsertDpp): Promise<Dpp> {
    const [newDpp] = await db.insert(dpps).values(dpp).returning();
    return newDpp;
  }

  async deleteLecture(id: string): Promise<void> {
    await db.delete(lectureCompletions).where(eq(lectureCompletions.lectureId, id));
    await db.delete(lectures).where(eq(lectures.id, id));
  }

  async deleteDpp(id: string): Promise<void> {
    await db.delete(dppCompletions).where(eq(dppCompletions.dppId, id));
    await db.delete(dpps).where(eq(dpps.id, id));
  }

  async getLectureCompletions(userId: string): Promise<LectureCompletion[]> {
    return db.select().from(lectureCompletions).where(eq(lectureCompletions.userId, userId));
  }

  async toggleLectureCompletion(lectureId: string, userId: string): Promise<boolean> {
    const [existing] = await db
      .select()
      .from(lectureCompletions)
      .where(and(eq(lectureCompletions.lectureId, lectureId), eq(lectureCompletions.userId, userId)));

    if (existing) {
      await db
        .delete(lectureCompletions)
        .where(and(eq(lectureCompletions.lectureId, lectureId), eq(lectureCompletions.userId, userId)));
      return false;
    } else {
      await db.insert(lectureCompletions).values({ lectureId, userId });
      await this.updateStreak(userId);
      await this.checkAndUnlockAchievements(userId);
      return true;
    }
  }

  async getDppCompletions(userId: string): Promise<DppCompletion[]> {
    return db.select().from(dppCompletions).where(eq(dppCompletions.userId, userId));
  }

  async toggleDppCompletion(dppId: string, userId: string): Promise<boolean> {
    const [existing] = await db
      .select()
      .from(dppCompletions)
      .where(and(eq(dppCompletions.dppId, dppId), eq(dppCompletions.userId, userId)));

    if (existing) {
      await db
        .delete(dppCompletions)
        .where(and(eq(dppCompletions.dppId, dppId), eq(dppCompletions.userId, userId)));
      return false;
    } else {
      await db.insert(dppCompletions).values({ dppId, userId });
      await this.updateStreak(userId);
      await this.checkAndUnlockAchievements(userId);
      return true;
    }
  }

  async getSchoolLessons(rivalCode: string): Promise<SchoolLesson[]> {
    const usersWithCode = await this.getUsersByRivalCode(rivalCode);
    const userIds = usersWithCode.map((u) => u.id);
    
    if (userIds.length === 0) return [];
    
    return db
      .select()
      .from(schoolLessons)
      .where(sql`${schoolLessons.userId} = ANY(ARRAY[${sql.join(userIds.map(id => sql`${id}`), sql`, `)}]::varchar[])`)
      .orderBy(desc(schoolLessons.createdAt));
  }

  async createSchoolLesson(lesson: InsertSchoolLesson): Promise<SchoolLesson> {
    const [newLesson] = await db.insert(schoolLessons).values(lesson).returning();
    return newLesson;
  }

  async getSchoolLessonCompletions(userId: string): Promise<any[]> {
    return db.select().from(schoolLessonCompletions).where(eq(schoolLessonCompletions.userId, userId));
  }

  async toggleSchoolLessonCompletion(lessonId: string, userId: string): Promise<boolean> {
    const [existing] = await db
      .select()
      .from(schoolLessonCompletions)
      .where(
        and(eq(schoolLessonCompletions.lessonId, lessonId), eq(schoolLessonCompletions.userId, userId))
      );

    if (existing) {
      await db
        .delete(schoolLessonCompletions)
        .where(
          and(eq(schoolLessonCompletions.lessonId, lessonId), eq(schoolLessonCompletions.userId, userId))
        );
      return false;
    } else {
      await db.insert(schoolLessonCompletions).values({ lessonId, userId });
      return true;
    }
  }

  async updateSchoolLessonMindmap(lessonId: string, mindmapUrl: string): Promise<void> {
    await db.update(schoolLessons).set({ mindmapUrl }).where(eq(schoolLessons.id, lessonId));
  }

  async getChatMessages(rivalCode: string): Promise<ChatMessage[]> {
    const usersWithCode = await this.getUsersByRivalCode(rivalCode);
    const userIds = usersWithCode.map((u) => u.id);
    
    if (userIds.length === 0) return [];
    
    return db
      .select()
      .from(chatMessages)
      .where(sql`${chatMessages.userId} = ANY(ARRAY[${sql.join(userIds.map(id => sql`${id}`), sql`, `)}]::varchar[])`)
      .orderBy(chatMessages.createdAt);
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db.insert(chatMessages).values(message).returning();
    await this.checkAndUnlockAchievements(message.userId);
    return newMessage;
  }

  async getStreak(userId: string): Promise<Streak | undefined> {
    const [streak] = await db.select().from(streaks).where(eq(streaks.userId, userId));
    return streak || undefined;
  }

  async updateStreak(userId: string): Promise<Streak> {
    const today = new Date().toISOString().split("T")[0];
    const [existingStreak] = await db.select().from(streaks).where(eq(streaks.userId, userId));

    if (!existingStreak) {
      const [newStreak] = await db
        .insert(streaks)
        .values({
          userId,
          currentStreak: 1,
          longestStreak: 1,
          lastActivityDate: today,
        })
        .returning();
      return newStreak;
    }

    const lastDate = existingStreak.lastActivityDate;
    if (lastDate === today) {
      return existingStreak;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    let newStreak: number;
    if (lastDate === yesterdayStr) {
      newStreak = (existingStreak.currentStreak || 0) + 1;
    } else {
      newStreak = 1;
    }

    const longestStreak = Math.max(newStreak, existingStreak.longestStreak || 0);

    const [updatedStreak] = await db
      .update(streaks)
      .set({
        currentStreak: newStreak,
        longestStreak,
        lastActivityDate: today,
        updatedAt: new Date(),
      })
      .where(eq(streaks.userId, userId))
      .returning();

    return updatedStreak;
  }

  async getAchievements(userId: string): Promise<Achievement[]> {
    return db.select().from(achievements).where(eq(achievements.userId, userId));
  }

  async checkAndUnlockAchievements(userId: string): Promise<Achievement[]> {
    const user = await this.getUser(userId);
    if (!user) return [];

    const existingAchievements = await this.getAchievements(userId);
    const existingNames = new Set(existingAchievements.map((a) => a.achievementName));

    const lectureCompletionsList = await this.getLectureCompletions(userId);
    const dppCompletionsList = await this.getDppCompletions(userId);
    const allLectures = await this.getAllLectures();
    const allDpps = await this.getAllDpps();
    const streak = await this.getStreak(userId);
    const messages = await this.getChatMessages(user.rivalCode);
    const userMessages = messages.filter((m) => m.userId === userId);
    const schoolLessonsList = await this.getSchoolLessons(user.rivalCode);
    const schoolCompletions = await this.getSchoolLessonCompletions(userId);

    const totalCompletions = lectureCompletionsList.length + dppCompletionsList.length;

    const subjectCompletions: Record<string, number> = {
      Physics: 0,
      Chemistry: 0,
      Mathematics: 0,
    };

    for (const lc of lectureCompletionsList) {
      const lecture = allLectures.find((l) => l.id === lc.lectureId);
      if (lecture) {
        subjectCompletions[lecture.subject] = (subjectCompletions[lecture.subject] || 0) + 1;
      }
    }

    for (const dc of dppCompletionsList) {
      const dpp = allDpps.find((d) => d.id === dc.dppId);
      if (dpp) {
        subjectCompletions[dpp.subject] = (subjectCompletions[dpp.subject] || 0) + 1;
      }
    }

    const newAchievements: Achievement[] = [];

    for (const def of ACHIEVEMENT_DEFINITIONS) {
      if (existingNames.has(def.name)) continue;

      let unlocked = false;
      const defType = "type" in def ? def.type : undefined;
      const defSubject = "subject" in def ? def.subject : undefined;

      if (defType === "streak") {
        unlocked = (streak?.currentStreak || 0) >= def.requirement;
      } else if (defType === "chat") {
        unlocked = userMessages.length >= def.requirement;
      } else if (defType === "school") {
        unlocked = schoolCompletions.length >= def.requirement;
      } else if (defType === "mindmap") {
        const mindmaps = schoolLessonsList.filter((l) => l.mindmapUrl);
        unlocked = mindmaps.length >= def.requirement;
      } else if (defSubject) {
        unlocked = (subjectCompletions[defSubject] || 0) >= def.requirement;
      } else if (!defType) {
        unlocked = totalCompletions >= def.requirement;
      }

      if (unlocked) {
        try {
          const [newAchievement] = await db
            .insert(achievements)
            .values({ userId, achievementName: def.name })
            .returning();
          newAchievements.push(newAchievement);
        } catch (e) {
          // Achievement already exists
        }
      }
    }

    return newAchievements;
  }

  async seedInitialData(): Promise<void> {
    const existingLectures = await this.getAllLectures();
    if (existingLectures.length > 0) {
      return;
    }

    const subjects = Object.keys(CHAPTERS_DATA) as (keyof typeof CHAPTERS_DATA)[];

    for (const subject of subjects) {
      const chapters = CHAPTERS_DATA[subject];
      for (const chapter of chapters) {
        for (let i = 1; i <= 6; i++) {
          await this.createLecture({
            subject,
            chapter,
            lectureNumber: `L${i}`,
            lectureName: `${chapter} - Lecture ${i}`,
          });
        }

        for (let i = 1; i <= 6; i++) {
          await this.createDpp({
            subject,
            chapter,
            dppNumber: `DPP${i}`,
            dppName: `${chapter} - DPP ${i}`,
          });
        }
      }
    }
  }
}

export const storage = new DatabaseStorage();
