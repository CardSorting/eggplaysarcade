import { 
  users, type User, type InsertUser,
  categories, type Category, type InsertCategory,
  games, type Game, type InsertGame,
  ratings, type Rating, type InsertRating,
  wishlists, type Wishlist, type InsertWishlist,
  gameSubmissions, type GameSubmission, type InsertGameSubmission, 
  type ReviewNote, SubmissionStatus
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, like, and, or, sql, inArray } from "drizzle-orm";
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
  
  async getGamesByUserId(userId: number): Promise<Game[]> {
    return await db
      .select()
      .from(games)
      .where(eq(games.userId, userId));
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

  // Wishlist methods
  async addToWishlist(wishlistItem: InsertWishlist): Promise<Wishlist> {
    const [item] = await db
      .insert(wishlists)
      .values({
        userId: wishlistItem.userId,
        gameId: wishlistItem.gameId,
        addedAt: new Date()
      })
      .returning();
    return item;
  }

  async removeFromWishlist(userId: number, gameId: number): Promise<boolean> {
    const result = await db
      .delete(wishlists)
      .where(
        and(
          eq(wishlists.userId, userId),
          eq(wishlists.gameId, gameId)
        )
      );
    
    return true; // In Drizzle, delete doesn't return a meaningful result for checking
  }

  async getWishlistItems(userId: number): Promise<Game[]> {
    // First get all wishlist items for this user
    const wishlistEntries = await db
      .select()
      .from(wishlists)
      .where(eq(wishlists.userId, userId))
      .orderBy(desc(wishlists.addedAt));
    
    // Then get all the games in the wishlist
    const result: Game[] = [];
    for (const entry of wishlistEntries) {
      const game = await this.getGameById(entry.gameId);
      if (game) {
        result.push(game);
      }
    }
    
    return result;
  }

  async isGameInWishlist(userId: number, gameId: number): Promise<boolean> {
    const [entry] = await db
      .select()
      .from(wishlists)
      .where(
        and(
          eq(wishlists.userId, userId),
          eq(wishlists.gameId, gameId)
        )
      );
    
    return !!entry;
  }
  
  // Game Submission methods
  async getGameSubmissions(): Promise<GameSubmission[]> {
    const submissions = await db.select().from(gameSubmissions);
    return submissions.map(submission => ({
      ...submission,
      metadata: submission.metadata as any, // Type assertion for metadata
      reviewNotes: submission.reviewNotes as ReviewNote[] // Type assertion for review notes
    }));
  }
  
  async getGameSubmissionById(id: number): Promise<GameSubmission | undefined> {
    const [submission] = await db
      .select()
      .from(gameSubmissions)
      .where(eq(gameSubmissions.id, id));
    
    if (!submission) return undefined;
    
    return {
      ...submission,
      metadata: submission.metadata as any, // Type assertion for metadata
      reviewNotes: submission.reviewNotes as ReviewNote[] // Type assertion for review notes
    };
  }
  
  async createGameSubmission(submission: InsertGameSubmission): Promise<GameSubmission> {
    const [result] = await db
      .insert(gameSubmissions)
      .values({
        ...submission,
        // Ensure metadata is stored as JSON
        metadata: submission.metadata,
        // Ensure review notes are stored as JSON
        reviewNotes: submission.reviewNotes || []
      })
      .returning();
    
    return {
      ...result,
      metadata: result.metadata as any,
      reviewNotes: result.reviewNotes as ReviewNote[]
    };
  }
  
  async updateGameSubmission(
    id: number, 
    data: Partial<InsertGameSubmission>
  ): Promise<GameSubmission | undefined> {
    // First get the current submission
    const [currentSubmission] = await db
      .select()
      .from(gameSubmissions)
      .where(eq(gameSubmissions.id, id));
    
    if (!currentSubmission) return undefined;
    
    // Prepare the update data
    const updateData: any = { ...data };
    
    // Handle metadata updates (merge with existing)
    if (data.metadata) {
      updateData.metadata = {
        ...(typeof currentSubmission.metadata === 'object' ? currentSubmission.metadata : {}),
        ...data.metadata
      };
    }
    
    // Handle review notes updates
    if (data.reviewNotes) {
      updateData.reviewNotes = data.reviewNotes;
    }
    
    // Update the submission
    const [result] = await db
      .update(gameSubmissions)
      .set(updateData)
      .where(eq(gameSubmissions.id, id))
      .returning();
    
    return {
      ...result,
      metadata: result.metadata as any,
      reviewNotes: result.reviewNotes as ReviewNote[]
    };
  }
  
  async updateGameSubmissionStatus(
    id: number, 
    data: {
      status?: string;
      reviewerId?: number;
      rejectionReason?: string;
      reviewedAt?: Date;
      publishedAt?: Date;
    }
  ): Promise<GameSubmission | undefined> {
    // Update the submission status
    const [result] = await db
      .update(gameSubmissions)
      .set({
        status: data.status as any, // Type assertion for status
        reviewerId: data.reviewerId,
        rejectionReason: data.rejectionReason,
        reviewedAt: data.reviewedAt,
        publishedAt: data.publishedAt
      })
      .where(eq(gameSubmissions.id, id))
      .returning();
    
    if (!result) return undefined;
    
    return {
      ...result,
      metadata: result.metadata as any,
      reviewNotes: result.reviewNotes as ReviewNote[]
    };
  }
  
  async addGameSubmissionReviewNote(
    id: number, 
    note: ReviewNote
  ): Promise<GameSubmission | undefined> {
    // Get the current submission
    const [currentSubmission] = await db
      .select()
      .from(gameSubmissions)
      .where(eq(gameSubmissions.id, id));
    
    if (!currentSubmission) return undefined;
    
    // Get current notes and add the new one
    const currentNotes = currentSubmission.reviewNotes as ReviewNote[] || [];
    const updatedNotes = [...currentNotes, note];
    
    // Update with the new notes
    const [result] = await db
      .update(gameSubmissions)
      .set({ reviewNotes: updatedNotes })
      .where(eq(gameSubmissions.id, id))
      .returning();
    
    return {
      ...result,
      metadata: result.metadata as any,
      reviewNotes: result.reviewNotes as ReviewNote[]
    };
  }
  
  async getGameSubmissionsByDeveloper(developerId: number): Promise<GameSubmission[]> {
    const submissions = await db
      .select()
      .from(gameSubmissions)
      .where(eq(gameSubmissions.developerId, developerId));
    
    return submissions.map(submission => ({
      ...submission,
      metadata: submission.metadata as any,
      reviewNotes: submission.reviewNotes as ReviewNote[]
    }));
  }
  
  async getGameSubmissionsByStatus(status: string): Promise<GameSubmission[]> {
    const submissions = await db
      .select()
      .from(gameSubmissions)
      .where(eq(gameSubmissions.status, status as any));
    
    return submissions.map(submission => ({
      ...submission,
      metadata: submission.metadata as any,
      reviewNotes: submission.reviewNotes as ReviewNote[]
    }));
  }
  
  // Update game method
  async updateGame(id: number, gameData: Partial<InsertGame>): Promise<Game | undefined> {
    const [game] = await db
      .update(games)
      .set(gameData)
      .where(eq(games.id, id))
      .returning();
    
    return game;
  }
}