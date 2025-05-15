import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").default("player").notNull(),
  email: text("email"),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  icon: text("icon").notNull(),
});

export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  instructions: text("instructions").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  gameUrl: text("game_url").notNull(),
  categoryId: integer("category_id").notNull(),
  tags: text("tags").array(),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
  userId: integer("user_id").notNull(),
  rating: integer("rating").default(0),
  players: integer("players").default(0),
});

export const ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  gameId: integer("game_id").notNull(),
  value: integer("value").notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  email: true,
  avatarUrl: true,
  bio: true,
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  icon: true,
});

export const insertGameSchema = createInsertSchema(games).omit({
  id: true,
  publishedAt: true,
  rating: true,
  players: true,
});

export const insertRatingSchema = createInsertSchema(ratings).pick({
  userId: true,
  gameId: true,
  value: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof games.$inferSelect;

export type InsertRating = z.infer<typeof insertRatingSchema>;
export type Rating = typeof ratings.$inferSelect;
