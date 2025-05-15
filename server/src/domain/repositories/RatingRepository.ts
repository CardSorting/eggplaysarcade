import { EntityId } from "../value-objects/EntityId";
import { Rating } from "../entities/Rating";

/**
 * Repository interface for Rating entities
 * Following the Repository pattern from Domain-Driven Design
 */
export interface RatingRepository {
  /**
   * Find all ratings
   */
  findAll(): Promise<Rating[]>;
  
  /**
   * Find a rating by ID
   */
  findById(id: EntityId): Promise<Rating | null>;
  
  /**
   * Find ratings by game ID
   */
  findByGameId(gameId: EntityId): Promise<Rating[]>;
  
  /**
   * Find ratings by user ID
   */
  findByUserId(userId: EntityId): Promise<Rating[]>;
  
  /**
   * Find a specific rating by game ID and user ID
   */
  findByGameAndUser(gameId: EntityId, userId: EntityId): Promise<Rating | null>;
  
  /**
   * Create a new rating
   */
  createRating(userId: EntityId, gameId: EntityId, value: number): Promise<Rating>;
  
  /**
   * Save a rating (create or update)
   */
  save(rating: Rating): Promise<Rating>;
  
  /**
   * Delete a rating
   */
  delete(id: EntityId): Promise<void>;
}