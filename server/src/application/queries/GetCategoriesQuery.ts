import { CategoryRepository } from '../../domain/repositories/CategoryRepository';
import { GameRepository } from '../../domain/repositories/GameRepository';
import { Category } from '../../domain/entities/Category';

/**
 * Query for retrieving all categories
 */
export class GetCategoriesQuery {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly gameRepository: GameRepository
  ) {}

  async execute(includeGames: boolean = false): Promise<Category[]> {
    const categories = await this.categoryRepository.findAll();
    
    if (includeGames) {
      // Enrich categories with their games
      for (const category of categories) {
        const games = await this.gameRepository.findByCategory(category.id);
        category.setGames(games);
      }
    }
    
    return categories;
  }
}