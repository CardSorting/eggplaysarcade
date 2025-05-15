import { Game } from "../entities/Game";
import { EntityId } from "../value-objects/EntityId";

/**
 * Repository interface for Game entities
 * Following the Repository pattern from Domain-Driven Design
 */
export interface GameRepository {
  /**
   * Find all games
   */
  findAll(): Promise<Game[]>;
  
  /**
   * Find a game by its ID
   */
  findById(id: EntityId): Promise<Game | null>;
  
  /**
   * Find games by category ID
   */
  findByCategory(categoryId: EntityId): Promise<Game[]>;
  
  /**
   * Find featured games
   */
  findFeatured(limit: number): Promise<Game[]>;
  
  /**
   * Find popular games by play count
   */
  findPopular(limit: number): Promise<Game[]>;
  
  /**
   * Save a game (create or update)
   */
  save(game: Game): Promise<Game>;
  
  /**
   * Delete a game
   */
  delete(id: EntityId): Promise<void>;
  
  /**
   * Search for games by title or description
   */
  search(query: string): Promise<Game[]>;
}