import { GameId } from '../../domain/value-objects/GameId';

/**
 * Resource limits for a sandboxed game
 */
interface ResourceLimits {
  memory: string;
  cpu: number;
  timeout: number;
}

/**
 * Parameters for creating a new game sandbox
 */
interface SandboxParams {
  gameId: GameId;
  userId: number;
  gameFiles: Record<string, string>;
  entryPoint: string;
  resourceLimits: ResourceLimits;
}

/**
 * State of a sandbox instance
 */
enum SandboxState {
  STARTING = 'starting',
  RUNNING = 'running',
  STOPPED = 'stopped',
  ERROR = 'error'
}

/**
 * Represents a single running sandbox instance
 */
class SandboxInstance {
  private state: SandboxState = SandboxState.STARTING;
  private url: string;
  private readonly id: string;
  private readonly startTime: Date;
  private errorMessage?: string;
  
  constructor(
    public readonly gameId: GameId,
    public readonly userId: number,
    private readonly resourceLimits: ResourceLimits
  ) {
    this.id = `${gameId.toString()}-${userId}-${Date.now()}`;
    this.startTime = new Date();
    this.url = `/sandbox/${this.id}`;
  }
  
  getUrl(): string {
    return this.url;
  }
  
  getId(): string {
    return this.id;
  }
  
  getState(): SandboxState {
    return this.state;
  }
  
  setRunning(): void {
    this.state = SandboxState.RUNNING;
  }
  
  setError(error: string): void {
    this.state = SandboxState.ERROR;
    this.errorMessage = error;
  }
  
  stop(): void {
    this.state = SandboxState.STOPPED;
  }
  
  isExpired(): boolean {
    const now = new Date();
    const elapsedMs = now.getTime() - this.startTime.getTime();
    return elapsedMs > this.resourceLimits.timeout * 1000;
  }
}

/**
 * Service responsible for creating and managing sandboxed game environments
 */
export class GameSandboxService {
  private sandboxes: Map<string, SandboxInstance> = new Map();
  
  constructor(
    private readonly securityLevel: string = 'high',
    private readonly defaultResourceLimits: ResourceLimits = {
      memory: '128M',
      cpu: 0.5,
      timeout: 3600  // 1 hour in seconds
    }
  ) {
    // Start the cleanup task for expired sandboxes
    this.startCleanupTask();
  }
  
  /**
   * Creates a new sandboxed environment for a game
   * 
   * @param params The parameters for creating the sandbox
   * @returns The URL of the sandboxed game
   */
  async createSandbox(params: SandboxParams): Promise<string> {
    const { gameId, userId, gameFiles, entryPoint, resourceLimits } = params;
    
    try {
      // Create a new sandbox instance
      const instance = new SandboxInstance(
        gameId,
        userId, 
        resourceLimits
      );
      
      // Store game files and configure the sandbox
      await this.setupSandboxFiles(instance.getId(), gameFiles, entryPoint);
      
      // Add to active sandboxes
      this.sandboxes.set(instance.getId(), instance);
      
      // Set the instance as running
      instance.setRunning();
      
      // Return the URL to access the sandboxed game
      return instance.getUrl();
    } catch (error) {
      console.error(`Failed to create sandbox: ${error}`);
      throw new Error(`Failed to create sandbox: ${error.message}`);
    }
  }
  
  /**
   * Cleans up expired sandbox instances
   */
  private async cleanupExpiredSandboxes(): Promise<void> {
    for (const [id, instance] of this.sandboxes) {
      if (instance.isExpired()) {
        await this.stopSandbox(id);
      }
    }
  }
  
  /**
   * Stops a sandbox instance
   * 
   * @param sandboxId The ID of the sandbox to stop
   */
  async stopSandbox(sandboxId: string): Promise<void> {
    const instance = this.sandboxes.get(sandboxId);
    if (instance) {
      instance.stop();
      this.sandboxes.delete(sandboxId);
      
      // Clean up any associated resources
      await this.cleanupSandboxFiles(sandboxId);
    }
  }
  
  /**
   * Sets up the necessary files for a sandbox
   */
  private async setupSandboxFiles(
    sandboxId: string, 
    files: Record<string, string>,
    entryPoint: string
  ): Promise<void> {
    // This would be implemented with actual file system operations
    // For now it's just a simulation
    console.log(`Setting up sandbox ${sandboxId} with entry point ${entryPoint}`);
    return Promise.resolve();
  }
  
  /**
   * Cleans up files for a terminated sandbox
   */
  private async cleanupSandboxFiles(sandboxId: string): Promise<void> {
    // This would be implemented with actual file system operations
    console.log(`Cleaning up sandbox ${sandboxId}`);
    return Promise.resolve();
  }
  
  /**
   * Starts the periodic cleanup task
   */
  private startCleanupTask(): void {
    setInterval(() => {
      this.cleanupExpiredSandboxes().catch(err => {
        console.error(`Error during sandbox cleanup: ${err}`);
      });
    }, 60000); // Check every minute
  }
  
  /**
   * Gets a sandbox instance by ID
   */
  getSandbox(sandboxId: string): SandboxInstance | undefined {
    return this.sandboxes.get(sandboxId);
  }
  
  /**
   * Gets all active sandbox instances
   */
  getAllSandboxes(): SandboxInstance[] {
    return Array.from(this.sandboxes.values());
  }
}