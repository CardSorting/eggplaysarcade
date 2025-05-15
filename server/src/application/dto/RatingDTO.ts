import { Rating } from '../../domain/entities/Rating';

/**
 * DTO for Rating entities
 */
export class RatingDTO {
  id: number;
  userId: number;
  gameId: number;
  value: number;

  constructor(rating: Rating) {
    this.id = rating.id.value;
    this.userId = rating.userId.value;
    this.gameId = rating.gameId.value;
    this.value = rating.value;
  }

  static fromEntity(rating: Rating): RatingDTO {
    return new RatingDTO(rating);
  }

  static fromEntities(ratings: Rating[]): RatingDTO[] {
    return ratings.map(rating => RatingDTO.fromEntity(rating));
  }
}