import { User } from './User';
import { GameBundle } from './GameBundle';

/**
 * Represents the current state of a game submission in the review process
 */
export enum SubmissionStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PUBLISHED = 'published'
}

/**
 * Represents a note added by a reviewer during the review process
 */
export interface ReviewNote {
  id: string;
  content: string;
  severity: 'info' | 'warning' | 'critical';
  createdAt: Date;
  reviewerId: string;
  isResolved: boolean;
  resolvedAt?: Date;
}

/**
 * GameSubmission entity represents a game submitted by a developer
 * for review and publication in the platform
 */
export class GameSubmission {
  private _id: string;
  private _gameId: string;
  private _developerId: string;
  private _versionNumber: string;
  private _status: SubmissionStatus;
  private _reviewNotes: ReviewNote[];
  private _bundleId: string | null;
  private _rejectionReason: string | null;
  private _submittedAt: Date;
  private _reviewedAt: Date | null;
  private _publishedAt: Date | null;
  private _reviewerId: string | null;
  private _metadata: GameSubmissionMetadata;

  constructor(params: {
    id: string;
    gameId: string;
    developerId: string;
    versionNumber: string;
    status: SubmissionStatus;
    reviewNotes: ReviewNote[];
    bundleId: string | null;
    rejectionReason: string | null;
    submittedAt: Date;
    reviewedAt: Date | null;
    publishedAt: Date | null;
    reviewerId: string | null;
    metadata: GameSubmissionMetadata;
  }) {
    this._id = params.id;
    this._gameId = params.gameId;
    this._developerId = params.developerId;
    this._versionNumber = params.versionNumber;
    this._status = params.status;
    this._reviewNotes = params.reviewNotes;
    this._bundleId = params.bundleId;
    this._rejectionReason = params.rejectionReason;
    this._submittedAt = params.submittedAt;
    this._reviewedAt = params.reviewedAt;
    this._publishedAt = params.publishedAt;
    this._reviewerId = params.reviewerId;
    this._metadata = params.metadata;
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get gameId(): string {
    return this._gameId;
  }

  get developerId(): string {
    return this._developerId;
  }

  get versionNumber(): string {
    return this._versionNumber;
  }

  get status(): SubmissionStatus {
    return this._status;
  }

  get reviewNotes(): ReadonlyArray<ReviewNote> {
    return [...this._reviewNotes];
  }

  get bundleId(): string | null {
    return this._bundleId;
  }

  get rejectionReason(): string | null {
    return this._rejectionReason;
  }

  get submittedAt(): Date {
    return new Date(this._submittedAt);
  }

  get reviewedAt(): Date | null {
    return this._reviewedAt ? new Date(this._reviewedAt) : null;
  }

  get publishedAt(): Date | null {
    return this._publishedAt ? new Date(this._publishedAt) : null;
  }

  get reviewerId(): string | null {
    return this._reviewerId;
  }

  get metadata(): GameSubmissionMetadata {
    return { ...this._metadata };
  }

  // Domain methods
  /**
   * Submit this game for review
   */
  submitForReview(): void {
    if (this._status !== SubmissionStatus.DRAFT) {
      throw new Error('Only drafts can be submitted for review');
    }

    if (!this._bundleId) {
      throw new Error('Cannot submit without a game bundle');
    }

    this._status = SubmissionStatus.SUBMITTED;
    this._submittedAt = new Date();
  }

  /**
   * Start reviewing this submission
   */
  startReview(reviewerId: string): void {
    if (this._status !== SubmissionStatus.SUBMITTED) {
      throw new Error('Only submitted games can be reviewed');
    }

    this._status = SubmissionStatus.IN_REVIEW;
    this._reviewerId = reviewerId;
  }

  /**
   * Approve this submission
   */
  approve(reviewerId: string): void {
    if (this._status !== SubmissionStatus.IN_REVIEW) {
      throw new Error('Only in-review games can be approved');
    }

    this._status = SubmissionStatus.APPROVED;
    this._reviewedAt = new Date();
    this._reviewerId = reviewerId;
  }

  /**
   * Reject this submission
   */
  reject(reviewerId: string, reason: string): void {
    if (this._status !== SubmissionStatus.IN_REVIEW) {
      throw new Error('Only in-review games can be rejected');
    }

    if (!reason || reason.trim() === '') {
      throw new Error('Rejection reason is required');
    }

    this._status = SubmissionStatus.REJECTED;
    this._rejectionReason = reason;
    this._reviewedAt = new Date();
    this._reviewerId = reviewerId;
  }

  /**
   * Publish this approved submission
   */
  publish(): void {
    if (this._status !== SubmissionStatus.APPROVED) {
      throw new Error('Only approved games can be published');
    }

    this._status = SubmissionStatus.PUBLISHED;
    this._publishedAt = new Date();
  }

  /**
   * Update the bundle ID for this submission
   */
  updateBundle(bundleId: string): void {
    if (this._status !== SubmissionStatus.DRAFT) {
      throw new Error('Bundle can only be updated for drafts');
    }

    this._bundleId = bundleId;
  }

  /**
   * Add a review note to this submission
   */
  addReviewNote(note: Omit<ReviewNote, 'id' | 'createdAt' | 'isResolved'>, noteId: string): void {
    const newNote: ReviewNote = {
      id: noteId,
      content: note.content,
      severity: note.severity,
      reviewerId: note.reviewerId,
      createdAt: new Date(),
      isResolved: false
    };

    this._reviewNotes.push(newNote);
  }

  /**
   * Resolve a review note
   */
  resolveReviewNote(noteId: string): void {
    const note = this._reviewNotes.find(n => n.id === noteId);
    
    if (!note) {
      throw new Error(`Note with ID ${noteId} not found`);
    }

    if (note.isResolved) {
      throw new Error(`Note with ID ${noteId} is already resolved`);
    }

    note.isResolved = true;
    note.resolvedAt = new Date();
  }

  /**
   * Update submission metadata
   */
  updateMetadata(metadata: Partial<GameSubmissionMetadata>): void {
    if (this._status !== SubmissionStatus.DRAFT) {
      throw new Error('Metadata can only be updated for drafts');
    }

    this._metadata = {
      ...this._metadata,
      ...metadata
    };
  }
}

/**
 * Metadata for a game submission
 */
export interface GameSubmissionMetadata {
  title: string;
  description: string;
  shortDescription: string;
  features: string[];
  categories: string[];
  tags: string[];
  minimumSystemRequirements: {
    cpu: string;
    gpu: string;
    ram: string;
    os: string;
    storage: string;
  };
  recommendedSystemRequirements: {
    cpu: string;
    gpu: string;
    ram: string;
    os: string;
    storage: string;
  };
  pricingTier: string;
  monetizationSettings: {
    hasInAppPurchases: boolean;
    hasPremiumVersion: boolean;
    hasSubscription: boolean;
    hasAdvertisements: boolean;
  };
  legalInfo: {
    supportEmail: string;
    privacyPolicyUrl: string;
    termsOfServiceUrl: string;
  };
  technicalDetails: {
    hasExternalAPIs: boolean;
    hasServerSideCode: boolean;
    thirdPartyLibraries: string[];
  };
  assets: {
    iconImageUrl: string;
    headerImageUrl: string;
    screenshotUrls: string[];
    videoTrailerUrls: string[];
  };
  releaseNotes: string;
}