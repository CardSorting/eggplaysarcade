import { Rating } from "../../domain/entities/Rating";
import { EntityId } from "../../domain/value-objects/EntityId";
import { RatingRepository } from "../../domain/repositories/RatingRepository";
import { db } from "../../../db";
import { ratings } from "@shared/schema";
import { eq, and } from "drizzle-orm";

/**
 * Database implementation of the RatingRepository
 * Following the Repository pattern and Adapter pattern
 */
export class DbRatingRepository implements RatingRepository {
  /**
   * Find all ratings
   */
  async findAll(): Promise<Rating[]> {
    const result = await db.select().from(ratings);
    return result.map(this.mapToEntity);
  }

  /**
   * Find a rating by ID
   */
  async findById(id: EntityId): Promise<Rating | null> {
    const [result] = await db
      .select()
      .from(ratings)
      .where(eq(ratings.id, id.value));
    
    if (!result) {
      return null;
    }
    
    return this.mapToEntity(result);
  }

  /**
   * Find ratings by game ID
   */
  async findByGameId(gameId: EntityId): Promise<Rating[]> {
    const result = await db
      .select()
      .from(ratings)
      .where(eq(ratings.gameId, gameId.value));
    
    return result.map(this.mapToEntity);
  }

  /**
   * Find ratings by user ID
   */
  async findByUserId(userId: EntityId): Promise<Rating[]> {
    const result = await db
      .select()
      .from(ratings)
      .where(eq(ratings.userId, userId.value));
    
    return result.map(this.mapToEntity);
  }

  /**
   * Find a specific rating by game ID and user ID
   */
  async findByGameAndUser(gameId: EntityId, userId: EntityId): Promise<Rating | null> {
    const [result] = await db
      .select()
      .from(ratings)
      .where(
        and(
          eq(ratings.gameId, gameId.value),
          eq(ratings.userId, userId.value)
        )
      );
    
    if (!result) {
      return null;
    }
    
    return this.mapToEntity(result);
  }

  /**
   * Create a new rating
   */
  async createRating(userId: EntityId, gameId: EntityId, value: number): Promise<Rating> {
    // Check if rating already exists
    const existingRating = await this.findByGameAndUser(gameId, userId);
    
    if (existingRating) {
      // Update existing rating
      existingRating.updateValue(value);
      return this.save(existingRating);
    }
    
    // Create new rating
    const newRating = Rating.create(userId, gameId, value);
    return this.save(newRating);
  }

  /**
   * Save a rating (create or update)
   */
  async save(rating: Rating): Promise<Rating> {
    if (rating.id) {
      // Update
      const [updated] = await db
        .update(ratings)
        .set({
          value: rating.value
        })
        .where(eq(ratings.id, rating.id.value))
        .returning();
      
      return this.mapToEntity(updated);
    } else {
      // Insert
      const [created] = await db
        .insert(ratings)
        .values({
          userId: rating.userId.value,
          gameId: rating.gameId.value,
          value: rating.value
        })
        .returning();
      
      return this.mapToEntity(created);
    }
  }

  /**
   * Delete a rating
   */
  async delete(id: EntityId): Promise<void> {
    await db
      .delete(ratings)
      .where(eq(ratings.id, id.value));
  }

  /**
   * Map a database rating record to a Rating domain entity
   */
  private mapToEntity(ratingData: typeof ratings.$inferSelect): Rating {
    return Rating.reconstitute(
      ratingData.id,
      ratingData.userId,
      ratingData.gameId,
      ratingData.value
    );
  }
}