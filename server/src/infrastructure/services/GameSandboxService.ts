import { v4 as uuidv4 } from 'uuid';
import { GameId } from '../../domain/value-objects/GameId';
import { VersionNumber } from '../../domain/value-objects/VersionNumber';

/**
 * Resource limits for game containers
 */
export interface ResourceLimits {
  memory: string; // e.g., "128M"
  cpu: number; // CPU share (0-1024)
  networkBandwidth: string; // e.g., "10M"
  maxProcesses: number;
  diskSpace: string; // e.g., "500M"
  timeout: number; // seconds
}

/**
 * Configuration for a sandbox instance
 */
export interface SandboxConfig {
  gameId: string;
  version: string;
  resources: ResourceLimits;
  allowExternalRequests: boolean;
  allowedDomains: string[];
  environmentVariables: Record<string, string>;
  storageEnabled: boolean;
  storagePersistenceEnabled: boolean;
  securityHeaders: Record<string, string>;
}

/**
 * Sandbox instance details
 */
export interface SandboxInstance {
  id: string;
  gameId: string;
  version: string;
  url: string;
  status: 'creating' | 'running' | 'stopped' | 'error';
  createdAt: Date;
  lastAccessedAt: Date;
  error?: string;
  resourceUtilization?: {
    memoryUsage: number;
    cpuUsage: number;
    networkUsage: number;
  };
}

/**
 * Game Sandbox Service
 * 
 * Responsible for creating, managing and monitoring sandboxed environments 
 * for safely running HTML5 games
 */
export class GameSandboxService {
  private readonly defaultResourceLimits: ResourceLimits = {
    memory: "256M",
    cpu: 512, // medium CPU share
    networkBandwidth: "20M",
    maxProcesses: 10,
    diskSpace: "1G",
    timeout: 3600 // 1 hour
  };
  
  private readonly baseUrl: string;
  private readonly sandboxInstances: Map<string, SandboxInstance>;
  
  constructor(baseUrl: string = process.env.SANDBOX_BASE_URL || 'https://sandbox.example.com') {
    this.baseUrl = baseUrl;
    this.sandboxInstances = new Map();
  }
  
