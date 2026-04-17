import { db } from "./db";
import {
  novels, characters, chapters, users, userInteractions,
  type Novel, type InsertNovel, type UpdateNovelRequest,
  type Character, type InsertCharacter, type UpdateCharacterRequest,
  type Chapter, type InsertChapter, type UpdateChapterRequest,
  type User, type InsertUser, type UserInteraction
} from "@shared/schema";
import { eq, desc, asc, and } from "drizzle-orm";

export interface IStorage {
  // Users
  createUser(user: InsertUser & { passwordHash: string }): Promise<User>;
  getUserById(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;

  // Novels
  getNovels(): Promise<Novel[]>;
  getNovel(id: number): Promise<Novel | undefined>;
  createNovel(novel: InsertNovel): Promise<Novel>;
  updateNovel(id: number, novel: UpdateNovelRequest): Promise<Novel>;
  deleteNovel(id: number): Promise<void>;

  // Characters
  getCharacters(novelId: number): Promise<Character[]>;
  getCharacter(id: number): Promise<Character | undefined>;
  createCharacter(character: InsertCharacter): Promise<Character>;
  updateCharacter(id: number, character: UpdateCharacterRequest): Promise<Character>;
  deleteCharacter(id: number): Promise<void>;

  // Chapters
  getChapters(novelId: number): Promise<Chapter[]>;
  getChapter(id: number): Promise<Chapter | undefined>;
  createChapter(chapter: InsertChapter): Promise<Chapter>;
  updateChapter(id: number, chapter: UpdateChapterRequest): Promise<Chapter>;
  deleteChapter(id: number): Promise<void>;
  
  // Interactions
  getUserInteraction(userId: number, novelId: number): Promise<UserInteraction | undefined>;
  updateUserInteraction(userId: number, novelId: number, updates: Partial<UserInteraction>): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // ... (previous methods)

  async incrementViews(id: number): Promise<void> {
    const [novel] = await db.select().from(novels).where(eq(novels.id, id));
    if (novel) {
      await db.update(novels).set({ views: (novel.views || 0) + 1 }).where(eq(novels.id, id));
    }
  }

  async updateLikes(id: number, increment: boolean): Promise<void> {
    const [novel] = await db.select().from(novels).where(eq(novels.id, id));
    if (novel) {
      const current = novel.likes || 0;
      await db.update(novels).set({ likes: increment ? current + 1 : Math.max(0, current - 1) }).where(eq(novels.id, id));
    }
  }

  async updateDislikes(id: number, increment: boolean): Promise<void> {
    const [novel] = await db.select().from(novels).where(eq(novels.id, id));
    if (novel) {
      const current = novel.dislikes || 0;
      await db.update(novels).set({ dislikes: increment ? current + 1 : Math.max(0, current - 1) }).where(eq(novels.id, id));
    }
  }

  // Novels
  async getNovels(): Promise<Novel[]> {
    return await db.select().from(novels).orderBy(desc(novels.createdAt));
  }

  async getNovel(id: number): Promise<Novel | undefined> {
    const [novel] = await db.select().from(novels).where(eq(novels.id, id));
    return novel;
  }

  async createNovel(novel: InsertNovel): Promise<Novel> {
    const [newNovel] = await db.insert(novels).values(novel).returning();
    return newNovel;
  }

  async updateNovel(id: number, updates: UpdateNovelRequest): Promise<Novel> {
    const [updated] = await db.update(novels).set(updates).where(eq(novels.id, id)).returning();
    return updated;
  }

  async deleteNovel(id: number): Promise<void> {
    await db.delete(novels).where(eq(novels.id, id));
  }

  // Characters
  async getCharacters(novelId: number): Promise<Character[]> {
    return await db.select().from(characters).where(eq(characters.novelId, novelId));
  }

  async getCharacter(id: number): Promise<Character | undefined> {
    const [character] = await db.select().from(characters).where(eq(characters.id, id));
    return character;
  }

  async createCharacter(character: InsertCharacter): Promise<Character> {
    const [newCharacter] = await db.insert(characters).values(character).returning();
    return newCharacter;
  }

  async updateCharacter(id: number, updates: UpdateCharacterRequest): Promise<Character> {
    const [updated] = await db.update(characters).set(updates).where(eq(characters.id, id)).returning();
    return updated;
  }

  async deleteCharacter(id: number): Promise<void> {
    await db.delete(characters).where(eq(characters.id, id));
  }

  // Chapters
  async getChapters(novelId: number): Promise<Chapter[]> {
    return await db.select().from(chapters).where(eq(chapters.novelId, novelId)).orderBy(asc(chapters.sequenceNumber));
  }

  async getChapter(id: number): Promise<Chapter | undefined> {
    const [chapter] = await db.select().from(chapters).where(eq(chapters.id, id));
    return chapter;
  }

  async createChapter(chapter: InsertChapter): Promise<Chapter> {
    const [newChapter] = await db.insert(chapters).values(chapter).returning();
    return newChapter;
  }

  async updateChapter(id: number, updates: UpdateChapterRequest): Promise<Chapter> {
    const [updated] = await db.update(chapters).set(updates).where(eq(chapters.id, id)).returning();
    return updated;
  }

  async deleteChapter(id: number): Promise<void> {
    await db.delete(chapters).where(eq(chapters.id, id));
  }

  // Users
  async createUser(user: InsertUser & { passwordHash: string }): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [updated] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return updated;
  }

  // Interactions
  async getUserInteraction(userId: number, novelId: number): Promise<UserInteraction | undefined> {
    const [interaction] = await db.select().from(userInteractions).where(
      and(eq(userInteractions.userId, userId), eq(userInteractions.novelId, novelId))
    );
    return interaction;
  }

  async updateUserInteraction(userId: number, novelId: number, updates: Partial<UserInteraction>): Promise<void> {
    const existing = await this.getUserInteraction(userId, novelId);
    if (existing) {
      await db.update(userInteractions).set(updates).where(
        and(eq(userInteractions.userId, userId), eq(userInteractions.novelId, novelId))
      );
    } else {
      await db.insert(userInteractions).values({
        userId,
        novelId,
        ...updates
      } as any);
    }
  }
}

export const storage = new DatabaseStorage();
