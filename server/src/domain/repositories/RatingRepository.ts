import { Rating } from "../entities/Rating";
import { EntityId } from "../value-objects/EntityId";

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
   * Find a rating by game ID and user ID
   */
  findByGameAndUser(gameId: EntityId, userId: EntityId): Promise<Rating | null>;
  
  /**
   * Save a rating
   */
  save(rating: Rating): Promise<Rating>;
  
  /**
   * Update a rating
   */
  update(rating: Rating): Promise<Rating>;
  
  /**
   * Delete a rating
   */
  delete(id: EntityId): Promise<void>;
}