import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { generatePlot, generateChapter } from "./ai_service";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerImageRoutes } from "./replit_integrations/image";
import { upload } from "./upload";
import path from "path";
import fs from "fs";
import { openai } from "./replit_integrations/image/client";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Register AI integration routes
  registerChatRoutes(app);
  registerImageRoutes(app);

  // API Routes
  
  // Novels
  app.get(api.novels.list.path, async (req, res) => {
    const allNovels = await storage.getNovels();
    res.json(allNovels);
  });

  app.get("/api/novels/published", async (req, res) => {
    const novels = await storage.getPublishedNovelsWithAuthors();
    res.json(novels);
  });

  app.get(api.novels.get.path, async (req, res) => {
    const novel = await storage.getNovel(Number(req.params.id));
    if (!novel) return res.status(404).json({ message: "Novel not found" });
    res.json(novel);
  });

  app.post(api.novels.create.path, async (req, res) => {
    try {
      const input = api.novels.create.input.parse(req.body);
      const authorId = req.session?.userId ?? null;
      const novel = await storage.createNovel({ ...input, authorId } as any);
      res.status(201).json(novel);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.novels.update.path, async (req, res) => {
    try {
      const input = api.novels.update.input.parse(req.body);
      const novel = await storage.updateNovel(Number(req.params.id), input);
      res.json(novel);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.novels.delete.path, async (req, res) => {
    await storage.deleteNovel(Number(req.params.id));
    res.status(204).send();
  });

  app.post("/api/novels/:id/view", async (req, res) => {
    await storage.incrementViews(Number(req.params.id));
    res.status(204).send();
  });

  app.post("/api/novels/:id/like", async (req, res) => {
    await storage.updateLikes(Number(req.params.id), req.body.increment);
    res.status(204).send();
  });

  app.post("/api/novels/:id/dislike", async (req, res) => {
    await storage.updateDislikes(Number(req.params.id), req.body.increment);
    res.status(204).send();
  });

  // Serve uploaded files
  app.use("/uploads", (req, res, next) => {
    const filePath = path.join(process.cwd(), "uploads", path.basename(req.path));
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      next();
    }
  });

  // File upload endpoint
  app.post("/api/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "لم يتم رفع أي ملف" });
    }
    const url = `/uploads/${req.file.filename}`;
    res.json({ url });
  });

  // Auth Routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { username, email, password } = req.body;
      if (!username || !email || !password) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      const { registerUser } = await import("./auth");
      const user = await registerUser(username, email, password);
      req.session!.userId = user.id;
      res.status(201).json({ id: user.id, username: user.username, email: user.email, avatarUrl: user.avatarUrl });
    } catch (err) {
      res.status(400).json({ message: (err as Error).message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Missing credentials" });
      }
      const { loginUser } = await import("./auth");
      const user = await loginUser(username, password);
      if (!user) return res.status(401).json({ message: "اسم المستخدم أو كلمة المرور غير صحيحة" });
      req.session!.userId = user.id;
      res.json({ id: user.id, username: user.username, email: user.email, avatarUrl: user.avatarUrl, bio: user.bio });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    req.session?.destroy(() => {
      res.status(204).send();
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session?.userId) return res.status(401).json({ message: "Not authenticated" });
    const user = await storage.getUserById(req.session.userId);
    if (!user) return res.status(401).json({ message: "User not found" });
    res.json({ id: user.id, username: user.username, email: user.email, avatarUrl: user.avatarUrl, bio: user.bio });
  });

  app.patch("/api/auth/profile", async (req, res) => {
    if (!req.session?.userId) return res.status(401).json({ message: "Not authenticated" });
    try {
      const { avatarUrl, bio, username } = req.body;
      const updates: Record<string, string> = {};
      if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;
      if (bio !== undefined) updates.bio = bio;
      if (username !== undefined) updates.username = username;
      const user = await storage.updateUser(req.session.userId, updates as any);
      res.json({ id: user.id, username: user.username, email: user.email, avatarUrl: user.avatarUrl, bio: user.bio });
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  });

  // User Profile
  app.get("/api/users/:username/profile", async (req, res) => {
    try {
      const user = await storage.getUserByUsername(req.params.username);
      if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });
      const [followerCount, followingCount, novels] = await Promise.all([
        storage.getFollowerCount(user.id),
        storage.getFollowingCount(user.id),
        storage.getUserPublishedNovels(user.id),
      ]);
      const isFollowing = req.session?.userId
        ? await storage.isFollowing(req.session.userId, user.id)
        : false;
      res.json({
        id: user.id,
        username: user.username,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        followerCount,
        followingCount,
        isFollowing,
        novels,
      });
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  });

  app.post("/api/users/:username/follow", async (req, res) => {
    if (!req.session?.userId) return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    try {
      const target = await storage.getUserByUsername(req.params.username);
      if (!target) return res.status(404).json({ message: "المستخدم غير موجود" });
      if (target.id === req.session.userId) return res.status(400).json({ message: "لا يمكنك متابعة نفسك" });
      await storage.followUser(req.session.userId, target.id);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  });

  app.delete("/api/users/:username/follow", async (req, res) => {
    if (!req.session?.userId) return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    try {
      const target = await storage.getUserByUsername(req.params.username);
      if (!target) return res.status(404).json({ message: "المستخدم غير موجود" });
      await storage.unfollowUser(req.session.userId, target.id);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  });

  // AI Image generation for novel cover
  app.post("/api/ai/generate-cover", async (req, res) => {
    try {
      const { title, genre, synopsis, description } = req.body;
      let prompt: string;
      if (description && description.trim()) {
        // User provided a custom description — use it as the primary prompt
        prompt = description.trim();
        if (title) prompt += `. This is a book cover for a novel titled "${title}"`;
        if (genre) prompt += ` in the ${genre} genre`;
        prompt += `. No text or typography in the image.`;
      } else {
        if (!title) return res.status(400).json({ message: "عنوان الرواية أو وصف الغلاف مطلوب" });
        prompt = `Book cover illustration for a novel titled "${title}"`;
        if (genre) prompt += ` in the ${genre} genre`;
        if (synopsis) prompt += `. The story is about: ${synopsis}`;
        prompt += `. Dramatic and artistic composition. No text, no typography, no letters in the image.`;
      }
      const response = await openai.images.generate({
        model: "gpt-image-1",
        prompt,
        n: 1,
        size: "1024x1024",
      });
      const imageData = response.data[0];
      res.json({ url: imageData.url, b64_json: imageData.b64_json });
    } catch (error) {
      console.error("Cover generation error:", error);
      res.status(500).json({ message: "فشل في توليد الغلاف" });
    }
  });

  // AI Avatar generation
  app.post("/api/ai/generate-avatar", async (req, res) => {
    try {
      const { description } = req.body;
      if (!description || !description.trim()) return res.status(400).json({ message: "الوصف مطلوب" });
      // Use the user's description directly as the prompt — don't override it
      const prompt = `${description.trim()}. High quality image, clean background.`;
      const response = await openai.images.generate({
        model: "gpt-image-1",
        prompt,
        n: 1,
        size: "1024x1024",
      });
      const imageData = response.data[0];
      res.json({ url: imageData.url, b64_json: imageData.b64_json });
    } catch (error) {
      console.error("Avatar generation error:", error);
      res.status(500).json({ message: "فشل في توليد الصورة" });
    }
  });

  // Characters
  app.get(api.characters.list.path, async (req, res) => {
    const characters = await storage.getCharacters(Number(req.params.novelId));
    res.json(characters);
  });

  app.post(api.characters.create.path, async (req, res) => {
    try {
      const input = api.characters.create.input.parse(req.body);
      const character = await storage.createCharacter({ ...input, novelId: Number(req.params.novelId) });
      res.status(201).json(character);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.characters.update.path, async (req, res) => {
    try {
      const input = api.characters.update.input.parse(req.body);
      const character = await storage.updateCharacter(Number(req.params.id), input);
      res.json(character);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.characters.delete.path, async (req, res) => {
    await storage.deleteCharacter(Number(req.params.id));
    res.status(204).send();
  });

  // Chapters
  app.get(api.chapters.list.path, async (req, res) => {
    const chapters = await storage.getChapters(Number(req.params.novelId));
    res.json(chapters);
  });

  app.post(api.chapters.create.path, async (req, res) => {
    try {
      const input = api.chapters.create.input.parse(req.body);
      const chapter = await storage.createChapter({ ...input, novelId: Number(req.params.novelId) });
      res.status(201).json(chapter);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.get(api.chapters.get.path, async (req, res) => {
    const chapter = await storage.getChapter(Number(req.params.id));
    if (!chapter) return res.status(404).json({ message: "Chapter not found" });
    res.json(chapter);
  });

  app.put(api.chapters.update.path, async (req, res) => {
    try {
      const input = api.chapters.update.input.parse(req.body);
      const chapter = await storage.updateChapter(Number(req.params.id), input);
      res.json(chapter);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.chapters.delete.path, async (req, res) => {
    await storage.deleteChapter(Number(req.params.id));
    res.status(204).send();
  });

  // AI Routes
  app.post(api.ai.generatePlot.path, async (req, res) => {
    try {
      const { genre, theme } = req.body;
      const result = await generatePlot(genre, theme);
      res.json(result);
    } catch (error) {
      console.error("AI Plot Gen Error:", error);
      res.status(500).json({ message: "Failed to generate plot" });
    }
  });

  app.post(api.ai.generateChapter.path, async (req, res) => {
    try {
      const { novelId, chapterTitle, outline, previousChapterContent } = req.body;
      const characters = await storage.getCharacters(novelId);
      const content = await generateChapter(chapterTitle, outline, previousChapterContent, characters);
      res.json({ content });
    } catch (error) {
      console.error("AI Chapter Gen Error:", error);
      res.status(500).json({ message: "Failed to generate chapter" });
    }
  });

  // Seed Data
  async function seed() {
    const existing = await storage.getNovels();
    if (existing.length === 0) {
      const novel = await storage.createNovel({
        title: "ليالي بغداد",
        genre: "تاريخي",
        synopsis: "رواية تحكي قصصاً من العصر العباسي بأسلوب شيق.",
        status: "draft"
      });

      await storage.createCharacter({
        novelId: novel.id,
        name: "هارون",
        role: "بطل",
        traits: "حكيم، قوي، عادل",
        description: "شاب في مقتبل العمر يبحث عن الحقيقة."
      });

      await storage.createChapter({
        novelId: novel.id,
        title: "البداية",
        sequenceNumber: 1,
        outline: "هارون يصل إلى المدينة ويقابل الوزير.",
        content: "كانت الشمس تميل للمغيب عندما دخل هارون من بوابة المدينة العظيمة..."
      });
    }
  }

  seed();

  return httpServer;
}
