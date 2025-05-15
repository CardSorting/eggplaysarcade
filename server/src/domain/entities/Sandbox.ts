import { SecurityLevel } from '../value-objects/SecurityLevel';
import { ResourceLimits } from '../value-objects/ResourceLimits';

/**
 * Sandbox entity represents an isolated container where games are hosted.
 * It manages the lifecycle and state of a sandbox instance.
 */
export class Sandbox {
  private _status: SandboxStatus;
  private _healthStatus: SandboxHealthStatus;
  private _healthCheckTimestamp?: Date;
  private _startedAt?: Date;
  private _terminatedAt?: Date;
  private _terminationReason?: string;
  private _activeSessionCount: number;
  private _metrics: SandboxMetrics;

  constructor(
    private readonly _id: string,
    private readonly _gameId: string,
    private readonly _gameBundleId: string,
    private readonly _securityLevel: SecurityLevel,
    private readonly _resourceLimits: ResourceLimits,
    private readonly _containerImage: string,
    private readonly _networkPolicy: NetworkPolicy,
    private readonly _createdAt: Date,
    private readonly _expiresAt: Date,
    private readonly _internalEndpoint: string,
    private readonly _publicUrl: string
  ) {
    this._status = SandboxStatus.CREATED;
    this._healthStatus = SandboxHealthStatus.UNKNOWN;
    this._activeSessionCount = 0;
    this._metrics = {
      cpuUsagePercentage: 0,
      memoryUsageMb: 0,
      networkIngressBytes: 0,
      networkEgressBytes: 0,
      errorCount: 0,
      averageResponseTimeMs: 0
    };
  }

  // Getters for immutable properties
  get id(): string {
    return this._id;
  }

  get gameId(): string {
    return this._gameId;
  }

  get gameBundleId(): string {
    return this._gameBundleId;
  }

  get securityLevel(): SecurityLevel {
    return this._securityLevel;
  }

  get resourceLimits(): ResourceLimits {
    return this._resourceLimits;
  }

  get containerImage(): string {
    return this._containerImage;
  }

  get networkPolicy(): NetworkPolicy {
    return this._networkPolicy;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get expiresAt(): Date {
    return this._expiresAt;
  }

  get internalEndpoint(): string {
    return this._internalEndpoint;
  }

  get publicUrl(): string {
    return this._publicUrl;
  }

  // Getters for mutable properties
  get status(): SandboxStatus {
    return this._status;
  }

  get healthStatus(): SandboxHealthStatus {
    return this._healthStatus;
  }

  get healthCheckTimestamp(): Date | undefined {
    return this._healthCheckTimestamp;
  }

  get startedAt(): Date | undefined {
    return this._startedAt;
  }

  get terminatedAt(): Date | undefined {
    return this._terminatedAt;
  }

  get terminationReason(): string | undefined {
    return this._terminationReason;
  }

  get activeSessionCount(): number {
    return this._activeSessionCount;
  }

  get metrics(): SandboxMetrics {
    return { ...this._metrics }; // Return a copy to prevent modification
  }

  // State transition methods
  start(): void {
    if (this._status !== SandboxStatus.CREATED && this._status !== SandboxStatus.STOPPED) {
      throw new Error(`Cannot start sandbox with status: ${this._status}`);
    }
    
    this._status = SandboxStatus.RUNNING;
    this._startedAt = new Date();
  }

  stop(): void {
    if (this._status !== SandboxStatus.RUNNING) {
      throw new Error(`Cannot stop sandbox with status: ${this._status}`);
    }
    
    this._status = SandboxStatus.STOPPED;
  }

  terminate(reason: string): void {
    if (this._status === SandboxStatus.TERMINATED) {
      throw new Error('Sandbox is already terminated');
    }
    
    this._status = SandboxStatus.TERMINATED;
    this._terminatedAt = new Date();
    this._terminationReason = reason;
  }

  // Session management
  incrementActiveSessionCount(): void {
    this._activeSessionCount++;
  }

  decrementActiveSessionCount(): void {
    if (this._activeSessionCount > 0) {
      this._activeSessionCount--;
    }
  }

  // Health management
  updateHealthStatus(status: SandboxHealthStatus): void {
    this._healthStatus = status;
    this._healthCheckTimestamp = new Date();
  }

  // Metrics update
  updateMetrics(metrics: Partial<SandboxMetrics>): void {
    this._metrics = { ...this._metrics, ...metrics };
  }

  // Business rules
  isExpired(): boolean {
    return new Date() > this._expiresAt;
  }

  isHealthy(): boolean {
    return this._healthStatus === SandboxHealthStatus.HEALTHY;
  }

  shouldBeRestarted(): boolean {
    return (
      this._status === SandboxStatus.RUNNING &&
      this._healthStatus === SandboxHealthStatus.UNHEALTHY &&
      this._metrics.errorCount > 5
    );
  }

  hasNoActiveSessions(): boolean {
    return this._activeSessionCount === 0;
  }

  isIdle(): boolean {
    return this.hasNoActiveSessions() && this._status === SandboxStatus.RUNNING;
  }
}

/**
 * Status of a sandbox container
 */
export enum SandboxStatus {
  CREATED = 'created',
  RUNNING = 'running',
  STOPPED = 'stopped',
  TERMINATED = 'terminated'
}

/**
 * Health status of a sandbox
 */
export enum SandboxHealthStatus {
  UNKNOWN = 'unknown',
  HEALTHY = 'healthy',
  UNHEALTHY = 'unhealthy'
}

/**
 * Network policy for a sandbox
 */
export interface NetworkPolicy {
  allowInbound: boolean;
  allowOutbound: boolean;
  allowedOutboundHosts: string[];
  exposedPorts: number[];
}

/**
 * Runtime metrics for a sandbox
 */
export interface SandboxMetrics {
  cpuUsagePercentage: number;
  memoryUsageMb: number;
  networkIngressBytes: number;
  networkEgressBytes: number;
  errorCount: number;
  averageResponseTimeMs: number;
}

/**
 * Factory for creating new Sandbox instances
 */
export class SandboxFactory {
  static create(
    id: string,
    gameId: string,
    gameBundleId: string,
    securityLevel: SecurityLevel,
    resourceLimits: ResourceLimits,
    networkPolicy: NetworkPolicy,
    containerImage: string = 'html5-game-sandbox:latest',
    expiresInHours: number = 24
  ): Sandbox {
    const createdAt = new Date();
    const expiresAt = new Date(createdAt);
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);
    
    const internalEndpoint = `game-${id}.sandboxes.internal`;
    const publicUrl = `game-${id}.play.gameportal.com`;
    
    return new Sandbox(
      id,
      gameId,
      gameBundleId,
      securityLevel,
      resourceLimits,
      containerImage,
      networkPolicy,
      createdAt,
      expiresAt,
      internalEndpoint,
      publicUrl
    );
  }
}