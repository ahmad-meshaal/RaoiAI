import { pgTable, text, serial, integer, timestamp, jsonb, varchar, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const novels = pgTable("novels", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id"),
  title: text("title").notNull(),
  genre: text("genre").notNull(),
  synopsis: text("synopsis"),
  coverUrl: text("cover_url"),
  views: integer("views").default(0),
  likes: integer("likes").default(0),
  dislikes: integer("dislikes").default(0),
  status: text("status").default("draft"), // draft, published
  createdAt: timestamp("created_at").defaultNow(),
});

export const characters = pgTable("characters", {
  id: serial("id").primaryKey(),
  novelId: integer("novel_id").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(), // protagonist, antagonist, supporting
  traits: text("traits"), // JSON or comma separated
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chapters = pgTable("chapters", {
  id: serial("id").primaryKey(),
  novelId: integer("novel_id").notNull(),
  title: text("title").notNull(),
  sequenceNumber: integer("sequence_number").notNull(),
  content: text("content"),
  outline: text("outline"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userInteractions = pgTable("user_interactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  novelId: integer("novel_id").notNull(),
  viewed: boolean("viewed").default(false),
  liked: boolean("liked").default(false),
  disliked: boolean("disliked").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const follows = pgTable("follows", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").notNull(),
  followingId: integer("following_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const novelsRelations = relations(novels, ({ many }) => ({
  characters: many(characters),
  chapters: many(chapters),
}));

export const charactersRelations = relations(characters, ({ one }) => ({
  novel: one(novels, {
    fields: [characters.novelId],
    references: [novels.id],
  }),
}));

export const chaptersRelations = relations(chapters, ({ one }) => ({
  novel: one(novels, {
    fields: [chapters.novelId],
    references: [novels.id],
  }),
}));

export const insertNovelSchema = createInsertSchema(novels).omit({ id: true, createdAt: true });
export const insertCharacterSchema = createInsertSchema(characters).omit({ id: true, createdAt: true });
export const insertChapterSchema = createInsertSchema(chapters).omit({ id: true, createdAt: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });

export type Novel = typeof novels.$inferSelect;
export type InsertNovel = z.infer<typeof insertNovelSchema>;
export type Character = typeof characters.$inferSelect;
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type Chapter = typeof chapters.$inferSelect;
export type InsertChapter = z.infer<typeof insertChapterSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UserInteraction = typeof userInteractions.$inferSelect;
export type Follow = typeof follows.$inferSelect;

export type CreateNovelRequest = InsertNovel;
export type UpdateNovelRequest = Partial<InsertNovel>;
export type CreateCharacterRequest = InsertCharacter;
export type UpdateCharacterRequest = Partial<InsertCharacter>;
export type CreateChapterRequest = InsertChapter;
export type UpdateChapterRequest = Partial<InsertChapter>;

export type GeneratePlotRequest = {
  genre: string;
  theme?: string;
  style?: string;
};

export type GenerateChapterRequest = {
  novelId: number;
  chapterTitle: string;
  outline?: string;
  previousChapterContent?: string;
  characters?: Character[];
};

export * from "./models/chat";
