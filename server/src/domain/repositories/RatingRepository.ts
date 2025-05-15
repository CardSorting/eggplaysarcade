import { Rating } from '../entities/Rating';
import { EntityId } from '../value-objects/EntityId';

/**
 * Repository interface for Rating entities
 */
export interface RatingRepository {
  findByGameId(gameId: EntityId): Promise<Rating[]>;
  save(rating: Rating): Promise<Rating>;
}