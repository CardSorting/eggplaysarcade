import { Rating } from "../../domain/entities/Rating";
import { EntityId } from "../../domain/value-objects/EntityId";
import { RatingRepository } from "../../domain/repositories/RatingRepository";

/**
 * In-memory implementation of the RatingRepository interface
 * Following the Repository pattern from Domain-Driven Design
 */
export class MemRatingRepository implements RatingRepository {
  private ratings: Map<number, Rating>;
  private nextId: number;

  constructor() {
    this.ratings = new Map<number, Rating>();
    this.nextId = 1;
  }

  /**
   * Find all ratings
   */
  async findAll(): Promise<Rating[]> {
    return Array.from(this.ratings.values());
  }

  /**
   * Find a rating by ID
   */
  async findById(id: EntityId): Promise<Rating | null> {
    const rating = this.ratings.get(id.value);
    return rating || null;
  }

  /**
   * Find ratings by game ID
   */
  async findByGameId(gameId: EntityId): Promise<Rating[]> {
    return Array.from(this.ratings.values())
      .filter(rating => rating.gameId.equals(gameId));
  }

  /**
   * Find ratings by user ID
   */
  async findByUserId(userId: EntityId): Promise<Rating[]> {
    return Array.from(this.ratings.values())
      .filter(rating => rating.userId.equals(userId));
  }

  /**
   * Find a rating by game ID and user ID
   */
  async findByGameAndUser(gameId: EntityId, userId: EntityId): Promise<Rating | null> {
    const rating = Array.from(this.ratings.values())
      .find(rating => rating.gameId.equals(gameId) && rating.userId.equals(userId));
    return rating || null;
  }

  /**
   * Save a rating
   */
  async save(rating: Rating): Promise<Rating> {
    // If the rating doesn't have an ID or has an ID but doesn't exist in our map,
    // assign it a new ID
    if (!rating.id || !this.ratings.has(rating.id.value)) {
      const id = new EntityId(this.nextId++);
      const newRating = new Rating(
        id,
        rating.gameId,
        rating.userId,
        rating.stars,
        rating.comment,
        rating.createdAt
      );

      this.ratings.set(id.value, newRating);
      return newRating;
    }

    // Otherwise, update the existing rating
    this.ratings.set(rating.id.value, rating);
    return rating;
  }

  /**
   * Update a rating
   */
  async update(rating: Rating): Promise<Rating> {
    if (!rating.id || !this.ratings.has(rating.id.value)) {
      throw new Error(`Rating with ID ${rating.id?.value} not found`);
    }

    this.ratings.set(rating.id.value, rating);
    return rating;
  }

  /**
   * Delete a rating
   */
  async delete(id: EntityId): Promise<void> {
    if (!this.ratings.has(id.value)) {
      throw new Error(`Rating with ID ${id.value} not found`);
    }

    this.ratings.delete(id.value);
  }
}