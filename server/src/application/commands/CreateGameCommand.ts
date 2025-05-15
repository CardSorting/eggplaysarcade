import { GameRepository } from '../../domain/repositories/GameRepository';
import { CategoryRepository } from '../../domain/repositories/CategoryRepository';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { Game } from '../../domain/entities/Game';
import { EntityId } from '../../domain/value-objects/EntityId';

export interface CreateGameCommandParams {
  title: string;
  description: string;
  instructions: string;
  thumbnailUrl: string;
  gameUrl: string;
  categoryId: number;
  userId: number;
  tags?: string[];
}

/**
 * Command for creating a new game
 * This follows the Command pattern from CQRS
 */
export class CreateGameCommand {
  constructor(
    private readonly gameRepository: GameRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly userRepository: UserRepository
  ) {}

  async execute(params: CreateGameCommandParams): Promise<Game> {
    // Validate that category exists
    const categoryId = new EntityId(params.categoryId);
    const category = await this.categoryRepository.findById(categoryId);
    
    if (!category) {
      throw new Error(`Category with ID ${params.categoryId} not found`);
    }
    
    // Validate that user exists
    const userId = new EntityId(params.userId);
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new Error(`User with ID ${params.userId} not found`);
    }
    
    // Create new game entity
    const game = Game.create(
      params.title,
      params.description,
      params.instructions,
      params.thumbnailUrl,
      params.gameUrl,
      categoryId,
      userId,
      params.tags || []
    );
    
    // Save to repository
    return await this.gameRepository.save(game);
  }
}