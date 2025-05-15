import { EntityId } from "../value-objects/EntityId";

/**
 * Rating entity represents a user's rating of a game in the domain.
 * Following the Entity pattern from Domain-Driven Design.
 */
export class Rating {
  private _id: EntityId | null;
  private _gameId: EntityId;
  private _userId: EntityId;
  private _stars: number;
  private _comment: string | null;
  private _createdAt: Date;

  constructor(
    id: EntityId | null,
    gameId: EntityId,
    userId: EntityId,
    stars: number,
    comment: string | null = null,
    createdAt: Date = new Date()
  ) {
    this.validateStars(stars);
    
    this._id = id;
    this._gameId = gameId;
    this._userId = userId;
    this._stars = stars;
    this._comment = comment;
    this._createdAt = createdAt;
  }

  // Getters
  get id(): EntityId | null {
    return this._id;
  }

  get gameId(): EntityId {
    return this._gameId;
  }

  get userId(): EntityId {
    return this._userId;
  }

  get stars(): number {
    return this._stars;
  }

  get comment(): string | null {
    return this._comment;
  }

  get createdAt(): Date {
    return new Date(this._createdAt);
  }

  // Business methods
  updateRating(stars: number, comment: string | null): void {
    this.validateStars(stars);
    
    this._stars = stars;
    this._comment = comment;
  }

  // Domain rules validation
  private validateStars(stars: number): void {
    if (stars < 1 || stars > 5) {
      throw new Error('Rating stars must be between 1 and 5');
    }
  }

  // Factory method for creating a new rating
  static create(
    gameId: EntityId,
    userId: EntityId,
    stars: number,
    comment: string | null = null
  ): Rating {
    return new Rating(
      null, // ID will be assigned by the repository
      gameId,
      userId,
      stars,
      comment,
      new Date()
    );
  }
}