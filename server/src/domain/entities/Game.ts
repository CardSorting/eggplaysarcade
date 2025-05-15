import { EntityId } from "../value-objects/EntityId";
import { Rating } from "./Rating";

/**
 * Game entity following the Domain-Driven Design (DDD) approach
 * This is a core domain entity representing a game in the system
 */
export class Game {
  id: EntityId;
  title: string;
  description: string;
  instructions: string;
  thumbnailUrl: string;
  gameUrl: string;
  createdAt: Date;
  playCount: number;
  categoryId: EntityId;
  userId: EntityId;
  tags: string[];
  ratings?: Rating[];

  /**
   * Create a new Game entity
   */
  constructor(
    id: EntityId,
    title: string,
    description: string,
    instructions: string,
    thumbnailUrl: string,
    gameUrl: string,
    categoryId: EntityId,
    userId: EntityId,
    tags: string[] = [],
    createdAt: Date = new Date(),
    playCount: number = 0,
    ratings?: Rating[]
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.instructions = instructions;
    this.thumbnailUrl = thumbnailUrl;
    this.gameUrl = gameUrl;
    this.createdAt = createdAt;
    this.playCount = playCount;
    this.categoryId = categoryId;
    this.userId = userId;
    this.tags = tags;
    this.ratings = ratings;
  }

  /**
   * Increment the play count
   * @param amount Number to increment by (default: 1)
   */
  incrementPlayCount(amount: number = 1): void {
    this.playCount += amount;
  }

  /**
   * Add a rating to this game
   * @param rating Rating to add
   */
  addRating(rating: Rating): void {
    if (!this.ratings) {
      this.ratings = [];
    }
    this.ratings.push(rating);
  }

  /**
   * Calculate the average rating
   * @returns Average rating or null if no ratings
   */
  getAverageRating(): number | null {
    if (!this.ratings || this.ratings.length === 0) {
      return null;
    }
    
    const sum = this.ratings.reduce((acc, rating) => acc + rating.value, 0);
    return parseFloat((sum / this.ratings.length).toFixed(1));
  }
}