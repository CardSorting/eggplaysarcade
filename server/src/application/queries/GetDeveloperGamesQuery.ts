import { SubmissionStatus } from '../../domain/entities/GameSubmission';

/**
 * Query to get games for a developer with filtering and pagination
 * Part of the application layer in Clean Architecture (CQRS pattern)
 */
export interface GetDeveloperGamesQuery {
  developerId: string;
  pageSize: number;
  pageNumber: number;
  filter?: {
    status?: SubmissionStatus[];
    categories?: string[];
    search?: string;
    dateRange?: {
      from?: Date;
      to?: Date;
    };
  };
  sort?: {
    field: 'title' | 'publishedAt' | 'players' | 'rating' | 'revenue';
    direction: 'asc' | 'desc';
  };
}

/**
 * Result type for the GetDeveloperGamesQuery
 */
export interface GetDeveloperGamesResult {
  games: GameSummaryDTO[];
  pagination: {
    totalGames: number;
    totalPages: number;
    pageSize: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Data Transfer Object for game summary information
 */
export interface GameSummaryDTO {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  status: SubmissionStatus;
  publishedAt: Date | null;
  currentVersion: string;
  totalPlayers: number;
  rating: number;
  revenue: number;
  categories: string[];
  hasUpdatesInReview: boolean;
  latestSubmissionId: string | null;
  latestSubmissionStatus: SubmissionStatus | null;
}