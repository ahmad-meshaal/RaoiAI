import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { api } from "@shared/routes";
import { z } from "zod";
import { novels } from "@shared/schema";
import { generatePlot, generateChapter } from "./ai_service";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerImageRoutes } from "./replit_integrations/image";

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

  app.get(api.novels.get.path, async (req, res) => {
    const novel = await storage.getNovel(Number(req.params.id));
    if (!novel) return res.status(404).json({ message: "Novel not found" });
    res.json(novel);
  });

  app.post(api.novels.create.path, async (req, res) => {
    try {
      const input = api.novels.create.input.parse(req.body);
      const novel = await storage.createNovel(input);
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
      res.status(201).json({ id: user.id, username: user.username, email: user.email });
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
      if (!user) return res.status(401).json({ message: "Invalid credentials" });
      req.session!.userId = user.id;
      res.json({ id: user.id, username: user.username, email: user.email });
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
    const userId = req.session.userId;
    res.json({ id: userId });
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
