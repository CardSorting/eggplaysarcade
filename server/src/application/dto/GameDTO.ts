import { Game } from '../../domain/entities/Game';

/**
 * DTO for Game entities
 * This separates our domain model from the API response structure
 */
export class GameDTO {
  id: number;
  title: string;
  description: string;
  instructions: string;
  thumbnailUrl: string;
  gameUrl: string;
  categoryId: number;
  tags: string[];
  publishedAt: Date;
  userId: number;
  rating: number;
  players: number;
  category?: {
    id: number;
    name: string;
    icon: string;
  };
  user?: {
    id: number;
    username: string;
  };

  constructor(game: Game) {
    this.id = game.id.value;
    this.title = game.title;
    this.description = game.description;
    this.instructions = game.instructions;
    this.thumbnailUrl = game.thumbnailUrl;
    this.gameUrl = game.gameUrl;
    this.categoryId = game.categoryId.value;
    this.tags = game.tags;
    this.publishedAt = game.publishedAt;
    this.userId = game.userId.value;
    this.rating = game.rating;
    this.players = game.players;
    
    if (game.category) {
      this.category = {
        id: game.category.id.value,
        name: game.category.name,
        icon: game.category.icon
      };
    }
    
    if (game.user) {
      this.user = {
        id: game.user.id.value,
        username: game.user.username
      };
    }
  }

  static fromEntity(game: Game): GameDTO {
    return new GameDTO(game);
  }

  static fromEntities(games: Game[]): GameDTO[] {
    return games.map(game => GameDTO.fromEntity(game));
  }
}