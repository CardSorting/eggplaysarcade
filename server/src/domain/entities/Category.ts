import { EntityId } from '../value-objects/EntityId';
import { Game } from './Game';

export class Category {
  private _id: EntityId;
  private _name: string;
  private _icon: string;
  private _games: Game[] = [];

  constructor(
    id: EntityId,
    name: string,
    icon: string
  ) {
    this._id = id;
    this._name = name;
    this._icon = icon;
  }

  // Getters
  get id(): EntityId {
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

  // Domain methods
  setGames(games: Game[]): void {
    this._games = [...games];
  }

  addGame(game: Game): void {
    this._games.push(game);
  }

  // Factory method for creating a new category
  static create(
    name: string,
    icon: string
  ): Category {
    const id = EntityId.generate();
    return new Category(id, name, icon);
  }

  // Factory method for reconstructing a category from persistence
  static reconstitute(
    id: number,
    name: string,
    icon: string
  ): Category {
    return new Category(new EntityId(id), name, icon);
  }

  // Returns a plain object representation for DTOs
  toDTO(): Record<string, any> {
    return {
      id: this._id.value,
      name: this._name,
      icon: this._icon
    };
  }
}