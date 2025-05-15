import { EntityId } from "../value-objects/EntityId";
import { Game } from "./Game";

/**
 * Category entity represents a game category in the domain.
 * Following the Entity pattern from Domain-Driven Design.
 */
export class Category {
  private _id: EntityId | null;
  private _name: string;
  private _icon: string;
  private _games: Game[];

  constructor(
    id: EntityId | null,
    name: string,
    icon: string,
    games: Game[] = []
  ) {
    this._id = id;
    this._name = name;
    this._icon = icon;
    this._games = games;
  }

  // Getters
  get id(): EntityId | null {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get icon(): string {
    return this._icon;
  }

  get games(): Game[] {
    return [...this._games];
  }

  // Business methods
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

  // Domain rules validation
  private validateName(name: string): boolean {
    return name.length >= 2 && name.length <= 50;
  }

  // Factory method for creating a new category
  static create(
    name: string,
    icon: string
  ): Category {
    return new Category(
      null, // ID will be assigned by the repository
      name,
      icon,
      []
    );
  }
}