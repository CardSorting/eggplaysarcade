import { RatingRepository } from '../../domain/repositories/RatingRepository';
import { GameRepository } from '../../domain/repositories/GameRepository';
import { Rating } from '../../domain/entities/Rating';
import { EntityId } from '../../domain/value-objects/EntityId';

export interface CreateRatingCommandParams {
  userId: number;
  gameId: number;
  value: number;
}

/**
 * Command for creating a new rating
 */
export class CreateRatingCommand {
  constructor(
    private readonly ratingRepository: RatingRepository,
    private readonly gameRepository: GameRepository
  ) {}

  async execute(params: CreateRatingCommandParams): Promise<Rating> {
    const gameId = new EntityId(params.gameId);
    const userId = new EntityId(params.userId);
    
    // Validate that game exists
    const game = await this.gameRepository.findById(gameId);
    if (!game) {
      throw new Error(`Game with ID ${params.gameId} not found`);
    }
    
    // Create rating entity
    const rating = Rating.create(
      userId,
      gameId,
      params.value
    );
    
    // Save to repository
    const savedRating = await this.ratingRepository.save(rating);
    
    // Update game with new rating
    const ratings = await this.ratingRepository.findByGameId(gameId);
    game.setRatings(ratings);
    await this.gameRepository.save(game);
    
    return savedRating;
  }
}