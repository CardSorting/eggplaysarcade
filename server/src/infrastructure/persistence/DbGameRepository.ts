import { Game } from "../../domain/entities/Game";
import { EntityId } from "../../domain/value-objects/EntityId";
import { GameRepository } from "../../domain/repositories/GameRepository";
import { db } from "../../../db";
import { games } from "@shared/schema";
import { eq, desc, like, or, sql } from "drizzle-orm";

/**
 * Database implementation of the GameRepository
 * Following the Repository pattern and Adapter pattern
 */
export class DbGameRepository implements GameRepository {
  /**
   * Find all games
   */
  async findAll(): Promise<Game[]> {
    const result = await db.select().from(games);
    return result.map(this.mapToEntity);
  }

  /**
   * Find a game by its ID
   */
  async findById(id: EntityId): Promise<Game | null> {
    const [result] = await db
      .select()
      .from(games)
      .where(eq(games.id, id.value));
    
    if (!result) {
      return null;
    }
    
    return this.mapToEntity(result);
  }

  /**
   * Find games by category ID
   */
  async findByCategory(categoryId: EntityId): Promise<Game[]> {
    const result = await db
      .select()
      .from(games)
      .where(eq(games.categoryId, categoryId.value));
    
    return result.map(this.mapToEntity);
  }

  /**
   * Find featured games 
   * (In a real app, this might use more complex criteria like rating, curation, etc.)
   */
  async findFeatured(limit: number): Promise<Game[]> {
    const result = await db
      .select()
      .from(games)
      .orderBy(sql`RANDOM()`)
      .limit(limit);
    
    return result.map(this.mapToEntity);
  }

  /**
   * Find popular games by player count
   */
  async findPopular(limit: number): Promise<Game[]> {
    const result = await db
      .select()
      .from(games)
      .orderBy(desc(games.players))
      .limit(limit);
    
    return result.map(this.mapToEntity);
  }

  /**
   * Save a game (create or update)
   */
  async save(game: Game): Promise<Game> {
    if (game.id) {
      // Update
      const [updated] = await db
        .update(games)
        .set({
          title: game.title,
          description: game.description,
          instructions: game.instructions,
          thumbnailUrl: game.thumbnailUrl,
          gameUrl: game.gameUrl,
          categoryId: game.categoryId.value,
          tags: game.tags,
          userId: game.userId.value,
          rating: game.rating,
          players: game.playerCount
        })
        .where(eq(games.id, game.id.value))
        .returning();
      
      return this.mapToEntity(updated);
    } else {
      // Insert
      const [created] = await db
        .insert(games)
        .values({
          title: game.title,
          description: game.description,
          instructions: game.instructions,
          thumbnailUrl: game.thumbnailUrl,
          gameUrl: game.gameUrl,
          categoryId: game.categoryId.value,
          tags: game.tags,
          userId: game.userId.value,
          publishedAt: game.publishedAt
        })
        .returning();
      
      return this.mapToEntity(created);
    }
  }

  /**
   * Delete a game
   */
  async delete(id: EntityId): Promise<void> {
    await db
      .delete(games)
      .where(eq(games.id, id.value));
  }

  /**
   * Search for games by title or description
   */
  async search(query: string): Promise<Game[]> {
    const result = await db
      .select()
      .from(games)
      .where(
        or(
          like(games.title, `%${query}%`),
          like(games.description, `%${query}%`)
        )
      );
    
    return result.map(this.mapToEntity);
  }

  /**
   * Map a database game record to a Game domain entity
   */
  private mapToEntity(gameData: typeof games.$inferSelect): Game {
    return Game.reconstitute(
      gameData.id,
      gameData.title,
      gameData.description,
      gameData.instructions,
      gameData.thumbnailUrl,
      gameData.gameUrl,
      gameData.categoryId,
      gameData.tags,
      gameData.publishedAt,
      gameData.userId,
      gameData.rating,
      gameData.players
    );
  }
}