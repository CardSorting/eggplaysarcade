import { GameId } from '../value-objects/GameId';
import { VersionNumber } from '../value-objects/VersionNumber';

/**
 * Game status enumeration
 */
export enum GameStatus {
  DRAFT = 'draft',
  REVIEW = 'in_review',
  REJECTED = 'rejected',
  APPROVED = 'approved',
  PUBLISHED = 'published',
  SUSPENDED = 'suspended',
  ARCHIVED = 'archived'
}

/**
 * Game visibility settings
 */
export enum GameVisibility {
  PUBLIC = 'public',
  UNLISTED = 'unlisted',
  PRIVATE = 'private'
}

/**
 * Game release type
 */
export enum GameReleaseType {
  ALPHA = 'alpha',
  BETA = 'beta',
  RELEASE_CANDIDATE = 'rc',
  STABLE = 'stable',
  PATCH = 'patch'
}

/**
 * Pricing tier definitions
 */
export enum PricingTier {
  FREE = 'free',
  PAID = 'paid',
  FREEMIUM = 'freemium',
  SUBSCRIPTION = 'subscription'
}

/**
 * Monetization options
 */
export interface MonetizationSettings {
  hasInAppPurchases: boolean;
  hasPremiumVersion: boolean;
  hasSubscription: boolean;
  hasAdvertisements: boolean;
  priceAmount?: number;
  priceCurrency?: string;
  subscriptionPeriod?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  subscriptionAmount?: number;
}

/**
 * Game metadata for display and store listing
 */
export interface GameMetadata {
  title: string;
  description: string;
  shortDescription: string;
  features: string[];
  categories: string[];
  tags: string[];
  minimumSystemRequirements: SystemRequirements;
  recommendedSystemRequirements: SystemRequirements;
  contentRating: string;
  languageSupport: string[];
  privacyPolicyUrl: string;
  termsOfServiceUrl: string;
  supportEmail: string;
  supportUrl?: string;
  releaseNotes?: string;
}

/**
 * Game system requirements
 */
export interface SystemRequirements {
  cpu?: string;
  gpu?: string;
  ram?: string;
  storage?: string;
  os?: string;
  browser?: string;
  network?: string;
}

/**
 * Game media assets
 */
export interface GameAssets {
  iconUrl: string;
  headerImageUrl: string;
  screenshotUrls: string[];
  videoTrailerUrls: string[];
  logoUrl?: string;
  backgroundImageUrl?: string;
}

/**
 * Game entity class
 * In DDD, entities have a distinct identity and lifecycle
 */
export class Game {
  private _id: GameId;
  private _developerId: string;
  private _currentVersionNumber: VersionNumber;
  private _currentBundleId: string | null;
  private _status: GameStatus;
  private _visibility: GameVisibility;
  private _releaseType: GameReleaseType;
  private _metadata: GameMetadata;
  private _assets: GameAssets;
  private _pricingTier: PricingTier;
  private _monetizationSettings: MonetizationSettings;
  private _totalPlays: number;
  private _averageRating: number;
  private _ratingCount: number;
  private _createdAt: Date;
  private _updatedAt: Date;
  private _publishedAt: Date | null;
  private _sandboxId: string | null;
  private _sandboxUrl: string | null;
  private _featuredRank: number | null;
  private _verificationStatus: 'verified' | 'unverified';
  
