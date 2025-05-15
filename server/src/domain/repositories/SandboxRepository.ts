import { Sandbox, SandboxHealthStatus, SandboxMetrics, SandboxStatus } from '../entities/Sandbox';

/**
 * Repository interface for Sandbox entity
 * Following Repository pattern from DDD
 */
export interface SandboxRepository {
  /**
   * Save a sandbox to the repository
   */
  save(sandbox: Sandbox): Promise<void>;
  
  /**
   * Find a sandbox by its ID
   */
  findById(id: string): Promise<Sandbox | null>;
  
  /**
   * Find the active sandbox for a game
   */
  findActiveByGameId(gameId: string): Promise<Sandbox | null>;
  
  /**
   * Find all sandboxes for a specific game
   */
  findAllByGameId(gameId: string): Promise<Sandbox[]>;
  
  /**
   * Find sandboxes by status
   */
  findByStatus(status: SandboxStatus): Promise<Sandbox[]>;
  
  /**
   * Update the status of a sandbox
   */
  updateStatus(id: string, status: SandboxStatus): Promise<void>;
  
  /**
   * Update the health status of a sandbox
   */
  updateHealthStatus(id: string, healthStatus: SandboxHealthStatus): Promise<void>;
  
  /**
   * Update the metrics of a sandbox
   */
  updateMetrics(id: string, metrics: Partial<SandboxMetrics>): Promise<void>;
  
  /**
   * Update active session count
   */
  updateActiveSessionCount(id: string, count: number): Promise<void>;
  
  /**
   * Mark a sandbox as terminated with a reason
   */
  markAsTerminated(id: string, reason: string): Promise<void>;
  
  /**
   * Find expired sandboxes that should be terminated
   */
  findExpiredSandboxes(): Promise<Sandbox[]>;
  
  /**
   * Find unhealthy sandboxes that should be restarted
   */
  findUnhealthySandboxes(): Promise<Sandbox[]>;
  
  /**
   * Find idle sandboxes that can be stopped to save resources
   */
  findIdleSandboxes(idleMinutes: number): Promise<Sandbox[]>;
}