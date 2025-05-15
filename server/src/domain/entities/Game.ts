import { EntityId } from "../value-objects/EntityId";

/**
 * Game entity representing a gaming product in the domain
 * Following the Domain-Driven Design principles
 */
export class Game {
  private _id: EntityId | null;
  private _title: string;
  private _description: string;
  private _instructions: string;
  private _thumbnailUrl: string;
  private _gameUrl: string;
  private _categoryId: EntityId;
  private _tags: string[] | null;
  private _publishedAt: Date;
  private _userId: EntityId;
  private _rating: number;
  private _playerCount: number;

  private constructor(
    id: EntityId | null,
    title: string,
    description: string,
    instructions: string,
    thumbnailUrl: string, 
    gameUrl: string,
    categoryId: EntityId,
    tags: string[] | null,
    publishedAt: Date,
    userId: EntityId,
    rating: number = 0,
    playerCount: number = 0
  ) {
    this._id = id;
    this._title = title;
    this._description = description;
    this._instructions = instructions;
    this._thumbnailUrl = thumbnailUrl;
    this._gameUrl = gameUrl;
    this._categoryId = categoryId;
    this._tags = tags;
    this._publishedAt = publishedAt;
    this._userId = userId;
    this._rating = rating;
    this._playerCount = playerCount;
  }

  /**
   * Create a new game entity
   */
  public static create(
    title: string,
    description: string,
    instructions: string,
    thumbnailUrl: string,
    gameUrl: string,
    categoryId: EntityId,
    userId: EntityId,
    tags: string[] | null = null
  ): Game {
    return new Game(
      null,
      title,
      description,
      instructions,
      thumbnailUrl,
      gameUrl,
      categoryId,
      tags,
      new Date(),
      userId
    );
  }

  /**
   * Reconstruct an existing game entity from persistence
   */
  public static reconstitute(
    id: number,
    title: string,
    description: string,
    instructions: string,
    thumbnailUrl: string,
    gameUrl: string,
    categoryId: number,
    tags: string[] | null,
    publishedAt: Date,
    userId: number,
    rating: number | null,
    playerCount: number | null
  ): Game {
    return new Game(
      new EntityId(id),
      title,
      description,
      instructions,
      thumbnailUrl,
      gameUrl,
      new EntityId(categoryId),
      tags,
      publishedAt,
      new EntityId(userId),
      rating || 0,
      playerCount || 0
    );
  }

  /**
   * Increment player count for this game
   */
  public incrementPlayers(count: number = 1): void {
    this._playerCount += count;
  }

  /**
   * Update the rating of this game
   */
  public updateRating(newRating: number): void {
    this._rating = newRating;
  }

  /**
   * Get the ID of this game
   */
  public get id(): EntityId | null {
    return this._id;
  }

  /**
   * Get the title of this game
   */
  public get title(): string {
    return this._title;
  }

  /**
   * Get the description of this game
   */
  public get description(): string {
    return this._description;
  }

  /**
   * Get the instructions for this game
   */
  public get instructions(): string {
    return this._instructions;
  }

  /**
   * Get the thumbnail URL for this game
   */
  public get thumbnailUrl(): string {
    return this._thumbnailUrl;
  }

  /**
   * Get the game URL for this game
   */
  public get gameUrl(): string {
    return this._gameUrl;
  }

  /**
   * Get the category ID for this game
   */
  public get categoryId(): EntityId {
    return this._categoryId;
  }

  /**
   * Get the tags for this game
   */
  public get tags(): string[] | null {
    return this._tags;
  }

  /**
   * Get the published date for this game
   */
  public get publishedAt(): Date {
    return this._publishedAt;
  }

  /**
   * Get the user ID for this game
   */
  public get userId(): EntityId {
    return this._userId;
  }

  /**
   * Get the rating for this game
   */
  public get rating(): number {
    return this._rating;
  }

  /**
   * Get the player count for this game
   */
  public get playerCount(): number {
    return this._playerCount;
  }
}