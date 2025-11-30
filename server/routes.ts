import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { fileStorage } from "./storage-file";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  signUpSchema,
  signInSchema,
  insertLectureSchema,
  insertDppSchema,
  insertSchoolLessonSchema,
  insertChatMessageSchema,
  ACHIEVEMENT_DEFINITIONS,
} from "@shared/schema";
import { z } from "zod";

const JWT_SECRET = process.env.SESSION_SECRET || "rivals-jwt-secret-change-me";
const COOKIE_NAME = "rivals_token";

interface AuthRequest extends Request {
  userId?: string;
}

const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies[COOKIE_NAME];
    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.use(cookieParser());

  await storage.seedInitialData();

  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    try {
      const data = signUpSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const usersWithCode = await storage.getUsersByRivalCode(data.rivalCode);
      if (usersWithCode.length >= 2) {
        return res.status(400).json({
          message: "This rival code already has 2 users. Choose a different code.",
        });
      }

      const user = await storage.createUser(data);
      
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "30d" });
      
      res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: error.message || "Failed to sign up" });
    }
  });

  app.post("/api/auth/signin", async (req: Request, res: Response) => {
    try {
      const data = signInSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(data.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isValid = await bcrypt.compare(data.password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "30d" });
      
      res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: error.message || "Failed to sign in" });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    res.clearCookie(COOKIE_NAME);
    res.json({ success: true });
  });

  app.get("/api/auth/me", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const user = await storage.getUser(req.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/auth/user-count", async (req: Request, res: Response) => {
    try {
      const count = await storage.getUserCount();
      res.json({ count });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/pw/all", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const user = await storage.getUser(req.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const allLectures = await storage.getAllLectures();
      const allDpps = await storage.getAllDpps();
      const userLectureCompletions = await storage.getLectureCompletions(req.userId!);
      const userDppCompletions = await storage.getDppCompletions(req.userId!);

      const usersWithCode = await storage.getUsersByRivalCode(user.rivalCode);
      const rival = usersWithCode.find((u) => u.id !== req.userId);
      
      let rivalLectureCompletions: any[] = [];
      let rivalDppCompletions: any[] = [];
      
      if (rival) {
        rivalLectureCompletions = await storage.getLectureCompletions(rival.id);
        rivalDppCompletions = await storage.getDppCompletions(rival.id);
      }

      const userLectureIds = new Set(userLectureCompletions.map((c) => c.lectureId));
      const userDppIds = new Set(userDppCompletions.map((c) => c.dppId));
      const rivalLectureIds = new Set(rivalLectureCompletions.map((c) => c.lectureId));
      const rivalDppIds = new Set(rivalDppCompletions.map((c) => c.dppId));

      const chaptersMap = new Map<string, any>();

      for (const lecture of allLectures) {
        const key = `${lecture.subject}-${lecture.chapter}`;
        if (!chaptersMap.has(key)) {
          chaptersMap.set(key, {
            subject: lecture.subject,
            chapter: lecture.chapter,
            lectures: [],
            dpps: [],
          });
        }
        chaptersMap.get(key).lectures.push({
          id: lecture.id,
          lectureNumber: lecture.lectureNumber,
          lectureName: lecture.lectureName,
          completedByUser: userLectureIds.has(lecture.id),
          completedByRival: rivalLectureIds.has(lecture.id),
        });
      }

      for (const dpp of allDpps) {
        const key = `${dpp.subject}-${dpp.chapter}`;
        if (!chaptersMap.has(key)) {
          chaptersMap.set(key, {
            subject: dpp.subject,
            chapter: dpp.chapter,
            lectures: [],
            dpps: [],
          });
        }
        chaptersMap.get(key).dpps.push({
          id: dpp.id,
          dppNumber: dpp.dppNumber,
          dppName: dpp.dppName,
          completedByUser: userDppIds.has(dpp.id),
          completedByRival: rivalDppIds.has(dpp.id),
        });
      }

      const chapters = Array.from(chaptersMap.values());

      res.json({
        chapters,
        rival: rival
          ? {
              id: rival.id,
              name: rival.name,
              userIcon: rival.userIcon,
              profileImageUrl: rival.profileImageUrl,
            }
          : null,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/pw/lectures", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const data = insertLectureSchema.parse(req.body);
      const lecture = await storage.createLecture(data);
      res.json(lecture);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/pw/dpps", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const data = insertDppSchema.parse(req.body);
      const dpp = await storage.createDpp(data);
      res.json(dpp);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/pw/lectures/:id/toggle", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const completed = await storage.toggleLectureCompletion(req.params.id, req.userId!);
      res.json({ completed });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/pw/dpps/:id/toggle", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const completed = await storage.toggleDppCompletion(req.params.id, req.userId!);
      res.json({ completed });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/pw/lectures/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      await storage.deleteLecture(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/pw/dpps/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      await storage.deleteDpp(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/school/all", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const user = await storage.getUser(req.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const lessons = await storage.getSchoolLessons(user.rivalCode);
      const userCompletions = await storage.getSchoolLessonCompletions(req.userId!);
      
      const usersWithCode = await storage.getUsersByRivalCode(user.rivalCode);
      const rival = usersWithCode.find((u) => u.id !== req.userId);
      
      let rivalCompletions: any[] = [];
      if (rival) {
        rivalCompletions = await storage.getSchoolLessonCompletions(rival.id);
      }

      const userCompletionIds = new Set(userCompletions.map((c) => c.lessonId));
      const rivalCompletionIds = new Set(rivalCompletions.map((c) => c.lessonId));

      const lessonsWithStatus = lessons.map((lesson) => ({
        ...lesson,
        completedByUser: userCompletionIds.has(lesson.id),
        completedByRival: rivalCompletionIds.has(lesson.id),
        createdBy: lesson.userId === req.userId ? "You" : rival?.name || "Rival",
      }));

      const messages = await storage.getChatMessages(user.rivalCode);
      const messagesWithUsers = await Promise.all(
        messages.map(async (msg) => {
          const msgUser = await storage.getUser(msg.userId);
          return {
            id: msg.id,
            userId: msg.userId,
            userName: msgUser?.name || "Unknown",
            userIcon: msgUser?.userIcon || "",
            userProfileImage: msgUser?.profileImageUrl || null,
            message: msg.message,
            createdAt: msg.createdAt?.toISOString() || new Date().toISOString(),
            isCurrentUser: msg.userId === req.userId,
          };
        })
      );

      res.json({
        lessons: lessonsWithStatus,
        messages: messagesWithUsers,
        rival: rival
          ? {
              id: rival.id,
              name: rival.name,
              userIcon: rival.userIcon,
              profileImageUrl: rival.profileImageUrl,
            }
          : null,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/school/lessons", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const data = insertSchoolLessonSchema.omit({ userId: true }).parse(req.body);
      const lesson = await storage.createSchoolLesson({
        ...data,
        userId: req.userId!,
      });
      res.json(lesson);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/school/lessons/:id/toggle", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const completed = await storage.toggleSchoolLessonCompletion(
        req.params.id,
        req.userId!
      );
      res.json({ completed });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/school/chat", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { message } = req.body;
      if (!message || typeof message !== "string") {
        return res.status(400).json({ message: "Message is required" });
      }

      const chatMessage = await storage.createChatMessage({
        userId: req.userId!,
        message: message.trim(),
      });
      res.json(chatMessage);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/chat/messages", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const user = await storage.getUser(req.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const usersWithCode = await storage.getUsersByRivalCode(user.rivalCode);
      const rival = usersWithCode.find((u) => u.id !== req.userId);

      const messages = await storage.getChatMessages(user.rivalCode);
      const messagesWithUsers = await Promise.all(
        messages.map(async (msg) => {
          const msgUser = await storage.getUser(msg.userId);
          return {
            id: msg.id,
            userId: msg.userId,
            userName: msgUser?.name || "Unknown",
            userIcon: msgUser?.userIcon || "",
            userProfileImage: msgUser?.profileImageUrl || null,
            message: msg.message,
            createdAt: msg.createdAt?.toISOString() || new Date().toISOString(),
            isCurrentUser: msg.userId === req.userId,
          };
        })
      );

      res.json({
        messages: messagesWithUsers,
        rival: rival
          ? {
              id: rival.id,
              name: rival.name,
              userIcon: rival.userIcon,
              profileImageUrl: rival.profileImageUrl,
            }
          : null,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/chat/messages", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { message } = req.body;
      if (!message || typeof message !== "string") {
        return res.status(400).json({ message: "Message is required" });
      }

      const chatMessage = await storage.createChatMessage({
        userId: req.userId!,
        message: message.trim(),
      });
      res.json(chatMessage);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/progress/dashboard", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const user = await storage.getUser(req.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const allLectures = await storage.getAllLectures();
      const allDpps = await storage.getAllDpps();
      const userLectureCompletions = await storage.getLectureCompletions(req.userId!);
      const userDppCompletions = await storage.getDppCompletions(req.userId!);
      const userStreak = await storage.getStreak(req.userId!);
      const userAchievements = await storage.getAchievements(req.userId!);

      const usersWithCode = await storage.getUsersByRivalCode(user.rivalCode);
      const rival = usersWithCode.find((u) => u.id !== req.userId);

      const calculateSubjectCompletions = (
        lectureCompletions: any[],
        dppCompletions: any[]
      ) => {
        const result = { Physics: 0, Chemistry: 0, Mathematics: 0 };
        
        for (const lc of lectureCompletions) {
          const lecture = allLectures.find((l) => l.id === lc.lectureId);
          if (lecture && lecture.subject in result) {
            result[lecture.subject as keyof typeof result]++;
          }
        }
        
        for (const dc of dppCompletions) {
          const dpp = allDpps.find((d) => d.id === dc.dppId);
          if (dpp && dpp.subject in result) {
            result[dpp.subject as keyof typeof result]++;
          }
        }
        
        return result;
      };

      const userSubjectCompletions = calculateSubjectCompletions(
        userLectureCompletions,
        userDppCompletions
      );

      const userData = {
        id: user.id,
        name: user.name,
        userIcon: user.userIcon || "",
        profileImageUrl: user.profileImageUrl,
        totalCompletions: userLectureCompletions.length + userDppCompletions.length,
        lectureCompletions: userLectureCompletions.length,
        dppCompletions: userDppCompletions.length,
        physics: userSubjectCompletions.Physics,
        chemistry: userSubjectCompletions.Chemistry,
        mathematics: userSubjectCompletions.Mathematics,
        streak: userStreak?.currentStreak || 0,
        achievements: userAchievements.length,
      };

      let rivalData = null;
      if (rival) {
        const rivalLectureCompletions = await storage.getLectureCompletions(rival.id);
        const rivalDppCompletions = await storage.getDppCompletions(rival.id);
        const rivalStreak = await storage.getStreak(rival.id);
        const rivalAchievements = await storage.getAchievements(rival.id);
        
        const rivalSubjectCompletions = calculateSubjectCompletions(
          rivalLectureCompletions,
          rivalDppCompletions
        );

        rivalData = {
          id: rival.id,
          name: rival.name,
          userIcon: rival.userIcon || "",
          profileImageUrl: rival.profileImageUrl,
          totalCompletions: rivalLectureCompletions.length + rivalDppCompletions.length,
          lectureCompletions: rivalLectureCompletions.length,
          dppCompletions: rivalDppCompletions.length,
          physics: rivalSubjectCompletions.Physics,
          chemistry: rivalSubjectCompletions.Chemistry,
          mathematics: rivalSubjectCompletions.Mathematics,
          streak: rivalStreak?.currentStreak || 0,
          achievements: rivalAchievements.length,
        };
      }

      res.json({
        user: userData,
        rival: rivalData,
        totalLectures: allLectures.length,
        totalDpps: allDpps.length,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/achievements/all", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const achievements = await storage.getAchievements(req.userId!);
      
      res.json({
        achievements: achievements.map((a) => ({
          name: a.achievementName,
          unlockedAt: a.unlockedAt?.toISOString(),
        })),
        stats: {
          total: ACHIEVEMENT_DEFINITIONS.length,
          unlocked: achievements.length,
        },
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post(
    "/api/users/upload-profile-image",
    authMiddleware,
    upload.single("file"),
    async (req: AuthRequest, res: Response) => {
      try {
        if (!req.file) {
          return res.status(400).json({ message: "No file uploaded" });
        }

        const result = await fileStorage.uploadFile("profiles", req.file);
        await storage.updateUser(req.userId!, { profileImageUrl: result.url });

        res.json({ imageUrl: result.url });
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    }
  );

  app.post(
    "/api/school/upload-mindmap",
    authMiddleware,
    upload.single("file"),
    async (req: AuthRequest, res: Response) => {
      try {
        if (!req.file) {
          return res.status(400).json({ message: "No file uploaded" });
        }

        const { lessonId } = req.body;
        if (!lessonId) {
          return res.status(400).json({ message: "Lesson ID is required" });
        }

        const result = await fileStorage.uploadFile("mindmaps", req.file);
        await storage.updateSchoolLessonMindmap(lessonId, result.url);

        res.json({ mindmapUrl: result.url });
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    }
  );

  app.use("/uploads", (req, res, next) => {
    const uploadDir = path.join(process.cwd(), "uploads");
    const filePath = path.join(uploadDir, req.path);
    
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ message: "File not found" });
    }
  });

  return httpServer;
}
