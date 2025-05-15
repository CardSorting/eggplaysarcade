import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';

/**
 * Represents a sandbox instance for a game
 */
interface SandboxInstance {
  id: string;
  gameId: number;
  created: Date;
  accessed: Date;
  resourceUsage: ResourceUsage;
}

/**
 * Tracks resource usage for a sandboxed game
 */
interface ResourceUsage {
  cpuTime: number;
  memoryUsage: number;
  networkRequests: number;
}

/**
 * Service responsible for managing game sandboxes
 * This service creates isolated environments for games to run securely
 */
export class GameSandboxService {
  private instances: Map<string, SandboxInstance>;
  private readonly defaultLifetime = 1000 * 60 * 60; // 1 hour in milliseconds
  private readonly cleanupInterval = 1000 * 60 * 15; // 15 minutes
  private readonly maxInstances = 100;

  constructor() {
    this.instances = new Map();
    
    // Set up periodic cleanup
    setInterval(() => this.cleanupStaleInstances(), this.cleanupInterval);
  }

  /**
   * Creates a new sandbox instance for a game
   * @param gameId The ID of the game to create a sandbox for
   * @returns The ID of the created sandbox
   */
  async createSandbox(gameId: number): Promise<string> {
    // Enforce instance limit
    if (this.instances.size >= this.maxInstances) {
      this.cleanupStaleInstances();
      if (this.instances.size >= this.maxInstances) {
        throw new Error('Maximum number of sandbox instances reached');
      }
    }

    // Create new sandbox instance
    const sandboxId = uuidv4();
    
    const newInstance: SandboxInstance = {
      id: sandboxId,
      gameId,
      created: new Date(),
      accessed: new Date(),
      resourceUsage: {
        cpuTime: 0,
        memoryUsage: 0,
        networkRequests: 0
      }
    };
    
    this.instances.set(sandboxId, newInstance);
    
    return sandboxId;
  }

  /**
   * Gets the sandbox instance by its ID
   * @param sandboxId The ID of the sandbox
   * @returns The sandbox instance or undefined if not found
   */
  getSandbox(sandboxId: string): SandboxInstance | undefined {
    const instance = this.instances.get(sandboxId);
    
    if (instance) {
      // Update access time
      instance.accessed = new Date();
      this.instances.set(sandboxId, instance);
    }
    
    return instance;
  }

  /**
   * Gets the game ID associated with a sandbox
   * @param sandboxId The ID of the sandbox
   * @returns The game ID or undefined if sandbox not found
   */
  getGameId(sandboxId: string): number | undefined {
    const instance = this.getSandbox(sandboxId);
    return instance?.gameId;
  }

  /**
   * Cleans up sandbox instances that haven't been accessed in a while
   */
  private cleanupStaleInstances(): void {
    const now = new Date();
    const entriesToRemove: string[] = [];
    
    // Find stale instances
    for (const [id, instance] of this.instances.entries()) {
      const timeSinceAccess = now.getTime() - instance.accessed.getTime();
      if (timeSinceAccess > this.defaultLifetime) {
        entriesToRemove.push(id);
      }
    }
    
    // Remove stale instances
    for (const id of entriesToRemove) {
      this.instances.delete(id);
    }
    
    console.log(`Cleaned up ${entriesToRemove.length} stale sandbox instances`);
  }

  /**
   * Updates resource usage for a sandbox instance
   * @param sandboxId The ID of the sandbox
   * @param usage The updated resource usage
   */
  updateResourceUsage(sandboxId: string, usage: Partial<ResourceUsage>): void {
    const instance = this.instances.get(sandboxId);
    
    if (instance) {
      instance.resourceUsage = {
        ...instance.resourceUsage,
        ...usage
      };
      this.instances.set(sandboxId, instance);
    }
  }

  /**
   * Gets all active sandbox instances
   * @returns Array of all active sandboxes
   */
  getAllInstances(): SandboxInstance[] {
    return Array.from(this.instances.values());
  }

  /**
   * Gets the number of active sandbox instances
   * @returns The count of active instances
   */
  getInstanceCount(): number {
    return this.instances.size;
  }

  /**
   * Destroys a sandbox instance
   * @param sandboxId The ID of the sandbox to destroy
   * @returns true if the sandbox was destroyed, false if it wasn't found
   */
  destroySandbox(sandboxId: string): boolean {
    return this.instances.delete(sandboxId);
  }
}