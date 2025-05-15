/**
 * Domain types for the Games feature
 * Following Domain-Driven Design principles by defining clear boundaries
 */

// Game entity
export interface Game {
  id: number;
  title: string;
  description: string;
  categoryName?: string;
  thumbnailUrl?: string;
  gameUrl?: string;
  rating?: number;
  players?: number;
  tags?: string[];
  instructions?: string;
  developerName?: string;
  publishedAt?: string;
}

// Review entity
export interface Review {
  id: number;
  rating: number;
  content?: string;
  createdAt: string;
  user?: {
    username: string;
  };
}

// API Response types (Query results following CQRS pattern)
export interface GameDetailQuery {
  game: Game;
}

export interface ReviewsListQuery {
  reviews: Review[];
}

export interface WishlistStatusQuery {
  inWishlist: boolean;
}

// Command types (following CQRS pattern)
export interface PlayGameCommand {
  gameId: number;
  userId?: number;
}

export interface LikeGameCommand {
  gameId: number;
}

export interface AddToWishlistCommand {
  gameId: number;
}

export interface RemoveFromWishlistCommand {
  gameId: number;
}