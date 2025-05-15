import { Game } from "../../domain/entities/Game";
import { EntityId } from "../../domain/value-objects/EntityId";
import { GameRepository } from "../../domain/repositories/GameRepository";
import { CategoryRepository } from "../../domain/repositories/CategoryRepository";
import { UserRepository } from "../../domain/repositories/UserRepository";
import { GameDTO } from "../dto/GameDTO";

/**
 * Command for creating a new game
 * Following the Command pattern from CQRS
 */
export class CreateGameCommand {
  private readonly gameRepository: GameRepository;
  private readonly categoryRepository: CategoryRepository;
  private readonly userRepository: UserRepository;

  constructor(
    gameRepository: GameRepository,
    categoryRepository: CategoryRepository,
    userRepository: UserRepository
  ) {
    this.gameRepository = gameRepository;
    this.categoryRepository = categoryRepository;
    this.userRepository = userRepository;
  }

  /**
   * Execute the command to create a new game
   */
  async execute(
    title: string,
    description: string,
    instructions: string,
    thumbnailUrl: string,
    gameUrl: string,
    categoryId: number,
    userId: number,
    tags: string[] = []
  ): Promise<GameDTO> {
    // Validate that the category exists
    const category = await this.categoryRepository.findById(new EntityId(categoryId));
    if (!category) {
      throw new Error(`Category with ID ${categoryId} not found`);
    }

    // Validate that the user exists
    const user = await this.userRepository.findById(new EntityId(userId));
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    // Create a new game entity
    const game = Game.create(
      title,
      description,
      instructions,
      thumbnailUrl,
      gameUrl,
      new EntityId(categoryId),
      new EntityId(userId),
      tags
    );

    // Save the game entity
    const savedGame = await this.gameRepository.save(game);

    // Return the result as DTO
    return GameDTO.fromEntityWithRelations(savedGame, category, user);
  }
}