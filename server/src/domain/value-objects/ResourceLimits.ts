/**
 * ResourceLimits value object defines CPU, memory and storage limits for sandboxed games.
 * Follows immutability principle of value objects.
 */
export class ResourceLimits {
  private constructor(
    private readonly _cpuLimit: number,    // CPU limit in millicores
    private readonly _memoryLimit: number, // Memory limit in MB
    private readonly _storageLimit: number // Storage limit in MB
  ) {
    this.validateLimits();
  }

  /**
   * Validate limits are within acceptable ranges
   */
  private validateLimits(): void {
    if (this._cpuLimit <= 0 || this._memoryLimit <= 0 || this._storageLimit <= 0) {
      throw new Error('Resource limits must be greater than zero');
    }
  }

  /**
   * Create ResourceLimits with specified values
   */
  static create(cpuLimit: number, memoryLimit: number, storageLimit: number): ResourceLimits {
    return new ResourceLimits(cpuLimit, memoryLimit, storageLimit);
  }

  /**
   * Create ResourceLimits based on SecurityLevel
   */
  static fromSecurityLevel(securityLevel: string): ResourceLimits {
    switch (securityLevel) {
      case 'low':
        return new ResourceLimits(500, 256, 1024); // 0.5 CPU cores, 256MB RAM, 1GB storage
      case 'medium':
        return new ResourceLimits(300, 128, 512);  // 0.3 CPU cores, 128MB RAM, 512MB storage
      case 'high':
        return new ResourceLimits(200, 64, 256);   // 0.2 CPU cores, 64MB RAM, 256MB storage
      case 'maximum':
        return new ResourceLimits(100, 32, 128);   // 0.1 CPU cores, 32MB RAM, 128MB storage
      default:
        return new ResourceLimits(200, 64, 256);   // Default to high security
    }
  }

  // Getters (no setters to maintain immutability)
  get cpuLimit(): number {
    return this._cpuLimit;
  }

  get memoryLimit(): number {
    return this._memoryLimit;
  }

  get storageLimit(): number {
    return this._storageLimit;
  }

  /**
   * Returns the resource limits in format suitable for container configuration
   */
  toContainerConfig(): { cpu: string, memory: string, storage: string } {
    return {
      cpu: `${this._cpuLimit}m`,
      memory: `${this._memoryLimit}Mi`,
      storage: `${this._storageLimit}Mi`
    };
  }

  /**
   * Create a new ResourceLimits with adjusted values
   */
  withIncreasedResources(cpuIncrease: number, memoryIncrease: number, storageIncrease: number): ResourceLimits {
    return new ResourceLimits(
      this._cpuLimit + cpuIncrease,
      this._memoryLimit + memoryIncrease,
      this._storageLimit + storageIncrease
    );
  }
}