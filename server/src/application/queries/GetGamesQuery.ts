import { GameRepository } from "../../domain/repositories/GameRepository";
import { CategoryRepository } from "../../domain/repositories/CategoryRepository";
import { GameDTO } from "../dto/GameDTO";

/**
 * Query for retrieving all games
 * Following the Query pattern from CQRS
 */
export class GetGamesQuery {
  private readonly gameRepository: GameRepository;
  private readonly categoryRepository: CategoryRepository;

  constructor(
    gameRepository: GameRepository,
    categoryRepository: CategoryRepository
  ) {
    this.gameRepository = gameRepository;
    this.categoryRepository = categoryRepository;
  }

  /**
   * Execute the query to get all games
   */
  async execute(): Promise<GameDTO[]> {
    // Get all games from the repository
    const games = await this.gameRepository.findAll();
    
    // For each game, get its category
    const result: GameDTO[] = [];
    
    for (const game of games) {
      const category = game.categoryId 
        ? await this.categoryRepository.findById(game.categoryId)
        : null;
        
      const dto = GameDTO.fromEntityWithRelations(game, category || undefined);
      result.push(dto);
    }
    
    return result;
  }
}