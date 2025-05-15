import { Category } from "../../../domain/entities/Category";
import { GameDTO } from "./GameDTO";

/**
 * Data Transfer Object for Category
 * Follows the DTO pattern to map domain entities to data structures suitable for client consumption
 */
export class CategoryDTO {
  id: number;
  name: string;
  icon: string;
  games?: GameDTO[];

  private constructor(id: number, name: string, icon: string, games?: GameDTO[]) {
    this.id = id;
    this.name = name;
    this.icon = icon;
    this.games = games;
  }

  /**
   * Creates a DTO from a Category entity
   */
  static fromEntity(category: Category): CategoryDTO {
    return new CategoryDTO(
      category.id.value,
      category.name,
      category.icon,
      category.games ? GameDTO.fromEntities(category.games) : undefined
    );
  }

  /**
   * Creates DTOs from an array of Category entities
   */
  static fromEntities(categories: Category[]): CategoryDTO[] {
    return categories.map(category => CategoryDTO.fromEntity(category));
  }
}