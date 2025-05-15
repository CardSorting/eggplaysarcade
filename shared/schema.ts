import { pgTable, text, serial, integer, boolean, timestamp, primaryKey, jsonb, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User roles as an enum for type safety
export enum UserRole {
  ADMIN = 'admin',
  GAME_DEVELOPER = 'game_developer',
  PLAYER = 'player'
}

// Submission status enum
export enum SubmissionStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PUBLISHED = 'published'
}

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ['admin', 'game_developer', 'player'] }).default("player").notNull(),
  email: text("email"),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  displayName: text("display_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLogin: timestamp("last_login"),
  isVerified: boolean("is_verified").default(false),
  // Developer specific fields
  companyName: text("company_name"),
  portfolio: text("portfolio_url"),
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

// Wishlist items for users to save games they're interested in
export const wishlists = pgTable("wishlists", {
  userId: integer("user_id").notNull(),
  gameId: integer("game_id").notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.userId, table.gameId] }),
  }
});

// Game submissions table for tracking game review and publishing process
export const gameSubmissions = pgTable("game_submissions", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id"),  // Null for new games
  developerId: integer("developer_id").notNull().references(() => users.id),
  versionNumber: text("version_number").notNull(),
  status: text("status", { enum: ['draft', 'submitted', 'in_review', 'approved', 'rejected', 'published'] }).notNull().default(SubmissionStatus.DRAFT),
  bundleId: text("bundle_id"),
  rejectionReason: text("rejection_reason"),
  reviewNotes: jsonb("review_notes").default([]),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  publishedAt: timestamp("published_at"),
  reviewerId: integer("reviewer_id").references(() => users.id),
  // Store submission metadata as JSON
  metadata: jsonb("metadata").notNull()
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  email: true,
  avatarUrl: true,
  bio: true,
  displayName: true,
  isVerified: true,
}).extend({
  companyName: z.string().nullable().optional(),
  portfolio: z.string().nullable().optional(),
  createdAt: z.date().optional(),
  lastLogin: z.date().nullable().optional()
});

// Specialized insert schemas for specific user types
export const insertPlayerSchema = insertUserSchema.extend({
  role: z.literal(UserRole.PLAYER),
});

export const insertDeveloperSchema = insertUserSchema.extend({
  role: z.literal(UserRole.GAME_DEVELOPER),
  companyName: z.string().nullable().optional(),
  portfolio: z.string().nullable().optional(),
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

export const insertWishlistSchema = createInsertSchema(wishlists).pick({
  userId: true,
  gameId: true,
});

// Define review note interface for Zod schema
const reviewNoteSchema = z.object({
  id: z.string(),
  content: z.string(),
  severity: z.enum(['info', 'warning', 'critical']),
  createdAt: z.date(),
  reviewerId: z.string(),
  isResolved: z.boolean(),
  resolvedAt: z.date().optional()
});

// Define game submission metadata schema
const gameSubmissionMetadataSchema = z.object({
  title: z.string(),
  description: z.string(),
  shortDescription: z.string().optional(),
  instructions: z.string().optional(),
  features: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  technicalDetails: z.object({
    hasExternalAPIs: z.boolean().optional(),
    hasServerSideCode: z.boolean().optional(),
    thirdPartyLibraries: z.array(z.string()).optional()
  }).optional(),
  assets: z.object({
    iconImageUrl: z.string().optional(),
    headerImageUrl: z.string().optional(),
    screenshotUrls: z.array(z.string()).optional()
  }).optional()
});

// Create insert schema for game submissions
export const insertGameSubmissionSchema = createInsertSchema(gameSubmissions)
  .omit({
    id: true,
    submittedAt: true,
    reviewedAt: true,
    publishedAt: true,
  })
  .extend({
    reviewNotes: z.array(reviewNoteSchema).optional(),
    metadata: gameSubmissionMetadataSchema
  });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type InsertDeveloper = z.infer<typeof insertDeveloperSchema>;
export type User = typeof users.$inferSelect;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof games.$inferSelect;

export type InsertRating = z.infer<typeof insertRatingSchema>;
export type Rating = typeof ratings.$inferSelect;

export type InsertWishlist = z.infer<typeof insertWishlistSchema>;
export type Wishlist = typeof wishlists.$inferSelect;

export type ReviewNote = z.infer<typeof reviewNoteSchema>;
export type GameSubmissionMetadata = z.infer<typeof gameSubmissionMetadataSchema>;
export type InsertGameSubmission = z.infer<typeof insertGameSubmissionSchema>;
export type GameSubmission = typeof gameSubmissions.$inferSelect & {
  metadata: GameSubmissionMetadata;
  reviewNotes: ReviewNote[];
};
