import { GameRepository } from '../../domain/repositories/GameRepository';
import { CategoryRepository } from '../../domain/repositories/CategoryRepository';
import { Game } from '../../domain/entities/Game';

/**
 * Query for retrieving featured games
 */
export class GetFeaturedGamesQuery {
  constructor(
    private readonly gameRepository: GameRepository,
    private readonly categoryRepository: CategoryRepository
  ) {}

  async execute(limit: number = 4): Promise<Game[]> {
    const games = await this.gameRepository.findFeatured(limit);
    
    // Enrich games with their category information
    for (const game of games) {
      const category = await this.categoryRepository.findById(game.categoryId);
      if (category) {
        game.setCategory(category);
      }
    }
    
    return games;
  }
}