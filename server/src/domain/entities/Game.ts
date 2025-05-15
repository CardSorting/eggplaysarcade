import { GameId } from '../value-objects/GameId';

/**
 * Resource requirements for running a game
 */
interface ResourceLimits {
  memory: string;
  cpu: number;
  timeout: number; // in seconds
}

/**
 * Game metadata required for deployment
 */
interface GameDeploymentConfig {
  entryPoint: string;
  resourceLimits: ResourceLimits;
  securitySandboxLevel: 'strict' | 'standard' | 'permissive';
}

/**
 * Game versioning information
 */
interface GameVersion {
  versionNumber: string;
  releaseDate: Date;
  changeLog: string;
  files: Record<string, string>;
}

/**
 * Status of a game in the publishing workflow
 */
enum GameStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PUBLISHED = 'published',
  DEPRECATED = 'deprecated'
}

/**
 * Game entity - Core domain entity in our app store platform
 * 
 * Following Domain-Driven Design principles, this implements 
 * a rich domain entity with business logic and invariants
 */
export class Game {
  private readonly _id: GameId;
  private _title: string;
  private _description: string;
  private _developerId: number;
  private _categoryId: number;
  private _playerCount: number;
  private _rating: number;
  private _status: GameStatus;
  private _versions: GameVersion[];
  private _currentVersionIndex: number;
  private _deploymentConfig: GameDeploymentConfig;
  private _createdAt: Date;
  private _updatedAt: Date;
  private _publishedAt?: Date;
  private _thumbnailUrl?: string;
  private _instructions?: string;
  
  constructor(params: {
    id: GameId | number | string;
    title: string;
    description: string;
    developerId: number;
    categoryId: number;
    versions?: GameVersion[];
    status?: GameStatus;
    playerCount?: number;
    rating?: number;
    deploymentConfig?: Partial<GameDeploymentConfig>;
    createdAt?: Date;
    updatedAt?: Date;
    publishedAt?: Date;
    thumbnailUrl?: string;
    instructions?: string;
  }) {
    // Convert the ID to a GameId if it's not already
    this._id = params.id instanceof GameId 
      ? params.id 
      : new GameId(params.id);
      
    this._title = params.title;
    this._description = params.description;
    this._developerId = params.developerId;
    this._categoryId = params.categoryId;
    this._playerCount = params.playerCount || 0;
    this._rating = params.rating || 0;
    this._status = params.status || GameStatus.DRAFT;
    this._versions = params.versions || [];
    this._currentVersionIndex = this._versions.length - 1 >= 0 
      ? this._versions.length - 1 
      : -1;
    this._createdAt = params.createdAt || new Date();
    this._updatedAt = params.updatedAt || new Date();
    this._publishedAt = params.publishedAt;
    this._thumbnailUrl = params.thumbnailUrl;
    this._instructions = params.instructions;
    
    // Set default deployment config if not provided
    this._deploymentConfig = {
      entryPoint: params.deploymentConfig?.entryPoint || 'index.html',
      resourceLimits: params.deploymentConfig?.resourceLimits || {
        memory: '128M',
        cpu: 0.5,
        timeout: 3600 // 1 hour
      },
      securitySandboxLevel: params.deploymentConfig?.securitySandboxLevel || 'strict'
    };
    
    // Validate the entity state
    this.validate();
  }
  
  /**
   * Validates that the game entity is in a valid state
   * Enforces business rules and invariants
   */
  private validate(): void {
    if (!this._title || this._title.trim().length === 0) {
      throw new Error('Game title cannot be empty');
    }
    
    if (!this._description || this._description.trim().length === 0) {
      throw new Error('Game description cannot be empty');
    }
    
    if (this._developerId <= 0) {
      throw new Error('Invalid developer ID');
    }
    
    if (this._categoryId <= 0) {
      throw new Error('Invalid category ID');
    }
    
    if (this._playerCount < 0) {
      throw new Error('Player count cannot be negative');
    }
    
    if (this._rating < 0 || this._rating > 5) {
      throw new Error('Rating must be between 0 and 5');
    }
  }
  
  /**
   * Gets the game ID
   */
  get id(): GameId {
    return this._id;
  }
  
  /**
   * Gets the game title
   */
  get title(): string {
    return this._title;
  }
  
