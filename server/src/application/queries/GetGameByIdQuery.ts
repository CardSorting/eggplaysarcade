import { GameRepository } from "../../domain/repositories/GameRepository";
import { CategoryRepository } from "../../domain/repositories/CategoryRepository";
import { UserRepository } from "../../domain/repositories/UserRepository";
import { RatingRepository } from "../../domain/repositories/RatingRepository";
import { EntityId } from "../../domain/value-objects/EntityId";
import { GameDTO } from "../dto/GameDTO";

/**
 * Query for retrieving a game by ID
 * Following the Query pattern from CQRS
 */
export class GetGameByIdQuery {
  private readonly gameRepository: GameRepository;
  private readonly categoryRepository: CategoryRepository;
  private readonly userRepository: UserRepository;
  private readonly ratingRepository: RatingRepository;

  constructor(
    gameRepository: GameRepository,
    categoryRepository: CategoryRepository,
    userRepository: UserRepository,
    ratingRepository: RatingRepository
  ) {
    this.gameRepository = gameRepository;
    this.categoryRepository = categoryRepository;
    this.userRepository = userRepository;
    this.ratingRepository = ratingRepository;
  }

  /**
   * Execute the query to get a game by ID
   */
  async execute(id: number): Promise<GameDTO | null> {
    // Get the game from the repository
    const game = await this.gameRepository.findById(new EntityId(id));
    
    if (!game) {
      return null;
    }
    
    // Get the game's category
    const category = await this.categoryRepository.findById(game.categoryId);
    
    // Get the game's user
    const user = await this.userRepository.findById(game.userId);
    
    // Get the game's ratings
    const ratings = await this.ratingRepository.findByGameId(game.id!);
    
    // Return the game with its related entities
    return GameDTO.fromEntityWithRelations(game, category || undefined, user || undefined, ratings);
  }
}