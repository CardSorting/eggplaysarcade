import { EntityId } from "../value-objects/EntityId";
import { Game } from "./Game";

/**
 * Category entity representing a game category in the domain
 * Following the Domain-Driven Design principles
 */
export class Category {
  private _id: EntityId | null;
  private _name: string;
  private _icon: string;
  private _games: Game[];

  private constructor(
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

  /**
   * Create a new category
   */
  public static create(name: string, icon: string): Category {
    return new Category(null, name, icon);
  }

  /**
   * Reconstruct a category from persistence
   */
  public static reconstitute(
    id: number,
    name: string,
    icon: string,
    games: Game[] = []
  ): Category {
    return new Category(new EntityId(id), name, icon, games);
  }

  /**
   * Get the ID of this category
   */
  public get id(): EntityId | null {
    return this._id;
  }

  /**
   * Get the name of this category
   */
  public get name(): string {
    return this._name;
  }

  /**
   * Get the icon of this category
   */
  public get icon(): string {
    return this._icon;
  }

  /**
   * Get the games in this category
   */
  public get games(): Game[] {
    return [...this._games];
  }

  /**
   * Add a game to this category
   */
  public addGame(game: Game): void {
    if (!this._games.some(g => g.id && game.id && g.id.equals(game.id))) {
      this._games.push(game);
    }
  }

  /**
   * Remove a game from this category
   */
  public removeGame(gameId: EntityId): void {
    this._games = this._games.filter(game => !game.id?.equals(gameId));
  }
}