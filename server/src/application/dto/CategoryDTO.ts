import { Category } from '../../domain/entities/Category';
import { GameDTO } from './GameDTO';

/**
 * DTO for Category entities
 */
export class CategoryDTO {
  id: number;
  name: string;
  icon: string;
  games?: GameDTO[];

  constructor(category: Category) {
    this.id = category.id.value;
    this.name = category.name;
    this.icon = category.icon;
    
    if (category.games.length > 0) {
      this.games = category.games.map(game => new GameDTO(game));
    }
  }

  static fromEntity(category: Category): CategoryDTO {
    return new CategoryDTO(category);
  }

  static fromEntities(categories: Category[]): CategoryDTO[] {
    return categories.map(category => CategoryDTO.fromEntity(category));
  }
}