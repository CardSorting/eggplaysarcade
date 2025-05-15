import { EntityId } from "../value-objects/EntityId";
import { Game } from "./Game";
import { Rating } from "./Rating";

/**
 * User entity represents a user in the domain.
 * Following the Entity pattern from Domain-Driven Design.
 */
export class User {
  private _id: EntityId | null;
  private _username: string;
  private _email: string;
  private _passwordHash: string;
  private _avatarUrl: string | null;
  private _bio: string | null;
  private _games: Game[];
  private _ratings: Rating[];

  constructor(
    id: EntityId | null,
    username: string,
    email: string,
    passwordHash: string,
    avatarUrl: string | null = null,
    bio: string | null = null,
    games: Game[] = [],
    ratings: Rating[] = []
  ) {
    this._id = id;
    this._username = username;
    this._email = email;
    this._passwordHash = passwordHash;
    this._avatarUrl = avatarUrl;
    this._bio = bio;
    this._games = games;
    this._ratings = ratings;
  }

  // Getters
  get id(): EntityId | null {
    return this._id;
  }

  get username(): string {
    return this._username;
  }

  get email(): string {
    return this._email;
  }

  get passwordHash(): string {
    return this._passwordHash;
  }

  get avatarUrl(): string | null {
    return this._avatarUrl;
  }

  get bio(): string | null {
    return this._bio;
  }

  get games(): Game[] {
    return [...this._games];
  }

  get ratings(): Rating[] {
    return [...this._ratings];
  }

  // Business methods
  updateProfile(username: string, email: string, bio: string | null): void {
    this._username = username;
    this._email = email;
    this._bio = bio;
  }

  updateAvatar(avatarUrl: string): void {
    this._avatarUrl = avatarUrl;
  }

  addGame(game: Game): void {
    if (!this._games.some(g => g.id && g.id.equals(game.id!))) {
      this._games.push(game);
    }
  }

  removeGame(gameId: EntityId): void {
    this._games = this._games.filter(
      game => game.id && !game.id.equals(gameId)
    );
  }

  addRating(rating: Rating): void {
    const existingRatingIndex = this._ratings.findIndex(
      r => r.gameId.equals(rating.gameId)
    );

    if (existingRatingIndex >= 0) {
      this._ratings[existingRatingIndex] = rating;
    } else {
      this._ratings.push(rating);
    }
  }

  removeRating(gameId: EntityId): void {
    this._ratings = this._ratings.filter(
      rating => !rating.gameId.equals(gameId)
    );
  }

  // Domain rules validation
  private validateUsername(username: string): boolean {
    return username.length >= 3 && username.length <= 30;
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Factory method for creating a new user
  static create(
    username: string,
    email: string,
    passwordHash: string,
    avatarUrl: string | null = null,
    bio: string | null = null
  ): User {
    return new User(
      null, // ID will be assigned by the repository
      username,
      email,
      passwordHash,
      avatarUrl,
      bio,
      [],
      []
    );
  }
}