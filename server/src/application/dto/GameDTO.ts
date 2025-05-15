import { Game } from "../../domain/entities/Game";
import { Category } from "../../domain/entities/Category";
import { User } from "../../domain/entities/User";
import { Rating } from "../../domain/entities/Rating";
import { EntityId } from "../../domain/value-objects/EntityId";

/**
 * GameDTO is a Data Transfer Object for Game entity.
 * It's used to transfer game data between layers, particularly from domain to API.
 */
export class GameDTO {
  id: number;
  title: string;
  description: string;
  instructions: string;
  thumbnailUrl: string;
  gameUrl: string;
  categoryId: number;
  userId: number;
  tags: string[];
  createdAt: string;
  playCount: number;
  category?: CategoryDTO;
  user?: UserDTO;
  ratings?: RatingDTO[];
  averageRating?: number;

  constructor(game: Game) {
    this.id = game.id ? game.id.value : 0;
    this.title = game.title;
    this.description = game.description;
    this.instructions = game.instructions;
    this.thumbnailUrl = game.thumbnailUrl;
    this.gameUrl = game.gameUrl;
    this.categoryId = game.categoryId.value;
    this.userId = game.userId.value;
    this.tags = [...game.tags];
    this.createdAt = game.createdAt.toISOString();
    this.playCount = game.playCount;
    this.averageRating = game.getAverageRating();
  }

  /**
   * Convert a domain Game entity to a GameDTO
   */
  static fromEntity(game: Game): GameDTO {
    return new GameDTO(game);
  }

  /**
   * Convert a domain Game entity to a GameDTO, including related entities
   */
  static fromEntityWithRelations(
    game: Game, 
    category?: Category, 
    user?: User, 
    ratings?: Rating[]
  ): GameDTO {
    const dto = new GameDTO(game);
    
    if (category) {
      dto.category = CategoryDTO.fromEntity(category);
    }
    
    if (user) {
      dto.user = UserDTO.fromEntity(user);
    }
    
    if (ratings && ratings.length > 0) {
      dto.ratings = ratings.map(rating => RatingDTO.fromEntity(rating));
    }
    
    return dto;
  }

  /**
   * Convert a GameDTO to a domain Game entity
   */
  toEntity(): Game {
    return new Game(
      this.id ? new EntityId(this.id) : null,
      this.title,
      this.description,
      this.instructions,
      this.thumbnailUrl,
      this.gameUrl,
      new EntityId(this.categoryId),
      new EntityId(this.userId),
      this.tags,
      new Date(this.createdAt),
      this.playCount,
      this.ratings?.map(ratingDto => ratingDto.toEntity()) || []
    );
  }
}

/**
 * CategoryDTO is a Data Transfer Object for Category entity.
 */
export class CategoryDTO {
  id: number;
  name: string;
  icon: string;

  constructor(category: Category) {
    this.id = category.id ? category.id.value : 0;
    this.name = category.name;
    this.icon = category.icon;
  }

  /**
   * Convert a domain Category entity to a CategoryDTO
   */
  static fromEntity(category: Category): CategoryDTO {
    return new CategoryDTO(category);
  }

  /**
   * Convert a CategoryDTO to a domain Category entity
   */
  toEntity(): Category {
    return new Category(
      this.id ? new EntityId(this.id) : null,
      this.name,
      this.icon
    );
  }
}

/**
 * UserDTO is a Data Transfer Object for User entity.
 */
export class UserDTO {
  id: number;
  username: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;

  constructor(user: User) {
    this.id = user.id ? user.id.value : 0;
    this.username = user.username;
    this.email = user.email;
    this.avatarUrl = user.avatarUrl;
    this.bio = user.bio;
  }

  /**
   * Convert a domain User entity to a UserDTO
   */
  static fromEntity(user: User): UserDTO {
    return new UserDTO(user);
  }

  /**
   * Convert a UserDTO to a domain User entity
   */
  toEntity(): User {
    return new User(
      this.id ? new EntityId(this.id) : null,
      this.username,
      this.email,
      '' // Password hash is not included in DTO for security
    );
  }
}

/**
 * RatingDTO is a Data Transfer Object for Rating entity.
 */
export class RatingDTO {
  id: number;
  gameId: number;
  userId: number;
  stars: number;
  comment: string | null;
  createdAt: string;
  user?: UserDTO;

  constructor(rating: Rating) {
    this.id = rating.id ? rating.id.value : 0;
    this.gameId = rating.gameId.value;
    this.userId = rating.userId.value;
    this.stars = rating.stars;
    this.comment = rating.comment;
    this.createdAt = rating.createdAt.toISOString();
  }

  /**
   * Convert a domain Rating entity to a RatingDTO
   */
  static fromEntity(rating: Rating): RatingDTO {
    return new RatingDTO(rating);
  }

  /**
   * Convert a domain Rating entity to a RatingDTO, including related entities
   */
  static fromEntityWithUser(rating: Rating, user?: User): RatingDTO {
    const dto = new RatingDTO(rating);
    
    if (user) {
      dto.user = UserDTO.fromEntity(user);
    }
    
    return dto;
  }

  /**
   * Convert a RatingDTO to a domain Rating entity
   */
  toEntity(): Rating {
    return new Rating(
      this.id ? new EntityId(this.id) : null,
      new EntityId(this.gameId),
      new EntityId(this.userId),
      this.stars,
      this.comment,
      new Date(this.createdAt)
    );
  }
}