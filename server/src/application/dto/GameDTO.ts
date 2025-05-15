import { Game } from "../../../domain/entities/Game";
import { Category } from "../../../domain/entities/Category";
import { User } from "../../../domain/entities/User";
import { Rating } from "../../../domain/entities/Rating";

/**
 * Data Transfer Object for Game
 * Follows the DTO pattern to map domain entities to data structures suitable for client consumption
 */
export class GameDTO {
  id: number;
  title: string;
  description: string;
  instructions: string;
  thumbnailUrl: string;
  gameUrl: string;
  createdAt: Date;
  playCount: number;
  averageRating: number | null;
  categoryId: number;
  userId: number;
  tags: string[];
  categoryName?: string;
  userName?: string;
  
  private constructor(
    id: number,
    title: string,
    description: string,
    instructions: string,
    thumbnailUrl: string,
    gameUrl: string,
    createdAt: Date,
    playCount: number,
    averageRating: number | null,
    categoryId: number,
    userId: number,
    tags: string[],
    categoryName?: string,
    userName?: string
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.instructions = instructions;
    this.thumbnailUrl = thumbnailUrl;
    this.gameUrl = gameUrl;
    this.createdAt = createdAt;
    this.playCount = playCount;
    this.averageRating = averageRating;
    this.categoryId = categoryId;
    this.userId = userId;
    this.tags = tags;
    this.categoryName = categoryName;
    this.userName = userName;
  }
  
  /**
   * Calculates the average rating for a game
   */
  private static calculateAverageRating(ratings: Rating[] | undefined): number | null {
    if (!ratings || ratings.length === 0) {
      return null;
    }
    
    const sum = ratings.reduce((acc, rating) => acc + rating.value, 0);
    return parseFloat((sum / ratings.length).toFixed(1));
  }
  
  /**
   * Creates a DTO from a Game entity
   */
  static fromEntity(
    game: Game, 
    category?: Category, 
    user?: User
  ): GameDTO {
    return new GameDTO(
      game.id.value,
      game.title,
      game.description,
      game.instructions,
      game.thumbnailUrl,
      game.gameUrl,
      game.createdAt,
      game.playCount,
      this.calculateAverageRating(game.ratings),
      game.categoryId.value,
      game.userId.value,
      game.tags || [],
      category?.name,
      user?.username
    );
  }
  
  /**
   * Creates DTOs from an array of Game entities
   */
  static fromEntities(games: Game[]): GameDTO[] {
    return games.map(game => GameDTO.fromEntity(game));
  }
}