import { GameRepository } from '../../domain/repositories/GameRepository';
import { CategoryRepository } from '../../domain/repositories/CategoryRepository';
import { Game } from '../../domain/entities/Game';
import { EntityId } from '../../domain/value-objects/EntityId';

export interface GetGamesQueryParams {
  categoryId?: number;
  searchTerm?: string;
}

/**
 * Query for retrieving games with optional filtering
 * This follows the Query pattern from CQRS
 */
export class GetGamesQuery {
  constructor(
    private readonly gameRepository: GameRepository,
    private readonly categoryRepository: CategoryRepository
  ) {}

  async execute(params?: GetGamesQueryParams): Promise<Game[]> {
    let games: Game[];
    
    if (params?.categoryId) {
      const categoryId = new EntityId(params.categoryId);
      games = await this.gameRepository.findByCategory(categoryId);
    } else if (params?.searchTerm) {
      games = await this.gameRepository.search(params.searchTerm);
    } else {
      games = await this.gameRepository.findAll();
    }
    
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