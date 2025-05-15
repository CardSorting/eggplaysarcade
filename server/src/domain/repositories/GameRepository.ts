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
   * Find a game by ID
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
   * Find popular games
   */
  findPopular(limit: number): Promise<Game[]>;
  
  /**
   * Search games by keyword
   */
  search(query: string): Promise<Game[]>;
  
  /**
   * Save a game
   */
  save(game: Game): Promise<Game>;
  
  /**
   * Update a game
   */
  update(game: Game): Promise<Game>;
  
  /**
   * Delete a game
   */
  delete(id: EntityId): Promise<void>;
}