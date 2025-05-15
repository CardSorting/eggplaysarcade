import { EntityId } from '../value-objects/EntityId';
import { Game } from './Game';

export class User {
  private _id: EntityId;
  private _username: string;
  private _password: string; // In a real app, this would be a hashed password
  private _games: Game[] = [];

  constructor(
    id: EntityId,
    username: string,
    password: string
  ) {
    this._id = id;
    this._username = username;
    this._password = password;
  }

  // Getters
  get id(): EntityId {
    return this._id;
  }

  get username(): string {
    return this._username;
  }

  get games(): Game[] {
    return [...this._games];
  }

  // Domain methods
  setGames(games: Game[]): void {
    this._games = [...games];
  }

  addGame(game: Game): void {
    this._games.push(game);
  }

  // Password verification (simplified for demo)
  verifyPassword(password: string): boolean {
    // In a real app, this would use a secure password verification method
    return this._password === password;
  }

  // Factory method for creating a new user
  static create(
    username: string,
    password: string
  ): User {
    const id = EntityId.generate();
    return new User(id, username, password);
  }

  // Factory method for reconstructing a user from persistence
  static reconstitute(
    id: number,
    username: string,
    password: string
  ): User {
    return new User(new EntityId(id), username, password);
  }

  // Returns a plain object representation for DTOs
  toDTO(): Record<string, any> {
    return {
      id: this._id.value,
      username: this._username,
      // Deliberately not including password in DTO for security
    };
  }
}