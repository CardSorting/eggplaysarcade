import { RatingRepository } from '../../domain/repositories/RatingRepository';
import { Rating } from '../../domain/entities/Rating';
import { EntityId } from '../../domain/value-objects/EntityId';

/**
 * In-memory implementation of the RatingRepository
 */
export class MemRatingRepository implements RatingRepository {
  private ratings: Map<number, Rating>;
  
  constructor() {
    this.ratings = new Map<number, Rating>();
  }

  async findByGameId(gameId: EntityId): Promise<Rating[]> {
    return Array.from(this.ratings.values()).filter(
      rating => rating.gameId.value === gameId.value
    );
  }

  async save(rating: Rating): Promise<Rating> {
    this.ratings.set(rating.id.value, rating);
    return rating;
  }
}