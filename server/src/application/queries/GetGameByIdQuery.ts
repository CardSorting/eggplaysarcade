import { GameRepository } from '../../domain/repositories/GameRepository';
import { CategoryRepository } from '../../domain/repositories/CategoryRepository';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { RatingRepository } from '../../domain/repositories/RatingRepository';
import { Game } from '../../domain/entities/Game';
import { EntityId } from '../../domain/value-objects/EntityId';

/**
 * Query for retrieving a specific game by ID
 */
export class GetGameByIdQuery {
  constructor(
    private readonly gameRepository: GameRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly userRepository: UserRepository,
    private readonly ratingRepository: RatingRepository
  ) {}

  async execute(gameId: number): Promise<Game | null> {
    const id = new EntityId(gameId);
    const game = await this.gameRepository.findById(id);
    
    if (!game) {
      return null;
    }
    
    // Enrich the game with related entities
    const category = await this.categoryRepository.findById(game.categoryId);
    if (category) {
      game.setCategory(category);
    }
    
    const user = await this.userRepository.findById(game.userId);
    if (user) {
      game.setUser(user);
    }
    
    const ratings = await this.ratingRepository.findByGameId(id);
    if (ratings.length > 0) {
      game.setRatings(ratings);
    }
    
    return game;
  }
}