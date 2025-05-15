import { Rating } from './Rating';
import { User } from './User';
import { Category } from './Category';
import { EntityId } from '../value-objects/EntityId';

export class Game {
  private _id: EntityId;
  private _title: string;
  private _description: string;
  private _instructions: string;
  private _thumbnailUrl: string;
  private _gameUrl: string;
  private _categoryId: EntityId;
  private _tags: string[] = [];
  private _publishedAt: Date;
  private _userId: EntityId;
  private _rating: number = 0;
  private _players: number = 0;
  private _category?: Category;
  private _user?: User;
  private _ratings: Rating[] = [];

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
    publishedAt: Date = new Date(),
    rating: number = 0,
    players: number = 0
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
    this._publishedAt = publishedAt;
    this._rating = rating;
    this._players = players;
  }

  // Getters
  get id(): EntityId {
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

  get tags(): string[] {
    return [...this._tags];
  }

  get publishedAt(): Date {
    return new Date(this._publishedAt);
  }

  get userId(): EntityId {
    return this._userId;
  }

  get rating(): number {
    return this._rating;
  }

  get players(): number {
    return this._players;
  }

  get category(): Category | undefined {
    return this._category;
  }

  get user(): User | undefined {
    return this._user;
  }

  get ratings(): Rating[] {
    return [...this._ratings];
  }

  // Setters and domain methods
  setCategory(category: Category): void {
    this._category = category;
  }

  setUser(user: User): void {
    this._user = user;
  }

  setRatings(ratings: Rating[]): void {
    this._ratings = [...ratings];
    this.recalculateRating();
  }

  addRating(rating: Rating): void {
    this._ratings.push(rating);
    this.recalculateRating();
  }

  incrementPlayers(increment: number = 1): void {
    this._players += increment;
  }

  private recalculateRating(): void {
    if (this._ratings.length === 0) {
      this._rating = 0;
      return;
    }

    const sum = this._ratings.reduce((total, rating) => total + rating.value, 0);
    this._rating = Math.round((sum / this._ratings.length) * 10) / 10; // Round to 1 decimal place
  }

  // Factory method for creating a new game instance
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
    const id = EntityId.generate();
    const now = new Date();
    
    return new Game(
      id,
      title,
      description,
      instructions,
      thumbnailUrl,
      gameUrl,
      categoryId,
      userId,
      tags,
      now,
      0,
      0
    );
  }

  // Factory method for reconstructing a game from persistence
  static reconstitute(
    id: number,
    title: string,
    description: string,
    instructions: string,
    thumbnailUrl: string,
    gameUrl: string,
    categoryId: number,
    userId: number,
    tags: string[] = [],
    publishedAt: Date,
    rating: number,
    players: number
  ): Game {
    return new Game(
      new EntityId(id),
      title,
      description,
      instructions,
      thumbnailUrl,
      gameUrl,
      new EntityId(categoryId),
      new EntityId(userId),
      tags,
      publishedAt,
      rating,
      players
    );
  }

  // Returns a plain object representation of the game for DTOs
  toDTO(): Record<string, any> {
    return {
      id: this._id.value,
      title: this._title,
      description: this._description,
      instructions: this._instructions,
      thumbnailUrl: this._thumbnailUrl,
      gameUrl: this._gameUrl,
      categoryId: this._categoryId.value,
      tags: [...this._tags],
      publishedAt: this._publishedAt,
      userId: this._userId.value,
      rating: this._rating,
      players: this._players,
      category: this._category ? this._category.toDTO() : undefined,
      user: this._user ? this._user.toDTO() : undefined
    };
  }
}