import { Game } from "../../domain/entities/Game";
import { EntityId } from "../../domain/value-objects/EntityId";
import { Category } from "../../domain/entities/Category";

/**
 * Data Transfer Object for Game entity
 * Following the DTO pattern for clean separation between layers
 */
export class GameDTO {
  id: number;
  title: string;
  description: string;
  instructions: string;
  thumbnailUrl: string;
  gameUrl: string;
  categoryId: number;
  category?: CategoryDTO;
  tags: string[];
  publishedAt: string;
  userId: number;
  rating: number;
  playerCount: number;

  private constructor(
    id: number,
    title: string,
    description: string,
    instructions: string,
    thumbnailUrl: string,
    gameUrl: string,
    categoryId: number,
    tags: string[],
    publishedAt: string,
    userId: number,
    rating: number,
    playerCount: number
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.instructions = instructions;
    this.thumbnailUrl = thumbnailUrl;
    this.gameUrl = gameUrl;
    this.categoryId = categoryId;
    this.tags = tags || [];
    this.publishedAt = publishedAt;
    this.userId = userId;
    this.rating = rating;
    this.playerCount = playerCount;
  }

  /**
   * Convert a domain Game entity to a GameDTO
   */
  public static fromEntity(game: Game): GameDTO {
    if (!game.id) {
      throw new Error("Cannot create DTO from unsaved Game entity");
    }

    return new GameDTO(
      game.id.value,
      game.title,
      game.description,
      game.instructions,
      game.thumbnailUrl,
      game.gameUrl,
      game.categoryId.value,
      game.tags || [],
      game.publishedAt.toISOString(),
      game.userId.value,
      game.rating,
      game.playerCount
    );
  }

  /**
   * Convert multiple domain Game entities to GameDTOs
   */
  public static fromEntities(games: Game[]): GameDTO[] {
    return games.map(game => this.fromEntity(game));
  }

  /**
   * Convert a GameDTO to a domain Game entity
   */
  public toEntity(): Game {
    return Game.reconstitute(
      this.id,
      this.title,
      this.description,
      this.instructions,
      this.thumbnailUrl,
      this.gameUrl,
      this.categoryId,
      this.tags,
      new Date(this.publishedAt),
      this.userId,
      this.rating,
      this.playerCount
    );
  }

  /**
   * Add category information to this DTO
   */
  public withCategory(category: Category): GameDTO {
    this.category = CategoryDTO.fromEntity(category);
    return this;
  }
}

/**
 * Basic DTO for Category entity
 */
export class CategoryDTO {
  id: number;
  name: string;
  icon: string;

  private constructor(id: number, name: string, icon: string) {
    this.id = id;
    this.name = name;
    this.icon = icon;
  }

  /**
   * Convert a domain Category entity to a CategoryDTO
   */
  public static fromEntity(category: any): CategoryDTO {
    if (!category.id) {
      throw new Error("Cannot create DTO from unsaved Category entity");
    }

    return new CategoryDTO(
      typeof category.id === 'object' ? category.id.value : category.id,
      category.name,
      category.icon
    );
  }
}