  /**
   * Create a new sandbox instance for a game
   */
  async createSandbox(
    gameId: GameId | string, 
    version: VersionNumber | string,
    bundleLocation: string,
    config?: Partial<SandboxConfig>
  ): Promise<SandboxInstance> {
    // Convert to string if necessary
    const gameIdStr = gameId instanceof GameId ? gameId.value : gameId;
    const versionStr = version instanceof VersionNumber ? version.toString() : version;
    
    // Create sandbox id
    const sandboxId = `sandbox-${uuidv4()}`;
    
    // Merge with default resource limits
    const resources = {
      ...this.defaultResourceLimits,
      ...(config?.resources || {})
    };
    
    // Default configuration
    const sandboxConfig: SandboxConfig = {
      gameId: gameIdStr,
      version: versionStr,
      resources,
      allowExternalRequests: false,
      allowedDomains: [],
      environmentVariables: {},
      storageEnabled: true,
      storagePersistenceEnabled: false,
      securityHeaders: {
        'Content-Security-Policy': "default-src 'self'; script-src 'self'; connect-src 'self';",
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff'
      },
      ...config
    };
    
    try {
      // In a real implementation, this would make API calls to a container service
      // like Kubernetes, AWS Fargate, or a custom isolation solution
      console.log(`Creating sandbox ${sandboxId} for game ${gameIdStr} (${versionStr})`);
      console.log(`Using bundle at ${bundleLocation}`);
      console.log(`Configuration: ${JSON.stringify(sandboxConfig, null, 2)}`);
      
      // Mock the creation process
      // In a real implementation, wait for the sandbox to be ready
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Create sandbox record
      const sandboxUrl = `${this.baseUrl}/play/${sandboxId}`;
      const instance: SandboxInstance = {
        id: sandboxId,
        gameId: gameIdStr,
        version: versionStr,
        url: sandboxUrl,
        status: 'running',
        createdAt: new Date(),
        lastAccessedAt: new Date(),
        resourceUtilization: {
          memoryUsage: 0,
          cpuUsage: 0,
          networkUsage: 0
        }
      };
      
      // Store in memory (would be DB in real implementation)
      this.sandboxInstances.set(sandboxId, instance);
      
      return instance;
    } catch (error) {
      console.error(`Failed to create sandbox for game ${gameIdStr}:`, error);
      throw new Error(`Failed to create sandbox: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Get a sandbox instance by ID
   */
  async getSandbox(sandboxId: string): Promise<SandboxInstance | null> {
    const instance = this.sandboxInstances.get(sandboxId);
    if (!instance) return null;
    
    // Update last accessed time
    instance.lastAccessedAt = new Date();
    this.sandboxInstances.set(sandboxId, instance);
    
    return instance;
  }
  
  /**
   * Get all sandboxes for a game
   */
  async getGameSandboxes(gameId: GameId | string): Promise<SandboxInstance[]> {
    const gameIdStr = gameId instanceof GameId ? gameId.value : gameId;
    
    return Array.from(this.sandboxInstances.values())
      .filter(instance => instance.gameId === gameIdStr);
  }
  
  /**
   * Stop a sandbox instance
   */
  async stopSandbox(sandboxId: string): Promise<boolean> {
    const instance = this.sandboxInstances.get(sandboxId);
    if (!instance) return false;
    
    // In a real implementation, make API call to stop the container
    console.log(`Stopping sandbox ${sandboxId}`);
    
    // Update status
    instance.status = 'stopped';
    this.sandboxInstances.set(sandboxId, instance);
    
    return true;
  }
  
  /**
   * Check if a sandbox is healthy
   */
  async checkSandboxHealth(sandboxId: string): Promise<boolean> {
    const instance = this.sandboxInstances.get(sandboxId);
    if (!instance) return false;
    
    // In a real implementation, perform health check on the container
    return instance.status === 'running';
  }
  
  /**
   * Get sandbox metrics
   */
  async getSandboxMetrics(sandboxId: string): Promise<SandboxInstance['resourceUtilization'] | null> {
    const instance = this.sandboxInstances.get(sandboxId);
    if (!instance || instance.status !== 'running') return null;
    
    // In a real implementation, fetch metrics from the container service
    // For demo, return mock increasing usage
    const currentTime = Date.now();
    const startTime = instance.createdAt.getTime();
    const uptime = (currentTime - startTime) / 1000; // in seconds
    
    // Simulate resource usage growing over time, with some randomness
    const memoryBasePercentage = Math.min(80, 25 + (uptime / 60) * 5); // Grows 5% per minute up to 80%
    const cpuBasePercentage = Math.min(70, 10 + (uptime / 60) * 8); // Grows 8% per minute up to 70%
    
    instance.resourceUtilization = {
      memoryUsage: memoryBasePercentage + (Math.random() * 10 - 5), // +/- 5%
      cpuUsage: cpuBasePercentage + (Math.random() * 20 - 10), // +/- 10%
      networkUsage: Math.min(100, (uptime / 60) * 10) // Grows 10% per minute
    };
    
    this.sandboxInstances.set(sandboxId, instance);
    
    return instance.resourceUtilization;
  }
  
  /**
   * Clean up old unused sandboxes
   */
  async cleanupInactiveSandboxes(maxIdleTimeHours: number = 24): Promise<number> {
    const now = new Date();
    const maxIdleTime = maxIdleTimeHours * 60 * 60 * 1000; // convert to ms
    let cleanupCount = 0;
    
    for (const [id, instance] of this.sandboxInstances.entries()) {
      const idleTime = now.getTime() - instance.lastAccessedAt.getTime();
      
      if (idleTime > maxIdleTime && instance.status === 'running') {
        await this.stopSandbox(id);
        cleanupCount++;
      }
    }
    
    return cleanupCount;
  }
}