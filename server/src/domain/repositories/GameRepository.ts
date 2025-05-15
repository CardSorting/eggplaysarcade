import { Game } from '../entities/Game';
import { EntityId } from '../value-objects/EntityId';

/**
 * Repository interface for Game entities
 * This follows the Repository Pattern from DDD
 */
export interface GameRepository {
  findAll(): Promise<Game[]>;
  findById(id: EntityId): Promise<Game | null>;
  findByCategory(categoryId: EntityId): Promise<Game[]>;
  findFeatured(limit: number): Promise<Game[]>;
  findPopular(limit: number): Promise<Game[]>;
  search(query: string): Promise<Game[]>;
  save(game: Game): Promise<Game>;
  updatePlayers(id: EntityId, increment: number): Promise<Game | null>;
}