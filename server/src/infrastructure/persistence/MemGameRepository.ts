import { Game } from "../../domain/entities/Game";
import { EntityId } from "../../domain/value-objects/EntityId";
import { GameRepository } from "../../domain/repositories/GameRepository";

/**
 * In-memory implementation of the GameRepository interface
 * Following the Repository pattern from Domain-Driven Design
 */
export class MemGameRepository implements GameRepository {
  private games: Map<number, Game>;
  private nextId: number;

  constructor() {
    this.games = new Map<number, Game>();
    this.nextId = 1;
  }

  /**
   * Find all games
   */
  async findAll(): Promise<Game[]> {
    return Array.from(this.games.values());
  }

  /**
   * Find a game by ID
   */
  async findById(id: EntityId): Promise<Game | null> {
    const game = this.games.get(id.value);
    return game || null;
  }

  /**
   * Find games by category ID
   */
  async findByCategory(categoryId: EntityId): Promise<Game[]> {
    return Array.from(this.games.values())
      .filter(game => game.categoryId.equals(categoryId));
  }

  /**
   * Find featured games
   * In this implementation, we'll sort by the newest games
   */
  async findFeatured(limit: number): Promise<Game[]> {
    return Array.from(this.games.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  /**
   * Find popular games
   * In this implementation, we'll sort by play count
   */
  async findPopular(limit: number): Promise<Game[]> {
    return Array.from(this.games.values())
      .sort((a, b) => b.playCount - a.playCount)
      .slice(0, limit);
  }

  /**
   * Search games by keyword
   */
  async search(query: string): Promise<Game[]> {
    const normalizedQuery = query.toLowerCase();
    return Array.from(this.games.values())
      .filter(game => 
        game.title.toLowerCase().includes(normalizedQuery) ||
        game.description.toLowerCase().includes(normalizedQuery) ||
        game.tags.some(tag => tag.toLowerCase().includes(normalizedQuery))
      );
  }

  /**
   * Save a game
   */
  async save(game: Game): Promise<Game> {
    // If the game doesn't have an ID or has an ID but doesn't exist in our map,
    // assign it a new ID
    if (!game.id || !this.games.has(game.id.value)) {
      const id = new EntityId(this.nextId++);
      const newGame = new Game(
        id,
        game.title,
        game.description,
        game.instructions,
        game.thumbnailUrl,
        game.gameUrl,
        game.categoryId,
        game.userId,
        game.tags,
        game.createdAt,
        game.playCount,
        game.ratings
      );

      this.games.set(id.value, newGame);
      return newGame;
    }

    // Otherwise, update the existing game
    this.games.set(game.id.value, game);
    return game;
  }

  /**
   * Update a game
   */
  async update(game: Game): Promise<Game> {
    if (!game.id || !this.games.has(game.id.value)) {
      throw new Error(`Game with ID ${game.id?.value} not found`);
    }

    this.games.set(game.id.value, game);
    return game;
  }

  /**
   * Delete a game
   */
  async delete(id: EntityId): Promise<void> {
    if (!this.games.has(id.value)) {
      throw new Error(`Game with ID ${id.value} not found`);
    }

    this.games.delete(id.value);
  }
}