import { users, type User, type InsertUser } from "@shared/schema";
import { categories, type Category, type InsertCategory } from "@shared/schema";
import { games, type Game, type InsertGame } from "@shared/schema";
import { ratings, type Rating, type InsertRating } from "@shared/schema";
import { db } from "./db";
import { eq, desc, like, and, or, sql } from "drizzle-orm";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Category methods
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(insertCategory)
      .returning();
    return category;
  }
  
  // Game methods
  async getGames(): Promise<Game[]> {
    return await db.select().from(games);
  }

  async getGameById(id: number): Promise<Game | undefined> {
    const [game] = await db.select().from(games).where(eq(games.id, id));
    return game || undefined;
  }

  async getGamesByCategory(categoryId: number): Promise<Game[]> {
    return await db
      .select()
      .from(games)
      .where(eq(games.categoryId, categoryId));
  }

  async getFeaturedGames(limit: number): Promise<Game[]> {
    return await db
      .select()
      .from(games)
      .orderBy(sql`RANDOM()`)
      .limit(limit);
  }

  async getPopularGames(limit: number): Promise<Game[]> {
    return await db
      .select()
      .from(games)
      .orderBy(desc(games.players))
      .limit(limit);
  }

  async createGame(insertGame: InsertGame): Promise<Game> {
    const [game] = await db
      .insert(games)
      .values(insertGame)
      .returning();
    return game;
  }

  async updateGamePlayers(id: number, increment: number): Promise<Game | undefined> {
    const game = await this.getGameById(id);
    
    if (!game) {
      return undefined;
    }
    
    const [updatedGame] = await db
      .update(games)
      .set({
        players: (game.players || 0) + increment
      })
      .where(eq(games.id, id))
      .returning();
      
    return updatedGame;
  }

  async searchGames(query: string): Promise<Game[]> {
    return await db
      .select()
      .from(games)
      .where(
        or(
          like(games.title, `%${query}%`),
          like(games.description, `%${query}%`)
        )
      );
  }
  
  // Rating methods
  async createRating(insertRating: InsertRating): Promise<Rating> {
    const [rating] = await db
      .insert(ratings)
      .values(insertRating)
      .returning();
    return rating;
  }

  async getGameRatings(gameId: number): Promise<Rating[]> {
    return await db
      .select()
      .from(ratings)
      .where(eq(ratings.gameId, gameId));
  }
}