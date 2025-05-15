/**
 * Query to get analytics data for a game
 * Part of the application layer in Clean Architecture (CQRS pattern)
 */
export interface GetGameAnalyticsQuery {
  gameId: string;
  developerId: string;
  timeframe: TimeFrame;
  metrics?: MetricType[];
}

/**
 * Result type for the GetGameAnalyticsQuery
 */
export interface GameAnalyticsDTO {
  gameId: string;
  timeframe: TimeFrame;
  playerMetrics: {
    totalPlayers: number;
    newPlayers: number;
    activePlayers: number;
    playersTrend: number; // Percent change from previous period
    retentionRate: number;
    churnRate: number;
  };
  engagementMetrics: {
    totalSessions: number;
    averageSessionTime: number; // In seconds
    averageSessionsPerPlayer: number;
    sessionTimeTrend: number; // Percent change from previous period
    bounceRate: number;
    completionRate: number;
  };
  revenueMetrics: {
    totalRevenue: number;
    revenuePerPlayer: number;
    adRevenue?: number;
    inAppPurchaseRevenue?: number;
    premiumRevenue?: number;
    subscriptionRevenue?: number;
    revenueTrend: number; // Percent change from previous period
  };
  platformMetrics: {
    deviceBreakdown: { [deviceType: string]: number }; // Percentages
    browserBreakdown: { [browserName: string]: number }; // Percentages
    osBreakdown: { [osName: string]: number }; // Percentages
  };
  timeseriesData: {
    dates: string[];
    players: number[];
    sessions: number[];
    revenue: number[];
    averageSessionTime: number[];
  };
  geographicData: {
    countryDistribution: { [countryCode: string]: number }; // Percentages
  };
}

/**
 * Supported timeframes for analytics queries
 */
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
 * Available metric types for analytics queries
 */
export type MetricType = 
  'players' | 
  'sessions' | 
  'retention' | 
  'revenue' | 
  'platform' | 
  'geographic';