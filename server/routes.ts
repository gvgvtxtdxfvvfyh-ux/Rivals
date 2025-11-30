import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./database";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const JWT_SECRET = process.env.SESSION_SECRET || "rivals-secret-key-change-in-production";

interface AuthRequest extends Express.Request {
  userId?: string;
}

function authMiddleware(req: any, res: any, next: any) {
  const token = req.cookies?.token;
  
  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

function calculateStreak(userId: string): number {
  const streak = storage.getOrCreateStreak(userId);
  const completions = storage.getAllCompletionsForUser(userId);
  
  if (completions.length === 0) {
    return 0;
  }
  
  const sortedCompletions = completions
    .map((c: any) => new Date(c.date))
    .sort((a, b) => b.getTime() - a.getTime());
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const mostRecent = new Date(sortedCompletions[0]);
  mostRecent.setHours(0, 0, 0, 0);
  
  if (mostRecent.getTime() < yesterday.getTime()) {
    storage.updateStreak(userId, 0, new Date().toISOString());
    return 0;
  }
  
  let currentStreak = 0;
  let checkDate = new Date(today);
  const completionDates = new Set(
    sortedCompletions.map(d => {
      const date = new Date(d);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    })
  );
  
  while (completionDates.has(checkDate.getTime())) {
    currentStreak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }
  
  storage.updateStreak(userId, currentStreak, mostRecent.toISOString());
  return currentStreak;
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(cookieParser());
  
  app.get("/api/auth/user-count", (req, res) => {
    const count = storage.getUserCount();
    res.json({ count });
  });
  
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { name, email, password, pwBatchId, rivalCode } = req.body;
      
      if (!name || !email || !password || !pwBatchId || !rivalCode) {
        return res.status(400).json({ message: "All fields are required" });
      }
      
      const userCount = storage.getUserCount();
      if (userCount >= 2) {
        return res.status(403).json({ message: "Maximum 2 users allowed" });
      }
      
      const existingUser = storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = storage.createUser({
        name,
        email,
        password: hashedPassword,
        pwBatchId,
        rivalCode,
      });
      
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "30d" });
      res.cookie("token", token, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });
      
      res.json({ user: { id: user.id, name: user.name, email: user.email, userIcon: user.user_icon } });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/auth/signin", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      const user = storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "30d" });
      res.cookie("token", token, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });
      
      res.json({ user: { id: user.id, name: user.name, email: user.email, userIcon: user.user_icon } });
    } catch (error) {
      console.error("Signin error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/auth/me", authMiddleware, (req: any, res) => {
    const user = storage.getUserById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ id: user.id, name: user.name, email: user.email, userIcon: user.user_icon, theme: user.theme || "light" });
  });

  app.post("/api/user/theme", authMiddleware, (req: any, res) => {
    const { theme } = req.body;
    if (!theme) {
      return res.status(400).json({ message: "Theme is required" });
    }
    try {
      storage.updateUserTheme(req.userId, theme);
      res.json({ success: true, theme });
    } catch (error) {
      console.error("Theme update error:", error);
      res.status(500).json({ message: "Error updating theme" });
    }
  });
  
  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ success: true });
  });
  
  app.post("/api/pw/lectures", authMiddleware, (req: any, res) => {
    const { subject, chapter, number, name } = req.body;
    if (!subject || !chapter || !number || !name) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const lecture = storage.createLecture({ subject, chapter, number, name });
    res.json(lecture);
  });
  
  app.get("/api/pw/all", authMiddleware, (req: any, res) => {
    const currentUser = storage.getUserById(req.userId);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const rivals = storage.getUsersByRivalCode(currentUser.rival_code);
    const rival = rivals.find(u => u.id !== currentUser.id);
    
    if (!rival) {
      return res.status(404).json({ message: "Rival not found" });
    }
    
    const lectures = storage.getLectures();
    const dpps = storage.getDpps();
    const userLectureCompletions = storage.getLectureCompletions(currentUser.id);
    const rivalLectureCompletions = storage.getLectureCompletions(rival.id);
    const userDppCompletions = storage.getDppCompletions(currentUser.id);
    const rivalDppCompletions = storage.getDppCompletions(rival.id);
    
    const lecturesWithStatus = lectures.map((l: any) => ({
      id: l.id,
      subject: l.subject,
      chapter: l.chapter,
      number: l.lecture_number,
      name: l.lecture_name,
      userCompleted: userLectureCompletions.includes(l.id),
      rivalCompleted: rivalLectureCompletions.includes(l.id),
    }));
    
    const dppsWithStatus = dpps.map((d: any) => ({
      id: d.id,
      subject: d.subject,
      chapter: d.chapter,
      number: d.dpp_number,
      name: d.dpp_name,
      userCompleted: userDppCompletions.includes(d.id),
      rivalCompleted: rivalDppCompletions.includes(d.id),
    }));
    
    res.json({
      user: { id: currentUser.id, name: currentUser.name, userIcon: currentUser.user_icon },
      rival: { id: rival.id, name: rival.name, userIcon: rival.user_icon },
      lectures: lecturesWithStatus,
      dpps: dppsWithStatus,
    });
  });
  
  app.patch("/api/pw/lectures/:id/toggle", authMiddleware, (req: any, res) => {
    const { id } = req.params;
    const completed = storage.toggleLectureCompletion(id, req.userId);
    calculateStreak(req.userId);
    res.json({ completed });
  });
  
  app.post("/api/pw/dpps", authMiddleware, (req: any, res) => {
    const { subject, chapter, number, name } = req.body;
    if (!subject || !chapter || !number || !name) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const dpp = storage.createDpp({ subject, chapter, number, name });
    res.json(dpp);
  });
  
  app.patch("/api/pw/dpps/:id/toggle", authMiddleware, (req: any, res) => {
    const { id } = req.params;
    const completed = storage.toggleDppCompletion(id, req.userId);
    calculateStreak(req.userId);
    res.json({ completed });
  });

  app.get("/api/battle/info", authMiddleware, (req: any, res) => {
    try {
      const currentUser = storage.getUserById(req.userId);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const rivals = storage.getUsersByRivalCode(currentUser.rival_code);
      const rival = rivals.find(u => u.id !== currentUser.id);
      
      if (!rival) {
        return res.status(404).json({ message: "Rival not found" });
      }

      const battleEnd = new Date("2026-04-01");
      const today = new Date();
      const hasEnded = today >= battleEnd;
      const daysRemaining = Math.ceil((battleEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      const lectures = storage.getLectures();
      const dpps = storage.getDpps();
      const userCompletions = storage.getLectureCompletions(currentUser.id).length + storage.getDppCompletions(currentUser.id).length;
      const rivalCompletions = storage.getLectureCompletions(rival.id).length + storage.getDppCompletions(rival.id).length;

      const winner = userCompletions > rivalCompletions ? "user" : rivalCompletions > userCompletions ? "rival" : "tie";

      res.json({
        endDate: "2026-04-01",
        hasEnded,
        daysRemaining: Math.max(0, daysRemaining),
        userTotal: userCompletions,
        rivalTotal: rivalCompletions,
        winner
      });
    } catch (error) {
      res.status(500).json({ message: "Error getting battle info" });
    }
  });
  
  app.get("/api/progress/dashboard", authMiddleware, (req: any, res) => {
    const currentUser = storage.getUserById(req.userId);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const rivals = storage.getUsersByRivalCode(currentUser.rival_code);
    const rival = rivals.find(u => u.id !== currentUser.id);
    
    if (!rival) {
      return res.status(404).json({ message: "Rival not found" });
    }
    
    const lectures = storage.getLectures();
    const dpps = storage.getDpps();
    const userLectureCompletions = storage.getLectureCompletions(currentUser.id);
    const rivalLectureCompletions = storage.getLectureCompletions(rival.id);
    const userDppCompletions = storage.getDppCompletions(currentUser.id);
    const rivalDppCompletions = storage.getDppCompletions(rival.id);
    
    const countBySubject = (subject: string, items: any[], completions: string[]) => {
      const subjectItems = items.filter((i: any) => i.subject === subject);
      return subjectItems.filter((i: any) => completions.includes(i.id)).length;
    };
    
    const userStreak = calculateStreak(currentUser.id);
    const rivalStreak = calculateStreak(rival.id);
    
    res.json({
      user: {
        id: currentUser.id,
        name: currentUser.name,
        userIcon: currentUser.user_icon,
        streak: userStreak,
        physics: {
          lectures: countBySubject("Physics", lectures, userLectureCompletions),
          dpps: countBySubject("Physics", dpps, userDppCompletions),
        },
        chemistry: {
          lectures: countBySubject("Chemistry", lectures, userLectureCompletions),
          dpps: countBySubject("Chemistry", dpps, userDppCompletions),
        },
        math: {
          lectures: countBySubject("Math", lectures, userLectureCompletions),
          dpps: countBySubject("Math", dpps, userDppCompletions),
        },
      },
      rival: {
        id: rival.id,
        name: rival.name,
        userIcon: rival.user_icon,
        streak: rivalStreak,
        physics: {
          lectures: countBySubject("Physics", lectures, rivalLectureCompletions),
          dpps: countBySubject("Physics", dpps, rivalDppCompletions),
        },
        chemistry: {
          lectures: countBySubject("Chemistry", lectures, rivalLectureCompletions),
          dpps: countBySubject("Chemistry", dpps, rivalDppCompletions),
        },
        math: {
          lectures: countBySubject("Math", lectures, rivalLectureCompletions),
          dpps: countBySubject("Math", dpps, rivalDppCompletions),
        },
      },
    });
  });
  
  app.get("/api/progress/detailed", authMiddleware, (req: any, res) => {
    const currentUser = storage.getUserById(req.userId);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const rivals = storage.getUsersByRivalCode(currentUser.rival_code);
    const rival = rivals.find(u => u.id !== currentUser.id);
    
    if (!rival) {
      return res.status(404).json({ message: "Rival not found" });
    }
    
    const lectures = storage.getLectures();
    const dpps = storage.getDpps();
    const userLectureCompletions = storage.getLectureCompletions(currentUser.id);
    const rivalLectureCompletions = storage.getLectureCompletions(rival.id);
    const userDppCompletions = storage.getDppCompletions(currentUser.id);
    const rivalDppCompletions = storage.getDppCompletions(rival.id);
    
    const getSubjectProgress = (subject: string, lectureComps: string[], dppComps: string[]) => {
      const subjectLectures = lectures.filter((l: any) => l.subject === subject);
      const subjectDpps = dpps.filter((d: any) => d.subject === subject);
      
      const completedLectures = subjectLectures.filter((l: any) => lectureComps.includes(l.id)).length;
      const completedDpps = subjectDpps.filter((d: any) => dppComps.includes(d.id)).length;
      
      const totalItems = subjectLectures.length + subjectDpps.length;
      const completedItems = completedLectures + completedDpps;
      
      return {
        lectures: { completed: completedLectures, total: subjectLectures.length },
        dpps: { completed: completedDpps, total: subjectDpps.length },
        percentage: totalItems > 0 ? (completedItems / totalItems) * 100 : 0,
      };
    };
    
    const userPhysics = getSubjectProgress("Physics", userLectureCompletions, userDppCompletions);
    const userChemistry = getSubjectProgress("Chemistry", userLectureCompletions, userDppCompletions);
    const userMath = getSubjectProgress("Math", userLectureCompletions, userDppCompletions);
    
    const rivalPhysics = getSubjectProgress("Physics", rivalLectureCompletions, rivalDppCompletions);
    const rivalChemistry = getSubjectProgress("Chemistry", rivalLectureCompletions, rivalDppCompletions);
    const rivalMath = getSubjectProgress("Math", rivalLectureCompletions, rivalDppCompletions);
    
    const userTotal = lectures.length + dpps.length;
    const userCompleted = userLectureCompletions.length + userDppCompletions.length;
    const userOverall = userTotal > 0 ? (userCompleted / userTotal) * 100 : 0;
    
    const rivalCompleted = rivalLectureCompletions.length + rivalDppCompletions.length;
    const rivalOverall = userTotal > 0 ? (rivalCompleted / userTotal) * 100 : 0;
    
    res.json({
      user: {
        name: currentUser.name,
        userIcon: currentUser.user_icon,
        physics: userPhysics,
        chemistry: userChemistry,
        math: userMath,
        overall: userOverall,
      },
      rival: {
        name: rival.name,
        userIcon: rival.user_icon,
        physics: rivalPhysics,
        chemistry: rivalChemistry,
        math: rivalMath,
        overall: rivalOverall,
      },
    });
  });
  
  app.post("/api/school/lessons", authMiddleware, (req: any, res) => {
    const { subject, lessonNumber, lessonName, monthRange } = req.body;
    if (!subject || !lessonNumber || !lessonName || !monthRange) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const lesson = storage.createSchoolLesson({ subject, lessonNumber, lessonName, monthRange });
    res.json(lesson);
  });
  
  app.get("/api/school/all", authMiddleware, (req: any, res) => {
    const currentUser = storage.getUserById(req.userId);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const rivals = storage.getUsersByRivalCode(currentUser.rival_code);
    const rival = rivals.find(u => u.id !== currentUser.id);
    
    if (!rival) {
      return res.status(404).json({ message: "Rival not found" });
    }
    
    const lessons = storage.getSchoolLessons();
    const userCompletions = storage.getSchoolLessonCompletions(currentUser.id);
    const rivalCompletions = storage.getSchoolLessonCompletions(rival.id);
    
    const lessonsWithStatus = lessons.map((l: any) => ({
      id: l.id,
      subject: l.subject,
      lessonNumber: l.lesson_number,
      lessonName: l.lesson_name,
      monthRange: l.month_range,
      userCompleted: userCompletions.includes(l.id),
      rivalCompleted: rivalCompletions.includes(l.id),
    }));
    
    const messages = storage.getChatMessages();
    const messagesWithDetails = messages.map((m: any) => {
      const user = storage.getUserById(m.user_id);
      return {
        id: m.id,
        userId: m.user_id,
        userName: user?.name || "Unknown",
        userIcon: user?.user_icon || "?",
        message: m.message,
        createdAt: m.created_at,
        isCurrentUser: m.user_id === currentUser.id,
      };
    });
    
    res.json({
      user: { id: currentUser.id, name: currentUser.name, userIcon: currentUser.user_icon },
      rival: { id: rival.id, name: rival.name, userIcon: rival.user_icon },
      lessons: lessonsWithStatus,
      messages: messagesWithDetails,
    });
  });
  
  app.patch("/api/school/lessons/:id/toggle", authMiddleware, (req: any, res) => {
    const { id } = req.params;
    const completed = storage.toggleSchoolLessonCompletion(id, req.userId);
    calculateStreak(req.userId);
    res.json({ completed });
  });
  
  app.post("/api/school/messages", authMiddleware, (req: any, res) => {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }
    const chatMessage = storage.createChatMessage({ userId: req.userId, message: message.trim() });
    res.json(chatMessage);
  });

  // Admin DB Management APIs
  app.get("/api/admin/db/all", authMiddleware, (req: any, res) => {
    const tables = [
      "users",
      "lectures",
      "dpps",
      "school_lessons",
      "chat_messages",
      "streaks",
      "lecture_completions",
      "dpp_completions",
      "school_lesson_completions",
    ];

    const result: Record<string, any[]> = {};
    tables.forEach((table) => {
      try {
        result[table] = db.prepare(`SELECT * FROM ${table}`).all();
      } catch (e) {
        result[table] = [];
      }
    });
    res.json(result);
  });

  app.delete("/api/admin/db/:table/:id", authMiddleware, (req: any, res) => {
    const { table, id } = req.params;
    const validTables = [
      "users",
      "lectures",
      "dpps",
      "school_lessons",
      "chat_messages",
      "streaks",
      "lecture_completions",
      "dpp_completions",
      "school_lesson_completions",
    ];

    if (!validTables.includes(table)) {
      return res.status(400).json({ message: "Invalid table" });
    }

    try {
      db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error deleting record" });
    }
  });

  app.delete("/api/admin/db/:table", authMiddleware, (req: any, res) => {
    const { table } = req.params;
    const validTables = [
      "users",
      "lectures",
      "dpps",
      "school_lessons",
      "chat_messages",
      "streaks",
      "lecture_completions",
      "dpp_completions",
      "school_lesson_completions",
    ];

    if (!validTables.includes(table)) {
      return res.status(400).json({ message: "Invalid table" });
    }

    try {
      db.prepare(`DELETE FROM ${table}`).run();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error clearing table" });
    }
  });

  app.patch("/api/admin/db/:table/:id", authMiddleware, (req: any, res) => {
    const { table, id } = req.params;
    const updates = req.body;

    const validTables = [
      "users",
      "lectures",
      "dpps",
      "school_lessons",
      "chat_messages",
      "streaks",
      "lecture_completions",
      "dpp_completions",
      "school_lesson_completions",
    ];

    if (!validTables.includes(table)) {
      return res.status(400).json({ message: "Invalid table" });
    }

    try {
      const columns = Object.keys(updates).map((col) => `${col} = ?`).join(", ");
      const values = Object.values(updates);
      db.prepare(`UPDATE ${table} SET ${columns} WHERE id = ?`).run(...values, id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error updating record" });
    }
  });

  app.post("/api/admin/db/:table", authMiddleware, (req: any, res) => {
    const { table } = req.params;
    const values = req.body;

    const validTables = [
      "users",
      "lectures",
      "dpps",
      "school_lessons",
      "chat_messages",
      "streaks",
      "lecture_completions",
      "dpp_completions",
      "school_lesson_completions",
    ];

    if (!validTables.includes(table)) {
      return res.status(400).json({ message: "Invalid table" });
    }

    try {
      const columns = Object.keys(values).join(", ");
      const placeholders = Object.keys(values).map(() => "?").join(", ");
      const columnValues = Object.values(values);
      db.prepare(`INSERT INTO ${table} (${columns}) VALUES (${placeholders})`).run(...columnValues);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Error adding record" });
    }
  });

  app.delete("/api/admin/db/drop/:table", authMiddleware, (req: any, res) => {
    const { table } = req.params;
    const validTables = [
      "users",
      "lectures",
      "dpps",
      "school_lessons",
      "chat_messages",
      "streaks",
      "lecture_completions",
      "dpp_completions",
      "school_lesson_completions",
    ];

    if (!validTables.includes(table)) {
      return res.status(400).json({ message: "Invalid table" });
    }

    try {
      db.prepare(`DROP TABLE IF EXISTS ${table}`).run();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error dropping table" });
    }
  });

  app.post("/api/admin/db/query", authMiddleware, (req: any, res) => {
    const { query } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({ message: "Query cannot be empty" });
    }

    try {
      const trimmedQuery = query.trim();
      const isSelect = trimmedQuery.toUpperCase().startsWith("SELECT");
      const isPragma = trimmedQuery.toUpperCase().startsWith("PRAGMA");

      if (isSelect || isPragma) {
        const result = db.prepare(trimmedQuery).all();
        res.json({ success: true, result });
      } else {
        db.prepare(trimmedQuery).run();
        res.json({ success: true, message: "Query executed successfully" });
      }
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Error executing query" });
    }
  });

  app.get("/api/admin/db/size", authMiddleware, (req: any, res) => {
    try {
      const fs = require("fs");
      const stats = fs.statSync("rivals.db");
      const sizeInBytes = stats.size;
      const sizeInKB = (sizeInBytes / 1024).toFixed(2);
      const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
      
      res.json({
        bytes: sizeInBytes,
        kb: parseFloat(sizeInKB),
        mb: parseFloat(sizeInMB),
        formatted: sizeInBytes > 1024 * 1024 
          ? `${sizeInMB} MB` 
          : `${sizeInKB} KB`
      });
    } catch (error) {
      res.status(500).json({ message: "Error getting database size" });
    }
  });

  storage.initializeAchievements();
  storage.initializeSyllabus();

  app.get("/api/achievements/compare", authMiddleware, (req: any, res) => {
    try {
      const userId = req.userId;
      const user = storage.getUserById(userId);
      
      const users = storage.getUsersByRivalCode(user.rival_code);
      const rivalUser = users.find((u: any) => u.id !== userId);
      
      if (!rivalUser) {
        return res.status(400).json({ message: "No rival found" });
      }

      const userAchievements = db.prepare(`
        SELECT a.*, ua.earned_at FROM achievements a
        LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
        ORDER BY a.category, a.name
      `).all(userId);

      const rivalAchievements = db.prepare(`
        SELECT a.*, ua.earned_at FROM achievements a
        LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
        ORDER BY a.category, a.name
      `).all(rivalUser.id);

      res.json({
        user: {
          id: user.id,
          name: user.name,
          userIcon: user.user_icon,
        },
        rival: {
          id: rivalUser.id,
          name: rivalUser.name,
          userIcon: rivalUser.user_icon,
        },
        userAchievements,
        rivalAchievements,
      });
    } catch (error) {
      console.error("Error fetching achievements:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
