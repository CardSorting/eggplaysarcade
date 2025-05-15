/**
 * Enum for user roles in the application
 */
export enum UserRole {
  ADMIN = 'admin',
  GAME_DEVELOPER = 'game_developer',
  PLAYER = 'player'
}

/**
 * Enum for game submission status
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
 * User interface matching the backend User entity
 */
export interface User {
  id: number;
  username: string;
  role: UserRole;
  email?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
}

/**
 * Game interface matching the backend Game entity
 */
export interface Game {
  id: number;
  title: string;
  description: string;
  instructions: string;
  thumbnailUrl: string;
  gameUrl: string;
  categoryId: number;
  userId: number;
  tags?: string[] | null;
  publishedAt: Date;
  rating: number | null;
  players: number | null;
}

/**
 * Category interface matching the backend Category entity
 */
export interface Category {
  id: number;
  name: string;
  icon: string;
}

/**
 * Rating interface matching the backend Rating entity
 */
export interface Rating {
  id: number;
  userId: number;
  gameId: number;
  value: number;
}

/**
 * Game submission interface for the developer dashboard
 */
export interface GameSubmission {
  id: string;
  gameId: string;
  developerId: string;
  versionNumber: string;
  status: SubmissionStatus;
  bundleId: string | null;
  rejectionReason: string | null;
  submittedAt: Date;
  reviewedAt: Date | null;
  publishedAt: Date | null;
  reviewerId: string | null;
  reviewNotes: ReviewNote[];
  metadata: GameSubmissionMetadata;
}

/**
 * Review note interface for game submissions
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
 * Game submission metadata interface
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
  technicalDetails?: {
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

/**
 * Game analytics metrics interfaces
 */
export interface GameAnalytics {
  gameId: string;
  timeframe: TimeFrame;
  playerMetrics: PlayerMetrics;
  engagementMetrics: EngagementMetrics;
  revenueMetrics: RevenueMetrics;
  platformMetrics: PlatformMetrics;
  timeseriesData: TimeseriesData;
  geographicData: GeographicData;
}

export interface PlayerMetrics {
  totalPlayers: number;
  newPlayers: number;
  activePlayers: number;
  playersTrend: number;
  retentionRate: number;
  churnRate: number;
}

export interface EngagementMetrics {
  totalSessions: number;
  averageSessionTime: number;
  averageSessionsPerPlayer: number;
  sessionTimeTrend: number;
  bounceRate: number;
  completionRate: number;
}

export interface RevenueMetrics {
  totalRevenue: number;
  revenuePerPlayer: number;
  adRevenue?: number;
  inAppPurchaseRevenue?: number;
  premiumRevenue?: number;
  subscriptionRevenue?: number;
  revenueTrend: number;
}

export interface PlatformMetrics {
  deviceBreakdown: Record<string, number>;
  browserBreakdown: Record<string, number>;
  osBreakdown: Record<string, number>;
}

export interface TimeseriesData {
  dates: string[];
  players: number[];
  sessions: number[];
  revenue: number[];
  averageSessionTime: number[];
}

export interface GeographicData {
  countryDistribution: Record<string, number>;
}

export type TimeFrame = 
  'today' | 
  'yesterday' | 
  'last7days' | 
  'last30days' | 
  'thisMonth' | 
  'lastMonth' | 
  'thisQuarter' | 
  'lastQuarter' | 
  'thisYear' | 
  'lastYear' | 
  'custom';

/**
 * Permissions available in the system
 */
export type Permission = 
  'manage_users' | 
  'manage_games' | 
  'manage_categories' | 
  'moderate_content' | 
  'view_analytics' | 
  'configure_system' | 
  'manage_own_games' | 
  'view_own_analytics' | 
  'edit_own_profile' | 
  'submit_games' | 
  'play_games' | 
  'rate_games' | 
  'manage_playlists';

/**
 * Mapping of permissions to roles
 */
export const RolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    'manage_users',
    'manage_games',
    'manage_categories',
    'moderate_content',
    'view_analytics',
    'configure_system',
    'play_games',
    'rate_games',
    'manage_playlists',
    'submit_games',
    'manage_own_games',
    'view_own_analytics',
    'edit_own_profile'
  ],
  [UserRole.GAME_DEVELOPER]: [
    'manage_own_games',
    'view_own_analytics',
    'edit_own_profile',
    'submit_games',
    'play_games',
    'rate_games',
    'manage_playlists'
  ],
  [UserRole.PLAYER]: [
    'play_games',
    'rate_games',
    'edit_own_profile',
    'manage_playlists'
  ]
};