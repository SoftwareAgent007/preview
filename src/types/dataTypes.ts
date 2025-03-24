/**
 * API Documentation for Analytics Queries
 * In each request should be provided
 * startDate: string;
 * endDate: string;
 * This document outlines request and response types for various analytics endpoints.
 */


export interface TimeRange {
  startDate: Date;
  endDate: Date;
}
export interface TimeRange {
  startDate: Date;
  endDate: Date;
}

export interface MetricCount {
  count: number;
  label: string;
}

export interface KeywordMetric {
  keyword: string;
  matches: number;
}

export interface UserActivity {
  username: string;
  messages: number;
}

export interface DailyActivity {
  date: string; // ISO date string (YYYY-MM-DD)
  count: number;
}

export interface CurrentActivities {
  activeGamers: MetricCount;
  spotifyListeners: MetricCount;
}

export interface HourlyActivity {
  hour: number;
  count: number;
}

export interface PeakActivityTime {
  time: string; // Format: "HH:00"
  users: number;
  percentChange: number;
}

export interface GameTimeMetric {
  hours: number;
  hourChange: string; // Format: "+10h" or "-5h"
}

export interface ListenerMetric {
  count: number;
  percentChange: number;
}

export interface KeywordCountMetric {
  count: number;
  percentChange: number;
}

export interface MetricWithTrend extends MetricCount {
  trend: {
    isPositive: boolean;
    percentChange: number;
  };
}

export interface ExtendedUserMetric extends MetricWithTrend {
  sevenDayCount: number;
  thirtyDayCount: number;
}

export interface DashboardOverviewResponse {
  totalUsers: MetricWithTrend;
  activeUsers: ExtendedUserMetric;
  totalMessages: MetricWithTrend;
  totalReactions: MetricWithTrend;
  keywordsActivity: DailyActivity[];
  currentActivities: CurrentActivities;
  topKeywords: KeywordMetric[];
  topUsers: UserActivity[];
  usersDailyActivity: DailyActivity[];
  peakActivityTime: PeakActivityTime;
  totalGameTime: GameTimeMetric;
  activeListeners: ListenerMetric;
  keywordsCount: KeywordCountMetric;
  hourlyActivity: HourlyActivity[];
}

/**
 * 1.1 Response type for message metrics analytics
 */

export interface DailyMetric {
  date: Date;
  messageCount: number;
  uniqueAuthors: number;
  activeHours: number;
  peakHour: number;
  avgMessagesPerUser: number;
}

export interface HourlyMetric {
  hour: Date;
  messageCount: number;
  uniqueAuthors: number;
} 


/**
 * 2 Response type for keywords analytics
 */
export interface KeywordsStatsResponse {
  activeKeywordsCount: number;
  totalKeywordsCount: number;
  totalMatches: number;
  matchesTimeline: { date: string; count: number }[];
  activeKeywords: Keyword[];
}

/**
 * Request type for fetching paginated keywords list
 */
export interface KeywordsListRequest {
  startDate: string;
  endDate: string;
  page: number;
  pageSize: number;
}

export interface KeywordStatsDto {
  totalKeywords: number;
  activeKeywords: number;
  totalMatches: number;
  keywordsGrowth: number;
  activeGrowth: number;
  matchesGrowth: number;
}

export interface KeywordAnalyticsResponseDto {
  totalKeywords: number;
  activeKeywords: number;
  totalMatches: number;
  keywordsList: KeywordListItemDto[];
  matchesTimeline: TimelineDataDto[];
  activeKeywordTags: string[];
  pagination: PaginationDto;
}

export interface KeywordListItemDto {
  id: bigint;
  keyword: string;
  matches: { count: number };
  createdAt: Date;
  active: boolean;
  guildId: bigint;
}

export interface TimelineDataDto {
  date: string;
  count: number;
}

export interface PaginationDto {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  totalPages: number;
}

/**
 * Response type for paginated keywords list
 */
export interface PaginatedKeywordsListResponse {
  keywordsList: Keyword[];
  totalKeywords: number;
  page: number;
  pageSize: number;
}

/**
 * 3 User activity analytics response
 */
export interface UserActivityAnalyticsResponse {
  activeRolesDiagram: { role: string; count: number; percentage: number; color: string }[];
  userActivityTimeline: DataSet;
  peakActivityTime: string;
  onlineUsers: number;
  avgSessionTime: string;
  playingNow: number;
}

/**
 * Game activity types
 */