  /**
   * Sets the game title
   */
  set title(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Game title cannot be empty');
    }
    this._title = value;
    this._updatedAt = new Date();
  }
  
  /**
   * Gets the game description
   */
  get description(): string {
    return this._description;
  }
  
  /**
   * Sets the game description
   */
  set description(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Game description cannot be empty');
    }
    this._description = value;
    this._updatedAt = new Date();
  }
  
  /**
   * Gets the developer ID
   */
  get developerId(): number {
    return this._developerId;
  }
  
  /**
   * Gets the category ID
   */
  get categoryId(): number {
    return this._categoryId;
  }
  
  /**
   * Sets the category ID
   */
  set categoryId(value: number) {
    if (value <= 0) {
      throw new Error('Invalid category ID');
    }
    this._categoryId = value;
    this._updatedAt = new Date();
  }
  
  /**
   * Gets the player count
   */
  get playerCount(): number {
    return this._playerCount;
  }
  
  /**
   * Gets the game rating
   */
  get rating(): number {
    return this._rating;
  }
  
  /**
   * Gets the game status
   */
  get status(): GameStatus {
    return this._status;
  }
  
  /**
   * Gets the current version
   */
  get currentVersion(): GameVersion | undefined {
    return this._currentVersionIndex >= 0 
      ? this._versions[this._currentVersionIndex] 
      : undefined;
  }
  
  /**
   * Gets all game files from the current version
   */
  get files(): Record<string, string> | undefined {
    return this.currentVersion?.files;
  }
  
  /**
   * Gets the entry point to the game
   */
  get entryPoint(): string {
    return this._deploymentConfig.entryPoint;
  }
  
  /**
   * Gets the resource limits for the game
   */
  get resourceLimits(): ResourceLimits {
    return this._deploymentConfig.resourceLimits;
  }
  
  /**
   * Gets the thumbnail URL
   */
  get thumbnailUrl(): string | undefined {
    return this._thumbnailUrl;
  }
  
  /**
   * Gets the game instructions
   */
  get instructions(): string | undefined {
    return this._instructions;
  }
  
  /**
   * Gets creation date
   */
  get createdAt(): Date {
    return this._createdAt;
  }
  
  /**
   * Gets last update date
   */
  get updatedAt(): Date {
    return this._updatedAt;
  }
  
  /**
   * Gets publication date
   */
  get publishedAt(): Date | undefined {
    return this._publishedAt;
  }
  
  /**
   * Increment player count
   * @param increment The amount to increment by
   */
  incrementPlayerCount(increment: number = 1): void {
    if (increment < 0 && Math.abs(increment) > this._playerCount) {
      this._playerCount = 0;
    } else {
      this._playerCount += increment;
    }
    this._updatedAt = new Date();
  }
  
  /**
   * Update the game's rating
   * @param newRating New rating to incorporate
   * @param ratingCount Total number of ratings
   */
  updateRating(newRating: number, ratingCount: number): void {
    if (newRating < 0 || newRating > 5) {
      throw new Error('Rating must be between 0 and 5');
    }
    
    if (ratingCount <= 0) {
      this._rating = newRating;
    } else {
      // Calculate weighted average
      const totalRatingPoints = this._rating * (ratingCount - 1) + newRating;
      this._rating = totalRatingPoints / ratingCount;
    }
    
    this._updatedAt = new Date();
  }
  
  /**
   * Add a new version to the game
   * @param version New version to add
   */
  addVersion(version: GameVersion): void {
    this._versions.push(version);
    this._currentVersionIndex = this._versions.length - 1;
    this._updatedAt = new Date();
  }
  
  /**
   * Submit the game for review
   */
  submitForReview(): void {
    if (this._status === GameStatus.DRAFT || 
        this._status === GameStatus.REJECTED) {
      this._status = GameStatus.SUBMITTED;
      this._updatedAt = new Date();
    } else {
      throw new Error(`Cannot submit game in ${this._status} status`);
    }
  }
  
  /**
   * Start the review process
   */
  startReview(): void {
    if (this._status === GameStatus.SUBMITTED) {
      this._status = GameStatus.IN_REVIEW;
      this._updatedAt = new Date();
    } else {
      throw new Error(`Cannot start review for game in ${this._status} status`);
    }
  }
  
  /**
   * Approve the game after review
   */
  approve(): void {
    if (this._status === GameStatus.IN_REVIEW) {
      this._status = GameStatus.APPROVED;
      this._updatedAt = new Date();
    } else {
      throw new Error(`Cannot approve game in ${this._status} status`);
    }
  }
  
  /**
   * Reject the game after review
   */
  reject(): void {
    if (this._status === GameStatus.IN_REVIEW) {
      this._status = GameStatus.REJECTED;
      this._updatedAt = new Date();
    } else {
      throw new Error(`Cannot reject game in ${this._status} status`);
    }
  }
  
  /**
   * Publish the game
   */
  publish(): void {
    if (this._status === GameStatus.APPROVED) {
      this._status = GameStatus.PUBLISHED;
      this._publishedAt = new Date();
      this._updatedAt = new Date();
    } else {
      throw new Error(`Cannot publish game in ${this._status} status`);
    }
  }
  
  /**
   * Deprecate the game
   */
  deprecate(): void {
    if (this._status === GameStatus.PUBLISHED) {
      this._status = GameStatus.DEPRECATED;
      this._updatedAt = new Date();
    } else {
      throw new Error(`Cannot deprecate game in ${this._status} status`);
    }
  }
  
  /**
   * Convert to a plain object for serialization
   */
  toJSON() {
    return {
      id: this._id.toString(),
      title: this._title,
      description: this._description,
      developerId: this._developerId,
      categoryId: this._categoryId,
      playerCount: this._playerCount,
      rating: this._rating,
      status: this._status,
      currentVersion: this.currentVersion?.versionNumber,
      entryPoint: this._deploymentConfig.entryPoint,
      resourceLimits: this._deploymentConfig.resourceLimits,
      securitySandboxLevel: this._deploymentConfig.securitySandboxLevel,
      thumbnailUrl: this._thumbnailUrl,
      instructions: this._instructions,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
      publishedAt: this._publishedAt?.toISOString()
    };
  }
}