  constructor(params: {
    id: string | GameId;
    developerId: string;
    currentVersionNumber: string | VersionNumber;
    currentBundleId: string | null;
    status: GameStatus;
    visibility: GameVisibility;
    releaseType: GameReleaseType;
    metadata: GameMetadata;
    assets: GameAssets;
    pricingTier: PricingTier;
    monetizationSettings: MonetizationSettings;
    totalPlays?: number;
    averageRating?: number;
    ratingCount?: number;
    createdAt?: Date;
    updatedAt?: Date;
    publishedAt?: Date | null;
    sandboxId?: string | null;
    sandboxUrl?: string | null;
    featuredRank?: number | null;
    verificationStatus?: 'verified' | 'unverified';
  }) {
    this._id = params.id instanceof GameId ? params.id : new GameId(params.id);
    this._developerId = params.developerId;
    this._currentVersionNumber = params.currentVersionNumber instanceof VersionNumber 
      ? params.currentVersionNumber 
      : VersionNumber.fromString(params.currentVersionNumber);
    this._currentBundleId = params.currentBundleId;
    this._status = params.status;
    this._visibility = params.visibility;
    this._releaseType = params.releaseType;
    this._metadata = params.metadata;
    this._assets = params.assets;
    this._pricingTier = params.pricingTier;
    this._monetizationSettings = params.monetizationSettings;
    this._totalPlays = params.totalPlays || 0;
    this._averageRating = params.averageRating || 0;
    this._ratingCount = params.ratingCount || 0;
    this._createdAt = params.createdAt || new Date();
    this._updatedAt = params.updatedAt || new Date();
    this._publishedAt = params.publishedAt || null;
    this._sandboxId = params.sandboxId || null;
    this._sandboxUrl = params.sandboxUrl || null;
    this._featuredRank = params.featuredRank || null;
    this._verificationStatus = params.verificationStatus || 'unverified';
  }
  
  // Getters
  get id(): GameId {
    return this._id;
  }
  
  get developerId(): string {
    return this._developerId;
  }
  
  get currentVersionNumber(): VersionNumber {
    return this._currentVersionNumber;
  }
  
  get currentBundleId(): string | null {
    return this._currentBundleId;
  }
  
  get status(): GameStatus {
    return this._status;
  }
  
  get visibility(): GameVisibility {
    return this._visibility;
  }
  
  get releaseType(): GameReleaseType {
    return this._releaseType;
  }
  
  get metadata(): GameMetadata {
    return { ...this._metadata };
  }
  
  get assets(): GameAssets {
    return { ...this._assets };
  }
  
  get pricingTier(): PricingTier {
    return this._pricingTier;
  }
  
  get monetizationSettings(): MonetizationSettings {
    return { ...this._monetizationSettings };
  }
  
  get totalPlays(): number {
    return this._totalPlays;
  }
  
  get averageRating(): number {
    return this._averageRating;
  }
  
  get ratingCount(): number {
    return this._ratingCount;
  }
  
