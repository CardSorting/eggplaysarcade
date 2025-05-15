import { SecurityLevel } from '../value-objects/SecurityLevel';

/**
 * GameBundle entity represents a package of game files submitted by a developer.
 * It includes the game files and metadata about the bundle.
 */
export class GameBundle {
  constructor(
    private readonly _id: string,
    private readonly _gameId: string,
    private readonly _bundlePath: string,
    private readonly _entryPoint: string,
    private readonly _fileCount: number,
    private readonly _totalSizeBytes: number,
    private readonly _uploadedAt: Date,
    private readonly _securityLevel: SecurityLevel,
    private _scanStatus: ScanStatus,
    private _scanResults?: ScanResults
  ) {}

  // Getters
  get id(): string {
    return this._id;
  }

  get gameId(): string {
    return this._gameId;
  }

  get bundlePath(): string {
    return this._bundlePath;
  }

  get entryPoint(): string {
    return this._entryPoint;
  }

  get fileCount(): number {
    return this._fileCount;
  }

  get totalSizeBytes(): number {
    return this._totalSizeBytes;
  }

  get uploadedAt(): Date {
    return this._uploadedAt;
  }

  get securityLevel(): SecurityLevel {
    return this._securityLevel;
  }

  get scanStatus(): ScanStatus {
    return this._scanStatus;
  }

  get scanResults(): ScanResults | undefined {
    return this._scanResults;
  }

  /**
   * Mark the bundle as scanned and update with scan results
   */
  markAsScanned(results: ScanResults): void {
    this._scanStatus = results.passed ? ScanStatus.PASSED : ScanStatus.FAILED;
    this._scanResults = results;
  }

  /**
   * Check if the bundle is ready to be deployed to a sandbox
   */
  isReadyForDeployment(): boolean {
    return this._scanStatus === ScanStatus.PASSED;
  }

  /**
   * Get the full path to the entry point file
   */
  getEntryPointPath(): string {
    return `${this._bundlePath}/${this._entryPoint}`;
  }
}

/**
 * Scan status for a game bundle
 */
export enum ScanStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  PASSED = 'passed',
  FAILED = 'failed'
}

/**
 * Results from security scan of a game bundle
 */
export interface ScanResults {
  passed: boolean;
  threatLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  findings: ScanFinding[];
  thirdPartyLibraries: number;
  suspiciousCodeFound: boolean;
  maliciousUrls: string[];
  scannedAt: Date;
}

/**
 * Individual finding from a security scan
 */
export interface ScanFinding {
  type: string;
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location?: string;
  details?: string;
}

/**
 * Factory for creating new GameBundle instances
 */
export class GameBundleFactory {
  static create(
    id: string,
    gameId: string,
    bundlePath: string,
    entryPoint: string,
    fileCount: number,
    totalSizeBytes: number,
    securityLevel: SecurityLevel
  ): GameBundle {
    return new GameBundle(
      id,
      gameId,
      bundlePath,
      entryPoint,
      fileCount,
      totalSizeBytes,
      new Date(),
      securityLevel,
      ScanStatus.PENDING
    );
  }
}