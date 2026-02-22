import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const novels = pgTable("novels", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  genre: text("genre").notNull(),
  synopsis: text("synopsis"),
  status: text("status").default("draft"), // draft, completed
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

export type Novel = typeof novels.$inferSelect;
export type InsertNovel = z.infer<typeof insertNovelSchema>;
export type Character = typeof characters.$inferSelect;
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type Chapter = typeof chapters.$inferSelect;
export type InsertChapter = z.infer<typeof insertChapterSchema>;

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
