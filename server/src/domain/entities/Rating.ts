import { EntityId } from '../value-objects/EntityId';

export class Rating {
  private _id: EntityId;
  private _userId: EntityId;
  private _gameId: EntityId;
  private _value: number;

  constructor(
    id: EntityId,
    userId: EntityId,
    gameId: EntityId,
    value: number
  ) {
    this._id = id;
    this._userId = userId;
    this._gameId = gameId;
    
    if (value < 1 || value > 5) {
      throw new Error('Rating value must be between 1 and 5');
    }
    this._value = value;
  }

  // Getters
  get id(): EntityId {
    return this._id;
  }

  get userId(): EntityId {
    return this._userId;
  }

  get gameId(): EntityId {
    return this._gameId;
  }

  get value(): number {
    return this._value;
  }

  // Factory method for creating a new rating
  static create(
    userId: EntityId,
    gameId: EntityId,
    value: number
  ): Rating {
    const id = EntityId.generate();
    return new Rating(id, userId, gameId, value);
  }

  // Factory method for reconstructing a rating from persistence
  static reconstitute(
    id: number,
    userId: number,
    gameId: number,
    value: number
  ): Rating {
    return new Rating(
      new EntityId(id),
      new EntityId(userId),
      new EntityId(gameId),
      value
    );
  }

  // Returns a plain object representation for DTOs
  toDTO(): Record<string, any> {
    return {
      id: this._id.value,
      userId: this._userId.value,
      gameId: this._gameId.value,
      value: this._value
    };
  }
}