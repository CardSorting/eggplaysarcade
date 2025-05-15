import { GameBundle, ScanResults } from '../entities/GameBundle';

/**
 * Repository interface for GameBundle entity
 * Following Repository pattern from DDD
 */
export interface GameBundleRepository {
  /**
   * Save a game bundle to the repository
   */
  save(gameBundle: GameBundle): Promise<void>;
  
  /**
   * Find a game bundle by its ID
   */
  findById(id: string): Promise<GameBundle | null>;
  
  /**
   * Find all game bundles for a specific game
   */
  findByGameId(gameId: string): Promise<GameBundle[]>;
  
  /**
   * Find the latest game bundle for a specific game
   */
  findLatestByGameId(gameId: string): Promise<GameBundle | null>;
  
  /**
   * Update scan results for a game bundle
   */
  updateScanResults(id: string, results: ScanResults): Promise<void>;
  
  /**
   * Delete a game bundle by its ID
   */
  delete(id: string): Promise<void>;
}