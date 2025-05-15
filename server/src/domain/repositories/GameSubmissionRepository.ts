import { GameSubmission, SubmissionStatus } from '../entities/GameSubmission';

/**
 * Repository interface for GameSubmission entity
 * Part of the domain layer in Clean Architecture
 */
export interface GameSubmissionRepository {
  /**
   * Find a game submission by its ID
   */
  findById(id: string): Promise<GameSubmission | null>;
  
  /**
   * Find all submissions for a game
   */
  findByGameId(gameId: string): Promise<GameSubmission[]>;
  
  /**
   * Find the latest submission for a game
   */
  findLatestByGameId(gameId: string): Promise<GameSubmission | null>;
  
  /**
   * Find all submissions by a developer
   */
  findByDeveloperId(developerId: string, options?: {
    status?: SubmissionStatus[];
    limit?: number;
    offset?: number;
    sortBy?: 'submittedAt' | 'reviewedAt' | 'publishedAt';
    sortDirection?: 'asc' | 'desc';
  }): Promise<GameSubmission[]>;
  
  /**
   * Count submissions by a developer with optional filters
   */
  countByDeveloperId(developerId: string, options?: {
    status?: SubmissionStatus[];
  }): Promise<number>;
  
  /**
   * Find all submissions with a given status
   */
  findByStatus(status: SubmissionStatus | SubmissionStatus[], options?: {
    limit?: number;
    offset?: number;
    sortBy?: 'submittedAt' | 'reviewedAt' | 'publishedAt';
    sortDirection?: 'asc' | 'desc';
  }): Promise<GameSubmission[]>;
  
  /**
   * Count submissions with a given status
   */
  countByStatus(status: SubmissionStatus | SubmissionStatus[]): Promise<number>;
  
  /**
   * Save a game submission
   */
  save(submission: GameSubmission): Promise<void>;
  
  /**
   * Delete a game submission
   */
  delete(id: string): Promise<void>;
  
  /**
   * Find the most recent published submission for a game
   */
  findLatestPublishedByGameId(gameId: string): Promise<GameSubmission | null>;
  
  /**
   * Find submissions ready for review (submitted but not in review)
   */
  findSubmissionsReadyForReview(options?: {
    limit?: number;
    offset?: number;
  }): Promise<GameSubmission[]>;
  
  /**
   * Find submissions under review by a specific reviewer
   */
  findSubmissionsUnderReviewByReviewer(reviewerId: string): Promise<GameSubmission[]>;
}