export interface ActiveGame {
  gameName: string;
  playerCount: number;
  lastPlayed: Date;
}

export interface PopularGame {
  gameName: string;
  totalHours: number;
  uniquePlayers: number;
  avgSessionMinutes: number;
  peakHours: PeakHour[];
}

export interface PeakHour {
  hour: number;
  playerCount: number;
}

export interface GameStats {
  totalPlayers: number;
  totalHours: number;
  avgSessionMinutes: number;
  peakPartySize: number;
  returnRate: number;
  peakHours: PeakHour[];
  weeklyTrends: WeeklyTrend[];
}

export interface GameReport {
  basicStats: GameStats;
  playtimeDistribution: PlaytimeDistribution[];
  topGamers: TopGamer[];
  weeklyTrends: WeeklyTrend[];
  timeOfDayBreakdown: TimeOfDayBreakdown[];
}

export interface PlaytimeDistribution {
  rangeLabel: string;
  userCount: number;
  percentage: number;
}

export interface TopGamer {
  userId: string;
  hoursPlayed: number;
  sessionCount: number;
}

export interface WeeklyTrend {
  weekStartDate: string; // ISO date string (YYYY-MM-DD)
  totalUsers: number;
  totalHours: number;
  avgSessionMinutes: number;
}

export interface TimeOfDayBreakdown {
  timeBlock: string; // e.g., "Morning (6AM-12PM)"
  userCount: number;
  percentOfTotal: number;
}

/**
 * Removed fields from GamingAnalyticsResponse:
 * - activeUsers -> replaced by GameStats.totalPlayers
 * - avgSessionTime -> replaced by GameStats.avgSessionMinutes (now in minutes instead of string)
 * - peakPlayers -> replaced by GameStats.peakPartySize
 * - totalGameTime -> replaced by GameStats.totalHours
 * - userActivityTimeline -> replaced by more detailed WeeklyTrend[]
 * - topGames -> replaced by more detailed PopularGame[]
 * - activeRolesPlayingNow -> removed in favor of more focused gaming stats
 */

/**
 * 3.2Presence activity analytics response
 */
export interface PresenceAnalyticsResponse {
  onlineUsers: number;
  idleUsers: number;
  dndUsers: number;
  offlineUsers: number;
  activeStatusLastDays: { date: string; online: number; idle: number; dnd: number; offline: number }[];
  peakActivityHours: { hour: number; count: number }[];
  hourlyActivity: { hour: number; count: number }[];
  userPresenceActivityTimeline: { date: string; count: number }[];
}

/**
 * 3.3Status activity analytics response
 */
export interface StatusPageAnalyticsResponse {
  totalUniqueStatuses: number;
  avgStatusDuration: string;
  peakActivityTime: string;
  updateFrequency: string;
  statusDurationTimeline: { date: string; count: number }[];
  topStatusMessages: { status: string; usedBy: number; trend: string }[];
}

/**
 * Status activity heatmap response
 */
export interface StatusActivityHeatmapResponse {
  heatmap: { weekDay: string; weekIndex: number; activity: number }[];
}

/**
 * Paginated list of statuses response
 */
export interface PaginatedStatusListResponse {
  statuses: { status: string; usageCount: number; trend: string }[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 4 Music analytics response
 */
export interface MusicAnalyticsResponse {
  totalPlays: number;
  activeListeners: number;
  uniqueArtists: number;
  listeningsWhilePlaying: number;
  genrePreferences: { genre: string; percentage: number }[];
  topPlayedArtists: { artist: string; plays: number }[];
  peakListeningHours: { hour: number; percentage: number }[];
  averageListeningSession: string;
}

// Generic keyword model
export interface Keyword {
  id: bigint;
  keyword: string;
  createdAt: Date;
  active: boolean;
  guildId: bigint;
}

// Generic user model
export interface User {
  id: bigint;
  username: string;
  geoLocation?: string;
  firstSeenAt: Date;
  lastActiveAt: Date;
}

// Message match model
export interface MessageMatch {
  id: bigint;
  messageId: bigint;
  channelId: bigint;
  guildId: bigint;
  authorId: bigint;
  keywordId: bigint;
  preContext?: string;
  postContext?: string;
  matchedAt: Date;
  keyword: Keyword;
  author: User;
}

// Chart data types
export type ChartData = {
  data: { date: string; count: number }[];
  color: string;
};

export type DataSet = {
  [key: string]: ChartData;
};
