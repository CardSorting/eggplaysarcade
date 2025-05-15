import { GameRepository } from '../../domain/repositories/GameRepository';
import { CategoryRepository } from '../../domain/repositories/CategoryRepository';
import { Game } from '../../domain/entities/Game';

/**
 * Query for retrieving popular games
 */
export class GetPopularGamesQuery {
  constructor(
    private readonly gameRepository: GameRepository,
    private readonly categoryRepository: CategoryRepository
  ) {}

  async execute(limit: number = 3): Promise<Game[]> {
    const games = await this.gameRepository.findPopular(limit);
    
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