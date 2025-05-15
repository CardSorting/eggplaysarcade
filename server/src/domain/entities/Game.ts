import { EntityId } from "../value-objects/EntityId";
import { Rating } from "./Rating";

/**
 * Game entity represents a game in the domain.
 * Following the Entity pattern from Domain-Driven Design.
 */
export class Game {
  private _id: EntityId | null;
  private _title: string;
  private _description: string;
  private _instructions: string;
  private _thumbnailUrl: string;
  private _gameUrl: string;
  private _categoryId: EntityId;
  private _userId: EntityId;
  private _tags: string[];
  private _createdAt: Date;
  private _playCount: number;
  private _ratings: Rating[];

  constructor(
    id: EntityId | null,
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
    ratings: Rating[] = []
  ) {
    this._id = id;
    this._title = title;
    this._description = description;
    this._instructions = instructions;
    this._thumbnailUrl = thumbnailUrl;
    this._gameUrl = gameUrl;
    this._categoryId = categoryId;
    this._userId = userId;
    this._tags = tags;
    this._createdAt = createdAt;
    this._playCount = playCount;
    this._ratings = ratings;
  }

  // Getters
  get id(): EntityId | null {
    return this._id;
  }

  get title(): string {
    return this._title;
  }

  get description(): string {
    return this._description;
  }

  get instructions(): string {
    return this._instructions;
  }

  get thumbnailUrl(): string {
    return this._thumbnailUrl;
  }

  get gameUrl(): string {
    return this._gameUrl;
  }

  get categoryId(): EntityId {
    return this._categoryId;
  }

  get userId(): EntityId {
    return this._userId;
  }

  get tags(): string[] {
    return [...this._tags];
  }

  get createdAt(): Date {
    return new Date(this._createdAt);
  }

  get playCount(): number {
    return this._playCount;
  }

  get ratings(): Rating[] {
    return [...this._ratings];
  }

  // Business methods
  incrementPlayCount(): void {
    this._playCount += 1;
  }

  addRating(rating: Rating): void {
    // Check if the user has already rated this game
    const existingRatingIndex = this._ratings.findIndex(
      r => r.userId.equals(rating.userId)
    );

    // If an existing rating is found, replace it
    if (existingRatingIndex >= 0) {
      this._ratings[existingRatingIndex] = rating;
    } else {
      this._ratings.push(rating);
    }
  }

  removeRating(userId: EntityId): void {
    this._ratings = this._ratings.filter(
      rating => !rating.userId.equals(userId)
    );
  }

  // Utility methods
  getAverageRating(): number {
    if (this._ratings.length === 0) return 0;
    
    const totalStars = this._ratings.reduce(
      (sum, rating) => sum + rating.stars, 0
    );
    
    return totalStars / this._ratings.length;
  }

  // Domain rules validation
  private validateTitle(title: string): boolean {
    return title.length >= 3 && title.length <= 100;
  }

  private validateDescription(description: string): boolean {
    return description.length >= 10 && description.length <= 2000;
  }

  // Factory method for creating a new game
  static create(
    title: string,
    description: string,
    instructions: string,
    thumbnailUrl: string,
    gameUrl: string,
    categoryId: EntityId,
    userId: EntityId,
    tags: string[] = []
  ): Game {
    return new Game(
      null, // ID will be assigned by the repository
      title,
      description,
      instructions,
      thumbnailUrl,
      gameUrl,
      categoryId,
      userId,
      tags,
      new Date(),
      0,
      []
    );
  }
}