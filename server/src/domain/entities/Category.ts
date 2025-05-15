import { EntityId } from "../value-objects/EntityId";
import { Game } from "./Game";

/**
 * Category entity following the Domain-Driven Design (DDD) approach
 * This is a core domain entity representing a game category in the system
 */
export class Category {
  id: EntityId;
  name: string;
  icon: string;
  games?: Game[];

  /**
   * Create a new Category entity
   */
  constructor(id: EntityId, name: string, icon: string, games?: Game[]) {
    this.id = id;
    this.name = name;
    this.icon = icon;
    this.games = games;
  }
}