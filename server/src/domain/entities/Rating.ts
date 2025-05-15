import { EntityId } from "../value-objects/EntityId";

/**
 * Rating entity following the Domain-Driven Design (DDD) approach
 * This is a core domain entity representing a game rating in the system
 */
export class Rating {
  id: EntityId;
  userId: EntityId;
  gameId: EntityId;
  value: number;
  createdAt: Date;

  /**
   * Create a new Rating entity
   */
  constructor(
    id: EntityId,
    userId: EntityId,
    gameId: EntityId,
    value: number,
    createdAt: Date = new Date()
  ) {
    if (value < 1 || value > 5) {
      throw new Error('Rating value must be between 1 and 5');
    }
    
    this.id = id;
    this.userId = userId;
    this.gameId = gameId;
    this.value = value;
    this.createdAt = createdAt;
  }
}