  get createdAt(): Date {
    return new Date(this._createdAt);
  }
  
  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }
  
  get publishedAt(): Date | null {
    return this._publishedAt ? new Date(this._publishedAt) : null;
  }
  
  get sandboxId(): string | null {
    return this._sandboxId;
  }
  
  get sandboxUrl(): string | null {
    return this._sandboxUrl;
  }
  
  get featuredRank(): number | null {
    return this._featuredRank;
  }
  
  get verificationStatus(): 'verified' | 'unverified' {
    return this._verificationStatus;
  }
  
  // Domain methods
  /**
   * Update game metadata
   */
  updateMetadata(metadata: Partial<GameMetadata>): void {
    this._metadata = {
      ...this._metadata,
      ...metadata
    };
    this._updatedAt = new Date();
  }
  
  /**
   * Update game assets
   */
  updateAssets(assets: Partial<GameAssets>): void {
    this._assets = {
      ...this._assets,
      ...assets
    };
    this._updatedAt = new Date();
  }
  
  /**
   * Update monetization settings
   */
  updateMonetization(pricingTier: PricingTier, settings: Partial<MonetizationSettings>): void {
    this._pricingTier = pricingTier;
    this._monetizationSettings = {
      ...this._monetizationSettings,
      ...settings
    };
    this._updatedAt = new Date();
  }
  
  /**
   * Set current game bundle
   */
  setCurrentBundle(bundleId: string, versionNumber: VersionNumber): void {
    this._currentBundleId = bundleId;
    this._currentVersionNumber = versionNumber;
    this._updatedAt = new Date();
  }
  
  /**
   * Submit game for review
   */
  submitForReview(): void {
    if (this._status === GameStatus.DRAFT || this._status === GameStatus.REJECTED) {
      this._status = GameStatus.REVIEW;
      this._updatedAt = new Date();
    } else {
      throw new Error(`Cannot submit game for review from status: ${this._status}`);
    }
  }
  
  /**
   * Approve game
   */
  approve(): void {
    if (this._status === GameStatus.REVIEW) {
      this._status = GameStatus.APPROVED;
      this._updatedAt = new Date();
    } else {
      throw new Error(`Cannot approve game from status: ${this._status}`);
    }
  }
  
  /**
   * Reject game
   */
  reject(): void {
    if (this._status === GameStatus.REVIEW) {
      this._status = GameStatus.REJECTED;
      this._updatedAt = new Date();
    } else {
      throw new Error(`Cannot reject game from status: ${this._status}`);
    }
  }
  
  /**
   * Publish game
   */
  publish(): void {
    if (this._status === GameStatus.APPROVED) {
      this._status = GameStatus.PUBLISHED;
      this._publishedAt = new Date();
      this._updatedAt = new Date();
    } else {
      throw new Error(`Cannot publish game from status: ${this._status}`);
    }
  }
  
  /**
   * Suspend game
   */
  suspend(): void {
    if (this._status === GameStatus.PUBLISHED) {
      this._status = GameStatus.SUSPENDED;
      this._updatedAt = new Date();
    } else {
      throw new Error(`Cannot suspend game from status: ${this._status}`);
    }
  }
  
  /**
   * Archive game
   */
  archive(): void {
    if (this._status === GameStatus.PUBLISHED || this._status === GameStatus.SUSPENDED) {
      this._status = GameStatus.ARCHIVED;
      this._visibility = GameVisibility.PRIVATE;
      this._updatedAt = new Date();
    } else {
      throw new Error(`Cannot archive game from status: ${this._status}`);
    }
  }
  
  /**
   * Set game visibility
   */
  setVisibility(visibility: GameVisibility): void {
    this._visibility = visibility;
    this._updatedAt = new Date();
  }
  
  /**
   * Set sandbox details
   */
  setSandbox(sandboxId: string, sandboxUrl: string): void {
    this._sandboxId = sandboxId;
    this._sandboxUrl = sandboxUrl;
    this._updatedAt = new Date();
  }
  
  /**
   * Record a play
   */
  recordPlay(): void {
    this._totalPlays += 1;
  }
  
  /**
   * Add a rating
   */
  addRating(rating: number): void {
    // Calculate new average rating
    const totalRatingValue = this._averageRating * this._ratingCount;
    this._ratingCount += 1;
    this._averageRating = (totalRatingValue + rating) / this._ratingCount;
  }
  
  /**
   * Set featured rank
   */
  setFeaturedRank(rank: number | null): void {
    this._featuredRank = rank;
    this._updatedAt = new Date();
  }
  
  /**
   * Verify game
   */
  verify(): void {
    this._verificationStatus = 'verified';
    this._updatedAt = new Date();
  }
  
  /**
   * Create a new game
   */
  static create(params: {
    developerId: string;
    title: string;
    description: string;
    shortDescription: string;
    categories: string[];
    tags: string[];
    iconUrl: string;
    headerImageUrl: string;
    screenshotUrls: string[];
    pricingTier?: PricingTier;
  }): Game {
    const id = new GameId();
    const version = VersionNumber.createInitial(); // 1.0.0
    
    return new Game({
      id,
      developerId: params.developerId,
      currentVersionNumber: version,
      currentBundleId: null,
      status: GameStatus.DRAFT,
      visibility: GameVisibility.PRIVATE,
      releaseType: GameReleaseType.ALPHA,
      metadata: {
        title: params.title,
        description: params.description,
        shortDescription: params.shortDescription,
        features: [],
        categories: params.categories,
        tags: params.tags,
        minimumSystemRequirements: {},
        recommendedSystemRequirements: {},
        contentRating: 'Everyone',
        languageSupport: ['en'],
        privacyPolicyUrl: '',
        termsOfServiceUrl: '',
        supportEmail: ''
      },
      assets: {
        iconUrl: params.iconUrl,
        headerImageUrl: params.headerImageUrl,
        screenshotUrls: params.screenshotUrls,
        videoTrailerUrls: []
      },
      pricingTier: params.pricingTier || PricingTier.FREE,
      monetizationSettings: {
        hasInAppPurchases: false,
        hasPremiumVersion: false,
        hasSubscription: false,
        hasAdvertisements: false
      }
    });
  }
}