import { EntityId } from "../value-objects/EntityId";

/**
 * Rating entity representing a user rating for a game
 * Following the Domain-Driven Design principles
 */
export class Rating {
  private _id: EntityId | null;
  private _userId: EntityId;
  private _gameId: EntityId;
  private _value: number;
  private _createdAt: Date;

  private constructor(
    id: EntityId | null,
    userId: EntityId,
    gameId: EntityId,
    value: number,
    createdAt: Date
  ) {
    if (value < 1 || value > 5) {
      throw new Error("Rating value must be between 1 and 5");
    }
    
    this._id = id;
    this._userId = userId;
    this._gameId = gameId;
    this._value = value;
    this._createdAt = createdAt;
  }

  /**
   * Create a new rating
   */
  public static create(userId: EntityId, gameId: EntityId, value: number): Rating {
    return new Rating(null, userId, gameId, value, new Date());
  }

  /**
   * Reconstruct a rating from persistence
   */
  public static reconstitute(
    id: number,
    userId: number,
    gameId: number,
    value: number,
    createdAt: Date
  ): Rating {
    return new Rating(
      new EntityId(id),
      new EntityId(userId),
      new EntityId(gameId),
      value,
      createdAt
    );
  }

  /**
   * Get the ID of this rating
   */
  public get id(): EntityId | null {
    return this._id;
  }

  /**
   * Get the user ID for this rating
   */
  public get userId(): EntityId {
    return this._userId;
  }

  /**
   * Get the game ID for this rating
   */
  public get gameId(): EntityId {
    return this._gameId;
  }

  /**
   * Get the value of this rating
   */
  public get value(): number {
    return this._value;
  }

  /**
   * Get the creation date of this rating
   */
  public get createdAt(): Date {
    return this._createdAt;
  }

  /**
   * Update the value of this rating
   */
  public updateValue(value: number): void {
    if (value < 1 || value > 5) {
      throw new Error("Rating value must be between 1 and 5");
    }
    this._value = value;
  }
}