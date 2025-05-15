import { GameRepository } from '../../domain/repositories/GameRepository';
import { Game } from '../../domain/entities/Game';
import { EntityId } from '../../domain/value-objects/EntityId';

/**
 * In-memory implementation of the GameRepository
 * This is an example of the Adapter pattern, where we adapt our persistent storage
 * to match the interface expected by our domain
 */
export class MemGameRepository implements GameRepository {
  private games: Map<number, Game>;
  
  constructor() {
    this.games = new Map<number, Game>();
  }

  async findAll(): Promise<Game[]> {
    return Array.from(this.games.values());
  }

  async findById(id: EntityId): Promise<Game | null> {
    const game = this.games.get(id.value);
    return game || null;
  }

  async findByCategory(categoryId: EntityId): Promise<Game[]> {
    return Array.from(this.games.values()).filter(
      game => game.categoryId.value === categoryId.value
    );
  }

  async findFeatured(limit: number): Promise<Game[]> {
    return Array.from(this.games.values())
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(0, limit);
  }

  async findPopular(limit: number): Promise<Game[]> {
    return Array.from(this.games.values())
      .sort((a, b) => b.players - a.players)
      .slice(0, limit);
  }

  async search(query: string): Promise<Game[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.games.values()).filter(game => 
      game.title.toLowerCase().includes(lowercaseQuery) || 
      game.description.toLowerCase().includes(lowercaseQuery) || 
      game.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  async save(game: Game): Promise<Game> {
    this.games.set(game.id.value, game);
    return game;
  }

  async updatePlayers(id: EntityId, increment: number): Promise<Game | null> {
    const game = await this.findById(id);
    
    if (!game) {
      return null;
    }
    
    game.incrementPlayers(increment);
    return this.save(game);
  }
}