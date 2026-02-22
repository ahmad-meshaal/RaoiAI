import { db } from "./db";
import {
  novels, characters, chapters,
  type Novel, type InsertNovel, type UpdateNovelRequest,
  type Character, type InsertCharacter, type UpdateCharacterRequest,
  type Chapter, type InsertChapter, type UpdateChapterRequest
} from "@shared/schema";
import { eq, desc, asc } from "drizzle-orm";

export interface IStorage {
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
}

export class DatabaseStorage implements IStorage {
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
}

export const storage = new DatabaseStorage();
